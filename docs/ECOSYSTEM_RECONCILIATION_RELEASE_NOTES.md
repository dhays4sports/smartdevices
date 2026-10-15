# SmartDevices v5.3.0-rc.1 — Ecosystem Reconciliation 1.0

Status: source release candidate / implementation reconciliation  
Date: 2026-10-02  
Baseline: `SmartDevices_v5.2.0_rc1_SD-BB-0_BUSINESS_BUILDER_CONFORMANCE_SOURCE_ROOT.zip`  
Baseline SHA-256: `637624ca1386b3d9f576f7e6e0adda35e797622a74cd50bb77dd3b6620eded4a`

## Purpose

Reconcile the materially newer v5.2 SmartDevices implementation with `SMARTDEVICES-ECOSYSTEM-NORTH-STAR-1.0` without rebuilding mature product surfaces.

SmartDevices now has an implementation foundation for four durable surfaces:

**DISCOVER → CONNECT → CREATE → OPERATE**

This release implements the minimum foundations needed for the first three and deliberately keeps consequential operation behind future governed authorization/execution boundaries.

## Canonical-state finding

GitHub `main` at `7556775e3d2dbdfb7d83732b308abaaec0a151e5` is an older v4.2-era repository state. Draft PR #1 at `ad3043351ec49d2ab8b04458775be7dd1091bb76` adds the correct ecosystem governance direction but intentionally does not contain the later v5.2 Builder/runtime work.

The v5.2 SD-BB-0 source archive above is therefore the implementation baseline for reconciliation. See `CANONICAL_STATE_REPORT.md`.

## Runtime additions

- Canonical Smart Device Object projection separating model/instance identity, capabilities, connectivity, compatibility, provenance, trust, control, operational readiness, and optional Mesh metadata.
- Progressive trust ladder:
  `discovered → registered → claimed → verified → identified → permissioned → agent-operable → transactional`.
- Normalized capability registry grounded in existing catalog and Builder use cases.
- Public machine-readable capability endpoint and device-record endpoint.
- Capability-aware Discover search/detail presentation.
- Bounded `/connect` flow for authenticated manual registration.
- Secret-key rejection and explicit no-implicit-trust-escalation behavior.
- Disabled-by-default device adapter contract.
- Additive D1 registry/claim/integration tables in migration `0007_device_registry_foundation.sql`.
- Builder DeviceProject schema v4 with normalized `requiredCapabilities` and backward read normalization from schema v3.
- Build Pack `Capability_Requirements.md` output.
- Navigation exposes Discover, Connect, and Create without removing Protect, Insurance, plans, or professional flows.

## Preserved

- `/farmers` carrier truth boundaries and California scope.
- Insurance evidence, fit and verification distinctions.
- v5.2 Builder research/sourcing/execution/safety architecture.
- Existing plans, Pro, accessibility, SEO and evidence governance.
- Disabled-by-default external adapters.
- Business Builder SD-BB-0 sequencing and MVB discipline.

## Explicit non-claims

This release does not claim:

- live manufacturer connections;
- verified device ownership or control;
- `device.eth` activation;
- `deviceregistry.org` production deployment;
- Mesh runtime activation;
- live device command execution;
- physical-device testing;
- external certification;
- production payment or transaction support.

## Verification

Locally completed in this environment:

- 99/99 source-level JavaScript contract tests, excluding the built-runtime test that requires generated `dist/`;
- strict semantic TypeScript check for the pure device/capability/Builder core;
- syntax transpilation for all 21 changed/new TS/TSX files;
- evidence validation: no draft, stale, conflicting, restricted or orphan public evidence;
- migrations `0000` through `0007` applied to a fresh SQLite rehearsal database: 22 tables, 0 foreign-key violations, with pre-existing `owner_subject` columns preserved;
- JSON validation for capability registry and Drizzle metadata.

Unavailable in this environment because npm registry/network resolution is blocked:

- clean locked dependency install;
- full dependency-aware repository typecheck/lint;
- Vinext production build;
- built-runtime route/browser matrix.

No public deployment was manually authorized or performed by this release work.
