# SD-MKT-0.8 Validation

Date: 2026-09-22

## Source-contract validation

Command:

```bash
node --test tests/market-*.test.mjs
```

Result: **50/50 Market-specific contract tests passing**.

Validated invariants include:

- qualification remains independent from Market.ad;
- carrier-program fulfillment remains separately modeled;
- signed attribution binds the full allocation/offer/verification lineage;
- attribution expires and invalid/expired tokens are rejected;
- viewed/opened outcomes are append-only and idempotent;
- carrier-program provider verification is persisted using the same program context as preview eligibility;
- outcome attribution remains absent from `app/lib/scan.ts`.

## Remaining certification boundary

This package remains a source-root RC. Full dependency installation, typecheck, production build, browser QA and deployed D1 migration rehearsal are still required before any public activation. Public Market.ad sponsorship remains disabled.
