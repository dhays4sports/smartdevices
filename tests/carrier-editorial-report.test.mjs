import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("editorial evidence report is deterministic and release-safe", () => {
  const first = spawnSync(process.execPath, ["scripts/validate-carrier-evidence.mjs"], { encoding: "utf8" });
  const second = spawnSync(process.execPath, ["scripts/validate-carrier-evidence.mjs"], { encoding: "utf8" });
  assert.equal(first.status, 0);
  assert.equal(first.stdout, second.stdout);
  const report = JSON.parse(first.stdout);
  assert.deepEqual(report.orphanRules, []);
  assert.deepEqual(report.publicLeaks, []);
  assert.deepEqual(report.draft, []);
  assert.deepEqual(report.stale, []);
});
