# Copy annex — doctor portal (for the PRD) · DRAFT for Apurva's decision, 2026-11-03

**What this is:** every piece of app text that fails the copy rules v2 (`COPY-RULES.md`, D-84), with the fix to apply while building the prototype. **Where a frozen picture and this table disagree, the updated pictures win (D-84 amendment: pictures are re-rendered for each applied row); this table is the record of what changed.** Raw audit with evidence: `COPY-AUDIT.md` (terminal, 149 states, 517 unique strings).
**Main-thread review:** the terminal ran against v1 of the rules by mistake (a save of v2 had failed; now fixed). Each finding below was re-checked against v2: 19 kept, 7 dropped (listed at the end).
**Priority:** P1 = untrue or misleading · P2 = the doctor would notice · P3 = punctuation and consistency.

## Fixes

| ID | Screen · where | Current text | Fix | Rule (v2) | P |
|---|---|---|---|---|---|
| CA-07 | Case · line under the outcome title (`t10a`, availability ended, **`s7f` waiting for record**) | Order Confirmed. | Remove the line; the title already says "Prescription confirmed". On `s7f` it claims a confirmation that hasn't happened | 6, 18 | P1 |
| CA-08 | Case · line under the title (`t10b`) | Forwarded for Review. | Remove the line; the title says "Forwarded to Health Advisor" ("Review" isn't a state) | 6, 10 | P1 |
| CA-10 | Case · line under the title (`t09` patient unavailable) | Patient unavailable — case returned to the queue. | Patient unavailable. The case is on hold. | 6 (D-83: hold, not queue; invalid numbers aren't retried, so no "will be retried"), 21, 23 | P1 |
| CA-12 | Calling · `s7f` card text (`call.submittedText`) | Your prescription is saved. We’ll confirm it once the record arrives. | Your prescription is saved. It isn’t confirmed until the call record arrives. | 6 (D-83 pt 9: it may never be confirmed) | P1 |
| CA-02 | Case · empty case (`case.noMedicines`) | This order has no medicines. Release it — our Ops team will check it. | No medicines on this order. Our Ops team will check it. | 7, 21 · **agreed** | P2 |
| CA-06 | Home · availability ended / you ended it (`home.idleExpired`, `home.manuallyEnded`) | …Set it again to request cases. | Your availability ended. You won’t get new cases. · You ended your availability. You won’t get new cases. | 7 (repeats the Set availability button) | P2 |
| CA-09 | Case · line under the title (`t14`) | Transferred to HA. | Remove the line; the title says "Transferred to Health Advisor" | 19, 23 | P2 |
| CA-11 | Case · line under the title (callback scheduled) | Callback scheduled — Today at 3:00 PM. | Remove the line; the title says "Callback today at 3:00 PM" | 10, 21 | P3 |
| CA-01 | Case · callback sheet (`callback.notReached`) | Couldn’t schedule a callback. The patient wasn’t reached. | Couldn’t schedule **the** callback. The patient wasn’t reached. | 10 · **agreed** | P3 |
| CA-04 | Sign-in, OTP (`signin.couldntSend`, `otp.couldntVerify`, `otp.resendFailed`) | We couldn’t send the code. · We couldn’t check the code. · We couldn’t send a new code. | Couldn’t send the code. · Couldn’t check the code. · Couldn’t send a new code. | 8, 10 (same failure pattern as the case screens) | P3 |
| CA-05 | OTP · toast (`otp.newSent`) | New code sent. | New code sent | 14, 23 | P3 |
| CA-22 | Case · leave sheet button | Stay on this case | Stay | 16 ("Release case" / "Stay"), 12 | P3 |
| CA-24 | Prescribe · dose chip for "none" (cream) | — | None | 21, 25 (screen reader already says "none") | P3 |
| CA-15 | Sheets · unavailable reasons | Didn't answer · …the patient's number | Didn’t answer · …the patient’s number (curly) | 21 | P3 |
| CA-16 | Prescribe · disable reason | The ordered strength isn't right | …isn’t right (curly) | 21 | P3 |
| CA-17 | Prescribe · disable reason | Cannot prescribe remotely | Can’t prescribe remotely | 5 | P3 |
| CA-18 | Prescribe · discard sheet | Your changes to this medicine will not be saved. | Your changes to this medicine won’t be saved. | 5 | P3 |
| CA-25 | Scripts · all `call.script*`, `call.forwardedTell` | "…" (straight quotes) | “…” (curly), wording unchanged | 21, 26 | P3 |
| CA-26 | OTP · screen-reader name of the code boxes | Four-digit verification code | 4-digit verification code | 22 | P3 |

## Dropped after re-checking against v2

| ID | Text | Why dropped |
|---|---|---|
| CA-03 | Number not registered with Truemeds. Already applied? We’ll contact you after approval. | Approved exception in rule 1 |
| CA-13 | You ended the call before the transfer. Next time, … | Approved exception in rule 1 (D-83) |
| CA-14 | You didn’t answer the call. | A plain fact, not blame (rule 4); same form as "You ended the call…" |
| CA-19 | Still talking · Call ended | Answer buttons are their own type in v2 (rule 12, D-77) |
| CA-23 | Back-blocked toast "Finish this case first…" | Guidance toasts are full sentences in v2 (rule 14, D-77) |
| CA-20 | Unavailable (button) | **Fixed label:** "Mark patient unavailable" doesn't fit the half-width button at 360 (rule 24 beats verb-first). Add "Unavailable" to the fixed names in rule 12 |
| CA-21 | Not you? Switch account | False positive: it's one button ("Not you? **Switch account**"), not two |

## Open, not copy fixes (logged)
- **Empty-case team name:** "Our Ops team" stays a placeholder until OQ-035 decides who checks these orders.
- **Faster sign-in "Truemeds never sees or stores it":** Engineering to confirm before launch (true for phone screen lock / biometrics handled by the OS).
- **Notes placeholder** ("…internal notes…"): depends on the open decision on who can see notes.
- **Printed prescription (Rx paper):** a document, not UI text, so it's outside the copy rules.

## For the build
Add the script checks listed in `COPY-AUDIT.md` ("Script checks to add during the build") for rules 4, 5, 11, 13, 14, 19, 21, 22, 23 to `check-sources.mjs`, with the approved exceptions as an allowlist.

## Final list (run 2, 2026-11-03: decided by the terminal, Apurva away; FIX-BRIEF step 0b)

Basis: `COPY-AUDIT-v2.md` (23 agreed, 3 disputed, 7 new fail IDs). Rows marked **defer** are not applied this round and are listed under NEEDS-APURVA. Every row is one string or group; "Layout" means the picture changes.

| # | ID | Where (states) | Current | Fix | Rule | Layout or text | Pictures that change |
|---|---|---|---|---|---|---|---|
| F01 | CA-01 | `callback.notReached` (c-callback-refused) | Couldn’t schedule a callback. The patient wasn’t reached. | Couldn’t schedule the callback. The patient wasn’t reached. | 10 | Text | c-callback-refused (390 + 360) |
| F02 | CA-02 | `case.noMedicines` (a-no-medicines) | This order has no medicines. Release it — our Ops team will check it. | No medicines on this order. Our Ops team will check it. | 7, 21 | Text | a-no-medicines |
| F03 | CA-04a | `signin.couldntSend` (sign-in/couldnt-send) | We couldn’t send the code. | Couldn’t send the code. | 8, 10 | Text | couldnt-send |
| F04 | CA-04b | `otp.couldntVerify` (otp/couldnt-verify) | We couldn’t check the code. | Couldn’t check the code. | 8, 10 | Text | couldnt-verify |
| F05 | CA-04c | `otp.resendFailed` (otp/resend-failed) | We couldn’t send a new code. | Couldn’t send a new code. | 8, 10 | Text | resend-failed |
| F06 | CA-04d | `call.resultMissing` (case/s7d-result-missing, -pilot, s7d-unavailable-sheet) | We didn’t get the call result. | Couldn’t get the call result. | 8, 10 | Text | 3 states |
| F07 | CA-05 | `otp.newSent` (otp/new-code-sent) | New code sent. | New code sent | 14, 23 | Text | new-code-sent |
| F08 | CA-06a | `home.idleExpired` (home/idle-expired) | Your availability ended. Set it again to request cases. | Your availability ended. You won’t get new cases. | 7 | Text | idle-expired |
| F09 | CA-06b | `home.manuallyEnded` (home/manually-ended) | You ended your availability. Set it again to request cases. | You ended your availability. You won’t get new cases. | 7 | Text | manually-ended |
| F10 | CA-07 | span "Order Confirmed." (case/t10a-confirmed, e-availability-ended, s7f-submitted) | Order Confirmed. | Remove the line | 18, 6 | **Layout** (line removed) | 3 states |
| F11 | CA-08 | span "Forwarded for Review." (case/t10b-forwarded) | Forwarded for Review. | Remove the line | 6, 10 | **Layout** | t10b-forwarded |
| F12 | CA-09 | span "Transferred to HA." (case/t14-transferred) | Transferred to HA. | Remove the line | 19, 10 | **Layout** | t14-transferred |
| F13 | CA-10 | span "Patient unavailable — case returned to the queue." (case/t09-patient-unavailable) | Patient unavailable — case returned to the queue. | Patient unavailable. The case is on hold. (annex wording kept; the shorter option "The case is on hold." was not taken). **Not visible in the picture**: see the status table | 6, 21, 23 | Layout at 390 (one line less); text at 360 | t09-patient-unavailable (390) |
| F14 | CA-11 | span "Callback scheduled — Today at 3:00 PM." (case/e-callback-scheduled) | Callback scheduled — Today at 3:00 PM. | Remove the line | 21, 23, 10 | **Layout** | e-callback-scheduled |
| F15 | CA-12 | `call.submittedText` (case/s7f-submitted) | Your prescription is saved. We’ll confirm it once the record arrives. | Your prescription is saved. It isn’t confirmed until the call record arrives. (**main-check 1: decided wording, D-84 note; supersedes "It isn’t confirmed."**) | 6 | Text | s7f-submitted |
| F16 | CA-15 | "Didn't answer", "Invalid or not the patient's number" (case/s7d-unavailable-sheet) | straight apostrophes | curly apostrophes | 21 | Text | s7d-unavailable-sheet |
| F17 | CA-16 | "The ordered strength isn't right" (case/d-disable-sheet) | straight | curly | 21 | Text | d-disable-sheet |
| F18 | CA-17 | "Cannot prescribe remotely" (case/d-disable-sheet) | Cannot prescribe remotely | Can’t prescribe remotely | 5 | Text | d-disable-sheet |
| F19 | CA-18 | "Your changes to this medicine will not be saved." (case/d-discard-sheet) | will not | won’t | 5 | Text | d-discard-sheet |
| F20 | CA-22 | "Stay on this case" (case/a-leave-sheet, a-releasing, s7e-leave-sheet) | Stay on this case | Stay | 16, 12 | Text | 3 states |
| F21 | CA-24 | dose chip "—" (case/d-cream) | — | None | 25, 18 | Text | d-cream |
| F22 | CA-25 | `call.scriptCat4`, `call.scriptTransfer`, `call.scriptNeutral`, `call.forwardedTell`, `call.scriptForward` (unused) | straight double quotes | curly “…” around each script, wording unchanged | 21, 26 | Text | a-back-blocked, c-skip-ha, g0-calling-pilot, g3b-forwarded |
| F23 | CA-26 | aria-label of OTP code boxes (17 states) | Four-digit verification code | 4-digit verification code | 22 | Aria only | none |
| F24 | CA-31 | "Sending a new code…" (otp/resending); "Checking…" (otp/cooldown-reconciling) | — | Put in a polite live region (attribute, no copy change) | 25 | Attribute only | none |
| F25 | CA-32 | aria-label of medicine rows (22 names, 82 states) | Edit Metformin … | Edit {name} {strength} (visible name) | 25 | Aria only | none |
| F26 | CA-34 | chips "4 h", "8 h", "12 h" (case/d-every-x-hours) | 4 h | "4 h" (non-breaking space) | 24 | Text (re-check at 130%) | d-every-x-hours (only if the picture moves) |
| F27 | CA-35 | placeholder "10-digit mobile number" (sign-in/*) | 10-digit mobile number | e.g. 98765 43210 | 17 | Text (placeholder) | empty-field sign-in states |
| F28 | CA-30 | dose error (case/d-error-dose), date/time error (case/c-callback-error) | — | Tie the error to its group with aria-describedby (attribute only) | 25 | Attribute only | none |

**Deferred (not applied this round; see NEEDS-APURVA in the audit):**
- CA-03 `signin.notRegistered`: kept as is (exception; wording to confirm).
- CA-13, CA-14, CA-19, CA-23: dropped, as in the annex.
- CA-20 "Unavailable" button (s7d ×3): kept. "Mark unavailable" overflows at 130% text, and "Unavailable" already overflows at 130%. Needs a layout decision or a rule 12 fixed-name decision.
- CA-21 "Not you? Switch account": kept. Moving "Not you?" above the button adds a line in 7 states; Apurva decides.
- CA-33 "Resend in" + "0:30": markup change to one key is deferred. The timer format "0:30" vs "00:30" is a rule-22 question: the app uses m:ss everywhere (9:42, 14:52), so the rule text needs deciding.
- CA-36 "Wrong code.": approved by D-81; rule 8 vs string to decide.
- Rule 10 dismiss-button naming, and "Your selection is saved." (home/setup-failed): NEEDS-APURVA.

### Applied status (MAIN-CHECK 1, 2026-11-03; supersedes the earlier status)

| Row | Status | Note |
|---|---|---|
| F01 | Applied | messages.json; c-callback-refused |
| F02 | Applied | a-no-medicines |
| F03–F05 | Applied | sign-in, OTP |
| F06 | Applied | s7d ×3 |
| F07 | Applied | new-code-sent |
| F08–F09 | Applied | idle-expired, manually-ended |
| F10–F14 | Applied, **no visible change** (F13 "on hold" line is not drawn, so the doctor does not see it; decision needed, REPORT §7) | Fixed in `case.html` (`fixOutcomeCopy`, after render and by a MutationObserver), not in root `app.js`. Root `app.js` still generates the same text (lines 172, 436, 753, 827); the case page hides or rewrites it. The outcome lines were in the DOM but are not drawn in the frozen pictures (checked: t10a, t09 and e-callback show only the title card), so the pictures do not change. F13 text is now "Patient unavailable. The case is on hold." |
| F15 | Applied | Wording per D-84 note: "Your prescription is saved. It isn’t confirmed until the call record arrives." (supersedes "It isn’t confirmed.") |
| F16–F20 | Applied | sheets; "Stay" |
| F21 | Applied | Cream chip "—" → "None" in `case.html` (prescribe overlay chips too) |
| F22 | Applied | Curly quotes; "shortly" dropped from `call.forwardedTell` and `call.scriptForward` (D-84 note, rule 6) |
| F23 | Applied | OTP aria |
| F24, F25, F26, F28 | Moved to build (D-84) | Accessibility items and the chip non-breaking space; logged in backlog |
| F27 | Applied | placeholder |

Other changes: `ui-screens/app-logic.md` quotes updated for the changed strings (see the round report). Rules file is v2.1. `check-sources.mjs` now runs the copy checks for rules 4, 5, 11, 13, 14, 19, 21, 22, 23 over `visible-strings.json` (generated by `extract-visible-strings.py`) and `messages.json`.
