"use client";
import "./market.css";

import { useEffect, useState } from "react";
import type { Device } from "@/app/lib/data";
import type { SponsoredFulfillmentPreview } from "@/app/lib/market/preview";

type Props = {
  preview: SponsoredFulfillmentPreview | null;
  qualifiedDevices: Device[];
};

export function CommercialOptions({ preview, qualifiedDevices }: Props) {
  const [conversionStatus, setConversionStatus] = useState<string | null>(null);
  const offer = preview?.status === "mapped" ? preview.providerOffer : undefined;
  const device = offer ? qualifiedDevices.find((item) => item.id === offer.deviceId) : undefined;
  const transaction = preview?.transaction;

  useEffect(() => {
    if (!preview || preview.status !== "mapped" || !offer || !device || !transaction) return;
    void fetch("/api/market/outcome", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: transaction.attributionToken, event: "sponsored-offer-viewed", occurredAt: new Date().toISOString() }),
      keepalive: true,
    }).catch(() => undefined);
  }, [preview, offer, device, transaction]);

  if (!device) return null;
  if (!preview || preview.status !== "mapped" || !offer || !preview.disclosure) return null;

  function recordOpen() {
    if (!transaction) return;
    void fetch("/api/market/outcome", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: transaction.attributionToken, event: "sponsored-offer-opened", occurredAt: new Date().toISOString() }),
      keepalive: true,
    }).catch(() => undefined);
  }

  async function confirmConversion(event: "purchase" | "installation") {
    if (!transaction?.conversionToken) return;
    setConversionStatus("Saving confirmation…");
    try {
      const response = await fetch("/api/market/conversion/user", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: transaction.conversionToken, event, confirmed: true, occurredAt: new Date().toISOString() }),
      });
      const body = await response.json() as { status?: string; confidence?: string };
      if (!response.ok || (body.status !== "recorded" && body.status !== "already-recorded")) throw new Error("conversion_not_recorded");
      setConversionStatus(event === "purchase" ? "Purchase recorded as self-reported." : "Installation recorded as self-reported.");
    } catch {
      setConversionStatus("Confirmation could not be recorded.");
    }
  }

  return (
    <aside className="commercial-options-preview" aria-labelledby="commercial-options-heading">
      <div className="commercial-options-kicker">Preview only · sponsored fulfillment</div>
      <div className="commercial-options-header">
        <div>
          <h3 id="commercial-options-heading">Ways to get this qualified device</h3>
          <p>SmartDevices qualified the device first. Market.ad only influenced which eligible provider appears in this preview.</p>
        </div>
        <span className="sponsored-pill">Sponsored provider</span>
      </div>
      <div className="commercial-offer-row">
        <div>
          <strong>{device.manufacturer} {device.model}</strong>
          <span>{offer.providerName}{offer.fulfillmentType === "carrier-program" ? " · carrier program" : ""}</span>
        </div>
        <div className="commercial-offer-actions">
          {offer.destinationUrl && transaction ? <a className="button-primary" href={offer.destinationUrl} target="_blank" rel="noopener noreferrer sponsored" onClick={recordOpen}>Preview provider</a> : <span className="button-subtle" aria-disabled="true">Attributed preview unavailable</span>}
        </div>
      </div>
      <details className="market-disclosure">
        <summary>Why am I seeing this?</summary>
        <p>{preview.disclosure.message}</p>
        <p>Qualification influenced by payment: <strong>No</strong>. Placement influenced by payment: <strong>Yes</strong>.</p>
        {preview.clearingAmount != null ? <p>Preview clearing amount: {preview.currency ?? ""} {preview.clearingAmount.toFixed(2)}.</p> : null}
        {transaction ? <p>Preview transaction: <code>{transaction.transactionId}</code>. Click attribution expires at {transaction.expiresAt}. Conversion confirmation expires at {transaction.conversionExpiresAt}.</p> : <p>Outcome attribution is not configured, so outbound preview navigation is disabled.</p>}
      </details>
      {transaction?.conversionToken ? <div className="market-conversion-proof" aria-label="Preview conversion proof">
        <strong>Preview conversion proof</strong>
        <p>If you actually complete this purchase or installation during the controlled preview, you may confirm it here. This is stored as <em>self-reported</em> unless the provider independently verifies it.</p>
        <div className="commercial-offer-actions">
          <button type="button" className="button-subtle" onClick={() => void confirmConversion("purchase")}>I purchased this</button>
          <button type="button" className="button-subtle" onClick={() => void confirmConversion("installation")}>I had it installed</button>
        </div>
        {conversionStatus ? <p role="status" aria-live="polite">{conversionStatus}</p> : null}
      </div> : null}
    </aside>
  );
}
