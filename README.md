# SmartDevices v4.2 — California Carrier Intelligence Pilot

SmartDevices.com is an independent, carrier-neutral, insurance-aware device intelligence platform for homes, vehicles, families, and businesses. v4.2 connects Interactive Property discovery, a three-to-five-question Intelligent Scan, the Device Universe, the Smart Safety Plan, SmartDevices Pro, and optional carrier guidance.

This repository is the v4.2 local release-candidate source. Home and Vehicle have full interactive depth; Family and Business are clearly labeled starter guides. The release contains exactly three causal demonstrations: water leak/shutoff, smoke-or-heat awareness, and vehicle theft tracking. `/insurance` is the permanent neutral directory; `/farmers` is the canonical California Farmers pilot. No carrier relationship, approval, eligibility, or discount is implied.

## Strategic direction — ecosystem North Star

As of 2026-10-02, the governing direction for future SmartDevices ecosystem work is documented in `docs/SMARTDEVICES_ECOSYSTEM_NORTH_STAR_AND_ROADMAP.md`.

The product should converge around **DISCOVER → CONNECT → CREATE → OPERATE** and become more valuable as third parties create more intelligent devices. Mesh integration is a capability multiplier, not a prerequisite for participation. The current implementation must be reconciled incrementally against that direction; **do not rebuild from scratch** merely because the abstraction has improved.

This strategic overlay does not claim that every roadmap capability is implemented in this v4.2 source state.

## Requirements

- Node.js 22.13 or newer
- Linux with `flock`, `curl`, and GNU `timeout` for the provided bounded scripts

## Run locally

```bash
npm run install:ci
npm run dev
```

For an explicit local Pro demo, set `SMARTDEVICES_DEMO_MODE=true` in ignored local environment configuration. Never enable demo mode on a public production deployment.

## Verify

```bash
npm run db:generate
npm run validate:evidence
npm run typecheck
npm run lint
npm test
```

`npm test` performs a production build and runs the schema, content, accessibility, resilience, security, runtime, and typed business-rule suites. The deployment binding is declared in `.openai/hosting.json`; schema and append-only migrations live in `db/` and `drizzle/`.

## Important boundaries

- Public explorer, catalog, comparison, insurance directory, California Farmers public-source guidance, and local plans work without identity or external services.
- Production Pro requires the server-side authenticated-user boundary. Identity does not by itself prove an insurance role; the operator must add the documented role/allowlist policy.
- D1, partner handoffs, evidence upload, CRM, and communications are disabled until their environment, authorization, consent, retention, security, and provider contracts are activated.
- No product guarantees prevention, detection, recovery, eligibility, discounts, approval, installation, verification, or claim outcomes.
- Recommendation, client intent, purchase, installation, evidence, and verification are separate durable states.

## Documentation

Start with:

- `docs/SMARTDEVICES_ECOSYSTEM_NORTH_STAR_AND_ROADMAP.md`
- `docs/PROGRAM_LEDGER.md`
- `docs/ARCHITECTURE_AND_DATA_CONTRACTS.md`
- `docs/CARRIER_DATA_CONTRACTS.md`
- `docs/SCAN_QUESTION_AND_RULE_PROVENANCE.md`
- `docs/CONTENT_AND_INSURANCE_EVIDENCE_LEDGER.md`
- `docs/NORMALIZED_REGRESSION_HISTORY.md`
- `docs/EXTERNAL_ACTIVATION_LEDGER.md`
- `docs/KNOWN_LIMITATIONS_AND_CUTOVER_READINESS.md`
- `docs/DEPLOYMENT_MIGRATION_ROLLBACK_GUIDE.md`
- `docs/RELEASE_AND_VERSION_LEDGER.md`
- `docs/CROSS_BROWSER_DEVICE_MATRIX.md`
- `docs/CLEAN_EXTRACTION_DEPLOYMENT_REHEARSAL.md`
- `docs/RELEASE_MANIFEST.md`

## Root deployment

Both final ZIPs extract with this `package.json` at their root. The source package excludes generated build output; the root-deployable package additionally contains verified `dist/`. Neither embeds the v3 baseline, node modules, local environment files, build caches, or prior ZIP packages.
