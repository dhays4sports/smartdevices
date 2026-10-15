# CoverageFit + SmartDevices: protection recommendations

CoverageFit 3.20.229 / SmartDevices 4.6.0-rc.1 · 2026-09-06. This expands the existing closing bridge. The packages are local release candidates; no site, provider, scheduler or messaging service was deployed or activated.

## Daily producer use

Open **Manage protection recommendations** from the recommendation editor, or `/agent/protection-recommendations/`. Use the existing producer access credential. The page contains eight starting setups:

| Protection | Choices | Action |
|---|---|---|
| Water shutoff | Flo by Moen only | `https://www.moen.com/farmers` |
| Professionally monitored burglary | ADT, SimpliSafe, Ring | Official provider and monitoring pages |
| Professionally monitored fire detection | ADT, SimpliSafe, Ring | Official fire/system and monitoring pages |
| Earthquake gas shutoff | Little Firefighter | Manufacturer information, CSLB contractor discovery and license verification |

Review a setup's equipment, required professional monitoring, official links and documentation guidance. You can edit the name, exact official product/configuration link, monitoring link, guidance and review dates. Links must use the supported provider's exact HTTPS domains. For burglary, fire and gas, **Save as another configuration** creates an additional setup for that provider and category. Water keeps one Flo recommendation and the requested Farmers URL. This is a maintained shortlist, not a model compatibility or insurer eligibility database.

Saving creates an owner-scoped version in the existing CoverageFit database. No repository replacement is needed for subsequent setup/link edits. Historical versions remain stored. Review dates expire within 90 days; expired or retired setups cannot be prepared as current recommendations. A successful link check does not extend the dates. The initial records document category-level guidance; confirm the precise equipment, monitoring service and case-specific applicability before selecting them for a customer.

In the client recommendation editor, choose only the protection categories that apply to the relevant California residential component policy. Select a saved setup for each, choose the classification, write the next action, record any required private case source and documented due date, then explicitly confirm the task and reverify the policy. An optional recommendation has no binding deadline. A post-binding condition needs a documented date. Do not use these California residential setups for another state or a business policy.

Burglary and fire remain separate tasks even if the provider is the same. **Also recommend [provider] for fire monitoring** adds that task explicitly. The client sees a coordinated-quote note so two displayed protections are not represented as two required subscriptions. Exact equipment, monitoring activation, permits, availability and any shared charge need provider confirmation.

Use **Reload saved recommendations** after editing the setup library. A changed setup version requires selection and confirmation before preparing a new review. Updating the library does not silently rewrite an already sent email or approved review. Current client guidance checks the saved version against the live library and suppresses positive provider links if it changed or needs review.

## What the client sees

The approved email and the correct component policy's review contain only selected protection steps, their reason, next action and official links. The main insurance proceed/reply/appointment flow remains available. The policy can have no protection tasks. For FAIR Plan/DIC or other component combinations, attach each task to the actual component to which your instruction applies.

An explicit preview explains the limited context shared with SmartDevices. One launch opens that policy's selected checklist, with the clicked category active. A clear official link or licensed-installer search is followed by an optional status update. The house illustration is collapsed supporting guidance; every action is available in the ordered checklist.

Clients can report an existing system, purchase, scheduled installation, installation, active professional monitoring, documentation ready, or request help. Monitoring states are available only for burglary/fire. Every saved update requires purpose-specific consent and is customer-reported. A page view never creates purchase intent. Professional installation and professional monitoring are separate services. Local/app alerts alone do not establish professional monitoring.

Updates return to the same recommendation revision, option, component policy and category. The producer queue prioritizes clients who already requested to proceed. Recording a professional review clears only that category's latest unreviewed update; it does not bind coverage, approve the product or clear an underwriting condition. A new customer update requires a new review. This queue tracks reported updates, not every outstanding obligation.

For gas, the selected manufacturer family is earthquake/seismic activated. It does not establish satisfaction of a different gas-leak, excess-flow or other shutoff requirement. The customer uses CSLB's public search, then verifies the selected contractor's license. A qualified installer must confirm the appropriate classification/scope, valve model, size, orientation, permits and local requirements before purchase. No contractor is endorsed, booked or automatically verified by these links. No DIY gas instructions are provided.

## One-time installation

1. Use each updated root package for its existing app. Preserve the deployed bindings, domains, secrets and access settings. CoverageFit contains source/static assets and Pages Functions at the root; SmartDevices also includes its verified `dist` output. Do not nest the ZIPs in the repositories.
2. Back up CoverageFit's existing D1 database and use its existing migration history to apply `migrations/0010_cf_protection_recommendations.sql` after `0009_cf_device_bridge.sql`. Do not rerun applied migrations. The new migration adds five tables: versioned presets, scoped sessions, per-category updates, professional reviews and link-check history. It changes no older tables. SmartDevices adds no migration.
3. Keep the existing producer authentication and both bridge configurations from `CF_SMARTDEVICES_CLOSING_ACTIVATION.md`. CoverageFit needs `COVERAGEFIT_SMARTDEVICES_ENABLED=true`, exact `SMARTDEVICES_ORIGIN`, and the shared `SMARTDEVICES_BRIDGE_SECRET`. SmartDevices needs `COVERAGEFIT_DEVICE_BRIDGE_ENABLED=true`, exact `COVERAGEFIT_ORIGIN`, the same secret, and its existing persistent rate-limit configuration including `RATE_LIMIT_HASH_SALT`. Secret values stay server-side. If the bridge is not already configured, follow the inherited guide's complete setup.
4. Install both compatible versions before enabling the connection. Review the starting setups on the producer page and run the synthetic-client canary below. Preserve existing production identity/access controls; the new page reuses them.
5. Existing optional producer alert settings and the maintenance Worker are unchanged. A durable save is not a promise of notification delivery. The maintenance path additionally removes expired protection sessions in bounded batches. No live messages or schedules were created by this release.

