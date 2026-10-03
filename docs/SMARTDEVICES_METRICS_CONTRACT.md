# Metrics contract v1

Implementation: app/lib/business-metrics.ts, metrics-client.ts, metrics-http.ts, app/api/metrics/route.ts. Storage: business_metric_daily, additive 0013 migration; no historical SQL edited. Schema keys day (UTC), cohort, event, count. Unique day/cohort/event; atomic SQL increment capped at 1,000,000. Records older than 90 days deleted on next successful ingest. No public read/export API; owner reads table through native database administration. Export the four columns with database backup. No account, project, device ID, URL, query, IP or free text enters metric records. Existing abuse limiter stores salted IP-derived keys separately; infrastructure logs are provider-managed and must not be mistaken for anonymous metric records.

Optional per-tab sessionStorage consent; disabled by default. DNT/GPC override consent. Only the consent preference is stored client-side. Server strictly accepts exactly {event}; >128-byte payload 413; wrong media type 415; unknown/extra fields 400; cross-origin 403; rate exhaustion 429; missing DB/config 503; persisted counter 204. Product action never depends on telemetry success. Existing limiter has a documented concurrent-race limitation; not production abuse certification.

Every event is SERVER-LABELED synthetic in this private pilot. Client cannot promote it to real traffic. Production cohort requires a separately reviewed deployment policy. Bots/duplicates are not deduplicated into people; counts are actions, not unique users, revenue or causal conversion. Consent and navigation losses mean incomplete measurement. No session funnel/return-visit claim from aggregates.

| Event | Actual trigger |
|---|---|
| discover_search | Nonempty search loses focus; query omitted |
| device_view | Device detail route opened |
| capability_filter | Capability selector changed |
| compare_start | Option added to comparison / compare action |
| compare_complete | Comparison route rendered; not purchase completion |
| builder_start | Home planning route entered or prototype intake started |
| builder_step | Home planning selection changed |
| builder_complete | Home shortlist generated or prototype workspace built |
| plan_save_local | Home plan successfully stored locally, not memory fallback |
| plan_save_hosted | Builder API returns successful saved project |
| plan_reopen_local | Home-plan view finds local stored plan |
| plan_reopen_hosted | Authenticated Builder receives hosted initial project |
| outbound_product_click | Explicit manufacturer-details click in home options |
| plan_export | Home next-step download requested |

Not yet emitted: device_add_owned (Connect only sample), pricing_view/premium_cta/checkout_start/referral_click (no service or affiliate program), return_visit (no stable visitor ID), organic impressions (requires Search Console). Future events must earn a real product trigger, not fake CTA availability.

Initial experiment: water decision entry → compare/select → local plan → manufacturer details. Observability via aggregate native DB inspection and generic route failures. Daily counts distinguish technical test collection from BB1 behavioral validation. After authorized production measurement, assess action ratios descriptively, with no user-level conversion claims. A distinct experiment cohort/session design needs consent/privacy review before causal or unique-user analysis.
