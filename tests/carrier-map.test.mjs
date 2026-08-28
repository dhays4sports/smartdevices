import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const map = fs.readFileSync("app/components/CarrierProtectionMap.tsx", "utf8");

test("Carrier Protection Map has four semantic list areas and an aria-hidden visual equivalent", () => {
  for (const label of ["Start with the stated requirement", "Potentially relevant", "carrierName", "SmartDevices protection recommendation", "Still needs confirmation"]) assert.match(map, new RegExp(label));
  assert.match(map, /className="carrier-map-visual" aria-hidden="true"/);
  assert.match(map, /<ol className="carrier-map-list">/);
});

test("map exposes source, checked date, limits, capability, technical fit, and next confirmation", () => {
  assert.match(map, /Current evidence and scope/);
  assert.match(map, /checked \{source\.checkedDate\}/);
  assert.match(map, /Limitations and confirmation/);
  assert.match(map, /Capability:/);
  assert.match(map, /Technical fit records:/);
  assert.doesNotMatch(map, /scoreValue|percentage|best product/i);
});
