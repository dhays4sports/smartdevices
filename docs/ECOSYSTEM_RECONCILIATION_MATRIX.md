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

## 1.1 recovery corrections and evidence

| Area | Classification | Current evidence / disposition |
|---|---|---|
| Prior reconciliation | KEEP | PR #2 is the parent. Registration UI/API/store and Builder schema v4 retained. |
| Original governance | KEEP | Full PR #1 North Star restored rather than its shortened PR #2 paraphrase. |
| Market / ecosystem | KEEP DEFERRED | Restore SD-MKT-0.9 code, six tables, source-linked catalog updates and tests from 71f59e3. Existing flags remain off; no marketplace launch. |
| Storage/schema | ELEVATE | Preserve registry 0007 and market 0007–0011 SQL unchanged; reconcile journal/snapshot and rehearse both upgrade histories. |
| Security/privacy | ELEVATE | Strict registration allowlists, text/list bounds, same-origin streamed JSON limit, private tenant-scoped reads, sanitized errors. |
| APIs / developer interface | ELEVATE | Existing /api/capabilities and /api/devices/[slug] preserved; /api/devices adds validated capability/slug queries over public models only. |
| Search/filter | ELEVATE | Restore explicit capability selector alongside existing category/search/compare/plan flow. |
| Device model/trust | GENERALIZE | Add independent evidence facts to existing compatible public object; legacy state is a summary, not authority. |
| Connectivity/control | KEEP DEFERRED | Probe adapter remains disabled; operation request boundary always blocks. No connectivity metadata grants control. |
| Permission/mandates/execution | MISSING runtime / DEFERRED | Explicit request contract reserves represented principal, device/capability, mandate, permission, expiry, nonce, approval and execution count. Mesh owns deeper execution integration. |
| Receipts/settlement | KEEP DEFERRED | Market and build receipts retained; never reused as authority to operate or spend. |
| Identity/device.eth/deviceregistry.org | ELEVATE contract / DEFERRED activation | Existing role docs retained. Namespace declarations never establish ownership, verification or authorization. |
| Builder/project/build packs | KEEP / GENERALIZE | v3 reads normalize into v4; capability matching and requirements retained; machine-readable design-only capability manifest added. |
| Evidence freshness | ELEVATE | Validator now defaults to execution date, not frozen August 26. Stale source findings remain honest. |
| SEO | KEEP / ELEVATE | Public details retained; Connect, Operate and private projects noindex; private API never appears in public catalog. |
| Operate surface | MISSING → foundation | Restored /operate explains inactive control/settlement boundary without pretending to offer live actions. |
| Metadata-only local Connect variant | SUPERSEDED | Not used: would remove the more complete PR #2 registration implementation. |
| Local alternative capability vocabulary | SUPERSEDED | Preserve published registry IDs (notify.remote, measure.illuminance), avoiding incompatible parallel vocabularies. |
| Unsupported readiness claims | DEPRECATE | Mesh/fleet design hints and trust-rank helper are never evidence of activated runtime. |
