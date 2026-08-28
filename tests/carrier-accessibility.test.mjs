import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const css = fs.readFileSync("app/globals.css", "utf8");
const directory = fs.readFileSync("app/components/CarrierDirectory.tsx", "utf8");
const farmers = fs.readFileSync("app/farmers/page.tsx", "utf8");
const selector = fs.readFileSync("app/components/CarrierIntentSelector.tsx", "utf8");

test("carrier discovery exposes names, live results, landmarks, and text disclosures", () => {
  assert.match(directory, /htmlFor="carrier-search-input"/);
  assert.match(directory, /aria-live="polite"/);
  assert.match(directory, /<ul>/);
  assert.match(selector, /aria-labelledby="carrier-start-heading"/);
  assert.match(farmers, /SmartDevices is independent/);
});

test("carrier discovery preserves 320px reflow, forced colors, and reduced motion", () => {
  const carrierCss = css.split("/* v4.2 carrier intelligence */")[1] ?? "";
  assert.match(css, /@media\(max-width:760px\)/);
  assert.match(css, /@media\(forced-colors:active\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(carrierCss, /animation:\s*[^;]*(infinite|loop)/i);
});

test("carrier surfaces use defined theme aliases and explicit dark-surface foregrounds", () => {
  for (const name of ["accent", "text", "panel", "surface"]) {
    assert.match(css, new RegExp(`--${name}:`));
  }
  assert.match(css, /\.explorer \.carrier-entry-link\{color:rgba\(255,255,255,\.7\)/);
  assert.match(css, /\.carrier-results li\{color:var\(--white\)/);
  assert.match(css, /\.carrier-results li p\{color:rgba\(255,255,255,\.72\)/);
});
