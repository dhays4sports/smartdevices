# Dogfood verification — 2026-10-03

Starting PR3 SHA df8be5789307435889094b49a3caebf797b6ae16; continuation layered without deleting prior work.

- `npm run typecheck`: PASS, 0 errors.
- `npm run lint`: PASS, 0 errors/warnings.
- `npm run build`: PASS production Worker/client bundle.
- `node --test tests/*.test.mjs`: 166 pass, 0 fail/skip.
- `node --import tsx --test tests/*.test.ts`: 187 pass, 0 fail/skip (includes 5 new business tests, 11 persistence tests and actual local D1 test).
- Initial `npm test` built successfully but failed one JS test because its assertion required the previous migration to remain last. Repaired to pin the old migration at index12 and the additive migration last; rerun all JS/TS tests passed, 353 total.
- `python3 scripts/verify-migrations.py`: 3 paths, 14 migrations, 29 tables, 0 FK violations; snapshot columns/indexes match. Existing 13 migrations unchanged.
- `SD42_REVIEW_DATE=2026-10-03 npm run validate:evidence`: structure passes; 2 pre-existing stale sources remain explicit (Farmers leak detection and Moen Flo, Aug26); 0 orphan rules/public leaks.
- `node scripts/scan-hosting-secrets.mjs`: 466 files, 0 pattern findings; not external penetration testing.
- `SD_PLAYWRIGHT_MODULE=/tmp/sd-browser-tools/node_modules/playwright/index.mjs SD_CHROMIUM_PATH=/tmp/chromium node scripts/verify-sites-browser.mjs`: PASS 21 existing route/viewport checks and 18 interactions at375/768/1440; additional business journey at all three widths covers opt-in exclusion, local plan save/reload/reopen, export, manufacturer click intent and GPC exclusion; 0 page errors. Manufacturer navigation prevented. Metric transport intercepted to assert event-only payload; not proof of hosted counter persistence.
- Consent hydration regression discovered by interaction test and repaired: checkbox disabled until tab preference loaded. No pre-opt-in collection in passing run.
- `git diff --check`: PASS.

Hosted authenticated A/B acceptance remains blocked by unavailable supported hosted-browser automation and authorized synthetic identities. Local D1 tests are not represented as hosted success. Hosted HTTP and native DB verification for this release are recorded in the PR after deployment.

Rollback: redeploy previously saved PR3 version 2 at df8be5789307435889094b49a3caebf797b6ae16; leave additive counter table in place (no destructive down migration). Older app ignores the new table. Disable optional measurements by old application policy. Application rollback must not erase Builder data. Full hosted DB backup/restore remains an adoption gate.
