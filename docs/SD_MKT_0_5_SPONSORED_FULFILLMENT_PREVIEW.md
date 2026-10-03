# SD-MKT-0.5 — Sponsored Fulfillment Preview

Status: preview-only source release.

## Purpose
Render the first consumer-shaped "Ways to get it" sponsored fulfillment component without allowing Market.ad to alter SmartDevices qualification or recommendation logic.

## Gates
The preview renders only when both conditions are true:
1. `SMARTDEVICES_MARKET_PREVIEW_ENABLED=true` on the server.
2. The protection URL explicitly includes `marketPreview=1`.

The ordinary shadow path now returns only a generic acknowledgment and no allocation/provider details to the browser.

## Invariants
- `app/lib/scan.ts` remains Market.ad-free.
- Only a `mapped` OfferIdentityReceipt can become a preview offer.
- The mapped device must exist in the current already-qualified recommendation set.
- Payment may influence provider placement only after qualification.
- Preview UI appears after the SmartDevices recommendation surface and is not part of recommendation ranking.
- Missing or rejected fulfillment identity produces no sponsored UI.

## Production status
Do not enable this flag on the public production site until full build/typecheck/accessibility/browser certification is complete and a real-provider pilot has been approved.
