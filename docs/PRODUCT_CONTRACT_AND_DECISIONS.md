# Product Contract and Decision Ledger

| ID | Decision | Reason | Status |
|---|---|---|---|
| PD-001 | Start with domain and concern, not a product grid | Creates value before identity and keeps recommendations contextual | Accepted |
| PD-002 | Use Home and Vehicle as full guides; Family and Business as transparent starters | Preserves category breadth without pretending the seed evidence is equally deep | Accepted |
| PD-003 | Limit plan recommendations to five; usual UI target two to three | Supports prioritization and avoids an affiliate-shopping feel | Accepted |
| PD-004 | Use a Protection Map, never a score | Avoids pseudo-scientific precision | Accepted |
| PD-005 | Treat scene motion as explanatory, pausable, and reducible | Motion illustrates cause/detect/respond rather than decoration | Accepted |
| PD-006 | Separate editorial status from commercial status | Sponsorship cannot become evidence or ranking authority | Accepted |
| PD-007 | Keep product facts source-linked and dated | Current product and insurance facts change | Accepted |
| PD-008 | Store no client PII in templates or plan URLs | Reduces disclosure and handoff risk | Accepted |
| PD-009 | Model recommendation, intent, purchase, installation, evidence, and verification independently | Prevents false funnel or risk claims | Accepted |
| PD-010 | Make hosted integrations disabled by default | Missing credentials must not weaken security or fabricate delivery | Accepted |
| PD-011 | Retain SmartDevices.com as the primary brand in co-branded work | Insurance is an operating wedge, not ownership or permanent scope | Accepted |
| PD-012 | Serve source imagery directly in the root package | Preview revealed an unavailable transform binding; direct assets remove a paid/runtime dependency | Accepted after rendered QA |
| PD-013 | Concentrate full v4.1 interaction on Home and Vehicle | Creates a complete, defensible experience without false Family/Business parity | Accepted · SD41-FND-0.2 |
| PD-014 | Use a typed journey reducer and pure scan rules | Makes rapid switching, direct routes, recovery, and explanation deterministic | Accepted · SD41-FND-0.2 |
| PD-015 | Persist hosted scan context in D1; keep anonymous drafts explicitly local-only | Durable consented continuity requires platform storage while anonymous exploration should remain value-first | Accepted · SD41-FND-0.2 |
| PD-016 | Preserve v1 plan and handoff readers while writing v2 provenance | Avoids breaking existing links and integrations | Accepted · SD41-FND-0.2 |
| PD-017 | Use existing scene imagery with functional semantic overlays | Preserves the premium visual baseline while motion explains cause and effect | Accepted · SD41-FND-0.2 |
| PD-018 | Ship exactly water, smoke/heat, and vehicle-tracking demonstrations | These scenarios express the operating wedge without expanding into decorative motion | Accepted · SD41-FND-0.2 |
| PD-019 | Put compact Home/Vehicle/Family/Business shortcuts beside the primary first-viewport action while retaining the full chooser | Fixed-desktop visual QA showed the categories below the fold; the correction satisfies immediate choice without removing guided context | Accepted · SD41-QA-9.2 |
| PD-020 | Use SVG/CSS-like semantic geometry and narrated state machines, not heavy 3D | Preserves cause/effect clarity, loading reliability, reduced motion, and low-power viability | Accepted · SD41-DEMO-4.1 |
| PD-021 | Keep scene photography below the guided entry and lazy-load it with reserved geometry | The first useful action should not wait for cinematic assets | Accepted · SD41-QA-9.4 |
| PD-022 | Pause explanatory motion whenever the document becomes hidden | Prevents unseen progress and preserves user control after backgrounding | Accepted · SD41-QA-9.4 |
| PD-023 | Leave consent-policy and retention values blank until owner/legal approval | Invented operational defaults would create false compliance state | Accepted · SD41-QA-9.5 |
| PD-024 | Treat Git commits as the reproducible per-sprint v4.1 source checkpoints | Preserves genuine historical states without generating mislabeled duplicate ZIPs; release gates alone receive final packages | Accepted · SD41-FND-0.3 |
| PD-025 | Declare local RC readiness separately from public cutover readiness | Physical browsers, valid CWV, hosted D1, identity, providers, legal identity, and live partner tests are genuine external boundaries | Accepted · SD41-CERT-10.3 |

