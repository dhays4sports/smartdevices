import test from "node:test";
import assert from "node:assert/strict";
import sitemap from "../app/sitemap";
import robots from "../app/robots";
import fs from "node:fs";

test("isolated test sitemap never publishes a competing canonical origin", () => { assert.deepEqual(sitemap(), []); });
test("isolated test robots disallows all crawler paths", () => { assert.deepEqual(robots().rules, { userAgent: "*", disallow: "/" }); });
test("directory and carrier structured data preserve SmartDevices identity without partnership claims", () => { const source = fs.readFileSync("app/insurance/page.tsx", "utf8") + fs.readFileSync("app/farmers/page.tsx", "utf8"); assert.match(source, /application\/ld\+json/); assert.match(source, /SmartDevices\.com/); assert.doesNotMatch(source, /Organization.*Farmers|partner|endors/i); });
