# Normalized Regression History

## v4.1 baseline — SD41-FND-0.1 — 2026-08-22 UTC

| Gate | Result | Evidence |
|---|---|---|
| Archive integrity | PASS | Owner-supplied SHA-256 matched exactly |
| Typecheck | PASS | `tsc --noEmit` exit 0 |
| Lint | PASS | ESLint exit 0 |
| Production build | PASS | Vinext build produced the expected application routes |
| Runtime/schema/content regression | PASS | 10/10 Node tests passed |
| Production dependency audit | PASS | 0 known production vulnerabilities |

This entry records the untouched v4.0 RC1 behavior before v4.1 implementation. Later results append below; this baseline is not rewritten.

Results are append-only. A failed run remains recorded even after correction.

| Run | UTC date | Scope | Result | Evidence / correction |
|---|---|---|---|---|
| NR-001 | 2026-08-22 | Drizzle generation | Pass | 9-table migration `0000_cute_aaron_stack.sql` generated |
| NR-002 | 2026-08-22 | ESLint | Fail | React effect/memo rules in `ProtectionExplorer`; removed synchronous state effects and unstable memo |
| NR-003 | 2026-08-22 | ESLint + build | Pass | 18 UI/API routes built |
| NR-004 | 2026-08-22 | TypeScript | Fail | Disabled adapter signature and missing Cloudflare declarations corrected |
| NR-005 | 2026-08-22 | Focused content/schema tests | Fail | Test file backtick syntax corrected; product code unaffected |
| NR-006 | 2026-08-22 | Full runtime suite | Fail | Static worker import blocked Node runtime; D1 import made lazy |
| NR-007 | 2026-08-22 | Full runtime suite | Fail | Plan query decoded only in client window; server now passes normalized query |
| NR-008 | 2026-08-22 | TypeScript + build + 10 tests | Pass | Homepage, direct routes, plan, Pro demo, invalid plan, unauthenticated handoff all verified |
| VQA-001 | 2026-08-22 | Desktop rendered preview | Fail | Image-transform binding unavailable; overlay showed explicit failure |
| VQA-002 | 2026-08-22 | Desktop rendered preview | Pass | Scene assets set to direct/unoptimized delivery; overlay absent, scene displayed |
| VQA-003 | 2026-08-22 | Rapid scene switch | Pass | Home → Vehicle → Family → Business → Home → Vehicle; single selected tab and correct Vehicle scene |
| VQA-004 | 2026-08-22 | Keyboard focus trace | Pass | Brand, navigation, four domain tabs, and four textual concern controls reached in order |
| VQA-005 | 2026-08-22 | Explorer → plan | Pass | Two theft options added; URL contained only domain/concern/device IDs; two-item Protection Map rendered |
| VQA-006 | 2026-08-22 | Client intent | Pass | Explicit “I’m interested” state and local save confirmed; delivery-disabled boundary visible |
| VQA-007 | 2026-08-22 | Pro builder | Pass after hydration wait | PII-free teen-driver template selected two records; client preview generated; live engagement remained explicitly absent |
| VQA-008 | 2026-08-22 | Library filter/compare | Pass | Vehicle + dashcam returned two records; both selected; compare URL exact; zero horizontal overflow |
| SEC-001 | 2026-08-22 | Production dependency audit | Fail | 4 high advisories in pinned starter dependencies, including Next 16.2.6; release blocked |
| SEC-002 | 2026-08-22 | Dependency remediation | Pass | Next updated to 16.3.2; `npm audit --omit=dev --audit-level=high` reports 0 vulnerabilities |
| SEC-003 | 2026-08-22 | Secret-pattern scan | Pass | No private-key, OpenAI key, AWS access key, or GitHub classic-token pattern matched outside dependencies/build |
| NR-009 | 2026-08-22 | Final typecheck, lint, production build, 10 tests | Pass | Next 16.3.2; all normalized commands green |

The failed dependency audit remains visible to preserve history; SEC-002 and NR-009 are the final corrected evidence.

