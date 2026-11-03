# Copy audit, doctor portal (audit only, no screen changes)

**Date:** 2026-11-03 · **Branch:** `project/truemeds-doctor-portal-prototype` · **Decision:** D-84 (audit only; fixes go to the copy annex, not to the frozen pictures)
**Method:** DOM text, aria-labels, placeholders and titles collected at 390 from all 149 states (`_work/extract_dom.py` → `_work/dom-390.json`); deduplicated into `_work/inventory.csv`; each unique string checked against the rules that apply to its element type; rule 24 (fit) checked on 360 pictures (`case/a-long-content`, `case/t16c-transfer-missed-unknown`, `sign-in/not-registered`). Independent check: fresh subagent, given only `COPY-RULES.md` and the fail table (`_work/fail-table.md`).

## Read first: which rule text was checked

- **The rule file on disk has 22 items** (rules 1–21 plus 4a). It is the version committed in `9111ea1` ("copy rules v2 approved (D-84)"). The brief and D-84 say **26 rules**, and the Codex rewrites in `codex-report.md` (R1–R21) are not in the file. This audit checks against the file on disk. **Apurva to confirm which text is the standard** (see Rule-text issues).

## Summary

| Measure | Count |
|---|---|
| Strings inventoried (occurrences, 149 states at 390) | 5,107 |
| Unique (string × source kind: text, aria, placeholder, title) | 524 |
| Unique text values | 517 |
| Passing | 480 |
| Failing (unique text values in 26 rows) | 37 |
| Rows (fails) | 26 (2 agreed, 24 new) |

**Fails by priority:** P1 3 · P2 6 · P3 17.

**Fails by screen:** Sign-in 2 · OTP 1 · Faster sign-in offer 0 · Returning unlock 1 · Home + Profile 1 · Case 6 (+2 agreed) · Calling 5 · Prescribe 4 · Sheets 2 · Scripts 1 · Accessible names 1.

**Fails by rule** (a row can cite more than one):

| Rule | Rows | Rule | Rows |
|---|---|---|---|
| 1 Plain, notice ≤2 sentences | 03, 13 | 10 Button verb-first, 1–3 words | 19, 20, 21, 22 |
| 3 Who is who | 04 | 12 Toast = short past fact | 05, 23 |
| 4 Calm, no blame | 14 | 13 "case" vs "order" | 07 |
| 4a Contractions | 17, 18 | 14 HA spelled out | 09 |
| 5 Message doesn't repeat a button | 02, 06 | 17 Curly apostrophes and quotes | 15, 16, 25 |
| 6 True to current state | 10, 12 | 18 No dashes in UI text | 02, 10, 11, 24 |
| 9 One wording per thing | 01, 04, 07, 08, 09, 11, 20, 24 | 19 Numbers in digits | 26 |
| | | 20 Full-stop rules | 05, 09, 10, 11, 23 |

**Independent check (25 rows; CA-26 added after the check):** 21 confirmed · 1 disagreed on citation (CA-12) · 3 unsure (CA-10, CA-14, CA-19). Three fixes were rejected as drafted and revised here: CA-11, CA-14, CA-23. Reviewer's rule-wording points are in Rule-text issues. Where the reviewer and this audit differ, both are in the note.

---

## Already agreed (D-84 pt 3)

| ID | Where | Current text | Rule(s) | Problem | Proposed fix | Priority | Note |
|---|---|---|---|---|---|---|---|
| CA-01 | Case · callback sheet failure (`callback.notReached`, `case/c-callback-refused`) | Couldn’t schedule a callback. The patient wasn’t reached. | 9 | "a callback" here; `case.callbackFailed` says "the callback" for the same failure | Couldn’t schedule the callback. The patient wasn’t reached. | P3 | **Agreed** (D-84 pt 3). Reviewer: CONFIRM. Build text differs from the agreed text; this is the one-word change. |
| CA-02 | Case · empty case (`case.noMedicines`, `case/a-no-medicines`) | This order has no medicines. Release it — our Ops team will check it. | 5, 18 | "Release it" repeats the Release case button on the same screen; em dash | No medicines on this order. Our Ops team will check it. | P2 | **Agreed** (D-84 pt 3). Reviewer: CONFIRM, caveat: "Our Ops team" vs rule 15 "Doctor Ops" stays open until OQ-035 (NEEDS-APURVA 2). |

---

## Sign-in

