import assert from "node:assert/strict";
import test from "node:test";
import { authorizeEvidenceAdmin, timingSafeTokenMatch } from "../app/lib/evidence-admin-auth";
import {
  applySafeRefresh,
  checkEvidenceSource,
  createSeedEvidenceBundle,
  hashEvidenceText,
  isAllowedEvidenceUrl,
  normalizeSourceText,
  summarizeEvidenceChecks,
} from "../app/lib/evidence-refresh";

const source = createSeedEvidenceBundle().sources[0];
const longBody = `<html><body><main>${"Official manufacturer or carrier evidence. ".repeat(8)}</main></body></html>`;

test("source retrieval is restricted to the governed HTTPS domain", () => {
  assert.equal(isAllowedEvidenceUrl(source), true);
  assert.equal(isAllowedEvidenceUrl(source, "http://www.farmers.com/example"), false);
  assert.equal(isAllowedEvidenceUrl(source, "https://farmers.com.evil.example/evidence"), false);
  assert.equal(isAllowedEvidenceUrl(source, "https://user:pass@farmers.com/evidence"), false);
});

test("normalization removes active and cosmetic markup before hashing", () => {
  const normalized = normalizeSourceText(`<style>.offer{display:none}</style><script>steal()</script><main>Current &amp; reviewed offer</main>`);
  assert.equal(normalized, "Current & reviewed offer");
});

test("first observation captures a review-gated baseline", async () => {
  const check = await checkEvidenceSource(source, null, async () => new Response(longBody, { status: 200, headers: { "content-type": "text/html" } }), new Date("2026-08-28T12:00:00Z"));
  assert.equal(check.outcome, "baseline");
  assert.equal(check.nextAction, "review");
  assert.ok(check.observedHash);
});

test("an identical normalized source is automatically renewable", async () => {
  const prior = await hashEvidenceText(normalizeSourceText(longBody));
  const check = await checkEvidenceSource(source, prior, async () => new Response(longBody, { status: 200, headers: { "content-type": "text/html" } }), new Date("2026-08-28T12:00:00Z"));
  assert.equal(check.outcome, "confirmed");
  assert.equal(check.nextAction, "renew");
  assert.equal(check.changeClass, "none");
});

test("carrier content changes never auto-publish stronger guidance", async () => {
  const check = await checkEvidenceSource(source, "0".repeat(64), async () => new Response(longBody, { status: 200, headers: { "content-type": "text/html" } }), new Date("2026-08-28T12:00:00Z"));
  assert.equal(check.outcome, "changed");
  assert.equal(check.changeClass, "carrier-material");
  assert.equal(check.nextAction, "review");
});

test("unavailable and oversized sources fail conservatively", async () => {
  const unavailable = await checkEvidenceSource(source, null, async () => new Response("no", { status: 503, headers: { "content-type": "text/html" } }));
  assert.equal(unavailable.outcome, "unavailable");
  assert.equal(unavailable.nextAction, "hold-and-expire");
  const oversized = await checkEvidenceSource(source, null, async () => new Response(longBody, { status: 200, headers: { "content-type": "text/html", "content-length": "1000001" } }));
  assert.equal(oversized.outcome, "invalid");
  assert.equal(oversized.nextAction, "reject");
});

test("safe refresh renews only confirmed sources and stales expired dependencies", () => {
  const bundle = createSeedEvidenceBundle("2026-08-26T00:00:00.000Z");
  const checks = bundle.sources.map((item, index) => ({
    sourceId: item.id, sourceVersion: item.version, sourceUrl: item.url ?? "", previousHash: "a", observedHash: index === 0 ? "a" : null,
    httpStatus: index === 0 ? 200 : 503, outcome: index === 0 ? "confirmed" as const : "unavailable" as const,
    changeClass: index === 0 ? "none" as const : "source-failure" as const, errorCode: index === 0 ? null : "SOURCE_HTTP_503", checkedAt: "2026-12-01T00:00:00.000Z",
    nextAction: index === 0 ? "renew" as const : "hold-and-expire" as const,
  }));
  const refreshed = applySafeRefresh(bundle, checks, "2026-12-01");
  assert.equal(refreshed.sources[0].status, "active");
  assert.equal(refreshed.sources[0].checkedDate, "2026-12-01");
  assert.ok(refreshed.sources.slice(1).every((item) => item.status === "stale"));
  assert.ok(refreshed.rules.some((item) => item.status === "stale"));
  const summary = summarizeEvidenceChecks(checks);
  assert.equal(summary.autoRenewable, 1);
  assert.equal(summary.unavailable, checks.length - 1);
});

test("evidence admin grants are server-side, expiring, and role-specific", () => {
  const user = { email: "admin@example.com", displayName: "Admin", fullName: "Admin" };
  const grants = JSON.stringify([{ email: "admin@example.com", role: "evidence-admin", status: "active", expiresAt: "2027-01-01T00:00:00Z" }]);
  assert.deepEqual(authorizeEvidenceAdmin(user, grants, new Date("2026-08-28T00:00:00Z")), { authorized: true, reason: "AUTHORIZED" });
  assert.equal(authorizeEvidenceAdmin(user, grants, new Date("2027-01-02T00:00:00Z")).reason, "ROLE_EXPIRED");
  assert.equal(authorizeEvidenceAdmin(null, grants).reason, "UNAUTHENTICATED");
});

test("scheduler token comparison does not short-circuit matching values", () => {
  assert.equal(timingSafeTokenMatch("correct-token", "correct-token"), true);
  assert.equal(timingSafeTokenMatch("wrong--token", "correct-token"), false);
  assert.equal(timingSafeTokenMatch(null, "correct-token"), false);
});
