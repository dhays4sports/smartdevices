# External Activation Ledger

No external deployment, account, message, purchase, enrollment, or live partner call was authorized or performed.

| Item | Local implementation | Activation requirement | Current state |
|---|---|---|---|
| Hosted identity | Server-side authenticated-user adapter and production sign-in boundary | Configure approved identity/role source; verify professional authorization and offboarding | Not activated |
| D1 persistence | 13-table schema, 4 migrations, scan provenance, normalized verification events, opaque IDs, hashed write capability, audits | Create/bind staging/production DB, back up, apply migrations, verify indexes/FKs, rehearse restore, set approved retention/deletion jobs | Not activated |
| Rate limiting | Persistent fixed-window contract keyed by salted client address hash | Set high-entropy `RATE_LIMIT_HASH_SALT`; tune per edge topology | Not activated; APIs fail closed in production |
| CoverageFit inbound | Consent/expiry validation, canonical HMAC verification, clock window, replay receipt | Exchange secret securely, confirm canonicalization, endpoint, data mapping, and deletion SLA | Not activated |
| CoverageFit outbound | Typed envelope and disabled adapter | Configure endpoint, TLS expectations, signing, retry/idempotency, suppression | Not activated |
| 408FARMERS inbound/outbound | Same independent typed/HMAC boundary | Configure endpoint/secret under approved partnership; retain independent branding | Not activated |
| CRM export | Explicit-intent/fulfillment export contract; page views excluded | Select CRM, map fields, authorize service account, test deletion and suppression | Not activated |
| Communications | UI consent checkpoint and disabled delivery statement | Select provider; consent language/legal review; sender identity; opt-out/suppression; delivery webhooks | Not activated |
| Analytics | Fixed PII-free event vocabulary and disabled adapter | Approve purpose/consent, retention, destination, deletion, sampling, and instrumentation acceptance tests | Intentionally disabled |
| Consent/retention policy | Blank environment contract; consent/suppression tables | Owner/legal approval of controller identity, policy version, retention days, deletion/access/withdrawal runbooks | Not activated; no invented defaults |
| Cross-browser/accessibility | Chrome desktop/local evidence and exact matrix | Complete Edge, Firefox, physical iOS/Android/tablet, named AT, zoom/reflow, forced-color, touch/keyboard tests | Not externally certified |
| Core Web Vitals | Bundle/asset budgets and local resilience evidence | Authorized HTTPS staging, 5+ lab runs/profile, RUM sample, p75 report for LCP/CLS/INP | Not measured; no pass claimed |
| Affiliate commerce | Commercial status model and disclosure page | Approve program, tracking/privacy review, add visible per-action disclosure | Intentionally absent |
| Carrier programs | California Farmers public-source pilot with governed category/offer evidence and independent SmartDevices guidance | Assign named carrier-content and legal reviewers, approve change monitoring, recheck every source at cutover, and obtain any required relationship/brand authorization | Local candidate only; no carrier verification, endorsement, or private-program activation claimed |
| Public deployment | Root-deployable build and guides | Separate owner authorization, final domain/config, secrets, browser/device matrix, legal owner details | Not authorized |
# v4.2 carrier pilot additions — 2026-08-26

- Farmers trademark/logo or co-brand assets: disabled; requires written brand authorization and approved files.
- Internal Farmers rule/policy material: absent; requires documented authorization, server-only access, reviewer scope, retention/deletion, and public-quotation permission before use.
- Four-eyes carrier claim review: local workflow documented; named second reviewer/approval service remains operational.
- Hosted CMS/editor identity/scheduling: not claimed; static validated local editorial mode is active.
- Development dependency advisories: production audit is clear; the current build/test tree has 46 transitive advisories (3 low, 7 moderate, 36 high). Re-evaluate compatible Vinext/Next/Cloudflare/toolchain upgrades in an isolated branch, rerun the complete normalized suite, and do not force breaking transitive resolutions.
