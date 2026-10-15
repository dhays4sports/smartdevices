# SmartDevices Release and Version Ledger

This ledger complements the append-only v4.0 history in `RELEASE_NOTES.md` and the per-sprint source commits in `CHECKPOINT_LEDGER.md`.

| Release | Date UTC | Baseline | Roadmap gate | Designation |
|---|---|---|---|---|
| v5.3.0-rc.1 | 2026-10-02 | v5.2.0-rc.1 + SD-BB-0 | Ecosystem Reconciliation 1.0 source candidate | Canonical source recovery + capability/trust/Connect foundation; full dependency-aware build gate pending |
| v5.2.0-rc.1 | 2026-09-16 | v5.1.0-rc.1 Intelligent Device Platform | Live Device Engine source candidate | Requirements/research/hosted revisions/sourcing/execution adapters; clean full build gate pending |
| v5.0.0-rc.1 | 2026-09-16 | v4.6.0-rc.1 Protection Checklist | Builder V1 source candidate | Protect + Builder source-root candidate; final clean build/runtime gate pending |
| v4.0.0-rc.1 | 2026-08-22 | Protected v3 historical/visual source | SD-CERT-10.5 | Local production candidate; superseded as engineering baseline, retained for rollback |
| v4.1.0-rc.1 | 2026-08-22 | v4.0 source SHA `0e19b173…b718202` | SD41-CERT-10.4 | Focused interactive local production candidate; no public deployment or external certification |
| v4.2.0-rc.0 | 2026-08-26 | v4.1 source SHA `1fc5e838…90f6c2` plus 58-sprint SD42 program | SD42-QA-9.6 | California carrier-pilot local RC0; evidence/content gate passed, final cross-platform, clean-room, documentation, and package gates pending |
| v4.2.0-rc.1 candidate docs | 2026-08-26 | RC0 plus SD42-CERT-10.1–10.4 | SD42-CERT-10.4 | Cross-platform boundaries, cross-system contracts, clean-room/rollback, release manifest, guides, samples, and cutover statement complete; immutable package gate pending |
| v4.2.0-rc.1 | 2026-08-26 | Final clean source commit recorded in package-root provenance | SD42-CERT-10.5 | Locally certified root-deployable California carrier-pilot candidate; external go-live not ready or authorized |
| v4.3.0-rc.1 | 2026-08-28 | v4.2.3 source commit `32878c7…02b097` | SD43-CERT-2.0 | Local Evidence Autopilot candidate; outbound retrieval, hosted D1, identity, scheduler and public deployment remain disabled pending activation |

## v4.2 compatibility

- URLs: plan v1/v2 remain readable; plan v3 adds only allowlisted governed carrier/public-evidence IDs. `/farmers` is canonical; the alias strips unknown query fields.
- Data: migration `0003` adds only normalized verification events and indexes; v4.1 ignores the new table during rollback.
- Integrations: handoff v3 adds bounded carrier IDs/versions while v1/v2 readers remain; adapters default disabled.
- Carrier architecture: a test-only second carrier proves generic data-driven behavior and is not publicly discoverable.
- Brand/assets: protected original SVG hashes remain unchanged; Farmers is text-only without endorsement/brand claims.

## v4.1 compatibility history

- URLs: plan v1 remains readable; plan v2 adds sanitized version/domain/concern/device selection only.
- Data: migration `0002` is additive and nullable for prior plans.
- Integrations: handoff v1 remains readable; v2 adds governed scan provenance and literal client intent.
- Brand/assets: protected original SVG hashes are unchanged.
- Operations: hosted services stay disabled until their individual activation rows pass.

## Release artifacts

| Artifact | Contents | Status |
|---|---|---|
| `SmartDevices_v4.1.0_rc1_SD41-CERT-10.4_SOURCE.zip` | Root source without generated `dist/`, dependencies, caches, local env, or prior ZIPs | Exact packaged-source gate passed |
| `SmartDevices_v4.1.0_rc1_SD41-CERT-10.4_ROOT_DEPLOYABLE.zip` | Same root plus the build emitted by the exact source gate | Clean install and built-runtime gate passed |
| `SmartDevices_v4.1.0_rc1_SHA256SUMS.txt` | SHA-256 of both immutable final ZIPs | Authoritative sibling digest record |

Both ZIPs contain `RELEASE_PROVENANCE.txt` at the archive root. It records the source commit and explains why the checksum values remain in the sibling manifest rather than inside self-hashing archives.

## v4.2 release artifacts

| Artifact | Contents | SD42-CERT-10.4 status |
|---|---|---|
| `SmartDevices_v4.2.0_rc1_SD42-CERT-10.5_SOURCE.zip` | Root source without generated build/dependencies/caches/local env/prior archives | Exact post-package source gate passed |
| `SmartDevices_v4.2.0_rc1_SD42-CERT-10.5_ROOT_DEPLOYABLE.zip` | Exact source extraction plus its verified production `dist/` | Exact post-package root/built-runtime gate passed |
| `SmartDevices_v4.2.0_rc1_SHA256SUMS.txt` | SHA-256 of both immutable final ZIPs | Authoritative sibling manifest generated and verified after both ZIPs became immutable |

