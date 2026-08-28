import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const universe = fs.readFileSync(new URL("../app/components/DeviceUniverse.tsx", import.meta.url), "utf8");
const card = fs.readFileSync(new URL("../app/components/DeviceCard.tsx", import.meta.url), "utf8");
const explorer = fs.readFileSync(new URL("../app/components/ProtectionExplorer.tsx", import.meta.url), "utf8");

test("Device Universe links comparison, detail, and explanation without scores", () => {
  assert.match(universe, /\/compare\?items=/);
  assert.match(card, /\/devices\/\$\{device\.slug\}/);
  assert.match(universe, /Why this appears and what still needs checking/);
  assert.doesNotMatch(universe, /safety score:\s*\d|protection score/i);
});

test("visual map is hidden from assistive technology and list is ordered", () => {
  assert.match(universe, /className="universe-map" aria-hidden="true"/);
  assert.match(universe, /<ol className="universe-list">/);
});

test("plan bridge caps stated selections at five and preserves literal state", () => {
  assert.match(explorer, /current\.length >= 5/);
  assert.match(explorer, /added as your stated selection/);
  assert.doesNotMatch(explorer, /purchase intent/i);
  assert.match(universe, /No defensible device match yet/);
});
