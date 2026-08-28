import test from "node:test";
import assert from "node:assert/strict";
import { initialWaterChecklistState, toggleWaterChecklist, waterInstallationChecklist } from "../app/lib/water-checklist";

test("water checklist covers compatibility, installer, optional photos, documents, function, account, service, and carrier confirmation", () => {
  assert.equal(waterInstallationChecklist.length, 8);
  const text = waterInstallationChecklist.map((item) => item.label).join(" ");
  for (const pattern of [/size.*material.*power.*Wi-Fi/i, /qualified plumbing professional/i, /Optionally retain.*photos/i, /receipt.*model/i, /function check/i, /account ownership/i, /subscription.*warranty/i, /carrier or agent.*documentation/i]) assert.match(text, pattern);
});

test("checkbox completion remains self-reported and reversible", () => {
  const selected = toggleWaterChecklist(initialWaterChecklistState, "compatibility");
  assert.deepEqual(selected.completedSelfReported, ["compatibility"]);
  assert.deepEqual(toggleWaterChecklist(selected, "compatibility").completedSelfReported, []);
  assert.equal(selected.delivery, "not-requested");
});
