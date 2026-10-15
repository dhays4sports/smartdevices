import questionContent from "@/content/scan-questions.json";
import { devices, getConcern, type Device, type DomainId } from "./data";

export type ScanEffectArea = "filtering" | "priority" | "explanation" | "compatibility" | "cost" | "setup" | "subscription" | "maintenance" | "privacy" | "power";
export type ScanOption = { id: string; label: string; effects: string[] };
export type ScanQuestion = {
  id: string;
  prompt: string;
  why: string;
  domains: DomainId[];
  concerns?: string[];
  allowUnknown: boolean;
  allowSkip: boolean;
  effectAreas: ScanEffectArea[];
  options: ScanOption[];
};
export type ScanAnswer = { questionId: string; optionId: string | "skipped" };
export type PriorityBand = "start-here" | "worth-considering" | "keep-in-view";
export const priorityBandLabels: Record<PriorityBand, string> = {
  "start-here": "Start here",
  "worth-considering": "Worth considering",
  "keep-in-view": "Keep in view",
};
export type ScanRecommendation = {
  device: Device;
  protectionArea: string;
  solutionClass: string;
  priorityBand: PriorityBand;
  rationaleFactors: string[];
  compatibilityNotes: string[];
};
export type ScanResult = {
  schemaVersion: 1;
  questionSetVersion: number;
  domainId: DomainId;
  primaryConcernId: string;
  selectedConcernIds: string[];
  recommendations: ScanRecommendation[];
  assumptions: string[];
  unknowns: string[];
  exclusions: string[];
};

type QuestionSet = { schemaVersion: number; publishedAt: string; questions: ScanQuestion[] };
export const scanQuestionSet = questionContent as QuestionSet;

export function validateQuestionSet(set: QuestionSet): string[] {
  const errors: string[] = [];
  if (!Number.isInteger(set.schemaVersion) || set.schemaVersion < 1) errors.push("schemaVersion must be a positive integer");
  const ids = new Set<string>();
  for (const question of set.questions) {
    if (ids.has(question.id)) errors.push(`duplicate question id: ${question.id}`);
    ids.add(question.id);
    if (!question.prompt.trim() || !question.why.trim()) errors.push(`${question.id}: prompt and why are required`);
    if (!question.effectAreas.length) errors.push(`${question.id}: at least one decision effect is required`);
    if (!question.domains.length) errors.push(`${question.id}: at least one domain is required`);
    const optionIds = new Set<string>();
    for (const option of question.options) {
      if (optionIds.has(option.id)) errors.push(`${question.id}: duplicate option ${option.id}`);
      optionIds.add(option.id);
      if (!option.effects.length) errors.push(`${question.id}/${option.id}: effect metadata is required`);
    }
    if (question.allowUnknown && !question.options.some((option) => option.id === "unknown")) errors.push(`${question.id}: unknown option is required`);
    for (const domainId of question.domains) {
      for (const concernId of question.concerns ?? []) {
        if (!getConcern(domainId, concernId)) errors.push(`${question.id}: unknown concern ${domainId}/${concernId}`);
      }
    }
  }
  return errors;
}

export function questionsFor(domainId: DomainId, concernId: string): ScanQuestion[] {
  const applicable = scanQuestionSet.questions.filter((question) =>
    question.domains.includes(domainId) && (!question.concerns || question.concerns.includes(concernId)),
  );
  const vehicleOrder: Record<string, string[]> = {
    theft: ["V-PARKING", "V-POWER", "V-MODEL-YEAR", "V-CONSENT", "U-SUBSCRIPTION"],
    dashcam: ["V-PARKING", "V-POWER", "U-INSTALL", "U-SUBSCRIPTION"],
    "teen-driver": ["V-CONSENT", "V-POWER", "V-MODEL-YEAR", "U-INSTALL", "U-SUBSCRIPTION"],
    diagnostics: ["V-POWER", "V-MODEL-YEAR", "U-INSTALL", "U-SUBSCRIPTION"],
  };
  const order = domainId === "vehicle" ? vehicleOrder[concernId] : undefined;
  return (order
    ? order.map((id) => applicable.find((question) => question.id === id)).filter((question): question is ScanQuestion => Boolean(question))
    : applicable
  ).slice(0, 5);
}

function answerMap(answers: ScanAnswer[]): Map<string, string> {
  return new Map(answers.map((answer) => [answer.questionId, answer.optionId]));
}

