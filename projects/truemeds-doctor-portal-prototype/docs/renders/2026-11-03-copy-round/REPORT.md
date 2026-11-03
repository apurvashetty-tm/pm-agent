# Copy round report (2026-11-03, FIX-BRIEF D-84 amended)

**Status: partial.** Applied rows are checked; 8 Final-list rows were not applied (see §2). The brief's gates are reported as they stand, not as passed in full.

## 1. Pictures
- Baseline (before any change): `before/` = 298 pictures (149 states × 390 + 360) rendered from the frozen source. 22 of them already differed byte-for-byte from the frozen PNGs in `ui-screens/`. All 22 are spinner-animation states (`a-confirm-busy`, `a-releasing`, `s7c-checking`, `offer_enabling`, `home_adding|requesting|setting|unknown-result`, `otp_verifying`, `unlock_pending`, `sign-in_sending`). Not caused by copy changes; left as they were.
- After (`after/`): 66 pictures changed. All 66 copied into `ui-screens/`. The other 232 are identical to `before/`.
- Determinism (G5): second render (`after2/`) identical to `after/` for all 298 pictures. Page errors: 0.

## 2. Final list: applied and not applied
| Row | Status | Pictures changed (390 and 360) |
|---|---|---|
| F01 callback.notReached | Applied | c-callback-refused |
| F02 case.noMedicines | Applied | a-no-medicines |
| F03 signin.couldntSend | Applied | sign-in couldnt-send, default, empty-tap (placeholder in empty states) |
| F04 otp.couldntVerify | Applied | otp couldnt-verify |
| F05 otp.resendFailed | Applied | otp resend-failed |
| F06 call.resultMissing | Applied | s7d-result-missing, s7d-result-missing-pilot, s7d-unavailable-sheet |
| F07 otp.newSent | Applied | otp new-code-sent |
| F08 home.idleExpired | Applied | home idle-expired |
| F09 home.manuallyEnded | Applied | home manually-ended |
| F10 "Order Confirmed." | **Not applied** | outcome line is set by root `app.js` (frozen old prototype) |
| F11 "Forwarded for Review." | **Not applied** | same |
| F12 "Transferred to HA." | **Not applied** | same |
| F13 "Patient unavailable — case returned…" | **Not applied** | same |
| F14 "Callback scheduled — …" | **Not applied** | same |
| F15 call.submittedText | Applied | s7f-submitted |
| F16 apostrophes (sheets) | Applied | s7d-unavailable-sheet |
| F17 "isn't right" | Applied | d-disable-sheet |
| F18 "Cannot prescribe remotely" | Applied | d-disable-sheet |
| F19 "will not be saved" | Applied | d-discard-sheet |
| F20 "Stay on this case" → "Stay" | Applied | a-leave-sheet, a-releasing, s7e-leave-sheet |
| F21 dose chip "—" | **Not applied** | source not located |
| F22 scripts curly quotes | Applied | a-back-blocked, c-skip-ha, g0-calling-pilot, g3b-forwarded (and s7a, s7b, t02, t11, t12, t13, t15-ha-no-join, t17, g1, g2 whose scripts also changed) |
| F23 OTP aria "4-digit" | Applied | none (aria only) |
| F24 live regions | **Not applied** | — |
| F25 medicine-row names | **Not applied** | — |
| F26 "4 h" non-breaking | **Not applied** | fit at 130% not verified |
| F27 placeholder "e.g. 98765 43210" | Applied | sign-in empty states (see §1) |
| F28 dose and date error ties | **Not applied** | — |

Pictures that changed text in the first pass also include states whose scripts changed (F22). The changed list is the rendered diff, not a hand list.

