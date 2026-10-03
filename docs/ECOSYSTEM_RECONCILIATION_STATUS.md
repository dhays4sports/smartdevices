# SMARTDEVICES-ECOSYSTEM-RECONCILIATION-1.0 — Implementation Status

## DISCOVER

**Existing and preserved:** device catalog, device pages, search, filters, comparison, source evidence, editorial freshness, carrier overlays, SEO.

**New foundation:** normalized capability registry; canonical public Smart Device Object projection; machine-readable `/api/devices/[slug]`; capability ID search; explicit `discovered` trust state that stays separate from editorial verification.

## CONNECT

**New foundation:** `/connect`, authenticated registration API, device registry store, additive tables for device records/control claims/integrations, secret-key rejection, disabled adapter contract.

**Not claimed:** live manufacturer integrations, reachability, credential activation, ownership verification.

## CREATE

**Existing and preserved:** Builder v5.2 Live Device Engine, research, hosted revisions, sourcing/build executor adapters, Build Packs, safety boundaries, standalone/connected/Mesh modes.

**Generalized:** DeviceProject schema v4 adds normalized `requiredCapabilities`; legacy schema-v3 manifests are normalized on read; catalog comparison uses capability IDs; Build Pack contains `Capability_Requirements.md`.

## OPERATE

**Deferred by design:** SmartDevices does not activate consequential device operation in this reconciliation. Future operation binds to governed Mesh identity/permission/mandate/execution/revocation/receipt primitives instead of duplicating them.

## /farmers

Preserved as the flagship specialized vertical. No carrier fit, qualification, installation, verification or custom-build truth boundary is weakened.

## Migration

`0007_device_registry_foundation.sql` is additive. Earlier migrations remain unchanged. Rollback is application-first: stop using registry tables; the additive tables may remain safely present until a separately authorized data-retention decision permits removal.

## Status truth

Local source implementation and local test evidence do not imply public deployment, manufacturer integration, physical-device testing, Mesh runtime activation, domain/DNS activation, external verification or production users.

## Assumption audit

Material legacy assumptions and their dispositions are recorded in `ECOSYSTEM_ASSUMPTION_AUDIT.md`. No audited conflict required a rebuild.
