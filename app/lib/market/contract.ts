import type { DomainId } from "../data";

export type CommercialStage = "research" | "active-consideration" | "ready-to-acquire";

export type CommercializationPermission = {
  sponsoredPlacementAllowed: boolean;
  directProviderContactAllowed: boolean;
  personalDataSharingAllowed: boolean;
};

export type CommercialIntentEnvelope = {
  schemaVersion: 1;
  intentId: string;
  createdAt: string;
  domain: DomainId;
  concernId: string;
  jurisdiction?: string;
  programContext?: { carrierId: string; programId?: string; jurisdiction?: string };
  eligibleDeviceIds: string[];
  requiredCapabilities: string[];
  commercialStage: CommercialStage;
  commercialization: CommercializationPermission;
};

export type ProviderRelationship = "organic" | "affiliate" | "sponsored";

export type MarketFulfillmentType = "manufacturer-direct" | "retailer" | "installer" | "marketplace" | "carrier-program";

export type MarketFulfillmentOffer = {
  schema: "smartdevices.market.fulfillment/1";
  offer_id: string;
  device_ref: { namespace: "smartdevices.com/device"; id: string };
  fulfillment: {
    type: MarketFulfillmentType;
    destination_url?: string;
    program_ref?: { carrier_id: string; program_id: string; jurisdiction?: string };
    variant_id?: string;
  };
};

export type ProviderOffer = {
  schemaVersion: 1;
  offerId: string;
  providerId: string;
  providerName: string;
  deviceId: string;
  relationship: ProviderRelationship;
  destinationUrl?: string;
  installationAvailable?: boolean;
  serviceArea?: string[];
  priceLabel?: string;
  priceCheckedAt?: string;
  marketOpportunityId?: string;
  marketAllocationId?: string;
  fulfillmentType?: MarketFulfillmentType;
  programCarrierId?: string;
  programId?: string;
  programJurisdiction?: string;
  channelVariantId?: string;
};

export type CommercialDisclosure = {
  schemaVersion: 1;
  sponsored: boolean;
  qualificationInfluencedByPayment: false;
  placementInfluencedByPayment: boolean;
  message: string;
};

export type MarketResult = {
  status: "disabled" | "shadow" | "active" | "no-market";
  opportunityId?: string;
  offers: ProviderOffer[];
  disclosure?: CommercialDisclosure;
};

export type MarketOutcomeName =
  | "sponsored-offer-viewed"
  | "sponsored-offer-opened"
  | "provider-selected"
  | "purchase-self-reported"
  | "installation-self-reported";

export type MarketOutcome = {
  schemaVersion: 1;
  outcomeId: string;
  occurredAt: string;
  event: MarketOutcomeName;
  intentId: string;
  opportunityId?: string;
  allocationId?: string;
  offerId?: string;
  providerId?: string;
  deviceId?: string;
};
