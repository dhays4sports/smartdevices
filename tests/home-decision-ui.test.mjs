import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
test("Home provides direct task choices, optional illustration, source dates and honest availability", () => {
  const ui = read("app/components/HomeDecisionExperience.tsx");
  for (const text of ["Help me choose", "My insurer mentioned a device", "I know what I need", "Show me how it works", "Equipment cost", "Installation · separate cost", "Current availability needs confirmation", "No device is preselected"]) assert.ok(ui.includes(text));
  assert.match(ui, /aria-hidden="true"/);
  assert.match(ui, /tabIndex=\{-1\}/);
  assert.match(ui, /imageFailed/);
  assert.match(ui, /popstate/);
  assert.match(ui, /mode === "memory"/);
});
test("Home plans persist literal progress and expose no active delivery or verification control", () => {
  const ui = read("app/components/HomePlanActions.tsx");
  assert.match(ui, /parseHomeProgress/);
  assert.match(ui, /localStorage\.setItem/);
  assert.match(ui, /carrierDetermination: "unknown"/);
  assert.match(ui, /delivery: "not-sent"/);
  assert.doesNotMatch(ui, /fetch\(|policyNumber|type="file"/);
  assert.match(read("app/components/ProWorkspace.tsx"), /view=home-decision/);
  assert.match(read("app/components/SafetyPlanClient.tsx"), /Full plan, insurance context & source history/);
});
test("Home layout retains reflow, touch targets, reduced motion, print and forced-color treatment", () => {
  const css = read("app/components/home-decision.css");
  for (const text of ["min-height: 44px", "max-width: 380px", "max-width: 760px", "prefers-reduced-motion", "forced-colors", "@media print", "minmax(0,"]) assert.ok(css.includes(text));
});
