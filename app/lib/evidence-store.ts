import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { auditEvents, evidenceDecisions, evidencePublicationSnapshots, evidenceRefreshRuns, evidenceSourceChecks } from "@/db/schema";
import { safeId } from "./api";
import { carrierPrograms, carrierRegistry, deviceClasses, evidenceIsCurrent, publishedCarriers, type ProCarrierData } from "./carrier";
import {
  applySafeRefresh,
  checkEvidenceSource,
  createSeedEvidenceBundle,
  hashEvidenceText,
  summarizeEvidenceChecks,
  validatePublishedEvidenceBundle,
  type EvidenceFetcher,
  type EvidenceSourceCheck,
  type PublishedEvidenceBundle,
} from "./evidence-refresh";

export type EvidenceDashboard = {
  mode: "active" | "disabled";
  sourceCount: number;
  activeSnapshot: { id: string; sequence: number; publishedAt: string; publishedBy: string } | null;
  latestRun: { id: string; trigger: string; status: string; startedAt: string; completedAt: string | null; summary: ReturnType<typeof summarizeEvidenceChecks> | null } | null;
  checks: EvidenceSourceCheck[];
  reason?: "STORAGE_UNAVAILABLE";
};

export async function getPublishedEvidenceBundle(): Promise<PublishedEvidenceBundle> {
  try {
    const db = await getDb();
    const [snapshot] = await db.select().from(evidencePublicationSnapshots).where(eq(evidencePublicationSnapshots.status, "active")).orderBy(desc(evidencePublicationSnapshots.sequence)).limit(1);
    if (!snapshot) return createSeedEvidenceBundle("2026-08-26T00:00:00.000Z");
    const parsed = JSON.parse(snapshot.payloadJson) as PublishedEvidenceBundle;
    return validatePublishedEvidenceBundle(parsed).length ? createSeedEvidenceBundle("2026-08-26T00:00:00.000Z") : parsed;
  } catch {
    return createSeedEvidenceBundle("2026-08-26T00:00:00.000Z");
  }
}

export function publicCarrierDataFromBundle(bundle: PublishedEvidenceBundle, now = new Date().toISOString().slice(0, 10)): ProCarrierData {
  const carriers = publishedCarriers(carrierRegistry.carriers);
  const carrierIds = new Set(carriers.map((item) => item.id));
  const sources = bundle.sources.filter((source) => source.visibility === "public" && evidenceIsCurrent(source, now));
  const sourceIds = new Set(sources.map((source) => source.id));
  const programs = carrierPrograms.programs.filter((program) => carrierIds.has(program.carrierId) && program.visibility === "public" && program.sourceIds.every((id) => sourceIds.has(id)) && evidenceIsCurrent(program, now));
  const programIds = new Set(programs.map((program) => program.id));
  const rules = bundle.rules.filter((rule) => programIds.has(rule.programId) && rule.visibility === "public" && rule.reviewStatus === "reviewed" && rule.sourceIds.every((id) => sourceIds.has(id)) && evidenceIsCurrent(rule, now));
  const fits = bundle.fits.filter((fit) => carrierIds.has(fit.carrierId) && fit.sourceIds.every((id) => sourceIds.has(id)) && evidenceIsCurrent(fit, now));
  const classIds = new Set([...rules.flatMap((item) => item.capabilityClassIds), ...fits.flatMap((item) => item.classIds)]);
  return { carriers, programs, rules, sources, classes: deviceClasses.classes.filter((item) => classIds.has(item.id)), fits };
}

