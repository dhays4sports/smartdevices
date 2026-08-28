import { getConcern, getDeviceById, type DomainId } from "./data";
import { carrierRules, deviceClasses, evidenceSources, getCarrier } from "./carrier";

type HandoffSystem = "coveragefit" | "408farmers" | "smartdevices" | "smartdevices-pro";
type HandoffBase = {
  handoffId: string;
  sourceSystem: HandoffSystem;
  destinationSystem: HandoffSystem;
  issuedAt: string;
  expiresAt: string;
  consent: { purpose: "protection-plan" | "licensed-follow-up"; capturedAt: string; policyVersion: string };
};

export type ConsentedHandoffV1 = HandoffBase & {
  schemaVersion: 1;
  context: { domain?: DomainId; concernIds?: string[]; deviceIds?: string[]; clientReference?: string };
};

export type ConsentedHandoffV2 = HandoffBase & {
  schemaVersion: 2;
  context: {
    domain?: DomainId;
    concernIds?: string[];
    deviceIds?: string[];
    clientReference?: string;
    scan?: { schemaVersion: 1; primaryConcernId: string; selectedConcernIds: string[]; rationaleFactorIds: string[]; unknownQuestionIds: string[] };
    clientIntent?: "researching" | "interested" | "help-choose" | "installation-help" | "verify-carrier" | "maybe-later" | "not-relevant";
  };
};

export type HandoffCarrierContextV3 = { carrierId: string; jurisdiction: string; entryIntent: "requirement" | "discounts" | "recommendations"; capabilityIds: string[]; ruleSources: { ruleId: string; ruleVersion: number; sourceId: string; sourceVersion: number }[]; assertionSource?: "consumer-stated" | "professional-stated"; unknownIds: string[] };
export type ConsentedHandoffV3 = HandoffBase & { schemaVersion: 3; context: ConsentedHandoffV2["context"] & { carrier?: HandoffCarrierContextV3 } };
export type ConsentedHandoff = ConsentedHandoffV1 | ConsentedHandoffV2 | ConsentedHandoffV3;

const prohibitedHandoffFields = new Set(["name", "email", "phone", "address", "exactAddress", "vin", "plate", "policyNumber", "claimNumber", "rawAnswers", "restrictedEvidence", "privateNotes"]);
function containsProhibitedField(value: unknown): boolean { if (!value || typeof value !== "object") return false; if (Array.isArray(value)) return value.some(containsProhibitedField); return Object.entries(value as Record<string, unknown>).some(([key, child]) => prohibitedHandoffFields.has(key) || containsProhibitedField(child)); }

export function validateCarrierHandoffContext(input: unknown, registry = { getCarrier, rules: carrierRules.rules, sources: evidenceSources.sources, classes: deviceClasses.classes }): HandoffCarrierContextV3 {
  if (!input || typeof input !== "object" || Array.isArray(input) || containsProhibitedField(input)) throw new Error("INVALID_CARRIER_CONTEXT");
  const value = input as Record<string, unknown>;
  const carrier = registry.getCarrier(String(value.carrierId ?? ""));
  if (!carrier || typeof value.jurisdiction !== "string" || !carrier.supportedJurisdictions.includes(value.jurisdiction)) throw new Error("INVALID_CARRIER_SCOPE");
  if (!["requirement", "discounts", "recommendations"].includes(String(value.entryIntent ?? ""))) throw new Error("INVALID_CARRIER_INTENT");
  const stableIds = (candidate: unknown, max: number) => Array.isArray(candidate) && candidate.length <= max && candidate.every((id) => typeof id === "string" && /^[A-Za-z0-9_-]{1,100}$/.test(id));
  if (!stableIds(value.capabilityIds, 10) || !stableIds(value.unknownIds, 10)) throw new Error("INVALID_CARRIER_CONTEXT");
  const classIds = new Set(registry.classes.map((item) => item.id));
  if ((value.capabilityIds as string[]).some((id) => !classIds.has(id))) throw new Error("INVALID_CARRIER_CAPABILITY");
  if (value.assertionSource !== undefined && !["consumer-stated", "professional-stated"].includes(String(value.assertionSource))) throw new Error("INVALID_ASSERTION_SOURCE");
  if (!Array.isArray(value.ruleSources) || value.ruleSources.length > 10) throw new Error("INVALID_RULE_SOURCE_VERSION");
  for (const pair of value.ruleSources as Record<string, unknown>[]) {
    const rule = registry.rules.find((item) => item.id === pair.ruleId && item.version === pair.ruleVersion);
    const source = registry.sources.find((item) => item.id === pair.sourceId && item.version === pair.sourceVersion && item.visibility === "public");
    if (!rule || !source || !rule.sourceIds.includes(source.id) || rule.carrierId !== carrier.id || rule.jurisdiction !== value.jurisdiction) throw new Error("INVALID_RULE_SOURCE_VERSION");
  }
  return value as HandoffCarrierContextV3;
}

