import type { Metadata } from "next";
import { CarrierDirectory } from "@/app/components/CarrierDirectory";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { publishedCarriers } from "@/app/lib/carrier";

export const metadata: Metadata = {
  title: "Insurance device guidance | SmartDevices",
  description: "Find independent, evidence-governed smart-device guidance for an insurer request, possible discount category, or protection recommendation.",
  alternates: { canonical: "/insurance" },
};

export default function InsurancePage() {
  const structuredData = { "@context": "https://schema.org", "@type": "WebPage", name: "Independent insurance device guidance", url: "https://smartdevices.com/insurance", description: metadata.description, isPartOf: { "@type": "WebSite", name: "SmartDevices.com", url: "https://smartdevices.com" }, about: { "@type": "Thing", name: "Insurance-aware smart-device guidance" }, dateModified: "2026-08-26" };
  return (
    <><SiteHeader /><main className="insurance-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c") }} />
      <header className="insurance-hero">
        <p className="eyebrow">Insurance guidance</p>
        <h1>Did your insurer mention a smart device?</h1>
        <p>Choose your insurer. We’ll help you understand what kind of device may apply and what to confirm before you act.</p>
      </header>
      <CarrierDirectory carriers={publishedCarriers()} />
      <aside className="independence-panel" aria-label="SmartDevices independence disclosure"><strong>Independent by design.</strong><p>SmartDevices does not determine policy requirements, eligibility or discounts. Carrier-specific guidance is dated, scoped and always includes a confirmation step.</p></aside>
    </main><SiteFooter /></>
  );
}
