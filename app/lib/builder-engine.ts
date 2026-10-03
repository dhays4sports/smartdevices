import componentJson from "@/content/builder-components.json";
import type { Device } from "./data";
import type {
  BomLine,
  BuildCapability,
  BuilderAnswers,
  BuilderArchitecture,
  BuilderComponent,
  BuilderSafetyClass,
  BuilderValidation,
  DeviceIntelligenceProfile,
  DeviceProject,
  ExistingDeviceMatch,
} from "./builder-contract";
import { inferDeviceIntelligence } from "./device-intelligence";
import { canonicalCapabilitiesForDevice, inferCapabilityRequirements } from "./device-capabilities";
import { deterministicOrchestrator } from "./builder-orchestrator";
import { catalogResearch } from "./builder-research";

const components = componentJson as BuilderComponent[];

function normalized(input: string) { return input.trim().toLowerCase(); }
function includesAny(value: string, terms: string[]) { return terms.some((term) => value.includes(term)); }

export function inferCapability(idea: string): BuildCapability {
  const value = normalized(idea);
  if (includesAny(value, ["freezer", "fridge", "refrigerator", "temperature", "too warm", "too cold"])) return "temperature";
  if (includesAny(value, ["leak", "water", "flood", "wet"])) return "water-presence";
  if (includesAny(value, ["door", "window", "mailbox", "gate", "open", "closed"])) return "open-close";
  if (includesAny(value, ["soil", "plant", "moisture"])) return "soil-moisture";
  if (includesAny(value, ["motion", "occupancy", "movement", "presence"])) return "motion";
  if (includesAny(value, ["humidity", "humid"])) return "humidity";
  if (includesAny(value, ["light", "lux", "brightness"])) return "light";
  return "general-sensing";
}

export function classifyBuilderSafety(idea: string, answers?: Partial<BuilderAnswers>): { safetyClass: BuilderSafetyClass; reasons: string[] } {
  const value = normalized(idea);
  const blocked = [
    ["mains", "wall outlet", "120v", "240v", "high voltage"],
    ["gas valve", "gas shutoff", "natural gas control"],
    ["fire suppression", "sprinkler control"],
    ["pacemaker", "medical device", "dose medication"],
    ["brake control", "steering control", "airbag"],
    ["weapon", "detonator"],
  ];
  if (blocked.some((group) => includesAny(value, group))) return { safetyClass: "blocked-autonomous", reasons: ["The request touches a life-safety, regulated, high-voltage, medical, vehicle-control, weapon, or gas-control function. Builder can scope the problem, but it will not autonomously generate implementation instructions for that function."] };
  const reviewReasons: string[] = [];
  if (includesAny(value, ["lithium", "lipo", "rechargeable battery", "heater", "heating element", "motor", "pump", "actuator"])) reviewReasons.push("The requested hardware can introduce battery, thermal, current or mechanical hazards that require engineering review.");
  if (answers?.environment === "outdoor-exposed") reviewReasons.push("Exposed outdoor use requires enclosure, ingress, materials and installation review beyond the V1 indoor prototype assumptions.");
  if (answers?.goal === "product" || answers?.quantity === 100) reviewReasons.push("Production intent requires DFM, component lifecycle and compliance review before manufacturing.");
  return reviewReasons.length ? { safetyClass: "review-required", reasons: reviewReasons } : { safetyClass: "supported", reasons: ["The request fits the V1 low-voltage sensing/monitoring boundary based on the information provided."] };
}

function capabilitySensor(capability: BuildCapability) {
  const id: Record<BuildCapability, string> = {
    temperature: "temp-waterproof",
    humidity: "temp-humidity",
    "water-presence": "leak-probe",
    "open-close": "reed-contact",
    motion: "pir-motion",
    light: "ambient-light",
    "soil-moisture": "soil-capacitive",
    "general-sensing": "temp-humidity",
  };
  return id[capability];
}

function component(id: string) {
  const found = components.find((item) => item.id === id && item.v1Approved);
  if (!found) throw new Error(`Unknown V1 Builder component: ${id}`);
  return found;
}

