# SMARTDEVICES-ECOSYSTEM-RECONCILIATION-1.1 — Verification

Date: 2026-10-03 UTC. Continuation parent: `2c0c8692d6a5f3e44934fe0f425503bfe0540729`.

## Recovery evidence

- Saved v5.3 archive SHA256 `547bcea6028cab7b9276a36e8e2d4be28d6ce33517caf9ce5884cae07c57a0dd` verified.
- Archive vs PR #2: **369 tracked files; 0 differences; 0 missing**.
- Recovered local source commit `71f59e3b591d4db00648eed962a4d42b667b7f81`; uncommitted state preserved as local checkpoint `fd4355f` before continuation.
- All **13 historical SQL files** match their corresponding published/recovered source bytes. No renumbering, remote migration or destructive rollback.
- Published baseline: typecheck TS2367; lint 5 errors/1 warning; build helper lacked execute permission. Prior local checkpoint had already corrected several of these; fixes preserved.

## Final commands and results

| Command | Result |
|---|---|
| `npm ci --offline --cache .sites-runtime/npm-cache` | PASS, 520 packages installed after cache preparation; lifecycle scripts ran. |
| `npm run typecheck` | PASS, 0 errors. |
| `npm run lint` | PASS, 0 errors / 0 warnings from ESLint. npm's inherited http-proxy notice is environmental. |
| `npm test` | PASS; includes production build, **166 JS + 170 TS tests = 336 passed, 0 failed, 0 skipped**. |
| `node --import tsx tests/ecosystem-recovery.test.ts` | PASS, **16** focused semantic/request/compatibility tests; also included in the 170 above. |
| `python3 scripts/verify-migrations.py` | PASS, **3 paths**, each **13 migrations / 28 tables**, existing rows preserved, 0 FK violations, integrity + snapshot columns/indexes match. |
| `npm run db:generate` | PASS: no schema changes, nothing to migrate. |
| `SD42_REVIEW_DATE=2026-10-03 npm run validate:evidence` | Structural PASS: 8 sources / 5 rules / 4 fits; 0 draft/conflict/restricted/orphan/public-leak findings; **2 stale review dates**. |
| `git diff --check` | PASS. |
| `SD_QA_ORIGIN=http://127.0.0.1:43131 SD_PLAYWRIGHT_MODULE=/tmp/sd-browser-tools/node_modules/playwright/index.mjs SD_CHROMIUM_PATH=/tmp/chromium node scripts/verify-ecosystem-browser.mjs` | PASS, **24 route/viewport checks + 3 interactions**, 0 page errors. |

Browser routes: catalog, Moen detail, Connect, Operate, Create and /farmers at 375, 768, 1024 and 1440 px. Interactions: mobile navigation, capability filtering, deterministic builder intake→workspace. Local production server only. Authenticated hosted registration is not claimed by this browser pass; built API tests assert unauthenticated denial/private cache behavior. Registration request/constructor tests cover malformed fields, origin, body limits and trust invariants.

The full tests ran outside the filesystem/network sandbox because that sandbox denied localhost listen and esbuild child execution, and suppressed child test output. No failed sandbox run is counted as a successful full suite. A deliberate failing test-runner canary was used locally to confirm failures propagate, then excluded from repository work.

## Semantic acceptance

Registration establishes registration only. Identity/namespace and Mesh metadata do not establish permission. Probe connectivity does not grant control. Even forged operation references return blocked. Non-Mesh catalog/instance records remain valid. Old catalog records are not mutated, and schema-v3 projects normalize to schema-v4 while retaining firmware/artifacts. Builder capability requirements and safety restrictions remain intact. Carrier/insurance, /farmers, privacy, suppression and market fail-closed regressions are included in the full suite.

## Evidence freshness and remaining boundaries

Overdue sources: `farmers-leak-detection-ca-2026-08-26`, `moen-flo-product-2026-08-26`. The validator now defaults to the execution date; deterministic historical tests explicitly pin their historical date. No new carrier/product truth or verification is asserted.

No production deployment, live hardware action, live manufacturer integration, money movement, namespace activation or remote DB migration. Hosted D1 tenant isolation/auth-header provenance require a separately authorized hosted gate. The previously failed Cloudflare preview is not certified by local tests. Publication commits use the documented `[CF-Pages-Skip]` prefix to omit automatic Pages deployments while updating the draft PR.
