import { getChatGPTUser } from "@/app/chatgpt-auth";
import { authorizeEvidenceAdmin } from "@/app/lib/evidence-admin-auth";
import { jsonError, readJsonObject } from "@/app/lib/api";
import { checkEvidenceSource, createSeedEvidenceBundle, summarizeEvidenceChecks } from "@/app/lib/evidence-refresh";
import { decideEvidenceCheck, getEvidenceDashboard, rollbackEvidenceSnapshot, runEvidenceRefresh } from "@/app/lib/evidence-store";
import { consumeRateLimit } from "@/app/lib/rate-limit";

function validEvidenceId(value: unknown, prefix: string): value is string {
  return typeof value === "string" && new RegExp(`^${prefix}_[a-f0-9]{32}$`).test(value);
}

async function authorize() {
  const user = await getChatGPTUser();
  const demoMode = !user && process.env.SMARTDEVICES_DEMO_MODE === "true";
  const result = demoMode ? { authorized: true, reason: "AUTHORIZED" as const } : authorizeEvidenceAdmin(user, process.env.SMARTDEVICES_EVIDENCE_ADMIN_JSON);
  return { user, demoMode, result };
}

export async function GET() {
  const { user, demoMode, result } = await authorize();
  if (!result.authorized) return jsonError(result.reason === "UNAUTHENTICATED" ? 401 : 403, result.reason, "Evidence administration requires a current server-side administrator grant.");
  const dashboard = await getEvidenceDashboard();
  return Response.json({ ...dashboard, actor: user?.email ?? (demoMode ? "local-demo" : null) }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  try {
    const { user, demoMode, result } = await authorize();
    if (!result.authorized) return jsonError(result.reason === "UNAUTHENTICATED" ? 401 : 403, result.reason, "Evidence administration requires a current server-side administrator grant.");
    const rate = demoMode ? { allowed: true, reason: "OK" } : await consumeRateLimit(request, "evidence:admin", 12, 60);
    if (!rate.allowed && !demoMode) return jsonError(rate.reason === "RATE_LIMITED" ? 429 : 503, rate.reason, "Evidence administration is temporarily unavailable.");
    const input = await readJsonObject(request);
    const action = input.action;
    const actor = user?.email ?? "local-demo";
    if (action === "refresh") {
      if (demoMode) {
        const sources = createSeedEvidenceBundle().sources;
        const fetcher = async (value: RequestInfo | URL) => new Response(`<html><body><main>Official evidence fixture for ${String(value)}. This deterministic local preview is long enough to exercise retrieval, normalization, comparison and review behavior without contacting an external service.</main></body></html>`, { status: 200, headers: { "content-type": "text/html" } });
        const checks = await Promise.all(sources.map((source) => checkEvidenceSource(source, null, fetcher)));
        return Response.json({ mode: "demo", runId: "evr_00000000000000000000000000000000", summary: summarizeEvidenceChecks(checks), checks }, { headers: { "Cache-Control": "no-store" } });
      }
      if (process.env.SMARTDEVICES_EVIDENCE_REFRESH_ENABLED !== "true") return jsonError(503, "EVIDENCE_REFRESH_NOT_ACTIVATED", "External evidence refresh is not activated in this environment.");
      return Response.json(await runEvidenceRefresh({ trigger: "manual", actor }), { headers: { "Cache-Control": "no-store" } });
    }
    if (action === "decision") {
      if (!validEvidenceId(input.runId, "evr") || typeof input.sourceId !== "string" || input.sourceId.length > 100 || !["confirm-unchanged", "mark-stale", "reject"].includes(String(input.decision))) return jsonError(400, "INVALID_EVIDENCE_DECISION", "The evidence decision is invalid.");
      if (demoMode) return Response.json({ mode: "demo", decision: input.decision, sourceId: input.sourceId }, { headers: { "Cache-Control": "no-store" } });
      return Response.json(await decideEvidenceCheck({ runId: input.runId, sourceId: input.sourceId, decision: input.decision as "confirm-unchanged" | "mark-stale" | "reject", actor, rationale: typeof input.rationale === "string" ? input.rationale : undefined }), { headers: { "Cache-Control": "no-store" } });
    }
    if (action === "rollback") {
      if (!validEvidenceId(input.snapshotId, "evs")) return jsonError(400, "INVALID_EVIDENCE_SNAPSHOT", "The evidence snapshot is invalid.");
      if (demoMode) return Response.json({ mode: "demo", snapshotId: input.snapshotId }, { headers: { "Cache-Control": "no-store" } });
      return Response.json(await rollbackEvidenceSnapshot(input.snapshotId, actor), { headers: { "Cache-Control": "no-store" } });
    }
    return jsonError(400, "INVALID_EVIDENCE_ACTION", "The evidence action is invalid.");
  } catch (error) {
    const code = error instanceof Error ? error.message : "EVIDENCE_ADMIN_FAILED";
    const status = code === "PAYLOAD_TOO_LARGE" ? 413 : code === "CONTENT_TYPE" ? 415 : code.includes("D1") || code.includes("STORAGE") ? 503 : 400;
    return jsonError(status, code, status === 503 ? "Evidence storage is not activated in this environment." : "The evidence request could not be completed.");
  }
}
