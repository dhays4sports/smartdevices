import test from "node:test";
import assert from "node:assert/strict";
import { DisabledCarrierJourneyEventAdapter, carrierJourneyReducer, initialCarrierJourney } from "../app/lib/carrier-journey";

test("three intents remain explicit and rapid switching leaves one state", () => {
  let state = initialCarrierJourney();
  state = carrierJourneyReducer(state, { type: "SELECT_INTENT", intent: "requirement" });
  state = carrierJourneyReducer(state, { type: "SELECT_INTENT", intent: "discounts" });
  state = carrierJourneyReducer(state, { type: "SELECT_INTENT", intent: "recommendations" });
  assert.equal(state.intent, "recommendations");
  assert.equal(state.stage, "category");
  assert.deepEqual(state.answers, {});
});

test("viewing the selector records nothing and explicit selection uses a literal event", async () => {
  const adapter = new DisabledCarrierJourneyEventAdapter();
  const state = initialCarrierJourney();
  assert.equal(state.intent, undefined);
  assert.deepEqual(await adapter.record({ name: "carrier_intent_selected", occurredAt: new Date(0).toISOString(), intent: "requirement" }), { status: "disabled" });
});

test("back, restart, and direct restoration clear stale context", () => {
  let state = initialCarrierJourney("discounts", "water");
  state = carrierJourneyReducer(state, { type: "START_SCAN" });
  state = carrierJourneyReducer(state, { type: "BACK" });
  assert.equal(state.stage, "category");
  state = carrierJourneyReducer(state, { type: "RESTART" });
  assert.equal(state.intent, undefined);
  state = carrierJourneyReducer(state, { type: "RESTORE", intent: "requirement", category: "gas" });
  assert.deepEqual({ intent: state.intent, category: state.category }, { intent: "requirement", category: "gas" });
});
