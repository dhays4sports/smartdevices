# SD-BB-0 — SmartDevices Business Builder Conformance

Status: **REDESIGN — proceed under the revised business plan**  
Date: 2026-10-02  
Business: SmartDevices.com  
Baseline: SmartDevices v5.2.0-rc.1 + SD-001 documentation addendum  
Constitutional source: Mesh Commercial North Star / Build Businesses on Mesh

## Purpose

SmartDevices is a first-party business and therefore must pass through the same Business Builder discipline intended for external users. It does not receive privileged protocol semantics merely because it is owned, operated, or developed alongside The Mesh.

This record runs SmartDevices through:

`BB0 Intake → BBE Eligibility → BB1 Evaluation → BB2 Design → BB3 Governance → BB4 Autonomy → BB5 Mesh Mapping → BB6 Build Plan`

The outcome is intentionally allowed to be `GO`, `REDESIGN`, or `NO-GO`.

## Executive decision

**REDESIGN.**

SmartDevices remains worth building, but the business must be narrowed and sequenced differently before further platform expansion.

The surviving thesis is:

> **SmartDevices turns a bounded physical monitoring/control need into the simplest trustworthy solution path: buy an existing product when one already fits, adapt an existing design when that is sufficient, or produce a validated build/deployment package when custom hardware is justified.**

The business is **not**:

- a generic AI hardware generator;
- a smart-home-only builder;
- an ESP32 coding assistant;
- a PCB-generation company;
- a mandatory Mesh device factory;
- a marketplace before buyer/seller liquidity exists;
- a hardware manufacturer by default.

The first commercial wedge is deliberately narrower than the eventual platform:

> **Bounded monitoring and sensing problems for small commercial/property operators and technically capable solution buyers who need a low-volume intelligent device but do not have an in-house hardware team.**

Initial examples include temperature, leak, door/contact, environmental and similar low-voltage monitoring. The initial wedge is selected because the customer outcome is measurable, the technical risk is bounded, existing-device research can often save the customer from unnecessary custom work, and multi-device deployments later create a legitimate reason for interoperability and Mesh identity.

Smart-home and `/farmers` protection flows remain valuable acquisition/dogfooding surfaces, but they do not define the Builder business.

---

# BB0 — Intake

## Asset inventory

SmartDevices enters Business Builder with more than an idea:

- category-defining `SmartDevices.com` domain and independent brand;
- a source-linked device catalog and protection/recommendation engine;
- the canonical `/farmers` California carrier flow with explicit insurance truth boundaries;
- Builder v5.2 requirements/research/architecture/BOM/firmware/CAD/Build Pack contracts;
- hosted DeviceProject/revision foundations;
- fail-closed sourcing, research and Build Executor adapter contracts;
- standalone / connected / Mesh-ready / Mesh-native architecture states;
- safety gates and explicit blocked/review-required device classes;
- SD-001 physical-proof program;
- existing evidence, provenance, security, privacy and external-activation ledgers.

## Owner objective

Create a business that:

1. delivers real physical-device outcomes rather than generated-code novelty;
2. can charge for a clear unit of value;
3. improves from real build/deployment evidence;
4. can increasingly operate with low routine owner attention;
5. remains useful as foundation models become better at code/CAD/electronics generation;
6. can use Mesh rails when identity, permissions, capability discovery or multi-agent operation create real value.

## Hard constraints

- Research before invention.
- No false claim that a generated design is validated when the physical check did not run.
- No custom device can silently satisfy an insurance requirement.
- V1 stays within bounded low-voltage device classes.
- High-risk physical functions remain blocked or require qualified engineering review.
- The customer must be able to export their project artifacts; no mandatory platform lock-in.
- Mesh remains optional unless the use case actually needs it.
- No marketplace or mass-manufacturing expansion merely because those features look strategically attractive.

---

# BBE — Eligibility

## Eligibility result

**ELIGIBLE WITH REDESIGN CONDITIONS.**

SmartDevices passes the basic eligibility test because:

- the physical problem is real and repeatable;
- the platform can deliver value before asking for contact or payment by deciding Buy / Adapt / Build;
- there is a bounded initial technical scope;
- a clear paid deliverable can exist;
- the business can accumulate proprietary operational evidence from real builds;
- routine work can eventually be automated while keeping hazardous/material decisions human-governed;
- the exact-match domain, existing protection product and device evidence system provide assets beyond a greenfield AI wrapper.

