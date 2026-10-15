# Content and Insurance Evidence Ledger

Checked 2026-08-22 UTC. Reviewer status: v4.1 primary-source revalidation complete; repeat at public cutover. Scope: manufacturer product capabilities, setup, connectivity, subscription, maintenance, availability signals, and limitations needed for the 15-record seed catalog. The catalog paraphrases source material and uses no manufacturer product imagery. Search-result availability is not inventory certification; price and service terms remain explicitly subject to direct verification.

| Product group | Primary authority recorded in catalog | Published scope | Limitations/status |
|---|---|---|---|
| Moen Flo | Moen official product/support pages | Main-line monitoring, alerts, supported shutoff | Professional plumbing; current price/program verification required |
| Phyn Plus | Phyn official product/support pages | Pressure-based monitoring and shutoff | Plumbing, network, and property fit vary |
| Kidde water / smoke + CO | Kidde official product pages | Local sensing plus supported connected alerts | Does not replace code, testing, or required alarm placement |
| Ting | Ting/Whisker Labs official service pages | Electrical signal monitoring/service model | Service is not electrical repair; participation can vary |
| SimpliSafe | SimpliSafe official system/monitoring pages | Sensors and optional professional monitoring | Plan, equipment, dispatch, and network details vary |
| Ring Alarm Pro | Ring official product/support pages | Alarm, network, and supported monitoring features | Amazon account/ecosystem and subscription tradeoffs |
| Airthings View Plus | Airthings official product pages | Indoor air/radon trend monitoring | Not a medical diagnosis or instant hazard guarantee |
| Garmin Dash Cam X310 / Mini 3 | Garmin official product/support pages | Video, incident recording, supported connected features | Installation, local law, storage, and power matter |
| Bouncie / CarLock | Official product/service pages | GPS, trip, movement, and supported driving alerts | Subscription, cellular coverage, tampering, and consent matter |
| FIXD | FIXD official product/support pages | Compatible OBD code translation and maintenance context | Not a repair diagnosis; vehicle compatibility varies |
| Monnit temperature / water | Monnit official sensor pages | Commercial environmental and point water sensing | Gateway/network/configuration and response process required |

## v4.1 item-level revalidation

