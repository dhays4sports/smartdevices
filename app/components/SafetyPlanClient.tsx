"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { getConcern, getDomain, intentOptions, type Device } from "@/app/lib/data";
import { decodePlanSelection, type SafetyPlan } from "@/app/lib/plan";
import { evidenceDisplayState, type ProCarrierData } from "@/app/lib/carrier";
import { WaterInstallationChecklist } from "./WaterInstallationChecklist";
import { localPlanStorageMode, readLocalPlan, persistLocalPlan } from "@/app/lib/local-plan-store";
import { HomeDecisionExperience } from "./HomeDecisionExperience";

type Props = { planId: string; selectionQuery: string; publishedDevices: Device[]; carrierData: ProCarrierData; reviewDate: string };

function subscribeToPlanStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export function SafetyPlanClient({ planId, selectionQuery, publishedDevices, carrierData, reviewDate }: Props) {
  const [intent, setIntent] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUnavailable, setShareUnavailable] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactRecorded, setContactRecorded] = useState(false);
  const [helpAction, setHelpAction] = useState<"confirm-agent" | "help-choose" | "installation-help" | "save-later" | "no-action" | null>(null);
  const localPlanRaw = useSyncExternalStore(
    subscribeToPlanStorage,
    () => readLocalPlan(planId),
    () => null,
  );
  const localPlan = useMemo(() => {
    if (!localPlanRaw) return null;
    try {
      const parsed = JSON.parse(localPlanRaw) as SafetyPlan;
      return parsed.id === planId && [1, 2, 3].includes(parsed.schemaVersion) ? parsed : null;
    } catch {
      return null;
    }
  }, [localPlanRaw, planId]);

  const selection = useMemo(() => {
    if (localPlan?.status === "expired" || localPlan?.status === "revoked") return null;
    return localPlan ?? decodePlanSelection(new URLSearchParams(selectionQuery), { devices: publishedDevices, carrierData });
  }, [localPlan, selectionQuery, publishedDevices, carrierData]);

  const domain = selection ? getDomain(selection.domain) : undefined;
  const concern = selection ? getConcern(selection.domain, selection.concernId) : undefined;
  const recommendations = selection?.recommendations
    .map((item) => ({ ...item, device: publishedDevices.find((device) => device.id === item.deviceId) }))
    .filter((item) => Boolean(item.device)) ?? [];
  const provenance = localPlan?.schemaVersion === 2 ? localPlan.provenance : null;
  const carrierProvenance = selection?.schemaVersion === 3 ? selection.carrierProvenance ?? null : null;
  const carrierName = carrierProvenance ? carrierData.carriers.find((carrier) => carrier.id === carrierProvenance.carrierId)?.name ?? "the selected carrier" : "the selected carrier";
  const confirmAgentLabel = carrierProvenance ? `Confirm with my ${carrierName} agent` : "Confirm with my insurance agent";
  const planStorageMode = localPlan ? localPlanStorageMode(planId) : null;
  const historicCarrierWarnings = carrierProvenance?.ruleIds.map((id) => { const rule = carrierData.rules.find((item) => item.id === id); if (!rule) return "The carrier rule used by this plan is unavailable. Confirm current guidance before acting."; const state = evidenceDisplayState(rule, reviewDate); return state === "current" ? null : `This plan references ${state} carrier evidence. Historic context is preserved, but current applicability needs confirmation.`; }).filter((warning): warning is string => Boolean(warning)) ?? [];
  const nonDeviceActions = domain?.id === "home"
    ? ["Review shutoff locations and household emergency steps.", "Address plumbing, electrical, alarm-placement, or building-condition concerns with a qualified professional."]
    : ["Review keys, parking habits, and a safe theft-reporting plan.", "Use manufacturer maintenance guidance and a qualified technician for warning lights or installation questions."];

  async function sharePlan() {
    const payload = { title: "Smart Safety Plan", text: "A SmartDevices.com plan with practical device options.", url: window.location.href };
    try {
      if (navigator.share) await navigator.share(payload);
      else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    } catch { setShareUnavailable(true); }
  }

  function savePlan() {
    if (localPlan) { setSaved(persistLocalPlan(localPlan) === "local-storage"); return; }
    if (selection) {
      const base = { ...selection, id: planId, status: "generated" as const, createdAt: new Date().toISOString() };
      // Sanitized links lack raw scan answers. Preserve v3 public context, but do
      // not fabricate missing v2 scan provenance or a professional identity.
      const restored: SafetyPlan = selection.schemaVersion === 3 && selection.carrierProvenance
        ? { ...base, schemaVersion: 3, carrierProvenance: selection.carrierProvenance }
        : { ...base, schemaVersion: 1 };
      setSaved(persistLocalPlan(restored) === "local-storage"); return;
    }
    try {
      localStorage.setItem(`smartdevices-safety-plan-${planId}`, JSON.stringify({ selection, intent, savedAt: new Date().toISOString() }));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  function recordLocalRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      localStorage.setItem(`smartdevices-help-request-${planId}`, JSON.stringify({
        name: String(data.get("name") ?? ""),
        contact: String(data.get("contact") ?? ""),
        preference: String(data.get("preference") ?? ""),
        purpose: helpAction,
        consentVersion: "carrier-help-v1",
        recordedAt: new Date().toISOString(),
        deliveryStatus: "not-sent-local-only",
      }));
      setContactRecorded(true);
      setContactOpen(false);
    } catch { setContactRecorded(false); }
  }

  function removeLocalRequest() {
    try { localStorage.removeItem(`smartdevices-help-request-${planId}`); } catch {}
    setContactRecorded(false);
  }

  function exportPlan() {
    const payload = {
      schemaVersion: selection?.schemaVersion ?? 1,
      planId,
      domain: domain?.id,
      concernId: concern?.id,
      exportedAt: new Date().toISOString(),
      recommendations: recommendations.map((item) => ({
        deviceId: item.deviceId,
        manufacturer: item.device?.manufacturer,
        model: item.device?.model,
        origin: item.origin,
        priority: item.priority,
        clientIntent: intent[item.deviceId] ?? null,
        fulfillment: "no-action",
      })),
      provenance: provenance ? {
        questionSetVersion: provenance.questionSetVersion,
        selectedConcernIds: provenance.selectedConcernIds,
        assumptions: provenance.assumptions,
        unknowns: provenance.unknowns,
        rationaleByDeviceId: provenance.rationaleByDeviceId,
      } : carrierProvenance ? {
        carrierId: carrierProvenance.carrierId,
        jurisdiction: carrierProvenance.jurisdiction,
        entryIntent: carrierProvenance.entryIntent,
        requestedCapabilityIds: carrierProvenance.requestedCapabilityIds,
        assertionSource: carrierProvenance.assertionSource ?? null,
        assertionStatus: carrierProvenance.assertionStatus,
        ruleIds: carrierProvenance.ruleIds,
        sourceVersions: carrierProvenance.sourceVersions,
        deviceFitIds: carrierProvenance.deviceFitIds,
        unknowns: carrierProvenance.unknowns,
      } : null,
      disclaimer: "Recommendations and client-stated intent are not purchase, installation, verification, insurance eligibility, or outcome evidence.",
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `SmartDevices_Safety_Plan_${planId.slice(0, 12)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (!selection || !domain || !concern || (recommendations.length === 0 && !carrierProvenance)) {
    return (
      <main className="page-main narrow-page">
        <p className="eyebrow">Smart Safety Plan</p>
        <h1>This plan is incomplete or no longer available.</h1>
        <p>The link may be missing its non-sensitive device selection, or the catalog record may have been retired.</p>
        <Link className="button-primary" href="/">Build a new plan</Link>
      </main>
    );
  }

  return (
    <main className={domain.id === "home" ? "home-plan" : "plan-page"}>
      {domain.id === "home" ? <HomeDecisionExperience key={planId} planId={planId} initialConcern={concern.id} initialEntry="known" publishedDevices={publishedDevices} planOptions={recommendations.map((item) => item.device!)} carrierContext={Boolean(carrierProvenance)} localContext={localPlan?.homeContext} /> : null}
      {domain.id === "home" ? <div className="home-plan-details"><button className="button-subtle" type="button" onClick={savePlan}>{saved ? "Saved on this device" : "Save this shared plan to My Plans"}</button></div> : null}
      <details className={domain.id === "home" ? "home-plan-details" : "standard-plan-details"} open={domain.id === "home" ? undefined : true}>
      <summary hidden={domain.id !== "home"}>Full plan, insurance context & source history</summary>
      <div className={domain.id === "home" ? "plan-page" : undefined}>
      <section className="plan-hero">
        <div>
          <p className="eyebrow">Smart Safety Plan · {domain.label}</p>
          <h1>{concern.prompt}</h1>
          <p>{concern.why}</p>
          <div className="plan-meta"><span>{recommendations.length} prioritized options</span><span>Plan {planId.slice(0, 8)}</span><span>Check each device’s dated source record</span></div>
        </div>
        <div className="plan-hero-actions">
          <button className="button-subtle" type="button" onClick={sharePlan}>{copied ? "Link copied" : "Share"}</button>
          <button className="button-subtle" type="button" onClick={() => window.print()}>Print / save PDF</button>
          <button className="button-subtle" type="button" onClick={exportPlan}>Export JSON</button>
          <button className="button-primary" type="button" onClick={savePlan}>{saved ? "Saved on this device" : "Save this plan"}</button>
        </div>
        {shareUnavailable ? <p className="form-note" role="status">Sharing is unavailable here. The plan remains readable and printable.</p> : null}
      </section>

      {localPlan?.agent ? <aside className="plan-professional-note" aria-label="Professional context">
        <div><span>Prepared with SmartDevices Pro</span><strong>{localPlan.agent.displayName}</strong>{localPlan.agent.agencyName ? <small>{localPlan.agent.agencyName}</small> : null}</div>
        {localPlan.agent.note ? <div><p className="eyebrow">Professional-supplied note</p><p>{localPlan.agent.note}</p><small>This assertion was supplied by the professional. It is not SmartDevices-verified product or insurance evidence.</small></div> : null}
      </aside> : null}

      {planStorageMode === "memory" ? <p className="form-note" role="status">Browser storage is unavailable. This carrier-aware plan remains available only in this tab and will not survive a refresh.</p> : null}

      {carrierProvenance ? <section className="carrier-plan-context" aria-labelledby="carrier-plan-context-heading">
        <div><p className="eyebrow">Carrier-aware plan · version 3</p><h2 id="carrier-plan-context-heading">Known, asserted, evidenced, and unknown context remain separate.</h2><p>SmartDevices is independent. This is decision guidance, not a {carrierName} requirement, approval, discount, eligibility, or policy determination.</p></div>
        <div className="carrier-plan-context-grid">
          {carrierProvenance.assertionStatus === "consumer-unverified" ? <article><h3>What you told us</h3><p>You stated that an insurance conversation mentioned this capability. SmartDevices has not verified the statement.</p></article> : null}
          {carrierProvenance.assertionStatus === "professional-unverified" ? <article><h3>What your professional supplied</h3><p>This plan carries a professional-stated requirement label. The shared link does not authenticate the sender or establish the requirement. Confirm it directly; it is not SmartDevices- or carrier-verified evidence.</p></article> : null}
          {carrierProvenance.sourceVersions.length ? <article><h3>What current {carrierName} public evidence says</h3><p>The governed public sources below supported the category when this plan was created; policy applicability still requires confirmation.</p><ul>{carrierProvenance.sourceVersions.map((source) => <li key={`${source.sourceId}-${source.version}`}>{source.sourceId} · version {source.version} · checked {source.checkedDate}</li>)}</ul>{historicCarrierWarnings.map((warning) => <p className="stale-warning" key={warning}>{warning}</p>)}</article> : null}
          {carrierProvenance.requestedCapabilityIds.length ? <article><h3>Capability before product</h3><ul>{carrierProvenance.requestedCapabilityIds.map((id) => <li key={id}>{id}</li>)}</ul></article> : null}
          {recommendations.length ? <article><h3>What SmartDevices recommends</h3><p>{recommendations.length} independently presented option{recommendations.length === 1 ? "" : "s"}; no client decision is preselected.</p></article> : null}
          {carrierProvenance.unknowns.length || historicCarrierWarnings.length ? <article><h3>What still needs confirmation</h3><ul>{carrierProvenance.unknowns.map((item) => <li key={item}>{item}</li>)}{historicCarrierWarnings.map((item) => <li key={item}>{item}</li>)}</ul></article> : null}
        </div>
      </section> : null}
      {carrierProvenance && concern.id === "water" ? <WaterInstallationChecklist carrierName={carrierName} /> : null}

      <section className="protection-map" aria-labelledby="map-title">
        <div>
          <p className="eyebrow">Protection map</p>
          <h2 id="map-title">Areas this plan addresses</h2>
          <p>This is an addressed-area map, not a safety score, compliance certificate, or statement of insurance sufficiency.</p>
        </div>
        <div className="map-track">
          {recommendations.map((item, index) => (
            <div key={item.deviceId} className="map-node">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.device?.solution}</strong>
            </div>
          ))}
          {!recommendations.length ? <div className="map-node"><span>01</span><strong>Class guidance and confirmation</strong></div> : null}
        </div>
      </section>

      <section className="plan-context" aria-labelledby="plan-context-title">
        <div><p className="eyebrow">Why this is relevant</p><h2 id="plan-context-title">Known context, assumptions, and unknowns</h2><p>The plan uses only the selected concern and locally available scan provenance. A shared sanitized link does not expose raw answers.</p></div>
        <div className="plan-context-grid">
          <article><h3>Known</h3><ul><li>Selected environment: {domain.label}</li><li>Primary concern: {concern.label}</li>{provenance?.selectedConcernIds.map((id) => <li key={id}>Addressed concern ID: {id}</li>)}</ul></article>
          <article><h3>Assumptions</h3>{provenance?.assumptions.length ? <ul>{provenance.assumptions.map((item) => <li key={item}>{item}</li>)}</ul> : <p>No additional assumptions are available in this view.</p>}</article>
          <article><h3>Still unknown</h3>{provenance?.unknowns.length ? <ul>{provenance.unknowns.map((item) => <li key={item}>{item}</li>)}</ul> : <p>Compatibility, current price and terms, site conditions, installation fit, and insurance treatment still require direct verification.</p>}</article>
        </div>
      </section>

      <section className="plan-recommendations" aria-labelledby="recommendations-title">
        <div className="section-heading">
          <div><p className="eyebrow">What deserves attention</p><h2 id="recommendations-title">A short plan, not a shopping dump.</h2></div>
        </div>
        {recommendations.map((item, index) => {
          const device = item.device!;
          return (
            <article key={device.id} className="plan-recommendation">
              <div className="plan-number">{String(index + 1).padStart(2, "0")}</div>
              <div className="plan-device-copy">
                <p className="eyebrow">{index === 0 ? "Strong fit" : "Worth comparing"}</p>
                <h3>{device.manufacturer} {device.model}</h3>
                <p>{device.summary}</p>
                <div className="plan-fact-grid">
                  <div><span>Why it appears</span><strong>{item.rationale}</strong></div>
                  <div><span>Expected setup</span><strong>{device.installation}</strong></div>
                  <div><span>Cost context</span><strong>{device.priceBand}</strong></div>
                  <div><span>Subscription</span><strong>{device.subscription}</strong></div>
                  <div><span>Connectivity</span><strong>{device.connectivity}</strong></div>
                  <div><span>Maintenance</span><strong>Confirm battery, firmware, testing, and service intervals with the manufacturer.</strong></div>
                </div>
                <details>
                  <summary>Compatibility, privacy, limitations, and insurance context</summary>
                  <ul>{device.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
                  <p>Review account access, alerts, cameras, location data, and household consent as applicable. Privacy settings and retention vary by service.</p>
                  <p>{device.insuranceNote}</p>
                </details>
                <Link className="text-action" href={`/devices/${device.slug}`}>Review complete device record</Link>
              </div>
              <fieldset className="intent-fieldset">
                <legend>What would you genuinely do next?</legend>
                {intentOptions.map((option) => (
                  <label key={option.id}>
                    <input
                      type="radio"
                      name={`intent-${device.id}`}
                      value={option.id}
                      checked={intent[device.id] === option.id}
                      onChange={() => setIntent((current) => ({ ...current, [device.id]: option.id }))}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
                {intent[device.id] ? <p className="intent-confirmation">Recorded for this plan. You can change it any time.</p> : null}
              </fieldset>
            </article>
          );
        })}
      </section>

      <section className="plan-next-steps" aria-labelledby="next-steps-title">
        <div><p className="eyebrow">Device and non-device options</p><h2 id="next-steps-title">Choose what happens next.</h2><p>A recommendation is not your decision. You may research, compare, verify fit, take a non-device step, ask for help, or do nothing.</p></div>
        <ul>{nonDeviceActions.map((item) => <li key={item}>{item}</li>)}<li>Confirm current product availability, terms, compatibility, installation, and any insurance requirement directly before acting.</li><li><Link className="text-action" href="/insurance">Check insurer requirements or possible discounts</Link></li></ul>
      </section>

      <section className="contact-checkpoint">
        <div>
          <p className="eyebrow">Optional next step</p>
          <h2>Choose a next step only if it helps.</h2>
          <p>Your plan is already complete. Contact information is only needed if you want follow-up.</p>
        </div>
        <fieldset className="plan-help-actions"><legend>What would you like to do?</legend>{[
          ["confirm-agent", confirmAgentLabel], ["help-choose", "Help me choose"], ["installation-help", "Installation help"], ["save-later", "Save for later"], ["no-action", "No action"],
        ].map(([value, label]) => <label key={value}><input type="radio" name="help-action" value={value} checked={helpAction === value} onChange={() => setHelpAction(value as typeof helpAction)} /><span>{label}</span></label>)}</fieldset>
        {helpAction === "save-later" ? <p className="local-recorded" role="status">Use “Save this plan” above. No contact information is needed.</p> : null}
        {helpAction === "no-action" ? <p className="local-recorded" role="status">No action recorded. Your plan remains available in this browser only if you save it.</p> : null}
        {helpAction === "confirm-agent" || helpAction === "help-choose" || helpAction === "installation-help" ? <aside className="context-preview"><strong>Before you consent, this is the intended context:</strong><ul><li>Plan ID and the selected follow-up purpose</li><li>Environment, concern, and selected device IDs</li><li>Safe carrier provenance identifiers when this is a v3 plan</li></ul><p>Raw answers, policy number, exact address, restricted evidence, and private notes are excluded. No message is sent in this local build.</p></aside> : null}
        {contactRecorded ? (
          <div className="local-recorded"><strong>Saved only in this browser.</strong><p>No message was sent. Activate a reviewed communication adapter before using this as a delivered request.</p><button className="button-subtle" type="button" onClick={removeLocalRequest}>Remove local request</button></div>
        ) : !contactOpen && (helpAction === "confirm-agent" || helpAction === "help-choose" || helpAction === "installation-help") ? (
          <button className="button-primary" type="button" onClick={() => setContactOpen(true)}>Continue to optional contact</button>
        ) : contactOpen ? (
          <form className="contact-form" onSubmit={recordLocalRequest}>
            <label><span>Name</span><input name="name" autoComplete="name" required /></label>
            <label><span>Mobile or email</span><input name="contact" required /></label>
            <label><span>Best way to respond</span><select name="preference"><option>Text me</option><option>Email me</option><option>Call me</option></select></label>
            <label className="consent-row"><input type="checkbox" required /><span>I consent to share the previewed plan context for this follow-up purpose under consent version carrier-help-v1. This does not enroll me in marketing.</span></label>
            <button className="button-primary" type="submit">Record follow-up request locally</button>
            <p className="form-note">External delivery is not activated in this build. No message will be sent until a communication adapter is configured.</p>
          </form>
        ) : null}
      </section>
      </div>
      </details>
    </main>
  );
}
