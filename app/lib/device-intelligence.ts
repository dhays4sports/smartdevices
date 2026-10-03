import type { BuilderAnswers, DeviceIntelligenceMode, DeviceIntelligenceProfile, MeshCapability } from "./builder-contract";

function normalized(input: string) { return input.trim().toLowerCase(); }
function includesAny(value: string, terms: string[]) { return terms.some((term) => value.includes(term)); }

const MESH_TERMS = ["mesh", "domain-bound", "domain bound", "domain identity", "agent-to-device", "agent to device"];
const AGENT_TERMS = ["agent", "ai system", "autonomous system", "permissions", "discoverable", "discovery"];
const FLEET_TERMS = ["fleet", "multiple locations", "all locations", "across locations", "across buildings", "restaurants", "warehouses", "facilities", "hundreds of", "dozens of", "manage all"];
const REMOTE_TERMS = ["alert me", "notify me", "remote", "dashboard", "phone", "cloud", "from anywhere"];

function profileFor(mode: DeviceIntelligenceMode, requestedIntent: BuilderAnswers["deploymentIntent"], rationale: string[]): DeviceIntelligenceProfile {
  const capabilities: Record<DeviceIntelligenceMode, MeshCapability[]> = {
    standalone: [],
    connected: ["telemetry", "events"],
    "mesh-ready": ["identity", "telemetry", "events", "commands"],
    "mesh-native": ["identity", "discovery", "telemetry", "events", "commands", "fleet", "agent-access"],
  };
  const meshIntegrationStatus = mode === "standalone" ? "not-applicable" : mode === "connected" ? "optional" : mode === "mesh-ready" ? "design-ready" : "runtime-not-integrated";
  const domainBinding = mode === "standalone" ? "not-needed" : mode === "connected" ? "optional" : mode === "mesh-ready" ? "recommended" : "required-at-deployment";
  return { mode, requestedIntent, rationale, meshIntegrationStatus, domainBinding, capabilities: capabilities[mode] };
}

export function inferDeviceIntelligence(idea: string, answers: BuilderAnswers): DeviceIntelligenceProfile {
  const value = normalized(idea);
  const requested = answers.deploymentIntent ?? "auto";

  if (requested !== "auto") {
    return profileFor(requested, requested, [
      `The user selected the ${requested.replaceAll("-", " ")} operating model.`,
      requested === "mesh-native" ? "The design must reserve Mesh identity, discovery, permission and agent-facing capability boundaries; runtime integration remains a separate activation step." : requested === "mesh-ready" ? "The design should preserve a clean upgrade path to domain-bound identity and Mesh capabilities without requiring Mesh at prototype time." : requested === "connected" ? "The device needs ordinary connectivity, but no Mesh identity or discovery layer is required for the current use case." : "The current use case can deliver value without network identity or remote coordination.",
    ]);
  }

  if (answers.connectivity === "local-only") {
    return profileFor("standalone", "auto", ["The selected local-only connectivity path does not require network identity or remote orchestration."]);
  }

  const explicitMesh = includesAny(value, MESH_TERMS);
  const agentInteraction = includesAny(value, AGENT_TERMS);
  const fleetSignal = includesAny(value, FLEET_TERMS) || answers.quantity >= 10;
  const remoteSignal = includesAny(value, REMOTE_TERMS) || answers.connectivity === "wifi" || answers.connectivity === "bluetooth";

  if (explicitMesh || (agentInteraction && fleetSignal)) {
    return profileFor("mesh-native", "auto", [
      explicitMesh ? "The idea explicitly calls for Mesh/domain-bound behavior." : "The project combines agent interaction with fleet-scale coordination.",
      "Persistent identity, capability discovery, permissions and agent access are architectural requirements rather than optional add-ons.",
    ]);
  }

  if (fleetSignal || agentInteraction || answers.goal === "product") {
    return profileFor("mesh-ready", "auto", [
      fleetSignal ? "The project is likely to become a fleet or multi-location deployment." : agentInteraction ? "The idea anticipates interaction with software/AI agents." : "Product intent makes future identity, lifecycle and fleet management worth preserving now.",
      "Mesh runtime is not required for the first prototype, but the device should reserve stable identity and capability boundaries so it can be upgraded cleanly.",
    ]);
  }

  if (remoteSignal) {
    return profileFor("connected", "auto", ["The device benefits from ordinary connectivity for alerts, telemetry or local wireless access, without needing Mesh-level identity/discovery yet."]);
  }

  return profileFor("standalone", "auto", ["No current requirement calls for remote connectivity, fleet coordination or agent discovery."]);
}
