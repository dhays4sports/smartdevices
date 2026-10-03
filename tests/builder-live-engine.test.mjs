import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const component = fs.readFileSync("app/components/DeviceBuilder.tsx", "utf8");
const projectRoute = fs.readFileSync("app/api/builder/projects/route.ts", "utf8");
const projectIdRoute = fs.readFileSync("app/api/builder/projects/[id]/route.ts", "utf8");
const researchRoute = fs.readFileSync("app/api/builder/research/route.ts", "utf8");
const sourceRoute = fs.readFileSync("app/api/builder/source/route.ts", "utf8");
const executeRoute = fs.readFileSync("app/api/builder/execute/route.ts", "utf8");
const aiServer = fs.readFileSync("app/lib/builder-ai-server.ts", "utf8");
const boundary = fs.readFileSync("app/lib/builder-route.ts", "utf8") + fs.readFileSync("app/lib/builder-http.ts", "utf8");
const store = fs.readFileSync("app/lib/builder-store.ts", "utf8");

 test("v5.2 workspace exposes live research, sourcing, execution and hosted revision actions", () => {
  assert.match(component, /Run live market research/);
  assert.match(component, /Check live sourcing/);
  assert.match(component, /Compile \+ generate CAD/);
  assert.match(component, /Save online/);
  assert.match(component, /Only executed checks can pass/);
});

test("hosted Builder projects require an authenticated owner", () => {
  assert.match(projectRoute, /handleBuilderRequest/);
  assert.match(boundary, /getChatGPTUser/);
  assert.match(boundary, /AUTHENTICATION_REQUIRED/);
  assert.match(projectIdRoute, /handleBuilderRequest/);
  assert.match(boundary, /project\.id !== id/);
  assert.match(store, /ownerSubject/);
  assert.match(store, /manifest_json/);
  assert.match(store, /builder_revisions/);
});

test("external execution and sourcing are explicitly opt-in and unavailable by default", () => {
  assert.match(executeRoute, /SMARTDEVICES_BUILD_EXECUTOR_ENABLED/);
  assert.match(executeRoute, /status: "unavailable"/);
  assert.match(sourceRoute, /SMARTDEVICES_LIVE_SOURCING_ENABLED/);
  assert.match(sourceRoute, /status: "unavailable"/);
});

test("model-assisted orchestration and web research are provider-gated", () => {
  assert.match(aiServer, /SMARTDEVICES_AI_ENABLED/);
  assert.match(aiServer, /OPENAI_API_KEY/);
  assert.match(aiServer, /tools: \[\{ type: "web_search" \}\]/);
  assert.match(researchRoute, /researchWithModel/);
});
