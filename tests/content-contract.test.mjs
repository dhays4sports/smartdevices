import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const catalog = JSON.parse(await readFile(new URL("../content/catalog.json", import.meta.url), "utf8"));
const domains = JSON.parse(await readFile(new URL("../content/domains.json", import.meta.url), "utf8"));

test("domain and concern identifiers are unique and complete", () => {
  assert.deepEqual(domains.map((item) => item.id), ["home", "vehicle", "family", "business"]);
  const concerns = domains.flatMap((domain) => domain.concerns.map((concern) => `${domain.id}:${concern.id}`));
  assert.equal(new Set(concerns).size, concerns.length);
  for (const domain of domains) {
    assert.ok(domain.headline && domain.description && domain.scene.startsWith("/assets/"));
    for (const concern of domain.concerns) {
      assert.equal(concern.stages.length, 3);
      assert.ok(concern.position.x >= 0 && concern.position.x <= 100);
      assert.ok(concern.position.y >= 0 && concern.position.y <= 100);
    }
  }
});

test("seed catalog is small, traceable, and publishable", () => {
  assert.ok(catalog.length >= 10 && catalog.length <= 20);
  assert.equal(new Set(catalog.map((item) => item.id)).size, catalog.length);
  assert.equal(new Set(catalog.map((item) => item.slug)).size, catalog.length);
  for (const device of catalog) {
    assert.equal(device.status, "active");
    assert.match(device.lastReviewed, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(Date.parse(`${device.lastReviewed}T00:00:00Z`) <= Date.now());
    assert.ok(device.sources.length >= 1);
    for (const source of device.sources) assert.match(source.url, /^https:\/\//);
    for (const field of ["summary", "bestFor", "priceBand", "installation", "subscription", "connectivity", "monitoring", "insuranceNote"]) assert.ok(typeof device[field] === "string" && device[field].trim().length > 5, `${device.id}.${field}`);
    assert.ok(device.capabilities.length >= 2);
    assert.ok(device.limitations.length >= 2);
    assert.doesNotMatch(JSON.stringify(device), /lorem ipsum|example\.com|placeholder endpoint|guaranteed discount/i);
  }
});

test("catalog supports both full launch domains without forcing three records per concern", () => {
  assert.ok(catalog.some((item) => item.domains.includes("home")));
  assert.ok(catalog.some((item) => item.domains.includes("vehicle")));
  const supported = new Set(catalog.flatMap((item) => item.concerns));
  assert.ok(supported.has("water") && supported.has("dashcam"));
});
