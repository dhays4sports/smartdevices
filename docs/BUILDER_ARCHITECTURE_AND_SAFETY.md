# Builder Architecture and Safety Contract

Status: v5.2.0-rc.1 Live Device Engine · 2026-09-16

## Architecture

Builder is an additive application over the existing SmartDevices platform. It shares the published device catalog for research-before-invention but keeps carrier rules and physical engineering truth states separate.

Public routes:

- `/build` — public device idea/intake and local workspace.
- `/project/<id>` — authenticated hosted project workspace when D1 is activated.

Core modules:

- `builder-contract.ts` — `DeviceProject` schema v3, intelligence, orchestration, research, sourcing, execution, BOM and validation types.
- `builder-orchestrator.ts` — deterministic engineering-requirements path.
- `builder-ai-server.ts` — optional server-only model/web-research provider.
- `builder-research.ts` — catalog-only buy/adapt/build fallback.
- `builder-engine.ts` — capability inference, safety classifier, architectures, BOM, concrete V1 sensor firmware adapters, CadQuery source and validation state.
- `builder-store.ts` — authenticated D1 project persistence with immutable revision manifests.
- `builder-pack.ts` — portable project files and dependency-free browser ZIP creation.
- `solution-contract.ts` — separates technical solution type from insurance status.

The public/local Builder remains useful without identity or external services. Hosted save requires authentication + D1. Model research, sourcing and build execution are independent opt-in adapters and fail closed when unconfigured.

## Safety classes

### Supported

Low-voltage sensing/monitoring prototypes using curated modules, listed/certified external USB power or replaceable cells, passive indicators and 3D-printed enclosures.

### Review required

Requests involving rechargeable-lithium charging, heating, motors/pumps/actuation, exposed outdoor use, production quantities or R2/R3 intent. Builder may scope these projects but must preserve review states instead of presenting them as validated.

### Autonomous implementation blocked

Builder withholds detailed implementation instructions for life-safety/high-risk control such as mains/high voltage, gas-control, fire-suppression control, medical devices, critical vehicle control and weapon/detonation functions. Requirements may still be captured to brief a qualified specialist.

## Validation vocabulary

Each check is one of:

- `pass` — the named check actually executed or a deterministic internal rule genuinely verified it.
- `fail` — an executed check failed.
- `review` — specialist/user verification is required or an implementation layer is intentionally incomplete.
- `not-run` — Builder has not executed that validation.

Important separation:

- `firmware compile = pass` means the configured executor compiled the sketch for the target; it does not prove the physical device works.
- `sensor adapter completeness` tracks whether a concrete sensor implementation exists.
- `remote transport` separately tracks whether alerts/cloud/Mesh forwarding is actually implemented.
- `CAD generation = pass` means CadQuery executed and artifacts were produced; physical fit still requires measurement/verification.

## External execution

Generated CAD is executable code. The public SmartDevices worker MUST NOT run it directly. Production firmware/CAD execution belongs in a disposable, resource-limited Build Executor accessed through the HTTPS contract in `BUILD_EXECUTOR_CONTRACT.md`.

No adapter may upgrade a validation state merely because it was requested. It must return evidence of the check that actually ran.

## Insurance boundary

Every custom Builder solution begins as:

- `solution_type = smartdevices-build`
- `insurance_status = informational-only`

No engineering inference, live research result, Mesh mode, sourcing result or executor result upgrades this state. A separate governed carrier determination is required for carrier-related truth.

## Future specialist stages

The architecture still reserves specialist stages for custom PCB/EDA, DFM, prototype/PCB/3D-print ordering, compliance workflows, fleet deployment and actual Mesh runtime activation. These stages must remain independently gated and evidence-producing.

## v5.3 capability-first compatibility addendum

The v5.2 safety and execution boundaries remain unchanged. DeviceProject schema v4 adds normalized `requiredCapabilities` as an interoperability layer while preserving the existing bounded `BuildCapability` family for hardware-template selection.

This is intentionally a compatibility layer rather than a Builder rewrite. Unknown/unproven capability mappings remain unresolved instead of being invented. A normalized capability requirement does not imply that an existing product satisfies all deployment, safety, carrier or authorization constraints.
