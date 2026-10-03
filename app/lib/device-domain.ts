import type { Device, DeviceSource } from "./data";
import { canonicalCapabilitiesForDevice, type DeviceCapabilityDefinition } from "./device-capabilities";

export const DEVICE_TRUST_LADDER = [
  "discovered",
  "registered",
  "claimed",
  "verified",
  "identified",
  "permissioned",
  "agent-operable",
  "transactional",
] as const;

export type DeviceTrustState = (typeof DEVICE_TRUST_LADDER)[number];
export type DeviceRecordKind = "model" | "instance";
export type DeviceClaimState = "unclaimed" | "asserted" | "verified" | "revoked";
export type DeviceMeshReadiness = "not-evaluated" | "compatible" | "ready" | "active";

export type SmartDeviceCapabilityBinding = Pick<DeviceCapabilityDefinition, "id" | "label" | "kind" | "risk" | "description"> & {
  sourceLabel?: string;
  support: "source-supported" | "declared" | "verified";
};

export type SmartDeviceObject = {
  schemaVersion: 1;
  recordId: string;
  recordKind: DeviceRecordKind;
  manufacturer: string;
  model: string;
  variant: string | null;
  categories: string[];
  externalIdentifiers: Array<{ scheme: string; value: string }>;
  capabilities: SmartDeviceCapabilityBinding[];
  connectivity: {
    summary: string;
    interfaces: Array<{ protocol: string; locality: "local" | "cloud" | "hybrid" | "unknown"; adapterRef?: string }>;
  };
  compatibility: {
    domains: string[];
    requirements: string[];
    constraints: string[];
  };
  provenance: {
    sources: DeviceSource[];
    lastReviewed: string | null;
    editorialAssurance: "source-reviewed" | "review-required" | "retired" | "user-declared";
  };
  trust: {
    state: DeviceTrustState;
    claimState: DeviceClaimState;
    attestations: Array<{ type: string; issuer: string; reference: string }>;
  };
  control: {
    principalRefs: string[];
    permissionRefs: string[];
    revocationState: "not-applicable" | "active" | "revoked";
  };
  operationalReadiness: {
    discoverable: boolean;
    connectable: boolean;
    identified: boolean;
    permissioned: boolean;
    agentOperable: boolean;
    transactional: boolean;
  };
  mesh: {
    participation: "optional";
    readiness: DeviceMeshReadiness;
    identityRef: string | null;
  };
};

export function trustRank(state: DeviceTrustState): number {
  return DEVICE_TRUST_LADDER.indexOf(state);
}

export function canAdvanceDeviceTrust(from: DeviceTrustState, to: DeviceTrustState, explicitEvidence: boolean): boolean {
  if (from === to) return true;
  if (!explicitEvidence) return false;
  return trustRank(to) === trustRank(from) + 1;
}

export function assertNoImplicitTrustEscalation(from: DeviceTrustState, to: DeviceTrustState, explicitEvidence = false) {
  if (!canAdvanceDeviceTrust(from, to, explicitEvidence)) throw new Error("DEVICE_TRUST_ESCALATION_REQUIRES_EVIDENCE");
}

export function catalogDeviceToSmartDeviceObject(device: Device): SmartDeviceObject {
  const capabilities = canonicalCapabilitiesForDevice(device).map((item) => ({
    id: item.id,
    label: item.label,
    kind: item.kind,
    risk: item.risk,
    description: item.description,
    sourceLabel: item.sourceLabel,
    support: "source-supported" as const,
  }));
  return {
    schemaVersion: 1,
    recordId: device.id,
    recordKind: "model",
    manufacturer: device.manufacturer,
    model: device.model,
    variant: null,
    categories: [...new Set([...device.domains, ...device.concerns])],
    externalIdentifiers: [],
    capabilities,
    connectivity: { summary: device.connectivity, interfaces: [] },
    compatibility: { domains: device.domains, requirements: [device.installation], constraints: device.limitations },
    provenance: {
      sources: device.sources,
      lastReviewed: device.lastReviewed,
      editorialAssurance: device.editorialStatus === "verified" ? "source-reviewed" : device.editorialStatus === "review-required" ? "review-required" : "retired",
    },
    // A reviewed catalog/model record is still only DISCOVERED in the device trust ladder.
    // Editorial fact review is not a claim of physical ownership, instance identity, or permission.
    trust: { state: "discovered", claimState: "unclaimed", attestations: [] },
    control: { principalRefs: [], permissionRefs: [], revocationState: "not-applicable" },
    operationalReadiness: { discoverable: true, connectable: false, identified: false, permissioned: false, agentOperable: false, transactional: false },
    mesh: { participation: "optional", readiness: "not-evaluated", identityRef: null },
  };
}
