import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const schema = await readFile(new URL("../db/schema.ts", import.meta.url), "utf8");
const api = await readFile(new URL("../app/lib/api.ts", import.meta.url), "utf8");
const migration = await readFile(new URL("../drizzle/0000_cute_aaron_stack.sql", import.meta.url), "utf8");

test("durable schema keeps recommendation, intent, fulfillment, consent, suppression, and audit state separate", () => {
  for (const name of ["plans", "plan_recommendations", "plan_responses", "consent_events", "audit_events", "suppression_entries", "rate_limit_windows"]) {
    assert.match(schema, new RegExp(`sqliteTable\\(\"${name}\"`));
    assert.match(migration, new RegExp("CREATE TABLE `" + name + "`"));
  }
  assert.match(schema, /installed-self-reported/);
  assert.match(schema, /evidence-received/);
  assert.match(schema, /verified/);
});

test("plan state transitions and input limits are explicit", () => {
  assert.match(api, /MAX_JSON_BYTES = 16_384/);
  assert.match(api, /ASSERTION_NOT_AUTHORIZED/);
  assert.match(api, /revoked: \[\]/);
  assert.match(api, /deviceIds\.length > 5/);
});

test("Pro production route has a server-side authorization boundary", async () => {
  const route = await readFile(new URL("../app/pro/workspace/page.tsx", import.meta.url), "utf8");
  assert.match(route, /getChatGPTUser/);
  assert.match(route, /SMARTDEVICES_DEMO_MODE/);
  assert.match(route, /Authorization required/);
});

test("Builder persistence is additive and keeps insurance qualification explicit", async () => {
  const builderMigration = await readFile(new URL("../drizzle/0005_builder_foundation.sql", import.meta.url), "utf8");
  const journal = JSON.parse(await readFile(new URL("../drizzle/meta/_journal.json", import.meta.url), "utf8"));
  assert.match(schema, /sqliteTable\("builder_projects"/);
  assert.match(schema, /sqliteTable\("builder_revisions"/);
  assert.match(schema, /solution_type/);
  assert.match(schema, /insurance_status/);
  assert.match(builderMigration, /CREATE TABLE `builder_projects`/);
  assert.match(builderMigration, /CREATE TABLE `builder_revisions`/);
  assert.match(builderMigration, /ADD `solution_type` text/);
  assert.match(builderMigration, /ADD `insurance_status` text/);
  const intelligenceMigration = await readFile(new URL("../drizzle/0006_intelligent_device_modes.sql", import.meta.url), "utf8");
  assert.match(schema, /intelligence_mode/);
  assert.match(schema, /mesh_profile_json/);
  assert.match(intelligenceMigration, /ADD `intelligence_mode` text/);
  const registryMigration = await readFile(new URL("../drizzle/0007_device_registry_foundation.sql", import.meta.url), "utf8");
  assert.match(schema, /sqliteTable\("device_registry_records"/);
  assert.match(schema, /registrantSubject: text\("registrant_subject"\)/);
  assert.match(schema, /ownerSubject: text\("owner_subject"\)/);
  assert.match(builderMigration, /`owner_subject` text/);
  assert.doesNotMatch(registryMigration, /owner_subject/);
  assert.match(schema, /sqliteTable\("device_control_claims"/);
  assert.match(schema, /sqliteTable\("device_integrations"/);
  assert.match(registryMigration, /CREATE TABLE `device_registry_records`/);
  assert.match(registryMigration, /CREATE TABLE `device_control_claims`/);
  assert.match(registryMigration, /CREATE TABLE `device_integrations`/);
  assert.ok(journal.entries.some((item) => item.tag === "0007_device_registry_foundation"));
  assert.equal(journal.entries.at(-1)?.tag, "0011_market_conversion_proof");
});
