import Link from "next/link";
import { evidenceIsCurrent, type CarrierCategory, type ProCarrierData } from "@/app/lib/carrier";
import type { Device } from "@/app/lib/data";

const categoryClasses: Record<CarrierCategory, string[]> = {
  water: ["whole-home-flow-monitoring", "automatic-main-water-shutoff", "point-water-detection"],
  gas: ["automatic-gas-shutoff"],
  security: ["professionally-monitored-fire-security", "local-fire-alert"],
  "connected-home": ["connected-home-remote-monitor-control"],
};

export function CarrierDeviceOptions({ category, carrierId, jurisdiction, carrierData, publishedDevices, reviewDate }: { category: CarrierCategory; carrierId: string; jurisdiction: string; carrierData: ProCarrierData; publishedDevices: Device[]; reviewDate: string }) {
  const carrierName = carrierData.carriers.find((item) => item.id === carrierId)?.name ?? "Carrier";
  const fits = carrierData.fits.filter((fit) => fit.carrierId === carrierId && fit.jurisdiction === jurisdiction && evidenceIsCurrent(fit, reviewDate) && fit.fit !== "not-applicable" && fit.classIds.some((id) => categoryClasses[category].includes(id)));
  const records = fits.map((fit) => ({ fit, device: publishedDevices.find((device) => device.id === fit.deviceId) })).filter((item) => item.device);
  return <section id="recommended-setup" className="carrier-device-options" aria-labelledby="carrier-options-heading"><div className="section-heading"><div><p className="eyebrow">Recommended setup</p><h2 id="carrier-options-heading">{records.length ? records.length === 1 ? "One well-supported place to start." : "A short list worth comparing." : "Confirm the required capability before choosing a product."}</h2><p>{records.length ? "These products match the technical capability shown above. Carrier eligibility still requires confirmation." : `We do not have enough current evidence to give a product-level ${carrierName} designation.`}</p></div>{records.length >= 2 ? <Link className="button-subtle" href={`/compare?items=${records.map((item) => item.device?.id).join(",")}&carrier=${encodeURIComponent(carrierId)}&jurisdiction=${encodeURIComponent(jurisdiction)}`}>Compare options</Link> : null}</div>{records.length ? <ol>{records.map(({ fit, device }) => device ? <li key={fit.id}><div><span className="fit-label">{fit.fit === "explicitly-named-public-offer" ? `${carrierName} public offer` : "Matches the published capability"}</span><h3>{device.manufacturer} {device.model}</h3><p>{device.summary}</p><small>{fit.limitations[0]}</small></div><div><span>{device.commercialStatus === "none" ? "No paid placement" : device.commercialStatus}</span><span className={device.availability === "unavailable" ? "availability-unavailable" : ""}>Availability: {device.availability}</span><Link className="text-action" href={`/devices/${device.slug}`}>See setup details</Link></div></li> : null)}</ol> : <div className="carrier-class-only"><strong>Product choice still needs confirmation.</strong><p>Ask about the exact capability, installation, monitoring and documentation before purchasing.</p></div>}</section>;
}
