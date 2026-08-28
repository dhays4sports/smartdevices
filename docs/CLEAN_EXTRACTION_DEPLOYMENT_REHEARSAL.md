# Clean Extraction, Deployment, and Rollback Rehearsal

Gate: `SD41-CERT-10.2` · local result: **PASS; HOSTED D1/IDENTITY/DELIVERY ACTIVATION OPEN** · 2026-08-22 UTC

## Clean source rehearsal

- Source commit: `d189cae312ccdf1c5a3151cc2f19849aace123a0`.
- Temporary source archive SHA-256: `128d300b8e7e7dcbde3eb65047a4712211a072115862acd5f455fd6d3d3cfc68`.
- Root-layout check: first archive entry was `.env.example`; `package.json` existed at extraction root; no wrapper directory was present.
- Locked install: `npm run install:ci` downloaded the integrity-pinned Vinext tarball, verified its integrity, and installed 520 packages from the lockfile.
- TypeScript and ESLint: pass.
- Migration rehearsal: `0000` → `0001` → `0002` applied to a new SQLite database; 12 governed tables existed, including `plans`, `scan_sessions`, and `scan_responses`.
- Full suite: production build plus 25 JavaScript/runtime/schema/security checks and 39 typed tests; 64/64 passed.
- Built runtime: homepage, direct Vehicle/library/v1 plan/Pro routes, invalid plan, unauthenticated handoff, and missing D1 paths were exercised by the suite.
- Public deployment: not attempted or authorized.

The append-only transcript is `docs/evidence/SD41-CERT-10.2_CLEAN_ROOM_TRANSCRIPT.txt`. It preserves two harness-only failures: patch-marker prefixes accidentally entered the first Python command, then the test fixture expected 13 tables instead of the governed 12. Both corrections were appended; source, migrations, and application code were unchanged.

## Environment activation rehearsal

The local preview was run once with explicit demo and memory adapter settings. SmartDevices Pro generated a three-option Home water plan and opened the exact client view. The temporary ignored environment file was removed. With demo absent, `/pro/workspace` returned the production authorization boundary. No hosted identity, D1, communication provider, partner endpoint, live secret, or public access was activated.

## Rollback rehearsal

- Protected v4.0 source SHA-256 reverified: `0e19b173ea61d1df5a8fa5c024a9c012243bdbe6f3e67eacdacd22d29b718202`.
- Root extraction, locked install, typecheck, lint, five-stage Vinext build, and 10/10 v4.0 tests passed independently.
- Transcript: `docs/evidence/SD41-CERT-10.2_ROLLBACK_TRANSCRIPT.txt`.
- v4.1 migration `0002_needy_wendell_rand.sql` is additive: new tables plus nullable provenance columns. The v4.0 code does not depend on those additions.
- A production data rollback still requires an owner-approved D1 backup/restore point, maintenance window, access credentials, restore rehearsal, and post-restore reconciliation. Those external operations are intentionally not simulated as a pass.

## Deployment rehearsal disposition

The source is root deployable in the available local model: clean extraction → locked install → typecheck/lint → migration verification → tests/build → built runtime. The Cloudflare/Vinext adapter and D1 migration assets are present. Public deployment, DNS, production secrets, hosted D1 migration, provider delivery, and physical-device certification remain separate activation gates.

## v4.2 append-only rehearsal — SD42-CERT-10.3

Run date: 2026-08-26 UTC. Source checkpoint: `76457b334a6168468435c0cbfcd6ad543d937fc4`. Temporary clean Git-archive SHA-256: `9e7871d83f707f732004ab78516d2eb82f72fd6f025bc3c6c99dd25629a8827e`.

- A new root extraction contained `package.json`, `package-lock.json`, `.env.example`, application, content, migrations, tests, and guides at the archive root with no wrapper directory.
- The archive contained no dependencies, Git metadata, build/cache/preview output, local environment, prior ZIP, or temporary database.
- `npm ci --prefer-offline` used the immutable lockfile and installed 520 packages. Typecheck, lint, five-stage production build, 67 JavaScript tests, and 115 TypeScript tests passed (182 total). The built-runtime suite exercised the homepage, carrier directory, canonical and alias Farmers routes, plans, production Pro boundary, invalid input, handoff rejection, and unavailable storage.
- Four migrations applied in order to a new SQLite-compatible database. Thirteen governed tables existed, including additive `plan_verification_events`; protected SVG hashes remained byte-for-byte identical.
- The exact v4.1 release commit `86b73b204c8e6945227be76d1e65286d2f72c2cd` was independently archived and installed. Typecheck, lint, production build, 25 JavaScript and 39 TypeScript tests passed (64 total), including plan v1/v2 and handoff v1/v2 readers.
- Migration `0003` creates only the normalized verification-event table and its indexes. Rollback therefore disables v4.2 writers/adapters and returns application traffic to v4.1 without destructively reverting the database.

Two harness assertions failed and are preserved rather than overwritten: the first expected `verification_events` instead of the actual governed table name `plan_verification_events`; the second used four nonexistent generated-art paths instead of the two protected legacy SVG paths. Both corrected commands passed without changing application code, schema, protected assets, or tests. Exact commands and outputs are retained in the SD42 transcripts.

Hosted D1 backup/apply/restore, Cloudflare deployment, DNS, production identity/secrets, live adapters, and traffic rollback remain external operations and are not claimed as passed.
