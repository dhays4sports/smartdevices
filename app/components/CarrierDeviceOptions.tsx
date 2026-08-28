import Link from "next/link";
import { deviceCarrierFits, evidenceIsCurrent, getCarrier, type CarrierCategory } from "@/app/lib/carrier";
import { getDeviceById } from "@/app/lib/data";

const categoryClasses: Record<CarrierCategory, string[]> = {
  water: ["whole-home-flow-monitoring", "automatic-main-water-shutoff", "point-water-detection"],
  gas: ["automatic-gas-shutoff"],
  security: ["professionally-monitored-fire-security", "local-fire-alert"],
  "connected-home": ["connected-home-remote-monitor-control"],
};

export function CarrierDeviceOptions({ category, carrierId, jurisdiction }: { category: CarrierCategory; carrierId: string; jurisdiction: string }) {
  const carrierName = getCarrier(carrierId)?.name ?? "Carrier";
  const fits = deviceCarrierFits.fits.filter((fit) => fit.carrierId === carrierId && fit.jurisdiction === jurisdiction && evidenceIsCurrent(fit) && fit.fit !== "not-applicable" && fit.classIds.some((id) => categoryClasses[category].includes(id)));
  const records = fits.map((fit) => ({ fit, device: getDeviceById(fit.deviceId) })).filter((item) => item.device);
  return <section className="carrier-device-options" aria-labelledby="carrier-options-heading"><div className="section-heading"><div><p className="eyebrow">Device options · separate overlay</p><h2 id="carrier-options-heading">{records.length ? "A small evidence-led set." : "Class guidance is stronger than the product evidence."}</h2><p>Technical capability and carrier treatment remain separate. We do not force three products when evidence supports fewer.</p></div>{records.length >= 2 ? <Link className="button-subtle" href={`/compare?items=${records.map((item) => item.device?.id).join(",")}&carrier=${encodeURIComponent(carrierId)}&jurisdiction=${encodeURIComponent(jurisdiction)}`}>Compare these options</Link> : null}</div>{records.length ? <ol>{records.map(({ fit, device }) => device ? <li key={fit.id}><div><span className="fit-label">{fit.fit === "explicitly-named-public-offer" ? `${carrierName} public offer` : "Meets the published capability description"}</span><h3>{device.manufacturer} {device.model}</h3><p>{device.summary}</p><small>{fit.limitations[0]}</small></div><div><span>{device.commercialStatus === "none" ? "Editorial · no paid placement" : device.commercialStatus}</span><span className={device.availability === "unavailable" ? "availability-unavailable" : ""}>Availability: {device.availability}</span><Link className="text-action" href={`/devices/${device.slug}`}>Review device facts</Link></div></li> : null)}</ol> : <div className="carrier-class-only"><strong>No product-level {carrierName} designation is published.</strong><p>Use the capability guide and confirm listing, installation, monitoring, documentation, and carrier treatment before choosing a product.</p></div>}</section>;
}