It does **not** receive an unconditional `GO` because four business elements are not yet proven:

1. initial paying customer wedge;
2. first revenue unit and willingness to pay;
3. repeatable distribution outside founder-driven outreach;
4. low-intervention fulfillment economics.

Those are now explicit MVB gates rather than assumptions.

---

# BB1 — Evaluation

## Problem

Creating a useful custom connected device remains fragmented across:

- requirements definition;
- deciding whether a commercial product already solves the problem;
- architecture/component research;
- sourcing and substitutions;
- firmware;
- mechanical design;
- compilation/geometry execution;
- assembly;
- test and validation;
- deployment/integration;
- revision management.

The opportunity is not that AI can generate each artifact individually. The opportunity is to make the **whole physical outcome** coherent, portable, evidence-backed and progressively easier to reproduce.

## Customer

### Initial paying wedge

**Primary:** small commercial/property operators and technically capable solution buyers with bounded monitoring/sensing needs and no dedicated hardware engineering team.

Examples:

- a restaurant group needing unusual freezer monitoring behavior;
- a property operator with a sensing gap not well covered by an existing product;
- a small business needing a low-volume environmental/contact monitor;
- an integrator or technical operator who can assemble/deploy from a validated Build Pack but does not want to design the system from scratch.

### Secondary / acquisition audiences

- homeowners and insurance/protection users through Protect and `/farmers`;
- makers and prosumers;
- founders/product creators prototyping a physical idea;
- Home Assistant / open-device users;
- agent-platform users seeking a physical endpoint.

Secondary audiences must not cause V1 to become a generic “build anything” product.

## Canonical capability

> **Given a bounded physical need, determine the best Buy / Adapt / Build path and, when Build is justified, produce a reproducible validated device project containing requirements, architecture, sourced parts, executable firmware, physical design, assembly/test instructions, evidence, revisions and integration posture.**

This is the business capability. Individual firmware/CAD/PCB generation tools are replaceable implementation providers.

## Durable asset

The durable asset is the **SmartDevices Build Evidence Graph**, not the generated code alone.

It should accumulate relationships among:

`need → requirements → buy/adapt/build decision → architecture → parts → firmware → geometry → build evidence → field evidence → failures → substitutions → corrections → later outcomes`

Compounding assets include:

- validated component/module combinations;
- mechanical clearances and enclosure outcomes;
- real assembly-time distributions;
- firmware/library compatibility history;
- observed power and battery behavior;
- supplier/substitution outcomes;
- design lineage and revision evidence;
- device capability definitions and adapter mappings;
- field/fleet behavior where customers explicitly permit it;
- evidence that particular requests are better solved by an existing product.

The exact-match domain, catalog/evidence corpus and independent SmartDevices brand are supporting assets, not substitutes for the evidence flywheel.

## AI-displacement analysis

### High-risk / commoditizing layers

Current market evidence already shows rapid commoditization of several primitive layers:

- Flux exposes live PCB projects through MCP and lets external AI clients collaborate on real board design.
- CELUS turns plain-language requirements into matched components, schematics and BOMs with supply-chain context.
- Circuit Mind automates architecture-to-schematic/BOM and engineering analysis.
- ESPHome's Device Builder lowers the barrier to configuring, compiling and installing microcontroller devices without traditional firmware development.
- JLCPCB exposes APIs for PCB and 3D-printing sourcing/manufacturing workflows.

Therefore SmartDevices must **not** depend on superior generic code, PCB or configuration generation as its durable advantage.

### AI-durable layer

SmartDevices becomes more durable when the value depends on:

- physical validation history;
- build/field evidence;
- multi-tool orchestration;
- portable project lineage;
- cross-platform capability abstractions;
- supplier/manufacturing outcomes;
- customer-specific constraints and actual deployment evidence;
- governed physical-device identity/permissions where Mesh is useful.

### Competitive posture

Integrate specialist systems where they are better than rebuilding them. SmartDevices owns the outcome and evidence model; providers may own portions of EDA, firmware tooling, sourcing, manufacturing or agent connectivity.

## Distribution

The initial distribution plan has four lanes, sequenced rather than launched simultaneously:

