# SmartDevices v5.3.0-rc.1 — Ecosystem Reconciliation 1.0

This release reconciles the materially newer SmartDevices v5.2 SD-BB-0 source with the ecosystem North Star without rebuilding mature product surfaces.

## Added / generalized

- canonical Smart Device Object and progressive trust ladder;
- normalized capability registry and machine-readable capability/device endpoints;
- capability-aware Discover search/detail records;
- bounded authenticated `/connect` device registration;
- explicit claim/integration persistence separated from registration;
- fail-closed device adapter contract and secret-key rejection;
- DeviceProject schema v4 with normalized required capabilities and schema-v3 read compatibility;
- additive migration `0007_device_registry_foundation.sql`;
- reconciled device.eth/deviceregistry.org contracts and ecosystem roadmap.

## Preserved

`/farmers`, insurance evidence boundaries, Protect, plans, Pro, Builder v5.2 research/sourcing/execution architecture, accessibility, responsive behavior, SEO, security/privacy and disabled-by-default external adapters remain in place.

## Deliberately deferred

No manufacturer integration, live device reachability/control, device ownership verification, Mesh runtime activation, device.eth activation, deviceregistry.org production deployment, physical hardware certification or real-money transaction is claimed or enabled by this release.

For verification and exact status see `docs/ECOSYSTEM_RECONCILIATION_RELEASE_NOTES.md` and `docs/ECOSYSTEM_RECONCILIATION_VERIFICATION.md`.

---

## Historical v5.2 release notes

This release advances the v5.1 Intelligent Device Platform from deterministic planning toward a real device-project execution loop while preserving `/farmers` as a separate carrier-specific truth surface.

## Added

- DeviceProject schema v3 with orchestrator, research, sourcing, execution and hosted-state records.
- Optional model-assisted requirements orchestration with deterministic fallback.
- Optional live web research and explicit buy/adapt/build decision records.
- Authenticated hosted Builder projects using existing D1 `builder_projects` / `builder_revisions` tables.
- `/project/<id>` hosted workspace URLs.
- Optional live sourcing adapter.
- Sandboxed Build Executor contract for actual firmware compilation and CadQuery generation.
- Validation states that only become `pass` from recorded execution results.
- Expanded Build Pack with requirements, research, sourcing and execution evidence.
- Connected Freezer Guardian and Mesh-native Restaurant Freezer Fleet reference paths.

## Unchanged boundary

A SmartDevices custom build — including a Mesh-native one — does not establish insurer acceptance or satisfy a Farmers requirement unless that qualification is supported by separate authoritative carrier evidence.

## 2026-09-17 documentation addendum — SD-001 physical proof program

The accepted next execution program is now part of the repository documentation:

- `SD-001 — First Physical Proof`: build a real Connected Freezer Guardian from SmartDevices-generated artifacts and capture predicted-versus-actual build evidence.
- `MESH-DEVICE-001 — First Physical Node`: derive a multi-device restaurant freezer fleet from the proven design and exercise persistent identity/capabilities/authorized agent interaction through the Mesh runtime when available.
- Scope expansion into marketplace, generalized manufacturing and speculative network features is intentionally sequenced after those proof gates.

This addendum changes roadmap/documentation only; it does not claim additional runtime capability beyond v5.2.0-rc.1.

## 2026-10-02 documentation addendum — SD-BB-0 Business Builder conformance

SmartDevices has now been evaluated as a first-party business under the Mesh Business Builder constitution. The result is **REDESIGN — continue** rather than unconditional GO or NO-GO.

The addendum:

- narrows the first paying wedge to bounded monitoring/sensing needs for small commercial/property operators and technically capable solution buyers without in-house hardware engineering;
- defines the first paid unit as a **Validated Build Pack** rather than a mandatory subscription or marketplace transaction;
- defines the **SmartDevices Build Evidence Graph** as the durable asset rather than generic AI-generated code/CAD/PCB output;
- makes owner intervention, intervention rate, autonomous gross-profit efficiency and per-build economics required business metrics;
- reclassifies `SD-001` as the **BB7 Build & Verify technical proof**, not MVB revenue;
- inserts `SD-MVB-001` and a real external paid/committed customer loop before MVB;
- moves `MESH-DEVICE-001` out of the MVB-blocking critical path;
- retains Mesh as optional at the device level and as governed infrastructure where identity, permissions, capability discovery, routing, receipts, monitoring or recovery create real value.

