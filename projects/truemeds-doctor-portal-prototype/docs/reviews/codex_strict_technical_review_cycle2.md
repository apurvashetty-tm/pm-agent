## Original Critical findings

| Finding | Status | Reason |
|---|---|---|
| Vendor capability/account entitlement unverified | Partially Resolved | §11.0 makes vendor design, entitlement, webhook docs, sandbox, written support, device POC blocking before final estimate; evidence not yet obtained. |
| Native calling layer conflated with React Native | Resolved | §8.5 now correctly separates required native calling layer from optional RN host; RN vs minimal Swift/Kotlin host requires ADR. |
| Three-leg PSTN → doctor-native → HA transfer assumed | Partially Resolved | Phase 0 requires vendor topology confirmation and physical warm-transfer POC; topology still unproven. |
| No authoritative call-state protocol | Partially Resolved | §10.3 now requires server ownership, sequencing, idempotency, dedupe, dead-letter handling, reconciliation; exact transition/event contract remains open. |
| Valid-call gate not safely implementable | Partially Resolved | Server-owned webhook gate and reconnect/out-of-order handling added; exact duration, hold, transfer, timestamp, and correction algorithm remains OQ-New-10/OQ-001. |
| Reject contradicts valid-call gate | Partially Resolved | R1 now defaults every reject reason to a call attempt; conflicting §10.6 text reopens Schedule-X pre-call rejection. |
| Reject taxonomy lacks Medical/Legal/Compliance validation | Partially Resolved | Explicit qualified sign-off blocks build; taxonomy still draft. |
| Call-token/privacy security design absent | Partially Resolved | §10.5 now names binding, TTL, revocation, device binding, hardening, and authorization; threat model and final policy remain open. |
| RN–WebView bridge attack surface absent | Partially Resolved | Strong bridge controls and penetration-test gate added; security design/review not complete. |

## Original Major findings

| Finding | Status | Reason |
|---|---|---|
| Incoming-call permissions/push/app-killed prerequisites missing | Partially Resolved | §7.4 now covers permission denial, push, lifecycle, and recovery; supported OS/device matrix remains open. |
| Background/lock-screen lifecycle underspecified | Partially Resolved | Native lifecycle requirement and restart reconciliation added; force-quit/OS-kill guarantee explicitly unresolved. |
| Audio routing underspecified | Partially Resolved | Explicit route-state-table requirement added; table and vendor/device proof still absent. |
| Production-call instrumentation incomplete | Resolved | §7.5 now includes SDK, permission, push, per-leg, media, route, lifecycle, webhook, token, IDs, and provider-error events. |
| Acceptance criteria not QA-testable | Partially Resolved | AC wording improved, but PRD explicitly defers full Given/When/Then, device/OS, network, timeout, and oracle matrix. |
| WebView option presented as impossible | Resolved | §8.2 now calls it buildable but higher-risk native-shell/custom-WebRTC work. |
| RN cost/risk understated | Partially Resolved | RN bridge/process-recreation risks now acknowledged; no owner, version policy, CI/device plan, crash/ANR budget, or bridge-failure fallback. |
| Option B/vendor multi-leg support stated too certainly | Still Open | §8.4 still says “Yes, natively” and “Native SDK supports app-to-app/multi-leg,” despite §11.0 correctly saying Phase 0 must prove it. |
| Backend race handling absent | Partially Resolved | Lease, atomic/idempotent disposition, conflict UI, and late-webhook rules added; full concurrency/transition contract still pending. |
| API contract insufficient for estimate | Partially Resolved | APIs and minimum behaviors named; payload schemas, error contract, ownership, SLAs, and destination acknowledgements remain OQ-New-11. |
| App-restart/provider reconciliation missing | Partially Resolved | §10.6 adds server-driven resume and provider reconciliation; recovery behavior remains an open decision. |
| Recording governance absent | Partially Resolved | Recording is now explicitly out-of-scope pending decision; compliance decision still required if provider recording exists or is enabled. |
| Callback terminal semantics unverified | Still Open | Callback remains terminal-for-doctor/session while queue ownership, release, retry, and completion semantics remain unresolved. |
| Diagnosis/allergy semantics unclear | Partially Resolved | Explicit Allergy Yes/No/Unknown behavior fixed; diagnosis taxonomy, provenance, and post-submit lock/edit policy remain open. |

## New Critical/Major findings introduced by revision

- **Critical — §10.6 vs R1:** Direct contradiction. R1 excludes every pre-call Reject, including Schedule X, pending owner decision; §10.6 says Rx-evident reasons “e.g. Schedule X” remain available pre-call. This can violate locked valid-call gate.

- **Major — §10.6:** Failed warm transfer automatically falls into “Confirm & Forward semantics.” PRD does not require doctor confirmation or confirmed downstream handoff before changing terminal disposition; failed transfer could silently become an unintended async clinical handoff.

## Verdict

Biggest remaining risk: Phase 1 calling architecture still rests on unproven vendor topology and account capability. §11.0 now contains right gate, but no implementation estimate or commitment should proceed until vendor confirmation plus both-platform three-leg physical-device POC pass.