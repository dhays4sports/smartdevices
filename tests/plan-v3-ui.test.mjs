import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../app/components/SafetyPlanClient.tsx", import.meta.url), "utf8");
const localStore = fs.readFileSync(new URL("../app/lib/local-plan-store.ts", import.meta.url), "utf8");
test("carrier plan renders only applicable truth sections", () => { for (const heading of ["What you told us", "What your professional supplied", "What current", "public evidence says", "What SmartDevices recommends", "What still needs confirmation"]) assert.match(source, new RegExp(heading)); assert.match(source, /assertionStatus ===/); assert.match(source, /carrierName/); });
test("capability precedes product and no score or decision is manufactured", () => { assert.match(source, /Capability before product/); assert.match(source, /no client decision is preselected/i); assert.doesNotMatch(source, /score\s*[=:]|scoreValue|calculateScore/i); });
test("carrier narrative preserves source version, date, and historic warning", () => { assert.match(source, /source\.version/); assert.match(source, /source\.checkedDate/); assert.match(source, /historicCarrierWarning/); });
test("v3 continuity keeps local resume, safe export, print checklist, and honest degraded states", () => { assert.match(localStore, /smartdevices-safety-plan-v3-/); assert.match(source, /readLocalPlan/); assert.match(source, /Export JSON/); assert.match(source, /WaterInstallationChecklist/); assert.match(source, /status === "expired"/); assert.match(source, /status === "revoked"/); assert.match(source, /Sharing is unavailable here/); });
