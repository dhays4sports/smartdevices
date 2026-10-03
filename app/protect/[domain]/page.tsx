import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProtectionExplorer } from "@/app/components/ProtectionExplorer";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { getConcern, getDomain, type DomainId } from "@/app/lib/data";
import { getPublishedEvidenceBundle } from "@/app/lib/evidence-store";
import { HomeDecisionExperience } from "@/app/components/HomeDecisionExperience";
import { homeDecisionCatalog, sanitizeHomeContext } from "@/app/lib/home-decision";

type Props = { params: Promise<{ domain: string }>; searchParams: Promise<{ concern?: string; entry?: string; goal?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain: domainId } = await params;
  const domain = getDomain(domainId);
  return { title: domain ? `${domain.label} Protection Explorer` : "Protection Explorer" };
}

export default async function DomainExplorerPage({ params, searchParams }: Props) {
  const { domain: domainId } = await params;
  if (!getDomain(domainId)) notFound();
  const search = await searchParams;
  const requestedConcern = search.concern;
  const initialConcern = requestedConcern && getConcern(domainId, requestedConcern) ? requestedConcern : undefined;
  const bundle = await getPublishedEvidenceBundle();
  if (domainId === "home") {
    const context = sanitizeHomeContext(new URLSearchParams(Object.entries(search).filter((entry): entry is [string, string] => typeof entry[1] === "string")));
    const catalog = homeDecisionCatalog(bundle.catalog, bundle.sources, new Date().toISOString().slice(0, 10));
    return <><SiteHeader /><main><HomeDecisionExperience publishedDevices={catalog} initialConcern={context.concern} initialEntry={context.entry} initialGoal={context.goal} /></main><SiteFooter /></>;
  }
  return <><SiteHeader /><main><ProtectionExplorer initialDomain={domainId as DomainId} initialConcern={initialConcern} publishedDevices={bundle.catalog} compact /></main><SiteFooter /></>;
}
