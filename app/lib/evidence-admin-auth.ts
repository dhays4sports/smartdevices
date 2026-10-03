import type { ChatGPTUser } from "@/app/chatgpt-auth";

type EvidenceAdminGrant = {
  email: string;
  role: "evidence-admin";
  expiresAt: string;
  status: "active" | "suspended";
};

export type EvidenceAdminAuthorization = {
  authorized: boolean;
  reason: "AUTHORIZED" | "UNAUTHENTICATED" | "ROLE_CONFIG_MISSING" | "FORBIDDEN" | "ROLE_EXPIRED" | "ROLE_SUSPENDED";
};

export function authorizeEvidenceAdmin(user: ChatGPTUser | null, grantsJson: string | undefined, now = new Date()): EvidenceAdminAuthorization {
  if (!user) return { authorized: false, reason: "UNAUTHENTICATED" };
  if (!grantsJson) return { authorized: false, reason: "ROLE_CONFIG_MISSING" };
  let grants: EvidenceAdminGrant[];
  try { grants = JSON.parse(grantsJson) as EvidenceAdminGrant[]; } catch { return { authorized: false, reason: "ROLE_CONFIG_MISSING" }; }
  if (!Array.isArray(grants)) return { authorized: false, reason: "ROLE_CONFIG_MISSING" };
  const grant = grants.find((item) => item.email.toLowerCase() === user.email.toLowerCase() && item.role === "evidence-admin");
  if (!grant) return { authorized: false, reason: "FORBIDDEN" };
  if (grant.status !== "active") return { authorized: false, reason: "ROLE_SUSPENDED" };
  if (!Number.isFinite(Date.parse(grant.expiresAt)) || Date.parse(grant.expiresAt) <= now.getTime()) return { authorized: false, reason: "ROLE_EXPIRED" };
  return { authorized: true, reason: "AUTHORIZED" };
}

export function timingSafeTokenMatch(candidate: string | null, configured: string | undefined): boolean {
  if (!candidate || !configured || candidate.length !== configured.length) return false;
  let difference = 0;
  for (let index = 0; index < candidate.length; index += 1) difference |= candidate.charCodeAt(index) ^ configured.charCodeAt(index);
  return difference === 0;
}
