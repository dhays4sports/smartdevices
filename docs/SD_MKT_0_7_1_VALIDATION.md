# SD-MKT-0.7.1 Validation — Carrier-Program Fulfillment

Date: 2026-09-22

## Evidence accepted

Two user-supplied screenshots from the official Moen/Farmers fulfillment page were incorporated as local evidence artifacts:

- `moen-farmers-device-only-2026-09-22.png` — $445.00 device-only path, SHOP NOW, free shipping, five-year limited warranty, own-plumber option.
- `moen-farmers-installed-2026-09-22.png` — $745.00 installation path, SHOP NOW, standard installation included, free shipping, five-year limited warranty.

The source destination is modeled as `https://www.moen.com/farmers`.

## Contract result

`node --test tests/market-*.test.mjs`

- tests: 43
- pass: 43
- fail: 0

## Gates proven

- `carrier-program` is a first-class fulfillment type.
- Carrier/program identity is part of the canonical Market.ad offer payload.
- Generic Moen retail remains separate and may remain sold out.
- A carrier-program channel may pass fulfillment availability from its own fresh verification record without mutating the generic device catalog availability field.
- Moen/Farmers preview requires explicit Farmers program context.
- Program carrier/program mismatches reject the offer.
- `scan.ts` remains independent of Market.ad.
- Public sponsorship remains disabled.

## Remaining boundary

This source-root release still requires the normal clean dependency install/typecheck/build/browser certification before production activation. The Farmers-program channel is modeled and verified for preview eligibility; it is not asserted to be a paid Market.ad advertiser or public sponsorship relationship.
