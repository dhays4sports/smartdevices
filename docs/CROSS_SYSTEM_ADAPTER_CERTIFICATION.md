# v4.2 Cross-System and Adapter Certification

Run date: 2026-08-26 UTC  
Gate: SD42-CERT-10.2  
Disposition: Pass against local contracts and test doubles; no live partner, carrier, CRM, or communications certification is claimed

## Certified local contract

- Handoff readers accept v1 and v2 and add v3 carrier context without repeating valid, purpose-consented answers.
- V3 transports only bounded stable IDs and versions: carrier, jurisdiction, entry intent, capabilities, public rule/source pairs, assertion source, unknown IDs, and literal client intent.
- Invalid carrier, jurisdiction, capability, version, signature shape, timestamp, consent, expiry, destination, payload, nested sensitive key, and unversioned carrier context fail closed.
- External ingress uses source-specific HMAC-SHA256 secrets, a five-minute clock window, 8 KB payload cap, replay receipt, persistent rate limit, and a minimal audit event. The audit event contains only opaque handoff/object IDs, source/destination, purpose, and time; it excludes the handoff payload and signature.
- The local memory test double is idempotent. Delivery changes `generated` to `shared-by-adapter` only after adapter acceptance. Views do not create intent or fulfillment. Suppression, revocation, expiry, and missing consent fail closed.
- A bounded delivery-timeout wrapper returns the literal `PLAN_DELIVERY_TIMEOUT` failure and leaves engagement at `generated`.
- CoverageFit, 408FARMERS, CRM, communications, evidence upload, analytics, and outbound partner adapters are disabled unless separately configured and authorized. No live call or message occurred during this gate.
- A test-only second carrier proves that registry, route, scan, plan, Pro template, and handoff behavior are generic without creating a public page.

## Reproducible evidence

| Suite | Result |
|---|---|
| Handoff/carrier freshness/applicability/Pro authorization and engagement | 25 focused TypeScript tests passed |
| Runtime/security/operator contract | 14 JavaScript tests passed |
| Endpoint behavior | Unauthenticated handoff rejected; missing persistence and disabled providers return explicit unavailable states |

## Exact partner activation script

1. Create non-client v1, v2, and v3 fixtures with documented expected field authority and unknowns. Never use production PII for activation testing.
2. Exchange separate 32-byte-or-stronger signing secrets for CoverageFit and 408FARMERS through an approved secret channel; bind them only server-side and set a high-entropy rate-limit hash salt.
3. Configure one staging direction at a time. Keep the opposite direction and every unrelated provider disabled.
4. Sign `unixTimestamp + "." + canonicalJson(envelope)` with HMAC-SHA256; send the 8 KB-or-smaller envelope with the documented timestamp/signature headers.
5. Prove accepted, invalid signature, timestamp outside five minutes, expired, consentless, oversized, prohibited nested field, replay, rate-limit, missing/stale carrier rule, unsupported jurisdiction, suppressed, revoked, provider-timeout, and provider-rejection cases.
6. Inspect browser bundles, application logs, analytics, database receipts, and audit events for secrets, raw answers, policy/address/contact fields, restricted evidence, and full payloads; expected count is zero.
7. Prove zero-repeat restoration for the consented fields and re-prompt only when scope is invalid, missing, stale, conflicting, or purpose changes.
8. Exercise suppression, retention, access, deletion, secret rotation, incident, retry/idempotency, kill switch, and rollback runbooks. Confirm that a view remains only a view.
9. Record endpoint/TLS configuration, fixture hashes, request/response evidence, operator/reviewer, timestamps, defects, and rollback result. Obtain privacy/security/partner owner approval before production enablement.

Activation rollback is to disable the individual adapter, revoke/rotate its secret, preserve the bounded audit trail, suppress retries, and return the honest unavailable state. It must not relax validation or move sensitive context to the browser.
