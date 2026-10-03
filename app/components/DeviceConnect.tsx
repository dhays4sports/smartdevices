"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { deviceCapabilities } from "@/app/lib/device-capabilities";
import { validateDeviceRegistration, registrationToSmartDeviceObject } from "@/app/lib/device-connect";
import styles from "./DeviceConnect.module.css";

type Props = { authenticated: boolean; safePreview?: boolean };
type RegisteredDevice = { recordId: string; manufacturer: string; model: string; trust: { state: string }; capabilities: Array<{ id: string }> };

export function DeviceConnect({ authenticated, safePreview = false }: Props) {
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState("sensor");
  const [protocols, setProtocols] = useState("Wi-Fi");
  const [capabilityIds, setCapabilityIds] = useState<string[]>([]);
  const [meshReadiness, setMeshReadiness] = useState<"not-evaluated" | "compatible" | "ready">("not-evaluated");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [registered, setRegistered] = useState<RegisteredDevice[]>([]);

  const capabilityGroups = useMemo(() => deviceCapabilities.filter((item) => ["sensing", "communicative", "physical-action"].includes(item.kind)), []);

  useEffect(() => {
    if (safePreview || !authenticated) return;
    fetch("/api/devices/register", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) return;
      const body = await response.json();
      setRegistered(Array.isArray(body.devices) ? body.devices : []);
    }).catch(() => undefined);
  }, [authenticated, safePreview]);

  function toggleCapability(id: string) {
    setCapabilityIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (safePreview) {
      try {
        const registration = validateDeviceRegistration({ manufacturer, model, category, capabilityIds, connection: { protocols: protocols.split(",").map((item) => item.trim()).filter(Boolean), locality: "unknown" }, meshReadiness });
        const sample = registrationToSmartDeviceObject(`preview_${crypto.randomUUID()}`, registration);
        setRegistered((current) => [sample, ...current].slice(0, 20));
        setNotice("Sample record created in this page only. It disappears on reload. Nothing was saved or connected.");
      } catch { setNotice("Enter a manufacturer, model and at least one known capability. Use descriptive protocols such as Wi-Fi."); }
      return;
    }
    if (!authenticated) { setNotice("Sign in before creating a hosted device registration."); return; }
    if (!capabilityIds.length) { setNotice("Choose at least one capability the device actually exposes."); return; }
    setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/devices/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manufacturer, model, category, capabilityIds, connection: { protocols: protocols.split(",").map((item) => item.trim()).filter(Boolean), locality: "unknown" }, meshReadiness }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error?.message ?? body?.message ?? "Registration failed");
      setRegistered((current) => [body.device, ...current]);
      setNotice("Registered. This does not verify ownership, identity, permission, reachability, or agent control.");
      setManufacturer(""); setModel(""); setCapabilityIds([]);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Registration failed.");
    } finally { setBusy(false); }
  }

  return <div className={styles.layout}>
    <section className={styles.card} aria-labelledby="connect-device-title">
      <p className="eyebrow">Minimum durable Connect path</p>
      <h2 id="connect-device-title">Register what you already own or operate.</h2>
      <p>Registration creates a normalized record only. SmartDevices does not treat registration as proof of ownership, verification, durable identity, permission, reachability, or authorization.</p>
      {safePreview ? <p className={styles.authNote}>Try a sample device. Records stay in this page only and disappear when you reload. No sign-in, server save, verification or live connection occurs.</p> : !authenticated ? <p className={styles.authNote}><Link href="/signin-with-chatgpt?return_to=%2Fconnect">Sign in</Link> to save a private registration. You can review the capability model without signing in.</p> : null}
      <form className={styles.form} onSubmit={submit}>
        <label>Manufacturer<input value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} maxLength={120} required /></label>
        <label>Model<input value={model} onChange={(e) => setModel(e.target.value)} maxLength={160} required /></label>
        <label>Category<select value={category} onChange={(e) => setCategory(e.target.value)}><option value="sensor">Sensor / monitor</option><option value="security">Security / access</option><option value="environment">Environmental</option><option value="vehicle">Vehicle</option><option value="appliance">Appliance / equipment</option><option value="other">Other</option></select></label>
        <label>Declared protocols<input value={protocols} onChange={(e) => setProtocols(e.target.value)} placeholder="Wi-Fi, Bluetooth, Matter" /><small>Descriptive metadata only. Do not paste tokens, passwords, private endpoints, or API keys.</small></label>
        <fieldset><legend>Capabilities this device actually exposes</legend><div className={styles.capabilityGrid}>{capabilityGroups.map((item) => <label key={item.id} className={capabilityIds.includes(item.id) ? styles.selected : undefined}><input type="checkbox" checked={capabilityIds.includes(item.id)} onChange={() => toggleCapability(item.id)} /><code>{item.id}</code><span>{item.label}</span></label>)}</div></fieldset>
        <label>Mesh posture<select value={meshReadiness} onChange={(e) => setMeshReadiness(e.target.value as typeof meshReadiness)}><option value="not-evaluated">Not evaluated</option><option value="compatible">Compatible by design</option><option value="ready">Ready for a separate Mesh integration step</option></select><small>Mesh participation is optional and this field does not activate a Mesh runtime.</small></label>
        <button className="button-primary" type="submit" disabled={busy}>{busy ? "Registering…" : safePreview ? "Create sample record" : "Register device record"}</button>
      </form>
      {notice ? <p className="builder-notice" role="status">{notice}</p> : null}
    </section>
    <aside className={styles.trustCard}><p className="eyebrow">Trust ladder</p><h2>Separate evidence for each state.</h2><ol>{["Discovered", "Registered", "Claimed", "Verified", "Identified", "Permissioned", "Agent-operable", "Transactional"].map((item) => <li key={item}>{item}</li>)}</ol><p>A weaker state never silently grants the next one. Device credentials remain outside public discovery records.</p></aside>
    {(authenticated || safePreview) && registered.length ? <section className={styles.registered}><p className="eyebrow">Device records on this page</p><div>{registered.map((device) => <article key={device.recordId}><strong>{device.manufacturer} {device.model}</strong><span>{device.trust.state}</span><p>{device.capabilities.map((item) => item.id).join(" · ")}</p></article>)}</div></section> : null}
  </div>;
}
