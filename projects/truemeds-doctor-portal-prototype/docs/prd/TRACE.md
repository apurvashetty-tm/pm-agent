# PRD trace (review aid, not for readers)

Links each rule in `PRD.md` to its source, so the PRD body carries no decision numbers. Sources are the frozen inputs as of 6 Nov 2026, plus decisions D-93 to D-96 (9 Nov): `ui-screens/` (148 states), `ui-screens/app-logic.md` (AL), `docs/feedback-state-map.md` (FSM), decision log up to D-92, `calling-flow/data.js`, `ui-screens/feedback/messages.json` and `visible-strings.json` (copy). Latest decision wins.

## 1. Rules → sources

| PRD § | Rule (short) | Source |
|---|---|---|
| 2 | Today's portal content | `reference/current-portal-screenshots/` (v3.48.0) |
| 2 | Price beside a medicine invites cost-based choices | D-05 |
| 2 | ~35% of single-call cases end as two calls | OQ-032 |
| 2 | ~12,000 orders / ~300 doctors | project_truth §2, OQ-029 |
| 3 | Pull model | D-31, D-36 |
| 3 | Click-to-call, doctor's phone first, no End call; Knowlarity Cat4, Ozonetel Pilot | AL §5, project_truth §5, D-56, D-58 |
| 3 | Call record proves the consultation | D-83 pt 9 |
| 3 | Case type picks the final button | D-50, AL §6 |
| 3 | One Pilot flow (Fallback B) | D-83 CW-F1, D-87 |
| 3 | Prescribe or disable only; no qty, no price, no substitutes | D-04, D-05, D-06, old PRD R4 |
| 3 | OTP then phone unlock, cuts SMS cost | D-45, D-64 |
| 3 | React Native, app team | project memory; session_handoff 2026-10-12 |
| 4 | Clean Cat4 path; Pilot transfer | data.js happy path, D-87 |
| 4 | Happy-path strip | approved pictures only (`images/happy-path-cat4.png`); added at Apurva's request, 9 Nov |
| 5.1 | Cleaning, error order, re-check, server limits | AL §2, D-39 |
| 5.1 | Send OTP under the field | D-43 (no pinned button on typing screens), RULES §8.4 |
| 5.1 | Links configurable | OQ-021 |
| 5.2 | No auto-verify; wrong digits kept; Verify never moves | AL §2, D-44, D-81 F1/F5/F7, Round 5–6 |
| 5.2 | Lock per number; cap not reset; second number needs Doctor Ops | D-34, D-35 |
| 5.2 | No Back on OTP | D-61 |
| 5.3 | Own screen after first sign-in, SMS cost, no sneaky opt-in | D-45 |
| 5.3 | Unlock by phone capability; skip if no screen lock | D-64 |
| 5.3 | Toggle in Profile; back gesture = Not now | D-69, D-47 |
| 5.3 | Phone can't turn it on at the tap: screen stays, bar notice, Continue | D-93 (picture `offer_unavailable` not yet in `ui-screens/`) |
| 5.4 | Fallback to OTP; unavailable notice; no Back | AL §2, D-47, D-61 |
| 5.5 | Home's question; taking cases = may request | D-36, home JTBD (2026-10-12) |
| 5.5 | Quick picks, wheel, minimum, no maximum | AL §3, D-36, D-40 |
| 5.5 | Request before end honoured; end with pending request; end during a case | AL §3, D-36 |
| 5.5 | Prescriptions today = count, counted on confirm | AL §3, D-36 |
| 5.5 | Help / bell placeholder; bell never in a case | D-88 pt 4, AL §3 |
| 5.5 | Profile page, Log out sheet, blocked during a case | D-69, D-70 |
| 5.5 | One phone; session valid through a case | AL §3, OQ-017 (confirmed 2026-10-12) |
| 5.6 | Row content and status tags | AL §8, D-54 |
| 5.6 | Back only while a call button shows and patient never reached; leave sheet; Release → Home | D-80 pt 1, D-81 F21–F22, D-83 CW-A5 |
| 5.6 | Backend refuses release after accepted call request unless 3 / 4 | D-80 pt 1 |
| 5.6 | Release ≠ Hold ≠ Callback; Ops tracks release rate | D-80 pt 2 |
| 5.6 | Reopen goes back into the case | D-48, FSM case.reopened, OQ-025 |
| 5.6 | Empty case | D-80 pt 4, D-83 CW-A6, D-84 |
| 5.7 | No buttons that do nothing; waits are status text | D-56, D-74 |
| 5.7 | Gate is total talk time, adds up, never shown | AL §5, D-58 pt 22 |
| 5.7 | Attempted = patient's leg connected | D-58, project_truth §4 |
| 5.7 | Who decides validity: own count on a live Pilot call, partner result otherwise | AL §5 (Launch B rule, All other cases), data.js B0 rules |
| 5.7 | Nothing before the gate, except confirm with no result (waits for the record) | AL §5, D-83 CW-D2/D3, data.js 7d |
| 5.7 | Final button table | AL §6 (launch B), project_truth §4, D-83 CW-D2, CW-F3 |
| 5.7 | Unproven confirm not confirmed; no Ops queue | D-83 pt 9 (CW-D3, D4, F2) |
| 5.7 | Pending medicines block confirm | AL §6 Flag 5, D-64 |
| 5.7 | Patient-side failures → Patient unavailable whenever detected | D-83 CW-B1 |
| 5.7 | Script from the tap, hidden after the call | AL §4, D-58 pts 18, 24 |
| 5.7 | Status within ~5 s | D-58 pt 14 |
| 5.8 | Confirm on live call then HA check; transfer / forward | D-83 CW-F1, D-87, AL §6 |
| 5.8 | Never say HA unavailable | D-84 (Apurva 09:55) |
| 5.8 | Waiting for the call to end; exits after hang-up; forward confirmed on result | D-83 CW-E3, CW-F2 |
| 5.8 | Ended after gate before Confirm → Confirm & forward / Skip HA | D-83 CW-F3, AL §5 row 16 |
| 5.8 | Skip HA conditions and reasons; 17 waits for result | D-59, D-70 pt 3, D-85, D-83 CW-D2 |
| 5.9 | One job each | D-80 pt 2 |
| 5.9 | Callback only on 6 / 7d; refused without leg 2; pool | D-83 CW-A1, CW-C3, D-36 |
| 5.9 | Retry by hangup cause; invalid number flagged | D-83 CW-B2 |
| 5.9 | Manual Unavailable only on 7d, reasons, saved | D-75, D-73 |
| 5.9 | Notes discarded on Callback / Unavailable | D-59 |
| 5.10 | Full screen; printed line; M/A/N; dose by form | D-10, D-15, AL §8, D-81 F14 (capsules) |
| 5.10 | Defaults open; Ongoing default | D-11, D-17, D-04 |
| 5.10 | SOS daily total in unit | D-80 pt 3, D-81 F14 |
| 5.10 | Disable reasons; removed from order; last one → cancelled later | AL §8, D-59 |
| 5.10 | Discard sheet; errors scroll to first | D-54, D-81 F16 |
| 5.10 | Choice lists (Every X hours, SOS max, duration, food) | AL §8 |
| 5.10 | Printed-line examples | `visible-strings.json` (d-* pictures); cream SOS from AL §8 |
| 5.11 | Rx viewer controls; same on closed cases; disabled while confirming | AL §9, D-76 |
| 5.11 | Notes editable until Confirm, saved on Confirm, symptoms printed | D-59 |
| 6 | Notice placement; no repeating buttons | AL §13, FSM placement rules, D-65 |
| 6 | Busy / unclear result | AL §6, D-69 |
| 6 | Keyboard rule; small phones | D-81 pt 6, D-82 pt 8 |
| 6 | Words | D-48, D-50, D-51, README design rules |
| 7 | Gate 50 s; adding rule; 5 s; 3 min | AL §5, D-58 pts 14, 22, D-83 CW-D1 |
| 7 | Record wait time; retry gaps | D-83 pts 6, 9 |
| 7 | Min 15 min; ending soon 5 min [MOCK] | AL §3 |
| 7 | OTP 5 / 4; lock, window, life open; resend waits [MOCK] | D-34, D-35, AL §2, OQ-017 |
| 7 | 3 unlock tries [MOCK] | AL §2 |
| 7 | Ongoing 6 months | D-04, AL §8 |
| 7 | ₹20 | D-82 pt 2 |
| 7 | Owners | Confirmed by Apurva, 9 Nov 2026 |
| 7 | Prototype [MOCK] values (ending-soon 5 min, OTP lock/window/resend, unlock tries) | left as `[NEED]`, numbers not carried into the PRD |
| 9 | Out list | project_truth §1, D-87, D-88 pt 4, backlog §4b, OQ-015, OQ-028, old PRD §11.2 (incl. Super Doctor role) and R4 |
| 10 | Open items | open_questions.md, backlog §4, D-83 Engineering list, D-73 (monitoring), AL §11 (incentive) |
| 9 | Old-PRD R1, R2, R3, R6 out of this release | Apurva, 9 Nov 2026 |
| 10 | Masking and call recording stay open for Legal | old PRD §10.5; Apurva, 9 Nov 2026 |
| 11 | Four outcomes tracked apart; renaming never renames events | D-50, AL §6 |
| 11 | Goal = doctor experience (NPS, ease of use); primary = doctor-handled orders ending confirmed; guardrail = discards | Apurva, 9 Nov 2026; DISCARD order status per tm-chotu definitions |
| A | Version A | AL §5–6, D-83 CW-F1, D-87 pt 2 |
| B | Copy | D-84, COPY-ANNEX.md |

