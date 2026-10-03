import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import test from "node:test";

const port = 43129;
const origin = `http://127.0.0.1:${port}`;
let output = "";
const server = spawn("./node_modules/.bin/vinext", ["start", "--port", String(port), "--hostname", "127.0.0.1"], {
  cwd: new URL("..", import.meta.url),
  env: { ...process.env, SMARTDEVICES_DEMO_MODE: "true", COVERAGEFIT_DEVICE_BRIDGE_ENABLED: "false", RATE_LIMIT_HASH_SALT: "local-runtime-test-only-not-a-secret", WRANGLER_LOG_PATH: ".wrangler/test.log" },
  stdio: ["ignore", "pipe", "pipe"],
});
server.stdout.on("data", (chunk) => { output += chunk.toString(); });
server.stderr.on("data", (chunk) => { output += chunk.toString(); });

async function waitForServer() {
  const started = Date.now();
  while (Date.now() - started < 20_000) {
    try { const response = await fetch(origin); if (response.status) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Runtime did not start.\n${output}`);
}

await waitForServer();
test.after(() => server.kill("SIGTERM"));

async function html(path) { const response = await fetch(`${origin}${path}`, { headers: { accept: "text/html" } }); return { response, body: await response.text() }; }

test("homepage renders the preservation contract and interactive explorer", async () => {
  const { response, body } = await html("/");
  assert.equal(response.status, 200);
  assert.match(body, /Smart Protection Explorer/);
  assert.match(body, /The Future Has An Address/);
  assert.match(body, /SmartDevices Index/);
  assert.doesNotMatch(body, /codex-preview/);
  assert.match(response.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
});

test("direct routes load for vehicle, catalog, plan, and Pro demo", async () => {
  for (const [path, pattern] of [
    ["/protect/vehicle", /Vehicle protection/],
    ["/devices?domain=home&concern=water", /Device Intelligence Library/],
    ["/plans/demo?domain=home&concern=water&items=moen-flo-shutoff,phyn-plus-v2", /Protection map/],
    ["/pro/workspace", /Explicit demo mode/],
  ]) {
    const { response, body } = await html(path);
    assert.equal(response.status, 200, path);
    assert.match(body, pattern, path);
    if (path.startsWith("/plans/")) {
      assert.match(response.headers.get("content-security-policy") ?? "", /frame-ancestors 'self'/);
      assert.equal(response.headers.get("x-frame-options"), "SAMEORIGIN");
    }
  }
});

test("carrier discovery, Farmers direct context, and permanent alias work in built runtime", async () => {
  for (const [path, pattern] of [
    ["/insurance", /Did your insurer mention a smart device/],
    ["/build", /Describe the device you wish existed/],
    ["/farmers", /Find the right device for what Farmers mentioned/],
    ["/farmers?intent=requirement&category=water", /What kind of device did they mention/],
  ]) {
    const { response, body } = await html(path);
    assert.equal(response.status, 200, path);
    assert.match(body, pattern, path);
  }
  const alias = await fetch(`${origin}/insurance/farmers?intent=requirement&category=water`, { redirect: "manual" });
  assert.equal(alias.status, 308);
  assert.match(alias.headers.get("location") ?? "", /\/farmers\?intent=requirement&category=water$/);
});

test("Evidence Autopilot renders and exercises the bounded local demo refresh", async () => {
  const page = await html("/admin/evidence");
  assert.equal(page.response.status, 200);
  assert.match(page.body, /Keep the facts current without babysitting the catalog/);
  const response = await fetch(`${origin}/api/admin/evidence`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "refresh" }) });
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.mode, "demo");
  assert.equal(payload.summary.total, 8);
  assert.equal(payload.summary.baseline, 8);
  assert.equal(payload.summary.autoRenewable, 0);
});

test("invalid and unavailable plan input fails honestly", async () => {
  const { response, body } = await html("/plans/missing");
  assert.equal(response.status, 200);
  assert.match(body, /incomplete or no longer available/);
});

test("connected task route loads while inactive and mutations fail closed", async () => {
  const { response, body } = await html("/insurance-task");
  assert.equal(response.status, 200);
  assert.match(body, /Your home protection next steps/);
  assert.match(body, /noindex/);
  const payload = JSON.stringify({ operation: "read", token: "a".repeat(43) });
  const disabled = await fetch(`${origin}/api/coveragefit-device`, { method: "POST", headers: { origin, "content-type": "application/json" }, body: payload });
  assert.equal(disabled.status, 503);
  assert.equal((await disabled.json()).error.code, "CONNECTION_NOT_CONFIGURED");
  assert.equal(disabled.headers.get("cache-control"), "no-store");
  const foreign = await fetch(`${origin}/api/coveragefit-device`, { method: "POST", headers: { origin: "https://foreign.test", "content-type": "application/json" }, body: payload });
  assert.equal(foreign.status, 403);
});

test("external handoff endpoint rejects unauthenticated callers", async () => {
  const handoff = { schemaVersion: 1, handoffId: "hof_test", sourceSystem: "smartdevices", destinationSystem: "coveragefit", issuedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 60_000).toISOString(), consent: { purpose: "protection-plan", capturedAt: new Date().toISOString(), policyVersion: "test" }, context: { domain: "home", concernIds: ["water"] } };
  const response = await fetch(`${origin}/api/integrations/handoff`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(handoff) });
  assert.equal(response.status, 403);
  assert.equal((await response.json()).error.code, "AUTHORIZATION_REQUIRED");
});

test("missing hosted storage fails explicitly without breaking public value", async () => {
  const response = await fetch(`${origin}/api/plans/pln_00000000000000000000000000000000`);
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error.code, "STORAGE_UNAVAILABLE");
  const publicRoute = await html("/protect/home?concern=water");
  assert.equal(publicRoute.response.status, 200);
  assert.match(publicRoute.body, /What should your water protection do/);
  assert.match(publicRoute.body, /A detection-only sensor is not a substitute/);
});
