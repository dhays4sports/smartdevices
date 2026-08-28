import type { CarrierCategory, CarrierRule } from "./carrier";

export type CarrierPlanTemplate = { id: string; name: string; carrierId: string; jurisdiction: string; category: CarrierCategory; intent: "requirement"; capabilityIds: string[]; requiredRuleIds: string[]; confirmation: string };

export const carrierPlanTemplates: CarrierPlanTemplate[] = [
  { id: "water-shutoff", name: "Whole-home water shutoff review", carrierId: "farmers", jurisdiction: "CA", category: "water", intent: "requirement", capabilityIds: ["whole-home-flow-monitoring", "automatic-main-water-shutoff"], requiredRuleIds: ["farmers-ca-water-category-v1"], confirmation: "Confirm the exact policy, property, model, installation, and documentation with Farmers." },
  { id: "gas-shutoff", name: "Automatic gas shutoff review", carrierId: "farmers", jurisdiction: "CA", category: "gas", intent: "requirement", capabilityIds: ["automatic-gas-shutoff"], requiredRuleIds: ["farmers-ca-gas-category-v1"], confirmation: "Confirm listing, local authority, utility, installer, property, and carrier acceptance." },
  { id: "monitored-security", name: "Monitored fire/security review", carrierId: "farmers", jurisdiction: "CA", category: "security", intent: "requirement", capabilityIds: ["professionally-monitored-fire-security"], requiredRuleIds: ["farmers-ca-protective-device-category-v1"], confirmation: "Confirm signal, monitoring, dispatch, subscription, certification, policy scope, and documentation." },
  { id: "connected-home", name: "Connected-home review", carrierId: "farmers", jurisdiction: "CA", category: "connected-home", intent: "requirement", capabilityIds: ["connected-home-remote-monitor-control"], requiredRuleIds: ["farmers-ca-connected-home-category-v1"], confirmation: "Confirm technical capability, integration currency, outages, privacy, and carrier treatment." },
];

export function carrierTemplateState(template: CarrierPlanTemplate, rules: CarrierRule[], now = "2026-08-26"): "available" | "warning-gated" {
  return template.requiredRuleIds.every((id) => rules.some((rule) => rule.id === id && rule.status === "active" && rule.reviewDueDate >= now && rule.reviewStatus === "reviewed" && rule.visibility === "public")) ? "available" : "warning-gated";
}