1. **First-party dogfooding / Protect referrals** — use SmartDevices Protect and `/farmers` to expose genuine unmet device needs without implying custom builds satisfy insurance requirements.
2. **Focused operator outreach** — recruit a small design-partner cohort of restaurant/property/small-business operators with bounded monitoring problems; do not target generic consumers initially.
3. **High-intent organic discovery** — publish source/evidence-backed device/problem pages that can end in Buy / Adapt / Build rather than generic content marketing.
4. **Ecosystem adapters** — after SD-001, make supported projects interoperable with established ecosystems instead of competing with them. Home Assistant/ESPHome-class integration and external agent adapters are distribution channels as well as technical features.

Founder-led outreach is acceptable for MVB validation but must be measured separately from durable acquisition.

## Revenue model

### First paid unit

**Validated Build Pack** — a per-project paid deliverable for supported device classes.

A paid Build Pack must contain the reproducible project artifacts and validation evidence promised for its tier. It may include human review when explicitly labeled; hidden founder engineering is not acceptable as “automation.”

### Revenue ladder

1. **Free Idea Check / Buy-vs-Build decision** — acquisition and trust.
2. **Paid Validated Build Pack** — first commercial unit.
3. **Prototype fulfillment / engineering review** — optional service fee or margin after the Build Pack path is physically proven.
4. **Hosted Pro / fleet operations** — recurring revenue only when users have recurring project/fleet value.
5. **Manufacturing and marketplace economics** — deferred until repeat volume/liquidity exists.

Do not make a subscription the default for a naturally project-based need merely to create MRR.

---

# BB2 — Business Design

## Product architecture

SmartDevices remains one platform with two jobs:

### Protect / Discover

Purpose: identify a physical protection/monitoring need and determine whether an existing product or specialized program is the right answer.

Commercial role: trust, acquisition, research corpus and real problem discovery.

### Build

Purpose: turn a justified unmet need into a reproducible physical-device project.

Commercial role: paid Build Pack and later prototype/deployment services.

### Operate (later)

Purpose: manage deployed project/fleet state and integrations where recurring operational value exists.

Commercial role: later recurring Pro/fleet revenue; not required for the first paid transaction.

## MVB — Minimum Viable Business

SmartDevices reaches MVB only when all of the following occur with a real external customer or design partner:

1. A customer submits a supported physical monitoring need.
2. SmartDevices completes eligibility and Buy / Adapt / Build research.
3. The customer chooses a clearly priced paid Build outcome.
4. Payment/authorization is recorded through an approved payment path.
5. SmartDevices delivers a Build Pack whose promised validation actually ran.
6. The customer or declared fulfillment partner builds the device.
7. The device performs the promised bounded function.
8. Material discrepancies are captured and corrected in project lineage.
9. The customer receives a receipt/delivery record.
10. Owner intervention time and gross margin are measured.

**SD-001 is the technical BB7 prerequisite to this MVB, not the MVB itself.**

## MAB — Minimum Autonomous Business

SmartDevices reaches MAB when the supported Build Pack business can routinely:

`ACQUIRE → QUALIFY → RESEARCH → PRICE → COLLECT → GENERATE → EXECUTE VALIDATION → DELIVER → SUPPORT → MONITOR → RECOVER`

within explicit policy, while humans remain responsible for:

- safety/engineering-review exceptions;
- material legal/compliance decisions;
- capital allocation and vendor contracts;
- policy/price changes outside approved bounds;
- irreversible or high-value manufacturing commitments without an approved mandate;
- constitutional changes.

MAB is a business-operating milestone, not a claim that physical engineering becomes ownerless.

---

# BB3 — Governance

The following are constitutional business invariants:

1. **Evidence before claims.** “Validated,” “compiled,” “fits,” “available,” “priced,” “Mesh-integrated,” or “insurance-compatible” require the specific evidence appropriate to the claim.
2. **Research before invention.** A suitable commercial product can be the correct result.
3. **Safety before autonomy.** Blocked/review-required device classes do not become autonomously buildable because a model is confident.
4. **Permission before consequential action.** Supplier orders, manufacturing orders, external messages and value movement require explicit authorization or a bounded mandate.
5. **Portable ownership.** The user can export Build Pack/source artifacts; SmartDevices is not mandatory hosting.
6. **Provider truth.** External research/sourcing/execution providers fail closed; unavailable providers do not create synthetic success.
7. **Insurance independence.** A custom build does not create carrier qualification.
8. **No hidden manual fulfillment.** Human engineering/support must be logged as intervention and reflected in economics.
9. **No forced Mesh.** Mesh is used only when identity/permissions/interoperability create actual value.
10. **No premature marketplace.** Marketplace/network features require demonstrated supply/demand, not strategy-deck appeal.

