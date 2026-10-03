import { callCoverageFit, validateDeviceRequest } from "@/app/lib/coveragefit-device";
import { callProtectionBridge, validateProtectionRequest } from "@/app/lib/protection-bridge";
import { homeDecisionCatalog, homeOptions } from "@/app/lib/home-decision";
import { getPublishedEvidenceBundle } from "@/app/lib/evidence-store";
import { consumeRateLimit } from "@/app/lib/rate-limit";

const reply = (value: unknown, status = 200) => Response.json(value, { status, headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" } });
export async function POST(request: Request) {
  try {
    if (request.headers.get("origin") !== new URL(request.url).origin) return reply({ error: { message: "Use the SmartDevices page to continue." } }, 403);
    if (process.env.COVERAGEFIT_DEVICE_BRIDGE_ENABLED !== "true") throw new Error("CONNECTION_NOT_CONFIGURED");
    const rate = await consumeRateLimit(request, "coveragefit-device", 60, 60);
    if (!rate.allowed) return reply({ error: { message: "The connection is temporarily unavailable. Your insurance review is unchanged." } }, rate.reason === "RATE_LIMITED" ? 429 : 503);
    if (!request.headers.get("content-type")?.includes("application/json")) return reply({ error: { message: "Invalid request." } }, 415);
    const reader = request.body?.getReader(); let bytes = 0, raw = ""; const decoder = new TextDecoder();
    if (!reader) throw new Error("INVALID_REQUEST");
    while (true) { const chunk = await reader.read(); if (chunk.done) break; bytes += chunk.value.length; if (bytes > 8192) { await reader.cancel(); return reply({ error: { message: "Request too large." } }, 413); } raw += decoder.decode(chunk.value, { stream: true }); }
    raw += decoder.decode(); const value = JSON.parse(raw);
    if (value?.bridgeVersion === 2) return reply(await callProtectionBridge(validateProtectionRequest(value), process.env));
    const input = validateDeviceRequest(value);
    if (input.operation === "save" && "deviceId" in input && input.deviceId) {
      const bundle = await getPublishedEvidenceBundle();
      const options = homeOptions(homeDecisionCatalog(bundle.catalog, bundle.sources, new Date().toISOString().slice(0, 10)), "water", "shutoff");
      if (!options.some(device => device.id === input.deviceId)) return reply({ error: { message: "This device’s evidence needs review. Reload options or ask your agent for help." } }, 409);
    }
    return reply(await callCoverageFit(input, process.env));
  } catch (error) {
    const allowed = ["REOPEN_REVIEW", "UPDATE_CONFLICT", "CONNECTION_NOT_CONFIGURED", "INVALID_REQUEST", "INVALID_UPDATE", "INVALID_DEVICE", "INVALID_RESPONSE"];
    const code = error instanceof Error && allowed.includes(error.message) ? error.message : "CONNECTION_UNAVAILABLE";
    const message = code === "REOPEN_REVIEW" ? "This session or quote is no longer current. Return to the latest insurance review before continuing." : code === "UPDATE_CONFLICT" ? "This task changed elsewhere. Reload the saved update before making another change." : code.startsWith("INVALID") ? "Please check your selection and try again." : "The insurance connection is unavailable. No update is confirmed. Return to your review or try again.";
    return reply({ error: { code, message } }, code === "REOPEN_REVIEW" ? 410 : code === "UPDATE_CONFLICT" ? 409 : code.startsWith("INVALID") ? 400 : 503);
  }
}
