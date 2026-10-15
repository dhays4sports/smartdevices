import type { Metadata } from "next";
import { CarrierIntentSelector } from "@/app/components/CarrierIntentSelector";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { sanitizeCarrierRoute } from "@/app/lib/carrier-route";
import { formatReviewed } from "@/app/lib/data";
import { getPublishedEvidenceBundle, publicCarrierDataFromBundle } from "@/app/lib/evidence-store";

export const metadata: Metadata = {
  title: "California Farmers smart-device guidance | SmartDevices",
  description: "Independent California guidance for a Farmers device request, public protection categories, technical fit, and confirmation steps.",
  alternates: { canonical: "/farmers" },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function FarmersPage({ searchParams }: Props) {
  const context = sanitizeCarrierRoute(await searchParams);
  const bundle = await getPublishedEvidenceBundle();
  const carrierData = publicCarrierDataFromBundle(bundle);
  const reviewDate = carrierData.sources.map((source) => source.checkedDate).sort().at(-1) ?? bundle.publishedAt.slice(0, 10);
  const structuredData = { "@context": "https://schema.org", "@type": "WebPage", name: "California carrier smart-device guidance", url: "https://smartdevices.com/farmers", description: metadata.description, isPartOf: { "@type": "WebSite", name: "SmartDevices.com", url: "https://smartdevices.com" }, about: { "@type": "Thing", name: "California insurance-aware smart-device guidance" }, dateModified: reviewDate };
  return <><SiteHeader /><main className="farmers-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c") }} />
    <header className="farmers-hero">
      <div className="farmers-hero-copy"><p className="eyebrow">SmartDevices for California Farmers customers</p><h1>Find the right device for what Farmers mentioned.</h1><p>Tell us why you came. We’ll give you one clear place to start—and show what to confirm before you buy.</p></div>
      <p className="evidence-date">Independent guidance · evidence reviewed {formatReviewed(reviewDate)}</p>
      <div className="carrier-truth-strip" aria-label="What this guidance provides"><span>Tell us why</span><i aria-hidden="true">→</i><span>See where to start</span><i aria-hidden="true">→</i><span>Know what to confirm</span></div>
    </header>
    <CarrierIntentSelector initialIntent={context.intent} initialCategory={context.category} carrierId="farmers" carrierName="Farmers" canonicalPath="/farmers" carrierData={carrierData} publishedDevices={bundle.catalog} reviewDate={reviewDate} />
    <aside className="carrier-builder-boundary"><div><p className="eyebrow">Separate custom-build path</p><h2>Need a device for a different problem?</h2><p>SmartDevices Builder can plan a low-voltage custom prototype when an existing product does not fit. A custom build is informational only and does not replace or satisfy a Farmers requirement.</p></div><a className="button-subtle" href="/build?source=farmers">Open Builder</a></aside>
    <aside className="independence-panel"><strong>SmartDevices is independent.</strong><p>This is not an official Farmers site or an insurance determination. Confirm requirements, eligibility, installation and documentation with your Farmers agent.</p></aside>
  </main><SiteFooter /></>;
}
