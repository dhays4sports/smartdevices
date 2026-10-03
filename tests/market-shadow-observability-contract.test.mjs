import fs from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

const route = fs.readFileSync("app/api/market/shadow/route.ts", "utf8");
const schema = fs.readFileSync("db/schema.ts", "utf8");
const store = fs.readFileSync("app/lib/market/shadow-store.ts", "utf8");
const admin = fs.readFileSync("app/api/admin/market/route.ts", "utf8");
const page = fs.readFileSync("app/admin/market/page.tsx", "utf8");
const scan = fs.readFileSync("app/lib/scan.ts", "utf8");

test("shadow runs persist without exposing consumer-visible influence", () => {
  assert.match(route, /recordMarketShadowObservation/);
  assert.match(route, /visibleToConsumer: false/);
  assert.match(route, /observability must not affect consumer flow/);
});

test("observability stores market mechanics but not raw personal or scan-response data", () => {
  assert.match(schema, /market_shadow_runs/);
  assert.match(store, /recommendedDeviceIdsJson/);
  for (const forbidden of ["email", "phone", "address", "rawAnswers", "name\""]) assert.doesNotMatch(store, new RegExp(forbidden, "i"));
});

test("operator endpoint is authorization gated and no-store", () => {
  assert.match(admin, /authorizeMarketOperator/);
  assert.match(admin, /SMARTDEVICES_MARKET_OPERATOR_AUTH_JSON/);
  assert.match(admin, /private, no-store/);
});

test("operator UI compares recommendations with hypothetical sponsor", () => {
  assert.match(page, /SmartDevices recommendations/);
  assert.match(page, /Would-be sponsor/);
  assert.match(page, /Shadow results never alter consumer recommendations/);
});

test("recommendation engine remains free of Market.ad imports", () => {
  assert.doesNotMatch(scan, /market\//i);
  assert.doesNotMatch(scan, /sponsor/i);
});