function inferExistingMatches(requiredCapabilityIds: string[], devices: Device[]): ExistingDeviceMatch[] {
  if (!requiredCapabilityIds.length) return [];
  return devices
    .filter((device) => {
      if (device.status !== "active") return false;
      const supported = new Set(canonicalCapabilitiesForDevice(device).map((item) => item.id));
      return requiredCapabilityIds.some((id) => supported.has(id));
    })
    .map((device) => {
      const supported = new Set(canonicalCapabilitiesForDevice(device).map((item) => item.id));
      const matched = requiredCapabilityIds.filter((id) => supported.has(id));
      return {
        id: device.id, slug: device.slug, manufacturer: device.manufacturer, model: device.model, summary: device.summary, priceBand: device.priceBand, installation: device.installation, insuranceNote: device.insuranceNote,
        reason: `Matches ${matched.length}/${requiredCapabilityIds.length} normalized capability requirement${requiredCapabilityIds.length === 1 ? "" : "s"}: ${matched.join(", ")}. Compare existing options before creating custom hardware.`,
      };
    })
    .sort((a, b) => b.reason.localeCompare(a.reason))
    .slice(0, 3);
}

export const builderArchitectures: BuilderArchitecture[] = [
  { id: "module-first", name: "Fast proof of concept", revisionLevel: "R0", summary: "Development board + sensor module + breadboard. Optimize for learning whether the idea works.", tradeoffs: ["Fastest to assemble", "Largest/least polished", "No custom PCB"], engineeringReviewRequired: false },
  { id: "balanced", name: "Functional prototype", revisionLevel: "R1", summary: "Development board + sensor + solderable assembly + generated enclosure. Optimize for something a person can actually use.", tradeoffs: ["Better mechanical finish", "Still module-based", "Good default before PCB work"], engineeringReviewRequired: false },
  { id: "production-minded", name: "Production-minded concept", revisionLevel: "R2", summary: "Define the custom-PCB and manufacturing direction while keeping the first build module-based until specialist review.", tradeoffs: ["Best path toward volume", "Custom PCB is not generated autonomously in V1", "Requires engineering/compliance review"], engineeringReviewRequired: true },
];

function chooseArchitecture(answers: BuilderAnswers) {
  if (answers.goal === "proof-of-concept") return "module-first" as const;
  if (answers.goal === "product" || answers.goal === "small-batch" || answers.quantity >= 10) return "production-minded" as const;
  return "balanced" as const;
}

function makeBom(capability: BuildCapability, answers: BuilderAnswers, architectureId: BuilderArchitecture["id"]): BomLine[] {
  const ids = ["esp32-c3-dev", capabilitySensor(capability), answers.power === "replaceable-battery" ? "aa3-holder" : "usb-certified", "status-led", architectureId === "module-first" ? "breadboard-kit" : "perfboard", "printed-enclosure", "hardware-kit"];
  return ids.map((id) => {
    const item = component(id);
    const reason = item.category === "controller" ? "Runs sensing, device logic and the selected connectivity path." : item.category === "sensor" ? `Measures the primary ${capability.replaceAll("-", " ")} capability.` : item.category === "power" ? "Matches the selected prototype power preference." : item.category === "prototype" ? "Provides the assembly method for this revision level." : item.category === "mechanical" ? "Supports the physical prototype and enclosure." : "Provides local device status.";
    return { ...item, quantity: 1, extendedPlanningCostUsd: item.planningUnitCostUsd, reason };
  });
}

function firmwareDependenciesFor(capability: BuildCapability) {
  const values: Record<BuildCapability, string[]> = {
    temperature: ["OneWire", "DallasTemperature"],
    humidity: ["Adafruit SHT31 Library", "Adafruit BusIO"],
    "water-presence": [],
    "open-close": [],
    motion: [],
    light: ["BH1750"],
    "soil-moisture": [],
    "general-sensing": [],
  };
  return values[capability];
}

