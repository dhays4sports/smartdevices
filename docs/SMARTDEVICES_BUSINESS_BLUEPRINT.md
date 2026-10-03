# SmartDevices Business Blueprint

Status: accepted under SD-BB-0 REDESIGN · 2026-10-02

## Business thesis

SmartDevices makes it easier to turn a bounded real-world monitoring/control need into the **simplest trustworthy physical solution**.

It first decides whether the user should **Buy**, **Adapt**, **Build**, or **Research More**. When a custom build is justified, SmartDevices produces a reproducible validated device project rather than a pile of disconnected AI outputs.

## Initial customer

The first paying wedge is:

> **Small commercial/property operators and technically capable solution buyers with bounded monitoring/sensing needs and no dedicated hardware engineering team.**

The wedge is intentionally narrower than the long-term platform.

## Canonical capability

> **Evaluate a physical need and, when custom hardware is justified, produce a reproducible validated device project containing requirements, architecture, sourced parts, executable firmware, physical design, assembly/test instructions, evidence, revisions and integration posture.**

## Durable asset

**SmartDevices Build Evidence Graph**:

`need → requirements → decision → architecture → components → firmware → geometry → build outcome → field outcome → correction → revision`

The graph should improve future decisions even if the underlying foundation model, CAD provider, sourcing provider or PCB tool changes.

## First paid unit

**Validated Build Pack** for supported low-voltage monitoring/sensing classes.

The exact price is an offer-validation decision, not hard-coded by this blueprint.

## Revenue ladder

1. Free Idea Check / Buy-vs-Build
2. Paid Validated Build Pack
3. Optional prototype fulfillment / engineering review
4. Recurring hosted Pro/fleet operations where recurring value exists
5. Manufacturing/marketplace economics only after repeat demand exists

## Distribution

1. Protect and `/farmers` dogfooding/referral of genuine unmet device needs
2. Focused design-partner outreach to commercial/property operators
3. High-intent problem/device research pages
4. Ecosystem/agent adapters after physical proof

## MVB

A real external customer pays or contractually commits to a supported Build Pack; SmartDevices delivers it; the physical device works; discrepancies and interventions are recorded; economics are measured.

## MAB

The supported business loop can increasingly acquire, qualify, research, price, collect, generate, validate, deliver, support, monitor and recover under explicit policy with low routine owner intervention.

## Autonomy target

Owner-light, not ownerless.

Humans remain responsible for safety exceptions, material legal/compliance decisions, capital allocation, provider agreements, extraordinary engineering review and constitutional changes.

## Mesh-readiness plan

Mesh is optional at the device level and strategic at the business/platform level.

Use Mesh primitives when SmartDevices needs governed identity, delegation, reusable workflows, capability discovery, routing, durable execution, economic authorization, receipts, monitoring or recovery.

Do not force Mesh into devices that deliver full value through local or conventional connectivity.

## Anti-displacement posture

Assume generic AI hardware generation improves rapidly.

Do not base defensibility on:

- prompt quality;
- firmware generation;
- schematic generation;
- PCB generation;
- enclosure generation alone.

Base durability on:

- build/field evidence;
- validated reusable design knowledge;
- orchestration across providers;
- project/revision lineage;
- supplier/manufacturing outcomes;
- platform-neutral device capabilities;
- deployed-device/fleet evidence where permitted.

## Immediate sequence

`Preview gate → SD-INTEROP-0.1 → SD-001/BB7 → SD-MVB-001 → MVB → SD-002 → MESH-DEVICE-001 → MAB/BB8`
