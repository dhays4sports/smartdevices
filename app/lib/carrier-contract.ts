export const carrierIntents = ["requirement", "discounts", "recommendations"] as const;
export type CarrierIntent = (typeof carrierIntents)[number];

export const carrierAssertionSources = [
  "consumer-stated",
  "professional-stated",
  "carrier-public-source",
  "manufacturer-technical-source",
  "smartdevices-editorial",
] as const;
export type CarrierAssertionSource = (typeof carrierAssertionSources)[number];

export const carrierDisplayDesignations = [
  "your-stated-requirement",
  "professional-stated-requirement",
  "carrier-public-offer",
  "potential-carrier-discount-category",
  "meets-published-capability-description",
  "smartdevices-recommended",
  "confirmation-needed",
] as const;
export type CarrierDisplayDesignation = (typeof carrierDisplayDesignations)[number];

export const carrierDisplayLabels: Record<CarrierDisplayDesignation, string> = {
  "your-stated-requirement": "Your stated requirement",
  "professional-stated-requirement": "Professional-stated requirement",
  "carrier-public-offer": "Farmers public offer",
  "potential-carrier-discount-category": "Potential Farmers discount category",
  "meets-published-capability-description": "Meets the published capability description",
  "smartdevices-recommended": "SmartDevices recommended",
  "confirmation-needed": "Confirmation needed",
};

export function carrierDisplayLabel(designation: CarrierDisplayDesignation, carrierName: string): string {
  if (designation === "carrier-public-offer") return `${carrierName} public offer`;
  if (designation === "potential-carrier-discount-category") return `Potential ${carrierName} discount category`;
  return carrierDisplayLabels[designation];
}

export const prohibitedCarrierCopyPatterns = [
  /farmers[- ]approved/i,
  /farmers[- ]certified/i,
  /guaranteed (?:discount|eligibility|savings|claim|approval)/i,
  /satisfies your policy/i,
  /required for all farmers homes/i,
  /official smartdevices\s*\/\s*farmers partnership/i,
] as const;

export function assertPublicCarrierCopy(value: string): void {
  const match = prohibitedCarrierCopyPatterns.find((pattern) => pattern.test(value));
  if (match) throw new Error(`PROHIBITED_CARRIER_COPY:${match.source}`);
}

export function sanitizeCarrierQueryValue(
  value: string | string[] | undefined,
  allowed: readonly string[],
): string | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate || candidate.length > 64 || !/^[a-z0-9-]+$/.test(candidate)) return undefined;
  return allowed.includes(candidate) ? candidate : undefined;
}
