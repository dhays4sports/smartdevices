import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const map = fs.readFileSync("app/components/CarrierProtectionMap.tsx", "utf8");
const demo = fs.readFileSync("app/components/CausalDemo.tsx", "utf8");

test("carrier water path reuses the governed water demonstration", () => {
  assert.match(map, /context\.category === "water"/);
  assert.match(map, /demonstrations\.water/);
  assert.match(map, /not evidence of \{carrierName\} acceptance/);
});

test("reused demonstration retains complete motion and text controls", () => {
  for (const control of ["Play sequence", "Pause", "Replay", "Skip motion"]) assert.match(demo, new RegExp(control));
  assert.match(demo, /prefers-reduced-motion/);
  assert.match(demo, /visibilitychange/);
  assert.match(demo, /<ol className="demo-narration">/);
});
