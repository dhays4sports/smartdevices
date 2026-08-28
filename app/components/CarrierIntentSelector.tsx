"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { canonicalCarrierHref, carrierCategories } from "@/app/lib/carrier-route";
import { DisabledCarrierJourneyEventAdapter, carrierJourneyReducer, initialCarrierJourney } from "@/app/lib/carrier-journey";
import type { CarrierIntent } from "@/app/lib/carrier-contract";
import type { CarrierCategory } from "@/app/lib/carrier";
import type { CarrierContext } from "@/app/lib/carrier";
import { CarrierScan } from "./CarrierScan";
import { CarrierProtectionMap } from "./CarrierProtectionMap";

const categoryLabels: Record<CarrierCategory, string> = { water: "Water detection + shutoff", gas: "Automatic gas shutoff", security: "Fire + security monitoring", "connected-home": "Connected-home control" };
const events = new DisabledCarrierJourneyEventAdapter();

export function CarrierIntentSelector({ initialIntent, initialCategory, carrierId, carrierName, canonicalPath }: { initialIntent?: CarrierIntent; initialCategory?: CarrierCategory; carrierId: string; carrierName: string; canonicalPath: string }) {
  const intents = useMemo<Array<{ id: CarrierIntent; title: string; description: string }>>(() => [
    { id: "requirement", title: "I received a requirement", description: `Your statement stays separate from ${carrierName} public evidence.` },
    { id: "discounts", title: "Check possible discounts", description: "See current public categories—not an eligibility result." },
    { id: "recommendations", title: "Explore recommendations", description: "Independent protection guidance remains clearly labeled." },
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
  function restart() { dispatch({ type: "RESTART" }); window.history.pushState({}, "", canonicalPath); }

  if (state.stage === "scan" && state.intent && state.category) return <CarrierScan intent={state.intent} category={state.category} carrierId={carrierId} onBack={() => dispatch({ type: "BACK" })} onComplete={(context) => { setCompletedContext(context); dispatch({ type: "SHOW_RESULTS" }); }} />;
  if (state.stage === "results" && completedContext) return <CarrierProtectionMap context={completedContext} onReview={() => dispatch({ type: "BACK" })} />;

  return <section className="carrier-start" aria-labelledby="carrier-start-heading">
    <div><p className="eyebrow">Choose your reason</p><h2 id="carrier-start-heading">What brought you here?</h2><p>No contact information, address, policy number, or free-text policy details are needed.</p></div>
    <div className="intent-preview-grid">{intents.map((intent, index) => <button key={intent.id} type="button" aria-pressed={state.intent === intent.id} className={state.intent === intent.id ? "intent-preview is-active" : "intent-preview"} onClick={() => selectIntent(intent.id)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{intent.title}</strong><small>{intent.description}</small></button>)}</div>
    {state.intent ? <div className="carrier-category-step"><div><p className="eyebrow">Choose an area</p><h3>What did the conversation concern?</h3></div><div>{carrierCategories.map((category) => <button type="button" key={category} className={state.category === category ? "is-active" : ""} onClick={() => selectCategory(category)}>{categoryLabels[category]}</button>)}</div><div className="category-actions"><button className="button-primary" type="button" disabled={!state.category} onClick={startScan}>Answer four useful questions</button><button className="button-subtle" type="button" onClick={restart}>Start over</button></div></div> : <button className="skip-carrier" type="button" onClick={restart}>Skip carrier guidance for now</button>}
  </section>;
}
