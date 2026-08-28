# Plan verification event model

The additive `plan_verification_events` table prevents the inherited fulfillment field from collapsing self-report, professional review, and carrier determination. Events are append-only, source-attributed, idempotent, and role constrained. A view or outbound click is not a state transition.

Consumer events: researching, selected, purchased-self-reported, installation-scheduled, installed-self-reported. Professional events may include evidence-received and professional-reviewed. Only a carrier integration acting within an activated server-side authority boundary may record carrier-determined or carrier-unknown. A professional review is never a carrier determination.

The upload adapter accepts metadata only and is disabled. Activation requires private object storage, server authorization, malware scanning, content-type and size enforcement, retention/deletion jobs, access/audit logs, incident handling, and a reviewed privacy notice.