---

# BB4 — Autonomy

## Operating-function map

| Function | MVB posture | MAB target |
|---|---|---|
| Acquire | Founder/organic/Protect-assisted | Repeatable organic/partner/agent channels |
| Qualify | Builder eligibility + human exception | Policy-scoped autonomous qualification |
| Research | Automated with evidence; human exception | Automated refresh + provider recovery |
| Price | Fixed/approved supported tiers | Policy-bounded quoting |
| Collect | Explicit customer checkout | Automated collection within approved offer |
| Generate | Automated | Automated |
| Validate | Real compiler/CAD/build evidence; physical proof may be human | Automated digital gates + structured physical evidence intake |
| Deliver | Automated Build Pack | Automated with receipts/version lineage |
| Support | Human-backed initially | AI triage + escalation |
| Monitor | Project/run health | Business + provider + fleet monitoring |
| Recover | Manual operator | Policy-scoped retries/fallbacks/escalation |
| Maintain | Human-led component/catalog updates | Evidence-driven refresh with approval thresholds |

## Metrics

Beginning with SD-001 and all MVB design partners, track:

- Owner Intervention Hours;
- Intervention Rate = human-requiring events / completed business operations;
- Autonomous Gross Profit Efficiency = gross profit / owner intervention hours;
- time from request to Buy / Adapt / Build decision;
- time from paid Build to validated delivery;
- Build Pack rebuild success rate;
- number of hidden/manual engineering steps discovered;
- correction/revision count;
- support minutes per completed project;
- gross margin by supported build class;
- percent of requests correctly redirected to an existing commercial product.

### MAB operating targets

Targets are internal gates, not marketing claims:

- at least 80% of routine supported-project workflow events complete without owner intervention;
- median owner intervention for an in-scope repeat Build Pack is 20 minutes or less, excluding explicitly sold engineering review;
- every paid delivery has a machine-readable project/validation/receipt record;
- routine provider failures have bounded retry/fallback/escalation behavior;
- no safety or payment authority is expanded merely to hit the autonomy target.

These targets should be revised from actual MVB evidence rather than defended if reality disagrees.

---

# BB5 — Mesh Mapping

SmartDevices should dogfood Mesh primitives **without making Mesh a prerequisite for the MVB**.

## Business-level mapping

| Business need | Mesh primitive when mature/useful |
|---|---|
| Business/service identity | Passport / identity |
| Customer delegates an allowed action | Permissions + Mandate |
| Reusable Build workflow | PCM |
| Build/research/sourcing/execution capability | Capability Provider |
| Choose among executors/suppliers | Routing |
| Consequential run | Durable execution |
| Payment/manufacturing authorization | Economic authorization |
| Paid Build delivery | Receipt |
| Provider/project health | Monitoring |
| Failure/retry/escalation | Recovery |

## Machine-consumable SmartDevices capabilities

Candidate capability families, subject to Mesh protocol review rather than privileged first-party semantics:

- `device.solution.evaluate`
- `device.build.plan`
- `device.build.validate`
- `device.artifacts.retrieve`
- `device.project.status`
- later: `device.prototype.quote`
- later: `device.fleet.status`

## Physical-device mapping

Standalone and conventional connected devices do not need Mesh identity.

Mesh-ready/native projects may later use Mesh for:

- persistent device identity;
- capability discovery;
- permissioned state/actions;
- events;
- fleet discovery;
- agent coordination;
- receipts/evidence around consequential commands.

`MESH-DEVICE-001` remains a valid proof program, but it **must not block the MVB**. It moves after the first paid business loop or runs as a parallel Mesh-infrastructure track once SD-001 is proven.

---

# BB6 — Revised Build Plan

## Gate 1 — Repository / preview certification

