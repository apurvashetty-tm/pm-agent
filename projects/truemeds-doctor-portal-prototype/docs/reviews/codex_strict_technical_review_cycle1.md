- **Critical — §8.1, §8.5, §10.7:** Recommendation rests on unverified vendor facts: CXi Switch SDK availability, licensing, supported platforms, CallKit/ConnectionService behavior, WebRTC transport, warm transfer, webhook semantics, and Truemeds-account entitlement. Repo contains no signed contract, SDK artifact, API docs, sample integration, or vendor confirmation.  
  **Resolve:** Obtain vendor solution design, SDK/API version matrix, commercial entitlement, sandbox credentials, webhook schema, supported transfer topology, and written support commitment. Run device POC before estimation.

- **Critical — §8.5:** “React Native + native calling shell” conflates two decisions: native calling SDK integration and RN adoption. Native SDK could be integrated into an existing iOS/Android shell without RN; conversely RN does not make CallKit/ConnectionService integration safe or complete. Recommendation may select RN for reasons unsupported by calling need.  
  **Resolve:** Architecture decision record comparing: existing web shell + minimal native host; RN host + WebView; full RN; vendor-supported native app. Estimate native modules, release ownership, and migration path separately.

- **Critical — §7.3, §7.4, §8.1:** PRD assumes current customer PSTN leg can be bridged unchanged to an app-native doctor leg, including warm HA transfer. This is telephony-topology claim, not product requirement. No repo evidence proves Ozonetel supports this three-leg flow for Truemeds.  
  **Resolve:** Vendor call-flow diagram plus POC covering doctor VoIP ↔ customer PSTN ↔ HA transfer, failed transfer, HA busy, disconnect ownership, recording, and per-leg events.

- **Critical — §7.2, §7.5, §10.3, §10.6:** No authoritative call-state protocol. Webhooks can be late, duplicated, missing, or arrive out of order; app and SDK callbacks can disagree. PRD names states but not transition rules, event IDs, sequence numbers, idempotency keys, source precedence, reconciliation job, or terminal-state conflict handling.  
  **Resolve:** Define server-owned state machine, allowed transitions, event envelope, dedupe/replay policy, retry/dead-letter behavior, and reconciliation against provider call-detail records.

- **Critical — §7.2, §7.5, §10.6, OQ-001:** Valid-call gate is not implementable safely. “Webhook-reported connect/disconnect timestamps” lacks definition of connected leg, clock authority, hold treatment, reconnect accumulation, transfer treatment, callback timeout, and dispute correction. OQ-001 remains open while gate is locked.  
  **Resolve:** Lock duration algorithm and server test vectors: customer+doctor bridged definition, pauses, reconnects, duplicate events, webhook delay, transfer, and provider timestamp trust.

- **Critical — R1 / §4 G2 / `project_truth.md` §4:** Reject flow contradicts locked gate. Project truth says final operational CTAs must not appear before valid connected call; R1 permits pre-call Reject for Schedule X and says reject requires only an attempt for other reasons. R1 acceptance also rejects Schedule-X case without a call.  
  **Resolve:** Explicitly approve clinical-rejection exception to gate, or require valid call for every rejection. Define which reasons are clinically valid without patient interaction.

- **Critical — R1 §6, §10.5:** Reject taxonomy copied from competitor SOP has no Truemeds medical, legal, or operations validation. “Cannot prescribe over teleconsultation,” Schedule X, narcotic, animal, retail-shop, duplicate-Rx, and escalation consequences are legal/clinical assertions.  
  **Resolve:** India-qualified Medical/Compliance/Legal sign-off on taxonomy, allowed prescribing paths, mandatory notes/evidence, retention, escalation owner, and patient/Ops communication templates.

