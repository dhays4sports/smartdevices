"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Concern, ProtectionDomain } from "@/app/lib/data";

export type SceneZone = {
  id: string;
  label: string;
  x: number;
  y: number;
  demonstration: "water" | "smoke-heat" | "vehicle-tracking" | null;
};

export function sceneZones(domain: ProtectionDomain): SceneZone[] {
  return domain.concerns.map((concern) => ({
    id: concern.id,
    label: concern.label,
    x: concern.position.x,
    y: concern.position.y,
    demonstration: domain.id === "home" && concern.id === "water"
      ? "water"
      : domain.id === "home" && concern.id === "fire-electrical"
        ? "smoke-heat"
        : domain.id === "vehicle" && concern.id === "theft"
          ? "vehicle-tracking"
          : null,
  }));
}

type Props = {
  domain: ProtectionDomain;
  concern?: Concern;
  revision: number;
  onSelect: (concernId: string) => void;
};

export function InteractiveScene({ domain, concern, revision, onSelect }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const selectedRef = useRef<HTMLAnchorElement>(null);
  const zones = sceneZones(domain);

  useEffect(() => {
    if (concern) selectedRef.current?.focus({ preventScroll: true });
  }, [concern, revision]);

  return (
    <section className={imageFailed ? "scene-shell has-image-fallback" : "scene-shell"} data-domain={domain.id} aria-labelledby="scene-heading">
      {!imageFailed ? <Image className="scene-image" src={domain.scene} alt="" fill loading="lazy" sizes="(max-width: 800px) 100vw, 66vw" unoptimized onError={() => setImageFailed(true)} /> : null}
      <div className="scene-static-fallback" aria-hidden={!imageFailed}>
        <span>{domain.label}</span><strong>Scene image unavailable</strong><small>Every protection area remains available below.</small>
      </div>
      <div className="scene-scrim" aria-hidden="true" />
      <div className="scene-title">
        <p>{domain.label} protection</p>
        <h2 id="scene-heading">{domain.headline}</h2>
        <span>{domain.description}</span>
      </div>
      <div className="hotspot-layer" aria-hidden="true">
        {zones.map((zone) => (
          <button key={zone.id} className={zone.id === concern?.id ? "hotspot is-active" : "hotspot"} type="button" tabIndex={-1} style={{ left: `${zone.x}%`, top: `${zone.y}%` }} onClick={() => onSelect(zone.id)}>
            <span className="hotspot-ring" />
            <span className="hotspot-label">{zone.label}</span>
          </button>
        ))}
      </div>
      <div className="scene-list" aria-label={`${domain.label} protection areas`}>
        {zones.map((zone) => <a ref={zone.id === concern?.id ? selectedRef : undefined} key={zone.id} className={zone.id === concern?.id ? "scene-list-item is-active" : "scene-list-item"} aria-current={zone.id === concern?.id ? "true" : undefined} href={`/protect/${domain.id}?concern=${encodeURIComponent(zone.id)}`} onClick={(event) => { event.preventDefault(); onSelect(zone.id); }}>{zone.label}{zone.demonstration ? <small>Interactive demo</small> : null}</a>)}
      </div>
    </section>
  );
}