## 2. States → sections

`check-prd.mjs` maps every picture in `ui-screens/` (148 states) to a PRD section with these rules and fails if any state is unmapped. Calling states are covered by their section's rules plus the calling-flow page.

| Pictures | PRD § |
|---|---|
| `sign-in_*` | 5.1 |
| `otp_*` | 5.2 |
| `offer_*` | 5.3 |
| `unlock_*` | 5.4 |
| `home_*`, `e-availability-ended` | 5.5 |
| `t01-ready`, `a-top`, `a-scrolled`, `a-long-content`, `a-order-details`, `a-loading`, `a-load-failed`, `a-no-medicines`, `a-offline`, `a-offline-action`, `a-leave-sheet`, `s7e-leave-sheet`, `a-releasing`, `a-release-failed`, `a-back-blocked`, `s-*` | 5.6 |
| `t02`–`t10a`, `s7a`–`s7f` (except `s7e`, `s7d-unavailable-sheet`), `t08c-confirm-blocked`, `a-confirm-busy`, `a-confirm-failed` | 5.7 + calling-flow page |
| `g0`–`g3b`, `t13`–`t17`, `t10b-forwarded`, `c-skip-ha` | 5.8 + calling-flow page |
| `c-callback*`, `e-callback-scheduled`, `t09-patient-unavailable`, `s7d-unavailable-sheet` | 5.9 |
| `d-*` | 5.10 |
| `a-rx-viewer`, `a-notes-typing` | 5.11 |
| `t11-calling-transfer`, `t12-transfer-ready`, `t08b-valid-forward` | Annex A |

## 3. Stale lines found in the frozen inputs (not fixed here; for the build thread)

The PRD quotes the copy file and the pictures, which win. These input lines disagree with them:

1. FSM `case.result-missing-pilot`: "We didn’t get the call result." · copy file and pictures: "Couldn’t get the call result."
2. FSM `case.offline`, `case.confirm-failed`, `case.release-failed`, `case.callback-failed`: messages end with "Try again…" · copy file: no "Try again" sentence (e.g. "No connection. Nothing was lost.").
3. AL §5 and §7: "Couldn’t schedule a callback. The patient wasn’t reached." · copy file `callback.notReached`: "Couldn’t schedule the callback. …".
4. AL §5 row 7f: "We'll confirm it once the record arrives." · copy file `call.submittedText`: "It isn’t confirmed until the call record arrives."
5. FSM `case.closed`: endings "Transferred to HA" / "Forwarded to HA" · pictures: "Transferred to Health Advisor" / "Forwarded to Health Advisor".
