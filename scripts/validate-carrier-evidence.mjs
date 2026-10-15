import fs from "node:fs";

const read = (name) => JSON.parse(fs.readFileSync(`content/${name}.json`, "utf8"));
const sources = read("evidence-sources").sources;
const rules = read("carrier-rules").rules;
const fits = read("device-carrier-fit").fits;
const sourceIds = new Set(sources.map((source) => source.id));
const now = process.env.SD42_REVIEW_DATE ?? new Date().toISOString().slice(0, 10);

const report = {
  schemaVersion: 1,
  evaluatedAt: now,
  counts: { sources: sources.length, rules: rules.length, fits: fits.length },
  draft: sources.filter((item) => item.status === "draft").map((item) => item.id).sort(),
  stale: sources.filter((item) => item.status === "stale" || (item.status === "active" && item.reviewDueDate < now)).map((item) => item.id).sort(),
  conflicting: sources.filter((item) => item.status === "conflicting").map((item) => item.id).sort(),
  restricted: sources.filter((item) => item.visibility === "restricted").map((item) => item.id).sort(),
  orphanRules: rules.filter((rule) => rule.sourceIds.some((id) => !sourceIds.has(id))).map((rule) => rule.id).sort(),
  publicLeaks: rules.filter((rule) => rule.visibility === "public" && (rule.status === "draft" || rule.sourceIds.some((id) => sources.find((source) => source.id === id)?.visibility === "restricted"))).map((rule) => rule.id).sort(),
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (report.orphanRules.length || report.publicLeaks.length) process.exitCode = 1;
