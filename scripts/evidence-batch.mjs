import { readFile, writeFile, mkdir, realpath } from 'node:fs/promises';
import { resolve, relative, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { collections, digest, sealBatch, validateBatch, reconcile, applyApproved } from './lib/evidence-publication.mjs';

const root = process.cwd();
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const read = async path => JSON.parse(await readFile(path, 'utf8'));
export async function currentState() {
  const files = git('ls-files').split('\n').filter(p => /^(app|scripts|db|drizzle|tests)\//.test(p) || /^(package.*json|vite.config.*|tsconfig.*|middleware.*|\.openai\/hosting.json)$/.test(p));
  const policy = [];
  for (const p of files.sort()) policy.push([p, digest(await readFile(p, 'utf8'))]);
  const records = {};
  for (const [key, [path, member]] of Object.entries(collections)) {
    const file = await read(path); records[key] = member ? file[member] : file;
  }
  return { headSha: git('rev-parse', 'HEAD'), policyDigest: digest(policy), records, applied: (await read('content/editorial-publication.json')).applied };
}
export function reviewMarkdown(batch) {
  return `# ${batch.id}\n\nDigest: \`${batch.digest}\`\n\nBase: \`${batch.baseSha}\`\n\nPending operator approval. Approval never renews evidence by itself.\n\n` + batch.proposals.map(p =>
    `## ${p.id} — ${p.recordId}\n\nKind: ${p.kind}. Dependencies: ${p.dependencies.join(', ') || 'none'}.\n\n**Current**\n\n\`\`\`json\n${JSON.stringify(p.before, null, 2)}\n\`\`\`\n\n**Proposed**\n\n\`\`\`json\n${JSON.stringify(p.after, null, 2)}\n\`\`\`\n\n**Reason:** ${p.reason}\n\n**Impact:** ${p.impacts.join(', ')}\n\n**Publication:** ${p.publicationBehavior}\n\n**Evidence:**\n\n${p.evidence.map(e => `- ${e.url} — ${e.status}; observed ${e.observedOn}; due ${e.reviewDue}. ${e.finding}`).join('\n')}\n`
  ).join('\n');
}

async function main() {
  const [command, path, approvalPath] = process.argv.slice(2);
  if (command === 'prepare') {
    const spec = await read(path), current = await currentState();
    const batch = sealBatch({ ...spec, baseSha: current.headSha, policyDigest: current.policyDigest,
      evidenceSnapshot: digest({ sources: current.records.sources, rules: current.records.rules, fits: current.records.fits, programs: current.records.programs, observations: current.records.observations }),
      catalogSnapshot: digest(current.records.catalog), createdAt: new Date().toISOString(),
      proposals: spec.proposals.map(p => ({ ...p, before: current.records[p.collection].find(r => r.id === p.recordId) ?? null,
        reads: (p.reads ?? []).map(r => ({ ...r, digest: digest(current.records[r.collection].find(v => v.id === r.recordId) ?? null) })) })) });
    validateBatch(batch);
    await mkdir('editorial/batches', { recursive: true });
    await writeFile(`editorial/batches/${batch.id}.json`, JSON.stringify(batch, null, 2) + '\n', { flag: 'wx' });
    await writeFile(`editorial/batches/${batch.id}.md`, reviewMarkdown(batch), { flag: 'wx' });
    console.log(JSON.stringify({ batchId: batch.id, digest: batch.digest, baseSha: batch.baseSha })); return;
  }
  if (command === 'validate') { validateBatch(await read(path)); console.log('Batch digest and contract valid'); return; }
  if (!['reconcile', 'apply'].includes(command)) throw new Error('Usage: evidence-batch.mjs prepare SPEC | validate BATCH | reconcile BATCH APPROVAL | apply BATCH APPROVAL');
  const keyPath = process.env.SMARTDEVICES_EDITORIAL_TRUST_FILE;
  if (!keyPath) throw new Error('TRUSTED_OPERATOR_CONFIG_REQUIRED');
  const keyReal = await realpath(keyPath);
  if (!relative(root, keyReal).startsWith('..')) throw new Error('TRUST_CONFIG_MUST_BE_OUTSIDE_REPOSITORY');
  const trusted = await read(keyReal), batch = await read(path), approval = await read(approvalPath), current = await currentState();
  const result = reconcile(batch, approval, current, trusted);
  console.log(JSON.stringify(result, null, 2));
  if (command === 'reconcile' || result.status === 'ALREADY_APPLIED') return;
  const applied = applyApproved(batch, approval, current, trusted);
  if (git('status', '--porcelain')) throw new Error('CLEAN_COMMITTED_CHECKOUT_REQUIRED');
  if (['main', 'master'].includes(git('branch', '--show-current'))) throw new Error('MAIN_WRITE_FORBIDDEN');
  // A dedicated worktree makes failed validation recoverable without changing
  // the operator's current checkout or overwriting another Work session.
  const stage = resolve(root, '..', `evidence-stage-${batch.id}`);
  git('worktree', 'add', '--detach', stage, current.headSha);
  for (const [key, [file, member]] of Object.entries(collections)) {
    if (digest(current.records[key]) === digest(applied.state.records[key])) continue;
    const original = await read(join(stage, file));
    await writeFile(join(stage, file), JSON.stringify(member ? { ...original, [member]: applied.state.records[key] } : applied.state.records[key], null, 2) + '\n');
  }
  await writeFile(join(stage, 'content/editorial-publication.json'), JSON.stringify({ schemaVersion: 1, applied: applied.state.applied }, null, 2) + '\n');
  await mkdir(join(stage, 'editorial/decisions'), { recursive: true });
  await writeFile(join(stage, `editorial/decisions/${approval.id}.json`), JSON.stringify({ approval, reconciliation: applied.reconciliation }, null, 2) + '\n', { flag: 'wx' });
  const checks = [];
  for (const args of [['run','install:ci'],['run','typecheck'],['run','lint'],['test'],['run','validate:evidence']]) {
    execFileSync('npm', args, { cwd: stage, stdio: 'inherit', timeout: 600000 });
    checks.push({ command: `npm ${args.join(' ')}`, passed: true });
  }
  for (const [tool, args] of [['node', ['scripts/validate-editorial.mjs']], ['python', ['scripts/verify-migrations.py']], ['node', ['scripts/scan-hosting-secrets.mjs']]]) {
    execFileSync(tool, args, { cwd: stage, stdio: 'inherit', timeout: 120000 });
    checks.push({ command: `${tool} ${args.join(' ')}`, passed: true });
  }
  if (git('rev-parse', 'HEAD') !== current.headSha || git('status','--porcelain')) throw new Error('SOURCE_ADVANCED');
  await writeFile(join(stage, `editorial/decisions/${approval.id}-validation.json`), JSON.stringify({ batchId: batch.id, checks }, null, 2) + '\n', { flag: 'wx' });
  execFileSync('git', ['add', 'content', 'editorial'], { cwd: stage });
  execFileSync('git', ['commit', '-m', `[CF-Pages-Skip] Apply approved evidence batch ${batch.id}`], { cwd: stage, stdio: 'inherit' });
  console.log(JSON.stringify({ status: 'VALIDATED_LOCAL_COMMIT', stage, sha: execFileSync('git', ['rev-parse','HEAD'], { cwd: stage, encoding:'utf8' }).trim(), next: 'GitHub compare-and-swap push, private Sites publication, hosted verification and receipt are still required.' }));
}
if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) main().catch(e => { console.error(e.message); process.exitCode = 1; });
