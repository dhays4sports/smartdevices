# ZERO-REPEAT handoff v3

Handoff v3 extends the v1/v2 envelope with optional bounded carrier context: carrier, jurisdiction, entry intent, capability IDs, exact public rule/source versions, assertion source, unknown IDs, and literal client intent. Stable context accepted from a valid consented envelope is reused; receiving systems do not ask the same material question again unless the evidence is missing, invalid, stale, or the purpose changed.

Authority by field:

| Field | Authoritative system/source |
|---|---|
| Consumer assertion and explicit intent | Consumer action at the source system |
| Professional-stated requirement | Authorized professional at SmartDevices Pro or source partner |
| Carrier rule/source version | SmartDevices governed public evidence registry |
| Technical capability fit | SmartDevices manufacturer-evidence overlay |
| Purchase/installation | Explicit source-attributed self-report or activated fulfillment source |
| Professional review | Authorized professional only |
| Carrier determination | Activated carrier-authoritative integration only |

Raw answers, policy number, exact address, VIN, plate, claim data, restricted evidence, private notes, and unconsented PII are recursively rejected. Existing HMAC/timestamp, expiry, destination, replay receipt, rate limit, 8 KB payload, consent, audit, and disabled-adapter boundaries remain unchanged.
