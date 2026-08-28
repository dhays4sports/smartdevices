# Performance and Degraded-Mode Certification

Gate: `SD41-QA-9.4` · local result: **PASS; CORE WEB VITALS/THROTTLED DEVICE EVIDENCE OPEN** · 2026-08-22 UTC

## Implemented controls

- Public value works without database, identity, analytics, communications, or partner services.
- No third-party script, analytics beacon, product imagery, web font, or affiliate SDK blocks the public route.
- Spatial images use direct static delivery, reserved scene geometry, native lazy loading, and a meaningful text-preserving failure treatment.
- Device catalog is a 15-record source-led seed rather than a large thin payload.
- CSS provides reduced motion, short landscape, phone/tablet breakpoints, direct-route content, and no horizontal overflow at the measured desktop viewport.
- Explanatory animation pauses when the document becomes hidden. API and storage unavailability are literal; local plans remain useful.

## Budgets and measured build output

| Resource | Budget | Candidate result |
|---|---:|---:|
| Home scene image | ≤1.7 MB, lazy | 1,650,529 bytes · pass |
| Vehicle scene image | ≤1.7 MB, lazy | 1,648,195 bytes · pass |
| Client CSS | ≤55 KB raw | 47,421 bytes / 10,645 bytes gzip · pass |
| Largest client framework chunk | ≤210 KB raw | 189,805 bytes / 58,935 bytes gzip · pass |
| Explorer client chunk | ≤35 KB raw | 24,251 bytes / 7,330 bytes gzip · pass |
| Complete `dist/` | Informational | 6.2 MB before packaging |

These are asset and bundle budgets, not network-transfer claims. The exact initial route dependency graph and compression headers must be remeasured on the final HTTPS staging origin.

## Build and degraded-mode evidence

The verified Vinext production build completed all five environments and emitted 19 application/API routes.

| Condition | Local result | Evidence |
|---|---|---|
| Failed image | Pass by component/source contract | `onError` replaces the image with an explicit unavailable treatment while retaining every text control. |
| Failed API / missing D1 | Pass in built runtime | Hosted plan read returns `503 STORAGE_UNAVAILABLE`; public Home water route remains `200` and useful. |
| Disabled analytics | Pass by unit/source contract | Disabled adapter returns literal `disabled` and performs no `fetch` or `sendBeacon`. |
| Unavailable local storage | Pass by code/test contract | Draft writes are caught; sanitized plan URL remains readable. No false save success is shown. |
| Stale/unavailable product | Pass in matching/content tests | Non-publishable records are excluded and results may contain fewer items. |
| Invalid handoff | Pass in runtime/typed tests | Unauthenticated, malformed, expired, oversized, and replay-invalid inputs fail literally. |
| Expired/revoked plan | Pass in state/runtime contract | Persistent reads return unavailable; terminal state cannot move forward. |
| Background tab | Pass | Visibility change pauses a playing explanation without advancing or resetting narration. |
| Repeated scene switching | Pass in reducer and live Chrome | Revision invalidates stale focus/state; six rapid switches produced one selected domain. |
| Slow network / low-power hardware | External boundary | Lazy images, reserved geometry, textual-first content, and reduced motion are implemented; real throttled/hardware timing was unavailable. |

## Core Web Vitals statement

Targets are LCP ≤2.5 s, CLS ≤0.10, and INP ≤200 ms. The connected local preview and non-public origin could not produce a valid representative field or Lighthouse certification, and no production origin was authorized. Consequently no valid LCP, CLS, or INP pass is claimed.

On the SHA-verified staging candidate, collect at least five cold-cache Lighthouse runs for mobile and desktop, Web Vitals RUM segmented by route/device, and a slow-4G/4×CPU trace. Report median and p75 LCP/CLS/INP including origin, device/emulation, browser/tool versions, headers, cache state, and sample count.

## Browser/device statement

Rendered Chrome desktop flows passed. iOS Safari, Android Chrome, current Edge, and Firefox were not available as independent sessions. True network throttling, background/foreground on a physical phone, and low-power hardware remain external cutover evidence.

## v4.2 carrier pilot append · SD42-QA-9.4

Run date: 2026-08-26 UTC. Local result: **PASS FOR BUILD BUDGETS AND DEGRADED MODES; REPRESENTATIVE CWV/THROTTLED HARDWARE OPEN**.

| Resource | v4.2 reviewed budget | Candidate result |
|---|---:|---:|
| Home scene image | ≤1.7 MB, lazy | 1,650,529 bytes · pass |
| Vehicle scene image | ≤1.7 MB, lazy | 1,648,195 bytes · pass |
| Global CSS | ≤70 KB raw / ≤15 KB gzip | 64,907 / 13,562 bytes · pass |
| Largest client framework chunk | ≤210 KB raw | 189,805 bytes / 58,935 gzip · pass |
| Carrier selector client chunk | Informational | 23,434 bytes / 7,322 gzip |
| Protection Explorer client chunk | ≤35 KB raw | 19,249 bytes / 5,871 gzip · pass |
| Safety Plan client chunk | Informational | 17,986 bytes / 5,499 gzip |
| Complete `dist/` | Informational | 6,525,440 bytes |

The v4.1 55 KB raw CSS budget was exceeded after adding the governed carrier directory, scan, maps, class guides, checklist, plan v3, and Pro preview. This is preserved as a budget correction rather than described as a v4.1 pass. The reviewed v4.2 guard is 70 KB raw and 15 KB gzip; an automated test now enforces both. Raw size is a maintainability guard, while the gzip result better approximates transfer under normal compression.

Eighteen focused resilience/runtime checks passed before the CSS guard was added; the corrected focused suite includes the guard. Verified states include lazy/missing-image text retention, background-tab pause, analytics disabled without storage or beacon calls, local-plan memory plus sanitized-URL fallback, canonical/invalid carrier routes, evidence freshness/availability behavior, unauthenticated handoff, missing D1 `503`, public-route continuity, and production-locked Pro behavior. The full normalized suite separately passed at 180/180 after rendered corrections.

The cloud-browser read-only evaluation surface did not expose `window.performance`, viewport/device emulation, network throttling, or CPU throttling. The local HTTP preview is not a representative public HTTPS origin and no deployment was authorized. Therefore LCP ≤2.5s, CLS ≤0.10, and INP ≤200ms remain **not validly measurable** here; no pass is claimed. Complete the existing five-run cold-cache Lighthouse and p75 RUM procedure on the exact SHA-verified HTTPS staging candidate, adding `/insurance`, `/farmers`, carrier results, plan v3, and Pro exact preview to the route matrix.
