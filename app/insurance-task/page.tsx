import type { Metadata } from "next";
import { SiteHeader } from "@/app/components/SiteHeader";
import { SiteFooter } from "@/app/components/SiteFooter";
import { CoverageFitTaskEntry } from "@/app/components/CoverageFitTaskEntry";
import { getPublishedEvidenceBundle } from "@/app/lib/evidence-store";
import { homeDecisionCatalog, homeOptions } from "@/app/lib/home-decision";
import { coverageFitOrigin } from "@/app/lib/coveragefit-device";
export const metadata: Metadata = { title: "Your insurance device next step", robots: { index: false, follow: false }, referrer: "no-referrer" };
export const dynamic = "force-dynamic";
export default async function InsuranceTaskPage() {
  const bundle = await getPublishedEvidenceBundle(); let returnOrigin = "";
  try { returnOrigin = coverageFitOrigin(process.env); } catch {}
  const options = homeOptions(homeDecisionCatalog(bundle.catalog, bundle.sources, new Date().toISOString().slice(0, 10)), "water", "shutoff").filter(device=>device.id==='moen-flo-shutoff');
  return <><SiteHeader /><main><CoverageFitTaskEntry options={options} returnOrigin={returnOrigin} /></main><SiteFooter /></>;
}
