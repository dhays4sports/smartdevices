# SD-MKT-0.9 Validation

Status: source-contract validation complete; public activation remains disabled.

Validated properties:

- user conversion requires explicit confirmation;
- self-reported and provider-verified evidence are separate durable states;
- provider callbacks are HMAC authenticated and timestamp bounded;
- provider callback nonces are persisted for replay protection;
- provider callback identity must match the provider bound to the attributed transaction;
- conversion receipts bind the complete commercial lineage and store provider references only as hashes;
- duplicate conversion submissions are idempotent by transaction + event + source;
- click/open events remain distinct from purchase/installation;
- Market.ad conversion code does not enter `app/lib/scan.ts`.

Remaining production gates are unchanged: clean dependency install, typecheck, production build, browser/accessibility QA, D1 migration rehearsal, and real provider callback onboarding/authorization.

Cumulative Market-specific source-contract suite: **57/57 passing** (`node --test tests/market-*.test.mjs`) on 2026-09-22.
