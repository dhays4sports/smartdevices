# SD-MKT-0.7 — Live Fulfillment Verification

Status: source-complete; real-provider preview capable; public sponsorship remains disabled.

## Purpose
SD-MKT-0.7 adds a separate freshness gate between a valid Market.ad allocation and any real-provider preview. A mapped provider/device pair is insufficient by itself. SmartDevices must also have fresh, authoritative evidence that the destination is currently purchasable.

## First verified source
`phyn-direct` / `phyn-plus-v2` is the first provider/device pair promoted to `preview-eligible` in the registry.

Manufacturer evidence checked 2026-09-22:
- canonical product: Phyn Plus Smart Water Assistant + Shutoff (2nd Gen)
- manufacturer product page: `https://phyn.com/products/phyn-plus-smart-water-assistant-shutoff-v2`
- observed manufacturer-direct price: USD 579.99
- observed purchase signal: Add to cart
- observed availability: available
- capability relevant to this pilot: automatic main-water shutoff

Generic `moen-direct` remains `observe-only` because the reviewed generic manufacturer-store page shows the relevant configuration sold out. This does not describe carrier-specific program inventory; SD-MKT-0.7.1 separately verifies `moen.com/farmers`.

## Verification doctrine
A real provider is preview-eligible only if all earlier qualification/mapping gates pass and the latest provider verification record:
1. matches the exact provider + SmartDevices device,
2. comes from an HTTPS authoritative source whose host matches the declared source host,
3. is no older than `SMARTDEVICES_MARKET_PROVIDER_MAX_AGE_HOURS` (default 168 hours),
4. says `availability=available`,
5. carries an explicit `buy` or `add-to-cart` signal,
6. carries a positive USD price for this first pilot,
7. is accepted by the existing provider allowlist + device editorial/availability gates.

Stale, missing, unavailable, or malformed evidence automatically falls back to observe-only behavior.

## Persistence
Migration `0009_market_provider_verification.sql` creates an append-only provider verification receipt for mapped shadow allocations. The operator view exposes verification state, check timestamp and verified price without changing the consumer recommendation record.

## Safety boundary
This phase does not establish that Phyn or Moen are paying advertisers, partners, or Market.ad participants. It establishes that SmartDevices can verify a real fulfillment destination before a separately authenticated Market.ad offer would ever be allowed into preview. Public sponsorship remains disabled.
