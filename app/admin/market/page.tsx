"use client";

import { useEffect, useState } from "react";

type OfferIdentity = {
  receiptId?: string | null;
  status?: "mapped" | "unmapped" | "rejected" | null;
  reason?: string | null;
  bidId?: string | null;
  providerName?: string | null;
  offerId?: string | null;
  deviceId?: string | null;
  fulfillmentType?: string | null;
  destinationUrl?: string | null;
  offerPayloadHash?: string | null;
  bindingHash?: string | null;
};

type Dashboard = {
  generatedAt: string;
  metrics: {
    total: number; filled: number; noMarket: number; errors: number; fillRate: number;
    mapped: number; mappingRejected: number; mappingUnmapped: number; mappingRate: number;
    providerVerified: number; providerStale: number; providerUnavailable: number;
    previewViews: number; previewOpens: number; previewSelections: number; previewOpenRate: number;
    selfReportedPurchases: number; selfReportedInstallations: number; providerVerifiedPurchases: number; providerVerifiedInstallations: number;
    averageClearingAmount: number | null; currency: string | null; rejectionReasons: Record<string, number>;
  };
  runs: Array<{
    id:string; status:string; recommendedDeviceIds:unknown[]; sponsoredProviderId?:string|null; sponsoredDeviceId?:string|null;
    clearingAmount?:number|null; currency?:string|null; allocationReceiptId?:string|null; offerIdentity?:OfferIdentity|null;
    providerVerification?:{receiptId?:string|null;status?:string|null;reason?:string|null;verificationId?:string|null;sourceUrl?:string|null;checkedAt?:string|null;ageHours?:number|null;availability?:string|null;price?:number|null;currency?:string|null}|null;
    previewOutcomes?:Array<{id:string;transactionId:string;event:string;occurredAt:string;offerIdentityReceiptId:string;providerVerificationReceiptId:string}>;
    conversions?:Array<{id:string;transactionId:string;event:string;source:string;confidence:string;occurredAt:string;bindingHash:string}>; createdAt:string;
  }>;
};

export default function MarketAdminPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { fetch("/api/admin/market", { cache: "no-store" }).then(async (r) => { if (!r.ok) throw new Error("Unavailable"); return r.json(); }).then(setData).catch(() => setError("Market observability is unavailable or you are not authorized.")); }, []);
  if (error) return <main style={{maxWidth:960,margin:"48px auto",padding:24}}><h1>Market.ad shadow observability</h1><p>{error}</p></main>;
  if (!data) return <main style={{maxWidth:960,margin:"48px auto",padding:24}}><h1>Market.ad shadow observability</h1><p>Loading…</p></main>;
  const m=data.metrics;
  return <main style={{maxWidth:1180,margin:"48px auto",padding:24,fontFamily:"system-ui,sans-serif"}}>
    <h1>Market.ad shadow observability</h1>
    <p>Operator-only. Shadow results never alter consumer recommendations. Offer identity is accepted only when the winning Market.ad bid explicitly names a SmartDevices-qualified device.</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,margin:"24px 0"}}>
      {[
        ['Runs',m.total],['Filled',m.filled],['Mapped offers',m.mapped],['Mapping rate',`${(m.mappingRate*100).toFixed(1)}%`],
        ['Unmapped',m.mappingUnmapped],['Rejected mapping',m.mappingRejected],['Provider verified',m.providerVerified],['Provider stale',m.providerStale],['Provider unavailable',m.providerUnavailable],['Preview views',m.previewViews],['Preview opens',m.previewOpens],['Preview open rate',`${(m.previewOpenRate*100).toFixed(1)}%`],['Self-reported purchases',m.selfReportedPurchases],['Provider-verified purchases',m.providerVerifiedPurchases],['Self-reported installs',m.selfReportedInstallations],['Provider-verified installs',m.providerVerifiedInstallations],['No market',m.noMarket],['Errors',m.errors],
        ['Avg clearing',m.averageClearingAmount==null?'—':`${m.currency??''} ${m.averageClearingAmount.toFixed(2)}`]
      ].map(([k,v])=><div key={String(k)} style={{border:"1px solid #ddd",borderRadius:14,padding:16}}><small>{k}</small><div style={{fontSize:26,fontWeight:700}}>{v}</div></div>)}
    </div>
    <h2>Rejection reasons</h2><pre>{JSON.stringify(m.rejectionReasons,null,2)}</pre>
    <h2>Recent runs</h2>
    <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr><th align="left">Time</th><th align="left">Status</th><th align="left">SmartDevices recommendations</th><th align="left">Would-be sponsor</th><th align="left">Mapped device</th><th align="left">Fulfillment</th><th align="left">Live fulfillment</th><th align="right">Verified price</th><th align="right">Clearing</th><th align="left">Identity receipt</th><th align="left">Attributed outcomes</th><th align="left">Conversion receipts</th></tr></thead><tbody>
      {data.runs.map(r=><tr key={r.id}>
        <td>{r.createdAt}</td><td>{r.status}</td><td>{r.recommendedDeviceIds.join(', ')||'—'}</td>
        <td>{r.offerIdentity?.providerName ?? r.sponsoredProviderId ?? '—'}{r.offerIdentity?.status && r.offerIdentity.status !== 'mapped' ? ` (${r.offerIdentity.status}: ${r.offerIdentity.reason ?? 'unknown'})` : ''}</td>
        <td>{r.offerIdentity?.deviceId ?? '—'}</td><td>{r.offerIdentity?.fulfillmentType ?? '—'}</td>
        <td>{r.providerVerification?.status ?? '—'}{r.providerVerification?.reason ? ` (${r.providerVerification.reason})` : ''}{r.providerVerification?.checkedAt ? ` · checked ${r.providerVerification.checkedAt}` : ''}</td>
        <td align="right">{r.providerVerification?.price==null?'—':`${r.providerVerification.currency??''} ${r.providerVerification.price.toFixed(2)}`}</td>
        <td align="right">{r.clearingAmount==null?'—':`${r.currency??''} ${r.clearingAmount.toFixed(2)}`}</td><td>{r.offerIdentity?.receiptId ?? '—'}</td>
        <td>{r.previewOutcomes?.length ? r.previewOutcomes.map(o => `${o.event} @ ${o.occurredAt}`).join(' · ') : '—'}</td>
        <td>{r.conversions?.length ? r.conversions.map(c => `${c.event} · ${c.confidence} (${c.source}) @ ${c.occurredAt}`).join(' · ') : '—'}</td>
      </tr>)}
    </tbody></table></div>
  </main>;
}
