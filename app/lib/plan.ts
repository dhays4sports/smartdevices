import { getDeviceById, type Device, type DomainId } from "./data";
import type { ScanResult } from "./scan";
import { carrierRegistry, carrierRules, deviceCarrierFits, deviceClasses, evidenceSources, evaluateCarrierGuidance, type CarrierContext, type ProCarrierData } from "./carrier";
import type { CarrierAssertionSource, CarrierIntent } from "./carrier-contract";

export type RecommendationOrigin = "consumer-explorer" | "agent" | "coveragefit" | "template";
export type Priority = "essential-consideration" | "strong-fit" | "optional" | "informational";

export type PlanRecommendation = {
  id: string;
  deviceId: string;
  origin: RecommendationOrigin;
  priority: Priority;
  rationale: string;
  clientIntent?: string;
  fulfillment?: "no-action" | "researching" | "selected" | "purchased" | "installation-scheduled" | "installed-self-reported" | "evidence-received" | "verified";
};

type SafetyPlanBase = {
  id: string;
  status: "draft" | "generated" | "shared" | "viewed" | "client-responded" | "archived" | "expired" | "revoked";
  domain: DomainId;
  concernId: string;
  createdAt: string;
  recommendations: PlanRecommendation[];
  homeContext?: { goal: "all" | "alerts" | "monitoring" | "shutoff"; permission: "yes" | "no" | "unknown"; connection: "yes" | "no" | "unknown" };
  agent?: {
    displayName: string;
    agencyName?: string;
    phone?: string;
    email?: string;
    note?: string;
    assertionStatus?: "professional-supplied";
  };
};

export type SafetyPlanV1 = SafetyPlanBase & {
  schemaVersion: 1;
};

export type SafetyPlanV2 = SafetyPlanBase & {
  schemaVersion: 2;
  provenance: {
    scanSchemaVersion: number;
    questionSetVersion: number;
    selectedConcernIds: string[];
    assumptions: string[];
    unknowns: string[];
    exclusions: string[];
    rationaleByDeviceId: Record<string, string[]>;
  };
};

export type SafetyPlanV3 = SafetyPlanBase & {
  schemaVersion: 3;
  carrierProvenance: {
    carrierId: string;
    jurisdiction: string;
    entryIntent: CarrierIntent;
    requestedCapabilityIds: string[];
    assertionSource?: Exclude<CarrierAssertionSource, "carrier-public-source" | "manufacturer-technical-source" | "smartdevices-editorial">;
    assertionStatus: "consumer-unverified" | "professional-unverified" | "none";
    assertion?: { actor: "professional"; assertedAt: string; source: "smartdevices-pro"; statementStatus: "professional-supplied-unverified" };
    ruleIds: string[];
    sourceVersions: { sourceId: string; version: number; checkedDate: string }[];
    deviceFitIds: string[];
    unknowns: string[];
  };
};

export type SafetyPlan = SafetyPlanV1 | SafetyPlanV2 | SafetyPlanV3;

