import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/app/components/SiteHeader";
import { SiteFooter } from "@/app/components/SiteFooter";

export const metadata: Metadata = { title: "Permissioned device operation", robots: { index: false, follow: false } };
export default function OperatePage() {
  return <><SiteHeader /><main className="page-main"><header className="page-hero"><p className="eyebrow">Operate · planned</p><h1>Useful devices. Clear boundaries.</h1><p>Live device control and payments are not activated. Your choices about who can act, what they can do and when permission ends come first.</p></header><section className="detail-grid"><article><h2>Permission for a specific action</h2><p>Future operation must identify the requester, the person or organization represented, the device and the allowed action. Being connected does not give an agent control.</p></article><article><h2>Limits that can be withdrawn</h2><p>Consequential actions need bounded authority, expiry, revocation checks, explicit failure handling and an auditable result. Unclear authority means no action.</p></article><article><h2>Mesh as an extension</h2><p>The Mesh can provide mandates, delegation, execution and receipts when integration is verified. Discovery and device design work independently today.</p><Link className="button-subtle" href="/build">Design a device</Link></article></section></main><SiteFooter /></>;
}
