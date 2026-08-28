import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const explorer = await readFile(new URL("../app/components/ProtectionExplorer.tsx", import.meta.url), "utf8");
const scene = await readFile(new URL("../app/components/InteractiveScene.tsx", import.meta.url), "utf8");
const universe = await readFile(new URL("../app/components/DeviceUniverse.tsx", import.meta.url), "utf8");
const scan = await readFile(new URL("../app/components/IntelligentScan.tsx", import.meta.url), "utf8");

test("global accessibility modes and focus treatment remain explicit", () => {
  assert.match(css, /:focus-visible\s*\{[^}]*outline:\s*3px/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /@media \(forced-colors: active\)/);
  assert.match(css, /@media \(max-width: 720px\)/);
});

test("primary controls and text-equivalent scene controls meet the 44px target contract", () => {
  assert.match(css, /\.button-primary, \.button-subtle\s*\{[^}]*min-height:\s*44px/);
  assert.match(css, /\.scene-list-item\s*\{[^}]*min-height:\s*44px/);
  assert.match(css, /\.hotspot\s*\{[^}]*width:\s*44px;\s*height:\s*44px/);
  assert.match(css, /\.hero-domain-shortcuts button\s*\{[^}]*min-height:\s*46px/);
});

test("spatial discovery and visual result maps preserve ordered text equivalents", () => {
  assert.match(scene, /aria-label=\{`\$\{domain\.label\} protection areas`\}/);
  assert.match(scene, /className=\{zone\.id === concern\?\.id \? "scene-list-item is-active"/);
  assert.match(universe, /aria-hidden="true"/);
  assert.match(universe, /<ol className="universe-list"/);
});

test("scan and journey expose names, values, progress, and live state", () => {
  assert.match(scan, /<fieldset/);
  assert.match(scan, /<legend/);
  assert.match(scan, /aria-live="polite"/);
  assert.match(explorer, /aria-current=\{index === progressIndex \? "step"/);
  assert.match(explorer, /aria-pressed=\{item\.id === journey\.domainId\}/);
});
