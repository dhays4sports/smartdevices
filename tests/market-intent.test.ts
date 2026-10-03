import assert from "node:assert/strict";
import test from "node:test";
import { buildScanResult } from "../app/lib/scan";
import { buildCommercialIntent, validateCommercialIntent } from "../app/lib/market/commercial-intent";

test("commercial intent is derived only from already-qualified scan recommendations", () => {
  const scan = buildScanResult("home", "water", [{ questionId: "H-RESPONSE", optionId: "automatic" }]);
  const intent = buildCommercialIntent(scan, {
    intentId: "sdi_home_water_test",
    createdAt: "2026-09-22T15:00:00.000Z",
    jurisdiction: "US-CA",
    commercialStage: "active-consideration",
    commercialization: { sponsoredPlacementAllowed: true },
  });
  assert.deepEqual(intent.eligibleDeviceIds, scan.recommendations.map((item) => item.device.id));
  assert.equal(intent.commercialization.directProviderContactAllowed, false);
  assert.equal(intent.commercialization.personalDataSharingAllowed, false);
  assert.deepEqual(validateCommercialIntent(intent), []);
});
