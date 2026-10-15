# Architecture and Data Contracts

Decision: ADR-001 with v4.1/v4.2 additive deltas · accepted 2026-08-22; updated 2026-08-26 · `SD41-FND-0.2` / `SD42-FND-0.3`

## Architecture

SmartDevices v4.1 preserves the v4 TypeScript, React 19, Next-compatible App Router/Vinext, CSS token/component, Cloudflare worker, D1/Drizzle, lockfile, and root-deployment model. The additive experience layer uses a typed journey reducer, a versioned JSON question set, pure deterministic scan rules, reusable scene/demo state machines, plan-v2 provenance, and adapter-isolated hosted services.

The architecture was retained after verifying the exact v4.0 RC1 source. It favors direct-route loading, progressive enhancement, no required paid service for public educational value, and explicit failure when hosted capabilities are absent.

## Route contract

| Family | Routes | Boundary |
|---|---|---|
| Explorer | `/`, `/protect/[domain]` | Public; no identity required |
| Intelligence | `/devices`, `/devices/[slug]`, `/compare` | Public, dated editorial evidence |
| Plans | `/plans/[id]` | Public non-sensitive local selection or opaque hosted ID; no PII in URL |
| Carrier guidance | `/insurance`, `/farmers`, `/insurance/farmers` | Public directory/canonical pilot/permanent sanitized alias; no identity required |
| Pro | `/pro`, `/pro/workspace` | Marketing public; workspace requires hosted identity unless explicit local demo flag |
| Evidence administration | `/admin/evidence` | Authenticated evidence-admin grant; dynamic, no-index, server-authorized |
| Institutional | `/about`, `/index`, `/research`, `/partners`, `/privacy`, `/terms`, `/disclosures`, `/accessibility` | Public |
| API | `/api/plans`, `/api/plans/[id]`, `/api/integrations/handoff`, `/api/admin/evidence`, `/api/internal/evidence-refresh` | Size/schema validation, rate-limit contract, capability/identity or scheduler checks, no-store responses |

## State contract

`plan_recommendations` holds system, agent, partner, or template recommendations. `plan_responses` holds source-attributed explicit intent and fulfillment assertions. A view is never intent. `purchased`, `installation-scheduled`, `installed-self-reported`, `evidence-received`, and `verified` are distinct values; consumer capability tokens may only assert `no-action`, `researching`, or `selected`.

Anonymous scan answers stay in an explicitly non-authoritative local draft. A consented hosted scan uses question/option IDs, not free text. Plan v2 stores selected concern IDs, rationale by device, assumptions, and unknowns outside the share URL. Plan v3 may expose only allowlisted, non-sensitive governed carrier/context IDs and public evidence versions in addition to schema version, domain, concern, opaque/local plan ID, and published device IDs. It never exposes raw question/option answers, free text, policy data, exact address, contact data, restricted evidence, or private notes. Plan-v1/v2 URLs remain readable.

Plan transitions are allow-listed in `app/lib/api.ts`; revoked is terminal. Hosted plan IDs and write capabilities use random opaque identifiers. Only a hash of the write capability is stored. Public reads exclude owner subject and capability hash.

## Persistence

Seventeen D1 tables cover the inherited plan, scan, professional, consent, audit, handoff, suppression and rate-limit state plus append-only evidence refresh runs, source observations, publication snapshots, and administrator decisions. Migrations `0000` through additive `0004` are append-only. Database binding name remains `DB`.

## v4.3 evidence publication

The bundled public JSON is the fail-safe baseline. A validated active D1 snapshot may replace catalog/source/rule/fit data at request time for the Device Library, device detail and California Farmers entry journey. Every snapshot has a content hash, sequence, publishing actor, optional source run and immutable payload. Publication supersedes rather than mutates the prior snapshot. Rollback republishes an earlier valid payload as a new active snapshot and records the relationship in audit evidence.

Source retrieval is bounded to allowlisted HTTPS domains, a 12-second timeout and a 1 MB response. Redirect destinations and content types are revalidated. Normalized HTML excludes scripts, styles, comments and markup before SHA-256 comparison. Unchanged sources may renew; changed, baseline, unavailable or invalid observations cannot produce stronger guidance automatically.

## Authorization

The Pro production route reads the server-side authenticated user. Explicit demo mode is enabled only with `SMARTDEVICES_DEMO_MODE=true` and must be false in public production. Plan writes require the authenticated owner or a bearer capability whose stored form is SHA-256 only. Agent-origin recommendations require an authenticated professional. External inbound handoffs require a persistent route limit, timestamped HMAC verification, a five-minute clock window, purpose consent, expiry, bounded/PII-prohibited context, and a unique replay receipt.

## Failure behavior

Unavailable D1, rate-limit salt, signing secrets, communications, or partner services produce explicit 4xx/5xx JSON errors. No adapter returns a fake success. The public local plan continues to work without persistence. Expired/revoked hosted plans return `410`; invalid opaque IDs return `404`.

## Scan and recommendation versions

