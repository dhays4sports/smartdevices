"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DeviceCard } from "./DeviceCard";
import { domains, type Device, type DomainId } from "@/app/lib/data";
import { createLocalPlan, encodePlanSelection } from "@/app/lib/plan";
import { persistLocalPlan } from "@/app/lib/local-plan-store";
import { canonicalCapabilitiesForDevice, deviceCapabilities } from "@/app/lib/device-capabilities";

type Props = { initialDomain?: string; initialConcern?: string; publishedDevices: Device[] };

export function DeviceLibrary({ initialDomain = "all", initialConcern = "", publishedDevices }: Props) {
  const [capability, setCapability] = useState("");
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
    return publishedDevices.filter((device) => {
      if (capability && !canonicalCapabilitiesForDevice(device).some((item) => item.id === capability)) return false;
      if (domain !== "all" && !device.domains.includes(domain as DomainId)) return false;
      if (concern && !device.concerns.includes(concern)) return false;
      if (!needle) return true;
      return [device.manufacturer, device.model, device.solution, device.summary, ...device.capabilities, ...canonicalCapabilitiesForDevice(device).map((item) => item.id)]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [query, domain, concern, capability, publishedDevices]);

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
  const planDomain = domain === "all" ? publishedDevices.find((device) => plan.includes(device.id))?.domains[0] ?? "home" : domain;
  const planConcern = concern || publishedDevices.find((device) => plan.includes(device.id))?.concerns[0] || "water";
  function openPlan() {
    if (!plan.length) return;
    const safetyPlan = createLocalPlan(planDomain as DomainId, planConcern, plan);
    persistLocalPlan(safetyPlan);
    window.location.assign(`/plans/${safetyPlan.id}?${encodePlanSelection(safetyPlan)}`);
  }

  return (
    <section className="library-shell">
      <div className="library-controls">
        <label><span>Capability</span><select aria-label="Capability" value={capability} onChange={(event) => setCapability(event.target.value)}><option value="">All capabilities</option>{deviceCapabilities.filter((item) => publishedDevices.some((device) => canonicalCapabilitiesForDevice(device).some((binding) => binding.id === item.id))).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <label className="search-field">
          <span>Search source-linked device information</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try water shutoff, temperature, or measure.temperature" />
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
      {!filtered.length ? <div className="empty-state"><p>No source-linked record matches those filters.</p><button type="button" onClick={() => { setQuery(""); setDomain("all"); setConcern(""); setCapability(""); }}>Clear filters</button></div> : null}
      <aside className={compare.length || plan.length ? "library-dock has-items" : "library-dock"}>
        <div><strong>{compare.length} comparing</strong><span> · </span><strong>{plan.length} in plan</strong></div>
        <div>
          <Link className={compare.length >= 2 ? "button-subtle" : "button-subtle is-disabled"} aria-disabled={compare.length < 2} href={compare.length >= 2 ? compareHref : "#"}>Compare</Link>
          <button className="button-primary" type="button" disabled={!plan.length} onClick={openPlan}>Build plan</button>
        </div>
      </aside>
    </section>
  );
}
