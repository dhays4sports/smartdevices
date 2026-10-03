import { getProjectDatabase } from "@/db/project-database";
import { metricIncrementSql } from "@/app/lib/business-metrics";
import { metricsRequest } from "@/app/lib/metrics-http";
import { consumeRateLimit } from "@/app/lib/rate-limit";
export async function POST(request:Request) {
 return metricsRequest(request,async event=>{
  const rate=await consumeRateLimit(request,"business:metrics",60,60);if(!rate.allowed)throw new Error(rate.reason);
  const db=await getProjectDatabase();await db.batch([db.prepare(metricIncrementSql).bind(new Date().toISOString().slice(0,10),event),db.prepare("DELETE FROM business_metric_daily WHERE day < date('now', '-90 days')")]);
 });
}
