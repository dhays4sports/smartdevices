# SmartDevices editorial review

**Batch:** `SD-EVIDENCE-2026-10-05-02`
**Digest:** `02c1f79c0a8b01a9346a72f3d041ab43d11bae42bebf2d75f4d1e795d28ed49c`
**Reviewed base:** `98f64009d1d555d4c0924a5c14aae444aa7f74db`
**State:** Prepared; not approved, applied or published.

Four factual/metadata proposals, two unresolved conflicts, one withheld safety finding, five stale-status corrections. Zero unsupported claims promoted. Every selected proposal remains subject to revalidation at application time.

| ID | Current → proposed | Effect |
|---|---|---|
| P01 | No configuration observation → dated retail model 900-001 observation: $623.99, shown sold out | Device detail; model-specific only |
| P02 | No separate partner configuration → dated $745 Farmers bundle with distinct terms and consent boundary | Device detail and /farmers; no eligibility promise |
| P03 | Catalog says product unavailable → availability unknown at family level, with both dated configurations distinguished | Catalog, comparison, detail and API; requires P01 + P02 |
| P04 | No structured Ring discrepancy → conflict record with both subscription statements, null truth value | Qualified display; no resolved requirement |
| P05 | No structured FIXD discrepancy → conflict record with both trial lengths, null truth value | Qualified display; no chosen duration |
| P06 | No safety-review record → unresolved accessory review; current authoritative body inaccessible | Withhold new recall assertion; no unrelated device labeled recalled |
| P07 | Moen retail source expired September 25 → source version 2, observed October 5, due October 12 | Retail source only; no carrier cascade |
| P08 | Expired Farmers source still stored active → explicitly stale | Existing suppression remains; dates unchanged |
| P09 | Expired California program stored active → explicitly stale | Existing suppression remains; dates unchanged |
| P10 | Expired water-category rule stored active → explicitly stale | Existing suppression remains; dates unchanged |
| P11 | Expired public-offer rule stored active → explicitly stale | Existing suppression remains; dates unchanged |
| P12 | Expired Moen carrier fit stored active → explicitly stale | Existing suppression remains; dates unchanged |

**Already fixed:** PR4 already has Phyn's $579.99 observation. No overwrite proposed.

**Not renewed:** Farmers carrier statements; the direct source is currently unavailable. Neither a search excerpt nor approval refreshes them. Other catalog observations remain research candidates; see `CATALOG_COVERAGE.md`.

**Review choices:** Approve all twelve listed proposals; approve named IDs (P03 requires P01 and P02); reject; or request revision. Approval must name this batch. Later changes require reapproval when semantics differ. A review decision does not waive failed tests or authorize public SmartDevices.com deployment.

**Publication gates still closed:** complete locked install/full regression suite, authenticated approval signer, native publisher integration and exact hosted verification. The existing private pilot has not changed. The complete machine-readable before/after batch and source evidence are in `batches/SD-EVIDENCE-2026-10-05-02.json`; the generated detailed review is alongside it.
