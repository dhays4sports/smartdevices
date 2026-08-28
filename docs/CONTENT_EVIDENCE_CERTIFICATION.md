# v4.2 Content and Evidence Certification

Run date: 2026-08-26 UTC  
Gate: SD42-QA-9.6 — Release Candidate 0  
Disposition: Pass locally; cutover revalidation and external carrier/legal review remain open

## Validated publication set

- The carrier validator resolved 8 evidence sources, 5 carrier rules, and 4 technical-fit overlays with no drafts, stale/conflicting/restricted public records, orphan rules, or public leaks.
- All 15 published seed-catalog records and the v4.2 carrier/safety statements were revalidated against the primary sources recorded in `PRIMARY_SOURCE_REVALIDATION_2026-08-26.md`.
- The California Farmers pilot publishes one current Farmers public offer, bounded potential-category guidance, class-level safety guidance, and independent SmartDevices recommendations as separate states.
- California evidence is scoped to California and cannot create a positive designation outside that jurisdiction.
- Moen Flo appears as a current California Farmers public offer only while both the Farmers-controlled offer evidence and the required manufacturer capability evidence remain active.
- Gas guidance remains class-only. Fire/security guidance separates local alert, remote alert, central monitoring, outside signaling, dispatch, subscription, certification, and documentation. Connected-home guidance exposes cloud, hub, subscription, outage, account-security, and privacy dependencies.

## Language and provenance controls

- Case-specific consumer assertions, professional assertions, public carrier offers, potential discount categories, technical capability fit, independent recommendations, and confirmation-needed states remain structurally distinct.
- Current positive carrier labels require active public evidence, matching jurisdiction/scope, a checked date, a review-due date, limitations, and a governed explanation.
- Draft, restricted, stale, conflicting, withdrawn, and retired records cannot create a current positive label.
- The published-content suite rejects universal requirement, approval, certification, partnership, guaranteed discount/eligibility, claim-outcome, recovery, prevention, compatibility, code-compliance, and pseudo-score language.
- SmartDevices remains the primary identity. No Farmers logo, trade dress, or unsupported endorsement language is present.
- Editorial, affiliate, and sponsored status remain separate. Every current release record is editorial with no activated commercial relationship.

## Reproducible gate evidence

| Check | Result |
|---|---|
| `npm run validate:evidence` | Pass: 8 sources, 5 rules, 4 fits; zero draft/stale/conflicting/restricted/orphan/leak findings |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm test` | Pass: 67 JavaScript + 114 TypeScript tests (181 total) |
| Production build included by test | Pass |

## External boundary

Before public cutover, a named content reviewer and legal/compliance reviewer must re-open every carrier, program, safety, installation, price, availability, subscription, warranty, compatibility, and product source; record any changed scope; withdraw affected positive labels; and approve the exact candidate. Farmers has not verified, endorsed, certified, or approved SmartDevices or any SmartDevices designation. This is a local engineering/content evidence gate, not carrier or legal certification.
