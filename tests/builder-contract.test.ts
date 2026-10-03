import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { classifyBuilderSafety, createDeviceProject, inferCapability, selectProjectArchitecture } from "../app/lib/builder-engine";
import { inferDeviceIntelligence } from "../app/lib/device-intelligence";
import { buildPackFiles } from "../app/lib/builder-pack";
import { devices } from "../app/lib/data";
import type { BuilderAnswers } from "../app/lib/builder-contract";

const answers: BuilderAnswers = { environment: "indoor", power: "usb", connectivity: "wifi", deploymentIntent: "auto", quantity: 1, goal: "functional-prototype", budget: "30-75" };

test("benchmark ideas resolve to expected V1 capabilities", () => {
  const benchmarks = JSON.parse(fs.readFileSync("content/builder-benchmarks.json", "utf8"));
  for (const benchmark of benchmarks) assert.equal(inferCapability(benchmark.idea), benchmark.expectedCapability);
});

test("supported low-voltage monitoring and blocked high-risk control stay distinct", () => {
  assert.equal(classifyBuilderSafety("Alert me if my freezer gets too warm", answers).safetyClass, "supported");
  assert.equal(classifyBuilderSafety("Build a controller that automatically operates my natural gas shutoff valve", answers).safetyClass, "blocked-autonomous");
});

test("Builder creates a module-first project and portable build pack", () => {
  const project = createDeviceProject("Alert me if my freezer gets too warm for more than ten minutes.", answers, devices);
  assert.equal(project.schemaVersion, 4);
  assert.equal(project.selectedArchitectureId, "balanced");
  assert.equal(project.research.status, "catalog-only");
  assert.equal(project.execution.firmware.status, "not-run");
  assert.equal(project.hosted, false);
  assert.ok(project.requiredCapabilities.some((item) => item.id === "measure.temperature"));
  assert.ok(project.bom.length >= 6);
  assert.ok(project.bom.every((line) => line.v1Approved));
  assert.equal(project.validations.find((item) => item.id === "firmware")?.status, "not-run");
  const files = buildPackFiles(project);
  for (const required of ["README.md", "Project_Brief.md", "Requirements_Orchestration.md", "Research_Decision.md", "Intelligence_Architecture.md", "Capability_Requirements.md", "BOM.csv", "Firmware/device.ino", "Firmware/libraries.txt", "CAD/enclosure.py", "Build_Execution.md", "Assembly_Guide.md", "Test_Procedure.md", "Validation.md", "Project_Manifest.json"]) assert.ok(files[required], `missing ${required}`);
});

test("R2 direction upgrades supported project to engineering review", () => {
  const project = createDeviceProject("Tell me when my mailbox opens.", answers, devices);
  const r2 = selectProjectArchitecture(project, "production-minded");
  assert.equal(r2.safetyClass, "review-required");
  assert.equal(r2.selectedArchitectureId, "production-minded");
  assert.ok(r2.revision > project.revision);
});


test("intelligence architecture distinguishes ordinary connectivity from Mesh-scale coordination", () => {
  assert.equal(inferDeviceIntelligence("Alert me if a restaurant freezer gets too warm", answers).mode, "connected");
  const fleetAnswers = { ...answers, quantity: 10 as const };
  assert.equal(inferDeviceIntelligence("Monitor doors across several business locations", fleetAnswers).mode, "mesh-ready");
  assert.equal(inferDeviceIntelligence("Make these devices Mesh nodes our AI agent can discover and manage as a fleet", fleetAnswers).mode, "mesh-native");
});
