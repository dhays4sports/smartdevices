import test from "node:test";
import assert from "node:assert/strict";
import { carrierRules, evidenceSources } from "../app/lib/carrier";

test("every public Farmers statement resolves to current Farmers-controlled evidence", () => {
  const sources = new Map(evidenceSources.sources.map((source) => [source.id, source]));
  for (const rule of carrierRules.rules.filter((item) => item.carrierId === "farmers" && item.visibility === "public")) {
    assert.equal(rule.jurisdiction, "CA");
    assert.equal(rule.checkedDate, "2026-08-26");
    assert.ok(rule.limitations.length > 0);
    const farmersSources = rule.sourceIds.map((id) => sources.get(id)).filter((source) => source?.domain === "farmers.com");
    assert.ok(farmersSources.length > 0, `${rule.id} needs Farmers-controlled support`);
    assert.equal(farmersSources.every((source) => source?.status === "active" && source.visibility === "public"), true);
  }
});

test("the inventory covers the four pilot categories without inventing product qualification", () => {
  const classes = new Set(carrierRules.rules.flatMap((rule) => rule.capabilityClassIds));
  for (const expected of ["automatic-main-water-shutoff", "automatic-gas-shutoff", "professionally-monitored-fire-security", "connected-home-remote-monitor-control"]) assert.ok(classes.has(expected));
  assert.equal(carrierRules.rules.filter((rule) => rule.classification === "public-offer").length, 1);
  assert.equal(carrierRules.rules.find((rule) => rule.classification === "public-offer")?.id, "farmers-ca-moen-public-offer-v1");
});
