# Approval-gated editorial publication — 1.0

## Canonical audit (October 5, 2026)

Repository: `dhays4sports/smartdevices`. Current application: draft PR4, branch `smartdevices-business-builder-2.0-dogfood-1.0`, SHA `e718f3ed42836198f50d7322b99b94748a4ca959`. PR1 is governance, PR2 recovered the device foundation, PR3 added isolated persistence, PR4 added the business experiment. No later open PR superseded PR4 at audit. Main remains `7556775e3d2dbdfb7d83732b308abaaec0a151e5` and is not the application baseline.

Private pilot: `appgprj_6ac1324d62f08191a6fbecaa261e619f`, https://smartdevices-persistence-test.noisy-skunk-4108.chatgpt.site. Native version4 reports exact SHA e718f3e. Rollback version: `appgprj_6ac1324d62f08191a6fbecaa261e619f~appgver_08dfa08292d881918bc21d30fe9adca8`; deployment `appgdep_6ac145873e348191a3ad6312fbc82c5b`. Preserve the separate PR2 bounded preview unchanged.

Evidence schema1: eight existing source records, five rules, four fits. Catalog is the existing unversioned JSON array: fifteen records. Research inventory adds coverage; it does not silently renew any of these records. Runtime published bundle schema1 includes catalog/sources/rules/fits; programs continue to come from the canonical carrier-programs file. Native D1 `evidence_publication_snapshots` is empty, so the deployed publication is the Git seed. There are fourteen committed migrations and twenty-nine tables. No migration or database write is needed for this change. Three SQLite migration upgrade paths pass.

## Infrastructure disposition

| Existing component | Decision | Result |
|---|---|---|
| Evidence sources, rules, fits and carrier programs | KEEP | Same record IDs, scope, dates and validators |
| Date-based expiration and suppression | KEEP | Approval cannot extend unsupported truth |
| Source normalization and fingerprint checks | ELEVATE | Existing checker reused; redirects refused before following; streamed byte cap |
| Research checks/runs and audit tables | KEEP | Append-only observations; no publication from refresh |
| Runtime confirm/renew buttons | DEPRECATE | Disabled; non-reject decisions require an exact batch |
| D1 publication snapshots, decision history, rollback | KEEP | Historical system retained; pilot uses Git-content publication |
| Pilot hosting guard | KEEP | Evidence APIs/admin remain blocked |
| Full catalog source inventory | GENERALIZE | Catalog URLs plus explicit partner/safety research registry |
| Immutable batch and signed selection | MISSING → added | Digest, exact base, source read-set and operator signature |
| Current-source reconciliation and staging | CONNECT | Three-way comparison, isolated validation worktree |
| GitHub/Sites execution adapters | PARTIAL | Contract and synthetic fault tests; native live integration remains unproven |

## Authority and workflow

1. `npm run evidence:research` checks every catalog source and the explicit research registry using the existing checker. It writes a new research artifact, never a published fact. Baseline/changed HTML fingerprints require semantic inspection; an unchanged page hash alone is not a claim verification. No scheduler is activated.
2. Research produces a specification with exact after-records, reasons, source observations, impacts, dependencies and publication behavior. `npm run evidence:batch -- prepare SPEC` reads current before-records and seals an immutable batch. Existing batch IDs cannot be overwritten. A review document is generated with exact old/proposed records.
3. An operator approves named proposals in one exact batch. Production approval requires an authenticated operator signing service. Ed25519 trust is supplied to the executor from a protected external file, never from the batch. This run does **not** enroll a production signer or fabricate Dylan's approval. Test keys are generated only in memory and represent synthetic fixtures.
4. `reconcile BATCH APPROVAL` validates the signature, digest, selection, dependencies, evidence dates and source read-set. A changed application-policy digest requires reapproval. A different repository head with the same semantics is safe; newer target values are never overwritten. A conflicting selected proposal blocks the whole selected application, allowing a new smaller selection rather than a silent partial application.
5. `apply BATCH APPROVAL` requires a clean non-main checkout and stages the result in a separate detached worktree. It changes allowlisted record collections only, keeps source dates explicit, records decisions, runs fixed install/typecheck/lint/test/evidence gates and creates a local commit only after passing. Failed worktrees remain available for diagnosis and cannot publish.
6. The authenticated execution adapter must compare-and-swap the GitHub branch against the observed head, save/deploy the exact pushed SHA to the fixed owner-private Site, verify affected routes and negative assertions, and append the receipt to Git. `publishApproved` implements stage ordering and error gates behind explicit adapters. Its tests use synthetic adapters; they are not evidence of a live deployment.

## Security and invariants

No public evidence-edit endpoint was added. Ordinary user identity, researcher identity and editorial authority remain separate. No client secret, schedule, payment, physical-control adapter, manufacturer credential or production domain change was introduced. The protected trust file must be outside the repository; a claimed operator name or caller-supplied key cannot authorize a batch. Signature binds the operator, timestamp, batch ID/digest/base and exact proposal IDs. Replay is rejected or becomes an idempotent no-op for the identical approval. Revisions require new immutable artifacts.

Expired/unavailable/conflicted evidence cannot support a new factual proposal. A suppression can be approved without a replacement source and retains its original dates. Conflict observations have null truth values and retain alternatives. The new display component suppresses expired active observations at read time. Existing dated catalog statements are not silently rewritten.

## Scope limits

The HTML checker detects source changes, failures and expiration; it does not reliably extract every manufacturer fact or resolve contradictions. The agent's primary-source research supplies field-level proposals. Full semantic extraction, robust challenge-page recognition and comprehensive recall surveillance remain future work. CoverageFit's runtime facts are still not independently revalidated by SmartDevices.

A production signing/approval service and authenticated live publisher adapters are not installed. The current CLI can prepare, authenticate, reconcile and stage a batch; the platform publication contract is tested with fixtures. Dependency download restrictions currently prevent a full build and hosted proof. No statement in this document should be read as completion of the real approval-to-publication loop.
