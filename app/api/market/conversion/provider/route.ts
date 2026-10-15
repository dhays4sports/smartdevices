import { NextResponse } from "next/server";
import { verifyProviderCallback, type MarketConversionEvent } from "@/app/lib/market/conversion";
import { getConversionLineageByTransaction, recordConversionReceipt, recordProviderCallbackNonce } from "@/app/lib/market/conversion-store";

export const runtime = "nodejs";

function event(value: unknown): MarketConversionEvent | null {
  if (value === "purchase" || value === "installation") return value;
  return null;
}

export async function POST(request: Request) {
  if (process.env.SMARTDEVICES_MARKET_PROVIDER_CALLBACKS_ENABLED !== "true") return NextResponse.json({ status: "disabled" }, { status: 200, headers: { "Cache-Control": "private, no-store" } });
  const rawBody = await request.text();
  const verified = verifyProviderCallback(request.headers, rawBody);
  if (!verified.ok) return NextResponse.json({ status: "rejected", reason: verified.reason }, { status: 401 });
  let body: { transactionId?: unknown; event?: unknown; occurredAt?: unknown; providerReference?: unknown };
  try { body = JSON.parse(rawBody) as typeof body; }
  catch { return NextResponse.json({ status: "rejected", reason: "invalid_json" }, { status: 400 }); }
  const conversionEvent = event(body.event);
  if (typeof body.transactionId !== "string" || !conversionEvent) return NextResponse.json({ status: "rejected", reason: "invalid_conversion" }, { status: 400 });
  let occurredAt = new Date().toISOString();
  if (typeof body.occurredAt === "string") {
    const parsed = Date.parse(body.occurredAt);
    if (Number.isFinite(parsed) && Math.abs(Date.now() - parsed) < 30 * 24 * 60 * 60_000) occurredAt = new Date(parsed).toISOString();
  }
  try {
    const nonceAccepted = await recordProviderCallbackNonce(verified.providerId, verified.nonce, verified.timestamp);
    if (!nonceAccepted) return NextResponse.json({ status: "rejected", reason: "replayed_callback" }, { status: 409 });
    const lineage = await getConversionLineageByTransaction(body.transactionId);
    if (!lineage) return NextResponse.json({ status: "rejected", reason: "unknown_transaction" }, { status: 404 });
    if (lineage.providerId !== verified.providerId) return NextResponse.json({ status: "rejected", reason: "provider_mismatch" }, { status: 403 });
    const saved = await recordConversionReceipt({
      lineage,
      event: conversionEvent,
      source: "provider-callback",
      confidence: "provider-verified",
      occurredAt,
      providerReference: typeof body.providerReference === "string" ? body.providerReference : undefined,
      callbackNonce: verified.nonce,
    });
    return NextResponse.json({ status: saved.duplicate ? "already-recorded" : "recorded", receiptId: saved.id, confidence: "provider-verified" }, { status: 200, headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ status: "unavailable" }, { status: 503, headers: { "Cache-Control": "private, no-store" } });
  }
}
