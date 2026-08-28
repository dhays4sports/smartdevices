"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CarrierRecord } from "@/app/lib/carrier";

export function CarrierDirectory({ carriers }: { carriers: CarrierRecord[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return carriers;
    return carriers.filter((carrier) => carrier.name.toLowerCase().includes(normalized));
  }, [carriers, query]);

  return (
    <section className="carrier-directory" aria-labelledby="carrier-directory-title">
      <div className="carrier-search">
        <label htmlFor="carrier-search-input"><span>Find your insurer</span><small>No contact information needed.</small></label>
        <input id="carrier-search-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Start typing a carrier name" autoComplete="off" />
      </div>
      <div className="carrier-results" aria-live="polite">
        <p id="carrier-directory-title" className="result-count">{filtered.length} verified public guidance {filtered.length === 1 ? "destination" : "destinations"}</p>
        {filtered.length ? (
          <ul>
            {filtered.map((carrier) => (
              <li key={carrier.id}>
                <div><span className="carrier-state">California pilot</span><h2>{carrier.name}</h2><p>Review current public device categories, evidence scope, independent recommendations, and what still needs confirmation.</p></div>
                <Link className="button-primary" href={carrier.canonicalPath}>Open {carrier.name} guidance</Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="carrier-empty">
            <span aria-hidden="true">?</span>
            <div><h2>We haven’t published that carrier yet.</h2><p>Use SmartDevices’ independent protection guides now, then confirm any carrier-specific requirement or possible discount directly with the carrier or a licensed professional.</p><Link className="button-subtle" href="/protect/home">Explore Home protection</Link></div>
          </div>
        )}
      </div>
    </section>
  );
}
