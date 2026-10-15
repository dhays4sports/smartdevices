import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { marketOutcomeAttributions } from "@/db/schema";
import type { MarketOutcomeName } from "./contract";
import type { PreviewAttributionClaims } from "./outcome-attribution";

export async function recordPreviewOutcome(
  claims: PreviewAttributionClaims,
  event: Extract<MarketOutcomeName, "sponsored-offer-viewed" | "sponsored-offer-opened" | "provider-selected">,
  occurredAt = new Date().toISOString(),
): Promise<{ id: string; duplicate: boolean }> {
  const db = await getDb();
  const id = `moa_${claims.transactionId}_${event.replaceAll("-", "_")}`;
  const inserted = await db.insert(marketOutcomeAttributions).values({
    id,
    transactionId: claims.transactionId,
    event,
    occurredAt,
    intentId: claims.intentId,
    opportunityId: claims.opportunityId,
    allocationId: claims.allocationId,
    allocationReceiptId: claims.allocationReceiptId,
    offerIdentityReceiptId: claims.offerIdentityReceiptId,
    providerVerificationReceiptId: claims.providerVerificationReceiptId,
    offerId: claims.offerId,
    providerId: claims.providerId,
    deviceId: claims.deviceId,
    destinationUrl: claims.destinationUrl,
    source: "preview",
  }).onConflictDoNothing({ target: [marketOutcomeAttributions.transactionId, marketOutcomeAttributions.event] }).returning({ id: marketOutcomeAttributions.id });
  return { id, duplicate: inserted.length === 0 };
}

export async function getPreviewOutcomesForTransactions(transactionIds: string[]) {
  if (!transactionIds.length) return [];
  const db = await getDb();
  // D1 query volume here is deliberately bounded by the operator dashboard limit.
  const rows = await db.select().from(marketOutcomeAttributions).orderBy(desc(marketOutcomeAttributions.createdAt)).limit(1000);
  const wanted = new Set(transactionIds);
  return rows.filter((row) => wanted.has(row.transactionId));
}

export async function getPreviewOutcomeByTransaction(transactionId: string) {
  const db = await getDb();
  return db.select().from(marketOutcomeAttributions).where(eq(marketOutcomeAttributions.transactionId, transactionId)).orderBy(desc(marketOutcomeAttributions.createdAt));
}
