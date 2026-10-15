import { getChatGPTUser } from "@/app/chatgpt-auth";
import { authorizeMarketOperator } from "@/app/lib/market/operator-auth";
import { getMarketShadowDashboard } from "@/app/lib/market/shadow-store";

export const runtime = "nodejs";

export async function GET() {
  const user = await getChatGPTUser();
  const demoMode = !user && process.env.SMARTDEVICES_DEMO_MODE === "true";
  const auth = demoMode ? { authorized: true, reason: "AUTHORIZED" as const } : authorizeMarketOperator(user, process.env.SMARTDEVICES_MARKET_OPERATOR_AUTH_JSON);
  if (!auth.authorized) return Response.json({ error: auth.reason }, { status: auth.reason === "UNAUTHENTICATED" ? 401 : 403, headers: { "Cache-Control": "private, no-store" } });
  try {
    return Response.json({ ...(await getMarketShadowDashboard()), actor: user?.email ?? "local-demo" }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "MARKET_OBSERVABILITY_STORAGE_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "private, no-store" } });
  }
}
