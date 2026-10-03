# SmartDevices v5.3 — Open Intelligent-Device Ecosystem Foundation

SmartDevices.com is an independent intelligent-device platform converging around four durable surfaces: **DISCOVER → CONNECT → CREATE → OPERATE**. It must remain useful without the Mesh and become materially more capable with it.

- **Discover** preserves the evidence-backed device catalog and now exposes normalized machine-readable capabilities and trust-aware device projections.
- **Connect** provides a bounded registration foundation for devices someone already owns or operates without pretending registration proves ownership, verification, reachability, identity or permission.
- **Create** preserves the v5.2 Live Device Engine and adds capability-first requirements through DeviceProject schema v4.
- **Operate** remains intentionally gated; consequential device actions belong behind explicit authorization/mandate/execution/revocation boundaries rather than technical reachability alone.

The existing `/farmers`, `/insurance`, `/protect/*`, device catalog, evidence governance, plans and Pro boundaries are preserved. A custom Builder project remains `informational-only` for insurance purposes unless a separate authoritative carrier determination explicitly establishes otherwise.

Builder v5.2 remains the **Live Device Engine** and v5.3 generalizes it rather than replacing it: requirements orchestration, explicit buy/adapt/build research, standalone/connected/Mesh-ready/Mesh-native architecture, authenticated hosted revisions, sourcing and sandboxed build-execution adapters, concrete V1 sensor firmware paths, parametric CadQuery geometry and an expanded portable Build Pack.

External services are fail-closed. Model/web research, live sourcing and compiler/CAD execution remain unavailable until their explicit server-side activation flags and credentials are configured. A validation may only show `pass` when the corresponding check actually ran.

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
- Evidence Autopilot requires separate server-side administrator authorization. The scheduler requires an independent secret, and external retrieval requires an explicit activation flag.
- D1, partner handoffs, evidence upload, CRM, and communications are disabled until their environment, authorization, consent, retention, security, and provider contracts are activated.
- No product guarantees prevention, detection, recovery, eligibility, discounts, approval, installation, verification, or claim outcomes.
- Recommendation, client intent, purchase, installation, evidence, and verification are separate durable states.

## Ecosystem reconciliation

The governing product direction is `docs/SMARTDEVICES_ECOSYSTEM_NORTH_STAR_AND_ROADMAP.md`. The true-source recovery and implementation audit are recorded in `docs/CANONICAL_STATE_REPORT.md`, `docs/ECOSYSTEM_RECONCILIATION_MATRIX.md`, and `docs/ECOSYSTEM_RECONCILIATION_STATUS.md`.

Core invariants:

- categories remain useful for people; normalized capabilities are the interoperability layer;
- `discovered ≠ registered ≠ claimed ≠ verified ≠ identified ≠ permissioned ≠ agent-operable ≠ transactional`;
- non-Mesh devices remain representable and useful;
- device registration never accepts raw credential material;
- `/farmers` remains a specialized, independently governed vertical;
- no live device control, payment execution, manufacturer integration, `device.eth` activation or `deviceregistry.org` production service is implied by this source candidate.

## Business Builder conformance

SmartDevices is a first-party Business Builder dogfood business. The current constitutional outcome is **SD-BB-0: REDESIGN — continue under the revised plan**. The Builder remains the product, but the critical path now requires a narrow initial paying wedge, a paid `Validated Build Pack`, explicit owner-intervention/economics measurement, and an MVB before `MESH-DEVICE-001` can become the primary business milestone. This is a documentation/business-sequencing change, not a v5.2 runtime capability claim.

See `docs/SD-BB-0_BUSINESS_BUILDER_CONFORMANCE.md`, `docs/SMARTDEVICES_BUSINESS_BLUEPRINT.md`, and `docs/SMARTDEVICES_MVB_MAB_AUTONOMY.md`.

## Documentation

Start with:

- `docs/SMARTDEVICES_ECOSYSTEM_NORTH_STAR_AND_ROADMAP.md`
- `docs/CANONICAL_STATE_REPORT.md`
- `docs/ECOSYSTEM_RECONCILIATION_MATRIX.md`
- `docs/ECOSYSTEM_ASSUMPTION_AUDIT.md`
- `docs/SMART_DEVICE_OBJECT_AND_TRUST_MODEL.md`
- `docs/DEVICE_CONNECT_ARCHITECTURE.md`
- `docs/DEVICE_IDENTITY_AND_REGISTRY.md`
- `docs/ECOSYSTEM_RECONCILIATION_VERIFICATION.md`
- `docs/ECOSYSTEM_RECONCILIATION_RELEASE_NOTES.md`
- `docs/SD-BB-0_BUSINESS_BUILDER_CONFORMANCE.md`
- `docs/SMARTDEVICES_BUSINESS_BLUEPRINT.md`
- `docs/SMARTDEVICES_MVB_MAB_AUTONOMY.md`
- `docs/SD-BB-0_CONFORMANCE_RECORD.json`
- `docs/SMARTDEVICES_BUILDER_NORTH_STAR.md`
- `docs/SD001_FIRST_PHYSICAL_PROOF_AND_MESH_NODE_PLAN.md`
- `docs/BUILDER_ARCHITECTURE_AND_SAFETY.md`
- `docs/BUILDER_V1_ACCEPTANCE.md`
- `docs/BUILDER_LOCAL_VERIFICATION.md`
- `docs/BUILDER_V52_LIVE_DEVICE_ENGINE.md`
- `docs/BUILDER_V52_ACTIVATION.md`
- `docs/BUILD_EXECUTOR_CONTRACT.md`
- `docs/V4.4_HOME_DECISION_EXPERIENCE.md`
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
- `docs/V4.3_EVIDENCE_AUTOPILOT.md`
- `docs/EVIDENCE_AUTOPILOT_ACTIVATION_GUIDE.md`

## Current v5.3 reconciliation packaging

The v5.3 reconciliation artifact is a **source-root release candidate**: `package.json` is at archive root and generated build output, dependencies, caches, local environment files and prior ZIP packages are excluded. The inherited v5.1 `dist/` is intentionally not included because a clean locked dependency install/full production build could not be completed in this environment. Run the release commands in `docs/BUILDER_LOCAL_VERIFICATION.md` before treating a prebuilt production artifact as certified.

## Ecosystem reconciliation 1.1 — recovered continuation

Continue draft PR #2 on `smartdevices-ecosystem-reconciliation-1.0`; retain the existing registration UI/API and Builder v4. The previously separate SD-MKT-0.9 checkpoint is now reconciled, still inactive by default. Discover has normalized public APIs and a capability filter; Connect registers metadata only; Create retains the complete builder and build packs; Operate clearly marks live actions as unavailable.

Current audit: [Recovery ledger](docs/ECOSYSTEM_RECOVERY_LEDGER_1_1.md), [reconciliation matrix](docs/ECOSYSTEM_RECONCILIATION_MATRIX.md), [verification](docs/ECOSYSTEM_RECONCILIATION_VERIFICATION.md). Original North Star remains intact. No merge, public deployment, hardware operation or money movement is part of this continuation.
