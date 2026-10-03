# SD-MKT-0.1 — Market Publisher Foundation

SmartDevices remains the qualification and recommendation authority. Market.ad may receive only the already-qualified device set and may compete only for commercial placement among that set.

## Hard invariants

1. Market.ad must not participate in `buildScanResult` or independent recommendation generation.
2. Enabling or disabling a market adapter must not change device eligibility, priority bands, rationale, carrier guidance, or Smart Safety Plan recommendations.
3. The pilot shares no personal identity, direct-contact data, exact address, policy data, or raw scan answers.
4. Sponsored status attaches to a provider offer, not to SmartDevices' editorial recommendation.
5. The default market adapter is disabled/fail-closed. Shadow mode may compute offers without affecting recommendation ordering.
6. `provider-selected` is not equivalent to purchase or installation; downstream outcomes remain explicit events.

## Added contracts

- `CommercialIntentEnvelope`
- `ProviderOffer`
- `CommercialDisclosure`
- `MarketOutcome`
- `MarketAdapter`
- `DisabledMarketAdapter`
- `ShadowMarketAdapter`
- `HttpMarketAdapter`

## Pilot boundary

Initial intended pilot: `home` → `water` → automatic shutoff. This release establishes the boundary only; it does not activate a live Market.ad endpoint or live-money settlement.
