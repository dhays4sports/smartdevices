"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { metricsConsentKey, recordMetric } from "../lib/metrics-client";
export function MetricsConsent() {
 const [enabled,setEnabled]=useState(false);
 const [ready,setReady]=useState(false);
 const path=usePathname();
 useEffect(()=>{ const frame=requestAnimationFrame(()=>{try{setEnabled(sessionStorage.getItem(metricsConsentKey)==="yes");}catch{}setReady(true);});return()=>cancelAnimationFrame(frame);},[]);
 useEffect(()=>{if(path?.startsWith("/devices/"))recordMetric("device_view");if(path==="/compare")recordMetric("compare_complete");},[path]);
 return <aside className="metrics-choice"><label><input type="checkbox" disabled={!ready} checked={enabled} onChange={e=>{try{sessionStorage.setItem(metricsConsentKey,e.target.checked?"yes":"no");setEnabled(e.target.checked);}catch{setEnabled(false);}}}/> Help test SmartDevices with anonymous action counts for this tab.</label><small>No searches, project contents, account IDs or device inventories are collected. Optional; privacy signals take precedence. This private pilot records synthetic counts, never customer demand.</small></aside>;
}
