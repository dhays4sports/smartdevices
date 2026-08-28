import test from "node:test";
import assert from "node:assert/strict";
import { evidenceDisplayState, evaluateCarrierGuidance, historicCarrierWarning } from "../app/lib/carrier";

test("clock-controlled review due evaluation is deterministic", () => {
  const record = { status: "active" as const, reviewDueDate: "2026-09-25" };
  assert.equal(evidenceDisplayState(record, "2026-09-25"), "current");
  assert.equal(evidenceDisplayState(record, "2026-09-26"), "stale");
  assert.equal(evidenceDisplayState({ ...record, status: "conflicting" }, "2026-08-26"), "conflicting");
  assert.equal(evidenceDisplayState({ ...record, status: "withdrawn" }, "2026-08-26"), "withdrawn");
});

test("overdue rules cannot leave a cached public-offer label", () => {
  const result = evaluateCarrierGuidance({ carrierId: "farmers", jurisdiction: "CA", intent: "discounts", category: "water", requestedCapabilityIds: [], unknowns: [] }, "2026-09-26");
  assert.equal(result.some((item) => item.designation === "carrier-public-offer"), false);
  assert.equal(result.some((item) => item.designation === "confirmation-needed"), true);
});

test("historic plans preserve source identity and warn when currentness changes", () => {
  assert.equal(historicCarrierWarning("farmers-ca-water-category-v1", "2026-08-26"), null);
  assert.match(historicCarrierWarning("farmers-ca-water-category-v1", "2027-01-01") ?? "", /historic context is preserved/i);
  assert.match(historicCarrierWarning("missing-rule", "2026-08-26") ?? "", /unavailable/);
});
