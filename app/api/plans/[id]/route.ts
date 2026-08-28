import { and, asc, eq } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { bearerToken, canTransition, jsonError, PLAN_STATUSES, readJsonObject, safeId, sha256, validateResponse, type PersistentPlanStatus } from "@/app/lib/api";
import { consumeRateLimit } from "@/app/lib/rate-limit";
import { getDb } from "@/db";
import { auditEvents, planRecommendations, planResponses, plans } from "@/db/schema";

type Props = { params: Promise<{ id: string }> };
const validId = (id: string) => /^pln_[a-f0-9]{32}$/.test(id);

export async function GET(request: Request, { params }: Props) {
  const { id } = await params;
  if (!validId(id)) return jsonError(404, "NOT_FOUND", "Plan not found.");
  try {
    const rate = await consumeRateLimit(request, "plans:read", 120, 60);
    if (!rate.allowed) return jsonError(rate.reason === "RATE_LIMITED" ? 429 : 503, rate.reason, "Plan reading is temporarily unavailable.");
    const db = await getDb();
    const [plan] = await db.select({ id: plans.id, schemaVersion: plans.schemaVersion, status: plans.status, domain: plans.domain, concernId: plans.concernId, selectedConcernIdsJson: plans.selectedConcernIdsJson, rationaleJson: plans.rationaleJson, assumptionsJson: plans.assumptionsJson, unknownsJson: plans.unknownsJson, createdAt: plans.createdAt, updatedAt: plans.updatedAt, expiresAt: plans.expiresAt }).from(plans).where(eq(plans.id, id)).limit(1);
    if (!plan) return jsonError(404, "NOT_FOUND", "Plan not found.");
    if (plan.status === "revoked" || plan.status === "expired" || (plan.expiresAt && Date.parse(plan.expiresAt) <= Date.now())) return jsonError(410, "PLAN_UNAVAILABLE", "This plan has expired or been revoked.");
    const recommendations = await db.select({ id: planRecommendations.id, deviceId: planRecommendations.deviceId, origin: planRecommendations.origin, priority: planRecommendations.priority, rationale: planRecommendations.rationale, position: planRecommendations.position }).from(planRecommendations).where(eq(planRecommendations.planId, id)).orderBy(asc(planRecommendations.position));
    return Response.json({ plan: { ...plan, selectedConcernIds: plan.selectedConcernIdsJson ? JSON.parse(plan.selectedConcernIdsJson) : [], rationaleByDeviceId: plan.rationaleJson ? JSON.parse(plan.rationaleJson) : {}, assumptions: plan.assumptionsJson ? JSON.parse(plan.assumptionsJson) : [], unknowns: plan.unknownsJson ? JSON.parse(plan.unknownsJson) : [], selectedConcernIdsJson: undefined, rationaleJson: undefined, assumptionsJson: undefined, unknownsJson: undefined, recommendations } }, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return jsonError(503, "STORAGE_UNAVAILABLE", "Persistent plan storage is not activated in this environment."); }
}

export async function PATCH(request: Request, { params }: Props) {
  const { id } = await params;
  if (!validId(id)) return jsonError(404, "NOT_FOUND", "Plan not found.");
  try {
    const rate = await consumeRateLimit(request, "plans:update", 40, 60);
    if (!rate.allowed) return jsonError(rate.reason === "RATE_LIMITED" ? 429 : 503, rate.reason, "Plan updates are temporarily unavailable.");
    const db = await getDb();
    const [plan] = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
    if (!plan) return jsonError(404, "NOT_FOUND", "Plan not found.");
    if (["revoked", "expired"].includes(plan.status)) return jsonError(410, "PLAN_UNAVAILABLE", "This plan has expired or been revoked.");
    const user = await getChatGPTUser();
    const token = bearerToken(request);
    const authorized = Boolean((user && plan.ownerSubject === user.email) || (token && plan.writeTokenHash && await sha256(token) === plan.writeTokenHash));
    if (!authorized) return jsonError(403, "NOT_AUTHORIZED", "A valid plan capability or owner session is required.");
    const input = await readJsonObject(request);
    const now = new Date().toISOString();
    if (input.status !== undefined) {
      if (typeof input.status !== "string" || !PLAN_STATUSES.includes(input.status as PersistentPlanStatus) || !canTransition(plan.status as PersistentPlanStatus, input.status as PersistentPlanStatus)) return jsonError(409, "INVALID_TRANSITION", "That plan state transition is not allowed.");
      await db.update(plans).set({ status: input.status as PersistentPlanStatus, updatedAt: now, revokedAt: input.status === "revoked" ? now : plan.revokedAt }).where(eq(plans.id, id));
    }
    if (input.response !== undefined) {
      const response = validateResponse(input.response as Record<string, unknown>);
      const [recommendation] = await db.select().from(planRecommendations).where(and(eq(planRecommendations.id, response.recommendationId), eq(planRecommendations.planId, id))).limit(1);
      if (!recommendation) return jsonError(400, "INVALID_RECOMMENDATION", "That recommendation does not belong to this plan.");
      await db.insert(planResponses).values({ id: safeId("rsp"), planId: id, recommendationId: response.recommendationId, assertedBy: "client", intent: response.intent, fulfillment: response.fulfillment, createdAt: now });
      if (!["client-responded", "archived"].includes(plan.status)) await db.update(plans).set({ status: "client-responded", updatedAt: now }).where(eq(plans.id, id));
    }
    await db.insert(auditEvents).values({ id: safeId("aud"), actorType: user ? "agent" : "client", actorRef: user?.email ?? null, action: "plan.updated", objectType: "plan", objectId: id, metadataJson: JSON.stringify({ statusChanged: input.status !== undefined, responseRecorded: input.response !== undefined }), occurredAt: now });
    return Response.json({ planId: id, updatedAt: now }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { const code = error instanceof Error ? error.message : "UNEXPECTED_ERROR"; return jsonError(code.includes("D1") || code.includes("RATE_LIMIT") ? 503 : 400, code, code.includes("D1") ? "Persistent plan storage is not activated in this environment." : "The plan update is invalid."); }
}
