"use client";

import { useReducer } from "react";
import { initialWaterChecklistState, toggleWaterChecklist, waterInstallationChecklist, type WaterChecklistId, type WaterChecklistState } from "@/app/lib/water-checklist";

function reducer(state: WaterChecklistState, action: { type: "TOGGLE"; id: WaterChecklistId } | { type: "SEND" }): WaterChecklistState {
  return action.type === "TOGGLE" ? toggleWaterChecklist(state, action.id) : { ...state, delivery: "adapter-disabled" };
}

export function WaterInstallationChecklist({ carrierName = "the carrier" }: { carrierName?: string }) {
  const [state, dispatch] = useReducer(reducer, initialWaterChecklistState);
  function exportChecklist() {
    const payload = { schemaVersion: 1, capabilityClassId: "automatic-main-water-shutoff", completedSelfReported: state.completedSelfReported, verification: "not-verified", disclaimer: "Self-reported checklist state is not installation evidence, professional review, carrier acceptance, or policy compliance." };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "SmartDevices_Water_Installation_Checklist.json"; link.click(); URL.revokeObjectURL(url);
  }
  return <section className="water-checklist" aria-labelledby="water-checklist-heading"><div className="section-heading"><div><p className="eyebrow">Installation + documentation</p><h2 id="water-checklist-heading">Keep the practical steps literal.</h2><p>Checked items are self-reported on this device. They do not mark installation, professional review, or {carrierName} acceptance.</p></div><span>{state.completedSelfReported.length}/{waterInstallationChecklist.length} self-reported</span></div><fieldset><legend className="sr-only">Water installation and documentation checklist</legend>{waterInstallationChecklist.map((item) => <label key={item.id}><input type="checkbox" checked={state.completedSelfReported.includes(item.id)} onChange={() => dispatch({ type: "TOGGLE", id: item.id })} /><span>{item.id === "carrier-docs" ? `Ask ${carrierName} or your agent what documentation, if any, is accepted for this policy and property.` : item.label}<small>Responsible context: {item.actor}</small></span></label>)}</fieldset><div className="water-checklist-actions"><button className="button-subtle" type="button" onClick={() => window.print()}>Print checklist</button><button className="button-subtle" type="button" onClick={exportChecklist}>Export checklist JSON</button><button className="button-primary" type="button" onClick={() => dispatch({ type: "SEND" })}>Send to my professional</button></div>{state.delivery === "adapter-disabled" ? <p className="adapter-disabled" role="status">Not sent. Secure storage, recipient authorization, consent, retention/deletion, malware scanning, and a reviewed delivery adapter are not activated.</p> : null}</section>;
}
