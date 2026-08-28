export const waterInstallationChecklist = [
  { id: "compatibility", label: "Confirm main-line size, material, location, orientation, power, Wi-Fi, and fire-suppression boundaries.", actor: "consumer-and-installer" },
  { id: "installer", label: "Choose a qualified plumbing professional when appropriate and confirm local permit or inspection needs.", actor: "consumer-and-installer" },
  { id: "preinstall", label: "Optionally retain non-sensitive pre-install photos on your own device; SmartDevices upload is disabled.", actor: "consumer" },
  { id: "receipt-model", label: "Retain the receipt, exact model/size, serial information, installer invoice, and activation date outside the public plan URL.", actor: "consumer" },
  { id: "function-check", label: "Complete the manufacturer-directed activation and post-install function check with the installer.", actor: "installer" },
  { id: "account", label: "Review app account ownership, alerts, household access, privacy, outage behavior, and recovery settings.", actor: "consumer" },
  { id: "service", label: "Confirm any monitoring, subscription, warranty registration, test, and maintenance obligations.", actor: "consumer" },
  { id: "carrier-docs", label: "Ask the carrier or agent what documentation, if any, is accepted for this policy and property.", actor: "carrier-confirmation" },
] as const;

export type WaterChecklistId = (typeof waterInstallationChecklist)[number]["id"];
export type WaterChecklistState = { completedSelfReported: WaterChecklistId[]; delivery: "not-requested" | "adapter-disabled" };
export const initialWaterChecklistState: WaterChecklistState = { completedSelfReported: [], delivery: "not-requested" };

export function toggleWaterChecklist(state: WaterChecklistState, id: WaterChecklistId): WaterChecklistState {
  return { ...state, completedSelfReported: state.completedSelfReported.includes(id) ? state.completedSelfReported.filter((item) => item !== id) : [...state.completedSelfReported, id] };
}
