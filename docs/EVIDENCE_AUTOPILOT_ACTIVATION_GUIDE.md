# Evidence Autopilot Activation Guide

> Historical v4.3 instructions below are superseded for the private pilot by `EVIDENCE_AUTOPUBLISH_ARCHITECTURE.md` and `SITES_EDITORIAL_PUBLICATION_RUNBOOK.md`. Do not activate the scheduler or automatic renewals. Research no longer publishes; exact-batch approval is required.

## Prerequisites

1. Keep the Site private while staging the workflow.
2. Assign one evidence administrator and one independent carrier/legal reviewer for material carrier changes.
3. Back up the target D1 database and apply additive migration `0004_colorful_misty_knight.sql`.
4. Verify 17 tables, all evidence indexes, foreign keys, and the existing plan/handoff schema.
5. Configure a high-entropy `RATE_LIMIT_HASH_SALT`.

## Environment

Set server-side values only:

```text
SMARTDEVICES_DEMO_MODE=false
SMARTDEVICES_EVIDENCE_ADMIN_JSON=[{"email":"approved@example.com","role":"evidence-admin","status":"active","expiresAt":"<approved-expiry>"}]
SMARTDEVICES_EVIDENCE_SCHEDULER_TOKEN=<long-random-secret>
SMARTDEVICES_EVIDENCE_REFRESH_ENABLED=true
RATE_LIMIT_HASH_SALT=<long-random-secret>
```

Do not commit these values. Rotate them after staging, role changes, suspected disclosure, or administrator offboarding.

## Staging rehearsal

1. Sign in as the approved evidence administrator and open `/admin/evidence`.
2. Confirm all governed source links point to the intended official domains.
3. Select **Refresh all evidence** once. The first run must show baseline observations, not automatic renewals.
4. Open each official source and confirm the stored scope, limitations, jurisdiction, capability facts, carrier language, price/availability observation, and review window.
5. Confirm unchanged baselines individually. Material carrier changes require the second reviewer outside the current single-admin UI before confirmation.
6. Run the refresh again. Identical normalized sources should become confirmed and safely renewable.
7. Simulate one unavailable source. Verify no renewal occurs and an expired dependency becomes stale rather than remaining positive.
8. Simulate cross-domain redirect, oversized response, unsupported content type, timeout, and source change. Verify all are review-gated or rejected.
9. Publish a conservative `mark-stale` decision and verify `/farmers`, `/devices`, and a device detail do not show the removed positive context.
10. Roll back to the preceding valid snapshot and verify an append-only audit event and new active snapshot are created.

## Monthly scheduler

Configure an approved HTTPS scheduler to send a `POST` request to `/api/internal/evidence-refresh` with `x-smartdevices-scheduler-token`. Run monthly. Do not place the token in a URL or client bundle. Alert on non-2xx responses, `changed`, `unavailable`, `invalid`, or `needsReview > 0`. The existing reminder can remain as the human accountability check, but it is not a substitute for delivery monitoring.

## Operational response

- `confirmed`: no action unless sampled review or another signal contradicts it.
- `baseline` or `changed`: open the primary source and compare the governed fact before deciding.
- `unavailable`: do not repeatedly retry from the UI; verify the source manually and record an alternate authoritative source or allow expiry.
- `invalid`: correct the governed URL only after verifying ownership and scope.
- suspected incorrect publication: mark the source stale first, then investigate. Restore a prior snapshot only when the older evidence is still valid.

External AI extraction is not activated in v4.3 RC1. The system automates retrieval, fingerprint comparison, freshness, conservative suppression, publication, audit, and rollback; it does not ask an unreviewed model to author stronger product or carrier claims.