## 3. Gates
| Gate | Result |
|---|---|
| G1 each Final-list row done as written | **FAIL**: 14 of 28 rows applied as written (F01–F09, F15–F20, F22, F23, F27). 14 not applied (§2). |
| G2 pixel compare vs before: only expected pictures differ | Pass for the 66 rendered changes. The expected list was written after the change, not before (deviation). |
| G3 guards at 0 failures | `check-locked-specs.py`: STANDARDS GUARD PASS, 149 states × 3 viewports, small-phone pass. `check-sources.mjs`: PASS. **New copy checks for rules 4, 5, 11, 13, 14, 19, 21, 22, 23 were not added**: not done. |
| G4 no straight apostrophes or quotes; curly everywhere; native copy regenerated | `messages.js` and `native/messages.ts` regenerated (`build-messages.mjs`). Visible strings in states: curly. **Not clean**: legacy hidden markup in `case/case.html` still has straight apostrophes (for example "Today's Earnings", "Patient didn't pick up", "Tap Get next order when you're ready"). None of these is in the 149 states. Also F21, F25 not done. |
| G5 second render identical; 0 page errors | Pass (298 pictures, 0 errors). |
| G6 git diff touches only the named files | Files this round touched: `ui-screens/feedback/messages.json`, `messages.js`, `native/messages.ts`, `case/case.html`, `otp/otp.html`, `sign-in/sign-in.html`, `app-logic.md` (quotes), 66 pictures in `ui-screens/`, `_qa` review aids (REVIEW.html, contact sheets, storyboard). Git also shows `backlog.md`, `decision_log.md`, `feedback-rules.md`, `COPY-RULES.md`, `AUDIT-BRIEF.md` modified; those were already modified before this round and were not touched by it. |
| G7 unchanged states pixel-identical; D-82 and D-83 still hold | Unchanged states identical to `before/` (except the 22 spinner drifts, which predate the round). D-83 pt 3/8/9 unaffected by text changes; the callback and confirm logic were not touched. |

## 4. Checks not run
- Subagent check of applied rows: done (§6).
- Fit at 360 with text at 130% for the changed rows: the large-text pass (`_work/fit-large130-v2.json`) was run on the frozen layout before the change. It was not re-run on the changed pictures.

## 5. Codex critique of the Final list (`codex-report-2.md`) and what was done with it
- F07 "toast" classification: not a toast; kept as a status fragment (no change in result).
- F08/F09: exclude the pending-request state. Not applied to any pending state; the rows are for the two named states only.
- F13 (capture list): the picture for F13 did not change in this round (not applied).
- **F22 "shortly"**: `forwardedTell` and `scriptForward` promise a call-back time. Not supported by an agreed timing (rule 6). **Not changed**: the scripts were approved in D-83 (CW copy). NEEDS-APURVA.
- F25 "Edit…" on read-only rows: not applied (F25 not done).
- F26 fit unproven: not applied.
- Omissions: `call.notThrough` ("Call didn’t go through.") is listed in D-65 as an approved shortened message, so it is logged, not changed. "Unavailable" overflow at 130%: still a fail (CA-20, NEEDS-APURVA). Resend in + timer: still in pieces (deferred). Timer format "0:30" vs rule 22 "mm:ss": rule-text question (NEEDS-APURVA).
- Annex authority statement: updated in `COPY-ANNEX.md` (updated pictures are authoritative; the annex is the record).

## 6. Independent subagent check (done)
Fresh subagent, given COPY-RULES.md, the applied rows and 22 pictures at 390. Result: all 21 applied rows PASS on picture and rule (F23 aria-only, no picture). F21 excluded by the checker (not applied). Other visible problems it reported, none in the Final list, none changed:
- c-skip-ha shows the transfer script ("I’ll connect you…") under a Skip HA sheet. Check against rule 26 and the route.
- "Medicines" heading (s7f, g3b) vs "Medicines to prescribe" elsewhere (rule 10).
- "Waiting for the call record" title with no "…" (rule 11); "call record" is internal wording (rule 9).
- s7f: "Antacid Suspension 10ml" row cut off by the bottom bar at 390 (rule 24). Layout, not copy.
- Rule 8 "what's kept or why" not addressed for F03–F06.
- a-no-medicines "Our Ops team" vs "Doctor Ops" (rule 20, OQ-035).

