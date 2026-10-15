import fs from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

const attribution = fs.readFileSync("app/lib/market/outcome-attribution.ts", "utf8");
const outcomeRoute = fs.readFileSync("app/api/market/outcome/route.ts", "utf8");
const shadowRoute = fs.readFileSync("app/api/market/shadow/route.ts", "utf8");
const component = fs.readFileSync("app/components/CommercialOptions.tsx", "utf8");
const schema = fs.readFileSync("db/schema.ts", "utf8");
const migration = fs.readFileSync("drizzle/0010_market_outcome_attribution.sql", "utf8");
const scan = fs.readFileSync("app/lib/scan.ts", "utf8");
const env = fs.readFileSync(".env.example", "utf8");

test("preview attribution token cryptographically binds full commercial lineage", () => {
  assert.match(attribution, /createHmac\("sha256"/);
  assert.match(attribution, /timingSafeEqual/);
  for (const field of ["allocationReceiptId", "offerIdentityReceiptId", "providerVerificationReceiptId", "offerId", "providerId", "deviceId", "destinationUrl"]) {
    assert.match(attribution, new RegExp(field));
  }
  assert.match(attribution, /30 \* 60_000/);
  assert.match(env, /SMARTDEVICES_MARKET_OUTCOME_SECRET=/);
});

test("shadow preview issues attribution only server-side", () => {
  assert.match(shadowRoute, /issuePreviewTransaction/);
  assert.match(shadowRoute, /preview\.transaction = transaction/);
  assert.doesNotMatch(component, /SMARTDEVICES_MARKET_OUTCOME_SECRET/);
});

test("preview reports viewed and opened without blocking navigation", () => {
  assert.match(component, /sponsored-offer-viewed/);
  assert.match(component, /sponsored-offer-opened/);
  assert.match(component, /keepalive: true/);
  assert.match(component, /Attributed preview unavailable/);
});

test("outcome endpoint rejects invalid or expired attribution", () => {
  assert.match(outcomeRoute, /verifyPreviewAttributionToken/);
  assert.match(outcomeRoute, /invalid_or_expired_attribution/);
  assert.match(outcomeRoute, /SMARTDEVICES_MARKET_PREVIEW_ENABLED/);
});

test("outcomes are append-only and idempotent per transaction/event", () => {
  assert.match(schema, /marketOutcomeAttributions/);
  assert.match(schema, /market_outcome_transaction_event_unique/);
  assert.match(migration, /CREATE TABLE `market_outcome_attributions`/);
  assert.match(migration, /CREATE UNIQUE INDEX `market_outcome_transaction_event_unique`/);
});

test("outcome attribution does not enter recommendation logic", () => {
  assert.doesNotMatch(scan, /outcome-attribution/i);
  assert.doesNotMatch(scan, /market_outcome/i);
  assert.doesNotMatch(scan, /sponsored-offer/i);
});

test("persisted provider verification evaluates the same carrier-program offer as preview", () => {
  const store = fs.readFileSync("app/lib/market/shadow-store.ts", "utf8");
  assert.match(store, /fulfillmentType: identity\.fulfillmentType/);
  assert.match(store, /programCarrierId: identity\.programCarrierId/);
  assert.match(store, /programId: identity\.programId/);
  assert.match(store, /channelVariantId: identity\.channelVariantId/);
  assert.match(store, /certifyRealProviderOffer\(offer, intent\.programContext\)/);
});
