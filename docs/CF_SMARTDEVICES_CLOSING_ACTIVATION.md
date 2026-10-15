# CoverageFit + SmartDevices — Closing Bridge 1.0

Paired releases: CoverageFit 3.20.228 and SmartDevices 4.5.0-rc.1. Local implementation, 2026-09-05. Neither site was deployed or connected to live providers.

## What this delivers

CoverageFit remains the source of truth for the recommendation version, component policy, client proceed request, appointment and actual insurance outcome. SmartDevices provides a scoped California automatic-water-shutoff comparison and explicitly consented status updates.

In Prepare recommendation, add a **California water-shutoff next step** to the relevant Home component policy. Choose producer-stated before-binding, producer-stated after-binding, possible discount, independent recommendation, or confirmation needed. Record the private case-specific source where required, the customer-facing next action and any documented due date. Confirm the task and reverify the policy before preparing the email/review. The source note remains private. An auto discount never creates a device requirement or an additional policy.

The approved email includes the device-related next step while retaining direct reply/call and the optional review link. The review displays a compact task card. It does not require house exploration or device purchase before a customer can request to proceed. Quote expiry still prevents a new proceed request. Post-binding fulfillment can remain available for an expired quote only when the producer recorded that exact component policy as bound and its task is post-binding; an expired/revoked review link itself still requires a new review.

After a clear context preview, the client opens SmartDevices. Only task classification, capability, California scope and policy carrier/product are returned there. Name, address, contact details, premium, quote documents, private notes and the original review token are not forwarded. The arbitrary customer-action instruction remains in CoverageFit rather than being forwarded as free text.

Customers can consider an option, report an existing system, request installation/agent help, or report installation. An explicit checkbox and **Save update to my insurance review** submit only that status and an optional governed device ID. A source-reviewed point sensor cannot substitute for automatic shutoff. Current SmartDevices evidence is checked server-side again before saving a named device.

The insurance review and producer record show the saved update. The producer's **Device next steps** queue prioritizes updates whose client already requested to proceed. **Record my review — not insurer acceptance** records a literal professional review of the latest update and removes it from the unreviewed-update queue. A new customer update needs a new review. This is not a queue of all outstanding underwriting obligations and does not clear a condition or record carrier determination. Binding remains a separate producer action.

## One-time activation

1. Replace the contents of each existing repository with its respective updated root package, without an enclosing directory. Preserve the existing production settings, bindings, secrets and deployment workflow. Do not upload the two ZIPs into each other.
2. On CoverageFit's existing database bound as `COVERAGEFIT_DB`, apply **migrations/0009_cf_device_bridge.sql** once, after existing migrations. It adds four bounded-purpose tables; earlier migrations remain unchanged. Do not rerun this migration if it is already recorded as applied.
3. Add a new, cryptographically random secret of at least 32 characters named **SMARTDEVICES_BRIDGE_SECRET** to both apps. It must match exactly. It is distinct from existing review-link and generic handoff secrets. Do not place its value in source, URLs, customer forms or client JavaScript.
4. Set the exact trusted origins below. Use your actual deployed production domains (or the exact HTTPS preview origins for a controlled canary), without a trailing slash or path. The two deployments must be reachable by their intended customers and server-to-server requests. Do not widen access automatically.
5. Once both updated apps and the migration are installed, enable their bridge flags. Existing insurance reviews remain available if optional device storage/configuration is unavailable. A failed device write never reports success.
6. Complete the test-client canary below before sharing real client tasks.

| App | Variable | Value |
|---|---|---|
| CoverageFit | `COVERAGEFIT_SMARTDEVICES_ENABLED` | `true` after installation |
| CoverageFit | `SMARTDEVICES_ORIGIN` | `https://smartdevices.com`, if this is the deployed origin |
| CoverageFit | `SMARTDEVICES_BRIDGE_SECRET` | Shared new secret |
| SmartDevices | `COVERAGEFIT_DEVICE_BRIDGE_ENABLED` | `true` after installation |
| SmartDevices | `COVERAGEFIT_ORIGIN` | `https://coveragefit.com`, if this is the deployed origin |
| SmartDevices | `SMARTDEVICES_BRIDGE_SECRET` | Same shared new secret |

SmartDevices retains its existing D1 binding and rate-limit configuration, including `RATE_LIMIT_HASH_SALT`; it has no new schema migration. It fails closed if persistent rate limiting is unavailable. Do not weaken its authentication or access settings to run the connection.

The customer-facing comparison uses the existing published evidence snapshot. This release does not activate Evidence Autopilot or revalidate the catalog's historical prices, stock or carrier rules. Source dates remain literal; named choices with stale evidence are rejected.

## Optional hands-off producer alert retries

