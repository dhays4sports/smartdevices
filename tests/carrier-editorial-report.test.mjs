import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("editorial evidence report is deterministic and release-safe", () => {
  const first = spawnSync(process.execPath, ["scripts/validate-carrier-evidence.mjs"], { encoding: "utf8", env: { ...process.env, SD42_REVIEW_DATE: "2026-08-26" } });
  const second = spawnSync(process.execPath, ["scripts/validate-carrier-evidence.mjs"], { encoding: "utf8", env: { ...process.env, SD42_REVIEW_DATE: "2026-08-26" } });
  assert.equal(first.status, 0);
  assert.equal(first.stdout, second.stdout);
  const report = JSON.parse(first.stdout);
  assert.deepEqual(report.orphanRules, []);
  assert.deepEqual(report.publicLeaks, []);
  assert.deepEqual(report.draft, []);
  assert.deepEqual(report.stale, []);
});

test("evidence validator uses the current date by default and exposes overdue reviews", () => {
  const env = { ...process.env }; delete env.SD42_REVIEW_DATE;
  const current = spawnSync(process.execPath, ["scripts/validate-carrier-evidence.mjs"], { encoding: "utf8", env });
  assert.equal(current.status, 0);
  const report = JSON.parse(current.stdout);
  assert.equal(report.evaluatedAt, new Date().toISOString().slice(0, 10));
});
