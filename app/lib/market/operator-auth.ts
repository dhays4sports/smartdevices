import type { ChatGPTUser } from "@/app/chatgpt-auth";

type MarketOperatorGrant = { email: string; role: "market-operator"; expiresAt: string; status: "active" | "suspended" };

export function authorizeMarketOperator(user: ChatGPTUser | null, grantsJson: string | undefined, now = new Date()) {
  if (!user) return { authorized: false, reason: "UNAUTHENTICATED" as const };
  if (!grantsJson) return { authorized: false, reason: "ROLE_CONFIG_MISSING" as const };
  let grants: MarketOperatorGrant[];
  try { grants = JSON.parse(grantsJson) as MarketOperatorGrant[]; } catch { return { authorized: false, reason: "ROLE_CONFIG_MISSING" as const }; }
  if (!Array.isArray(grants)) return { authorized: false, reason: "ROLE_CONFIG_MISSING" as const };
  const grant = grants.find((item) => item.email.toLowerCase() === user.email.toLowerCase() && item.role === "market-operator");
  if (!grant) return { authorized: false, reason: "FORBIDDEN" as const };
  if (grant.status !== "active") return { authorized: false, reason: "ROLE_SUSPENDED" as const };
  if (!Number.isFinite(Date.parse(grant.expiresAt)) || Date.parse(grant.expiresAt) <= now.getTime()) return { authorized: false, reason: "ROLE_EXPIRED" as const };
  return { authorized: true, reason: "AUTHORIZED" as const };
}
