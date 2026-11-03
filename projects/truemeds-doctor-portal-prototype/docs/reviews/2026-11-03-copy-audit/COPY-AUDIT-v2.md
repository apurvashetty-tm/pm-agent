# Copy audit v2, doctor portal (audit only, no screen changes)

**Date:** 2026-11-03 · **Branch:** `project/truemeds-doctor-portal-prototype` · **Decision:** D-84 (audit only; fixes go to the copy annex)
**Standard:** `COPY-RULES.md` as on disk, **26 rules** (v2). Run 1 (`COPY-AUDIT.md`) checked a 22-item file; that is corrected here.
**Method:** inventory re-used from run 1 (`_work/inventory.csv`, `_work/dom-390.json`): 149 states at 390, 524 string × source rows, 517 unique text values. Completeness checked again. Also added the **16 `messages.json` keys that no state shows** (533 unique strings in total). Each string checked against the rules for its element type. Layout and fit measured in the browser (`_work/fit-check.py`, `_work/fit-check2.py`). Accessibility checked in the DOM (`_work/a11y-check.py`, `_work/field-check.py`). Independent check: fresh subagent given only `COPY-RULES.md` and `_work/fail-table-v2.md`; its result is in §5.

---

## 1. Summary

| Measure | Count |
|---|---|
| Strings inventoried (states × string, 149 states at 390) | 524 rows (5,107 occurrences in run 1) |
| Unique text values shown in states | 517 |
| Unique strings incl. 16 unused `messages.json` keys | **533** |
| Passing (incl. approved exceptions, see §2) | **469** |
| Failing (unique strings, 33 fix rows + 7 new fail IDs) | **64** |
| Of which approved by a decision but still failing (logged) | 3 (CA-36) |

**Fails by screen** (unique strings): Sign-in 2 · OTP 10 · Faster sign-in offer 0 · Returning unlock 1 · Home + Profile 2 · Case 9 · Calling 2 · Prescribe 5 · Sheets 6 · Scripts 5 · Accessible names 22 (all medicine-row names) (counts overlap on CA-04, CA-30, CA-31: each string is counted once under its first screen).

**Fails by primary rule** (the first rule cited in each row): 5: 2 · 6: 5 · 7: 8 · 8: 15 · 10: 1 · 12: 3 · 14: 1 · 17: 1 · 18: 1 · 19: 1 · 21: 26 · 22: 1 · 24: 4 · 25: 26 · (21 and 25 counts include the rows in §4, see the per-row table).

**Two numbers that changed:** run 1 had 26 fail rows (37 strings). Run 2 has 33 fail rows covering 64 strings; the extra fails are accessibility and fit findings the rules did not cover in run 1, plus the accessible-name finding on 22 medicine rows.

---

## 2. AGREE / DISPUTE for `COPY-ANNEX.md` (all 26 rows)

