import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { CommercialIntentEnvelope, MarketOutcomeName } from "./contract";
import type { SponsoredFulfillmentPreview } from "./preview";

export type PreviewAttributionClaims = {
  schemaVersion: 1;
  purpose: "outcome" | "conversion";
  transactionId: string;
  intentId: string;
  opportunityId: string;
  allocationId: string;
  allocationReceiptId?: string;
  offerIdentityReceiptId: string;
  providerVerificationReceiptId: string;
  offerId: string;
  providerId: string;
  deviceId: string;
  destinationUrl: string;
  issuedAt: string;
  expiresAt: string;
};

export type PreviewTransaction = {
  transactionId: string;
  attributionToken: string;
  expiresAt: string;
  conversionToken: string;
  conversionExpiresAt: string;
  offerIdentityReceiptId: string;
  providerVerificationReceiptId: string;
};

function secret(): string | null {
  const value = process.env.SMARTDEVICES_MARKET_OUTCOME_SECRET?.trim();
  return value && value.length >= 32 ? value : null;
}

function encode(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function decode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(encodedPayload: string, key: string): string {
  return createHmac("sha256", key).update(encodedPayload).digest("base64url");
}

function transactionId(intentId: string, allocationId: string, offerId: string): string {
  const digest = createHash("sha256").update(`${intentId}\n${allocationId}\n${offerId}`).digest("base64url").slice(0, 30);
  return `mpt_${digest}`;
}

export function issuePreviewTransaction(
  preview: SponsoredFulfillmentPreview,
  intent: CommercialIntentEnvelope,
  now = new Date(),
): PreviewTransaction | null {
  const key = secret();
  const offer = preview.providerOffer;
  if (!key || preview.status !== "mapped" || !offer || !preview.opportunityId || !preview.allocationId) return null;
  if (!offer.destinationUrl || !preview.offerIdentityReceiptId || !preview.providerVerificationReceiptId) return null;
  const expiresAt = new Date(now.getTime() + 30 * 60_000).toISOString();
  const conversionExpiresAt = new Date(now.getTime() + 24 * 60 * 60_000).toISOString();
  const claims: PreviewAttributionClaims = {
    schemaVersion: 1,
    purpose: "outcome",
    transactionId: transactionId(intent.intentId, preview.allocationId, offer.offerId),
    intentId: intent.intentId,
    opportunityId: preview.opportunityId,
    allocationId: preview.allocationId,
    allocationReceiptId: preview.allocationReceiptId,
    offerIdentityReceiptId: preview.offerIdentityReceiptId,
    providerVerificationReceiptId: preview.providerVerificationReceiptId,
    offerId: offer.offerId,
    providerId: offer.providerId,
    deviceId: offer.deviceId,
    destinationUrl: offer.destinationUrl,
    issuedAt: now.toISOString(),
    expiresAt,
  };
  const encoded = encode(JSON.stringify(claims));
  const conversionClaims: PreviewAttributionClaims = { ...claims, purpose: "conversion", expiresAt: conversionExpiresAt };
  const encodedConversion = encode(JSON.stringify(conversionClaims));
  return {
    transactionId: claims.transactionId,
    attributionToken: `${encoded}.${sign(encoded, key)}`,
    expiresAt,
    conversionToken: `${encodedConversion}.${sign(encodedConversion, key)}`,
    conversionExpiresAt,
    offerIdentityReceiptId: claims.offerIdentityReceiptId,
    providerVerificationReceiptId: claims.providerVerificationReceiptId,
  };
}

function verifyPreviewToken(token: string, purpose: PreviewAttributionClaims["purpose"], now = new Date()): PreviewAttributionClaims | null {
  const key = secret();
  if (!key) return null;
  const [encoded, supplied] = token.split(".");
  if (!encoded || !supplied) return null;
  const expected = sign(encoded, key);
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  let claims: PreviewAttributionClaims;
  try { claims = JSON.parse(decode(encoded)) as PreviewAttributionClaims; } catch { return null; }
  if (claims.schemaVersion !== 1 || claims.purpose !== purpose || !claims.transactionId || !claims.allocationId || !claims.offerId || !claims.deviceId || !claims.providerId) return null;
  const expiry = Date.parse(claims.expiresAt);
  if (!Number.isFinite(expiry) || expiry <= now.getTime()) return null;
  return claims;
}

export function verifyPreviewAttributionToken(token: string, now = new Date()): PreviewAttributionClaims | null {
  return verifyPreviewToken(token, "outcome", now);
}

export function isPreviewOutcomeEvent(value: unknown): value is Extract<MarketOutcomeName, "sponsored-offer-viewed" | "sponsored-offer-opened" | "provider-selected"> {
  return value === "sponsored-offer-viewed" || value === "sponsored-offer-opened" || value === "provider-selected";
}

export function verifyPreviewConversionToken(token: string, now = new Date()): PreviewAttributionClaims | null {
  return verifyPreviewToken(token, "conversion", now);
}
