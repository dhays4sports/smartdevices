# Sites hosting verification — 2026-10-03

## Evidence classification
**NOT READY for next-stage primary-host adoption certification.** The private test runtime is deployed and useful for completing validation, but the required hosted authenticated A/B persistence journey is not yet proved. This is an evidence/access limitation, not evidence of a fundamental Sites incompatibility. No production-domain cutover.

## Recovered starting state
GitHub PR #2 stays draft/unmerged at `fcb95454c8876123c4cb6219dd6585030129e200`; continuation `smartdevices-sites-hosting-1.0` is stacked on it. Existing safe Site and its no-database configuration are preserved. Source audit and exact original Site/version are in SITES_HOSTING_ARCHITECTURE.md.

## First deployed GitHub checkpoint
`5360b28d1654de14744c190a225f473243ae1eff` was pushed to both GitHub and the Sites deployment mirror without changing the source tree. Build-generated `/api/version` returned exactly this SHA in a real hosted HTTP probe.

- Site: `appgprj_6ac1324d62f08191a6fbecaa261e619f`
- URL: https://smartdevices-persistence-test.noisy-skunk-4108.chatgpt.site
- Deployment: `appgdep_6ac13871f4ec8191bedddc9b2db66465`, native status succeeded
- Environment revision: 1; only `RATE_LIMIT_HASH_SALT`, secret
- Binding: `DB`; no R2; no connectors; owner-private
- D1 native overview: 28 expected application tables after the existing 13 migrations
- Native row reads: builder_projects = 0, builder_revisions = 0 (no real/customer/test identity data was inserted into hosted storage)

## Executed checks
| Command or operation | Result |
|---|---|
| Sites `install-dependencies.mjs` (locked npm ci) | 520 packages installed |
| `npm run typecheck` | Pass, 0 errors |
| `npm run lint` | Pass, 0 errors/warnings |
| `npm test` | Build + 166 JS + 182 TS = **348 passed, 0 failed, 0 skipped** |
| `node --import tsx tests/sites-persistence.test.ts` | 11 passed; SQLite persistence, A/B isolation, HTTP authorization, conflicts, rollback, fresh-DB restore |
| `node --import tsx tests/sites-d1.test.ts` | 1 passed; actual local Miniflare D1, batch/restart/owner checks/recovery |
| `python3 scripts/verify-migrations.py` | 3 paths, 13 migrations each, 28 tables, 0 FK violations; historical SQL unchanged |
| `SD42_REVIEW_DATE=2026-10-03 npm run validate:evidence` | Structure passes; same 2 overdue source reviews remain |
| `node scripts/scan-hosting-secrets.mjs` | 442 source/client files at first publish, 0 pattern findings; not exhaustive secret/penetration certification |
| `SD_PLAYWRIGHT_MODULE=/tmp/sd-browser-tools/node_modules/playwright/index.mjs SD_CHROMIUM_PATH=/tmp/chromium node scripts/verify-sites-browser.mjs` | Local production build: 21 route/viewport checks, 18 interactions, 0 page errors at 375/768/1440 |
| `python scripts/verify-sites-hosted-http.py` with in-memory service credential | **14/14 hosted probes pass**; no credential recorded |
| `git diff --check` | Pass |

The new source-version helper needs subprocess-capable execution. Sandbox `spawnSync git EPERM` was resolved by running the normal build environment; failed sandbox attempts are not counted as passes. Test cases for production-only routes were updated to assert the test policy's deliberate 403 responses; the noindex test profile similarly has an empty sitemap and blanket robots exclusion. Existing underlying domain tests remain.

## What hosted HTTP proves
Build, Discover, Connect, Operate and /farmers respond 200. Private list/create/export/restore return 401 without user identity, even with a valid platform service credential. Supplying forged synthetic identity headers still returns 401. Execution, device registration and external handoff return 403. Responses carry private/no-store/noindex. The configured salt does not appear in probe bodies. See `docs/verification/SITES_HOSTED_HTTP.json` for non-sensitive results.

A service credential is NOT a substitute for an authenticated end user. These probes do not create/save private project rows and do not prove A/B browser sign-in.

## What local browser tests prove
Discover filtering, responsive catalog/detail/compare/Connect/Builder/Operate and /farmers, mobile navigation, deterministic Builder creation, truthful signed-out save failure, actual page reload, temporary sample reset, and /farmers → Builder custom-build boundary. Local tests do not prove hosted session cookies, live identity issuance, sign-out isolation between real accounts, or hosted save persistence.

## Gates still open
1. Two authorized provider-backed test identities and a supported hosted browser path: sign in A → create/save → fresh reload/reopen → sign out → B denies copied ID → A resaves.
2. A real hosted project survives an application redeployment; an empty schema surviving is insufficient.
3. Hosted export and restore of real synthetic project state.
4. Hosted mobile interactions and account sessions at 375/768/desktop.
5. Supported full D1 backup/restore path and rehearsal. Available connector exposes inspection, not full export/restore administration.
6. Authorized complete DNS/edge configuration export before any future domain change; public DNS alone hides origin targets and some mail dependencies.

No real device operation, payments, manufacturer credentials, Mesh authority, production D1, merge, or DNS modification occurred. All repository-local work and available hosted non-user probes are complete; missing end-to-end evidence is reported as blocked, not passed.

Worker-log access verified: eight sampled records corresponded to expected 401/403 denial probes, all with Worker outcome `ok`; no runtime exception was observed in that sample. Platform logs include request metadata/headers, so production retention/redaction review remains required; no raw logs are committed.

A documentation/probe-only follow-up deployment uses the same Site, environment revision and DB binding. Its source can be read from `/api/version` and the PR head. An empty DB/schema surviving redeployment is not counted as project-persistence evidence.
