import { getProjectDatabase, type ProjectDatabase } from "@/db/project-database";
import type { DeviceProject } from "./builder-contract";
import { inferCapabilityRequirements } from "./device-capabilities";
import { safeId } from "./api";

export const MAX_BUILDER_PROJECT_BYTES = 256_000;

export function validateDeviceProject(value: unknown): DeviceProject {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("INVALID_PROJECT");
  const project = value as Omit<Partial<DeviceProject>, "schemaVersion" | "requiredCapabilities"> & { schemaVersion?: number; requiredCapabilities?: unknown };
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
  if (!Array.isArray(normalized.architectures) || !normalized.architectures.length || !Array.isArray(normalized.sourcing)) throw new Error("INVALID_PROJECT_ARTIFACTS");
  const serialized = JSON.stringify(normalized);
  if (new TextEncoder().encode(serialized).length > MAX_BUILDER_PROJECT_BYTES) throw new Error("PROJECT_TOO_LARGE");
  return normalized as DeviceProject;
}


// Existing builderProjects / builderRevisions tables; manifestJson is the portable document.
function ownerRequired(ownerSubject: string) {
  if (!ownerSubject || !ownerSubject.startsWith("sites:")) throw new Error("AUTHENTICATION_REQUIRED");
}
function content(project: DeviceProject) {
  // Server-owned timestamp and hosted marker do not change revision identity.
  return JSON.stringify({ ...project, hosted: true, updatedAt: "" });
}
export function projectStore(db: ProjectDatabase) {
  async function read(id: string, ownerSubject: string): Promise<DeviceProject | null> {
    ownerRequired(ownerSubject);
    const row = await db.prepare(`SELECT r.manifest_json AS manifestJson FROM builder_revisions r JOIN builder_projects p ON p.id=r.project_id WHERE p.id=? AND p.owner_subject=? ORDER BY r.revision_number DESC LIMIT 1`).bind(id, ownerSubject).first<{manifestJson: string}>();
    return row ? validateDeviceProject(JSON.parse(row.manifestJson)) : null;
  }
  async function list(ownerSubject: string, limit = 20) {
    ownerRequired(ownerSubject);
    const result = await db.prepare(`SELECT id,title,idea,status,intelligence_mode AS intelligenceMode,updated_at AS updatedAt FROM builder_projects WHERE owner_subject=? ORDER BY updated_at DESC LIMIT ?`).bind(ownerSubject, Math.min(Math.max(limit,1),50)).all<{id:string;title:string;idea:string;status:string;intelligenceMode:string;updatedAt:string}>();
    return result.results;
  }
  async function save(input: DeviceProject, ownerSubject: string, updateOnly = false): Promise<DeviceProject> {
    ownerRequired(ownerSubject);
    const project = validateDeviceProject({ ...input, hosted: true });
    const existing = await db.prepare("SELECT owner_subject FROM builder_projects WHERE id=?").bind(project.id).first<{owner_subject:string}>();
    if (existing && existing.owner_subject !== ownerSubject || updateOnly && !existing) throw new Error("NOT_FOUND");
    const current = existing ? await read(project.id, ownerSubject) : null;
    if (current && project.revision <= current.revision) {
      if (project.revision === current.revision && content(current) === content(project)) return current;
      throw new Error("REVISION_CONFLICT");
    }
    const now = new Date().toISOString();
    const saved = { ...project, hosted: true, updatedAt: now };
    const manifest = JSON.stringify(saved);
    const revisionId = safeId("bldrev");
    const status = project.safetyClass !== "supported" || project.selectedArchitectureId === "production-minded" ? "review-required" : project.execution.firmware.status === "pass" || project.execution.cad.status === "pass" ? "prototype" : project.research.status === "live" ? "scoped" : "draft";
    // D1 batch is a transaction. Uniqueness failure rolls back the metadata too.
    // INSERT SELECT independently checks ownership and latest revision, including races.
    const result = await db.batch([
      db.prepare(`INSERT INTO builder_projects (id,owner_subject,schema_version,status,title,idea,source_context,capability,intelligence_mode,mesh_profile_json,safety_class,requirements_json,answers_json,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING`).bind(project.id,ownerSubject,4,status,project.title,project.idea,project.sourceContext,project.capability,project.intelligence.mode,JSON.stringify(project.intelligence),project.safetyClass,JSON.stringify(project.requirements),JSON.stringify(project.answers),project.createdAt || now,now),
      db.prepare(`INSERT INTO builder_revisions (id,project_id,revision_number,revision_level,architecture_json,bom_json,firmware_json,cad_json,validation_json,manifest_json,created_at) SELECT ?,?,?,?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM builder_projects WHERE id=? AND owner_subject=?) AND COALESCE((SELECT MAX(revision_number) FROM builder_revisions WHERE project_id=?),0)=?`).bind(revisionId,project.id,project.revision,project.architectures.find(x=>x.id===project.selectedArchitectureId)?.revisionLevel ?? "R1",JSON.stringify({selectedArchitectureId:project.selectedArchitectureId,architectures:project.architectures,intelligence:project.intelligence,orchestrator:project.orchestrator,research:project.research}),JSON.stringify({bom:project.bom,sourcing:project.sourcing}),JSON.stringify({source:project.firmware,execution:project.execution.firmware}),JSON.stringify({source:project.cadSource,execution:project.execution.cad}),JSON.stringify(project.validations),manifest,now,project.id,ownerSubject,project.id,current?.revision ?? 0),
      db.prepare(`UPDATE builder_projects SET schema_version=4,status=?,title=?,idea=?,intelligence_mode=?,mesh_profile_json=?,requirements_json=?,answers_json=?,updated_at=? WHERE id=? AND owner_subject=? AND EXISTS (SELECT 1 FROM builder_revisions WHERE id=?)`).bind(status,project.title,project.idea,project.intelligence.mode,JSON.stringify(project.intelligence),JSON.stringify(project.requirements),JSON.stringify(project.answers),now,project.id,ownerSubject,revisionId),
    ]);
    if (result[1].meta.changes !== 1) throw new Error("REVISION_CONFLICT");
    return saved;
  }
  async function exportProject(id: string, ownerSubject: string) {
    ownerRequired(ownerSubject);
    if (!await read(id,ownerSubject)) throw new Error("NOT_FOUND");
    const rows = await db.prepare(`SELECT r.manifest_json FROM builder_revisions r JOIN builder_projects p ON p.id=r.project_id WHERE p.id=? AND p.owner_subject=? ORDER BY r.revision_number`).bind(id,ownerSubject).all<{manifest_json:string}>();
    return { format: "smartdevices-project-backup-v1", exportedAt: new Date().toISOString(), revisions: rows.results.map(row=>validateDeviceProject(JSON.parse(row.manifest_json))) };
  }
  async function restoreProject(value: unknown, ownerSubject: string) {
    ownerRequired(ownerSubject);
    if (!value || typeof value!=="object" || !("format" in value) || value.format!=="smartdevices-project-backup-v1" || !("revisions" in value) || !Array.isArray(value.revisions) || value.revisions.length<1 || value.revisions.length>100) throw new Error("INVALID_BACKUP");
    const revisions = value.revisions.map(validateDeviceProject);
    if (revisions.some((p,i)=>p.id!==revisions[0].id || i>0 && p.revision<=revisions[i-1].revision)) throw new Error("INVALID_BACKUP_ORDER");
    // Import creates a fresh private project for the current principal; never restores authority.
    const id = `sd-${crypto.randomUUID()}`;
    let saved: DeviceProject | null = null;
    for (const revision of revisions) saved=await save({...revision,id,hosted:false},ownerSubject);
    return saved!;
  }
  return {read,list,save,exportProject,restoreProject};
}
export async function saveHostedProject(project: DeviceProject, ownerSubject: string, updateOnly=false) { return projectStore(await getProjectDatabase()).save(project,ownerSubject,updateOnly); }
export async function readHostedProject(id:string,ownerSubject:string) { return projectStore(await getProjectDatabase()).read(id,ownerSubject); }
export async function listHostedProjects(ownerSubject:string,limit=20) { return projectStore(await getProjectDatabase()).list(ownerSubject,limit); }
