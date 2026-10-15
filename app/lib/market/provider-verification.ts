import verificationJson from "@/content/market-provider-verification.json";
import type { ProviderOffer } from "./contract";

export type ProviderAvailability = "available" | "unavailable" | "unknown";
export type ProviderVerificationRecord = {
  verificationId: string;
  providerId: string;
  deviceId: string;
  offerId?: string;
  carrierId?: string;
  programId?: string;
  programJurisdiction?: string;
  channelVariantId?: string;
  sourceAuthority: "manufacturer" | "authorized-retailer" | "installer" | "marketplace";
  sourceUrl: string;
  sourceHost: string;
  checkedAt: string;
  availability: ProviderAvailability;
  price?: { amount: number; currency: string };
  purchaseSignal?: "buy" | "add-to-cart" | "contact" | "sold-out" | "unknown";
  evidence: string[];
};

export type ProviderVerificationDecision = {
  status: "verified" | "stale" | "unavailable" | "missing" | "rejected";
  reason?: string;
  record?: ProviderVerificationRecord;
  ageHours?: number;
};

const records = verificationJson as ProviderVerificationRecord[];

function safeHost(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? parsed.hostname.toLowerCase() : null;
  } catch { return null; }
}

export function latestProviderVerification(offer: ProviderOffer): ProviderVerificationRecord | undefined {
  return records
    .filter((record) => record.providerId === offer.providerId && record.deviceId === offer.deviceId)
    .filter((record) => !record.offerId || record.offerId === offer.offerId)
    .filter((record) => !record.programId || record.programId === offer.programId)
    .filter((record) => !record.carrierId || record.carrierId === offer.programCarrierId)
    .filter((record) => !record.channelVariantId || record.channelVariantId === offer.channelVariantId)
    .sort((a, b) => Date.parse(b.checkedAt) - Date.parse(a.checkedAt))[0];
}

export function verifyProviderFulfillmentFreshness(
  offer: ProviderOffer,
  now = new Date(),
  maxAgeHours = Number(process.env.SMARTDEVICES_MARKET_PROVIDER_MAX_AGE_HOURS ?? 168),
): ProviderVerificationDecision {
  const record = latestProviderVerification(offer);
  if (!record) return { status: "missing", reason: "provider_verification_missing" };
  const checkedMs = Date.parse(record.checkedAt);
  if (!Number.isFinite(checkedMs)) return { status: "rejected", reason: "provider_verification_invalid_timestamp", record };
  const ageHours = Math.max(0, (now.getTime() - checkedMs) / 3_600_000);
  if (ageHours > maxAgeHours) return { status: "stale", reason: "provider_verification_stale", record, ageHours };
  const recordHost = safeHost(record.sourceUrl);
  if (!recordHost || recordHost !== record.sourceHost.toLowerCase()) return { status: "rejected", reason: "provider_verification_source_host_mismatch", record, ageHours };
  if (record.availability !== "available" || !["buy", "add-to-cart"].includes(record.purchaseSignal ?? "unknown")) {
    return { status: "unavailable", reason: "provider_verification_not_currently_purchasable", record, ageHours };
  }
  if (!record.price || !(record.price.amount > 0) || record.price.currency !== "USD") {
    return { status: "rejected", reason: "provider_verification_price_missing_or_invalid", record, ageHours };
  }
  return { status: "verified", record, ageHours };
}
