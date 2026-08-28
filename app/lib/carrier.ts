import carriersJson from "@/content/carriers.json";
import programsJson from "@/content/carrier-programs.json";
import evidenceJson from "@/content/evidence-sources.json";
import rulesJson from "@/content/carrier-rules.json";
import classesJson from "@/content/device-classes.json";
import fitsJson from "@/content/device-carrier-fit.json";
import questionsJson from "@/content/carrier-questions.json";
import { getDeviceById } from "./data";
import type { CarrierAssertionSource, CarrierDisplayDesignation, CarrierIntent } from "./carrier-contract";

export type EvidenceStatus = "draft" | "active" | "stale" | "conflicting" | "withdrawn" | "retired";
export type EvidenceVisibility = "public" | "restricted";
export type CarrierCategory = "water" | "gas" | "security" | "connected-home";
export type DeviceFitState = "explicitly-named-public-offer" | "technical-class-match" | "insufficient-evidence" | "not-applicable";

export type CarrierRecord = {
  id: string; slug: string; name: string; publicationStatus: "published" | "draft" | "retired";
  supportedJurisdictions: string[]; canonicalPath: string; disclosure: string;
};
export type EvidenceSource = {
  id: string; version: number; owner: string; domain: string; title: string; url?: string; restrictedReferenceId?: string;
  jurisdictions: string[]; checkedDate: string; reviewDueDate: string; status: EvidenceStatus; visibility: EvidenceVisibility; limitations: string[];
};
export type CarrierProgram = {
  id: string; version: number; carrierId: string; name: string; jurisdiction: string; line: string; policyScope: string;
  status: EvidenceStatus; visibility: EvidenceVisibility; effectiveDate: string | null; expiryDate: string | null;
  checkedDate: string; reviewDueDate: string; sourceIds: string[]; limitations: string[];
};
export type CarrierRule = {
  id: string; version: number; programId: string; carrierId: string; jurisdiction: string; line: string; policyScope: string;
  classification: "public-offer" | "potential-discount-category" | "informational" | "confirmation-needed";
  capabilityClassIds: string[]; sourceIds: string[]; checkedDate: string; reviewDueDate: string; reviewer: string;
  reviewStatus: "unreviewed" | "reviewed"; status: EvidenceStatus; visibility: EvidenceVisibility; limitations: string[];
};
export type DeviceClass = { id: string; label: string; description: string; safetyBoundary: string };
export type DeviceCarrierFit = {
  id: string; carrierId: string; jurisdiction: string; deviceId: string; classIds: string[]; fit: DeviceFitState;
  sourceIds: string[]; status: EvidenceStatus; checkedDate: string; reviewDueDate: string; limitations: string[];
};
export type CarrierQuestion = {
  id: string; prompt: string; why: string; changes: string[]; required: boolean;
  appliesWhen?: { questionId: string; equals: string };
  options: { id: string; label: string }[];
};
export type CarrierContext = {
  carrierId: string; jurisdiction?: string; intent: CarrierIntent; category?: CarrierCategory; policyScope?: string;
  requestedCapabilityIds: string[]; assertionSource?: Exclude<CarrierAssertionSource, "carrier-public-source" | "manufacturer-technical-source" | "smartdevices-editorial">;
  professionalAssertion?: boolean; installationStatus?: string; unknowns: string[];
};
export type GuidanceResult = {
  designation: CarrierDisplayDesignation; label: string; category: CarrierCategory; ruleId?: string; sourceIds: string[];
  classIds: string[]; deviceFitIds: string[]; why: string; limitations: string[]; confirmationSteps: string[]; current: boolean;
};

export const carrierRegistry = carriersJson as { schemaVersion: number; carriers: CarrierRecord[] };
export const carrierPrograms = programsJson as { schemaVersion: number; programs: CarrierProgram[] };
export const evidenceSources = evidenceJson as { schemaVersion: number; sources: EvidenceSource[] };
export const carrierRules = rulesJson as { schemaVersion: number; rules: CarrierRule[] };
export const deviceClasses = classesJson as { schemaVersion: number; classes: DeviceClass[] };
export const deviceCarrierFits = fitsJson as { schemaVersion: number; fits: DeviceCarrierFit[] };
export const carrierQuestions = questionsJson as { schemaVersion: number; questionSetVersion: number; questions: CarrierQuestion[] };

export function evidenceIsCurrent(record: Pick<EvidenceSource | CarrierRule | DeviceCarrierFit, "status" | "reviewDueDate">, now = "2026-08-26"): boolean {
  return record.status === "active" && record.reviewDueDate >= now;
}

export type EvidenceDisplayState = "current" | "stale" | "conflicting" | "withdrawn" | "retired" | "draft";
export function evidenceDisplayState(record: Pick<EvidenceSource | CarrierRule | DeviceCarrierFit, "status" | "reviewDueDate">, now = "2026-08-26"): EvidenceDisplayState {
  if (record.status !== "active") return record.status;
  return record.reviewDueDate < now ? "stale" : "current";
}

