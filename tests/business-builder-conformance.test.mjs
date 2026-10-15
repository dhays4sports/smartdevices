import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFile(resolve(root, path), "utf8");

test("SD-BB-0 records a REDESIGN result and remains a documentation-only v5.2 decision record", async () => {
  const record = JSON.parse(await read("docs/SD-BB-0_CONFORMANCE_RECORD.json"));
  assert.equal(record.result, "REDESIGN");
  assert.equal(record.continue, true);
  assert.equal(record.runtime_changes, false);
  assert.match(record.baseline, /v5\.2\.0-rc\.1/i);
});

test("SmartDevices critical path proves MVB before making Mesh-device proof blocking", async () => {
  const record = JSON.parse(await read("docs/SD-BB-0_CONFORMANCE_RECORD.json"));
  const mvbIndex = record.critical_path.indexOf("MVB");
  const meshIndex = record.critical_path.indexOf("MESH-DEVICE-001");
  assert.ok(mvbIndex >= 0 && meshIndex >= 0 && mvbIndex < meshIndex);
  assert.equal(record.mesh_device_001_blocks_mvb, false);
});

test("business blueprint defines a customer, paid unit, durable asset, and autonomy metrics", async () => {
  const conformance = await read("docs/SD-BB-0_BUSINESS_BUILDER_CONFORMANCE.md");
  const blueprint = await read("docs/SMARTDEVICES_BUSINESS_BLUEPRINT.md");
  const autonomy = await read("docs/SMARTDEVICES_MVB_MAB_AUTONOMY.md");
  for (const term of ["Initial paying wedge", "Canonical capability", "Durable asset", "Revenue model", "Distribution", "MVB", "MAB", "Mesh Mapping"]) {
    assert.match(conformance, new RegExp(term, "i"), `missing ${term}`);
  }
  assert.match(blueprint, /Validated Build Pack/i);
  assert.match(blueprint, /SmartDevices Build Evidence Graph/i);
  for (const term of ["Owner Intervention Hours", "Intervention Rate", "Autonomous Gross Profit Efficiency"]) {
    assert.match(autonomy, new RegExp(term));
  }
});

test("SD-001 is BB7 technical proof rather than MVB revenue", async () => {
  const plan = await read("docs/SD001_FIRST_PHYSICAL_PROOF_AND_MESH_NODE_PLAN.md");
  assert.match(plan, /SD-001[^\n]*BB7/i);
  assert.match(plan, /SD-MVB-001/i);
  assert.match(plan, /MESH-DEVICE-001[^\n]*not[^\n]*next required business gate/i);
});

test("conformance preserves key anti-goals", async () => {
  const record = JSON.parse(await read("docs/SD-BB-0_CONFORMANCE_RECORD.json"));
  assert.equal(record.marketplace_before_mvb, false);
  assert.equal(record.generic_build_anything_scope, false);
  assert.equal(record.mesh_required_for_all_devices, false);
});
