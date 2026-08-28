import test from "node:test";
import assert from "node:assert/strict";
import { evaluateCarrierGuidance, type CarrierContext } from "../app/lib/carrier";
import type { CarrierDisplayDesignation } from "../app/lib/carrier-contract";

const base: CarrierContext = { carrierId: "farmers", jurisdiction: "CA", intent: "discounts", category: "water", requestedCapabilityIds: ["automatic-main-water-shutoff"], unknowns: [] };

test("applicability truth table preserves assertion, evidence, fit, and editorial states", () => {
  const cases: Array<[Partial<CarrierContext>, CarrierDisplayDesignation[]]> = [
    [{ assertionSource: "consumer-stated", intent: "requirement" }, ["your-stated-requirement", "potential-carrier-discount-category", "carrier-public-offer", "smartdevices-recommended"]],
    [{ assertionSource: "professional-stated", intent: "requirement" }, ["professional-stated-requirement", "potential-carrier-discount-category", "carrier-public-offer", "smartdevices-recommended"]],
    [{ category: "gas" }, ["potential-carrier-discount-category", "smartdevices-recommended"]],
    [{ category: "security" }, ["potential-carrier-discount-category", "smartdevices-recommended"]],
    [{ category: "connected-home" }, ["potential-carrier-discount-category", "smartdevices-recommended"]],
    [{ jurisdiction: "other" }, ["confirmation-needed"]],
  ];
  for (const [patch, expected] of cases) {
    const actual = evaluateCarrierGuidance({ ...base, ...patch }).map((item) => item.designation);
    for (const designation of expected) assert.ok(actual.includes(designation), `${JSON.stringify(patch)} should include ${designation}`);
  }
});

test("consumer and professional assertions never become carrier verification", () => {
  for (const source of ["consumer-stated", "professional-stated"] as const) {
    const results = evaluateCarrierGuidance({ ...base, intent: "requirement", assertionSource: source });
    const assertion = results.find((item) => item.designation.includes("stated-requirement"));
    assert.ok(assertion);
    assert.equal(assertion.sourceIds.length, 0);
    assert.match(assertion.limitations.join(" "), /not (?:.*verified|.*verification)/i);
  }
});

test("current public labels always provide evidence IDs, limits, and confirmation", () => {
  const results = evaluateCarrierGuidance(base).filter((item) => item.designation === "carrier-public-offer" || item.designation === "potential-carrier-discount-category");
  assert.ok(results.length >= 2);
  for (const result of results) {
    assert.ok(result.sourceIds.length > 0);
    assert.ok(result.limitations.length > 0);
    assert.ok(result.confirmationSteps.length > 0);
  }
});

test("unknown category does not manufacture a default claim", () => {
  const [result] = evaluateCarrierGuidance({ ...base, category: undefined });
  assert.equal(result.designation, "confirmation-needed");
  assert.equal(result.sourceIds.length, 0);
});