export function historicCarrierWarning(ruleId: string, now = "2026-08-26"): string | null {
  const rule = getCarrierRule(ruleId);
  if (!rule) return "The carrier rule used by this plan is unavailable. Confirm current guidance before acting.";
  const state = evidenceDisplayState(rule, now);
  return state === "current" ? null : `This plan references ${state} carrier evidence. Historic context is preserved, but current applicability needs confirmation.`;
}

const permittedEvidenceTransitions: Record<EvidenceStatus, EvidenceStatus[]> = {
  draft: ["active", "retired"],
  active: ["stale", "conflicting", "withdrawn", "retired"],
  stale: ["active", "conflicting", "withdrawn", "retired"],
  conflicting: ["active", "withdrawn", "retired"],
  withdrawn: ["active", "retired"],
  retired: [],
};

export function canTransitionEvidence(from: EvidenceStatus, to: EvidenceStatus): boolean {
  return permittedEvidenceTransitions[from].includes(to);
}

export function validateEvidenceSourceRecord(source: Partial<EvidenceSource>): string[] {
  const errors: string[] = [];
  if (!source.id || !source.owner || !source.domain) errors.push("SOURCE_ID_OWNER_DOMAIN_REQUIRED");
  if (!source.checkedDate || !/^\d{4}-\d{2}-\d{2}$/.test(source.checkedDate)) errors.push("SOURCE_CHECKED_DATE_REQUIRED");
  if (!source.reviewDueDate || !/^\d{4}-\d{2}-\d{2}$/.test(source.reviewDueDate)) errors.push("SOURCE_REVIEW_DUE_DATE_REQUIRED");
  if (!source.jurisdictions?.length) errors.push("SOURCE_JURISDICTION_REQUIRED");
  if (!source.limitations?.length) errors.push("SOURCE_LIMITATIONS_REQUIRED");
  if (source.visibility === "restricted" && !source.restrictedReferenceId) errors.push("RESTRICTED_REFERENCE_REQUIRED");
  if (source.visibility === "public" && !source.url) errors.push("PUBLIC_URL_REQUIRED");
  return errors;
}

export function publicEvidenceSources(now = "2026-08-26"): EvidenceSource[] {
  return evidenceSources.sources.filter((source) => source.visibility === "public" && source.status !== "draft" && source.status !== "withdrawn" && source.status !== "retired" && evidenceIsCurrent(source, now));
}

export type ProCarrierData = { carriers: CarrierRecord[]; programs: CarrierProgram[]; rules: CarrierRule[]; sources: EvidenceSource[]; classes: DeviceClass[]; fits: DeviceCarrierFit[] };
export function publicProCarrierData(now = "2026-08-26"): ProCarrierData {
  const carriers = publishedCarriers();
  const carrierIds = new Set(carriers.map((item) => item.id));
  const sources = publicEvidenceSources(now);
  const sourceIds = new Set(sources.map((item) => item.id));
  const programs = carrierPrograms.programs.filter((item) => carrierIds.has(item.carrierId) && item.visibility === "public" && item.sourceIds.every((id) => sourceIds.has(id)) && evidenceIsCurrent(item, now));
  const programIds = new Set(programs.map((item) => item.id));
  const rules = carrierRules.rules.filter((item) => programIds.has(item.programId) && item.visibility === "public" && item.reviewStatus === "reviewed" && item.sourceIds.every((id) => sourceIds.has(id)) && evidenceIsCurrent(item, now));
  const fits = deviceCarrierFits.fits.filter((item) => carrierIds.has(item.carrierId) && item.sourceIds.every((id) => sourceIds.has(id)) && evidenceIsCurrent(item, now));
  const classIds = new Set([...rules.flatMap((item) => item.capabilityClassIds), ...fits.flatMap((item) => item.classIds)]);
  return { carriers, programs, rules, sources, classes: deviceClasses.classes.filter((item) => classIds.has(item.id)), fits };
}

export function publishedCarriers(records: CarrierRecord[] = carrierRegistry.carriers): CarrierRecord[] {
  return records.filter((carrier) => carrier.publicationStatus === "published");
}

export function getCarrier(idOrSlug: string): CarrierRecord | undefined {
  return publishedCarriers().find((carrier) => carrier.id === idOrSlug || carrier.slug === idOrSlug);
}

export function getCarrierRule(id: string): CarrierRule | undefined {
  return carrierRules.rules.find((rule) => rule.id === id);
}

