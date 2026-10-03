# SmartDevices ↔ The Mesh Integration Contract

Status: architecture contract · 2026-09-16

1. SmartDevices Builder may recommend `standalone`, `connected`, `mesh-ready`, or `mesh-native`.
2. `mesh-ready` means architecture-ready only. It does not assert a live Mesh runtime, domain binding, permissions layer or agent connection.
3. `mesh-native` means Mesh behavior is part of the intended deployment model. Until a verified runtime adapter is activated, the project must expose `runtime-not-integrated` rather than implying connectivity.
4. Domain binding is `not-needed`, `optional`, `recommended`, or `required-at-deployment` according to the selected intelligence mode.
5. Device firmware must keep sensing/actuation logic separate from transport, identity, permissions and agent-facing capability adapters.
6. The Mesh must not become a requirement for devices whose value is fully delivered locally or through conventional connectivity.
7. SmartDevices `/farmers` and other carrier programs keep their own governed insurance truth state. Mesh participation does not create carrier qualification.
8. Safety boundaries remain independent of Mesh capability. Networking a device does not make a hazardous physical function safer or Builder-supported.
