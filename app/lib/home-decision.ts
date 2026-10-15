import { getDomain, type Device } from "./data";
import type { EvidenceSource } from "./carrier";
import { evidenceIsCurrent } from "./carrier";

export type HomeEntry = "help" | "known";
export type WaterGoal = "all" | "alerts" | "monitoring" | "shutoff";
export const waterGoals: { id: WaterGoal; label: string; description: string }[] = [
  { id: "all", label: "Help me understand", description: "Compare the different types of water protection." },
  { id: "alerts", label: "Alerts near a leak", description: "Point sensors detect water where they are placed. They do not shut off the main supply." },
  { id: "monitoring", label: "Whole-home monitoring", description: "Watch the main water supply. Monitoring and automatic shutoff are different capabilities." },
  { id: "shutoff", label: "Automatic water shutoff", description: "Look for main-line monitoring and a compatible automatic valve. Installation and operation need confirmation." },
];

export function sanitizeHomeContext(search: URLSearchParams) {
  const requested = search.get("concern");
  return {
    concern: getDomain("home")?.concerns.some((item) => item.id === requested) ? requested! : "water",
    entry: (search.get("entry") === "known" ? "known" : "help") as HomeEntry,
    goal: (waterGoals.some((item) => item.id === search.get("goal")) ? search.get("goal") : "all") as WaterGoal,
  };
}

export function waterDeviceMatches(device: Device, goal: WaterGoal) {
  if (!device.concerns.includes("water")) return false;
  const shutoff = device.capabilities.includes("Automatic shutoff");
  if (goal === "shutoff") return shutoff;
  if (goal === "alerts") return device.capabilities.includes("Water detection") && !shutoff;
  if (goal === "monitoring") return shutoff || device.capabilities.includes("Flow monitoring");
  return true;
}

// The snapshot remains authoritative. A stale dependent source cannot be hidden
// by an otherwise active catalog record. No checked date is renewed here.
export function homeDecisionCatalog(catalog: Device[], sources: EvidenceSource[], today: string): Device[] {
  return catalog.map((device) => {
    const linked = sources.filter((source) => source.url && device.sources.some((item) => item.url === source.url));
    const age = Date.parse(today) - Date.parse(device.lastReviewed);
    const stale = !Number.isFinite(age) || age < 0 || age > 90 * 86400000 || linked.some((source) => source.visibility !== "public" || !evidenceIsCurrent(source, today));
    return stale && device.status === "active" ? { ...device, status: "stale", editorialStatus: "review-required" } : device;
  });
}

export function homeOptions(catalog: Device[], concern: string, goal: WaterGoal, limit = 3) {
  return catalog.filter((device) => device.domains.includes("home") && device.concerns.includes(concern) && device.status === "active" && device.editorialStatus === "verified" && (concern !== "water" || waterDeviceMatches(device, goal))).slice(0, limit);
}

export const homeProgressStates = [
  ["researching", "Still researching"],
  ["selected", "Option selected"],
  ["purchased-self-reported", "Purchased — self-reported"],
  ["installation-scheduled", "Installation scheduled — self-reported"],
  ["installed-self-reported", "Installed — self-reported"],
] as const;
export type HomeProgressState = typeof homeProgressStates[number][0];
export type HomeProgress = { schemaVersion: 1; deviceId: string; state: HomeProgressState; help: "none" | "choose" | "installation" | "agent"; updatedAt: string };
export function parseHomeProgress(raw: string | null, allowedIds: string[]): HomeProgress | null {
  if (!raw || raw.length > 2048) return null;
  try {
    const value = JSON.parse(raw) as HomeProgress;
    return value.schemaVersion === 1 && allowedIds.includes(value.deviceId) && homeProgressStates.some(([id]) => id === value.state) && ["none", "choose", "installation", "agent"].includes(value.help) && typeof value.updatedAt === "string" && Number.isFinite(Date.parse(value.updatedAt))
      ? { schemaVersion: 1, deviceId: value.deviceId, state: value.state, help: value.help, updatedAt: value.updatedAt } : null;
  } catch { return null; }
}
