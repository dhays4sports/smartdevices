export type DemonstrationId = "water" | "smoke-heat" | "vehicle-tracking";
export type DemonstrationStatus = "idle" | "playing" | "paused" | "complete" | "skipped";
export type DemonstrationState = { status: DemonstrationStatus; stageIndex: number; revision: number };
export type DemonstrationAction = { type: "PLAY" } | { type: "PAUSE" } | { type: "ADVANCE"; stageCount: number } | { type: "REPLAY" } | { type: "SKIP" };
export type DemonstrationConfig = {
  id: DemonstrationId;
  title: string;
  summary: string;
  stages: { label: string; narration: string }[];
  disclaimer: string;
};

export const demonstrations: Record<DemonstrationId, DemonstrationConfig> = {
  water: {
    id: "water",
    title: "Water leak and shutoff",
    summary: "See how a supported whole-home system may move from unusual flow to a configured response.",
    stages: [
      { label: "Cause", narration: "Unusual water flow begins on the monitored plumbing line." },
      { label: "Detection", narration: "The system identifies a pattern that meets its configured alert criteria." },
      { label: "Response", narration: "An alert is sent and a supported shutoff may close the main valve." },
      { label: "Next step", narration: "A person still needs to investigate the source and confirm the property is safe." },
    ],
    disclaimer: "Illustrative sequence. Detection and automatic shutoff depend on model, installation, configuration, power, network, and plumbing conditions.",
  },
  "smoke-heat": {
    id: "smoke-heat",
    title: "Smoke or heat awareness",
    summary: "See how a supported alarm can make a warning condition visible to people nearby and, where supported, remotely.",
    stages: [
      { label: "Cause", narration: "A warning condition develops in the monitored area." },
      { label: "Detection", narration: "A correctly located compatible alarm recognizes a supported condition." },
      { label: "Response", narration: "The alarm sounds and a connected notification may be sent." },
      { label: "Next step", narration: "People follow the alarm and emergency plan; connected features do not replace required life-safety coverage." },
    ],
    disclaimer: "Illustrative sequence. Follow manufacturer instructions, applicable code, and emergency guidance. Connected alerts may fail when power or connectivity is unavailable.",
  },
  "vehicle-tracking": {
    id: "vehicle-tracking",
    title: "Vehicle theft tracking",
    summary: "See how an installed and activated cellular tracker may surface unexpected movement and location context.",
    stages: [
      { label: "Cause", narration: "Unexpected vehicle movement begins." },
      { label: "Detection", narration: "A powered tracker sends a supported movement alert over available service." },
      { label: "Response", narration: "Location context may be reviewed and shared with appropriate authorities." },
      { label: "Next step", narration: "The owner follows safety and law-enforcement guidance rather than attempting recovery alone." },
    ],
    disclaimer: "Illustrative sequence. Coverage, concealment, power, tampering, subscription, and service conditions affect tracking. Recovery is never guaranteed.",
  },
};

export function demonstrationFor(domainId: string, concernId: string): DemonstrationConfig | null {
  if (domainId === "home" && concernId === "water") return demonstrations.water;
  if (domainId === "home" && concernId === "fire-electrical") return demonstrations["smoke-heat"];
  if (domainId === "vehicle" && concernId === "theft") return demonstrations["vehicle-tracking"];
  return null;
}

export const initialDemonstrationState: DemonstrationState = { status: "idle", stageIndex: 0, revision: 0 };

export function demonstrationReducer(state: DemonstrationState, action: DemonstrationAction): DemonstrationState {
  switch (action.type) {
    case "PLAY":
      return state.status === "complete" || state.status === "skipped" ? state : { ...state, status: "playing", revision: state.revision + 1 };
    case "PAUSE":
      return state.status === "playing" ? { ...state, status: "paused", revision: state.revision + 1 } : state;
    case "ADVANCE":
      if (state.status !== "playing") return state;
      if (state.stageIndex >= action.stageCount - 1) return { ...state, status: "complete", revision: state.revision + 1 };
      return { ...state, stageIndex: state.stageIndex + 1, revision: state.revision + 1 };
    case "REPLAY":
      return { status: "playing", stageIndex: 0, revision: state.revision + 1 };
    case "SKIP":
      return { status: "skipped", stageIndex: state.stageIndex, revision: state.revision + 1 };
  }
}
