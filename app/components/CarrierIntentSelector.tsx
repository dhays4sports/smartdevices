"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import Link from "next/link";
import { canonicalCarrierHref, carrierCategories } from "@/app/lib/carrier-route";
import { DisabledCarrierJourneyEventAdapter, carrierJourneyReducer, initialCarrierJourney } from "@/app/lib/carrier-journey";
import type { CarrierIntent } from "@/app/lib/carrier-contract";
import type { CarrierCategory, CarrierContext, ProCarrierData } from "@/app/lib/carrier";
import type { Device } from "@/app/lib/data";
import { CarrierScan } from "./CarrierScan";
import { CarrierProtectionMap } from "./CarrierProtectionMap";

const categoryLabels: Record<CarrierCategory, string> = { water: "Water detection + shutoff", gas: "Automatic gas shutoff", security: "Fire + security monitoring", "connected-home": "Connected-home control" };
const events = new DisabledCarrierJourneyEventAdapter();

export function CarrierIntentSelector({ initialIntent, initialCategory, carrierId, carrierName, canonicalPath, carrierData, publishedDevices, reviewDate }: { initialIntent?: CarrierIntent; initialCategory?: CarrierCategory; carrierId: string; carrierName: string; canonicalPath: string; carrierData: ProCarrierData; publishedDevices: Device[]; reviewDate: string }) {
  const intents = useMemo<Array<{ id: CarrierIntent; title: string; description: string }>>(() => [
    { id: "requirement", title: `${carrierName} mentioned a device`, description: "Help me understand what kind and what to confirm." },
    { id: "discounts", title: "I’m checking for possible savings", description: "Show me the device categories Farmers currently publishes." },
    { id: "recommendations", title: "I want protection recommendations", description: "Help me make my home safer, independent of insurance." },
  ], [carrierName]);
  const [state, dispatch] = useReducer(carrierJourneyReducer, initialCarrierJourney(initialIntent, initialCategory));
  const [completedContext, setCompletedContext] = useState<CarrierContext | null>(null);

  useEffect(() => {
    const restore = () => {
      const query = new URLSearchParams(window.location.search);
      const intent = intents.some((item) => item.id === query.get("intent")) ? query.get("intent") as CarrierIntent : undefined;
      const category = carrierCategories.includes(query.get("category") as CarrierCategory) ? query.get("category") as CarrierCategory : undefined;
      dispatch({ type: "RESTORE", intent, category });
    };
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [intents]);
  useEffect(() => {
    if (state.stage === "intent") return;
    window.requestAnimationFrame(() => document.getElementById("carrier-journey")?.scrollIntoView({ block: "start" }));
  }, [state.stage]);

  function selectIntent(intent: CarrierIntent) {
    setCompletedContext(null);
    dispatch({ type: "SELECT_INTENT", intent });
    window.history.pushState({}, "", canonicalCarrierHref({ intent }, canonicalPath));
    void events.record({ name: "carrier_intent_selected", occurredAt: new Date().toISOString(), intent });
  }
  function selectCategory(category: CarrierCategory) {
    if (!state.intent) return;
    setCompletedContext(null);
    dispatch({ type: "SELECT_CATEGORY", category });
    window.history.pushState({}, "", canonicalCarrierHref({ intent: state.intent, category }, canonicalPath));
    void events.record({ name: "carrier_category_selected", occurredAt: new Date().toISOString(), intent: state.intent, category });
  }
  function startScan() {
    if (!state.intent || !state.category) return;
    dispatch({ type: "START_SCAN" });
    void events.record({ name: "carrier_scan_started", occurredAt: new Date().toISOString(), intent: state.intent, category: state.category });
  }
  if (state.stage === "scan" && state.intent && state.category) return <div id="carrier-journey"><CarrierScan intent={state.intent} category={state.category} carrierId={carrierId} onBack={() => dispatch({ type: "BACK" })} onComplete={(context) => { setCompletedContext(context); dispatch({ type: "SHOW_RESULTS" }); }} /></div>;
  if (state.stage === "results" && completedContext) return <div id="carrier-journey"><CarrierProtectionMap context={completedContext} onReview={() => dispatch({ type: "BACK" })} carrierData={carrierData} publishedDevices={publishedDevices} reviewDate={reviewDate} /></div>;

  if (state.stage === "intent") return <section id="carrier-journey" className="carrier-start carrier-decision" aria-labelledby="carrier-start-heading">
    <div className="decision-heading"><p className="eyebrow">One quick question</p><h2 id="carrier-start-heading">What brought you here?</h2><p>Choose the closest answer. You won’t need to enter contact information or policy details.</p></div>
    <div className="intent-preview-grid">{intents.map((intent) => <button key={intent.id} type="button" className="intent-preview" onClick={() => selectIntent(intent.id)}><strong>{intent.title}</strong><small>{intent.description}</small><span aria-hidden="true">→</span></button>)}</div>
  </section>;

  return <section id="carrier-journey" className="carrier-start carrier-decision" aria-labelledby="carrier-category-heading">
    <button className="decision-back" type="button" onClick={() => dispatch({ type: "BACK" })}>← Back</button>
    <div className="decision-heading"><p className="eyebrow">Choose the closest match</p><h2 id="carrier-category-heading">What kind of device did they mention?</h2><p>It’s okay if you only remember the general area.</p></div>
    <fieldset className="category-choice-grid"><legend className="sr-only">Device category</legend>{carrierCategories.map((category) => <label key={category} className={state.category === category ? "category-choice is-active" : "category-choice"}><input type="radio" name="carrier-category" value={category} checked={state.category === category} onChange={() => selectCategory(category)} /><span><strong>{categoryLabels[category]}</strong><small>{category === "water" ? "Leak detection or an automatic main-line shutoff" : category === "gas" ? "A valve that responds to a triggering event" : category === "security" ? "Fire, burglary or professional monitoring" : "Remote monitoring, control or a connected-home system"}</small></span></label>)}</fieldset>
    <div className="decision-actions"><button className="button-primary" type="button" disabled={!state.category} onClick={startScan}>Continue</button><Link className="text-action" href="/protect/home">I’m not sure—show me general guidance</Link></div>
  </section>;
}
