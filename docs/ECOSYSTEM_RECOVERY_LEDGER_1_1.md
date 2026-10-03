# Recovery ledger — reconciliation 1.1

Fresh audit: 2026-10-03 UTC. No merge or deployment authorized.

## Evidence and continuation decision

GitHub main remains 7556775e3d2dbdfb7d83732b308abaaec0a151e5. All three branches and both draft PRs inspected; Actions reports zero runs. PR #1 governance head ad3043351ec49d2ab8b04458775be7dd1091bb76 is ancestry of PR #2. Continue existing PR #2 branch smartdevices-ecosystem-reconciliation-1.0 at 2c0c8692d6a5f3e44934fe0f425503bfe0540729.

Saved v5.3 archive SHA256 547bcea6028cab7b9276a36e8e2d4be28d6ce33517caf9ce5884cae07c57a0dd verified. A separate accessible workspace held recovered SD-MKT-0.9 + SD-BB-0 source at 71f59e3b591d4db00648eed962a4d42b667b7f81 and uncommitted ecosystem implementation. Preserved without modification to that workspace; copy checkpointed locally as fd4355f. It diverged from PR #2, whose existing registration and v4 builder must not be replaced by the local metadata-only Connect variant.

Use PR #2 as parent and reconcile recovered market delta against the shared SD-BB-0 archive, then retain compatible local bug fixes. No force-push, history rewrite, removal of completed Connect, or v4.2 reset.

## Pre-change classification

| Requested item | Located evidence | Classification before edits | Disposition |
|---|---|---|---|
| Canonical recovery | PR #2 plus 71f59e3 archive reconciliation | PARTIAL | PR omitted market checkpoint; local omitted PR implementation. Combine. |
| North Star / four surfaces / NO REBUILD | PR #1 ancestry; PR #2 docs; local Operate route | COMPLETE + NEEDS REVERIFY | Preserve governance, add missing Operate surface. |
| Catalog/detail/compare/evidence | PR #2 and local market catalog | COMPLETE + NEEDS REVERIFY | Preserve catalog provenance and source changes. |
| Capability vocabulary and public detail API | PR #2 device-capabilities + content JSON | COMPLETE + NEEDS REVERIFY | Preserve broader real-use-case mappings; add collection API compatibly. |
| Device model/trust | Both implementations | PARTIAL | Preserve public object; add independent facts and fail-closed operation boundary from local work. |
| Non-Mesh participation | Both, local inference correction | PARTIAL | Retain optional Mesh and fix implicit native selection. |
| Connect UI/API/store | PR #2 | PARTIAL | Retain authenticated registration; harden validation/errors/origin boundaries. |
| Local metadata-only Connect | fd4355f | SUPERSEDED | Do not overwrite working PR UI/API/store. |
| Builder v4/capability matching/legacy migration | PR #2 | PARTIAL | Full typecheck fails TS2367 in builder-store; repair without reverting v4. |
| Device identity / Mesh adapter | Both docs/contracts | COMPLETE + NEEDS REVERIFY | No live claim/namespace/execution runtime; preserve separation. |
| /farmers | Both implementations | COMPLETE + NEEDS REVERIFY | Run carrier and built-route regressions. |
| Market pilot work | 71f59e3 and recovered SD-MKT-0.9 | COMPLETE + NEEDS REVERIFY | Restore gated code/content/migrations/tests. |
| Migration histories | PR #2 registry 0007; local market 0007–0011 | PARTIAL | Preserve filenames and SQL; explicit rehearsal/order; no remote DB action. |
| Runtime/mobile fixes | fd4355f styles + route tests + QA script | COMPLETE + NEEDS REVERIFY | Port compatible fixes; rerun with real build. |
| Test/install evidence | PR #2 previously dependency blocked | PARTIAL | Recovered dependencies allow current full gates; record actual outcomes. |
| Production integrations, hardware proof, settlement | Documented roadmap | BLOCKED / DEFERRED | Outside reconciliation activation scope. |
| PR/checkpoint reporting | Existing draft PR #2 | PARTIAL | Update existing PR with exact head and fresh verification. |

Baseline local checkpoint: typecheck passes; focused gates pass. Published PR #2 baseline: full typecheck fails TS2367; focused gates pass. Full baseline build/lint/runtime checks recorded in final verification report. Prior test claims are historical, not current certification.

## Reconciled checkpoint validation

The saved v5.3 archive matches all 369 tracked files at starting PR #2 SHA: zero changed or missing files. The independent local market delta was merged against its shared SD-BB-0 ancestor; overlapping changes in schema, README, release manifest and North Star were reconciled explicitly. All other PR #2 implementation remains present.

Published baseline failures reproduced: TS2367 in v3/v4 normalization; lint 5 errors/1 warning (project page JSX inside try/catch and unused function); build script Permission denied. These are source defects, not credential blockers. The recovered local runtime fixes and execute bits correct them. Initial offline install lacked a cached dependency; after authorized package download, sandbox esbuild subprocess EPERM required the ordinary install outside that sandbox. Clean locked install then passed. TypeScript test runner tsx is now an explicit pinned development dependency.

Independent trust facts, registration input/request guards, current-date evidence checking, public collection API, capability selector and inactive Operate surface are completed additions. Metadata-only Connect and the narrower local alternate vocabulary remain superseded, not silently substituted for published functionality. Historical SQL is unchanged; current schema/journal is coherent.

## Final classification

Recovered catalog/capability/builder/farmers/market work, registration foundation, trust separation, migration reconciliation, source/runtime fixes and original governance: **COMPLETE + VERIFIED locally**, as detailed by the verification report. Browser-verified surfaces remain independent of live device integrations. Connect live-hosted persistence, authentication upstream guarantees, physical proof, live identity/operation/settlement: **BLOCKED / DEFERRED external activation**, not mislabeled implemented. No required repository-local item remains NOT STARTED. PR publication is the final checkpoint; current remote SHA is reported in the PR and completion report.
