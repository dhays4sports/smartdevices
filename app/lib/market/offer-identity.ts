import { createHash } from "node:crypto";
import type { CommercialIntentEnvelope, MarketFulfillmentOffer, MarketFulfillmentType } from "./contract";

export type Market07StoredBid = {
  bid_id?: string;
  provider_id?: string;
  offer?: unknown;
};

export type Market07StoredProvider = {
  provider_id?: string;
  name?: string;
};

export type OfferIdentityReceipt = {
  schemaVersion: 1;
  receiptId: string;
  status: "mapped" | "unmapped" | "rejected";
  reason?: string;
  allocationId?: string;
  allocationReceiptId?: string;
  bidId?: string;
  providerId?: string;
  providerName?: string;
  offerId?: string;
  deviceId?: string;
  fulfillmentType?: MarketFulfillmentType;
  destinationUrl?: string;
  programCarrierId?: string;
  programId?: string;
  programJurisdiction?: string;
  channelVariantId?: string;
  offerPayloadHash?: string;
  bindingHash: string;
  createdAt: string;
};

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object).sort().map((key) => `${JSON.stringify(key)}:${canonical(object[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function parseOffer(value: unknown): MarketFulfillmentOffer | null {
  if (!value || typeof value !== "object") return null;
  const offer = value as Record<string, unknown>;
  const deviceRef = offer.device_ref as Record<string, unknown> | undefined;
  const fulfillment = offer.fulfillment as Record<string, unknown> | undefined;
  if (offer.schema !== "smartdevices.market.fulfillment/1") return null;
  if (typeof offer.offer_id !== "string" || !offer.offer_id) return null;
  if (deviceRef?.namespace !== "smartdevices.com/device" || typeof deviceRef.id !== "string" || !deviceRef.id) return null;
  if (!fulfillment || !["manufacturer-direct", "retailer", "installer", "marketplace", "carrier-program"].includes(String(fulfillment.type))) return null;
  if (fulfillment.type === "carrier-program") {
    const programRef = fulfillment.program_ref as Record<string, unknown> | undefined;
    if (!programRef || typeof programRef.carrier_id !== "string" || !programRef.carrier_id || typeof programRef.program_id !== "string" || !programRef.program_id) return null;
  }
  if (fulfillment.destination_url != null && (typeof fulfillment.destination_url !== "string" || !/^https:\/\//.test(fulfillment.destination_url))) return null;
  return offer as unknown as MarketFulfillmentOffer;
}

export function resolveOfferIdentity(input: {
  intent: CommercialIntentEnvelope;
  allocationId?: string;
  allocationReceiptId?: string;
  bidId?: string;
  providerId?: string;
  bids: Market07StoredBid[];
  providers: Market07StoredProvider[];
  createdAt?: string;
}): OfferIdentityReceipt {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const base = {
    allocationId: input.allocationId,
    allocationReceiptId: input.allocationReceiptId,
    bidId: input.bidId,
    providerId: input.providerId,
  };
  const finish = (status: OfferIdentityReceipt["status"], reason: string | undefined, extra: Partial<OfferIdentityReceipt> = {}): OfferIdentityReceipt => {
    const bindingHash = sha256(canonical({ status, reason, ...base, ...extra }));
    return { schemaVersion: 1, receiptId: `ofr_${bindingHash.slice(0, 28)}`, status, reason, ...base, ...extra, bindingHash, createdAt };
  };

  if (!input.allocationId || !input.allocationReceiptId || !input.bidId || !input.providerId) return finish("unmapped", "allocation_binding_incomplete");
  const bid = input.bids.find((item) => item.bid_id === input.bidId);
  if (!bid) return finish("unmapped", "winning_bid_not_found");
  if (bid.provider_id !== input.providerId) return finish("rejected", "bid_provider_mismatch");
  const offer = parseOffer(bid.offer);
  if (!offer) return finish("unmapped", "canonical_offer_payload_missing");
  if (!input.intent.eligibleDeviceIds.includes(offer.device_ref.id)) {
    return finish("rejected", "device_not_qualified_by_smartdevices", { offerId: offer.offer_id, deviceId: offer.device_ref.id });
  }
  const provider = input.providers.find((item) => item.provider_id === input.providerId);
  const offerPayloadHash = sha256(canonical(offer));
  return finish("mapped", undefined, {
    providerName: provider?.name,
    offerId: offer.offer_id,
    deviceId: offer.device_ref.id,
    fulfillmentType: offer.fulfillment.type,
    destinationUrl: offer.fulfillment.destination_url,
    programCarrierId: offer.fulfillment.program_ref?.carrier_id,
    programId: offer.fulfillment.program_ref?.program_id,
    programJurisdiction: offer.fulfillment.program_ref?.jurisdiction,
    channelVariantId: offer.fulfillment.variant_id,
    offerPayloadHash,
  });
}
