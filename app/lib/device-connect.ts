import { getDeviceCapability } from "./device-capabilities";
import { initialDeviceTrustFacts, type DeviceMeshReadiness, type SmartDeviceObject } from "./device-domain";

export type DeviceConnectionLocality = "local" | "cloud" | "hybrid" | "unknown";
export type DeviceRegistrationInput = {
  manufacturer: string;
  model: string;
  variant?: string;
  category: string;
  capabilityIds: string[];
  externalIdentifiers?: Array<{ scheme: string; value: string }>;
  connection?: { adapterId?: string; protocols?: string[]; locality?: DeviceConnectionLocality; endpointKind?: string };
  meshReadiness?: Exclude<DeviceMeshReadiness, "active">;
};

export type NormalizedDeviceRegistration = {
  schemaVersion: 1;
  manufacturer: string;
  model: string;
  variant: string | null;
  category: string;
  capabilityIds: string[];
  externalIdentifiers: Array<{ scheme: string; value: string }>;
  connection: { adapterId: string | null; protocols: string[]; locality: DeviceConnectionLocality; endpointKind: string | null };
  trustState: "registered";
  claimState: "unclaimed";
  meshReadiness: Exclude<DeviceMeshReadiness, "active">;
};

const SENSITIVE_KEY = /(password|secret|token|api[_-]?key|authorization|cookie|bearer|credential|private[_-]?key)/i;
const OBVIOUS_SECRET_VALUE = /^(?:bearer\s+|basic\s+|sk-[a-z0-9_-]{12,}|gh[pousr]_[a-z0-9]{12,}|xox[baprs]-|akia[a-z0-9]{12,})/i;
const SAFE_ID = /^[a-z0-9][a-z0-9._:-]{1,95}$/i;

function text(value: unknown, max: number) {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string" || value.length > max || /[\x00-\x1f\x7f]/.test(value)) throw new Error("INVALID_DEVICE_TEXT");
  if (OBVIOUS_SECRET_VALUE.test(value.trim())) throw new Error("DEVICE_SECRET_NOT_ALLOWED");
  return value.trim();
}

function rejectSensitiveKeys(value: unknown, depth = 0) {
  if (depth > 8) throw new Error("INVALID_DEVICE_REGISTRATION");
  if (value === null || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEY.test(key)) throw new Error("DEVICE_SECRET_NOT_ALLOWED");
    rejectSensitiveKeys(child, depth + 1);
  }
}

