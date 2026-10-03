# SMARTDEVICES-ECOSYSTEM-RECONCILIATION-1.0 — Verification Evidence

Date: 2026-10-02

## Commands completed

### Source contracts

```bash
node --test $(find tests -maxdepth 1 -name '*.test.mjs' ! -name 'runtime-pages.test.mjs' -print | sort)
```

Result: **99 passed, 0 failed**.

`runtime-pages.test.mjs` is intentionally excluded from the source-only gate because it launches generated production output that is not present in the clean source candidate.

### Pure-core semantic TypeScript check

A strict temporary TypeScript project included:

- `data.ts`
- `device-capabilities.ts`
- `device-domain.ts`
- `device-connect.ts`
- `builder-contract.ts`
- `device-intelligence.ts`
- `builder-orchestrator.ts`
- `builder-research.ts`
- `builder-engine.ts`

Result: **PASS**.

### Changed/new TypeScript syntax gate

Every changed/new `.ts` / `.tsx` file was parsed/transpiled with the available TypeScript compiler.

Result: **21 changed/new TypeScript/TSX files, 0 syntax errors** in the final reconciliation working tree.

### Migration rehearsal

Migrations `0000` through `0007` were applied in numeric order to an empty SQLite database with foreign keys enabled.

Result:

- **22 tables**
- **0 foreign-key violations**
- registry tables present: `device_registry_records`, `device_control_claims`, `device_integrations`
- registration attribution column is `registrant_subject`, not an ownership claim; pre-existing `plans`, `plan_templates`, and `builder_projects` retain their historical `owner_subject` columns unchanged.

### Evidence validation

```bash
node scripts/validate-carrier-evidence.mjs
```

Result: PASS; no draft, stale, conflicting, restricted, orphan-rule or public-leak findings.

## Environment-limited gates

A clean locked install was attempted. `npm ci --offline` failed because `zod-validation-error@4.0.2` was not available in the local npm cache, and this execution environment cannot resolve `registry.npmjs.org`. A full repository `npm run typecheck` also cannot be certified from the incomplete dependency tree. Therefore this record does **not** claim:

- clean locked install;
- full dependency-aware `npm run typecheck`;
- full `npm run lint`;
- production `npm run build`;
- generated-dist runtime/direct-load checks.

These remain PR/CI or externally connected environment gates.
