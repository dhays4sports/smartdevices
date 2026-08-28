"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DeviceCard } from "./DeviceCard";
import { devices, domains, type Device, type DomainId } from "@/app/lib/data";

type Props = { initialDomain?: string; initialConcern?: string };

export function DeviceLibrary({ initialDomain = "all", initialConcern = "" }: Props) {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState(initialDomain);
  const [concern, setConcern] = useState(initialConcern);
  const [compare, setCompare] = useState<string[]>([]);
  const [plan, setPlan] = useState<string[]>([]);

  const availableConcerns = useMemo(
    () => (domain === "all" ? domains.flatMap((item) => item.concerns) : domains.find((item) => item.id === domain)?.concerns ?? []),
    [domain],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return devices.filter((device) => {
      if (domain !== "all" && !device.domains.includes(domain as DomainId)) return false;
      if (concern && !device.concerns.includes(concern)) return false;
      if (!needle) return true;
      return [device.manufacturer, device.model, device.solution, device.summary, ...device.capabilities]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [query, domain, concern]);

  function toggleCompare(device: Device) {
    setCompare((items) =>
      items.includes(device.id) ? items.filter((id) => id !== device.id) : [...items, device.id].slice(-3),
    );
  }

  function togglePlan(device: Device) {
    setPlan((items) =>
      items.includes(device.id) ? items.filter((id) => id !== device.id) : [...items, device.id].slice(-5),
    );
  }

  const compareHref = `/compare?items=${compare.join(",")}`;
  const planDomain = domain === "all" ? devices.find((device) => plan.includes(device.id))?.domains[0] ?? "home" : domain;
  const planConcern = concern || devices.find((device) => plan.includes(device.id))?.concerns[0] || "water";
  const planHref = `/plans/library?domain=${planDomain}&concern=${planConcern}&items=${plan.join(",")}`;

  return (
    <section className="library-shell">
      <div className="library-controls">
        <label className="search-field">
          <span>Search verified device information</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try water shutoff, dash camera, or temperature" />
        </label>
        <label>
          <span>Environment</span>
          <select value={domain} onChange={(event) => { setDomain(event.target.value); setConcern(""); }}>
            <option value="all">All environments</option>
            {domains.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
        <label>
          <span>Concern</span>
          <select value={concern} onChange={(event) => setConcern(event.target.value)}>
            <option value="">All concerns</option>
            {availableConcerns.map((item) => <option key={`${domain}-${item.id}`} value={item.id}>{item.label}</option>)}
          </select>
        </label>
      </div>
      <div className="library-status" aria-live="polite">
        <p><strong>{filtered.length}</strong> reviewed devices</p>
        <p>Facts are dated. Unknowns stay unknown. Sponsored status never changes editorial order.</p>
      </div>
      <div className="device-grid">
        {filtered.map((device) => (
          <DeviceCard
            key={device.id}
            device={device}
            selected={plan.includes(device.id)}
            compareSelected={compare.includes(device.id)}
            onAdd={togglePlan}
            onCompare={toggleCompare}
          />
        ))}
      </div>
      {!filtered.length ? <div className="empty-state"><p>No verified record matches those filters.</p><button type="button" onClick={() => { setQuery(""); setDomain("all"); setConcern(""); }}>Clear filters</button></div> : null}
      <aside className={compare.length || plan.length ? "library-dock has-items" : "library-dock"}>
        <div><strong>{compare.length} comparing</strong><span> · </span><strong>{plan.length} in plan</strong></div>
        <div>
          <Link className={compare.length >= 2 ? "button-subtle" : "button-subtle is-disabled"} aria-disabled={compare.length < 2} href={compare.length >= 2 ? compareHref : "#"}>Compare</Link>
          <Link className={plan.length ? "button-primary" : "button-primary is-disabled"} aria-disabled={!plan.length} href={plan.length ? planHref : "#"}>Build plan</Link>
        </div>
      </aside>
    </section>
  );
}

