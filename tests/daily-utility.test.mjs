import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const header = fs.readFileSync("app/components/SiteHeader.tsx", "utf8");
const explorer = fs.readFileSync("app/components/ProtectionExplorer.tsx", "utf8");
const myPlans = fs.readFileSync("app/components/MyPlans.tsx", "utf8");
const myPlanPage = fs.readFileSync("app/my-plan/page.tsx", "utf8");
const pro = fs.readFileSync("app/pro/page.tsx", "utf8");
const store = fs.readFileSync("app/lib/local-plan-store.ts", "utf8");
const library = fs.readFileSync("app/components/DeviceLibrary.tsx", "utf8");

test("primary navigation exposes the five repeat-use destinations", () => {
  for (const label of ["Protect", "Devices", "Insurance", "My Plan", "Agent tools"]) assert.match(header, new RegExp(label));
  assert.doesNotMatch(header, /Example plan/);
});

test("the homepage keeps the protection action primary and repeat paths subordinate", () => {
  assert.match(explorer, /Show us what you’re protecting/);
  assert.match(explorer, /aria-label="Quick access"/);
  assert.match(explorer, /My insurer mentioned a device/);
  assert.match(explorer, /Research a device/);
  assert.match(explorer, /Return to my plan/);
  assert.match(explorer, /Source-linked/);
});

test("the convergence pass states the payoff and never renders a blank plan surface", () => {
  assert.match(explorer, /Choose a concern, understand what can help/);
  assert.match(explorer, /leave with a small, source-linked plan/);
  assert.match(myPlans, /Opening plans saved on this device/);
  assert.match(myPlans, /Nothing is being uploaded/);
  assert.doesNotMatch(myPlans, /my-plan-loading/);
});

test("local plans are indexed, bounded, private, and reopenable", () => {
  assert.match(store, /PLAN_INDEX_KEY/);
  assert.match(store, /slice\(0, 20\)/);
  assert.match(store, /Math\.min\(localStorage\.length, 200\)/);
  assert.match(store, /listLocalPlans/);
  assert.match(myPlans, /Private by default/);
  assert.match(myPlans, /encodePlanSelection/);
  assert.match(myPlanPage, /index: false, follow: false/);
  assert.match(library, /persistLocalPlan\(safetyPlan\)/);
});

test("Pro opens as a daily workbench rather than a marketing sequence", () => {
  assert.match(pro, /Useful in the middle of a real client conversation/);
  assert.match(pro, /Build a client plan/);
  assert.match(pro, /Check insurance guidance/);
  assert.match(pro, /Research a device/);
  assert.match(pro, /Return to saved plans/);
  assert.match(pro, /Current when known\. Honest when not/);
});
