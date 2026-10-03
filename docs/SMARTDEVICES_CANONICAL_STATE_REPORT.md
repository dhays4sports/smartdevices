# Canonical state and product audit

Audit date: 2026-10-03. Source: dhays4sports/smartdevices, starting branch smartdevices-sites-hosting-1.0, SHA df8be5789307435889094b49a3caebf797b6ae16 (draft PR #3), stacked on PR #2 fcb95454c8876123c4cb6219dd6585030129e200. Main remains 7556775e3d2dbdfb7d83732b308abaaec0a151e5. None merged. Governing Mesh doctrine: draft PR #25, business-builder-autonomy-first-2.0, SHA 78f4d658c110bd2f0a26d876c688822b9d9c947b; read configs/business-builder.autonomy.policy.json, configs/business-archetypes.registry.json and docs/BUSINESS_BUILDER_AUTONOMY_FIRST.md. Doctrine is user-adopted, not claimed merged into Mesh main (6cdf98555a2bf6b94af2391e1d2af51ad660c413).

Continuation: smartdevices-business-builder-2.0-dogfood-1.0. Exact review head is supplied by the PR and /api/version; never infer it from a rendered UI. No rebuild. PR #1 governance was incorporated into recovered PR #2, which recovered the newer app. PR #3 preserves that implementation and isolates hosted persistence. This continuation preserves both.

| Component | Classification | Evidence / operational status |
|---|---|---|
| Ecosystem/product North Star | CANONICAL | docs/SMARTDEVICES_ECOSYSTEM_NORTH_STAR_AND_ROADMAP.md; DISCOVER → CONNECT → CREATE → OPERATE |
| Business North Star | CANONICAL | This constitution: simple, useful, measurable, low attention before scope expansion |
| GitHub review branch | CANONICAL | Source, tests, migrations, contracts, evidence; main is obsolete for continuation |
| Sites runtime | DERIVED | Private persistence test Site, source mirrored from GitHub; pilot, not production cutover |
| Generated interface/copy | REPLACEABLE | React/Vinext source; not the business asset |
| Device data / provenance | CANONICAL | content/catalog.json: 15 records, all source-linked; dates are not silently renewed |
| Capabilities | CANONICAL | content/device-capabilities.json; normalized mappings plus human labels |
| User / Builder state | CANONICAL | Existing D1 builder_projects/revisions; stable Sites subject; test database only |
| Consumer planning state | CANONICAL | Existing browser-local SafetyPlan, explicit local-save label; not hosted account state |
| Identity / registry | DERIVED | Contracts and test registration representation; physical verification not supplied |
| Permissions / operations | MISSING | Production adapters disabled; identity never grants authority |
| Farmers content | CANONICAL | Existing California-specific rules/disclosures; stale evidence remains labeled |
| Analytics | DERIVED | New opt-in synthetic daily aggregate counters; production traffic unknown |
| SEO | DERIVED | Canonical metadata preserved; preview noindex; public indexing unknown |
| Monetization | MISSING | Manufacturer-click experiment; no affiliate enrollment, payment, revenue proof |
| Growth | MISSING | Measurement/growth plan now defined; no autonomous acquisition demonstrated |
| Providers | REPLACEABLE | See portability; account subject migration remains a real dependency |
| Earlier universal-control/marketplace MVB framing | DEPRECATED | Preserved as future direction, not a near-term gate |

## What actually works

WORKING in local production-build interactions: device library, canonical capability filter, device details, comparison route, home decision flow, local plan/save/export, prototype Builder generation, mobile navigation, /farmers and handoff. Existing fixtures are engineering examples, not market demand. Search is local catalog filtering, not live market search.

PARTIAL: hosted authenticated projects implemented and tested with real local D1; hosted unauthenticated denial/operation blocking verified. Central hosted sign-in A → save → reload → reopen → B denial remains unexecuted. No claim of hosted account-isolation certification. Home plans and hardware prototype projects have different existing schemas and are not silently merged.

PLACEHOLDER / BOUNDED: Connect is an explicitly in-memory sample, not a live device connection or verified owned inventory. PLANNED: live Operate, account inventory, production identity/claims, paid alerts/API. BLOCKED BY POLICY: physical execution, payments, production manufacturers, market handoff writes. Forms that target disabled APIs must fail truthfully.

## Preservation and simplification

KEEP: catalog, evidence, capability mappings, comparison, local plans, Builder, private ownership checks, /farmers, migrations and Mesh boundaries. ELEVATE: direct water-planning entry, source-date visibility, local-save truth, manufacturer action. GENERALIZE: compatibility displayed in seven distinct dimensions; aggregate behavioral contract. DEPRECATE as near-term dependencies: partnerships, registry adoption, marketplace, physical control. MISSING: real users, real revenue, production metrics, measured owner burden, hosted two-account acceptance proof.

## Hosting audit carried forward and rechecked

Test project appgprj_6ac1324d62f08191a6fbecaa261e619f, https://smartdevices-persistence-test.noisy-skunk-4108.chatgpt.site, owner-private/custom access, version 2 at audit start. Starting deployed SHA df8be5789307435889094b49a3caebf797b6ae16. Build npm run build via Sites packager; dist/server/index.js Worker fetch entry; DB logical D1 binding, no R2, only RATE_LIMIT_HASH_SALT secret. Native Sites auth configured; service credential is not a user identity. Previous 28-table DB empty of Builder projects; new additive counter migration brings 29 tables. Deployment manual from exact GitHub commit, no production DNS change. Safe bounded comparison Site remains separate and unchanged. See SITES_TEST_ENVIRONMENT and SITES_HOSTING_VERIFICATION for evidence, limitations and reproduction.

## Public domain observation

Read-only public retrieval on 2026-10-03 returned the older “The Future Has An Address” institutional page at https://smartdevices.com, with planned Index/partnership positioning. It is not the private pilot application. Public /protect/home and /farmers could not be retrieved by the search tool; this is not proof of their HTTP status or mobile behavior. Public-domain deployment SHA remains UNKNOWN. No public form submitted. No DNS changed.
