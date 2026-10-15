import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { marketOfferIdentityReceipts, marketProviderVerificationReceipts, marketShadowRuns, marketOutcomeAttributions, marketConversionReceipts } from "@/db/schema";
import type { CommercialIntentEnvelope } from "./contract";
import type { Market07ShadowResult } from "./runtime07";
import { certifyRealProviderOffer } from "./provider-pilot";
import type { ProviderOffer } from "./contract";

type ShadowStatus = "filled" | "no-market" | "error";

export type ShadowObservation = {
  id: string;
  intentId: string;
  status: ShadowStatus;
  recommendedDeviceIds: string[];
  opportunityId?: string;
  allocationId?: string;
  allocationReceiptId?: string;
  sponsoredProviderId?: string;
  sponsoredDeviceId?: string;
  clearingAmount?: number;
  currency?: string;
  evaluated: Market07ShadowResult["evaluated"];
  errorCode?: string;
  createdAt: string;
};

function runId(intentId: string) {
  return `msr_${Buffer.from(intentId).toString("base64url").slice(0, 42)}`;
}

function asJsonArray(value: string): unknown[] {
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
}

export async function recordMarketShadowObservation(
  intent: CommercialIntentEnvelope,
  result: Market07ShadowResult | null,
  errorCode?: string,
): Promise<void> {
  const db = await getDb();
  const status: ShadowStatus = errorCode ? "error" : result?.status === "shadow" ? "filled" : "no-market";
  await db.insert(marketShadowRuns).values({
    id: runId(intent.intentId),
    intentId: intent.intentId,
    opportunityId: result?.opportunityId,
    allocationId: result?.allocationId,
    allocationReceiptId: result?.allocationReceiptId,
    status,
    domain: intent.domain,
    concernId: intent.concernId,
    jurisdiction: intent.jurisdiction,
    recommendedDeviceIdsJson: JSON.stringify(intent.eligibleDeviceIds),
    sponsoredProviderId: result?.providerId,
    sponsoredDeviceId: result?.offerIdentity?.status === "mapped" ? result.offerIdentity.deviceId : undefined,
    clearingAmountMicros: typeof result?.clearingAmount === "number" ? Math.round(result.clearingAmount * 1_000_000) : undefined,
    currency: result?.currency,
    evaluatedJson: JSON.stringify(result?.evaluated ?? []),
    errorCode,
  }).onConflictDoNothing({ target: marketShadowRuns.intentId });

  const identity = result?.offerIdentity;
  if (identity && result?.allocationId) {
    await db.insert(marketOfferIdentityReceipts).values({
      id: identity.receiptId,
      shadowRunId: runId(intent.intentId),
      intentId: intent.intentId,
      status: identity.status,
      reason: identity.reason,
      opportunityId: result.opportunityId,
      allocationId: result.allocationId,
      allocationReceiptId: result.allocationReceiptId,
      bidId: identity.bidId,
      providerId: identity.providerId,
      providerName: identity.providerName,
      offerId: identity.offerId,
      deviceId: identity.deviceId,
      fulfillmentType: identity.fulfillmentType,
      destinationUrl: identity.destinationUrl,
      offerPayloadHash: identity.offerPayloadHash,
      bindingHash: identity.bindingHash,
      createdAt: identity.createdAt,
    }).onConflictDoNothing({ target: marketOfferIdentityReceipts.allocationId });

    if (identity.status === "mapped" && identity.providerId && identity.offerId && identity.deviceId) {
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
      const decision = certifyRealProviderOffer(offer, intent.programContext);
      const verification = decision.verification;
      const verificationStatus = verification?.status ?? (decision.status === "eligible" ? "verified" : "missing");
      await db.insert(marketProviderVerificationReceipts).values({
        id: `mpvr_${identity.receiptId}`,
        shadowRunId: runId(intent.intentId),
        intentId: intent.intentId,
        allocationId: result.allocationId,
        providerId: identity.providerId,
        deviceId: identity.deviceId,
        status: verificationStatus,
        reason: verification?.reason ?? decision.reason,
        verificationId: verification?.record?.verificationId,
        sourceUrl: verification?.record?.sourceUrl,
        checkedAt: verification?.record?.checkedAt,
        ageHoursMillis: verification?.ageHours == null ? undefined : Math.round(verification.ageHours * 3_600_000),
        availability: verification?.record?.availability,
        priceMicros: verification?.record?.price ? Math.round(verification.record.price.amount * 1_000_000) : undefined,
        currency: verification?.record?.price?.currency,
      }).onConflictDoNothing({ target: marketProviderVerificationReceipts.allocationId });
    }
  }
}

