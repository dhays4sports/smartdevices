# Canonical Smart Device Object + Trust Model

Implementation: `app/lib/device-domain.ts`  
Capability registry: `content/device-capabilities.json`

## Model purpose

The Smart Device Object is a normalization boundary. It does not replace the editorial `Device` record or Builder project. It lets SmartDevices project catalog models and registered instances into one interoperable shape.

Core groups:

- identity: record ID, model/instance kind, manufacturer, model, variant, external identifiers;
- category: human/editorial labels;
- capability: machine-readable capability IDs, kind and risk;
- connectivity: descriptive interface metadata without public secrets;
- compatibility: domains, requirements and constraints;
- provenance: source links, freshness and editorial assurance;
- trust: explicit ladder state, claim state and attestations;
- control: principals, permission refs and revocation;
- operational readiness: discoverable/connectable/identified/permissioned/agent-operable/transactional;
- Mesh posture: optional participation, readiness and optional identity reference.

## Catalog/model projection

Existing published catalog entries map to `recordKind=model` and `trust.state=discovered`.

Even when editorial evidence is source-reviewed, this does **not** establish a physical-instance claim, physical ownership, identity, permission, connectivity or control.

## Registered instance projection

A successful `/api/devices/register` call creates `recordKind=instance` and exactly `trust.state=registered` with `claimState=unclaimed`.

Registration may declare capability/connectivity metadata. It does not verify those declarations or activate adapters.

## Trust ladder

`discovered → registered → claimed → verified → identified → permissioned → agent-operable → transactional`

The `canAdvanceDeviceTrust` / `assertNoImplicitTrustEscalation` helpers encode the rule that stronger state requires explicit evidence or an explicit governed transition. No UI view or connectivity check is itself such evidence.

## Capability semantics

Capability IDs are independent from categories. Each capability has:

- stable ID;
- human label;
- kind (`sensing`, `informational`, `communicative`, `computational`, `physical-action`);
- risk (`low`, `moderate`, `consequential`);
- source aliases.

The registry is intentionally small. Ambiguous source labels stay unnormalized instead of being forced into inaccurate IDs.
