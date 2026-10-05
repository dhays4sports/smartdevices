import assert from 'node:assert/strict';
import test from 'node:test';
import { generateKeyPairSync } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { digest, sealBatch, validateBatch, signApproval, reconcile, applyApproved, publishApproved } from '../scripts/lib/evidence-publication.mjs';

const keys = generateKeyPairSync('ed25519');
const trusted = { 'synthetic-operator': keys.publicKey };
const now = new Date('2026-10-05T12:00:00Z');
function fixture() {
  const p = { id: 'P1', collection: 'observations', recordId: 'test-record', kind: 'fact', before: null,
    after: { id: 'test-record', status: 'active', value: 'Synthetic only', observedOn: '2026-10-05' },
    reason: 'Synthetic fixture, never a manufacturer fact', impacts: ['/synthetic-fixture'], dependencies: [], reads: [],
    evidence: [{ id: 'synthetic-source', url: 'https://example.com/synthetic', classification: 'primary', observedOn: '2026-10-05', reviewDue: '2026-10-06', status: 'observed', finding: 'Synthetic test value' }] };
  const batch = sealBatch({ id: 'synthetic-batch', createdAt: '2026-10-05T10:00:00Z', baseSha: 'a'.repeat(40), policyDigest: 'b'.repeat(64), evidenceSnapshot: 'c'.repeat(64), catalogSnapshot: 'd'.repeat(64), proposals: [p] });
  const current = { headSha: batch.baseSha, policyDigest: batch.policyDigest, runtimeSnapshot: 'git-seed', records: { observations: [], sources: [] }, applied: [] };
  const approve = (b = batch, ids = ['P1']) => signApproval({ id: 'synthetic-approval', purpose: 'smartdevices-evidence-publication', operator: 'synthetic-operator', approvedAt: '2026-10-05T11:00:00Z', batchId: b.id, batchDigest: b.digest, baseSha: b.baseSha, proposalIds: ids }, keys.privateKey);
  return { batch, current, approve };
}
test('digest is independent of object key order', () => assert.equal(digest({ a: 1, b: 2 }), digest({ b: 2, a: 1 })));
test('happy path applies the precise selected value', () => {
  const { batch, current, approve } = fixture();
  const out = applyApproved(batch, approve(), current, trusted, now);
  assert.equal(out.state.records.observations[0].value, 'Synthetic only');
  assert.equal(current.records.observations.length, 0);
});
test('modified batch invalidates approval', () => {
  const { batch, current, approve } = fixture(); const a = approve(); batch.proposals[0].after.value = 'Tampered';
  assert.throws(() => applyApproved(batch, a, current, trusted, now), /DIGEST/);
});
test('resealing a changed batch still needs a new approval', () => {
  const { batch, current, approve } = fixture(); const a = approve(); batch.proposals[0].after.value = 'Tampered';
  assert.throws(() => applyApproved(sealBatch(batch), a, current, trusted, now), /BATCH_MISMATCH/);
});
test('approval for batch A cannot authorize batch B', () => {
  const { batch, current, approve } = fixture();
  assert.throws(() => applyApproved(sealBatch({ ...batch, id: 'B' }), approve(), current, trusted, now), /BATCH_MISMATCH/);
});
test('claimed operator and attacker signing key confer no authority', () => {
  const { batch, current, approve } = fixture(); const a = approve();
  const attacker = generateKeyPairSync('ed25519'); delete a.signature;
  assert.throws(() => applyApproved(batch, signApproval(a, attacker.privateKey), current, trusted, now), /UNAUTHORIZED/);
  assert.throws(() => applyApproved(batch, approve(), current, {}, now), /UNAUTHORIZED/);
});
test('changed selection breaks the signature', () => {
  const { batch, current, approve } = fixture(); const a = approve(); a.proposalIds = ['P2'];
  assert.throws(() => applyApproved(batch, a, current, trusted, now), /UNAUTHORIZED/);
});
test('expired evidence blocks even a valid approval', () => {
  const { batch, current, approve } = fixture();
  assert.equal(reconcile(batch, approve(), current, trusted, new Date('2026-10-07')).proposals[0].status, 'NO_LONGER_VALID');
  assert.throws(() => applyApproved(batch, approve(), current, trusted, new Date('2026-10-07')), /BLOCKED/);
});
test('approval cannot manufacture a later checked date', () => {
  const { batch } = fixture(); batch.proposals[0].after.checkedDate = '2026-10-06';
  assert.throws(() => validateBatch(sealBatch(batch)), /CANNOT_REFRESH/);
});
test('unchanged target and unchanged policy safely reconcile an unrelated newer commit', () => {
  const { batch, current, approve } = fixture(); current.headSha = 'e'.repeat(40);
  const out = reconcile(batch, approve(), current, trusted, now);
  assert.equal(out.repositoryChanged, true); assert.equal(out.status, 'READY');
});
test('changed application policy requires reapproval', () => {
  const { batch, current, approve } = fixture(); current.policyDigest = 'e'.repeat(64);
  assert.equal(reconcile(batch, approve(), current, trusted, now).proposals[0].status, 'NEEDS_REAPPROVAL');
});
test('changed source state requires reapproval', () => {
  const { batch, current, approve } = fixture();
  batch.proposals[0].reads = [{ collection: 'sources', recordId: 'source', digest: digest(null) }];
  const b = sealBatch(batch); current.records.sources.push({ id: 'source', status: 'stale' });
  assert.equal(reconcile(b, approve(b), current, trusted, now).proposals[0].status, 'NEEDS_REAPPROVAL');
});
test('concurrent change is not overwritten', () => {
  const { batch, current, approve } = fixture(); current.records.observations.push({ id: 'test-record', value: 'Other work' });
  assert.equal(reconcile(batch, approve(), current, trusted, now).proposals[0].status, 'CONFLICT');
  assert.throws(() => applyApproved(batch, approve(), current, trusted, now), /BLOCKED/);
});
test('newer observed fact supersedes old approval', () => {
  const { batch, current, approve } = fixture(); current.records.observations.push({ id: 'test-record', observedOn: '2026-10-06', value: 'Newer' });
  assert.equal(reconcile(batch, approve(), current, trusted, now).proposals[0].status, 'SUPERSEDED');
});
test('partial approval leaves adjacent proposals unchanged', () => {
  const { batch, current, approve } = fixture();
  batch.proposals.push({ ...structuredClone(batch.proposals[0]), id: 'P2', recordId: 'other', after: { id: 'other', value: 'not approved' } });
  const b = sealBatch(batch), out = applyApproved(b, approve(b), current, trusted, now);
  assert.equal(out.state.records.observations.length, 1);
  assert.equal(out.reconciliation.proposals[1].status, 'NOT_APPROVED');
});
test('dependencies must be individually approved', () => {
  const { batch, current, approve } = fixture();
  batch.proposals.push({ ...structuredClone(batch.proposals[0]), id: 'P2', recordId: 'other', after: { id: 'other' } });
  batch.proposals[0].dependencies = ['P2']; const b = sealBatch(batch);
  assert.throws(() => applyApproved(b, approve(b), current, trusted, now), /DEPENDENCY_MISSING/);
});
test('conflict acknowledgement never chooses a winner', () => {
  const { batch, current, approve } = fixture(); batch.proposals[0].kind = 'conflict';
  batch.proposals[0].after = { id: 'test-record', status: 'conflict', value: null, alternatives: ['one week', 'two weeks'] };
  batch.proposals[0].evidence[0].status = 'conflict'; const b = sealBatch(batch);
  assert.equal(applyApproved(b, approve(b), current, trusted, now).state.records.observations[0].value, null);
  batch.proposals[0].after.value = 'one week'; assert.throws(() => validateBatch(sealBatch(batch)), /UNRESOLVED/);
});
test('expired suppression remains suppressed without replacement evidence', () => {
  const { batch, current, approve } = fixture(); batch.proposals[0].kind = 'suppression'; batch.proposals[0].evidence = [];
  batch.proposals[0].after = { id: 'test-record', status: 'stale', checkedDate: '2026-08-26', reviewDueDate: '2026-09-25' };
  const b = sealBatch(batch); const out = applyApproved(b, approve(b), current, trusted, now).state.records.observations[0];
  assert.equal(out.status, 'stale'); assert.equal(out.reviewDueDate, '2026-09-25');
});
test('duplicate application is idempotent, different replay is refused', () => {
  const { batch, current, approve } = fixture(); const a = approve();
  const first = applyApproved(batch, a, current, trusted, now);
  assert.equal(applyApproved(batch, a, first.state, trusted, now).changed, false);
  const other = approve(); other.id = 'different'; delete other.signature;
  assert.throws(() => applyApproved(batch, signApproval(other, keys.privateKey), first.state, trusted, now), /REPLAY/);
});
test('arbitrary file paths and destructive target removals are refused', () => {
  const { batch } = fixture(); batch.proposals[0].collection = '../../secrets';
  assert.throws(() => validateBatch(sealBatch(batch)), /TARGET/);
  batch.proposals[0].collection = 'catalog'; batch.proposals[0].after = null;
  assert.throws(() => validateBatch(sealBatch(batch)), /AFTER_ID/);
});

