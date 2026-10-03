import assert from "node:assert/strict";
import test from "node:test";
import { catalogDeviceToSmartDeviceObject, canAdvanceDeviceTrust } from "../app/lib/device-domain";
import { inferCapabilityRequirements } from "../app/lib/device-capabilities";
import { registrationToSmartDeviceObject, validateDeviceRegistration } from "../app/lib/device-connect";
import { devices } from "../app/lib/data";
import type { BuilderAnswers } from "../app/lib/builder-contract";

const answers: BuilderAnswers = { environment: "indoor", power: "usb", connectivity: "wifi", deploymentIntent: "auto", quantity: 1, goal: "functional-prototype", budget: "30-75" };

test("catalog publication remains discovered even when editorial data is source-reviewed", () => {
  const record = catalogDeviceToSmartDeviceObject(devices[0]);
  assert.equal(record.trust.state, "discovered");
  assert.equal(record.trust.claimState, "unclaimed");
  assert.equal(record.operationalReadiness.permissioned, false);
  assert.equal(record.operationalReadiness.agentOperable, false);
});

test("trust cannot silently advance", () => {
  assert.equal(canAdvanceDeviceTrust("registered", "verified", false), false);
  assert.equal(canAdvanceDeviceTrust("verified", "permissioned", false), false);
  assert.equal(canAdvanceDeviceTrust("registered", "registered", false), true);
  assert.equal(canAdvanceDeviceTrust("registered", "claimed", true), true);
  assert.equal(canAdvanceDeviceTrust("registered", "verified", true), false);
  assert.equal(canAdvanceDeviceTrust("identified", "agent-operable", true), false);
});

test("registration stays registered and rejects secret-like fields", () => {
  const registration = validateDeviceRegistration({ manufacturer: "Example", model: "T1", category: "sensor", capabilityIds: ["measure.temperature"], connection: { protocols: ["wifi"], locality: "local" } });
  assert.equal(registration.trustState, "registered");
  assert.throws(() => validateDeviceRegistration({ manufacturer: "Acme", model: "T1", category: "sensor", capabilityIds: ["measure.temperature"], externalIdentifiers: [{ scheme: "api-token", value: "secret" }] }), /DEVICE_SECRET_NOT_ALLOWED/);
  assert.throws(() => validateDeviceRegistration({ manufacturer: "Acme", model: "T1", category: "sensor", capabilityIds: ["measure.temperature"], externalIdentifiers: [{ scheme: "serial", value: "Bearer abcdefghijklmnopqrstuvwxyz" }] }), /DEVICE_SECRET_NOT_ALLOWED/);
  assert.equal(registration.claimState, "unclaimed");
  const record = registrationToSmartDeviceObject("dev-test", registration);
  assert.equal(record.operationalReadiness.connectable, false);
  assert.equal(record.operationalReadiness.agentOperable, false);
  assert.throws(() => validateDeviceRegistration({ manufacturer: "Example", model: "T1", category: "sensor", capabilityIds: ["measure.temperature"], connection: { apiKey: "secret" } }), /DEVICE_SECRET_NOT_ALLOWED/);
});

test("builder intent maps to capability requirements without requiring Mesh", () => {
  const requirements = inferCapabilityRequirements("Alert me if my freezer gets too warm", "temperature", answers);
  assert.ok(requirements.some((item) => item.id === "measure.temperature"));
  assert.ok(requirements.some((item) => item.id === "notify.remote"));
});
