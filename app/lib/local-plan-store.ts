import type { SafetyPlan } from "./plan";

export type LocalPlanStorageMode = "local-storage" | "memory";

const memoryPlans = new Map<string, string>();
const storageModes = new Map<string, LocalPlanStorageMode>();

function keyFor(planId: string, schemaVersion: number) {
  return `smartdevices-safety-plan-v${schemaVersion}-${planId}`;
}

export function persistLocalPlan(plan: SafetyPlan): LocalPlanStorageMode {
  const serialized = JSON.stringify(plan);
  try {
    localStorage.setItem(keyFor(plan.id, plan.schemaVersion), serialized);
    if (localStorage.getItem(keyFor(plan.id, plan.schemaVersion)) !== serialized) throw new Error("Local plan storage verification failed");
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
    const stored = localStorage.getItem(`smartdevices-safety-plan-v3-${planId}`) ?? localStorage.getItem(`smartdevices-safety-plan-v2-${planId}`);
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
