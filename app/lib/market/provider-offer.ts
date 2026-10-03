import type { CommercialIntentEnvelope, ProviderOffer } from "./contract";

export function offerIsEligibleForIntent(offer: ProviderOffer, intent: CommercialIntentEnvelope): boolean {
  return intent.eligibleDeviceIds.includes(offer.deviceId);
}

export function filterEligibleOffers(offers: ProviderOffer[], intent: CommercialIntentEnvelope): ProviderOffer[] {
  return offers.filter((offer) => offerIsEligibleForIntent(offer, intent));
}
