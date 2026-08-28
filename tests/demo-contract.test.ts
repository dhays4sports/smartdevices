import assert from "node:assert/strict";
import test from "node:test";
import { demonstrationFor, demonstrationReducer, demonstrations, initialDemonstrationState } from "../app/lib/demo";

test("demonstration reducer supports play, pause, replay, skip, and completion", () => {
  let state = demonstrationReducer(initialDemonstrationState, { type: "PLAY" });
  assert.equal(state.status, "playing");
  state = demonstrationReducer(state, { type: "PAUSE" });
  assert.equal(state.status, "paused");
  state = demonstrationReducer(state, { type: "REPLAY" });
  for (let index = 0; index < demonstrations.water.stages.length; index += 1) state = demonstrationReducer(state, { type: "ADVANCE", stageCount: demonstrations.water.stages.length });
  assert.equal(state.status, "complete");
  state = demonstrationReducer(state, { type: "REPLAY" });
  state = demonstrationReducer(state, { type: "SKIP" });
  assert.equal(state.status, "skipped");
});

test("only the three authorized launch concerns receive demonstrations", () => {
  assert.equal(demonstrationFor("home", "water")?.id, "water");
  assert.equal(demonstrationFor("home", "fire-electrical")?.id, "smoke-heat");
  assert.equal(demonstrationFor("vehicle", "theft")?.id, "vehicle-tracking");
  assert.equal(demonstrationFor("home", "security"), null);
  assert.equal(Object.keys(demonstrations).length, 3);
});

test("every stage has equivalent narration and a limitation", () => {
  for (const demo of Object.values(demonstrations)) {
    assert.ok(demo.stages.length >= 3);
    assert.ok(demo.stages.every((stage) => stage.label && stage.narration));
    assert.ok(demo.disclaimer.length > 40);
  }
});

test("smoke and heat demo preserves life-safety boundaries", () => {
  const demo = demonstrations["smoke-heat"];
  assert.match(demo.stages.map((stage) => stage.narration).join(" "), /alarm|emergency plan/i);
  assert.match(demo.disclaimer, /manufacturer instructions|applicable code/i);
  assert.doesNotMatch(`${demo.summary} ${demo.disclaimer}`, /guarantee|prevents every/i);
});

test("vehicle tracking demo never promises recovery or unsafe action", () => {
  const demo = demonstrations["vehicle-tracking"];
  const text = `${demo.summary} ${demo.stages.map((stage) => stage.narration).join(" ")} ${demo.disclaimer}`;
  assert.match(text, /appropriate authorities|law-enforcement/i);
  assert.match(text, /never guaranteed/i);
  assert.doesNotMatch(text, /will recover|guaranteed recovery/i);
});

test("background-tab pause remains a safe idempotent transition", () => {
  const playing = demonstrationReducer(initialDemonstrationState, { type: "PLAY" });
  const paused = demonstrationReducer(playing, { type: "PAUSE" });
  assert.equal(paused.status, "paused");
  assert.equal(demonstrationReducer(paused, { type: "PAUSE" }), paused);
  assert.equal(paused.stageIndex, playing.stageIndex);
});
