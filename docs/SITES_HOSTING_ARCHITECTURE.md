# SMARTDEVICES-SITES-HOSTING-1.0

## Decision and scope
GitHub `dhays4sports/smartdevices` remains authoritative. This branch is stacked on PR #2 at `fcb95454c8876123c4cb6219dd6585030129e200`. It is an isolated test release, not a production configuration and not a replacement for the safe preview. No rebuild, merge, custom domain attachment, or consequential integration activation.

Sites manages the Worker deployment and a separate Cloudflare D1 binding. It does not remove our responsibility for schema, data recovery, authentication, authorization, DNS, or operations. The same existing `builder_projects` and `builder_revisions` tables are used. No second project store or new table was introduced. Other inherited tables remain inactive.

## Original preview audit (2026-10-03)
- PR #2 remains draft/unmerged, head `fcb95454c8876123c4cb6219dd6585030129e200`.
- Safe Site `appgprj_6ac116fe429c81918c53233a8c6f3377`, version 1, deployment source `5aea8008acde1ea33073bcca14bbb8244a2ac2f0`.
- URL: https://smartdevices-pr2-preview.noisy-skunk-4108.chatgpt.site
- The Site source is PR #2 plus the explicit safety overlay documented in its `docs/SAFE_PREVIEW.md`; it is not byte-identical to PR #2.
- Owner-private access confirmed by private deployment operation; API reports custom access mode. Dispatch authentication client exists, but application storage and server mutations are disabled.
- No runtime env entries (revision 0); D1/R2 null; no migrations shipped.
- Build `npm run build` → `scripts/build-verified.sh` → Vinext; Worker `dist/server/index.js` plus client assets. Manual snapshot publication, no automatic GitHub branch deployment.
- Preserved unchanged during this mandate.

## New test architecture
Site `appgprj_6ac1324d62f08191a6fbecaa261e619f`, named SmartDevices — Isolated Persistence Test. Separate managed `DB`, no R2, no connectors. No production DB identifier is configured.

`worker/index.ts` applies `hostingBoundary` before application routing. Only public read APIs, version metadata, and Builder list/read/create/update/export/restore are admitted. Server-action POSTs, all other writes, manufacturer/device operations, external research/execution, market, handoffs, evidence refresh, image proxy, and admin surfaces are blocked regardless of optional provider environment flags. Connect remains temporary sample metadata; it does not persist or connect hardware.

All test responses are private/no-store/noindex. Canonical content metadata remains `https://smartdevices.com`; test robots disallows all and test sitemap is empty. Retain original production sitemap/robots from PR #2 when a separately reviewed production profile is created.

## Authentication and authorization
Sites dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, and callback routes. We did not create a password provider or synthetic-login backdoor. The app reads the stable `oai-authenticated-user-id` supplied by dispatch. Email is display/professional-grant context, not Builder ownership. Builder requires `sites:<id>`; email-only headers fail closed. User IDs are stable within one Site and differ across Sites.

This trust boundary is valid only behind the authenticating dispatcher. A directly exposed Worker must strip untrusted forwarded identity and verify an equivalent provider assertion. Service-access credentials are NOT user identity and cannot save/read user projects. Hosted probe with a valid service credential plus forged synthetic identity headers returned 401; this confirms that probe cannot create a user identity. A live cross-user browser check remains required.

Old email-owned Builder records are not silently reassigned. The new test DB is empty. Any future migration of old data requires a verified owner mapping, separately backed up and reviewed.

The shared `builderRequest` enforces 401 for missing principal, 404 for absent/foreign/malformed objects, 409 for conflicting revisions, 413 for excessive input, 415 for wrong content type, 403 for cross-origin mutations, and 503 for storage failures. Delete is not implemented; the worker denies it. Project identifiers do not grant access. No sharing capability is added.

D1 batch atomically saves parent/revision metadata. Ownership is checked again in INSERT SELECT and metadata UPDATE. Repeated identical saves return the stored revision; changed or stale revisions cannot report success. The existing UI's architecture changes increment revisions. Private hosted documents are removed from browser draft storage after save; back-forward restored Builder pages force a reload.

## Portable boundaries
`db/project-database.ts` is a minimal prepared SQL + transactional batch adapter. SQL is compatible with SQLite. Auth is isolated in `app/chatgpt-auth.ts` and `sites-principal.ts`; Sites dispatch is replaceable with a verified alternative without changing Builder ownership checks. Replacement requires explicit subject mapping, not email fallback.