export function validateDeviceRegistration(input: unknown): NormalizedDeviceRegistration {
  rejectSensitiveKeys(input);
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("INVALID_DEVICE_REGISTRATION");
  const allowed = ["manufacturer", "model", "variant", "category", "capabilityIds", "externalIdentifiers", "connection", "meshReadiness"];
  if (Object.keys(input).some((key) => !allowed.includes(key))) throw new Error("UNSUPPORTED_REGISTRATION_FIELD");
  const value = input as Partial<DeviceRegistrationInput>;
  if (value.externalIdentifiers !== undefined && (!Array.isArray(value.externalIdentifiers) || value.externalIdentifiers.length > 12)) throw new Error("INVALID_EXTERNAL_IDENTIFIERS");
  for (const item of value.externalIdentifiers ?? []) {
    if (!item || typeof item !== "object" || Array.isArray(item) || Object.keys(item).some((key) => !["scheme", "value"].includes(key))) throw new Error("INVALID_EXTERNAL_IDENTIFIERS");
  }
  if (value.connection !== undefined && (!value.connection || typeof value.connection !== "object" || Array.isArray(value.connection) || Object.keys(value.connection).some((key) => !["adapterId", "protocols", "locality", "endpointKind"].includes(key)))) throw new Error("INVALID_DEVICE_CONNECTION");
  if (value.connection?.locality !== undefined && !["local", "cloud", "hybrid", "unknown"].includes(value.connection.locality)) throw new Error("INVALID_CONNECTION_LOCALITY");
  if (value.meshReadiness !== undefined && !["not-evaluated", "compatible", "ready"].includes(value.meshReadiness)) throw new Error("INVALID_MESH_READINESS");
  if (value.connection?.protocols !== undefined && (!Array.isArray(value.connection.protocols) || value.connection.protocols.length > 12)) throw new Error("INVALID_DEVICE_PROTOCOLS");
  const manufacturer = text(value.manufacturer, 120);
  const model = text(value.model, 160);
  const variant = text(value.variant, 120) || null;
  const category = text(value.category, 80).toLowerCase();
  if (!manufacturer || !model || !category) throw new Error("DEVICE_IDENTITY_FIELDS_REQUIRED");
  if (!Array.isArray(value.capabilityIds) || value.capabilityIds.length < 1 || value.capabilityIds.length > 20) throw new Error("DEVICE_CAPABILITIES_REQUIRED");
  const capabilityIds = [...new Set(value.capabilityIds.map((id) => text(id, 96)))];
  if (capabilityIds.some((id) => !SAFE_ID.test(id) || !getDeviceCapability(id))) throw new Error("UNKNOWN_DEVICE_CAPABILITY");

  const externalIdentifiers = Array.isArray(value.externalIdentifiers) ? value.externalIdentifiers.slice(0, 12).map((item) => ({ scheme: text(item?.scheme, 48).toLowerCase(), value: text(item?.value, 160) })).filter((item) => item.scheme && item.value) : [];
  if (externalIdentifiers.some((item) => !SAFE_ID.test(item.scheme) || SENSITIVE_KEY.test(item.scheme) || OBVIOUS_SECRET_VALUE.test(item.value) || /[\r\n]/.test(item.value))) throw new Error("DEVICE_SECRET_NOT_ALLOWED");
  const connection = value.connection && typeof value.connection === "object" ? value.connection : {};
  const protocols = Array.isArray(connection.protocols) ? [...new Set(connection.protocols.map((item) => text(item, 48).toLowerCase()).filter(Boolean))].slice(0, 12) : [];
  const locality: DeviceConnectionLocality = ["local", "cloud", "hybrid", "unknown"].includes(String(connection.locality)) ? connection.locality as DeviceConnectionLocality : "unknown";
  const adapterId = text(connection.adapterId, 96) || null;
  const endpointKind = text(connection.endpointKind, 80) || null;
  if ([...protocols, ...(adapterId ? [adapterId] : []), ...(endpointKind ? [endpointKind] : [])].some((item) => !/^[a-z0-9][a-z0-9._-]{0,95}$/i.test(item))) throw new Error("INVALID_DEVICE_CONNECTION");
  const meshReadiness = ["not-evaluated", "compatible", "ready"].includes(String(value.meshReadiness)) ? value.meshReadiness as Exclude<DeviceMeshReadiness, "active"> : "not-evaluated";

  return { schemaVersion: 1, manufacturer, model, variant, category, capabilityIds, externalIdentifiers, connection: { adapterId, protocols, locality, endpointKind }, trustState: "registered", claimState: "unclaimed", meshReadiness };
}

export type DeviceAdapterDescriptor = {
  id: string;
  label: string;
  status: "contract-only" | "configured" | "active" | "disabled";
  protocols: string[];
  credentialHandling: "server-reference-only";
};

export interface DeviceAdapter {
  descriptor: DeviceAdapterDescriptor;
  probe(registration: NormalizedDeviceRegistration): Promise<{ reachable: boolean; detail: string }>;
}

export class DisabledDeviceAdapter implements DeviceAdapter {
  constructor(public descriptor: DeviceAdapterDescriptor) {}
  async probe(): Promise<{ reachable: boolean; detail: string }> {
    return { reachable: false, detail: "This adapter contract exists, but no live device connection is activated." };
  }
}

export function registrationToSmartDeviceObject(recordId: string, registration: NormalizedDeviceRegistration): SmartDeviceObject {
  const capabilities = registration.capabilityIds.map((id) => {
    const item = getDeviceCapability(id)!;
    return { ...item, support: "declared" as const };
  });
  return {
    schemaVersion: 1,
    recordId,
    recordKind: "instance",
    manufacturer: registration.manufacturer,
    model: registration.model,
    variant: registration.variant,
    categories: [registration.category],
    externalIdentifiers: registration.externalIdentifiers,
    capabilities,
    connectivity: { summary: registration.connection.protocols.length ? `Declared protocols: ${registration.connection.protocols.join(", ")}` : "Connection requirements declared; live reachability not verified.", interfaces: registration.connection.protocols.map((protocol) => ({ protocol, locality: registration.connection.locality, ...(registration.connection.adapterId ? { adapterRef: registration.connection.adapterId } : {}) })) },
    compatibility: { domains: [], requirements: [], constraints: [] },
    provenance: { sources: [], lastReviewed: null, editorialAssurance: "user-declared" },
    trust: { state: "registered", facts: initialDeviceTrustFacts("registered", `registration:${recordId}`), claimState: "unclaimed", attestations: [] },
    control: { principalRefs: [], permissionRefs: [], revocationState: "not-applicable" },
    operationalReadiness: { discoverable: false, connectable: false, identified: false, permissioned: false, agentOperable: false, transactional: false },
    mesh: { participation: "optional", readiness: registration.meshReadiness, identityRef: null },
  };
}
