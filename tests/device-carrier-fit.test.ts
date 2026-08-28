import test from "node:test";
import assert from "node:assert/strict";
import { deviceFitForCapability, fitCanSupportPositiveTechnicalLabel } from "../app/lib/carrier";

test("point leak detection cannot satisfy automatic whole-home shutoff", () => {
  assert.equal(deviceFitForCapability("kidde-water-freeze", "automatic-main-water-shutoff"), undefined);
  assert.equal(fitCanSupportPositiveTechnicalLabel(deviceFitForCapability("kidde-water-freeze", "point-water-detection")), false);
});

test("manufacturer-supported shutoff capability remains separate from public offer", () => {
  const phyn = deviceFitForCapability("phyn-plus-v2", "automatic-main-water-shutoff");
  const moen = deviceFitForCapability("moen-flo-shutoff", "automatic-main-water-shutoff");
  assert.equal(phyn?.fit, "technical-class-match");
  assert.equal(moen?.fit, "explicitly-named-public-offer");
  assert.equal(fitCanSupportPositiveTechnicalLabel(phyn), true);
  assert.equal(fitCanSupportPositiveTechnicalLabel(moen), true);
});

test("monitoring fit cannot be inferred for unreviewed consumer alarms", () => {
  assert.equal(deviceFitForCapability("kidde-smart-smoke-co", "professionally-monitored-fire-security"), undefined);
  assert.equal(deviceFitForCapability("simplisafe-system", "professionally-monitored-fire-security")?.fit, "technical-class-match");
});
