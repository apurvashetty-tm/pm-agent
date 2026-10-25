# Doctor Portal — app logic

**Status:** DRAFT for Apurva's review (2026-10-16). Not approved yet. Flags 2, 3, 5, 6 answered by Apurva on 2026-10-16 (see each flag); calling screens to be redesigned in a separate thread (§5a).
**What this is:** every rule the app follows, taken out of the old prototype (`index.html` + `app.js`) and checked against the locked rules (`docs/context/project_truth.md`) and the decision log (D-01 to D-55). It is the logic half of the rebuild spec; the look is in `ui-screens/` (pictures) and `design-system/RULES.md`.
**How to read it:** `[LOCKED]` = decided, build exactly this · `[MOCK]` = prototype placeholder, the real value comes from the backend · `[OPEN]` = not decided, see the linked question · **⚠ Flag** = the old code and the decisions disagree, or a rule was never written down — needs Apurva before the rebuild.

All on-screen text comes from `ui-screens/feedback/messages.json`. Error, offline and busy states for every screen: `docs/feedback-state-map.md`.

---

## 1. The app in one line per screen

| Screen | Job | Pictures |
|---|---|---|
| Sign-in | Enter a mobile number, get an OTP | `ui-screens/sign-in/` |
| OTP | Enter the 4-digit code | `ui-screens/otp/` |
| Faster sign-in offer | Turn on fingerprint / Face ID after the first OTP sign-in | `ui-screens/faster-signin-offer/` |
| Returning unlock | Open the app with fingerprint / Face ID | `ui-screens/returning-unlock/` |
| Home | Set availability, request a case, see time left | `ui-screens/home/` |
| Case page | Review, call, prescribe, close the case | `ui-screens/case/` |
| Prescribe | Edit one medicine | `ui-screens/case/` (`d-*`) |
| Rx viewer | Read the customer's prescription | `ui-screens/case/` (`a-rx-viewer`, `d-rx-failed`) |

Order on first use: Sign-in → OTP → (offer, once) → Home → Case. Returning doctor with faster sign-in on: Unlock → Home. A doctor with a case open goes straight back into the case (D-48).

---

## 2. Sign-in and OTP `[LOCKED]` (D-33, D-34, D-35, D-39, D-44, D-46)

