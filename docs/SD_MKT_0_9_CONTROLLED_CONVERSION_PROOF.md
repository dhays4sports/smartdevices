# SD-MKT-0.9 — Controlled Conversion Proof

## Purpose

Extend the preview-only Market.ad pilot from attributed views/opens into explicit conversion proof without enabling public paid placement.

## Evidence classes

SmartDevices deliberately keeps two conversion evidence classes separate:

1. `self-reported` — a preview participant explicitly confirms purchase or installation.
2. `provider-verified` — the matched provider sends a correctly signed callback for the same attributed transaction.

A click or provider-page open is never treated as purchase, installation, or conversion.

## User-confirmed flow

The server issues a second conversion token bound to the same transaction lineage as the click-attribution token. The conversion token lasts 24 hours and is used only for explicit confirmation.

`POST /api/market/conversion/user`

Accepted events:

- `purchase`
- `installation`

The request must include `confirmed: true`. The resulting receipt is permanently marked `self-reported`.

## Provider callback flow

`POST /api/market/conversion/provider`

Callbacks are disabled unless `SMARTDEVICES_MARKET_PROVIDER_CALLBACKS_ENABLED=true`.

Required headers:

- `x-market-provider-id`
- `x-market-timestamp`
- `x-market-nonce`
- `x-market-signature`

The HMAC-SHA256 signature covers provider ID, timestamp, nonce and SHA-256 of the raw request body. The callback timestamp must be within five minutes. Provider/nonces are persisted and cannot be replayed.

Provider secrets are supplied through `SMARTDEVICES_MARKET_PROVIDER_CALLBACK_SECRETS_JSON` and never enter the browser.

Provider callbacks can only attach to an existing attributed preview transaction, and the signed provider identity must match the provider already bound to that transaction.

## Conversion receipt

Every conversion receipt binds:

- preview transaction
- intent
- opportunity
- allocation
- allocation receipt
- offer-identity receipt
- provider-verification receipt
- offer
- provider
- SmartDevices device
- event
- source
- confidence
- occurrence time

The receipt stores a deterministic SHA-256 binding hash. Provider order/reference identifiers are stored only as a hash.

## Non-goals

This release does not:

- enable public sponsorship;
- claim a real commercial relationship with a provider;
- settle Market.ad economics;
- infer conversion from a click;
- let self-reported conversion masquerade as provider verification;
- modify SmartDevices recommendation logic.
