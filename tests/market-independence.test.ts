import assert from "node:assert/strict";
import test from "node:test";
import { buildScanResult } from "../app/lib/scan";
import { buildCommercialIntent } from "../app/lib/market/commercial-intent";
import { DisabledMarketAdapter, ShadowMarketAdapter } from "../app/lib/market/adapter";
import type { ProviderOffer } from "../app/lib/market/contract";

test("market enablement cannot change the SmartDevices recommendation set", async () => {
  const scan = buildScanResult("home", "water", [{ questionId: "H-RESPONSE", optionId: "automatic" }]);
  assert.ok(scan.recommendations.length > 0, "water automatic-shutoff scan should produce a qualified recommendation");
  const before = scan.recommendations.map((item) => ({ id: item.device.id, band: item.priorityBand, rationale: item.rationaleFactors }));
  const intent = buildCommercialIntent(scan, {
    intentId: "sdi_home_water_market_independence",
    createdAt: "2026-09-22T15:00:00.000Z",
    commercialization: { sponsoredPlacementAllowed: true },
  });
  const eligibleId = scan.recommendations[0]!.device.id;
  const offers: ProviderOffer[] = [{ schemaVersion: 1, offerId: "off_test", providerId: "prov_test", providerName: "Test Provider", deviceId: eligibleId, relationship: "sponsored" }];
  await new DisabledMarketAdapter().createOpportunity(intent);
  await new ShadowMarketAdapter(offers).createOpportunity(intent);
  const after = scan.recommendations.map((item) => ({ id: item.device.id, band: item.priorityBand, rationale: item.rationaleFactors }));
  assert.deepEqual(after, before);
});
