# Plan v3 carrier provenance

Plan v3 is an additive local/runtime contract. It stores stable carrier, jurisdiction, intent, capability, assertion-state, governed rule/source-version, device-fit, and unknown identifiers in the plan record. A sanitized v3 share URL may also carry the governed carrier ID, jurisdiction enum, entry-intent enum, capability IDs, assertion status, public rule/source versions, and public device-fit IDs. This makes a carrier-aware plan readable when local browser storage is unavailable and before hosted opaque-ID persistence is activated.

Raw question/option answers, exact property/policy data, PII, free text, restricted evidence, private notes, unknown-answer text, and uploads are not part of the public URL. URL decoding allowlists every carrier, jurisdiction, intent, capability, assertion state, rule, public source version/date, device fit, and device ID against the bundled governed registries. Consumer and professional assertions remain unverified. Historic rules are readable and display a stale/unavailable warning.

No durable database migration is required for sprint 6.1 because the inherited plan payload column is a validated JSON envelope and no hosted write is activated locally. Plan v1/v2 readers remain unchanged. A future normalized hosted rollout must migrate additively and preserve v4.1 rollback during the documented compatibility window.
