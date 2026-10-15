import type { DeviceProject } from "./builder-contract";
import { customBuildBoundary } from "./solution-contract";

function csvCell(value: string | number) { const text = String(value); return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; }

export function buildPackFiles(project: DeviceProject): Record<string, string> {
  const architecture = project.architectures.find((item) => item.id === project.selectedArchitectureId)!;
  const brief = `# ${project.title}\n\nSmartDevices Builder project ${project.id} · Revision ${project.revision} · ${architecture.revisionLevel}\n\n## Idea\n${project.idea}\n\n## Requirements\n${project.requirements.map((item) => `- ${item}`).join("\n")}\n\n## Intelligence architecture\n**${project.intelligence.mode.replaceAll("-", " ")}**\n\n${project.intelligence.rationale.map((item) => `- ${item}`).join("\n")}\n\nMesh status: ${project.intelligence.meshIntegrationStatus}\nDomain binding: ${project.intelligence.domainBinding}\n\n## Safety boundary\n${project.safetyClass}\n\n${project.safetyReasons.map((item) => `- ${item}`).join("\n")}\n\n## Architecture\n**${architecture.name}** — ${architecture.summary}\n\n${architecture.tradeoffs.map((item) => `- ${item}`).join("\n")}\n\n## Research decision\n**${project.research.decision.toUpperCase()}** — ${project.research.marketSummary}\n\n${project.research.rationale.map((item) => `- ${item}`).join("\n")}\n\n## Insurance boundary\n${customBuildBoundary.note}\n`;
  const bom = ["Item,Category,Quantity,Planning unit cost,Planning extended cost,Voltage/constraint,Sourcing status,Supplier,Supplier SKU,Live unit price,Reason,Notes", ...project.bom.map((item) => { const source = project.sourcing.find((line) => line.bomId === item.id); return [item.name, item.category, item.quantity, item.planningUnitCostUsd.toFixed(2), item.extendedPlanningCostUsd.toFixed(2), item.voltage, source?.status ?? "planning", source?.supplier ?? "", source?.supplierSku ?? "", source?.unitPriceUsd?.toFixed(2) ?? "", item.reason, item.notes].map(csvCell).join(","); })].join("\n");
  const capabilityRequirements = `# Capability requirements\n\n${project.requiredCapabilities.length ? project.requiredCapabilities.map((item) => `- **${item.id}** — ${item.rationale}`).join("\n") : "- Capability requirements still need clarification."}\n`;
  const validation = `# Validation status\n\n${project.validations.map((item) => `- **${item.label}: ${item.status.toUpperCase()}** — ${item.detail}`).join("\n")}\n`;
  const intelligence = `# Intelligence architecture\n\nMode: **${project.intelligence.mode}**\n\n## Why\n${project.intelligence.rationale.map((item) => `- ${item}`).join("\n")}\n\n## Mesh posture\n- Integration status: ${project.intelligence.meshIntegrationStatus}\n- Domain binding: ${project.intelligence.domainBinding}\n- Capability surface: ${project.intelligence.capabilities.length ? project.intelligence.capabilities.join(", ") : "none required"}\n\n${project.intelligence.mode === "mesh-native" ? "This package reserves a Mesh-native architecture but does not claim that a Mesh runtime, domain binding, permissions service, or live agent connection has been activated." : "Mesh is not required for this revision unless the project is later promoted."}\n`;
  const research = `# Research and buy/adapt/build decision\n\nStatus: **${project.research.status}**\nDecision: **${project.research.decision}**\nProvider: ${project.research.provider ?? "not recorded"}\nGenerated: ${project.research.generatedAt}\n\n## Market summary\n${project.research.marketSummary}\n\n## Rationale\n${project.research.rationale.map((item) => `- ${item}`).join("\n") || "- No rationale recorded."}\n\n## Candidates\n${project.research.candidates.map((item) => `- ${item.name} (${item.fit}): ${item.notes}${item.url ? ` — ${item.url}` : ""}`).join("\n") || "- No candidate recorded."}\n\n## Sources\n${project.research.sources.map((item) => `- ${item.title}: ${item.url}`).join("\n") || "- No external sources recorded."}\n`;
  const execution = `# Build execution\n\n## Firmware\n- Status: ${project.execution.firmware.status}\n- Detail: ${project.execution.firmware.detail}\n- Executor: ${project.execution.firmware.executor ?? "not run"}\n- Artifacts: ${project.execution.firmware.artifactNames.join(", ") || "none"}\n${project.execution.firmware.artifactUrls?.map((item) => `- Download: ${item.name} — ${item.url}${item.sha256 ? ` — sha256 ${item.sha256}` : ""}`).join("\n") || ""}\n\n## CAD\n- Status: ${project.execution.cad.status}\n- Detail: ${project.execution.cad.detail}\n- Executor: ${project.execution.cad.executor ?? "not run"}\n- Artifacts: ${project.execution.cad.artifactNames.join(", ") || "none"}\n${project.execution.cad.artifactUrls?.map((item) => `- Download: ${item.name} — ${item.url}${item.sha256 ? ` — sha256 ${item.sha256}` : ""}`).join("\n") || ""}\n`;
  const orchestration = `# Requirements orchestration\n\nStatus: ${project.orchestrator.status}\nModel: ${project.orchestrator.model ?? "deterministic"}\n\n${project.orchestrator.summary}\n\n## Assumptions\n${project.orchestrator.assumptions.map((item) => `- ${item}`).join("\n")}\n\n## Remaining clarifying questions\n${project.orchestrator.clarifyingQuestions.map((item) => `- ${item.question} — ${item.whyItMatters}`).join("\n") || "- None recorded."}\n`;
  const manifest = JSON.stringify({ ...project, insuranceBoundary: customBuildBoundary }, null, 2);
  const readme = `# SmartDevices Build Pack\n\nThis pack is portable project documentation for ${project.title}.\n\nGenerated files do not claim physical verification, certification, carrier acceptance, manufacturing readiness, successful firmware compilation, successful CAD generation, or live supplier availability unless the corresponding execution/research/sourcing record explicitly says so.\n\nFiles:\n- Project_Brief.md\n- Requirements_Orchestration.md\n- Research_Decision.md\n- Intelligence_Architecture.md\n- Capability_Requirements.md\n- BOM.csv\n- Firmware/device.ino\n- Firmware/libraries.txt\n- CAD/enclosure.py\n- Build_Execution.md\n- Assembly_Guide.md\n- Test_Procedure.md\n- Validation.md\n- Project_Manifest.json\n`;
  return {
    "README.md": readme,
    "Device_Capabilities.json": JSON.stringify({ schemaVersion: 1, projectId: project.id, status: "design-only", capabilityIds: project.requiredCapabilities.map((item) => item.id), meshRequired: project.intelligence.mode === "mesh-native", authorization: "not-granted", execution: "disabled" }, null, 2),
    "Project_Brief.md": brief,
    "Requirements_Orchestration.md": orchestration,
    "Research_Decision.md": research,
    "Intelligence_Architecture.md": intelligence,
    "Capability_Requirements.md": capabilityRequirements,
    "BOM.csv": bom,
    "Firmware/device.ino": project.firmware || "// Detailed firmware withheld for this safety class.\n",
    "Firmware/libraries.txt": project.firmwareDependencies.join("\n") + (project.firmwareDependencies.length ? "\n" : ""),
    "CAD/enclosure.py": project.cadSource || "# Detailed CAD withheld for this safety class.\n",
    "Build_Execution.md": execution,
    "Assembly_Guide.md": `# Assembly guide\n\n${project.assemblyGuide}\n`,
    "Test_Procedure.md": `# Test procedure\n\n${project.testProcedure}\n`,
    "Validation.md": validation,
    "Project_Manifest.json": manifest,
  };
}

function crc32(data: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function u16(value: number) { return [value & 255, (value >>> 8) & 255]; }
function u32(value: number) { return [value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255]; }

export function createStoredZip(files: Record<string, string>): Blob {
  const encoder = new TextEncoder();
  const local: number[] = [];
  const central: number[] = [];
  let offset = 0;
  let count = 0;
  for (const [name, text] of Object.entries(files)) {
    const nameBytes = encoder.encode(name);
    const data = encoder.encode(text);
    const crc = crc32(data);
    const localHeader = [0x50,0x4b,0x03,0x04, ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(nameBytes.length), ...u16(0), ...nameBytes];
    local.push(...localHeader, ...data);
    const centralHeader = [0x50,0x4b,0x01,0x02, ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(nameBytes.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset), ...nameBytes];
    central.push(...centralHeader);
    offset += localHeader.length + data.length;
    count += 1;
  }
  const end = [0x50,0x4b,0x05,0x06, ...u16(0), ...u16(0), ...u16(count), ...u16(count), ...u32(central.length), ...u32(local.length), ...u16(0)];
  return new Blob([new Uint8Array([...local, ...central, ...end])], { type: "application/zip" });
}
