import fs from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

const identity = fs.readFileSync("app/lib/market/offer-identity.ts", "utf8");
const runtime = fs.readFileSync("app/lib/market/runtime07.ts", "utf8");
const store = fs.readFileSync("app/lib/market/shadow-store.ts", "utf8");
const schema = fs.readFileSync("db/schema.ts", "utf8");
const migration = fs.readFileSync("drizzle/0008_market_offer_identity.sql", "utf8");
const admin = fs.readFileSync("app/admin/market/page.tsx", "utf8");
const scan = fs.readFileSync("app/lib/scan.ts", "utf8");

test("offer mapping requires the canonical SmartDevices fulfillment schema", () => {
  assert.match(identity, /smartdevices\.market\.fulfillment\/1/);
  assert.match(identity, /smartdevices\.com\/device/);
  assert.match(identity, /canonical_offer_payload_missing/);
});

test("winning offer device must already be SmartDevices-qualified", () => {
  assert.match(identity, /eligibleDeviceIds\.includes\(offer\.device_ref\.id\)/);
  assert.match(identity, /device_not_qualified_by_smartdevices/);
});

test("provider and bid binding are checked rather than inferred", () => {
  assert.match(identity, /bid\.provider_id !== input\.providerId/);
  assert.match(identity, /bid_provider_mismatch/);
  assert.doesNotMatch(identity, /providerName.*device/i);
});

test("runtime resolves identity from the exact allocated bid", () => {
  assert.match(runtime, /allocation\.bid_id/);
  assert.match(runtime, /\/v1\/bids/);
  assert.match(runtime, /resolveOfferIdentity/);
});

test("mapping receipts are append-only and independently persisted", () => {
  assert.match(schema, /market_offer_identity_receipts/);
  assert.match(migration, /CREATE TABLE `market_offer_identity_receipts`/);
  assert.match(store, /marketOfferIdentityReceipts/);
  assert.match(store, /onConflictDoNothing/);
  assert.match(identity, /offerPayloadHash/);
  assert.match(identity, /bindingHash/);
});

test("operator view distinguishes market fill from fulfillment mapping", () => {
  assert.match(admin, /Mapped offers/);
  assert.match(admin, /Mapping rate/);
  assert.match(admin, /Mapped device/);
  assert.match(admin, /Rejected mapping/);
});

test("recommendation engine remains isolated from commercial mapping", () => {
  assert.doesNotMatch(scan, /offer-identity/i);
  assert.doesNotMatch(scan, /marketOfferIdentity/i);
  assert.doesNotMatch(scan, /sponsor/i);
});
