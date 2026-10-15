import { NextResponse } from "next/server";
import { validateCommercialIntent } from "@/app/lib/market/commercial-intent";
import type { CommercialIntentEnvelope } from "@/app/lib/market/contract";
import { runMarket07Shadow, type Market07ShadowConfig } from "@/app/lib/market/runtime07";
import { recordMarketShadowObservation } from "@/app/lib/market/shadow-store";
import { previewFromShadowResult } from "@/app/lib/market/preview";
import { issuePreviewTransaction } from "@/app/lib/market/outcome-attribution";

export const runtime = "nodejs";

function disabled(reason: string) {
  return NextResponse.json({ status: "disabled", reason }, { status: 200 });
}

function configFromEnv(): Market07ShadowConfig | null {
  if (process.env.SMARTDEVICES_MARKET_SHADOW_ENABLED !== "true") return null;
  const endpoint = process.env.MARKET_AD_ENDPOINT;
  const publisherId = process.env.MARKET_AD_PUBLISHER_ID;
  const keyId = process.env.MARKET_AD_KEY_ID;
  const privateKeyB64 = process.env.MARKET_AD_PRIVATE_KEY_PEM_B64;
  const marketId = process.env.MARKET_AD_MARKET_ID ?? "ca-water-shutoff";
  const jurisdiction = process.env.MARKET_AD_JURISDICTION ?? "US-CA";
  if (!endpoint || !publisherId || !keyId || !privateKeyB64) return null;
  let privateKeyPem: string;
  try { privateKeyPem = Buffer.from(privateKeyB64, "base64").toString("utf8"); }
  catch { return null; }
  if (!/^https?:\/\//.test(endpoint)) return null;
  return { endpoint, publisherId, keyId, privateKeyPem, marketId, jurisdiction };
}

function isPilotIntent(intent: CommercialIntentEnvelope): boolean {
  return intent.domain === "home"
    && intent.concernId === "water"
    && intent.jurisdiction === "US-CA"
    && intent.commercialization.sponsoredPlacementAllowed
    && !intent.commercialization.directProviderContactAllowed
    && !intent.commercialization.personalDataSharingAllowed
    && intent.requiredCapabilities.some((capability) => /automatic shutoff/i.test(capability));
}

export async function POST(request: Request) {
  const previewRequested = new URL(request.url).searchParams.get("preview") === "1";
  const previewEnabled = process.env.SMARTDEVICES_MARKET_PREVIEW_ENABLED === "true";
  const config = configFromEnv();
  if (!config) return disabled("shadow_market_not_configured");

  let intent: CommercialIntentEnvelope;
  try { intent = await request.json() as CommercialIntentEnvelope; }
  catch { return NextResponse.json({ status: "rejected", reason: "invalid_json" }, { status: 400 }); }

  const errors = validateCommercialIntent(intent);
  if (errors.length) return NextResponse.json({ status: "rejected", reason: "invalid_intent", errors }, { status: 400 });
  if (!isPilotIntent(intent)) return NextResponse.json({ status: "rejected", reason: "outside_shadow_pilot" }, { status: 400 });

  try {
    const result = await runMarket07Shadow(intent, config);
    try { await recordMarketShadowObservation(intent, result); } catch { /* observability must not affect consumer flow */ }
    if (previewRequested && previewEnabled) {
      const preview = previewFromShadowResult(result, intent);
      const transaction = issuePreviewTransaction(preview, intent);
      if (transaction) preview.transaction = transaction;
      return NextResponse.json({ status: "shadow-preview", visibleToConsumer: true, preview }, { status: 200, headers: { "Cache-Control": "private, no-store" } });
    }
    return NextResponse.json({ status: result.status === "shadow" ? "shadow-recorded" : "no-market", visibleToConsumer: false }, { status: 200, headers: { "Cache-Control": "private, no-store" } });
  } catch {
    try { await recordMarketShadowObservation(intent, null, "MARKET_RUNTIME_ERROR"); } catch { /* fail closed */ }
    // Shadow-market failures must fail closed and must not leak network/provider details to the browser.
    if (previewRequested && previewEnabled) return NextResponse.json({ status: "shadow-preview-error", visibleToConsumer: true, preview: { status: "error", reason: "market_runtime_unavailable" } }, { status: 200, headers: { "Cache-Control": "private, no-store" } });
    return NextResponse.json({ status: "shadow-error", visibleToConsumer: false }, { status: 200, headers: { "Cache-Control": "private, no-store" } });
  }
}
