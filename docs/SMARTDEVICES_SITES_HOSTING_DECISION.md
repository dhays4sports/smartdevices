# Sites hosting decision

**SITES_CONTINUE_PILOT**. Evidence supports useful isolated development hosting, not primary hosting qualification.

Preserved safe preview: https://smartdevices-pr2-preview.noisy-skunk-4108.chatgpt.site (no database). Persistence pilot: https://smartdevices-persistence-test.noisy-skunk-4108.chatgpt.site (private, isolated D1, native auth). GitHub authoritative; manual exact-SHA deployment and /api/version; no domain routing changed.

Passed in prior verified PR3 evidence: 348 tests including 11 persistence tests and one actual local Miniflare D1 restart/isolation/export/restore test; 3 migration paths; 21 local route/viewport checks and 18 interactions; 14 hosted HTTP boundary probes. These are engineering evidence, not customer behavior. Hosted service credentials correctly lack a user principal; forged identity headers did not bypass authorization. No production secrets/device/payment adapters enabled.

Outstanding REQUIRED adoption gates: real hosted synthetic A/B sign-in/save/reload/reopen and direct-object denial; owned project survives redeploy; hosted data export/restore; supported hosted browser QA; operational backup/retention and complete DNS inventory. This environment lacks supported hosted browser automation and two authorized synthetic identities; do not bypass platform auth or widen access. Continue independent repository work.

Custom domain: plan exists; Cloudflare DNS/mail dependencies recorded in CUSTOM_DOMAIN_CUTOVER_PLAN.md. Future exact Sites record/TLS values require hostname registration. Never modify DNS under this mandate. Preview remains noindex; public live indexing/canonical performance not certified.

Production cutover: NOT READY and NOT AUTHORIZED. Current active Pilot is sufficient for engineering validation only. Primary hosting can be reconsidered after the central acceptance journey and recovery gates, not merely a successful render.

Continuation release: SmartDevices PR #4 deploys successfully with14 migrations/29 tables. Hosted14 boundary probes and3 metric HTTP probes pass; native read confirms one synthetic counter. This improves operational evidence but does not satisfy authenticated owned-project persistence/isolation/recovery gates. Verdict unchanged.