export function publicCarrierArchiveFromBundle(bundle: PublishedEvidenceBundle): ProCarrierData {
  const carriers = publishedCarriers(carrierRegistry.carriers);
  const carrierIds = new Set(carriers.map((item) => item.id));
  const sources = bundle.sources.filter((source) => source.visibility === "public");
  const sourceIds = new Set(sources.map((source) => source.id));
  const programs = carrierPrograms.programs.filter((program) => carrierIds.has(program.carrierId) && program.visibility === "public" && program.sourceIds.every((id) => sourceIds.has(id)));
  const programIds = new Set(programs.map((program) => program.id));
  const rules = bundle.rules.filter((rule) => programIds.has(rule.programId) && rule.visibility === "public" && rule.status !== "draft" && rule.sourceIds.every((id) => sourceIds.has(id)));
  const fits = bundle.fits.filter((fit) => carrierIds.has(fit.carrierId) && fit.status !== "draft" && fit.sourceIds.every((id) => sourceIds.has(id)));
  return { carriers, programs, rules, sources, classes: deviceClasses.classes, fits };
}

export async function getEvidenceDashboard(): Promise<EvidenceDashboard> {
  try {
    const db = await getDb();
    const [snapshot] = await db.select({ id: evidencePublicationSnapshots.id, sequence: evidencePublicationSnapshots.sequence, publishedAt: evidencePublicationSnapshots.publishedAt, publishedBy: evidencePublicationSnapshots.publishedBy }).from(evidencePublicationSnapshots).where(eq(evidencePublicationSnapshots.status, "active")).orderBy(desc(evidencePublicationSnapshots.sequence)).limit(1);
    const [run] = await db.select().from(evidenceRefreshRuns).orderBy(desc(evidenceRefreshRuns.startedAt)).limit(1);
    const rows = run ? await db.select().from(evidenceSourceChecks).where(eq(evidenceSourceChecks.runId, run.id)).orderBy(evidenceSourceChecks.sourceId) : [];
    return {
      mode: "active",
      sourceCount: (await getPublishedEvidenceBundle()).sources.length,
      activeSnapshot: snapshot ?? null,
      latestRun: run ? { id: run.id, trigger: run.trigger, status: run.status, startedAt: run.startedAt, completedAt: run.completedAt, summary: parseSummary(run.summaryJson) } : null,
      checks: rows.map(rowToCheck),
    };
  } catch {
    const bundle = createSeedEvidenceBundle("2026-08-26T00:00:00.000Z");
    return { mode: "disabled", sourceCount: bundle.sources.length, activeSnapshot: null, latestRun: null, checks: [], reason: "STORAGE_UNAVAILABLE" };
  }
}