| ID | Where | Current text | Rule(s) | Problem | Proposed fix | Priority | Note |
|---|---|---|---|---|---|---|---|
| CA-03 | `signin.notRegistered` (`sign-in/not-registered`) | Number not registered with Truemeds. Already applied? We’ll contact you after approval. | 1 | Three sentences; a notice allows two | Number not registered with Truemeds. If you’ve applied, we’ll contact you after approval. | P2 | Reviewer: CONFIRM. The question becomes a condition; meaning otherwise kept. 360 picture: wraps to 3 lines, fits. |
| CA-04 | `signin.couldntSend` (`sign-in/couldnt-send`); also OTP and Calling (see CA-04 keys below) | We couldn’t send the code. | 3, 9 | "We" on entry, OTP and calling screens; no subject on case screens. Same failure, two wordings | Couldn’t send the code. (Keys: `otp.couldntVerify` → Couldn’t check the code. · `otp.resendFailed` → Couldn’t send a new code. · `call.resultMissing` → Couldn’t get the call result.) | P3 | Reviewer: rule 9 breach is real; rule 3 does not require dropping "we", so the style choice is Apurva's (Rule-text issues). Reviewer: rule 6 wants "what's kept". The current lines have none, so the fix adds none. |

## OTP

| ID | Where | Current text | Rule(s) | Problem | Proposed fix | Priority | Note |
|---|---|---|---|---|---|---|---|
| CA-05 | `otp.newSent` (`otp/new-code-sent`) | New code sent. | 12, 20 | Toast ends with a full stop | New code sent | P3 | Reviewer: CONFIRM. |

## Faster sign-in offer

No fails. All 11 keys checked (`offer.*`, `unlock.unavailable`, offer screen text). "Truemeds never sees or stores it." is a truth claim, not a copy rule; see NEEDS-APURVA 5.

## Returning unlock

| ID | Where | Current text | Rule(s) | Problem | Proposed fix | Priority | Note |
|---|---|---|---|---|---|---|---|
| CA-21 | "Not you?" button (`unlock/*`, 7 states) | Not you? | 10 | A question, not a verb-first action. Sits beside a separate "Switch account" element, so the same action is named twice | One button labelled "Switch account"; drop the duplicate element | P3 | Reviewer: CONFIRM; meaning shifts slightly. Check the layout at 360 after removing the duplicate. |

## Home + Profile

| ID | Where | Current text | Rule(s) | Problem | Proposed fix | Priority | Note |
|---|---|---|---|---|---|---|---|
| CA-06 | `home.idleExpired` (`home/idle-expired`); `home.manuallyEnded` (`home/manually-ended`) | Your availability ended. Set it again to request cases. · You ended your availability. Set it again to request cases. | 5 | "Set it again" repeats the Set availability button, which is on both screens (verified in DOM) | Your availability ended. You won’t get new cases. · You ended your availability. You won’t get new cases. | P2 | Reviewer: CONFIRM, caveat: "won’t get new cases" is a product statement. It matches the home sheet ("You won’t receive new cases after this"). Apurva to confirm. |

## Case

