import fs from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

const route = fs.readFileSync("app/api/market/shadow/route.ts", "utf8");
const explorer = fs.readFileSync("app/components/ProtectionExplorer.tsx", "utf8");
const component = fs.readFileSync("app/components/CommercialOptions.tsx", "utf8");
const preview = fs.readFileSync("app/lib/market/preview.ts", "utf8");
const scan = fs.readFileSync("app/lib/scan.ts", "utf8");
const env = fs.readFileSync(".env.example", "utf8");

test("preview is doubly gated by server flag and explicit URL request", () => {
  assert.match(env, /SMARTDEVICES_MARKET_PREVIEW_ENABLED=false/);
  assert.match(route, /SMARTDEVICES_MARKET_PREVIEW_ENABLED/);
  assert.match(route, /searchParams\.get\("preview"\) === "1"/);
  assert.match(explorer, /marketPreview/);
});

test("ordinary shadow requests do not return allocation or provider details to the browser", () => {
  assert.match(route, /shadow-recorded/);
  assert.doesNotMatch(route, /NextResponse\.json\(\{ \.\.\.result, visibleToConsumer: false/);
});

test("preview renders only a canonically mapped qualified offer", () => {
  assert.match(preview, /identity\.status !== "mapped"/);
  assert.match(component, /qualifiedDevices\.find/);
  assert.match(component, /if \(!device\) return null/);
});

test("preview disclosure explicitly separates qualification from paid placement", () => {
  assert.match(component, /Qualification influenced by payment/);
  assert.match(component, /Placement influenced by payment/);
  assert.match(component, /Why am I seeing this\?/);
  assert.match(component, /Sponsored provider/);
});

test("preview UI is supplementary and recommendation engine remains market-free", () => {
  assert.match(explorer, /<DeviceUniverse[\s\S]*<CommercialOptions/);
  assert.doesNotMatch(scan, /market\//i);
  assert.doesNotMatch(scan, /sponsor/i);
});