function firmwareFor(capability: BuildCapability, answers: BuilderAnswers, intelligence: DeviceIntelligenceProfile) {
  const dependencyIncludes: Record<BuildCapability, string> = {
    temperature: "#include <OneWire.h>\n#include <DallasTemperature.h>",
    humidity: "#include <Wire.h>\n#include <Adafruit_SHT31.h>",
    "water-presence": "",
    "open-close": "",
    motion: "",
    light: "#include <Wire.h>\n#include <BH1750.h>",
    "soil-moisture": "",
    "general-sensing": "",
  };
  const declarations: Record<BuildCapability, string> = {
    temperature: "constexpr int SENSOR_PIN = 4;\nOneWire oneWire(SENSOR_PIN);\nDallasTemperature sensor(&oneWire);",
    humidity: "Adafruit_SHT31 sensor = Adafruit_SHT31();",
    "water-presence": "constexpr int SENSOR_PIN = 4;",
    "open-close": "constexpr int SENSOR_PIN = 4;",
    motion: "constexpr int SENSOR_PIN = 4;",
    light: "BH1750 sensor;",
    "soil-moisture": "constexpr int SENSOR_PIN = 0;",
    "general-sensing": "constexpr int SENSOR_PIN = 4;",
  };
  const setupSensor: Record<BuildCapability, string> = {
    temperature: "sensor.begin();",
    humidity: "Wire.begin(5, 6);\n  if (!sensor.begin(0x44)) Serial.println(\"SENSOR_INIT_FAILED\");",
    "water-presence": "pinMode(SENSOR_PIN, INPUT_PULLUP);",
    "open-close": "pinMode(SENSOR_PIN, INPUT_PULLUP);",
    motion: "pinMode(SENSOR_PIN, INPUT);",
    light: "Wire.begin(5, 6);\n  if (!sensor.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) Serial.println(\"SENSOR_INIT_FAILED\");",
    "soil-moisture": "pinMode(SENSOR_PIN, INPUT);",
    "general-sensing": "pinMode(SENSOR_PIN, INPUT);",
  };
  const readSensor: Record<BuildCapability, string> = {
    temperature: "sensor.requestTemperatures();\n  float value = sensor.getTempCByIndex(0);\n  if (value == DEVICE_DISCONNECTED_C) { emitState(\"temperature.error\", NAN); return; }\n  emitState(\"temperature.c\", value);",
    humidity: "float value = sensor.readHumidity();\n  if (isnan(value)) { emitState(\"humidity.error\", NAN); return; }\n  emitState(\"humidity.percent\", value);",
    "water-presence": "float value = digitalRead(SENSOR_PIN) == LOW ? 1.0f : 0.0f;\n  emitState(\"water.detected\", value);",
    "open-close": "float value = digitalRead(SENSOR_PIN) == HIGH ? 1.0f : 0.0f;\n  emitState(\"contact.open\", value);",
    motion: "float value = digitalRead(SENSOR_PIN) == HIGH ? 1.0f : 0.0f;\n  emitState(\"motion.detected\", value);",
    light: "float value = sensor.readLightLevel();\n  emitState(\"light.lux\", value);",
    "soil-moisture": "float value = analogRead(SENSOR_PIN);\n  emitState(\"soil.raw\", value); // Calibrate dry/wet endpoints before deriving a percentage.",
    "general-sensing": "float value = digitalRead(SENSOR_PIN);\n  emitState(\"sensor.raw\", value); // Replace with the selected sensor adapter before relying on this project.",
  };
  const wifiInclude = answers.connectivity === "wifi" ? "#include <WiFi.h>\n" : "";
  const networkSetup = answers.connectivity === "wifi" ? `const char* WIFI_SSID = \"\";\nconst char* WIFI_PASSWORD = \"\";\n\nvoid configureTransport() {\n  if (strlen(WIFI_SSID) == 0) { Serial.println(\"WIFI_NOT_PROVISIONED\"); return; }\n  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);\n}` : `void configureTransport() {\n  // No remote transport is configured for this prototype revision.\n}`;
  const intelligenceNotes = intelligence.mode === "mesh-native"
    ? "// Mesh-native: event names below are the device capability/event boundary. Bind them to the approved Mesh runtime during deployment."
    : intelligence.mode === "mesh-ready"
      ? "// Mesh-ready: keep emitState() as the adapter boundary so a future Mesh runtime does not rewrite sensing logic."
      : "// Transport is intentionally separated from sensing logic.";
  return `// SmartDevices Builder v5.2 firmware\n// Target: ESP32-C3 / Arduino\n// Intelligence mode: ${intelligence.mode}\n${wifiInclude}${dependencyIncludes[capability]}\n#include <Arduino.h>\n\nconstexpr int STATUS_LED_PIN = 8;\nconstexpr unsigned long SAMPLE_INTERVAL_MS = 5000;\nunsigned long lastSample = 0;\n${declarations[capability]}\n\n${networkSetup}\n\nvoid emitState(const char* eventName, float value) {\n  // Functional local event output. A remote/cloud/Mesh transport must forward this boundary explicitly.\n  Serial.print(\"{\\\"event\\\":\\\"\"); Serial.print(eventName); Serial.print(\"\\\",\\\"value\\\":\");\n  if (isnan(value)) Serial.print(\"null\"); else Serial.print(value, 3);\n  Serial.println(\"}\");\n}\n\nvoid setup() {\n  pinMode(STATUS_LED_PIN, OUTPUT);\n  digitalWrite(STATUS_LED_PIN, LOW);\n  Serial.begin(115200);\n  ${setupSensor[capability]}\n  configureTransport();\n  ${intelligenceNotes}\n}\n\nvoid loop() {\n  if (millis() - lastSample < SAMPLE_INTERVAL_MS) return;\n  lastSample = millis();\n  ${readSensor[capability]}\n  digitalWrite(STATUS_LED_PIN, !digitalRead(STATUS_LED_PIN));\n}\n`;
}