## One-button link checks

**Check saved official links** runs an authenticated, rate-limited check of that saved setup's provider and monitoring links. It never fetches a submitted arbitrary URL. Requests are HTTPS, restricted to known provider hosts, timeout after eight seconds per source, do not follow redirects, and read at most 512 KiB. Stored results contain status and a normalized-text fingerprint, not the fetched page or client data.

An initial successful retrieval records a comparison baseline. Later changed content, a redirect or a missing page marks the version as needing review and suppresses its current positive links. That warning remains sticky for the version, including after an offline check. Review and explicitly save a new version to resolve it. Transport failures or blocked/oversized responses are unverified. Successful retrieval cannot prove model fit, active monitoring, stock, price, licensing, insurance eligibility or that the page's claims are accurate. Dynamic marketing content can produce a false-positive change warning.

This button is available after the app and database migration are installed. It does not activate a monthly schedule or replace SmartDevices' existing Evidence Autopilot. No scheduled task was created again in this release. A monthly reminder/review and this manual action are different mechanisms.

## Privacy, compatibility and recovery

The version-2 bridge returns only the selected policy's carrier/product, four-or-fewer protection categories, producer classification/due date, reviewed setup descriptions/official links, review dates and literal saved progress. Name, contact data, premium, documents, policy number, exact address, raw answers, private case instructions/source notes and the original insurance review credential are excluded. Reusable setup text must never contain client information. The arbitrary customer-facing instruction remains in CoverageFit; it is not forwarded to SmartDevices.

The opaque one-hour capability is stored hashed. HMAC signatures cover the exact request body, timestamp and fresh nonce. Signature replay, expired/revoked or superseded scope, unsupported states, missing consent, stale per-category versions and reused identifiers with different payloads fail closed. Request/response sizes and persistent rate limits remain bounded. A client can update only categories selected for that policy. Category updates are idempotent and independent. No sensitive installation/monitoring document upload was added; arrange secure evidence delivery with the agent.

Older water-only bridge APIs, sessions, tables and return links remain readable. New checklist links include a version marker in the fragment; the page selects the matching reader. The legacy UI now lists Flo as the sole offered water choice while previously recorded device identifiers remain readable. Historical generic SmartDevices comparisons are unchanged.

If configuration or optional storage is missing, the insurance review still loads and clients can request to proceed when the quote is current. Protection writes must not report success. Return navigation restores the original review from that browser's CoverageFit session; otherwise reopen the original email. Superseded or expired reviews require the current review link. Post-binding fulfillment follows the existing exact-component outcome rules and cannot renew an expired insurance quote.

Retain setup versions, link-check records, category updates and professional reviews under the existing authorized operational retention/deletion process. No new automatic audit deletion period is imposed. To disable, turn off both bridge flags and any previously activated optional scheduler. To roll back, restore the prior paired app packages and retain the additive tables and audit history; do not automatically drop them.

## Verification and canary

Local checks execute the actual SmartDevices signer against the actual CoverageFit receiver with SQLite-backed D1 test adapters and in-process transport. They cover all four categories, private-field exclusion, official-domain restrictions, versioned edits, stale/retired/changed setups, sticky link warnings, consent, replay/expiry, per-category concurrency/idempotency, professional review and unchanged insurance proceed/outcome/appointment state. Both old and new bridge tests run. Full application regressions and package verification are recorded in the sibling verification report.

Before real client use, use a synthetic review containing a California Home component with all four tasks and a second component without tasks. Preview email and review, launch each task, request to proceed, save distinct burglary/fire statuses, return and reload both apps, then verify only the intended producer activity and unchanged appointment/outcome. Review one update and verify other tasks remain pending. Edit/retire a saved setup, run a source-change check, and verify old positive links are suppressed until a new reviewed version is selected and approved. Exercise the old water link and disabled/missing-storage state.

Browser-rendered visual QA, physical mobile/screen-reader testing, live-domain handoff, real notification delivery, provider checkout/installation and insurer acceptance were not tested or activated in this turn. The CSS includes narrow-screen layouts, keyboard controls, labels, live status and forced-color styling, but those are implementation features, not a visual/accessibility certification. Conversion improvement remains a hypothesis to measure against actual opportunities, without counting revised quotes or component policies as extra clients.
