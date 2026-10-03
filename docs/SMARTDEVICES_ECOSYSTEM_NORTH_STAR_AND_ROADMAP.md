# SMARTDEVICES-ECOSYSTEM-NORTH-STAR-1.0

Status: Governing strategic direction, implemented as v5.3 ecosystem foundation source candidate  
Adopted: 2026-10-02  
Reconciled by: SMARTDEVICES-ECOSYSTEM-RECONCILIATION-1.0

## North Star

> **SmartDevices.com becomes the open interface for intelligent devices: where humans and agents discover, understand, connect, create, authorize, and operate devices.**
>
> SmartDevices must become more valuable as more intelligent devices are created in the world, regardless of who manufactures them, what hardware they use, or whether they were originally built for the Mesh.
>
> **The Mesh is a capability multiplier, not a prerequisite for participation.**

SmartDevices should not compete with intelligent-device growth. It should compound from it.

## Ecosystem Accretion Principle

Prefer architectures in which a new third-party device creates additional SmartDevices value through one or more of:

- discoverability;
- normalized capabilities;
- compatibility;
- provenance and trust evidence;
- registration and control claims;
- identity;
- permissions;
- agent-readable interfaces;
- execution paths;
- economic authorization and receipts.

For every material product decision ask:

> **Would SmartDevices become more valuable if 10,000 more intelligent devices launched tomorrow?**

## Permanent product surfaces

### DISCOVER

Find and understand intelligent devices. Existing catalog, search, comparison, evidence and device pages remain first-class. Categories remain a human/editorial navigation layer. Normalized capabilities become the interoperability layer.

### CONNECT

Bring in a device a person or organization already owns, operates, manufactures, or builds. Normalize its metadata and declared capabilities without treating registration as proof of ownership, verification, identity, permission, reachability or control.

### CREATE

Start from desired outcome where useful, map intent to required capabilities, compare existing device/integration options, then build only when justified. Preserve category-first paths when they improve usability. Preserve the existing Builder and Build Pack architecture.

### OPERATE

Resolve requester → represented principal → target device → requested capability → authorization → constraints → execution → result → receipt. Deeper execution belongs on governed Mesh rails rather than being reimplemented casually inside SmartDevices.

## Progressive device trust ladder

1. `DISCOVERED`
2. `REGISTERED`
3. `CLAIMED`
4. `VERIFIED`
5. `IDENTIFIED`
6. `PERMISSIONED`
7. `AGENT_OPERABLE`
8. `TRANSACTIONAL`

Hard invariants:

- discovered ≠ registered;
- registered ≠ claimed;
- claimed ≠ verified;
- verified ≠ identified;
- identified ≠ permissioned;
- permissioned ≠ agent-operable;
- agent-operable ≠ transactional.

No weaker state may silently grant a stronger one.

## Canonical Smart Device Object

The v1 canonical object is defined in `app/lib/device-domain.ts` and documented in `SMART_DEVICE_OBJECT_AND_TRUST_MODEL.md`. It represents model or instance identity, normalized capability bindings, connectivity metadata, compatibility, provenance, trust, control, operational readiness and optional Mesh posture.

Public catalog records are model records and remain `discovered` even when their editorial facts are source-reviewed. Editorial review is not physical-instance verification.

## Capability-first model

The current normalized registry is `content/device-capabilities.json`. It intentionally begins with capability classes grounded in the existing SmartDevices catalog and Builder benchmark paths rather than synthetic breadth.

Examples include:

- `measure.temperature`
- `detect.water_leak`
- `shutoff.water`
- `detect.open_close`
- `detect.smoke`
- `track.location`
- `read.vehicle_diagnostics`
- `notify.remote`

Human-readable source labels remain preserved. Unknown/ambiguous source labels remain unnormalized rather than being forced into a false mapping.

## SmartDevices and the Mesh

**SmartDevices must be useful without the Mesh and materially more capable with the Mesh.**

Baseline SmartDevices value may include discovery, cataloging, compatibility, connection contracts, local workflows, Builder projects and non-Mesh device registration.

Mesh may progressively add:

- durable identity;
- mandates;
- fine-grained permissions;
- principal delegation;
- ephemeral credentials;
- capability authorization;
- execution;
- provenance;
- revocation;
- settlement and receipts.