- **Critical — §10.5:** Masked UI plus server-side dial resolution is insufficient privacy design. No authorization model for call-token issuance, case/doctor binding, token TTL/revocation, device binding, replay protection, rooted-device policy, TLS pinning decision, logs/crash-report redaction, or provider data-processing boundaries.  
  **Resolve:** Threat model and security design covering token lifecycle, API authorization, telemetry redaction, vendor data flows, mobile hardening, incident response, and audit retention.

- **Critical — §8.3, §10.5:** RN-WebView bridge attack surface absent. If WebView sends call controls, case IDs, tokens, or disposition state through `postMessage`/injected JS, any XSS, compromised web content, navigation escape, or weak origin validation can invoke native call actions or exfiltrate protected data.  
  **Resolve:** Specify fixed allowlisted origin, no arbitrary navigation, strict message schema/versioning, per-message authorization, no tokens in DOM/JS, bridge disablement outside trusted origin, CSP, and penetration testing.

- **Major — §7.4:** Background requirement ignores incoming-call prerequisites. Microphone alone insufficient: notification permission, FCM/APNs registration, iOS VoIP-push/PushKit policy, Android notification channels and foreground-service/full-screen-intent constraints, token refresh, denied-notification behavior, and app-killed handling absent.  
  **Resolve:** Platform permission and incoming-call matrix with OS-version support, denial recovery, provider push payload contract, and physical-device acceptance tests.

- **Major — §7.4, §7.6 AC2:** “Call survives backgrounding” and “locking screen does not drop call” are requirements, not implementation details. PRD lacks iOS audio background mode, CallKit call-provider lifecycle, Android foreground service/ConnectionService policy, battery optimization, OEM-kill behavior, and app force-quit behavior.  
  **Resolve:** Define supported lifecycle guarantees versus unsupported force-quit/OS-kill outcomes, recovery screen, server reconciliation, and OEM/device test matrix.

- **Major — §7.4:** Audio routing requirement is materially underspecified. “Route through OS audio session APIs” does not define speaker default, Bluetooth HFP/A2DP transitions, wired headset insertion/removal, mute state, route-change interruption, audio focus loss, phone-call interruption, and hearing-aid behavior.  
  **Resolve:** Audio-route state table, native SDK capability proof, UX requirements for speaker/route control, and route-change tests on Android/iOS devices.

- **Major — §7.5:** Instrumentation contract omits events needed to debug and reconcile production calls: SDK initialized/auth failed, permission requested/granted/denied, push received, ringing, customer/doctor/HA leg IDs and states, ICE/media/audio failures, route changes, app lifecycle, provider webhook receipt/duplicate/rejected, token refresh, provider error code, reconnect success, and transfer rollback.  
  **Resolve:** Versioned event schema with actor, source, correlation IDs, event ID, provider error code, delivery status, and privacy classification.

- **Major — §7.6 AC1–AC4, §13.1:** Acceptance criteria cannot be objectively QA-tested as written. “Entirely within app,” “does not drop,” “warm transfer,” “fires correctly,” and “all 6 scenarios” lack device/OS matrix, network conditions, measurable timeout, expected provider records, test accounts, and oracle for success.  
  **Resolve:** Convert each AC into deterministic Given/When/Then cases with observable server, SDK, and UI assertions.

- **Major — §8.2:** Option A analysis overstates some WebView conclusions as universal. WebView WebRTC can use native-shell permission handling, audio configuration, foreground service/background-audio support, and custom CallKit/ConnectionService integration. That makes Option A harder, not automatically impossible.  
  **Resolve:** Reframe as capability requiring custom native work; compare measured POC outcomes against vendor SDK path.

- **Major — §8.3–§8.4:** Option B understates RN cost/risk: bridge reliability during active calls, JS-thread stalls, WebView↔native synchronization after process recreation, native-module/version drift, RN upgrade burden, app-size increase, release coupling, and iOS/Android debugging ownership.  
  **Resolve:** Add RN-specific risk register, owner, version policy, CI/device tests, crash/ANR budget, and fallback if bridge unavailable mid-call.