| Run | UTC date | Scope | Result | Evidence / correction |
|---|---|---|---|---|
| NR-010 | 2026-08-22 | v4.1 full build and 49-test regression | Fail | Handoff v1 runtime fixture used a four-character opaque suffix while the new v2 validator required eight; validator minimum was aligned with the published backward-compatibility fixture without weakening system, consent, expiry, payload-size, or signature checks |
| NR-011 | 2026-08-22 | v4.1 typecheck, lint, Vinext build, 11 runtime/schema/content tests, and 38 typed contract tests | Pass | All 49 automated tests passed; 19 application/API routes built |
| VQA-009 | 2026-08-22 | v4.1 first viewport at available 1363×936 Chrome surface | Fail | Primary CTA was present, but the four domain choices remained below the first viewport; added compact Home/Vehicle/Family/Business entry shortcuts while retaining the full chooser |
| VQA-010 | 2026-08-22 | Corrected first viewport and complete Home water flow | Pass | Headline, CTA, and four domain shortcuts visible; demo controls, five-question scan, visible unknown, Device Universe, sanitized v2 plan URL, and one-item plan verified |
| VQA-011 | 2026-08-22 | Vehicle theft flow and rapid domain switching | Pass | Vehicle demo and five-question branch completed; Home/Vehicle/Family/Business rapid switching left one literal selected state with no application console error |
| VQA-012 | 2026-08-22 | Keyboard focus trace and direct routes | Pass | Brand → navigation → CTA → Home shortcut focus order retained a 3px visible outline; library, v1 plan, Home/Vehicle, and production-locked Pro routes loaded directly |
| VQA-013 | 2026-08-22 | Explicit local Pro demo and exact client preview | Pass | Template selected three options; generated plan and literal follow-up states appeared; client preview URL contained only plan/domain/concern/device identifiers |
| VQA-014 | 2026-08-22 | Required responsive/browser visual matrix | External boundary | Browser supplied only one fixed Chrome desktop viewport; exact physical and emulated retest rows are in `VISUAL_INTERACTION_CERTIFICATION.md` and are not claimed as passes |
| A11Y-001 | 2026-08-22 | Keyboard, names/roles/values, equivalents, motion, target-size, and mode contracts | Pass | Live focus trace plus automated source contract; primary/spatial/text controls normalized to at least 44 CSS pixels |
| A11Y-002 | 2026-08-22 | Physical assistive technology, 320px reflow, zoom, forced colors, mobile touch/keyboard | External boundary | Browser/device/AT matrix unavailable; exact retest protocol retained in `ACCESSIBILITY_CERTIFICATION.md` |
| A11Y-003 | 2026-08-22 | New accessibility source-contract test | Fail | Scan progress used focus restoration but did not expose a polite progress live region; question position was updated to announce without interrupting |
| A11Y-004 | 2026-08-22 | Corrected accessibility source contract plus focused regression | Pass | 4/4 accessibility checks and 46 focused schema/content/typed checks passed; updated visual baselines preserve the 44px correction |
| PERF-001 | 2026-08-22 | Asset/bundle budgets and Vinext production build | Pass | 6.2 MB dist; each lazy scene ≤1.7 MB; CSS 47,421 bytes; largest client framework chunk 189,805 bytes; explorer chunk 24,251 bytes |
| RES-001 | 2026-08-22 | Missing image/API/D1, disabled analytics, unavailable storage, stale product, invalid handoff/plan, background tab, rapid switching | Pass locally | Source, unit, integration, built-runtime, and live Chrome evidence; real slow network/low-power hardware remains external |
| CWV-001 | 2026-08-22 | Representative LCP/CLS/INP certification | Not measurable | No authorized HTTPS staging origin, field sample, or representative Lighthouse device; exact retest procedure retained without fabricated pass |
| SEC-004 | 2026-08-22 | New scan/analytics privacy source-contract test | Fail | Initial test incorrectly rejected explanatory “without collecting a VIN or plate” limitation language; collection surfaces were narrowed to prompts and selectable labels while the prohibition remains intact |
| SEC-005 | 2026-08-22 | Corrected scan/analytics privacy source-contract test | Fail | Prohibited-field pattern also matched the required literal event `name` discriminator; narrowed to personal-name fields without changing the event contract |
| SEC-006 | 2026-08-22 | Security/schema/Pro contract tests and production dependency audit | Pass | 12/12 focused checks; 0 production vulnerabilities; inbound partner route gained persistent rate limiting |
| SEC-007 | 2026-08-22 | Secret, endpoint, placeholder, and forbidden-language scans | Pass with reviewed framework literals | 0 secret-pattern files; 0 authored placeholder endpoints; two built framework bundles contain generic URL-parser/error-message `localhost`/`example.com` literals, not application configuration; 12/12 language/scan checks passed |
| CERT-BROWSER-001 | 2026-08-22 | Available Chrome desktop and built-runtime matrix | Pass locally | Complete interactive trace, direct routes, keyboard, rapid switching, Pro demo, and Back/Forward restoration passed |
| CERT-BROWSER-002 | 2026-08-22 | Edge, Firefox, physical iOS/Android/tablet, throttled low-power matrix | External boundary | Environments unavailable; exact per-row completion protocol is preserved in `CROSS_BROWSER_DEVICE_MATRIX.md` |
| CLEAN-001 | 2026-08-22 | Clean-room migration harness | Fail | Python transcript command accidentally retained patch-marker prefixes; archive and application were unchanged; correction appended to raw transcript |
| CLEAN-002 | 2026-08-22 | Corrected migration harness | Fail | Fixture expected 13 tables while the governed schema contains 12; corrected without changing migrations or application |
| CLEAN-003 | 2026-08-22 | Clean root extraction, locked install, typecheck, lint, 3 migrations, build, 64 tests, built runtime | Pass | Root archive SHA and full append-only transcript retained in `docs/evidence/SD41-CERT-10.2_CLEAN_ROOM_TRANSCRIPT.txt` |
| ROLLBACK-001 | 2026-08-22 | Protected v4.0 source rollback rehearsal | Pass locally | Baseline SHA reverified; root extraction, locked install, typecheck, lint, build, and 10 tests passed; production D1 restore remains external |
| PKG-001 | 2026-08-22 | Preliminary root built-runtime harness | Fail | Harness expected unavailable storage from unsupported `GET /api/plans`; runtime correctly returned HTTP 405. No application or package change was required. |
| PKG-002 | 2026-08-22 | Corrected preliminary root built-runtime harness | Pass | Six direct routes returned 200; unsupported GET returned 405; valid plan POST failed closed with 503 `RATE_LIMIT_NOT_CONFIGURED`. |
| PKG-003 | 2026-08-22 | Exact final source/root packages | Pass locally | Source: root layout/exclusions, locked install, typecheck, lint, 3 migrations/12 tables, build, 64 tests, audit, scans, protected hashes. Root: second clean locked install, typecheck, lint, exact built runtime and route/degraded-mode rehearsal. SHA manifest verified both archives. |