The existing producer email configuration is reused: `COVERAGEFIT_NEW_REVIEW_NOTIFICATIONS_ENABLED`, `RESEND_API_KEY`, `COVERAGEFIT_PRODUCER_NOTIFICATION_EMAIL` and `COVERAGEFIT_NOTIFICATION_FROM`. A task save acknowledges durable storage, not guaranteed inbox delivery.

For scheduled retry, add a separate random **COVERAGEFIT_RECOMMENDATION_MAINTENANCE_SECRET** to CoverageFit and the included scheduler Worker. Configure/deploy that Worker using `workers/recommendation-maintenance-wrangler.example.jsonc` and the existing Cloudflare account workflow. Its 15-minute schedule calls `/api/internal/recommendation-maintenance`. No Worker or cron was created by this implementation.

Each run retries at most three pending producer notifications, with existing delivery leases and stable provider idempotency keys. Lower-attempt records are considered first to avoid repeatedly selecting the same failed items. Failures remain visible and manually retryable. The scheduler also removes expired task-session and nonce rows in bounded batches. It does not send customer marketing messages, book appointments, perform carrier checks or start a new SMS campaign. Deadline reminders and conversion dashboards are not activated in this pilot.

## Security and state contract

- Launch requires the valid existing review capability, an exact approved option/policy and an explicit context-sharing action.
- The dedicated opaque task capability expires in one hour and is stored only as a hash in CoverageFit. It is intentionally reusable within that scope for reload/retry; it is not the original insurance-review credential.
- Each server request uses an HMAC over exact body bytes, timestamp and fresh nonce. Timestamp tolerance is two minutes; nonce replay is rejected. Browser mutation origins, request sizes and rate limits are checked.
- Saves use an immutable request ID plus optimistic version. Retries repair an interrupted outbox write without duplicating the update; stale concurrent changes are rejected.
- Every read/save checks current recommendation revision, task scope, revocation and expiry. Draft changes do not modify the approved task; preparing a new revision invalidates the old scope.
- Return context remains in the original CoverageFit browser session. The return link carries only the task capability. If that browser context is missing, the person must reopen the original insurance email; SmartDevices cannot recover the full quote token.
- A capability holder's action is customer-reported, not proof of the named client's identity. Technical fit is not insurer approval. A page view is not intent, selection is not purchase, reported installation is not evidence, professional review is not a carrier determination, and no bridge event binds coverage.
- No sensitive document upload was added. Existing equipment is reported as a review request, not automatically recognized as compliant.
- Device updates and professional-review entries are retained with the recommendation's audit history. Include these child records in the existing authorized recommendation retention/deletion process; the scheduler only purges expired capabilities/nonces, not audit records. No new automatic customer-record deletion policy was invented.

## Canary and rollback

Use a synthetic client and destinations you control. Prepare one California Home policy with a reviewed device task and another component without it. Verify the same task appears in email and the correct policy's review. Request to proceed, then launch SmartDevices, choose an option or help request, explicitly save, return, and confirm the chosen insurance option and existing appointment remain intact.

Refresh both pages and confirm durable state. Confirm one producer alert, retry the same action and verify no duplicate update. Check the unreviewed queue, record professional review, and confirm it does not alter the insurance outcome. Test two conflicting saves, old/revoked/expired review links, unavailable device evidence and a disabled bridge. Check narrow phone and desktop layouts, keyboard focus, screen reader labels, return navigation, and the physical browsers your customers use.

Local validation includes actual production signer-to-receiver execution with a SQLite-backed database adapter and injected in-process transport. It is not a live-domain, real-provider or browser-rendered end-to-end certification. This turn did not run browser visual QA. Conversion improvement remains a hypothesis; compare one client opportunity per denominator, not policy count or revised quote count.

To disable, turn both bridge flags off and disable the optional Worker schedule. This preserves the insurance review and all recorded updates. Restore the prior application packages if needed; retain the additive database tables and historical records. Do not drop the new tables as an automatic rollback action.

## Local verification commands

CoverageFit: `npm ci`, `npm test`, `npm run cloudflare:functions:build`.
SmartDevices: locked install, `npm run typecheck`, `npm run lint`, `npm test`.
The explicit cross-system test is `tests/device-bridge-cross-system.mts` in CoverageFit. Run it with the paired SmartDevices `tsx` loader and set `SMARTDEVICES_SOURCE_DIR` to that source checkout. It uses no live network/providers.

Existing visual assets, carrier branding, old migrations and historical release manifests are preserved. A test-harness naming collision between HTTP status and review status was corrected by naming the new field `reviewStatus`. Initial SmartDevices typecheck required an explicit environment index type; initial lint warnings were resolved with a stable load callback and the existing Image component.

