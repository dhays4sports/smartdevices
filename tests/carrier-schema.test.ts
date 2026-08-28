import test from "node:test";
import assert from "node:assert/strict";
import {
  carrierQuestions,
  deviceCarrierFits,
  evaluateCarrierGuidance,
  evidenceIsCurrent,
  publicEvidenceSources,
  validateCarrierContent,
  validateEvidenceSourceRecord,
  canTransitionEvidence,
} from "../app/lib/carrier";

test("carrier content has no duplicate, orphan, restricted, or invalid records", () => {
  assert.deepEqual(validateCarrierContent(), []);
  assert.equal(publicEvidenceSources().every((source) => source.visibility === "public"), true);
});

test("evidence source records require scope, dates, limitations, and safe visibility", () => {
  assert.deepEqual(validateEvidenceSourceRecord({ id: "incomplete", visibility: "public" }), [
    "SOURCE_ID_OWNER_DOMAIN_REQUIRED",
    "SOURCE_CHECKED_DATE_REQUIRED",
    "SOURCE_REVIEW_DUE_DATE_REQUIRED",
    "SOURCE_JURISDICTION_REQUIRED",
    "SOURCE_LIMITATIONS_REQUIRED",
    "PUBLIC_URL_REQUIRED",
  ]);
  assert.equal(canTransitionEvidence("draft", "active"), true);
  assert.equal(canTransitionEvidence("active", "withdrawn"), true);
  assert.equal(canTransitionEvidence("retired", "active"), false);
});

test("technical fit and carrier applicability remain separate", () => {
  const phyn = deviceCarrierFits.fits.find((fit) => fit.deviceId === "phyn-plus-v2");
  assert.equal(phyn?.fit, "technical-class-match");
  assert.equal(phyn?.carrierId, "farmers");
  assert.equal(phyn?.limitations.some((item) => /not a Farmers product designation/i.test(item)), true);
});

test("stale evidence cannot produce a current positive label", () => {
  assert.equal(evidenceIsCurrent({ status: "active", reviewDueDate: "2026-08-25" }), false);
  const results = evaluateCarrierGuidance({ carrierId: "farmers", jurisdiction: "CA", intent: "discounts", category: "water", requestedCapabilityIds: ["automatic-main-water-shutoff"], unknowns: [] }, "2027-01-01");
  assert.equal(results.some((result) => result.designation === "carrier-public-offer"), false);
  assert.equal(results.some((result) => result.designation === "confirmation-needed"), true);
});

test("California evidence is never applied outside California", () => {
  const [result] = evaluateCarrierGuidance({ carrierId: "farmers", jurisdiction: "other", intent: "requirements" as never, category: "water", requestedCapabilityIds: [], unknowns: [] });
  assert.equal(result.designation, "confirmation-needed");
  assert.match(result.why, /not been verified/);
});

test("every carrier question changes at least one governed result dimension", () => {
  assert.equal(carrierQuestions.questions.every((question) => question.changes.length > 0), true);
  const prompts = JSON.stringify(carrierQuestions);
  assert.doesNotMatch(prompts, /address|policy number|claim number|birth date|VIN|plate|email|phone/i);
});
