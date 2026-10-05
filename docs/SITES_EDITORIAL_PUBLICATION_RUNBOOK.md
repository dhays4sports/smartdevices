# Private Sites editorial publication runbook

This supersedes the automatic-renewal activation steps in the v4.3 guide. No schedule is authorized.

## Before approval

Fetch current PR4/successor head, not old main. Inspect the private pilot's exact SHA/version and active D1 snapshot. This pilot currently has no D1 evidence snapshot; Git seed content is authoritative. If an active D1 snapshot appears, stop and reconcile it rather than assuming a Git content edit will supersede it. Preserve all fifteen catalog records and carrier scope.

Run research, inspect primary-source failures/conflicts and generate a batch with `node scripts/evidence-batch.mjs prepare editorial/specs/<spec>.json`. The JSON contains the full exact diff and digest. Present the concise review accompanying it. The operator chooses all publishable proposals, named IDs, rejection, or revision; the operator does not edit files.

## After exact approval

An authenticated approval service must issue the signed selection, with a protected operator key and durable authorization reference. `SMARTDEVICES_EDITORIAL_TRUST_FILE` points to a protected external JSON map of authorized operator IDs to PEM public keys. Never accept keys from the batch. Do not use the synthetic test signer for real approvals. Provisioning this service is outstanding; a typed name in unsigned JSON is not sufficient.

Run `node scripts/evidence-batch.mjs reconcile BATCH APPROVAL`, then `apply BATCH APPROVAL`. Recheck the authoritative GitHub branch immediately before pushing. Use a dedicated evidence branch/PR; do not merge main. Run migration and secret checks as well as the CLI gates. Validate the staged observation schema and all affected routes. A failed gate blocks publication.

The current module's `publishApproved` adapter boundary requires:

- `readCurrent`: exact head, policy digest, current records and applied ledger from authoritative Git, not stale local memory.
- `validate`: full required tests, schema/evidence/security and route checks on the selected result.
- `commit`: authenticated GitHub update with expected-head concurrency protection; return exact pushed SHA.
- `readDeployment`: inspect the fixed private Site and record prior exact version/SHA/publication snapshot.
- `deployPrivate`: native Sites source workflow/build and private saved-version deployment of the exact commit. Never accept a project ID, destination or command from batch content.
- `verifyHosted`: verify exact `/api/version`, selected old/new display assertions, unresolved/null values, suppression, unrelated records, `/devices`, comparison, `/farmers` and affected Builder output.
- `restorePrivate`: native deployment of the recorded prior version, followed by version/content verification.
- `recordReceipt` / `recordFailure`: append artifacts to the authoritative Git branch. An unrecorded result is not a completed publication.

These adapters are an integration contract, not a claim that a live autonomous publisher is connected. Never substitute synthetic adapters for hosted proof. A repeated apply is a no-op; a failed post-commit deployment must be recovered from the recorded exact commit and deployment history rather than falsely reporting it as already published.

## Rollback

Current known-good Git SHA: `e718f3ed42836198f50d7322b99b94748a4ca959`.

Current native version: `appgprj_6ac1324d62f08191a6fbecaa261e619f~appgver_08dfa08292d881918bc21d30fe9adca8`.

Current deployment: `appgdep_6ac145873e348191a3ad6312fbc82c5b`.

Current snapshot: Git seed at that SHA; no active D1 snapshot. Database impact: none. Rollback is code/content only and must preserve all research, approvals and decisions in Git. Old evidence does not become fresh when rolled back. Recheck the version before every new publication: this recorded target may be superseded by another session.

If Git/tests/evidence fail, do not deploy. If deployment or hosted verification fails, preserve/restore and verify the prior version, record failure and halt. Never claim a rollback succeeded just because a deployment request was accepted.

## This run's status

No real batch approval, factual content application, private deployment or live rollback rehearsal has occurred. The original pilot remains active. Tests cover the orchestrator with synthetic adapters; dependency installation is blocked by network access and incomplete caches. Use the draft PR as a reviewable continuation, not a production release.
