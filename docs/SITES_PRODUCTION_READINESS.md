# Sites adoption evidence and production gates

Verdict pending final deployment evidence; no production-domain cutover authorized. The central hosted two-account acceptance journey remains a release gate.

| Gate | Current evidence |
|---|---|
| GitHub canonical source | Continuation branch from unchanged PR #2 |
| Existing safe preview preserved | Confirmed native Site version and source SHA |
| Test environment separate | New Site ID and managed DB binding; no production credentials |
| Local persistence/account isolation/IDOR | Real SQLite + shared HTTP handlers; actual Miniflare D1 batch/restart test also passes |
| Local export/restore | Fresh database recovery rehearsal |
| Hosted browser sign-in/save/reload/reopen | NOT VERIFIED |
| Hosted A/B session and IDOR | NOT VERIFIED; needs two authorized provider identities |
| Hosted project survives redeploy | NOT VERIFIED until an actual user-owned row exists and is checked |
| Hosted recovery | NOT VERIFIED |
| Mobile interaction at 375/768/desktop | Local production build: 21 route/viewport checks + 18 interactions pass; hosted remains NOT VERIFIED |
| Full database backup/restore | Platform path not exposed by available connector; unresolved |
| External operations | Unconditional Worker allowlist blocks consequential paths |
| DNS | Read-only audit and rollback plan; no changes |

## Observability
Sites provides deployment status/failure messages and recent Worker logs. D1 overview/rows give owner-only inspection. App errors return stable codes without SQL details; storage failures log only `builder_storage_unavailable`. No project content, credentials, emails or stable subjects are deliberately logged. Before production, verify retention, request correlation, alert routing, auth/unauthorized attempt counters, save-failure monitoring, D1 metrics, and on-call recovery. No external penetration test was performed.

## Explicit limitations
Managed browser guidance says live Sites URLs are unreachable from the cloud-browser runtime and requires a control-browser skill that is not exposed here. Do not bypass that boundary or manufacture browser evidence. Native read-only D1 tools cannot create user sessions. Service credentials do not supply user identity. Local synthetic principals test authorization code, not live authentication. No public sharing change or synthetic-login backdoor is an acceptable substitute.

Secrets and migrations are hosting responsibilities even when Sites manages Cloudflare. Test policy is intentionally compiled into this continuation; do not attach production traffic to this branch unchanged. Restoration is per-project/per-revision, not an atomic full-database restore. Existing rate limiting must also be reviewed under concurrent production load.

## Acceptance handoff
Use the step-by-step worksheet in SITES_TEST_ENVIRONMENT.md. Record A's ID privately, B denial outcomes and A's returned revision after redeploy. Production decision must be based on completed observations, not the existence of this worksheet.
