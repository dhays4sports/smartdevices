import catalogJson from "@/content/catalog.json";
import evidenceJson from "@/content/evidence-sources.json";
import rulesJson from "@/content/carrier-rules.json";
import fitsJson from "@/content/device-carrier-fit.json";
import type { Device } from "./data";
import type { CarrierRule, DeviceCarrierFit, EvidenceSource } from "./carrier";

export const evidenceRefreshOutcomes = ["confirmed", "baseline", "changed", "unavailable", "invalid"] as const;
export type EvidenceRefreshOutcome = (typeof evidenceRefreshOutcomes)[number];
export type EvidenceChangeClass = "none" | "product-fact" | "technical-capability" | "carrier-material" | "source-failure";

export type PublishedEvidenceBundle = {
  schemaVersion: 1;
  publishedAt: string;
  catalog: Device[];
  sources: EvidenceSource[];
  rules: CarrierRule[];
  fits: DeviceCarrierFit[];
};

export type EvidenceSourceCheck = {
  sourceId: string;
  sourceVersion: number;
  sourceUrl: string;
  previousHash: string | null;
  observedHash: string | null;
  httpStatus: number | null;
  outcome: EvidenceRefreshOutcome;
  changeClass: EvidenceChangeClass;
  errorCode: string | null;
  checkedAt: string;
  nextAction: "renew" | "review" | "hold-and-expire" | "reject";
};

export type EvidenceRefreshSummary = {
  total: number;
  confirmed: number;
  baseline: number;
  changed: number;
  unavailable: number;
  invalid: number;
  autoRenewable: number;
  needsReview: number;
};

export type EvidenceFetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

const MAX_SOURCE_BYTES = 1_000_000;
const ACCEPTED_TYPES = ["text/html", "text/plain", "application/json", "application/xhtml+xml"];

export function createSeedEvidenceBundle(now = new Date().toISOString()): PublishedEvidenceBundle {
  const catalog = (catalogJson as Array<Omit<Device, "editorialStatus" | "commercialStatus">>).map((device) => ({
    ...device,
    editorialStatus: device.status === "active" ? "verified" as const : device.status === "stale" ? "review-required" as const : "retired" as const,
    commercialStatus: "none" as const,
    availability: device.availability ?? "unknown",
  }));
  return {
    schemaVersion: 1,
    publishedAt: now,
    catalog,
    sources: structuredClone((evidenceJson as { sources: EvidenceSource[] }).sources),
    rules: structuredClone((rulesJson as { rules: CarrierRule[] }).rules),
    fits: structuredClone((fitsJson as { fits: DeviceCarrierFit[] }).fits),
  };
}

export function classifyEvidenceSource(source: EvidenceSource): EvidenceChangeClass {
  if (source.domain === "farmers.com") return "carrier-material";
  if (source.domain.endsWith(".gov") || /support|installation|certification/i.test(`${source.title} ${source.url}`)) return "technical-capability";
  return "product-fact";
}

export function isAllowedEvidenceUrl(source: Pick<EvidenceSource, "url" | "domain" | "visibility">, candidate = source.url): boolean {
  if (source.visibility !== "public" || !candidate) return false;
  try {
    const url = new URL(candidate);
    const host = url.hostname.toLowerCase();
    const domain = source.domain.toLowerCase();
    return url.protocol === "https:" && (host === domain || host.endsWith(`.${domain}`)) && !url.username && !url.password;
  } catch { return false; }
}

