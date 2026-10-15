"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Device } from "@/app/lib/data";
import type { BuilderAnswers, BuilderArchitecture, BuilderOrchestratorState, DeviceProject, SourcingLine } from "@/app/lib/builder-contract";
import { applyExecution, applyOrchestrator, applyResearch, classifyBuilderSafety, createDeviceProject, inferCapability, selectProjectArchitecture } from "@/app/lib/builder-engine";
import { inferDeviceIntelligence } from "@/app/lib/device-intelligence";
import { buildPackFiles, createStoredZip } from "@/app/lib/builder-pack";
import { customBuildBoundary } from "@/app/lib/solution-contract";

const DEFAULT_ANSWERS: BuilderAnswers = { environment: "indoor", power: "usb", connectivity: "wifi", deploymentIntent: "auto", quantity: 1, goal: "functional-prototype", budget: "30-75" };
const STORAGE_KEY = "smartdevices-builder-projects-v3";

function money(value: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value); }
function safeFilename(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "smart-device"; }
function statusLabel(value: string) { return value.replaceAll("-", " "); }

function saveLocalProject(project: DeviceProject) {
  try {
    const previous = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as DeviceProject[];
    const next = [project, ...previous.filter((item) => item.id !== project.id)].slice(0, 12);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch { /* local persistence is optional */ }
}

export function DeviceBuilder({ publishedDevices, sourceContext = "direct", initialProject = null }: { publishedDevices: Device[]; sourceContext?: DeviceProject["sourceContext"]; initialProject?: DeviceProject | null }) {
  const [idea, setIdea] = useState(initialProject?.idea ?? "");
  const [stage, setStage] = useState<"idea" | "requirements" | "workspace">(initialProject ? "workspace" : "idea");
  const [answers, setAnswers] = useState<BuilderAnswers>(initialProject?.answers ?? DEFAULT_ANSWERS);
  const [project, setProject] = useState<DeviceProject | null>(initialProject);
  const [orchestratorPreview, setOrchestratorPreview] = useState<BuilderOrchestratorState | null>(initialProject?.orchestrator ?? null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState<"orchestrate" | "research" | "source" | "execute" | "save" | null>(null);
  const preliminary = useMemo(() => idea.trim().length >= 12 ? { capability: inferCapability(idea), safety: classifyBuilderSafety(idea, answers), intelligence: inferDeviceIntelligence(idea, answers) } : null, [idea, answers]);

  useEffect(() => { if (project) saveLocalProject(project); }, [project]);

  async function analyzeIdea() {
    if (idea.trim().length < 12) { setNotice("Give Builder a little more detail about what the device should do."); return; }
    setNotice(""); setBusy("orchestrate");
    try {
      const response = await fetch("/api/builder/orchestrate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idea, answers }) });
      if (response.ok) {
        const data = await response.json() as { orchestrator?: BuilderOrchestratorState };
        if (data.orchestrator) setOrchestratorPreview(data.orchestrator);
      }
    } catch { setNotice("The model-assisted requirements pass is unavailable; Builder will use its deterministic engineering intake instead."); }
    finally { setBusy(null); setStage("requirements"); window.requestAnimationFrame(() => document.getElementById("builder-requirements")?.scrollIntoView({ block: "start" })); }
  }

  function buildProject() {
    let next = createDeviceProject(idea, answers, publishedDevices, sourceContext);
    if (orchestratorPreview) next = applyOrchestrator(next, orchestratorPreview);
    setProject(next); setStage("workspace"); setNotice("");
    window.requestAnimationFrame(() => document.getElementById("builder-workspace")?.scrollIntoView({ block: "start" }));
  }

  function pickArchitecture(id: BuilderArchitecture["id"]) { if (project) setProject(selectProjectArchitecture(project, id)); }

  async function runResearch() {
    if (!project) return; setBusy("research"); setNotice("");
    try {
      const response = await fetch("/api/builder/research", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(project) });
      const data = await response.json() as { research?: DeviceProject["research"]; error?: { message?: string } };
      if (!response.ok || !data.research) throw new Error(data.error?.message || "Live research failed.");
      setProject(applyResearch(project, data.research));
      setNotice(data.research.status === "live" ? "Live market research added as a new project revision." : "Live market research is not activated; catalog research remains the current evidence layer.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Live research is unavailable."); }
    finally { setBusy(null); }
  }

  async function runSourcing() {
    if (!project) return; setBusy("source"); setNotice("");
    try {
      const response = await fetch("/api/builder/source", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(project) });
      const data = await response.json() as { sourcing?: SourcingLine[]; status?: string; detail?: string; error?: { message?: string } };
      if (!response.ok || !Array.isArray(data.sourcing)) throw new Error(data.error?.message || "Live sourcing failed.");
      setProject({ ...project, sourcing: data.sourcing, revision: project.revision + 1, updatedAt: new Date().toISOString() });
      setNotice(data.status === "live" ? "Live supplier data added as a new revision." : data.detail || "A live sourcing provider is not activated.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Live sourcing is unavailable."); }
    finally { setBusy(null); }
  }

  async function runExecution() {
    if (!project || project.safetyClass === "blocked-autonomous") return; setBusy("execute"); setNotice("");
    try {
      const response = await fetch("/api/builder/execute", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(project) });
      const data = await response.json() as { execution?: DeviceProject["execution"]; status?: string; error?: { message?: string } };
      if (!response.ok || !data.execution) throw new Error(data.error?.message || "Build execution failed.");
      setProject(applyExecution(project, data.execution));
      setNotice(data.status === "completed" ? "Compiler/CAD executor results added as a new revision." : "The Build Executor is not activated in this deployment; no validation was fabricated.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Build execution is unavailable."); }
    finally { setBusy(null); }
  }

  async function saveHosted() {
    if (!project) return; setBusy("save"); setNotice("");
    try {
      const response = await fetch(project.hosted ? `/api/builder/projects/${project.id}` : "/api/builder/projects", { method: project.hosted ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(project) });
      const data = await response.json() as { project?: DeviceProject; url?: string; error?: { message?: string } };
      if (!response.ok || !data.project) throw new Error(response.status === 401 ? "Sign in with ChatGPT to save this project to SmartDevices." : data.error?.message || "Hosted save failed.");
      setProject(data.project); setNotice(`Hosted revision saved. ${data.url ?? ""}`.trim());
    } catch (error) { setNotice(error instanceof Error ? error.message : "Hosted save is unavailable."); }
    finally { setBusy(null); }
  }

  function downloadPack() {
    if (!project) return;
    const blob = createStoredZip(buildPackFiles(project)); const href = URL.createObjectURL(blob); const anchor = document.createElement("a");
    anchor.href = href; anchor.download = `SmartDevices_${safeFilename(project.title)}_R${project.revision}_Build_Pack.zip`; document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(href);
    setNotice("Build Pack created locally in your browser.");
  }

  function restart() { setIdea(""); setAnswers(DEFAULT_ANSWERS); setOrchestratorPreview(null); setStage("idea"); setProject(null); setNotice(""); }

  return <div className="device-builder">
    <section className="builder-hero" aria-labelledby="builder-title"><div className="builder-hero-copy"><p className="eyebrow">SmartDevices Builder · Live Device Engine</p><h1 id="builder-title">Describe the device you wish existed.</h1><p>Builder turns a physical problem into an intelligent-device project: research, requirements, operating model, prototype architecture, sourcing, executable build checks and a portable Build Pack.</p>{sourceContext === "farmers" ? <div className="builder-source-boundary"><strong>Coming from the Farmers flow?</strong><span>Builder can solve a separate protection problem, but a custom build does not replace or satisfy a Farmers device requirement.</span></div> : null}</div><div className="builder-principles" aria-label="Builder principles"><span>Research before invention</span><span>Persistent revisions</span><span>Mesh when it adds value</span><span>Validation must be executed</span></div></section>

    <nav className="builder-stage-nav" aria-label="Builder progress">{["Idea", "Requirements", "Build workspace"].map((label, index) => <span key={label} className={(stage === "idea" ? 0 : stage === "requirements" ? 1 : 2) === index ? "is-current" : index < (stage === "idea" ? 0 : stage === "requirements" ? 1 : 2) ? "is-complete" : ""}>{label}</span>)}</nav>

    {stage === "idea" ? <section className="builder-intake" aria-labelledby="builder-intake-title"><div><p className="eyebrow">Start with the problem</p><h2 id="builder-intake-title">What do you want the device to do?</h2><p>Describe the outcome in normal language. Builder will separate what it can infer from what actually needs your answer.</p></div><div className="builder-prompt-card"><label htmlFor="builder-idea">Your device idea</label><textarea id="builder-idea" rows={7} value={idea} onChange={(event) => setIdea(event.target.value)} placeholder="Example: I need temperature monitors across 15 restaurant locations and I want our operations agent to discover each unit and know when one needs attention." />{preliminary ? <div className="builder-preflight"><span>Likely capability <strong>{statusLabel(preliminary.capability)}</strong></span><span>Operating mode <strong>{statusLabel(preliminary.intelligence.mode)}</strong></span><span>Safety path <strong>{statusLabel(preliminary.safety.safetyClass)}</strong></span></div> : null}{notice ? <p className="builder-notice" role="status">{notice}</p> : null}<button className="button-primary" type="button" onClick={analyzeIdea} disabled={busy === "orchestrate"}>{busy === "orchestrate" ? "Interpreting the device…" : "Research + plan this device"}</button></div><div className="builder-example-grid" aria-label="Example projects">{["Restaurant freezer monitor", "Delivery locker notifier", "Greenhouse moisture monitor", "Mesh-native freezer fleet"].map((item) => <button key={item} type="button" onClick={() => setIdea(item === "Restaurant freezer monitor" ? "Alert our restaurant team if a freezer gets too warm for more than ten minutes." : item === "Delivery locker notifier" ? "Tell our front desk when a delivery locker has been opened and show the last-opened time." : item === "Greenhouse moisture monitor" ? "Track soil moisture in a greenhouse bed and show when it is getting dry." : "I need 100 temperature monitors across 15 restaurant locations. Each physical unit should keep a persistent identity, our AI operations agent should discover them as a fleet, subscribe to temperature and door events, and request diagnostics when a unit needs attention.")}>{item}<span>→</span></button>)}</div></section> : null}

    {stage === "requirements" ? <section id="builder-requirements" className="builder-requirements" aria-labelledby="builder-requirements-title"><div className="builder-section-heading"><div><p className="eyebrow">Requirements</p><h2 id="builder-requirements-title">Ask only what materially changes the device.</h2></div><button className="button-subtle" type="button" onClick={() => setStage("idea")}>Edit idea</button></div><blockquote className="builder-idea-quote">{idea}</blockquote>{orchestratorPreview ? <div className="builder-orchestrator"><div><span>{statusLabel(orchestratorPreview.status)}</span><strong>{orchestratorPreview.summary}</strong></div>{orchestratorPreview.clarifyingQuestions.length ? <div><p className="eyebrow">Questions that still matter</p>{orchestratorPreview.clarifyingQuestions.map((question) => <article key={question.id}><strong>{question.question}</strong><p>{question.whyItMatters}</p>{question.suggestedAnswer ? <small>Likely direction: {question.suggestedAnswer}</small> : null}</article>)}</div> : <p>No additional material questions were identified before architecture selection.</p>}</div> : null}<div className="builder-question-grid">
      <label>Environment<select value={answers.environment} onChange={(e) => setAnswers({ ...answers, environment: e.target.value as BuilderAnswers["environment"] })}><option value="indoor">Indoor</option><option value="garage">Garage / utility space</option><option value="outdoor-sheltered">Outdoor, sheltered</option><option value="outdoor-exposed">Outdoor, exposed</option></select></label>
      <label>Power<select value={answers.power} onChange={(e) => setAnswers({ ...answers, power: e.target.value as BuilderAnswers["power"] })}><option value="usb">USB power available</option><option value="replaceable-battery">Replaceable batteries</option><option value="either">Either is fine</option></select></label>
      <label>Connectivity<select value={answers.connectivity} onChange={(e) => setAnswers({ ...answers, connectivity: e.target.value as BuilderAnswers["connectivity"] })}><option value="wifi">Wi-Fi</option><option value="bluetooth">Bluetooth</option><option value="local-only">Local only</option><option value="not-sure">Not sure</option></select></label>
      <label>Operating model<select value={answers.deploymentIntent} onChange={(e) => setAnswers({ ...answers, deploymentIntent: e.target.value as BuilderAnswers["deploymentIntent"] })}><option value="auto">Let Builder decide</option><option value="standalone">Standalone</option><option value="connected">Connected</option><option value="mesh-ready">Mesh-ready</option><option value="mesh-native">Mesh-native</option></select></label>
      <label>Target quantity<select value={answers.quantity} onChange={(e) => setAnswers({ ...answers, quantity: Number(e.target.value) as BuilderAnswers["quantity"] })}><option value="1">1 prototype</option><option value="5">5 units</option><option value="10">10 units</option><option value="100">100 units</option></select></label>
      <label>Goal<select value={answers.goal} onChange={(e) => setAnswers({ ...answers, goal: e.target.value as BuilderAnswers["goal"] })}><option value="proof-of-concept">Prove the idea</option><option value="functional-prototype">Build something usable</option><option value="small-batch">Prepare for a small batch</option><option value="product">Explore a real product</option></select></label>
      <label>Prototype budget<select value={answers.budget} onChange={(e) => setAnswers({ ...answers, budget: e.target.value as BuilderAnswers["budget"] })}><option value="under-30">Under $30</option><option value="30-75">$30–$75</option><option value="75-150">$75–$150</option><option value="flexible">Flexible</option></select></label>
    </div><div className="builder-preview-grid"><div className={`builder-safety-preview ${classifyBuilderSafety(idea, answers).safetyClass}`}><strong>{classifyBuilderSafety(idea, answers).safetyClass === "supported" ? "Builder-supported path" : classifyBuilderSafety(idea, answers).safetyClass === "review-required" ? "Engineering review path" : "Autonomous implementation blocked"}</strong><p>{classifyBuilderSafety(idea, answers).reasons[0]}</p></div><div className="builder-intelligence-preview"><strong>{statusLabel(inferDeviceIntelligence(idea, answers).mode)}</strong><p>{inferDeviceIntelligence(idea, answers).rationale[0]}</p></div></div><button className="button-primary" type="button" onClick={buildProject}>Create the build workspace</button></section> : null}

    {stage === "workspace" && project ? <section id="builder-workspace" className="builder-workspace" aria-labelledby="builder-workspace-title"><div className="builder-workspace-header"><div><p className="eyebrow">Device project · revision {project.revision}{project.hosted ? " · hosted" : " · local"}</p><h2 id="builder-workspace-title">{project.title}</h2><p>{project.idea}</p></div><div className="builder-workspace-actions"><button className="button-subtle" type="button" onClick={restart}>New project</button>{project.hosted ? <Link className="button-subtle" href={`/project/${project.id}`}>Hosted URL</Link> : null}<button className="button-subtle" type="button" onClick={saveHosted} disabled={busy !== null}>{busy === "save" ? "Saving…" : project.hosted ? "Save revision" : "Save online"}</button><button className="button-primary" type="button" onClick={downloadPack} disabled={project.safetyClass === "blocked-autonomous"}>Download Build Pack</button></div></div>{notice ? <p className="builder-notice" role="status">{notice}</p> : null}<div className="builder-summary-grid"><article><span>Revision level</span><strong>{project.architectures.find((item) => item.id === project.selectedArchitectureId)?.revisionLevel}</strong><small>{project.architectures.find((item) => item.id === project.selectedArchitectureId)?.name}</small></article><article><span>Planning BOM</span><strong>{money(project.planningCostUsd)}</strong><small>{project.sourcing.some((item) => item.status === "live") ? "Live sourcing partially/fully available" : "Planning cost until sourcing runs"}</small></article><article><span>Operating mode</span><strong>{statusLabel(project.intelligence.mode)}</strong><small>{statusLabel(project.intelligence.meshIntegrationStatus)}</small></article><article><span>Research</span><strong>{statusLabel(project.research.decision)}</strong><small>{statusLabel(project.research.status)}</small></article><article><span>Validation</span><strong>{project.validations.filter((item) => item.status === "pass").length}/{project.validations.length}</strong><small>Only executed checks can pass</small></article></div>

      <section className="builder-live-actions" aria-label="Live Device Engine actions"><button type="button" onClick={runResearch} disabled={busy !== null}>{busy === "research" ? "Researching…" : "Run live market research"}</button><button type="button" onClick={runSourcing} disabled={busy !== null}>{busy === "source" ? "Sourcing…" : "Check live sourcing"}</button><button type="button" onClick={runExecution} disabled={busy !== null || project.safetyClass === "blocked-autonomous"}>{busy === "execute" ? "Running…" : "Compile + generate CAD"}</button></section>

      <section className="builder-buy-build" aria-labelledby="buy-build-title"><div><p className="eyebrow">Research before invention</p><h3 id="buy-build-title">{statusLabel(project.research.decision)} is the current path.</h3><p>{project.research.marketSummary}</p><ul>{project.research.rationale.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="builder-existing-list">{project.research.candidates.length ? project.research.candidates.map((candidate) => <article key={`${candidate.name}-${candidate.url ?? "local"}`}><span>{candidate.fit} fit</span><strong>{candidate.name}</strong><p>{candidate.notes}</p>{candidate.estimatedPrice ? <small>{candidate.estimatedPrice}</small> : null}{candidate.url ? candidate.url.startsWith("/") ? <Link href={candidate.url}>Review →</Link> : <a href={candidate.url} target="_blank" rel="noreferrer">Source →</a> : null}</article>) : <div className="builder-empty-match"><strong>No current candidate recorded.</strong><p>Run live market research before treating custom fabrication as the final decision.</p></div>}</div>{project.research.sources.length ? <div className="builder-research-sources"><p className="eyebrow">Research sources</p>{project.research.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title}{source.publisher ? ` · ${source.publisher}` : ""}</a>)}</div> : null}</section>

      <section className="builder-capability-requirements" aria-labelledby="capability-requirements-title"><div><p className="eyebrow">Capability-first plan</p><h3 id="capability-requirements-title">What the device must be able to do.</h3><p>Categories help people navigate. These normalized capability IDs are the interoperable requirements used to compare existing devices and shape a build.</p></div><div className="builder-capability-list">{project.requiredCapabilities.length ? project.requiredCapabilities.map((item) => <article key={item.id}><code>{item.id}</code><p>{item.rationale}</p></article>) : <article><strong>Capability clarification required</strong><p>The idea is still too general to assign a truthful normalized capability.</p></article>}</div></section>

      <section className="builder-intelligence" aria-labelledby="intelligence-title"><div><p className="eyebrow">Intelligence architecture</p><h3 id="intelligence-title">Give the device only as much network intelligence as it needs.</h3><p>Standalone, conventionally connected, Mesh-ready and Mesh-native are explicit architecture choices—not branding labels.</p></div><div className="builder-intelligence-card"><span>{statusLabel(project.intelligence.mode)}</span><strong>{project.intelligence.mode === "mesh-native" ? "Mesh is part of the intended operating model." : project.intelligence.mode === "mesh-ready" ? "Preserve a clean Mesh upgrade path." : project.intelligence.mode === "connected" ? "Ordinary connectivity is enough for now." : "Network identity is unnecessary for this revision."}</strong><ul>{project.intelligence.rationale.map((item) => <li key={item}>{item}</li>)}</ul><dl><div><dt>Domain binding</dt><dd>{statusLabel(project.intelligence.domainBinding)}</dd></div><div><dt>Mesh status</dt><dd>{statusLabel(project.intelligence.meshIntegrationStatus)}</dd></div><div><dt>Capability surface</dt><dd>{project.intelligence.capabilities.length ? statusLabel(project.intelligence.capabilities.join(", ")) : "none required"}</dd></div></dl>{project.intelligence.mode === "mesh-native" ? <p className="builder-mesh-caveat">Architecture is Mesh-native, but a runtime, domain binding, permissions service and live agent connection still require deployment activation.</p> : null}</div></section>

      <section className="builder-architectures" aria-labelledby="architecture-title"><div className="builder-section-heading"><div><p className="eyebrow">Build strategy</p><h3 id="architecture-title">Choose how far to engineer it.</h3></div></div><div className="builder-architecture-grid">{project.architectures.map((architecture) => <button key={architecture.id} type="button" className={project.selectedArchitectureId === architecture.id ? "builder-architecture is-selected" : "builder-architecture"} onClick={() => pickArchitecture(architecture.id)}><span>{architecture.revisionLevel}</span><strong>{architecture.name}</strong><p>{architecture.summary}</p><ul>{architecture.tradeoffs.map((item) => <li key={item}>{item}</li>)}</ul></button>)}</div></section>

      {project.safetyClass === "blocked-autonomous" ? <section className="builder-stop-panel"><p className="eyebrow">Engineering boundary</p><h3>Builder stops before implementation.</h3><p>{project.safetyReasons.join(" ")}</p><p>The requirements can still brief a qualified engineer, but detailed BOM/firmware/CAD/assembly instructions are intentionally withheld.</p></section> : <><section className="builder-bom" aria-labelledby="bom-title"><div className="builder-section-heading"><div><p className="eyebrow">Bill of materials</p><h3 id="bom-title">Module-first, with sourcing status attached.</h3></div><strong>{money(project.planningCostUsd)} planning total</strong></div><div className="builder-table-wrap"><table><thead><tr><th>Part</th><th>Why</th><th>Constraint</th><th>Sourcing</th><th>Plan cost</th></tr></thead><tbody>{project.bom.map((item) => { const source = project.sourcing.find((line) => line.bomId === item.id); return <tr key={item.id}><td><strong>{item.name}</strong><small>{item.category}</small></td><td>{item.reason}</td><td>{item.voltage}</td><td>{source?.status ?? "planning"}{source?.supplier ? ` · ${source.supplier}` : ""}{source?.unitPriceUsd !== undefined ? ` · $${source.unitPriceUsd.toFixed(2)}` : ""}</td><td>{money(item.extendedPlanningCostUsd)}</td></tr>; })}</tbody></table></div></section><section className="builder-output-grid"><article><p className="eyebrow">Firmware · {statusLabel(project.execution.firmware.status)}</p><h3>{project.execution.firmware.status === "pass" ? "Compiled by the Build Executor" : "Firmware source"}</h3><p>{project.execution.firmware.detail}</p>{project.execution.firmware.artifactUrls?.length ? <div className="builder-artifact-links">{project.execution.firmware.artifactUrls.map((item) => <a key={item.url} href={item.url} target="_blank" rel="noreferrer">{item.name} ↓</a>)}</div> : null}<pre>{project.firmware.slice(0, 520)}…</pre></article><article><p className="eyebrow">CAD · {statusLabel(project.execution.cad.status)}</p><h3>{project.execution.cad.status === "pass" ? "Geometry generated by the Build Executor" : "Parametric CadQuery source"}</h3><p>{project.execution.cad.detail}</p>{project.execution.cad.artifactUrls?.length ? <div className="builder-artifact-links">{project.execution.cad.artifactUrls.map((item) => <a key={item.url} href={item.url} target="_blank" rel="noreferrer">{item.name} ↓</a>)}</div> : null}<pre>{project.cadSource.slice(0, 520)}…</pre></article></section><section className="builder-validation" aria-labelledby="validation-title"><div><p className="eyebrow">Engineering checks</p><h3 id="validation-title">Pass only what actually ran.</h3></div><div className="builder-validation-list">{project.validations.map((item) => <article key={item.id} className={`is-${item.status}`}><span>{item.status === "pass" ? "✓" : item.status === "fail" ? "×" : item.status === "review" ? "!" : "—"}</span><div><strong>{item.label}</strong><p>{item.detail}</p></div></article>)}</div></section></>}

      <aside className="builder-insurance-boundary"><div><p className="eyebrow">Separate truth state</p><h3>Custom protection is not carrier compliance.</h3></div><p>{customBuildBoundary.note}</p>{sourceContext === "farmers" ? <Link href="/farmers">Return to Farmers guidance →</Link> : <Link href="/insurance">Check insurance guidance →</Link>}</aside></section> : null}
  </div>;
}
