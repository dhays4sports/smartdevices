import type { SafetyPlan } from "./plan";

export type CrmPlanExport = {
  schemaVersion: 1;
  exportedAt: string;
  plan: { id: string; domain: string; concernId: string; status: string };
  recommendations: Array<{ deviceId: string; origin: string; priority: string; explicitClientIntent: string | null; fulfillment: string }>;
  excludedSignals: ["page-view", "link-click", "scroll-depth"];
};

export function buildCrmPlanExport(plan: SafetyPlan): CrmPlanExport {
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    plan: { id: plan.id, domain: plan.domain, concernId: plan.concernId, status: plan.status },
    recommendations: plan.recommendations.map((item) => ({ deviceId: item.deviceId, origin: item.origin, priority: item.priority, explicitClientIntent: item.clientIntent ?? null, fulfillment: item.fulfillment ?? "no-action" })),
    excludedSignals: ["page-view", "link-click", "scroll-depth"],
  };
}