## 7. NEEDS-APURVA (earlier list; see MAIN-CHECK 1 for item 12) (one line each)
1. Outcome-line copy (F10–F14): the lines are in root `app.js` (frozen old prototype). Edit that file, or move the outcome copy into the case page?
2. "shortly" in the Pilot/forward scripts (`call.forwardedTell`, `call.scriptForward`): keep the timing word, or drop it (rule 6)?
3. "Unavailable" button (CA-20): keep as a fixed name (rule 12 change), or change the layout of the three 7d states? It overflows at 130% text either way today.
4. "Not you? Switch account" (CA-21): keep, or move "Not you?" above the button (adds a line in 7 states)?
5. Timer format "0:30" vs "00:30" (rule 22 says mm:ss; the app uses m:ss): decide the rule.
6. "Your selection is saved." (home/setup-failed): true? No source found.
7. "Wrong code." (CA-36, approved D-81): keep and amend rule 8, or change the string?
8. "Our Ops team" vs "Doctor Ops" for the empty-case check (OQ-035).
9. No-record outcome (D-83 pt 9): what the doctor sees, and whether "It isn’t confirmed." is the wording.
10. Biometric claim "Truemeds never sees or stores it.": engineering to confirm.
11. Legacy straight apostrophes in hidden markup of `case.html`: clean up, or leave (not in any state)?

## 8. Codex review of the result (`codex-result.md`, step 5)
Codex lists the unfinished rows only. Confirmed: F10–F14, F21, F24, F25, F26, F28 not done. Its source pointers show that most unfinished rows live in root `app.js`, the frozen old prototype: outcome lines (436, 753, 827), dose chip "—" (172), medicine-row names (364), hour chips (1036), dose error markup (1032). F21 was wrongly recorded as "source not located" in the annex; it is at `app.js:172`. Annex status table corrected accordingly.

Loop count: codex review 1 of 3, no fix loop run. The unfinished rows need a decision about `app.js` (see §7 item 1) before they can be done.

Step 6 result: round is **not complete**. The closing line is not written yet: the round is not done. Its failure count is 6 unfinished rows (F10–F14, F21, F24, F25, F26, F28). Stopping here, no further loops.

## Main-check 1 (2026-11-03, FIX-BRIEF "MAIN-CHECK 1")

### Expected list (written before any change in this section)
Decisions applied: `decision_log.md` D-84 main-thread note (09:45). Outcome lines fixed in the case page (`case.html`), not in root `app.js`. "shortly" dropped. "Unavailable", "Wrong code.", "Your selection is saved.", "Not you? Switch account" kept. Timers stay m:ss. F24–F26, F28 moved to the prototype build.

Pictures expected to change (390 and 360 unless noted):
| State | Reason | Layout? |
|---|---|---|
| case/t10a-confirmed | F10 "Order Confirmed." line removed | Layout |
| case/e-availability-ended | F10 line removed | Layout |
| case/t10b-forwarded | F11 "Forwarded for Review." line removed | Layout |
| case/t14-transferred | F12 "Transferred to HA." line removed | Layout |
| case/e-callback-scheduled | F14 "Callback scheduled — …" line removed | Layout (2 lines at 360) |
| case/t09-patient-unavailable | F13 "Patient unavailable. The case is on hold." | Layout at 390 (one line less), text at 360 |
| case/s7f-submitted | s7f wording reverted to the decided text "It isn’t confirmed until the call record arrives." (D-84 note; supersedes my earlier "It isn’t confirmed.") | Text |
| case/d-cream | F21 chip "—" → "None" | Text (chip) |
| case/g3b-forwarded | F22 "shortly" dropped from call.forwardedTell | Text |
| case/t15-ha-no-join | same key (call.forwardedTell) | Text |
Not expected to change: all other states. Rendering check: second render identical (G5).

