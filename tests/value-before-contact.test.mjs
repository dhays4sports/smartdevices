import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const source = fs.readFileSync(new URL("../app/components/SafetyPlanClient.tsx", import.meta.url), "utf8");
test("all five literal post-value actions exist", () => { assert.match(source, /Confirm with my \$\{carrierName\} agent/); assert.match(source, /Confirm with my insurance agent/); for (const label of ["Help me choose", "Installation help", "Save for later", "No action"]) assert.match(source, new RegExp(label)); });
test("context preview precedes purpose-bound consent and excludes sensitive fields", () => { assert.match(source, /Before you consent/); assert.match(source, /carrier-help-v1/); assert.match(source, /Raw answers, policy number, exact address, restricted evidence/); assert.match(source, /No message is sent/); });
test("contact appears only for explicit help actions after plan value", () => { assert.match(source, /helpAction === "confirm-agent" \|\| helpAction === "help-choose" \|\| helpAction === "installation-help"/); assert.match(source, /Your plan is already complete/); assert.doesNotMatch(source, /submission.*carrier confirmation/i); });