This addendum changes business sequencing/documentation only. It does not add runtime capability or change the v5.2.0-rc.1 version.
## SD-MKT-0.1 — Market Publisher Foundation
- Added a fail-closed Market.ad adapter boundary without modifying SmartDevices qualification/recommendation logic.
- Added anonymous commercial-intent, provider-offer, disclosure, and outcome contracts.
- Added market event vocabulary and reusable commercial-options/disclosure UI components.
- Added regression tests enforcing recommendation independence and eligible-device-only commercial offers.
- Live Market.ad activation and live-money settlement remain disabled.

## SD-MKT-0.2 — Shadow Market (2026-09-22)
- Added server-only signed MARKET-0.7 publisher integration for the Home → Water → Automatic Shutoff pilot.
- Added `/api/market/shadow`, disabled by default and fail-closed.
- Added post-qualification shadow submission from `ProtectionExplorer`; no Market.ad logic enters `scan.ts`.
- Added strict anonymous intent boundary with no direct provider contact or personal-data sharing.
- Added MARKET-0.7 request signing (method/path/timestamp/nonce/canonical-body hash) and idempotent opportunity creation.
- Added shadow clearing lineage: opportunity ID, allocation ID, signed allocation receipt ID, provider ID, clearing amount, and evaluated bid states.
- Added 5 new shadow-market contract tests; cumulative Market publisher contract suite is 10/10 passing.
- Live local MARKET-0.7 interoperability test passed; an incompatible $1,000 bid was rejected before economic ranking.
- Consumer-visible recommendations and ordering remain unchanged; shadow results are not rendered.

## SD-MKT-0.3 — Shadow Market Observability

- Added append-only `market_shadow_runs` persistence and migration `0007_market_shadow_observability.sql`.
- Added operator-only `/api/admin/market` metrics endpoint and `/admin/market` dashboard.
- Tracks shadow fill/no-fill/error rate, clearing-price history, provider/bid rejection reasons, allocation receipt lineage, and SmartDevices qualified recommendation IDs versus the would-be sponsored provider.
- Does not persist raw scan answers, direct identifiers, or contact details.
- Observability persistence is non-blocking and does not change the consumer-visible recommendation path.
- Added source-contract tests protecting the market/recommendation boundary.

## SD-MKT-0.4 — Offer Identity & Fulfillment Mapping

- Added canonical `smartdevices.market.fulfillment/1` provider bid offer contract.
- Added exact winning bid/provider/device fulfillment resolver; no inference from provider identity, name, URL, or marketing copy.
- Requires mapped device to already exist in the SmartDevices-qualified device set.
- Added deterministic SHA-256 offer payload and allocation-binding hashes.
- Added append-only `market_offer_identity_receipts` persistence and migration `0008_market_offer_identity.sql`.
- Added mapped/unmapped/rejected offer-identity metrics and operator dashboard fields.
- Added 7 offer-identity contract tests; cumulative Market publisher source-contract suite is 22/22 passing.
- MARKET-0.7 interoperability check passed with a canonical `moen-flo-shutoff` winning offer; an incompatible $1,000 bidder remained ineligible.
- Consumer-visible sponsorship remains disabled.

## SD-MKT-0.5 — Sponsored Fulfillment Preview
- Added preview-only `CommercialOptions` consumer-shaped UI after the independent recommendation surface.
- Added canonical shadow-result -> sponsored preview translation.
- Added dual activation gate: server preview flag + explicit `marketPreview=1` URL request.
- Hardened ordinary shadow responses so provider/allocation detail is no longer returned to the browser.
- Preview renders only for a canonically mapped offer whose device remains in the current SmartDevices-qualified set.
- Added accessible sponsorship disclosure: payment did not determine qualification; payment did influence placement.

