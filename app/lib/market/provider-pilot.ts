import pilotJson from "@/content/market-provider-pilot.json";
import { getDeviceById } from "../data";
import type { ProviderOffer } from "./contract";
import { verifyProviderFulfillmentFreshness, type ProviderVerificationDecision } from "./provider-verification";

export type RealProviderPilotRecord = {
  providerId: string;
  providerName: string;
  deviceId: string;
  fulfillmentType: "manufacturer-direct" | "retailer" | "installer" | "marketplace" | "carrier-program";
  carrierId?: string;
  programId?: string;
  programJurisdiction?: string;
  allowedDestinationHosts: string[];
  pilotMode: "observe-only" | "preview-eligible";
  notes?: string;
};

export type RealProviderCertification = {
  status: "eligible" | "observe-only" | "rejected";
  reason?: string;
  provider?: RealProviderPilotRecord;
  verification?: ProviderVerificationDecision;
};

const pilot = pilotJson as RealProviderPilotRecord[];

function destinationHost(url?: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    return parsed.hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function certifyRealProviderOffer(
  offer: ProviderOffer,
  programContext?: { carrierId: string; programId?: string; jurisdiction?: string },
): RealProviderCertification {
  const provider = pilot.find((item) => item.providerId === offer.providerId && item.deviceId === offer.deviceId);
  if (!provider) return { status: "rejected", reason: "provider_not_in_real_pilot_registry" };

  const device = getDeviceById(offer.deviceId);
  if (!device || device.status !== "active" || device.editorialStatus !== "verified") {
    return { status: "rejected", reason: "device_not_editorially_eligible", provider };
  }

  const host = destinationHost(offer.destinationUrl);
  if (!host || !provider.allowedDestinationHosts.includes(host)) {
    return { status: "rejected", reason: "destination_not_authorized_for_provider", provider };
  }

  if (offer.fulfillmentType && offer.fulfillmentType !== provider.fulfillmentType) {
    return { status: "rejected", reason: "fulfillment_type_mismatch", provider };
  }

  if (provider.fulfillmentType === "carrier-program") {
    if (!provider.carrierId || !provider.programId) return { status: "rejected", reason: "carrier_program_registry_incomplete", provider };
    if (!programContext || programContext.carrierId !== provider.carrierId || (programContext.programId && programContext.programId !== provider.programId)) {
      return { status: "observe-only", reason: "carrier_program_context_mismatch", provider };
    }
    if (offer.programCarrierId !== provider.carrierId || offer.programId !== provider.programId) {
      return { status: "rejected", reason: "carrier_program_offer_mismatch", provider };
    }
    if (provider.programJurisdiction && offer.programJurisdiction && provider.programJurisdiction !== offer.programJurisdiction) {
      return { status: "rejected", reason: "carrier_program_jurisdiction_mismatch", provider };
    }
  }

  const verification = verifyProviderFulfillmentFreshness(offer);
  if (verification.status !== "verified") {
    return { status: "observe-only", reason: verification.reason ?? `provider_verification_${verification.status}`, provider, verification };
  }

  // Generic catalog availability describes the ordinary retail channel. A separately
  // verified carrier-program channel may be purchasable even when generic retail is sold out.
  if (provider.fulfillmentType !== "carrier-program" && device.availability !== "available") {
    return { status: "observe-only", reason: "device_availability_not_currently_available", provider, verification };
  }

  if (provider.pilotMode !== "preview-eligible") {
    return { status: "observe-only", reason: "provider_registry_observe_only", provider, verification };
  }

  return { status: "eligible", provider, verification };
}