function cadFor(idea: string, answers: BuilderAnswers) {
  const vent = /temperature|humidity|motion|light/i.test(idea);
  return `# SmartDevices Builder parametric enclosure scaffold\n# Requires CadQuery 2.x. This file generates STEP and STL outputs when run in a CadQuery environment.\nimport cadquery as cq\n\nINNER_X = 72.0\nINNER_Y = 44.0\nINNER_Z = 24.0\nWALL = 2.2\nCLEARANCE = 0.6\n\nouter_x = INNER_X + 2 * WALL\nouter_y = INNER_Y + 2 * WALL\nouter_z = INNER_Z + WALL\n\nbody = cq.Workplane(\"XY\").box(outer_x, outer_y, outer_z).faces(\">Z\").shell(-WALL)\n# Low-voltage USB cable opening; move/resize after measuring the actual selected board.\nbody = body.faces(\"<X\").workplane(centerOption=\"CenterOfMass\").rect(10, 6).cutThruAll()\n${vent ? '# Environmental sensing path: add conservative vent slots after verifying sensor placement and ingress needs.\nbody = body.faces(\">Y\").workplane(centerOption="CenterOfMass").rarray(7, 1, 5, 1).circle(1.1).cutThruAll()' : '# Sealed-ish prototype path: no automatic vent pattern added.'}\n\nlid = cq.Workplane(\"XY\").box(outer_x, outer_y, WALL).edges(\"|Z\").fillet(1.0)\n\ncq.exporters.export(body, \"enclosure_body.step\")\ncq.exporters.export(body, \"enclosure_body.stl\")\ncq.exporters.export(lid, \"enclosure_lid.step\")\ncq.exporters.export(lid, \"enclosure_lid.stl\")\n\n# Environment selected: ${answers.environment}\n# Measure actual modules before printing. Dimensions above are planning defaults, not a verified fit.\n`;
}

function titleFor(idea: string, capability: BuildCapability) {
  const concise = idea.replace(/[.!?]+$/g, "").trim();
  if (concise.length <= 42) return concise;
  const names: Record<BuildCapability, string> = { temperature: "Temperature Monitor", humidity: "Humidity Monitor", "water-presence": "Leak Monitor", "open-close": "Open/Close Monitor", motion: "Motion Monitor", light: "Light Monitor", "soil-moisture": "Plant Moisture Monitor", "general-sensing": "Smart Sensor Prototype" };
  return names[capability];
}


function projectCapabilityComplete(bom: BomLine[]) {
  const sensor = bom.find((item) => item.category === "sensor");
  return Boolean(sensor && ["temp-waterproof", "temp-humidity", "leak-probe", "reed-contact", "pir-motion", "ambient-light", "soil-capacitive"].includes(sensor.id));
}

