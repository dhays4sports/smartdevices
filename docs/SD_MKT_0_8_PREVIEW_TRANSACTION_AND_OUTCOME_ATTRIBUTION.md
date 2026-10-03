# SD-MKT-0.8 — Preview Transaction & Outcome Attribution

Status: source-complete, preview-only, public sponsorship disabled.

## Objective

Bind consumer preview interaction back to the exact Market.ad economic lineage without allowing the browser to invent or substitute commercial identifiers.

## Implemented flow

1. SmartDevices independently qualifies devices.
2. MARKET-0.7 clears a shadow opportunity.
3. Offer identity maps the exact winning bid to an already-qualified SmartDevices device.
4. Provider verification proves the fulfillment channel is currently eligible.
5. In explicit preview mode, the server issues a 30-minute HMAC-SHA256 attribution token.
6. The token binds intent, opportunity, allocation, allocation receipt, offer-identity receipt, provider-verification receipt, offer, provider, device and destination.
7. The preview component records `sponsored-offer-viewed` and, when the user chooses the outbound provider link, `sponsored-offer-opened`.
8. `/api/market/outcome` verifies token signature and expiry before persisting an append-only attribution event.
9. Duplicated browser retries are idempotent per transaction + event.
10. Operator-only Market observability reports preview views, opens and open rate with receipt lineage.

## Security / privacy boundaries

- `SMARTDEVICES_MARKET_OUTCOME_SECRET` must be at least 32 characters and remain server-side.
- The browser receives a signed token, never the signing secret.
- The browser cannot change provider, device, allocation, receipt IDs or destination without invalidating the token.
- Attribution tokens expire after 30 minutes.
- Only preview events are accepted; purchase or installation is not inferred from a click.
- The outcome table contains commercial lineage, not name, email, phone, address or raw scan answers.
- Public sponsorship remains disabled.

## Fail-closed behavior

If outcome signing is not configured, the sponsored preview may still explain the offer but the outbound CTA is disabled as `Attributed preview unavailable`. This prevents an untracked preview click from being treated as an attributable Market.ad outcome.

## Persistence

Migration: `drizzle/0010_market_outcome_attribution.sql`

Table: `market_outcome_attributions`

Events currently persisted:

- `sponsored-offer-viewed`
- `sponsored-offer-opened`
- `provider-selected` (reserved for an explicit future selection action; not inferred today)

The unique transaction/event key ensures exact retries do not create duplicate economic observations.

## Recommendation independence

No Market.ad attribution code enters `app/lib/scan.ts`. The commercial preview remains downstream of the independent recommendation surface.
