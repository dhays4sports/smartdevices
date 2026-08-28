import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const catalog = JSON.parse(fs.readFileSync("content/catalog.json", "utf8"));
const sources = JSON.parse(fs.readFileSync("content/evidence-sources.json", "utf8"));
const fits = JSON.parse(fs.readFileSync("content/device-carrier-fit.json", "utf8"));

test("Moen Flo facts are current, bounded, and visibly unavailable at review", () => {
  const moen = catalog.find((device) => device.id === "moen-flo-shutoff");
  assert.equal(moen.lastReviewed, "2026-08-26");
  assert.equal(moen.availability, "unavailable");
  assert.match(moen.priceBand, /\$623\.99.*sold out/i);
  assert.match(moen.connectivity, /2\.4 GHz.*AC power/i);
  assert.match(moen.subscription, /no monthly fee.*when reviewed/i);
  assert.match(moen.limitations.join(" "), /plumbing-professional.*one-year limited warranty/i);
});

test("public-offer label has both Farmers and Moen evidence and disappears with fit withdrawal", () => {
  const fit = fits.fits.find((item) => item.deviceId === "moen-flo-shutoff");
  assert.equal(fit.fit, "explicitly-named-public-offer");
  assert.ok(fit.sourceIds.some((id) => sources.sources.find((source) => source.id === id)?.domain === "farmers.com"));
  assert.ok(fit.sourceIds.some((id) => sources.sources.find((source) => source.id === id)?.domain === "shop.moen.com"));
  assert.notEqual({ ...fit, status: "withdrawn" }.status, "active");
});
