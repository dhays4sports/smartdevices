import test from "node:test";
import assert from "node:assert/strict";
import { assessWaterCapability, waterClassSatisfies } from "../app/lib/water-guidance";

test("water requirement model never substitutes a point sensor for automatic shutoff", () => {
  assert.equal(waterClassSatisfies("automatic-main-water-shutoff", "point-water-detection"), false);
  assert.equal(waterClassSatisfies("automatic-main-water-shutoff", "whole-home-flow-monitoring"), false);
  assert.equal(waterClassSatisfies("automatic-main-water-shutoff", "automatic-main-water-shutoff"), true);
});

test("consumer-stated water requirement remains an assertion with exact confirmation steps", () => {
  const assessment = assessWaterCapability({ carrierId: "farmers", jurisdiction: "CA", intent: "requirement", category: "water", requestedCapabilityIds: ["automatic-main-water-shutoff"], assertionSource: "consumer-stated", unknowns: [] });
  assert.equal(assessment.requested, "automatic-main-water-shutoff");
  assert.equal(assessment.mismatch, false);
  assert.ok(assessment.confirmationSteps.some((step) => /policy.*not a case requirement/i.test(step)));
  assert.ok(assessment.confirmationSteps.some((step) => /pipe size/i.test(step)));
  assert.ok(assessment.confirmationSteps.some((step) => /Farmers agent/i.test(step)));
});

test("missing requirement detail remains a mismatch and unknown", () => {
  const assessment = assessWaterCapability({ carrierId: "farmers", jurisdiction: "CA", intent: "requirement", category: "water", requestedCapabilityIds: [], assertionSource: "consumer-stated", unknowns: ["Exact capability unknown"] });
  assert.equal(assessment.requested, undefined);
  assert.equal(assessment.mismatch, true);
});
