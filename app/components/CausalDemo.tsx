"use client";

import { useEffect, useReducer, useSyncExternalStore } from "react";
import { demonstrationReducer, initialDemonstrationState, type DemonstrationConfig } from "@/app/lib/demo";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function CausalDemo({ config }: { config: DemonstrationConfig }) {
  const [state, dispatch] = useReducer(demonstrationReducer, initialDemonstrationState);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);
  const visualStage = reducedMotion ? config.stages.length - 1 : state.stageIndex;

  useEffect(() => {
    if (state.status !== "playing" || reducedMotion) return;
    const timer = window.setTimeout(() => dispatch({ type: "ADVANCE", stageCount: config.stages.length }), 1150);
    return () => window.clearTimeout(timer);
  }, [config.stages.length, reducedMotion, state.stageIndex, state.status]);

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden) dispatch({ type: "PAUSE" });
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, []);

  const status = reducedMotion
    ? "Reduced motion: complete sequence shown"
    : state.status === "idle"
      ? "Ready"
      : state.status === "skipped"
        ? "Animation skipped; full narration remains below"
        : state.status === "complete"
          ? "Sequence complete"
          : `${state.status}: ${config.stages[state.stageIndex].label}`;

  return (
    <section className="causal-demo" data-demo={config.id} data-stage={visualStage} aria-labelledby={`demo-${config.id}`}>
      <div className="demo-copy">
        <p className="eyebrow">Cause-and-effect demonstration</p>
        <h3 id={`demo-${config.id}`}>{config.title}</h3>
        <p>{config.summary}</p>
        <div className="demo-controls" aria-label="Demonstration controls">
          {state.status !== "playing" ? <button className="button-primary" type="button" onClick={() => dispatch({ type: state.status === "complete" || state.status === "skipped" ? "REPLAY" : "PLAY" })}>{state.status === "idle" ? "Play sequence" : "Replay"}</button> : <button className="button-primary" type="button" onClick={() => dispatch({ type: "PAUSE" })}>Pause</button>}
          {!reducedMotion && state.status !== "skipped" ? <button className="button-subtle" type="button" onClick={() => dispatch({ type: "SKIP" })}>Skip motion</button> : null}
        </div>
        <p className="demo-status" aria-live="polite">{status}</p>
      </div>
      <div className="demo-visual" aria-hidden="true"><div className="demo-environment"><span className="demo-source" /><span className="demo-sensor" /><span className="demo-response" /><span className="demo-signal" /></div></div>
      <ol className="demo-narration">
        {config.stages.map((stage, index) => <li key={stage.label} className={index === visualStage || reducedMotion ? "is-current" : index < visualStage ? "is-complete" : ""}><span>{stage.label}</span><p>{stage.narration}</p></li>)}
      </ol>
      <p className="demo-disclaimer">{config.disclaimer}</p>
    </section>
  );
}
