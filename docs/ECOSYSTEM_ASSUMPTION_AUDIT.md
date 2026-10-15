# Ecosystem Assumption Audit

Mandate: SMARTDEVICES-ECOSYSTEM-RECONCILIATION-1.0  
Audit baseline: v5.2 SD-BB-0 canonical source candidate

| Assumption audited | Finding | Classification | Resolution |
|---|---|---|---|
| Every SmartDevices device must be Mesh-native | False in v5.2; Builder already supported standalone/connected/Mesh-ready/Mesh-native, but Mesh vocabulary was more explicit than generic device registry vocabulary | Already compatible / clarify | Preserve modes; canonical Smart Device Object makes `mesh.participation = optional` |
| SmartDevices manufactures or owns devices | No core catalog ownership claim found; Builder can design custom devices | Already compatible / clarify | Registry model separates registrant, ownership/control claim and manufacturer; docs prohibit manufacturer/ownership inference |
| SmartDevices is primarily smart-home | Historical protection UX is Home/Vehicle-heavy; Builder v5.2 already broadened physical-device scope | Requires generalization | Capability registry and generic category strings are not limited to protection domains; no mature Home/Vehicle UX removed |
| Builder is the whole product | v5 Builder is prominent but catalog, Protect, Farmers, plans and Pro remain substantial | Requires clarification | Builder becomes CREATE within DISCOVER → CONNECT → CREATE → OPERATE |
| Categories define capabilities | Catalog used human capability labels and category/concern metadata; no canonical machine capability registry existed | Requires generalization | Add normalized capability IDs while retaining categories for navigation/editorial use |
| Product listing equals device identity | Catalog `Device` records represent products/models, not physical instances | Already compatible but implicit | Canonical projection explicitly uses `recordKind=model`, trust `discovered`, no identity/permission |
| Registration implies verification | No prior general registration path existed | Missing invariant | New registration creates exactly `registered` + `unclaimed`; tests prohibit escalation |
| Verification implies ownership | Editorial `verified` previously meant source-reviewed content and could be confused with device verification | Requires clarification | Rename semantics in canonical projection to `editorialAssurance=source-reviewed`; trust remains `discovered` |
| Identity implies authorization | v5.2 Mesh docs already warned against runtime implication | Already compatible / formalize | Trust ladder separates `identified` from `permissioned`; operation deferred |
| Reachability implies permission | No production device-control rail existed | Missing invariant | `connectable` remains false for a declared registration; adapter reachability cannot grant permission |
| Technical agent ability implies authorization | No production device-control path existed; Mesh intent already governed | Already compatible / formalize | Operate model requires explicit principal/capability/authorization/constraints/execution/receipt |
| SmartDevices should become generic ecommerce | Existing catalog is editorial/protection-led, not transactional store | Already compatible | Commerce stays subordinate; marketplace deferred |
| Marketplace should precede registry/capabilities | No marketplace was core | Already compatible | Roadmap explicitly sequences ecosystem after normalization/trust/permission primitives |
| Mesh must succeed before SmartDevices has value | Existing catalog, protection and Builder already work independently | Already compatible | Mesh remains optional capability multiplier |
| `/farmers` is legacy baggage | False; it is a mature specialized vertical with independent truth/evidence rules | Already compatible / elevate | Preserve as flagship proof of vertical composition over generalized device intelligence |
| device.eth proves ownership/control | Runtime integration absent; governance concept only | Requires explicit boundary | Identity doc states namespace association is not ownership, control, authenticity, safety or authorization proof |
| deviceregistry.org is already live/authoritative | No runtime deployment found | Requires status correction | Mark contract/local foundation only; external deployment deferred |

## Result

No assumption required a rebuild. The material gaps were normalization and semantic separation, addressed through additive device-domain/capability/Connect contracts and migration `0007` while preserving mature surfaces.
