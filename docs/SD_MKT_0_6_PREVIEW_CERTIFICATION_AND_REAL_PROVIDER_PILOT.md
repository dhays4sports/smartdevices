# SD-MKT-0.6 — Preview Certification & Real Provider Pilot

Status: source-complete; public sponsorship remains disabled.

## Scope
This release hardens the SD-MKT-0.5 preview and introduces a real-provider pilot registry without turning a real provider into a public sponsored placement.

## Real-provider pilot
The first real provider identity is `moen-direct`, bound only to canonical SmartDevices device `moen-flo-shutoff` and official Moen destination hosts. The registry is deliberately `observe-only`.

SmartDevices currently records the Moen Flo device as `availability: unavailable`. Therefore the real-provider certification gate returns `observe-only`, and the consumer sponsored preview is suppressed if the real-provider pilot flag is enabled. A bid, clearing result, or sponsorship payment cannot override device availability or editorial eligibility.

## Required public-preview gates
A real provider may become preview-eligible only when all are true:
1. Market.ad mapped the exact allocated bid to a qualified SmartDevices device.
2. Provider + device appear in the explicit real-provider registry.
3. Destination is HTTPS and on that provider's allowlist.
4. SmartDevices device status remains active + editorially verified.
5. SmartDevices availability is freshly `available`.
6. Provider registry mode is changed from `observe-only` to `preview-eligible` after review.
7. `SMARTDEVICES_MARKET_REAL_PROVIDER_PILOT=true` is explicitly enabled.
8. Existing shadow and preview gates are also enabled.

## Accessibility/source certification
The preview uses a labeled complementary region, native link semantics, an explicit sponsored label, a native `<details>/<summary>` disclosure, and textual rather than color-only disclosure of paid influence. Responsive/browser certification still requires a successful clean dependency install and browser run.

## Build gate
`npm ci` did not complete within the available execution window in this environment. Full typecheck/build/browser/accessibility certification is therefore not claimed. Source-contract certification passes and the production activation gate remains closed.

## Source-contract result
`node --test tests/market-*-contract.test.mjs` passed 32/32 tests in the release workspace.
