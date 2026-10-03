"use client";

import Link from "next/link";
import { carrierDisplayLabel } from "@/app/lib/carrier-contract";
import { evaluateCarrierGuidance, type CarrierContext, type ProCarrierData } from "@/app/lib/carrier";
import type { Device } from "@/app/lib/data";
import { CarrierDeviceOptions } from "./CarrierDeviceOptions";
import { CausalDemo } from "./CausalDemo";
import { demonstrations } from "@/app/lib/demo";
import { WaterInstallationChecklist } from "./WaterInstallationChecklist";
import { CarrierClassGuide } from "./CarrierClassGuide";
import { IndependentRecommendations } from "./IndependentRecommendations";
import { createCarrierPlan, encodePlanSelection } from "@/app/lib/plan";
import { persistLocalPlan } from "@/app/lib/local-plan-store";

export function CarrierProtectionMap({ context, onReview, carrierData, publishedDevices, reviewDate }: { context: CarrierContext; onReview: () => void; carrierData: ProCarrierData; publishedDevices: Device[]; reviewDate: string }) {
  const carrierName = carrierData.carriers.find((item) => item.id === context.carrierId)?.name ?? "the selected carrier";
  const areaLabels = { assertion: "Start with the stated requirement", carrier: `Potentially relevant ${carrierName} category`, editorial: "SmartDevices protection recommendation", confirmation: "Still needs confirmation" } as const;
  const guidance = evaluateCarrierGuidance(context, reviewDate, { carriers: carrierData.carriers, rules: carrierData.rules, fits: carrierData.fits });
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
    const fitDeviceIds = [...new Set(guidance.flatMap((item) => item.deviceFitIds).map((id) => carrierData.fits.find((fit) => fit.id === id)?.deviceId).filter((id): id is string => Boolean(id)))];
    const plan = createCarrierPlan(context, fitDeviceIds, { carrierData, devices: publishedDevices, reviewDate });
    persistLocalPlan(plan);
    window.location.assign(`/plans/${plan.id}?${encodePlanSelection(plan)}`);
  }

  const requested = new Set(context.requestedCapabilityIds);
  const startingPoint = context.category === "water"
    ? requested.has("automatic-main-water-shutoff")
      ? "Start with whole-home leak monitoring and automatic main-line shutoff."
      : requested.has("point-water-detection")
        ? "A leak sensor and an automatic whole-home shutoff are not the same thing."
        : requested.has("whole-home-flow-monitoring")
          ? "Start with whole-home water monitoring—and confirm whether automatic shutoff is needed."
          : "Confirm whether they meant a point sensor or an automatic whole-home shutoff."
    : context.category === "gas"
      ? "Start with a professionally installed automatic gas shutoff solution."
      : context.category === "security"
        ? requested.has("professionally-monitored-fire-security")
          ? "Start with professionally monitored fire and security protection."
          : "A local smart alarm is not the same as professional monitoring."
        : "Start by confirming the exact monitoring and control capabilities."
  const carrierPositive = carrier.find((item) => item.current && item.designation !== "confirmation-needed");
  const confirmationSteps = [...new Set(guidance.flatMap((item) => item.confirmationSteps))].slice(0, 3);

  return <section className="carrier-map" aria-labelledby="carrier-map-heading">
    <header className="carrier-result-hero">
      <p className="eyebrow">Your starting point</p>
      <h2 id="carrier-map-heading">{startingPoint}</h2>
      <p>{carrierPositive ? `${carrierName} currently publishes information for this protection category. That does not determine your eligibility or whether a particular product satisfies your policy.` : `We do not have enough current carrier evidence to make a positive ${carrierName} statement for this situation.`}</p>
      <div className="result-primary-actions"><button className="button-primary" type="button" onClick={buildPlan}>Save this as my plan</button><button className="button-subtle" type="button" onClick={onReview}>Review my answers</button></div>
    </header>

    <div className="result-confirmation" aria-label="What to confirm next"><span>Before you buy</span><div><strong>Confirm with your Farmers agent:</strong><ul>{confirmationSteps.map((step) => <li key={step}>{step}</li>)}</ul></div></div>

    {context.category && context.jurisdiction ? <CarrierDeviceOptions category={context.category} carrierId={context.carrierId} jurisdiction={context.jurisdiction} carrierData={carrierData} publishedDevices={publishedDevices} reviewDate={reviewDate} /> : null}

    <details className="result-detail-drawer"><summary><span>Why this answer appeared</span><small>Evidence, technical fit and limitations</small></summary>
      <div className="carrier-map-visual" aria-hidden="true">{areas.map((area, index) => <div key={area.id} className={area.items.length ? "is-addressed" : ""}><span>{String(index + 1).padStart(2, "0")}</span><strong>{areaLabels[area.id]}</strong><small>{area.items.length || "—"}</small></div>)}</div>
      <ol className="carrier-map-list">
        {areas.map((area) => <li key={area.id}><header><span>{area.items.length ? "Addressed" : "No current item"}</span><h3>{areaLabels[area.id]}</h3></header>{area.items.length ? area.items.map((item) => {
          const sources = item.sourceIds.map((id) => carrierData.sources.find((source) => source.id === id)).filter(Boolean);
          const fits = item.deviceFitIds.map((id) => carrierData.fits.find((fit) => fit.id === id)).filter(Boolean);
          return <article key={`${area.id}-${item.ruleId ?? item.designation}`}><strong className={`designation designation-${item.designation}`}>{carrierDisplayLabel(item.designation, carrierName)}</strong><p>{item.why}</p>{item.classIds.length ? <p><b>Capability:</b> {item.classIds.join(", ")}</p> : null}{fits.length ? <p><b>Technical fit records:</b> {fits.map((fit) => fit?.deviceId).join(", ")}</p> : null}{sources.length ? <details><summary>Current evidence and scope</summary><ul>{sources.map((source) => source ? <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a> · checked {source.checkedDate}</li> : null)}</ul></details> : null}<details><summary>Limitations and confirmation</summary><ul>{[...item.limitations, ...item.confirmationSteps].map((value) => <li key={value}>{value}</li>)}</ul></details></article>;
        }) : <p className="empty-area">Nothing is being inferred for this section.</p>}</li>)}
      </ol>
      {context.unknowns.length ? <aside className="carrier-unknowns"><strong>Still unknown</strong><ul>{context.unknowns.map((unknown) => <li key={unknown}>{unknown}</li>)}</ul></aside> : null}
    </details>

    {context.category ? <details className="result-detail-drawer"><summary><span>Understand the device category</span><small>What similar-sounding features actually mean</small></summary><CarrierClassGuide category={context.category} />{context.category === "water" ? <section className="carrier-water-demo" aria-labelledby="carrier-water-demo-heading"><div><p className="eyebrow">Why the capability matters</p><h2 id="carrier-water-demo-heading">Detection and response are different steps.</h2><p>This illustrates the sequence. It is not evidence of {carrierName} acceptance, eligibility or device performance.</p></div><CausalDemo config={demonstrations.water} /></section> : null}</details> : null}
    {context.category === "water" ? <details className="result-detail-drawer"><summary><span>Installation and documentation</span><small>What to ask before scheduling the work</small></summary><WaterInstallationChecklist carrierName={carrierName} /></details> : null}
    {context.category ? <details className="result-detail-drawer"><summary><span>Other protection recommendations</span><small>Independent of Farmers</small></summary><IndependentRecommendations category={context.category} carrierName={carrierName} /></details> : null}

    <div className="carrier-map-actions"><Link className="text-action" href="/devices">Browse all devices</Link><Link className="text-action" href={`/protect/home?concern=${context.category === "water" ? "water" : context.category === "security" ? "security" : "vacant-monitoring"}`}>Explore general Home protection</Link></div>
  </section>;
}
