import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const logo = fs.readFileSync("app/components/SmartDevicesLogo.tsx", "utf8");
const header = fs.readFileSync("app/components/SiteHeader.tsx", "utf8");
const footer = fs.readFileSync("app/components/SiteFooter.tsx", "utf8");
const mark = fs.readFileSync("public/smartdevices-mark.svg", "utf8");
const favicon = fs.readFileSync("public/favicon.svg", "utf8");
const darkLockup = fs.readFileSync("public/smartdevices-logo-on-dark.svg", "utf8");
const lightLockup = fs.readFileSync("public/smartdevices-logo-on-light.svg", "utf8");

test("the SmartDevices identity has a compact vector mark and complete wordmark", () => {
  assert.match(logo, /viewBox="0 0 40 40"/);
  assert.match(logo, /SmartDevices/);
  assert.match(logo, /brand-domain/);
  assert.doesNotMatch(mark, /<text|>SD</);
});

test("header and footer use one accessible identity component", () => {
  assert.match(header, /<SmartDevicesLogo \/>/);
  assert.match(footer, /SmartDevicesLogo/);
  assert.match(header, /aria-label="SmartDevices\.com home"/);
  assert.match(footer, /aria-label="SmartDevices\.com home"/);
});

test("the standalone mark and favicon share the same silhouette", () => {
  const pathPattern = /M28 11\.5c-1\.9-2\.2/;
  assert.match(mark, pathPattern);
  assert.match(favicon, pathPattern);
  assert.match(mark, /#D8FA73/);
  assert.match(darkLockup, /SmartDevices/);
  assert.match(lightLockup, /SmartDevices/);
});
