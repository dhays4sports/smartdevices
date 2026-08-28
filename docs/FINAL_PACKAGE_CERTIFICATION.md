# SD42-CERT-10.5 Final Package Certification

Date: 2026-08-26 UTC

Result: **PASS LOCALLY — EXTERNAL GO-LIVE NOT READY OR AUTHORIZED**

## Immutable release set

- `SmartDevices_v4.2.0_rc1_SD42-CERT-10.5_SOURCE.zip`
- `SmartDevices_v4.2.0_rc1_SD42-CERT-10.5_ROOT_DEPLOYABLE.zip`
- `SmartDevices_v4.2.0_rc1_SHA256SUMS.txt`

Both archives put `package.json` and generated `RELEASE_PROVENANCE.txt` at their root, not in a wrapper. Neither contains dependencies, Git metadata, `.next`, `.wrangler`, `.sites-runtime`, local environment, temporary databases, logs, secrets, or another ZIP. The root-deployable package adds only the production `dist/` emitted by the exact source-package extraction. The sibling checksum file is authoritative because embedding an archive's own digest would change that digest.

## Exact source-package gate

1. Extracted the immutable named SOURCE ZIP into a new empty directory and verified compression integrity, root entries, provenance, and exclusions.
2. Completed a lockfile-driven `npm ci` using the preserved cache/registry contract; 520 packages installed.
3. Passed `npm run validate:evidence`, TypeScript, and ESLint.
4. Applied migrations `0000` through additive `0003` to a fresh SQLite-compatible database; the exact 13-table inventory and `plan_verification_events` indexes passed.
5. Completed the five-stage Vinext production build and the published route inventory.
6. Passed 70 JavaScript and 115 TypeScript tests: **185/185**. The suite covers schema, evidence, applicability, scans, water/class guides, plans v1/v2/v3, Pro authorization/templates/preview/engagement, handoffs v1/v2/v3, accessibility/resilience/security, direct routes, and release documentation.
7. Passed `npm audit --omit=dev` with zero known production vulnerabilities. The separately disclosed development/build advisories remain an external toolchain-maintenance item.
8. Found zero selected private-key/API-token patterns in authored and built output, validated content/evidence, and reverified both protected SVG hashes byte-for-byte.

## Exact root-deployable gate

1. Built the root package from a fresh extraction of the exact SOURCE ZIP by adding only the `dist/` emitted by the passed source run, then extracted the immutable root ZIP into another empty directory.
2. Verified compression integrity, root layout, provenance, exclusions, and `dist/server/index.js`.
3. Completed a second lockfile-driven install, TypeScript, and ESLint.
4. Ran the packaged built-runtime/direct-route/degraded-mode suites without rebuilding the packaged `dist/`. Homepage, insurance directory, canonical Farmers and sanitized alias routes, plan states, production-locked Pro, invalid input, handoff rejection, unavailable storage/provider, and security headers passed.
5. Verified the sibling SHA-256 manifest against both immutable archives.

## Provenance and traceability

The generated root provenance record names the exact final source commit, mutable v4.1 baseline digest, protected historical boundary, build/package method, and sibling checksum authority. Every sprint has a source checkpoint in `V4.2_CHECKPOINT_LEDGER.md`; test/harness failures and corrections remain append-only in `NORMALIZED_REGRESSION_HISTORY.md`.

## Certification boundary

This is a local engineering production candidate. It does not claim public deployment, hosted D1/identity/provider activation, live partner/message/upload activity, Farmers approval/endorsement/eligibility, physical iOS/Android/Edge/Firefox/tablet or named-AT evidence, representative Core Web Vitals, external penetration testing, brand authorization, or legal/operational sign-off. Exact owners and executable activation/retest instructions are in the external-activation, browser/device, accessibility, performance, security/privacy, integration, deployment, and cutover documents.
