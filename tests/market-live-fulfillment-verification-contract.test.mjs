import fs from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

const verification = fs.readFileSync("app/lib/market/provider-verification.ts", "utf8");
const pilot = fs.readFileSync("app/lib/market/provider-pilot.ts", "utf8");
const evidence = JSON.parse(fs.readFileSync("content/market-provider-verification.json", "utf8"));
const providers = JSON.parse(fs.readFileSync("content/market-provider-pilot.json", "utf8"));
const catalog = JSON.parse(fs.readFileSync("content/catalog.json", "utf8"));
const schema = fs.readFileSync("db/schema.ts", "utf8");
const migration = fs.readFileSync("drizzle/0009_market_provider_verification.sql", "utf8");
const store = fs.readFileSync("app/lib/market/shadow-store.ts", "utf8");
const admin = fs.readFileSync("app/admin/market/page.tsx", "utf8");
const scan = fs.readFileSync("app/lib/scan.ts", "utf8");

const phyn = catalog.find((d) => d.id === "phyn-plus-v2");
const phynVerification = evidence.find((r) => r.providerId === "phyn-direct");
const moenVerification = evidence.find((r) => r.providerId === "moen-direct");

test("live fulfillment verification is manufacturer-source bound and freshness limited", () => {
  assert.match(verification, /SMARTDEVICES_MARKET_PROVIDER_MAX_AGE_HOURS/);
  assert.match(verification, /ageHours > maxAgeHours/);
  assert.match(verification, /recordHost !== record\.sourceHost\.toLowerCase\(\)/);
  assert.equal(phynVerification.sourceAuthority, "manufacturer");
  assert.equal(phynVerification.sourceHost, "phyn.com");
});

test("current purchasability requires availability plus an explicit purchase signal and price", () => {
  assert.match(verification, /record\.availability !== "available"/);
  assert.match(verification, /\["buy", "add-to-cart"\]/);
  assert.match(verification, /price_missing_or_invalid/);
  assert.equal(phynVerification.availability, "available");
  assert.equal(phynVerification.purchaseSignal, "add-to-cart");
  assert.equal(phynVerification.price.amount, 579.99);
});

test("Phyn is the first preview-eligible live fulfillment source while Moen remains unavailable", () => {
  assert.equal(providers.find((p) => p.providerId === "phyn-direct").pilotMode, "preview-eligible");
  assert.equal(providers.find((p) => p.providerId === "moen-direct").pilotMode, "observe-only");
  assert.equal(phyn.availability, "available");
  assert.equal(moenVerification.availability, "unavailable");
  assert.equal(moenVerification.purchaseSignal, "sold-out");
});

test("real-provider certification now requires the independent freshness verification decision", () => {
  assert.match(pilot, /verifyProviderFulfillmentFreshness/);
  assert.match(pilot, /verification\.status !== "verified"/);
  assert.match(pilot, /provider_registry_observe_only/);
});

test("provider verification receipts are append-only operator-observable records", () => {
  assert.match(schema, /marketProviderVerificationReceipts/);
  assert.match(migration, /CREATE TABLE `market_provider_verification_receipts`/);
  assert.match(store, /marketProviderVerificationReceipts/);
  assert.match(store, /onConflictDoNothing/);
  assert.match(admin, /Provider verified/);
  assert.match(admin, /Verified price/);
});

test("recommendation engine remains independent of live provider verification", () => {
  assert.doesNotMatch(scan, /provider-verification/i);
  assert.doesNotMatch(scan, /marketProviderVerification/i);
  assert.doesNotMatch(scan, /sponsor/i);
});
