/** Only bounded, non-identifying event labels reach storage. Never accept URLs or free text. */
export const metricEvents = ["discover_search", "device_view", "capability_filter", "compare_start", "compare_complete", "builder_start", "builder_step", "builder_complete", "plan_save_local", "plan_save_hosted", "plan_reopen_local", "plan_reopen_hosted", "outbound_product_click", "plan_export"] as const;
export type MetricEvent = typeof metricEvents[number];
export function parseMetric(value: unknown): MetricEvent | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const fields = value as Record<string, unknown>;
  return Object.keys(fields).length === 1 && typeof fields.event === "string" && metricEvents.includes(fields.event as MetricEvent) ? fields.event as MetricEvent : null;
}
export const metricIncrementSql = `INSERT INTO business_metric_daily (day, cohort, event, count) VALUES (?, 'synthetic', ?, 1) ON CONFLICT(day, cohort, event) DO UPDATE SET count = MIN(count + 1, 1000000)`;
