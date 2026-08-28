import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const editorial = fs.readFileSync("docs/ADMIN_EDITORIAL_GUIDE.md", "utf8");
const integration = fs.readFileSync("docs/CARRIER_INTEGRATION_GUIDE.md", "utf8");
const brand = fs.readFileSync("docs/CARRIER_BRAND_GUIDE.md", "utf8");
test("editorial guide covers lifecycle, validation, visual review, and incident correction", () => { for (const term of ["draft/stale/conflicting/withdrawn", "validate:evidence", "mobile and desktop", "Never rewrite", "Incident response"]) assert.match(editorial, new RegExp(term, "i")); });
test("integration guide covers HMAC, replay, rate, consent, authority, and rollback", () => { for (const term of ["HMAC-SHA256", "8 KB", "replay", "rate limit", "suppression", "Field authority", "rollback"]) assert.match(integration, new RegExp(term, "i")); });
test("brand guide requires exact scoped asset authorization", () => { for (const term of ["primary identity", "exact files", "territory", "expiry", "alt text", "revocation", "cache purge"]) assert.match(brand, new RegExp(term, "i")); });
