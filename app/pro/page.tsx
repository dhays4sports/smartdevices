import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";

export const metadata: Metadata = { title: "SmartDevices Pro", description: "A daily device-intelligence and client-plan workspace for insurance professionals." };

const actions = [
  { href: "/admin/evidence", label: "Refresh device evidence", detail: "Check approved primary sources, renew unchanged facts and isolate material changes.", action: "Open Evidence Autopilot" },
  { href: "/pro/workspace", label: "Build a client plan", detail: "Choose a concern, curate a few options and preview the exact client view.", action: "Open workspace" },
  { href: "/insurance", label: "Check insurance guidance", detail: "Review current public carrier categories and the confirmation boundary.", action: "Choose a carrier" },
  { href: "/devices", label: "Research a device", detail: "Search dated device records, installation considerations and known limitations.", action: "Open device library" },
  { href: "/my-plan", label: "Return to saved plans", detail: "Reopen plans stored on this device and recheck their guidance.", action: "View my plans" },
];

export default function ProPage() {
  return <><SiteHeader /><main className="pro-daily">
    <header className="pro-daily-hero"><div><p className="eyebrow">SmartDevices Pro</p><h1>Useful in the middle of a real client conversation.</h1><p>Research a device, check carrier context, and send a client a plan they can actually understand.</p></div><Link className="button-primary" href="/pro/workspace">Open the Pro workspace</Link></header>
    <section className="pro-quick-actions" aria-labelledby="pro-actions-heading"><div className="pro-section-heading"><p className="eyebrow">Daily tools</p><h2 id="pro-actions-heading">What do you need to do?</h2></div><div>{actions.map((item, index) => <Link key={item.href} href={item.href}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.label}</h3><p>{item.detail}</p><strong>{item.action} →</strong></Link>)}</div></section>
    <section className="pro-trust-contract"><div><p className="eyebrow">Why agents can return to it</p><h2>Current when known. Honest when not.</h2></div><ul><li>Sources and reviewed dates stay attached to claims.</li><li>Carrier guidance stays separate from independent recommendations.</li><li>Stale evidence cannot create a current positive label.</li><li>A client view never becomes purchase intent.</li></ul></section>
    <p className="pro-boundary-note">SmartDevices Pro supports research, plan building and client follow-up. It does not determine carrier eligibility, policy compliance, discounts, purchase status or installation verification.</p>
  </main><SiteFooter /></>;
}
