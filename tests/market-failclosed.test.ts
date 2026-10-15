import assert from "node:assert/strict";
import test from "node:test";
import { DisabledMarketAdapter, ShadowMarketAdapter } from "../app/lib/market/adapter";
import type { CommercialIntentEnvelope, ProviderOffer } from "../app/lib/market/contract";

const intent: CommercialIntentEnvelope = {
  schemaVersion: 1,
  intentId: "sdi_home_water_failclosed",
  createdAt: "2026-09-22T15:00:00.000Z",
  domain: "home",
  concernId: "water",
  eligibleDeviceIds: ["eligible_device"],
  requiredCapabilities: ["automatic shutoff"],
  commercialStage: "active-consideration",
  commercialization: { sponsoredPlacementAllowed: true, directProviderContactAllowed: false, personalDataSharingAllowed: false },
};

test("disabled adapter fails closed without commercial offers", async () => {
  assert.deepEqual(await new DisabledMarketAdapter().createOpportunity(intent), { status: "disabled", offers: [] });
});

test("shadow adapter cannot surface an offer for a device SmartDevices did not qualify", async () => {
  const offers: ProviderOffer[] = [
    { schemaVersion: 1, offerId: "off_bad", providerId: "prov_bad", providerName: "High Bid Provider", deviceId: "not_eligible", relationship: "sponsored" },
    { schemaVersion: 1, offerId: "off_ok", providerId: "prov_ok", providerName: "Eligible Provider", deviceId: "eligible_device", relationship: "sponsored" },
  ];
  const result = await new ShadowMarketAdapter(offers).createOpportunity(intent);
  assert.deepEqual(result.offers.map((offer) => offer.offerId), ["off_ok"]);
});
