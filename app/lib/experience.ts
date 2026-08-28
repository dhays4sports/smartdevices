import type { DomainId } from "./data";

export const JOURNEY_STAGES = [
  "entry",
  "domain-selected",
  "concern-explored",
  "scan-in-progress",
  "results-ready",
  "plan-generated",
] as const;

export type JourneyStage = (typeof JOURNEY_STAGES)[number];

export type JourneyState = {
  stage: JourneyStage;
  domainId?: DomainId;
  concernId?: string;
  revision: number;
};

export type JourneyEvent =
  | { type: "RESTORE"; domainId?: DomainId; concernId?: string }
  | { type: "SELECT_DOMAIN"; domainId: DomainId }
  | { type: "SELECT_CONCERN"; concernId: string }
  | { type: "START_SCAN" }
  | { type: "SHOW_RESULTS" }
  | { type: "GENERATE_PLAN" }
  | { type: "BACK" }
  | { type: "RESTART" };

const permitted: Record<JourneyStage, JourneyStage[]> = {
  entry: ["domain-selected"],
  "domain-selected": ["entry", "concern-explored"],
  "concern-explored": ["domain-selected", "scan-in-progress"],
  "scan-in-progress": ["concern-explored", "results-ready"],
  "results-ready": ["scan-in-progress", "concern-explored", "plan-generated"],
  "plan-generated": ["results-ready", "entry"],
};

export function canMoveJourney(from: JourneyStage, to: JourneyStage): boolean {
  return permitted[from].includes(to);
}

export function initialJourney(domainId?: DomainId, concernId?: string): JourneyState {
  if (domainId && concernId) return { stage: "concern-explored", domainId, concernId, revision: 0 };
  if (domainId) return { stage: "domain-selected", domainId, revision: 0 };
  return { stage: "entry", revision: 0 };
}

function next(state: JourneyState, stage: JourneyStage, patch: Partial<JourneyState> = {}): JourneyState {
  if (!canMoveJourney(state.stage, stage)) return state;
  return { ...state, ...patch, stage, revision: state.revision + 1 };
}

export function journeyReducer(state: JourneyState, event: JourneyEvent): JourneyState {
  switch (event.type) {
    case "RESTORE":
      return { ...initialJourney(event.domainId, event.concernId), revision: state.revision + 1 };
    case "SELECT_DOMAIN":
      return {
        stage: "domain-selected",
        domainId: event.domainId,
        concernId: undefined,
        revision: state.revision + 1,
      };
    case "SELECT_CONCERN":
      if (!state.domainId) return state;
      if (state.stage === "domain-selected") return next(state, "concern-explored", { concernId: event.concernId });
      if (["concern-explored", "scan-in-progress", "results-ready"].includes(state.stage)) {
        return { ...state, stage: "concern-explored", concernId: event.concernId, revision: state.revision + 1 };
      }
      return state;
    case "START_SCAN":
      return state.domainId && state.concernId ? next(state, "scan-in-progress") : state;
    case "SHOW_RESULTS":
      return next(state, "results-ready");
    case "GENERATE_PLAN":
      return next(state, "plan-generated");
    case "BACK":
      if (state.stage === "domain-selected") return next(state, "entry", { domainId: undefined, concernId: undefined });
      if (state.stage === "concern-explored") return next(state, "domain-selected", { concernId: undefined });
      if (state.stage === "scan-in-progress") return next(state, "concern-explored");
      if (state.stage === "results-ready") return next(state, "scan-in-progress");
      if (state.stage === "plan-generated") return next(state, "results-ready");
      return state;
    case "RESTART":
      return { stage: "entry", revision: state.revision + 1 };
  }
}

export const EXPERIENCE_EVENTS = [
  "protection_entry_viewed",
  "domain_selected",
  "concern_selected",
  "demonstration_started",
  "demonstration_paused",
  "demonstration_completed",
  "scan_started",
  "scan_answered",
  "scan_completed",
  "results_viewed",
  "recommendation_explained",
  "recommendation_added",
  "plan_generated",
  "plan_saved",
  "plan_share_requested",
  "client_intent_selected",
  "followup_requested",
  "carrier_directory_opened",
] as const;

export type ExperienceEventName = (typeof EXPERIENCE_EVENTS)[number];
export type ExperienceEvent = {
  name: ExperienceEventName;
  occurredAt: string;
  domainId?: DomainId;
  concernId?: string;
  questionId?: string;
  optionId?: string;
  deviceId?: string;
};

export interface ExperienceEventAdapter {
  record(event: ExperienceEvent): Promise<{ status: "recorded" | "disabled" }>;
}

export class DisabledExperienceEventAdapter implements ExperienceEventAdapter {
  async record(event: ExperienceEvent): Promise<{ status: "disabled" }> {
    void event;
    return { status: "disabled" };
  }
}

export class MemoryExperienceEventAdapter implements ExperienceEventAdapter {
  readonly events: ExperienceEvent[] = [];

  async record(event: ExperienceEvent): Promise<{ status: "recorded" }> {
    this.events.push(structuredClone(event));
    return { status: "recorded" };
  }
}
