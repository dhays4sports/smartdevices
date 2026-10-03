import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import test from "node:test";

const scene = await readFile(new URL("../app/components/InteractiveScene.tsx", import.meta.url), "utf8");
const demo = await readFile(new URL("../app/components/CausalDemo.tsx", import.meta.url), "utf8");
const experience = await readFile(new URL("../app/lib/experience.ts", import.meta.url), "utf8");
const css = await readFile(new URL("../app/globals.css", import.meta.url));

test("nonessential scenes are lazy and missing images preserve every text control", () => {
  assert.match(scene, /loading="lazy"/);
  assert.doesNotMatch(scene, /\spriority(?:\s|>)/);
  assert.match(scene, /has-image-fallback/);
  assert.match(scene, /Every protection area remains available below/);
  assert.match(scene, /scene-list-item/);
});

test("motion is interruptible in a background tab", () => {
  assert.match(demo, /visibilitychange/);
  assert.match(demo, /document\.hidden/);
  assert.match(demo, /dispatch\(\{ type: "PAUSE" \}\)/);
});

test("analytics-disabled mode is literal and stores no event", () => {
  assert.match(experience, /class DisabledExperienceEventAdapter/);
  assert.match(experience, /status: "disabled"/);
  assert.doesNotMatch(experience, /fetch\(|sendBeacon\(/);
});

test("scene imagery remains within the published lazy-load budget", async () => {
  for (const asset of ["home-protection-hero.png", "vehicle-protection-hero.png"]) {
    const info = await stat(new URL(`../public/assets/${asset}`, import.meta.url));
    assert.ok(info.size <= 1_700_000, `${asset} exceeded 1.7 MB lazy scene budget`);
  }
});

test("v4.2.3 global CSS stays within its reviewed raw and gzip budgets", () => {
  assert.ok(css.byteLength <= 82_000, `global CSS ${css.byteLength} bytes exceeded 82 KB`);
  assert.ok(gzipSync(css).byteLength <= 15_000, `global CSS gzip exceeded 15 KB`);
});
