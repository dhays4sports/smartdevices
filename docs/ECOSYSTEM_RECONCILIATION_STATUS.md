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

## GitHub / hosting status

The reconciliation is published on `smartdevices-ecosystem-reconciliation-1.0` as draft PR #2. Nothing has been merged to `main`. PR #1 is preserved as governance provenance but superseded by PR #2 for implementation reconciliation.

Cloudflare automatically attempted a branch deployment after publication and reported a failed deployment. No hosted reconciliation preview is claimed. The failure requires Cloudflare build-log access or a connected CI environment to diagnose; do not infer a cause from the failure badge alone.

## Reconciliation 1.1 update

DISCOVER now also provides `/api/devices` query validation and a dedicated capability selector. CONNECT retains the existing private registration UI/API/store with strict input/origin/body/error guards. CREATE retains schema-v4 requirements, legacy-v3 normalization and portable packs; ordinary agent/fleet requests no longer force Mesh-native design. OPERATE now has an explicit planned surface and an always-blocked operation contract. All eight trust evidence facts remain independent.

Recovered SD-MKT-0.9 stays gated off. Registry and market schemas now share one reconciled journal/snapshot without changing historical SQL. Full PR #1 governance is restored. Current verification supersedes the previous environment-limited status; see ECOSYSTEM_RECONCILIATION_VERIFICATION.md. Hosted authentication, D1 activation and live physical proof are not certified by repository tests.
