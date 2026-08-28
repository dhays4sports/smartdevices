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
