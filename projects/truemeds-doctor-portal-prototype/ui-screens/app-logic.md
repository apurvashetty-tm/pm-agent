# Doctor Portal — app logic

**Status:** APPROVED and frozen — Apurva, 2026-10-31 (D-78). Covers decisions up to D-83 (calling walkthrough, applied 2026-11-03 by the calling round; CW-A1 … CW-F3, see §14). Round 4 of the fix round (2026-11-02, §13) is not yet approved. Changes from here are either a bug (fix where it occurs) or a next-version idea (backlog). Open backend dependencies stay marked `[OPEN]` with their question.
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
- The terms line stays during **Verifying…** and **Checking…**, so Verify & sign in never moves (D-81 F5, amends D-44 for those two states). The cooldown line reads "Checking…" alone, with no "Didn’t receive it?", and the boxes stay focused (D-81 F7).
- **Verify never moves (Round 5 B, Round 6 item 3):** one line is reserved under the code boxes. Every state with a one-line message (wrong code, tries left, new code sent, code expired, empty or too short, resend, cooldown) shows its message there, or nothing; Verify & sign in keeps the same place. Notice-box states (offline, locked, couldn't verify, resend failed, too many codes) may move it; accepted.
- Waiting text ("Resend in 0:30") and the Resend code link share one height, so Verify & sign in never moves when the link appears (A-03). The terms line is centred and "Terms & Conditions" never splits (A-01, A-02). "Doctor Ops" and the timer never split across lines (A-17). "New code sent." is green text with no icon, like the errors (A-21).
- Wrong code: digits stay visible with red borders; the first new keystroke replaces the whole code. The message is "Wrong code."; from 2 tries left it counts ("Wrong code. 2 tries left."), and at 1 try left it uses the singular ("Wrong code. 1 try left.") (D-81 F1; no next-step wording, D-53 pt 2).
- **5** server-confirmed wrong codes lock **that mobile number** (not the account) `[LOCKED D-34]`. Lock length `[MOCK 15 min, OPEN OQ-017]`. Change number stays available; another number works only if Doctor Ops approved it for this doctor.
- **4** codes per number per limit window (first code + 3 resends), not reset by restarting sign-in `[LOCKED D-35]`. Window length `[MOCK 10 min, OPEN OQ-017]`.
- Resend waits `[MOCK]` 30 s, then 60 s, then 120 s. Resend line hidden when resends are used up or the number is locked.
- Expired code: Resend is available at once; the expired code can't be verified.
- **Sign-in on a locked number** goes straight to OTP in the locked state (`otp_locked`): code field and Verify off, the lock time and "call Doctor Ops" shown, Change still available (D-81 F6).
- All OTP limits are enforced by the server; the app only shows them.

**Faster sign-in** (D-45, D-47)
- Offered once, on its own screen, after the first successful OTP sign-in on a phone that supports it and has it off. The footer is the action bar (Round 4, item 1); the content above it scrolls. Subtitle on one line: "Use your screen lock instead of an OTP." (A-06). **Turn on** → phone prompt → Home. **Cancelled** prompt → back to the offer, no message. **Failed** → stays on the offer; "Couldn't turn on faster sign-in." sits in the bar above Try again (A-19) · Try again · Not now (D-61, D-65). **Offline** → "You're offline. Check your connection." (D-66). **Unavailable** (the phone answers "unavailable" at Turn on) → stays on the offer, unchanged (title, subtitle, tile and the three points): the amber warning notice "Faster sign-in isn't available on this phone right now." sits in the bar (same slot as Offline and "Couldn't turn on", A-19), the primary reads **Continue** → Home and Not now is hidden; not enabled, recorded as offered, can be turned on later in Profile (D-93, state `offer_unavailable`). **Not now** → Home; offered again later `[OPEN OQ-023]`; can be turned on or off in Profile (D-69).
- **Which unlock (D-64):** fingerprint or face if set up on the phone; otherwise the phone's **screen lock** (PIN / pattern / password); if the phone has no screen lock at all, the offer is skipped.
- Returning unlock: the phone's own prompt; 3 failed tries → fall back to OTP `[MOCK]`. "Not you? Switch account" → sign-in. The footer is the action bar (Round 4, item 1); the content above it scrolls. If unavailable: "Faster sign-in isn't available on this phone right now." is a standing state, so the neutral notice stays at the top of the panel; **Use OTP instead** is the main button in the bar (A-19).
- Wording follows the phone ("Face ID" / "fingerprint"); never suggest Truemeds stores biometric data.

---

## 3. Home and availability `[LOCKED]` (D-36, D-40, D-47, D-53)
- **While Setting… or Adding…** the wheel, the duration chips, Cancel and × are disabled (D-81 F9).
- **Set availability** stays pinned to the bottom of the screen in every state, with or without a notice (D-81 F12, D-43), **inside the action bar** (Round 4, 2026-11-02, item 1). The content above the bar scrolls on short phones (at 360×640 the timer and the wheel are never clipped); the bar never covers the last content; toasts sit above the bar.
- **Time added:** 5:00 + 30 min shows 35:00 (D-81 F10).
- **End availability** is greyed out while offline; the offline notice explains (D-81 F13).
- **Log out confirm:** "Stay signed in" is quiet text, like "Keep available" (D-81 F11, RULES §9.4).

- Home answers "Am I taking cases right now, and what do I do next?" Nothing is pushed: the doctor **requests** a case (pull model).
- **Set availability:** quick picks 15 / 30 / 45 min, 1 / 2 / 3 hours, plus the wheel (hours and minutes, 15-minute steps). Minimum **15 minutes**, any start time, no maximum (24/7). Confirm starts the countdown.
- **Time remaining:** h:mm:ss from one hour up (1:00:00), m:ss below (9:42). Shows 0:00 when it has ended (D-53, 2026-10-15). The label and the timer do not move when **+ Add time** appears; Add time sits on the value row (A-09). Labels are 14 px grey (A-10).
- **Request a case** while time remains. A request made before the window ends is honoured even if the case arrives after.
- **Add time:** shown when time is running low (near expiry, `[MOCK]` 5 min); same picker in a sheet; "Time added" toast. An error in the add-time sheet sits 16 above its button, as on the page (A-12).
- **End availability:** confirmation sheet. If a request is pending: no new requests, the pending one is honoured, availability ends after it resolves and any assigned case closes ("Ending availability", no time row).
- **Window ends during a case:** the case is never interrupted. The ending card then offers only **Back to Home**; Home shows the ended state.
- **Prescriptions today:** a count only, no earnings. A case counts when its prescription is confirmed. It stays visible after availability ends.
- **Result notices on Home** ("Availability ends soon", setup / add / request failures) sit inside the action bar, above its button (RULES §9.5, A-19). "No cases right now" and offline are the bar's own action, so they sit inside the bar above the button (lane-request 7). Screen-wide standing notices (idle-expired, manually ended, expired-pending, stop-pending) stay at the top of the panel.
- **Checking…** status line in the bar is centred in the button's slot, as on the case page (A-11).
- **No cases:** neutral notice "No cases right now. Try again in a minute." Auto re-check `[OPEN OQ-019]`.
- Notifications bell, Help and Profile icons on Home; the bell never inside a case. Help's content is not designed yet (backlog).
- **Profile page** (D-70: a page, not a sheet — task header with Back, no logo; content ported from the current app with design-system fixes, D-69; full redesign later): doctor name and role · today's earnings (earned, incentive) · User manual · **Faster sign-in on/off** · **Log out** (destructive). During an open case Log out is replaced by "You can log out after this case is closed." Log out is the last item in the content (not pinned). Cards are 16 apart and Log out is 16 below the last card (A-13). The group label "Today's earnings" is 16 semibold, like the other group labels (A-20). Log out asks first in a **sheet**: "Log out? — You'll stop getting cases until you sign in again." · Log out · Stay signed in.
- **Faster sign-in toggle (D-70):** turning it **off** just switches it off (no prompt; OTP from the next sign-in). Turning it **on** opens the phone's prompt, as on the offer screen; if that fails, the toggle stays off and the page shows "Couldn't turn on faster sign-in."; cancelling leaves it off with no message. Hidden if the phone has no screen lock at all (D-64).
- One phone active at a time. Session stays valid through an open case (no OTP over a live case).

**Source:** approved screens in `ui-screens/home/`; reference behaviour in `ui-screens/home/home-reference.js`.

---

## 4. The case journey `[LOCKED]` (project_truth §3–4, D-48–D-56)

**Stages** (calling stages follow the state table in §5; state IDs in brackets):

| Stage | What the doctor sees | Bar (top → bottom) | Header Back / phone back |
|---|---|---|---|
| Ready to call (`call.ready`) | Order details + View Rx, medicines, notes (no script card before Call — D-58 pt 18, D-71) | **Call patient** | Header Back → "Leave this case?" sheet: **Release case** / Stay on this case (D-58 pt 20, OQ-024) |
| Calling — the whole call (`call.calling` 2 / 7a, `call.calling-transfer` 11) | End-of-call script in the slot under Order details, above the medicines, from the tap (D-58 pt 18) | Status line "Calling {name}…" (D-74) **only — no Callback on a live call** (CW-A1, D-83). No separate Connecting / On call states (D-58 pt 14). **No End call** — the doctor ends the call on the phone | Header Back hidden from the tap on Call patient / Call again (D-80, D-81 F21); phone back → toast "Finish this case first. Then you can go back to Home." (`a-back-blocked`) |
| Transfer ready (`call.transfer-ready` 12) | Script stays (call still live) | **Confirm & transfer** · Skip HA (full width, under it; no Callback, CW-A1) — shown only once the backend confirms gate time since the patient answered and the call is live (D-58 pt 14) | Blocked |
| Call not valid (`call.ended-early` 6, `call.result-missing` 7d) | No script — the call has ended (D-58 pt 24) | 6: notice · **Call again** · Callback (no Unavailable, D-58 pt 23) · 7d (Cat4): notice · **Confirm prescription** · Callback + Unavailable (reason sheet, D-75) · 7d (Pilot): **Confirm & forward** · Callback + Unavailable, no Skip HA (CW-D2) | Blocked |
| Valid, call ended (`call.valid` 8a / 8b) | No script — the call has ended (D-58 pt 24) | 8a: **Confirm prescription** only · 8b: **Confirm & forward** · ⏭ **Skip HA** full width (only when allowed, §6). No Callback (CW-C3) | Blocked |
| Closed (`completed` / `unavailable`) | Outcome card directly under Order details (where the script was, D-58 point 16); content read-only and muted | **Request next case** · Back to Home (only **Back to Home**, as primary, if availability ended) | Header Back hidden; phone back → Home |

**Empty case (D-80 pt 4, D-81 F23; D-83 CW-A6, K4):** no **Call patient**. An amber notice at the top of the panel says "No medicines on this order. Our Ops team will check it." (D-84; was "This order has no medicines. Release it — our Ops team will check it.") (where the released case goes is open, OQ-035). The main button is **Release case**, which releases directly (Releasing…, no sheet) and returns the doctor to Home (CW-A5). Header Back does the same. When Order details is hidden, View Rx is left-aligned (B-16).
**Call ended, outcome card (D-81 F26, retired D-83):** the "End the call to get your next case." warning is retired with state 15b; after the hang-up the card is title only, neutral (MAIN-CHECK 2, D-85; `call.forwardedAfterHangup` retired, §14).
**Bar and card rules (Round 4, 2026-11-02):** a bar notice that is the result of an action ("Couldn't confirm…", "Prescribe or disable…") sits inside the action bar above its button (RULES §9.5, A-19). Cards on the case page and Prescribe are 16 apart; the end-of-call script card has 16 padding below in every state (B-03, B-04, B-05). The callback-scheduled card uses the calendar icon and the patient-unavailable card the phone-off icon, the same icons as their buttons (B-22). A two-line patient name makes the header taller, not tighter (B-06). Long medicine titles wrap balanced (B-13).

**Leaving a case:** the back-blocked toast breaks between its two sentences (B-21). An **attempted call** = leg 2 answered (the patient picked up) (D-58). Once a call is attempted, leaving is blocked until the case is closed (callback, unavailable, confirm). Before that, header **Back** opens the "Leave this case?" sheet — **Release case** (the case returns to the queue) or Stay on this case (D-58 point 20, OQ-024; on Ready and states 3 and 4 only). Header Back is on 1, 3 and 4 only, while the patient has never been reached. It is hidden from the **Call patient** / **Call again** tap, incl. Calling 7a, the 7b question, Transfer, and the callback sheets, and never returns once the patient answered, also on a later 3 / 4 (D-80 pt 1, D-81 F21). Behind the leave sheet, Releasing… and Release failed the screen is **Ready** (D-81 F22). The backend refuses Release once our call request is accepted, unless the result is 3 or 4 (D-80). Release returns the doctor to Home (CW-A5). If the patient answered just before the tap, the backend refuses the release and the doctor stays on the case (`a-release-failed`, "Couldn't release this case. You're still on it."). The unassign action itself is a backend dependency (OQ-024). Help stays available at every stage and is the way to reach Doctor Ops when something keeps failing. App closed or phone off mid-case → reopening goes straight back into the case `[OPEN OQ-025, backend]`.

**End-of-call script** (D-58 points 18, 21, 24 — copy keys in `messages.json`). Shown from the tap on Call while a call may be live; **hidden once the call has ended** (no one to read it to), except after a failed transfer (15) and B3, where the doctor is still on the line:
- Launch B, Pilot live call (B1, neutral): `call.scriptNeutral` — "I'm writing your prescription now. Our Health Advisor will help you with the next steps."
- Transfer (Pilot, Value Meds, version A — later): `call.scriptTransfer` — "I'm writing your prescription now. Please stay on the line — I'll connect you to our Health Advisor."
- Forward (Pilot, Non-Value Meds, version A — later): `call.scriptForward` — "I'm writing your prescription now. Our Health Advisor will call you to help with the next steps."
- Everything else (Cat4, HA skipped): `call.scriptCat4` — "I'm writing your prescription now. You can track your order in the Truemeds app."
- After a failed transfer / no Health Advisor free: `call.forwardedTell` — "I've written your prescription. Our Health Advisor will call you back to help with the next steps." (one patient script for 15 and B3; the patient is never told about Health Advisor capacity).

---

## 5. Calls and the 50-second gate (D-58)

**How a call works (first release).** One telecom partner at a time (Ozonetel or Knowlarity), click-to-call. Doctor taps **Call patient** → the partner rings the **doctor's phone first** (leg 1) → then the **patient** (leg 2). The doctor talks and ends the call **on the phone**; there is **no End call in the app**. The partner reports leg 1 and leg 2 separately.

**Rules**
- **Gate time is a setting** (today 50 s). Every message reads it — no "50" hard-coded in copy.
- **Talk time adds up** across connected calls on the same case (each at least ~10 s, within ~30 min) — D-58 point 22. The doctor is never shown the count.
- **Attempted call** = leg 2 answered. A failed request, a doctor who didn't answer, or a patient who didn't answer is not an attempted call.
- **Launch B, Pilot live call:** our app counts from the moment the patient answers, while the call is live; at the gate time **Confirm prescription** (B1) appears on the live call. Our count is the truth; the partner's duration is stored for reporting only. (**Transfer cases** — Confirm & transfer on the live call, Pilot Value Meds — are version A, later.)
- **All other cases** (Cat4, HA skipped, and Pilot calls that end before the gate or have no result): the next actions unlock only when the partner's call result arrives after the call ends.
- **Before the gate, never show:** Confirm prescription, Confirm & transfer, Confirm & forward, Skip HA.
- **Patient-side failure** (leg 2: no answer, busy, rejected, switched off, unreachable, invalid number), whenever it is detected: the case closes as **Patient unavailable** (state 9) by itself and goes on **hold**; the system retries it by hangup cause (CW-B1, CW-B2). **Doctor-side failure** (the doctor's leg, or a request refused for a reason that isn't the patient's number) stays on 3 / 4 (CW-B1). The doctor gets **Request next case** on 9.
- **Transfer** (15, B3): 15 = the transfer couldn't start (no HA free, or the request failed); the doctor is still on the line. An HA who doesn't pick up is 14 for the doctor (CW-E1). While the call is live, 15 and B3 show only "Waiting for the call to end…"; after the hang-up, **Request next case · Back to Home** (CW-E3). A forward (15, B3) is confirmed only on the partner's result (CW-F2). **Launch: Fallback B first** (CW-F1).
- **A call that's too short** (state 6) offers **Call again · Callback** (D-58 point 23). No retry limit. **Callback is offered only after the call: on 6 and on 7d** (CW-A1, CW-C3). The backend refuses a callback unless the patient answered (leg 2) (CW-A1).
- **No call result** (state 7, D-58 point 20): at 3 min the bar asks "Are you still on the call?" **only when the app can't know the call has ended** (CW-D1); when the partner has already reported the hang-up, the 3-min timeout goes straight to 7c. After "Call ended" and a backend check with nothing found: **Confirm prescription** (Cat4) or **Confirm & forward** (Pilot), with **Callback · Unavailable** (CW-D2). Confirm there shows "Waiting for the call record" until the record arrives (D-68); a record under the gate, or no record after a wait time, means the prescription is **not confirmed** → hold and retry (CW-D3, CW-D4). Nothing goes to Ops. A late result updates the screen by itself. Repeated problems → the doctor uses **Help** on the case.
- **Callback on a live call is refused by the backend** unless the patient answered (leg 2); the sheet then shows "Couldn’t schedule a callback. The patient wasn’t reached." (CW-A1, K3).
- **Vendor terms are mapped by Engineering** to the buckets in the table (Ozonetel `CustomerStatus`, Knowlarity hangup causes — `projects/ACOM/ring-ai/reference/knowlarity-hangup-causes.pdf`).

**State table (final, 2026-10-24 — D-58 points 14–22; rows changed by the calling round are per D-83, see §14).** One row per state. Render id = recipe in `docs/renders/2026-10-22-calling/src/case.html`. Copy keys in `ui-screens/feedback/messages.json`. During every call the End-of-call script shows under Order details. Callback is offered only on 6 and 7d (D-83 CW-A1).

| # | State ID | State | Trigger (from the backend, by polling) | Bar (top → bottom) | Render id |
|---|---|---|---|---|---|
| 1 | `call.ready` | Ready to call | Case opened | Call patient · header Back (leave sheet) | `t01-ready` |
| 2 | `call.calling` | Calling (whole call) = 7a | Doctor taps Call; until a result | "Calling {name}…" status line only · no Callback (CW-A1) · no header Back (D-81 F21) | `t02-calling` / `s7a-calling` |
| 3 | `call.not-through` | Didn't go through | Request refused, or leg-1 network/vendor error | Red notice · Call again · header Back | `t03-not-through` |
| 4 | `call.doctor-missed` | You didn't answer | Leg 1 not answered / busy / rejected | Amber notice · Call again · header Back | `t04-doctor-missed` |
| 5 | `call.result-wait` | Getting call result | Partner reported the hang-up (Pilot), result not in yet. Cat4 never reaches 5 (CW-C2) | "Getting call result…" status line only · no Callback (CW-C1) | `t05-result-wait` |
| 6 | `call.ended-early` | Call too short | Result: total talk time on the case under the gate | Amber "Call too short…" · Call again · Callback (no Unavailable — D-58 point 23) | `t06-ended-early` |
| 7b | `call.still-on-call` | Still on the call? | 3 min after the tap with no result (repeats every 3 min) | Grey "Are you still on the call?" · Still talking + Call ended · no header Back (D-81 F21) | `s7b-still-on-call` |
| 7c | `call.checking` | Checking call result (logic step) | Doctor tapped "Call ended", or the 3-min timeout after a reported hang-up; the app asks the backend for the call record — found → result path, nothing found → 7d | **Same screen as 5** (D-91): "Getting call result…" status line (`call.resultWait`), normal bar height, no script, no buttons | `t05-result-wait` |
| 7d | `call.result-missing` | Result not received | Backend check found nothing; the call has ended | Amber notice · Cat4: **Confirm prescription** · Callback + Unavailable · Pilot (`s7d-result-missing-pilot`): **Confirm & forward** · Callback + Unavailable · no Skip HA (CW-D2). Unavailable opens the reason sheet (D-75); **the chosen reason is saved with the case** for Ops monitoring (D-73) | `s7d-result-missing` / `s7d-result-missing-pilot` |
| 7e | — | Leave this case? | Back in 1, 3, 4 only (D-80, D-83) | Approved sheet: Release case / Stay. Release returns to Home (CW-A5) | `s7e-leave-sheet` |
| 7f | `call.submitted` | Waiting for the call record | Confirm in 7d (or Confirm & forward on the Pilot route) | Grey card "Waiting for the call record · Your prescription is saved. We'll confirm it once the record arrives." (D-68); On the Cat4 route it becomes "Prescription confirmed" (10a) when the record arrives; on the Pilot route (Confirm & forward on 7d) it becomes **10b Forwarded to Health Advisor** (D-89, Q-A). **Under the gate, the patient never answered, or no record after a wait time (setting)** → not confirmed, back through hold and retry; no Ops review queue (CW-D3, CW-D4) · Request next case · Back to Home | `s7f-submitted` |
| 8a | `call.valid` | Valid call (Cat4 / HA skipped) | Result: total talk time ≥ gate | Confirm prescription only · no Callback (CW-C3) · no script (call has ended) | `t08a-valid-cat4` |
| 8b | `call.valid` | Valid call (forward) | Same | Confirm & forward · Skip HA (full width) · no Callback (CW-C3) · no script | `t08b-valid-forward` |
| 8c | `case.confirm-blocked` | Confirm tapped with Pending medicines | Tap on any confirm button while a medicine is Pending (Flag 5) | Confirm prescription only, plus a red line "Prescribe or disable {n} medicines first."; page scrolls to the first Pending medicine; button stays tappable; no Callback (CW-C3) | `t08c-confirm-blocked` |
| 9 | `call.patient-unavailable` | Patient unavailable (automatic) | Leg 2 failed | Grey card · Request next case · Back to Home | `t09-patient-unavailable` |
| 10a | — | Prescription confirmed | Confirm (Cat4) | Green card · Request next case · Back to Home | `t10a-confirmed` |
| 10b | — | Forwarded to HA | Confirm & forward | Green card · same | `t10b-forwarded` |
| 11 | `call.calling-transfer` | Calling, transfer case (later version A) | Tap on Call; until the backend confirms validity | "Calling {name}…" status line only · no Callback (CW-A1) · no header Back (D-81 F21) | `t11-calling-transfer` |
| 12 | `call.transfer-ready` | Confirm & transfer | Backend: gate time since `customerAnswered`, call live | Confirm & transfer · Skip HA (full width) · no Callback (CW-A1) | `t12-transfer-ready` |
| 13 | — | Transferring | Tap on Confirm & transfer | "Transferring…" busy · Skip HA greyed and disabled (full width, K13) · no Callback | `t13-connecting-ha` |
| 14 | `call.transferred` | Transferred | Transfer succeeded | Green card · Request next case · Back to Home | `t14-transferred` |
| 15 | `call.transfer-failed` | Health Advisor unavailable | Transfer couldn't start: no HA free, or the request failed; doctor still on the line (CW-E1) | Amber card "Forwarded to Health Advisor · Read the script, then end the call." (`call.transferFailed`) + script. **Live: "Waiting for the call to end…" only** (CW-E3) | `t15-ha-no-join` |
| 15 (after the hang-up) | — | **Neutral grey card (info icon), title only** "Forwarded to Health Advisor", no body line (MAIN-CHECK 2 item 3, D-85; tone neutral, not amber: nothing left to act on, CW-F2); **no script card**; Medicines card moves up | Partner reports the hang-up | Request next case · Back to Home (CW-E3, main-check 1 M1) | `t15-after-hangup` |
| 15b | retired (D-83, CW-E3) | — | — | Retired: the line "End the call to get your next case." and its button are gone; 15 and B3 wait for the hang-up instead. | `t15b-end-call-first` removed |
| 16 | `call.transfer-missed` | Ended before the transfer | Ozonetel hang-up after the gate, not transferred | Amber notice naming who ended the call (doctor / patient / unknown) · Confirm & forward · Skip HA · no script | `t16-transfer-missed` (doctor) · `t16b-…-patient` · `t16c-…-unknown` |
| 17 | `call.skip-ha-wait` | Skip HA during a transfer call | Skip HA confirmed | Grey "Health Advisor call will be skipped. End the call when you’re done." (`call.skipHa`, D-85) · status line "Getting call result…" only (no "Calling {name}…", no buttons, no header Back), then Confirm prescription on the result (CW-E2) · no Callback | `t17-skip-ha-wait` |

**Fallback B = the launch Pilot flow (CW-F1, D-83; was the documented fallback, D-58 point 15):** `g0-calling-pilot` (B1 before the gate: "Calling {name}…" status line, neutral script, no Callback) · `g1-generic-confirm` (B1: Confirm prescription · Skip HA full width, neutral script) · `g2-checking-ha` ("Checking for a Health Advisor…", Skip HA greyed and disabled) · `g3b-forwarded` (amber card "Forwarded to Health Advisor" + script; while live the bar shows "Waiting for the call to end…", then, after the hang-up, no script and the card is title only, neutral (MAIN-CHECK 2, D-85), with Request next case · Back to Home: `g3b-after-hangup`, CW-E3, main-check 1 M1). A call that ends after the gate and before Confirm → 16 (CW-F3). Transfer path in B reuses 13–15.

Retired: `b-missed-call`, `b-didnt-connect` (sheets) — replaced by the automatic close and the notices. `a-leave-sheet` / `s7e-leave-sheet` is the approved Release sheet (D-58 point 20). The old state name **hold** for "didn't connect" is retired (old Flag 4).

**Update 2026-10-23 (D-58 point 14, temporarily approved):** no separate Connecting / On call states; the app shows the call status within about 5 s of the partner reporting it (method: Engineering). Transfer button only after the backend confirms the call is valid.

**Dependency (Engineering):** the app gets call status by polling the backend (D-58 pt 19). Hiding Back once the patient answers and the transfer count both need **live** leg events from the partner during the call (leg 1 answered, leg 2 answered / Ozonetel `customerAnswered`), not only the result at the end (OQ-030).

**Later, not this version:** in-app calling (VoIP) with real call controls; the demo may show both modes with a switch (D-56).

---

## 6. Final buttons and HA `[LOCKED]` (project_truth §4, D-50, D-54, D-57)
- **Confirming… / Transferring… (D-81 F24–F25):** medicine rows and notes are read-only and muted, with no arrows. View Rx stays the outlined button (D-76).


**Launch = Fallback B (D-83 CW-F1, D-85; Apurva 2026-11-03: the one Pilot flow).** Pilot live call → **Confirm prescription** (B1) → B2 checks for an HA → free: Transferring → **Transferred** (14) · none: **Forwarded** (B3). Pilot call ended before Confirm (16) or 7d → **Confirm & forward**. Skip HA → 17 → result path → Confirm prescription. Non-Value Meds go through the same HA check. The table below is **version A (later)**, where the route is known at call start.

| Case type | HA status | Final button | Ending card |
|---|---|---|---|
| Cat4 | — | Confirm prescription | Prescription confirmed |
| Pilot | HA skipped (by customer, system, or the doctor's Skip HA) | Confirm prescription | Prescription confirmed |
| Pilot | Value meds, HA required | Confirm & transfer | Transferred to Health Advisor |
| Pilot | Non-value meds, HA required | Confirm & forward | Forwarded to Health Advisor |

**7d follows the route (CW-D2, D-83):** Cat4 / HA skipped → **Confirm prescription**; Pilot with an HA call → **Confirm & forward** (the transfer is no longer possible once the call has ended). Secondaries: **Callback + Unavailable**; no Skip HA on 7d. **Skip HA** on 8b, 12 and 16 sits full width under the main button (D-83, K1).

- **Skip HA** only after the gate, for **both Pilot types** (Value and Non-Value Meds) whenever an HA call follows the doctor call and it isn't already skipped — no other conditions (D-59). Opens the reason sheet: Patient declined HA call · Clinically not required · Repeat patient, familiar with the medicines — Counselled in an earlier order (D-70 item 3; title and sub-line). Choosing a reason applies it at once. On a call with a result the final button becomes **Confirm prescription**; during a live transfer call the case then waits for the call result (state 17, D-58 point 14). Skip HA is also offered after a missed transfer (state 16, D-58 point 24).
- Cat4 never shows anything about HA. HA-skipped Pilot never shows Transfer or Forward.
- **Transfer vs forward** (D-57): transfer = the patient is handed to an HA on the same call; forward = an HA calls the patient back separately. A failed transfer goes as a forward; after Transferring (13) the doctor sees state 15 `call.transfer-failed` (CW-E1: the transfer couldn't start) — amber card "Forwarded to Health Advisor" with "Read the script, then end the call." (`call.transferFailed`) + script `call.forwardedTell` (§5, D-58 pts 17, 21, 23; MAIN-CHECK 2, D-85). No separate "HA didn't join" notice (D-58 pt 8 replaced by pts 15–17); the render id `t15-ha-no-join` is only a file name. A forward (15, B3) is confirmed only on the partner's result (CW-F2).
- Confirm: button shows "Confirming…", everything else disabled, no second submit. Failure: notice in the bar "Couldn't confirm. Nothing was lost." (D-65). **Unclear result** (no answer from the server): the button stays on "Confirming…" — the same screen as `a-confirm-busy` — while the app checks; then it shows the confirmed card or the failure notice, never a second submit (D-69). An unclear result is checked before retrying (no double confirm).
- **Analytics:** the four rows are four different outcomes and must stay separate events — never worked out from the button text (Cat4 and HA-skipped share a label). Event names are Engineering's choice `[LOCKED D-50]`.
- What decides case type, value vs non-value, HA required and HA-skip eligibility comes from the backend `[OPEN — see CLAUDE.md "Never silently invent"]`.

✅ **Flag 5 — answered (Apurva, 2026-10-16):** Confirm is blocked while any medicine is Pending. The button stays tappable; on tap a notice in the bar says "Prescribe or disable {n} medicines first." and the page scrolls to the first Pending medicine. Applies to all three confirm buttons; Callback, Skip HA and Unavailable stay allowed. *Original flag:* The old code lets the doctor confirm while some medicines are still Pending (not prescribed, not disabled). No decision covers this. Options: (a) block Confirm until every medicine is Prescribed or Disabled, with a note saying how many are left; (b) allow it, and Pending medicines are dropped from the prescription; (c) allow it with a confirmation sheet. Recommendation: (a) — a prescription with unreviewed medicines is a clinical risk.

---

## 7. Callback and Patient unavailable

**Callback** (sheet "Schedule callback"; button "Callback", icon from the design system, D-54)
- Date: Today · Tomorrow. Time `[MOCK]`: 9:00 AM, 9:30 AM, 10:00 AM, 10:30 AM, 11:00 AM, 11:30 AM, 12:00 PM, 2:00 PM, 3:00 PM, 4:00 PM, 5:00 PM, 6:00 PM. Real slots come from the backend.
- Missing choice → field error "Pick a date and a time." / "Pick a date." / "Pick a time."
- **Confirm callback** closes the case (status card "Callback today at 3:00 PM"). The case goes to the callback pool, not back to this doctor (D-36) `[MOCK: the app treats it as closed for this session]`. Save failure: notice in the sheet, choices kept.
- **Available only on 6 Call too short and 7d Result not received** (CW-A1, CW-C3; D-83). Never on a live call. The sheet opens over that post-call state, never over Calling. The backend refuses a callback unless the patient answered (leg 2): error "Couldn’t schedule a callback. The patient wasn’t reached." (K3).

**Patient unavailable** (D-51)
- **Automatic** when the patient side fails (§5, state 9), whenever detected — the partner's reason is stored; no sheet. The case goes on hold and the system retries it by hangup cause; an invalid number is not retried (CW-B2). Nothing goes to Ops.
- **By the doctor** only in 7d (result not received); state 6 has no Unavailable (D-58 pt 23). **Unavailable** opens the reason sheet "Mark patient unavailable" (D-75): Didn't answer · Not reachable · Wrong number. Choosing a reason closes the case at once (it is the confirmation); × backs out with no change. **The reason is saved with the case** for Ops monitoring (D-73).
- Status card "Patient unavailable" with a neutral icon; medicines keep their status (Pending stays Pending).

✅ **Flag 6 — answered (Apurva, 2026-10-16):** the case does go back to the queue, but the doctor is not told — no queue line anywhere. **Updated D-83 (CW-B2):** the case goes on hold and the system retries it by hangup cause; nothing goes to Ops. *Original flag:* the old code still opens an extra "unavailable" sheet with "Case will be reassigned to the queue". D-51 removed it; the rebuild follows D-51. Where the case goes after "unavailable" (back to the queue?) is not written in a decision — please confirm.

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
| Tablet | 0 · ½ · 1 · 2 | ½ · 1 · 2 | — |
| Capsule | 0 · 1 · 2 | 1 · 2 | — |
| Syrup | 0 · 2.5 · 5 · 10 ml | 2.5 · 5 · 10 ml | Other (ml) |
| Drops | 0 · 1 · 2 · 3 | 1 · 2 · 3 | — |
| Inhaler | 0 · 1 · 2 puffs | 1 · 2 | — |
| Injection | 0 · 1 · 2 · 3 | 1 · 2 · 3 (D-54) | Other (units) |
| Cream | — / Apply | Apply | — |

- **Dose grids (Round 4):** a single-row dose grid uses the M / A / N column width, so every option grid on the screen has one chip size (B-08, D-55). The M / A / N letters sit on the "Dose" label's left edge (B-24). The unit label is "Dose (units)" for every form that counts units (B-11).
- **Duration picker (Round 4):** number and unit chips sit inside the same inset as the field text, with 8 between the two rows (B-09). The "On prescription" band keeps a number and its unit together: "6 months" never splits (B-12).
- **Option labels:** "(optional)" is grey regular on Food and on Additional instructions (B-10).
- **Rx failed notice:** 16 below the header, as elsewhere (B-19).
- **Every X hours:** 4 · 6 · 8 · 12 h (helper "4 times a day, round the clock").
- SOS only: dose + **Max doses a day** 1–4. Other schedules: optional **Also as needed (SOS)** with its own dose and **Max extra doses a day** 1–4.
- **Duration:** numbers 1–7, 10, 14, 15 + Days / Weeks / Months, or **Ongoing** (prints the backend default, `[MOCK]` 6 months). Shows "Default" or "Changed from default".
- **Food (optional):** After food · Before food · Empty stomach (tap again to clear). **Additional instructions (optional)**, with the helper "Printed on the prescription." (D-81 F19).
- **Checks before Prescribe:** daily schedule with no dose at all → "Choose a dose for at least one time of day." · Other picked with no valid number → "Enter the dose in ml/units." or "Use numbers only, e.g. 7.5 units." (only plain positive numbers: 7, 7.5, .5).
- **An error on Prescribe scrolls the screen to the first error.** The M / A / N "choose a dose" error is field text under the grid, not a tinted box; other errors sit under their field (D-81 F16).
- **Prescribe** saves, marks the medicine Prescribed (and re-enables it if it was disabled).
- **A disabled medicine** opens with the note "Disabled: {reason}. Prescribing it will enable it again." (state `d-disabled`, D-81 F17, D-20).
- **✕ with changes** → "Discard changes?" sheet: **Discard** (red outline) on top, Keep editing below (D-54). No changes → closes at once.
- **Disable** → sheet "Disable {name}" with reasons: Can’t prescribe remotely · Contraindicated for patient · Duplicate medication · Patient declined · Wrong strength. Choosing a reason disables it at once (status Disabled). A disabled medicine is **removed from the order**; the order ships without it. If no medicine is left, the order is cancelled later (ops/backend). No extra warning for the last medicine — the reason sheet is the friction (D-59).

**Printed line** = schedule · duration · food (if chosen) · instructions (if written), e.g. "1-0-1 + SOS 1 tablet (max 1 tablet/day) · 6 months · After food". **SOS limit (D-80 pt 3, D-81 F14):** the daily total in the medicine's unit: "2 puffs as needed (max 8 puffs/day)"; a total of 1 is singular ("max 1 tablet/day"); cream prints "Apply as needed (max 3 times/day)".

---

## 9. Order details, Rx viewer, notes
- **Keyboard rule (D-81):** on Prescribe (Other dose, Additional instructions) and the case page (Chief complaints, Doctor notes) the focused field scrolls into view above the keyboard with its label and helper. The pinned action bar hides while the keyboard is open and returns when it closes (same reason as D-43).
- **Keyboard type (B-18, Round 4):** notes fields (Chief complaints, Doctor notes, Additional instructions) open the text keyboard. The Other dose field keeps the number pad with a decimal key, and its error shows a mistake a doctor can really make on that pad.


- **Order details ⓘ** expands in its card: Order created, Expected delivery, Payment. Hidden when the order has none of these.
- **View Rx** opens the customer's prescription full screen: zoom (50–400%), rotate, reset, pinch and drag. Load failure: notice + Try again; ✕ always closes. Disabled while confirming.
- **Notes & symptoms** (D-59): Chief complaints / symptoms and Doctor notes, both optional. Editable from the moment the case opens until Confirm; typed text kept if the connection drops. **Saved only when the prescription is confirmed** — a case closed as Callback or Unavailable discards them (they are consultation notes, not a call log). Locked after Confirm. **Symptoms are printed on the prescription; Doctor notes are internal only** (doctor, HA, ops, pharmacy).

---

## 10. Errors, offline, loading
- **Loading** (case): a skeleton shaped like the loaded page: an Order details row, Medicines and Notes blocks, in the same places (D-81 F28).
- **Notices** wrap balanced, set centrally (A-22).

Follow `docs/feedback-state-map.md` exactly. Summary for the case page: loading = card outlines, no actions · load failed = notice + Try again · offline = yellow notice in the bar "You're offline. Reconnect to call or confirm." (D-54) · an action tried offline fails with one error notice, nothing lost · release failed = notice, doctor stays on the case.

---

## 11. Prototype-only (do not build into the real app)

- Demo controls: scenario switcher, call simulator (connected / no answer / didn't connect / switched off / wrong number), **fast-forward to 50 s**, reset.
- Mock data: the five scenarios below, patient names, order IDs, prices, the demo numbers and codes for sign-in.
- **Profile earnings (D-81 F10):** **₹20 per confirmed prescription** (Apurva, 2026-11-02), so 3 prescriptions today show Earned ₹60.00 · Incentive ₹0.00 (0 while setting availability). The app shows what the backend sends; earnings count once a case is confirmed (D-73). Incentive rules are not defined yet (₹0.00 in the prototype).

**Test numbers and codes** (agreed Apurva, 2026-10-31). Prototype only — the real app gets these answers from the server. Format errors (first digit not 6–9, fewer than 10 digits) need no special number.

| Enter | Result |
|---|---|
| Any other valid mobile number | Code sent → OTP |
| 9000000001 | Not registered (sign-up route) |
| 9000000002 | Account inactive (**Call Doctor Ops**) |
| 9000000003 | Too many attempts (countdown) |
| 9000000004 | Couldn't send |
| 9000000005 | Number locked (five wrong codes earlier) |
| OTP 1234 | Correct → signs in |
| OTP 0000 | Code expired |
| OTP 9999 | Couldn't verify (server error) |
| Any other OTP | Wrong code; tries count down; the 5th locks the number |

Offline, and the phone-unlock outcomes for faster sign-in (success / cancelled / failed / unavailable), are switches in the review panel, not numbers.

**Launch scenarios (Fallback B):** `cat4` (Confirm prescription → 10a) · `pilot_ha_free` (B1 Confirm prescription → B2 → 13 → 14) · `pilot_no_ha_free` (B1 → B2 → B3) · `pilot_ha_skipped_customer` / `pilot_ha_skipped_system` (Cat4-style ending, Ozonetel). The table below is the earlier list, kept for **version A (later)**.

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

OQ-017 OTP lock and window lengths · OQ-019 no-cases auto re-check · OQ-023 when to re-offer faster sign-in · OQ-024 release backend · OQ-025 restoring an open case · timer behaviour on hold (OQ-001) · doctor volume figures (OQ-029).

---

## 13. Round 4 — consistency audit and pinned bar (2026-11-02, Apurva's decisions)

Not yet approved; Apurva reviews the before/after sheets. Standing decisions (D-42 to D-81) are unchanged; where a line above was edited for Round 4 the edited line governs. Rules live in `design-system/RULES.md` §3, §8, §9.5; the audit is `docs/renders/2026-11-01-fix-round/CONSISTENCY-AUDIT.md`.

**Pinned action bar (item 1).** Every pinned main action sits in the action bar: case page, Prescribe, Home, faster sign-in offer, returning unlock. The content above the bar scrolls on short phones; the bar never covers the last content at the end of the scroll; toasts sit above the bar. Sign-in and OTP keep their main button inline under the fields (RULES §8.4).

**Notice placement (A-19, item 2).** A notice that is the **result of an action** sits inside the bar, above its button (Home "Availability ends soon", setup / add / request failures, the offer's "Couldn't turn on…" and "isn't available" (D-93), the case and calling bar notices). A notice about the **bar's own action** (offline, "No cases right now", the results above) sits inside the bar. A notice about the **screen's general situation** (unlock "isn't available", Home idle-expired, manually ended, expired-pending, stop-pending) stays at the top of the panel (lane-request 7). On a screen without a bar, a result notice sits 8 below the field or button it came from (A-14).

**Bar notice band (item 3).** A bar notice is an edge-to-edge band on the bar's top edge: full tint, 1px bottom edge in its tone, same icon and text. Page-content notices keep their box.

**OTP (item 4, A-01 to A-03, A-17, A-21).** Terms line centred, "Terms & Conditions" on one line; the waiting text and the Resend code link share one height, so Verify & sign in does not move.

**Logo (A-07).** One lockup size and one top offset on every home-base screen: 166px wide, 16 from the top (RULES §8.13). Sign-in came down from 174 to 166 in Round 4 (lane D, lane request 1); Apurva to confirm (NEEDS-APURVA).

**Small phones (item 6, RULES §8.14).** Every state at 360×640: nothing the doctor needs is hidden without a scroll cue; the pinned bar never covers the last content at the end of the scroll.

**Gaps and cards.** Cards that stack are 16 apart on the case page, Prescribe and Profile (B-05, A-13, B-04). Notices and their controls: 8 (A-14).

**Busy states (B-01, B-02, B-03).** Busy bars keep their height and the button's place: Transferring… keeps the Skip HA row, greyed and disabled, with no Callback (D-83 K13); Confirming… keeps its row. The status line takes the buttons' row in the confirm fallback (B2). 7c shows the same screen as 5 at normal bar height — no empty tray (D-91, replaces B-02 for 7c). The end-of-call script card has 16 padding below in every state.

**Back and calling (unchanged).** Back is hidden from the Call tap on, as in D-81 F21; the leave sheet, Releasing… and Release failed sit over Ready (F22).

**Copy (messages.json).** "Use your screen lock instead of an OTP." (A-06). The three OTP messages with "Doctor Ops" and a time keep the phrase on one line (A-17). Balanced notice wrap is set centrally (A-22, B-20).

**Other audit items (B-07, B-08, B-09 … B-24, A-08, A-10, A-11, A-12, A-15, A-16, A-20)** are in the sections above where they apply: Home, Prescribe and the case page. A-08 (spinner gap) is 8 on every busy button, set centrally.

**No change (recorded).** A-18 (offer hero stays centred over the list), B-23 (SOS toggle row), B-25 ("Order details" title stays regular), A-23 to A-25 and B-26 to B-27 (as recorded in the audit).

**Small-phone check and Round 4 items for Prescribe:** `d-default`, `t01-ready`, `s7d-result-missing`, `t12-transfer-ready`, offer and unlock at 360×640 (see the Round 4 report).

**Header edge (B-07, Round 5).** In the compact task header, the edit header (Prescribe) and the viewer header (Rx), Back / ✕ is a 48px target whose glyph starts on the 16px margin; the title starts 54px from the edge on all three, the same as the sheet ✕ and the compact header.

**Sheets over the bar and pinned actions (Round 6).** A sheet always covers the pinned action bar of the screen behind it; the bar takes no tap while a sheet is open. When a sheet is taller than the space, its header and its buttons stay pinned and the content between them scrolls (RULES §9.4). Buttons stay fully visible and tappable at 390×844 and 360×640.

---

## 14. Calling round: D-83 applied (2026-11-03)

Source: `docs/reviews/2026-11-02-calling-walkthrough/README.md` (decisions CW-A1 … CW-F3 and the apply list per path). Applied by the calling round (`docs/renders/2026-11-03-calling-round/`). Pictures and text follow this section; the final audit reviews them, Apurva approves.

- **Callback** only on 6 Call too short and 7d Result not received. Not on any live state, nor on 5, 8a, 8b, 8c, 12, 17. The backend refuses a callback unless the patient answered (leg 2) (CW-A1, C1, C3).
- **Release → Home.** Empty case: amber notice at the top of the panel, **Release case** releases directly, no sheet (CW-A5, CW-A6).
- **3 / 4 are doctor-side only**; anything on the patient's side → 9, whenever detected. **9 holds and the system retries** by hangup cause; invalid numbers are not retried; nothing goes to Ops (CW-B1, CW-B2).
- **5 only after a known hang-up** (Pilot). Cat4 stays on Calling until the result (CW-C2). **7b only when the end can't be known**; otherwise the 3-min timeout goes to 7c (CW-D1). **7d's main button follows the route** (CW-D2).
- **An unproven confirm is not confirmed**: under the gate, no answer, or no record after a wait time → hold and retry; no Ops queue; no earnings for that case (CW-D3, CW-D4, CW-F2).
- **15 = the transfer couldn't start.** While the call is live, 15 and B3 show only "Waiting for the call to end…"; after the hang-up, **Request next case · Back to Home**. **15b retired.** 17 waits for the result (CW-E1, CW-E2, CW-E3).
- **Launch order: Fallback B first, A later** (CW-F1). B1 before the gate is a new state (`g0-calling-pilot`). 16 keeps one doctor line for A and B (CW-F3).
- **New copy:** `callback.notReached`, `call.waitingForHangup`; `case.noMedicines` changed; `call.endCallFirst` removed (`ui-screens/feedback/messages.json`).
- **Open for Apurva:** listed in `docs/renders/2026-11-03-calling-round/REPORT.md` (NEEDS-APURVA).
