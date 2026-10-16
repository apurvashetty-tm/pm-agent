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

⚠ **Flag 1:** the old `index.html` Home is the earlier "Get next order / orders closed" version. The rebuild uses the approved availability Home (`ui-screens/home/`, logic in `home-reference.js`), not the old one.

---

## 4. The case journey `[LOCKED]` (project_truth §3–6, D-48–D-55)

**Stages** (the old code's state names in brackets, for developers):

| Stage | What the doctor sees | Bar (top → bottom) | Header Back / phone back |
|---|---|---|---|
| Assigned, no call yet (`assigned`) | Order details + View Rx, medicines, notes, Call card | **Call patient** | Back → "Leave this case?" sheet → **Release case** / Stay on this case. Release → Home |
| Calling (`calling`) | Same | **Calling {first name}…** (busy) | Back hidden; phone back → toast "Finish this case first. Then you can go back to Home." |
| On call (`connected`) | Call card with the end-of-call script moves above the medicines | **End call** (solid red) · 📅 **Callback** | Blocked, as above |
| Patient didn't pick up (`no_answer`) | Sheet "Patient didn't pick up" | Sheet: **Retry call** · **Mark as unavailable**; bar notice "Patient didn't pick up." | Blocked |
| Call didn't connect (`hold`) | Sheet "Call didn't connect" | Same as above; notice "Call didn't connect." | Blocked |
| Call ended before 50 s (`assigned` + ended early) | Call card back below the medicines (hidden if empty) | Notice "Call ended before 50 seconds." · **Call again** · 📅 **Callback** | Blocked |
| After 50 s (`gate_passed`) | Call card with script on top | Final button (§6) · 📅 **Callback** · ⏭ **Skip HA** (only when allowed, §6) | Blocked |
| Closed (`completed` / `unavailable`) | Status card on top; content read-only and muted | **Request next case** · Back to Home (only **Back to Home**, as primary, if availability ended) | Header Back hidden; phone back → Home |

**Leaving a case** (D-48): release only **before the first attempted call**. From the first attempted call (even if not connected) until closed, leaving is blocked; the case must end through the flow (callback, unavailable, confirm). Help stays available at every stage. App closed or phone off mid-case → reopening goes straight back into the case `[OPEN OQ-025, backend]`. Releasing needs a backend `[OPEN OQ-024]`.

**End-of-call script** (shown in the Call card while on call and after 50 s):
- Pilot, value meds, HA required: "Please stay on the line — I'll connect you to our Health Advisor"
- Pilot, non-value meds, HA required: "Our Health Advisor will call you shortly after this consultation"
- Everything else: "I'm confirming your order now — you can track delivery and updates on the Truemeds app"
- Hidden after an early hang-up or a failed call, until the doctor calls again.

---

## 5. Calls and the 50-second gate `[LOCKED]` (project_truth §4)

- A **valid call** = connected and live for at least **50 seconds**. Only then do the final buttons appear.
- The timer starts when the call connects. At 50 s the case moves to "after 50 s" by itself; no tap needed.
- **Before 50 s, never show:** Confirm prescription, Confirm & transfer, Confirm & forward, Skip HA.
- **Always available before 50 s:** order details, View Rx, medicines (open Prescribe), notes, Call patient, Callback (while on call and after an early hang-up), Mark as unavailable (after a failed call).
- Timer pause on hold / resume on reconnect `[OPEN, project_truth §4]`.

**Call events** (from the calling service; mocked in the prototype):

| Event | Result |
|---|---|
| Connected | On call; timer starts |
| No answer | "Patient didn't pick up" sheet: Retry call / Mark as unavailable |
| Didn't connect (timeout) | "Call didn't connect" sheet: same two choices; case stays open (D-55) |
| Doctor ends the call before 50 s | "Call ended before 50 seconds" in the bar; Call again / Callback |
| 50 s reached | Final buttons appear |

✅ **Flag 2 — answered (Apurva, 2026-10-16):** switched off or wrong number → the case closes as **Patient unavailable** and the doctor gets Request next case; the lead resurfaces later (backend/ops). No reason line on the card — the doctor already heard it on the call, and hang-up causes can't be relied on. *Original flag:* The old code ends the case automatically as "Patient unavailable" for these two call results. This was never decided. Options: (a) keep: auto-close as unavailable; (b) treat them like a failed call (Retry / Mark as unavailable, doctor decides). Recommendation: (b) — the doctor stays in control, one rule for every failed call.

✅ **Flag 3 — answered (Apurva, 2026-10-16):** the doctor ends the call on the phone, not in the app (click-to-call, §5a). *Original flag:* Once the gate passes, the old code removes **End call**; the doctor can only confirm, take a callback or skip HA. In real life the call is still live (the doctor is reading the script, or the patient is being handed to the HA). Needs a decision: does the app end the call when the doctor taps the final button, or does the doctor hang up on the phone? This depends on the in-app calling design (Developer PRD §7).

⚠ **Flag 4 — naming.** The old code calls "didn't connect" **hold**; `project_truth.md` §6 uses "Hold" for *putting a case on hold*. They are different things. The rebuild should call it `didnt_connect` and keep "hold" for nothing until a hold feature is decided.

## 5a. How calls really work — two calling modes (2026-10-16)

The approved case screens assume the app controls the call. Real life differs, so the calling part is redesigned in a **separate thread** before the rebuild. Everything else in this file stays.

**Mode 1 — Phone call (Knowlarity click-to-call; first release).**
1. Doctor taps **Call patient** → the app asks Knowlarity to start the call.
2. The **doctor's phone rings first** (leg 1); the doctor answers in the phone's own call screen, outside the app.
3. Knowlarity dials the patient (leg 2) and connects them.
4. The doctor ends the call **on the phone**; there is no End call in the app.
5. Knowlarity's events tell the backend what happened (connected, duration, why it ended); the 50-second gate uses these.
- New state: **doctor didn't answer** (leg 1 not connected) → "You didn't answer the call. Try again." (Apurva to recheck with Knowlarity.)
- Screens to redo: Calling (tell the doctor to answer the incoming call), Connecting to patient, On call (timer and script, Callback, no End call), Doctor didn't answer, Call ended.

**Mode 2 — In-app call (VoIP; explored later).** The call runs inside the app over the internet, with native call controls (answer / end) on the phone. Only the **doctor's** phone needs internet and the app; the **patient gets a normal phone call** from a Truemeds number (the provider converts it). End call in the app becomes real. Needs a native app (React Native), microphone permission and a provider that supports it.

**Demo:** one prototype with a switch in the demo controls (Phone call / In-app call). Only the calling part differs; all other screens are shared.

---

## 6. Final buttons and HA `[LOCKED]` (project_truth §5, D-50, D-54)

| Case type | HA status | Final button | Ending card |
|---|---|---|---|
| Cat4 | — | Confirm prescription | Prescription confirmed |
| Pilot | HA skipped (by customer, system, or the doctor's Skip HA) | Confirm prescription | Prescription confirmed |
| Pilot | Value meds, HA required | Confirm & transfer | Transferred to HA |
| Pilot | Non-value meds, HA required | Confirm & forward | Forwarded to HA |

- **Skip HA** only after 50 s, only for Pilot with HA required and not yet skipped. Opens the reason sheet: Patient declined HA call · Clinically not required · Repeat patient — familiar with medicines. Choosing a reason applies it at once; the final button becomes **Confirm prescription**.
- Cat4 never shows anything about HA. HA-skipped Pilot never shows Transfer or Forward.
- Confirm: button shows "Confirming…", everything else disabled, no second submit. Failure: notice in the bar "Couldn't confirm. Nothing was lost. Try again." An unclear result is checked before retrying (no double confirm).
- **Analytics:** the four rows are four different outcomes and must stay separate events — never worked out from the button text (Cat4 and HA-skipped share a label). Event names are Engineering's choice `[LOCKED D-50]`.
- What decides case type, value vs non-value, HA required and HA-skip eligibility comes from the backend `[OPEN, project_truth §9]`.

✅ **Flag 5 — answered (Apurva, 2026-10-16):** Confirm is blocked while any medicine is Pending. The button stays tappable; on tap a notice in the bar says "Prescribe or disable {n} medicines first." and the page scrolls to the first Pending medicine. Applies to all three confirm buttons; Callback, Skip HA and Mark as unavailable stay allowed. *Original flag:* The old code lets the doctor confirm while some medicines are still Pending (not prescribed, not disabled). No decision covers this. Options: (a) block Confirm until every medicine is Prescribed or Disabled, with a note saying how many are left; (b) allow it, and Pending medicines are dropped from the prescription; (c) allow it with a confirmation sheet. Recommendation: (a) — a prescription with unreviewed medicines is a clinical risk.

---

## 7. Callback and Patient unavailable

**Callback** (sheet "Schedule callback"; button "📅 Callback", D-54)
- Date: Today · Tomorrow. Time `[MOCK]`: 9:00 AM, 9:30 AM, 10:00 AM, 10:30 AM, 11:00 AM, 11:30 AM, 12:00 PM, 2:00 PM, 3:00 PM, 4:00 PM, 5:00 PM, 6:00 PM. Real slots come from the backend.
- Missing choice → field error "Pick a date and a time." / "Pick a date." / "Pick a time."
- **Confirm callback** closes the case (status card "Callback today at 3:00 PM"). The case goes to the callback pool, not back to this doctor (D-36) `[MOCK: the app treats it as closed for this session]`. Save failure: notice in the sheet, choices kept.
- Available while on call, after an early hang-up, and after 50 s.

**Patient unavailable** (D-51)
- From the failed-call sheet: **Mark as unavailable** closes the case at once, no extra sheet. Status card "Patient unavailable" with a neutral icon; medicines keep their status (Pending stays Pending).

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
- **Disable** → sheet "Disable {name}" with reasons: Cannot prescribe remotely · Contraindicated for patient · Duplicate medication · Patient declined · Wrong strength. Choosing a reason disables it at once (status Disabled).

**Printed line** = schedule · duration · food (if chosen) · instructions (if written), e.g. "1-0-1 + SOS 1 tablet (max 2/day) · 6 months · After food".

---

## 9. Order details, Rx viewer, notes

- **Order details ⓘ** expands in its card: Order created, Expected delivery, Payment. Hidden when the order has none of these.
- **View Rx** opens the customer's prescription full screen: zoom (50–400%), rotate, reset, pinch and drag. Load failure: notice + Try again; ✕ always closes. Disabled while confirming.
- **Notes & symptoms:** Chief complaints / symptoms and Doctor notes, both optional, typed text kept if the connection drops. Whether notes save before the call or only after `[OPEN, project_truth §6]`; who sees notes and when they lock `[OPEN, project_truth §9]`.

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

OQ-017 OTP lock and window lengths · OQ-019 no-cases auto re-check · OQ-023 when to re-offer faster sign-in · OQ-024 release backend · OQ-025 restoring an open case · timer behaviour on hold (project_truth §4) · notes saving and visibility (project_truth §6, §9) · case type / value / HA logic (project_truth §9) · Flags 2, 3, 5, 6 above.
