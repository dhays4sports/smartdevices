import { timingSafeTokenMatch } from "@/app/lib/evidence-admin-auth";
import { jsonError } from "@/app/lib/api";
import { runEvidenceRefresh } from "@/app/lib/evidence-store";
import { consumeRateLimit } from "@/app/lib/rate-limit";

export async function POST(request: Request) {
  const token = request.headers.get("x-smartdevices-scheduler-token");
  if (!timingSafeTokenMatch(token, process.env.SMARTDEVICES_EVIDENCE_SCHEDULER_TOKEN)) return jsonError(401, "SCHEDULER_AUTH_REQUIRED", "A valid scheduler credential is required.");
  if (process.env.SMARTDEVICES_EVIDENCE_REFRESH_ENABLED !== "true") return jsonError(503, "EVIDENCE_REFRESH_NOT_ACTIVATED", "External evidence refresh is not activated in this environment.");
  const rate = await consumeRateLimit(request, "evidence:scheduled", 2, 3_600);
  if (!rate.allowed) return jsonError(rate.reason === "RATE_LIMITED" ? 429 : 503, rate.reason, "The scheduled evidence refresh is temporarily unavailable.");
  try {
    const result = await runEvidenceRefresh({ trigger: "scheduled", actor: "evidence-scheduler" });
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "EVIDENCE_REFRESH_FAILED";
    return jsonError(503, code, "The scheduled evidence refresh could not complete safely.");
  }
}
