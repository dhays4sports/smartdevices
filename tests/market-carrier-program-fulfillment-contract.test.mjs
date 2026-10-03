import fs from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

const contract = fs.readFileSync("app/lib/market/contract.ts", "utf8");
const pilot = fs.readFileSync("app/lib/market/provider-pilot.ts", "utf8");
const identity = fs.readFileSync("app/lib/market/offer-identity.ts", "utf8");
const preview = fs.readFileSync("app/lib/market/preview.ts", "utf8");
const route = fs.readFileSync("app/api/market/shadow/route.ts", "utf8");
const providers = JSON.parse(fs.readFileSync("content/market-provider-pilot.json", "utf8"));
const verifications = JSON.parse(fs.readFileSync("content/market-provider-verification.json", "utf8"));
const catalog = JSON.parse(fs.readFileSync("content/catalog.json", "utf8"));

const program = providers.find((item) => item.providerId === "moen-farmers-program");
const genericMoen = providers.find((item) => item.providerId === "moen-direct");
const deviceOnly = verifications.find((item) => item.offerId === "offer-moen-farmers-device-only");
const installed = verifications.find((item) => item.offerId === "offer-moen-farmers-installed");
const moenDevice = catalog.find((item) => item.id === "moen-flo-shutoff");

test("carrier-program is a first-class fulfillment type with explicit program context", () => {
  assert.match(contract, /carrier-program/);
  assert.match(contract, /programContext/);
  assert.match(contract, /program_ref/);
  assert.match(identity, /carrier-program/);
  assert.match(identity, /programCarrierId/);
});

test("official Moen Farmers channel is separate from generic Moen retail", () => {
  assert.equal(genericMoen.pilotMode, "observe-only");
  assert.equal(program.fulfillmentType, "carrier-program");
  assert.equal(program.carrierId, "farmers");
  assert.equal(program.programId, "farmers-ca-flo-water-shutoff");
  assert.equal(program.pilotMode, "preview-eligible");
  assert.ok(program.allowedDestinationHosts.includes("www.moen.com"));
});

test("Farmers program verification preserves both observed offer variants", () => {
  assert.equal(deviceOnly.price.amount, 445);
  assert.equal(deviceOnly.channelVariantId, "device-only");
  assert.equal(deviceOnly.availability, "available");
  assert.equal(installed.price.amount, 745);
  assert.equal(installed.channelVariantId, "standard-installation");
  assert.equal(installed.availability, "available");
  assert.equal(deviceOnly.sourceUrl, "https://www.moen.com/farmers");
  assert.equal(installed.sourceUrl, "https://www.moen.com/farmers");
});

test("carrier-program availability does not rewrite generic catalog availability", () => {
  assert.equal(moenDevice.availability, "unavailable");
  assert.match(pilot, /provider\.fulfillmentType !== "carrier-program" && device\.availability !== "available"/);
});

test("carrier-program preview requires matching carrier/program context", () => {
  assert.match(pilot, /carrier_program_context_mismatch/);
  assert.match(pilot, /carrier_program_offer_mismatch/);
  assert.match(preview, /intent\?\.programContext/);
  assert.match(route, /previewFromShadowResult\(result, intent\)/);
});