export async function runEvidenceRefresh({ trigger, actor, fetcher = fetch, now = new Date() }: { trigger: "manual" | "scheduled"; actor: string; fetcher?: EvidenceFetcher; now?: Date }) {
  const db = await getDb();
  const runId = safeId("evr");
  const startedAt = now.toISOString();
  const current = await getPublishedEvidenceBundle();
  const [activeSnapshot] = await db.select({ id: evidencePublicationSnapshots.id }).from(evidencePublicationSnapshots).where(eq(evidencePublicationSnapshots.status, "active")).orderBy(desc(evidencePublicationSnapshots.sequence)).limit(1);
  await db.insert(evidenceRefreshRuns).values({ id: runId, trigger, status: "running", startedBy: actor, baselineSnapshotId: activeSnapshot?.id ?? null, summaryJson: "{}", startedAt });
  try {
    const recentRows = await db.select({ sourceId: evidenceSourceChecks.sourceId, observedHash: evidenceSourceChecks.observedHash }).from(evidenceSourceChecks).orderBy(desc(evidenceSourceChecks.checkedAt)).limit(500);
    const previousHashes = new Map<string, string>();
    for (const row of recentRows) if (row.observedHash && !previousHashes.has(row.sourceId)) previousHashes.set(row.sourceId, row.observedHash);
    const checks = await Promise.all(current.sources.filter((source) => source.visibility === "public").map((source) => checkEvidenceSource(source, previousHashes.get(source.id) ?? null, fetcher, now)));
    const summary = summarizeEvidenceChecks(checks);
    if (checks.length) {
      const inserts = checks.map((check) => db.insert(evidenceSourceChecks).values({
      id: safeId("evc"), runId, sourceId: check.sourceId, sourceVersion: check.sourceVersion, sourceUrl: check.sourceUrl, previousHash: check.previousHash,
      observedHash: check.observedHash, httpStatus: check.httpStatus, outcome: check.outcome, changeClass: check.changeClass, errorCode: check.errorCode, checkedAt: check.checkedAt,
      }));
      await db.batch([inserts[0], ...inserts.slice(1)]);
    }
    const reviewDate = now.toISOString().slice(0, 10);
    const refreshed = applySafeRefresh(current, checks, reviewDate);
    const changed = await hashEvidenceText(JSON.stringify(refreshed)) !== await hashEvidenceText(JSON.stringify(current));
    let snapshotId: string | null = null;
    if (changed) snapshotId = await publishEvidenceSnapshot(refreshed, runId, actor, now);
    await db.batch([
      db.update(evidenceRefreshRuns).set({ status: "completed", summaryJson: JSON.stringify(summary), completedAt: new Date().toISOString() }).where(eq(evidenceRefreshRuns.id, runId)),
      db.insert(auditEvents).values({ id: safeId("aud"), actorType: trigger === "scheduled" ? "system" : "agent", actorRef: actor, action: "evidence.refresh.completed", objectType: "evidence-refresh-run", objectId: runId, metadataJson: JSON.stringify({ ...summary, snapshotId }), occurredAt: new Date().toISOString() }),
    ]);
    return { runId, summary, checks, snapshotId };
  } catch (error) {
    const errorCode = error instanceof Error ? error.message.slice(0, 80) : "EVIDENCE_REFRESH_FAILED";
    await db.update(evidenceRefreshRuns).set({ status: "failed", errorCode, completedAt: new Date().toISOString() }).where(eq(evidenceRefreshRuns.id, runId));
    throw error;
  }
}

export async function decideEvidenceCheck(input: { runId: string; sourceId: string; decision: "confirm-unchanged" | "mark-stale" | "reject"; actor: string; rationale?: string; now?: Date }) {
  const now = input.now ?? new Date();
  const db = await getDb();
  const [checkRow] = await db.select().from(evidenceSourceChecks).where(and(eq(evidenceSourceChecks.runId, input.runId), eq(evidenceSourceChecks.sourceId, input.sourceId))).limit(1);
  if (!checkRow) throw new Error("EVIDENCE_CHECK_NOT_FOUND");
  if (input.decision === "confirm-unchanged" && !["baseline", "changed"].includes(checkRow.outcome)) throw new Error("EVIDENCE_DECISION_NOT_ALLOWED");
  const current = await getPublishedEvidenceBundle();
  let snapshotId: string | null = null;
  if (input.decision === "confirm-unchanged") {
    const confirmed = { ...rowToCheck(checkRow), outcome: "confirmed" as const, changeClass: "none" as const, nextAction: "renew" as const };
    snapshotId = await publishEvidenceSnapshot(applySafeRefresh(current, [confirmed], now.toISOString().slice(0, 10)), input.runId, input.actor, now);
  } else if (input.decision === "mark-stale") {
    const sources = current.sources.map((source) => source.id === input.sourceId ? { ...source, status: "stale" as const } : source);
    const rules = current.rules.map((rule) => rule.sourceIds.includes(input.sourceId) ? { ...rule, status: "stale" as const } : rule);
    const fits = current.fits.map((fit) => fit.sourceIds.includes(input.sourceId) ? { ...fit, status: "stale" as const } : fit);
    snapshotId = await publishEvidenceSnapshot({ ...current, publishedAt: now.toISOString(), sources, rules, fits }, input.runId, input.actor, now);
  }
  await db.batch([
    db.insert(evidenceDecisions).values({ id: safeId("evd"), runId: input.runId, sourceId: input.sourceId, decision: input.decision, actorRef: input.actor, rationale: input.rationale?.slice(0, 500) ?? null, createdAt: now.toISOString() }),
    db.insert(auditEvents).values({ id: safeId("aud"), actorType: "agent", actorRef: input.actor, action: `evidence.${input.decision}`, objectType: "evidence-source", objectId: input.sourceId, metadataJson: JSON.stringify({ runId: input.runId, snapshotId }), occurredAt: now.toISOString() }),
  ]);
  return { decision: input.decision, sourceId: input.sourceId, snapshotId };
}

