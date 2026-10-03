import { NextResponse } from "next/server";
import { verifyPreviewConversionToken } from "@/app/lib/market/outcome-attribution";
import { recordConversionReceipt } from "@/app/lib/market/conversion-store";
import type { MarketConversionEvent } from "@/app/lib/market/conversion";

export const runtime = "nodejs";

function event(value: unknown): MarketConversionEvent | null {
  if (value === "purchase" || value === "installation") return value;
  return null;
}

export async function POST(request: Request) {
  if (process.env.SMARTDEVICES_MARKET_PREVIEW_ENABLED !== "true") return NextResponse.json({ status: "disabled" }, { status: 200, headers: { "Cache-Control": "private, no-store" } });
  let body: { token?: unknown; event?: unknown; confirmed?: unknown; occurredAt?: unknown };
  try { body = await request.json() as typeof body; }
  catch { return NextResponse.json({ status: "rejected", reason: "invalid_json" }, { status: 400 }); }
  const conversionEvent = event(body.event);
  if (typeof body.token !== "string" || !conversionEvent || body.confirmed !== true) return NextResponse.json({ status: "rejected", reason: "explicit_confirmation_required" }, { status: 400 });
  const claims = verifyPreviewConversionToken(body.token);
  if (!claims) return NextResponse.json({ status: "rejected", reason: "invalid_or_expired_conversion_attribution" }, { status: 400 });
  let occurredAt = new Date().toISOString();
  if (typeof body.occurredAt === "string") {
    const parsed = Date.parse(body.occurredAt);
    if (Number.isFinite(parsed) && Math.abs(Date.now() - parsed) < 24 * 60 * 60_000) occurredAt = new Date(parsed).toISOString();
  }
  try {
    const saved = await recordConversionReceipt({ lineage: claims, event: conversionEvent, source: "user-confirmed", confidence: "self-reported", occurredAt });
    return NextResponse.json({ status: saved.duplicate ? "already-recorded" : "recorded", receiptId: saved.id, confidence: "self-reported" }, { status: 200, headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ status: "unavailable" }, { status: 503, headers: { "Cache-Control": "private, no-store" } });
  }
}
