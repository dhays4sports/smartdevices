import test from "node:test";
import assert from "node:assert/strict";
import { buildCarrierContext, questionsForCarrier, validateCarrierQuestionBranches } from "../app/lib/carrier-scan";

test("every carrier branch asks three to five material questions", () => {
  assert.deepEqual(validateCarrierQuestionBranches(), []);
  for (const category of ["water", "gas", "security", "connected-home"] as const) {
    const questions = questionsForCarrier(category);
    assert.ok(questions.length >= 3 && questions.length <= 5);
    assert.equal(questions.every((question) => question.changes.length > 0), true);
  }
});

test("water answers preserve scope, capability, installation, and assertion source", () => {
  const context = buildCarrierContext("requirement", "water", [
    { questionId: "jurisdiction", optionId: "CA" },
    { questionId: "policy-scope", optionId: "homeowners" },
    { questionId: "water-capability", optionId: "automatic-shutoff" },
    { questionId: "installation-status", optionId: "exploring" },
  ], "farmers");
  assert.equal(context.jurisdiction, "CA");
  assert.equal(context.assertionSource, "consumer-stated");
  assert.deepEqual(context.requestedCapabilityIds, ["automatic-main-water-shutoff"]);
  assert.deepEqual(context.unknowns, []);
});

test("missing and prefer-not answers remain unknown", () => {
  const context = buildCarrierContext("discounts", "security", [
    { questionId: "jurisdiction", optionId: "prefer-not" },
    { questionId: "policy-scope", optionId: "skip" },
    { questionId: "security-capability", optionId: "unknown" },
    { questionId: "installation-status", optionId: "unknown" },
  ], "farmers");
  assert.equal(context.jurisdiction, undefined);
  assert.ok(context.unknowns.length >= 3);
});
