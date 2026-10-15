# SD-001 — First Physical Proof + MESH-DEVICE-001 — First Physical Node

Status: accepted BB7 physical-proof plan; business sequencing amended by SD-BB-0 on 2026-10-02
Owner: SmartDevices Builder program
Applies after: v5.2 Live Device Engine source candidate + SD-BB-0 Business Builder conformance

## Decision

The next SmartDevices milestone is **not broader feature expansion**. It is physical proof.

SmartDevices must demonstrate that its current loop can begin with a plain-language need and end with a physical intelligent device that works when built from the generated project package.

The sequence is deliberately constrained:

`Idea → Requirements → Research → Buy/Adapt/Build → Architecture → BOM → Firmware → CAD → Build Pack → Physical Assembly → Test → Actual Outcome → Revision`

Only after this loop works reliably does SmartDevices advance to the first Mesh-operated physical fleet.

The physical proof remains mandatory, but SD-BB-0 changes the business critical path:

1. **SD-001 — First Physical Proof / BB7 Build & Verify** — one real Connected Freezer Guardian built from SmartDevices output.
2. **SD-MVB-001 — Offer + Customer Validation** — real external Buy / Adapt / Build requests and at least one paid or contractually committed supported Build Pack engagement.
3. **MVB** — the first complete external paid business loop.
4. **SD-002 — Interoperability Proof** — reuse the proven device capability model across more than one supported environment.
5. **MESH-DEVICE-001 — First Physical Node** — a fleet derived from the proven device, with persistent identity/capabilities and authorized agent interaction through the Mesh runtime when that runtime boundary is available.

`MESH-DEVICE-001` may run in parallel as Mesh infrastructure dogfooding after SD-001, but it must not block proving the MVB.

---

## Why this is the next gate

Builder already has the platform contracts for requirements orchestration, research, intelligence architecture, hosted revisions, sourcing adapters, build execution, validation and Build Pack export. The major remaining uncertainty is not whether SmartDevices can describe a device; it is whether the generated system survives contact with the physical world.

The next source of product advantage should come from **observed build and field outcomes**, not from adding more speculative UI or categories.

The operating principle is:

> A SmartDevices feature becomes more valuable when its use produces knowledge that improves future SmartDevices builds.

That means actual measurements, corrections and failures must become first-class engineering evidence.

---

# Milestone 0 — Repository + Preview Gate

Before purchasing hardware, v5.2 must be placed into the canonical SmartDevices repository and deployed as a preview candidate.

## Required steps

1. Create a dedicated v5.2 / SD-001 working branch.
2. Run the clean dependency install.
3. Run the full typecheck, lint, schema, tests and production build.
4. Resolve all failures from the real repository environment.
5. Deploy the branch to a Cloudflare preview environment.
6. Regression-test `/farmers` before any Builder merge.
7. Verify `/build`, hosted project routes, research fallback, Build Pack creation and fail-closed execution states.
8. Do not merge to production until the preview gate passes.

## Exit condition

A deployed preview exists and the existing Protect/Farmers experience remains behaviorally intact.

---

# SD-001 — First Physical Proof

## Reference device

**Connected Freezer Guardian**

The device is intentionally simple. The purpose is to validate the SmartDevices pipeline, not to demonstrate exotic electronics.

Baseline capabilities:

- measure freezer temperature;
- detect sustained threshold violation;
- communicate through ordinary connectivity;
- provide an alert/event path;
- operate from a practical low-voltage power source;
- fit in a generated physical enclosure;
- be assembled from the exact BOM and instructions produced by SmartDevices.

The current reference implementation may use an ESP32-class controller and a supported digital temperature sensor such as DS18B20, but SmartDevices must retain the right to change the architecture during research if a superior practical path is found.

## Customer-style starting prompt

The proof begins from a deliberately incomplete statement:

> “I want something that alerts me when my freezer gets too warm.”

No hidden engineering requirements should be injected before the SmartDevices intake runs.

## Required SmartDevices path

SmartDevices must:

1. interpret the request;
2. ask only questions that materially affect the design;
3. research existing commercial/open solutions;
4. record an explicit Buy / Adapt / Build / Research More decision;
5. create the DeviceProject requirements;
6. choose the intelligence mode;
7. select the prototype architecture;
8. produce an actionable BOM;
9. generate firmware and dependencies;
10. compile firmware through the configured Build Executor before claiming compile success;
11. generate enclosure CAD;
12. execute CadQuery and produce actual STEP/STL artifacts before claiming CAD success;
13. generate assembly and test instructions;
14. export the complete Build Pack;
15. save the project/revision state;
16. use that exact output to create the physical device.

