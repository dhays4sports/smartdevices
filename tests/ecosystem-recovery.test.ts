import assert from "node:assert/strict";
import test from "node:test";
import { DEVICE_TRUST_LADDER, catalogDeviceToSmartDeviceObject, requestDeviceOperation } from "../app/lib/device-domain";
import { validateDeviceRegistration, registrationToSmartDeviceObject, DisabledDeviceAdapter } from "../app/lib/device-connect";
import { readDeviceRegistrationRequest } from "../app/lib/device-registration-request";
import { createDeviceProject } from "../app/lib/builder-engine";
import { validateDeviceProject } from "../app/lib/builder-store";
import { inferDeviceIntelligence } from "../app/lib/device-intelligence";
import { buildPackFiles } from "../app/lib/builder-pack";
import { devices } from "../app/lib/data";
import type { BuilderAnswers } from "../app/lib/builder-contract";

const input = { manufacturer: "Independent lab", model: "Freezer monitor", category: "commercial sensor", capabilityIds: ["measure.temperature"], connection: { locality: "local", protocols: ["wifi"] } };
const answers: BuilderAnswers = { environment: "indoor", power: "usb", connectivity: "wifi", deploymentIntent: "auto", quantity: 10, goal: "functional-prototype", budget: "30-75" };

test("legacy catalog stays unchanged and non-Mesh records carry only discovery evidence", () => {
  const before = JSON.stringify(devices);
  for (const device of devices) {
    const record = catalogDeviceToSmartDeviceObject(device);
    assert.equal(record.mesh.participation, "optional");
    assert.equal(record.trust.facts.discovered.state, "established");
    for (const stage of DEVICE_TRUST_LADDER.slice(1)) assert.equal(record.trust.facts[stage].state, "not-established");
    assert.deepEqual(record.control.permissionRefs, []);
  }
  assert.equal(JSON.stringify(devices), before);
});

test("registration establishes only registration, not discovery, verification or authority", () => {
  const record = registrationToSmartDeviceObject("dev-test", validateDeviceRegistration(input));
  for (const stage of DEVICE_TRUST_LADDER) assert.equal(record.trust.facts[stage].state, stage === "registered" ? "established" : "not-established");
  assert.equal(record.operationalReadiness.connectable, false);
  assert.equal(record.operationalReadiness.transactional, false);
});

for (const field of ["trust", "verified", "owner", "endpoint", "token", "credentials", "permissionRefs", "__proto__"]) {
  test(`registration rejects injected ${field}`, () => {
    const malicious = JSON.parse(JSON.stringify(input).slice(0, -1) + `,"${field}":"injected"}`);
    assert.throws(() => validateDeviceRegistration(malicious));
  });
}

test("registration rejects truncated, malformed, endpoint and credential-like declarations", () => {
  for (const bad of [null, [], { ...input, model: "x".repeat(161) }, { ...input, model: "Bearer abcdef" }, { ...input, capabilityIds: ["constructor"] }, { ...input, connection: { protocols: ["http://127.0.0.1/private"] } }, { ...input, connection: { locality: { toString: () => "local" } } }, { ...input, connection: { protocols: Array(13).fill("wifi") } }, { ...input, meshReadiness: "active" }]) assert.throws(() => validateDeviceRegistration(bad));
});

test("identity and additive Mesh metadata never establish permissions", () => {
  const record = registrationToSmartDeviceObject("dev-test", validateDeviceRegistration({ ...input, externalIdentifiers: [{ scheme: "device.eth", value: "test.device.eth" }], meshReadiness: "ready" }));
  record.trust.facts.identified = { state: "established", evidenceRefs: ["synthetic:identity"] };
  assert.equal(record.trust.facts.permissioned.state, "not-established");
  assert.equal(record.operationalReadiness.permissioned, false);
  assert.equal(record.operationalReadiness.agentOperable, false);
  assert.equal(record.manufacturer, input.manufacturer);
  assert.equal(record.capabilities[0].id, input.capabilityIds[0]);
});

test("reachability or forged authority references cannot activate physical operation", async () => {
  const adapter = new DisabledDeviceAdapter({ id: "test", label: "test", status: "disabled", protocols: [], credentialHandling: "server-reference-only" });
  assert.equal((await adapter.probe()).reachable, false);
  const result = await requestDeviceOperation({ requester: { kind: "agent", id: "agent:test" }, representedPrincipal: "human:test", deviceId: "dev-test", capabilityId: "shutoff.water", mandateRef: "forged", permissionRef: "forged", expiresAt: "2099-01-01", nonce: "test", constraints: { humanApprovalRef: "forged", maxExecutions: 1 } });
  assert.equal(result.status, "blocked");
  assert.equal(result.receiptRef, null);
});

test("schema-v3 builder projects normalize to v4 without losing prior artifacts", () => {
  const current = createDeviceProject("Monitor freezer temperatures", answers, devices);
  const { requiredCapabilities: _required, ...rest } = current;
  void _required;
  const legacy = { ...rest, schemaVersion: 3 };
  const normalized = validateDeviceProject(legacy);
  assert.equal(normalized.schemaVersion, 4);
  assert.deepEqual(normalized.requiredCapabilities.map((item) => item.id), ["measure.temperature"]);
  assert.equal(normalized.firmware, legacy.firmware);
  assert.equal(legacy.schemaVersion, 3);
  assert.ok(buildPackFiles(normalized)["Capability_Requirements.md"]);
});

test("agents and fleets do not force Mesh-native design", () => {
  assert.equal(inferDeviceIntelligence("An AI agent monitors freezer temperatures across warehouses", answers).mode, "mesh-ready");
  assert.equal(inferDeviceIntelligence("A Mesh node monitors freezer temperatures", answers).mode, "mesh-native");
});

const request = (body: string, origin = "https://example.test") => new Request("https://example.test/api/devices/register", { method: "POST", headers: { origin, "content-type": "application/json" }, body });
test("registration request enforces same origin and bounded valid JSON", async () => {
  assert.deepEqual(await readDeviceRegistrationRequest(request(JSON.stringify(input))), input);
  await assert.rejects(readDeviceRegistrationRequest(request("{}", "https://attacker.test")), /ORIGIN_REJECTED/);
  await assert.rejects(readDeviceRegistrationRequest(request("x".repeat(32769))), /TOO_LARGE/);
  await assert.rejects(readDeviceRegistrationRequest(request("{malformed")));
});
