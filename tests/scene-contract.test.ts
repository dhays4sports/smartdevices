import assert from "node:assert/strict";
import test from "node:test";
import { sceneZones } from "../app/components/InteractiveScene";
import { getDomain } from "../app/lib/data";
import fs from "node:fs";

test("scene zones preserve complete text-control parity", () => {
  for (const domainId of ["home", "vehicle"] as const) {
    const domain = getDomain(domainId)!;
    const zones = sceneZones(domain);
    assert.deepEqual(zones.map((zone) => zone.id), domain.concerns.map((concern) => concern.id));
    assert.ok(zones.every((zone) => zone.label && Number.isFinite(zone.x) && Number.isFinite(zone.y)));
  }
});

test("exactly three launch demonstrations are attached to supported concerns", () => {
  const demonstrations = ["home", "vehicle"].flatMap((id) => sceneZones(getDomain(id)!)).filter((zone) => zone.demonstration);
  assert.deepEqual(demonstrations.map((zone) => zone.demonstration).sort(), ["smoke-heat", "vehicle-tracking", "water"]);
});

test("Home property exposes all launch zones and only supported demos", () => {
  const zones = sceneZones(getDomain("home")!);
  assert.deepEqual(zones.map((zone) => zone.id), ["water", "fire-electrical", "security", "vacant-monitoring", "garage-access", "home-temperature"]);
  assert.equal(zones.find((zone) => zone.id === "water")?.demonstration, "water");
  assert.equal(zones.find((zone) => zone.id === "fire-electrical")?.demonstration, "smoke-heat");
  assert.ok(zones.filter((zone) => zone.demonstration).length === 2);
});

test("Vehicle environment exposes factual zones without diagnosis claims", () => {
  const zones = sceneZones(getDomain("vehicle")!);
  assert.deepEqual(zones.map((zone) => zone.id), ["dashcam", "theft", "teen-driver", "diagnostics", "tires", "emergency", "ev-charging"]);
  assert.equal(zones.find((zone) => zone.id === "theft")?.demonstration, "vehicle-tracking");
  assert.equal(zones.filter((zone) => zone.demonstration).length, 1);
  assert.doesNotMatch(getDomain("vehicle")!.description, /diagnos(?:e|is) your vehicle/i);
});

test("scene keeps static and direct-route fallbacks", () => {
  const source = fs.readFileSync(new URL("../app/components/InteractiveScene.tsx", import.meta.url), "utf8");
  assert.match(source, /Scene image unavailable/);
  assert.match(source, /href={`\/protect\/\$\{domain\.id\}\?concern=/);
  assert.match(source, /scene-list/);
});
