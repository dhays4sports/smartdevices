"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { devicesForConcern, domains, getDomain, type Device, type DomainId } from "@/app/lib/data";
import { createLocalPlan, encodePlanSelection } from "@/app/lib/plan";
import { createCarrierPlan } from "@/app/lib/plan";
import { buildScanResult } from "@/app/lib/scan";
import type { CarrierCategory, ProCarrierData } from "@/app/lib/carrier";
import { carrierPlanTemplates, carrierTemplateState, type CarrierPlanTemplate } from "@/app/lib/pro-templates";
import { persistLocalPlan } from "@/app/lib/local-plan-store";

type Props = { userName?: string | null; userEmail?: string | null; demoMode: boolean; carrierData: ProCarrierData; publishedDevices: Device[] };

const templates = [
  { name: "High-value home water readiness", domain: "home" as DomainId, concern: "water" },
  { name: "Monitored home protection", domain: "home" as DomainId, concern: "security" },
  { name: "New teen driver", domain: "vehicle" as DomainId, concern: "teen-driver" },
  { name: "Incident documentation", domain: "vehicle" as DomainId, concern: "dashcam" },
];

export function ProWorkspace({ userName, userEmail, demoMode, carrierData, publishedDevices }: Props) {
  const [workspaceMode, setWorkspaceMode] = useState<"independent" | "carrier">("independent");
  const [carrierId, setCarrierId] = useState(carrierData.carriers[0]?.id ?? "");
  const [jurisdiction, setJurisdiction] = useState("CA");
  const [carrierIntent, setCarrierIntent] = useState<"requirement" | "discounts" | "recommendations">("requirement");
  const [carrierCategory, setCarrierCategory] = useState<CarrierCategory>("water");
  const [domainId, setDomainId] = useState<DomainId>("home");
  const domain = getDomain(domainId) ?? domains[0];
  const [concernId, setConcernId] = useState(domain.concerns[0].id);
  const [selected, setSelected] = useState<string[]>([]);
  const [clientName, setClientName] = useState("");
  const [agentName, setAgentName] = useState(userName ?? "Demo professional");
  const [agencyName, setAgencyName] = useState("Independent insurance professional");
  const [note, setNote] = useState("");
  const [generated, setGenerated] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<"not-requested" | "adapter-disabled">("not-requested");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [previewAcknowledged, setPreviewAcknowledged] = useState(false);
  const previewRef = useRef<HTMLIFrameElement>(null);

  const scanContext = useMemo(() => buildScanResult(domainId, concernId, [], publishedDevices), [domainId, concernId, publishedDevices]);
  const options = workspaceMode === "carrier" ? carrierData.fits.filter((fit) => fit.carrierId === carrierId && fit.jurisdiction === jurisdiction).map((fit) => publishedDevices.find((device) => device.id === fit.deviceId)).filter((device): device is NonNullable<typeof device> => Boolean(device)) : scanContext.recommendations.map((item) => item.device);

  function changeDomain(next: DomainId) {
    const nextDomain = getDomain(next) ?? domains[0];
    setDomainId(next);
    setConcernId(nextDomain.concerns[0].id);
    setSelected([]);
    setGenerated(null);
    setShareStatus("not-requested");
  }

  function applyTemplate(template: (typeof templates)[number]) {
    const nextDomain = getDomain(template.domain) ?? domains[0];
    setDomainId(template.domain);
    setConcernId(template.concern);
    setSelected(devicesForConcern(template.domain, template.concern, publishedDevices).map((device) => device.id).slice(0, 3));
    setGenerated(null);
    setShareStatus("not-requested");
    if (!nextDomain.concerns.some((item) => item.id === template.concern)) setConcernId(nextDomain.concerns[0].id);
  }

  function applyCarrierTemplate(template: CarrierPlanTemplate) {
    if (carrierTemplateState(template, carrierData.rules) !== "available") return;
    setWorkspaceMode("carrier"); setCarrierId(template.carrierId); setJurisdiction(template.jurisdiction); setCarrierIntent(template.intent); setCarrierCategory(template.category); setDomainId("home"); setConcernId(template.category === "water" ? "water" : template.category === "security" ? "security" : "vacant-monitoring");
    setSelected(carrierData.fits.filter((fit) => fit.carrierId === template.carrierId && fit.jurisdiction === template.jurisdiction && fit.classIds.some((id) => template.capabilityIds.includes(id))).map((fit) => fit.deviceId).slice(0, 3)); setGenerated(null); setShareStatus("not-requested");
  }

  function generatePlan() {
    const governedRules = carrierData.rules.filter((rule) => rule.carrierId === carrierId && rule.jurisdiction === jurisdiction && rule.capabilityClassIds.some((id) => carrierData.fits.some((fit) => fit.classIds.includes(id) && selected.includes(fit.deviceId))));
    const plan = workspaceMode === "carrier" ? createCarrierPlan({ carrierId, jurisdiction, intent: carrierIntent, category: carrierCategory, requestedCapabilityIds: [...new Set(governedRules.flatMap((rule) => rule.capabilityClassIds))], assertionSource: "professional-stated", professionalAssertion: true, unknowns: governedRules.length ? [] : ["No current governed product-level rule was selected; confirmation is required."] }, selected, { carrierData, devices: publishedDevices, reviewDate: new Date().toISOString().slice(0,10) }) : createLocalPlan(domainId, concernId, selected, "agent", scanContext);
    plan.agent = { displayName: agentName || "Your insurance professional", agencyName, email: userEmail ?? undefined, note: note.trim() || undefined, assertionStatus: "professional-supplied" };
    persistLocalPlan(plan);
    setGenerated(`/plans/${plan.id}?${encodePlanSelection(plan)}${plan.domain === "home" ? "&view=home-decision" : ""}`);
    setPreviewAcknowledged(false);
  }

  return (
    <main className="pro-workspace">
      <header className="workspace-header">
        <div><p className="eyebrow">SmartDevices Pro</p><h1>Turn a client concern into a useful plan.</h1></div>
        <div className="workspace-user"><span>{demoMode ? "DEMO" : "SIGNED IN"}</span><strong>{agentName || userEmail}</strong><small>{demoMode ? "Local-only workspace. No client data is transmitted." : userEmail}</small></div>
      </header>

      {demoMode ? <div className="demo-banner"><strong>Explicit demo mode</strong><span>Authentication, shared storage, delivery, and engagement events require hosted activation. This workspace keeps drafts on this device only.</span></div> : null}

      <div className="workspace-grid">
        <aside className="workspace-sidebar">
          <section>
            <p className="eyebrow">Templates</p>
            {workspaceMode === "carrier" ? carrierPlanTemplates.map((template) => { const state = carrierTemplateState(template, carrierData.rules); return <button key={template.id} type="button" disabled={state !== "available"} onClick={() => applyCarrierTemplate(template)}>{template.name}<span>{state === "available" ? "Use PII-free template" : "Evidence review required"}</span></button>; }) : templates.map((template) => <button key={template.name} type="button" onClick={() => applyTemplate(template)}>{template.name}<span>Use template</span></button>)}
          </section>
          <section>
            <p className="eyebrow">Agent identity</p>
            <label><span>Display name</span><input value={agentName} onChange={(event) => setAgentName(event.target.value)} /></label>
            <label><span>Agency</span><input value={agencyName} onChange={(event) => setAgencyName(event.target.value)} /></label>
            <p className="form-note">SmartDevices remains the primary platform identity. Agent-supplied notes are labeled separately from verified evidence.</p>
          </section>
        </aside>

        <section className="builder-card">
          <fieldset className="workspace-mode"><legend>Workspace mode</legend><label><input type="radio" name="workspace-mode" checked={workspaceMode === "independent"} onChange={() => { setWorkspaceMode("independent"); setSelected([]); }} />Independent protection</label><label><input type="radio" name="workspace-mode" checked={workspaceMode === "carrier"} onChange={() => { setWorkspaceMode("carrier"); setDomainId("home"); setConcernId("water"); setSelected([]); }} />Carrier guidance</label></fieldset>
          {workspaceMode === "carrier" ? <section className="carrier-pro-fields" aria-labelledby="carrier-pro-heading"><div><p className="eyebrow">Governed public carrier context</p><h2 id="carrier-pro-heading">Select scope before products.</h2><p>Only current reviewed public evidence is available here. Restricted material is never sent to this client component.</p></div><div className="builder-fields"><label><span>Carrier</span><select value={carrierId} onChange={(event) => setCarrierId(event.target.value)}>{carrierData.carriers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label><span>Jurisdiction</span><select value={jurisdiction} onChange={(event) => setJurisdiction(event.target.value)}><option value="CA">California</option></select></label><label><span>Intent</span><select value={carrierIntent} onChange={(event) => setCarrierIntent(event.target.value as typeof carrierIntent)}><option value="requirement">Professional-stated requirement</option><option value="discounts">Check potential categories</option><option value="recommendations">Explore recommendations</option></select></label><label><span>Capability category</span><select value={carrierCategory} onChange={(event) => setCarrierCategory(event.target.value as CarrierCategory)}><option value="water">Water detection/shutoff</option><option value="gas">Automatic gas shutoff</option><option value="security">Monitored fire/security</option><option value="connected-home">Connected home</option></select></label></div></section> : null}
          <div className="builder-step"><span>01</span><div><p className="eyebrow">Client context</p><h2>Who and what are you helping?</h2></div></div>
          <div className="builder-fields">
            <label><span>Client name or reference <small>optional</small></span><input value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="Shown only in your working view" /></label>
            <label><span>Environment</span><select value={domainId} onChange={(event) => changeDomain(event.target.value as DomainId)}>{domains.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
            <label><span>Primary concern</span><select value={concernId} onChange={(event) => { setConcernId(event.target.value); setSelected([]); setGenerated(null); }}>{domain.concerns.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          </div>
          <div className="pro-scan-context">
            <div><p className="eyebrow">Consented scan context</p><strong>{domain.label} · {domain.concerns.find((item) => item.id === concernId)?.label}</strong><span>Question set {scanContext.questionSetVersion}</span></div>
            <div><strong>{scanContext.unknowns.length} unresolved context items</strong><p>No client answers were supplied in this local workspace, so SmartDevices keeps them unknown. An activated handoff may provide only consented, validated scan provenance.</p></div>
          </div>

          <div className="builder-step"><span>02</span><div><p className="eyebrow">Curated options</p><h2>Choose what is worth showing.</h2></div></div>
          <div className="builder-options">
            {options.length ? options.map((device) => (
              <label key={device.id} className={selected.includes(device.id) ? "builder-option is-selected" : "builder-option"}>
                <input type="checkbox" checked={selected.includes(device.id)} onChange={() => setSelected((items) => items.includes(device.id) ? items.filter((id) => id !== device.id) : [...items, device.id].slice(-5))} />
                <span><strong>{device.manufacturer} {device.model}</strong><small>{device.solution} · {device.installation}</small></span>
              </label>
            )) : <p>No published device has cleared verification for this exact concern yet. The category guidance can still be discussed without inventing a ranking.</p>}
          </div>

          <div className="builder-step"><span>03</span><div><p className="eyebrow">Agent context</p><h2>Add a clearly labeled note.</h2></div></div>
          <label className="full-field"><span>Agent note <small>not SmartDevices-verified evidence</small></span><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} placeholder="Example: I can verify whether your carrier requires professional monitoring or a specific shutoff model." /></label>

          <div className="builder-review">
            <div><strong>{clientName || "Client"}</strong><span>{domain.label} · {domain.concerns.find((item) => item.id === concernId)?.label}</span><span>{selected.length} device options selected</span></div>
            <button className="button-primary" type="button" disabled={!selected.length && workspaceMode === "independent"} onClick={generatePlan}>Generate client plan</button>
          </div>
          {generated ? (
            <div className="generated-plan" aria-live="polite">
              <div><strong>Exact client view ready</strong><span>The embedded route below is the same plan the client would open. A view is not treated as purchase intent.</span><small>SmartDevices remains primary; professional identity is secondary. A carrier logo is intentionally omitted because asset authorization is not recorded.</small></div>
              <div className="preview-controls"><button type="button" className={previewMode === "desktop" ? "is-active" : ""} onClick={() => setPreviewMode("desktop")}>Desktop preview</button><button type="button" className={previewMode === "mobile" ? "is-active" : ""} onClick={() => setPreviewMode("mobile")}>Mobile preview</button><button type="button" onClick={() => previewRef.current?.contentWindow?.print()}>Print preview</button></div>
              <div className={`client-preview client-preview-${previewMode}`}><iframe ref={previewRef} title="Exact Smart Safety Plan client preview" src={generated} /></div>
              <aside className="share-field-preview"><strong>Included in the client plan</strong><p>Plan ID, environment, concern, selected device IDs, safe public carrier provenance, professional display identity, and labeled professional note.</p><strong>Not included</strong><p>Working-view client reference, raw answers, policy number, exact address, restricted evidence, analytics identifiers, or a carrier logo.</p></aside>
              <label className="consent-row"><input type="checkbox" checked={previewAcknowledged} onChange={(event) => setPreviewAcknowledged(event.target.checked)} /><span>I reviewed the exact client view and its source/independence disclosures.</span></label>
              <div className="generated-plan-actions"><Link className="button-subtle" href={generated}>Open client route</Link><button className="button-primary" type="button" disabled={!previewAcknowledged} onClick={() => setShareStatus("adapter-disabled")}>Share through adapter</button></div>
              {shareStatus === "adapter-disabled" ? <p>Not sent: a reviewed delivery adapter and recipient consent must be activated first.</p> : null}
            </div>
          ) : null}
          <section className="engagement-boundary" aria-labelledby="engagement-heading">
            <div><p className="eyebrow">Follow-up states</p><h2 id="engagement-heading">No live engagement data in demo mode.</h2><p>When hosted storage is activated, events remain literal and source-attributed. A page view never becomes purchase intent.</p></div>
            <dl>
              <div><dt>Shared</dt><dd>Delivery adapter accepted a plan link.</dd></div>
              <div><dt>Viewed</dt><dd>The plan route was opened; no intent inferred.</dd></div>
              <div><dt>Client responded</dt><dd>The client explicitly selected a next step.</dd></div>
              <div><dt>Fulfillment</dt><dd>Purchase, installation, evidence, and verification remain separate assertions.</dd></div>
            </dl>
          </section>
        </section>
      </div>
    </main>
  );
}
