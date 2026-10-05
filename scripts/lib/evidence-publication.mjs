import { createHash, sign, verify } from 'node:crypto';

// Offline editorial control plane. Never imported by a public mutation route.
export const collections = Object.freeze({
  catalog: ['content/catalog.json', null],
  sources: ['content/evidence-sources.json', 'sources'],
  programs: ['content/carrier-programs.json', 'programs'],
  rules: ['content/carrier-rules.json', 'rules'],
  fits: ['content/device-carrier-fit.json', 'fits'],
  observations: ['content/editorial-observations.json', 'observations'],
});
export function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
}
export const digest = value => createHash('sha256').update(canonical(value)).digest('hex');
const equal = (a, b) => canonical(a) === canonical(b);
const assert = (ok, code) => { if (!ok) throw new Error(code); };
const sha = v => typeof v === 'string' && /^[a-f0-9]{40}$/.test(v);
const hash = v => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v);
const date = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const identifier = v => typeof v === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,119}$/.test(v);
const safeUrl = v => { try { const u = new URL(v); return u.protocol === 'https:' && !u.username && !u.password; } catch { return false; } };
export function sealBatch(input) {
  const batch = { ...input, schemaVersion: 1 };
  delete batch.digest;
  return { ...batch, digest: digest(batch) };
}
export function validateBatch(batch) {
  const { digest: expected, ...payload } = batch;
  assert(hash(expected) && digest(payload) === expected, 'BATCH_DIGEST_MISMATCH');
  assert(batch.schemaVersion === 1 && identifier(batch.id) && sha(batch.baseSha), 'BATCH_INVALID');
  assert(hash(batch.policyDigest) && hash(batch.evidenceSnapshot) && hash(batch.catalogSnapshot), 'SNAPSHOT_REQUIRED');
  assert(!Number.isNaN(Date.parse(batch.createdAt)), 'BATCH_TIME_INVALID');
  assert(Array.isArray(batch.proposals) && batch.proposals.length > 0, 'PROPOSALS_REQUIRED');
  const ids = new Set();
  const targets = new Set();
  for (const p of batch.proposals) {
    assert(identifier(p.id) && !ids.has(p.id), 'PROPOSAL_ID_INVALID'); ids.add(p.id);
    assert(Object.hasOwn(collections, p.collection) && identifier(p.recordId), 'TARGET_NOT_ALLOWED');
    const target = `${p.collection}:${p.recordId}`;
    assert(!targets.has(target), 'DUPLICATE_TARGET'); targets.add(target);
    assert(p.before === null || p.before?.id === p.recordId, 'BEFORE_ID_MISMATCH');
    assert(p.after?.id === p.recordId, 'AFTER_ID_MISMATCH'); // no destructive deletion
    assert(['fact', 'conflict', 'suppression'].includes(p.kind), 'KIND_INVALID');
    assert(typeof p.reason === 'string' && p.reason && Array.isArray(p.impacts) && p.impacts.length, 'REVIEW_REQUIRED');
    assert(Array.isArray(p.dependencies) && Array.isArray(p.reads) && Array.isArray(p.evidence), 'DEPENDENCIES_REQUIRED');
    for (const r of p.reads) assert(Object.hasOwn(collections, r.collection) && identifier(r.recordId) && hash(r.digest), 'READ_INVALID');
    for (const e of p.evidence) {
      assert(identifier(e.id) && safeUrl(e.url) && ['primary', 'regulator', 'secondary'].includes(e.classification), 'EVIDENCE_INVALID');
      assert(date(e.observedOn) && date(e.reviewDue) && e.observedOn <= e.reviewDue, 'EVIDENCE_DATE_INVALID');
      assert(['observed', 'conflict', 'unavailable'].includes(e.status) && typeof e.finding === 'string', 'EVIDENCE_STATUS_INVALID');
    }
    if (p.kind === 'fact') {
      assert(p.evidence.length > 0, 'FACT_EVIDENCE_REQUIRED');
      const earliestDue = p.evidence.map(e => e.reviewDue).sort()[0];
      const latestObservation = p.evidence.map(e => e.observedOn).sort().at(-1);
      assert(!p.after.checkedDate || p.after.checkedDate <= latestObservation, 'APPROVAL_CANNOT_REFRESH_EVIDENCE');
      assert(!p.after.reviewDueDate || p.after.reviewDueDate <= earliestDue, 'DEADLINE_EXCEEDS_EVIDENCE');
      assert(p.after.status !== 'conflict', 'CONFLICT_KIND_REQUIRED');
    }
    if (p.kind === 'conflict') assert(p.after.status === 'conflict' && p.after.value === null && p.after.alternatives?.length >= 2, 'CONFLICT_MUST_REMAIN_UNRESOLVED');
    if (p.kind === 'suppression') assert(['stale', 'suppressed', 'unresolved'].includes(p.after.status), 'SUPPRESSION_CANNOT_PROMOTE');
  }
  for (const p of batch.proposals) assert(p.dependencies.every(id => id !== p.id && ids.has(id)), 'DEPENDENCY_UNKNOWN');
  return batch;
}

