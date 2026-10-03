import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const selector = fs.readFileSync("app/components/CarrierIntentSelector.tsx", "utf8");
const scan = fs.readFileSync("app/components/CarrierScan.tsx", "utf8");
const result = fs.readFileSync("app/components/CarrierProtectionMap.tsx", "utf8");
const directory = fs.readFileSync("app/components/CarrierDirectory.tsx", "utf8");

test("Farmers discovery separates intent, category, scan, and results", () => {
  assert.match(selector, /state\.stage === "intent"/);
  assert.match(selector, /What brought you here/);
  assert.match(selector, /What kind of device did they mention/);
  assert.match(scan, /Question \{index \+ 1\} of \{questions\.length\}/);
  assert.match(result, /Your starting point/);
});

test("complex carrier provenance is progressive rather than the primary result", () => {
  assert.match(result, /<details className="result-detail-drawer">/);
  assert.match(result, /Why this answer appeared/);
  assert.match(result, /Before you buy/);
  assert.match(result, /Save this as my plan/);
});

test("the pilot directory does not force search UI for one published carrier", () => {
  assert.doesNotMatch(directory, /type="search"/);
  assert.match(directory, /Continue with \{carrier\.name\}/);
  assert.match(directory, /Don’t see your insurer/);
});
