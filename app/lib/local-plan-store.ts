import type { SafetyPlan } from "./plan";

export type LocalPlanStorageMode = "local-storage" | "memory";

const memoryPlans = new Map<string, string>();
const storageModes = new Map<string, LocalPlanStorageMode>();
const PLAN_INDEX_KEY = "smartdevices-local-plan-index-v1";

export type LocalPlanIndexEntry = {
  planId: string;
  schemaVersion: 1 | 2 | 3;
  domain: SafetyPlan["domain"];
  concernId: string;
  createdAt: string;
  recommendationCount: number;
};

function keyFor(planId: string, schemaVersion: number) {
  return `smartdevices-safety-plan-v${schemaVersion}-${planId}`;
}

export function persistLocalPlan(plan: SafetyPlan): LocalPlanStorageMode {
  const serialized = JSON.stringify(plan);
  try {
    localStorage.setItem(keyFor(plan.id, plan.schemaVersion), serialized);
    if (localStorage.getItem(keyFor(plan.id, plan.schemaVersion)) !== serialized) throw new Error("Local plan storage verification failed");
    const current = readPlanIndex();
    const entry: LocalPlanIndexEntry = { planId: plan.id, schemaVersion: plan.schemaVersion, domain: plan.domain, concernId: plan.concernId, createdAt: plan.createdAt, recommendationCount: plan.recommendations.length };
    localStorage.setItem(PLAN_INDEX_KEY, JSON.stringify([entry, ...current.filter((item) => item.planId !== plan.id)].slice(0, 20)));
    storageModes.set(plan.id, "local-storage");
    return "local-storage";
  } catch {
    memoryPlans.set(plan.id, serialized);
    storageModes.set(plan.id, "memory");
    return "memory";
  }
}

export function readLocalPlan(planId: string): string | null {
  try {
    const stored = localStorage.getItem(`smartdevices-safety-plan-v3-${planId}`) ?? localStorage.getItem(`smartdevices-safety-plan-v2-${planId}`) ?? localStorage.getItem(`smartdevices-safety-plan-v1-${planId}`);
    if (stored) {
      storageModes.set(planId, "local-storage");
      return stored;
    }
  } catch {}
  return memoryPlans.get(planId) ?? null;
}

export function localPlanStorageMode(planId: string): LocalPlanStorageMode | null {
  return storageModes.get(planId) ?? null;
}

export function readPlanIndex(): LocalPlanIndexEntry[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(PLAN_INDEX_KEY) ?? "[]") as unknown;
    const indexed = Array.isArray(parsed) ? parsed.filter((item): item is LocalPlanIndexEntry => Boolean(item && typeof item === "object" && "planId" in item && typeof item.planId === "string" && "schemaVersion" in item && [1, 2, 3].includes(Number(item.schemaVersion)) && "domain" in item && ["home", "vehicle", "family", "business"].includes(String(item.domain)) && "concernId" in item && typeof item.concernId === "string" && "createdAt" in item && typeof item.createdAt === "string" && "recommendationCount" in item && Number.isInteger(item.recommendationCount))).slice(0, 20) : [];
    if (indexed.length) return indexed;

    const discovered: LocalPlanIndexEntry[] = [];
    for (let index = 0; index < Math.min(localStorage.length, 200); index += 1) {
      const key = localStorage.key(index);
      if (!key || !/^smartdevices-safety-plan-v[123]-/.test(key)) continue;
      const serialized = localStorage.getItem(key);
      if (!serialized) continue;
      try {
        const plan = JSON.parse(serialized) as SafetyPlan;
        if (!plan.id || ![1, 2, 3].includes(plan.schemaVersion) || !["home", "vehicle", "family", "business"].includes(plan.domain) || !Array.isArray(plan.recommendations)) continue;
        discovered.push({ planId: plan.id, schemaVersion: plan.schemaVersion, domain: plan.domain, concernId: plan.concernId, createdAt: plan.createdAt, recommendationCount: plan.recommendations.length });
      } catch {}
    }
    const migrated = discovered.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 20);
    if (migrated.length) localStorage.setItem(PLAN_INDEX_KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return [];
  }
}

export function listLocalPlans(): SafetyPlan[] {
  return readPlanIndex().flatMap((entry) => {
    const serialized = readLocalPlan(entry.planId);
    if (!serialized) return [];
    try {
      const plan = JSON.parse(serialized) as SafetyPlan;
      return plan.id === entry.planId && [1, 2, 3].includes(plan.schemaVersion) && Array.isArray(plan.recommendations) ? [plan] : [];
    } catch {
      return [];
    }
  });
}