function validations(safety: BuilderSafetyClass, answers: BuilderAnswers, bom: BomLine[], architectureId: BuilderArchitecture["id"], execution?: DeviceProject["execution"]): BuilderValidation[] {
  const firmware = execution?.firmware;
  const cad = execution?.cad;
  return [
    { id: "safety", label: "Builder safety boundary", status: safety === "supported" ? "pass" : "review", detail: safety === "supported" ? "Fits the current low-voltage monitoring boundary." : "Engineering review is required before implementation." },
    { id: "voltage", label: "Voltage-class sanity", status: "pass", detail: "The V1 BOM is limited to low-voltage modules and external listed/certified USB power or replaceable cells." },
    { id: "bom", label: "V1 component allowlist", status: bom.every((item) => item.v1Approved) ? "pass" : "review", detail: "Every generated BOM line is drawn from the V1 curated component library." },
    { id: "firmware", label: "Firmware compile", status: firmware?.status === "pass" ? "pass" : firmware?.status === "fail" ? "fail" : firmware?.status === "review" ? "review" : "not-run", detail: firmware?.detail ?? "Firmware source exists, but no compiler result has been recorded." },
    { id: "sensor-adapter", label: "Sensor adapter completeness", status: projectCapabilityComplete(bom) ? "pass" : "review", detail: projectCapabilityComplete(bom) ? "The selected V1 sensor has a concrete firmware adapter path." : "The project still uses a generic sensing adapter and needs a specific sensor selection before functional reliance." },
    { id: "transport", label: "Remote transport", status: answers.connectivity === "local-only" ? "pass" : "review", detail: answers.connectivity === "local-only" ? "No remote transport is required." : "Sensing/event generation is implemented, but remote alert/cloud/Mesh forwarding still requires an explicit deployment transport." },
    { id: "fit", label: "CAD generation / fit", status: cad?.status === "pass" ? "pass" : cad?.status === "fail" ? "fail" : cad?.status === "review" ? "review" : "not-run", detail: cad?.detail ?? "CadQuery source exists, but geometry execution and physical fit have not been verified." },
    { id: "environment", label: "Environment", status: answers.environment === "outdoor-exposed" ? "review" : "pass", detail: answers.environment === "outdoor-exposed" ? "Ingress/material/weather exposure needs specialist review." : "No exposed-outdoor enclosure claim is being made." },
    { id: "production", label: "Manufacturing readiness", status: architectureId === "production-minded" ? "review" : "not-run", detail: architectureId === "production-minded" ? "R2 direction needs custom PCB, DFM, sourcing and compliance review." : "Not required for this prototype revision." },
  ];
}

