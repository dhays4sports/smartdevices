import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const store = fs.readFileSync("app/lib/local-plan-store.ts", "utf8");
const map = fs.readFileSync("app/components/CarrierProtectionMap.tsx", "utf8");
const plan = fs.readFileSync("app/components/SafetyPlanClient.tsx", "utf8");

test("carrier plans use an explicit in-tab fallback when browser storage is unavailable", () => {
  assert.match(store, /memoryPlans = new Map/);
  assert.match(store, /Local plan storage verification failed/);
  assert.match(map, /persistLocalPlan\(plan\)/);
  assert.match(map, /window\.location\.assign/);
  assert.match(plan, /This carrier-aware plan remains available only in this tab/);
});
