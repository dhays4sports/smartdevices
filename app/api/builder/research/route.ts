import { jsonError } from "@/app/lib/api";
import { researchWithModel } from "@/app/lib/builder-ai-server";
import { MAX_BUILDER_PROJECT_BYTES, validateDeviceProject } from "@/app/lib/builder-store";
import { consumeRateLimit } from "@/app/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const rate = await consumeRateLimit(request, "builder:research", 12, 60);
    if (!rate.allowed) return jsonError(rate.reason === "RATE_LIMITED" ? 429 : 503, rate.reason, "Live research is temporarily unavailable.");
    if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) return jsonError(415, "CONTENT_TYPE", "JSON is required.");
    const text = await request.text();
    if (new TextEncoder().encode(text).length > MAX_BUILDER_PROJECT_BYTES) return jsonError(413, "PROJECT_TOO_LARGE", "The project is too large for live research.");
    const project = validateDeviceProject(JSON.parse(text));
    const research = await researchWithModel({ idea: project.idea, requirements: project.requirements, intelligenceMode: project.intelligence.mode, planningCostUsd: project.planningCostUsd });
    return Response.json({ research }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "RESEARCH_FAILED";
    return jsonError(400, code, "Live research could not be completed.");
  }
}
