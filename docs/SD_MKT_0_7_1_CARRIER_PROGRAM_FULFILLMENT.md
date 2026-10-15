# SD-MKT-0.7.1 — Carrier-Program Fulfillment

## Purpose

Correct the assumption that generic manufacturer retail availability is equivalent to all manufacturer fulfillment channels. A carrier-specific program may remain purchasable even when a generic retail SKU/configuration is sold out.

## Farmers / Moen proof

User-supplied screenshots captured September 22, 2026 from `https://www.moen.com/farmers` establish two currently presented Farmers-program fulfillment variants for the canonical SmartDevices device `moen-flo-shutoff`:

- `offer-moen-farmers-device-only` — **$445.00**, SHOP NOW, free shipping, five-year limited warranty, customer may use their own plumber.
- `offer-moen-farmers-installed` — **$745.00**, SHOP NOW, standard installation included, free shipping, five-year limited warranty.

Evidence artifacts:

- `docs/evidence/market/moen-farmers-device-only-2026-09-22.png`
- `docs/evidence/market/moen-farmers-installed-2026-09-22.png`

## Architecture rule

`Device availability != fulfillment-channel availability`.

The existing generic `moen-direct` record remains observe-only because the reviewed generic Moen store configuration is sold out. A new `moen-farmers-program` record is separately verified and may be preview-eligible only when an explicit Farmers program context is present.

A carrier-program offer must carry canonical Market.ad fulfillment metadata:

```json
{
  "schema": "smartdevices.market.fulfillment/1",
  "offer_id": "offer-moen-farmers-device-only",
  "device_ref": { "namespace": "smartdevices.com/device", "id": "moen-flo-shutoff" },
  "fulfillment": {
    "type": "carrier-program",
    "destination_url": "https://www.moen.com/farmers",
    "program_ref": {
      "carrier_id": "farmers",
      "program_id": "farmers-ca-flo-water-shutoff",
      "jurisdiction": "US-CA"
    },
    "variant_id": "device-only"
  }
}
```

The installed variant uses the same program reference and `variant_id: "standard-installation"`.

## Safety / independence boundary

- Market.ad still cannot influence SmartDevices device qualification.
- Carrier-program availability does not rewrite the generic catalog availability field.
- The Farmers program cannot surface for a generic consumer context; the intent must explicitly declare Farmers program context.
- A Market.ad bid must carry the exact canonical device, program, and offer identity.
- Public sponsorship remains disabled.
