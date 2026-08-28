# Accessibility and Inclusive-Motion Certification

Gate: `SD41-QA-9.3` · local result: **PASS WITH EXTERNAL ASSISTIVE-TECHNOLOGY/DEVICE MATRIX OPEN** · 2026-08-22 UTC

## Verified locally

- One semantic h1 per primary route; structured h2/h3 hierarchy.
- Native buttons, links, labels, fieldsets, legends, details, lists, definitions, and status text.
- Live desktop keyboard trace reached brand, navigation, primary action, and the Home shortcut in logical order. The focused Home shortcut rendered a 3px solid outline; later scene and scan controls use the same global focus-visible contract. Journey focus restoration moves to the workspace after a domain/concern transition.
- Spatial hotspots have equivalent text buttons. On narrower CSS breakpoints, the hotspot layer is removed and the text controls remain.
- State uses text and `aria-selected`/`aria-pressed`, not color alone.
- Explanation motion has play, pause, replay, and skip controls. A background tab now pauses a playing sequence. `prefers-reduced-motion` collapses transition duration and the component exposes the complete narrated sequence without requiring animation.
- Primary buttons, scene text controls, visible spatial hotspots, domain tabs, and homepage shortcuts have a minimum 44 CSS pixel target contract. Responsive CSS covers phone (`<=720px`), tablet (`<=960px`), short landscape, print, and forced colors. Overflow check at the available desktop viewport was zero.
- Direct-route server output retains useful content before client JavaScript.

## Screen-reader spot check

The browser accessibility snapshot exposed named navigation, region headings, tabs, pressed hotspot states, textual alternative controls, device articles, definitions, plan complementary region, labeled form controls, and footer navigation. This is a semantic-tree spot check, not a claim of VoiceOver, TalkBack, NVDA, or JAWS certification.

## Open matrix

The available cloud browser provided Chrome at 1363×936 only and did not expose viewport/device emulation, contrast tooling, or named assistive-technology sessions. Therefore physical iOS Safari, Android Chrome, Firefox, Edge, VoiceOver, TalkBack, NVDA/JAWS, 200%/400% zoom, 320 CSS pixel reflow, forced-color rendering, virtual-keyboard, and target-device touch testing remain cutover tasks. Static contracts and the available desktop trace passed; unavailable sessions are not fabricated as passes.

## Exact external retest

On the SHA-verified candidate, run axe-core as a supplement (not a replacement for manual review), then complete VoiceOver/Safari and TalkBack/Chrome task traces for category choice → scene text control → scan → result → plan. Repeat with keyboard-only Firefox and Edge at 100%, 200%, and 400%; reflow at 320 CSS pixels; Windows High Contrast; reduced motion; portrait/landscape; and the mobile virtual keyboard open on every scan step. Record browser/AT/OS versions, route, viewport, input method, expected announcement/focus target, actual result, screenshot or recording, and defect disposition.

## v4.2 carrier pilot append · SD42-QA-9.3

Run date: 2026-08-26 UTC. Local result: **PASS FOR SEMANTIC/KEYBOARD/CONTRAST/SOURCE CONTRACTS; NAMED AT AND PHYSICAL DEVICE MATRIX OPEN**.

- Fifteen focused accessibility, carrier-map, causal-demo, and Pro-preview contract tests passed.
- The live Chrome semantic snapshots exposed a named insurance search, canonical navigation, carrier-intent region, four-question progressbar/fieldset/radio structure, four-area ordered Carrier Protection Map, text-equivalent causal narration, eight-item checklist, plan regions, Pro workspace mode, exact-preview controls, and literal adapter status.
- Keyboard focus reached brand, every primary navigation item, primary homepage action, Home/Vehicle/Family/Business, and the subordinate carrier action in logical order. Every recorded element used the global 3px visible outline.
- The corrected carrier action had a 44px rendered height. Existing automated target contracts cover primary controls, scene hotspots/text controls, scan choices, preview controls, and plan actions at 44 CSS pixels or more.
- Representative calculated CSS contrast ratios were: ink/paper 16.07:1, muted/paper 4.95:1, teal/paper 5.64:1, corrected hero carrier link/night 9.17:1, white/dark carrier card 17.51:1, and teal-bright/night 11.41:1. This calculation covers the stable token pairs, not every antialiased pixel or state.
- Visual/spatial carrier results keep an ordered textual source of truth; visual map geometry is hidden from assistive technology. No result uses a score or color alone.
- Reduced-motion and forced-color CSS contracts remain active; causal motion can play, pause, replay, skip, background-pause, and complete through text without animation.

No VoiceOver, TalkBack, NVDA, JAWS, physical touch device, forced-colors renderer, 200%/400% zoom, or true 320 CSS-pixel viewport was available. Those rows remain external and must follow the exact retest protocol above using the final package SHA.
