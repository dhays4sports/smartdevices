import { jsonError } from "@/app/lib/api";
import { MAX_BUILDER_PROJECT_BYTES, validateDeviceProject } from "@/app/lib/builder-store";
import { consumeRateLimit } from "@/app/lib/rate-limit";
import type { BuilderExecution } from "@/app/lib/builder-contract";

const unavailable = (kind: "firmware" | "cad", detail: string): BuilderExecution["firmware"] => ({ status: "unavailable", detail, artifactNames: [] });

function normalizeArtifact(input: unknown, kind: "firmware" | "cad"): BuilderExecution["firmware"] {
  if (!input || typeof input !== "object") return unavailable(kind, `${kind} executor returned no result.`);
  const value = input as Record<string, unknown>;
  const status = ["not-run", "queued", "pass", "fail", "unavailable", "review"].includes(String(value.status)) ? String(value.status) as BuilderExecution["firmware"]["status"] : "unavailable";
  return {
    status,
    detail: typeof value.detail === "string" ? value.detail.slice(0, 1200) : `${kind} executor returned ${status}.`,
    artifactNames: Array.isArray(value.artifactNames) ? value.artifactNames.filter((x): x is string => typeof x === "string").slice(0, 20) : [],
    artifactUrls: Array.isArray(value.artifacts) ? value.artifacts.filter((x): x is { name: string; url: string; sha256?: string } => Boolean(x && typeof x === "object" && typeof (x as { name?: unknown }).name === "string" && typeof (x as { url?: unknown }).url === "string" && /^https:\/\//.test((x as { url: string }).url))).slice(0, 20) : undefined,
    logs: typeof value.logs === "string" ? value.logs.slice(0, 12_000) : undefined,
    checkedAt: new Date().toISOString(),
    executor: typeof value.executor === "string" ? value.executor.slice(0, 120) : "configured-build-executor",
  };
}

export async function POST(request: Request) {
  try {
    const rate = await consumeRateLimit(request, "builder:execute", 10, 60);
    if (!rate.allowed) return jsonError(rate.reason === "RATE_LIMITED" ? 429 : 503, rate.reason, "Build execution is temporarily unavailable.");
    if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) return jsonError(415, "CONTENT_TYPE", "JSON is required.");
    const text = await request.text();
    if (new TextEncoder().encode(text).length > MAX_BUILDER_PROJECT_BYTES) return jsonError(413, "PROJECT_TOO_LARGE", "The project is too large for build execution.");
    const project = validateDeviceProject(JSON.parse(text));
    if (project.safetyClass === "blocked-autonomous") return jsonError(409, "SAFETY_BOUNDARY", "Build execution is unavailable for this safety class.");
    const endpoint = process.env.SMARTDEVICES_BUILD_EXECUTOR_ENDPOINT;
    const token = process.env.SMARTDEVICES_BUILD_EXECUTOR_TOKEN;
    if (!endpoint || process.env.SMARTDEVICES_BUILD_EXECUTOR_ENABLED !== "true") {
      const execution: BuilderExecution = {
        firmware: unavailable("firmware", "A firmware compiler executor is not activated in this deployment."),
        cad: unavailable("cad", "A CadQuery executor is not activated in this deployment."),
      };
      return Response.json({ execution, status: "unavailable" }, { headers: { "Cache-Control": "no-store" } });
    }
    if (!/^https:\/\//.test(endpoint)) return jsonError(503, "BUILD_EXECUTOR_ENDPOINT_INVALID", "The configured build executor endpoint must use HTTPS.");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({
        contractVersion: 1,
        projectId: project.id,
        revision: project.revision,
        operations: ["firmware", "cad"],
        firmware: { ecosystem: "arduino", boardFqbn: "esp32:esp32:esp32c3", filename: "device.ino", source: project.firmware, libraries: project.firmwareDependencies },
        cad: { engine: "cadquery", filename: "enclosure.py", source: project.cadSource, expectedArtifacts: ["enclosure_body.step", "enclosure_body.stl", "enclosure_lid.step", "enclosure_lid.stl"] },
      }),
      signal: AbortSignal.timeout(45_000),
    });
    if (!response.ok) return jsonError(503, "BUILD_EXECUTOR_FAILED", "The build executor did not return a usable result.");
    const payload = await response.json() as Record<string, unknown>;
    const execution: BuilderExecution = { firmware: normalizeArtifact(payload.firmware, "firmware"), cad: normalizeArtifact(payload.cad, "cad") };
    return Response.json({ execution, status: "completed" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "BUILD_EXECUTION_FAILED";
    return jsonError(code.includes("TIMEOUT") ? 503 : 400, code, "Build execution could not be completed.");
  }
}
