import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const page = fs.readFileSync("app/insurance/page.tsx", "utf8");
const directory = fs.readFileSync("app/components/CarrierDirectory.tsx", "utf8");
const explorer = fs.readFileSync("app/components/ProtectionExplorer.tsx", "utf8");
const header = fs.readFileSync("app/components/SiteHeader.tsx", "utf8");
const universe = fs.readFileSync("app/components/DeviceUniverse.tsx", "utf8");
const detail = fs.readFileSync("app/devices/[slug]/page.tsx", "utf8");
const plan = fs.readFileSync("app/components/SafetyPlanClient.tsx", "utf8");
const farmers = fs.readFileSync("app/farmers/page.tsx", "utf8");
const alias = fs.readFileSync("app/insurance/farmers/route.ts", "utf8");
const carrierRoute = fs.readFileSync("app/lib/carrier-route.ts", "utf8");

test("insurance directory is useful, canonical, searchable, and contact-free", () => {
  assert.match(page, /alternates: \{ canonical: "\/insurance" \}/);
  assert.match(page, /Your insurer mentioned a device/);
  assert.match(page, /Independent by design/);
  assert.match(directory, /type="search"/);
  assert.match(directory, /No contact information needed/);
  assert.match(directory, /We haven’t published that carrier yet/);
  assert.doesNotMatch(directory, /email|phone|address|policy number/i);
});

test("Farmers has one canonical route and a sanitized permanent alias", () => {
  assert.match(farmers, /alternates: \{ canonical: "\/farmers" \}/);
  assert.match(alias, /Response\.redirect/);
  assert.match(alias, /308/);
  assert.match(alias, /sanitizeCarrierRoute/);
  assert.match(carrierRoute, /carrierIntents/);
  assert.doesNotMatch(carrierRoute, /address|policyNumber|claimNumber|vin|plate/i);
});

test("navigation, Home results, device details, and plans reach neutral insurance guidance", () => {
  assert.match(header, /Insurance guidance/);
  assert.match(universe, /result\.domainId === "home"/);
  assert.match(universe, /Check insurance guidance/);
  assert.match(detail, /Insurance relevance · separate evidence/);
  assert.match(plan, /Check insurer requirements or possible discounts/);
});

test("homepage keeps the primary protection action while exposing a subordinate carrier path", () => {
  assert.match(explorer, /Show us what you’re protecting\./);
  assert.match(explorer, /Home|domains\.map/);
  assert.match(explorer, /My insurer mentioned a device/);
  assert.match(explorer, /href="\/insurance"/);
});

test("unknown carrier search preserves a generic protection path", () => {
  assert.match(directory, /href="\/protect\/home"/);
  assert.match(directory, /filtered\.length/);
});
