import test from "node:test";
import assert from "node:assert/strict";
import { assessConnectedHome } from "../app/lib/connected-home";

test("offline and cloud-dependent behavior stays explicit", () => { const result = assessConnectedHome({ localControl: true, cloudRequired: true, subscriptionRequired: false, ecosystemSupported: true, evidenceCurrent: true }); assert.match(result.capabilities.join(" "), /local-control/i); assert.match(result.capabilities.join(" "), /outage/i); assert.equal(result.carrierEligible, false); });
test("stale integration and unsupported ecosystem preserve unknowns", () => { const result = assessConnectedHome({ ecosystemSupported: false, evidenceCurrent: false }); assert.match(result.unknowns.join(" "), /unsupported/i); assert.match(result.unknowns.join(" "), /stale/i); assert.equal(result.carrierEligible, false); });
