# SD-MKT-0.4 Validation

Status: **PASS for source-contract and MARKET-0.7 interoperability checks; full clean repository build remains an external release gate.**

## Source-contract suite

Executed:

```bash
node --test \
  tests/market-foundation-contract.test.mjs \
  tests/market-shadow-contract.test.mjs \
  tests/market-shadow-observability-contract.test.mjs \
  tests/market-offer-identity-contract.test.mjs
```

Result: **22/22 passing**.

Assertions include:

- canonical fulfillment payload is required
- exact winning bid ID is used
- provider/bid mismatch is rejected
- mapped device must already exist in the SmartDevices-qualified device set
- offer payload and allocation binding hashes are retained
- mapping receipts are persisted independently and append-only
- operator UI distinguishes market fill from verified fulfillment mapping
- recommendation engine remains isolated from Market.ad

## MARKET-0.7 interoperability check

A local MARKET-0.7 runtime was started with:

- SmartDevices publisher identity
- two compatible water-shutoff providers with canonical offer payloads
- one incompatible provider bidding `$1,000`

Observed result:

- winner: `provider.a`
- winning bid: `bid-a`
- mapped SmartDevices device: `moen-flo-shutoff`
- clearing amount: `$12`
- pricing rule: `quality_adjusted_second_price`
- signed allocation receipt returned
- incompatible `$1,000` provider rejected for `capability_mismatch`
- exact winning bid retained its canonical `smartdevices.market.fulfillment/1` payload

This proves MARKET-0.7 can preserve the provider offer metadata required by the SmartDevices mapping contract while retaining its qualification-before-economics doctrine.

## Remaining release gate

The v5.2 artifact remains a source-root RC. A clean dependency install plus repository-wide typecheck, lint, build, and full test suite must still complete in the target release environment before production certification.