## Vocabulary

- Recommendation: an option presented by SmartDevices, an agent, a partner, or a template.
- Intent: a client’s explicit, revisable statement about a recommendation.
- Fulfillment: a separately asserted operational state.
- Verified: evidence reviewed under an authorized process; never inferred from an agent note.
- Viewed: a route opened; not interest, purchase, installation, or verification.
- Editorial: selected under the published research method.
- Affiliate/sponsored: a commercial relationship that must be labeled independently.

## v4.2 carrier vocabulary and decisions

| ID | Decision | Reason | Status |
|---|---|---|---|
| PD-026 | Use `/farmers` as the only canonical California Farmers path; `/insurance/farmers` permanently redirects | Gives consumers the simple requested destination without creating duplicate indexed content | Accepted · SD42-FND-0.2 |
| PD-027 | Keep carrier program/rule/applicability records outside generic device facts | Technical relevance and insurance treatment are independent, differently governed claims | Accepted · SD42-FND-0.2 |
| PD-028 | Publish Farmers as text only until trademark/brand authorization exists | Avoids implying ownership, endorsement, certification, or partnership | Accepted · SD42-FND-0.2 |
| PD-029 | Scope governed carrier evidence to California in this pilot; other states receive generic guidance | Public evidence is jurisdiction-sensitive and must not be generalized | Accepted · SD42-FND-0.2 |
| PD-030 | Use seven explicit carrier designations and reject universal approval/requirement/savings language in tests | Makes truth-state boundaries executable instead of editorial memory | Accepted · SD42-FND-0.2 |
| PD-031 | Define v4.2 theme aliases centrally and set explicit foregrounds on every dark carrier surface | Rendered QA found undefined aliases and a dark-on-dark directory card that source inspection did not expose | Accepted after SD42-QA-9.2 correction |
| PD-032 | Carry only allowlisted governed carrier/public-evidence identifiers in a v3 plan URL | Preserves carrier provenance when local storage or client-side navigation is unavailable without exposing raw answers, PII, policy data, free text, or restricted evidence | Accepted after SD42-QA-9.2 correction |
| PD-033 | Permit same-origin framing only for `/plans/*`; deny framing everywhere else | Enables the exact SmartDevices Pro client preview while preserving cross-origin clickjacking protection | Accepted after SD42-QA-9.2 correction |
| PD-034 | Use a full-page plan transition after carrier-plan generation | The completed result has no unsaved follow-on state, and a direct URL transition avoids insecure-local Web Crypto/RSC limitations while remaining robust on production HTTPS | Accepted after SD42-QA-9.2 correction |

Carrier means a governed insurance organization record. Program means a jurisdiction-scoped public or restricted guidance collection. Rule means a versioned carrier statement linked to evidence. Device class means a technical capability definition. Device fit means a separate technical relationship between a catalog record and a class. Requirement assertion means a literal consumer- or professional-supplied statement, never carrier verification. Potential discount category means a current carrier source names the class but does not establish case eligibility or savings. Public offer means a current carrier-controlled source names an offering in the shown scope. SmartDevices recommendation means independent editorial guidance. Confirmation needed means evidence, scope, currency, or client context is incomplete or conflicting.


## v5 Business Builder conformance decisions

