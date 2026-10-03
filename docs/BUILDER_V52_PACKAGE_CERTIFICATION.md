# SmartDevices v5.2.0-rc.1 — Package Certification

Date: 2026-09-16
Artifact class: source-root release candidate

## Certified in this environment

- Builder pure-core strict standalone TypeScript semantic check: PASS.
- Changed/new Builder TS/TSX syntax transpilation: PASS (15 files).
- Source JavaScript regression suite: 90/91 PASS. The sole failure is the runtime-start test because the clean source candidate intentionally excludes `node_modules`/generated `dist` and the Vinext binary is therefore unavailable.
- D1 migration rehearsal `0000` through `0006`: PASS, 19 tables, 0 foreign-key violations.
- Runtime DeviceProject smoke: Freezer Guardian resolved to `connected`; 100-unit restaurant freezer fleet resolved to `mesh-native` and the engineering-review path.
- Build Pack runtime smoke: PASS; 14-file ZIP generated and passed ZIP integrity.
- CadQuery 2.8.0 execution smoke: PASS; reference enclosure generated non-empty STEP/STL body and lid artifacts.
- Core Farmers/carrier boundary comparison against v5.1: PASS; eight checked files are byte-identical. Combined SHA-256: `0d3c5d55f2824c6a1e8184a6bbeea1436492bd055e68413a84778be467669bf0`.

## Not certified in this environment

- Fresh locked npm dependency installation.
- Full repository framework-aware typecheck/lint/build.
- Generated Vinext production `dist` runtime.
- Arduino/ESP32 firmware compilation; Arduino CLI/core tooling is not installed here.
- Live OpenAI/web-research calls; provider activation requires operator-supplied credentials/settings.
- Live distributor sourcing; adapter activation requires an operator-supplied HTTPS endpoint/settings.
- Remote Build Executor compilation/CAD service; adapter activation requires an operator-supplied HTTPS endpoint/settings.

The application fails closed for disabled/unavailable external adapters. A compile, CAD, live-research, or live-sourcing result must not be reported as passed unless its corresponding execution/provider actually returns a successful result.

## Release discipline

The source archive must contain `package.json` at archive root and exclude generated `dist`, `node_modules`, framework caches, local environment files, TypeScript build-info files, Git metadata, and nested ZIP archives. See `docs/BUILDER_LOCAL_VERIFICATION.md` for the clean-environment release gate.
