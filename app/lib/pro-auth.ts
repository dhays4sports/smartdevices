import type { ChatGPTUser } from "@/app/chatgpt-auth";

type ProfessionalGrant = { email: string; role: "professional"; expiresAt: string; status: "active" | "suspended" };
export type ProfessionalAuthorization = { authorized: boolean; reason: "AUTHORIZED" | "UNAUTHENTICATED" | "ROLE_CONFIG_MISSING" | "FORBIDDEN" | "ROLE_EXPIRED" | "ROLE_SUSPENDED" };

export function authorizeProfessional(user: ChatGPTUser | null, grantsJson: string | undefined, now = new Date()): ProfessionalAuthorization {
  if (!user) return { authorized: false, reason: "UNAUTHENTICATED" };
  if (!grantsJson) return { authorized: false, reason: "ROLE_CONFIG_MISSING" };
  let grants: ProfessionalGrant[];
  try { grants = JSON.parse(grantsJson) as ProfessionalGrant[]; } catch { return { authorized: false, reason: "ROLE_CONFIG_MISSING" }; }
  if (!Array.isArray(grants)) return { authorized: false, reason: "ROLE_CONFIG_MISSING" };
  const grant = grants.find((item) => item.email.toLowerCase() === user.email.toLowerCase() && item.role === "professional");
  if (!grant) return { authorized: false, reason: "FORBIDDEN" };
  if (grant.status !== "active") return { authorized: false, reason: "ROLE_SUSPENDED" };
  if (!Number.isFinite(Date.parse(grant.expiresAt)) || Date.parse(grant.expiresAt) <= now.getTime()) return { authorized: false, reason: "ROLE_EXPIRED" };
  return { authorized: true, reason: "AUTHORIZED" };
}
