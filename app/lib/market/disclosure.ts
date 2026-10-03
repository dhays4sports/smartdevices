import type { CommercialDisclosure, ProviderOffer } from "./contract";

export function disclosureForOffers(offers: ProviderOffer[]): CommercialDisclosure | undefined {
  const sponsored = offers.some((offer) => offer.relationship === "sponsored");
  if (!sponsored) return undefined;
  return {
    schemaVersion: 1,
    sponsored: true,
    qualificationInfluencedByPayment: false,
    placementInfluencedByPayment: true,
    message: "A provider paid for placement among options that had already met SmartDevices compatibility requirements. Payment did not determine qualification.",
  };
}
