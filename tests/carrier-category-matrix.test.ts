import test from "node:test";
import assert from "node:assert/strict";
import { evaluateCarrierGuidance, type CarrierCategory } from "../app/lib/carrier";

const categories: CarrierCategory[] = ["water", "gas", "security", "connected-home"];
const intents = ["requirement", "discounts", "recommendations"] as const;
test("intent by category matrix remains deterministic and bounded", () => { for (const intent of intents) for (const category of categories) { const a = evaluateCarrierGuidance({ carrierId: "farmers", jurisdiction: "CA", intent, category, requestedCapabilityIds: [], unknowns: [] }); const b = evaluateCarrierGuidance({ carrierId: "farmers", jurisdiction: "CA", intent, category, requestedCapabilityIds: [], unknowns: [] }); assert.deepEqual(a, b); assert.ok(a.length >= 1 && a.length <= 5); } });
test("unsupported jurisdiction never borrows California positive evidence", () => { for (const category of categories) { const results = evaluateCarrierGuidance({ carrierId: "farmers", jurisdiction: "NV", intent: "discounts", category, requestedCapabilityIds: [], unknowns: [] }); assert.deepEqual(results.map((item) => item.designation), ["confirmation-needed"]); } });
