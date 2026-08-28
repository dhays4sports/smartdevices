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
        <h1>Your insurer mentioned a device. Start with what that could mean.</h1>
        <p>SmartDevices separates your stated requirement, public carrier information, technical device fit, and independent recommendations—so one does not masquerade as another.</p>
        <div className="carrier-truth-strip" aria-label="How carrier guidance is classified"><span>Your context</span><i aria-hidden="true">→</i><span>Current public evidence</span><i aria-hidden="true">→</i><span>Technical capability</span><i aria-hidden="true">→</i><span>Confirmation</span></div>
      </header>
      <CarrierDirectory carriers={publishedCarriers()} />
      <aside className="independence-panel" aria-label="SmartDevices independence disclosure"><strong>Independent by design.</strong><p>SmartDevices is not an insurance carrier and does not determine policy requirements, eligibility, discounts, savings, or claim outcomes. Published carrier guidance is dated and scoped; unknowns remain visible.</p></aside>
    </main><SiteFooter /></>
  );
}
