# CONNECT Architecture — Minimum Durable Foundation

Public surface: `/connect`  
API: `/api/devices/register`  
Contracts: `app/lib/device-connect.ts`  
Persistence: `device_registry_records`, `device_control_claims`, `device_integrations`

## Current capability

An authenticated user may register a bounded device instance record with:

- manufacturer/model/variant;
- category;
- normalized capability IDs;
- non-secret protocol/locality metadata;
- optional external identifiers;
- optional Mesh-readiness declaration.

The API always creates the trust state `registered` and claim state `unclaimed`.

## Explicitly not implemented

Registration does not:

- prove physical ownership/control;
- verify capability claims;
- create durable device identity;
- establish permission;
- test reachability;
- store raw bearer tokens/passwords/API keys;
- activate a manufacturer adapter;
- make the device agent-operable;
- make the device transactional.

## Credentials

Device credentials can be highly sensitive. Public/registry records store no raw credentials or bearer tokens. `device_integrations.credential_ref` is reserved for a future server-side secret reference only. It must never be populated with a raw secret.

## Adapter contract

`DeviceAdapter` provides a minimal `probe` boundary plus a descriptor. The only implementation shipped here is fail-closed/disabled. Manufacturer/local/cloud adapters can be added later without changing the canonical device/trust model.

## Future path

registration → separate control claim → evidence/verification → optional identity → optional permission → authorized operation.

Each step is independently revocable and auditable.
