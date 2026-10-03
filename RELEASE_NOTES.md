# SmartDevices v5.3.0-rc.1 — Ecosystem Reconciliation 1.0

This release reconciles the materially newer SmartDevices v5.2 SD-BB-0 source with the ecosystem North Star without rebuilding mature product surfaces.

## Added / generalized

- canonical Smart Device Object and progressive trust ladder;
- normalized capability registry and machine-readable capability/device endpoints;
- capability-aware Discover search/detail records;
- bounded authenticated `/connect` device registration;
- explicit claim/integration persistence separated from registration;
- fail-closed device adapter contract and secret-key rejection;
- DeviceProject schema v4 with normalized required capabilities and schema-v3 read compatibility;
- additive migration `0007_device_registry_foundation.sql`;
- reconciled device.eth/deviceregistry.org contracts and ecosystem roadmap.

## Preserved

`/farmers`, insurance evidence boundaries, Protect, plans, Pro, Builder v5.2 research/sourcing/execution architecture, accessibility, responsive behavior, SEO, security/privacy and disabled-by-default external adapters remain in place.

## Deliberately deferred

No manufacturer integration, live device reachability/control, device ownership verification, Mesh runtime activation, device.eth activation, deviceregistry.org production deployment, physical hardware certification or real-money transaction is claimed or enabled by this release.

For verification and exact status see `docs/ECOSYSTEM_RECONCILIATION_RELEASE_NOTES.md` and `docs/ECOSYSTEM_RECONCILIATION_VERIFICATION.md`.

---

## Historical v5.2 release notes

This release advances the v5.1 Intelligent Device Platform from deterministic planning toward a real device-project execution loop while preserving `/farmers` as a separate carrier-specific truth surface.

## Added

- DeviceProject schema v3 with orchestrator, research, sourcing, execution and hosted-state records.
- Optional model-assisted requirements orchestration with deterministic fallback.
- Optional live web research and explicit buy/adapt/build decision records.
- Authenticated hosted Builder projects using existing D1 `builder_projects` / `builder_revisions` tables.
- `/project/<id>` hosted workspace URLs.
- Optional live sourcing adapter.
- Sandboxed Build Executor contract for actual firmware compilation and CadQuery generation.
- Validation states that only become `pass` from recorded execution results.
- Expanded Build Pack with requirements, research, sourcing and execution evidence.
- Connected Freezer Guardian and Mesh-native Restaurant Freezer Fleet reference paths.

## Unchanged boundary

A SmartDevices custom build — including a Mesh-native one — does not establish insurer acceptance or satisfy a Farmers requirement unless that qualification is supported by separate authoritative carrier evidence.

## 2026-09-17 documentation addendum — SD-001 physical proof program

The accepted next execution program is now part of the repository documentation:

- `SD-001 — First Physical Proof`: build a real Connected Freezer Guardian from SmartDevices-generated artifacts and capture predicted-versus-actual build evidence.
- `MESH-DEVICE-001 — First Physical Node`: derive a multi-device restaurant freezer fleet from the proven design and exercise persistent identity/capabilities/authorized agent interaction through the Mesh runtime when available.
- Scope expansion into marketplace, generalized manufacturing and speculative network features is intentionally sequenced after those proof gates.

This addendum changes roadmap/documentation only; it does not claim additional runtime capability beyond v5.2.0-rc.1.

## 2026-10-02 documentation addendum — SD-BB-0 Business Builder conformance

SmartDevices has now been evaluated as a first-party business under the Mesh Business Builder constitution. The result is **REDESIGN — continue** rather than unconditional GO or NO-GO.

The addendum:

- narrows the first paying wedge to bounded monitoring/sensing needs for small commercial/property operators and technically capable solution buyers without in-house hardware engineering;
- defines the first paid unit as a **Validated Build Pack** rather than a mandatory subscription or marketplace transaction;
- defines the **SmartDevices Build Evidence Graph** as the durable asset rather than generic AI-generated code/CAD/PCB output;
- makes owner intervention, intervention rate, autonomous gross-profit efficiency and per-build economics required business metrics;
- reclassifies `SD-001` as the **BB7 Build & Verify technical proof**, not MVB revenue;
- inserts `SD-MVB-001` and a real external paid/committed customer loop before MVB;
- moves `MESH-DEVICE-001` out of the MVB-blocking critical path;
- retains Mesh as optional at the device level and as governed infrastructure where identity, permissions, capability discovery, routing, receipts, monitoring or recovery create real value.

This addendum changes business sequencing/documentation only. It does not add runtime capability or change the v5.2.0-rc.1 version.
