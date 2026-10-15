# SD-MKT-0.7 Validation

Date: 2026-09-22
Status: source-contract certified; live MARKET-0.7 interoperability proof passed; public sponsorship disabled.

## Source-contract certification

Command:

```bash
node --test tests/market-*-contract.test.mjs
```

Result: **38/38 passed**.

Coverage includes:
- Market adapter isolation from `scan.ts`
- bounded commercial intent
- canonical fulfillment identity
- real-provider allowlists
- provider verification freshness and authoritative-source binding
- current availability + explicit purchase signal + positive price requirement
- append-only provider verification receipts
- operator observability
- preview gating and disclosure

## Live MARKET-0.7 interoperability proof

A local MARKET-0.7 runtime was reset and populated with:
- `phyn-direct` — automatic water shutoff, canonical `phyn-plus-v2` fulfillment payload
- `moen-direct` — automatic water shutoff, canonical `moen-flo-shutoff` payload
- `wrong-provider` — roofing only, bid price USD 1,000

The publisher request was signed as `smartdevices.com` using the MARKET-0.7 Ed25519 request contract.

Result:
- winner: `phyn-direct`
- winning bid: `bid-phyn`
- mapped SmartDevices device: `phyn-plus-v2`
- fulfillment type: `manufacturer-direct`
- canonical destination: `https://phyn.com/products/phyn-plus-smart-water-assistant-shutoff-v2`
- clearing amount: USD 7.118495
- pricing rule: `quality_adjusted_second_price`
- incompatible USD 1,000 bidder: rejected with `capability_mismatch`

This proof does not represent a real paid advertisement or commercial relationship with Phyn. It proves that a currently verifiable real fulfillment destination can survive the same Market.ad qualification, mapping, and preview gates intended for an authenticated future provider participant.

## External fulfillment evidence captured for this release

Phyn manufacturer evidence, checked 2026-09-22:
- Phyn Plus Smart Water Assistant + Shutoff (2nd Gen)
- manufacturer-direct price: USD 579.99
- Add to cart / Buy path present
- automatic shutoff described by manufacturer

Moen manufacturer evidence, checked 2026-09-22:
- Moen Flo Shutoff listed at USD 623.99 for the reviewed configuration
- manufacturer store currently displayed Sold out for that configuration

Accordingly:
- `phyn-direct` = `preview-eligible` when every other Market.ad + SmartDevices gate passes
- `moen-direct` = `observe-only`

## Remaining certification boundary

This source-root RC still excludes installed dependencies. Full clean install, TypeScript compilation, production build, browser matrix, and accessibility runtime certification remain required before any public activation.
