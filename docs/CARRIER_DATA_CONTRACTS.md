# v4.2 carrier data contracts

All public carrier data is versioned JSON validated by `app/lib/carrier.ts`.

- Registry: stable carrier ID/slug, publication status, supported jurisdiction, canonical path, independence disclosure.
- Program: carrier, jurisdiction, line, policy scope or explicit unknown, visibility, lifecycle status, date scope, sources, limitations.
- Evidence source: owner/domain, public URL or server-only restricted reference, jurisdiction, checked/review-due dates, lifecycle status, visibility, limitations.
- Rule: program, carrier, jurisdiction, line, policy scope, classification, capability classes, sources, dates, reviewer/status, visibility, limitations.
- Device class: technical description plus safety boundary.
- Device fit: carrier/jurisdiction overlay, catalog ID, class IDs, technical/public-offer fit state, evidence, dates, lifecycle, limitations.
- Question set: versioned prompts, bounded enum options, explanation, applicability branch, and named result dimensions changed.

Lifecycle transitions are explicit. Retired records cannot reactivate. Draft or restricted evidence cannot support a public rule. Stale, conflicting, withdrawn, retired, or overdue records cannot produce a current positive label. Unknown dates/scopes remain unknown rather than being inferred.
