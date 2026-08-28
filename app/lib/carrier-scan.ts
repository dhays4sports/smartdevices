import { carrierQuestions, type CarrierCategory, type CarrierContext, type CarrierQuestion } from "./carrier";
import type { CarrierIntent } from "./carrier-contract";

export type CarrierAnswer = { questionId: string; optionId: string };

export function questionsForCarrier(category: CarrierCategory): CarrierQuestion[] {
  const branchId = category === "water" ? "water-capability" : category === "gas" ? "gas-capability" : category === "security" ? "security-capability" : "connected-capability";
  const ids = ["jurisdiction", "policy-scope", branchId, "installation-status"];
  return ids.map((id) => carrierQuestions.questions.find((question) => question.id === id)).filter((question): question is CarrierQuestion => Boolean(question));
}

export function validateCarrierQuestionBranches(): string[] {
  const errors: string[] = [];
  for (const category of ["water", "gas", "security", "connected-home"] as const) {
    const questions = questionsForCarrier(category);
    if (questions.length < 3 || questions.length > 5) errors.push(`${category}: question count must be 3–5`);
    for (const question of questions) if (!question.changes.length) errors.push(`${category}/${question.id}: effect required`);
  }
  return errors;
}

export function buildCarrierContext(intent: CarrierIntent, category: CarrierCategory, answers: CarrierAnswer[], carrierId: string): CarrierContext {
  const map = new Map(answers.map((answer) => [answer.questionId, answer.optionId]));
  const jurisdictionAnswer = map.get("jurisdiction");
  const jurisdiction = jurisdictionAnswer && /^[A-Z]{2}$/.test(jurisdictionAnswer) ? jurisdictionAnswer : jurisdictionAnswer === "other" ? "other" : undefined;
  const policyAnswer = map.get("policy-scope");
  const policyScope = policyAnswer && !["unknown", "prefer-not", "skip"].includes(policyAnswer) ? policyAnswer : undefined;
  const capabilityAnswer = map.get(`${category === "connected-home" ? "connected" : category}-capability`);
  const requestedCapabilityIds: string[] = [];
  if (category === "water" && capabilityAnswer === "point") requestedCapabilityIds.push("point-water-detection");
  if (category === "water" && capabilityAnswer === "whole-home") requestedCapabilityIds.push("whole-home-flow-monitoring");
  if (category === "water" && capabilityAnswer === "automatic-shutoff") requestedCapabilityIds.push("automatic-main-water-shutoff");
  if (category === "gas" && ["automatic", "seismic"].includes(capabilityAnswer ?? "")) requestedCapabilityIds.push("automatic-gas-shutoff");
  if (category === "security" && capabilityAnswer === "local") requestedCapabilityIds.push("local-fire-alert");
  if (category === "security" && capabilityAnswer === "professional") requestedCapabilityIds.push("professionally-monitored-fire-security");
  if (category === "connected-home" && capabilityAnswer && !["unknown", "skip"].includes(capabilityAnswer)) requestedCapabilityIds.push("connected-home-remote-monitor-control");
  const unknowns: string[] = [];
  if (!jurisdiction) unknowns.push("State-specific carrier guidance is unknown.");
  if (!policyScope) unknowns.push("Policy or property scope is unknown.");
  if (!requestedCapabilityIds.length) unknowns.push("The exact technical capability is unknown or does not match the selected carrier category.");
  const installationStatus = map.get("installation-status");
  if (!installationStatus || ["unknown", "skip"].includes(installationStatus)) unknowns.push("Installation status is unknown.");
  return {
    carrierId,
    jurisdiction,
    intent,
    category,
    policyScope,
    requestedCapabilityIds,
    assertionSource: intent === "requirement" ? "consumer-stated" : undefined,
    installationStatus,
    unknowns,
  };
}
