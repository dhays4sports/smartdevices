# Carrier editorial and reviewer workflow

1. Add a primary source in `content/evidence-sources.json` as `draft`, with owner/domain, jurisdiction, checked/review-due dates, visibility, scope, and limitations. Restricted references stay server-side and must never be added to this public content bundle.
2. Add or revise a carrier rule by ID/version. Link only governed sources and technical capability classes. Keep policy scope `unknown` unless the source states it.
3. Add a device-fit overlay only after direct manufacturer evidence supports the exact technical class. Never infer fit from a product name.
4. Run `npm run validate:evidence` and carrier tests. Draft, stale, orphaned, conflicting, and restricted records appear in the deterministic report; any public leak/orphan fails the command.
5. A carrier-sensitive claim should receive a second reviewer when operations support four-eyes review. The pilot records `SmartDevices editorial review`; an external compliance/carrier reviewer remains an activation item.
6. Change the source/rule to `active` only after review. Build failure prevents public draft/restricted leakage.
7. When a source is overdue or unreachable, mark it `stale`; for conflict use `conflicting`; for a removed offer use `withdrawn`. The UI stops positive labels while historic plans retain IDs and warn.
8. On correction, append a new evidence/version/ledger entry. Do not rewrite a past checked date or historical release record.

This is an explicit local/editorial workflow, not a hosted CMS. Hosted reviewer identity, approval signatures, scheduling, internal Farmers materials, and trademark assets require separate authorization and activation.
