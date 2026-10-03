# SMARTDEVICES-ECOSYSTEM-NORTH-STAR-1.0

Status: Governing strategic direction
Adopted: 2026-10-02
Scope: SmartDevices.com product, architecture, roadmap, registry, device identity, Mesh integration, and future ecosystem work
Implementation note: This document defines direction and constraints. It does **not** claim that every capability described below is already implemented.

## 1. North Star

> **SmartDevices.com becomes the open interface for intelligent devices: where humans and agents discover, understand, connect, create, authorize, and operate devices.**
>
> SmartDevices must become **more valuable as more intelligent devices are created in the world, regardless of who manufactures them, what hardware they use, or whether they were originally built for the Mesh.**
>
> Third-party device growth should expand the SmartDevices ecosystem rather than compete with it.
>
> **The Mesh is a capability multiplier, not a prerequisite for participation.**

The strategic objective is not to win every hardware category. The objective is to become more useful as the intelligent-device category expands.

## 2. Ecosystem Accretion Principle

SmartDevices should prefer architectures in which external innovation compounds platform value.

A new third-party device should create an opportunity to add one or more of:

- discoverability;
- structured capability metadata;
- compatibility data;
- device identity;
- ownership or control claims;
- trust and verification evidence;
- permissions;
- agent-readable interfaces;
- execution paths;
- economic transactions;
- receipts and provenance.

A feature should be questioned when its value depends on SmartDevices manufacturing, owning, or replacing the underlying device ecosystem.

### Architectural test

For major product decisions, ask:

> **Does this make SmartDevices more valuable when someone else creates another intelligent device?**

If yes, it likely reinforces the North Star.

## 3. Permanent product surfaces

SmartDevices should converge around four durable product surfaces.

### DISCOVER

Answer:

- What intelligent devices exist?
- What can they actually do?
- What do they connect to?
- What requirements or constraints apply?
- What evidence supports those claims?
- Are they agent-ready or Mesh-ready?

Discovery is not merely ecommerce or affiliate cataloging. It is structured device intelligence.

### CONNECT

Answer:

- How can a device someone already owns, operates, manufactures, or builds be brought into SmartDevices?
- How are its interfaces and capabilities normalized?
- Who controls it?
- What trust state has been established?

Future connection paths may include manufacturer integrations, APIs, local/network protocols, developer SDKs, custom hardware, and manual registration.

### CREATE

Answer:

- What does the user want a device or device system to do?
- What capabilities are required?
- What hardware, software, integrations, permissions, and deployment steps satisfy that intent?

The existing SmartDevices builder should be generalized rather than discarded.

Long-term, creation should increasingly begin from **desired capability or outcome**, not merely device category.

### OPERATE

Answer:

- Who is requesting an action?
- For whom?
- Against which device?
- Using what capability?
- Under what permission or mandate?
- Within what constraints?
- With what revocation, provenance, execution evidence, and receipt?

Operation is where deeper Mesh primitives become most valuable.

## 4. Progressive device trust ladder

SmartDevices must not collapse discovery, registration, identity, verification, trust, or authority into one state.

Canonical progression:

1. **Discovered** — SmartDevices knows the device/model exists.
2. **Registered** — a normalized device record exists.
3. **Claimed** — a person or organization has asserted control/ownership.
4. **Verified** — relevant claims have supporting evidence or attestation.
5. **Identified** — the device has a durable identity/namespace relationship.
6. **Permissioned** — authorized principals and allowed capabilities are bounded.
7. **Agent-operable** — authorized agents can invoke supported capabilities.
8. **Transactional** — economic actions can be authorized, settled, and receipted.

These states are intentionally non-equivalent.

A device being present in the registry does not mean SmartDevices has verified it.
A device having identity does not mean an actor is authorized to control it.
Agent accessibility does not imply unrestricted autonomy.

## 5. Capability-first device model

Device categories remain useful for navigation, editorial organization, compatibility, and human comprehension, but core interoperability should increasingly model devices by capabilities.

A canonical Smart Device Object should be able to represent, over time:

- device identity;
- manufacturer;
- model;
- class/category;
- ownership/control claim;
- interfaces;
- capabilities;
- current state where appropriate;
- connectivity;
- compatibility;
- trust state;
- verification/attestation provenance;
- permissions;
- endpoints;
- Mesh readiness;
- economic capability where applicable.

Capabilities should be separable from a specific piece of hardware whenever practical.

This enables humans and agents to ask for **what needs to be done** rather than requiring prior knowledge of which device category performs it.

## 6. SmartDevices and the Mesh

### Rule

**SmartDevices must be useful without the Mesh and materially more capable with the Mesh.**

The Mesh is not an admission requirement.

