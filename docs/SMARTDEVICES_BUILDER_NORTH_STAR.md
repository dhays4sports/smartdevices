# SmartDevices Builder — North Star

Status: accepted product direction · refined 2026-09-16

## Business Builder constitutional status

SmartDevices is a first-party dogfood business under the Mesh Business Builder constitution. As of 2026-10-02, `SD-BB-0` produced **REDESIGN — continue**. The product North Star below remains valid, but the business critical path is now:

`Preview gate → SD-INTEROP-0.1 → SD-001 / BB7 → SD-MVB-001 → MVB → SD-002 → MESH-DEVICE-001 → MAB / BB8`

`MESH-DEVICE-001` is a valuable interoperability/rails proof but no longer blocks proving the Minimum Viable Business. See `SD-BB-0_BUSINESS_BUILDER_CONFORMANCE.md`.

## The promise

**SmartDevices is the creation and deployment platform for intelligent physical devices.**

Describe the physical outcome you need. SmartDevices researches whether an existing product already fits, then determines the safest practical way to build, connect and operate a new device when custom hardware is justified.

Smart home is a use case, not the product boundary. Builder may serve homes, businesses, commercial property, facilities, logistics, agriculture, creators and other non-hazardous physical environments.

## The two public jobs

1. **Protect** — understand a home/vehicle/family/business protection need, compare existing devices, and use specialized programs such as `/farmers` when carrier context matters.
2. **Build** — convert an unmet physical-device need into an engineering project: requirements, intelligence architecture, parts, firmware, physical design, validation, prototype and eventually manufacturing/deployment.

The shared rule is **research before invention**. Builder should recommend an existing suitable product when that is the simpler answer.

## Intelligence is a first-class architecture decision

Every DeviceProject has one operating mode:

- **Standalone** — physical intelligence without network identity; local sensing/control is enough.
- **Connected** — ordinary Wi-Fi/Bluetooth connectivity, telemetry or alerts; Mesh is optional.
- **Mesh-ready** — the first prototype does not require Mesh runtime, but stable identity, telemetry/events and command boundaries are kept separable so domain-bound Mesh integration can be added without redesigning the device.
- **Mesh-native** — persistent identity, discovery, permissions, fleet/agent interaction and domain binding are part of the intended operating model. The current Builder may design for this mode without claiming that runtime integration is active.

Mesh is **not an admission ticket**. A simple useful sensor should not be burdened with domain binding or agent infrastructure when that adds no value.

## SmartDevices ↔ The Mesh

SmartDevices owns the physical-device lifecycle:

`Idea → Research → Requirements → Build → Validate → Manufacture → Deploy → Maintain`

The Mesh owns the interoperable identity/orchestration layer:

`Identity → Discovery → Permissions → Capabilities → Events/Commands → Agent coordination`

They meet when a SmartDevices project becomes Mesh-ready or Mesh-native. A physical device can then become a persistent participant in an agentic web rather than ending its lifecycle at assembly.

## V1 scope

V1 remains deliberately constrained to low-voltage sensors, monitors and simple connected physical tools assembled from a curated component library. This is a safety and reliability constraint, not a statement that SmartDevices is a smart-home-only product.

The long-term loop is:

`Idea → Research → Requirements → Intelligence Architecture → Electronics → Firmware → CAD → Validation → Prototype → Manufacture → Deploy → Identity/Operate → Iterate`

## Revision model

- **R0 — Proof of concept:** off-the-shelf modules, breadboard, prove the core behavior.
- **R1 — Functional prototype:** module-based electronics, durable assembly, usable enclosure, test procedure.
- **R2 — Engineered prototype:** custom PCB/manufacturing direction, specialist review required.
- **R3 — Production candidate:** DFM, supply chain, production test and applicable compliance path.

## Insurance boundary

`/farmers` remains a specialized insurance-aware Protect program. `/build` is carrier-neutral technical prototyping. The two may exchange a problem statement, but never exchange truth states implicitly.

A Builder device that reduces risk is **not** thereby carrier-required, carrier-approved, qualifying, discount-eligible, verified or compliant.

## Long-term object

The long-term SmartDevices object is an executable physical design with lineage and an operating identity posture. A device can be private/public, forkable, revised, manufactured and—when useful—deployed as a Mesh node with persistent identity and explicit capabilities.

## Immediate proof milestone — SD-001

The accepted next execution gate after v5.2 is **SD-001 — First Physical Proof**, followed by **MESH-DEVICE-001 — First Physical Node**.

SmartDevices should not broaden into marketplace, generalized manufacturing, or speculative network features before the core physical loop has been proven with a real device. The first proof device is the Connected Freezer Guardian; the first Mesh proof derives a Restaurant Freezer Fleet from that validated architecture.

The governing plan, evidence ledger, scope-control rule and acceptance criteria live in `docs/SD001_FIRST_PHYSICAL_PROOF_AND_MESH_NODE_PLAN.md`.
