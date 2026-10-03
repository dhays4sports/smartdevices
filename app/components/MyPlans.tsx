"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getDeviceById, getDomain } from "@/app/lib/data";
import { listLocalPlans } from "@/app/lib/local-plan-store";
import { encodePlanSelection, type SafetyPlan } from "@/app/lib/plan";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Saved locally" : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function MyPlans() {
  const [plans, setPlans] = useState<SafetyPlan[] | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setPlans(listLocalPlans()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return <section className="my-plans" aria-labelledby="my-plans-heading">
    <header className="my-plans-heading"><p className="eyebrow">Your work, ready when you return</p><h1 id="my-plans-heading">My Smart Safety Plans</h1><p>Continue a plan, review the devices you selected, or start a new protection check.</p></header>
    {plans === null ? <div className="my-plan-empty" role="status" aria-live="polite"><span aria-hidden="true">•••</span><h2>Opening plans saved on this device.</h2><p>Checking this browser for your private Smart Safety Plans. Nothing is being uploaded.</p></div> : plans.length ? <ol className="saved-plan-list">{plans.map((plan) => {
      const domain = getDomain(plan.domain)?.label ?? plan.domain;
      const deviceNames = plan.recommendations.map((item) => getDeviceById(item.deviceId)).filter(Boolean).map((device) => `${device?.manufacturer} ${device?.model}`);
      return <li key={plan.id}><div className="saved-plan-meta"><span>{domain}</span><span>{formatDate(plan.createdAt)}</span></div><h2>{plan.schemaVersion === 3 ? "Insurance-aware protection plan" : `${domain} protection plan`}</h2><p>{deviceNames.length ? deviceNames.join(" · ") : "No device selections are available in this local copy."}</p><div><Link className="button-primary" href={`/plans/${plan.id}?${encodePlanSelection(plan)}`}>Open plan</Link><Link className="text-action" href={`/protect/${plan.domain}?concern=${encodeURIComponent(plan.concernId)}`}>Recheck guidance</Link></div></li>;
    })}</ol> : <div className="my-plan-empty"><span aria-hidden="true">01</span><h2>Your first plan starts with one protection concern.</h2><p>Explore your Home, Vehicle, Family or Business. SmartDevices will help you understand the concern and save a small, practical plan.</p><div><Link className="button-primary" href="/#protection-entry">Start a protection check</Link><Link className="button-subtle" href="/insurance">My insurer mentioned a device</Link></div></div>}
    <nav className="my-plan-shortcuts" aria-label="Plan shortcuts"><Link href="/devices"><span>Find a device</span><small>Search reviewed records</small></Link><Link href="/insurance"><span>Insurance guidance</span><small>Check supported carriers</small></Link><Link href="/pro"><span>Agent tools</span><small>Build a client-ready plan</small></Link></nav>
    <p className="local-plan-note"><strong>Private by default.</strong> Plans shown here are stored on this device. They are not an insurance record, carrier determination, or cloud backup.</p>
  </section>;
}
