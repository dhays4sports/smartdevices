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
        <ProtectionExplorer publishedDevices={bundle.catalog} />
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
          <div><p className="eyebrow">Strategic partnerships</p><h2>Bring trusted device intelligence into a protection conversation.</h2></div>
          <Link className="button-primary" href="/partners">Partnership access</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
