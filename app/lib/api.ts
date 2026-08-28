import { getConcern, getDeviceById, getDomain, intentOptions, type DomainId } from "./data";

export const MAX_JSON_BYTES = 16_384;
export const PLAN_STATUSES = ["draft", "generated", "shared", "viewed", "client-responded", "archived", "expired", "revoked"] as const;
export type PersistentPlanStatus = (typeof PLAN_STATUSES)[number];

const transitions: Record<PersistentPlanStatus, PersistentPlanStatus[]> = {
  draft: ["generated", "archived", "revoked"], generated: ["shared", "client-responded", "archived", "expired", "revoked"],
  shared: ["viewed", "client-responded", "archived", "expired", "revoked"], viewed: ["client-responded", "archived", "expired", "revoked"],
  "client-responded": ["archived", "expired", "revoked"], archived: ["revoked"], expired: ["revoked"], revoked: [],
};

export function canTransition(from: PersistentPlanStatus, to: PersistentPlanStatus) { return transitions[from].includes(to); }
export function jsonError(status: number, code: string, message: string) { return Response.json({ error: { code, message } }, { status, headers: { "Cache-Control": "no-store" } }); }

export async function readJsonObject(request: Request): Promise<Record<string, unknown>> {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_JSON_BYTES) throw new Error("PAYLOAD_TOO_LARGE");
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) throw new Error("CONTENT_TYPE");
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_JSON_BYTES) throw new Error("PAYLOAD_TOO_LARGE");
  const parsed: unknown = JSON.parse(text);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("INVALID_JSON_OBJECT");
  return parsed as Record<string, unknown>;
}

export function validatePlanCreate(input: Record<string, unknown>) {
  const domain = input.domain;
  const concernId = input.concernId;
  const deviceIds = input.deviceIds;
  const origin = input.origin ?? "consumer-explorer";
  if (typeof domain !== "string" || !getDomain(domain)) throw new Error("INVALID_DOMAIN");
  if (typeof concernId !== "string" || !getConcern(domain, concernId)) throw new Error("INVALID_CONCERN");
  if (!Array.isArray(deviceIds) || deviceIds.length < 1 || deviceIds.length > 5 || deviceIds.some((id) => typeof id !== "string" || !getDeviceById(id))) throw new Error("INVALID_DEVICES");
  if (!["consumer-explorer", "agent", "coveragefit", "template"].includes(String(origin))) throw new Error("INVALID_ORIGIN");
  if (["answers", "rawAnswers", "contact", "email", "phone", "address", "vin", "plate"].some((field) => field in input)) throw new Error("PROHIBITED_PLAN_FIELD");
  const schemaVersion = input.schemaVersion === 2 ? 2 : 1;
  let provenance: { selectedConcernIds: string[]; rationaleByDeviceId: Record<string, string[]>; assumptions: string[]; unknowns: string[] } | undefined;
  if (schemaVersion === 2) {
    const value = input.provenance;
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("INVALID_PROVENANCE");
    const object = value as Record<string, unknown>;
    const selectedConcernIds = object.selectedConcernIds;
    const assumptions = object.assumptions;
    const unknowns = object.unknowns;
    const rationaleByDeviceId = object.rationaleByDeviceId;
    const validTextArray = (candidate: unknown, max = 10) => Array.isArray(candidate) && candidate.length <= max && candidate.every((item) => typeof item === "string" && item.length <= 500);
    if (!validTextArray(selectedConcernIds, 5) || !validTextArray(assumptions) || !validTextArray(unknowns) || !rationaleByDeviceId || typeof rationaleByDeviceId !== "object" || Array.isArray(rationaleByDeviceId)) throw new Error("INVALID_PROVENANCE");
    if (Object.entries(rationaleByDeviceId).some(([id, values]) => !getDeviceById(id) || !validTextArray(values, 10))) throw new Error("INVALID_PROVENANCE");
    provenance = { selectedConcernIds: selectedConcernIds as string[], assumptions: assumptions as string[], unknowns: unknowns as string[], rationaleByDeviceId: rationaleByDeviceId as Record<string, string[]> };
  }
  return { schemaVersion, domain: domain as DomainId, concernId, deviceIds: [...new Set(deviceIds as string[])], origin: String(origin) as "consumer-explorer" | "agent" | "coveragefit" | "template", provenance };
}

export function validateResponse(input: Record<string, unknown>) {
  const recommendationId = input.recommendationId;
  const intent = input.intent;
  const fulfillment = input.fulfillment ?? "no-action";
  if (typeof recommendationId !== "string" || recommendationId.length > 100) throw new Error("INVALID_RECOMMENDATION");
  if (typeof intent !== "string" || !intentOptions.some((item) => item.id === intent)) throw new Error("INVALID_INTENT");
  if (!["no-action", "researching", "selected", "purchased", "installation-scheduled", "installed-self-reported", "evidence-received", "verified"].includes(String(fulfillment))) throw new Error("INVALID_FULFILLMENT");
  if (!["no-action", "researching", "selected"].includes(String(fulfillment))) throw new Error("ASSERTION_NOT_AUTHORIZED");
  return { recommendationId, intent, fulfillment: String(fulfillment) as "no-action" | "researching" | "selected" };
}

export async function sha256(value: string) { const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)); return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join(""); }
export function bearerToken(request: Request) { const value = request.headers.get("authorization") ?? ""; return value.startsWith("Bearer ") ? value.slice(7) : null; }
export function safeId(prefix: string) { return `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`; }
