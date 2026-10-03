import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { builderProjects, builderRevisions } from "@/db/schema";
import type { DeviceProject } from "./builder-contract";
import { inferCapabilityRequirements } from "./device-capabilities";
import { safeId } from "./api";

export const MAX_BUILDER_PROJECT_BYTES = 256_000;

export function validateDeviceProject(value: unknown): DeviceProject {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("INVALID_PROJECT");
  const project = value as Partial<DeviceProject> & { schemaVersion?: number; requiredCapabilities?: unknown };
  if (![3, 4].includes(Number(project.schemaVersion)) || typeof project.id !== "string" || !/^sd-[a-z0-9-]{6,80}$/i.test(project.id)) throw new Error("INVALID_PROJECT_ID");
  if (typeof project.title !== "string" || project.title.length < 1 || project.title.length > 120) throw new Error("INVALID_PROJECT_TITLE");
  if (typeof project.idea !== "string" || project.idea.length < 8 || project.idea.length > 3000) throw new Error("INVALID_PROJECT_IDEA");
  if (!project.answers || typeof project.answers !== "object" || !project.intelligence || !project.orchestrator || !project.research || !project.execution) throw new Error("INVALID_PROJECT_SHAPE");
  const normalized = project.schemaVersion === 3 ? {
    ...project,
    schemaVersion: 4 as const,
    requiredCapabilities: inferCapabilityRequirements(project.idea!, project.capability!, project.answers as DeviceProject["answers"]),
  } : project;
  if (!Array.isArray(normalized.requiredCapabilities) || normalized.requiredCapabilities.length > 20 || normalized.requiredCapabilities.some((item) => !item || typeof item !== "object" || typeof item.id !== "string" || item.id.length > 96)) throw new Error("INVALID_PROJECT_CAPABILITIES");
  if (!Array.isArray(normalized.requirements) || normalized.requirements.length > 30 || normalized.requirements.some((x) => typeof x !== "string" || x.length > 700)) throw new Error("INVALID_PROJECT_REQUIREMENTS");
  if (!Array.isArray(normalized.bom) || normalized.bom.length > 40 || !Array.isArray(normalized.validations) || normalized.validations.length > 30) throw new Error("INVALID_PROJECT_ARTIFACTS");
  if (typeof normalized.revision !== "number" || !Number.isInteger(normalized.revision) || normalized.revision < 1 || normalized.revision > 10_000) throw new Error("INVALID_PROJECT_REVISION");
  const serialized = JSON.stringify(normalized);
  if (new TextEncoder().encode(serialized).length > MAX_BUILDER_PROJECT_BYTES) throw new Error("PROJECT_TOO_LARGE");
  return normalized as DeviceProject;
}

function revisionLevel(project: DeviceProject) {
  return project.architectures.find((item) => item.id === project.selectedArchitectureId)?.revisionLevel ?? "R1";
}

function projectStatus(project: DeviceProject): "draft" | "scoped" | "prototype" | "review-required" | "archived" {
  if (project.safetyClass !== "supported" || project.selectedArchitectureId === "production-minded") return "review-required";
  if (project.execution.firmware.status === "pass" || project.execution.cad.status === "pass") return "prototype";
  return project.research.status === "live" ? "scoped" : "draft";
}

export async function saveHostedProject(projectInput: DeviceProject, ownerSubject: string): Promise<DeviceProject> {
  const project = validateDeviceProject({ ...projectInput, hosted: true });
  const db = await getDb();
  const [existing] = await db.select({ id: builderProjects.id, ownerSubject: builderProjects.ownerSubject }).from(builderProjects).where(eq(builderProjects.id, project.id)).limit(1);
  if (existing && existing.ownerSubject !== ownerSubject) throw new Error("NOT_AUTHORIZED");
  const now = new Date().toISOString();
  if (!existing) {
    await db.insert(builderProjects).values({ id: project.id, ownerSubject, schemaVersion: 4, status: projectStatus(project), title: project.title, idea: project.idea, sourceContext: project.sourceContext, capability: project.capability, intelligenceMode: project.intelligence.mode, meshProfileJson: JSON.stringify(project.intelligence), safetyClass: project.safetyClass, requirementsJson: JSON.stringify(project.requirements), answersJson: JSON.stringify(project.answers), createdAt: project.createdAt || now, updatedAt: now });
  } else {
    await db.update(builderProjects).set({ schemaVersion: 4, status: projectStatus(project), title: project.title, idea: project.idea, sourceContext: project.sourceContext, capability: project.capability, intelligenceMode: project.intelligence.mode, meshProfileJson: JSON.stringify(project.intelligence), safetyClass: project.safetyClass, requirementsJson: JSON.stringify(project.requirements), answersJson: JSON.stringify(project.answers), updatedAt: now }).where(and(eq(builderProjects.id, project.id), eq(builderProjects.ownerSubject, ownerSubject)));
  }
  const [existingRevision] = await db.select({ id: builderRevisions.id }).from(builderRevisions).where(and(eq(builderRevisions.projectId, project.id), eq(builderRevisions.revisionNumber, project.revision))).limit(1);
  const manifest = JSON.stringify({ ...project, hosted: true, updatedAt: now });
  if (!existingRevision) {
    await db.insert(builderRevisions).values({ id: safeId("bldrev"), projectId: project.id, revisionNumber: project.revision, revisionLevel: revisionLevel(project), architectureJson: JSON.stringify({ selectedArchitectureId: project.selectedArchitectureId, architectures: project.architectures, intelligence: project.intelligence, orchestrator: project.orchestrator, research: project.research }), bomJson: JSON.stringify({ bom: project.bom, sourcing: project.sourcing }), firmwareJson: JSON.stringify({ source: project.firmware, execution: project.execution.firmware }), cadJson: JSON.stringify({ source: project.cadSource, execution: project.execution.cad }), validationJson: JSON.stringify(project.validations), manifestJson: manifest, createdAt: now });
  } else {
    // Revision rows are immutable evidence snapshots. A repeated save of the same revision is a no-op.
  }
  return { ...project, hosted: true, updatedAt: now };
}

export async function readHostedProject(id: string, ownerSubject: string): Promise<DeviceProject | null> {
  const db = await getDb();
  const [projectRow] = await db.select({ id: builderProjects.id }).from(builderProjects).where(and(eq(builderProjects.id, id), eq(builderProjects.ownerSubject, ownerSubject))).limit(1);
  if (!projectRow) return null;
  const [revision] = await db.select({ manifestJson: builderRevisions.manifestJson }).from(builderRevisions).where(eq(builderRevisions.projectId, id)).orderBy(desc(builderRevisions.revisionNumber)).limit(1);
  if (!revision) return null;
  try { return validateDeviceProject(JSON.parse(revision.manifestJson)); } catch { return null; }
}

export async function listHostedProjects(ownerSubject: string, limit = 20) {
  const db = await getDb();
  return db.select({ id: builderProjects.id, title: builderProjects.title, idea: builderProjects.idea, status: builderProjects.status, intelligenceMode: builderProjects.intelligenceMode, updatedAt: builderProjects.updatedAt }).from(builderProjects).where(eq(builderProjects.ownerSubject, ownerSubject)).orderBy(desc(builderProjects.updatedAt)).limit(Math.min(Math.max(limit, 1), 50));
}
