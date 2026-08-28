import assert from "node:assert/strict";
import test from "node:test";
import { buildScanResult } from "../app/lib/scan";
import { createCarrierPlan, createLocalPlan, decodePlanSelection, encodePlanSelection } from "../app/lib/plan";
import fs from "node:fs";

test("plan v2 preserves explainable provenance outside the share URL", () => {
  const scan = buildScanResult("home", "water", [
    { questionId: "H-AWAY", optionId: "often" },
    { questionId: "H-RESPONSE", optionId: "automatic" },
    { questionId: "U-INSTALL", optionId: "professional" },
    { questionId: "U-SUBSCRIPTION", optionId: "compare" },
    { questionId: "H-CONNECTIVITY", optionId: "unknown" },
  ]);
  const ids = scan.recommendations.map((item) => item.device.id);
  const plan = createLocalPlan("home", "water", ids, "consumer-explorer", scan);
  assert.equal(plan.schemaVersion, 2);
  assert.ok(plan.schemaVersion === 2 && plan.provenance.unknowns.length > 0);
  const encoded = encodePlanSelection(plan);
  assert.match(encoded, /v=2/);
  assert.doesNotMatch(encoded, /H-AWAY|often|unknowns|rationale|address|email|phone/i);
});

test("v1 and v2 sanitized selections remain readable", () => {
  const legacy = decodePlanSelection(new URLSearchParams("domain=home&concern=water&items=moen-flo-shutoff"));
  const current = decodePlanSelection(new URLSearchParams("v=2&domain=vehicle&concern=theft&items=bouncie-tracker"));
  assert.equal(legacy?.schemaVersion, 1);
  assert.equal(current?.schemaVersion, 2);
});

test("plan v3 preserves carrier provenance without raw answers or PII in a share URL", () => {
  const plan = createCarrierPlan({ carrierId: "farmers", jurisdiction: "CA", intent: "requirement", category: "water", requestedCapabilityIds: ["automatic-main-water-shutoff"], assertionSource: "consumer-stated", unknowns: ["Exact policy scope is unknown."], policyScope: "unknown" }, ["moen-flo-shutoff"]);
  assert.equal(plan.schemaVersion, 3);
  assert.equal(plan.carrierProvenance.assertionStatus, "consumer-unverified");
  assert.ok(plan.carrierProvenance.ruleIds.length > 0);
  const url = encodePlanSelection(plan);
  assert.match(url, /v=3/);
  assert.match(url, /carrier=farmers/);
  assert.doesNotMatch(url, /Exact\+policy|rawAnswers|questionId|optionId|address|email|phone|claim|contact/i);
  const decoded = decodePlanSelection(new URLSearchParams(url));
  assert.equal(decoded?.schemaVersion, 3);
  assert.equal(decoded?.carrierProvenance?.carrierId, "farmers");
  assert.equal(decoded?.carrierProvenance?.assertionStatus, "consumer-unverified");
  assert.deepEqual(decoded?.carrierProvenance?.requestedCapabilityIds, ["automatic-main-water-shutoff"]);
});

test("v1, v2, and v3 sanitized selections remain readable", () => {
  assert.equal(decodePlanSelection(new URLSearchParams("domain=home&concern=water&items=moen-flo-shutoff"))?.schemaVersion, 1);
  assert.equal(decodePlanSelection(new URLSearchParams("v=2&domain=vehicle&concern=theft&items=bouncie-tracker"))?.schemaVersion, 2);
  assert.equal(decodePlanSelection(new URLSearchParams("v=3&domain=home&concern=water&items=moen-flo-shutoff"))?.schemaVersion, 3);
});

test("plan client exposes save, resume, share, print, and export continuity", () => {
  const source = fs.readFileSync(new URL("../app/components/SafetyPlanClient.tsx", import.meta.url), "utf8");
  const localStore = fs.readFileSync(new URL("../app/lib/local-plan-store.ts", import.meta.url), "utf8");
  assert.match(localStore, /smartdevices-safety-plan-v2-/);
  assert.match(source, /navigator\.share/);
  assert.match(source, /window\.print/);
  assert.match(source, /Export JSON/);
  assert.match(source, /Saved on this device/);
  assert.match(source, /non-authoritative|Saved only in this browser/);
});

test("intent is explicit and contact remains optional after value", () => {
  const explorer = fs.readFileSync(new URL("../app/components/ProtectionExplorer.tsx", import.meta.url), "utf8");
  const planClient = fs.readFileSync(new URL("../app/components/SafetyPlanClient.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(explorer, /name="(?:email|phone|address|contact)"/i);
  assert.match(planClient, /What would you genuinely do next/);
  assert.match(planClient, /Your plan is already complete\. Contact information is only needed if you want follow-up/);
  assert.match(planClient, /deliveryStatus: "not-sent-local-only"/);
  assert.doesNotMatch(planClient, /page view.*purchase intent/i);
});
