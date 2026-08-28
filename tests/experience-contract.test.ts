import assert from "node:assert/strict";
import test from "node:test";
import {
  DisabledExperienceEventAdapter,
  EXPERIENCE_EVENTS,
  initialJourney,
  journeyReducer,
  MemoryExperienceEventAdapter,
} from "../app/lib/experience";

test("journey transitions are explicit and reversible", () => {
  let state = initialJourney();
  state = journeyReducer(state, { type: "SELECT_DOMAIN", domainId: "home" });
  assert.equal(state.stage, "domain-selected");
  state = journeyReducer(state, { type: "SELECT_CONCERN", concernId: "water" });
  assert.equal(state.stage, "concern-explored");
  state = journeyReducer(state, { type: "START_SCAN" });
  assert.equal(state.stage, "scan-in-progress");
  state = journeyReducer(state, { type: "SHOW_RESULTS" });
  assert.equal(state.stage, "results-ready");
  state = journeyReducer(state, { type: "BACK" });
  assert.equal(state.stage, "scan-in-progress");
  state = journeyReducer(state, { type: "RESTART" });
  assert.deepEqual({ stage: state.stage, domainId: state.domainId, concernId: state.concernId }, { stage: "entry", domainId: undefined, concernId: undefined });
});

test("invalid journey transitions do not manufacture state", () => {
  const state = initialJourney();
  assert.equal(journeyReducer(state, { type: "SHOW_RESULTS" }), state);
  assert.equal(journeyReducer(state, { type: "START_SCAN" }), state);
});

test("rapid concern switching increments revision and returns to exploration", () => {
  let state = initialJourney("vehicle", "dashcam");
  state = journeyReducer(state, { type: "START_SCAN" });
  const revision = state.revision;
  state = journeyReducer(state, { type: "SELECT_CONCERN", concernId: "theft" });
  assert.equal(state.stage, "concern-explored");
  assert.equal(state.concernId, "theft");
  assert.ok(state.revision > revision);
});

test("history restoration creates direct-route states without stale context", () => {
  const restored = journeyReducer(initialJourney(), { type: "RESTORE", domainId: "vehicle", concernId: "theft" });
  assert.equal(restored.stage, "concern-explored");
  assert.equal(restored.domainId, "vehicle");
  assert.equal(restored.concernId, "theft");
  const empty = journeyReducer(restored, { type: "RESTORE" });
  assert.equal(empty.stage, "entry");
  assert.equal(empty.concernId, undefined);
});

test("event adapters are literal and PII-free by contract", async () => {
  assert.ok(EXPERIENCE_EVENTS.includes("client_intent_selected"));
  assert.ok(EXPERIENCE_EVENTS.includes("carrier_directory_opened"));
  assert.ok(!EXPERIENCE_EVENTS.some((name) => name.includes("purchase_intent_inferred")));
  const disabled = new DisabledExperienceEventAdapter();
  assert.deepEqual(await disabled.record({ name: "results_viewed", occurredAt: new Date(0).toISOString() }), { status: "disabled" });
  const memory = new MemoryExperienceEventAdapter();
  await memory.record({ name: "scan_answered", occurredAt: new Date(0).toISOString(), questionId: "U-INSTALL", optionId: "self" });
  assert.equal(memory.events.length, 1);
});
