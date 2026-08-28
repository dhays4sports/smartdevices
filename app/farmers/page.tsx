import type { Metadata } from "next";
import { CarrierIntentSelector } from "@/app/components/CarrierIntentSelector";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { sanitizeCarrierRoute } from "@/app/lib/carrier-route";

export const metadata: Metadata = {
  title: "California Farmers smart-device guidance | SmartDevices",
  description: "Independent California guidance for a Farmers device request, public protection categories, technical fit, and confirmation steps.",
  alternates: { canonical: "/farmers" },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function FarmersPage({ searchParams }: Props) {
  const context = sanitizeCarrierRoute(await searchParams);
  const structuredData = { "@context": "https://schema.org", "@type": "WebPage", name: "California carrier smart-device guidance", url: "https://smartdevices.com/farmers", description: metadata.description, isPartOf: { "@type": "WebSite", name: "SmartDevices.com", url: "https://smartdevices.com" }, about: { "@type": "Thing", name: "California insurance-aware smart-device guidance" }, dateModified: "2026-08-26" };
  return <><SiteHeader /><main className="farmers-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c") }} />
    <header className="farmers-hero">
      <div className="farmers-hero-copy"><p className="eyebrow">California carrier guidance · evidence reviewed Aug. 26, 2026</p><h1>Understand the device conversation before you act.</h1><p>Start with what you were told, what current Farmers public information says, what a device can technically do, and what still needs confirmation.</p></div>
      <aside className="pilot-scope"><span>California pilot</span><strong>Farmers</strong><p>Text reference only. SmartDevices remains independent.</p></aside>
    </header>
    <CarrierIntentSelector initialIntent={context.intent} initialCategory={context.category} carrierId="farmers" carrierName="Farmers" canonicalPath="/farmers" />
    <aside className="independence-panel"><strong>SmartDevices is independent.</strong><p>This is not an official Farmers site or a Farmers insurance determination. Do not rely on this page as proof of a requirement, eligibility, savings, installation acceptance, or policy compliance. Confirm your case with a Farmers agent.</p></aside>
  </main><SiteFooter /></>;
}
