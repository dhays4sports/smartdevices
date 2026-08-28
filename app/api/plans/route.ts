import { getChatGPTUser } from "@/app/chatgpt-auth";
import { jsonError, readJsonObject, safeId, sha256, validatePlanCreate } from "@/app/lib/api";
import { consumeRateLimit } from "@/app/lib/rate-limit";
import { getDb } from "@/db";
import { auditEvents, planRecommendations, plans } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const rate = await consumeRateLimit(request, "plans:create", 20, 60);
    if (!rate.allowed) return Response.json({ error: { code: rate.reason, message: "Plan creation is temporarily unavailable." } }, { status: rate.reason === "RATE_LIMITED" ? 429 : 503, headers: { "Retry-After": String(rate.retryAfter), "Cache-Control": "no-store" } });
    const input = validatePlanCreate(await readJsonObject(request));
    const user = await getChatGPTUser();
    if (!user && ["agent", "template"].includes(input.origin)) return jsonError(403, "AUTHORIZATION_REQUIRED", "An authenticated professional is required for this recommendation origin.");
    const planId = safeId("pln");
    const writeToken = safeId("wrt");
    const now = new Date().toISOString();
    const db = await getDb();
    await db.batch([
      db.insert(plans).values({ id: planId, ownerSubject: user?.email ?? null, writeTokenHash: await sha256(writeToken), schemaVersion: input.schemaVersion, status: "generated", domain: input.domain, concernId: input.concernId, selectedConcernIdsJson: input.provenance ? JSON.stringify(input.provenance.selectedConcernIds) : null, rationaleJson: input.provenance ? JSON.stringify(input.provenance.rationaleByDeviceId) : null, assumptionsJson: input.provenance ? JSON.stringify(input.provenance.assumptions) : null, unknownsJson: input.provenance ? JSON.stringify(input.provenance.unknowns) : null, createdAt: now, updatedAt: now }),
      db.insert(planRecommendations).values(input.deviceIds.map((deviceId, index) => ({ id: safeId("rec"), planId, deviceId, origin: input.origin, priority: index === 0 ? "strong-fit" as const : "optional" as const, rationale: "Matched to the selected protection concern.", position: index }))),
      db.insert(auditEvents).values({ id: safeId("aud"), actorType: user ? "agent" : "anonymous", actorRef: user?.email ?? null, action: "plan.created", objectType: "plan", objectId: planId, metadataJson: JSON.stringify({ schemaVersion: input.schemaVersion, origin: input.origin, recommendationCount: input.deviceIds.length }), occurredAt: now }),
    ]);
    return Response.json({ planId, writeToken, status: "generated" }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNEXPECTED_ERROR";
    const status = ["PAYLOAD_TOO_LARGE"].includes(code) ? 413 : ["CONTENT_TYPE"].includes(code) ? 415 : code.includes("D1") || code.includes("RATE_LIMIT") ? 503 : 400;
    return jsonError(status, code, status === 503 ? "Persistent plan storage is not activated in this environment." : "The plan request is invalid.");
  }
}
