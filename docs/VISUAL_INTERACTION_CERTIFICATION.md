# Visual and Interaction Regression Certification

Gate: `SD41-QA-9.2` · local result: **PASS AT AVAILABLE DESKTOP VIEWPORT; EXTERNAL RESPONSIVE MATRIX OPEN** · 2026-08-22 UTC

## Environment and build provenance

- Candidate checkout: SmartDevices v4.1 working tree based on verified v4.0 RC1 SHA-256 `0e19b173ea61d1df5a8fa5c024a9c012243bdbe6f3e67eacdacd22d29b718202`.
- Preview: local Sites agent preview at `http://terminal.local:4173`; no public deployment.
- Browser surface: cloud Chrome, 1363×936 outer viewport / 1348×926 captured page area.
- Pro inspection: explicit local `.env.local` demo mode with memory adapters; the file was removed immediately after capture. Production authorization was separately confirmed to fail closed.
- The available browser did not expose viewport or device emulation. Phone, tablet, short-screen, landscape, virtual-keyboard, physical touch, Firefox, Edge, iOS Safari, and Android Chrome images are therefore not represented as approved baselines.

## Interaction evidence

| Flow | Result | Evidence |
|---|---|---|
| First viewport | Pass after correction | Headline, primary action, and Home/Vehicle/Family/Business shortcuts are visible together at 1363×936. |
| Home water | Pass | Spatial scene and six equivalent text controls; water demo play/pause/replay/skip; five-question scan; visible unknown; two source-linked results; one-item v2 plan. |
| Home smoke/heat | Pass | Home scene, life-safety language, and the only authorized smoke/heat causal demonstration. |
| Vehicle theft | Pass | Vehicle-specific scene, theft demo, five-question scan, compatibility/privacy branches, and two defensible results. |
| Family/Business | Pass | Both select rapidly, use neutral starter treatments, and never render the Home scene. |
| Device Universe | Pass | Concern → area → solution class → option map plus ordered-list equivalent; no pseudo-score. |
| Smart Safety Plan | Pass | Sanitized URL, Protection Map, provenance/unknowns, decision controls, and optional post-value contact checkpoint. |
| SmartDevices Pro | Pass in explicit demo mode | Template application, three literal selected options, labeled professional note boundary, generated client plan, exact client preview, disabled live engagement semantics. |
| Rapid switching | Pass | Home → Vehicle → Family → Business → Vehicle → Home completed without stale scene state or application console errors. Browser-extension metadata errors were excluded as non-application noise. |
| Direct routes | Pass | `/devices`, v1 `/plans/demo`, Home/Vehicle protect routes, and production-locked `/pro/workspace` loaded directly. |

## Stored baselines

These JPEG files are committed as build evidence. Full-page images use the browser's captured page width; `1363x936` names identify the available viewport, not a claim that the page-area crop is exactly that size.

| File | Scope | SHA-256 |
|---|---|---|
| `homepage-first-viewport-1363x936.jpg` | First viewport | `3fd5bfeb30b90aacdaaa4dba18be5c01f691e728328242d0bfa73e8a564d69e3` |
| `home-water-scene-1363x936.jpg` | Loaded spatial Home scene | `5e80ae0f65ff847aa54c5c8ae1e5386927cc5fc01a9e5b7e0586af63997e2483` |
| `home-smoke-heat-desktop-full.jpg` | Smoke/heat scene and demo | `9148c4254a9e90045215267616457a0e8b4d583638770e8e3ef1fe18a1678bca` |
| `vehicle-theft-desktop-full.jpg` | Vehicle scene and theft demo | `51c98169cb743ad1ddd3805e58fa2e73cd895ba14d60c856e3fca7f9434adeec` |
| `home-water-protection-map-1363x936.jpg` | Protection Map and Device Universe | `e6b00e018f48d37bea0c53d950a1bc0eb6914c786ff2ede47b7cca57b5a4e902` |
| `home-water-safety-plan-1363x936.jpg` | Consumer plan | `1d602da20b23cb84221b07d50f4c06b7bbe54fbcbaafd2281e54826ae34dfa71` |
| `pro-workspace-demo-ready-1363x936.jpg` | Pro builder | `6b24547f9b22c2d820dc346f0377398684f25c7bfde9ad2b86a9691a0c1d1997` |
| `pro-client-preview-1363x936.jpg` | Pro plan generation and follow-up semantics | `01616113a924f6fcf51efd27c9a56f6dd95a9eaac6ae2460ec1295e2c237acda` |
| `homepage-a11y-1363x936.jpg` | Post-9.3 44px control correction | `4005b13e8cde767dd51c5fe81ce8255af1bb7e46b5f4a65198d39f2851139623` |
| `home-water-scene-a11y-1363x936.jpg` | Post-9.3 44px hotspot/text controls | `9f8720d0fff558f6d3d5eff05d107620e51c97eb977a0e3a93a241f0bc5a8057` |