| ID | Where | Current text | Rule(s) | Problem | Proposed fix | Priority | Note |
|---|---|---|---|---|---|---|---|
| CA-07 | Span under title (`case/t10a-confirmed`, `case/e-availability-ended`, `case/s7f-submitted`) | Order Confirmed. | 9, 13 | "Order" is the patient's purchase; the doctor's act is "Prescription confirmed", the title on the same screens. On s7f it claims confirmation while the call record is still awaited | Remove the span; the title says it | P1 | Reviewer: CONFIRM (cited 9, 13; rule 6 dropped, it covers failure lines). app-logic §6 Flag 7 names "Order Confirmed" as a pre-D-50 label. The s7f problem overlaps CA-12. |
| CA-08 | Span (`case/t10b-forwarded`) | Forwarded for Review. | 9 | "Review" is not a state in the app. The title on the same screen says "Forwarded to Health Advisor". Full stop | Remove the span; the title says it | P1 | Reviewer: CONFIRM. app-logic §6 Flag 7 names "Forwarded for Review" as a pre-D-50 label. |
| CA-09 | Span (`case/t14-transferred`) | Transferred to HA. | 9, 14, 20 | "HA" outside the Skip HA button. Duplicates the title "Transferred to Health Advisor". Full stop | Remove the span; the title says it | P2 | Reviewer: CONFIRM. |
| CA-10 | Span (`case/t09-patient-unavailable`) | Patient unavailable — case returned to the queue. | 6, 18, 20 | Says the case returns to the queue. The current rule is hold and system retry; nothing goes to Ops (D-83 §6, app-logic §5 and §7). Em dash; full stop | Patient unavailable. The case is on hold and will be retried. | P1 | Reviewer: UNSURE. The "untrue" finding rests on app-logic, which rule 6 points to (brief). Checked against app-logic §5, §7 and D-83 §6. "Will be retried" needs confirmation (NEEDS-APURVA 3). |
| CA-11 | Span (`case/e-callback-scheduled`) | Callback scheduled — Today at 3:00 PM. | 9, 18, 20 | Em dash; full stop. Repeats the title "Callback today at 3:00 PM" on the same screen | Callback scheduled | P3 | Reviewer: "fix problem" on my first draft ("for today"), which breaks rule 9 against the title. Revised: the time stays in the title. |
| CA-23 | Toast (`case/a-back-blocked`) | Finish this case first. · Then you can go back to Home. | 12, 20 | Two full stops on toasts. Rule 12 wants a short past fact, and this is an instruction | Remove both full stops; wording kept | P3 | Reviewer: "fix problem" on the stops-only fix, because the instruction still breaks rule 12. Kept as D-77 pt 2 approves the toast. The conflict is in the rule text (NEEDS-APURVA 7). |

## Calling

| ID | Where | Current text | Rule(s) | Problem | Proposed fix | Priority | Note |
|---|---|---|---|---|---|---|---|
| CA-12 | `call.submittedText` (`case/s7f-submitted`) | Your prescription is saved. We’ll confirm it once the record arrives. | 6 (accuracy) | The copy promises a confirmation the rules can reverse: with no record under the gate, the prescription is not confirmed (D-83 §9, CW-D3/D4) | Your prescription is saved. It isn’t confirmed until the call record arrives. | P2 | Reviewer: DISAGREE on citation. Rule 6 covers failure lines, so this is an accuracy issue outside the copy rules. The problem stands; the cite changed. The copy for the no-record branch is NEEDS-APURVA 4. "Call record" may count as a system word (rule 8). |
| CA-13 | `call.transferMissedDoctor` (`case/t16-transfer-missed`) | You ended the call before the transfer. Next time, stay on the line until the Health Advisor joins. They’ll call the patient back. | 1 | Three sentences; a notice allows two | The call ended before the transfer, and the Health Advisor will call the patient back. Next time, stay on the line until they join. | P2 | Reviewer: CONFIRM on length. DISAGREE on rule 4: rule 4 cites "You ended the call…" as an allowed fact, so rule 4 is dropped from the cite. The first draft had a causal "so"; removed. |
| CA-14 | `call.doctorMissed` (`case/t04-doctor-missed`) | You didn’t answer the call. | 4 (judgment) | Reads as a statement about the doctor with no coaching. Rule 4 allows "You ended the call…" as a fact, so this is a judgment call | The call wasn’t answered. | P3 | Reviewer: UNSURE, "fix problem". The first draft asserted "on your phone" and no-answer detection (OQ-027 open); dropped. Keep or change: NEEDS-APURVA 6. |
| CA-19 | Answers (`case/s7b-still-on-call`) | Still talking · Call ended | 10 | Not verb-first | No change proposed | P3 | Approved by D-77 pt 1 (replaces "Yes, still talking" / "No, call ended"). Reviewer: UNSURE; the rule text has no carve-out for approved strings. Logged so Apurva decides knowingly (NEEDS-APURVA 7). |
| CA-20 | "Unavailable" button (`case/s7d-result-missing`, `s7d-result-missing-pilot`, `s7d-unavailable-sheet`) | Unavailable | 10, 9 | Not verb-first. The sheet title says "Mark patient unavailable" | Mark patient unavailable | P3 | Reviewer: CONFIRM; suggested the title wording for rule 9. Three words, passes rule 10. The label itself: NEEDS-APURVA 8. |

## Prescribe