export function validateHandoff(input: unknown): ConsentedHandoff {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("INVALID_HANDOFF");
  const value = input as Record<string, unknown>;
  const systems = ["coveragefit", "408farmers", "smartdevices", "smartdevices-pro"];
  if (![1, 2, 3].includes(Number(value.schemaVersion)) || typeof value.handoffId !== "string" || !/^hof_[A-Za-z0-9_-]{4,100}$/.test(value.handoffId) || !systems.includes(String(value.sourceSystem ?? "")) || !systems.includes(String(value.destinationSystem ?? "")) || value.sourceSystem === value.destinationSystem) throw new Error("INVALID_HANDOFF_ENVELOPE");
  const consent = value.consent as Record<string, unknown> | undefined;
  if (!consent || !["protection-plan", "licensed-follow-up"].includes(String(consent.purpose ?? "")) || typeof consent.policyVersion !== "string" || consent.policyVersion.length > 100 || !Number.isFinite(Date.parse(String(consent.capturedAt ?? "")))) throw new Error("CONSENT_REQUIRED");
  const expires = Date.parse(String(value.expiresAt ?? ""));
  const issued = Date.parse(String(value.issuedAt ?? ""));
  if (!Number.isFinite(expires) || !Number.isFinite(issued) || expires <= Date.now() || expires <= issued) throw new Error("HANDOFF_EXPIRED");
  if (!value.context || JSON.stringify(value.context).length > 8_192) throw new Error("INVALID_CONTEXT");
  const context = value.context as Record<string, unknown>;
  if (containsProhibitedField(context)) throw new Error("PROHIBITED_HANDOFF_FIELD");
  const domain = context.domain;
  if (domain !== undefined && !["home", "vehicle", "family", "business"].includes(String(domain))) throw new Error("INVALID_CONTEXT");
  const validIds = (candidate: unknown, max: number) => candidate === undefined || (Array.isArray(candidate) && candidate.length <= max && candidate.every((id) => typeof id === "string" && /^[A-Za-z0-9_-]{1,100}$/.test(id)));
  if (!validIds(context.concernIds, 5) || !validIds(context.deviceIds, 5)) throw new Error("INVALID_CONTEXT");
  if (Array.isArray(context.concernIds) && typeof domain === "string" && context.concernIds.some((id) => !getConcern(domain, String(id)))) throw new Error("INVALID_CONTEXT");
  if (Array.isArray(context.deviceIds) && context.deviceIds.some((id) => !getDeviceById(String(id)))) throw new Error("INVALID_CONTEXT");
  if (context.clientReference !== undefined && (typeof context.clientReference !== "string" || !/^ref_[A-Za-z0-9_-]{6,94}$/.test(context.clientReference))) throw new Error("INVALID_CONTEXT");
  if (value.schemaVersion === 2 || value.schemaVersion === 3) {
    const scan = context.scan as Record<string, unknown> | undefined;
    if (scan) {
      if (scan.schemaVersion !== 1 || typeof scan.primaryConcernId !== "string" || !validIds(scan.selectedConcernIds, 5) || !validIds(scan.rationaleFactorIds, 20) || !validIds(scan.unknownQuestionIds, 10)) throw new Error("INVALID_SCAN_CONTEXT");
      if (typeof domain === "string" && !getConcern(domain, scan.primaryConcernId)) throw new Error("INVALID_SCAN_CONTEXT");
    }
    if (context.clientIntent !== undefined && !["researching", "interested", "help-choose", "installation-help", "verify-carrier", "maybe-later", "not-relevant"].includes(String(context.clientIntent))) throw new Error("INVALID_CLIENT_INTENT");
    if (value.schemaVersion === 3) { if (context.carrier !== undefined) validateCarrierHandoffContext(context.carrier); }
    else if ("carrier" in context) throw new Error("V3_CONTEXT_REQUIRES_V3_ENVELOPE");
  } else if ("scan" in context || "clientIntent" in context || "carrier" in context) throw new Error("V2_CONTEXT_REQUIRES_V2_ENVELOPE");
  return value as ConsentedHandoff;
}

export type IntegrationAdapter = { deliver(handoff: ConsentedHandoff): Promise<{ accepted: boolean; externalReference?: string }> };
export class DisabledIntegrationAdapter implements IntegrationAdapter { async deliver(handoff: ConsentedHandoff): Promise<{ accepted: boolean }> { void handoff; throw new Error("EXTERNAL_ADAPTER_NOT_ACTIVATED"); } }

export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`).join(",")}}`;
}

export async function verifyHandoffSignature(request: Request, handoff: ConsentedHandoff, secret: string) {
  const timestamp = request.headers.get("x-smartdevices-timestamp") ?? "";
  const received = request.headers.get("x-smartdevices-signature")?.replace(/^sha256=/, "") ?? "";
  const time = Number(timestamp);
  if (!/^\d+$/.test(timestamp) || Math.abs(Date.now() - time * 1000) > 300_000) throw new Error("SIGNATURE_TIMESTAMP_INVALID");
  if (!/^[a-f0-9]{64}$/i.test(received)) throw new Error("SIGNATURE_INVALID");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${canonicalJson(handoff)}`));
  const expected = Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
  let difference = expected.length ^ received.length;
  for (let index = 0; index < Math.min(expected.length, received.length); index += 1) difference |= expected.charCodeAt(index) ^ received.charCodeAt(index);
  if (difference !== 0) throw new Error("SIGNATURE_INVALID");
}
