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
| Institutional | `/about`, `/index`, `/research`, `/partners`, `/privacy`, `/terms`, `/disclosures`, `/accessibility` | Public |
| API | `/api/plans`, `/api/plans/[id]`, `/api/integrations/handoff` | Size/schema validation, rate-limit contract, capability/identity checks, no-store responses |

## State contract

`plan_recommendations` holds system, agent, partner, or template recommendations. `plan_responses` holds source-attributed explicit intent and fulfillment assertions. A view is never intent. `purchased`, `installation-scheduled`, `installed-self-reported`, `evidence-received`, and `verified` are distinct values; consumer capability tokens may only assert `no-action`, `researching`, or `selected`.

Anonymous scan answers stay in an explicitly non-authoritative local draft. A consented hosted scan uses question/option IDs, not free text. Plan v2 stores selected concern IDs, rationale by device, assumptions, and unknowns outside the share URL. Plan v3 may expose only allowlisted, non-sensitive governed carrier/context IDs and public evidence versions in addition to schema version, domain, concern, opaque/local plan ID, and published device IDs. It never exposes raw question/option answers, free text, policy data, exact address, contact data, restricted evidence, or private notes. Plan-v1/v2 URLs remain readable.

Plan transitions are allow-listed in `app/lib/api.ts`; revoked is terminal. Hosted plan IDs and write capabilities use random opaque identifiers. Only a hash of the write capability is stored. Public reads exclude owner subject and capability hash.

## Persistence

Thirteen D1 tables cover plans, recommendations, responses, scan sessions/responses, professional profiles, PII-free templates, consent events, audit events, handoff replay receipts, suppression, rate limiting, and normalized plan-verification events. Migrations `0000` through additive `0003` are append-only. Database binding name remains `DB`.

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
