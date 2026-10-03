import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { coverageFitOrigin, validateDeviceRequest, callCoverageFit } from "../app/lib/coveragefit-device";
const token = "a".repeat(43);
test("connected task accepts only bounded consented states and strips private fields", () => {
  assert.deepEqual(validateDeviceRequest({ operation: "read", token, policyNumber: "private" }), { operation: "read", token });
  assert.throws(() => validateDeviceRequest({ operation: "save", token, consent: true, expectedVersion: 0, requestId: crypto.randomUUID(), state: "carrier-approved", deviceId: "" }));
  const saved = validateDeviceRequest({ operation: "save", token, consent: true, expectedVersion: 0, requestId: crypto.randomUUID(), state: "installation-help", deviceId: "", email: "private" });
  assert(!("email" in saved));
  assert.throws(() => validateDeviceRequest({ ...saved, consent: false }));
});
test("connection origin is configured, exact HTTPS, and never taken from a customer URL", () => {
  for (const origin of ["http://coveragefit.com", "https://coveragefit.com/redirect", "https://name:password@coveragefit.com", ""]) assert.throws(() => coverageFitOrigin({ COVERAGEFIT_ORIGIN: origin }));
  assert.equal(coverageFitOrigin({ COVERAGEFIT_ORIGIN: "https://coveragefit.com" }), "https://coveragefit.com");
});
test("unconfigured bridge does not call external services", async () => {
  let called = false;
  await assert.rejects(() => callCoverageFit(validateDeviceRequest({ operation: "read", token }), {}, async () => { called = true; return Response.json({}); }), /CONNECTION_NOT_CONFIGURED/);
  assert.equal(called, false);
});
test("signed transport uses the narrow request and refuses redirects or oversized responses", async () => {
  const input = validateDeviceRequest({ operation: "read", token });
  const env = { COVERAGEFIT_DEVICE_BRIDGE_ENABLED: "true", COVERAGEFIT_ORIGIN: "https://coveragefit.test", SMARTDEVICES_BRIDGE_SECRET: "synthetic-bridge-secret-0000000000000000000" };
  await assert.rejects(() => callCoverageFit(input, env, async (url, init) => { assert.equal(url, "https://coveragefit.test/api/recommendations/device-bridge"); assert.equal(init?.redirect, "error"); assert.match(new Headers(init?.headers).get("X-Device-Signature")!, /^[a-f0-9]{64}$/); assert.deepEqual(JSON.parse(String(init?.body)), input); return new Response("x".repeat(17000)); }), /INVALID_RESPONSE/);
});
test("UI saves explicitly and keeps insurance, verification and appointment states separate", () => {
  const ui = readFileSync(new URL("../app/components/CoverageFitDeviceTask.tsx", import.meta.url), "utf8");
  for (const text of ["Save update to my insurance review", "Return to my insurance review", "Customer-reported installation is not installation evidence", "existing appointment are preserved", "consent", "pending.current.requestId"]) assert(ui.includes(text));
  const api = readFileSync(new URL("../app/api/coveragefit-device/route.ts", import.meta.url), "utf8");
  assert(api.includes('consumeRateLimit')); assert(api.includes('homeOptions')); assert(api.includes('request.headers.get("origin")'));
});
