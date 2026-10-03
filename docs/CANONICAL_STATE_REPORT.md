# Canonical State Report — SMARTDEVICES-ECOSYSTEM-RECONCILIATION-1.0

Audit date: 2026-10-02

## Determination

The latest accessible implementation source is the Library artifact:

`SmartDevices_v5.2.0_rc1_SD-BB-0_BUSINESS_BUILDER_CONFORMANCE_SOURCE_ROOT.zip`

Immutable artifact SHA-256:

`637624ca1386b3d9f576f7e6e0adda35e797622a74cd50bb77dd3b6620eded4a`

This artifact is the canonical implementation candidate for reconciliation because it is materially newer than GitHub `main`, contains the v4.3–v4.6 evolution, Builder v5.2 Live Device Engine, v5.1 intelligent-device modes, the SD-001 physical-proof plan and the 2026-10-02 SD-BB-0 Business Builder conformance addendum.

## GitHub states audited

### `main`

Observed SHA: `7556775e3d2dbdfb7d83732b308abaaec0a151e5`

State: v4.2-era source. This is a valid historical baseline but not the latest implementation.

### Draft PR #1

Title: `SMARTDEVICES-ECOSYSTEM-NORTH-STAR-1.0: ecosystem accretion roadmap`  
Head: `ad3043351ec49d2ab8b04458775be7dd1091bb76`  
Base: `main` / `7556775e3d2dbdfb7d83732b308abaaec0a151e5`

State: governance/documentation overlay only. It correctly records the North Star but intentionally does not contain the latest Builder/runtime implementation. Cloudflare reported a successful branch preview for the PR head, which verifies deployment of the older implementation plus governance docs—not v5.2 canonical runtime.

### Other GitHub branches

Before reconciliation, only `main` and `smartdevices-ecosystem-north-star-1.0` were visible. No newer unmerged implementation branch was found.

## Canonical candidate feature inventory

The v5.2 source candidate contains:

- mature Protect/public exploration and device intelligence;
- `/devices`, detail pages, compare, evidence/provenance and SEO work;
- `/insurance` and canonical `/farmers` specialized vertical;
- Smart Safety Plans and Pro boundaries;
- v4.3 Evidence Autopilot foundations;
- v4.4/v4.5/v4.6 protection/closing work;
- `/build` Live Device Engine;
- DeviceProject v3 before this reconciliation;
- deterministic and optional model-assisted orchestration;
- buy/adapt/build research state;
- hosted Builder projects/revisions;
- sourcing and Build Executor adapters;
- firmware/CadQuery generation contracts;
- standalone / connected / Mesh-ready / Mesh-native operating modes;
- SD-001 physical-proof and MESH-DEVICE-001 plans;
- SD-BB-0 Business Builder conformance.

## Mesh status before reconciliation

The Builder contains optional Mesh-ready/Mesh-native architecture metadata and documents runtime boundaries. It does not implement production Mesh identity, mandate, permission, execution, settlement or receipt rails. Baseline SmartDevices use already remains possible without Mesh.

## device.eth / deviceregistry.org status before reconciliation

No runtime `device.eth` or `deviceregistry.org` implementation was found in the v5.2 source candidate. Their strategic roles existed in PR #1 governance only. They are therefore reconciled as identity/registry contracts and future integration boundaries, not live services.

## Deployment / hosting truth

- PR #1 head: Cloudflare branch preview reported successful by the repository integration.
- Latest v5.2 canonical source candidate: no verified public deployment was found.
- Latest v5.2 package explicitly records that the clean locked dependency install/full production build remained pending in its source-only environment.

## Outstanding ambiguity

The canonical implementation candidate is an immutable source archive rather than an existing GitHub commit. This reconciliation branch therefore imports/reconstructs that source state and documents the source archive hash as its pre-GitHub immutable identifier. No evidence of a newer SmartDevices implementation state was found in the accessible repository branches or newer SmartDevices Library artifacts reviewed for this mandate.

## Reconciliation publication status

A clean reconciliation branch was published from the recovered implementation plus the reconciled North Star:

- branch: `smartdevices-ecosystem-reconciliation-1.0`;
- draft PR: `#2 — SMARTDEVICES-ECOSYSTEM-RECONCILIATION-1.0: canonical recovery + device foundation`;
- implementation-tree commit before the final status-only documentation update: `41e92ea4b638ddd706e182247bdacd106b9c0635`;
- PR #1 remains unmerged and is explicitly marked as superseded for implementation purposes.

Cloudflare's Git integration attempted a branch deployment for PR #2 and reported **deployment failed**. No successful reconciliation preview URL was issued. The Cloudflare dashboard log requires external account access not available in this execution environment, so no cause is invented here. The failed preview does not alter the local verification results and is recorded as an external/manual blocker.
