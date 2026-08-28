import type { CarrierIntent } from "./carrier-contract";
import type { CarrierCategory } from "./carrier";

export type CarrierJourneyStage = "intent" | "category" | "scan" | "results";
export type CarrierJourneyState = { stage: CarrierJourneyStage; intent?: CarrierIntent; category?: CarrierCategory; answers: Record<string, string>; revision: number };
export type CarrierJourneyAction =
  | { type: "RESTORE"; intent?: CarrierIntent; category?: CarrierCategory }
  | { type: "SELECT_INTENT"; intent: CarrierIntent }
  | { type: "SELECT_CATEGORY"; category: CarrierCategory }
  | { type: "START_SCAN" }
  | { type: "SHOW_RESULTS" }
  | { type: "BACK" }
  | { type: "RESTART" };

export function initialCarrierJourney(intent?: CarrierIntent, category?: CarrierCategory): CarrierJourneyState {
  return { stage: intent ? "category" : "intent", intent, category, answers: {}, revision: 0 };
}

export function carrierJourneyReducer(state: CarrierJourneyState, action: CarrierJourneyAction): CarrierJourneyState {
  switch (action.type) {
    case "RESTORE": return { ...initialCarrierJourney(action.intent, action.category), revision: state.revision + 1 };
    case "SELECT_INTENT": return { stage: "category", intent: action.intent, answers: {}, revision: state.revision + 1 };
    case "SELECT_CATEGORY": return state.intent ? { ...state, stage: "category", category: action.category, answers: {}, revision: state.revision + 1 } : state;
    case "START_SCAN": return state.intent && state.category ? { ...state, stage: "scan", answers: {}, revision: state.revision + 1 } : state;
    case "SHOW_RESULTS": return state.stage === "scan" ? { ...state, stage: "results", revision: state.revision + 1 } : state;
    case "BACK":
      if (state.stage === "results") return { ...state, stage: "scan", revision: state.revision + 1 };
      if (state.stage === "scan") return { ...state, stage: "category", answers: {}, revision: state.revision + 1 };
      if (state.stage === "category") return { stage: "intent", answers: {}, revision: state.revision + 1 };
      return state;
    case "RESTART": return { stage: "intent", answers: {}, revision: state.revision + 1 };
  }
}

export type CarrierJourneyEvent = { name: "carrier_intent_selected" | "carrier_category_selected" | "carrier_scan_started" | "carrier_results_viewed"; occurredAt: string; intent?: CarrierIntent; category?: CarrierCategory };
export interface CarrierJourneyEventAdapter { record(event: CarrierJourneyEvent): Promise<{ status: "recorded" | "disabled" }> }
export class DisabledCarrierJourneyEventAdapter implements CarrierJourneyEventAdapter {
  async record(event: CarrierJourneyEvent): Promise<{ status: "disabled" }> { void event; return { status: "disabled" }; }
}
