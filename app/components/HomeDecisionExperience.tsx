"use client";

import { compatibilityDimensions } from "@/app/lib/compatibility-dimensions";
import { recordMetric } from "@/app/lib/metrics-client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getDomain, type Device } from "@/app/lib/data";
import { homeOptions, sanitizeHomeContext, waterGoals, type HomeEntry, type WaterGoal } from "@/app/lib/home-decision";
import { createLocalPlan, encodePlanSelection, type SafetyPlan } from "@/app/lib/plan";
import { persistLocalPlan, readLocalPlan } from "@/app/lib/local-plan-store";
import { HomePlanActions } from "./HomePlanActions";
import "./home-decision.css";

type Props = { publishedDevices: Device[]; initialConcern?: string; initialEntry?: HomeEntry; initialGoal?: WaterGoal; planId?: string; planOptions?: Device[]; carrierContext?: boolean; localContext?: SafetyPlan["homeContext"] };
const home = getDomain("home")!;
const topicLabels: Record<string, string> = { water: "Water leaks", "fire-electrical": "Fire + smoke", security: "Home security", "vacant-monitoring": "While you’re away", "garage-access": "Garage + access", "home-temperature": "Temperature" };

export function HomeDecisionExperience({ publishedDevices, initialConcern = "water", initialEntry = "help", initialGoal = "all", planId, planOptions, carrierContext = false, localContext }: Props) {
  const [concernId, setConcernId] = useState(initialConcern);
  const [entry, setEntry] = useState<HomeEntry>(initialEntry);
  const [goal, setGoal] = useState<WaterGoal>(initialGoal);
  const [permission, setPermission] = useState<"yes" | "no" | "unknown">("unknown");
  const [connection, setConnection] = useState<"yes" | "no" | "unknown">("unknown");
  const effectivePermission = planId ? localContext?.permission ?? "unknown" : permission;
  const effectiveConnection = planId ? localContext?.connection ?? "unknown" : connection;
  const [selected, setSelected] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const [showHow, setShowHow] = useState(false);
  const [openedPlan, setOpenedPlan] = useState<string | null>(null);
  const resultRef = useRef<HTMLElement>(null);
  const capabilityRef = useRef<HTMLElement>(null);
  const concern = home.concerns.find((item) => item.id === concernId) ?? home.concerns[0];
  const options = planOptions ? planOptions.filter((device) => device.status !== "archived") : homeOptions(publishedDevices, concern.id, goal);
  const selectedDevices = options.filter((device) => selected.includes(device.id));

  useEffect(() => {
    if (planId) { if(readLocalPlan(planId))recordMetric("plan_reopen_local"); return; }
    recordMetric("builder_start");
    function restore() {
      const context = sanitizeHomeContext(new URLSearchParams(window.location.search));
      setConcernId(context.concern); setEntry(context.entry); setGoal(context.goal); setSelected([]); setNotice(""); setOpenedPlan(null); setShowHow(false);
    }
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [planId]);

  function navigate(nextConcern: string, nextEntry = entry, nextGoal = goal) {
    recordMetric("builder_step");
    setConcernId(nextConcern); setEntry(nextEntry); setGoal(nextGoal); setSelected([]); setNotice(""); setOpenedPlan(null); setShowHow(false);
    if (!planId) window.history.pushState({}, "", `/protect/home?${new URLSearchParams({ concern: nextConcern, entry: nextEntry, goal: nextGoal })}`);
  }

  function toggle(device: Device) {
    if (!selected.includes(device.id)) recordMetric("compare_start");
    setOpenedPlan(null);
    setSelected((current) => current.includes(device.id) ? current.filter((id) => id !== device.id) : [...current, device.id].slice(0, 3));
    setNotice(`${device.manufacturer} ${device.model} ${selected.includes(device.id) ? "removed from" : "added to"} your comparison plan. No purchase or installation is recorded.`);
  }

  function savePlan() {
    if (!selectedDevices.length) return;
    const plan = createLocalPlan("home", concern.id, selectedDevices.map((device) => device.id));
    plan.homeContext = { goal, permission, connection };
    const mode = persistLocalPlan(plan);
    recordMetric("builder_complete");
    if(mode === "local-storage") recordMetric("plan_save_local");
    if (mode === "memory") {
      setOpenedPlan(plan.id); setNotice("Browser storage is unavailable. Your plan is open below for this visit; download the summary before leaving.");
      return;
    }
    window.location.assign(`/plans/${plan.id}?${encodePlanSelection(plan)}&view=home-decision`);
  }

  return <section className="home-decision" aria-labelledby="home-decision-title">
    <header className="hd-heading"><div><p className="eyebrow">{planId ? "Your Home device plan" : "Home protection"}</p><h1 id="home-decision-title">{planId ? "Your next step, made clearer." : "A smarter home starts here."}</h1><p>{planId ? "Compare the options in this plan. Choose what happens next." : "Understand what can help. Choose a device. Know what to do next."}</p></div><Link className="hd-text-link" href="/my-plan">Return to my plans</Link></header>

    {!planId ? <nav className="hd-entry" aria-label="How would you like to begin?">
      <button type="button" aria-pressed={entry === "help"} onClick={() => { navigate(concern.id, "help"); capabilityRef.current?.focus({ preventScroll: true }); capabilityRef.current?.scrollIntoView({ behavior: "instant", block: "start" }); }}><strong>Help me choose</strong><span>Start with a protection concern</span></button>
      <Link href="/insurance"><strong>My insurer mentioned a device</strong><span>Check the right guidance first</span></Link>
      <button type="button" aria-pressed={entry === "known"} onClick={() => { navigate(concern.id, "known"); resultRef.current?.focus({ preventScroll: true }); resultRef.current?.scrollIntoView({ behavior: "instant", block: "start" }); }}><strong>I know what I need</strong><span>Go straight to suitable options</span></button>
    </nav> : <aside className="hd-context"><strong>{carrierContext ? "Insurance context is included in this plan." : "A focused set of options to discuss."}</strong><p>A shared link does not authenticate its sender or establish a policy requirement. Confirm the exact capability and acceptable model with your agent before buying.</p></aside>}

    {!planId ? <nav className="hd-topics" aria-label="Home protection areas">{home.concerns.map((item) => <button key={item.id} type="button" aria-pressed={concern.id === item.id} onClick={() => navigate(item.id, entry, "all")}>{topicLabels[item.id]}</button>)}</nav> : null}

    <div className="hd-workbench">
      <section className="hd-decision-card" ref={capabilityRef} tabIndex={-1} aria-labelledby="hd-capability-title">
        <p className="eyebrow">{planId ? "Understand the capability" : "01 · Choose the capability"}</p><h2 id="hd-capability-title">{concern.id === "water" ? "What should your water protection do?" : concern.prompt}</h2>
        {concern.id === "water" && !planId ? <fieldset className="hd-goals"><legend className="sr-only">Water protection goal</legend>{waterGoals.map((item) => <label key={item.id} className={goal === item.id ? "is-selected" : ""}><input type="radio" name="water-goal" value={item.id} checked={goal === item.id} onChange={() => navigate(concern.id, entry, item.id)} /><span>{item.label}</span></label>)}</fieldset> : null}
        <p>{concern.id === "water" ? planId ? "Check whether each option detects water locally, monitors the main supply, or supports automatic shutoff. These capabilities are not interchangeable." : waterGoals.find((item) => item.id === goal)?.description : concern.why}</p>
        {concern.id === "water" ? <p className="hd-boundary">A detection-only sensor is not a substitute for automatic main-line shutoff.</p> : null}
        {!planId ? <details className="hd-fit"><summary>Check a few things before you choose</summary><label>Can you authorize changes to the property?<select value={permission} onChange={(event) => setPermission(event.target.value as typeof permission)}><option value="unknown">I’m not sure / prefer not to say</option><option value="yes">Yes</option><option value="no">No — owner or HOA approval needed</option></select></label><label>Is reliable power and internet available?<select value={connection} onChange={(event) => setConnection(event.target.value as typeof connection)}><option value="unknown">I’m not sure / skip for now</option><option value="yes">Yes — exact device fit still needs checking</option><option value="no">No / unreliable</option></select></label><p>These answers affect the next-step checklist, not insurance eligibility. They stay in your device-local plan and are excluded from shared links.</p></details> : null}
        <div className="hd-primary-row"><button className="button-primary" type="button" onClick={() => { resultRef.current?.focus({ preventScroll: true }); resultRef.current?.scrollIntoView({ behavior: "instant", block: "start" }); }}>Compare {options.length ? `${options.length} option${options.length === 1 ? "" : "s"}` : "next steps"}</button><button className="hd-text-link" type="button" aria-expanded={showHow} aria-controls="hd-explanation" onClick={() => setShowHow(!showHow)}>Show me how it works</button></div>
      </section>
      <figure className="hd-house"><div className="hd-house-image">{!imageFailed ? <Image src={home.scene} width={1664} height={936} alt="Illustrative cutaway home, with a utility area, living spaces, front entrance and garage." unoptimized sizes="(max-width: 800px) 100vw, 55vw" onError={() => setImageFailed(true)} /> : <p className="hd-image-fallback">The house illustration is unavailable. All protection topics and options remain available.</p>}
        {!planId && !imageFailed ? <div className="hd-markers" aria-hidden="true">{home.concerns.filter((item) => ["water", "fire-electrical", "security", "vacant-monitoring"].includes(item.id)).map((item) => <button type="button" tabIndex={-1} key={item.id} style={{ left: `${item.position.x}%`, top: `${item.position.y}%` }} className={concern.id === item.id ? "is-active" : ""} onClick={() => navigate(item.id, entry, "all")}><span>{topicLabels[item.id]}</span></button>)}</div> : null}</div><figcaption><strong>{topicLabels[concern.id]}</strong><span>Illustrative home · not an assessment of your property</span></figcaption></figure>
    </div>

    {showHow ? <section className="hd-explanation" id="hd-explanation" aria-labelledby="hd-explanation-title"><div><p className="eyebrow">What if…?</p><h2 id="hd-explanation-title">{concern.id === "water" ? "A leak starts while you’re away." : concern.prompt}</h2><p>{concern.why}</p></div><ol>{concern.stages.map((stage, index) => <li key={stage}><span>{String(index + 1).padStart(2, "0")}</span>{stage}</li>)}</ol><p>Illustration only. Response depends on the device, setup, power and connectivity. No guaranteed prevention or insurance outcome.</p></section> : null}

    <section className="hd-options" ref={resultRef} tabIndex={-1} aria-labelledby="hd-options-title"><div className="hd-section-heading"><div><p className="eyebrow">02 · Compare what matters</p><h2 id="hd-options-title">{options.length ? "A short list. A clearer choice." : "Start with the capability, not a purchase."}</h2><p>{planId ? "These are the options included in the shared plan, not your confirmed choices." : "Compare capability and practical fit. No device is preselected."}</p></div>{!planId ? <Link className="hd-text-link" href={`/devices?domain=home&concern=${concern.id}`}>Browse the full library</Link> : null}</div>
      <div className="hd-checks"><strong>Before you commit</strong><ul>{effectivePermission !== "yes" ? <li>{effectivePermission === "no" ? "Obtain owner or HOA permission before arranging property changes." : "Confirm that you can authorize the installation or obtain permission."}</li> : null}{effectiveConnection !== "yes" ? <li>{effectiveConnection === "no" ? "Ask about power and network requirements, outage behavior and alternatives before choosing a connected device." : "Check the exact device’s power, internet and outage requirements."}</li> : null}<li>Installation cost, site compatibility and any insurer acceptance remain unconfirmed.</li></ul></div>
      {options.length ? <div className="hd-option-grid" data-count={Math.min(options.length, 3)}>{options.map((device) => <article className={selected.includes(device.id) ? "hd-option is-selected" : "hd-option"} key={device.id}><div className="hd-option-head"><p className="eyebrow">{device.manufacturer}</p><span className="hd-record-date">Record checked {device.lastReviewed}</span></div><h3>{device.model}</h3><p className="hd-solution">{device.solution}</p><p className="hd-availability">{device.status !== "active" ? "Evidence needs review — do not rely on this as current guidance." : device.availability === "unavailable" ? "Unavailable when last checked. Confirm stock before making plans." : device.availability === "available" ? "Available when last checked; reconfirm current stock." : "Current availability needs confirmation."}</p>
        <dl><div><dt>Why it appears</dt><dd>{device.bestFor}</dd></div><div><dt>Equipment cost · dated context</dt><dd>{device.priceBand}</dd></div><div><dt>Installation · separate cost</dt><dd>{device.installation}. Site-specific quote not supplied.</dd></div><div><dt>Subscription / monitoring</dt><dd>{device.subscription}</dd></div></dl>
        <details><summary>Compatibility, limitations & sources</summary><dl>{compatibilityDimensions(device).map(item=><div key={item.dimension}><dt>{item.dimension}</dt><dd>{item.statement} <strong>{item.status}.</strong></dd></div>)}</dl><ul>{device.limitations.map((item) => <li key={item}>{item}</li>)}</ul><p>Review account access, household consent and current privacy terms before activation.</p><ul>{device.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} (opens a new tab)</a></li>)}</ul><p>{device.commercialStatus === "none" ? "No affiliate or sponsored placement recorded." : `Commercial status: ${device.commercialStatus}.`}</p></details>
        <div className="hd-option-actions">{device.sources[0] ? <a className="hd-text-link" href={device.sources[0].url} target="_blank" rel="noopener noreferrer" onClick={()=>recordMetric("outbound_product_click")}>Check manufacturer details ↗</a> : null}<Link className="hd-text-link" href={`/devices/${device.slug}`}>Full device record</Link>{!planId ? <button className="button-subtle" type="button" disabled={device.status !== "active"} aria-pressed={selected.includes(device.id)} onClick={() => toggle(device)}>{selected.includes(device.id) ? "Remove from plan" : "Add to comparison plan"}</button> : null}</div>
      </article>)}</div> : <div className="hd-empty"><h3>No current reviewed device match for this selection.</h3><p>You can still confirm the required capability, ask a qualified professional about installation, or explore a different type of protection. We won’t substitute an unsupported product.</p><Link className="button-subtle" href="/insurance">Check insurance guidance</Link></div>}
    </section>

    {planId ? <HomePlanActions planId={planId} options={options} concernId={concern.id} /> : <section className="hd-plan-bar" aria-label="Your comparison plan"><div><strong>{selected.length ? `${selected.length} option${selected.length === 1 ? "" : "s"} in your plan` : "Keep your next steps in one place."}</strong><p>{selected.length ? "Saved on this device only. Not an online account backup, purchase or installation claim." : "Add an option above, then save a plan you can return to."}</p></div><button className="button-primary" type="button" disabled={!selected.length} onClick={savePlan}>Save on this device & open</button></section>}
    <p className="hd-notice" role="status">{notice}</p>
    {openedPlan ? <HomePlanActions planId={openedPlan} options={selectedDevices} concernId={concern.id} /> : null}
    <footer className="hd-footer"><p>SmartDevices is independent. Technical capability is not insurer approval, policy compliance or a discount determination.</p><Link href="/insurance">Insurance guidance</Link><Link href="/my-plan">My plans</Link><details><summary>Looking for automatic gas shutoff?</summary><p>Ask a qualified gas professional about the appropriate system, local requirements and installation. Do not attempt gas work yourself. Confirm any insurance requirement separately with your agent.</p><Link href="/farmers?category=gas">California Farmers class guidance</Link></details></footer>
  </section>;
}
