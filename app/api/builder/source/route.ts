import { jsonError } from "@/app/lib/api";
import { MAX_BUILDER_PROJECT_BYTES, validateDeviceProject } from "@/app/lib/builder-store";
import { consumeRateLimit } from "@/app/lib/rate-limit";
import type { SourcingLine } from "@/app/lib/builder-contract";

export async function POST(request: Request) {
  try {
    const rate = await consumeRateLimit(request, "builder:source", 15, 60);
    if (!rate.allowed) return jsonError(rate.reason === "RATE_LIMITED" ? 429 : 503, rate.reason, "Live sourcing is temporarily unavailable.");
    if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) return jsonError(415, "CONTENT_TYPE", "JSON is required.");
    const text = await request.text();
    if (new TextEncoder().encode(text).length > MAX_BUILDER_PROJECT_BYTES) return jsonError(413, "PROJECT_TOO_LARGE", "The project is too large for sourcing.");
    const project = validateDeviceProject(JSON.parse(text));
    const endpoint = process.env.SMARTDEVICES_SOURCING_ENDPOINT;
    const token = process.env.SMARTDEVICES_SOURCING_TOKEN;
    if (!endpoint || process.env.SMARTDEVICES_LIVE_SOURCING_ENABLED !== "true") {
      const sourcing: SourcingLine[] = project.bom.map((item) => ({ bomId: item.id, status: "unavailable" }));
      return Response.json({ sourcing, status: "unavailable", detail: "A live sourcing provider is not activated in this deployment." }, { status: 200, headers: { "Cache-Control": "no-store" } });
    }
    if (!/^https:\/\//.test(endpoint)) return jsonError(503, "SOURCING_ENDPOINT_INVALID", "The configured sourcing endpoint must use HTTPS.");
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ projectId: project.id, bom: project.bom.map((item) => ({ id: item.id, name: item.name, capabilities: item.capabilities, quantity: item.quantity })) }), signal: AbortSignal.timeout(20_000) });
    if (!response.ok) return jsonError(503, "SOURCING_PROVIDER_FAILED", "The sourcing provider did not return a usable result.");
    const payload = await response.json() as { sourcing?: SourcingLine[] };
    const lines = Array.isArray(payload.sourcing) ? payload.sourcing.filter((line) => line && typeof line.bomId === "string" && ["planning", "live", "unavailable"].includes(line.status)) : [];
    return Response.json({ sourcing: lines, status: "live" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "SOURCING_FAILED";
    return jsonError(code.includes("TIMEOUT") ? 503 : 400, code, "Live sourcing could not be completed.");
  }
}
