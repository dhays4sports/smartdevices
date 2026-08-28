import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const source = fs.readFileSync(new URL("../app/components/ProWorkspace.tsx", import.meta.url), "utf8");
test("Pro embeds the exact client route and offers mobile and print preview", () => { assert.match(source, /iframe/); assert.match(source, /src={generated}/); assert.match(source, /Mobile preview/); assert.match(source, /Print preview/); });
test("share is gated by exact-view acknowledgement", () => { assert.match(source, /previewAcknowledged/); assert.match(source, /disabled={!previewAcknowledged}/); assert.match(source, /reviewed the exact client view/); });
test("brand hierarchy and shared-field preview are explicit", () => { assert.match(source, /SmartDevices remains primary/); assert.match(source, /carrier logo is intentionally omitted/); assert.match(source, /Not included/); assert.match(source, /raw answers, policy number, exact address, restricted evidence/); });
test("generated client preview uses the available width before applying its mobile cap", () => { const css = fs.readFileSync("app/globals.css", "utf8"); assert.match(css, /\.generated-plan\{display:grid;grid-template-columns:minmax\(0,1fr\);align-items:stretch\}/); assert.match(css, /\.client-preview\{width:100%/); assert.match(css, /\.client-preview-mobile\{max-width:390px\}/); });
