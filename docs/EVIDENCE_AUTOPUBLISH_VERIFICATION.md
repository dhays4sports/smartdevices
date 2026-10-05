# Verification — October 5, 2026

Baseline audited before substantive edits: PR4 e718f3e. `node --test tests/*.test.mjs`: 157 passed, one suite failed because the runtime-page harness requires unavailable dependencies/build. This is an environment failure, not evidence that the baseline application is broken.

After implementation:

| Command | Result |
|---|---|
| `npm run install:ci` | Failed: locked Vinext download timed out at proxy CONNECT |
| `bash scripts/sites-env.sh -- npm ci --offline --ignore-scripts --no-audit` | Failed: image caches lack locked packages; first zod 4.4.3, then vite-tsconfig-paths 6.1.1 after checking both available caches |
| `npm run typecheck` | Blocked: tsc not installed |
| `npm run lint` | Blocked: eslint not installed |
| `npm test` | Blocked at required production build: vinext unavailable; TypeScript tests not run |
| `node --test tests/*.test.mjs` | 185 passed, one runtime-page harness failure (missing build dependencies), zero skipped |
| `node --test tests/evidence-publication.test.mjs` | 28 passed, zero failed/skipped |
| `node --test tests/evidence-publication.test.mjs tests/evidence-autopilot-contract.test.mjs` | Initial 32/32 before adding the D1-snapshot gate; final gate included in full JS run |
| `node scripts/validate-carrier-evidence.mjs` | Pass: eight sources, five rules, four fits; two source records expired, zero orphan rules/public leaks |
| `python scripts/verify-migrations.py` | Three paths pass: fourteen migrations, twenty-nine tables, zero FK violations; no historical SQL modified |
| `node scripts/validate-editorial.mjs` | Pass for current empty published observations and immutable prepared batches |
| `node scripts/scan-hosting-secrets.mjs` | No findings in source; built client scan unavailable because no build exists |
| `git diff --check` | Pass |

The new tests cover signature forgery, wrong/modified/resealed batches, changed selections, stale evidence, manufactured freshness dates, partial approval, dependencies, unchanged/concurrent source and repository state, supersession, unresolved conflicts, suppression, replay/idempotency, arbitrary paths, Git/validation/deployment failure, concurrent advancement during validation, exact-SHA/private-target checks, synthetic rollback/receipt ordering, and D1 snapshot mismatch.

No synthetic test is represented as real browser, real operator approval, Sites publication or live rollback proof. No production credential was provisioned. The private pilot remains at its known-good version. All real proposals remain outside runtime content in `editorial/batches`; public data and carrier claims were not applied.
