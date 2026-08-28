import { getChatGPTUser } from "@/app/chatgpt-auth";
import { jsonError, readJsonObject, safeId, sha256 } from "@/app/lib/api";
import { canonicalJson, DisabledIntegrationAdapter, validateHandoff, verifyHandoffSignature } from "@/app/lib/integrations";
import { consumeRateLimit } from "@/app/lib/rate-limit";
import { getDb } from "@/db";
import { auditEvents, handoffReceipts } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const handoff = validateHandoff(await readJsonObject(request));
    const externalSource = handoff.sourceSystem === "coveragefit" || handoff.sourceSystem === "408farmers";
    if (externalSource) {
      const rate = await consumeRateLimit(request, "handoff:receive", 120, 60);
      if (!rate.allowed) return jsonError(rate.reason === "RATE_LIMITED" ? 429 : 503, rate.reason, "Inbound handoff processing is temporarily unavailable.");
      const secret = handoff.sourceSystem === "coveragefit" ? process.env.COVERAGEFIT_SIGNING_SECRET : process.env.FARMERS408_SIGNING_SECRET;
      if (!secret) return jsonError(503, "SIGNING_SECRET_NOT_ACTIVATED", "Inbound handoff verification is not activated. No data was accepted.");
      await verifyHandoffSignature(request, handoff, secret);
      const db = await getDb();
      const receivedAt = new Date().toISOString();
      await db.batch([
        db.insert(handoffReceipts).values({ handoffId: handoff.handoffId, sourceSystem: handoff.sourceSystem, destinationSystem: handoff.destinationSystem, payloadHash: await sha256(canonicalJson(handoff)), consentPurpose: handoff.consent.purpose, receivedAt, expiresAt: handoff.expiresAt }),
        db.insert(auditEvents).values({ id: safeId("aud"), actorType: "partner", actorRef: handoff.sourceSystem, action: "handoff.accepted", objectType: "handoff", objectId: handoff.handoffId, metadataJson: JSON.stringify({ destination: handoff.destinationSystem, purpose: handoff.consent.purpose }), occurredAt: receivedAt }),
      ]);
      return Response.json({ accepted: true, handoffId: handoff.handoffId }, { status: 202, headers: { "Cache-Control": "no-store" } });
    }
    const user = await getChatGPTUser();
    if (!user) return jsonError(403, "AUTHORIZATION_REQUIRED", "An authenticated professional account is required.");
    const adapter = new DisabledIntegrationAdapter();
    await adapter.deliver(handoff);
    return jsonError(502, "UNEXPECTED_ADAPTER_RESULT", "The handoff was not accepted.");
  } catch (error) {
    const code = error instanceof Error ? error.message : "INVALID_HANDOFF";
    const status = code === "EXTERNAL_ADAPTER_NOT_ACTIVATED" || code.includes("D1") ? 503 : code.includes("UNIQUE") ? 409 : 400;
    return jsonError(status, code, status === 503 ? "External handoff delivery or persistence is not activated. No data was sent." : code.includes("UNIQUE") ? "This handoff was already accepted; replay was rejected." : "The consented handoff envelope is invalid.");
  }
}