Preserve the existing v5.2 preview gate. No production promotion until source/build/runtime and `/farmers` regressions pass.

## Gate 2 — SD-INTEROP-0.1 (small architecture patch)

Add platform-neutral device capability/event contracts and adapter boundaries. Do **not** build a large Muse/Home Assistant integration program yet.

Definition of done: core sensing/actuation semantics do not depend on a particular AI/platform transport.

## Gate 3 — SD-001 / BB7 Build & Verify

Physically build the Connected Freezer Guardian from SmartDevices output.

SD-001 is now explicitly the **BB7 technical proof**.

It must create the first Build Evidence Ledger and expose hidden engineering work.

## Gate 4 — SD-MVB-001 Offer + Customer Validation

Before MESH-DEVICE-001 becomes the primary product milestone:

- recruit a small design-partner cohort in the chosen commercial/property monitoring wedge;
- run real Buy / Adapt / Build requests;
- present the paid Validated Build Pack offer;
- record rejection reasons and willingness-to-pay signals;
- complete at least one real paid or contractually committed external Build Pack engagement before declaring MVB;
- measure owner intervention and gross economics honestly.

A founder self-purchase does not count as MVB revenue.

## Gate 5 — MVB

Deliver the complete paid loop defined above for a supported external customer.

This is the point at which SmartDevices becomes a proven business rather than only a technically compelling platform.

## Gate 6 — SD-002 Interoperability Proof

Use the proven hardware/project model to demonstrate that canonical device capabilities survive translation across more than one supported environment. Adapter work should reuse, not fork, core device semantics.

## Gate 7 — MESH-DEVICE-001

Prove persistent identity/capabilities/authorization on multiple real physical nodes. This validates the Mesh relationship but does not retroactively define every SmartDevices device as Mesh-native.

## Gate 8 — MAB / BB8 Operate

Automate the supported business loop, monitor intervention/economics and introduce recurring fleet/Pro operations only where customers exhibit recurring value.

## Deferred until evidence earns them

- broad custom PCB automation as a first-party core;
- one-click mass manufacturing;
- creator marketplace;
- social/community network features;
- broad consumer “build anything” scope;
- generalized Mesh requirements;
- speculative token/economic layers;
- subscription packaging unsupported by recurring use.

---

# Decision record

## Final BB0–BB6 outcome

**REDESIGN — CONTINUE.**

### Keep

- SmartDevices Builder;
- Protect + Build architecture;
- research-before-invention;
- physical Build Evidence Graph;
- SD-001 physical proof;
- platform-neutral/Mesh-ready architecture;
- `/farmers` as a governed specialized Protect program;
- portable Build Pack philosophy.

### Change

- narrow the first paying customer wedge;
- define Validated Build Pack as the first paid unit;
- treat distribution and willingness-to-pay as explicit gates;
- measure owner intervention/economics from the beginning;
- move MVB before MESH-DEVICE-001 in the critical business path;
- treat generic firmware/CAD/PCB generation as replaceable provider capability;
- make physical build/field evidence the durable asset.

### Stop / defer

- generic gadget-builder expansion;
- marketplace-first strategy;
- broad manufacturing automation before repeat demand;
- Mesh complexity where ordinary connectivity suffices;
- feature work that does not help SD-001, MVB, evidence compounding or business autonomy.

---

# Market evidence snapshot — 2026-10-02

This snapshot exists to ground the AI-displacement and integration strategy. It is not a permanent competitive ranking.

- Flux MCP Server: https://docs.flux.ai/reference/flux-mcp-server
- Flux 2026 MCP update: https://www.flux.ai/p/blog/summer-2026-updates-flux-mcp-server-and-chat-mode
- CELUS Design Platform: https://www.celus.io/
- Circuit Mind: https://www.circuitmind.io/
- ESPHome Device Builder: https://esphome.io/install/
- Home Assistant ESPHome integration: https://www.home-assistant.io/integrations/esphome
- JLCPCB API: https://jlcpcb.com/help/article/jlcpcb-online-api-available-now
- Muse Gadgets ecosystem discovery: https://gadgets.muse.ai/

The conclusion drawn from these sources is architectural rather than competitive theater: **the component-generation layer is getting stronger quickly, so SmartDevices must compound from real physical outcomes and orchestration rather than depend on proprietary access to generic AI generation.**
