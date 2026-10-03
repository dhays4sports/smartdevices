import Image from "next/image";
import Link from "next/link";
import { ProtectionExplorer } from "./components/ProtectionExplorer";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { getPublishedEvidenceBundle } from "./lib/evidence-store";

export default async function Home() {
  const bundle = await getPublishedEvidenceBundle();
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero"><p className="eyebrow">Discover → Plan → Act</p><h1>Plan water-leak protection for your home.</h1><p>Compare detection, monitoring and automatic shutoff. Check installation needs, keep a local plan, and review the manufacturer’s details before buying.</p><Link className="button-primary" href="/protect/home?concern=water">Compare water-protection options</Link> <Link className="button-subtle" href="/devices">Browse all devices</Link><p>No account needed to compare. Plans from this guide are saved on this device; online prototype projects remain a separate Builder feature.</p></section><ProtectionExplorer publishedDevices={bundle.catalog} />
        <section className="institutional-strip" aria-labelledby="intelligence-title">
          <div className="institutional-visual">
            <Image src="/legacy/intelligence-globe.svg" alt="Abstract network globe from the SmartDevices archive" width={720} height={720} unoptimized />
          </div>
          <div>
            <p className="eyebrow">The SmartDevices Index</p>
            <h2 id="intelligence-title">A calmer way to understand connected protection.</h2>
            <p>Device facts are dated, source-linked, and separated from insurance considerations. Unknowns remain visible instead of becoming confident-looking guesses.</p>
            <Link className="text-action" href="/index">Explore the intelligence model</Link>
          </div>
        </section>
        <section className="manifesto-section" aria-labelledby="manifesto-title">
          <p className="eyebrow">Manifesto</p>
          <h2 id="manifesto-title">The future should be useful before it asks who you are.</h2>
          <div className="manifesto-grid">
            <p>Start with the concern. Explain cause and effect. Show a few defensible options—not a wall of affiliate links.</p>
            <p>Recommendations are not decisions. Decisions are not purchases. Purchases are not installation or verification.</p>
            <p>SmartDevices is independent. Insurance prevention is our opening use case, not the edge of the category.</p>
          </div>
        </section>
        <section className="partnership-cta">
          <div><p className="eyebrow">Make a practical plan</p><h2>Start with the problem your device needs to solve.</h2></div>
          <Link className="button-primary" href="/protect/home?concern=water">Plan water protection</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
