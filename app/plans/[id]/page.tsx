import type { Metadata } from "next";
import { SafetyPlanClient } from "@/app/components/SafetyPlanClient";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { getPublishedEvidenceBundle, publicCarrierArchiveFromBundle } from "@/app/lib/evidence-store";
import { homeDecisionCatalog } from "@/app/lib/home-decision";
export const metadata: Metadata = { title: "Smart Safety Plan", robots: { index: false, follow: false } };
type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
export default async function PlanPage({ params, searchParams }: Props) {
  const { id } = await params;
  const search = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (typeof value === "string") query.set(key, value);
    else if (Array.isArray(value)) value.forEach((item) => query.append(key, item));
  }
  const bundle = await getPublishedEvidenceBundle();
  const reviewDate = new Date().toISOString().slice(0, 10);
  const catalog = homeDecisionCatalog(bundle.catalog, bundle.sources, reviewDate);
  return <><SiteHeader /><SafetyPlanClient planId={id} selectionQuery={query.toString()} publishedDevices={catalog} carrierData={publicCarrierArchiveFromBundle(bundle)} reviewDate={reviewDate} /><SiteFooter /></>;
}
