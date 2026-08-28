import test from "node:test";
import assert from "node:assert/strict";
import sitemap from "../app/sitemap";
import robots from "../app/robots";
import fs from "node:fs";

test("sitemap publishes canonical public carrier routes and omits private/alias routes", () => { const urls = sitemap().map((item) => item.url); assert.ok(urls.includes("https://smartdevices.com/insurance")); assert.ok(urls.includes("https://smartdevices.com/farmers")); assert.equal(urls.some((url) => /\/plans\/|\/pro\/workspace|\/insurance\/farmers/.test(url)), false); assert.equal(new Set(urls).size, urls.length); });
test("robots excludes APIs, plans, Pro workspace, and carrier alias", () => { const value = JSON.stringify(robots()); for (const path of ["/api/", "/plans/", "/pro/workspace", "/insurance/farmers"]) assert.match(value, new RegExp(path.replaceAll("/", "\\/"))); });
test("directory and carrier structured data preserve SmartDevices identity without partnership claims", () => { const source = fs.readFileSync("app/insurance/page.tsx", "utf8") + fs.readFileSync("app/farmers/page.tsx", "utf8"); assert.match(source, /application\/ld\+json/); assert.match(source, /SmartDevices\.com/); assert.doesNotMatch(source, /Organization.*Farmers|partner|endors/i); });