| ID | Annex says | Verdict | Reason (v2 rule · evidence) |
|---|---|---|---|
| CA-01 | Fix "a callback" → "the callback" (agreed) | **AGREE** | Agreed, D-84 pt 3. Text only (measured, 2 → 2 lines at 360 and 390). |
| CA-02 | Empty case, agreed wording | **AGREE** | Agreed, D-84 pt 3. Rule 7 and 21 fail as written. Caveat: "Our Ops team" is not the rule 20 term "Doctor Ops"; the owner depends on OQ-035 (NEEDS-APURVA 2). Text only. |
| CA-03 | Dropped: approved exception (rule 1) | **AGREE** (drop) | Rule 1 lists `signin.notRegistered` as an approved exception, and D-84 pt 1 approves that file. No decision quotes this exact wording. D-33 has different wording (`decision_log.md` line 317). Apurva to confirm the text (NEEDS-APURVA 1). |
| CA-04 | Fix "We couldn't" on entry and OTP; case screens unchanged | **AGREE**, extended | Rule 8 pattern "Couldn't [verb]" and rule 10 one wording. **Added:** `call.resultMissing` "We didn’t get the call result." on 3 calling states, which the annex omitted → "Couldn’t get the call result." Text only (1 → 1 line). |
| CA-05 | "New code sent." → no full stop | **AGREE** | Rules 14, 23. Text only (1 → 1). |
| CA-06 | Home "Set it again" → "You won’t get new cases." | **AGREE** | Rule 7: the button on the same screen does the fix. "You won’t get new cases" matches the End-availability sheet (D-36, `home/end-confirmation` subtitle). Text only (2 → 2 lines at 360 and 390). |
| CA-07 | Remove "Order Confirmed." | **AGREE** | Rules 18 and 6: "Order" is the patient's purchase, and on s7f it claims a confirmation that has not happened. **Layout:** a line is removed (−20 px, all 3 states, 360 and 390). |
| CA-08 | Remove "Forwarded for Review." | **AGREE** | Rules 6 and 10: "Review" is not a state; the title says "Forwarded to Health Advisor". **Layout:** line removed (−20 px). |
| CA-09 | Remove "Transferred to HA." | **AGREE** | Rule 19 (HA outside the Skip HA button) and rule 10 (repeats the title). **Layout:** line removed (−20 px). |
| CA-10 | "Patient unavailable. The case is on hold." | **AGREE** | Rule 6 holds: app-logic §7 Flag 6 and D-83 pt 6 make it a hold, retried by hangup cause, with invalid numbers not retried. "Will be retried" would be untrue, so the annex is right to drop it. **Option** (not a dispute): "The case is on hold." alone, because the title already says "Patient unavailable". **Layout:** 360 text only; 390 saves one line (−20 px). The option saves one line at both widths. |
| CA-11 | Remove "Callback scheduled — Today at 3:00 PM." | **AGREE** | Rules 21, 23 and 10 (repeats the title). **Layout:** the line is removed (−40 px at 360, where it wrapped to two lines; −20 px at 390). |
| CA-12 | "Your prescription is saved. It isn’t confirmed until the call record arrives." | **DISPUTE** (wording) | Rule 6. "Until the record arrives" promises a later confirmation. D-83 pt 9 says the prescription may never be confirmed when no record comes. Proposed: **"Your prescription is saved. It isn’t confirmed."** (the state, with no promise). Text only (2 → 2 lines). Apurva may prefer "yet", which implies a later result. |
| CA-15 | Straight apostrophes → curly | **AGREE** | Rule 21. Text only. |
| CA-16 | Curly apostrophe | **AGREE** | Rule 21. Text only. |
| CA-17 | "Cannot" → "Can’t" | **AGREE** | Rule 5. Text only. |
| CA-18 | "will not" → "won’t" | **AGREE** | Rule 5. Text only. |
| CA-20 | Dropped: "Unavailable" is a fixed name | **DISPUTE** (drop) | The annex drop needs a rule 12 change that has not been made. As written, "Unavailable" is a noun, not verb-first, and it is not a listed fixed name. Measured: "Mark patient unavailable" overflows its bar cell (242 px button, Callback squeezed to 137 px) at 360 and 390, so the annex is right to reject it. "Mark unavailable" fits at 100% (176 + 144 px at 360) but overflows at 130% text. "Unavailable" itself overflows its 160 px cell at 130% text (162 px). Kept as a fail, row CA-20 in §4. Decision: NEEDS-APURVA 7. |
| CA-21 | Dropped: "Not you?" is a false positive (two elements) | **DISPUTE** (drop) | Confirmed: it is one button, `Not you? <strong>Switch account</strong>` (`returning-unlock.html:51`), so the duplicate-element point is wrong. But the label still begins with a question, so rule 12 (verb-first) fails. Kept as a fail, row CA-21 in §4. |
| CA-22 | "Stay on this case" → "Stay" | **AGREE** | Rule 16 (the sheet pair is "Release case" / "Stay") and rule 12. Text only (buttons unchanged in width). |
| CA-24 | Dose chip "—" → "None" | **AGREE** | Rule 25 (visible label matches the accessible name "none") and rule 18. Text only, chip width unchanged in the measured state. |
| CA-25 | Straight double quotes → curly around scripts | **AGREE** | Rules 21 and 26. Wording unchanged. Dashes inside scripts stay (rule 21 allows them). Text only. |
| CA-26 | "Four-digit" → "4-digit" in the code-box label | **AGREE** | Rule 22 (digits). Accessible name only; no visible change. |
| CA-13 | Dropped: approved exception | **AGREE** (drop) | The exact string is approved by the calling-walkthrough copy check that D-83 settled (CW-F3, `docs/reviews/2026-11-02-calling-walkthrough/README.md` line 289). Rule 1 lists it. |
| CA-14 | Dropped: "You didn't answer the call." is a plain fact | **AGREE** (drop) | Doctor-side outcome (D-83 pt 5). The statement is a fact, not blame, and the proposed replacement claimed a phone and a no-answer detection that are still open (OQ-027). |
| CA-19 | Dropped: answer buttons | **AGREE** (drop) | Rule 12 names answer buttons as their own type. D-77 pt 1 approves "Still talking" / "Call ended". |
| CA-23 | Dropped: back-blocked toast with two full stops | **AGREE** (drop) | Rule 14 names this toast as a full-sentence guidance toast; D-77 pt 2 approves it. |