- Question set: schema version 1, published 2026-08-22.
- Result contract: version 1; concern → protection area → solution class → device options.
- Plan: writes version 3 for carrier-aware provenance; reads versions 1, 2, and 3.
- Handoff: reads/writes version 3 carrier context while accepting governed version 1 and 2 envelopes.
- Demonstrations: exactly `water`, `smoke-heat`, and `vehicle-tracking`; new demos require a typed identifier/config and an explicit concern mapping.

## Vendor isolation

Authentication, persistence, CoverageFit, 408FARMERS, CRM, and communications are contracts/adapters. Business rules and editorial data do not import a vendor SDK. Replacing a service should not change the plan state model.
# v4.2 carrier-neutral additive architecture

Carrier guidance is configuration plus deterministic logic, not a Farmers fork. `content/carriers.json` publishes only discoverable carrier records. Programs and rules reference governed evidence IDs and capability classes. `content/device-carrier-fit.json` overlays technical facts without mutating `content/catalog.json`. `app/lib/carrier.ts` validates cross-references, applies jurisdiction/freshness/visibility gates, and emits only the governed display designations.

Public evidence is bundled only when `visibility=public`, reviewer status is reviewed, and freshness/status are current. A future restricted-evidence adapter must resolve authorization server-side; restricted records are rejected from the public bundle and from exports, analytics, handoffs, and logs.

Plan v3 extends v2 with sanitized carrier provenance while v1/v2 readers remain. Handoff v3 adds only carrier IDs, jurisdiction enum, intent enum, capability IDs, rule/source versions, assertion source, unknown IDs, and literal client intent. Raw answers, PII, policy data, exact address, and restricted material remain prohibited. When browser persistence is unavailable, plan creation uses an in-tab memory copy and the sanitized allowlisted v3 URL as the readable fallback.

D1 remains the durable boundary for hosted plan, consent, replay, audit, and review-event state. v4.2 uses normalized verification events rather than overloading existing fulfillment values. Applied migrations `0000`–`0003` remain immutable and `0003` is additive, so v4.1 reads remain compatible during the rollback window.

Plan routes alone permit same-origin framing so SmartDevices Pro can render the exact client view. Their CSP uses `frame-ancestors 'self'` and `X-Frame-Options: SAMEORIGIN`; every other route retains `frame-ancestors 'none'` and `DENY`. Cross-origin framing remains blocked.

Provider-specific communications, CRM, evidence storage, carrier feeds, and identity remain behind disabled-by-default adapters. Static public data supports the local pilot without inventing hosted services.

# v5.2 Builder additive architecture

`/build` is a second first-class public job beside Protect. It shares the published device catalog but does not import carrier rules into engineering logic. The Builder project model is structured rather than conversational: idea, requirements, answers, capability, safety class, architecture/revision, BOM, firmware source, CAD source, validations, unknowns and portable manifest.

The shared `solution-contract.ts` intentionally separates physical solution type from insurance status. Builder emits `smartdevices-build` + `informational-only`. Carrier-aware statuses remain governed by the carrier evidence pipeline and cannot be inferred from technical capability alone.

Builder remains local/private by default for anonymous use. Authenticated hosted save is now implemented against the additive D1 `builder_projects`/`builder_revisions` boundary, with complete DeviceProject v3 state stored in immutable revision manifests. Live research, sourcing and firmware/CAD execution are separately activated adapters; unavailable services remain explicit rather than simulated. Custom PCB/EDA, manufacturing ordering, compliance and Mesh runtime activation remain later specialist stages.

# v5.3 ecosystem-foundation additive architecture

`SMARTDEVICES-ECOSYSTEM-RECONCILIATION-1.0` generalizes the latest v5.2 source without replacing mature protection, carrier, evidence or Builder systems.

## Four surfaces

- **Discover** uses the existing catalog/device pages and adds canonical capability IDs plus a public Smart Device Object projection.
- **Connect** adds a bounded authenticated registration path and adapter contract. Registration records metadata; it does not prove ownership, verification, identity, reachability, permission or agent control.
- **Create** preserves Builder v5.2 and evolves DeviceProject to schema v4 with normalized required capabilities. Schema-v3 manifests remain readable and are normalized on read.
- **Operate** is intentionally not activated here. Consequential operation will bind to governed authorization/execution primitives instead of treating network reachability as authority.

## Canonical device-domain boundaries

The trust ladder is explicit and sequential:

`discovered → registered → claimed → verified → identified → permissioned → agent-operable → transactional`

The implementation prohibits implicit upward trust transitions. Catalog editorial/source review remains provenance assurance for a model record and does not upgrade the device trust state beyond `discovered`.

Device categories remain a human navigation layer. Normalized capability IDs are the interoperability layer. Unknown catalog labels remain unmapped until a truthful normalized definition is approved.

Mesh participation is optional. A baseline device can be discovered, registered, compared, connected or created without a Mesh identity. Mesh metadata is additive and cannot silently grant permission or execution.

## Device registry persistence

Migration `0007_device_registry_foundation.sql` adds:

- `device_registry_records`
- `device_control_claims`
- `device_integrations`

The registrant/account association is stored as `registrant_subject`; it is intentionally not named as owner. Ownership/control claims live in a separate table with independent status/evidence/revocation fields. Integration credential material is represented only by an optional server-side reference; raw secrets are rejected from the public registration contract.
