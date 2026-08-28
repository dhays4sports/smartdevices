# Administration, Editorial, and Integration Guide

## Editorial workflow

1. Add or update a record in `content/catalog.json` using only current primary sources.
2. Record capabilities, setup, recurring cost, connectivity, monitoring, limitations, insurance consideration, source URLs, `lastReviewed`, and status.
3. Do not copy protected marketing text or imagery. Do not infer a carrier benefit from a manufacturer statement.
4. Run `npm run test:focused`. A stale or archived record is excluded from recommendations.
5. Append the research result and reviewer to `CONTENT_AND_INSURANCE_EVIDENCE_LEDGER.md`.

Question/rule edits follow the same append-only discipline: update `content/scan-questions.json`, increment the schema/question-set version when compatibility changes, document the effect of every option, preserve unknown/skip behavior, rerun all scan and language tests, and append `SCAN_QUESTION_AND_RULE_PROVENANCE.md`. A question with no result effect must be removed.

## Professional administration

Production operators must provision roles server-side, suspend access immediately on offboarding, retain no client PII in templates, review professional notes as professional-supplied assertions, and provide access/correction/deletion/consent-withdrawal workflows. Templates contain domain, concern, device IDs, and bounded default notes only. SmartDevices remains the primary identity; co-branding is secondary.

## Zero-repeat handoff

The canonical envelope is `ConsentedHandoff` in `app/lib/integrations.ts`. Version 2 may carry only broad domain/concern/device IDs, an opaque client reference, governed scan factor/unknown IDs, and literal client intent under purpose-bound consent. It never includes raw answers or PII and never treats a page view as intent. Partner requests sign `timestamp + "." + canonicalJson(envelope)` with HMAC-SHA256 and send `x-smartdevices-timestamp` plus `x-smartdevices-signature: sha256=<hex>`. Rate-limited requests, requests older than five minutes, expired envelopes, missing consent, invalid signatures, and repeated handoff IDs are rejected.

Activation order: agree schema/purpose/deletion SLA → exchange secret outside source control → set endpoint/secret in the environment → bind migrated D1 → run valid/invalid/expired/replay fixtures in staging → reconcile audit receipts → enable one direction/system at a time. Never log the raw envelope or signing secret.

## CRM export

`buildCrmPlanExport` exports plan identity, domain/concern, recommendation source/priority, explicit client intent, and separately asserted fulfillment. It explicitly lists page view, link click, and scroll depth as excluded signals. The live CRM adapter remains disabled until its destination, role mapping, retention, and deletion behavior are approved.

## Communications

A contact checkpoint appears only after a useful plan. In local mode, a request can be saved only in that browser and is labeled not sent. Production activation requires purpose-specific consent, validated destination, suppression check, idempotency key, provider acceptance result, delivery webhook, retention policy, and deletion workflow. Never convert provider acceptance into client intent or fulfillment.
