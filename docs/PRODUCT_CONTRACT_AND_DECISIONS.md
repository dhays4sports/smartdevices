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