No current SmartDevices registry entry or Builder mode is evidence that a live Mesh runtime, domain binding or production permission service exists.

## device.eth and deviceregistry.org

### deviceregistry.org

Target role: registry/infrastructure boundary for normalized device records, capabilities, compatibility, provenance, trust state, discovery and registration contracts.

The current implementation provides the local SmartDevices registry foundation; it does not claim that `deviceregistry.org` is deployed or authoritative in production.

### device.eth

Target role: optional portable device identity/namespace edge where appropriate.

A `device.eth` association must never itself prove physical ownership, device control, authenticity, safety, verification or authorization. Device identity remains distinct from human, agent, bot and organization identity.

## No-rebuild rule

The recovered SmartDevices v5.2 implementation contains significant mature work beyond GitHub main. v5.3 reconciliation is additive and preserves that work.

Keep or generalize rather than replace:

- visual identity and shell;
- public device intelligence/catalog;
- comparison and evidence/provenance;
- protection/safety experiences;
- `/farmers` and insurance boundaries;
- Pro boundaries and deterministic rules;
- Builder v5.2, hosted projects and Build Packs;
- disabled-by-default external adapters;
- safety/privacy/accessibility/SEO work;
- Business Builder conformance and physical-proof roadmap.

## Strategic boundaries

Do not become:

- a generic gadget ecommerce store;
- a generic AI hardware generator;
- a mandatory Mesh gateway;
- a registry that equates presence with verification;
- an identity layer that equates identity with authority;
- a platform that assumes endpoint reachability is permission;
- a premature marketplace;
- a system that activates consequential physical actions or payments without governed authorization.

## Reconciled roadmap

### Phase 0 — Reconciliation — **implemented in this branch**

Canonical state recovery, KEEP/ELEVATE/GENERALIZE/DEPRECATE/MISSING classification, North Star merge and additive architecture correction.

### Phase 1 — Device Foundation — **newly implemented foundation**

Canonical Smart Device Object, normalized capability registry, explicit trust ladder and additive registry schema.

### Phase 2 — Discover — **substantially existing; elevated here**

Existing catalog/search/filter/compare/evidence/device detail remain. Device detail now exposes normalized capability IDs and a machine-readable canonical API record. Continue improving high-quality device coverage without mass-generating thin pages.

### Phase 3 — Connect — **minimum durable foundation newly implemented**

Authenticated registration API, bounded `/connect` experience, registration schema, adapter contract, registry tables and secret-rejection boundary. No manufacturer integration, live reachability or ownership verification is fabricated.

### Phase 4 — Create — **existing Builder generalized here**

Builder preserves its current workflow but now stores normalized required capability IDs before architecture/BOM generation and uses them when comparing catalog options. DeviceProject schema v4 reads legacy v3 manifests through an additive normalization path.

### Phase 5 — Device Identity — **contract defined / deferred runtime**

Registry and identity roles documented. `device.eth` remains optional. Claim/verification/identity remain separate. No live namespace activation claimed.

### Phase 6 — Agent-ready devices — **foundation only**

Machine-readable capability discovery exists for catalog records. Live authorized agent invocation remains deferred.

### Phase 7 — Permissioned Operation — **deferred to governed Mesh integration**

Do not duplicate mature Mesh primitives. No new consequential device execution is activated by this reconciliation.

### Phase 8 — Transactional Devices — **deferred**

Preserve architectural path to authorization → execution → settlement → receipt; no real money is activated.

### Phase 9 — Ecosystem — **deferred**

Manufacturers, developers, fleets, templates, agents and marketplace dynamics follow only after registry/capability/trust/permission foundations prove useful.

## Long-term compounding asset

The device capability graph:

> **Devices × Identities × Capabilities × Integrations × Permissions × Agents × Executions × Receipts**

This is a relationship model, not a requirement to introduce a graph database. Continue using the current storage model until query/scale evidence justifies something else.

## Implementation status vocabulary

Every document/UI claim must distinguish:

- North Star / planned;
- contract defined;
- prototype;
- locally verified;
- hosted;
- production active;
- externally verified/certified.

Roadmap existence never upgrades runtime status.