// Signing is an operator-side operation. Trust is supplied separately by the
// executor, never by a batch or approval's claimed public key.
export function signApproval(payload, privateKey) {
  return { ...payload, signature: sign(null, Buffer.from(canonical(payload)), privateKey).toString('base64') };
}
export function verifyApproval(batch, approval, trustedOperators, now = new Date()) {
  validateBatch(batch);
  const { signature, ...payload } = approval;
  const trusted = trustedOperators[approval.operator];
  assert(trusted && verify(null, Buffer.from(canonical(payload)), trusted, Buffer.from(signature ?? '', 'base64')), 'APPROVAL_UNAUTHORIZED');
  assert(approval.batchId === batch.id && approval.batchDigest === batch.digest && approval.baseSha === batch.baseSha, 'APPROVAL_BATCH_MISMATCH');
  assert(approval.purpose === 'smartdevices-evidence-publication' && identifier(approval.id), 'APPROVAL_INVALID');
  const stamp = Date.parse(approval.approvedAt);
  assert(Number.isFinite(stamp) && stamp >= Date.parse(batch.createdAt) && stamp <= now.getTime(), 'APPROVAL_TIME_INVALID');
  assert(Array.isArray(approval.proposalIds) && approval.proposalIds.length > 0 && new Set(approval.proposalIds).size === approval.proposalIds.length, 'APPROVAL_SELECTION_INVALID');
  const ids = new Set(batch.proposals.map(p => p.id));
  assert(approval.proposalIds.every(id => ids.has(id)), 'APPROVAL_UNKNOWN_PROPOSAL');
  for (const p of batch.proposals.filter(p => approval.proposalIds.includes(p.id))) {
    assert(p.dependencies.every(id => approval.proposalIds.includes(id)), 'APPROVAL_DEPENDENCY_MISSING');
  }
}

export function reconcile(batch, approval, current, trustedOperators, now = new Date()) {
  verifyApproval(batch, approval, trustedOperators, now);
  assert(sha(current.headSha) && hash(current.policyDigest), 'CURRENT_STATE_INVALID');
  const today = now.toISOString().slice(0, 10);
  const previous = (current.applied ?? []).find(a => a.batchId === batch.id);
  if (previous) {
    assert(previous.batchDigest === batch.digest && previous.approvalDigest === digest(approval), 'BATCH_REPLAY_MISMATCH');
    return { status: 'ALREADY_APPLIED', repositoryChanged: current.headSha !== batch.baseSha, proposals: [] };
  }
  const proposals = batch.proposals.map(p => {
    const value = current.records[p.collection]?.find(r => r.id === p.recordId) ?? null;
    let status;
    if (!approval.proposalIds.includes(p.id)) status = 'NOT_APPROVED';
    else if (current.policyDigest !== batch.policyDigest) status = 'NEEDS_REAPPROVAL';
    else if (p.reads.some(r => digest(current.records[r.collection]?.find(v => v.id === r.recordId) ?? null) !== r.digest)) status = 'NEEDS_REAPPROVAL';
    else if (p.kind === 'fact' && (!p.evidence.length || p.evidence.some(e => e.status !== 'observed' || e.observedOn > today || e.reviewDue < today))) status = 'NO_LONGER_VALID';
    else if (p.kind === 'fact' && p.after.reviewDueDate && p.after.reviewDueDate < today) status = 'NO_LONGER_VALID';
    else if (equal(value, p.after)) status = 'ALREADY_APPLIED';
    else if (equal(value, p.before)) status = 'SAFE_TO_APPLY';
    else if ((value?.checkedDate ?? value?.observedOn ?? value?.lastReviewed ?? '') > (p.after.checkedDate ?? p.after.observedOn ?? p.after.lastReviewed ?? '')) status = 'SUPERSEDED';
    else status = 'CONFLICT';
    return { id: p.id, status };
  });
  const blocked = proposals.some(p => !['NOT_APPROVED', 'SAFE_TO_APPLY', 'ALREADY_APPLIED'].includes(p.status));
  return { status: blocked ? 'BLOCKED' : 'READY', repositoryChanged: current.headSha !== batch.baseSha, proposals };
}