export function getDeviceFits(deviceId: string, carrierId = "farmers", jurisdiction = "CA", now = "2026-08-26"): DeviceCarrierFit[] {
  return deviceCarrierFits.fits.filter((fit) => fit.deviceId === deviceId && fit.carrierId === carrierId && fit.jurisdiction === jurisdiction && evidenceIsCurrent(fit, now));
}

export function deviceFitForCapability(deviceId: string, classId: string, carrierId = "farmers", jurisdiction = "CA", now = "2026-08-26"): DeviceCarrierFit | undefined {
  return getDeviceFits(deviceId, carrierId, jurisdiction, now).find((fit) => fit.classIds.includes(classId));
}

export function fitCanSupportPositiveTechnicalLabel(fit: DeviceCarrierFit | undefined): boolean {
  return Boolean(fit && evidenceIsCurrent(fit) && (fit.fit === "explicitly-named-public-offer" || fit.fit === "technical-class-match"));
}

export function validateCarrierContent(): string[] {
  const errors: string[] = [];
  const unique = <T>(records: T[], key: (record: T) => string, label: string) => {
    const values = records.map(key);
    for (const value of values) if (values.filter((item) => item === value).length > 1) errors.push(`DUPLICATE_${label}:${value}`);
  };
  unique(carrierRegistry.carriers, (item) => item.id, "CARRIER_ID");
  unique(carrierRegistry.carriers, (item) => item.slug, "CARRIER_SLUG");
  unique(evidenceSources.sources, (item) => item.id, "SOURCE_ID");
  unique(carrierRules.rules, (item) => item.id, "RULE_ID");
  unique(deviceClasses.classes, (item) => item.id, "CLASS_ID");
  unique(deviceCarrierFits.fits, (item) => item.id, "FIT_ID");
  const sourceIds = new Set(evidenceSources.sources.map((item) => item.id));
  const classIds = new Set(deviceClasses.classes.map((item) => item.id));
  const carrierIds = new Set(carrierRegistry.carriers.map((item) => item.id));
  const programIds = new Set(carrierPrograms.programs.map((item) => item.id));
  for (const carrier of carrierRegistry.carriers) {
    if (carrier.publicationStatus === "published" && (!carrier.supportedJurisdictions.length || !carrier.disclosure || !carrier.canonicalPath.startsWith("/"))) errors.push(`INVALID_PUBLISHED_CARRIER:${carrier.id}`);
  }
  for (const source of evidenceSources.sources) {
    if (validateEvidenceSourceRecord(source).length) errors.push(`INVALID_SOURCE:${source.id}`);
    if (source.visibility === "restricted" && !source.restrictedReferenceId) errors.push(`INVALID_RESTRICTED_SOURCE:${source.id}`);
    if (source.visibility === "public" && !source.url && !source.restrictedReferenceId) errors.push(`MISSING_PUBLIC_SOURCE_REFERENCE:${source.id}`);
  }
  for (const program of carrierPrograms.programs) {
    if (!carrierIds.has(program.carrierId) || program.sourceIds.some((id) => !sourceIds.has(id))) errors.push(`ORPHAN_PROGRAM:${program.id}`);
  }
  for (const rule of carrierRules.rules) {
    if (!carrierIds.has(rule.carrierId) || !programIds.has(rule.programId) || rule.sourceIds.some((id) => !sourceIds.has(id)) || rule.capabilityClassIds.some((id) => !classIds.has(id))) errors.push(`ORPHAN_RULE:${rule.id}`);
    if (rule.visibility === "public" && (rule.status === "draft" || rule.sourceIds.some((id) => evidenceSources.sources.find((source) => source.id === id)?.visibility === "restricted"))) errors.push(`PUBLIC_RULE_LEAK:${rule.id}`);
  }
  for (const fit of deviceCarrierFits.fits) {
    if (!carrierIds.has(fit.carrierId) || !getDeviceById(fit.deviceId) || fit.sourceIds.some((id) => !sourceIds.has(id)) || fit.classIds.some((id) => !classIds.has(id))) errors.push(`ORPHAN_FIT:${fit.id}`);
  }
  for (const question of carrierQuestions.questions) {
    if (!question.changes.length || question.options.length < 2 || question.options.some((option) => !/^[A-Za-z0-9-]+$/.test(option.id))) errors.push(`INVALID_QUESTION:${question.id}`);
  }
  return errors;
}

const categoryClasses: Record<CarrierCategory, string[]> = {
  water: ["whole-home-flow-monitoring", "automatic-main-water-shutoff"],
  gas: ["automatic-gas-shutoff"],
  security: ["professionally-monitored-fire-security"],
  "connected-home": ["connected-home-remote-monitor-control"],
};