| ID | Decision | Reason | Status |
|---|---|---|---|
| PD-035 | Treat SmartDevices as a first-party Business Builder dogfood business with no privileged semantics | The Business Builder constitution explicitly requires first-party products to prove the same architecture intended for external users | Accepted · SD-BB-0 |
| PD-036 | SD-BB-0 outcome is REDESIGN — continue, not unconditional GO | Core capability is credible, but customer wedge, paid unit, distribution, intervention economics and business sequencing require proof | Accepted · SD-BB-0 |
| PD-037 | Use bounded commercial/property monitoring buyers as the first paying Builder wedge | Higher-value measurable problems and later fleet/interoperability needs provide a stronger initial business than generic hobby gadget generation | Accepted as MVB hypothesis · validate with customers |
| PD-038 | Make the Validated Build Pack the first paid unit | It matches the naturally project-based need and avoids inventing subscription recurrence before recurring customer value exists | Accepted as offer hypothesis · validate price/willingness to pay |
| PD-039 | Define the SmartDevices Build Evidence Graph as the durable asset | Generic code/CAD/PCB generation is rapidly commoditizing; physical build/field outcomes and lineage compound from SmartDevices usage | Accepted · SD-BB-0 |
| PD-040 | Classify SD-001 as BB7 Build & Verify, not MVB | A founder-built internal prototype proves technical delivery but not an external revenue loop | Accepted · SD-BB-0 |
| PD-041 | Require SD-MVB-001 and at least one external paid or contractually committed supported Build Pack before declaring MVB | Prevents technical progress from being mislabeled as business validation | Accepted · SD-BB-0 |
| PD-042 | MESH-DEVICE-001 does not block MVB | Mesh is strategically useful but business validation should precede optional infrastructure expansion on the critical path | Accepted · SD-BB-0 |
| PD-043 | Track Owner Intervention Hours, Intervention Rate, Autonomous Gross Profit Efficiency and per-build economics from SD-001 onward | The constitutional target is an owner-light trustworthy business, not merely revenue or feature count | Accepted · SD-BB-0 |
| PD-044 | Integrate specialist hardware/EDA/sourcing/manufacturing systems rather than treating their primitive capabilities as the moat | Current market tools already automate PCB, schematic, firmware/device configuration and sourcing layers | Accepted · SD-BB-0 |

## v5.3 ecosystem reconciliation decisions

| ID | Decision | Reason | Status |
|---|---|---|---|
| PD-045 | Treat the v5.2 SD-BB-0 source artifact as the canonical implementation baseline rather than old GitHub main | It contains materially newer Builder, evidence, protection and business-governance work | Accepted · ECOSYSTEM-RECONCILIATION-1.0 |
| PD-046 | Preserve DISCOVER/Protect/Builder/Farmers and generalize underneath them | The North Star is additive; mature truth/safety boundaries should not be rewritten | Accepted |
| PD-047 | Make normalized capabilities a core interoperability layer while retaining categories for human navigation | Third-party devices should add value without forcing users to think in protocol jargon | Accepted |
| PD-048 | Keep catalog editorial verification distinct from device trust state | Source review of a model does not prove instance ownership, identity or authorization | Accepted |
| PD-049 | Require sequential explicit evidence for upward trust-state transitions | Registration, connectivity and identity must never silently grant stronger authority | Accepted |
| PD-050 | Store registration attribution as registrant, not owner | Account association is not proof of physical ownership/control | Accepted |
| PD-051 | Keep Mesh participation optional at baseline | SmartDevices must create independent value while Mesh adds identity/authorization/execution capabilities | Accepted |
| PD-052 | Implement Connect as bounded registration + adapter contracts before broad integrations | Establishes durable normalization without fabricating manufacturer/device connectivity | Accepted |
| PD-053 | Defer consequential Operate and transactional activation | Network reachability is not permission; mature Mesh authorization should be reused when operation is justified | Accepted |
| PD-054 | Keep device.eth and deviceregistry.org as explicit identity/registry boundaries, not proof mechanisms | Namespace/registry presence cannot prove ownership, safety, authenticity or authorization | Accepted |
