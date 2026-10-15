import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { PreviewAttributionClaims } from "./outcome-attribution";

export type MarketConversionEvent = "purchase" | "installation";
export type MarketConversionSource = "user-confirmed" | "provider-callback";
export type MarketConversionConfidence = "self-reported" | "provider-verified";

export type MarketConversionLineage = Pick<PreviewAttributionClaims,
  | "transactionId"
  | "intentId"
  | "opportunityId"
  | "allocationId"
  | "allocationReceiptId"
  | "offerIdentityReceiptId"
  | "providerVerificationReceiptId"
  | "offerId"
  | "providerId"
  | "deviceId"
  | "destinationUrl"
>;

export type ProviderCallbackVerification = {
  ok: true;
  providerId: string;
  timestamp: string;
  nonce: string;
} | {
  ok: false;
  reason: "provider_not_configured" | "invalid_timestamp" | "stale_timestamp" | "invalid_signature" | "invalid_headers";
};

function callbackSecrets(): Record<string, string> {
  const raw = process.env.SMARTDEVICES_MARKET_PROVIDER_CALLBACK_SECRETS_JSON?.trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].length >= 32));
  } catch { return {}; }
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(a) || !/^[a-f0-9]{64}$/i.test(b)) return false;
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

export function providerCallbackSignature(providerId: string, timestamp: string, nonce: string, rawBody: string, secret: string): string {
  const canonical = `${providerId}\n${timestamp}\n${nonce}\n${sha256(rawBody)}`;
  return createHmac("sha256", secret).update(canonical).digest("hex");
}

export function verifyProviderCallback(
  headers: Headers,
  rawBody: string,
  now = new Date(),
): ProviderCallbackVerification {
  const providerId = headers.get("x-market-provider-id")?.trim();
  const timestamp = headers.get("x-market-timestamp")?.trim();
  const nonce = headers.get("x-market-nonce")?.trim();
  const supplied = headers.get("x-market-signature")?.trim();
  if (!providerId || !timestamp || !nonce || !supplied) return { ok: false, reason: "invalid_headers" };
  const secret = callbackSecrets()[providerId];
  if (!secret) return { ok: false, reason: "provider_not_configured" };
  const millis = Date.parse(timestamp);
  if (!Number.isFinite(millis)) return { ok: false, reason: "invalid_timestamp" };
  if (Math.abs(now.getTime() - millis) > 5 * 60_000) return { ok: false, reason: "stale_timestamp" };
  const expected = providerCallbackSignature(providerId, timestamp, nonce, rawBody, secret);
  if (!safeEqualHex(supplied, expected)) return { ok: false, reason: "invalid_signature" };
  return { ok: true, providerId, timestamp: new Date(millis).toISOString(), nonce };
}

export function conversionBindingHash(
  lineage: MarketConversionLineage,
  event: MarketConversionEvent,
  source: MarketConversionSource,
  occurredAt: string,
): string {
  return sha256(JSON.stringify({
    transactionId: lineage.transactionId,
    allocationId: lineage.allocationId,
    allocationReceiptId: lineage.allocationReceiptId ?? null,
    offerIdentityReceiptId: lineage.offerIdentityReceiptId,
    providerVerificationReceiptId: lineage.providerVerificationReceiptId,
    offerId: lineage.offerId,
    providerId: lineage.providerId,
    deviceId: lineage.deviceId,
    event,
    source,
    occurredAt,
  }));
}

export function providerReferenceHash(reference: string | undefined): string | undefined {
  const value = reference?.trim();
  return value ? sha256(value) : undefined;
}
