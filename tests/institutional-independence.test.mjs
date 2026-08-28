import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const farmers = fs.readFileSync("app/farmers/page.tsx", "utf8");
const header = fs.readFileSync("app/components/SiteHeader.tsx", "utf8");
const pro = fs.readFileSync("app/components/ProWorkspace.tsx", "utf8");
const footer = fs.readFileSync("app/components/SiteFooter.tsx", "utf8");
test("SmartDevices remains primary across public, carrier, and Pro experiences", () => { assert.match(header, /SmartDevices\.com/); assert.match(farmers, /SmartDevices is independent/); assert.match(pro, /SmartDevices remains primary/); assert.match(footer, /The Future Has An Address/); });
test("California carrier route uses text reference and no unauthorized logo", () => { assert.match(farmers, /Text reference only/); assert.doesNotMatch(farmers, /<Image[^>]+farmers|farmers-logo|official partnership/i); assert.match(farmers, /not an official Farmers site/); });