export async function rollbackEvidenceSnapshot(snapshotId: string, actor: string, now = new Date()) {
  const db = await getDb();
  const [target] = await db.select().from(evidencePublicationSnapshots).where(eq(evidencePublicationSnapshots.id, snapshotId)).limit(1);
  if (!target) throw new Error("EVIDENCE_SNAPSHOT_NOT_FOUND");
  const payload = JSON.parse(target.payloadJson) as PublishedEvidenceBundle;
  if (validatePublishedEvidenceBundle(payload).length) throw new Error("EVIDENCE_SNAPSHOT_INVALID");
  const restoredId = await publishEvidenceSnapshot({ ...payload, publishedAt: now.toISOString() }, null, actor, now);
  await db.update(evidencePublicationSnapshots).set({ status: "rolled-back" }).where(eq(evidencePublicationSnapshots.id, snapshotId));
  await db.insert(auditEvents).values({ id: safeId("aud"), actorType: "agent", actorRef: actor, action: "evidence.snapshot.rolled-back", objectType: "evidence-snapshot", objectId: restoredId, metadataJson: JSON.stringify({ restoredFrom: snapshotId }), occurredAt: now.toISOString() });
  return { snapshotId: restoredId, restoredFrom: snapshotId };
}

async function publishEvidenceSnapshot(bundle: PublishedEvidenceBundle, runId: string | null, actor: string, now: Date): Promise<string> {
  const errors = validatePublishedEvidenceBundle(bundle);
  if (errors.length) throw new Error(`EVIDENCE_BUNDLE_INVALID:${errors.join(",")}`);
  const db = await getDb();
  const [latest] = await db.select({ sequence: evidencePublicationSnapshots.sequence }).from(evidencePublicationSnapshots).orderBy(desc(evidencePublicationSnapshots.sequence)).limit(1);
  const snapshotId = safeId("evs");
  const payloadJson = JSON.stringify(bundle);
  const contentHash = await hashEvidenceText(payloadJson);
  const statements = [
    db.update(evidencePublicationSnapshots).set({ status: "superseded" as const }).where(eq(evidencePublicationSnapshots.status, "active")),
    db.insert(evidencePublicationSnapshots).values({ id: snapshotId, sequence: (latest?.sequence ?? 0) + 1, status: "active", contentHash, payloadJson, sourceRunId: runId, publishedBy: actor, publishedAt: now.toISOString() }),
  ];
  await db.batch([statements[0], ...statements.slice(1)]);
  return snapshotId;
}

function rowToCheck(row: typeof evidenceSourceChecks.$inferSelect): EvidenceSourceCheck {
  return {
    sourceId: row.sourceId, sourceVersion: row.sourceVersion, sourceUrl: row.sourceUrl, previousHash: row.previousHash, observedHash: row.observedHash,
    httpStatus: row.httpStatus, outcome: row.outcome, changeClass: row.changeClass, errorCode: row.errorCode, checkedAt: row.checkedAt,
    nextAction: row.outcome === "confirmed" ? "renew" : row.outcome === "unavailable" ? "hold-and-expire" : row.outcome === "invalid" ? "reject" : "review",
  };
}

function parseSummary(value: string): ReturnType<typeof summarizeEvidenceChecks> | null {
  try { return JSON.parse(value) as ReturnType<typeof summarizeEvidenceChecks>; } catch { return null; }
}
