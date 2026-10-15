# SD-MKT-0.5 Validation

## Source-contract validation
Command:
`node --test tests/market-*-contract.test.mjs`

Result: 27/27 passing.

Validated invariants:
- Market.ad remains outside `app/lib/scan.ts`.
- Sponsored fulfillment preview is rendered only after the independent DeviceUniverse recommendation surface.
- Preview requires both server-side `SMARTDEVICES_MARKET_PREVIEW_ENABLED=true` and explicit `marketPreview=1` request state.
- Ordinary shadow requests return only generic acknowledgment, not provider/allocation detail.
- Only canonical `mapped` fulfillment identity may render.
- The mapped device must remain in the current SmartDevices-qualified recommendation set.
- Disclosure states that payment did not determine qualification and did influence placement.
- Missing/rejected mapping renders no sponsored fulfillment UI.

## Remaining production gate
This source-root RC intentionally excludes installed dependencies/build output. Full clean install, typecheck, build, complete tests, accessibility/browser review, and preview deployment verification remain required before public activation.
