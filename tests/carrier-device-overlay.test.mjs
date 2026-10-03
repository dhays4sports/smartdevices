import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const options = fs.readFileSync("app/components/CarrierDeviceOptions.tsx", "utf8");
const compare = fs.readFileSync("app/compare/page.tsx", "utf8");
const card = fs.readFileSync("app/components/DeviceCard.tsx", "utf8");

test("carrier device options expose fit and commercial status separately", () => {
  assert.match(options, /explicitly-named-public-offer/);
  assert.match(options, /Matches the published capability/);
  assert.match(options, /No paid placement/);
  assert.match(options, /One well-supported place to start/);
  assert.match(options, /Carrier eligibility still requires confirmation/);
});

test("generic Device Card remains carrier neutral unless scoped context is supplied elsewhere", () => {
  assert.doesNotMatch(card, /Farmers|carrierId|carrierRule/);
  assert.match(compare, /query\.carrier === "farmers" && query\.jurisdiction === "CA"/);
  assert.match(compare, /No current governed Farmers product overlay/);
});
