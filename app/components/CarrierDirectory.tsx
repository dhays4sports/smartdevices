import Link from "next/link";
import type { CarrierRecord } from "@/app/lib/carrier";

export function CarrierDirectory({ carriers }: { carriers: CarrierRecord[] }) {
  return (
    <section className="carrier-directory" aria-labelledby="carrier-directory-title">
      <div className="carrier-results">
        <p id="carrier-directory-title" className="eyebrow">Available now</p>
        {carriers.length ? (
          <ul aria-label="Available insurer guidance">
            {carriers.map((carrier) => (
              <li key={carrier.id}>
                <div><span className="carrier-state">California</span><h2>{carrier.name}</h2><p>Get help with a device request, possible discount category or protection recommendation.</p></div>
                <Link className="button-primary" href={carrier.canonicalPath}>Continue with {carrier.name}</Link>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="carrier-empty">
          <div><h2>Don’t see your insurer?</h2><p>You can still use SmartDevices’ independent Home protection guide. Confirm carrier-specific details directly with your insurer or agent.</p><Link className="text-action" href="/protect/home">Explore Home protection</Link></div>
        </div>
      </div>
    </section>
  );
}
