import type { MetricEvent } from "./business-metrics";
export const metricsConsentKey = "smartdevices-metrics-consent-v1";
export function recordMetric(event: MetricEvent) {
  try {
    if (typeof window === "undefined" || navigator.doNotTrack === "1" || (navigator as Navigator & {globalPrivacyControl?:boolean}).globalPrivacyControl || sessionStorage.getItem(metricsConsentKey) !== "yes") return;
    void fetch("/api/metrics", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({event}), keepalive:true}).catch(()=>{});
  } catch { /* Metrics must never prevent a product action. */ }
}
