# SmartDevices v4.1 scan question and rule provenance

Status: locally certified candidate content. Version: question set 1 / result contract 1. Checked: 2026-08-22.

The Intelligent Scan asks only questions that change filtering, priority, explanation, compatibility, cost, setup, subscription, maintenance, power, or privacy. It does not collect an address, VIN, plate, birth date, policy number, claim number, identity, or contact details. `unknown` and safe skip states remain explicit inputs; they are never translated into certainty.

| Question | Applies to | Decision effect | Unknown behavior |
|---|---|---|---|
| H-AWAY | Home | remote-awareness priority, response continuity | adds an unknown, does not infer occupancy |
| H-RESPONSE | Home water | detection versus shutoff class, installation | preserves both approaches |
| H-ALERTING | Home alerting concerns | self versus professional monitoring, subscription | monitoring preference remains unknown |
| U-INSTALL | Home/Vehicle | setup filtering and cost | installation fit remains unknown |
| U-SUBSCRIPTION | Home/Vehicle | recurring-cost filtering | service preference remains unknown |
| H-CONNECTIVITY | Home | connectivity and maintenance limitations | network fit remains unknown |
| V-PARKING | Vehicle dashcam/theft | remote-awareness and parking-power relevance | does not infer parking risk |
| V-POWER | Vehicle | OBD/hardwire/portable fit | compatibility remains a verification item |
| V-MODEL-YEAR | Vehicle theft/driver/diagnostics | broad compatibility caution only | no model fit is claimed |
| V-CONSENT | Vehicle theft/driver | shared-driver privacy explanation | consent must be resolved before monitoring |

Rules are pure and deterministic in `app/lib/scan.ts`. An active catalog record must match the selected domain and concern. Stated DIY, subscription, response, vehicle-power, and broad model-year constraints may narrow results. The engine does not fill an empty set, does not issue a score, and never converts a recommendation into client intent, purchase, installation, evidence, or verification.

Saved sessions with an unknown future schema version must be rejected as stale and restarted; version 1 answers are keyed by question and option IDs and can be replayed deterministically while those IDs remain published.

## Insurance and safety language review

Reviewed 2026-08-22. The questions and deterministic rules do not infer property condition, code compliance, insurance eligibility, carrier acceptance, discounts, claim outcomes, recovery, or guaranteed loss prevention. “Automatic” in the water branch means a product class that may support configured shutoff; it is always paired with installation, compatibility, power, network, and behavior limitations. Vehicle model year is a broad verification cue, not a compatibility claim. Shared-driver monitoring produces a consent consideration, never an assertion that consent exists. Priority bands communicate sequence only and are not a numeric or pseudo-scientific score.
