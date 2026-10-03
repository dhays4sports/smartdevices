# SmartDevices Builder v5.2 Implementation Manifest

Release candidate: v5.2.0-rc.1  
Date: 2026-09-16

## Public product surfaces

- `app/build/page.tsx` — canonical public Builder route.
- `app/components/DeviceBuilder.tsx` — idea intake, requirements orchestration, architecture, research, sourcing, build execution, validation, hosted-save actions and Build Pack export.
- `app/project/[id]/page.tsx` — authenticated hosted project workspace.
- `app/components/builder.css` — Builder/bridge responsive styles.
- `app/components/SiteHeader.tsx` — permanent Build navigation.
- `app/components/ProtectionExplorer.tsx` — Build entry from the platform home experience.
- `app/farmers/page.tsx` — separate custom-build path with explicit carrier boundary; core v5.1 Farmers/carrier files are byte-identical in this release candidate.

## Live Device Engine

- `app/lib/builder-contract.ts` — DeviceProject schema v3, revision, safety, research, sourcing and execution contracts.
- `app/lib/builder-orchestrator.ts` — deterministic requirements analysis and material-question selection.
- `app/lib/builder-ai-server.ts` — optional server-side model-assisted orchestration and web research; fail-closed when disabled/unconfigured.
- `app/lib/builder-research.ts` — catalog-only buy/adapt/build fallback.
- `app/lib/builder-engine.ts` — capability inference, safety classification, R0/R1/R2 architectures, curated BOM, concrete sensor firmware adapters, CadQuery source and validation state.
- `app/lib/builder-store.ts` — authenticated D1 project save/read/list and immutable revision snapshots.
- `app/lib/builder-pack.ts` — portable Build Pack and browser ZIP creation.
- `app/lib/solution-contract.ts` — shared solution type and insurance-status vocabulary; custom builds remain informational-only.
- `app/api/builder/orchestrate/route.ts` — requirements orchestration endpoint.
- `app/api/builder/research/route.ts` — opt-in live research endpoint.
- `app/api/builder/source/route.ts` — opt-in supplier adapter.
- `app/api/builder/execute/route.ts` — opt-in sandboxed firmware/CAD execution adapter.
- `app/api/builder/projects/*` — authenticated hosted project endpoints.

## Reference hardware paths

- `content/builder-components.json` — curated low-voltage prototype component library; temperature, humidity and light paths now identify concrete protocol/library families.
- `content/builder-benchmarks.json` — original five engineering benchmarks plus a Mesh-native restaurant freezer fleet benchmark.
- Temperature/freezer firmware emits a real DS18B20/OneWire + DallasTemperature sensor adapter and library dependency list.
- Other supported sensor classes use explicit digital/analog/I2C adapters; generic sensing remains visibly incomplete until a specific sensor is selected.

## Persistence foundation

v5.2 activates, rather than redesigns, the existing additive persistence boundary:

- `builder_projects`
- `builder_revisions`
- migration `0005_builder_foundation`
- intelligence fields from migration `0006_intelligent_device_modes`

The complete DeviceProject v3 state is stored in revision `manifest_json`; no destructive migration is required for v5.2.

## Execution and external-service boundaries

- Model/web research requires explicit activation and a server-side API key.
- Supplier data requires an explicit HTTPS sourcing adapter.
- Firmware/CAD execution requires a separately sandboxed Build Executor. The public Cloudflare app never spawns arbitrary generated code.
- Executor `pass` is the only path that can promote compile/CAD validation to pass.
- Artifact download URLs are accepted only as HTTPS executor results.

See `docs/BUILDER_V52_ACTIVATION.md` and `docs/BUILD_EXECUTOR_CONTRACT.md`.

## Tests and verification

- `tests/builder-contract.test.ts` — Builder core behavior and Build Pack contracts.
- `tests/builder-live-engine.test.mjs` — v5.2 route/action/provider/persistence source contracts.
- `tests/builder-ui.test.mjs` — public route and Farmers separation contract.
- `tests/schema-contract.test.mjs` — persistence/migration contract.
- `tests/runtime-pages.test.mjs` — built-runtime matrix; requires a fresh production `dist/` and is intentionally not satisfiable from the source-only archive.

See `docs/BUILDER_LOCAL_VERIFICATION.md` for the exact gates completed in this environment and the remaining clean dependency/build gate.

## Accepted next execution program

The next product gate is documented in `docs/SD001_FIRST_PHYSICAL_PROOF_AND_MESH_NODE_PLAN.md`.

- **SD-001** uses the Connected Freezer Guardian to prove prompt → Build Pack → physical working device and creates the first predicted-vs-actual Build Evidence Ledger.
- **MESH-DEVICE-001** derives a restaurant freezer fleet from the validated physical design and proves persistent identity, bounded capabilities/events and authorized agent interaction when the Mesh runtime is active.
- Marketplace, broad manufacturing and unrelated platform expansion are sequenced after these proofs unless required to unblock them.

## Business Builder conformance addendum — 2026-10-02

`SD-BB-0` evaluates SmartDevices as a first-party Business Builder dogfood business and returns **REDESIGN — continue**. It does not modify v5.2 runtime code.

Canonical business docs:

- `SD-BB-0_BUSINESS_BUILDER_CONFORMANCE.md`
- `SMARTDEVICES_BUSINESS_BLUEPRINT.md`
- `SMARTDEVICES_MVB_MAB_AUTONOMY.md`
- `SD-BB-0_CONFORMANCE_RECORD.json`

The implementation sequence is now `Preview → SD-INTEROP-0.1 → SD-001/BB7 → SD-MVB-001 → MVB → SD-002 → MESH-DEVICE-001 → MAB/BB8`. `MESH-DEVICE-001` remains strategically important but is not allowed to block proving the paid SmartDevices business loop.

## v5.3 ecosystem reconciliation addendum

Builder remains the existing v5.2 Live Device Engine. It is generalized, not replaced.

- DeviceProject writes schema **v4**.
- Schema-v3 hosted revision manifests remain readable and are normalized on read.
- `requiredCapabilities` contains normalized SmartDevices capability requirements inferred from the existing bounded Builder capability family and user intent.
- Existing-device research compares normalized capabilities rather than relying only on category/concern labels.
- Build Packs include `Capability_Requirements.md`.
- Mesh operating modes remain optional architecture choices; normalized device capabilities are platform-neutral and exist independently of Mesh metadata.

This addendum does not activate PCB/manufacturing, live device control, or a Mesh runtime.
