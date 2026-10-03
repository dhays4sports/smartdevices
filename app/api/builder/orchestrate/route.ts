import { jsonError, readJsonObject } from "@/app/lib/api";
import { orchestrateWithModel } from "@/app/lib/builder-ai-server";
import { inferCapability } from "@/app/lib/builder-engine";
import type { BuilderAnswers } from "@/app/lib/builder-contract";
import { consumeRateLimit } from "@/app/lib/rate-limit";

const DEFAULTS: BuilderAnswers = { environment: "indoor", power: "usb", connectivity: "wifi", deploymentIntent: "auto", quantity: 1, goal: "functional-prototype", budget: "30-75" };

export async function POST(request: Request) {
  try {
    const rate = await consumeRateLimit(request, "builder:orchestrate", 30, 60);
    if (!rate.allowed) return jsonError(rate.reason === "RATE_LIMITED" ? 429 : 503, rate.reason, "Builder orchestration is temporarily unavailable.");
    const body = await readJsonObject(request);
    const idea = typeof body.idea === "string" ? body.idea.trim() : "";
    if (idea.length < 8 || idea.length > 3000) return jsonError(400, "INVALID_IDEA", "Describe the device in 8 to 3000 characters.");
    const answers = body.answers && typeof body.answers === "object" && !Array.isArray(body.answers) ? { ...DEFAULTS, ...(body.answers as Partial<BuilderAnswers>) } : DEFAULTS;
    const result = await orchestrateWithModel(idea, inferCapability(idea), answers);
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "ORCHESTRATION_FAILED";
    return jsonError(code.includes("RATE_LIMIT") ? 503 : 400, code, "Builder could not interpret that request.");
  }
}