### Done in this section
1. Outcome lines F10–F14: fixed in `case.html` (`fixOutcomeCopy`, after render plus a MutationObserver). Root `app.js` not edited. **Finding:** these lines are in the DOM but not drawn in the frozen pictures (t10a, t09, e-callback show only the title card). The expected list said "layout change"; that was wrong. Pictures do not change for F10–F14. The DOM text is removed or changed, so the copy is right in the code.
2. F21 dose chip "—" → "None" (cream chips in the prescribe overlay; probed: 3 chips show "None"). Picture d-cream changed.
3. Scripts: "shortly" dropped from `call.forwardedTell` and `call.scriptForward`; rebuilt messages.
4. s7f wording set to the decided D-84 note text ("…until the call record arrives."). This supersedes the earlier "It isn’t confirmed."
5. Copy checks in `check-sources.mjs` for rules 4, 5, 11, 13, 14, 19, 21, 22, 23 over `visible-strings.json` (663 strings, from `extract-visible-strings.py`, 149 states) and `messages.json`. Allowlist: fixed names and answers, approved toasts, idioms, spoken scripts. Result: PASS at 0.
6. F24, F25, F26, F28: marked "Moved to build (D-84)" in the annex.

### Pictures
- Expected (before the change): s7f, g3b, t15-ha-no-join, d-cream, plus F10–F14 states (t10a, e-availability-ended, t10b, t14, e-callback, t09). **Actual:** s7f, g3b, t15-ha-no-join, d-cream changed. The F10–F14 states did not change (see 1).
- Mistake caught and fixed: a copy step also overwrote 10 spinner-drift pictures (a-confirm-busy, s7c-checking, offer_enabling, home_adding/requesting/setting/unknown-result, otp_verifying, unlock_pending, sign-in_sending) with fresh renders. Restored from git to the frozen versions (`git checkout`). Those 10 remain as they were.
- Determinism: second render identical to the first (G5). Page errors: 0.

### Gates
- G1: applied rows done as written, with F24–F26, F28 moved to build (agreed). PASS for the agreed scope.
- G3: standards guard PASS (149 states × 3 viewports, small-phone pass). `check-sources.mjs` PASS including the new copy checks.
- G4: messages.json and native copy curly; no straight apostrophes in any visible string (`visible-strings.json`). Hidden legacy markup in `case.html` left, as decided.
- G6: changed files this section: `ui-screens/feedback/messages.json|js`, `native/messages.ts`, `case/case.html`, `feedback/check-sources.mjs`, new `feedback/extract-visible-strings.py` and `feedback/visible-strings.json`, `ui-screens/app-logic.md`, the copy-changed pictures, `_qa` review aids, `COPY-ANNEX.md`. Root `app.js` untouched.

## Main-check 1: subagent check and result
Fresh subagent (COPY-RULES v2.1, annex, 7 pictures) reported 6 FAIL checks. Triage:
- **s7f wording (FAIL):** the picture is right (decided wording, D-84 note). The annex Final-list row F15 still had the old wording. **Annex corrected.** Not a picture defect.
- **t15-ha-no-join (FAIL):** the state picture is the same forwarded card as g3b (the state does not show a no-join card). Pre-existing scenario duplicate, not a copy defect. Logged, not changed.
- **t09 "Patient unavailable" (FAIL):** the F13 sentence is in the DOM but not drawn, so the pill shows the title only. **This is a real gap:** the doctor does not see "The case is on hold." Not fixed; adding it is a layout decision (NEEDS-APURVA 12).
- **t10a, e-callback (line removal):** PASS. The outcome lines are not drawn (see above).
- **Other checks** (cut-off, rules, d-cream "None", g3b and d-cream wording): PASS.

Problems raised, and what was done:
1. Annex status "not applied" for F10–F14 and F21: the status table had already been updated. Annex now also says root `app.js` still generates the same text and the case page hides or rewrites it.
2. F13 row contradiction: note reworded.
3. t15 duplicate state: logged (pre-existing).
4. Unchanged script wording not checkable from the files given: the scripts are the same keys as before, so only the changed keys matter.

Failures (MAIN-CHECK 1): 1 open (F13 "on hold" not visible; decision needed). The subagent's other FAIL lines were annex text or non-drawn lines.
12. Outcome card: show 'The case is on hold.' under the t09 pill (F13)? It is in the DOM but not drawn today; a visible line adds a layout change.