function pipeline() {
  const f = fixture(), events = [], rollback = { sha: 'a'.repeat(40), versionId: 'synthetic-old', snapshot: 'seed' };
  const adapters = {
    readCurrent: async () => structuredClone(f.current),
    validate: async () => { events.push('validate'); return { passed: true, checks: [{ name: 'synthetic validation', passed: true }] }; },
    commit: async () => { events.push('commit'); return { sha: 'e'.repeat(40) }; },
    readDeployment: async () => rollback,
    deployPrivate: async ({ sha }) => { events.push('deploy'); return { sha, private: true, id: 'synthetic-new' }; },
    verifyHosted: async () => { events.push('verify'); return { passed: true, synthetic: true }; },
    restorePrivate: async () => { events.push('rollback'); return { verified: true, synthetic: true }; },
    recordFailure: async () => { events.push('failure'); },
    recordReceipt: async r => { events.push('receipt'); assert.equal(r.rollback.versionId, 'synthetic-old'); },
  };
  return { ...f, adapters, events, run: () => publishApproved({ batch: f.batch, approval: f.approve(), trustedOperators: trusted, adapters, now }) };
}
test('synthetic orchestration proves validate, exact commit, private publish, verify and receipt ordering', async () => {
  const f = pipeline(), receipt = await f.run(); assert.deepEqual(f.events, ['validate','commit','deploy','verify','receipt']);
  assert.equal(receipt.commitSha, receipt.deployment.sha); assert.ok(receipt.digest); assert.equal(receipt.rollback.databaseImpact, 'none');
});
test('failed validation never commits or publishes', async () => {
  const f = pipeline(); f.adapters.validate = async () => ({ passed: false });
  await assert.rejects(f.run, /VALIDATION_FAILED/); assert.deepEqual(f.events, []);
});
test('failed Git update never publishes', async () => {
  const f = pipeline(); f.adapters.commit = async () => { throw new Error('Git unavailable'); };
  await assert.rejects(f.run, /Git unavailable/); assert.deepEqual(f.events, ['validate']);
});
test('a race during validation fails before commit', async () => {
  const f = pipeline(); let reads = 0;
  f.adapters.readCurrent = async () => ({ ...f.current, headSha: ++reads === 1 ? f.current.headSha : 'f'.repeat(40) });
  await assert.rejects(f.run, /STATE_ADVANCED/); assert.deepEqual(f.events, ['validate']);
});
test('failed hosted verification restores known-good and records failure', async () => {
  const f = pipeline(); f.adapters.verifyHosted = async () => ({ passed: false });
  await assert.rejects(f.run, /HOSTED_VERIFICATION/);
  assert.deepEqual(f.events, ['validate','commit','deploy','rollback','failure']);
});
test('wrong SHA or public deployment is not a successful publication', async () => {
  const f = pipeline(); f.adapters.deployPrivate = async () => ({ sha: 'f'.repeat(40), private: false, id: 'bad' });
  await assert.rejects(f.run, /DEPLOYMENT_FAILED/); assert.ok(f.events.includes('rollback')); assert.ok(!f.events.includes('receipt'));
});
test('runtime research cannot publish or extend deadlines', async () => {
  const source = await readFile(new URL('../app/lib/evidence-store.ts', import.meta.url), 'utf8');
  const refresh = source.slice(source.indexOf('export async function runEvidenceRefresh'), source.indexOf('export async function decideEvidenceCheck'));
  assert.doesNotMatch(refresh, /publishEvidenceSnapshot\(|applySafeRefresh\(/);
  assert.match(source, /EXACT_APPROVED_BATCH_REQUIRED/);
});
test('an active or unverified D1 snapshot blocks Git-only publication', async () => {
  const f = pipeline(); f.current.runtimeSnapshot = 'unverified';
  await assert.rejects(f.run, /RUNTIME_SNAPSHOT/); assert.deepEqual(f.events, []);
});
