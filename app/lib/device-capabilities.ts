import capabilityJson from "@/content/device-capabilities.json";
import type { BuildCapability, BuilderAnswers } from "./builder-contract";
import type { Device } from "./data";

export type DeviceCapabilityKind = "sensing" | "informational" | "communicative" | "computational" | "physical-action";
export type DeviceCapabilityRisk = "low" | "moderate" | "consequential";

export type DeviceCapabilityDefinition = {
  id: string;
  label: string;
  kind: DeviceCapabilityKind;
  risk: DeviceCapabilityRisk;
  description: string;
  aliases: string[];
};

export type DeviceCapabilityRequirement = {
  id: string;
  required: boolean;
  rationale: string;
};

export const deviceCapabilities = capabilityJson as DeviceCapabilityDefinition[];
const capabilityById = new Map(deviceCapabilities.map((item) => [item.id, item]));
const capabilityByAlias = new Map<string, DeviceCapabilityDefinition[]>();
for (const capability of deviceCapabilities) {
  for (const raw of [capability.label, ...capability.aliases]) {
    const alias = raw.toLowerCase();
    const current = capabilityByAlias.get(alias) ?? [];
    capabilityByAlias.set(alias, [...current, capability]);
  }
}

export function getDeviceCapability(id: string): DeviceCapabilityDefinition | undefined {
  return capabilityById.get(id);
}

export function canonicalizeCapabilityLabels(label: string): DeviceCapabilityDefinition[] {
  return capabilityByAlias.get(label.trim().toLowerCase()) ?? [];
}

export function canonicalizeCapabilityLabel(label: string): DeviceCapabilityDefinition | null {
  return canonicalizeCapabilityLabels(label)[0] ?? null;
}

export function canonicalCapabilitiesForDevice(device: Device) {
  const seen = new Set<string>();
  return device.capabilities.flatMap((sourceLabel) => canonicalizeCapabilityLabels(sourceLabel).flatMap((canonical) => {
    if (seen.has(canonical.id)) return [];
    seen.add(canonical.id);
    return [{ ...canonical, sourceLabel }];
  }));
}

const primaryCapabilityMap: Record<BuildCapability, string | null> = {
  temperature: "measure.temperature",
  humidity: "measure.humidity",
  "water-presence": "detect.water_leak",
  "open-close": "detect.open_close",
  motion: "detect.motion",
  light: "measure.illuminance",
  "soil-moisture": "measure.soil_moisture",
  "general-sensing": null,
};

export function inferCapabilityRequirements(idea: string, capability: BuildCapability, answers: BuilderAnswers): DeviceCapabilityRequirement[] {
  const value = idea.toLowerCase();
  const result: DeviceCapabilityRequirement[] = [];
  const primary = primaryCapabilityMap[capability];
  if (primary) result.push({ id: primary, required: true, rationale: `This is the primary normalized capability for the ${capability.replaceAll("-", " ")} requirement.` });
  if (/(shut\s*off|close.*valve|stop.*water)/i.test(value) && /(water|leak|pipe|plumb)/i.test(value)) {
    result.push({ id: "shutoff.water", required: true, rationale: "The requested outcome includes physically stopping water, which is separate from detecting a leak." });
  }
  if (answers.connectivity !== "local-only" && /(alert|notify|remote|phone|dashboard|cloud)/i.test(value)) {
    result.push({ id: "notify.remote", required: true, rationale: "The requested outcome includes a remote notification or alert transport." });
  }
  return result;
}

export function deviceSupportsCapabilityIds(device: Device, requiredIds: string[]): boolean {
  if (!requiredIds.length) return false;
  const supported = new Set(canonicalCapabilitiesForDevice(device).map((item) => item.id));
  return requiredIds.every((id) => supported.has(id));
}
