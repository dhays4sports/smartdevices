"use client";

import Link from "next/link";
import { carrierDisplayLabel } from "@/app/lib/carrier-contract";
import { deviceCarrierFits, evidenceSources, evaluateCarrierGuidance, getCarrier, type CarrierContext } from "@/app/lib/carrier";
import { CarrierDeviceOptions } from "./CarrierDeviceOptions";
import { CausalDemo } from "./CausalDemo";
import { demonstrations } from "@/app/lib/demo";
import { WaterInstallationChecklist } from "./WaterInstallationChecklist";
import { CarrierClassGuide } from "./CarrierClassGuide";
import { IndependentRecommendations } from "./IndependentRecommendations";
import { createCarrierPlan, encodePlanSelection } from "@/app/lib/plan";
import { persistLocalPlan } from "@/app/lib/local-plan-store";

export function CarrierProtectionMap({ context, onReview }: { context: CarrierContext; onReview: () => void }) {
  const carrierName = getCarrier(context.carrierId)?.name ?? "the selected carrier";
  const areaLabels = { assertion: "Start with the stated requirement", carrier: `Potentially relevant ${carrierName} category`, editorial: "SmartDevices protection recommendation", confirmation: "Still needs confirmation" } as const;
  const guidance = evaluateCarrierGuidance(context);
  const assertion = guidance.filter((item) => item.designation === "your-stated-requirement" || item.designation === "professional-stated-requirement");
  const carrier = guidance.filter((item) => item.designation === "carrier-public-offer" || item.designation === "potential-carrier-discount-category" || item.designation === "meets-published-capability-description");
  const editorial = guidance.filter((item) => item.designation === "smartdevices-recommended");
  const confirmation = guidance.filter((item) => item.designation === "confirmation-needed");
  if (context.unknowns.length && !confirmation.length) confirmation.push({ designation: "confirmation-needed", label: "Confirmation needed", category: context.category ?? "water", sourceIds: [], classIds: context.requestedCapabilityIds, deviceFitIds: [], why: "Some scan context remains unknown.", limitations: context.unknowns, confirmationSteps: ["Confirm the unknown items before relying on carrier treatment."], current: false });
  const areas = [
    { id: "assertion", items: assertion },
    { id: "carrier", items: carrier },
    { id: "editorial", items: editorial },
    { id: "confirmation", items: confirmation },
  ] as const;

  function buildPlan() {
    const fitDeviceIds = [...new Set(guidance.flatMap((item) => item.deviceFitIds).map((id) => deviceCarrierFits.fits.find((fit) => fit.id === id)?.deviceId).filter((id): id is string => Boolean(id)))];
    const plan = createCarrierPlan(context, fitDeviceIds);
    persistLocalPlan(plan);
    window.location.assign(`/plans/${plan.id}?${encodePlanSelection(plan)}`);
  }

  return <section className="carrier-map" aria-labelledby="carrier-map-heading">
    <div className="carrier-map-heading"><div><p className="eyebrow">Carrier Protection Map</p><h2 id="carrier-map-heading">Four truth states. No protection score.</h2><p>Each item explains why it appeared, who asserted it, which current source supports it, and what still needs confirmation.</p></div><button className="button-subtle" type="button" onClick={onReview}>Review answers</button></div>
    <div className="carrier-map-visual" aria-hidden="true">{areas.map((area, index) => <div key={area.id} className={area.items.length ? "is-addressed" : ""}><span>{String(index + 1).padStart(2, "0")}</span><strong>{areaLabels[area.id]}</strong><small>{area.items.length || "—"}</small></div>)}</div>
    <ol className="carrier-map-list">
      {areas.map((area) => <li key={area.id}><header><span>{area.items.length ? "Addressed" : "No current item"}</span><h3>{areaLabels[area.id]}</h3></header>{area.items.length ? area.items.map((item) => {
        const sources = item.sourceIds.map((id) => evidenceSources.sources.find((source) => source.id === id)).filter(Boolean);
        const fits = item.deviceFitIds.map((id) => deviceCarrierFits.fits.find((fit) => fit.id === id)).filter(Boolean);
        return <article key={`${area.id}-${item.ruleId ?? item.designation}`}><strong className={`designation designation-${item.designation}`}>{carrierDisplayLabel(item.designation, carrierName)}</strong><p>{item.why}</p>{item.classIds.length ? <p><b>Capability:</b> {item.classIds.join(", ")}</p> : null}{fits.length ? <p><b>Technical fit records:</b> {fits.map((fit) => fit?.deviceId).join(", ")}</p> : null}{sources.length ? <details><summary>Current evidence and scope</summary><ul>{sources.map((source) => source ? <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a> · checked {source.checkedDate}</li> : null)}</ul></details> : null}<details><summary>Limitations and confirmation</summary><ul>{[...item.limitations, ...item.confirmationSteps].map((value) => <li key={value}>{value}</li>)}</ul></details></article>;
      }) : <p className="empty-area">Nothing is being inferred for this section.</p>}</li>)}
    </ol>
    {context.unknowns.length ? <aside className="carrier-unknowns"><strong>Unknowns preserved</strong><ul>{context.unknowns.map((unknown) => <li key={unknown}>{unknown}</li>)}</ul></aside> : null}
    {context.category ? <CarrierClassGuide category={context.category} /> : null}
    {context.category === "water" ? <section className="carrier-water-demo" aria-labelledby="carrier-water-demo-heading"><div><p className="eyebrow">Why the capability matters</p><h2 id="carrier-water-demo-heading">Detection and response are different steps.</h2><p>The illustration below explains a supported leak-to-shutoff sequence. It is not evidence of {carrierName} acceptance, eligibility, savings, installation quality, device performance, or a claim outcome.</p></div><CausalDemo config={demonstrations.water} /></section> : null}
    {context.category === "water" ? <WaterInstallationChecklist carrierName={carrierName} /> : null}
    {context.category && context.jurisdiction ? <CarrierDeviceOptions category={context.category} carrierId={context.carrierId} jurisdiction={context.jurisdiction} /> : null}
    {context.category ? <IndependentRecommendations category={context.category} carrierName={carrierName} /> : null}
    <div className="carrier-map-actions"><Link className="button-subtle" href="/devices">Open independent Device Library</Link><Link className="button-subtle" href={`/protect/home?concern=${context.category === "water" ? "water" : context.category === "security" ? "security" : "vacant-monitoring"}`}>Explore Home protection</Link><button className="button-primary" type="button" onClick={buildPlan}>Build my carrier-aware plan</button></div>
  </section>;
}
