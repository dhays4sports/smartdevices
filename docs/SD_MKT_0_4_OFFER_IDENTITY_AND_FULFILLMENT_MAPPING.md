# SD-MKT-0.4 — Offer Identity & Fulfillment Mapping

Status: **implemented in source; shadow-only; consumer influence disabled**.

## Purpose

Close the identity gap between a MARKET-0.7 allocation and a concrete SmartDevices fulfillment option. A Market.ad provider win is not enough by itself to identify a product. SmartDevices accepts a fulfillment mapping only when the exact winning bid carries a canonical, explicit SmartDevices device reference that is already present in the SmartDevices-qualified recommendation set.

## Canonical provider bid offer payload

A MARKET-0.7 standing bid may carry:

```json
{
  "offer": {
    "schema": "smartdevices.market.fulfillment/1",
    "offer_id": "offer-moen-direct-1",
    "device_ref": {
      "namespace": "smartdevices.com/device",
      "id": "moen-flo-shutoff"
    },
    "fulfillment": {
      "type": "manufacturer-direct",
      "destination_url": "https://example.com/moen"
    }
  }
}
```

Supported fulfillment types are `manufacturer-direct`, `retailer`, `installer`, and `marketplace`.

## Mapping rules

The resolver requires all of the following:

1. Allocation ID and signed allocation receipt ID exist.
2. Allocation names an exact winning `bid_id` and `provider_id`.
3. The stored winning bid exists and its `provider_id` matches the allocation provider.
4. The bid carries the exact `smartdevices.market.fulfillment/1` payload.
5. `device_ref.namespace` is exactly `smartdevices.com/device`.
6. The referenced `device_ref.id` is already in `CommercialIntentEnvelope.eligibleDeviceIds`.
7. Any destination URL is HTTPS.

SmartDevices does not infer a device from provider name, provider identity, destination URL, offer copy, category, or historical association.

## Mapping states

- `mapped` — the allocated bid is bound to an already-qualified SmartDevices device.
- `unmapped` — required canonical fulfillment metadata is absent or unavailable.
- `rejected` — metadata exists but conflicts with the allocation or names a device SmartDevices did not qualify.

A filled market with an `unmapped` or `rejected` offer remains a market fill for observability but is **not eligible for future sponsored rendering**.

## Offer identity receipt

Each allocated shadow result creates an append-only `OfferIdentityReceipt` containing:

- allocation ID
- allocation receipt ID
- winning bid ID
- provider ID/name
- provider offer ID
- SmartDevices device ID, when mapped
- fulfillment type and HTTPS destination, when mapped
- SHA-256 hash of the canonical provider offer payload
- SHA-256 binding hash over the allocation/bid/provider/mapping relationship

Persistence is in `market_offer_identity_receipts` via migration `0008_market_offer_identity.sql`.

The receipt is a SmartDevices audit receipt. It does not replace the MARKET-0.7 signed allocation receipt; it binds SmartDevices' interpretation of the winning bid to that receipt lineage.

## Consumer boundary

This phase remains shadow-only. No mapped offer is rendered to consumers, no recommendation is reordered, and no settlement is triggered. `app/lib/scan.ts` remains free of Market.ad imports and sponsorship logic.

## Activation gate for a future sponsored UI

A future consumer-visible sponsored fulfillment placement must require `OfferIdentityReceipt.status === "mapped"`. `filled` alone is insufficient.
