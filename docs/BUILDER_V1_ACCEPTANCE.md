# SmartDevices Builder v5.2 Acceptance Contract

A release can call the Live Device Engine operational only when all of the following remain true:

1. `/build` direct-loads and preserves the normal site header/footer.
2. Idea intake does not require identity or contact information.
3. Requirements orchestration distinguishes inferred requirements, assumptions and material open questions; the deterministic path remains usable when the model provider is disabled.
4. The current SmartDevices catalog is checked before custom build output.
5. Live market research, when activated, records a buy/adapt/build/research-more decision plus source URLs; when unavailable the project says so explicitly.
6. A user can choose R0, R1 or R2 direction; R2 exposes review-required state.
7. Generated BOM lines come only from the curated V1 component allowlist until live sourcing explicitly replaces planning facts.
8. Sourcing facts are labeled `live` only when returned by the configured sourcing adapter.
9. Detailed generation is withheld for blocked-autonomous safety classes.
10. Sensor firmware for a supported concrete V1 sensor contains an implementation path and dependency list; a generic adapter remains review-required.
11. Firmware compilation is `pass` only after a configured Build Executor returns a successful compile result.
12. CAD generation is `pass` only after a configured Build Executor executes the CadQuery source and returns the expected artifacts.
13. A compiler pass does not imply remote alert/Mesh transport is complete; transport has its own validation state.
14. Authenticated users can persist project revisions in D1 and reload the latest immutable manifest at `/project/<id>`.
15. Build Pack ZIP contains project brief, requirements orchestration, research decision, intelligence architecture, BOM/sourcing state, firmware + dependencies, CAD source, build execution record, assembly guide, test procedure, validation report and project manifest.
16. Standalone, connected, Mesh-ready and Mesh-native remain explicit architecture states; Mesh-native does not imply runtime activation.
17. `/farmers` remains canonical and functionally unchanged for carrier guidance.
18. A custom build is explicitly informational-only for insurance purposes and cannot be presented as satisfying a Farmers/carrier requirement.
19. Existing plan/carrier data remains readable after migrations `0005` and `0006`.
20. Typecheck, lint, production build, built-runtime tests and regression suite pass from a clean locked dependency install before production promotion.

## v5.3 ecosystem compatibility acceptance

20. DeviceProject writes schema v4 and continues to read/normalize schema-v3 manifests.
21. Builder records normalized required capabilities separately from human-facing category/capability-family labels.
22. A Builder capability requirement does not make Mesh participation mandatory.
23. A catalog match is based on normalized capability evidence and does not imply insurance fit, ownership, verification or permission.
24. Migration `0007` remains additive; prior plan/carrier/Builder data remains readable.
