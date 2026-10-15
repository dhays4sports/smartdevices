import type { Device } from "./data";
import type { DeviceCapabilityRequirement } from "./device-capabilities";

export type BuilderSafetyClass = "supported" | "review-required" | "blocked-autonomous";
export type RevisionLevel = "R0" | "R1" | "R2" | "R3";
export type BuildCapability = "temperature" | "humidity" | "water-presence" | "open-close" | "motion" | "light" | "soil-moisture" | "general-sensing";
export type BuilderStage = "idea" | "requirements" | "workspace";
export type BuildEnvironment = "indoor" | "garage" | "outdoor-sheltered" | "outdoor-exposed";
export type BuildPower = "usb" | "replaceable-battery" | "either";
export type BuildConnectivity = "wifi" | "bluetooth" | "local-only" | "not-sure";
export type BuildGoal = "proof-of-concept" | "functional-prototype" | "small-batch" | "product";

export type DeviceIntelligenceMode = "standalone" | "connected" | "mesh-ready" | "mesh-native";
export type DeploymentIntent = "auto" | DeviceIntelligenceMode;
export type MeshCapability = "identity" | "discovery" | "telemetry" | "events" | "commands" | "fleet" | "agent-access";
export type MeshIntegrationStatus = "not-applicable" | "optional" | "design-ready" | "runtime-not-integrated";
export type DomainBinding = "not-needed" | "optional" | "recommended" | "required-at-deployment";

export type DeviceIntelligenceProfile = {
  mode: DeviceIntelligenceMode;
  requestedIntent: DeploymentIntent;
  rationale: string[];
  meshIntegrationStatus: MeshIntegrationStatus;
  domainBinding: DomainBinding;
  capabilities: MeshCapability[];
};

export type BuilderAnswers = {
  environment: BuildEnvironment;
  power: BuildPower;
  connectivity: BuildConnectivity;
  deploymentIntent: DeploymentIntent;
  quantity: 1 | 5 | 10 | 100;
  goal: BuildGoal;
  budget: "under-30" | "30-75" | "75-150" | "flexible";
};

export type BuilderClarifyingQuestion = {
  id: string;
  question: string;
  whyItMatters: string;
  suggestedAnswer?: string;
};

export type BuilderOrchestratorState = {
  status: "deterministic" | "model-assisted" | "model-unavailable";
  summary: string;
  inferredRequirements: string[];
  assumptions: string[];
  clarifyingQuestions: BuilderClarifyingQuestion[];
  model?: string;
  generatedAt: string;
};

export type ResearchDecision = "buy" | "adapt" | "build" | "research-more";
export type ResearchCandidate = {
  name: string;
  manufacturer?: string;
  url?: string;
  estimatedPrice?: string;
  fit: "strong" | "partial" | "weak";
  notes: string;
};
export type ResearchSource = { title: string; url: string; publisher?: string };
export type BuilderResearch = {
  status: "catalog-only" | "live" | "unavailable";
  decision: ResearchDecision;
  rationale: string[];
  candidates: ResearchCandidate[];
  sources: ResearchSource[];
  marketSummary: string;
  generatedAt: string;
  provider?: string;
};

export type SourcingLine = {
  bomId: string;
  manufacturerPartNumber?: string;
  supplier?: string;
  supplierSku?: string;
  unitPriceUsd?: number;
  stock?: number;
  lifecycle?: "active" | "nrnd" | "eol" | "unknown";
  sourceUrl?: string;
  checkedAt?: string;
  status: "planning" | "live" | "unavailable";
};

export type BuilderExecutionArtifact = {
  status: "not-run" | "queued" | "pass" | "fail" | "unavailable" | "review";
  detail: string;
  artifactNames: string[];
  artifactUrls?: Array<{ name: string; url: string; sha256?: string }>;
  logs?: string;
  checkedAt?: string;
  executor?: string;
};
export type BuilderExecution = {
  firmware: BuilderExecutionArtifact;
  cad: BuilderExecutionArtifact;
};

export type BuilderComponent = {
  id: string;
  category: "controller" | "sensor" | "indicator" | "power" | "prototype" | "mechanical";
  name: string;
  capabilities: string[];
  voltage: string;
  planningUnitCostUsd: number;
  v1Approved: boolean;
  notes: string;
};

export type BomLine = BuilderComponent & { quantity: number; extendedPlanningCostUsd: number; reason: string };

export type ExistingDeviceMatch = Pick<Device, "id" | "slug" | "manufacturer" | "model" | "summary" | "priceBand" | "installation" | "insuranceNote"> & {
  reason: string;
};

export type BuilderArchitecture = {
  id: "module-first" | "balanced" | "production-minded";
  name: string;
  revisionLevel: RevisionLevel;
  summary: string;
  tradeoffs: string[];
  engineeringReviewRequired: boolean;
};

export type BuilderValidation = {
  id: string;
  label: string;
  status: "pass" | "review" | "not-run" | "fail";
  detail: string;
};

export type DeviceProject = {
  schemaVersion: 4;
  id: string;
  title: string;
  idea: string;
  sourceContext: "direct" | "farmers" | "protection";
  capability: BuildCapability;
  requiredCapabilities: DeviceCapabilityRequirement[];
  intelligence: DeviceIntelligenceProfile;
  orchestrator: BuilderOrchestratorState;
  research: BuilderResearch;
  sourcing: SourcingLine[];
  execution: BuilderExecution;
  safetyClass: BuilderSafetyClass;
  safetyReasons: string[];
  answers: BuilderAnswers;
  requirements: string[];
  unknowns: string[];
  existingMatches: ExistingDeviceMatch[];
  architectures: BuilderArchitecture[];
  selectedArchitectureId: BuilderArchitecture["id"];
  bom: BomLine[];
  firmware: string;
  firmwareDependencies: string[];
  cadSource: string;
  assemblyGuide: string;
  testProcedure: string;
  validations: BuilderValidation[];
  planningCostUsd: number;
  revision: number;
  hosted: boolean;
  createdAt: string;
  updatedAt: string;
};
