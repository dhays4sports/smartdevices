import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const page = fs.readFileSync("app/farmers/page.tsx", "utf8");
const header = fs.readFileSync("app/components/SiteHeader.tsx", "utf8");
const selector = fs.readFileSync("app/components/CarrierIntentSelector.tsx", "utf8");

test("Farmers page keeps SmartDevices primary and states California scope and evidence date", () => {
  assert.match(header, /SmartDevices\.com/);
  assert.match(page, /California carrier guidance/);
  assert.match(page, /evidence reviewed Aug\. 26, 2026/);
  assert.match(page, /SmartDevices is independent/);
  assert.doesNotMatch(page, /<Image[^>]+farmers|(?:src|href)="[^"]*farmers\.(?:svg|png|jpg)/i);
});

test("first viewport starts with intent rather than products or contact", () => {
  assert.match(selector, /What brought you here/);
  assert.match(selector, /I received a requirement/);
  assert.match(selector, /Check possible discounts/);
  assert.match(selector, /Explore recommendations/);
  assert.doesNotMatch(selector, /name="(?:email|phone|address|policy)/i);
});
