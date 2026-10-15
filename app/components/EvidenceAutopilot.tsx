"use client";

import { useState } from "react";
import type { EvidenceDashboard } from "@/app/lib/evidence-store";
import type { EvidenceSourceCheck, EvidenceRefreshSummary } from "@/app/lib/evidence-refresh";

type Result = { mode?: string; runId: string; summary: EvidenceRefreshSummary; checks: EvidenceSourceCheck[] };

const outcomeCopy: Record<EvidenceSourceCheck["outcome"], string> = {
  confirmed: "Confirmed",
  baseline: "Baseline captured",
  changed: "Change detected",
  unavailable: "Source unavailable",
  invalid: "Blocked safely",
};

export function EvidenceAutopilot({ initial }: { initial: EvidenceDashboard }) {
  const [result, setResult] = useState<Result | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle");
  const [message, setMessage] = useState("");
  const [resolved, setResolved] = useState<Record<string, string>>({});

  async function refresh() {
    setStatus("running");
    setMessage("Checking approved primary sources and comparing them with the published evidence…");
    try {
      const response = await fetch("/api/admin/evidence", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "refresh" }) });
      const payload = await response.json() as Result & { error?: { message?: string } };
      if (!response.ok) throw new Error(payload.error?.message ?? "Refresh could not complete.");
      setResult(payload);
      setMessage(payload.summary.needsReview ? `${payload.summary.needsReview} source${payload.summary.needsReview === 1 ? "" : "s"} need a decision. Safe renewals were handled automatically.` : "All available evidence was handled safely. No material review is required.");
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Refresh could not complete.");
    }
  }

  async function decide(check: EvidenceSourceCheck, decision: "confirm-unchanged" | "mark-stale") {
    const runId = result?.runId ?? initial.latestRun?.id;
    if (!runId) return;
    setResolved((current) => ({ ...current, [check.sourceId]: "working" }));
    try {
      const response = await fetch("/api/admin/evidence", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "decision", runId, sourceId: check.sourceId, decision }) });
      const payload = await response.json() as { error?: { message?: string } };
      if (!response.ok) throw new Error(payload.error?.message ?? "Decision could not be recorded.");
      setResolved((current) => ({ ...current, [check.sourceId]: decision }));
      setMessage(decision === "mark-stale" ? "The source and its dependent positive guidance were marked stale in a new publication snapshot." : "The reviewed source was confirmed without introducing a stronger claim.");
    } catch (error) {
      setResolved((current) => ({ ...current, [check.sourceId]: "error" }));
      setMessage(error instanceof Error ? error.message : "Decision could not be recorded.");
    }
  }

  const summary = result?.summary ?? initial.latestRun?.summary;
  const checks = result?.checks ?? initial.checks;
  return <main className="evidence-console">
    <header className="evidence-console-hero">
      <div><p className="eyebrow">Evidence Autopilot</p><h1>Keep the facts current without babysitting the catalog.</h1><p>One refresh checks approved sources, renews unchanged evidence, isolates material changes and removes unsupported confidence.</p></div>
      <button className="button-primary evidence-refresh-button" type="button" onClick={refresh} disabled={status === "running"}>{status === "running" ? "Refreshing evidence…" : "Refresh all evidence"}</button>
    </header>

    <section className="evidence-command-card" aria-live="polite">
      <div><span>Governed sources</span><strong>{initial.sourceCount}</strong></div>
      <div><span>Storage</span><strong>{initial.mode === "active" ? "Active" : "Activation needed"}</strong></div>
      <div><span>Last run</span><strong>{initial.latestRun ? new Date(initial.latestRun.startedAt).toLocaleDateString() : "Not run yet"}</strong></div>
      <div><span>Published snapshot</span><strong>{initial.activeSnapshot ? `Version ${initial.activeSnapshot.sequence}` : "File baseline"}</strong></div>
    </section>

    {message ? <p className={status === "error" ? "evidence-message is-error" : "evidence-message"}>{message}</p> : null}

    {summary ? <section className="evidence-summary" aria-labelledby="evidence-summary-heading"><div><p className="eyebrow">Latest result</p><h2 id="evidence-summary-heading">Attention only where it matters.</h2></div><div className="evidence-summary-grid"><article><strong>{summary.confirmed}</strong><span>Confirmed</span></article><article><strong>{summary.autoRenewable}</strong><span>Safe renewals</span></article><article><strong>{summary.changed}</strong><span>Changed</span></article><article><strong>{summary.needsReview}</strong><span>Need review</span></article></div></section> : null}

    <section className="evidence-queue" aria-labelledby="evidence-queue-heading">
      <div className="evidence-section-heading"><div><p className="eyebrow">Review queue</p><h2 id="evidence-queue-heading">Every source has one literal state.</h2></div><p>New or stronger claims never publish automatically.</p></div>
      {checks.length ? <ol>{checks.map((check) => <li key={`${check.sourceId}-${check.checkedAt}`}><div><span className={`evidence-outcome outcome-${check.outcome}`}>{outcomeCopy[check.outcome]}</span><h3>{check.sourceId}</h3><p>{check.changeClass === "none" ? "The normalized source is unchanged and can be renewed." : check.changeClass === "carrier-material" ? "Carrier-controlled content changed. Positive guidance remains approval-gated." : check.changeClass === "source-failure" ? "The source could not support a current positive label." : "A product or technical source changed and needs review."}</p>{resolved[check.sourceId] && resolved[check.sourceId] !== "working" ? <small className="evidence-decision-recorded">Decision recorded: {resolved[check.sourceId].replaceAll("-", " ")}</small> : null}</div><div><span>Next action</span><strong>{check.nextAction.replaceAll("-", " ")}</strong><a href={check.sourceUrl} target="_blank" rel="noreferrer">Open official source ↗</a>{check.outcome === "baseline" || check.outcome === "changed" ? <button type="button" className="evidence-decision" disabled={resolved[check.sourceId] === "working" || Boolean(resolved[check.sourceId] && resolved[check.sourceId] !== "error")} onClick={() => decide(check, "confirm-unchanged")}>Facts reviewed—unchanged</button> : null}{check.outcome === "unavailable" || check.outcome === "invalid" || check.outcome === "changed" ? <button type="button" className="evidence-decision is-conservative" disabled={resolved[check.sourceId] === "working" || Boolean(resolved[check.sourceId] && resolved[check.sourceId] !== "error")} onClick={() => decide(check, "mark-stale")}>Mark guidance stale</button> : null}</div></li>)}</ol> : <div className="evidence-empty"><strong>No refresh results yet.</strong><p>Run Evidence Autopilot to create the first source fingerprint and review queue.</p></div>}
    </section>

    <aside className="evidence-safety-contract"><strong>The automatic-confidence rule</strong><p>SmartDevices may automatically become more conservative. It may not automatically become more confident.</p></aside>
  </main>;
}
