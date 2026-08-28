import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const workspace = fs.readFileSync(new URL("../app/components/ProWorkspace.tsx", import.meta.url), "utf8");

test("Pro builder is scan-aware and keeps templates PII-free", () => {
  assert.match(workspace, /buildScanResult/);
  assert.match(workspace, /Consented scan context/);
  assert.match(workspace, /keeps them unknown/);
  const templateBlock = workspace.slice(workspace.indexOf("const templates"), workspace.indexOf("export function"));
  assert.doesNotMatch(templateBlock, /clientName|email|phone|address|policy/i);
});

test("co-branding is secondary and professional assertions remain labeled", () => {
  const plan = fs.readFileSync(new URL("../app/components/SafetyPlanClient.tsx", import.meta.url), "utf8");
  assert.match(plan, /Prepared with SmartDevices Pro/);
  assert.match(plan, /Professional-supplied note/);
  assert.match(plan, /not SmartDevices-verified product or insurance evidence/);
  assert.match(workspace, /assertionStatus: "professional-supplied"/);
});

test("sharing and follow-up states stay literal", async () => {
  const { DisabledPlanShareAdapter, MemoryPlanShareAdapter } = await import("../app/lib/share");
  const request = { planId: "pln_test", recipientRef: "opaque-test", consentPurpose: "protection-plan" as const, requestedAt: new Date(0).toISOString() };
  assert.deepEqual(await new DisabledPlanShareAdapter().deliver(request), { state: "adapter-disabled" });
  assert.equal((await new MemoryPlanShareAdapter().deliver(request)).state, "accepted");
  assert.match(workspace, /A view is not treated as purchase intent/);
  assert.match(workspace, /Not sent: a reviewed delivery adapter/);
});

test("handoff v1 remains readable and v2 carries only consented provenance", async () => {
  const { validateHandoff } = await import("../app/lib/integrations");
  const base = { handoffId: "hof_12345678", sourceSystem: "coveragefit", destinationSystem: "smartdevices-pro", issuedAt: new Date(Date.now() - 1_000).toISOString(), expiresAt: new Date(Date.now() + 60_000).toISOString(), consent: { purpose: "protection-plan", capturedAt: new Date().toISOString(), policyVersion: "2026-08" } };
  const v1 = validateHandoff({ ...base, schemaVersion: 1, context: { domain: "home", concernIds: ["water"] } });
  assert.equal(v1.schemaVersion, 1);
  const v2 = validateHandoff({ ...base, handoffId: "hof_abcdefgh", schemaVersion: 2, context: { domain: "vehicle", concernIds: ["theft"], clientReference: "ref_opaque123", scan: { schemaVersion: 1, primaryConcernId: "theft", selectedConcernIds: ["theft"], rationaleFactorIds: ["street-parking"], unknownQuestionIds: ["V-POWER"] }, clientIntent: "help-choose" } });
  assert.equal(v2.schemaVersion, 2);
  assert.throws(() => validateHandoff({ ...base, handoffId: "hof_forbidden", schemaVersion: 2, context: { domain: "vehicle", email: "client@example.com" } }), /PROHIBITED_HANDOFF_FIELD/);
});