Corrections and future releases must append; they must not relabel earlier failed runs or external boundaries.

## v4.3 release artifacts

| Artifact | Contents | Status |
|---|---|---|
| `SmartDevices_v4.3.0_rc1_EVIDENCE_AUTOPILOT_SOURCE.zip` | Exact root source without build output, dependencies, caches, local environment or prior archives | Final clean-package gate pending at source freeze |
| `SmartDevices_v4.3.0_rc1_EVIDENCE_AUTOPILOT_ROOT_DEPLOYABLE.zip` | Exact verified source extraction plus only its production `dist/` | Final clean-package gate pending at source freeze |
| `SmartDevices_v4.3.0_rc1_EVIDENCE_AUTOPILOT_SHA256SUMS.txt` | SHA-256 of both immutable final ZIPs plus exact source commit | Generated only after both package gates pass |

## v5.0 release artifact

| Artifact | Contents | Status |
|---|---|---|
| `SmartDevices_v5.0.0_rc1_BUILDER_PLATFORM_SOURCE_ROOT.zip` | Root-layout source, Builder V1, additive migration `0005`, tests and docs; excludes generated `dist/`, dependencies, caches and prior ZIPs | Source-level gates passed as recorded; clean install/type/lint/build/runtime gate pending |

Do not relabel this source package as a verified prebuilt/root-deployable build. Produce that artifact only after the downstream gate in `BUILDER_LOCAL_VERIFICATION.md` passes from a clean extraction.

| `SmartDevices_v5.1.0_rc1_INTELLIGENT_DEVICE_PLATFORM_SOURCE_ROOT.zip` | Root-layout source; intelligent-device operating modes + Mesh-ready/native architecture contract + migration `0006` | Source-level JS contracts pass except built-runtime test requiring intentionally excluded dist; npm-dependent type/build gate remains pending |


## v5.2 release artifact

| Artifact | Contents | Status |
|---|---|---|
| `SmartDevices_v5.2.0_rc1_LIVE_DEVICE_ENGINE_SOURCE_ROOT.zip` | Root-layout source; DeviceProject v3; model/research provider boundary; hosted project revisions; sourcing + Build Executor adapters; concrete V1 sensor firmware; expanded Build Pack; no generated `dist/` | Builder core semantic typecheck, source regressions, migration rehearsal, runtime Build Pack smoke and executed CadQuery smoke pass; clean locked install/full repo type/lint/build/runtime gate remains pending |

Do not relabel the source candidate as a verified prebuilt/root-deployable build. External research, sourcing and execution adapters are fail-closed until explicitly configured.

## 2026-09-17 v5.2 documentation addendum

`docs/SD001_FIRST_PHYSICAL_PROOF_AND_MESH_NODE_PLAN.md` is the accepted post-v5.2 execution plan. It establishes SD-001 and MESH-DEVICE-001 as the next proof gates, defines the physical Build Evidence Ledger, and explicitly defers marketplace/generalized manufacturing expansion until those gates are satisfied. This addendum does not change the runtime version or certify any additional external service.


## 2026-10-02 v5.2 Business Builder conformance addendum

`docs/SD-BB-0_BUSINESS_BUILDER_CONFORMANCE.md` runs SmartDevices through BB0–BB6 as a first-party Business Builder dogfood business. The outcome is **REDESIGN — continue**. The runtime version remains v5.2.0-rc.1.

The revised critical path is `Preview → SD-INTEROP-0.1 → SD-001/BB7 → SD-MVB-001 → MVB → SD-002 → MESH-DEVICE-001 → MAB/BB8`. The addendum also defines the Validated Build Pack first paid unit, SmartDevices Build Evidence Graph durable asset, required owner-intervention/economics metrics and the rule that Mesh-device proof does not block the MVB.


## v5.3 ecosystem reconciliation artifact

| Artifact | Contents | Status |
|---|---|---|
| `SmartDevices_v5.3.0_rc1_ECOSYSTEM_RECONCILIATION_SOURCE_ROOT.zip` | Recovered v5.2 canonical source plus capability/trust/Connect foundations, migration `0007`, reconciliation docs/tests; no generated `dist/`, dependencies, caches or local env | Source/local gates recorded in `ECOSYSTEM_RECONCILIATION_VERIFICATION.md`; clean npm/type/lint/build/runtime gate pending |

Do not relabel the source candidate as a production-certified/root-deployable build.

### Reconciliation 1.1 continuation of v5.3.0-rc.1

Same release candidate, same draft PR #2, preserved ancestry. Restored market checkpoint and independent trust facts; repaired type/lint/build and registration boundaries; no new product-release or production-certification claim. Validation: 336 tests, 3 migration paths, 24 browser route/viewport checks, 3 interactions. Full evidence in ECOSYSTEM_RECONCILIATION_VERIFICATION.md.
