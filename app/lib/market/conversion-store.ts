import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { marketConversionReceipts, marketOutcomeAttributions, marketProviderCallbackNonces } from "@/db/schema";
import {
  conversionBindingHash,
  providerReferenceHash,
  type MarketConversionConfidence,
  type MarketConversionEvent,
  type MarketConversionLineage,
  type MarketConversionSource,
} from "./conversion";

export async function recordProviderCallbackNonce(providerId: string, nonce: string, timestamp: string): Promise<boolean> {
  const db = await getDb();
  const id = `mpcn_${providerId}_${nonce}`;
  const inserted = await db.insert(marketProviderCallbackNonces).values({ id, providerId, nonce, timestamp }).onConflictDoNothing({ target: [marketProviderCallbackNonces.providerId, marketProviderCallbackNonces.nonce] }).returning({ id: marketProviderCallbackNonces.id });
  return inserted.length === 1;
}

export async function getConversionLineageByTransaction(transactionId: string): Promise<MarketConversionLineage | null> {
  const db = await getDb();
  const rows = await db.select().from(marketOutcomeAttributions).where(eq(marketOutcomeAttributions.transactionId, transactionId)).orderBy(desc(marketOutcomeAttributions.createdAt)).limit(1);
  const row = rows[0];
  if (!row) return null;
  return {
    transactionId: row.transactionId,
    intentId: row.intentId,
    opportunityId: row.opportunityId,
    allocationId: row.allocationId,
    allocationReceiptId: row.allocationReceiptId ?? undefined,
    offerIdentityReceiptId: row.offerIdentityReceiptId,
    providerVerificationReceiptId: row.providerVerificationReceiptId,
    offerId: row.offerId,
    providerId: row.providerId,
    deviceId: row.deviceId,
    destinationUrl: row.destinationUrl,
  };
}

export async function recordConversionReceipt(args: {
  lineage: MarketConversionLineage;
  event: MarketConversionEvent;
  source: MarketConversionSource;
  confidence: MarketConversionConfidence;
  occurredAt?: string;
  providerReference?: string;
  callbackNonce?: string;
}): Promise<{ id: string; duplicate: boolean; bindingHash: string }> {
  const db = await getDb();
  const occurredAt = args.occurredAt ?? new Date().toISOString();
  const id = `mcr_${args.lineage.transactionId}_${args.event}_${args.source.replaceAll("-", "_")}`;
  const bindingHash = conversionBindingHash(args.lineage, args.event, args.source, occurredAt);
  const inserted = await db.insert(marketConversionReceipts).values({
    id,
    transactionId: args.lineage.transactionId,
    event: args.event,
    source: args.source,
    confidence: args.confidence,
    occurredAt,
    intentId: args.lineage.intentId,
    opportunityId: args.lineage.opportunityId,
    allocationId: args.lineage.allocationId,
    allocationReceiptId: args.lineage.allocationReceiptId,
    offerIdentityReceiptId: args.lineage.offerIdentityReceiptId,
    providerVerificationReceiptId: args.lineage.providerVerificationReceiptId,
    offerId: args.lineage.offerId,
    providerId: args.lineage.providerId,
    deviceId: args.lineage.deviceId,
    providerReferenceHash: providerReferenceHash(args.providerReference),
    callbackNonce: args.callbackNonce,
    bindingHash,
  }).onConflictDoNothing({ target: [marketConversionReceipts.transactionId, marketConversionReceipts.event, marketConversionReceipts.source] }).returning({ id: marketConversionReceipts.id });
  return { id, duplicate: inserted.length === 0, bindingHash };
}
