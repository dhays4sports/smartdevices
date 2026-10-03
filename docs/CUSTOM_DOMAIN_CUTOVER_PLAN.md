# SmartDevices.com custom-domain cutover plan — AUDIT ONLY

No hostname has been attached to the new Site. No DNS records, TLS settings, mail settings, redirects or production routes were changed.

## Observed public DNS (2026-10-03)
Read-only Cloudflare DNS-over-HTTPS lookup: apex and www both resolve to Cloudflare proxy IPv4 `104.21.71.202` / `172.67.171.160` and IPv6 `2606:4700:3035::6815:47ca` / `2606:4700:3031::ac43:aba0`, TTL 300. Nameservers: eleanor.ns.cloudflare.com and emerson.ns.cloudflare.com. These proxy answers do NOT reveal the origin configuration and are insufficient for rollback.

Apex Google MX records exist (aspmx + alt1–alt4), plus Google verification TXT records. SPF includes Google, MailChannels, and Dynadot sitebuilder mail. Preserve all MX/TXT and mail-related records. DKIM selector inventory, DMARC/subdomains, existing redirect rules, Worker routes and proxied-origin targets require a Cloudflare zone export/read access before cutover. No CAA records were returned for queried apex/www; recheck at cutover.

## Proposed canonical policy
Keep `https://smartdevices.com` as canonical and redirect www to apex, preserving paths and query strings. Confirm the actual existing redirect rules before replacing any. Preserve `/insurance/farmers` → `/farmers`, device detail routes, structured data and canonical metadata. Remove test-only blanket noindex only in a reviewed production release. Keep private project/account/API routes noindex/no-store and excluded from sitemaps.

## Records and TLS
Sites supports a platform-returned subdomain CNAME target, apex A proxy targets, and validation records with certificate status. Exact values are issued for a registered hostname; none have been requested under this audit-only mandate. Never guess them or point the domain at the preview slug by assumption. After separate authorization, register the intended production hostname and copy only the exact returned records. Confirm certificate `ssl_status` and provider status are active before switching traffic. Audit CAA/SSL mode, redirects, auth callback origin and HTTPS behavior together.

## Preconditions
All hosted A/B persistence/redeploy/recovery/mobile gates must pass. Capture the full current zone and edge routing configuration, provision verified backups, confirm public visitor authentication behavior and support limits, and obtain explicit production DNS authorization. Deployment success alone is insufficient.

## Cutover and rollback (future authorized work)
Keep original hosting available. Save exact prior DNS origin targets, proxy flags, TTLs, route rules and redirect configuration. Publish and validate the intended production release first. Apply only website hostname records and separately reviewed redirects; retain mail records and nameservers. Monitor TLS, sign-in callbacks, 404s, canonical tags, /farmers and saved-project reads. DNS propagation/cache timing varies; allow at least observed TTLs and monitor resolvers rather than promising an exact switchover time.

If failures occur, restore captured website records and routing rules exactly, leaving mail unchanged; verify old application and certificate, monitor split traffic, and avoid concurrent writes to different databases. A DNS rollback without a data reconciliation plan is not a database rollback.