**Mobile number**
- Typing and pasting are cleaned: "+91 98765-43210", "098765 43210" → `9876543210`. A leading 0 or 91 is dropped.
- Checks, most basic first: empty → "Enter your mobile number." · first digit not 6/7/8/9 → "Mobile numbers start with 6, 7, 8 or 9." (shown as soon as it's typed) · fewer than 10 digits → "Enter all 10 digits." (shown on Send OTP). Once an error shows, it re-checks on every keystroke.
- After sending, server results show as a notice: not registered (with the sign-up route), offline, couldn't send, too many attempts (button counts down "Try again in m:ss"), account inactive (button becomes **Call Doctor Ops**).

**OTP**
- 4 digits, keyboard opens on load and stays open while verifying. No auto-verify: the doctor taps **Verify & sign in**.
- Wrong code: digits stay visible with red borders; the first new keystroke replaces the whole code. From 2 tries left the message counts tries ("That code isn't right. 2 tries left.").
- **5** server-confirmed wrong codes lock **that mobile number** (not the account) `[LOCKED D-34]`. Lock length `[MOCK 15 min, OPEN OQ-017]`. Change number stays available; another number works only if Doctor Ops approved it for this doctor.
- **4** codes per number per limit window (first code + 3 resends), not reset by restarting sign-in `[LOCKED D-35]`. Window length `[MOCK 10 min, OPEN OQ-017]`.
- Resend waits `[MOCK]` 30 s, then 60 s, then 120 s. Resend line hidden when resends are used up or the number is locked.
- Expired code: Resend is available at once; the expired code can't be verified.
- All OTP limits are enforced by the server; the app only shows them.

**Faster sign-in** (D-45, D-47)
- Offered once, on its own screen, after the first successful OTP sign-in on a phone that supports it and has it off. **Turn on** → phone prompt → Home. Cancel or failure → Home, no error. **Not now** → Home; offered again later `[OPEN OQ-023]`; always available in Profile.
- Returning unlock: the phone's own prompt; 3 failed tries → fall back to OTP `[MOCK]`. "Not you? Switch account" → sign-in. If unavailable: neutral notice, **Use OTP instead** becomes the main button.
- Wording follows the phone ("Face ID" / "fingerprint"); never suggest Truemeds stores biometric data.

---

## 3. Home and availability `[LOCKED]` (D-36, D-40, D-47, D-53)

- Home answers "Am I taking cases right now, and what do I do next?" Nothing is pushed: the doctor **requests** a case (pull model).
- **Set availability:** quick picks 15 / 30 / 45 min, 1 / 2 / 3 hours, plus the wheel (hours and minutes, 15-minute steps). Minimum **15 minutes**, any start time, no maximum (24/7). Confirm starts the countdown.
- **Time remaining:** h:mm:ss from one hour up (1:00:00), m:ss below (9:42). Shows 0:00 when it has ended (D-53, 2026-10-15).
- **Request a case** while time remains. A request made before the window ends is honoured even if the case arrives after.
- **Add time:** shown when time is running low (near expiry, `[MOCK]` 5 min); same picker in a sheet; "Time added" toast.
- **End availability:** confirmation sheet. If a request is pending: no new requests, the pending one is honoured, availability ends after it resolves and any assigned case closes ("Ending availability", no time row).
- **Window ends during a case:** the case is never interrupted. The ending card then offers only **Back to Home**; Home shows the ended state.
- **Prescriptions today:** a count only, no earnings. A case counts when its prescription is confirmed. It stays visible after availability ends.
- **No cases:** neutral notice "No cases right now. Try again in a minute." Auto re-check `[OPEN OQ-019]`.
- Notifications bell and Help on Home; the bell never inside a case. Profile holds Wallet · Coming soon, faster sign-in and Logout.
- One phone active at a time. Session stays valid through an open case (no OTP over a live case).

**Source:** approved screens in `ui-screens/home/`; reference behaviour in `ui-screens/home/home-reference.js`.

---

## 4. The case journey `[LOCKED]` (project_truth §3–4, D-48–D-56)

**Stages** (calling stages follow the state table in §5; state IDs in brackets):

| Stage | What the doctor sees | Bar (top → bottom) | Header Back / phone back |
|---|---|---|---|
| Ready to call (`call.ready`) | Order details + View Rx, medicines, notes, Call card | **Call patient** | Back before the first attempted call: **not decided** (Release, D-48, reopened — D-58) |
| Calling and connecting (`call.calling-you`, `call.connecting`) | Same | Busy button (§5 table) | Back hidden; phone back → toast "Finish this case first. Then you can go back to Home." |
| On call (`call.on-call`, `call.on-call-transfer`) | Call card with the end-of-call script moves above the medicines | **On call…** busy, static phone icon, no button (other cases) · or notice + **Callback** (transfer cases). **No End call** — the doctor ends the call on the phone | Blocked, as above |
| Call not valid (`call.ended-early`, `call.result-missing`) | Call card back below the medicines | Notice · **Call again** · then **Callback** · **Unavailable** side by side | Blocked |
| After 50 s (`call.valid`, `call.transfer-ready`) | Call card with script on top | Final button (§6) · 📅 **Callback** · ⏭ **Skip HA** (only when allowed, §6) | Blocked |
| Closed (`completed` / `unavailable`) | Outcome card directly under Order details (where the script was, D-58 point 16); content read-only and muted | **Request next case** · Back to Home (only **Back to Home**, as primary, if availability ended) | Header Back hidden; phone back → Home |

**Leaving a case:** an **attempted call** = leg 2 answered (the patient picked up) (D-58). Once a call is attempted, leaving is blocked until the case is closed (callback, unavailable, confirm). Before that, whether Back releases the case is **not decided** (D-58; OQ-024). Help stays available at every stage and is the way to reach Doctor Ops when something keeps failing. App closed or phone off mid-case → reopening goes straight back into the case `[OPEN OQ-025, backend]`.

**End-of-call script** (D-58 points 18, 21, 24 — copy keys in `messages.json`). Shown from the tap on Call while a call may be live; **hidden once the call has ended** (no one to read it to), except after a failed transfer (15) and B3, where the doctor is still on the line:
- Transfer (Pilot, Value Meds): `call.scriptTransfer` — "I'm writing your prescription now. Please stay on the line — I'll connect you to our Health Advisor."
- Forward (Pilot, Non-Value Meds): `call.scriptForward` — "I'm writing your prescription now. Our Health Advisor will call you shortly."
- Everything else (Cat4, HA skipped): `call.scriptCat4` — "I'm writing your prescription now. You can track your order in the Truemeds app."
- After a failed transfer / no Health Advisor free: `call.forwardedTell` — "I've written your prescription. Our Health Advisor isn't available right now — they'll call you back shortly."

---

## 5. Calls and the 50-second gate (D-58)

**How a call works (first release).** One telecom partner at a time (Ozonetel or Knowlarity), click-to-call. Doctor taps **Call patient** → the partner rings the **doctor's phone first** (leg 1) → then the **patient** (leg 2). The doctor talks and ends the call **on the phone**; there is **no End call in the app**. The partner reports leg 1 and leg 2 separately.

**Rules**
- **Gate time is a setting** (today 50 s). Every message reads it — no "50" hard-coded in copy.
- **Talk time adds up** across connected calls on the same case (each at least ~10 s, within ~30 min) — D-58 point 22. The doctor is never shown the count.
- **Attempted call** = leg 2 answered. A failed request, a doctor who didn't answer, or a patient who didn't answer is not an attempted call.
- **Transfer cases** (Pilot, Value Meds): our app counts from the moment the patient answers, while the call is live; at the gate time **Confirm & transfer** appears on the live call. Our count is the truth; the partner's duration is stored for reporting only.
- **All other cases** (Cat4, Pilot Non-Value Meds, HA skipped): the next actions unlock only when the partner's call result arrives after the call ends.
- **Before the gate, never show:** Confirm prescription, Confirm & transfer, Confirm & forward, Skip HA.
- **Leg 2 failed** (no answer, busy, rejected, unreachable, invalid number): the case closes as **Patient unavailable** by itself; the doctor gets **Request next case**. Busy and rejected are accepted as "no answer" to keep it simple.
- **A call that's too short** (state 6) offers **Call again · Callback** (D-58 point 23). No retry limit. **Callback is offered in every live call until the doctor taps a confirm button** (D-58 point 24).
- **No call result** (state 7, D-58 point 20): at 3 min the bar asks "Are you still on the call?"; after "No, call ended" and a backend check with nothing found: **Confirm prescription · Callback · Unavailable**; Confirm there shows "Prescription submitted" until the record arrives. A late result updates the screen by itself. Repeated problems → the doctor uses **Help** on the case.
- **Vendor terms are mapped by Engineering** to the buckets in the table (Ozonetel `CustomerStatus`, Knowlarity hangup causes — `projects/ACOM/ring-ai/reference/knowlarity-hangup-causes.pdf`).

**State table (final, 2026-10-24 — D-58 points 14–22).** One row per state. Render id = recipe in `docs/renders/2026-10-22-calling/src/case.html`. Copy keys in `ui-screens/feedback/messages.json`. During every call the End-of-call script shows under Order details; Callback is offered in every call.

| # | State ID | State | Trigger (from the backend, by polling) | Bar (top → bottom) | Render id |
|---|---|---|---|---|---|
| 1 | `call.ready` | Ready to call | Case opened | Call patient · header Back (leave sheet) | `t01-ready` |
| 2 | `call.calling` | Calling (whole call) = 7a | Doctor taps Call; until a result | "Calling {name}…" busy · Callback · header Back | `t02-calling` / `s7a-calling` |
| 3 | `call.not-through` | Didn't go through | Request refused, or leg-1 network/vendor error | Red notice · Call again · header Back | `t03-not-through` |
| 4 | `call.doctor-missed` | You didn't answer | Leg 1 not answered / busy / rejected | Amber notice · Call again · header Back | `t04-doctor-missed` |
| 5 | `call.result-wait` | Getting call result | Call known to have ended, result not in yet | "Getting call result…" busy · Callback | `t05-result-wait` |
| 6 | `call.ended-early` | Call too short | Result: total talk time on the case under the gate | Amber "Call too short…" · Call again · Callback (no Unavailable — D-58 point 23) | `t06-ended-early` |
| 7b | `call.still-on-call` | Still on the call? | 3 min after the tap with no result (repeats every 3 min) | Grey "Are you still on the call?" · Yes, still talking + No, call ended · header Back | `s7b-still-on-call` |
| 7c | `call.checking` | Checking call result | Doctor tapped "No, call ended" | "Checking call result…" busy | `s7c-checking` |
| 7d | `call.result-missing` | Result not received | Backend check found nothing | Amber notice · Confirm prescription · Callback + Unavailable | `s7d-result-missing` |
| 7e | — | Leave this case? | Back in 1–4, 7a, 7b | Approved sheet: Release case / Stay on this case | `s7e-leave-sheet` |
| 7f | `call.submitted` | Prescription submitted | Confirm in 7d | Grey card "Prescription submitted" · Request next case · Back to Home | `s7f-submitted` |
| 8a | `call.valid` | Valid call (Cat4 / HA skipped) | Result: total talk time ≥ gate | Confirm prescription · Callback · no script (call has ended) | `t08a-valid-cat4` |
| 8b | `call.valid` | Valid call (forward) | Same | Confirm & forward · Callback + Skip HA · no script | `t08b-valid-forward` |
| 9 | `call.patient-unavailable` | Patient unavailable (automatic) | Leg 2 failed | Grey card · Request next case · Back to Home | `t09-patient-unavailable` |
| 10a | — | Prescription confirmed | Confirm (Cat4) | Green card · Request next case · Back to Home | `t10a-confirmed` |
| 10b | — | Forwarded to HA | Confirm & forward | Green card · same | `t10b-forwarded` |
| 11 | `call.calling-transfer` | Calling, transfer case | Tap on Call; until the backend confirms validity | "Calling {name}…" busy · Callback · header Back | `t11-calling-transfer` |
| 12 | `call.transfer-ready` | Confirm & transfer | Backend: gate time since `customerAnswered`, call live | Confirm & transfer · Callback + Skip HA | `t12-transfer-ready` |
| 13 | — | Transferring | Tap on Confirm & transfer | "Transferring…" busy | `t13-connecting-ha` |
| 14 | `call.transferred` | Transferred | Transfer succeeded | Green card · Request next case · Back to Home | `t14-transferred` |
| 15 | `call.transfer-failed` | Health Advisor unavailable | Transfer failed / none free | Amber card "Forwarded to Health Advisor · Health Advisor unavailable right now. Read the script, then end the call." + script. **Request next case checks the call has ended** (D-63) | `t15-ha-no-join` |
| 15b | `call.end-call-first` | Call still live on Request next case | Tap on Request next case, backend: call not finished | Same as 15 + line in the action bar "End the call to get your next case." · Request next case stays enabled | `t15b-end-call-first` |
| 16 | `call.transfer-missed` | Ended before the transfer | Ozonetel hang-up after the gate, not transferred | Amber notice naming who ended the call (doctor / patient / unknown) · Confirm & forward · Skip HA · no script | `t16-transfer-missed` (doctor) · `t16b-…-patient` · `t16c-…-unknown` |
| 17 | `call.skip-ha-wait` | Skip HA during a transfer call | Skip HA confirmed | Grey "Health Advisor call will be skipped." · "Getting call result…" busy · Callback | `t17-skip-ha-wait` |

**Fallback B (documented, D-58 point 15):** `g1-generic-confirm` (Confirm prescription, neutral script) · `g2-checking-ha` ("Checking for a Health Advisor…") · `g3b-forwarded` (amber card "Forwarded to Health Advisor" + script; Request next case checks the call has ended, as 15b — D-63). Transfer path in B reuses 13–15.

Retired: `b-missed-call`, `b-didnt-connect` (sheets) — replaced by the automatic close and the notices. `a-leave-sheet` parked while Release is not decided. The old state name **hold** for "didn't connect" is retired (old Flag 4).

**Update 2026-10-23 (D-58 point 14, temporarily approved):** no separate Connecting / On call states; the app shows the call status within about 5 s of the partner reporting it (method: Engineering). Transfer button only after the backend confirms the call is valid.

**Dependency (Engineering):** `call.connecting`, `call.on-call*` and the transfer count need **live** leg events from the partner (leg 1 answered, leg 2 answered) during the call, not only the result at the end (OQ-030).

**Later, not this version:** in-app calling (VoIP) with real call controls; the demo may show both modes with a switch (D-56).

---

## 6. Final buttons and HA `[LOCKED]` (project_truth §4, D-50, D-54, D-57)

| Case type | HA status | Final button | Ending card |
|---|---|---|---|
| Cat4 | — | Confirm prescription | Prescription confirmed |
| Pilot | HA skipped (by customer, system, or the doctor's Skip HA) | Confirm prescription | Prescription confirmed |
| Pilot | Value meds, HA required | Confirm & transfer | Transferred to HA |
| Pilot | Non-value meds, HA required | Confirm & forward | Forwarded to HA |

- **Skip HA** only after the gate, for **both Pilot types** (Value and Non-Value Meds) whenever an HA call follows the doctor call and it isn't already skipped — no other conditions (D-59). Opens the reason sheet: Patient declined HA call · Clinically not required · Repeat patient — familiar with medicines. Choosing a reason applies it at once. On a call with a result the final button becomes **Confirm prescription**; during a live transfer call the case then waits for the call result (state 17, D-58 point 14). Skip HA is also offered after a missed transfer (state 16, D-58 point 24).
- Cat4 never shows anything about HA. HA-skipped Pilot never shows Transfer or Forward.
- **Transfer vs forward** (D-57): transfer = the patient is handed to an HA on the same call; forward = an HA calls the patient back separately. A failed transfer goes as a forward; the doctor sees `call.ha-no-join`, then `call.transfer-failed` (§5, D-58).
- Confirm: button shows "Confirming…", everything else disabled, no second submit. Failure: notice in the bar "Couldn't confirm. Nothing was lost. Try again." An unclear result is checked before retrying (no double confirm).
- **Analytics:** the four rows are four different outcomes and must stay separate events — never worked out from the button text (Cat4 and HA-skipped share a label). Event names are Engineering's choice `[LOCKED D-50]`.
- What decides case type, value vs non-value, HA required and HA-skip eligibility comes from the backend `[OPEN — see CLAUDE.md "Never silently invent"]`.

✅ **Flag 5 — answered (Apurva, 2026-10-16):** Confirm is blocked while any medicine is Pending. The button stays tappable; on tap a notice in the bar says "Prescribe or disable {n} medicines first." and the page scrolls to the first Pending medicine. Applies to all three confirm buttons; Callback, Skip HA and Mark as unavailable stay allowed. *Original flag:* The old code lets the doctor confirm while some medicines are still Pending (not prescribed, not disabled). No decision covers this. Options: (a) block Confirm until every medicine is Prescribed or Disabled, with a note saying how many are left; (b) allow it, and Pending medicines are dropped from the prescription; (c) allow it with a confirmation sheet. Recommendation: (a) — a prescription with unreviewed medicines is a clinical risk.

---

## 7. Callback and Patient unavailable

**Callback** (sheet "Schedule callback"; button "📅 Callback", D-54)
- Date: Today · Tomorrow. Time `[MOCK]`: 9:00 AM, 9:30 AM, 10:00 AM, 10:30 AM, 11:00 AM, 11:30 AM, 12:00 PM, 2:00 PM, 3:00 PM, 4:00 PM, 5:00 PM, 6:00 PM. Real slots come from the backend.
- Missing choice → field error "Pick a date and a time." / "Pick a date." / "Pick a time."
- **Confirm callback** closes the case (status card "Callback today at 3:00 PM"). The case goes to the callback pool, not back to this doctor (D-36) `[MOCK: the app treats it as closed for this session]`. Save failure: notice in the sheet, choices kept.
- Available while on call, after an early hang-up, and after 50 s.

**Patient unavailable** (D-51)
- **Automatic** when leg 2 fails (§5). Otherwise from a call that isn't valid: **Unavailable** closes the case at once, no extra sheet. Status card "Patient unavailable" with a neutral icon; medicines keep their status (Pending stays Pending).

✅ **Flag 6 — answered (Apurva, 2026-10-16):** the case does go back to the queue, but the doctor is not told — no queue line anywhere. *Original flag:* the old code still opens an extra "unavailable" sheet with "Case will be reassigned to the queue". D-51 removed it; the rebuild follows D-51. Where the case goes after "unavailable" (back to the queue?) is not written in a decision — please confirm.

---

## 8. Medicines and Prescribe `[LOCKED]` (D-04, D-06, D-08–D-30, D-54)

**On the case page**: each row = icon by form, name + strength, **Qty** and status tag (Prescribed = green · Pending = yellow · Disabled = grey). No dose or duration on the case page (D-54). Tap → Prescribe. Closed case: rows read-only, no arrow.

**What the doctor can do**: prescribe (set the schedule) or disable a medicine. The doctor **cannot add medicines** and **does not set quantity** (backend) `[LOCKED D-04, D-06]`. Qty appears only on the case page rows (read-only); the Prescribe screen shows no Qty (D-56).

**Prescribe screen**
- Header: ✕, medicine name + form, **Disable**. Pinned "On prescription" line shows exactly what will print, updated on every tap.
- **How often:** Daily · Every X hours · Alt days · Weekly · Monthly · SOS only.
- **Dose by form:**

| Form | Daily slots (M / A / N) | Single dose options | Other |
|---|---|---|---|
| Tablet, capsule | 0 · ½ · 1 · 2 | ½ · 1 · 2 | — |
| Syrup | 0 · 2.5 · 5 · 10 ml | 2.5 · 5 · 10 ml | Other (ml) |
| Drops | 0 · 1 · 2 · 3 | 1 · 2 · 3 | — |
| Inhaler | 0 · 1 · 2 puffs | 1 · 2 | — |
| Injection | 0 · 1 · 2 · 3 | 1 · 2 · 3 (D-54) | Other (units) |
| Cream | — / Apply | Apply | — |

- Every X hours: 4 · 6 · 8 · 12 h (helper "4 times a day, round the clock").
- SOS only: dose + **Max doses a day** 1–4. Other schedules: optional **Also as needed (SOS)** with its own dose and **Max extra doses a day** 1–4.
- **Duration:** numbers 1–7, 10, 14, 15 + Days / Weeks / Months, or **Ongoing** (prints the backend default, `[MOCK]` 6 months). Shows "Default" or "Changed from default".
- **Food (optional):** After food · Before food · Empty stomach (tap again to clear). **Additional instructions (optional)**, printed on the prescription.
- **Checks before Prescribe:** daily schedule with no dose at all → "Choose a dose for at least one time of day." · Other picked with no valid number → "Enter the dose in ml/units." or "Use numbers only, e.g. 7.5 units." (only plain positive numbers: 7, 7.5, .5).
- **Prescribe** saves, marks the medicine Prescribed (and re-enables it if it was disabled).
- **✕ with changes** → "Discard changes?" sheet: **Discard** (red outline) on top, Keep editing below (D-54). No changes → closes at once.
- **Disable** → sheet "Disable {name}" with reasons: Cannot prescribe remotely · Contraindicated for patient · Duplicate medication · Patient declined · Wrong strength. Choosing a reason disables it at once (status Disabled). A disabled medicine is **removed from the order**; the order ships without it. If no medicine is left, the order is cancelled later (ops/backend). No extra warning for the last medicine — the reason sheet is the friction (D-59).

**Printed line** = schedule · duration · food (if chosen) · instructions (if written), e.g. "1-0-1 + SOS 1 tablet (max 2/day) · 6 months · After food".

---

## 9. Order details, Rx viewer, notes

- **Order details ⓘ** expands in its card: Order created, Expected delivery, Payment. Hidden when the order has none of these.
- **View Rx** opens the customer's prescription full screen: zoom (50–400%), rotate, reset, pinch and drag. Load failure: notice + Try again; ✕ always closes. Disabled while confirming.
- **Notes & symptoms** (D-59): Chief complaints / symptoms and Doctor notes, both optional. Editable from the moment the case opens until Confirm; typed text kept if the connection drops. **Saved only when the prescription is confirmed** — a case closed as Callback or Unavailable discards them (they are consultation notes, not a call log). Locked after Confirm. **Symptoms are printed on the prescription; Doctor notes are internal only** (doctor, HA, ops, pharmacy).

---

## 10. Errors, offline, loading

Follow `docs/feedback-state-map.md` exactly. Summary for the case page: loading = card outlines, no actions · load failed = notice + Try again · offline = yellow notice in the bar "You're offline. Reconnect to call or confirm." (D-54) · an action tried offline fails with one error notice, nothing lost · release failed = notice, doctor stays on the case.

---

## 11. Prototype-only (do not build into the real app)

- Demo controls: scenario switcher, call simulator (connected / no answer / didn't connect / switched off / wrong number), **fast-forward to 50 s**, reset.
- Mock data: the five scenarios below, patient names, order IDs, prices, the demo numbers and codes for sign-in.

| Scenario | Case type | HA | Final button |
|---|---|---|---|
| `cat4` | Cat4 | — | Confirm prescription |
| `pilot_value_meds_ha` | Pilot | Required, value meds | Confirm & transfer |
| `pilot_nonvalue_meds_ha` | Pilot | Required, non-value meds | Confirm & forward |
| `pilot_ha_skipped_customer` | Pilot | Skipped by customer | Confirm prescription |
| `pilot_ha_skipped_system` | Pilot | Skipped by system | Confirm prescription |

⚠ **Flag 7:** the old code still uses the pre-D-50 labels ("Confirm Order", "Forwarded for Review", "Order Confirmed"). The rebuild uses the approved labels in §6.

---

## 12. Open questions (not for the rebuild to invent)

OQ-017 OTP lock and window lengths · OQ-019 no-cases auto re-check · OQ-023 when to re-offer faster sign-in · OQ-024 release backend · OQ-025 restoring an open case · timer behaviour on hold (OQ-001) · transfer-failed screen (OQ-021 note) · doctor volume figures (OQ-029) · Flags 2, 3, 5, 6 above.
