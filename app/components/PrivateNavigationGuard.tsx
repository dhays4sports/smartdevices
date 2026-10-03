"use client";
import { useEffect } from "react";
/** Revalidate restored pages after sign-out rather than displaying a stale private DOM. */
export function PrivateNavigationGuard() {
 useEffect(()=>{const reload=(event:PageTransitionEvent)=>{if(event.persisted)window.location.reload();};window.addEventListener("pageshow",reload);return()=>window.removeEventListener("pageshow",reload);},[]);
 return null;
}