export async function getMarketShadowDashboard(limit = 100) {
  const db = await getDb();
  const rows = await db.select().from(marketShadowRuns).orderBy(desc(marketShadowRuns.createdAt)).limit(Math.min(Math.max(limit, 1), 500));
  const identityRows = await db.select().from(marketOfferIdentityReceipts).orderBy(desc(marketOfferIdentityReceipts.createdAt)).limit(500);
  const verificationRows = await db.select().from(marketProviderVerificationReceipts).orderBy(desc(marketProviderVerificationReceipts.createdAt)).limit(500);
  const outcomeRows = await db.select().from(marketOutcomeAttributions).orderBy(desc(marketOutcomeAttributions.createdAt)).limit(1000);
  const conversionRows = await db.select().from(marketConversionReceipts).orderBy(desc(marketConversionReceipts.createdAt)).limit(1000);
  const identityByRun = new Map(identityRows.map((row) => [row.shadowRunId, row]));
  const verificationByRun = new Map(verificationRows.map((row) => [row.shadowRunId, row]));
  const outcomesByAllocation = new Map<string, typeof outcomeRows>();
  for (const outcome of outcomeRows) {
    const existing = outcomesByAllocation.get(outcome.allocationId) ?? [];
    existing.push(outcome);
    outcomesByAllocation.set(outcome.allocationId, existing);
  }
  const conversionsByAllocation = new Map<string, typeof conversionRows>();
  for (const conversion of conversionRows) {
    const existing = conversionsByAllocation.get(conversion.allocationId) ?? [];
    existing.push(conversion);
    conversionsByAllocation.set(conversion.allocationId, existing);
  }
  const totals = rows.reduce((acc, row) => {
    acc.total += 1;
    if (row.status === "filled") acc.filled += 1;
    if (row.status === "no-market") acc.noMarket += 1;
    if (row.status === "error") acc.errors += 1;
    return acc;
  }, { total: 0, filled: 0, noMarket: 0, errors: 0 });
  const filledRows = rows.filter((row) => row.status === "filled" && row.clearingAmountMicros != null);
  const averageClearingAmount = filledRows.length
    ? filledRows.reduce((sum, row) => sum + Number(row.clearingAmountMicros) / 1_000_000, 0) / filledRows.length
    : null;
  const rejectionReasons: Record<string, number> = {};
  for (const row of rows) {
    for (const item of asJsonArray(row.evaluatedJson) as Array<{ eligible?: boolean; reason?: string }>) {
      if (item.eligible === false) rejectionReasons[item.reason ?? "unspecified"] = (rejectionReasons[item.reason ?? "unspecified"] ?? 0) + 1;
    }
  }
  const mapped = rows.filter((row) => identityByRun.get(row.id)?.status === "mapped").length;
  const mappingRejected = rows.filter((row) => identityByRun.get(row.id)?.status === "rejected").length;
  const mappingUnmapped = rows.filter((row) => identityByRun.get(row.id)?.status === "unmapped").length;
  const providerVerified = rows.filter((row) => verificationByRun.get(row.id)?.status === "verified").length;
  const providerStale = rows.filter((row) => verificationByRun.get(row.id)?.status === "stale").length;
  const providerUnavailable = rows.filter((row) => verificationByRun.get(row.id)?.status === "unavailable").length;
  const previewViews = outcomeRows.filter((row) => row.event === "sponsored-offer-viewed").length;
  const previewOpens = outcomeRows.filter((row) => row.event === "sponsored-offer-opened").length;
  const previewSelections = outcomeRows.filter((row) => row.event === "provider-selected").length;
  const selfReportedPurchases = conversionRows.filter((row) => row.event === "purchase" && row.confidence === "self-reported").length;
  const selfReportedInstallations = conversionRows.filter((row) => row.event === "installation" && row.confidence === "self-reported").length;
  const providerVerifiedPurchases = conversionRows.filter((row) => row.event === "purchase" && row.confidence === "provider-verified").length;
  const providerVerifiedInstallations = conversionRows.filter((row) => row.event === "installation" && row.confidence === "provider-verified").length;
  return {
    generatedAt: new Date().toISOString(),
    metrics: {
      ...totals,
      mapped, mappingRejected, mappingUnmapped, providerVerified, providerStale, providerUnavailable,
      previewViews, previewOpens, previewSelections,
      selfReportedPurchases, selfReportedInstallations, providerVerifiedPurchases, providerVerifiedInstallations,
      previewOpenRate: previewViews ? previewOpens / previewViews : 0,
      mappingRate: totals.filled ? mapped / totals.filled : 0,
      fillRate: totals.total ? totals.filled / totals.total : 0,
      averageClearingAmount,
      currency: filledRows.find((row) => row.currency)?.currency ?? null,
      rejectionReasons,
    },
    runs: rows.map((row) => ({
      id: row.id,
      intentId: row.intentId,
      status: row.status,
      opportunityId: row.opportunityId,
      allocationId: row.allocationId,
      allocationReceiptId: row.allocationReceiptId,
      recommendedDeviceIds: asJsonArray(row.recommendedDeviceIdsJson),
      sponsoredProviderId: row.sponsoredProviderId,
      sponsoredDeviceId: row.sponsoredDeviceId,
      clearingAmount: row.clearingAmountMicros == null ? null : Number(row.clearingAmountMicros) / 1_000_000,
      currency: row.currency,
      evaluated: asJsonArray(row.evaluatedJson),
      errorCode: row.errorCode,
      offerIdentity: identityByRun.get(row.id) ? {
        receiptId: identityByRun.get(row.id)?.id,
        status: identityByRun.get(row.id)?.status,
        reason: identityByRun.get(row.id)?.reason,
        bidId: identityByRun.get(row.id)?.bidId,
        providerName: identityByRun.get(row.id)?.providerName,
        offerId: identityByRun.get(row.id)?.offerId,
        deviceId: identityByRun.get(row.id)?.deviceId,
        fulfillmentType: identityByRun.get(row.id)?.fulfillmentType,
        destinationUrl: identityByRun.get(row.id)?.destinationUrl,
        offerPayloadHash: identityByRun.get(row.id)?.offerPayloadHash,
        bindingHash: identityByRun.get(row.id)?.bindingHash,
      } : null,
      previewOutcomes: row.allocationId ? (outcomesByAllocation.get(row.allocationId) ?? []).map((outcome) => ({
        id: outcome.id,
        transactionId: outcome.transactionId,
        event: outcome.event,
        occurredAt: outcome.occurredAt,
        offerIdentityReceiptId: outcome.offerIdentityReceiptId,
        providerVerificationReceiptId: outcome.providerVerificationReceiptId,
      })) : [],
      conversions: row.allocationId ? (conversionsByAllocation.get(row.allocationId) ?? []).map((conversion) => ({
        id: conversion.id,
        transactionId: conversion.transactionId,
        event: conversion.event,
        source: conversion.source,
        confidence: conversion.confidence,
        occurredAt: conversion.occurredAt,
        offerIdentityReceiptId: conversion.offerIdentityReceiptId,
        providerVerificationReceiptId: conversion.providerVerificationReceiptId,
        bindingHash: conversion.bindingHash,
      })) : [],
      providerVerification: verificationByRun.get(row.id) ? {
        receiptId: verificationByRun.get(row.id)?.id,
        status: verificationByRun.get(row.id)?.status,
        reason: verificationByRun.get(row.id)?.reason,
        verificationId: verificationByRun.get(row.id)?.verificationId,
        sourceUrl: verificationByRun.get(row.id)?.sourceUrl,
        checkedAt: verificationByRun.get(row.id)?.checkedAt,
        ageHours: verificationByRun.get(row.id)?.ageHoursMillis == null ? null : Number(verificationByRun.get(row.id)?.ageHoursMillis) / 3_600_000,
        availability: verificationByRun.get(row.id)?.availability,
        price: verificationByRun.get(row.id)?.priceMicros == null ? null : Number(verificationByRun.get(row.id)?.priceMicros) / 1_000_000,
        currency: verificationByRun.get(row.id)?.currency,
      } : null,
      createdAt: row.createdAt,
    })),
  };
}
