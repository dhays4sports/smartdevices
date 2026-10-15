# SD-MKT-0.2 Validation — Shadow Market

Date: 2026-09-22
Baseline: SmartDevices v5.2.0 RC1 + SD-MKT-0.1 Market Publisher Foundation
Target: MARKET-0.7 runtime

## Static/contract suite
`node --test tests/market-foundation-contract.test.mjs tests/market-shadow-contract.test.mjs`

Result: 10/10 passing.

Validated invariants:
- Market.ad remains absent from `app/lib/scan.ts`.
- Shadow submission happens only after a `ScanResult` exists.
- Shadow mode is disabled by default.
- MARKET-0.7 publisher signing material remains server-only.
- Pilot is limited to Home / Water / Automatic Shutoff.
- Direct provider contact and personal-data sharing remain forbidden.
- Signed requests bind method, path, timestamp, nonce, and canonical body hash.
- Shadow failures are non-blocking and never alter recommendations.
- Shadow clearing data is explicitly marked non-consumer-visible.

## Live local MARKET-0.7 interoperability test
A local MARKET-0.7 runtime was started with:
- market: `ca-water-shutoff`
- publisher identity: `smartdevices-shadow`
- two qualified automatic-water-shutoff providers
- one incompatible roofing provider with a $1,000 max bid

The exact `runMarket07Shadow()` implementation from `app/lib/market/runtime07.ts` was imported with Node's type-stripping support and used to make the signed publisher request.

Observed result:
- opportunity created and persisted
- opportunity cleared
- qualified provider `aquaguard` selected
- clearing amount: `7.183484 USD`
- signed allocation receipt returned
- incompatible `bigbid` $1,000 bidder rejected with `capability_mismatch`

This verifies protocol compatibility with MARKET-0.7's signed publisher boundary and preserves the Market.ad doctrine that payment cannot purchase qualification.

## Consumer visibility
The SmartDevices route returns `visibleToConsumer: false`, and `ProtectionExplorer` does not store or render the shadow result. The underlying `ScanResult` remains the sole source for the visible recommendation set.

## Remaining release gate
This source-root release intentionally excludes `node_modules`. A clean dependency install followed by the repository's full `npm run typecheck`, `npm run build`, and complete test suite remains required before production activation.

Production activation additionally requires explicit approval of the anonymous shadow-telemetry privacy/consent treatment and registration of the real Market.ad publisher identity/credentials. The feature remains fail-closed by default.
