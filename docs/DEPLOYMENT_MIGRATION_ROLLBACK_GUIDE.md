# Deployment, Migration, and Rollback Guide

## Clean install and build

1. Extract the source ZIP into an empty directory. `package.json` must be at the extraction root.
2. Copy `.env.example` to the environment’s secret/config system. Keep `SMARTDEVICES_DEMO_MODE=false` for public production.
3. Run `npm run install:ci` with Node 22.13 or newer.
4. Verify committed migrations `0000` through `0003`. Run `npm run db:generate` only when the schema intentionally changes and review any new SQL; never rewrite historical migrations. Apply only unapplied migrations in numeric order to a backed-up staging D1 database.
5. Run `npm run typecheck`, `npm run lint`, and `npm test`.
6. Start the built artifact with `npm start` or deploy the root-deployable package through the approved Sites/worker control plane.
7. Verify `/`, `/protect/home`, `/protect/vehicle`, `/devices`, a device detail, a local plan, `/pro`, the authenticated Pro workspace, and expected 4xx/5xx adapter states.

## v4.0 → v4.1 migration

There is no v3 database or account data. Static v3 content was manually mapped; do not import the v3 wrapper folder. For an existing hosted v4 environment, export/backup D1, record its digest and migration state, apply `0002_needy_wendell_rand.sql`, verify 12 tables and nullable plan-v2 columns, deploy code, run v1/v2 plan and handoff fixtures, then enable adapters one at a time. Migration `0002` adds scan tables and nullable provenance columns; it does not transform historical plan rows.

## v4.1 → v4.2 migration

Back up and record the hosted D1 database and migration table before changing code. Apply `0003_supreme_stepford_cuckoos.sql` after `0000`–`0002`; verify 13 governed tables and the `plan_verification_events` table plus its plan index and idempotency-unique index. Migration `0003` is additive: it creates the normalized verification-event table and does not rewrite plans, plan recommendations, responses, consent, suppression, audits, scan records, or handoff receipts. Deploy v4.2 code, run plan v1/v2/v3 and handoff v1/v2/v3 fixtures, confirm production-locked Pro, then activate approved adapters one at a time. The v4.1 application/build remains reproducible, but a production rollback must first disable v4.2 writes; do not destructively drop the additive table during incident response.

## Cutover order

Database → identity/roles → public read routes → persistent plans → Pro → one partner adapter → communications. Keep every adapter disabled until its own acceptance test and suppression/deletion review passes.

## Rollback

1. Disable external delivery and partner adapter flags first.
2. Route traffic to the preceding root-deployable package.
3. Do not reverse a D1 migration destructively during incident response. Use the compatible prior application or a tested forward repair migration.
4. Preserve audit/consent/suppression records and append the incident to release history.
5. If content evidence is wrong, set the affected record to stale/archived and rebuild; never rewrite its earlier review history.
6. Reconcile plans/handoffs created during the incident window before re-enabling delivery. A real D1 restore requires owner credentials and an approved backup; the local rehearsal does not claim that external operation.

## Root-deployable verification

Both final ZIPs have `package.json` at archive root and no wrapper directory. The source ZIP excludes `dist/`; the root-deployable ZIP includes verified `dist/` alongside the root project/configuration files. Both exclude `node_modules`, `.git`, `.next`, `.wrangler`, `.sites-runtime`, local environment files, prior ZIPs, and preview state.

## Local rehearsal evidence

See `CLEAN_EXTRACTION_DEPLOYMENT_REHEARSAL.md` and the two append-only transcripts under `docs/evidence/`. No deploy command was run.

## v5.3 / migration 0007 rollback

`0007_device_registry_foundation.sql` is additive. If the Connect foundation must be rolled back:

1. stop routing users to `/connect` and disable device-registration writes;
2. roll application code back to the prior compatible release;
3. leave the additive registry tables in place during the rollback/retention window;
4. do not reinterpret `registered` records as ownership/control claims during rollback;
5. only drop registry tables under a separately approved data-retention/destructive-migration procedure.

No earlier migration is modified by v5.3.
