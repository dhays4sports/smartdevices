import { getChatGPTUser } from "@/app/chatgpt-auth";
import { jsonError } from "@/app/lib/api";
import { validateDeviceRegistration } from "@/app/lib/device-connect";
import { listRegisteredDevices, registerDevice } from "@/app/lib/device-registry-store";
import { consumeRateLimit } from "@/app/lib/rate-limit";

const MAX_BYTES = 32_768;

export async function GET(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return jsonError(401, "AUTHENTICATION_REQUIRED", "Sign in to view devices you registered.");
  try {
    const rate = await consumeRateLimit(request, "devices:register:list", 60, 60);
    if (!rate.allowed) return jsonError(rate.reason === "RATE_LIMITED" ? 429 : 503, rate.reason, "Device registry is temporarily unavailable.");
    return Response.json({ devices: await listRegisteredDevices(user.email) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return jsonError(503, "REGISTRY_UNAVAILABLE", "Hosted device registration is not activated in this environment.");
  }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return jsonError(401, "AUTHENTICATION_REQUIRED", "Sign in before registering a device.");
  try {
    const rate = await consumeRateLimit(request, "devices:register:create", 20, 60);
    if (!rate.allowed) return jsonError(rate.reason === "RATE_LIMITED" ? 429 : 503, rate.reason, "Device registry is temporarily unavailable.");
    if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) throw new Error("CONTENT_TYPE");
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > MAX_BYTES) throw new Error("DEVICE_REGISTRATION_TOO_LARGE");
    const registration = validateDeviceRegistration(JSON.parse(raw));
    const device = await registerDevice(registration, user.email);
    return Response.json({ device, status: "registered", note: "Registration does not prove ownership, verification, identity, permission, reachability, or agent control; transaction readiness remains a separate state." }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "INVALID_DEVICE_REGISTRATION";
    const status = code === "DEVICE_REGISTRATION_TOO_LARGE" ? 413 : code.includes("UNAVAILABLE") || code.includes("D1") ? 503 : 400;
    return jsonError(status, code, status === 503 ? "Hosted device registration is not activated in this environment." : "The device registration could not be accepted.");
  }
}
