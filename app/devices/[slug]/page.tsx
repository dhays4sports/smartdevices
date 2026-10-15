import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { formatReviewed } from "@/app/lib/data";
import { evidenceIsCurrent } from "@/app/lib/carrier";
import { getPublishedEvidenceBundle } from "@/app/lib/evidence-store";
import { catalogDeviceToSmartDeviceObject } from "@/app/lib/device-domain";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const bundle = await getPublishedEvidenceBundle();
  const { slug } = await params;
  const device = bundle.catalog.find((item) => item.slug === slug);
  return { title: device ? `${device.manufacturer} ${device.model}` : "Device record" };
}

export default async function DevicePage({ params }: Props) {
  const bundle = await getPublishedEvidenceBundle();
  const { slug } = await params;
  const device = bundle.catalog.find((item) => item.slug === slug);
  if (!device) notFound();
  const today = new Date().toISOString().slice(0, 10);
  const canonical = catalogDeviceToSmartDeviceObject(device);
  const carrierFits = bundle.fits.filter((fit) => fit.deviceId === device.id && fit.carrierId === "farmers" && fit.jurisdiction === "CA" && evidenceIsCurrent(fit, today));
  return <><SiteHeader /><main className="page-main detail-page">
    <header className="detail-hero"><div><p className="eyebrow">{device.solution} · {device.commercialStatus === "none" ? "editorial record · no paid placement" : device.commercialStatus}</p><h1>{device.manufacturer} <span>{device.model}</span></h1><p>{device.summary}</p></div><div className="evidence-stamp"><span>Publication</span><strong>{device.editorialStatus}</strong><span>Product</span><strong>{device.status}</strong><span>Availability</span><strong>{device.availability}</strong><span>Last reviewed</span><strong>{formatReviewed(device.lastReviewed)}</strong></div></header>
    <section className="detail-grid">
      <article><h2>What it may help with</h2><p>{device.bestFor}</p><ul>{device.capabilities.map((item) => <li key={item}>{item}</li>)}</ul></article>
      <article><h2>Practical fit</h2><dl className="device-facts"><div><dt>Cost</dt><dd>{device.priceBand}</dd></div><div><dt>Installation</dt><dd>{device.installation}</dd></div><div><dt>Subscription</dt><dd>{device.subscription}</dd></div><div><dt>Connectivity</dt><dd>{device.connectivity}</dd></div><div><dt>Monitoring</dt><dd>{device.monitoring}</dd></div></dl></article>
      <article><h2>Limitations</h2><ul>{device.limitations.map((item) => <li key={item}>{item}</li>)}</ul><p className="safety-note">{device.insuranceNote}</p></article>
      <article><h2>Primary sources</h2><p>These links support product facts, not an endorsement or a promise that every detail remains current.</p><ul className="source-list">{device.sources.map((source) => <li key={source.url}><a href={source.url} rel="noreferrer" target="_blank">{source.title}<span>↗</span></a></li>)}</ul></article>
      <article><h2>Machine-readable capability record</h2><p>Categories help people browse; normalized capabilities help devices and agents interoperate.</p><div className="device-capability-list">{canonical.capabilities.length ? canonical.capabilities.map((capability) => <div key={capability.id}><code>{capability.id}</code><span>{capability.label}</span></div>) : <p>No normalized capability has been assigned yet.</p>}</div><p className="safety-note">Trust state: <strong>{canonical.trust.state}</strong>. Source review does not imply ownership, instance verification, identity, permission, or control.</p><a className="text-action" href={`/api/devices/${device.slug}`}>View machine-readable record →</a></article>
    </section>
    {carrierFits.length ? <aside className="device-insurance-module"><div><p className="eyebrow">Insurance relevance · separate evidence</p><h2>Current California Farmers guidance references this capability.</h2><p>{carrierFits[0].fit === "explicitly-named-public-offer" ? "A current Farmers-controlled California page names a public offer involving this product." : "Manufacturer evidence supports a technical capability match. This is not Farmers product approval or an eligibility decision."}</p><small>Checked {carrierFits[0].checkedDate}. {carrierFits[0].limitations[0]}</small></div><Link className="button-subtle" href={`/farmers?intent=recommendations&category=${device.concerns.includes("water") ? "water" : "security"}`}>Review scoped guidance</Link></aside> : null}
    <div className="detail-actions"><Link className="button-subtle" href="/devices">Back to library</Link><Link className="button-primary" href={`/plans/device?domain=${device.domains[0]}&concern=${device.concerns[0]}&items=${device.id}`}>Start a plan with this device</Link></div>
  </main><SiteFooter /></>;
}
