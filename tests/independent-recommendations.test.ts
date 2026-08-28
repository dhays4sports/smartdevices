import test from "node:test";
import assert from "node:assert/strict";
import { independentRecommendations } from "../app/lib/independent-recommendations";

test("independent recommendations stay small and may be empty", () => { assert.equal(independentRecommendations("gas").length, 0); for (const category of ["water", "security", "connected-home"] as const) assert.ok(independentRecommendations(category).length <= 2); });
test("generic device facts contain no injected Farmers designation", () => { for (const category of ["water", "security", "connected-home"] as const) for (const device of independentRecommendations(category)) assert.doesNotMatch(JSON.stringify(device), /Farmers public offer|Farmers approved|guaranteed discount/i); });
