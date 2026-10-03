# Known Limitations and Cutover Readiness — SmartDevices v4.3

Assessment date: 2026-08-26 UTC

Local engineering status: locally certified root-deployable production candidate

Public go-live status: not ready and not authorized

## Locally ready

- Protection-first homepage, Interactive Property, Intelligent Scan, Device Universe, and plan remain usable without contact information or hosted services.
- Neutral carrier discovery at `/insurance`, canonical California Farmers guidance at `/farmers`, contextual discovery, unsupported-carrier/state guidance, and sanitized alias behavior are implemented.
- Current public evidence, consumer/professional assertions, potential categories, capability fit, independent recommendations, and confirmation-needed states remain separate.
- Water, gas class-only, monitored fire/security class-only, and connected-home guidance expose material setup, cost, subscription, maintenance, compatibility, privacy, installation, documentation, and insurance boundaries.
- Plan v3, plan v1/v2 readers, normalized verification events, carrier-aware Pro, handoff v3 plus v1/v2 readers, disabled adapters, explicit errors, and the generic test-carrier path are locally verified.
- Clean source extraction, locked install, all four migrations/13 tables, typecheck, lint, production build, built-runtime routes, 182 automated tests, protected-asset hashes, source exclusions, and exact v4.1 rollback passed before final packaging.
- Current production-only dependency audit reports zero known vulnerabilities; the development/build tree's 46 transitive advisories remain disclosed.

## Exact unresolved external actions

| Boundary | Required action before public activation | Current disposition |
|---|---|---|
| Brand | Obtain written permission for any Farmers logo/trade dress, exact assets, channels/territory, placement, alt text, expiry/revocation, and purge procedure—or keep the current text-only independent presentation. | Text-only pilot; no authorization claimed |
| Internal carrier rules | If private material is proposed, obtain disclosure/use authorization and configure server-only access, reviewer scope, retention/deletion, audit, and leakage tests. Never ship it client-side. | No internal material present |
| Carrier evidence/content | Assign named carrier-content and legal/compliance reviewers, re-open every source at cutover, approve jurisdiction/scope/language, and activate change monitoring/four-eyes publication. | Local primary-source review only |
| D1 | Create staging/production instances, back up/export, bind `DB`, apply five migrations, verify 17 tables/FKs/indexes, test retention/deletion/access/restore, and record digests/operators. | Adapter/schema only |
| Evidence Autopilot | Apply migration `0004`, verify 17 tables, configure evidence-admin and scheduler credentials, enable retrieval only after staging, approve all first-run baselines, test conservative expiry and rollback, and connect operational alerting. | Implemented but external retrieval/scheduler not activated |
| Identity/Pro | Configure authenticated identity plus `SMARTDEVICES_PRO_AUTH_JSON` or an approved role adapter; verify issuance, expiry, suspension, offboarding, least privilege, and audit. Keep demo false. | Production fails closed |
| Communications/CRM/upload | Select approved providers; complete purpose/consent, DPA/privacy, authentication, retry/idempotency, timeout, suppression, retention/deletion, malware scanning for uploads, delivery receipts, monitoring, and kill-switch tests. | Disabled; no message/upload/export |
| Partners | Exchange separate secrets and stage CoverageFit/408FARMERS directions independently; run the exact v1/v2/v3 acceptance/rejection/replay/rate/timeout/deletion protocol. | No live call or certification |
| Browser/device/AT | Complete current Edge/Firefox, physical iOS Safari/Android Chrome/tablet, short landscape, 320px, 200%/400% zoom, forced colors, VoiceOver/TalkBack/NVDA/JAWS, touch/keyboard, and background/degraded traces against the final SHA. | Available fixed Chrome only |
| Performance/CWV | Deploy an authorized representative HTTPS staging origin; run at least five controlled mobile/desktop profiles plus RUM; report p75 LCP/CLS/INP and remediate before claim. | Not validly measurable; no pass claimed |
| Security/privacy | Run external penetration/abuse tests; approve controller identity, privacy/terms/contact, retention/deletion/access/withdrawal, incident response, secret rotation, logging, dependency treatment, and restricted-data controls. | Local engineering review only |
| Legal/insurance/safety | Obtain California and deployment-jurisdiction counsel/compliance review of carrier, affiliate, privacy, accessibility, installation, life-safety, consumer, and insurance language. | No legal/carrier certification |
| Operations/deployment | Authorize domain deployment; configure secrets/DNS/monitoring/backups/on-call/incident ownership; rehearse live D1 restore and traffic rollback; approve final evidence and package SHA. | Local-only; no external deploy |

## Product scope limitations

- Farmers is the only fully realized carrier pilot. No empty or fixture carrier page is public. Outside California, the user receives useful generic guidance and a visible unverified-state message.
- The public pilot does not prove a case-specific requirement, policy applicability, product approval, eligibility, savings, acceptance, or partnership.
- Moen Flo remains the sole current public-offer product observation supported by the governed pilot evidence and was shown unavailable at the review check. Availability, price, terms, fit, and installation acceptance require direct recheck.
- Automatic gas shutoff, monitored fire/security, and connected-home guidance are class-level. No product-level Farmers qualification is published for those categories.
- Family and Business remain starter guides. Some categories intentionally return a class-only result or fewer products when evidence does not support more.
- Secure evidence upload is metadata/adapter-only and disabled. Users must not upload sensitive documents.
- No pseudo-score exists. Recommendations, intent, purchase, installation, evidence, professional review, and carrier determination remain separate literal states.

## Cutover decision

`SD42-CERT-10.5` tested the exact immutable SOURCE and ROOT_DEPLOYABLE ZIPs, so the candidate is a **locally certified, root-deployable production candidate**. That does not make it ready for public traffic. External go-live remains **NOT READY** until every applicable row above has an owner, evidence, approval, and rollback record and the user separately authorizes deployment.

## v5.3 ecosystem reconciliation limitations

- Manual device registration is metadata normalization, not ownership/control proof, verification, identity, reachability, permission or agent operation.
- No manufacturer/local-network adapter is activated by default. Raw device secrets must not be stored in public registry metadata.
- `device.eth` and `deviceregistry.org` are architectural boundaries only in this candidate; no external namespace/registry activation is claimed.
- Consequential device operation and transactional actions remain disabled/deferred.
- The local source gate cannot replace the pending clean dependency-aware install/type/lint/build/runtime verification because npm registry DNS is unavailable in this environment.
