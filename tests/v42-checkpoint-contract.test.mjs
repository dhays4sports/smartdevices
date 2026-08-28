import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const ledger = fs.readFileSync("docs/V4.2_CHECKPOINT_LEDGER.md", "utf8");
const program = fs.readFileSync("docs/PROGRAM_LEDGER.md", "utf8");
const initialTable = ledger.split("## Completion log")[0];
const sprintIds = [...initialTable.matchAll(/\| (SD42-[A-Z]+-[0-9]+\.[0-9]+) \|/g)].map((match) => match[1]);

test("v4.2 checkpoint contract enumerates the complete 58-sprint program once", () => {
  assert.equal(sprintIds.length, 58);
  assert.equal(new Set(sprintIds).size, 58);
  assert.equal(sprintIds[0], "SD42-FND-0.1");
  assert.equal(sprintIds.at(-1), "SD42-CERT-10.5");
});

test("every sprint has a named evidence location before work begins", () => {
  for (const line of initialTable.split("\n").filter((value) => /^\| SD42-/.test(value))) {
    const columns = line.split("|").map((value) => value.trim());
    assert.ok(columns[3] && columns[3] !== "Planned", `missing evidence: ${line}`);
  }
});

test("release archives must be root deployable and exclude nested archives", () => {
  const baseline = fs.readFileSync("docs/V4.2_BASELINE_AND_MIGRATION.md", "utf8");
  assert.match(baseline, /Package manager: npm/);
  const ignore = fs.readFileSync(".gitignore", "utf8");
  assert.match(ignore, /\/dist\//);
  assert.doesNotMatch(program, /historical sprint checkpoints.*duplicated copies/i);
});
