# Admin and editorial guide

## Roles and release boundary

Only an authorized reviewer may move governed evidence from draft/stale/conflicting/withdrawn to active. Local files are the editorial source in this candidate; no production CMS is activated. Every change is a reviewed code change with schema tests, source URLs, dates, scope, limitations, and append-only ledger entries.

## Add or revise evidence

1. Add/update the primary public source in `content/evidence-sources.json`; use restricted visibility only for authorized server-side material and never a public URL/quote.
2. Add/update the carrier program and rule with carrier, jurisdiction, line, policy scope, classification, classes, source IDs, checked/review dates, reviewer/status, visibility, and limitations.
3. Add manufacturer evidence to the generic catalog. Add carrier applicability only in `device-carrier-fit.json`.
4. Add or revise questions only when `changes` documents a material routing/explanation effect. Maintain three to five per branch and unknown/skip behavior.
5. Run `npm run validate:evidence`, `npm run typecheck`, `npm run lint`, focused tests, then `npm test`.
6. Review `/insurance`, carrier route, device/detail/compare overlay, plan v3, and Pro exact-client preview at mobile and desktop widths.
7. Append decisions, evidence, regression, hashes if protected content changed, release notes, and limitations. Never rewrite a prior result.

## Withdraw, stale, conflict, or retire

Change the source/rule/fit status first. A stale/conflicting/withdrawn/restricted item must not produce a current positive label. Preserve historic plan IDs and show a currentness warning. If a product is unavailable, keep the factual record only when useful and label availability; do not replace it silently.

## Incident response

For an overclaim, restricted-source leak, unsafe instruction, expired evidence, bad redirect, or PII exposure: disable the affected rule/route or adapter, preserve logs without sensitive payloads, document the time/scope, remove cached/public artifacts, notify authorized owners, add a regression test, and append the correction. Do not erase the original failure.
