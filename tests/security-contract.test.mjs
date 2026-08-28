import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const api = await readFile(new URL("../app/lib/api.ts", import.meta.url), "utf8");
const handoff = await readFile(new URL("../app/lib/integrations.ts", import.meta.url), "utf8");
const handoffRoute = await readFile(new URL("../app/api/integrations/handoff/route.ts", import.meta.url), "utf8");
const worker = await readFile(new URL("../worker/index.ts", import.meta.url), "utf8");
const questions = await readFile(new URL("../content/scan-questions.json", import.meta.url), "utf8");
const experience = await readFile(new URL("../app/lib/experience.ts", import.meta.url), "utf8");
const gitignore = await readFile(new URL("../.gitignore", import.meta.url), "utf8");

test("opaque capabilities and bounded JSON inputs remain enforced", () => {
  assert.match(api, /crypto\.randomUUID\(\)/);
  assert.match(api, /MAX_JSON_BYTES = 16_384/);
  assert.match(api, /PROHIBITED_PLAN_FIELD/);
  assert.match(api, /ASSERTION_NOT_AUTHORIZED/);
});

test("partner handoffs use consent, expiry, HMAC, replay storage, and a route rate limit", () => {
  assert.match(handoff, /CONSENT_REQUIRED/);
  assert.match(handoff, /HANDOFF_EXPIRED/);
  assert.match(handoff, /HMAC/);
  assert.match(handoff, /Math\.abs\(Date\.now\(\) - time \* 1000\) > 300_000/);
  assert.match(handoff, /difference \|=/);
  assert.match(handoffRoute, /consumeRateLimit\(request, "handoff:receive", 120, 60\)/);
  assert.match(handoffRoute, /handoffReceipts/);
});

test("worker responses carry the published browser security headers", () => {
  for (const header of ["Content-Security-Policy", "Referrer-Policy", "X-Content-Type-Options", "X-Frame-Options", "Permissions-Policy", "Cross-Origin-Opener-Policy", "Strict-Transport-Security"]) {
    assert.match(worker, new RegExp(header));
  }
  assert.match(worker, /url\.pathname\.startsWith\("\/plans\/"\)/);
  assert.match(worker, /allowSameOriginFrame \? "SAMEORIGIN" : "DENY"/);
});

test("scan and analytics event contracts exclude PII and free text", () => {
  const parsedQuestions = JSON.parse(questions).questions;
  const collectedLabels = parsedQuestions.flatMap((question) => [question.prompt, ...question.options.map((option) => option.label)]).join(" ");
  assert.doesNotMatch(collectedLabels, /exact address|VIN|plate|birth date|policy number|claim number|email|phone/i);
  const eventType = experience.slice(experience.indexOf("export type ExperienceEvent ="), experience.indexOf("export interface ExperienceEventAdapter"));
  assert.doesNotMatch(eventType, /freeText|clientName|displayName|email|phone|address|vin|plate|policy|claim/i);
});

test("local environment files and generated outputs are excluded", () => {
  assert.match(gitignore, /^\.env\*/m);
  assert.match(gitignore, /^\/dist\//m);
  assert.match(gitignore, /^\/\.wrangler\//m);
});
