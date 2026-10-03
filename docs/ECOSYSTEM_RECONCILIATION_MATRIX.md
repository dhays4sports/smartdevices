# Ecosystem Reconciliation Matrix

| Area | Current v5.2 state at audit | Classification | Reconciliation action |
|---|---|---|---|
| Visual identity / shell | Mature | KEEP | Preserve |
| Device catalog | 15 high-quality source-linked records | KEEP / ELEVATE | Preserve catalog; add canonical capability projection |
| Device detail | Source-linked facts and carrier relevance | ELEVATE | Add trust/capability projection + machine-readable record |
| Search/filter/compare | Existing | KEEP / ELEVATE | Search canonical capability IDs without removing categories |
| Evidence/provenance | Mature v4.x architecture | KEEP | Reuse; do not conflate editorial review with device trust |
| SEO/indexing | Existing | KEEP | Preserve device indexing; keep private registration/API surfaces out of sitemap/robots exposure |
| Builder v5.2 | Strong idea→requirements→research→architecture→BOM/firmware/CAD path | GENERALIZE | Add normalized required capabilities; preserve existing workflow |
| Build Pack | Existing portable artifact | ELEVATE | Add capability requirements to pack |
| `/farmers` | Mature flagship vertical | KEEP | Preserve behavior and truth boundaries |
| Insurance status | Explicitly separated from custom builds | KEEP | No custom-build qualification escalation |
| Standalone/connected/Mesh modes | Existing | KEEP / CLARIFY | Mesh remains optional; modes do not imply runtime activation |
| Connect / external device onboarding | Missing | MISSING | Add bounded registration contract, API, UI, adapter interface and additive registry schema |
| Canonical Smart Device Object | Partial across catalog/Builder types | GENERALIZE | Add explicit model/instance domain object |
| Capability registry | Human labels only | GENERALIZE | Add normalized capability IDs grounded in current devices/builds |
| Trust ladder | Missing as device-domain primitive | MISSING | Add explicit 8-state ladder and no-implicit-escalation invariant |
| Ownership/control claims | Missing | MISSING foundation | Separate table/contract; no claim UI or verification yet |
| Device verification | Missing | KEEP DEFERRED | Do not infer from registration or editorial review |
| Device identity | Builder Mesh metadata only | ELEVATE / DEFER | Define registry↔identity boundary; no live namespace claim |
| `device.eth` | Governance concept only | KEEP DEFERRED | Optional identity namespace edge; never ownership proof |
| `deviceregistry.org` | Governance concept only | ELEVATE / DEFER deployment | Registry role documented; current SmartDevices DB is local foundation only |
| Device adapters | Builder external-service patterns exist | GENERALIZE | Add device adapter contract; no fake live integrations |
| Agent operation | No production device-control rail | KEEP DEFERRED | Bind future operation to Mesh authorization/execution |
| Permissions/mandates | Belong to Mesh | KEEP DEFERRED | Do not duplicate inside SmartDevices |
| Receipts/settlement | Handoff/economic concepts exist elsewhere | KEEP DEFERRED | No device transaction activation |
| Marketplace | Not core | KEEP DEFERRED | Do not build before registry/capability/trust foundations |
| Device capability graph | Conceptual | ELEVATE | Make relationships explicit through normalized records; no graph DB migration |
| Smart-home assumption | Historic Protect emphasis | GENERALIZE | Canonical object/category strings no longer limited to `DomainId` |
| Builder-as-whole-product assumption | v5 introduced second job but not whole ecosystem | GENERALIZE | Reframe as CREATE surface within Discover/Connect/Create/Operate |
