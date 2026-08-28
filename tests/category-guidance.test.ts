import test from "node:test";
import assert from "node:assert/strict";
import { categoryGuides, getCategoryGuide } from "../app/lib/category-guidance";

test("gas guidance cannot classify detectors, tools, or utility procedures as automatic shutoff", () => { const text = JSON.stringify(getCategoryGuide("gas")); assert.match(text, /not the same/i); assert.match(text, /Do not install/i); assert.match(text, /building department/i); });
test("fire and security guidance separates local, app, monitored, dispatch, and sprinklers", () => { const text = JSON.stringify(getCategoryGuide("security")); for (const term of ["Local alert", "Remote app", "Professional monitoring", "Dispatch linkage", "Sprinklers"]) assert.match(text, new RegExp(term, "i")); assert.match(text, /does not establish discount eligibility/i); });
test("connected-home guide covers dependencies, outages, account security, and privacy", () => { const text = JSON.stringify(getCategoryGuide("connected-home")); for (const term of ["hubs", "cloud", "subscription", "outage", "retention", "account recovery"]) assert.match(text, new RegExp(term, "i")); assert.match(text, /separate from carrier eligibility/i); });
test("all four carrier categories have useful class guidance", () => { assert.deepEqual(Object.keys(categoryGuides).sort(), ["connected-home", "gas", "security", "water"]); for (const guide of Object.values(categoryGuides)) assert.ok(guide.distinctions.length >= 3 && guide.questions.length >= 3 && guide.boundaries.length >= 2); });
