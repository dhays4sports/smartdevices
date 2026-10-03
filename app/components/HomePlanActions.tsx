"use client";

import { recordMetric } from "@/app/lib/metrics-client";
import { useEffect, useState } from "react";
import type { Device } from "@/app/lib/data";
import { homeProgressStates, parseHomeProgress, type HomeProgress } from "@/app/lib/home-decision";

export function HomePlanActions({ planId, options, concernId }: { planId: string; options: Device[]; concernId: string }) {
  const [progress, setProgress] = useState<HomeProgress | null>(null);
  const [ready, setReady] = useState(false);
  const [storage, setStorage] = useState<"available" | "unavailable">("available");
  const [notice, setNotice] = useState("");
  const key = `smartdevices-home-progress-v1-${planId}`;
  const allowedIds = options.map((device) => device.id).join(",");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try { setProgress(parseHomeProgress(localStorage.getItem(key), allowedIds.split(","))); }
      catch { setStorage("unavailable"); }
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [key, allowedIds]);

  function update(fields: Partial<HomeProgress>) {
    const next: HomeProgress = { schemaVersion: 1, deviceId: progress?.deviceId ?? "", state: progress?.state ?? "researching", help: progress?.help ?? "none", updatedAt: new Date().toISOString(), ...fields };
    setProgress(next);
    if (!next.deviceId) { setNotice("Choose the option you want to track first. Nothing has been sent."); return; }
    try { localStorage.setItem(key, JSON.stringify(next)); setStorage("available"); setNotice("Saved on this device. No message, order or insurance change was sent."); }
    catch { setStorage("unavailable"); setNotice("Kept for this visit only. Download your summary before leaving."); }
  }

  function exportSummary() {
    recordMetric("plan_export");
    const device = options.find((item) => item.id === progress?.deviceId);
    const summary = {
      schemaVersion: 1, planId, concernId,
      option: device ? { id: device.id, manufacturer: device.manufacturer, model: device.model, recordChecked: device.lastReviewed } : null,
      progress: progress ? { state: progress.state, help: progress.help, updatedAt: progress.updatedAt, assertionSource: "consumer-self-reported" } : null,
      installationEvidence: "not-submitted", professionalReview: "not-recorded", carrierDetermination: "unknown", delivery: "not-sent",
      nextSteps: ["Confirm the exact capability and model with your agent if insurance-related.", "Get a site-specific installation quote and confirm compatibility.", "Follow manufacturer setup and maintenance instructions; ask what documentation is needed."],
      disclaimer: "This is a consumer-stated device plan, not purchase evidence, installation verification, carrier approval or a request to bind insurance.",
    };
    const helpLabels = { none: "No help requested", choose: "Help choosing", installation: "Installation quote or compatibility check", agent: "Agent confirmation" };
    const text = ["SMARTDEVICES.COM — YOUR HOME NEXT STEPS", "", `Plan: ${planId}`, `Protection area: ${concernId}`, "", "OPTION YOU ARE CONSIDERING", device ? `${device.manufacturer} ${device.model}` : "No option selected", device ? `Device record checked: ${device.lastReviewed}` : "", "", "YOUR REPORTED PROGRESS", homeProgressStates.find(([id]) => id === progress?.state)?.[1] ?? "No progress reported", `Next help: ${helpLabels[progress?.help ?? "none"]}`, "", "WHAT STILL NEEDS CONFIRMATION", ...summary.nextSteps.map((step, index) => `${index + 1}. ${step}`), "", "Installation evidence: not submitted", "Professional review: not recorded", "Carrier determination: unknown", "Delivery: not sent — share this summary yourself", "", summary.disclaimer].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "SmartDevices_Home_Next_Steps.txt"; link.click(); URL.revokeObjectURL(url);
    setNotice("Summary downloaded. You can share it yourself; SmartDevices has not sent it to an agent.");
  }

  return <section className="hd-next" aria-labelledby="hd-next-title">
    <div className="hd-section-heading"><div><p className="eyebrow">03 · Your next step</p><h2 id="hd-next-title">Leave with a plan. Come back to your progress.</h2><p>Choosing an option is not buying it. Installation and insurance confirmation are separate steps.</p></div></div>
    {!ready ? <p role="status">Opening progress saved on this device…</p> : <div className="hd-next-grid"><div>
      <label className="hd-field">Which option are you considering?<select value={progress?.deviceId ?? ""} onChange={(event) => update({ deviceId: event.target.value, state: "researching", help: "none" })}><option value="" disabled>Choose an option — nothing preselected</option>{options.map((device) => <option key={device.id} value={device.id}>{device.manufacturer} {device.model}{device.status !== "active" ? " — evidence needs review" : ""}</option>)}</select></label>
      <label className="hd-field">Where are you in the process?<select disabled={!progress?.deviceId} value={progress?.state ?? "researching"} onChange={(event) => update({ state: event.target.value as HomeProgress["state"] })}>{homeProgressStates.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      <label className="hd-field">What would help you move forward?<select disabled={!progress?.deviceId} value={progress?.help ?? "none"} onChange={(event) => update({ help: event.target.value as HomeProgress["help"] })}><option value="none">Nothing right now / decide later</option><option value="choose">Help choosing between options</option><option value="installation">An installation quote or compatibility check</option><option value="agent">Confirm the requirement with my agent</option></select></label>
      <p className="hd-storage">{storage === "available" ? "Private, device-local progress. Not synced to your agent." : "Storage unavailable. Progress lasts only for this visit."}</p>
    </div><aside className="hd-next-checklist"><h3>{progress?.help === "choose" ? "Compare the capability first." : progress?.help === "installation" ? "Ask for a site-specific installation quote." : progress?.help === "agent" ? "Confirm with your agent before buying." : progress?.state === "installed-self-reported" ? "Installation reported. Confirmation is separate." : "Before you purchase or install"}</h3>
      <ol><li>Confirm the capability, exact model and any insurance documentation with your agent.</li><li>Confirm {concernId === "water" ? "plumbing fit, installation permission, power and connectivity" : "site compatibility, installation permission and connectivity"} with a qualified professional.</li><li>Get an installation quote separate from equipment and subscription costs.</li><li>Follow manufacturer setup, testing and maintenance guidance.</li></ol>
      <dl><div><dt>Installation evidence</dt><dd>Not submitted</dd></div><div><dt>Professional review</dt><dd>Not recorded</dd></div><div><dt>Carrier determination</dt><dd>Unknown</dd></div></dl>
    </aside></div>}
    <div className="hd-primary-row"><button className="button-primary" type="button" onClick={exportSummary}>Download my next-step summary</button><button className="button-subtle" type="button" onClick={() => window.print()}>Print / save PDF</button></div>
    <p role="status" className="hd-notice">{notice}</p><p className="hd-storage">No automatic agent notification or appointment booking is active here. Share your downloaded summary with your agent to continue the insurance review. Never upload policy or client documents into this local plan.</p>
  </section>;
}