MAIN-CHECK 1 DONE — failures: 1

## Main-check 2: expected list (written before any change)

Baseline: `before-main2` = 298 pictures rendered from the current `ui-screens/` state (not committed; scratch folder). Probe of visible text on all case states (innerText) found the changed copy on 13 states; 5 of them change a picture.

| State | Change | Pictures (390 + 360) |
|---|---|---|
| `g3b-forwarded` | Amber card body → "Read the script, then end the call."; patient script (`call.forwardedTell`) longer | changes |
| `t15-ha-no-join` | Same as g3b-forwarded (same card and script) | changes |
| `g3b-after-hangup` | Card: title only, neutral grey + info icon, no body line | changes |
| `t15-after-hangup` | Same as g3b-after-hangup | changes |
| `t17-skip-ha-wait` | Grey note = new `call.skipHa`; bar = "Getting call result…" only | changes |
| `t09-patient-unavailable` | Hidden F13 line emptied; not drawn today | **no change expected** |
| `t10b-forwarded`, `t16c-transfer-missed-unknown`, others with "Calling…" | Text not touched | no change expected |
| `call.scriptForward` | Not shown in any state (probe: no hit) | no change expected |

Expected changed pictures: **10** (5 states × 390 + 360). Everything else identical to `before-main2`.

### Result (main-check 2)

**Applied:** items 1, 2, 3, 4, 4b, 5, 5b as written. Patient script `call.forwardedTell` and `call.scriptForward` now say "will call you back / will call you to help with the next steps" (no "isn't available"). Live amber card body is "Read the script, then end the call." (`call.transferFailed`), bar "Waiting for the call to end…" unchanged. After hang-up: title only, neutral grey with info icon, no body line, no script card; `call.forwardedAfterHangup` retired from `messages.json`, `metadata.json`, `messages.js`, `native/messages.ts`. t09: hidden F13 line emptied in `fixOutcomeCopy` (no picture change). t17: grey `call.skipHa` note (new text) + status line "Getting call result…" only. `call.skipHa` is shown only on t17.

**Docs:** `ui-screens/app-logic.md` (rows 15, 15 after hang-up, 17, scripts, Fallback B), `ui-screens/README.md` (rows 15 after hang-up, 17), `docs/feedback-state-map.md` (rows for forwarded-after-hangup, transfer-failed, skipHa).

**Gates**
- G1: items done as written; checked at 390 and 360 (360 spot-checked on g3b-forwarded and t17).
- G2: pixel compare, `before-main2` (298) vs `after-main2` (298): exactly 10 changed, all on the expected list: `g3b-forwarded`, `t15-ha-no-join`, `g3b-after-hangup`, `t15-after-hangup`, `t17-skip-ha-wait` × 390/360. `t09-patient-unavailable` unchanged.
- G3: standards guard PASS (149 states × 3 viewports, incl. 360×640); `check-sources.mjs` PASS (copy checks rules 4/5/11/13/14/19/21/22/23 over 662 strings); layout check ALL PASS; lockup OK.
- G4: new copy values use curly quotes and apostrophes; no straight quotes in changed values.
- G5: second render identical to first (298/298); page errors 0.
- G6: changed this round: `messages.json`, `metadata.json`, `messages.js`, `native/messages.ts`, `case/case.html`, `app-logic.md`, `ui-screens/README.md`, `docs/feedback-state-map.md`, the 10 pictures, `_qa` review aids, this REPORT. Root `app.js` untouched.
- G7: all 288 unchanged pictures byte-identical to baseline; D-82/D-83 unaffected (same states, same bars except t17 per D-85).

**Fresh subagent check (rows R1–R7, 390 pictures):** 0 FAIL. Limitation: the subagent did not open 360 versions; main thread spot-checked 360 on g3b-forwarded and t17.

**Codex:** not run (not in MAIN-CHECK 2 steps).

**NEEDS-APURVA:** none new. Note: `fallback-b-agreed.png` "Now" column shows the superseded copy; that is expected.

MAIN-CHECK 2 DONE — failures: 0