export function createDeviceProject(idea: string, answers: BuilderAnswers, devices: Device[], sourceContext: DeviceProject["sourceContext"] = "direct"): DeviceProject {
  const now = new Date().toISOString();
  const capability = inferCapability(idea);
  const safety = classifyBuilderSafety(idea, answers);
  const intelligence = inferDeviceIntelligence(idea, answers);
  const requiredCapabilities = inferCapabilityRequirements(idea, capability, answers);
  const selectedArchitectureId = chooseArchitecture(answers);
  const bom = safety.safetyClass === "blocked-autonomous" ? [] : makeBom(capability, answers, selectedArchitectureId);
  const planningCostUsd = bom.reduce((sum, item) => sum + item.extendedPlanningCostUsd, 0);
  const requirements = [
    `Primary capability family: ${capability.replaceAll("-", " ")}.`,
    ...requiredCapabilities.map((item) => `Required device capability: ${item.id}.`),
    `Environment: ${answers.environment.replaceAll("-", " ")}.`,
    `Power preference: ${answers.power.replaceAll("-", " ")}.`,
    `Connectivity preference: ${answers.connectivity.replaceAll("-", " ")}.`,
    `Intelligence mode: ${intelligence.mode.replaceAll("-", " ")}.`,
    `Target quantity: ${answers.quantity}.`,
    `Build goal: ${answers.goal.replaceAll("-", " ")}.`,
  ];
  const unknowns = ["Exact sensor thresholds/timing still need user confirmation.", "Physical module dimensions have not been measured by the hosted Builder.", "Supplier pricing/availability remains planning data until a live sourcing adapter returns a checked result."];
  const existingMatches = inferExistingMatches(requiredCapabilities.map((item) => item.id), devices);
  const orchestrator = deterministicOrchestrator(idea, capability, answers);
  for (const item of orchestrator.inferredRequirements) if (!requirements.includes(item)) requirements.push(item);
  const research = catalogResearch(existingMatches);
  const execution: DeviceProject["execution"] = {
    firmware: { status: "not-run", detail: "Firmware source has not yet been compiled by a configured Build Executor.", artifactNames: [] },
    cad: { status: "not-run", detail: "CadQuery source has not yet been executed by a configured Build Executor.", artifactNames: [] },
  };
  return {
    schemaVersion: 4,
    id: `sd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    title: titleFor(idea, capability), idea: idea.trim(), sourceContext, capability, requiredCapabilities, intelligence, orchestrator, research,
    sourcing: bom.map((item) => ({ bomId: item.id, status: "planning" as const })), execution,
    safetyClass: safety.safetyClass, safetyReasons: safety.reasons, answers, requirements, unknowns,
    existingMatches, architectures: builderArchitectures, selectedArchitectureId,
    bom, firmware: safety.safetyClass === "blocked-autonomous" ? "" : firmwareFor(capability, answers, intelligence), firmwareDependencies: safety.safetyClass === "blocked-autonomous" ? [] : firmwareDependenciesFor(capability), cadSource: safety.safetyClass === "blocked-autonomous" ? "" : cadFor(idea, answers),
    assemblyGuide: safety.safetyClass === "blocked-autonomous" ? "Detailed assembly is withheld for this request. Use the project requirements as a scope for a qualified engineer." : `1. Bench-test the controller from a certified USB source.\n2. Connect only the selected low-voltage sensor using its manufacturer pinout.\n3. Compile the firmware through the Build Executor after replacing any unresolved sensor adapter TODOs.\n4. Test sensing and offline/error behavior before soldering.\n5. Move the validated circuit to perfboard for R1.\n6. Execute the CadQuery model, then measure the actual assembly before treating fit as verified.\n7. Perform the test procedure before placing the prototype into service.`,
    testProcedure: safety.safetyClass === "blocked-autonomous" ? "Qualified engineering review is required before a physical test plan is generated." : `• Power-on: verify no component overheats and expected rails remain within module specifications.\n• Sensor: create a known stimulus and verify repeatable readings/state changes.\n• Failure: disconnect the sensor/network and verify the device fails visibly rather than silently.\n• Duration: run for at least 24 hours before relying on notifications.\n• Enclosure: verify cable strain relief, sensor exposure and physical clearance.\n• Environment: repeat the functional test in the intended non-hazardous environment.`,
    validations: validations(safety.safetyClass, answers, bom, selectedArchitectureId, execution), planningCostUsd, revision: 1, hosted: false, createdAt: now, updatedAt: now,
  };
}

export function selectProjectArchitecture(project: DeviceProject, architectureId: BuilderArchitecture["id"]): DeviceProject {
  const selected = builderArchitectures.find((item) => item.id === architectureId) ?? builderArchitectures[1];
  const safety = classifyBuilderSafety(project.idea, project.answers);
  const promotedSafety: BuilderSafetyClass = selected.engineeringReviewRequired && safety.safetyClass === "supported" ? "review-required" : safety.safetyClass;
  const bom = promotedSafety === "blocked-autonomous" ? [] : makeBom(project.capability, project.answers, selected.id);
  const execution: DeviceProject["execution"] = {
    firmware: { status: "not-run", detail: "Architecture changed; compile validation must be rerun.", artifactNames: [] },
    cad: { status: "not-run", detail: "Architecture changed; CAD generation/fit validation must be rerun.", artifactNames: [] },
  };
  return { ...project, selectedArchitectureId: selected.id, safetyClass: promotedSafety, safetyReasons: selected.engineeringReviewRequired ? [...safety.reasons, "The selected R2 path requires specialist electrical/manufacturing review before custom PCB work."] : safety.reasons, bom, sourcing: bom.map((item) => ({ bomId: item.id, status: "planning" as const })), execution, planningCostUsd: bom.reduce((sum, item) => sum + item.extendedPlanningCostUsd, 0), validations: validations(promotedSafety, project.answers, bom, selected.id, execution), revision: project.revision + 1, updatedAt: new Date().toISOString() };
}

export function applyOrchestrator(project: DeviceProject, orchestrator: DeviceProject["orchestrator"]): DeviceProject {
  const requirements = [...project.requirements];
  for (const item of orchestrator.inferredRequirements) if (!requirements.includes(item)) requirements.push(item);
  return { ...project, orchestrator, requirements, revision: project.revision + 1, updatedAt: new Date().toISOString() };
}

export function applyResearch(project: DeviceProject, research: DeviceProject["research"]): DeviceProject {
  return { ...project, research, revision: project.revision + 1, updatedAt: new Date().toISOString() };
}

export function applyExecution(project: DeviceProject, execution: DeviceProject["execution"]): DeviceProject {
  return { ...project, execution, validations: validations(project.safetyClass, project.answers, project.bom, project.selectedArchitectureId, execution), revision: project.revision + 1, updatedAt: new Date().toISOString() };
}
