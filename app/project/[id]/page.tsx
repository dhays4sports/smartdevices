import { notFound } from "next/navigation";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { DeviceBuilder } from "@/app/components/DeviceBuilder";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { readHostedProject } from "@/app/lib/builder-store";
import { getPublishedEvidenceBundle } from "@/app/lib/evidence-store";

export const metadata = { robots: { index: false, follow: false } };

type Props = { params: Promise<{ id: string }> };

export default async function BuilderProjectPage({ params }: Props) {
  const { id } = await params;
  if (!/^sd-[a-z0-9-]{6,80}$/i.test(id)) notFound();
  const user = await requireChatGPTUser(`/project/${id}`);
  const result = await Promise.all([readHostedProject(id, user.email), getPublishedEvidenceBundle()]).catch(() => null);
  if (!result) {
    return <><SiteHeader /><main className="page-main narrow-page"><p className="eyebrow">SmartDevices Builder</p><h1>Hosted project storage is unavailable.</h1><p>The project remains available in the browser that created it if local storage has not been cleared. Verify the D1 binding before relying on hosted project URLs.</p></main><SiteFooter /></>;
  }
  const [project, bundle] = result;
  if (!project) notFound();
  return <><SiteHeader /><main><DeviceBuilder publishedDevices={bundle.catalog} sourceContext={project.sourceContext} initialProject={project} /></main><SiteFooter /></>;
}
