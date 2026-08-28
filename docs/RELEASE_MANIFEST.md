# Release Manifest — SmartDevices v4.2.0-rc.1

Release date: 2026-08-26 UTC

Roadmap: 58 sprints, `SD42-FND-0.1` through `SD42-CERT-10.5`

Designation: local root-deployable production candidate after final immutable-package gate; public go-live not authorized

## Product inventory

- Independent protection-first homepage with unchanged headline/action and optional first-viewport carrier discovery.
- Four domains: Home, Vehicle, Family, and Business. Home/Vehicle retain full spatial journeys; Family/Business remain honest starter guides.
- Permanent neutral `/insurance` directory, canonical California pilot at `/farmers`, and sanitized permanent alias at `/insurance/farmers`.
- Contextual carrier guidance from navigation, applicable Home results, device details, and plans without forcing insurer selection.
- Exactly three narrated cause/effect demonstrations: water detection/shutoff, smoke-or-heat awareness, and vehicle theft tracking.
- Versioned carrier registry/program/rule/evidence/device-class/device-fit/question/context contracts with seven separated truth designations.
- Four-question Farmers intent/scan journey and ordered Carrier Protection Map with useful unsupported-carrier/state behavior.
- Fully realized whole-home water path; class-level automatic-gas, monitored-fire/security, and connected-home guidance.
- Fifteen-record independent device catalog; one current California Farmers public-offer product observation, governed only while both carrier and manufacturer evidence are current.
- Plan v3 carrier provenance with plan v1/v2 readers, local save/resume, sanitized sharing, print/export, water checklist, literal verification events, and post-value consent.
- Carrier-aware SmartDevices Pro with server authorization, PII-free templates, stale warning gate, secondary co-branding, exact client preview, literal engagement states, and disabled provider behavior.
- Handoff v3 bounded carrier context with v1/v2 readers, HMAC, consent, expiry, replay, persistent rate limit, payload/sensitive-key validation, audit, and zero-repeat behavior.
- Thirteen D1/Drizzle tables and four append-only migrations. External identity, persistence, delivery, partner, analytics, and upload systems remain adapters disabled by default.
- Two protected original SVGs preserved byte-for-byte; inherited institutional identity, SmartDevices Index, manifesto, partnership access, and “The Future Has An Address.” preserved.

## Release evidence

| Gate | Final evidence before immutable packaging |
|---|---|
| Baseline/provenance | Exact v4.1 release commit matched the supplied baseline provenance; protected SVG digests matched. Archive rematerialization limitation remains disclosed. |
| Schema/migration | Four migrations applied in order to a fresh SQLite-compatible database; 13 governed tables and verification indexes passed. |
| Type/static analysis | `npm run typecheck` and `npm run lint`: pass. |
| Evidence/content | 8 evidence sources, 5 rules, and 4 fits; zero draft/stale/conflicting/restricted/orphan/leak findings; 15 catalog records and carrier/safety claims revalidated. |
| Automated regression | Clean source checkpoint: 67 JavaScript + 115 TypeScript tests, 182 total, pass. Final package gate reruns and records the immutable-package result separately. |
| Production dependency security | `npm audit --omit=dev`: zero known vulnerabilities. Development-tool advisories remain disclosed without an unsafe forced upgrade. |
| Rendered/interaction | Available Chrome completed homepage → directory → Farmers water → plan, production Pro lock, local-demo exact preview, keyboard/focus, alias, and disabled-provider flows after preserved corrections. |
| Accessibility | Semantic, keyboard, focus, target, representative contrast, text-equivalent, reduced-motion, and forced-color contracts pass locally; named AT/physical-device rows remain external. |
| Performance/resilience | Reviewed CSS/asset/chunk budgets and degraded modes pass locally. Representative LCP/CLS/INP cannot be measured in the available environment and is not claimed. |
| Cross-system | Handoff v1/v2/v3, generic carrier fixture, literal engagement, replay/expiry/rate/suppression/revocation/timeout/disabled-provider boundaries pass locally; no live partner call/message occurred. |
| Clean extraction/rollback | Fresh archive installed 520 locked packages, migrated, typechecked, linted, built, and passed 182 tests; exact v4.1 commit installed, built, and passed 64 tests. |

## Required documentation set

Architecture/data contracts; carrier schemas and truth table; scan/rule provenance; content/insurance evidence; protected hashes; schema/migrations; 58-sprint release/checkpoint history; normalized regressions; functional, visual, accessibility, performance/resilience, security/privacy, evidence/content, cross-browser/device, cross-system, clean-room, and package certifications; environment/external activation; deployment/migration/rollback; admin/editorial; carrier onboarding/brand/integration; California Farmers water and monitored-security sample plans; known limitations/cutover readiness.

The documentation contract test verifies all required root-relative files plus operator commands, carrier routes, environment keys, and both sample-plan decision contracts.

## Final package contract

- `SmartDevices_v4.2.0_rc1_SD42-CERT-10.5_SOURCE.zip`
- `SmartDevices_v4.2.0_rc1_SD42-CERT-10.5_ROOT_DEPLOYABLE.zip`
- `SmartDevices_v4.2.0_rc1_SHA256SUMS.txt`

Both ZIPs must put `package.json` and release provenance at archive root, exclude dependencies/Git/cache/local environment/secrets/prior archives, and pass exact post-package extraction checks. The root-deployable ZIP includes the production `dist/` emitted from the exact source-package extraction. Because an archive cannot contain its own final hash without changing that hash, the sibling checksum file is the authoritative immutable digest record.

## Non-claims

This release does not claim public deployment, Farmers ownership/endorsement/approval, private carrier evidence, policy requirement/eligibility/discount, real message/upload/partner delivery, hosted D1/identity activation, physical-device/browser/AT certification, valid representative Core Web Vitals, external penetration certification, or jurisdiction-specific legal approval. See `KNOWN_LIMITATIONS_AND_CUTOVER_READINESS.md`.
