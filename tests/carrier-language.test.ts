import test from "node:test";
import assert from "node:assert/strict";
import {
  assertPublicCarrierCopy,
  carrierDisplayDesignations,
  sanitizeCarrierQueryValue,
} from "../app/lib/carrier-contract";

test("carrier vocabulary exposes only the seven governed designations", () => {
  assert.equal(carrierDisplayDesignations.length, 7);
  assert.deepEqual(carrierDisplayDesignations.at(-1), "confirmation-needed");
});

test("universal approval and outcome promises are rejected", () => {
  for (const copy of [
    "Farmers approved",
    "Farmers-certified",
    "guaranteed discount",
    "satisfies your policy",
    "required for all Farmers homes",
    "official SmartDevices/Farmers partnership",
  ]) assert.throws(() => assertPublicCarrierCopy(copy), /PROHIBITED_CARRIER_COPY/);
  assert.doesNotThrow(() => assertPublicCarrierCopy("Potential Farmers discount category — confirm applicability with your Farmers agent."));
});

test("carrier query values are bounded enum values", () => {
  assert.equal(sanitizeCarrierQueryValue("requirement", ["requirement", "discounts"]), "requirement");
  assert.equal(sanitizeCarrierQueryValue("policyNumber", ["requirement"]), undefined);
  assert.equal(sanitizeCarrierQueryValue("x".repeat(65), ["requirement"]), undefined);
  assert.equal(sanitizeCarrierQueryValue(["discounts", "requirement"], ["discounts"]), "discounts");
});
