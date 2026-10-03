# SmartDevices Builder v5.2.0-rc.1 — Local Verification Record

Date: 2026-09-16

This record distinguishes what was actually executed in the available environment from what remains a downstream production gate.

## Verified here

- All append-only migrations `0000` through `0006` apply in order to a fresh SQLite-compatible database.
- The resulting schema contains **19 application tables**, including `builder_projects` and `builder_revisions`.
- `PRAGMA foreign_key_check` returns **0 violations**.
- The core Builder library set passes a strict standalone TypeScript semantic typecheck using the available TypeScript compiler.
- Fifteen changed/new Builder TS/TSX files pass syntax-level TypeScript transpilation.
- The source-level JavaScript/MJS suite records **90 passes out of 91**; the sole failure is `runtime-pages.test.mjs`, which requires intentionally excluded generated `dist/` output.
- A runtime-transpiled Builder smoke test creates a schema-v3 Freezer Guardian project as **connected** and a 100-unit restaurant freezer fleet as **Mesh-native** with engineering-review state.
- The same runtime smoke generates a **14-file Build Pack ZIP** and `unzip -t` reports no errors.
- The freezer firmware contains the DS18B20/OneWire + DallasTemperature implementation path and dependency manifest.
- CadQuery **2.8.0** executed the reference enclosure source and produced non-empty `enclosure_body.step`, `enclosure_body.stl`, `enclosure_lid.step`, and `enclosure_lid.stl` outputs.
- Eight core Farmers/carrier source/data files were byte-compared to the v5.1 source archive and are unchanged. Combined SHA-256: `0d3c5d55f2824c6a1e8184a6bbeea1436492bd055e68413a84778be467669bf0`.

## Not verified here

A clean locked dependency install did not complete within the available environment, so this session does **not** claim the following full-project release gates:

- repository `npm run typecheck`
- repository `npm run lint`
- Vinext/Cloudflare production build
- built-runtime route rehearsal
- normal TypeScript test suite under the repository's `tsx` runner
- dependency audit from a newly installed dependency tree

Arduino CLI / ESP32 core tooling is also not present here. Therefore the reference firmware source was type/contract checked but **not actually compiled for ESP32-C3 in this environment**. The v5.2 Build Executor contract exists specifically so production can perform and record that compile in a sandbox.

The inherited v5.1 `dist/` is deliberately excluded rather than represented as a v5.2 build.

## Required downstream release gate

From a clean extraction with normal dependency access:

```bash
npm run install:ci
npm run db:generate
npm run validate:evidence
npm run typecheck
npm run lint
npm test
```

Then deploy/configure any desired optional services separately:

- model-assisted orchestration / live research
- live sourcing adapter
- sandboxed Build Executor

See `docs/BUILDER_V52_ACTIVATION.md`.

Until the clean full-project gate passes, the supplied ZIP is a **source-root release candidate**, not a newly certified prebuilt production artifact.