SmartDevices may provide discovery, device intelligence, cataloging, compatibility, connection, local workflows, and creation experiences without Mesh participation.

Mesh integration can progressively add:

- durable identity;
- mandates;
- fine-grained permissions;
- agent authorization;
- execution boundaries;
- ephemeral credentials;
- settlement;
- receipts;
- provenance;
- revocation;
- economic coordination.

The preferred relationship is:

```
SmartDevices
  -> Device Registry
  -> Device Identity
  -> Capabilities
  -> Permissions / Mandates
  -> Execution
  -> Settlement / Receipts
```

This is a progressive stack, not an all-or-nothing dependency.

## 7. device.eth and deviceregistry.org role

The device edge should remain distinct from human, organization, agent, or bot identity.

### deviceregistry.org

Target role:

- registry/infrastructure boundary;
- normalized device records;
- capability metadata;
- provenance;
- trust state;
- compatibility;
- discoverability.

### device.eth

Target role:

- portable device identity/namespace edge where appropriate;
- durable addressing or identity association;
- linkage into wider identity and authorization architecture.

Neither should imply that devices, humans, agents, organizations, and bots are identical actors.

## 8. Physical-world execution principle

SmartDevices should become a bridge from AI knowing and suggesting into **authorized physical-world action**.

Potential capability classes include:

- sense;
- measure;
- detect;
- monitor;
- communicate;
- record;
- unlock;
- shut off;
- charge;
- dispense;
- move;
- manufacture;
- deliver;
- meter;
- replenish.

Physical-world actions may carry safety, financial, privacy, property, or regulatory consequences.

Accordingly, operation must preserve human authority, bounded permissions, revocation, provenance, explicit execution semantics, and fail-closed behavior where required.

## 9. Strategic boundaries

### No generic gadget-store trap

SmartDevices should not collapse into an Amazon-style product catalog.

Commerce may exist, but discovery should serve device intelligence, interoperability, creation, connection, and operation.

### No premature hardware-company trap

SmartDevices does not need to manufacture the devices it indexes or enables.

Build hardware only when a specific proof, vertical, reference implementation, or strategic wedge justifies it.

### No Mesh-only trap

Do not require third-party devices to become Mesh-native before they can be useful on SmartDevices.

### No trust-state collapse

Do not equate registered, claimed, verified, identified, permissioned, agent-operable, or transactional states.

### No autonomy-by-default

A device or agent gaining technical reachability does not create authority to act.

## 10. Existing work to preserve

The ecosystem direction is additive.

Preserve and reconcile, rather than discard:

- existing SmartDevices builder work;
- `/farmers` and its specialized vertical flow;
- device templates;
- capability definitions;
- device projects/build packs;
- existing device intelligence/catalog work;
- protection and safety experiences;
- Mesh integrations;
- permission/mandate work;
- receipts/settlement concepts;
- device identity work;
- `device.eth`;
- `deviceregistry.org`;
- institutional/research/Index positioning;
- existing security, provenance, evidence, and fail-closed boundaries.

Specialized vertical experiences should become evidence that the generalized platform can produce purpose-built device workflows.

## 11. NO REBUILD rule

> **Do not restart SmartDevices from the ground up merely because the strategic abstraction has improved.**

Before architectural implementation of this North Star:

1. audit the actual current canonical repository/source state;
2. classify existing implementation as:
   - **KEEP**
   - **ELEVATE**
   - **GENERALIZE**
   - **DEPRECATE**
   - **MISSING**
3. identify assumptions that conflict with the North Star;
4. preserve working systems;
5. generalize incrementally;
6. add new primitives only where they are genuinely missing;
7. run regressions after every meaningful reconciliation step.

Do not discard mature work merely to produce a cleaner conceptual rewrite.

## 12. Reconciliation audit requirements

The first implementation mandate after adoption must inspect for assumptions that:

- every device must be Mesh-native;
- SmartDevices manufactures or owns devices;
- the builder is the entire product;
- smart-home devices are the primary device universe;
- categories define capabilities;
- registration implies verification;
- identity implies authorization;
- reachability implies permission;
- agent access implies unrestricted execution;
- a marketplace must precede underlying capability/identity infrastructure.

The audit must also identify current implementations that already satisfy the new direction.

## 13. Roadmap

### Phase 0 — Reconciliation

Audit current canonical state.

Produce a KEEP / ELEVATE / GENERALIZE / DEPRECATE / MISSING map.

Do not begin with a rewrite.

### Phase 1 — Device Foundation

Define the canonical Smart Device Object and capability model.

Separate:

- discovery;
- registration;
- claim;
- verification;
- identity;
- permission;
- operation;
- transaction.

