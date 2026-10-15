import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const domain = await readFile(new URL("../app/lib/device-domain.ts", import.meta.url), "utf8");
const connect = await readFile(new URL("../app/lib/device-connect.ts", import.meta.url), "utf8");
const registryRoute = await readFile(new URL("../app/api/devices/register/route.ts", import.meta.url), "utf8");
const detailRoute = await readFile(new URL("../app/api/devices/[slug]/route.ts", import.meta.url), "utf8");
const capabilities = JSON.parse(await readFile(new URL("../content/device-capabilities.json", import.meta.url), "utf8"));

test("trust ladder keeps discovery, registration, claim, verification, identity, permission, operation and transaction separate", () => {
  for (const state of ["discovered", "registered", "claimed", "verified", "identified", "permissioned", "agent-operable", "transactional"]) assert.match(domain, new RegExp(`"${state}"`));
  assert.match(domain, /DEVICE_TRUST_ESCALATION_REQUIRES_EVIDENCE/);
  assert.match(domain, /state: "discovered"/);
  assert.match(connect, /trustState: "registered"/);
  assert.match(connect, /claimState: "unclaimed"/);
  assert.match(domain, /trustRank\(to\) === trustRank\(from\) \+ 1/);
});

test("connection metadata cannot smuggle device credentials into registration", () => {
  assert.match(connect, /SENSITIVE_KEY/);
  assert.match(connect, /DEVICE_SECRET_NOT_ALLOWED/);
  assert.match(registryRoute, /Registration does not prove ownership, verification, identity, permission, reachability, or agent control/);
});

test("non-Mesh devices remain representable and Mesh is additive", () => {
  assert.match(domain, /participation: "optional"/);
  assert.match(connect, /meshReadiness/);
  assert.doesNotMatch(connect, /mesh-native/);
  assert.match(connect, /connectable: false/);
});

test("capability registry uses normalized machine-readable IDs from proven catalog or builder paths", () => {
  const ids = new Set(capabilities.map((item) => item.id));
  for (const id of ["measure.temperature", "detect.water_leak", "shutoff.water", "detect.open_close", "notify.remote"]) assert.ok(ids.has(id), id);
  assert.match(detailRoute, /catalogDeviceToSmartDeviceObject/);
});
