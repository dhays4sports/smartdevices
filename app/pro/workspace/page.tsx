import type { Metadata } from "next";
import { ProWorkspace } from "@/app/components/ProWorkspace";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { authorizeProfessional } from "@/app/lib/pro-auth";
import { getPublishedEvidenceBundle, publicCarrierDataFromBundle } from "@/app/lib/evidence-store";
export const metadata: Metadata = { title: "Pro Workspace", robots: { index: false, follow: false } };
export default async function ProWorkspacePage() { const user = await getChatGPTUser(); const demoMode = !user && process.env.SMARTDEVICES_DEMO_MODE === "true"; const authorization = demoMode ? { authorized: true, reason: "AUTHORIZED" as const } : authorizeProfessional(user, process.env.SMARTDEVICES_PRO_AUTH_JSON); if (!authorization.authorized) return <main className="page-main narrow-page"><p className="eyebrow">SmartDevices Pro</p><h1>Authorization required.</h1><p>This production workspace requires a current server-side professional grant. Status: {authorization.reason}.</p><a className="button-primary" href="/signin-with-chatgpt?return_to=%2Fpro%2Fworkspace">Sign in</a></main>; const bundle = await getPublishedEvidenceBundle(); return <ProWorkspace userName={user?.displayName} userEmail={user?.email} demoMode={demoMode} carrierData={publicCarrierDataFromBundle(bundle)} publishedDevices={bundle.catalog} />; }
