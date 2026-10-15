import assert from "node:assert/strict";
import test from "node:test";
import { disclosureForOffers } from "../app/lib/market/disclosure";
import type { ProviderOffer } from "../app/lib/market/contract";

test("sponsorship disclosure states that payment did not determine qualification", () => {
  const offers: ProviderOffer[] = [{ schemaVersion: 1, offerId: "off_1", providerId: "prov_1", providerName: "Provider One", deviceId: "dev_1", relationship: "sponsored" }];
  const disclosure = disclosureForOffers(offers);
  assert.equal(disclosure?.sponsored, true);
  assert.equal(disclosure?.qualificationInfluencedByPayment, false);
  assert.equal(disclosure?.placementInfluencedByPayment, true);
  assert.match(disclosure?.message ?? "", /Payment did not determine qualification/i);
});