export function createLocalPlan(
  domain: DomainId,
  concernId: string,
  deviceIds: string[],
  origin: RecommendationOrigin = "consumer-explorer",
  scanResult?: ScanResult,
): SafetyPlan {
  const cleanIds = [...new Set(deviceIds)].filter((id) => Boolean(getDeviceById(id))).slice(0, 5);
  const id = globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}`;
  const base: SafetyPlanBase = {
    id,
    status: "generated",
    domain,
    concernId,
    createdAt: new Date().toISOString(),
    recommendations: cleanIds.map((deviceId, index) => ({
      id: `${id}-${index + 1}`,
      deviceId,
      origin,
      priority: index === 0 ? "strong-fit" : "optional",
      rationale: scanResult?.recommendations.find((item) => item.device.id === deviceId)?.rationaleFactors.join(" ") ?? "Matched to the protection concern selected for this plan.",
      fulfillment: "no-action",
    })),
  };
  if (!scanResult) return { ...base, schemaVersion: 1 };
  return {
    ...base,
    schemaVersion: 2,
    provenance: {
      scanSchemaVersion: scanResult.schemaVersion,
      questionSetVersion: scanResult.questionSetVersion,
      selectedConcernIds: scanResult.selectedConcernIds,
      assumptions: scanResult.assumptions,
      unknowns: scanResult.unknowns,
      exclusions: scanResult.exclusions,
      rationaleByDeviceId: Object.fromEntries(scanResult.recommendations.map((item) => [item.device.id, item.rationaleFactors])),
    },
  };
}

export function createCarrierPlan(context: CarrierContext, deviceIds: string[], published?: { carrierData: ProCarrierData; devices: Device[]; reviewDate: string }): SafetyPlanV3 {
  const validDevice = (id: string) => published ? published.devices.some((device) => device.id === id) : Boolean(getDeviceById(id));
  const cleanIds = [...new Set(deviceIds)].filter(validDevice).slice(0, 5);
  const id = globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}`;
  const guidance = published ? evaluateCarrierGuidance(context, published.reviewDate, { carriers: published.carrierData.carriers, rules: published.carrierData.rules, fits: published.carrierData.fits }) : evaluateCarrierGuidance(context);
  const ruleIds = [...new Set(guidance.map((item) => item.ruleId).filter((item): item is string => Boolean(item)))];
  const sourceIds = [...new Set(guidance.flatMap((item) => item.sourceIds))];
  return {
    id,
    schemaVersion: 3,
    status: "generated",
    domain: "home",
    concernId: context.category === "water" ? "water" : context.category === "security" ? "security" : "vacant-monitoring",
    createdAt: new Date().toISOString(),
    recommendations: cleanIds.map((deviceId, index) => ({ id: `${id}-${index + 1}`, deviceId, origin: "consumer-explorer", priority: index === 0 ? "strong-fit" : "optional", rationale: "Included from the governed carrier-guidance result; capability fit and carrier treatment remain separate.", fulfillment: "no-action" })),
    carrierProvenance: {
      carrierId: context.carrierId,
      jurisdiction: context.jurisdiction ?? "unknown",
      entryIntent: context.intent,
      requestedCapabilityIds: [...new Set(context.requestedCapabilityIds)].slice(0, 10),
      assertionSource: context.assertionSource,
      assertionStatus: context.assertionSource === "professional-stated" ? "professional-unverified" : context.assertionSource === "consumer-stated" ? "consumer-unverified" : "none",
      assertion: context.assertionSource === "professional-stated" ? { actor: "professional", assertedAt: new Date().toISOString(), source: "smartdevices-pro", statementStatus: "professional-supplied-unverified" } : undefined,
      ruleIds,
      sourceVersions: sourceIds.map((sourceId) => (published?.carrierData.sources ?? evidenceSources.sources).find((source) => source.id === sourceId)).filter((source) => Boolean(source) && source?.visibility === "public").map((source) => ({ sourceId: source!.id, version: source!.version, checkedDate: source!.checkedDate })),
      deviceFitIds: [...new Set(guidance.flatMap((item) => item.deviceFitIds))].slice(0, 10),
      unknowns: [...new Set(context.unknowns)].slice(0, 10),
    },
  };
}

export function encodePlanSelection(plan: SafetyPlan): string {
  const params = new URLSearchParams();
  params.set("v", String(plan.schemaVersion));
  params.set("domain", plan.domain);
  params.set("concern", plan.concernId);
  params.set("items", plan.recommendations.map((item) => item.deviceId).join(","));
  if (plan.schemaVersion === 3) {
    params.set("carrier", plan.carrierProvenance.carrierId);
    params.set("jurisdiction", plan.carrierProvenance.jurisdiction);
    params.set("entry", plan.carrierProvenance.entryIntent);
    params.set("capabilities", plan.carrierProvenance.requestedCapabilityIds.join(","));
    params.set("assertion", plan.carrierProvenance.assertionStatus);
    params.set("rules", plan.carrierProvenance.ruleIds.join(","));
    params.set("sources", plan.carrierProvenance.sourceVersions.map((source) => `${source.sourceId}~${source.version}~${source.checkedDate}`).join(","));
    params.set("fits", plan.carrierProvenance.deviceFitIds.join(","));
  }
  return params.toString();
}

