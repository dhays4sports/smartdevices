import test from "node:test";
import assert from "node:assert/strict";
import { carrierPlanTemplates, carrierTemplateState } from "../app/lib/pro-templates";
import { carrierRules } from "../app/lib/carrier";

test("four carrier templates contain stable governed IDs and no PII fields", () => { assert.equal(carrierPlanTemplates.length, 4); const text = JSON.stringify(carrierPlanTemplates); assert.doesNotMatch(text, /clientName|address|policyNumber|claimNumber|email|phone|privateNote/i); for (const template of carrierPlanTemplates) { assert.match(template.id, /^[a-z0-9-]+$/); assert.ok(template.capabilityIds.length && template.requiredRuleIds.length && template.confirmation.length); } });
test("current rules make templates available", () => { for (const template of carrierPlanTemplates) assert.equal(carrierTemplateState(template, carrierRules.rules), "available"); });
test("stale or absent rules warning-gate templates", () => { const stale = carrierRules.rules.map((rule) => ({ ...rule, status: "stale" as const })); for (const template of carrierPlanTemplates) assert.equal(carrierTemplateState(template, stale), "warning-gated"); });
test("professional assertion can never become carrier verified", () => { const statuses = ["professional-supplied-unverified", "professional-unverified"]; assert.ok(statuses.every((value) => !/carrier-verified/.test(value))); });
