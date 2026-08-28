import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import catalog from "../content/catalog.json";
import domains from "../content/domains.json";
import scan from "../content/scan-questions.json";
import carrierRules from "../content/carrier-rules.json";
import carrierPrograms from "../content/carrier-programs.json";
import carrierRegistry from "../content/carriers.json";
import evidenceSources from "../content/evidence-sources.json";

test("published content avoids prohibited insurance and outcome promises", () => {
  const text = JSON.stringify({ catalog, domains, scan, carrierRules, carrierPrograms, carrierRegistry, evidenceSources });
  for (const pattern of [
    /will (?:prevent|stop) (?:all|any) (?:loss|damage|claims?)/i,
    /guaranteed (?:discount|claim|recovery|prevention|eligibility|approval)/i,
    /carrier[- ]approved/i,
    /qualifies? you for (?:a )?(?:discount|coverage)/i,
    /satisfies your policy/i,
    /required for all farmers homes/i,
    /official smartdevices\s*\/\s*farmers partnership/i,
    /farmers[- ](?:approved|certified)/i,
  ]) assert.doesNotMatch(text, pattern);
});

test("scan contains no identity fields, score, or effect-free questions", () => {
  const askedText = scan.questions.map((question) => `${question.prompt} ${question.options.map((option) => option.label).join(" ")}`).join(" ");
  assert.doesNotMatch(askedText, /exact address|VIN|plate|policy number|claim number|birth date|protection score|safety score/i);
  assert.ok(scan.questions.every((question) => question.effectAreas.length > 0));
});

test("Family and Business remain neutral starter guides", () => {
  const explorer = fs.readFileSync(new URL("../app/components/ProtectionExplorer.tsx", import.meta.url), "utf8");
  assert.match(explorer, /Starter guide/);
  assert.match(explorer, /without false feature parity/);
  assert.match(explorer, /domain\.id === "home" \|\| domain\.id === "vehicle"/);
});
