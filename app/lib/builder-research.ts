import type { BuilderResearch, ExistingDeviceMatch } from "./builder-contract";

export function catalogResearch(matches: ExistingDeviceMatch[]): BuilderResearch {
  const now = new Date().toISOString();
  if (matches.length) return {
    status: "catalog-only",
    decision: "adapt",
    rationale: ["The published SmartDevices catalog contains at least one device addressing part of the need.", "Compare commercial options before spending engineering effort on custom hardware."],
    candidates: matches.map((item) => ({ name: `${item.manufacturer} ${item.model}`, fit: "partial", notes: item.reason, url: `/devices/${item.slug}` })),
    sources: [],
    marketSummary: "Catalog-only research found one or more existing options. Live market research has not yet been run.",
    generatedAt: now,
    provider: "smartdevices-catalog",
  };
  return {
    status: "catalog-only",
    decision: "build",
    rationale: ["No strong match was found in the currently published SmartDevices catalog.", "A custom prototype is reasonable to scope, but wider live-market research should still run before committing to fabrication."],
    candidates: [], sources: [],
    marketSummary: "No strong SmartDevices catalog match was found. This is not a claim that the wider market has no suitable product.",
    generatedAt: now,
    provider: "smartdevices-catalog",
  };
}
