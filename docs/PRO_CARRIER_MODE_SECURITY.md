# SmartDevices Pro carrier mode security

Production access requires both an authenticated platform user and a current active professional grant in the server-only `SMARTDEVICES_PRO_AUTH_JSON` environment value. Missing, malformed, absent, suspended, or expired grants fail closed. Demo mode is explicitly local-only and must remain disabled in production.

The client receives a projected carrier payload containing current reviewed public sources, programs, rules, classes, and fits only. Restricted source references never enter the client component. Carrier, jurisdiction, intent, capability, evidence version, and products are selected from governed values. SmartDevices remains primary and professional/agency identification secondary.
