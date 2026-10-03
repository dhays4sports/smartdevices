# Security, Privacy, Dependency, and Content Certification

Gate: `SD41-QA-9.5` · local result: **PASS WITH EXTERNAL LEGAL/OPERATIONS ACTIVATION OPEN** · 2026-08-22 UTC

## Security controls reviewed

- Pro production boundary is server-side; demo requires an explicit environment flag.
- Hosted plan IDs are opaque random values; write capabilities are returned once and stored only as SHA-256 hashes.
- JSON requests require content type, object shape, and a 16 KB maximum; domains, concerns, device IDs, origins, intent, fulfillment, and transitions are allow-listed.
- Consumer credentials cannot assert purchase, installation, evidence, or verification.
- Plan and inbound partner routes use persistent salted address hashes and fail closed in production when the salt is missing.
- External handoffs require purpose-bound consent, expiry, canonical HMAC-SHA256, a five-minute timestamp window, and unique replay receipt.
- Responses use `Cache-Control: no-store`; public plan reads exclude owner and write-token hash.
- Audit, suppression, consent, and retention contracts are separate tables/configuration. No deletion or retention job is represented as active until the owner provisions and rehearses it.
- No credentials, live partner endpoints, invented policy version, or invented retention period are shipped. `.env.local` is ignored and excluded from packages; `.env.example` contains activation names and disabled/blank values only.

## Reproducible checks

| Check | Result | Disposition |
|---|---|---|
| TypeScript / ESLint | Pass | No errors. |
| Security/schema/Pro contract tests | Pass | 12/12 focused checks after two recorded test-pattern corrections. |
| `npm audit --omit=dev --audit-level=high` | Pass | 0 known production vulnerabilities. |
| Private-key/API-token pattern scan, source + built output | Pass | 0 matching files outside excluded dependencies/visual evidence. |
| Placeholder endpoint scan, authored source | Pass | 0 authored-source matches. |
| Placeholder endpoint scan, built output | Reviewed | Two Vinext/React framework bundles contain generic `localhost`/`example.com` URL-parser and error-message literals; no application adapter reads or exposes them as an endpoint. |
| Forbidden outcome/insurance/score language | Pass | 12 language and scan-rule tests. |
| External handoff route limit | Corrected | Persistent 120/minute partner-ingress window added before signature verification; deployed tuning remains an operations task. |

## Privacy review

Public exploration requires no identity. Scan prompts/options request no exact address, VIN, plate, birth date, policy number, claim number, email, or phone. Local selection URLs contain only schema version, domain, concern, and published device IDs. Pro templates contain no client PII. Analytics events are fixed enums/IDs with no free-text field. Contact collection appears after the completed plan and is explicitly local/not sent until communications activation. Production administration must implement access, correction, deletion, withdrawal, retention jobs, and suppression before collection.

## Content/compliance review

Fifteen records have primary-source URLs and a 2026-08-22 review date. No carrier-specific benefit is asserted. No safety, prevention, recovery, eligibility, discount, approval, claim, or installation outcome is promised. Editorial/commercial status is separate; all release records are editorial with no commercial relationship activated.

## Secret/dependency/legal limits

The inherited production audit found four high advisories and blocked release. Next was updated from 16.2.6 to 16.3.2; the v4.1 audit still reports zero known production vulnerabilities. Public deployment still needs owner/controller identity, jurisdiction-specific privacy/terms review, an accessibility contact, carrier-program review if any is added, incident contacts, key rotation, D1 access/deletion/retention jobs, suppression delivery, and external penetration/abuse testing. This document is local engineering evidence, not external legal or security certification.

## v4.2 carrier-pilot security and privacy review — 2026-08-26

- Forty-four focused security, authorization, plan, handoff, rate-limit, privacy, and carrier-boundary tests passed. The production Pro route fails closed without an authenticated professional grant; the temporary local demo flag used for inspection was removed before the production-lock rerun.
- Pro receives only the published, current public-evidence projection. Restricted evidence is not present in public bundles, routes, plans, exports, analytics, or client logs.
- Plan v3 share URLs contain only validated, allowlisted governed IDs for carrier, jurisdiction, entry, capabilities, assertions, rules, sources, and device-fit records. Raw responses, free text, policy/customer identifiers, exact locations, contact data, and restricted evidence are excluded.
- Plan routes permit same-origin framing for the exact SmartDevices Pro preview. All other routes deny framing, and cross-origin framing remains blocked by both CSP and `X-Frame-Options`.
- Handoff v3 retains HMAC verification, bounded clocks and expiry, purpose consent, payload limits, recursive sensitive-key rejection, replay prevention, persistent rate limiting, audit events, and v1/v2 readers.
- Recommendation, selection, purchase-self-report, installation scheduling/self-report, evidence receipt, professional review, and carrier determination remain distinct authorities and events. A consumer cannot create professional or carrier verification.
- Evidence-upload storage remains disabled until authenticated storage, malware scanning, authorization, retention, deletion, and audit operations are activated.
- Only `.env.example` is tracked. The repository and built-output private-key/API-token scan found zero matches outside excluded dependencies and preserved test fixtures.
- `npm audit --omit=dev` reports zero production vulnerabilities. The full development audit reports 46 transitive build/test advisories (3 low, 7 moderate, 36 high, 0 critical); several direct toolchain paths offer no compatible automatic fix, so no unsafe forced upgrade was applied.

External penetration/abuse testing, legal/privacy approval, named operations ownership, production identity, secret rotation, retention/deletion jobs, and incident-response activation remain external cutover gates. No external security, legal, carrier, or privacy certification is claimed.

## v5.3 device-registration boundary

The Connect registration validator recursively rejects credential-like keys (`password`, `secret`, `token`, API-key, authorization, cookie, bearer and credential variants). Public/machine-readable catalog records contain capability/connectivity metadata only. Future live integrations must keep raw device credentials server-side and expose only bounded references. Registration, claim, verification, identity, permission, reachability and agent operation remain distinct states.
