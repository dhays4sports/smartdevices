import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync("app/build/page.tsx", "utf8");
const component = fs.readFileSync("app/components/DeviceBuilder.tsx", "utf8");
const farmers = fs.readFileSync("app/farmers/page.tsx", "utf8");
const header = fs.readFileSync("app/components/SiteHeader.tsx", "utf8");
const solution = fs.readFileSync("app/lib/solution-contract.ts", "utf8");

test("public Builder route and navigation are present", () => {
  assert.match(page, /DeviceBuilder/);
  assert.match(header, /href: "\/build"/);
  assert.match(component, /Describe the device you wish existed/);
  assert.match(component, /Research \+ plan this device/);
  assert.match(component, /Mesh-ready/);
  assert.match(component, /Mesh-native/);
  assert.match(component, /Download Build Pack/);
});

test("Farmers keeps a separate Builder boundary instead of treating custom hardware as carrier compliance", () => {
  assert.match(farmers, /custom build is informational only and does not replace or satisfy a Farmers requirement/i);
  assert.match(farmers, /\/build\?source=farmers/);
  assert.match(solution, /insuranceStatus: "informational-only"/);
  assert.match(solution, /does not establish insurer acceptance/);
});