## Physical build rule

The person performing SD-001 should follow SmartDevices' output as literally as practical.

If expert intervention is required, the intervention must be recorded as a discrepancy rather than silently fixing the project outside the system.

Examples:

- wrong part selected;
- missing connector;
- enclosure opening too small;
- incompatible library version;
- firmware compiles but sensor path does not work;
- Wi-Fi setup is unclear;
- estimated assembly order is impractical;
- thermal behavior differs from prediction.

Every discrepancy becomes product evidence.

---

# SD-001 Build Evidence Ledger

SmartDevices should capture **predicted versus actual** values wherever practical.

## Project identity

- DeviceProject ID
- revision ID
- architecture mode
- component/BOM version
- firmware artifact hash/version
- CAD artifact hash/version
- Build Pack version
- build date

## Predicted values

- prototype cost;
- assembly time;
- enclosure dimensions;
- expected power behavior;
- expected connectivity behavior;
- expected sensor range/accuracy where supported by source data;
- estimated battery life if battery-powered;
- expected environmental limitations;
- expected alert latency if applicable.

## Actual build values

- actual parts purchased;
- substitutions made;
- actual landed prototype cost;
- actual assembly time;
- print method/material/settings;
- actual enclosure fit observations;
- compile result;
- flash result;
- sensor initialization result;
- connectivity result;
- alert/event result;
- measured temperature behavior;
- power/battery observations;
- failure/rework count;
- human interventions required.

## Discrepancy classification

Each discrepancy should be tagged as one or more of:

- requirements error;
- research error;
- architecture error;
- sourcing/BOM error;
- firmware error;
- CAD/mechanical error;
- assembly-instruction error;
- validation gap;
- environment assumption error;
- provider/runtime failure;
- user-experience ambiguity.

## Correction lineage

For every material discrepancy record:

`observed issue → root cause → correction → new revision → retest result`

The correction should update the DeviceProject rather than living only in an external note.

---

# SD-001 Acceptance Criteria

SD-001 is complete only when all of the following are true:

1. The project began from the customer-style prompt, not a hand-authored engineering specification.
2. SmartDevices produced the requirements and architecture.
3. Research produced an explicit Buy/Adapt/Build decision.
4. The BOM was sufficient to acquire the needed prototype hardware.
5. Firmware was generated and actually compiled for the selected target.
6. The firmware was flashed to the physical device.
7. The supported temperature sensor initialized and returned measurements.
8. The generated enclosure was actually fabricated from the supplied CAD outputs.
9. The electronics fit the enclosure after any documented revision cycle.
10. The assembled device detected a defined over-temperature condition.
11. The configured alert/event path worked.
12. Assembly and test instructions were usable by someone following the Build Pack.
13. Every material manual correction was captured as structured discrepancy evidence.
14. A corrected revision was produced for any material SmartDevices-caused failure.
15. The final revision can be rebuilt from its Build Pack without undocumented steps.

### Strong definition of done

> A person starts with one sentence on SmartDevices, follows the resulting project and Build Pack, and ends up holding a working intelligent physical device with no hidden engineering step that is absent from the recorded project history.

---

# SD-001 Metrics

The first proof is not judged by vanity metrics. Record:

- number of SmartDevices revisions required;
- number of undocumented assumptions discovered;
- number of part substitutions;
- number of firmware failures;
- number of mechanical fit failures;
- total human engineering interventions;
- time from prompt to build-ready package;
- time from parts-in-hand to working device;
- predicted versus actual prototype cost;
- percent of build steps completed without interpretation outside the Build Pack.

The target for the first build is **learning completeness**, not artificial perfection.

---

# MESH-DEVICE-001 — First Physical Node

MESH-DEVICE-001 starts only after SD-001 has a working final revision. Under SD-BB-0 it is **not the next required business gate**: `SD-MVB-001` and the MVB sit ahead of it on the critical commercial path. It may proceed in parallel as Mesh rails dogfooding if it does not consume the resources needed to validate the paid SmartDevices loop.

## Reference system

**Restaurant Freezer Fleet**

Derive multiple units from the proven Freezer Guardian design and introduce the requirements that justify Mesh complexity:

- persistent device identity;
- multi-device/fleet discovery;
- telemetry/events;
- explicit capabilities;
- diagnostics;
- authorization/permissions;
- agent-readable state;
- domain-bound identity when the Mesh runtime supports it;
- replacement/upgrade lineage without losing logical device identity where supported.