| Catalog record | Primary source checked | Checked | Result and limitation |
|---|---|---|---|
| moen-flo-shutoff | [Moen product](https://shop.moen.com/products/flo-smart-water-monitor-and-shutoff), [Moen installation](https://solutions.moen.com/Smart_Water_Security_Products/Help_Center/Setup/Installing_the_Moen_Flo_Shutoff) | 2026-08-22 | Monitoring/shutoff and main-line installation supported; professional plumbing and prohibited line locations retained |
| phyn-plus-v2 | [Phyn Plus 2nd Gen](https://phyn.com/products/phyn-plus-smart-water-assistant-shutoff-v2) | 2026-08-22 | Pressure analysis, leak alerts, and shutoff supported; adapter/plumbing fit retained as verification |
| kidde-water-freeze | [Kidde detector](https://www.kidde.com/products/smart/water-leak-freeze-alarm) | 2026-08-22 | Point water/freeze sensing and app alerts supported; no shutoff claim published |
| ting-sensor-service | [How Ting works](https://www.tingfire.com/how-it-works/), [current direct service](https://www.tingfire.com/get-ting/) | 2026-08-22 | Plug-in sensor/service and current direct-service structure supported; catalog does not reproduce efficacy statistics or promise prevention |
| kidde-smart-smoke-co | [Kidde smart catalog](https://www.kidde.com/products/smart) | 2026-08-22 | Current smart smoke/CO models and connected notifications supported; code, placement, testing, and emergency boundaries retained |
| simplisafe-system | [SimpliSafe monitoring plans](https://support.simplisafe.com/articles/alarm-event-monitoring/what-are-the-service-plan-options) | 2026-08-22 | Self and professional monitoring paths supported; plan features/prices remain direct-verification items |
| ring-alarm-pro | [Ring Alarm Pro](https://ring.com/products/alarm-pro-base-station), [monitoring explanation](https://ring.com/support/articles/46blt/Understanding-Professional-Monitoring-and-Self-Monitoring) | 2026-08-22 | Alarm Pro and eligible monitoring supported; plan, region, and enrollment remain verification items |
| airthings-view-plus | [Airthings View Plus](https://www.airthings.com/products/indoor-air-quality/view-plus) | 2026-08-22 | Seven-factor indoor-air/radon monitoring remains published; no medical or remediation claim |
| garmin-x310 | [Garmin X310](https://www.garmin.com/en-US/p/1391409/) | 2026-08-22 | 4K, 140-degree field, voice, incident detection, and touchscreen supported; parking features retain power/service caveats |
| garmin-mini-3 | [Garmin Mini 3](https://www.garmin.com/en-US/p/1223369/) | 2026-08-22 | Compact 1080p, 140-degree field, voice, and incident detection supported; front-view and service caveats retained |
| bouncie-tracker | [Bouncie](https://www.bouncie.com/gps-tracker-for-vehicles) | 2026-08-22 | OBD-connected tracking/service and recurring subscription supported; coverage, consent, and compatibility remain limitations |
| carlock-tracker | [CarLock device](https://www.carlock.co/gps-car-tracker/features-device/) | 2026-08-22 | GPS/cellular device and alerts supported; service, power, tampering, and recovery limitations retained |
| fixd-sensor | [FIXD](https://www.fixd.com/), [FIXD company/product context](https://www.fixd.com/resources/about-us) | 2026-08-22 | OBD/app code translation and optional premium service supported; catalog keeps professional diagnosis and vehicle-fit caveats |
| monnit-temperature | [Monnit temperature sensors](https://www.monnit.com/products/sensors/temperature/), [digital temperature sensor](https://www.monnit.com/products/sensors/temperature/wireless-digital-temperature/) | 2026-08-22 | Remote temperature monitoring and configurable alerts supported; gateway/service/configuration details require selection-time verification |
| monnit-water-detect | [Monnit water detection](https://www.monnit.com/products/sensors/water-detection/), [water detect](https://www.monnit.com/products/sensors/water-detection/water-detect/) | 2026-08-22 | Point water-state detection supported; no automatic shutoff or guaranteed damage-prevention claim |

## Insurance evidence status

No carrier-specific discount, eligibility, underwriting, claim, approval, recovery, or required-device statement is published. Every catalog record uses a general insurance-consideration note directing the user to verify with their own carrier or licensed professional. Therefore there is no carrier-program assertion to certify in this seed release.

## Publication controls

The content test rejects missing core fields, non-HTTPS source URLs, duplicate IDs/slugs, future review dates, thin limitation lists, and known placeholder phrases. Runtime data derives `editorialStatus` from publication status and independently sets `commercialStatus`; this candidate has `commercialStatus: none` for every record. Stale records must move to `review-required` and are excluded from recommendation results.
# v4.2 California Farmers append-only evidence entry — 2026-08-26

The two current Farmers-controlled public sources, five carrier rules, four technical-fit overlays, and safety/manufacturer evidence are recorded in `content/evidence-sources.json`, `content/carrier-rules.json`, `content/device-carrier-fit.json`, and `docs/CALIFORNIA_FARMERS_EVIDENCE_INVENTORY.md`. Public observations are no broader than source scope. Case requirements, possible categories, the California Moen public offer, technical fit, and SmartDevices editorial guidance remain separate. No internal carrier material or brand assets are active.

# v4.2 full seed-catalog revalidation — 2026-08-26

All 15 published catalog records and every v4.2 carrier/safety claim were rechecked against the primary sources listed in `PRIMARY_SOURCE_REVALIDATION_2026-08-26.md`. The Ring product URL and California DGS page were unavailable to the checker; Ring is governed by alternate current Ring-controlled system/support pages, while gas stays class-only and has an explicit cutover recheck. No unsupported positive designation was introduced.

# v4.3 Evidence Autopilot implementation entry — 2026-08-28

The existing 15 catalog records, eight public evidence sources, five carrier rules, and four device-fit overlays remain the protected publication baseline. v4.3 adds retrieval/fingerprint automation and does not represent a new primary-source revalidation by itself. The first activated run captures review-gated fingerprints. Identical later observations may renew freshness; changed, unavailable, invalid, or first-observation sources cannot create a stronger designation. Live retrieval was not activated during local implementation.
