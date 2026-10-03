import fs from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

const pilot = fs.readFileSync("app/lib/market/provider-pilot.ts", "utf8");
const config = fs.readFileSync("content/market-provider-pilot.json", "utf8");
const preview = fs.readFileSync("app/lib/market/preview.ts", "utf8");
const env = fs.readFileSync(".env.example", "utf8");
const catalog = JSON.parse(fs.readFileSync("content/catalog.json", "utf8"));
const component = fs.readFileSync("app/components/CommercialOptions.tsx", "utf8");

const moen = catalog.find((device) => device.id === "moen-flo-shutoff");

test("real-provider pilot is explicit and disabled by default", () => {
  assert.match(env, /SMARTDEVICES_MARKET_REAL_PROVIDER_PILOT=false/);
  assert.match(preview, /SMARTDEVICES_MARKET_REAL_PROVIDER_PILOT/);
});

test("pilot registry binds provider to a canonical SmartDevices device", () => {
  assert.match(config, /"providerId": "moen-direct"/);
  assert.match(config, /"deviceId": "moen-flo-shutoff"/);
  assert.match(pilot, /providerId === offer\.providerId && item\.deviceId === offer\.deviceId/);
});

test("real-provider destination must be https and on an explicit host allowlist", () => {
  assert.match(pilot, /parsed\.protocol !== "https:"/);
  assert.match(pilot, /allowedDestinationHosts\.includes\(host\)/);
});

test("unavailable catalog devices cannot become public sponsored fulfillment", () => {
  assert.equal(moen.availability, "unavailable");
  assert.match(pilot, /device\.availability !== "available"/);
  assert.match(pilot, /device_availability_not_currently_available/);
});

test("preview remains supplementary and disclosure stays explicit", () => {
  assert.match(component, /Ways to get this qualified device/);
  assert.match(component, /Qualification influenced by payment/);
  assert.match(component, /Placement influenced by payment/);
  assert.match(component, /aria-labelledby=/);
  assert.match(component, /<details className="market-disclosure">/);
});