export function applyApproved(batch, approval, current, trustedOperators, now = new Date()) {
  const reconciliation = reconcile(batch, approval, current, trustedOperators, now);
  assert(reconciliation.status !== 'BLOCKED', 'RECONCILIATION_BLOCKED');
  if (reconciliation.status === 'ALREADY_APPLIED') return { state: structuredClone(current), reconciliation, changed: false };
  const state = structuredClone(current);
  for (const result of reconciliation.proposals.filter(p => p.status === 'SAFE_TO_APPLY')) {
    const p = batch.proposals.find(p => p.id === result.id);
    const records = state.records[p.collection];
    assert(Array.isArray(records), 'COLLECTION_MISSING');
    const index = records.findIndex(r => r.id === p.recordId);
    if (index < 0) records.push(structuredClone(p.after)); else records[index] = structuredClone(p.after);
  }
  state.applied = [...(state.applied ?? []), { batchId: batch.id, batchDigest: batch.digest, approvalDigest: digest(approval), proposalIds: [...approval.proposalIds], appliedAt: now.toISOString() }];
  return { state, reconciliation, changed: true };
}

// Caller supplies authenticated platform adapters. No executable commands,
// destinations or credentials are accepted from untrusted proposal content.
export async function publishApproved({ batch, approval, trustedOperators, adapters, now = new Date() }) {
  const current = await adapters.readCurrent();
  assert(current.runtimeSnapshot === 'git-seed', 'RUNTIME_SNAPSHOT_RECONCILIATION_REQUIRED');
  const applied = applyApproved(batch, approval, current, trustedOperators, now);
  if (!applied.changed) return { status: 'ALREADY_APPLIED', batchId: batch.id };
  const validation = await adapters.validate(applied.state);
  assert(validation.passed === true && validation.checks?.length > 0 && validation.checks.every(c => c.passed === true), 'VALIDATION_FAILED');
  const rechecked = await adapters.readCurrent();
  assert(digest(rechecked) === digest(current), 'STATE_ADVANCED_DURING_VALIDATION');
  const committed = await adapters.commit(applied.state, { expectedHead: current.headSha, batchId: batch.id, approval });
  assert(sha(committed.sha), 'GIT_COMMIT_FAILED');
  const rollback = await adapters.readDeployment();
  assert(sha(rollback.sha) && rollback.versionId && rollback.snapshot, 'ROLLBACK_TARGET_REQUIRED');
  let deployment;
  let verified;
  try {
    deployment = await adapters.deployPrivate({ sha: committed.sha, expectedPreviousVersion: rollback.versionId });
    assert(deployment.sha === committed.sha && deployment.private === true && deployment.id, 'DEPLOYMENT_FAILED');
    verified = await adapters.verifyHosted({ batch, proposalIds: approval.proposalIds, sha: committed.sha, deployment });
    assert(verified.passed === true, 'HOSTED_VERIFICATION_FAILED');
  } catch (error) {
    const recovery = await adapters.restorePrivate(rollback);
    await adapters.recordFailure({ batchId: batch.id, commitSha: committed.sha, error: error.message, rollback, recovery });
    throw error;
  }
  const receipt = {
    schemaVersion: 1, batchId: batch.id, batchDigest: batch.digest, approvalId: approval.id,
    approvedAt: approval.approvedAt, operator: approval.operator, approvedProposalIds: approval.proposalIds,
    applied: applied.reconciliation.proposals.filter(p => p.status === 'SAFE_TO_APPLY').map(p => p.id),
    notApplied: applied.reconciliation.proposals.filter(p => p.status !== 'SAFE_TO_APPLY'),
    unresolved: batch.proposals.filter(p => p.kind === 'conflict' && approval.proposalIds.includes(p.id)).map(p => p.id),
    suppressed: batch.proposals.filter(p => p.kind === 'suppression' && approval.proposalIds.includes(p.id)).map(p => p.id),
    commitSha: committed.sha, deployment, validation, verification: verified,
    publishedAt: new Date().toISOString(), rollback: { ...rollback, databaseImpact: 'none' }, status: 'PUBLISHED',
  };
  receipt.digest = digest(receipt);
  await adapters.recordReceipt(receipt); // adapter must persist append-only in Git
  return receipt;
}