## Open external visual matrix

Before public cutover, repeat every materially changed flow at 320×568, 390×844, 768×1024, 1024×768, 1280×720, and at least one current physical iOS and Android device. Include virtual-keyboard-open scan states, 200% and 400% zoom, rotation, reduced motion, forced colors, slow network, and a missing-image run. Store browser/version, OS, viewport, candidate package SHA, screenshot, and result; do not backfill those rows from CSS inspection.

## v4.2 California carrier pilot append · SD42-QA-9.2

Run date: 2026-08-26 UTC. Local result: **PASS IN AVAILABLE 1363×936 CLOUD CHROME AFTER FOUR PRESERVED CORRECTIONS; PHYSICAL/RESPONSIVE MATRIX OPEN**.

The inspected trace covered homepage → `/insurance` → canonical/alias Farmers route → requirement/water intent → four-question scan → Carrier Protection Map → class guidance → water demonstration/checklist → governed options → carrier-aware plan v3. It also covered production-locked Pro, explicit local demo Pro, carrier template, exact desktop/mobile client preview, preview acknowledgement, disabled share adapter, keyboard focus order, sanitized alias, and direct v3 plan reload.

| Evidence ID | Initial rendered result | Correction and rerun |
|---|---|---|
| SD42-VQA-001 | Fail: the subordinate homepage carrier action used a light-page muted token on the dark hero; several v4.2 aliases were undefined | Central aliases and explicit dark-surface foregrounds added; homepage link rendered at rgba white 0.7 with a 44px target and visible 3px focus outline; directory card text rendered white |
| SD42-VQA-002 | Pass | `/insurance` exposed one useful published destination, search without contact, dark carrier card with readable text, independence disclosure, and zero horizontal overflow |
| SD42-VQA-003 | Pass after continuity correction | Four material questions produced four separated truth areas, class guide, water demo, checklist, two evidence-supported options, one independent option, and a v3 plan; sanitized URL contained governed IDs but no raw question/option values, free text, PII, address, policy/claim/contact data, or restricted evidence |
| SD42-VQA-004 | Fail: Pro mobile preview collapsed to 56px because the inherited flex status layout was reused | Generated preview converted to a one-column grid with `width:100%`; desktop rendered at 794px and mobile at 390px |
| SD42-VQA-005 | Fail: global `frame-ancestors 'none'`/`DENY` blocked the exact same-origin client iframe | Only `/plans/*` now permits same-origin framing; exact desktop and 390px mobile client plan rendered inside Pro, including professional context and carrier provenance; cross-origin framing remains denied |
| SD42-VQA-006 | Pass | Production Pro route returned `UNAUTHENTICATED`; explicit local demo displayed its boundary; PII-free water template selected two options; share stayed disabled until acknowledgement and then returned literal “Not sent” adapter status |
| SD42-VQA-007 | Pass | Keyboard order reached brand, all navigation items, primary CTA, Home/Vehicle/Family/Business, then carrier action; each displayed a 3px visible outline |

No v4.2 browser image files are claimed as stored baselines: the available browser surface supported live visual emission but not the approved responsive/browser matrix or a durable screenshot export workflow in this run. Automated CSS/source/runtime regression covers the corrected contracts. The existing v4.1 image baselines remain historical and were not replaced.
