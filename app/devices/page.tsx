import type { Metadata } from "next";
import { DeviceLibrary } from "@/app/components/DeviceLibrary";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { getPublishedEvidenceBundle } from "@/app/lib/evidence-store";

export const metadata: Metadata = { title: "Device Intelligence Library", description: "Source-linked smart device facts, limitations, compatibility, and insurance context." };

type Props = { searchParams: Promise<{ domain?: string; concern?: string }> };
export default async function DevicesPage({ searchParams }: Props) {
  const search = await searchParams;
  const bundle = await getPublishedEvidenceBundle();
  return <><SiteHeader /><main className="page-main"><header className="page-hero"><p className="eyebrow">Device Intelligence Library</p><h1>Reviewed facts. Visible limits. Fewer, better options.</h1><p>Filter a small evidence-led catalog by the concern you are trying to address. Product status and source dates are part of every record.</p></header><DeviceLibrary initialDomain={search.domain} initialConcern={search.concern} publishedDevices={bundle.catalog} /></main><SiteFooter /></>;
}