| ID | Where | Current text | Rule(s) | Problem | Proposed fix | Priority | Note |
|---|---|---|---|---|---|---|---|
| CA-16 | Option description (`case/d-disable-sheet`) | The ordered strength isn't right | 17 | Straight apostrophe. D-81 pt 1 says all apostrophes are curly and guarded in `check-sources`; this one was missed | The ordered strength isn’t right | P3 | Reviewer: CONFIRM. |
| CA-17 | Option title (`case/d-disable-sheet`) | Cannot prescribe remotely | 4a | Uncontracted | Can’t prescribe remotely | P3 | Reviewer: CONFIRM. |
| CA-18 | Sheet body (`case/d-discard-sheet`) | Your changes to this medicine will not be saved. | 4a | Uncontracted | Your changes to this medicine won’t be saved. | P3 | Reviewer: CONFIRM. |
| CA-24 | Dose chip (`case/d-cream`, 3 states); aria "Morning: none" | — | 18, 9 | Em dash used as a chip label. The accessible name says "none" | None | P3 | Reviewer: CONFIRM. The aria already says "none", so the visible label matches. |

## Sheets

| ID | Where | Current text | Rule(s) | Problem | Proposed fix | Priority | Note |
|---|---|---|---|---|---|---|---|
| CA-15 | Option titles/descriptions (`case/s7d-unavailable-sheet`) | Didn't answer · Invalid or not the patient's number | 17 | Straight apostrophes | Didn’t answer · Invalid or not the patient’s number | P3 | Reviewer: CONFIRM. Same miss as CA-16. |
| CA-22 | Leave-sheet button (`case/a-leave-sheet`, `a-releasing`, `s7e-leave-sheet`) | Stay on this case | 10 | Four words; buttons allow one to three | Stay on case | P3 | Reviewer: CONFIRM. |

## Scripts

| ID | Where | Current text | Rule(s) | Problem | Proposed fix | Priority | Note |
|---|---|---|---|---|---|---|---|
| CA-25 | `call.scriptCat4`, `call.scriptTransfer`, `call.scriptNeutral`, `call.forwardedTell` (shown); `call.scriptForward` (not shown in any state) | Spoken lines in straight double quotes | 17 | Straight quotes | Curly quotes “…” around each script; wording unchanged | P3 | Reviewer: CONFIRM. Dashes inside the scripts are allowed (rule 18 exception). Script length and truth for the route are OK (rule 21). |

## Accessible names

| ID | Where | Current text | Rule(s) | Problem | Proposed fix | Priority | Note |
|---|---|---|---|---|---|---|---|
| CA-26 | OTP code input (`aria-label`, 17 states) | Four-digit verification code | 19 | Spelled-out number in a numeric label; rule 19 says "4-digit" | 4-digit verification code | P3 | Added after the independent check; not reviewed by the subagent. |

Other accessible names checked (close, back, zoom, edit row, duration, "Morning: …" chips): no fails.

---

## Script checks to add during the build

For each ⚙ / ◐ rule: how `check-sources.mjs` would check it, and how many current strings it would flag. Counts are from `_work/dom-390.json`. The script is not yet changed, and these checks are proposals.

| Rule | Proposed check | Current hits | Notes |
|---|---|---|---|
| 4 (no !) ⚙ | Regex `!` on all text | 0 | — |
| 7 (waiting lines, no full stop) ⚙ | Starts `-ing` word, ends `.` | 1 flagged | `home.stopPending` is a two-sentence notice, not a waiting line. Exclude multi-sentence strings. Real hits: 0. |
| 11 (titles, no full stop) ⚙ | Title classes (`tm-sheet__title`, `tm-text-title*`, `tm-status-card__title`, `tm-header-*__title`) ending `.` | 0 | — |
| 12 (toasts, no full stop) ⚙ | `tm-toast` class ending `.` | 2 | CA-23. `New code sent.` (CA-05) is not checked by class yet. |
| 17 (curly) ⚙ | Straight `'` and `"` | 3 apostrophe + 4 quote strings | CA-15, CA-16; CA-25 (plus `call.scriptForward`, not shown). |
| 18 (no dashes) ⚙ | `[—–]` outside spoken scripts and the printed Rx paper | 8 raw → 4 flags | Excluded: 2 in scripts (allowed), 2 in the mock Rx paper (exempt pending NEEDS-APURVA 9). Flags: CA-02, CA-10, CA-11, CA-24. |
| 19 (digits) ⚙ | Spelled numbers one to ten in labels, with an allowlist for idioms | 4 raw → 1 flag | "one touch", "at least one time" are idioms. Real: CA-26. |
| 20 (full stops) ⚙ | Status-span and toast classes ending `.` | 2 by class; 5 more once the status class exists | Status spans: `Forwarded for Review.`, `Transferred to HA.`, `Callback scheduled — …`, `New code sent.`, and `Order Confirmed.` (rows CA-05, CA-08, CA-09, CA-11, CA-07). |
| 14 (HA spelled out) ◐ | `\bHA\b` except `Skip HA` | 1 | CA-09. |
| 4a (contractions) ◐ | Regex: cannot, will not, do not, is not, are not | 2 | CA-17, CA-18. |
| 1 (notice ≤ 2 sentences) ◐ | Sentence count on notice/status strings | 2 | CA-03, CA-13. Span vs toast vs sheet classification is needed first. |
| 10 (verb-first buttons) ◐ | Not mechanical. Needs a verb list plus an allowlist (Callback, Skip HA, View Rx and other product names; "Not now" per D-66) | 4 fails | CA-19, CA-20, CA-21, CA-22. |
| 3, 5, 6, 9, 12 (meaning) | Judgment; no script | — | Covered by the fail table. |

