import { NextResponse } from "next/server";
import { isPreviewOutcomeEvent, verifyPreviewAttributionToken } from "@/app/lib/market/outcome-attribution";
import { recordPreviewOutcome } from "@/app/lib/market/outcome-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (process.env.SMARTDEVICES_MARKET_PREVIEW_ENABLED !== "true") {
    return NextResponse.json({ status: "disabled" }, { status: 200, headers: { "Cache-Control": "private, no-store" } });
  }
  let body: { token?: unknown; event?: unknown; occurredAt?: unknown };
  try { body = await request.json() as typeof body; }
  catch { return NextResponse.json({ status: "rejected", reason: "invalid_json" }, { status: 400 }); }
  if (typeof body.token !== "string" || !isPreviewOutcomeEvent(body.event)) {
    return NextResponse.json({ status: "rejected", reason: "invalid_outcome" }, { status: 400 });
  }
  const claims = verifyPreviewAttributionToken(body.token);
  if (!claims) return NextResponse.json({ status: "rejected", reason: "invalid_or_expired_attribution" }, { status: 400 });
  let occurredAt = new Date().toISOString();
  if (typeof body.occurredAt === "string") {
    const parsed = Date.parse(body.occurredAt);
    if (Number.isFinite(parsed) && Math.abs(Date.now() - parsed) < 10 * 60_000) occurredAt = new Date(parsed).toISOString();
  }
  try {
    const saved = await recordPreviewOutcome(claims, body.event, occurredAt);
    return NextResponse.json({ status: saved.duplicate ? "already-recorded" : "recorded", transactionId: claims.transactionId }, { status: 200, headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ status: "unavailable" }, { status: 503, headers: { "Cache-Control": "private, no-store" } });
  }
}