export type DecodedPlanSelection = Pick<SafetyPlan, "domain" | "concernId" | "recommendations"> & { schemaVersion: 1 | 2 | 3; carrierProvenance?: SafetyPlanV3["carrierProvenance"] };

export function decodePlanSelection(search: URLSearchParams, published?: { devices: Device[]; carrierData: ProCarrierData }): DecodedPlanSelection | null {
  const domain = search.get("domain") as DomainId | null;
  const concernId = search.get("concern");
  const items = search.get("items")?.split(",").filter(Boolean) ?? [];
  if (!domain || !concernId || items.length === 0) return null;
  const valid = items.filter((id) => published ? published.devices.some((device) => device.id === id) : Boolean(getDeviceById(id))).slice(0, 5);
  if (valid.length === 0) return null;
  const schemaVersion = search.get("v") === "3" ? 3 : search.get("v") === "2" ? 2 : 1;
  let carrierProvenance: SafetyPlanV3["carrierProvenance"] | undefined;
  if (schemaVersion === 3) {
    const carrierId = search.get("carrier") ?? "";
    const data = published?.carrierData;
    const carrier = (data?.carriers ?? carrierRegistry.carriers).find((item) => item.id === carrierId && item.publicationStatus === "published");
    const jurisdiction = search.get("jurisdiction") ?? "";
    const entryIntent = search.get("entry");
    const assertion = search.get("assertion");
    const capabilityIds = (search.get("capabilities") ?? "").split(",").filter((id) => (data?.classes ?? deviceClasses.classes).some((item) => item.id === id)).slice(0, 10);
    const ruleIds = (search.get("rules") ?? "").split(",").filter((id) => (data?.rules ?? carrierRules.rules).some((item) => item.id === id && item.carrierId === carrierId)).slice(0, 10);
    const sourceVersions = (search.get("sources") ?? "").split(",").map((value) => value.split("~")).filter(([sourceId, version, checkedDate]) => (data?.sources ?? evidenceSources.sources).some((source) => source.id === sourceId && source.version === Number(version) && source.checkedDate === checkedDate && source.visibility === "public")).slice(0, 10).map(([sourceId, version, checkedDate]) => ({ sourceId, version: Number(version), checkedDate }));
    const deviceFitIds = (search.get("fits") ?? "").split(",").filter((id) => (data?.fits ?? deviceCarrierFits.fits).some((fit) => fit.id === id && fit.carrierId === carrierId)).slice(0, 10);
    if (carrier && carrier.supportedJurisdictions.includes(jurisdiction) && (entryIntent === "requirement" || entryIntent === "discounts" || entryIntent === "recommendations") && (assertion === "consumer-unverified" || assertion === "professional-unverified" || assertion === "none")) {
      carrierProvenance = {
        carrierId,
        jurisdiction,
        entryIntent,
        requestedCapabilityIds: capabilityIds,
        assertionSource: assertion === "consumer-unverified" ? "consumer-stated" : assertion === "professional-unverified" ? "professional-stated" : undefined,
        assertionStatus: assertion,
        ruleIds,
        sourceVersions,
        deviceFitIds,
        unknowns: ["Case-specific policy scope and carrier determination still require confirmation."],
      };
    }
  }
  return {
    schemaVersion,
    domain,
    concernId,
    carrierProvenance,
    recommendations: valid.map((deviceId, index) => ({
      id: `shared-${index + 1}`,
      deviceId,
      origin: "consumer-explorer",
      priority: index === 0 ? "strong-fit" : "optional",
      rationale: "Included in the shared Smart Safety Plan.",
      fulfillment: "no-action",
    })),
  };
}