export function normalizeSourceText(value: string): string {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--([\s\S]*?)-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export async function hashEvidenceText(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function checkEvidenceSource(source: EvidenceSource, previousHash: string | null, fetcher: EvidenceFetcher = fetch, now = new Date()): Promise<EvidenceSourceCheck> {
  const checkedAt = now.toISOString();
  if (!isAllowedEvidenceUrl(source)) return invalidCheck(source, previousHash, checkedAt, "SOURCE_URL_NOT_ALLOWED");
  const sourceUrl = source.url as string;
  try {
    const response = await fetcher(sourceUrl, {
      method: "GET",
      redirect: "manual",
      headers: { Accept: "text/html,application/xhtml+xml,application/json,text/plain;q=0.8", "User-Agent": "SmartDevices-Evidence-Refresh/1.0" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!isAllowedEvidenceUrl(source, response.url || sourceUrl)) return invalidCheck(source, previousHash, checkedAt, "SOURCE_REDIRECT_NOT_ALLOWED", response.status);
    if (!response.ok) return unavailableCheck(source, previousHash, checkedAt, `SOURCE_HTTP_${response.status}`, response.status);
    const contentType = (response.headers.get("content-type") ?? "text/plain").split(";")[0].trim().toLowerCase();
    if (!ACCEPTED_TYPES.includes(contentType)) return invalidCheck(source, previousHash, checkedAt, "SOURCE_CONTENT_TYPE", response.status);
    const declaredLength = Number(response.headers.get("content-length") ?? "0");
    if (declaredLength > MAX_SOURCE_BYTES) return invalidCheck(source, previousHash, checkedAt, "SOURCE_TOO_LARGE", response.status);
    // Refuse redirects before contacting another host. Stream-bounded reads
    // prevent an untrusted source from exhausting memory despite its headers.
    const reader = response.body?.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    if (reader) {
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        size += part.value.byteLength;
        if (size > MAX_SOURCE_BYTES) {
          await reader.cancel();
          return invalidCheck(source, previousHash, checkedAt, "SOURCE_TOO_LARGE", response.status);
        }
        chunks.push(part.value);
      }
    }
    const combined = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { combined.set(chunk, offset); offset += chunk.byteLength; }
    const body = new TextDecoder().decode(combined);
    if (new TextEncoder().encode(body).byteLength > MAX_SOURCE_BYTES) return invalidCheck(source, previousHash, checkedAt, "SOURCE_TOO_LARGE", response.status);
    const normalized = normalizeSourceText(body);
    if (normalized.length < 80) return unavailableCheck(source, previousHash, checkedAt, "SOURCE_CONTENT_INSUFFICIENT", response.status);
    const observedHash = await hashEvidenceText(normalized);
    const outcome: EvidenceRefreshOutcome = previousHash === null ? "baseline" : previousHash === observedHash ? "confirmed" : "changed";
    return {
      sourceId: source.id, sourceVersion: source.version, sourceUrl, previousHash, observedHash, httpStatus: response.status,
      outcome, changeClass: outcome === "confirmed" ? "none" : classifyEvidenceSource(source), errorCode: null, checkedAt,
      nextAction: outcome === "confirmed" ? "renew" : "review",
    };
  } catch (error) {
    const code = error instanceof Error && error.name === "TimeoutError" ? "SOURCE_TIMEOUT" : "SOURCE_FETCH_FAILED";
    return unavailableCheck(source, previousHash, checkedAt, code);
  }
}

function invalidCheck(source: EvidenceSource, previousHash: string | null, checkedAt: string, errorCode: string, httpStatus: number | null = null): EvidenceSourceCheck {
  return { sourceId: source.id, sourceVersion: source.version, sourceUrl: source.url ?? "", previousHash, observedHash: null, httpStatus, outcome: "invalid", changeClass: "source-failure", errorCode, checkedAt, nextAction: "reject" };
}

function unavailableCheck(source: EvidenceSource, previousHash: string | null, checkedAt: string, errorCode: string, httpStatus: number | null = null): EvidenceSourceCheck {
  return { sourceId: source.id, sourceVersion: source.version, sourceUrl: source.url ?? "", previousHash, observedHash: null, httpStatus, outcome: "unavailable", changeClass: "source-failure", errorCode, checkedAt, nextAction: "hold-and-expire" };
}

export function summarizeEvidenceChecks(checks: EvidenceSourceCheck[]): EvidenceRefreshSummary {
  const count = (outcome: EvidenceRefreshOutcome) => checks.filter((item) => item.outcome === outcome).length;
  return {
    total: checks.length,
    confirmed: count("confirmed"), baseline: count("baseline"), changed: count("changed"), unavailable: count("unavailable"), invalid: count("invalid"),
    autoRenewable: checks.filter((item) => item.nextAction === "renew").length,
    needsReview: checks.filter((item) => item.nextAction === "review" || item.nextAction === "reject").length,
  };
}

function addDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function sourceReviewWindow(source: EvidenceSource): number {
  const checked = Date.parse(`${source.checkedDate}T00:00:00Z`);
  const due = Date.parse(`${source.reviewDueDate}T00:00:00Z`);
  const days = Math.round((due - checked) / 86_400_000);
  return Math.max(14, Math.min(120, Number.isFinite(days) ? days : 30));
}

export function applySafeRefresh(bundle: PublishedEvidenceBundle, checks: EvidenceSourceCheck[], reviewDate: string): PublishedEvidenceBundle {
  const bySource = new Map(checks.map((check) => [check.sourceId, check]));
  const sources = bundle.sources.map((source) => {
    const check = bySource.get(source.id);
    if (check?.outcome === "confirmed") return { ...source, checkedDate: reviewDate, reviewDueDate: addDays(reviewDate, sourceReviewWindow(source)), status: "active" as const };
    if (source.reviewDueDate < reviewDate && check) return { ...source, status: "stale" as const };
    return source;
  });
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const refreshDependent = <T extends CarrierRule | DeviceCarrierFit>(record: T): T => {
    const dependencies = record.sourceIds.map((id) => sourceById.get(id)).filter((item): item is EvidenceSource => Boolean(item));
    const allCurrent = dependencies.length === record.sourceIds.length && dependencies.every((source) => source.status === "active" && source.reviewDueDate >= reviewDate);
    if (!allCurrent) return { ...record, status: "stale" } as T;
    const allConfirmed = record.sourceIds.every((id) => bySource.get(id)?.outcome === "confirmed");
    if (!allConfirmed) return record;
    const nextDue = dependencies.map((source) => source.reviewDueDate).sort()[0] ?? record.reviewDueDate;
    return { ...record, checkedDate: reviewDate, reviewDueDate: nextDue, status: "active" } as T;
  };
  return { ...bundle, publishedAt: `${reviewDate}T00:00:00.000Z`, sources, rules: bundle.rules.map(refreshDependent), fits: bundle.fits.map(refreshDependent) };
}

export function validatePublishedEvidenceBundle(value: PublishedEvidenceBundle): string[] {
  const errors: string[] = [];
  if (value.schemaVersion !== 1) errors.push("BUNDLE_SCHEMA_UNSUPPORTED");
  if (!Array.isArray(value.catalog) || !Array.isArray(value.sources) || !Array.isArray(value.rules) || !Array.isArray(value.fits)) errors.push("BUNDLE_COLLECTION_REQUIRED");
  const sourceIds = new Set(value.sources.map((item) => item.id));
  if (value.rules.some((item) => item.sourceIds.some((id) => !sourceIds.has(id)))) errors.push("BUNDLE_ORPHAN_RULE");
  if (value.fits.some((item) => item.sourceIds.some((id) => !sourceIds.has(id)))) errors.push("BUNDLE_ORPHAN_FIT");
  if (value.sources.some((item) => item.visibility === "restricted")) errors.push("BUNDLE_RESTRICTED_SOURCE");
  if (value.rules.some((item) => item.visibility !== "public" || item.status === "draft")) errors.push("BUNDLE_NONPUBLIC_RULE");
  return errors;
}