**Totals:** AGREE 23 · DISPUTE 3 (CA-12, CA-20, CA-21).

---

## 3. Already agreed (D-84 pt 3)

- **CA-01** `callback.notReached`, case/c-callback-refused: "Couldn’t schedule the callback. The patient wasn’t reached." AGREE. Text only.
- **CA-02** `case.noMedicines`, case/a-no-medicines: "No medicines on this order. Our Ops team will check it." AGREE. Text only. Caveat: owner of the check is open (OQ-035, NEEDS-APURVA 2).

---

## 4. Fail table, grouped by screen

Format: `ID | Where (key or element + states) | Current text | Rule(s) | Problem | Proposed fix | Priority | Note`. Priority: **P1** untrue or misleading · **P2** the doctor would notice, or an accessibility failure that matters · **P3** mechanical. "Approved" = the string is approved by a decision and still fails the rule; logged for Apurva.

### Sign-in (2)

| ID | Where | Current text | Rule(s) | Problem | Proposed fix | Priority | Note |
|---|---|---|---|---|---|---|---|
| CA-04 | `signin.couldntSend` · sign-in/couldnt-send | We couldn’t send the code. | 8, 10 | "We" and no failure pattern match | Couldn’t send the code. | P3 | Text only |
| CA-35 | placeholder "10-digit mobile number" · sign-in/* (12 states) | 10-digit mobile number | 17 | A format instruction, not an example. The visible label "Mobile number" exists | e.g. 98765 43210 | P3 | Judgement; text only |

### OTP (10)

| ID | Where | Current text | Rule(s) | Problem | Proposed fix | Priority | Note |
|---|---|---|---|---|---|---|---|
| CA-04 | `otp.couldntVerify` · otp/couldnt-verify | We couldn’t check the code. | 8, 10 | As above | Couldn’t check the code. | P3 | Text only |
| CA-04 | `otp.resendFailed` · otp/resend-failed | We couldn’t send a new code. | 8, 10 | As above | Couldn’t send a new code. | P3 | Text only |
| CA-05 | `otp.newSent` · otp/new-code-sent | New code sent. | 14, 23 | Fragment ends with a full stop | New code sent | P3 | Text only |
| CA-26 | aria-label, OTP code boxes · 17 states | Four-digit verification code | 22 | Number in words | 4-digit verification code | P3 | Aria only |
| CA-31 | "Sending a new code…" · otp/resending | Sending a new code… | 25 | Progress line not in a live region | Put in a polite live region | P2 | Attribute only |
| CA-31 | "Checking…" · otp/cooldown-reconciling | Checking… | 25 | Same | Same | P2 | Attribute only |
| CA-33 | "Resend in" + timer "0:30" in two elements · otp/* (8 states) | Resend in 0:30 | 24 | A sentence built from pieces; rule 24 wants whole strings | One key, "Resend in {time}", with the timer as an inner span | P3 | Text only |
| CA-36 | "Wrong code." · otp/wrong-code; "Wrong code. 2 tries left." · otp/two-tries-left; "Wrong code. 1 try left." (unused key) | Wrong code. | 8 | Field validation should state the correction. Approved as written by D-81 pt 1 (replaces "That code isn't right."; D-53 pt 2: no next-step wording) | None proposed | P3 | **Approved; fails rule 8.** Apurva decides: keep the string and amend rule 8, or change the string |

### Faster sign-in offer (0)
No copy fails. The truth claim "Truemeds never sees or stores it." is not a copy-rule fail but needs engineering (NEEDS-APURVA 5).

### Returning unlock (1)

| ID | Where | Current text | Rule(s) | Problem | Proposed fix | Priority | Note |
|---|---|---|---|---|---|---|---|
| CA-21 | Button, unlock/* (7 states) | Not you? Switch account | 12 | One button; the label starts with a question | "Switch account", with "Not you?" as text above the button | P3 | **Layout:** adds a line, all 7 unlock states. Or Apurva keeps the label |

### Home + Profile (2)

| ID | Where | Current text | Rule(s) | Problem | Proposed fix | Priority | Note |
|---|---|---|---|---|---|---|---|
| CA-06 | `home.idleExpired` · home/idle-expired | Your availability ended. Set it again to request cases. | 7 | "Set it again" repeats the Set availability button | Your availability ended. You won’t get new cases. | P2 | Text only |
| CA-06 | `home.manuallyEnded` · home/manually-ended | You ended your availability. Set it again to request cases. | 7 | Same | You ended your availability. You won’t get new cases. | P2 | Text only |

### Case (9)

| ID | Where | Current text | Rule(s) | Problem | Proposed fix | Priority | Note |
|---|---|---|---|---|---|---|---|
| CA-01 | `callback.notReached` · case/c-callback-refused | Couldn’t schedule a callback. The patient wasn’t reached. | 10 | "a" / "the" | Couldn’t schedule the callback. The patient wasn’t reached. | P3 | Agreed |
| CA-02 | `case.noMedicines` · case/a-no-medicines | This order has no medicines. Release it — our Ops team will check it. | 7, 21 | Repeats Release case; dash | No medicines on this order. Our Ops team will check it. | P2 | Agreed |
| CA-07 | span "Order Confirmed." · case/t10a-confirmed, e-availability-ended, s7f-submitted | Order Confirmed. | 18, 6 | Wrong term; on s7f a confirmation that has not happened | Remove the line | P1 | **Layout:** −20 px, 3 states |
| CA-08 | span "Forwarded for Review." · case/t10b-forwarded | Forwarded for Review. | 6, 10 | Not an app state; full stop | Remove the line | P1 | **Layout:** −20 px |
| CA-09 | span "Transferred to HA." · case/t14-transferred | Transferred to HA. | 19, 10, 23 | HA outside Skip HA; repeats the title | Remove the line | P2 | **Layout:** −20 px |
| CA-10 | span "Patient unavailable — case returned to the queue." · case/t09-patient-unavailable | Patient unavailable — case returned to the queue. | 6, 21, 23 | Untrue: the case goes on hold, not back to the queue (D-83 pt 6, app-logic §7) | Patient unavailable. The case is on hold. (option: The case is on hold.) | P1 | **Layout:** 390 −20 px; 360 text only |
| CA-11 | span "Callback scheduled — Today at 3:00 PM." · case/e-callback-scheduled | Callback scheduled — Today at 3:00 PM. | 21, 23, 10 | Dash; full stop; repeats the title | Remove the line | P3 | **Layout:** −40 px at 360, −20 px at 390 |
| CA-20 | button "Unavailable" · case/s7d-result-missing, s7d-result-missing-pilot, s7d-unavailable-sheet | Unavailable | 12 (24 at 130%) | Noun, not verb-first; not a fixed name; overflows its 160 px cell at 130% text | "Mark unavailable" (fits at 100%, overflows at 130%), or keep as a fixed name | P2 | **Layout:** the width changes (160 → 176 px; Callback squeezed to 144 px at 360). NEEDS-APURVA 7 |
| CA-30 | "Pick a date and a time." · case/c-callback-error | Pick a date and a time. | 25 | Not tied to the date and time groups (no aria-describedby, no aria-invalid) | Tie to the groups (attributes only) | P3 | Attributes only |

### Calling (2)

| ID | Where | Current text | Rule(s) | Problem | Proposed fix | Priority | Note |
|---|---|---|---|---|---|---|---|
| CA-04 | `call.resultMissing` · case/s7d-result-missing, s7d-result-missing-pilot, s7d-unavailable-sheet | We didn’t get the call result. | 8, 10 | Same as CA-04 above | Couldn’t get the call result. | P3 | Text only; not in the annex |
| CA-12 | `call.submittedText` · case/s7f-submitted | Your prescription is saved. We’ll confirm it once the record arrives. | 6 | Promises a later confirmation the rules can reverse (D-83 pt 9) | Your prescription is saved. It isn’t confirmed. | P1 | **DISPUTE** of the annex wording. Text only |

### Prescribe (5)

| ID | Where | Current text | Rule(s) | Problem | Proposed fix | Priority | Note |
|---|---|---|---|---|---|---|---|
| CA-24 | dose chip "—" · case/d-cream | — | 21, 25 | Dash used as a label; accessible name says "none" | None | P3 | Text only |
| CA-34 | chips "4 h", "8 h", "12 h" · case/d-every-x-hours | 4 h · 8 h · 12 h | 24 | At 130% text the chip splits "4" / "h" over two lines | Non-breaking space in "4 h" etc. | P3 | Text only at 100%; **re-check the chip width at 130%** |
| CA-30 | "Choose a dose for at least one time of day." · case/d-error-dose | Choose a dose for at least one time of day. | 25 | The error is not tied to the dose group (no aria-describedby on the group) | Tie to the dose group (attributes only) | P2 | Attributes only |
| CA-34 (×2 more) | "8 h", "12 h" | (as above) | 24 | (as above) | (as above) | P3 | Counted in the row above |

(CA-34 chips are in the same state; the row shows all three.)

### Sheets (6)

| ID | Where | Current text | Rule(s) | Problem | Proposed fix | Priority | Note |
|---|---|---|---|---|---|---|---|
| CA-15 | "Didn't answer" · case/s7d-unavailable-sheet | Didn't answer | 21 | Straight apostrophe | Didn’t answer | P3 | Text only |
| CA-15 | "Invalid or not the patient's number" · case/s7d-unavailable-sheet | Invalid or not the patient's number | 21 | Straight apostrophe | Invalid or not the patient’s number | P3 | Text only |
| CA-16 | "The ordered strength isn't right" · case/d-disable-sheet | The ordered strength isn't right | 21 | Straight apostrophe | The ordered strength isn’t right | P3 | Text only |
| CA-17 | "Cannot prescribe remotely" · case/d-disable-sheet | Cannot prescribe remotely | 5 | Not contracted | Can’t prescribe remotely | P3 | Text only |
| CA-18 | "Your changes to this medicine will not be saved." · case/d-discard-sheet | Your changes to this medicine will not be saved. | 5 | Not contracted | Your changes to this medicine won’t be saved. | P3 | Text only |
| CA-22 | "Stay on this case" · case/a-leave-sheet, a-releasing, s7e-leave-sheet | Stay on this case | 12, 16 | Four words; the pair is "Release case" / "Stay" | Stay | P3 | Text only |

### Scripts (5)

| ID | Where | Current text | Rule(s) | Problem | Proposed fix | Priority | Note |
|---|---|---|---|---|---|---|---|
| CA-25 | `call.scriptCat4` · case/a-back-blocked (5 states) | "I’m writing your prescription now. You can track your order in the Truemeds app." | 21, 26 | Straight double quotes | Curly quotes around the script; wording unchanged | P3 | Text only |
| CA-25 | `call.scriptTransfer` · case/c-skip-ha | "I’m writing your prescription now. Please stay on the line — I’ll connect you…" | 21, 26 | Straight quotes | Same | P3 | Dash kept (allowed in scripts) |
| CA-25 | `call.scriptNeutral` · case/g0-calling-pilot | "I’m writing your prescription now. Our Health Advisor will help you with the next steps." | 21, 26 | Straight quotes | Same | P3 | Text only |
| CA-25 | `call.forwardedTell` · case/g3b-forwarded | "I’ve written your prescription. Our Health Advisor isn’t available right now — they’ll call you back shortly." | 21, 26 | Straight quotes | Same | P3 | Text only |
| CA-25 | `call.scriptForward` (unused key) | "I’m writing your prescription now. Our Health Advisor will call you shortly." | 21, 26 | Straight quotes | Same | P3 | Forward route: makes no transfer promise (rule 26 OK) |

### Accessible names (22)

| ID | Where | Current name | Rule(s) | Problem | Proposed fix | Priority | Note |
|---|---|---|---|---|---|---|---|
| CA-32 | `aria-label` of medicine rows · 82 states | Edit Metformin · Edit Amlodipine · Edit Atorvastatin · Edit Vitamin B12 · Edit Antacid Suspension · Edit Levothyroxine · Edit Calcium + Vit D3 · Edit Sodium Chloride Eye Drops · Edit Losartan · Edit Telmisartan · … (22 unique names) | 25 | The name leaves out the strength on the visible row ("Metformin 500mg") | Edit Metformin 500mg (copy the visible name) | P3 | Aria only |

---

## 5. New fails and independent check

**New fail IDs CA-30 to CA-36** (not in run 1): CA-30 field error not tied to its group (rule 25); CA-31 progress lines not announced (rule 25); CA-32 medicine-row names drop the strength (rule 25); CA-33 "Resend in" built from pieces (rule 24); CA-34 chip labels split at 130% (rule 24); CA-35 placeholder reads as instruction (rule 17); CA-36 "Wrong code." lacks the correction (rule 8, approved, logged).

**Rule 6 check (true to the state):** no new fail. Checked against app-logic §5, §7 and D-83: "They’ll call the patient back" (forward, `call.forwardedAfterHangup`) matches the forward definition (D-57). Open: "Your selection is saved." on `home/setup-failed` has no source in app-logic or the decision log (NEEDS-APURVA 6).

**Rule 11, 15, 16 checks:** progress lines end "…" and have no full stop (one exception is a title). Empty states give the next step. Confirmation sheets name both choices (Log out / Stay signed in; Keep available / End availability; Discard / Keep editing; Release case / Stay). No new fails.

**Independent check (fresh subagent, only `COPY-RULES.md` and `_work/fail-table-v2.md`):** result in §6.

---

## 6. Layout impact (for the annex and the fix round)

| ID | Layout or text only | States whose picture would change |
|---|---|---|
| CA-01 | Text only | case/c-callback-refused |
| CA-02 | Text only | case/a-no-medicines |
| CA-04 (entry, OTP) | Text only | sign-in/couldnt-send; otp/couldnt-verify; otp/resend-failed |
| CA-04 (call.resultMissing) | Text only | case/s7d-result-missing, s7d-result-missing-pilot, s7d-unavailable-sheet |
| CA-05 | Text only | otp/new-code-sent |
| CA-06 | Text only | home/idle-expired; home/manually-ended |
| CA-07 | **Layout: line removed (−20 px)** | case/t10a-confirmed, e-availability-ended, s7f-submitted |
| CA-08 | **Layout: line removed (−20 px)** | case/t10b-forwarded |
| CA-09 | **Layout: line removed (−20 px)** | case/t14-transferred |
| CA-10 | **Layout at 390 only** (−20 px); text only at 360. Option "The case is on hold.": layout at both widths | case/t09-patient-unavailable |
| CA-11 | **Layout: line removed** (−40 px at 360, −20 px at 390) | case/e-callback-scheduled |
| CA-12 | Text only | case/s7f-submitted |
| CA-15 | Text only | case/s7d-unavailable-sheet |
| CA-16 | Text only | case/d-disable-sheet |
| CA-17 | Text only | case/d-disable-sheet |
| CA-18 | Text only | case/d-discard-sheet |
| CA-20 | **Layout if changed**: "Mark unavailable" widens the button 160 → 176 px and squeezes Callback to 144 px at 360. Fits at 100%, overflows at 130% text | case/s7d-result-missing, s7d-result-missing-pilot, s7d-unavailable-sheet |
| CA-21 (if changed) | **Layout: adds a line** above the button | unlock/cancelled, face, fingerprint, pending, platform-retry, screen-lock, unavailable |
| CA-22 | Text only | case/a-leave-sheet, a-releasing, s7e-leave-sheet |
| CA-24 | Text only | case/d-cream |
| CA-25 | Text only | case/a-back-blocked; case/c-skip-ha; case/g0-calling-pilot; case/g3b-forwarded |
| CA-26 | Aria only | 17 OTP states |
| CA-30 | Attributes only | case/d-error-dose; case/c-callback-error |
| CA-31 | Attributes only | otp/resending; otp/cooldown-reconciling |
| CA-32 | Aria only | 82 states with medicine rows |
| CA-33 | Text only (the timer stays a live element) | otp/* with "Resend in" (8 states) |
| CA-34 | Text only at 100%; **check at 130% text** | case/d-every-x-hours |
| CA-35 | Text only (placeholder) | sign-in/* with the phone field (12 states) |
| CA-36 | None proposed | otp/wrong-code; otp/two-tries-left |

**Measured:** `_work/fit-swaps.json` (each swap, 360 and 390, before and after), `_work/fit-bar-v2.json` (Unavailable family, 360 and 390, 100% and 130%), `_work/fit-large130-v2.json` (all 149 states at 360, text scaled 130%), `_work/large-text/` (83 screenshots of wrapped or overflowing states).
**Text-size caveat:** the app sets type in px, so a root `font-size: 130%` alone changed nothing. The large-text pass scales every element's font by 1.3 instead.

---

## 7. Script checks to add during the build

For each ⚙ / ◐ rule: how `check-sources.mjs` would check it, and how many current strings it would flag (regex pass over the 533 strings; counts before allowlisting).

| Rule | Proposed check | Current hits | Notes |
|---|---|---|---|
| 4 (no !) ⚙ | Regex `!` in text | 0 | — |
| 5 (contractions) ◐ | "cannot", "will not", "do not", "is not" | 2 | CA-17, CA-18 |
| 11 (progress, no full stop) ⚙ | `-ing` start, ends `.` | 0 real | Multi-sentence strings excluded |
| 13 (titles, no full stop) ⚙ | Title classes ending `.` | 0 | — |
| 14 (toasts) ⚙ | `tm-toast` ending `.` | 2 by class | "Finish this case first." (approved); "Then you can go back to Home." (approved). Excluded by allowlist |
| 17 (placeholders, examples) ◐ | Placeholder with no "e.g." | 2 | "10-digit mobile number" (CA-35); "Clinical observations, instructions, internal notes…" (example list; NEEDS-APURVA 8) |
| 18 (dashes) ⚙ | `[—–]` outside scripts and the Rx paper | 4 real | CA-02, CA-10, CA-11, CA-24. Exempt: 2 in the mock Rx paper (NEEDS-APURVA 9), 2 in scripts |
| 19 (HA) ◐ | `\bHA\b` except "Skip HA" | 1 | CA-09 |
| 21 (curly, quotes) ⚙ | Straight `'` and `"` in UI text; scripts in curly quotes | 3 apostrophes + 4 script quotes | CA-15, CA-16, CA-25 |
| 22 (digits) ⚙ | Spelled numbers in labels with an idiom allowlist ("one touch", "at least one time") | 1 real | CA-26 |
| 23 (full stops) ⚙ | Status and label classes ending `.` | 1 real by class | "New code sent." (CA-05); others by class after the fixes |
| 24 (fit) ◐ | Not script-checkable; use `fit-check2.py` at 360 with text ×1.3 | — | Overflow: CA-20 (3 states). Wrap: CA-34 |
| 10, 12, 16 (verbs, sheets) | Not mechanical; a verb list and an allowlist | — | Callback, Skip HA, View Rx, Unavailable, Still talking, Call ended as fixed names |

---

## 8. Watch list (not fails; for the rule owner)

- "Request a case whenever you have a moment." (`home/active`, 12 states): a caption that names the button on the same screen (rule 7 is about messages, so not counted).
- Dismiss buttons vary: "Cancel", "Keep available", "Keep editing", "Stay signed in", "Stay", "Not now" (rule 10). A product naming choice.
- "Ending availability" as a title, with no "…" (rule 11 vs 13).
- "Sent to" + "+91 98765 43210" in two elements (rule 24 pattern; a row layout, so not counted).
- Rule 8 says failure lines carry "what's kept or why", but D-65 shortened several to the bare failure ("Couldn’t add time.", "Couldn’t request a case.", "Couldn’t load this case."). Rule text and decision conflict; not counted as fails.
- Rule 10 has no carve-out for approved exceptions (D-77). Fixed names are listed in rule 12 but "Unavailable" is not.

---

## 9. NEEDS-APURVA

Product facts and decisions only.

1. **Empty-case wording and the faster sign-in note:** confirm the `signin.notRegistered` text (no decision quotes it; D-33 differs). If it stands, the exception stays.
2. **Empty-case owner (CA-02):** "Our Ops team" or "Doctor Ops" (rule 20)? Depends on OQ-035.
3. **Unavailable label (CA-20):** keep "Unavailable" as a fixed name (rule 12 change), or accept a layout change in the three 7d states to fit "Mark unavailable"? Note: "Unavailable" overflows its cell at 130% text today.
4. **No-record outcome (CA-12, D-83 pt 9):** what does the doctor see when no call record arrives? No copy exists. Also confirm "It isn’t confirmed." vs "It isn’t confirmed yet."
5. **Biometric claim:** "Truemeds never sees or stores it." (faster sign-in offer) — confirm with engineering before it ships.
6. **Selection kept after a failed Set availability:** "Your selection is saved." (`home/setup-failed`) — is it true? No source found in app-logic or the decision log.
7. **Not you? (CA-21):** keep the label as it is, or move "Not you?" to a line above the button (adds a line in 7 states)?
8. **Notes placeholder:** "Clinical observations, instructions, internal notes…" implies notes are not visible to others. Notes visibility is still open (CLAUDE.md). Confirm before the placeholder ships.
9. **Mock Rx paper:** exempt from rule 18 (en dashes in the address and hours), or must it follow the rule?
10. **"Wrong code." (CA-36, approved by D-81 pt 1):** keep the string and amend rule 8 to allow it, or add the correction?

---

## 10. Rule-text issues (for the rule owner, not product facts)

- Rule 8: "plus what's kept or why" reads as mandatory, but D-65 shortened several failure lines without it. Say whether it is required.
- Rule 10 and 12: no carve-out for approved exceptions (D-77 pt 1, answer buttons). "Unavailable" is not a fixed name.
- Rule 17 does not say whether a placeholder that describes a format is allowed (CA-35).
- Rule 21: hyphen notation such as "1-0-1" is not addressed (the rule text allows hyphens in words and ranges).
- Rule 24 does not say whether a 130% text check is required on every state or only on flagged ones.

---

## 11. Independent check result (fresh subagent, 2 files only)

- **Fail checks:** 33 rows CONFIRM. CA-22 DISAGREE as a fail (rule 12 is a ◐ warning; rule 16 is met by "Stay"). Kept as a P3 consistency fix. CA-05 and CA-21 UNSURE on the rule that applies to the element type. CA-34 copy passes; the 130% fit is unverified here (measured in §6).
- **Fix checks:** all PASS except **CA-20** (FAIL at 130%; confirmed by measurement, §6) and **CA-33** (FAIL, see addendum below).
- **Accepted addenda from the check:**
  1. **CA-33 addendum:** "0:30" breaks rule 22 (countdowns are mm:ss). Fix: "00:30". The same rule applies to every OTP and lock timer that shows "0:30" or "1:00" (`otp/*`, `home/*`), so those timers are a new P3 class, text only. Not yet in the fix list; Apurva to confirm.
  2. Rules 23 also apply to CA-07, CA-08, CA-09 (full stops on labels). Removal fixes them anyway.
  3. CA-10 and CA-12 truth depends on D-83 pts 6 and 9. Checked against those decisions in §4 (the subagent did not have them). Still NEEDS-APURVA 4 for CA-12.
  4. **Row IDs repeat** in the §4 tables (for example CA-04 covers four strings). Strings are tracked by the sub-row; the final list in the annex uses one row per string with suffixes (CA-04a…d, CA-15a…c, CA-30a/b, CA-31a/b).
- **Subagent's misses not adopted:** none beyond the above.

COPY AUDIT v2 DONE — annex agreed 23, disputed 3, new fails 7