## v4.2 append-only runs

| Run | UTC date | Scope | Result | Evidence / correction |
|---|---|---|---|---|
| SD42-NR-001 | 2026-08-26 | Untouched v4.1 source baseline | Pass | Clean release commit; typecheck, lint, production build, 64 tests, and production audit (0 vulnerabilities) passed; 19 inherited routes emitted. |
| SD42-INTAKE-001 | 2026-08-26 | Fresh source-ZIP materialization | External transfer limitation | Exact Library record located; two download attempts returned HTTP 502. The checked-out commit exactly matches v4.1 package provenance, so implementation continued without claiming a fresh ZIP rehash. |
| SD42-NR-002 | 2026-08-26 | v4.2 checkpoint contract | Fail | Initial parser counted the three append-only completion-log rows in addition to the 58 planned sprint rows. Parser scope was corrected to the initial contract table; no sprint or evidence row was changed. |
| SD42-NR-003 | 2026-08-26 | Discovery alpha full regression | Fail | New carrier-motion test scanned inherited v4.1 demonstration animations instead of the v4.2 carrier CSS section. The test scope was narrowed to carrier styles; the inherited accessible demo remains unchanged. |
| SD42-NR-005 | 2026-08-26 | Evidence schema focused regression | Fail | Aggregate manufacturer reference did not meet the public-source URL contract. It was replaced by direct current Phyn, Kidde, and SimpliSafe manufacturer-source records; device fits now reference those records. |
| SD42-NR-006 | 2026-08-26 | Corrected evidence-source contracts | Pass | Focused evidence tests and complete 83-test normalized regression passed; production build remained green. |
| SD42-NR-007 | 2026-08-26 | Applicability assertion-copy test | Fail | The assertion test looked only for the noun “verification,” while the approved limitation correctly used the verb “verified.” The test now accepts either form without changing public copy or logic. |
| SD42-NR-008 | 2026-08-26 | Corrected applicability truth table | Pass | Four focused applicability tests and the complete 87-test normalized suite passed. |
| SD42-NR-009 | 2026-08-26 | Farmers brand-boundary test | Fail | Initial asset scan also matched the required disclosure “not an official Farmers site.” The check was narrowed to actual image/src references; the independence disclosure remains intact. |
| SD42-NR-010 | 2026-08-26 | Post-intent-selector typecheck | Fail | Applicability test expected-designation table inferred `string[]`; it was explicitly typed to the governed designation union. Runtime behavior and production source were unaffected. |
| SD42-NR-011 | 2026-08-26 | Farmers first-viewport source contract | Fail | Test still inspected the server page after intent copy moved into the new client selector. The test now follows the rendered component boundary; no product behavior changed. |
| SD42-NR-012 | 2026-08-26 | Carrier accessibility source contract | Fail | The accessibility test likewise followed the former server-page location for the intent landmark. It now inspects the rendered selector component; semantics are unchanged. |
| SD42-NR-013 | 2026-08-26 | Protection Map prohibited-score test | Fail | The test matched the required explanatory copy “No protection score.” It now rejects score values/percentages/rank claims while allowing the explicit no-score disclosure. |
| SD42-NR-014 | 2026-08-26 | Built-runtime alias context | Fail | Vinext's static alias page did not pass query context to the redirect component. The alias is now an explicit server GET route that allowlists and preserves only intent/category before returning HTTP 308. |
| SD42-NR-016 | 2026-08-26 | Reused water-demo control contract | Fail | New test expected “Skip animation”/`demo-transcript`; the inherited accessible controls use “Skip motion” and semantic `demo-narration`. The test was aligned to actual unchanged v4.1 controls. |
| SD42-NR-015 | 2026-08-26 | Corrected v4.2.0-a.2 built-runtime and full regression | Pass | Typecheck, lint, production build, direct `/insurance`, `/farmers`, water-context route, 308 alias, 43 JavaScript tests, and 66 typed tests passed (109 total). |
| SD42-NR-004 | 2026-08-26 | Corrected v4.2.0-a.1 discovery alpha | Pass | Production build emitted 22 routes; 35 JavaScript and 47 typed tests passed (82 total). Direct carrier routes, canonical alias, responsive/semantic contracts, all 64 inherited tests, and carrier schema/language tests passed. |
| SD42-NR-017 | SD42-GUIDE-5.5 | Typecheck failed because the new matrix test used `discount` instead of the contract enum `discounts`. | Corrected the fixture to the governed enum; failure preserved here. |
| SD42-NR-018 | SD42-PLAN-6.2 | Initial UI test rejected the required explanatory phrase “not a safety score.” | Narrowed the assertion to reject score calculations/fields while allowing the truthful disclaimer. |
| SD42-NR-019 | SD42-PRO-7.1 | A focused command referenced nonexistent `tests/pro-contract.test.mjs`; the actual typed test is `tests/pro-contract.test.ts`. | Corrected the command and retained this operator-path failure. |
| SD42-NR-020 | SD42-PRO-7.2 | Normalized plan regression caught a wording change that removed the inherited exact value-before-contact sentence. | Restored the protected sentence while keeping the new explicit follow-up choices. |
| SD42-NR-021 | SD42-PRO-7.6 | Three source-inspection tests still expected a hard-coded Farmers name after generic components became carrier-data driven. | Updated assertions to verify dynamic carrier copy; runtime Farmers output remains exact. |
| SD42-NR-022 | SD42-PRO-7.6 | Full beta.2 regression found three additional static assertions tied to the former carrier-specific heading/copy. | Updated them to the semantic carrier heading and dynamic carrier-name expressions; functional behavior did not regress. |
| SD42-NR-023 | SD42-PRO-7.6 | The normalized checklist assertion still expected carrier-specific source text after the checklist became reusable. | Updated the source-contract assertion to generic carrier/agent wording; rendered carrier copy is supplied dynamically. |
| SD42-NR-024 | SD42-CONTENT-8.3 | New independence test looked for the protected tagline in `app/page.tsx`; the unchanged source of truth is `SiteFooter.tsx`. | Pointed the assertion to the actual protected location; no production file changed. |
| SD42-NR-025 | 2026-08-26 | Full development dependency audit | Fail, production unaffected | The current advisory database reported 46 transitive development/build-tool findings (3 low, 7 moderate, 36 high, 0 critical). Several direct toolchain paths advertise no compatible automatic fix. The production-only audit separately passed with zero vulnerabilities; no unverified force upgrade was applied. |
| SD42-NR-026 | 2026-08-26 | SD42-QA-9.1 normalized regression | Pass locally | Typecheck, lint, evidence validation, production build, 63 JavaScript tests, 114 typed tests, four fresh-database migrations/13 tables, and production-only dependency audit all passed. |
| SD42-NR-027 | 2026-08-26 | Post-render full regression | Fail | The v3 UI source test still expected the storage key inside `SafetyPlanClient` after storage handling moved to the dedicated verified memory/local adapter. The assertion was updated to inspect the adapter and client reader; product behavior was unchanged by the test correction. |
| SD42-VQA-001–007 | 2026-08-26 | Integrated carrier and Pro rendered QA | Pass after four corrections | Theme/contrast, plan provenance fallback, Pro preview width, and same-origin plan framing were corrected and rerun. Detailed trace is append-only in `VISUAL_INTERACTION_CERTIFICATION.md`. |
| SD42-NR-028 | 2026-08-26 | Post-SD42-QA-9.2 normalized regression | Pass | Production build, 66 JavaScript tests, and 114 typed tests passed (180 total) after the preserved rendered/test corrections. |
| SD42-A11Y-001 | 2026-08-26 | Carrier/plan/Pro semantics, keyboard, focus, targets, contrast tokens, motion equivalents | Pass locally | Fifteen focused contracts and the available Chrome semantic/focus trace passed; representative stable-token contrast ratios ranged from 4.95:1 to 17.51:1. |
| SD42-A11Y-002 | 2026-08-26 | Named screen readers, physical touch, forced colors, 320px reflow, 200%/400% zoom | External boundary | Environments unavailable; exact candidate-SHA retest protocol remains in `ACCESSIBILITY_CERTIFICATION.md`. |
| SD42-PERF-001 | 2026-08-26 | Inherited 55 KB raw global-CSS budget | Fail against v4.2 scope | Candidate CSS is 64,907 raw / 13,562 gzip after the carrier directory, scan, maps, guides, plan, and Pro preview. A reviewed v4.2 70 KB raw / 15 KB gzip guard was added; the v4.1 result remains historical. |
| SD42-PERF-002 | 2026-08-26 | v4.2 asset/bundle budgets | Pass locally | 6,525,440-byte dist; both lazy scenes under 1.7 MB; global CSS and principal client chunks within reviewed guards. |
| SD42-RES-001 | 2026-08-26 | Missing image/D1/storage, disabled analytics/provider, stale/unavailable content, invalid routes/handoff, background tab | Pass locally | Source/unit/runtime/browser evidence; true slow-network/low-power hardware remains external. |
| SD42-CWV-001 | 2026-08-26 | LCP/CLS/INP targets | Not validly measurable | No representative HTTPS origin, performance API, throttled device, or field sample. Exact staging procedure retained; no fabricated pass. |
| SD42-SEC-001 | 2026-08-26 | Production dependency audit | Pass | `npm audit --omit=dev` reported zero known production vulnerabilities. |
| SD42-SEC-002 | 2026-08-26 | Full development dependency audit | Open external/toolchain item | 46 transitive build/test advisories remain (3 low, 7 moderate, 36 high, 0 critical); no unsafe forced upgrade was applied. |
| SD42-SEC-003 | 2026-08-26 | Security/privacy focused regression and secret scan | Pass locally | Forty-four focused tests passed and the private-key/API-token scan found zero matches; external penetration, legal, identity, and operations reviews remain open. |
| SD42-CONTENT-RC0-001 | 2026-08-26 | Evidence, language, type, lint, build, and normalized release regression | Pass locally | Validator: 8 sources/5 rules/4 fits and zero publishability findings; 67 JavaScript plus 114 TypeScript tests passed (181 total). |
| SD42-XBROWSER-001 | 2026-08-26 | Available Chrome/built-runtime/accessibility contracts | Pass locally | Completed carrier/plan/Pro journey trace plus seven focused contracts; unavailable Edge, Firefox, physical mobile/tablet, named AT, slow-network, and low-power rows remain explicitly open. |
| SD42-XSYS-001 | 2026-08-26 | Cross-system and external-adapter contracts | Pass locally | 25 focused typed and 14 runtime/security/operator tests passed; timeout test double added; no live partner call/message or external certification claimed. |
| SD42-CR-001 | 2026-08-26 | Fresh migration harness | Harness fail, corrected | All four migrations applied and 13 tables existed; the temporary assertion expected `verification_events` instead of governed `plan_verification_events`. Corrected harness passed without source/schema change. |
| SD42-CR-002 | 2026-08-26 | Protected-hash harness | Harness fail, corrected | Exclusion check passed; four nonexistent generated-art paths were replaced with the two actual protected legacy SVG paths. Both hashes matched without asset change. |
| SD42-CR-003 | 2026-08-26 | Clean extraction/install/migrate/type/lint/build/test/runtime | Pass | Root archive SHA `9e7871d…8827e`; 520 locked packages; four migrations/13 tables; 182 tests; protected hashes and exclusions passed. |
| SD42-RB-001 | 2026-08-26 | Exact v4.1 source rollback build | Pass | Commit `86b73b2…2c2cd` clean-installed; typecheck, lint, build, and 64 tests passed; migration 0003 verified additive. |
| SD42-DOC-001 | 2026-08-26 | Release-document and checkpoint completeness gate | Fail, corrected | Nine focused document/operator/checkpoint tests passed, but the explicit completion-row count found only 57 because the final packaging sprint had no pending completion row. Added the honest pending SD42-CERT-10.5 row; no earlier sprint result changed. |
| SD42-DOC-002 | 2026-08-26 | Corrected documentation gate plus normalized RC0 regression | Pass | Evidence validation, typecheck, lint, five-stage build, 70 JavaScript and 115 TypeScript tests (185 total), and all 58 unique checkpoint rows passed. |
| SD42-PKG-001 | 2026-08-26 | Exact immutable source/root package gates | Pass locally | SOURCE passed locked install, evidence/type/lint, four migrations/13 tables, build, 185 tests, production audit, secret/content/protected-hash and exclusion checks; ROOT passed independent install/type/lint and built-runtime/degraded-route checks; ZIP integrity and sibling hashes verified. |
