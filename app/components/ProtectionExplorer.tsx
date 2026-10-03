"use client";

import Link from "next/link";
import { useEffect, useReducer, useRef, useState } from "react";
import { IntelligentScan } from "./IntelligentScan";
import { InteractiveScene } from "./InteractiveScene";
import { CausalDemo } from "./CausalDemo";
import { DeviceUniverse } from "./DeviceUniverse";
import { devices, devicesForConcern, domains, getDomain, type Device, type DomainId } from "@/app/lib/data";
import { initialJourney, journeyReducer } from "@/app/lib/experience";
import type { ScanResult } from "@/app/lib/scan";
import { createLocalPlan, encodePlanSelection } from "@/app/lib/plan";
import { demonstrationFor } from "@/app/lib/demo";
import { persistLocalPlan } from "@/app/lib/local-plan-store";
import { submitWaterShutoffShadow } from "@/app/lib/market/shadow-pilot";
import type { SponsoredFulfillmentPreview } from "@/app/lib/market/preview";
import { CommercialOptions } from "./CommercialOptions";

type Props = {
  initialDomain?: DomainId;
  initialConcern?: string;
  compact?: boolean;
  publishedDevices?: Device[];
};

const STORAGE_KEY = "smartdevices-plan-device-ids-v1";
const stageLabels = ["Choose", "Explore", "Personalize", "Results", "Plan"];

