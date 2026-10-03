# Isolated Sites test environment

| Environment | Identity | Persistence | External systems |
|---|---|---|---|
| Original source Site | `appgprj_6a8939605e70819194cb03265dda1822` | Not accessed or changed | Not changed |
| Safe PR #2 preview | `appgprj_6ac116fe429c81918c53233a8c6f3377` | None; bounded local samples | Blocked |
| Persistent test | `appgprj_6ac1324d62f08191a6fbecaa261e619f` | Separate managed `DB` | Blocked before routing |
| Future production | Not selected | Not provisioned by this mandate | Requires independent authorization |

Expected test origin: https://smartdevices-persistence-test.noisy-skunk-4108.chatgpt.site (publication status and exact source recorded in verification report).

## Configuration classification
- Public: environment label `isolated-sites-test`, GitHub repository/SHA metadata at `/api/version`, public catalog.
- Server-only: dispatch identity headers, DB binding, request authorization, platform access policy.
- Secret: `RATE_LIMIT_HASH_SALT`, independently generated and stored as a Sites secret. Never committed or printed. Sites owns sign-in signing material and DB wiring; no custom auth key is configured.
- Absent: OPENAI_API_KEY, manufacturer credentials, physical-operation adapters, payment/settlement keys, Mesh credentials, external handoff secrets, professional/admin grants, R2, workspace connectors.

Runtime env revision initially 1 with only the rate-limit salt. Changing runtime values requires a new saved deployment. `.env.example` enumerates legacy optional capabilities; blank examples are not activation. The unconditional test Worker policy blocks them even if optional flags were mistakenly set.

## Schema
Keep all 13 historical migrations byte-identical and in their existing journal order, including both distinct 0007 filenames. They produce 28 application tables. No migration is added or renumbered. Sites applies packaged migrations before Worker upload; a failed publication may have applied some migrations. Inspect actual platform state before retries; never replay SQL by hand or replace history.

## Reproducible deployment
1. Fetch GitHub branch `smartdevices-sites-hosting-1.0`, check out the exact approved commit. Verify `.openai/hosting.json` matches this test Site, not either preserved Site.
2. Run locked install (`npm ci`, or repository/Sites install helper), `npm run typecheck`, `npm run lint`, `npm test`, and `python3 scripts/verify-migrations.py`.
3. Configure only `RATE_LIMIT_HASH_SALT` as a Sites secret. Do not copy production `.env` files. `d1: DB`, `r2: null` are in Git.
4. The Sites workflow pushes the **same GitHub commit** to the Site source repository, runs `node <sites-plugin>/scripts/build-site.mjs`, packages and validates the archive. GitHub is authoritative; Sites' source repository is a deployment mirror.
5. Save/deploy privately using exact returned commit and archive. Wait for `succeeded`. No automatic publication from GitHub commits is configured. Commits use `[CF-Pages-Skip]` to avoid the existing unrelated Pages build trigger.
6. `scripts/write-source-version.mjs` generates build provenance from Git HEAD. `/api/version` reports that SHA; generated file is ignored, recreated on typecheck/build. Never edit it manually to claim a version.
7. Verify Sites D1 overview and deployment logs, then run the browser acceptance worksheet below. Native deployment success alone is not functional acceptance.

## Hosted acceptance worksheet (not replaced by local test results)
Use only provider-backed test accounts with authorized Site access. Do not invent user headers at a live origin. Owner-private access does not automatically grant a second account access; an authorized test viewer is required. Do not publish publicly to work around this.

For widths 375, 768, and desktop: open Builder, top-level sign in as A, create a clearly synthetic freezer-temperature project, create workspace, Save online, record URL and revision, reload, follow Saved projects, reopen and compare. Clear browser draft storage or use a fresh session to demonstrate server retrieval. Sign out, press Back, and attempt private API/route access. Sign in separately as B; list/read/update/delete A's ID must fail. Sign back in as A; choose another architecture, save revision, redeploy unchanged app, reopen and compare. Test network/save failure with no successful-save message.

Also exercise Discover filters/detail/compare, Connect sample registration, blocked Operate, and /farmers navigation/disclosures. Record screenshots plus actual interactions and response statuses, excluding personal account details. Two synthetic principals in local SQLite tests do not prove two live sign-ins.
