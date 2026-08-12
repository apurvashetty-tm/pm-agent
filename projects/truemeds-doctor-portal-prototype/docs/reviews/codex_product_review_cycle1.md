- **Severity: Critical — PRD sections 7, 10.2–10.3, 11, 13.2 OQ-New-7**
  
  Phase 1 depends on unconfirmed Ozonetel SDK licensing/capabilities, native SDK integration, push setup, webhook contract, and warm-transfer support. These are core-path dependencies, not estimate detail; no delivery team can give one credible t-shirt size until confirmed.
  
  **Want changed:** Split vendor/API discovery into explicit prerequisite with owner, decision date, fallback plan, and separate estimate. Do not call Phase 1 estimate-ready before this closes.

- **Severity: Critical — PRD sections 3.3, 3.4, R1, 10.3, 11.1, 13.2 OQ-New-4**
  
  “Escalate to Super Doctor” is presented as Phase 1 terminal handling, but no queue, role, assignment model, notification, ownership, or resolution outcome exists. Removing case from doctor queue without confirmed receiving system creates an operational black hole.
  
  **Want changed:** Define Phase 1 stub contract: destination system/queue ID, receiving owner, case status, acknowledgement, retry/failure behavior, visibility, and what makes escalation complete. Otherwise remove Super Doctor routing from Phase 1.

- **Severity: Critical — PRD sections 3.4, 5.2–5.4, 7, 10.3, 13.2 OQ-007**
  
  HA/CSR/Ops handoffs name destinations but lack implementable contracts. “Confirm & Forward,” failed warm-transfer fallback, callback queue, and rejection-triggered cancellation have no API acknowledgement, idempotency, retry, receiving-state, or responsibility for failure; Transfer vs Forward remains explicitly unconfirmed in locked truth.
  
  **Want changed:** Add handoff state contracts for each destination: payload, owner, trigger, accepted/failed/retried states, case locking, audit event, and doctor-facing result. Lock Transfer vs Forward with HA/Ops before build.

- **Severity: Major — PRD sections 5.2, 5.4, R1–R3, 10.6, 13.1**
  
  State machine lacks submission and handoff states: `submitting`, `submission_failed`, `handoff_pending`, `handoff_accepted`, `handoff_failed`, stale assignment, and recovery after a post-gate call ends before review. It calls rejection/callback terminal while both may only be requests awaiting downstream work.
  
  **Want changed:** Define complete transition table with actor, source of truth, allowed actions, API failure recovery, and terminal-state definition.

- **Severity: Major — PRD sections 3.4, R2, 11, 13.2 OQ-004/OQ-005/OQ-011**
  
  PRD makes medicine add, disable, and broad clinical edits Phase 1 behavior while locked truth says medicine add/remove authority and notes locking must never be invented. It retains a “permissive placeholder” for quantity/strength edits in a production-oriented Phase 1.
  
  **Want changed:** Get Medical/Product authorization for every medicine mutation and note-lock rule, or constrain Phase 1 to clearly safe read-only/edit capabilities.

- **Severity: Major — PRD section R2, sections 10.4, 13.1, 13.2 OQ-New-3**
  
  Diagnosis is mandatory but taxonomy is unknown; allergy requirements conflict. R2 permits `Unknown`, while section 13 requires non-unknown allergy status in unclear wording; no validation, coding, audit amendment, or post-submit correction policy exists.
  
  **Want changed:** Lock minimum diagnosis/allergy data contract, valid values, “unknown” policy, edit/lock timing, and clinical sign-off before estimation.

- **Severity: Major — PRD sections R1, 10.3, 13.2 OQ-New-2**
  
  Reject taxonomy drives clinical escalation and commercial cancellation but is adapted from competitor SOP, not Truemeds policy. “After at least one call attempt” has exceptions, but reason-level eligibility, required notes, patient notification, cancellation acknowledgement, and reversal/escalation handling remain unspecified.
  
  **Want changed:** Medical/Compliance and Ops must approve taxonomy plus each reason’s eligibility, required evidence, receiving queue, final disposition, and audit payload.

- **Severity: Major — PRD sections 3.4, R4, 4 G4, 9**
  
  Scope conflicts on substitution pricing. G4 promises zero pricing/substitution-merchandising UI, while R4 exposes substitute name and price delta; matrix says doctor should not handle brand/price selection. This leaves frontend unclear what data may display and what consent means operationally.
  
  **Want changed:** Choose one explicit boundary: clinical substitute consent with no price information, or defined read-only price information. Specify downstream behavior for Keep Original/Approve Substitute.

- **Severity: Major — PRD sections 7, 8, 10.2, 11**
  
  “Thin React Native shell” is a sizeable mobile platform product: native app lifecycle, signing/release, auth, bridge reliability, CallKit/ConnectionService, push, Android foreground service, iOS permissions, observability, and support model. Calling this Phase 1 while preserving a three-file no-build-step prototype obscures work instead of reducing it.
  
  **Want changed:** Separate web UI estimate from mobile-shell, telephony, backend, and QA estimates; define mobile ownership, supported OS versions, release path, and bridge contract.

- **Severity: Major — PRD sections 12–13**
  
  Metrics list useful signals but no baseline, target, measurement window, owner, dashboard, or numeric rollback threshold. “Materially below” and “stable” cannot determine release readiness; acceptance only checks event firing, not event correctness, delivery, or reconciliation.
  
  **Want changed:** Add Phase 1 launch SLOs and release gates: call-connect rate, gate-calculation correctness, transfer success, webhook latency, crash rate, terminal-disposition integrity, and audit-event reconciliation.

- **Severity: Minor — PRD sections 9, R1–R4**
  
  UX decisions mostly reuse existing tokens well, but “expert” rationale is thin for clinical-risk moments. No loading/offline/error interaction patterns, focus management for sheets, accessible error announcement, or protection against destructive mis-taps are specified.
  
  **Want changed:** Add interaction specs for validation, submit-in-progress, failed handoff, native-call disconnect, bottom-sheet accessibility, and destructive-action recovery.

- **Severity: Minor — PRD sections 1–13**
  
  Document repeats scope-removal, valid-call gate, and calling rationale across executive summary, goals, matrix, requirements, technical section, and Phase split. Repetition makes core decisions harder to locate during estimation.
  
  **Want changed:** Keep one canonical ownership matrix, state machine, dependency list, and Phase table; cross-reference elsewhere.

**Overall verdict:** Not ready for engineering estimation as-is. Product direction and retained CTA routing are solid, but Phase 1’s telephony vendor dependency, Super Doctor destination, clinical authority, and HA/CSR/Ops handoff contracts remain open. Estimate discovery separately; estimate build only after those decisions lock.