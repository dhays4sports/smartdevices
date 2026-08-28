import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const template = await readFile(new URL("../docs/V4.1_CHECKPOINT_MANIFEST_TEMPLATE.md", import.meta.url), "utf8");

test("v4.1 checkpoint contract requires reproducible evidence", () => {
  for (const field of ["Sprint ID", "Git commit SHA", "Protected asset SHA-256", "Focused test", "Normalized regression", "Known limitations"]) {
    assert.match(template, new RegExp(field));
  }
  assert.match(template, /`NOT-RUN` is not a passing status/);
  assert.match(template, /must never be relabeled/);
});
