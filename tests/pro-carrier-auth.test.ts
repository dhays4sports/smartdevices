import test from "node:test";
import assert from "node:assert/strict";
import { authorizeProfessional } from "../app/lib/pro-auth";
import { publicProCarrierData } from "../app/lib/carrier";

const user = { displayName: "Professional", email: "pro@example.test", fullName: "Professional" };
test("production professional authorization fails closed", () => { assert.equal(authorizeProfessional(null, undefined).reason, "UNAUTHENTICATED"); assert.equal(authorizeProfessional(user, undefined).reason, "ROLE_CONFIG_MISSING"); assert.equal(authorizeProfessional(user, "[]").reason, "FORBIDDEN"); });
test("expired and suspended roles remain forbidden", () => { assert.equal(authorizeProfessional(user, JSON.stringify([{ email: user.email, role: "professional", status: "active", expiresAt: "2026-01-01T00:00:00Z" }]), new Date("2026-08-26T00:00:00Z")).reason, "ROLE_EXPIRED"); assert.equal(authorizeProfessional(user, JSON.stringify([{ email: user.email, role: "professional", status: "suspended", expiresAt: "2027-01-01T00:00:00Z" }])).reason, "ROLE_SUSPENDED"); });
test("current active server grant authorizes exact user", () => { assert.equal(authorizeProfessional(user, JSON.stringify([{ email: user.email, role: "professional", status: "active", expiresAt: "2027-01-01T00:00:00Z" }]), new Date("2026-08-26T00:00:00Z")).authorized, true); });
test("client carrier payload contains only current public evidence", () => { const data = publicProCarrierData(); assert.ok(data.carriers.length > 0); assert.ok(data.sources.every((source) => source.visibility === "public" && source.status === "active")); assert.ok(data.rules.every((rule) => rule.visibility === "public" && rule.reviewStatus === "reviewed")); assert.doesNotMatch(JSON.stringify(data), /restrictedReferenceId/); });
