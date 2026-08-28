"use client";

import Link from "next/link";
import { useState } from "react";
import { DeviceCard } from "./DeviceCard";
import { priorityBandLabels, type ScanResult } from "@/app/lib/scan";
import type { Device } from "@/app/lib/data";

type Props = {
  result: ScanResult;
  selectedIds: string[];
  onTogglePlan: (device: Device) => void;
};

export function DeviceUniverse({ result, selectedIds, onTogglePlan }: Props) {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  function toggleCompare(device: Device) {
    setCompareIds((current) => current.includes(device.id) ? current.filter((id) => id !== device.id) : [...current, device.id].slice(-3));
  }

  if (!result.recommendations.length) {
    return (
      <div className="universe-empty">
        <p className="eyebrow">Device Universe</p>
        <h3>No defensible device match yet.</h3>
        <p>We will not fill this result with a weaker option. Change an answer, review the unknowns, or open the editorial library.</p>
        {result.exclusions.map((item) => <p key={item}>{item}</p>)}
        <Link className="button-subtle" href="/devices">Open Device Library</Link>
      </div>
    );
  }

  const first = result.recommendations[0];
  return (
    <section className="device-universe" aria-labelledby="universe-heading">
      <div className="universe-heading">
        <div><p className="eyebrow">Device Universe</p><h3 id="universe-heading">See how the recommendation is connected.</h3><p>The visual map and ordered list contain the same path. Priority is plain-language guidance, never a safety score.</p></div>
        {compareIds.length >= 2 ? <Link className="button-primary" href={`/compare?items=${compareIds.join(",")}`}>Compare {compareIds.length}</Link> : <span className="compare-prompt">Choose two or three to compare</span>}
      </div>
      <div className="universe-map" aria-hidden="true">
        <span>Concern<strong>{result.primaryConcernId}</strong></span><i>→</i><span>Protection area<strong>{first.protectionArea}</strong></span><i>→</i><span>Solution class<strong>{first.solutionClass}</strong></span><i>→</i><span>Device options<strong>{result.recommendations.length}</strong></span>
      </div>
      <ol className="universe-list">
        {result.recommendations.map(({ device, priorityBand, protectionArea, solutionClass, rationaleFactors, compatibilityNotes }, index) => (
          <li key={device.id}>
            <div className="universe-path"><span>{String(index + 1).padStart(2, "0")}</span><p><strong>{result.primaryConcernId}</strong> concern → <strong>{protectionArea}</strong> → <strong>{solutionClass}</strong> → <strong>{device.manufacturer} {device.model}</strong></p><em>{priorityBandLabels[priorityBand]}</em></div>
            <DeviceCard device={device} selected={selectedIds.includes(device.id)} compareSelected={compareIds.includes(device.id)} onAdd={onTogglePlan} onCompare={toggleCompare} />
            <details className="universe-explanation"><summary>Why this appears and what still needs checking</summary><h4>Known rationale</h4><ul>{rationaleFactors.map((factor) => <li key={factor}>{factor}</li>)}</ul><h4>Compatibility and limitations</h4><ul>{compatibilityNotes.map((note) => <li key={note}>{note}</li>)}</ul></details>
          </li>
        ))}
      </ol>
      {result.domainId === "home" ? <aside className="insurance-next-step"><div><strong>Did an insurer mention a device?</strong><p>Check current requirements or possible discount categories without changing this independent recommendation.</p></div><Link className="button-subtle" href="/insurance">Check insurance guidance</Link></aside> : null}
    </section>
  );
}