## Example capability surface

A freezer node may expose concepts such as:

- `temperature.read`
- `temperature.history`
- `door.status`
- `alerts.subscribe`
- `diagnostics.run`
- `firmware.status`

These names are reference semantics, not a frozen protocol contract.

## Mesh boundary

SmartDevices owns:

`Design → Build → Validate → Deploy → Maintain physical device`

The Mesh owns:

`Identity → Discovery → Permissions → Capabilities → Events/Commands → Agent coordination`

**Mesh-native architecture must never be represented as active Mesh integration until the runtime identity, authorization and command/event paths have actually been exercised.**

## MESH-DEVICE-001 acceptance criteria

1. At least two physical device instances derive from the proven SD-001 architecture.
2. Each has a persistent logical identity in the Mesh runtime.
3. Each exposes a bounded capability/event surface.
4. An authorized agent can discover the fleet.
5. The agent can query current state from more than one device.
6. A real temperature-threshold event can propagate from a physical node into the Mesh path.
7. Unauthorized access is rejected according to the active permission model.
8. Device replacement/revision does not silently corrupt identity or project lineage.
9. SmartDevices maintains the mapping between physical build revision and Mesh identity posture.
10. The project records enough operational evidence to improve the next design/deployment.

### Strong definition of done

> Multiple real SmartDevices-built physical devices can participate as authorized, distinguishable nodes in a Mesh-operated fleet, and an authorized agent can discover and reason over their live capabilities/events.

---

# Data Flywheel Objective

The long-term advantage is not simply that SmartDevices can generate code or CAD. It is that SmartDevices learns from real builds and deployments.

The desired loop is:

`More builds → more build evidence → more field evidence → better component/architecture decisions → better SmartDevices designs → more successful builds`

Examples of compounding knowledge SmartDevices should eventually be able to learn from its own evidence base:

- real fit clearances that repeatedly work for a particular board/connector;
- real assembly-time distributions;
- part substitutions with better success rates;
- recurring firmware/library incompatibilities;
- enclosure geometries associated with failures;
- real-world power/battery performance;
- failure rates by component/revision;
- which user requests are better solved by an existing commercial product than by a custom build.

The underlying model may change over time. This evidence should remain SmartDevices-owned project knowledge.

---

# Scope Control Until SD-001 Is Complete

The following are **deferred unless required to complete the proof**:

- creator marketplace;
- public social/community features;
- generalized “build anything” hardware scope;
- one-click mass manufacturing;
- broad custom-PCB automation;
- marketplace liquidity tooling;
- elaborate public device profiles;
- unrelated `/farmers` expansion;
- vanity network-effect features;
- speculative Mesh features that do not support MESH-DEVICE-001.

This is not a permanent rejection. It is sequencing discipline.

## Exception rule

A deferred capability may be pulled forward only if it is necessary to unblock:

1. repository/preview certification;
2. SD-001 physical completion;
3. structured evidence capture; or
4. MESH-DEVICE-001 runtime proof.

---

# Build Order

The committed business-critical sequence after SD-BB-0 is:

1. **Repository + Cloudflare preview gate**
2. **SD-INTEROP-0.1 — platform-neutral capability/adapter contract**
3. **SD-001 prompt-to-Build-Pack run / BB7**
4. **Purchase exact BOM**
5. **Fabricate enclosure**
6. **Assemble + flash**
7. **Physical test**
8. **Capture discrepancies**
9. **Issue corrected SmartDevices revision**
10. **Rebuild/retest until SD-001 acceptance passes**
11. **SD-MVB-001 — external offer/customer validation**
12. **Complete the first external paid/committed Build Pack loop and satisfy MVB**
13. **SD-002 — interoperability proof**
14. **Derive Restaurant Freezer Fleet**
15. **Activate/prove Mesh runtime identity and capabilities**
16. **Pass MESH-DEVICE-001 acceptance**
17. **Progress toward MAB / BB8 Operate**
18. **Only then revisit broad PCB/manufacturing/forking/marketplace expansion when evidence earns it**

---

# Product Principle After SD-001

For major future features ask:

> **Does this make SmartDevices better merely because the underlying AI is good, or does it make SmartDevices better because SmartDevices has been used?**

Prefer capabilities that compound from real SmartDevices usage: validated modules, field outcomes, manufacturing knowledge, device lineage, operating evidence, reliable component substitutions, fleet behavior and permissioned physical-device interoperability.
