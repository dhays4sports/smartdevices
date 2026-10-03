import test from "node:test";
import assert from "node:assert/strict";
import { devices } from "../app/lib/data";
import { evidenceSources } from "../app/lib/carrier";
import { homeDecisionCatalog, homeOptions, parseHomeProgress, sanitizeHomeContext } from "../app/lib/home-decision";
import { createLocalPlan, encodePlanSelection } from "../app/lib/plan";

test("optional property answers remain local and do not change a public plan URL", () => {
  const plan = createLocalPlan("home", "water", ["phyn-plus-v2"]);
  const publicSelection = encodePlanSelection(plan);
  plan.homeContext = { goal: "shutoff", permission: "no", connection: "unknown" };
  assert.equal(encodePlanSelection(plan), publicSelection);
  assert.deepEqual([...new URLSearchParams(publicSelection).keys()], ["v", "domain", "concern", "items"]);
});

test("Home route only consumes public bounded concern and capability identifiers", () => {
  assert.deepEqual(sanitizeHomeContext(new URLSearchParams("concern=invalid&entry=agent&goal=verified&policy=secret")), { concern: "water", entry: "help", goal: "all" });
  assert.deepEqual(sanitizeHomeContext(new URLSearchParams("concern=water&entry=known&goal=shutoff")), { concern: "water", entry: "known", goal: "shutoff" });
});
test("point sensors never substitute for main-line shutoff", () => {
  assert.deepEqual(homeOptions(devices, "water", "shutoff").map((device) => device.id), ["moen-flo-shutoff", "phyn-plus-v2"]);
  assert.deepEqual(homeOptions(devices, "water", "alerts").map((device) => device.id), ["kidde-water-freeze"]);
  assert.equal(homeOptions(devices.map((device) => ({ ...device, status: "stale" as const })), "water", "shutoff").length, 0);
});
test("expired, restricted or conflicting source evidence suppresses a current catalog match", () => {
  const source = { ...evidenceSources.sources.find((item) => item.url === devices[0].sources[0].url)!, url: devices[0].sources[0].url, reviewDueDate: "2026-09-04", visibility: "public" as const, status: "active" as const };
  for (const changed of [source, { ...source, status: "conflicting" as const }, { ...source, visibility: "restricted" as const }]) {
    assert.equal(homeDecisionCatalog(devices, [changed], "2026-09-05")[0].status, "stale");
  }
  assert.equal(homeDecisionCatalog(devices, [], "2027-01-01")[0].status, "stale");
  assert.equal(homeDecisionCatalog(devices, [], "2026-09-05")[0].lastReviewed, "2026-08-26");
});
test("consumer progress cannot assert review or carrier verification and strips extra fields", () => {
  const sample = { schemaVersion: 1, deviceId: "phyn-plus-v2", state: "installed-self-reported", help: "agent", updatedAt: "2026-09-05T12:00:00Z" };
  assert.deepEqual(parseHomeProgress(JSON.stringify({ ...sample, policyNumber: "ignored" }), [sample.deviceId]), sample);
  for (const state of ["verified", "carrier-approved", "professional-reviewed", "purchased"]) assert.equal(parseHomeProgress(JSON.stringify({ ...sample, state }), [sample.deviceId]), null);
  assert.equal(parseHomeProgress(JSON.stringify(sample), []), null);
  assert.equal(parseHomeProgress("{broken", [sample.deviceId]), null);
});
