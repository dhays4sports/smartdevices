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
