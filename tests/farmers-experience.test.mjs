import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const page = fs.readFileSync("app/farmers/page.tsx", "utf8");
const header = fs.readFileSync("app/components/SiteHeader.tsx", "utf8");
const selector = fs.readFileSync("app/components/CarrierIntentSelector.tsx", "utf8");

test("Farmers page keeps SmartDevices primary and states California scope with the active evidence date", () => {
  assert.match(header, /SmartDevices\.com/);
  assert.match(page, /California Farmers customers/);
  assert.match(page, /evidence reviewed \{formatReviewed\(reviewDate\)\}/);
  assert.match(page, /getPublishedEvidenceBundle/);
  assert.match(page, /publicCarrierDataFromBundle/);
  assert.match(page, /SmartDevices is independent/);
  assert.doesNotMatch(page, /<Image[^>]+farmers|(?:src|href)="[^"]*farmers\.(?:svg|png|jpg)/i);
});

test("first viewport starts with intent rather than products or contact", () => {
  assert.match(selector, /What brought you here/);
  assert.match(selector, /mentioned a device/);
  assert.match(selector, /checking for possible savings/);
  assert.match(selector, /protection recommendations/);
  assert.match(selector, /What kind of device did they mention/);
  assert.doesNotMatch(selector, /name="(?:email|phone|address|policy)/i);
});
