import fs from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

const attribution = fs.readFileSync("app/lib/market/outcome-attribution.ts", "utf8");
const conversion = fs.readFileSync("app/lib/market/conversion.ts", "utf8");
const store = fs.readFileSync("app/lib/market/conversion-store.ts", "utf8");
const userRoute = fs.readFileSync("app/api/market/conversion/user/route.ts", "utf8");
const providerRoute = fs.readFileSync("app/api/market/conversion/provider/route.ts", "utf8");
const component = fs.readFileSync("app/components/CommercialOptions.tsx", "utf8");
const schema = fs.readFileSync("db/schema.ts", "utf8");
const migration = fs.readFileSync("drizzle/0011_market_conversion_proof.sql", "utf8");
const scan = fs.readFileSync("app/lib/scan.ts", "utf8");
const env = fs.readFileSync(".env.example", "utf8");


test("conversion confirmation uses a longer separately exposed signed token", () => {
  assert.match(attribution, /conversionToken/);
  assert.match(attribution, /conversionExpiresAt/);
  assert.match(attribution, /24 \* 60 \* 60_000/);
  assert.match(attribution, /verifyPreviewConversionToken/);
});

test("user conversion requires explicit confirmation and remains self-reported", () => {
  assert.match(userRoute, /confirmed !== true/);
  assert.match(userRoute, /source: "user-confirmed"/);
  assert.match(userRoute, /confidence: "self-reported"/);
  assert.match(component, /I purchased this/);
  assert.match(component, /I had it installed/);
  assert.match(component, /self-reported/);
});

test("provider callbacks are HMAC authenticated, timestamp bounded, and replay protected", () => {
  assert.match(conversion, /createHmac\("sha256"/);
  assert.match(conversion, /5 \* 60_000/);
  assert.match(providerRoute, /recordProviderCallbackNonce/);
  assert.match(providerRoute, /replayed_callback/);
  assert.match(schema, /marketProviderCallbackNonces/);
  assert.match(migration, /market_provider_callback_nonce_unique/);
});

test("provider-verified conversion must match attributed provider identity", () => {
  assert.match(providerRoute, /lineage\.providerId !== verified\.providerId/);
  assert.match(providerRoute, /provider_mismatch/);
  assert.match(providerRoute, /confidence: "provider-verified"/);
  assert.match(providerRoute, /source: "provider-callback"/);
});

test("conversion receipts bind lineage and hash provider references", () => {
  for (const field of ["allocationReceiptId", "offerIdentityReceiptId", "providerVerificationReceiptId", "offerId", "providerId", "deviceId"]) assert.match(conversion, new RegExp(field));
  assert.match(conversion, /providerReferenceHash/);
  assert.match(store, /bindingHash/);
  assert.match(schema, /marketConversionReceipts/);
  assert.match(migration, /market_conversion_transaction_event_source_unique/);
});

test("click/open attribution remains separate from conversion proof", () => {
  assert.match(component, /sponsored-offer-opened/);
  assert.match(component, /\/api\/market\/outcome/);
  assert.match(component, /\/api\/market\/conversion\/user/);
  assert.match(component, /transaction\.attributionToken/);
  assert.match(component, /transaction\.conversionToken/);
  assert.match(attribution, /purpose: "outcome"/);
  assert.match(attribution, /purpose: "conversion"/);
});

test("provider callbacks are disabled by default and conversion remains outside recommendation logic", () => {
  assert.match(env, /SMARTDEVICES_MARKET_PROVIDER_CALLBACKS_ENABLED=false/);
  assert.match(env, /SMARTDEVICES_MARKET_PROVIDER_CALLBACK_SECRETS_JSON=/);
  assert.doesNotMatch(scan, /conversion-store/i);
  assert.doesNotMatch(scan, /provider-callback/i);
  assert.doesNotMatch(scan, /market_conversion/i);
});
