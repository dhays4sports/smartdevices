# Provider portability

| Provider | What disappears if removed | Durable recovery / replacement |
|---|---|---|
| GitHub | Collaboration/remotes/PR UI | Clone source/history to another Git host; keep constitution/migrations/evidence |
| ChatGPT Sites | Runtime, native deployment and auth dispatch | Build exact Git commit on Worker-compatible host; configure DB/auth adapter; no claim one-click portable |
| Sites-managed D1 | Hosted projects/revisions/counters | Existing project export/restore works in local real-D1 rehearsal; full hosted DB export tool unavailable in this session; obtain backup before production |
| Sites auth | Stable provider principal and session | Map old subject to new provider through verified account recovery; never auto-link by email |
| Analytics | Daily counters if not exported | Four-column CSV/SQL backup; synthetic cohort stays labeled; no visitor reconstruction needed |
| Search provider | Index/referral visibility | Source-owned metadata/routes/canonicals; Search Console reporting is replaceable but historical export needed |
| Device-data sources | Ability to refresh claims | Keep dated source references and permitted evidence; mark unavailable/conflicting claims, never hallucinate replacement |
| Referral provider | Attribution/revenue | Catalog/plans survive; replace links only after new agreement/disclosure; no provider active today |

Business-owned assets: domain, constitution, catalog graph, provenance, compatibility rules, plans, customer/subscriber state if later created, operating metrics. Browser-local consumer plans require user export and are not centrally backed up. Hosted Builder export deliberately excludes secrets/owner principal and restores as a new ID under authenticated current subject. Local tested restore is not a hosted backup/restore certificate.

See HOSTING_RECOVERY_AND_PORTABILITY.md for exact build, migration, backup and rollback steps. Sites reduces runtime provisioning work; it does not remove DB, authorization, migration, DNS or recovery responsibility. Current portability is incomplete until actual hosted export/restore and account remapping are rehearsed.
