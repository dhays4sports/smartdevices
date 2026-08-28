import test from "node:test";
import assert from "node:assert/strict";
import { DisabledPlanDeliveryAdapter, MemoryPlanDeliveryAdapter, deliverWithTimeout, recordView, stateAfterDelivery, type PlanDeliveryAdapter, validateDeliveryRequest } from "../app/lib/pro-engagement";

const request = { planId: "plan_12345", consentVersion: "carrier-help-v1", expiresAt: "2027-01-01T00:00:00Z", suppressed: false, contactPreference: "email" as const, idempotencyKey: "idem_12345678" };
test("delivery advances only after adapter acceptance", async () => { const result = await new MemoryPlanDeliveryAdapter().deliver(request); assert.equal(stateAfterDelivery("generated", result), "shared-by-adapter"); assert.equal(stateAfterDelivery("generated", { accepted: false }), "generated"); });
test("memory adapter is idempotent", async () => { const adapter = new MemoryPlanDeliveryAdapter(); const a = await adapter.deliver(request); const b = await adapter.deliver(request); assert.deepEqual(a, b); });
test("view remains literal and changes no intent or fulfillment", () => { assert.deepEqual(recordView(), { state: "viewed", clientIntent: null, fulfillmentChanged: false }); });
test("suppression, revocation, expiry, and missing consent fail closed", () => { assert.throws(() => validateDeliveryRequest({ ...request, suppressed: true }), /SUPPRESSED/); assert.throws(() => validateDeliveryRequest({ ...request, revokedAt: "2026-08-20" }), /REVOKED/); assert.throws(() => validateDeliveryRequest({ ...request, expiresAt: "2020-01-01" }), /EXPIRED/); assert.throws(() => validateDeliveryRequest({ ...request, consentVersion: "" }), /CONSENT/); });
test("disabled adapter returns honest unavailable state", async () => { await assert.rejects(new DisabledPlanDeliveryAdapter().deliver(request), /NOT_ACTIVATED/); });
test("provider timeout fails literally without advancing engagement", async () => {
  const hanging: PlanDeliveryAdapter = { deliver: async () => new Promise(() => undefined) };
  await assert.rejects(deliverWithTimeout(hanging, request, 5), /PLAN_DELIVERY_TIMEOUT/);
  assert.equal(stateAfterDelivery("generated", { accepted: false }), "generated");
});
