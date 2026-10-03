import type { ScanResult } from "../scan";
import type { CommercialIntentEnvelope, CommercialStage, CommercializationPermission } from "./contract";

export const DEFAULT_MARKET_PERMISSION: CommercializationPermission = {
  sponsoredPlacementAllowed: false,
  directProviderContactAllowed: false,
  personalDataSharingAllowed: false,
};

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function safeIdPart(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 80);
}

export function buildCommercialIntent(
  scan: ScanResult,
  options: {
    intentId?: string;
    createdAt?: string;
    jurisdiction?: string;
    programContext?: CommercialIntentEnvelope["programContext"];
    commercialStage?: CommercialStage;
    commercialization?: Partial<CommercializationPermission>;
  } = {},
): CommercialIntentEnvelope {
  const createdAt = options.createdAt ?? new Date().toISOString();
  const eligibleDeviceIds = unique(scan.recommendations.map((item) => item.device.id));
  const requiredCapabilities = unique(scan.recommendations.flatMap((item) => item.device.capabilities));
  const commercialization = { ...DEFAULT_MARKET_PERMISSION, ...options.commercialization };

  return {
    schemaVersion: 1,
    intentId: options.intentId ?? `sdi_${safeIdPart(scan.domainId)}_${safeIdPart(scan.primaryConcernId)}_${Date.parse(createdAt) || 0}`,
    createdAt,
    domain: scan.domainId,
    concernId: scan.primaryConcernId,
    jurisdiction: options.jurisdiction,
    programContext: options.programContext,
    eligibleDeviceIds,
    requiredCapabilities,
    commercialStage: options.commercialStage ?? "research",
    commercialization,
  };
}

export function validateCommercialIntent(intent: CommercialIntentEnvelope): string[] {
  const errors: string[] = [];
  if (intent.schemaVersion !== 1) errors.push("unsupported schemaVersion");
  if (!/^sdi_[A-Za-z0-9_-]{3,180}$/.test(intent.intentId)) errors.push("invalid intentId");
  if (!Number.isFinite(Date.parse(intent.createdAt))) errors.push("invalid createdAt");
  if (!intent.eligibleDeviceIds.length) errors.push("eligibleDeviceIds must not be empty");
  if (intent.eligibleDeviceIds.some((id) => !/^[A-Za-z0-9_-]{1,100}$/.test(id))) errors.push("invalid device id");
  if (intent.requiredCapabilities.length > 50) errors.push("too many requiredCapabilities");
  if (intent.programContext) {
    if (!/^[A-Za-z0-9_-]{1,80}$/.test(intent.programContext.carrierId)) errors.push("invalid program carrierId");
    if (intent.programContext.programId && !/^[A-Za-z0-9_.:-]{1,120}$/.test(intent.programContext.programId)) errors.push("invalid programId");
  }
  if (intent.commercialization.personalDataSharingAllowed) errors.push("pilot forbids personal data sharing");
  if (intent.commercialization.directProviderContactAllowed) errors.push("pilot forbids direct provider contact");
  return errors;
}