function hasSubscription(device: Device): boolean {
  return !/no required|without a required/i.test(device.subscription);
}

function isProfessional(device: Device): boolean {
  return /professional|plumb|hardwir/i.test(device.installation);
}

export function buildScanResult(domainId: DomainId, concernId: string, answers: ScanAnswer[], publishedDevices: Device[] = devices): ScanResult {
  const map = answerMap(answers);
  const questions = questionsFor(domainId, concernId);
  const unknowns = questions
    .filter((question) => ["unknown", "skipped", undefined].includes(map.get(question.id)))
    .map((question) => `${question.prompt} remains unknown.`);
  const assumptions: string[] = [];
  const exclusions: string[] = [];
  const candidates = publishedDevices.filter((device) => device.status === "active" && device.domains.includes(domainId) && device.concerns.includes(concernId));

  if (!answers.length) assumptions.push("No scan answers were available; results use only the selected concern and published catalog facts.");

  let filtered = [...candidates];
  if (map.get("U-INSTALL") === "diy") {
    const diy = filtered.filter((device) => !isProfessional(device));
    if (diy.length) filtered = diy;
    else assumptions.push("No active option fully matched the DIY preference; professional installation remains visible as a tradeoff.");
  }
  if (map.get("U-SUBSCRIPTION") === "avoid") {
    const noRequired = filtered.filter((device) => !hasSubscription(device));
    if (noRequired.length) filtered = noRequired;
    else assumptions.push("Active options for this concern may require service; current terms need verification.");
  }
  if (domainId === "home" && concernId === "water" && map.get("H-RESPONSE") === "automatic") {
    const shutoff = filtered.filter((device) => /shutoff/i.test(`${device.solution} ${device.capabilities.join(" ")}`));
    if (shutoff.length) filtered = shutoff;
  }
  if (map.get("V-POWER") === "portable") {
    const portable = filtered.filter((device) => !/OBD|hardwir/i.test(`${device.installation} ${device.solution}`));
    if (portable.length) filtered = portable;
    else assumptions.push("Portable-power preference could not be confirmed for the active result set.");
  }
  if (map.get("V-MODEL-YEAR") === "pre-1996") {
    filtered = filtered.filter((device) => !/OBD/i.test(`${device.installation} ${device.solution}`));
    exclusions.push("OBD-dependent options were withheld because pre-1996 compatibility is uncertain.");
  }
  if (!filtered.length && candidates.length) {
    exclusions.push("No active product matched every stated constraint; showing no weaker substitute.");
  }

  const recommendations = filtered.slice(0, 5).map((device, index): ScanRecommendation => {
    const rationaleFactors: string[] = [`Addresses the selected ${getConcern(domainId, concernId)?.label ?? concernId} concern.`];
    if (map.get("H-AWAY") === "often") rationaleFactors.push("Frequent time away makes remote awareness more relevant.");
    if (map.get("H-RESPONSE") === "automatic" && /shutoff/i.test(`${device.solution} ${device.capabilities.join(" ")}`)) rationaleFactors.push("Supports the requested automatic-response path when correctly installed and configured.");
    if (map.get("U-INSTALL") === "diy" && !isProfessional(device)) rationaleFactors.push("Fits the stated preference for simpler setup.");
    if (map.get("U-SUBSCRIPTION") === "avoid" && !hasSubscription(device)) rationaleFactors.push("Does not appear to require a subscription for the described core use; current terms still need confirmation.");
    if (map.get("V-PARKING") === "street") rationaleFactors.push("Street parking increases the usefulness of remote incident or movement awareness.");
    if (map.get("V-CONSENT") === "yes-review") rationaleFactors.push("Shared-driver privacy settings require a household discussion before activation.");
    return {
      device,
      protectionArea: getConcern(domainId, concernId)?.label ?? concernId,
      solutionClass: device.solution,
      priorityBand: index === 0 ? "start-here" : index < 3 ? "worth-considering" : "keep-in-view",
      rationaleFactors,
      compatibilityNotes: device.limitations.slice(0, 2),
    };
  });

  return {
    schemaVersion: 1,
    questionSetVersion: scanQuestionSet.schemaVersion,
    domainId,
    primaryConcernId: concernId,
    selectedConcernIds: [concernId],
    recommendations,
    assumptions,
    unknowns,
    exclusions,
  };
}
