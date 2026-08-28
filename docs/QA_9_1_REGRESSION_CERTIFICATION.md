# SD42-QA-9.1 normalized regression certification

Certification date: 2026-08-26 UTC  
Candidate: `4.2.0-beta.2`

## Result

Pass locally. The complete automated suite ran against the production build and reported 177 passing tests: 63 JavaScript component/runtime/source-contract tests and 114 typed schema, rule, state-transition, integration, and compatibility tests. There were no failed, skipped, cancelled, or todo tests.

The same source state also passed:

- TypeScript `tsc --noEmit`;
- ESLint;
- Vinext production build with 22 application/API routes;
- deterministic carrier-evidence validation: 8 sources, 5 rules, 4 fits, and zero draft, stale, conflicting, restricted, orphan, or public-leak findings; and
- all four append-only migrations against an empty Node SQLite database, producing 13 governed tables and both verification-event indexes.

## Dependency advisory correction

The full development-tree audit newly reported 46 transitive advisories (3 low, 7 moderate, 36 high, 0 critical) from the current advisory database. This supersedes the earlier all-tree result and is retained as a failure, not hidden. `npm audit --omit=dev --json` reported zero production vulnerabilities. The affected paths are development/build tooling; no lockfile-safe fix was advertised for several direct toolchain packages. The candidate therefore passes the production-dependency gate while retaining a non-runtime toolchain upgrade/revalidation item in the external-activation/limitations ledger.

No audit fix was applied automatically because doing so would not resolve every path and could replace the protected Vinext/Cloudflare build graph without a verified compatible release.

## Limits

This sprint certifies local automated behavior only. Rendered browser, physical-device, assistive-technology, representative Core Web Vitals, hosted D1, live carrier/provider, and production-operational evidence are evaluated or bounded in later certification sprints.
