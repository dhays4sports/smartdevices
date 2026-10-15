# SD-MKT-0.2 — Shadow Market

## Purpose
Connect the already-qualified SmartDevices Home/Water/Automatic-Shutoff result set to MARKET-0.7 without changing any consumer-visible recommendation, ordering, label, or plan behavior.

## Hard boundaries
- `app/lib/scan.ts` remains untouched by Market.ad.
- Shadow output is never rendered in the SmartDevices consumer UI.
- The browser never receives the Market.ad publisher private key.
- Only a bounded anonymous intent envelope crosses the server boundary.
- Name, email, phone, street address, policy data, claim data, raw scan answers, and private notes are not part of the market intent contract.
- The route is disabled unless `SMARTDEVICES_MARKET_SHADOW_ENABLED=true` and all publisher credentials are configured.
- Market failure is non-blocking and cannot change SmartDevices recommendations.

## Runtime flow
`ScanResult -> buildWaterShutoffShadowIntent -> /api/market/shadow -> signed MARKET-0.7 POST /v1/opportunities -> POST /v1/opportunities/:id/clear`

MARKET-0.7 persists the opportunity, evaluated bids, allocation, and signed allocation receipt. SmartDevices treats the returned clearing data as shadow-only telemetry and does not render it.

## Pilot scope
- domain: `home`
- concern: `water`
- required signal: at least one already-qualified recommendation contains `Automatic shutoff`
- jurisdiction: `US-CA`
- Market.ad market: defaults to `ca-water-shutoff`
- direct provider contact: forbidden
- personal data sharing: forbidden

## Activation gate
Do not enable in production until the Market.ad runtime publisher identity exists, the target market/providers/bids are configured, the privacy/consent treatment for anonymous shadow telemetry has been approved, and the full clean build/test suite passes.
