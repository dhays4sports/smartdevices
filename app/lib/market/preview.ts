import type { Market07ShadowResult } from "./runtime07";
import type { ProviderOffer, CommercialDisclosure, CommercialIntentEnvelope } from "./contract";
import { disclosureForOffers } from "./disclosure";
import { certifyRealProviderOffer } from "./provider-pilot";

export type SponsoredFulfillmentPreview = {
  status: "mapped" | "unmapped" | "rejected" | "no-market" | "error";
  providerOffer?: ProviderOffer;
  disclosure?: CommercialDisclosure;
  reason?: string;
  opportunityId?: string;
  allocationId?: string;
  allocationReceiptId?: string;
  clearingAmount?: number;
  currency?: string;
  offerIdentityReceiptId?: string;
  providerVerificationReceiptId?: string;
  transaction?: import("./outcome-attribution").PreviewTransaction;
};

export function previewFromShadowResult(result: Market07ShadowResult | null, intent?: CommercialIntentEnvelope): SponsoredFulfillmentPreview {
  if (!result) return { status: "error", reason: "market_runtime_unavailable" };
  if (result.status === "no-market") return { status: "no-market", opportunityId: result.opportunityId };
  const identity = result.offerIdentity;
  if (!identity || identity.status !== "mapped" || !identity.providerId || !identity.offerId || !identity.deviceId) {
    return {
      status: identity?.status ?? "unmapped",
      reason: identity?.reason ?? "canonical_offer_identity_missing",
      opportunityId: result.opportunityId,
      allocationId: result.allocationId,
      allocationReceiptId: result.allocationReceiptId,
      clearingAmount: result.clearingAmount,
      currency: result.currency,
    };
  }
  const offer: ProviderOffer = {
    schemaVersion: 1,
    offerId: identity.offerId,
    providerId: identity.providerId,
    providerName: identity.providerName ?? identity.providerId,
    deviceId: identity.deviceId,
    relationship: "sponsored",
    destinationUrl: identity.destinationUrl,
    marketOpportunityId: result.opportunityId,
    marketAllocationId: result.allocationId,
    fulfillmentType: identity.fulfillmentType,
    programCarrierId: identity.programCarrierId,
    programId: identity.programId,
    programJurisdiction: identity.programJurisdiction,
    channelVariantId: identity.channelVariantId,
  };
  const realProvider = certifyRealProviderOffer(offer, intent?.programContext);
  if (process.env.SMARTDEVICES_MARKET_REAL_PROVIDER_PILOT === "true" && realProvider.status !== "eligible") {
    return {
      status: "rejected",
      reason: `real_provider_${realProvider.reason ?? realProvider.status}`,
      opportunityId: result.opportunityId,
      allocationId: result.allocationId,
      allocationReceiptId: result.allocationReceiptId,
      clearingAmount: result.clearingAmount,
      currency: result.currency,
    };
  }
  return {
    status: "mapped",
    providerOffer: offer,
    disclosure: disclosureForOffers([offer]),
    opportunityId: result.opportunityId,
    allocationId: result.allocationId,
    allocationReceiptId: result.allocationReceiptId,
    clearingAmount: result.clearingAmount,
    currency: result.currency,
    offerIdentityReceiptId: identity.receiptId,
    providerVerificationReceiptId: `mpvr_${identity.receiptId}`,
  };
}