export type CarrierGuidanceDataset = { carriers: CarrierRecord[]; rules: CarrierRule[]; fits: DeviceCarrierFit[] };
export function evaluateCarrierGuidance(context: CarrierContext, now = "2026-08-26", data: CarrierGuidanceDataset = { carriers: carrierRegistry.carriers, rules: carrierRules.rules, fits: deviceCarrierFits.fits }): GuidanceResult[] {
  const category = context.category;
  if (!category) return [{
    designation: "confirmation-needed", label: "Confirmation needed", category: "water", sourceIds: [], classIds: [], deviceFitIds: [],
    why: "No protection category was selected, so SmartDevices is preserving the unknown instead of inferring one.",
    limitations: ["Choose a category or continue with generic SmartDevices guidance."], confirmationSteps: ["Confirm the device capability your insurer or concern referred to."], current: false,
  }];
  const carrierRecord = data.carriers.find((item) => item.publicationStatus === "published" && (item.id === context.carrierId || item.slug === context.carrierId));
  if (!carrierRecord || !context.jurisdiction || !carrierRecord.supportedJurisdictions.includes(context.jurisdiction)) return [{
    designation: "confirmation-needed", label: "Confirmation needed", category, sourceIds: [], classIds: categoryClasses[category], deviceFitIds: [],
    why: "Carrier guidance has not been verified for this carrier and state combination.", limitations: ["Evidence is never applied outside its governed carrier and jurisdiction scope."],
    confirmationSteps: ["Use the generic SmartDevices class guide and confirm current treatment with the carrier or licensed professional."], current: false,
  }];
  const rules = data.rules.filter((rule) => rule.carrierId === context.carrierId && rule.jurisdiction === context.jurisdiction && rule.capabilityClassIds.some((id) => categoryClasses[category].includes(id)));
  const currentRules = rules.filter((rule) => evidenceIsCurrent(rule, now) && rule.visibility === "public" && rule.reviewStatus === "reviewed");
  const results: GuidanceResult[] = [];
  if (context.assertionSource === "consumer-stated") results.push({ designation: "your-stated-requirement", label: "Your stated requirement", category, sourceIds: [], classIds: context.requestedCapabilityIds, deviceFitIds: [], why: "You selected that an insurer or policy conversation mentioned this capability.", limitations: ["SmartDevices has not verified this as a carrier requirement."], confirmationSteps: [`Confirm the exact capability, model, installation, and documentation with a ${carrierRecord.name} representative.`], current: true });
  if (context.assertionSource === "professional-stated" || context.professionalAssertion) results.push({ designation: "professional-stated-requirement", label: "Professional-stated requirement", category, sourceIds: [], classIds: context.requestedCapabilityIds, deviceFitIds: [], why: "An authorized professional supplied this case-specific assertion.", limitations: ["A professional assertion is not SmartDevices or carrier verification."], confirmationSteps: ["Ask the professional to confirm the authoritative case source and required documentation."], current: true });
  if (!currentRules.length) results.push({ designation: "confirmation-needed", label: "Confirmation needed", category, sourceIds: rules.flatMap((rule) => rule.sourceIds), classIds: categoryClasses[category], deviceFitIds: [], why: "The available carrier rule is missing, stale, withdrawn, conflicting, or outside scope.", limitations: ["No current positive carrier label is available."], confirmationSteps: ["Confirm current carrier guidance before relying on an earlier source."], current: false });
  for (const rule of currentRules) {
    const designation: CarrierDisplayDesignation = rule.classification === "public-offer" ? "carrier-public-offer" : rule.classification === "potential-discount-category" ? "potential-carrier-discount-category" : "confirmation-needed";
    const fits = data.fits.filter((fit) => fit.carrierId === context.carrierId && fit.jurisdiction === context.jurisdiction && fit.classIds.some((id) => rule.capabilityClassIds.includes(id)) && evidenceIsCurrent(fit, now));
    results.push({ designation, label: designation === "carrier-public-offer" ? `${carrierRecord.name} public offer` : designation === "potential-carrier-discount-category" ? `Potential ${carrierRecord.name} discount category` : "Confirmation needed", category, ruleId: rule.id, sourceIds: rule.sourceIds, classIds: rule.capabilityClassIds, deviceFitIds: fits.map((fit) => fit.id), why: rule.classification === "public-offer" ? `A current ${carrierRecord.name}-controlled page names this public offering.` : `A current ${carrierRecord.name}-controlled public page names this protection capability category.`, limitations: rule.limitations, confirmationSteps: [`Confirm policy applicability, current availability, accepted installation, and documentation with a ${carrierRecord.name} representative.`], current: true });
  }
  results.push({ designation: "smartdevices-recommended", label: "SmartDevices recommended", category, sourceIds: [], classIds: ["independent-protection-recommendation"], deviceFitIds: [], why: "Independent protection guidance can remain useful even when carrier treatment is unknown.", limitations: ["Not a Farmers requirement, offer, eligibility, or discount determination."], confirmationSteps: ["Review device facts and confirm fit before purchase or installation."], current: true });
  return results;
}
