"use client";

import Link from "next/link";
import type { Device } from "@/app/lib/data";

type Props = {
  device: Device;
  selected?: boolean;
  compareSelected?: boolean;
  onAdd?: (device: Device) => void;
  onCompare?: (device: Device) => void;
};

export function DeviceCard({ device, selected, compareSelected, onAdd, onCompare }: Props) {
  return (
    <article className="device-card">
      <div className="device-card-topline">
        <span>{device.solution} · {device.commercialStatus === "none" ? "Editorial" : device.commercialStatus}</span>
        <span className="freshness">Reviewed {device.lastReviewed}</span>
      </div>
      <h3>{device.manufacturer} <span>{device.model}</span></h3>
      <p>{device.summary}</p>
      <dl className="device-facts">
        <div><dt>Best for</dt><dd>{device.bestFor}</dd></div>
        <div><dt>Setup</dt><dd>{device.installation}</dd></div>
        <div><dt>Cost</dt><dd>{device.priceBand}</dd></div>
      </dl>
      <div className="device-card-actions">
        <Link className="text-action" href={`/devices/${device.slug}`}>View details</Link>
        {onCompare ? (
          <button className={compareSelected ? "button-subtle is-selected" : "button-subtle"} type="button" onClick={() => onCompare(device)}>
            {compareSelected ? "Comparing" : "Compare"}
          </button>
        ) : null}
        {onAdd ? (
          <button className={selected ? "button-primary is-selected" : "button-primary"} type="button" onClick={() => onAdd(device)}>
            {selected ? "In your plan" : "Add to plan"}
          </button>
        ) : null}
      </div>
    </article>
  );
}
