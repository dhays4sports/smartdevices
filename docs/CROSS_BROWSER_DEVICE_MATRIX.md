# Cross-Browser and Physical-Device Matrix

Gate: `SD41-CERT-10.1` · local result: **PASS IN AVAILABLE CHROME DESKTOP; REQUIRED EXTERNAL ROWS OPEN** · 2026-08-22 UTC

No unavailable browser, physical device, assistive technology, network profile, or Core Web Vitals environment is labeled as passed.

| Browser/device | Version/environment | Routes and tasks | Outcome | Evidence / limitation |
|---|---|---|---|---|
| Chrome desktop | Cloud Chrome, fixed 1363×936 outer viewport, local Sites preview | First viewport; Home water; Home smoke/heat; Vehicle theft; all three motion controls; scan branches; Device Universe; plan; Pro demo/client preview; keyboard; rapid switching; history back/forward; direct routes | Pass locally | Live interaction trace and committed `docs/visual-baselines/`; extension-only metadata errors were excluded from application results. |
| Built Chrome-compatible HTTP runtime | Vinext production build on local Node/Cloudflare-compatible runtime | Homepage, protect route, library, v1 plan, Pro demo, invalid plan, unauthenticated handoff, missing D1 | Pass locally | Automated runtime tests; no public origin. |
| Edge desktop | Current stable required | Same task trace; keyboard, print/export, share cancellation, reduced motion, offline/degraded | External boundary | Browser session unavailable. |
| Firefox desktop | Current stable required | Same task trace; keyboard, focus restoration, back/forward, print/export | External boundary | Browser session unavailable. |
| iOS Safari | Current and previous major on a physical supported iPhone | Touch; portrait/landscape; safe areas; sticky dock; scan keyboard; reduced motion; background/foreground; share cancellation; print/PDF | External boundary | No physical iOS session or simulator available. |
| Android Chrome | Current stable on a representative physical Android phone | Touch; portrait/landscape; sticky dock; scan keyboard; reduced motion; background/foreground; share cancellation; degraded network | External boundary | No physical Android session or emulator available. |
| Tablet | Current iPadOS Safari and Android Chrome, portrait/landscape | Two-column-to-single-column transitions; text-control scene parity; compare overflow; plan reflow | External boundary | Viewport/device emulation unavailable. |
| Low-power/slow network | Representative budget Android hardware, slow 4G, 4× CPU | First useful paint; lazy scene loading; motion interruption; rapid scene switching; API/image failure | External boundary | True CPU/network throttling unavailable. |

## Available-browser detail

- History restoration: `/` → `/protect/home` → `?concern=water`; Back restored Home with no concern and retained `aria-pressed=true`; Forward restored Water with `aria-current=true`.
- Keyboard order: brand → Devices → Example plan → For agents → About → Open Pro → primary action → Home. Focused Home showed a 3px solid outline.
- Direct-route production boundary: `/pro/workspace` returned “Authorization required” when the explicit demo flag was absent.
- A temporary local-only demo flag was used to inspect Pro, generate a client plan, and open the exact plan URL. The ignored flag file was removed and is not packaged.
- Share/delivery adapters remained local/disabled; no live message, provider call, external account, public deployment, or purchase was attempted.

## Exact external completion procedure

For every open row, extract the SHA-verified root-deployable package and activate only approved staging adapters. Record OS/device, browser build, viewport, input method, candidate ZIP SHA-256, route, expected state, actual state, screenshot/recording, console/network finding, and disposition. Run category → scene → motion → scan → result → plan and Pro → preview → canceled share. Repeat with reduced motion, background/foreground, offline/API failure, missing image, 200%/400% zoom where applicable, rotation, virtual keyboard, Back/Forward, print/PDF, and a revoked/expired plan. Only an owner-approved evidence append may change an external row to pass.

## v4.2 California carrier-pilot matrix — SD42-CERT-10.1

Run date: 2026-08-26 UTC. Seven focused accessibility/browser-source contracts passed in addition to the completed Chrome journey trace in `VISUAL_INTERACTION_CERTIFICATION.md`. The available Chrome run covered homepage-to-carrier discovery, directory search, the canonical Farmers route, all four material questions, water results and cause/effect narration, the carrier-aware v3 plan, production-locked Pro, local-demo exact client preview, the sanitized alias, keyboard order/focus, and disabled delivery. The local-demo flag was removed and production lock was rerun before this gate.

| Environment | Version/date | Result and evidence | Limitation | Retest owner |
|---|---|---|---|---|
| Chrome desktop | Cloud Chrome available 2026-08-26; 1363×936 fixed outer viewport | Pass locally; live semantic/keyboard/visual trace plus built-runtime and focused contracts | No viewport emulation, named AT, network/CPU throttle, or performance API | Release QA |
| Chrome-compatible built runtime | Vinext/Vite versions locked in package manifest; 2026-08-26 | Pass locally; direct homepage, directory, canonical/alias carrier routes, plan, Pro lock, invalid route/handoff, and unavailable storage tests | Local HTTP/worker simulation, not deployed Cloudflare | Release engineering |
| Edge desktop | Current stable at cutover | Not run | Browser unavailable | External browser QA |
| Firefox desktop | Current stable at cutover | Not run | Browser unavailable | External browser QA |
| iOS Safari | Current and previous major on physical supported iPhone | Not run | Device/simulator unavailable | Mobile QA + accessibility reviewer |
| Android Chrome | Current stable on representative physical phone | Not run | Device/emulator unavailable | Mobile QA + accessibility reviewer |
| Tablet/short-screen/landscape | Current iPadOS Safari and Android Chrome, portrait and landscape | Source breakpoints/text equivalents pass; physical row not run | No device or viewport-emulation capability | Mobile QA |
| VoiceOver/TalkBack/NVDA/JAWS | Current supported AT/browser pairs | Semantic-tree spot check only; not externally certified | Named AT sessions unavailable | Accessibility reviewer |
| Slow network/low-power device | Slow 4G and 4× CPU on representative budget hardware | Degraded-state source/runtime contracts pass; physical row not run | True network/CPU throttling unavailable | Performance QA |

External execution is exact: use the immutable final package SHA; record owner, OS/device/browser/AT versions, viewport/input, route/task, expected and actual focus/announcement/state, screenshot/video, console/network output, and disposition. Run homepage discovery → directory → Farmers water → gas class-only guide → v3 plan → Pro exact preview; then repeat direct-route, Back/Forward, rapid switching, stale/withdrawn/unavailable evidence, reduced motion, forced colors, 200%/400% zoom, 320 CSS-pixel reflow, rotation, virtual keyboard, missing image, offline/API failure, background/foreground, and canceled share. No unavailable row is represented as a pass.
