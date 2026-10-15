# SmartDevices Builder v5.2 — Live Device Engine

## Release objective

Turn Builder from a local planning surface into an execution-capable device project system without weakening the Farmers/carrier truth boundary.

The v5.2 loop is:

`idea → requirements orchestration → research → buy/adapt/build → intelligence architecture → prototype architecture → sourcing → compile/CAD execution → validation → hosted revision → Build Pack`

## What is live in the product contract

1. **Requirements orchestrator** — deterministic by default, optionally model-assisted when an approved provider is configured.
2. **Live market research** — opt-in provider route; research has an explicit status and source list. Catalog-only research remains visible when live research is unavailable.
3. **Hosted projects** — authenticated D1 persistence using the existing `builder_projects` and immutable `builder_revisions` boundary. The latest manifest is loaded at `/project/<id>`.
4. **Live sourcing adapter** — opt-in HTTPS boundary that maps BOM lines to supplier facts. Planning data is never relabeled as live.
5. **Build Executor adapter** — opt-in HTTPS boundary for firmware compilation and CadQuery execution. No pass state may be recorded unless an executor actually ran.
6. **Build Pack v3** — now includes requirements orchestration, research decision, sourcing status and build-execution evidence.

## Explicit non-claims

- The public Cloudflare app does not spawn Arduino CLI or arbitrary Python.
- A production Build Executor must be sandboxed and separately deployed.
- Live research is not active until explicitly configured.
- Live sourcing is not active until explicitly configured.
- Mesh-native is an architecture declaration, not proof that a Mesh runtime/domain binding is activated.
- Custom devices remain informational-only for insurer/carrier qualification unless separately verified by authoritative carrier evidence.

## Reference devices

### A. Connected Freezer Guardian

One low-voltage temperature monitor with ordinary connectivity and alerting. This is the core engineering golden path.

### B. Restaurant Freezer Fleet

A multi-location temperature fleet whose units require persistent identity, telemetry/events, discovery, diagnostics and agent access. Builder should infer a Mesh-native architecture when those requirements are explicit. This is the SmartDevices ↔ Mesh reference design.

## Production activation checklist

- Apply all existing D1 migrations through `0006_intelligent_device_modes`.
- Configure rate-limit salt.
- Configure authenticated user headers/sign-in.
- Optionally configure AI + research provider.
- Optionally configure sourcing provider.
- Deploy a sandboxed Build Executor and configure its HTTPS endpoint/token.
- Run full typecheck/lint/build/regression suite.
- Verify `/farmers` regression before merging the Builder release.

## Next execution gate: SD-001 physical proof

v5.2 is the software foundation for the next milestone, not the endpoint. The next accepted program gate is to use SmartDevices' own output to build a real Connected Freezer Guardian and record predicted-versus-actual engineering evidence.

No compile/CAD validation may be upgraded based on narrative confidence; the physical proof must use actually executed artifacts. All material expert intervention must be captured as a DeviceProject discrepancy and correction lineage.

After SD-001 passes, derive the Restaurant Freezer Fleet and prove the Mesh identity/capability path as MESH-DEVICE-001.

See `docs/SD001_FIRST_PHYSICAL_PROOF_AND_MESH_NODE_PLAN.md`.
