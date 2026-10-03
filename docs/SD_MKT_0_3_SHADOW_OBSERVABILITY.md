# SD-MKT-0.3 — Shadow Market Observability

## Purpose
Measure the first SmartDevices × Market.ad pilot without allowing Market.ad to influence the consumer experience.

## Stored record
Each eligible Home → Water → Automatic Shutoff shadow run stores:
- SmartDevices intent ID
- Market.ad opportunity/allocation/receipt IDs
- fill / no-market / error state
- qualified SmartDevices device IDs
- hypothetical winning provider ID
- clearing amount/currency when filled
- evaluated bid eligibility/rejection reasons
- timestamp

It intentionally does not store raw scan responses, names, email addresses, phone numbers, street addresses, or direct-contact data.

## Operator surfaces
- `GET /api/admin/market`
- `/admin/market`

Both are private/no-store and require `SMARTDEVICES_MARKET_OPERATOR_AUTH_JSON` with a current `market-operator` grant. Local demo mode may bypass the grant only when the existing `SMARTDEVICES_DEMO_MODE=true` development switch is explicitly enabled.

## Metrics
- total shadow runs
- filled
- no market
- errors
- fill rate
- average clearing amount
- rejection reason counts
- recent receipt lineage
- SmartDevices recommendation IDs vs hypothetical sponsored provider

## Hard invariants
1. `app/lib/scan.ts` remains Market.ad-free.
2. Shadow results remain `visibleToConsumer: false`.
3. Storage failure cannot block SmartDevices recommendations.
4. Provider identity does not imply product identity. Until MARKET-0.7 returns a canonical device/offer mapping, `sponsoredDeviceId` remains unknown rather than inferred.
5. No real settlement or consumer-visible sponsorship is activated by this phase.

## Activation
1. Apply migration `drizzle/0007_market_shadow_observability.sql` to the target D1 database.
2. Configure `SMARTDEVICES_MARKET_OPERATOR_AUTH_JSON` with current operator grants.
3. Configure the existing SD-MKT-0.2 shadow variables and enable `SMARTDEVICES_MARKET_SHADOW_ENABLED=true` only in the intended pilot environment.
4. Verify `/admin/market` is inaccessible without authorization.
5. Run shadow traffic and inspect fill/no-fill, rejections, clearing history, and receipt lineage before any consumer-visible experiment.
