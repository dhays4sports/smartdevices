import test from "node:test";
import assert from "node:assert/strict";
import { carrierDisplayLabel, carrierDisplayDesignations } from "../app/lib/carrier-contract";

test("carrier-specific positive labels are generated from governed identity", () => { assert.equal(carrierDisplayLabel("carrier-public-offer", "Farmers"), "Farmers public offer"); assert.equal(carrierDisplayLabel("potential-carrier-discount-category", "Farmers"), "Potential Farmers discount category"); assert.equal(carrierDisplayLabel("confirmation-needed", "Any Carrier"), "Confirmation needed"); });
test("seven truth designations remain distinct", () => { assert.equal(new Set(carrierDisplayDesignations).size, 7); assert.notEqual(carrierDisplayLabel("professional-stated-requirement", "Farmers"), carrierDisplayLabel("carrier-public-offer", "Farmers")); assert.notEqual(carrierDisplayLabel("smartdevices-recommended", "Farmers"), carrierDisplayLabel("potential-carrier-discount-category", "Farmers")); });
