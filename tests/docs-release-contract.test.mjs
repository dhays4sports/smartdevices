import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const requiredDocs = [
  "README.md", ".env.example", "docs/RELEASE_MANIFEST.md", "docs/RELEASE_AND_VERSION_LEDGER.md",
  "docs/V4.2_CHECKPOINT_LEDGER.md", "docs/ARCHITECTURE_AND_DATA_CONTRACTS.md", "docs/CARRIER_DATA_CONTRACTS.md",
  "docs/SCAN_QUESTION_AND_RULE_PROVENANCE.md", "docs/CONTENT_AND_INSURANCE_EVIDENCE_LEDGER.md",
  "docs/PROTECTED_HASH_HISTORY.md", "docs/SCHEMA_AND_MIGRATION_HISTORY.md", "docs/NORMALIZED_REGRESSION_HISTORY.md",
  "docs/EXTERNAL_ACTIVATION_LEDGER.md", "docs/DEPLOYMENT_MIGRATION_ROLLBACK_GUIDE.md",
  "docs/ADMIN_EDITORIAL_GUIDE.md", "docs/CARRIER_EDITORIAL_WORKFLOW.md", "docs/FUTURE_CARRIER_ONBOARDING.md",
  "docs/CARRIER_BRAND_GUIDE.md", "docs/CARRIER_INTEGRATION_GUIDE.md",
  "docs/SAMPLE_CALIFORNIA_FARMERS_WATER_PLAN.md", "docs/SAMPLE_CALIFORNIA_FARMERS_MONITORED_SECURITY_PLAN.md",
  "docs/KNOWN_LIMITATIONS_AND_CUTOVER_READINESS.md",
];

test("every v4.2 release document exists at the documented root-relative path", async () => {
  await Promise.all(requiredDocs.map((path) => access(resolve(root, path))));
});

test("operator commands, carrier routes, and activation keys are documented", async () => {
  const readme = await readFile(resolve(root, "README.md"), "utf8");
  for (const value of ["/insurance", "/farmers", "npm run install:ci", "npm run validate:evidence", "npm run typecheck", "npm run lint", "npm test"]) assert.ok(readme.includes(value), `README missing ${value}`);
  const environment = await readFile(resolve(root, ".env.example"), "utf8");
  for (const key of ["SMARTDEVICES_DEMO_MODE", "SMARTDEVICES_PRO_AUTH_JSON", "COVERAGEFIT_SIGNING_SECRET", "FARMERS408_SIGNING_SECRET", "RATE_LIMIT_HASH_SALT", "CONSENT_POLICY_VERSION", "PLAN_RETENTION_DAYS", "AUDIT_RETENTION_DAYS"]) assert.match(environment, new RegExp(`^${key}=`, "m"));
});

test("both carrier-aware sample plans expose the complete decision contract", async () => {
  for (const path of requiredDocs.filter((value) => value.includes("SAMPLE_CALIFORNIA"))) {
    const sample = await readFile(resolve(root, path), "utf8");
    for (const term of ["Known", "Unknown", "Cost", "Setup", "Subscription", "Maintenance", "Privacy", "Insurance", "Optional next actions"]) assert.match(sample, new RegExp(term, "i"));
  }
});
