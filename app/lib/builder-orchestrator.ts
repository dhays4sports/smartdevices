import type { BuilderAnswers, BuilderOrchestratorState, BuildCapability } from "./builder-contract";

function includesAny(value: string, terms: string[]) { return terms.some((term) => value.includes(term)); }

export function deterministicOrchestrator(idea: string, capability: BuildCapability, answers?: Partial<BuilderAnswers>): BuilderOrchestratorState {
  const value = idea.trim().toLowerCase();
  const questions = [] as BuilderOrchestratorState["clarifyingQuestions"];
  if (!/minute|second|hour|threshold|above|below|greater|less|open for|dry|wet/.test(value)) questions.push({ id: "threshold", question: "What exact condition should count as an event?", whyItMatters: "Thresholds and timing determine sensor selection, firmware behavior and false-alarm handling." });
  if (!/battery|usb|plug|power/.test(value) && !answers?.power) questions.push({ id: "power", question: "Will power be available, or does this need to run on replaceable batteries?", whyItMatters: "Power availability changes the controller, sleep strategy, enclosure and maintenance interval." });
  if (!/wifi|wi-fi|bluetooth|ble|lora|local|offline|cloud|phone|alert|notify/.test(value) && !answers?.connectivity) questions.push({ id: "connectivity", question: "Does anything outside the device need to receive its state or control it?", whyItMatters: "Connectivity determines whether the device can remain standalone or needs a transport and identity layer." });
  if (!/indoor|outside|outdoor|garage|warehouse|freezer|greenhouse|restaurant/.test(value) && !answers?.environment) questions.push({ id: "environment", question: "Where will the device physically live?", whyItMatters: "Temperature, moisture, ingress and mounting conditions affect sensor placement and enclosure design." });
  if (includesAny(value, ["fleet", "locations", "restaurants", "warehouses", "facilities", "agent", "ai"] )) questions.push({ id: "fleet-identity", question: "Should each physical unit keep a persistent identity across replacement, maintenance and software changes?", whyItMatters: "Persistent identity is the key dividing line between ordinary connected devices and a Mesh-ready or Mesh-native fleet.", suggestedAnswer: "Yes, if this will be operated as a fleet." });
  return {
    status: "deterministic",
    summary: `Builder interprets this as a ${capability.replaceAll("-", " ")} device and will keep the first revision module-first unless the requirements justify a production path.`,
    inferredRequirements: [
      `The device must reliably provide ${capability.replaceAll("-", " ")} awareness.`,
      "The first revision should separate sensor logic from transport/identity logic so connectivity can evolve without rewriting the sensing core.",
      "Any remote alert path must define offline behavior rather than assuming connectivity is always available.",
    ],
    assumptions: ["V5.2 defaults to low-voltage prototype hardware unless the request explicitly requires specialist review.", "Exact thresholds, physical dimensions and installation constraints remain user/project facts rather than model guesses."],
    clarifyingQuestions: questions.slice(0, 5),
    generatedAt: new Date().toISOString(),
  };
}
