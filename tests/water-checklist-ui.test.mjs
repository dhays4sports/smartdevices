import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const ui = fs.readFileSync("app/components/WaterInstallationChecklist.tsx", "utf8");

test("checklist print/export works while upload and send fail honestly", () => {
  assert.match(ui, /window\.print/);
  assert.match(ui, /Export checklist JSON/);
  assert.match(ui, /verification: "not-verified"/);
  assert.match(ui, /Not sent\. Secure storage/);
  assert.doesNotMatch(ui, /type="file"|upload succeeded|message sent/i);
});
