export const deviceTaskStates = {
  considering: "I’m considering this device",
  "existing-system": "I already have a system — please review it",
  "installation-help": "I need installation help",
  "agent-help": "I need my agent to confirm the requirement",
  "installed-self-reported": "I’ve installed a system — self-reported",
} as const;
export type DeviceTaskState = keyof typeof deviceTaskStates;
export const taskKinds = {
  confirmation: "Requirement or timing needs confirmation",
  "before-binding": "Producer-stated condition before binding",
  "after-binding": "Producer-stated condition after binding",
  discount: "Possible discount — eligibility unconfirmed",
  recommended: "Optional protection recommendation",
} as const;
export type ConnectedTask = { task: { capability: "automatic-water-shutoff"; jurisdiction: "CA"; kind: keyof typeof taskKinds; dueDate: string; assertionSource: string }; policy: { carrier: string; product: string }; version: number; progress: { state: DeviceTaskState; deviceId: string } | null; expiresAt: string };
type Environment = { [key: string]: string | undefined; COVERAGEFIT_DEVICE_BRIDGE_ENABLED?: string; COVERAGEFIT_ORIGIN?: string; SMARTDEVICES_BRIDGE_SECRET?: string };
export function coverageFitOrigin(env: Environment) {
  try { const url = new URL(env.COVERAGEFIT_ORIGIN ?? ""); if (url.protocol === "https:" && url.origin === env.COVERAGEFIT_ORIGIN && !url.username && !url.password) return url.origin; } catch {}
  throw new Error("CONNECTION_NOT_CONFIGURED");
}
export function validateDeviceRequest(value: Record<string, unknown>) {
  if (typeof value.token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(value.token) || !["read", "save"].includes(String(value.operation))) throw new Error("INVALID_REQUEST");
  const base = { operation: value.operation as "read" | "save", token: value.token };
  if (value.operation === "read") return base;
  if (value.consent !== true || !Number.isInteger(value.expectedVersion) || Number(value.expectedVersion) < 0 || typeof value.requestId !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value.requestId) || !Object.hasOwn(deviceTaskStates, String(value.state))) throw new Error("INVALID_UPDATE");
  if (typeof value.deviceId !== "string" || value.deviceId.length > 100 || (value.state === "considering" && !value.deviceId)) throw new Error("INVALID_DEVICE");
  return { ...base, consent: true, requestId: value.requestId, expectedVersion: Number(value.expectedVersion), state: value.state as DeviceTaskState, deviceId: value.deviceId };
}
export async function callCoverageFitTransport(value: Record<string, unknown>, env: Environment, fetcher: typeof fetch = fetch) {
  if (env.COVERAGEFIT_DEVICE_BRIDGE_ENABLED !== "true" || String(env.SMARTDEVICES_BRIDGE_SECRET ?? "").length < 32) throw new Error("CONNECTION_NOT_CONFIGURED");
  const origin = coverageFitOrigin(env), body = JSON.stringify(value), timestamp = String(Date.now()), nonce = crypto.randomUUID();
  const encoder = new TextEncoder(), key = await crypto.subtle.importKey("raw", encoder.encode(env.SMARTDEVICES_BRIDGE_SECRET!), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = Array.from(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}\n${nonce}\n${body}`))), byte => byte.toString(16).padStart(2, "0")).join("");
  const response = await fetcher(`${origin}/api/recommendations/device-bridge`, { method: "POST", redirect: "error", cache: "no-store", headers: { "Content-Type": "application/json", "X-Device-Timestamp": timestamp, "X-Device-Nonce": nonce, "X-Device-Signature": signature }, body, signal: AbortSignal.timeout(10000) });
  const reader = response.body?.getReader(); if (!reader) throw new Error("INVALID_RESPONSE");
  const decoder = new TextDecoder(); let text = "", bytes = 0;
  while (true) { const chunk = await reader.read(); if (chunk.done) break; bytes += chunk.value.length; if (bytes > (value.bridgeVersion === 2 ? 32768 : 16384)) { await reader.cancel(); throw new Error("INVALID_RESPONSE"); } text += decoder.decode(chunk.value, { stream: true }); }
  text += decoder.decode();
  const data = JSON.parse(text);
  if (!response.ok || data.ok !== true) throw Object.assign(new Error(["device_conflict", "device_idempotency", "preset_unavailable"].includes(data.error?.code) ? "UPDATE_CONFLICT" : ["superseded", "review_expired", "device_expired", "quote_expired"].includes(data.error?.code) ? "REOPEN_REVIEW" : "CONNECTION_UNAVAILABLE"), { status: response.status });
  return data;
}
export async function callCoverageFit(value: ReturnType<typeof validateDeviceRequest>, env: Environment, fetcher: typeof fetch = fetch) {
  const data = await callCoverageFitTransport(value,env,fetcher);
  if (value.operation === "read" && (data.task?.capability !== "automatic-water-shutoff" || data.task?.jurisdiction !== "CA" || !Object.hasOwn(taskKinds, data.task?.kind) || !Number.isInteger(data.version))) throw new Error("INVALID_RESPONSE");
  return data;
}
