import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProtectionExplorer } from "@/app/components/ProtectionExplorer";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { getConcern, getDomain, type DomainId } from "@/app/lib/data";

type Props = { params: Promise<{ domain: string }>; searchParams: Promise<{ concern?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain: domainId } = await params;
  const domain = getDomain(domainId);
  return { title: domain ? `${domain.label} Protection Explorer` : "Protection Explorer" };
}

export default async function DomainExplorerPage({ params, searchParams }: Props) {
  const { domain: domainId } = await params;
  if (!getDomain(domainId)) notFound();
  const requestedConcern = (await searchParams).concern;
  const initialConcern = requestedConcern && getConcern(domainId, requestedConcern) ? requestedConcern : undefined;
  return <><SiteHeader /><main><ProtectionExplorer initialDomain={domainId as DomainId} initialConcern={initialConcern} compact /></main><SiteFooter /></>;
}
