# Schema and migration history

Historical migrations are append-only and remain in `drizzle/`.

| Migration | Release | Change | Rollback boundary |
|---|---|---|---|
| 0000 | v4.0 | Initial durable plan, recommendation, response, professional, consent, audit, handoff, suppression, and rate-limit tables | Historical baseline; do not rewrite |
| 0001 | v4.0 RC1 | Baseline hardening changes preserved from the protected source | Historical baseline; do not rewrite |
| 0002 | v4.1 RC1 | Adds versioned scan sessions/responses and optional plan-v2 provenance columns | Application rollback is compatible because all new plan columns are nullable and existing plan schema version defaults to 1; retain columns during rollback |
| 0003 | v4.2 RC1 | Adds normalized append-only plan verification events with actor, event, determination, assertion source, idempotency hash, bounded metadata, and occurrence time | v4.1 ignores the additive table; retain it during rollback and preserve events until the approved retention/deletion policy is applied |

`scan_sessions` stores only governed session state and broad Home/Vehicle context. `scan_responses` uses question and option IDs, not free-form answers. Plans may reference a scan session and store selected concern IDs, rationale, assumptions, and unknowns as bounded JSON. Contact data, address, VIN, plate, policy/claim identifiers, and raw answer payloads are prohibited from the plan create contract.

Before production activation, run the migration against a staged D1 database, verify foreign keys and indexes, create a backup/export under the operator’s approved Cloudflare process, run the runtime contract suite, and only then promote the worker binding. A v4.0 application rollback can ignore the additive nullable fields; do not drop v4.1 columns until retention and rollback windows close.

Local rehearsal `SD41-CERT-10.2`: the first three migrations applied in numeric order to an empty SQLite database and produced the governed 12-table schema. Local rehearsal `SD42-QA-9.1`: all four migrations applied in numeric order to an empty Node SQLite database and produced 13 governed tables, including `plan_verification_events`, plus the expected verification-event indexes. These runs verify SQL sequence locally, not Cloudflare D1 backup/restore operations.

## v5.3 ecosystem foundation — migration 0007

`0007_device_registry_foundation.sql` is additive and creates three device-domain tables:

- `device_registry_records` — normalized private instance registration metadata and the explicit `registered` trust state;
- `device_control_claims` — separately asserted/verified/revoked ownership or control claims;
- `device_integrations` — adapter/integration metadata and server-side credential references without raw public secrets.

Registration uses `registrant_subject`, not `owner_subject`, because account association is not proof of physical ownership or control.

Local fresh-database rehearsal through `0007`: **22 tables, 0 foreign-key violations**.

Rollback is application-first. Older application code may ignore the additive tables. Do not destructively remove registry data until retention/rollback requirements are separately approved.

## 1.1 cross-session reconciliation

Both historical `0007_device_registry_foundation.sql` and `0007_market_shadow_observability.sql` are retained byte-for-byte. The former belongs to published PR #2; the latter and market 0008–0011 belong to the recovered SD-MKT-0.9 checkpoint. No historical file was renamed or renumbered.

The journal now appends the five market migrations after its original eight entries, retaining the original entry metadata. `0012_snapshot.json` is the reconciled 28-table schema snapshot, generated from current Drizzle types; a temporary generated duplicate market SQL file was discarded before commit. The snapshot index follows the journal index, not a renaming of SQL files. A subsequent `npm run db:generate` reports no schema changes.

`python3 scripts/verify-migrations.py` checks journal completeness, sequence, all table/column/index definitions, foreign keys, integrity and existing suppression/registry rows across fresh, registry-first and market-first upgrade paths. This is an offline rehearsal, not proof of remote application. Before hosted activation, back up D1 and inspect the target runner's actual applied full filenames. Apply only missing migrations. For a database with market files already applied through another runner, reconcile that runner's metadata explicitly; do not replay CREATE TABLE statements or rely on numeric prefix alone.

Rollback means reverting application code while retaining additive tables/data; do not delete registry, consent/suppression or market records as a rollback shortcut. No remote migration was executed in this run.