- **Major — §8.4:** “Option B meets target natively” and “vendor SDK supports app-to-app/multi-leg” are unsupported certainty. Native SDK may still fail policy, account configuration, call-quality, or transfer requirements.  
  **Resolve:** Mark conditional pending POC; recommendation must have explicit kill criteria.

- **Major — §10.3 / §10.6:** Missing backend races: two doctors act on same case; doctor submits disposition while provider reports late disconnect; transfer completes after doctor retries; callback and reject race; token/session expires; reassignment during call; provider timeout after local completion; client retries duplicate terminal action.  
  **Resolve:** Case-version/lease model, optimistic concurrency rules, idempotent terminal APIs, conflict response UX, and reconciliation ownership.

- **Major — §10.3 / §10.4:** API contract lacks endpoints, payloads, ownership, authorization, idempotency, error codes, SLAs, and async handoff acknowledgements for calling, transfer, Super Doctor, Ops cancellation, callback, diagnosis, and audit. R1–R7 cannot be estimated from named fields alone.  
  **Resolve:** API contract pack and dependency owners before engineering estimate.

- **Major — §10.6:** Call recovery lacks app-restart and provider-reconciliation flow. No behavior for app process killed, device rebooted, force-quit, SDK session restored, stale active call, missed webhook, or call ending while client offline.  
  **Resolve:** “Resume consultation” design driven by server call state, recovery timeouts, and provider call-detail reconciliation.

- **Major — §10.5:** Recording is treated as optional while `call.recording_available` is instrumented. No decision on patient/doctor disclosure, consent, storage region, access control, retention/deletion, export, audit, or whether provider recording is permitted.  
  **Resolve:** Compliance decision before architecture lock; recording changes vendor, token, data-retention, and UI scope.

- **Major — §4 G2, §10.6, session handoff:** “No case abandoned” conflicts with prototype’s unverified terminal Schedule Callback behavior. Handoff explicitly labels callback completion/removal from queue a mock assumption; PRD treats it as terminal disposition.  
  **Resolve:** Confirm callback queue ownership, assignment release, retry policy, and whether callback is terminal versus pending.

- **Major — R2 / §10.4 / §13.1:** Diagnosis and allergy requirements claim `CONFIRMED`, while taxonomy and allergy semantics remain unresolved. “Non-unknown allergy status where allergies are declared” is logically unclear and cannot validate unknown status, free text, or absence of patient response.  
  **Resolve:** Medical-approved vocabulary, validation rules, provenance, edit/lock policy, and clinical audit requirements.

- **Minor — §7.3:** “VoIP/WebRTC-equivalent” is ambiguous technical language. SDK may use neither browser WebRTC nor a doctor-leg transport product can describe generically.  
  **Resolve:** Use exact vendor transport and ownership terms from verified integration docs.

- **Minor — §7.6 AC1 versus §7.4:** “No OS native phone dialler UI ever appearing” conflicts ambiguously with required CallKit lock-screen banner / Android incoming-call UI. QA cannot know whether system call UI is forbidden or required.  
  **Resolve:** State: no PSTN dialler; system-managed VoIP call UI permitted/required.

- **Minor — prototype evidence:** `app.js` is vanilla browser simulation: client `setInterval`, simulated webhook buttons, inline DOM handlers, no native bridge, no SDK, no build/host app. It validates UX only; it provides zero evidence for WebView, RN, Ozonetel, lifecycle, or platform claims.  
  **Resolve:** Treat prototype reuse as visual/UI reuse only. Do not use it to lower architecture estimate.

**Verdict:** Biggest risk: §8.5 treats unverified Ozonetel SDK/product-fit claims as architecture facts, then mistakes “native SDK” for “RN shell.” Option A is better only if a vendor-supported browser/WebView call path can meet required customer bridge, HA transfer, lifecycle, audio routing, security, and compliance requirements in a physical-device POC—or if product explicitly relaxes background, lock-screen, and warm-transfer requirements.