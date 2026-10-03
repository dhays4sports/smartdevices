import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const schema = await readFile(new URL("../db/schema.ts", import.meta.url), "utf8");
const adminRoute = await readFile(new URL("../app/api/admin/evidence/route.ts", import.meta.url), "utf8");
const scheduledRoute = await readFile(new URL("../app/api/internal/evidence-refresh/route.ts", import.meta.url), "utf8");
const consolePage = await readFile(new URL("../app/components/EvidenceAutopilot.tsx", import.meta.url), "utf8");
const farmers = await readFile(new URL("../app/farmers/page.tsx", import.meta.url), "utf8");
const devices = await readFile(new URL("../app/devices/page.tsx", import.meta.url), "utf8");
const env = await readFile(new URL("../.env.example", import.meta.url), "utf8");

test("autopilot persistence is append-only and auditable", () => {
  for (const table of ["evidence_refresh_runs", "evidence_source_checks", "evidence_publication_snapshots", "evidence_decisions"]) assert.match(schema, new RegExp(table));
  assert.match(schema, /content_hash/);
  assert.match(schema, /published_by/);
  assert.match(schema, /source_run_id/);
});

test("manual and scheduled refresh routes fail closed", () => {
  assert.match(adminRoute, /authorizeEvidenceAdmin/);
  assert.match(adminRoute, /consumeRateLimit\(request, "evidence:admin"/);
  assert.match(adminRoute, /EVIDENCE_REFRESH_NOT_ACTIVATED/);
  assert.match(scheduledRoute, /timingSafeTokenMatch/);
  assert.match(scheduledRoute, /SMARTDEVICES_EVIDENCE_SCHEDULER_TOKEN/);
  assert.match(scheduledRoute, /consumeRateLimit\(request, "evidence:scheduled"/);
});

test("the console exposes one clear refresh action and the confidence boundary", () => {
  assert.match(consolePage, /Refresh all evidence/);
  assert.match(consolePage, /New or stronger claims never publish automatically/);
  assert.match(consolePage, /automatically become more conservative/);
  assert.match(consolePage, /Open official source/);
  assert.match(consolePage, /Facts reviewed—unchanged/);
  assert.match(consolePage, /Mark guidance stale/);
});

test("public device and Farmers pages read the active evidence snapshot with file fallback", () => {
  assert.match(devices, /getPublishedEvidenceBundle/);
  assert.match(farmers, /getPublishedEvidenceBundle/);
  assert.match(farmers, /publicCarrierDataFromBundle/);
});

test("activation values are explicit and contain no invented secret", () => {
  for (const key of ["SMARTDEVICES_EVIDENCE_ADMIN_JSON", "SMARTDEVICES_EVIDENCE_SCHEDULER_TOKEN", "SMARTDEVICES_EVIDENCE_REFRESH_ENABLED"]) assert.match(env, new RegExp(`^${key}=`, "m"));
  assert.doesNotMatch(env, /SMARTDEVICES_EVIDENCE_SCHEDULER_TOKEN=\S+/);
});