---

## NEEDS-APURVA

Product facts and decisions only. Rule wording is under Rule-text issues.

1. **Read this first (decision):** which rule text is the standard, the 22-item file on disk or the 26-rule version D-84 describes? The audit used the file on disk.
2. **Empty-case owner (CA-02):** "Our Ops team" or "Doctor Ops" (rule 15)? Depends on OQ-035.
3. **Hold wording (CA-10):** is "will be retried" correct? Confirm the retry copy against the hold timer (OQ-001).
4. **No-record outcome (CA-12, CA-07):** when no call record arrives, the prescription is not confirmed and the case goes back through hold (D-83 §9). No copy exists for what the doctor sees then. Name the outcome and its wording.
5. **Biometric claim (faster sign-in offer):** "Truemeds never sees or stores it." Confirm with engineering before this ships.
6. **Doctor-missed line (CA-14):** is the state about the doctor's own phone, leg 1? The fix assumes so.
7. **Approved exceptions (CA-19, CA-23):** keep "Still talking / Call ended" (D-77 pt 1) and the back-blocked toast (D-77 pt 2) as they are, though rules 10 and 12 don't allow them?
8. **"Unavailable" label (CA-20):** confirm the approved wording (D-58 / D-75; not re-read in this audit). The fix proposes "Mark patient unavailable".
9. **Mock Rx paper:** is the printed prescription document content, exempt from rule 18 (en dashes in the address and hours), or must it follow the rule?
10. **Notes placeholder:** "Clinical observations, instructions, internal notes…" implies notes are not visible to others. Notes visibility is an open decision (CLAUDE.md). Confirm before the placeholder ships.

## Rule-text issues (for the rule owner, not product facts)

- Version mismatch: 22 items on disk vs 26 in D-84 and the brief (see Read first).
- Rule 6: "plus what's kept or why" reads as mandatory, but the current failure lines don't have it (CA-04). Say whether it's required.
- Rule 4 cites "You ended the call…" as an allowed fact, which conflicts with CA-13 and CA-14. Pick one.
- Rule 20 covers labels, titles, toasts and waiting lines, but the status spans (CA-05, CA-07 to CA-11) fit none of these. Add a status category.
- Rules 10 and 12 have no carve-out for approved exceptions (D-77). Add one, or fix the strings.
- Rule 12 ("a short past fact") conflicts with instruction toasts (CA-23).
- Rule 1 says "notice" without defining it. Spans, toasts and sheets are unclear.
- Rule 3 says "we" means Truemeds but does not say whether entry screens must use it (CA-04).
- Rule 9 does not say when a span or sheet title may repeat or differ from a button or title (CA-11, CA-20).
- Rule 8 "system words" is undefined ("call record", CA-12).
- Rule 4a says "use contractions" without saying whether every negative must be contracted.
- Rule 15 names "Doctor Ops", while the copy uses "Our Ops team" pending OQ-035 (CA-02).
- Rule 5 relies on "a control on screen". It is unclear when a sheet or toast sits over another screen.
- Rule 18 bans dashes, but dose notation ("1-0-1") and "4-digit" use hyphens. Say hyphens are allowed.
- Rule 7 has no status category: "On call…" (`call.onCall`, not shown in any state) is a status, not a waiting line.

---

COPY AUDIT DONE — fails: 26 (P1 3, P2 6, P3 17)
