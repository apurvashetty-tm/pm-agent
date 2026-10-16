# Coverage matrix: standards pass, 2026-10-15

Every screen × state for phases A–D, in journey order (checklist 7b.1). Each state is captured at **390 × 844 @2x** and **360 wide** (reviewed) and runs the guards at **430 wide** (checklist 8.3, guards only). Generated from `ui-screens/feedback/check-locked-specs.py` (`EXPECTED`); the guard fails if a state is missing or listed twice (8.1).

Sources: A `ui-screens/sign-in/`, `ui-screens/otp/` · B `ui-screens/faster-signin-offer/`, `ui-screens/returning-unlock/` · C `ui-screens/home/` · D `docs/concepts/2026-10-14-case-page/v2/concept.html` (`?s=<state>`). D new states and stress cases use the proposed copy in `ui-screens/feedback/messages.json` (marked proposed).

| State | Phase | Shows | Viewports | Status |
|---|---|---|---|---|
| `sign-in/default` | A · Sign-in, OTP | Entry; neutral SMS helper | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `sign-in/keyboard-open` | A · Sign-in, OTP | Keyboard open, partial valid entry | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `sign-in/empty-tap` | A · Sign-in, OTP | Send with empty field (F1) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `sign-in/too-short` | A · Sign-in, OTP | Send with 8 digits (F1) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `sign-in/wrong-first-digit` | A · Sign-in, OTP | Impossible prefix (F1) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `sign-in/pasted-cleaned` | A · Sign-in, OTP | Pasted number cleaned | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `sign-in/sending` | A · Sign-in, OTP | Sending OTP (L1, L2 busy primary) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `sign-in/not-registered` | A · Sign-in, OTP | Not registered (N1) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `sign-in/offline` | A · Sign-in, OTP | Offline after send (F2) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `sign-in/couldnt-send` | A · Sign-in, OTP | Send failed (F2) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `sign-in/too-many-tries` | A · Sign-in, OTP | Issuance cap (W1) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `sign-in/inactive` | A · Sign-in, OTP | Inactive account, Call Doctor Ops | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `otp/default` | A · Sign-in, OTP | Keyboard open, resend timer running | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `otp/empty-tap` | A · Sign-in, OTP | Verify with no code (F1) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `otp/too-short` | A · Sign-in, OTP | Verify with two digits (F1) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `otp/verifying` | A · Sign-in, OTP | Verifying (L1, L3 keyboard stays open) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `otp/wrong-code` | A · Sign-in, OTP | Wrong code, digits stay visible (F1) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `otp/two-tries-left` | A · Sign-in, OTP | Wrong code, two tries left (F1) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `otp/resend-available` | A · Sign-in, OTP | Resend code available | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `otp/new-code-sent` | A · Sign-in, OTP | New code sent (S1) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `otp/code-expired` | A · Sign-in, OTP | Code expired, resend at once (F1) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `otp/couldnt-verify` | A · Sign-in, OTP | Could not verify (F2) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `otp/too-many-resends` | A · Sign-in, OTP | Resend limit reached (W1) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `otp/locked` | A · Sign-in, OTP | Number locked, keyboard closed (W1) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `otp/resending` | A · Sign-in, OTP | Resending (L1) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `otp/resend-failed` | A · Sign-in, OTP | Resend failed (F2) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `otp/offline` | A · Sign-in, OTP | Offline during verify (F2) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `otp/cooldown-reconciling` | A · Sign-in, OTP | Cooldown reconciling (W1 + progress) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `otp/expired-and-resend-limited` | A · Sign-in, OTP | Expired and resend limited (W1, locked treatment) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `offer/fingerprint` | B · Offer, unlock | Faster sign-in offer, fingerprint; no Back | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `offer/face-id` | B · Offer, unlock | Faster sign-in offer, Face ID | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `offer/enabling` | B · Offer, unlock | Enabling, OS prompt pending (L2) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `unlock/fingerprint` | B · Offer, unlock | Returning unlock, fingerprint; no Back | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `unlock/face` | B · Offer, unlock | Returning unlock, Face ID | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `unlock/screen-lock` | B · Offer, unlock | Returning unlock, screen lock | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `unlock/pending` | B · Offer, unlock | OS prompt open (L2) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `unlock/cancelled` | B · Offer, unlock | Cancelled, returns unchanged | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `unlock/platform-retry` | B · Offer, unlock | Platform retry (OS-owned) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `unlock/unavailable` | B · Offer, unlock | Unlock unavailable (N1, Use OTP instead primary) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `home/setup-wheel` | C · Home | Setup, wheel and presets; minimum once | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `home/setting` | C · Home | Setting duration (L1) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `home/setup-failed` | C · Home | Setup failed (F2) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `home/active` | C · Home | Active Home, timer and Request a case | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `home/requesting` | C · Home | Requesting (L1) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `home/no-cases` | C · Home | No cases right now (N1) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `home/request-failed` | C · Home | Request failed (F2) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `home/offline` | C · Home | Offline (F2 or N1) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `home/unknown-result` | C · Home | Unknown result, reconciling (N1 + L1) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `home/near-expiry` | C · Home | Near expiry (W1), Add time shown | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `home/add-wheel` | C · Home | Add availability sheet (wheel) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `home/adding` | C · Home | Adding (L1 in sheet) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `home/add-failed` | C · Home | Add time failed (F2 in sheet) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `home/added` | C · Home | Time added toast over Home (T1) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `home/end-confirmation` | C · Home | End availability sheet (destructive, quiet) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `home/stop-pending` | C · Home | Ending availability (N1 + L1) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `home/expired-pending` | C · Home | Availability ended, request still active (N1) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `home/idle-expired` | C · Home | Idle, expired (setup) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `home/manually-ended` | C · Home | Manually ended (setup) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/b-didnt-connect` | D · Case page | Call did not connect: reason notice in the bar (D-54) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/d-injection-default` | D · Case page | Prescribe: injection default, dose 1 · 2 · 3 · Other (D-54) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/d-syrup` | D · Case page | Prescribe: syrup, ml dose (Antacid suspension) (D-54 render) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/d-drops` | D · Case page | Prescribe: eye drops (Sodium chloride eye drops) (D-54 render) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/d-cream` | D · Case page | Prescribe: cream, apply (Betamethasone cream) (D-54 render) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/d-every-x-hours` | D · Case page | Prescribe: every X hours (Metformin, 6 hours) (D-54 render) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/d-sos-only` | D · Case page | Prescribe: SOS only (Amlodipine) (D-54 render) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/d-weekly` | D · Case page | Prescribe: weekly (Atorvastatin) (D-54 render) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/d-duration-picker` | D · Case page | Prescribe: duration picker open (D-54 render) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/d-food-selected` | D · Case page | Prescribe: food chip selected (before food) (D-54 render) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/a-loading` | D · Case page | Case loading: skeleton, no actions | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/a-load-failed` | D · Case page | Case failed to load (F2, Try again) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/a-offline` | D · Case page | Offline while browsing a case (N1) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/a-top` | D · Case page | Cat4 before any call: header, content row, medicines, notes, Call patient pinned | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/a-scrolled` | D · Case page | Scrolled under the fixed header | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/a-order-details` | D · Case page | Order details expanded | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/a-notes-typing` | D · Case page | Notes focused, bar hidden while typing | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/a-rx-viewer` | D · Case page | Rx viewer (View Rx) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/d-rx-failed` | D · Case page | Rx viewer: prescription failed to load (F2) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/a-no-medicines` | D · Case page | Order with no medicines (empty state) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/a-long-content` | D · Case page | Long patient and medicine names, two-line wraps | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/s-10-medicines` | D · Case page | Stress: ten medicines | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/s-optional-empty` | D · Case page | Stress: optional fields empty (no delivery, no payment, no notes) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/b-calling` | D · Case page | Calling | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/b-on-call` | D · Case page | Connected: Schedule callback and End call | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/b-ended-early` | D · Case page | Call ended before 50 seconds | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/b-missed-call` | D · Case page | No pickup: retry sheet | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/b-patient-unavailable` | D · Case page | Mark as unavailable: straight to Patient unavailable card (D-51) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/b-post-gate-transfer` | D · Case page | Gate passed, value medicines: Confirm & transfer | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/b-post-gate-cat4` | D · Case page | Gate passed, Cat4: Confirm prescription | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/b-post-gate-forward` | D · Case page | Gate passed, non-value medicines: Confirm & forward | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/c-callback` | D · Case page | Schedule callback sheet | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/c-callback-error` | D · Case page | Schedule callback: no day or time | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/c-callback-failed` | D · Case page | Schedule callback: save failed (F2 in sheet) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/c-skip-ha` | D · Case page | Skip HA call sheet | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/a-leave-sheet` | D · Case page | Leave this case? (D-48) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/a-releasing` | D · Case page | Releasing (L1, L2 busy primary) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/a-release-failed` | D · Case page | Release failed: stays on the case (F2) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/a-back-blocked` | D · Case page | Back during a call: calm toast | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/a-confirm-busy` | D · Case page | Confirming (L1, other actions disabled) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/a-confirm-failed` | D · Case page | Confirm failed: nothing lost (F2) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/d-default` | D · Case page | Prescribe: default | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/d-scrolled` | D · Case page | Prescribe: scrolled | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/d-error-dose` | D · Case page | Prescribe: dose error (F1) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/d-error-other` | D · Case page | Prescribe: other dose not a number (F1) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/d-sos-on` | D · Case page | Prescribe: SOS on | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/d-notes-keyboard` | D · Case page | Prescribe: notes focused | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/d-discard-sheet` | D · Case page | Discard changes? sheet | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/d-disable-sheet` | D · Case page | Disable medicine sheet | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/d-header-white` | D · Case page | Prescribe: white edit header (D-51 decided) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/e-prescription-confirmed` | D · Case page | Ending: Prescription confirmed (status card) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/e-transferred` | D · Case page | Ending: Transferred to HA | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/e-forwarded` | D · Case page | Ending: Forwarded to HA | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/e-callback-scheduled` | D · Case page | Ending: Callback today at 3:00 PM | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/e-patient-unavailable` | D · Case page | Ending: Patient unavailable (neutral) | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |
| `case/e-availability-ended` | D · Case page | Ending: availability ended, Back to Home only | 390 · 360 (reviewed) · 430 (guards) | Reviewed — yet to be approved by Apurva · round 17 guards pass (390, 360, 430) |

Count: 29 A, 10 B, 19 C, 46 D · total 104 states × 3 widths.

## Guard result, final round 14 (D-53)

- All four phases: zero guard failures at 390, 360 and 430 (every auto line, every state); zero console errors; 8.1 coverage passes.
- Finals: `<phase>/final/` (round 14). Needs Apurva: `<phase>/NEEDS-APURVA.md`.
- Earlier rounds 1–13 are kept in `<phase>/round-N/`.
