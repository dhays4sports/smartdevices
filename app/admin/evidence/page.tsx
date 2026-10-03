import type { Metadata } from "next";
import { EvidenceAutopilot } from "@/app/components/EvidenceAutopilot";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { authorizeEvidenceAdmin } from "@/app/lib/evidence-admin-auth";
import { getEvidenceDashboard } from "@/app/lib/evidence-store";
import "./evidence.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Evidence Autopilot", robots: { index: false, follow: false } };

export default async function EvidenceAdminPage() {
  const user = await getChatGPTUser();
  const demoMode = !user && process.env.SMARTDEVICES_DEMO_MODE === "true";
  const authorization = demoMode ? { authorized: true, reason: "AUTHORIZED" as const } : authorizeEvidenceAdmin(user, process.env.SMARTDEVICES_EVIDENCE_ADMIN_JSON);
  if (!authorization.authorized) return <><SiteHeader /><main className="page-main narrow-page"><p className="eyebrow">Evidence Autopilot</p><h1>Administrator authorization required.</h1><p>This workspace can refresh and publish governed product and carrier evidence. It requires a current server-side evidence-administrator grant. Status: {authorization.reason}.</p><a className="button-primary" href="/signin-with-chatgpt?return_to=%2Fadmin%2Fevidence">Sign in</a></main><SiteFooter /></>;
  return <><SiteHeader /><EvidenceAutopilot initial={await getEvidenceDashboard()} /><SiteFooter /></>;
}
