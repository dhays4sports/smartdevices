# Carrier and partner integration guide

SmartDevices integrations are optional adapters behind server-side authorization. Local/demo mode never sends a message, uploads evidence, or calls a carrier. Production activation requires separate credentials, data-processing approval, consent language, suppression/retention/deletion behavior, monitoring, and rollback authority.

## Handoff v3

Send the canonical JSON envelope to `/api/integrations/handoff` with `x-smartdevices-timestamp` (Unix seconds) and `x-smartdevices-signature: sha256=<HMAC-SHA256(timestamp + "." + canonicalJson)>`. Envelopes are limited to 8 KB, short lived, purpose consented, source/destination distinct, and replay protected. Carrier context contains stable IDs/versions only.

CoverageFit and 408FARMERS inbound signing secrets are separate. The server validates signature/time before persistence, stores an opaque receipt/hash, enforces a route rate limit, and writes a bounded audit event. Restricted evidence and raw answers are not part of the envelope.

## Field authority and confirmation

Consumer intent belongs to the consumer; professional assertions belong to the authorized professional; public carrier rules belong to the governed evidence registry; manufacturer capability belongs to the technical overlay; carrier determination belongs only to an activated carrier-authoritative source. Recipients preserve unknowns and reuse consented context without silently expanding purpose.

## Activation test

Use test credentials and non-client fixtures. Prove accepted, rejected, timeout, invalid signature, expired, replay, rate-limit, suppression, revoked, and deletion paths. Confirm no secret or payload in browser bundles/logs/analytics. Activate one direction at a time with a kill switch and rollback rehearsal.
