# Release Manifest — SmartDevices v5.3.0-rc.1 Ecosystem Reconciliation 1.0

Release date: 2026-10-02
Baseline implementation artifact: `SmartDevices_v5.2.0_rc1_SD-BB-0_BUSINESS_BUILDER_CONFORMANCE_SOURCE_ROOT.zip`
Baseline SHA-256: `637624ca1386b3d9f576f7e6e0adda35e797622a74cd50bb77dd3b6620eded4a`
Designation: source release candidate; clean dependency-aware build/runtime certification pending.

## Canonical recovery

- GitHub `main`: `7556775e3d2dbdfb7d83732b308abaaec0a151e5` — older v4.2-era state.
- Governance PR #1 head: `ad3043351ec49d2ab8b04458775be7dd1091bb76` — correct North Star overlay, intentionally old runtime.
- Reconciliation implementation baseline: the v5.2 SD-BB-0 source archive identified above.

See `CANONICAL_STATE_REPORT.md`.

## Runtime delta

- Smart Device Object + explicit trust ladder.
- Canonical capability registry.
- Public capability and catalog-device JSON endpoints.
- Bounded `/connect` registration UI/API.
- Additive registry, control-claim and integration persistence.
- Secret rejection and disabled adapter boundary.
- DeviceProject schema v4 capability requirements with schema-v3 read normalization.
- Capability-aware Build Pack and catalog matching.
- Discover / Connect / Create navigation while preserving Protect/Insurance/Pro.

## Data delta

Migration `0007_device_registry_foundation.sql` adds three tables and does not modify earlier migrations. Fresh rehearsal through `0007`: **22 tables, 0 foreign-key violations**.

## Verification completed locally

- source `.mjs` contracts excluding generated-dist runtime test: **99 passed, 0 failed**;
- pure device/capability/Builder-core strict TypeScript semantic check: PASS;
- changed/new TS/TSX parse/transpile gate: PASS, 21 files / 0 syntax errors;
- carrier evidence validator: PASS;
- JSON/Drizzle metadata validation: PASS;
- migration rehearsal: PASS, 22 tables / 0 FK violations; historical `owner_subject` columns preserved.

## Environment-limited gates

`registry.npmjs.org` cannot be resolved from this execution environment, so a clean `npm ci`, full dependency-aware typecheck/lint, Vinext production build and generated-dist runtime matrix are not certified here. They remain CI/connected-environment gates.

## External status

No public production deployment is manually authorized by this release. Existing Cloudflare preview evidence for PR #1 applies to the older governance branch runtime only. Any automatically created branch preview for the reconciliation PR must be reported as a preview, not as production activation.

## Non-claims

No live manufacturer connection, physical hardware test, device ownership verification, `device.eth` activation, `deviceregistry.org` production service, Mesh operation, device command, payment execution or external certification is claimed.