export function ProtectionExplorer({ initialDomain, initialConcern, compact = false, publishedDevices = devices }: Props) {
  const defaultConcern = initialDomain ? getDomain(initialDomain)?.concerns[0]?.id : undefined;
  const [journey, dispatch] = useReducer(journeyReducer, initialJourney(initialDomain, initialConcern ?? (compact ? defaultConcern : undefined)));
  const domain = journey.domainId ? getDomain(journey.domainId) : undefined;
  const concern = domain?.concerns.find((item) => item.id === journey.concernId);
  const [planIds, setPlanIds] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectionNotice, setSelectionNotice] = useState("");
  const [marketPreview, setMarketPreview] = useState<SponsoredFulfillmentPreview | null>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function restoreFromHistory() {
      const match = window.location.pathname.match(/^\/protect\/(home|vehicle|family|business)$/);
      const restoredDomain = match?.[1] as DomainId | undefined;
      const concernId = new URLSearchParams(window.location.search).get("concern") ?? undefined;
      dispatch({ type: "RESTORE", domainId: restoredDomain, concernId });
    }
    window.addEventListener("popstate", restoreFromHistory);
    return () => window.removeEventListener("popstate", restoreFromHistory);
  }, []);

  useEffect(() => {
    if (journey.stage !== "entry") workspaceRef.current?.focus({ preventScroll: true });
  }, [journey.revision, journey.stage]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(planIds));
    } catch {
      // A local draft is a convenience and never the authoritative hosted plan.
    }
  }, [planIds]);

  const recommendations = journey.domainId && concern
    ? devicesForConcern(journey.domainId, concern.id, publishedDevices)
    : [];
  const demonstration = journey.domainId && concern ? demonstrationFor(journey.domainId, concern.id) : null;

  function chooseDomain(domainId: DomainId) {
    if (domainId === "home") { window.location.assign("/protect/home"); return; }
    setPlanIds([]);
    setScanResult(null);
    setMarketPreview(null);
    dispatch({ type: "SELECT_DOMAIN", domainId });
    window.history.pushState({}, "", `/protect/${domainId}`);
  }

  function chooseConcern(concernId: string) {
    setPlanIds([]);
    setScanResult(null);
    setMarketPreview(null);
    dispatch({ type: "SELECT_CONCERN", concernId });
    if (journey.domainId) window.history.pushState({}, "", `/protect/${journey.domainId}?concern=${encodeURIComponent(concernId)}`);
  }

  function restart() {
    setPlanIds([]);
    setScanResult(null);
    setMarketPreview(null);
    dispatch({ type: "RESTART" });
    window.history.pushState({}, "", "/");
  }

  function togglePlan(device: Device) {
    setPlanIds((current) => {
      if (current.includes(device.id)) {
        setSelectionNotice(`${device.manufacturer} ${device.model} removed from the plan draft.`);
        return current.filter((id) => id !== device.id);
      }
      if (current.length >= 5) {
        setSelectionNotice("The plan is limited to five priorities. Remove one before adding another.");
        return current;
      }
      setSelectionNotice(`${device.manufacturer} ${device.model} added as your stated selection.`);
      return [...current, device.id];
    });
  }

  function createPlanHref() {
    if (!journey.domainId || !concern || !planIds.length) return null;
    const plan = createLocalPlan(journey.domainId, concern.id, planIds, "consumer-explorer", scanResult ?? undefined);
    persistLocalPlan(plan);
    return `/plans/${plan.id}?${encodePlanSelection(plan)}`;
  }

  async function copyPlan() {
    const planHref = createPlanHref();
    if (!planHref) return;
    const url = new URL(planHref, window.location.origin).toString();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.assign(planHref);
    }
  }

  function openPlan() {
    const planHref = createPlanHref();
    if (!planHref) return;
    dispatch({ type: "GENERATE_PLAN" });
    window.location.assign(planHref);
  }

  const progressIndex = journey.stage === "entry" ? 0 : journey.stage === "domain-selected" || journey.stage === "concern-explored" ? 1 : journey.stage === "scan-in-progress" ? 2 : journey.stage === "results-ready" ? 3 : 4;

  return (
    <section className={compact ? "explorer explorer-compact" : "explorer"} aria-labelledby="explorer-title">
      <div className="experience-entry" id="protection-entry" tabIndex={-1}>
        <p className="eyebrow">Smart Protection Explorer</p>
        <h1 id="explorer-title">Make the things around you smarter.</h1>
        <p className="hero-lede">Choose a concern, understand what can help, and leave with a small, source-linked plan—or build the device you wish existed.</p>
        <div className="hero-entry-actions">
          <a className="button-primary hero-action" href="#domain-chooser">Show us what you’re protecting.</a>
          <Link className="button-subtle hero-build-action" href="/build">Build a smart device →</Link>
          <div className="hero-domain-shortcuts" aria-label="Choose what you are protecting">
            {domains.map((item) => <button key={item.id} type="button" onClick={() => chooseDomain(item.id)}>{item.label}</button>)}
          </div>
        </div>
        <nav className="hero-utility-links" aria-label="Quick access">
          <Link href="/insurance">My insurer mentioned a device <span aria-hidden="true">→</span></Link>
          <Link href="/build">I have a device idea</Link>
          <Link href="/devices">Research a device</Link>
          <Link href="/my-plan">Return to my plan</Link>
        </nav>
        <p className="hero-trust-line"><span>Source-linked</span><span>Dated guidance</span><span>Unknowns stay visible</span></p>
      </div>

      <nav className="journey-progress" aria-label="Protection journey">
        {stageLabels.map((label, index) => <span key={label} className={index === progressIndex ? "is-current" : index < progressIndex ? "is-complete" : ""} aria-current={index === progressIndex ? "step" : undefined}>{label}</span>)}
      </nav>

      <section className="domain-chooser" id="domain-chooser" aria-labelledby="domain-heading">
        <div className="section-heading">
          <div><p className="eyebrow">Choose an environment</p><h2 id="domain-heading">What are you protecting?</h2></div>
          {journey.stage !== "entry" ? <button className="button-subtle" type="button" onClick={restart}>Start over</button> : null}
        </div>
        <div className="domain-choice-grid">
          {domains.map((item) => {
            const full = item.id === "home" || item.id === "vehicle";
            return (
              <button key={item.id} className={item.id === journey.domainId ? "domain-choice is-active" : "domain-choice"} type="button" aria-pressed={item.id === journey.domainId} onClick={() => chooseDomain(item.id)}>
                <span className="domain-choice-status">{full ? "Interactive guide" : "Starter guide"}</span>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
                <span className="domain-choice-action">{full ? "Explore protection areas" : "Open starter guidance"} →</span>
              </button>
            );
          })}
        </div>
      </section>

      {domain ? (
        <>
          <div className="experience-toolbar" ref={workspaceRef} tabIndex={-1}>
            <button className="button-subtle" type="button" onClick={() => dispatch({ type: "BACK" })}>Back</button>
            <span>{domain.label} · {journey.stage === "domain-selected" ? "Choose a protection area" : concern?.label}</span>
            <Link href="/devices">Exit to Device Library</Link>
          </div>

          {domain.id === "home" || domain.id === "vehicle" ? (
            <InteractiveScene key={domain.id} domain={domain} concern={concern} revision={journey.revision} onSelect={chooseConcern} />
          ) : (
            <section className="starter-scene" aria-labelledby="starter-heading">
              <div><p className="eyebrow">{domain.label} starter guide</p><h2 id="starter-heading">Useful guidance without false feature parity.</h2><p>{domain.description}</p></div>
              <div className="starter-concerns">{domain.concerns.map((item) => <button key={item.id} className={item.id === concern?.id ? "button-primary" : "button-subtle"} type="button" onClick={() => chooseConcern(item.id)}>{item.label}</button>)}</div>
            </section>
          )}
        </>
      ) : null}

      {concern && domain ? (
        <>
          <section className="insight-panel" aria-live="polite" aria-labelledby="concern-heading">
            <div className="insight-heading"><div><p className="eyebrow">{domain.label} · {concern.label}</p><h2 id="concern-heading">{concern.prompt}</h2><p>{concern.why}</p></div></div>
            <ol className="cause-sequence">{concern.stages.map((stage, index) => <li key={stage}><span>{String(index + 1).padStart(2, "0")}</span><strong>{stage}</strong></li>)}</ol>
            <p className="safety-note">Illustrative behavior only. Device performance, connectivity, installation, and response vary. No product guarantees loss prevention, recovery, insurance eligibility, or a claim outcome.</p>
            {domain.id === "home" || domain.id === "vehicle" ? <button className="button-primary insight-action" type="button" onClick={() => dispatch({ type: "START_SCAN" })}>Personalize this guidance</button> : <Link className="button-primary insight-action" href={`/devices?domain=${domain.id}&concern=${concern.id}`}>Open starter guidance</Link>}
          </section>

          {demonstration ? <CausalDemo key={`${demonstration.id}-${journey.revision}`} config={demonstration} /> : null}

          {journey.stage === "scan-in-progress" ? <IntelligentScan domainId={domain.id} concernId={concern.id} publishedDevices={publishedDevices} onBack={() => dispatch({ type: "BACK" })} onComplete={(result) => {
            setScanResult(result);
            const previewRequested = new URLSearchParams(window.location.search).get("marketPreview") === "1";
            void submitWaterShutoffShadow(result, { previewRequested }).then((preview) => { if (previewRequested) setMarketPreview(preview); });
            dispatch({ type: "SHOW_RESULTS" });
          }} /> : null}

          {journey.stage === "results-ready" && scanResult ? <section className="recommendation-section" aria-labelledby="matched-heading">
            <div className="section-heading"><div><p className="eyebrow">Your Protection Map</p><h2 id="matched-heading">{recommendations.length ? "A small, source-linked starting set." : "The category guidance is ready; verified products are still being curated."}</h2><p>Priority bands explain sequence, not a safety score. Nothing below is preselected.</p></div><Link className="text-action" href={`/devices?domain=${domain.id}&concern=${concern.id}`}>Open full library</Link></div>
            {scanResult.unknowns.length ? <div className="result-unknowns"><strong>Still unknown</strong><ul>{scanResult.unknowns.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
            <DeviceUniverse result={scanResult} selectedIds={planIds} onTogglePlan={togglePlan} />
            <CommercialOptions preview={marketPreview} qualifiedDevices={scanResult.recommendations.map((item) => item.device)} />
          </section> : null}
        </>
      ) : null}

      {concern ? (
        <aside className={planIds.length ? "plan-dock has-items" : "plan-dock"} aria-label="Smart Safety Plan summary">
          <div><span className="plan-count">{planIds.length}</span><div><strong>Your Smart Safety Plan</strong><small>{planIds.length ? "Recommendations remain separate from your choices." : "Add up to five useful options."}</small></div></div>
          <p className="sr-only" aria-live="polite">{selectionNotice}</p>
          <div className="plan-dock-actions"><button className="button-subtle" type="button" disabled={!planIds.length} onClick={copyPlan}>{copied ? "Link copied" : "Copy plan link"}</button><button className="button-primary" type="button" disabled={!planIds.length} onClick={openPlan}>View plan</button></div>
        </aside>
      ) : null}
    </section>
  );
}
