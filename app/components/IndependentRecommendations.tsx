import Link from "next/link";
import type { CarrierCategory } from "@/app/lib/carrier";
import { independentRecommendations } from "@/app/lib/independent-recommendations";

export function IndependentRecommendations({ category, carrierName }: { category: CarrierCategory; carrierName: string }) {
  const records = independentRecommendations(category);
  return <section className="independent-recommendations" aria-labelledby="independent-recommendations-heading"><div><p className="eyebrow">Independent editorial guidance</p><h2 id="independent-recommendations-heading">SmartDevices recommended · not a {carrierName} requirement or discount determination.</h2><p>These options come from the independent protection library. Carrier context does not change their generic facts, and no insurer surveillance is implied.</p></div>{records.length ? <ul>{records.map((device) => device ? <li key={device.id}><div><strong>{device.manufacturer} {device.model}</strong><span>{device.solution}</span></div><Link className="text-action" href={`/devices/${device.slug}`}>Review independent record</Link></li> : null)}</ul> : <p className="empty-area">No additional product is being forced into this result. The class guide and confirmation steps remain useful.</p>}<Link className="text-action" href="/protect/vehicle">Explore independent Vehicle protection</Link></section>;
}