### Phase 2 — Discover

Build toward a structured intelligent-device index.

Device records should increasingly expose:

- capabilities;
- connectivity;
- compatibility;
- evidence/provenance;
- trust state;
- agent readiness;
- Mesh readiness.

The system should gain value whenever third parties release useful devices.

### Phase 3 — Connect

Create a durable Add/Connect Device path.

Normalize external devices and custom hardware into the canonical device/capability model.

Begin with the integration paths most useful to actual product proofs; avoid speculative breadth.

### Phase 4 — Create

Generalize the current builder.

Move progressively from:

> Choose a device.

toward:

> What do you want something to do?

Translate desired outcome into:

- capabilities;
- compatible hardware/software;
- integrations;
- permissions;
- deployment requirements.

Preserve specialized vertical templates, including `/farmers`.

### Phase 5 — Device Identity

Integrate the device registry and identity model.

Maintain explicit separation among:

discovered -> registered -> claimed -> verified -> identified.

Do not let identity silently imply authorization.

### Phase 6 — Agent-Ready Devices

Expose normalized machine-readable capabilities.

Enable authorized agents to discover devices by capability and constraints rather than only by brand/category.

Examples:

- find a charger compatible with a vehicle and allowed payment method;
- find all freezer sensors an operator is authorized to inspect;
- locate devices that can perform a required action within a defined mandate.

### Phase 7 — Permissioned Operation

Introduce deeper Mesh authorization/execution primitives where valuable.

Before execution, resolve:

- requester;
- represented principal;
- target device;
- requested capability;
- mandate/permission;
- constraints;
- revocation state;
- execution semantics.

### Phase 8 — Transactional Devices

For economically meaningful actions, support a path such as:

```
Mandate
  -> Capability
  -> Authorization
  -> Execution
  -> Settlement
  -> Receipt
```

Potential examples include charging, dispensing, renting, metering, selling, delivering, or replenishing.

No real-money or autonomous production execution is implied by this roadmap phase.

### Phase 9 — Ecosystem

Only after the underlying primitives are sound should SmartDevices expand deeply into ecosystem/marketplace dynamics.

Possible participants:

- manufacturers publishing devices;
- developers publishing integrations/capabilities;
- builders publishing templates;
- businesses operating fleets;
- agents consuming authorized capabilities;
- SmartDevices aggregating structured discovery and operational intelligence.

Marketplace behavior should emerge from infrastructure usefulness rather than become the product's premature center.

## 14. Long-term compounding asset

The strategic moat to accumulate is not merely traffic, a domain, a builder, or a product catalog.

SmartDevices should progressively build a device capability graph:

> **Devices × Identities × Capabilities × Integrations × Permissions × Agents × Executions × Receipts**

The graph should become more useful as intelligent-device diversity and adoption increase.

## 15. Product decision test

Major roadmap proposals should be tested against these questions:

1. Does this increase ecosystem accretion?
2. Does it preserve usefulness without requiring Mesh adoption?
3. Does Mesh integration add real capability rather than branding?
4. Does it separate identity, trust, permission, and execution?
5. Does it make third-party devices easier to understand, connect, create around, or operate?
6. Does it preserve human authority for consequential actions?
7. Does it reuse existing SmartDevices work where possible?
8. Does it avoid prematurely becoming a hardware company or generic marketplace?
9. Does it strengthen the device capability graph?
10. Would SmartDevices become more valuable if 10,000 more intelligent devices launched tomorrow?

## 16. Implementation status convention

Future documentation and UI must distinguish:

- **North Star / planned**
- **contract defined**
- **prototype**
- **locally verified**
- **hosted**
- **production active**
- **externally verified/certified**

No roadmap statement in this document should be treated as evidence that a capability is live.

---

## Canonical summary

**SmartDevices should not compete with the growth of intelligent devices. It should compound from it.**

The builder remains important.
The device intelligence layer remains important.
Verticals such as `/farmers` remain important.
The Mesh remains important.

But they now fit inside a larger structure:

**DISCOVER -> CONNECT -> CREATE -> OPERATE**

with progressive device identity, trust, permissions, execution, settlement, and receipts underneath.

That is the governing direction for SmartDevices ecosystem work.

## Reconciliation 1.1 implementation pointer

The original strategic mandate above is retained in full. Current implementation and recovery evidence are in `ECOSYSTEM_RECOVERY_LEDGER_1_1.md`, `ECOSYSTEM_RECONCILIATION_MATRIX.md`, and `ECOSYSTEM_RECONCILIATION_VERIFICATION.md`. A roadmap phase is not a claim of runtime activation. Connect metadata registration exists; claim verification, identity activation, device operation and settlement remain separate future work.
