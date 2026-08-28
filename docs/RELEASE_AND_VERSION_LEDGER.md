# SmartDevices Release and Version Ledger

This ledger complements the append-only v4.0 history in `RELEASE_NOTES.md` and the per-sprint source commits in `CHECKPOINT_LEDGER.md`.

| Release | Date UTC | Baseline | Roadmap gate | Designation |
|---|---|---|---|---|
| v4.0.0-rc.1 | 2026-08-22 | Protected v3 historical/visual source | SD-CERT-10.5 | Local production candidate; superseded as engineering baseline, retained for rollback |
| v4.1.0-rc.1 | 2026-08-22 | v4.0 source SHA `0e19b173…b718202` | SD41-CERT-10.4 | Focused interactive local production candidate; no public deployment or external certification |
| v4.2.0-rc.0 | 2026-08-26 | v4.1 source SHA `1fc5e838…90f6c2` plus 58-sprint SD42 program | SD42-QA-9.6 | California carrier-pilot local RC0; evidence/content gate passed, final cross-platform, clean-room, documentation, and package gates pending |
| v4.2.0-rc.1 candidate docs | 2026-08-26 | RC0 plus SD42-CERT-10.1–10.4 | SD42-CERT-10.4 | Cross-platform boundaries, cross-system contracts, clean-room/rollback, release manifest, guides, samples, and cutover statement complete; immutable package gate pending |
| v4.2.0-rc.1 | 2026-08-26 | Final clean source commit recorded in package-root provenance | SD42-CERT-10.5 | Locally certified root-deployable California carrier-pilot candidate; external go-live not ready or authorized |

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
