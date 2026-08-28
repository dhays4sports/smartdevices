import assert from "node:assert/strict";
import test from "node:test";
import { buildScanResult, questionsFor, scanQuestionSet, validateQuestionSet, type ScanAnswer } from "../app/lib/scan";

test("published scan schema is valid and every question changes a decision", () => {
  assert.deepEqual(validateQuestionSet(scanQuestionSet), []);
  assert.ok(scanQuestionSet.questions.every((question) => question.effectAreas.length > 0));
});

test("home and vehicle paths remain within three to five questions", () => {
  for (const [domain, concern] of [["home", "water"], ["home", "fire-electrical"], ["vehicle", "theft"], ["vehicle", "dashcam"]] as const) {
    const questions = questionsFor(domain, concern);
    assert.ok(questions.length >= 3 && questions.length <= 5, `${domain}/${concern}: ${questions.length}`);
  }
});

test("home branches keep rationale tied to published answers", () => {
  const cases = [
    { concern: "water", answers: [{ questionId: "H-RESPONSE", optionId: "automatic" }] },
    { concern: "fire-electrical", answers: [{ questionId: "H-ALERTING", optionId: "household" }] },
    { concern: "security", answers: [{ questionId: "H-ALERTING", optionId: "professional" }] },
    { concern: "vacant-monitoring", answers: [{ questionId: "H-AWAY", optionId: "often" }] },
  ] as const;
  for (const fixture of cases) {
    const result = buildScanResult("home", fixture.concern, [...fixture.answers]);
    assert.equal(result.primaryConcernId, fixture.concern);
    assert.ok(result.recommendations.every((item) => item.rationaleFactors.every(Boolean)));
    assert.ok(result.recommendations.every((item) => item.device.concerns.includes(fixture.concern)));
  }
});

test("matching is deterministic and preserves unknowns", () => {
  const answers: ScanAnswer[] = [
    { questionId: "H-AWAY", optionId: "often" },
    { questionId: "H-RESPONSE", optionId: "unknown" },
    { questionId: "U-INSTALL", optionId: "professional" },
    { questionId: "U-SUBSCRIPTION", optionId: "skipped" },
    { questionId: "H-CONNECTIVITY", optionId: "reliable" },
  ];
  const first = buildScanResult("home", "water", answers);
  assert.deepEqual(first, buildScanResult("home", "water", answers));
  assert.ok(first.unknowns.length >= 2);
  assert.ok(first.recommendations.length <= 5);
  assert.equal("score" in first, false);
});

test("pre-1996 vehicle input does not manufacture OBD compatibility", () => {
  const result = buildScanResult("vehicle", "theft", [
    { questionId: "V-MODEL-YEAR", optionId: "pre-1996" },
    { questionId: "V-POWER", optionId: "unknown" },
    { questionId: "V-PARKING", optionId: "street" },
    { questionId: "V-CONSENT", optionId: "yes-review" },
    { questionId: "U-SUBSCRIPTION", optionId: "open" },
  ]);
  assert.ok(result.recommendations.every((item) => !/OBD/i.test(`${item.device.solution} ${item.device.installation}`)));
  assert.ok(result.exclusions.some((item) => item.includes("pre-1996")));
});

test("vehicle branches avoid identifiers and preserve consent and compatibility checks", () => {
  for (const concern of ["dashcam", "theft", "teen-driver", "diagnostics"] as const) {
    const questions = questionsFor("vehicle", concern);
    const prompts = questions.map((question) => question.prompt).join(" ");
    assert.doesNotMatch(prompts, /VIN|plate|exact location|driver name/i);
    assert.ok(questions.length >= 3 && questions.length <= 5);
  }
  assert.ok(questionsFor("vehicle", "theft").some((question) => question.id === "V-CONSENT"));
  assert.ok(questionsFor("vehicle", "diagnostics").some((question) => question.id === "V-MODEL-YEAR"));
});

test("malformed question sets return actionable errors", () => {
  const malformed = structuredClone(scanQuestionSet);
  malformed.questions[1].id = malformed.questions[0].id;
  malformed.questions[0].effectAreas = [];
  const errors = validateQuestionSet(malformed);
  assert.ok(errors.some((error) => error.includes("duplicate question id")));
  assert.ok(errors.some((error) => error.includes("decision effect")));
});

test("insufficient input yields an honest stable result without forced certainty", () => {
  const result = buildScanResult("home", "water", []);
  assert.ok(result.assumptions.some((item) => item.includes("No scan answers")));
  assert.equal(result.unknowns.length, questionsFor("home", "water").length);
  assert.ok(result.recommendations.length <= 5);
  assert.ok(result.recommendations.every((item) => ["start-here", "worth-considering", "keep-in-view"].includes(item.priorityBand)));
});

test("Device Universe result contract preserves concern to device provenance", () => {
  const result = buildScanResult("vehicle", "theft", [
    { questionId: "V-PARKING", optionId: "street" },
    { questionId: "V-POWER", optionId: "obd" },
    { questionId: "V-MODEL-YEAR", optionId: "2015-plus" },
    { questionId: "V-CONSENT", optionId: "yes-consent" },
    { questionId: "U-SUBSCRIPTION", optionId: "open" },
  ]);
  for (const item of result.recommendations) {
    assert.equal(item.protectionArea, "Theft tracking");
    assert.equal(item.solutionClass, item.device.solution);
    assert.ok(item.rationaleFactors.length > 0);
    assert.ok(item.compatibilityNotes.length > 0);
  }
});