## SD-MKT-0.6 — Preview Certification & Real Provider Pilot
- Added an explicit real-provider pilot registry, beginning with Moen manufacturer-direct fulfillment for `moen-flo-shutoff`.
- Added HTTPS + destination-host allowlisting and provider/device binding.
- Added editorial-status and current-availability gates before any real provider can appear in sponsored preview.
- Current Moen pilot remains `observe-only` because the SmartDevices catalog currently records the reviewed product as unavailable.
- Added a dedicated real-provider feature flag, disabled by default.
- Added source-level accessibility/disclosure certification assertions.
- Market source-contract suite passes 32/32.
- Full dependency install/build/browser certification remains pending because `npm ci` did not complete in the available execution environment.

## SD-MKT-0.7 — Live Fulfillment Verification
- Added manufacturer-source provider verification records with freshness, availability, purchase-signal and price gates.
- Added Phyn Plus (2nd Gen) as the first current manufacturer-direct `preview-eligible` fulfillment source after a Sep. 22, 2026 verification at $579.99 with Add to cart available.
- Kept Moen Flo `observe-only` because its current reviewed manufacturer page remains sold out.
- Added append-only `market_provider_verification_receipts` via migration 0009 and operator metrics for verified/stale/unavailable fulfillment.
- Public Market.ad sponsorship remains disabled; this release does not assert any commercial relationship with the named manufacturers.


## SD-MKT-0.7.1 — Carrier-Program Fulfillment (2026-09-22)

- Added `carrier-program` as a canonical fulfillment type.
- Added explicit program context to commercial intent without changing scan/recommendation logic.
- Added `moen-farmers-program` for the official `moen.com/farmers` channel.
- Recorded two user-verified Farmers-program variants: $445 device-only and $745 with standard installation included.
- Kept generic `moen-direct` observe-only; channel availability no longer mutates generic catalog availability.
- Carrier-program preview requires exact carrier/program context and canonical Market.ad offer metadata.
- Public sponsorship remains disabled.

## SD-MKT-0.8 — Preview Transaction & Outcome Attribution (2026-09-22)

- Added preview-only signed attribution transactions with a 30-minute HMAC-SHA256 token.
- Bound attribution to intent, opportunity, allocation, allocation receipt, offer-identity receipt, provider-verification receipt, offer, provider, device and destination.
- Added `/api/market/outcome` for verified preview outcome capture.
- Added append-only `market_outcome_attributions` via migration `0010_market_outcome_attribution.sql`.
- Added idempotent `sponsored-offer-viewed` and `sponsored-offer-opened` capture; no purchase or installation is inferred.
- Outbound preview navigation now fails closed when attribution signing is not configured.
- Added operator metrics for preview views, opens and open rate with receipt lineage.
- Corrected persisted carrier-program verification so operator receipts evaluate the same program-aware offer as the preview gate.
- Cumulative Market-specific source-contract suite passes 50/50.
- Public sponsorship remains disabled.

## SD-MKT-0.9 — Controlled Conversion Proof (2026-09-22)

- Added purpose-separated preview conversion tokens; click attribution tokens cannot be reused for conversion confirmation.
- Added explicit user-confirmed `purchase` and `installation` events, permanently marked `self-reported`.
- Added optional HMAC-SHA256 provider callbacks, disabled by default, with five-minute timestamp bounds and persisted nonce replay protection.
- Provider callbacks must match the provider already bound to the attributed preview transaction before a conversion can be marked `provider-verified`.
- Added append-only `market_conversion_receipts` and `market_provider_callback_nonces` via migration `0011_market_conversion_proof.sql`.
- Conversion receipts bind transaction, intent, opportunity, allocation, allocation receipt, offer-identity receipt, provider-verification receipt, offer, provider, device, event, source and occurrence time with a deterministic SHA-256 binding hash.
- Provider order/reference identifiers are stored only as hashes.
- Click/open events remain distinct from purchase/installation; no conversion is inferred from navigation.
- Added conversion evidence to the operator Market surface while preserving recommendation independence.
- Cumulative Market-specific source-contract suite passes 57/57.
- Public sponsorship, live settlement and provider callback activation remain disabled.
