# Terminal brief: copy fix round (D-84 amended)

Owner: main Claude thread · Worker: terminal session · Date: 2026-11-03
Folder: `~/src/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype` (branch `project/truemeds-doctor-portal-prototype`).
Apurva is not available. Don't ask her anything; product questions go under NEEDS-APURVA and stay as they are.

## Step 0: wait for the audit (cheap wait)
Copy audit run 2 runs in another tab and ends `COPY-AUDIT-v2.md` with `COPY AUDIT v2 DONE`. Wait with this one command, re-running it each time it returns without a match, and do nothing else between runs:
`for i in $(seq 1 9); do grep -q 'COPY AUDIT v2 DONE' docs/reviews/2026-11-03-copy-audit/COPY-AUDIT-v2.md 2>/dev/null && break; sleep 60; done; grep 'COPY AUDIT v2 DONE' docs/reviews/2026-11-03-copy-audit/COPY-AUDIT-v2.md`

## Step 0b: write the Final list yourself (Apurva and the main thread are away)
In `COPY-ANNEX.md`, add **"## Final list"**: every fix to apply, one row each, with ID · where · current · fix · rule · layout or text only · states affected. Decide as an expert:
- Start from the annex's Fixes table. CA-01 and CA-02 are agreed: keep them exactly.
- Annex rows the audit **AGREES** with: keep.
- **DISPUTED** rows: take the dispute only if it shows a clear v2-rule or truth problem; otherwise keep the annex row. Note the reason either way.
- **New fails** (CA-30+): add P1 and P2 if the fix is clear and contradicts no decision; add P3 if purely mechanical (punctuation, contraction, quotes). If the right wording depends on a product fact you don't have, put it under NEEDS-APURVA and leave the text as it is.
- The annex's **Dropped** list stays dropped unless the audit shows it is untrue to the app.
- Never contradict D-82, D-83, D-84 or an approved exception in COPY-RULES v2.

## Read first
`CLAUDE.md` (project); `docs/reviews/2026-11-03-copy-audit/COPY-RULES.md` (v2, 26 rules); `COPY-ANNEX.md` "## Final list" (**the only things you change**); `COPY-AUDIT-v2.md` (evidence); `docs/context/decision_log.md` D-82, D-83, D-84; `docs/feedback-rules.md`. Capture method as in `docs/renders/2026-11-03-calling-round/` (scripts there; 390 + 360, fixed clock, animations frozen).

## Step 1: Codex critique of the final list (read-only)
Run: `codex exec --sandbox read-only --output-last-message docs/reviews/2026-11-03-copy-audit/codex-report-2.md "Critique the '## Final list' in docs/reviews/2026-11-03-copy-audit/COPY-ANNEX.md against COPY-RULES.md (v2) and docs/context/decision_log.md D-83/D-84. For each row: OK, or a concrete problem (untrue to the app's behaviour in ui-screens/app-logic.md, breaks a v2 rule, won't fit at 360, contradicts a decision). Then list any important fail the list misses. Under 400 words. Write no files."`
Adopt a Codex point **only** if it is a clear v2-rule or truth problem with an obvious fix that contradicts no decision; record it as an addendum row in `REPORT.md`. Put everything else under NEEDS-APURVA, unchanged. If `codex` isn't available, note it and continue.

## Step 2: baseline and expected list
Render every state as it is now into `docs/renders/2026-11-03-copy-round/before/`. Write the **expected list** (every picture that should change, from the annex's layout-impact column plus text-only changes that are visible) into `docs/renders/2026-11-03-copy-round/REPORT.md` **before** changing anything.

## Step 3: apply
- Copy only through `ui-screens/feedback/messages.json` → `build-messages.mjs` (regenerates `messages.js` and `native/messages.ts`). Text that is typed in `case.html`, `home-reference.js`, `otp.html` etc. gets changed there; move it into `messages.json` if a key fits naturally, otherwise leave it in place.
- Layout fixes (e.g. removing the line under outcome titles) use existing components and spacing only. No new CSS values.
- Update `docs/feedback-state-map.md`, and `ui-screens/app-logic.md` wherever it quotes changed text.
- **Script checks:** add the checks for rules 4, 5, 11, 13, 14, 19, 21, 22 and 23 to `ui-screens/feedback/check-sources.mjs`, as proposed in the audits (with an allowlist for the approved exceptions and fixed names: Callback, Skip HA, View Rx, Unavailable, the answer buttons, spoken scripts, the printed Rx paper). They must pass on the fixed copy.

## Step 4: re-render and gates
Re-render the changed states (390 + 360) into `ui-screens/`; rebuild `REVIEW.html`, contact sheets and storyboard with `_qa/`. Then run the gates:

| Gate | Pass when |
|---|---|
| G1 | Each Final-list row is done as written, checked at full size at 390 and 360 |
| G2 | Pixel compare against `before/`: only pictures on the expected list differ |
| G3 | Four guards at 0 failures (incl. the 360×640 small-phone pass) plus the new copy checks at 0 |
| G4 | No straight apostrophes or quotes; curly everywhere; native copy regenerated |
| G5 | Second render identical; 0 page errors |
| G6 | `git diff --stat` touches only the files this brief names |
| G7 | Regression: every unchanged state is pixel-identical; all earlier decisions (D-82, D-83) still hold on changed states |

Then hand only `COPY-RULES.md`, the Final list and the changed pictures to a fresh subagent that hasn't seen your work. It checks each row and reports PASS / FAIL. Fix any FAIL and repeat, **at most 3 rounds**. Stop early if the same failure survives two rounds and list it.

## Step 5: Codex reviews the result, then loop
After the gates and the subagent check pass, run Codex once more, read-only, on the result:
`codex exec --sandbox read-only --output-last-message docs/renders/2026-11-03-copy-round/codex-result.md "Review the copy round: docs/renders/2026-11-03-copy-round/REPORT.md, the Final list in docs/reviews/2026-11-03-copy-audit/COPY-ANNEX.md, COPY-RULES.md (v2), and the changed pictures listed in the report (ui-screens/, 390 and 360). Report only real problems: a Final-list row not done, a new rule break introduced, text untrue to ui-screens/app-logic.md, a layout break at 360. Under 300 words. Write no files."`
Fix the valid points with the same rules and gates, then re-run this step. **At most 3 loops in total** (steps 4 to 5). Stop early if the same issue survives two loops; list it.

## Step 6: report and stop
In `REPORT.md`: a row table (PASS / FAIL with evidence), the Codex points (adopted / not adopted and why), gates with counts, expected vs actual, and NEEDS-APURVA (pointed product questions only, one line each). Last line: `COPY ROUND DONE — failures: <n>, loops: <n>`. Then **stop**: no waiting, no polling. The main thread does the final review when Apurva says you're done.

## Never
Change anything outside the Final list. Touch the decision log, backlog, open questions, project truth or design-system components. Commit, push, open PRs, or run git commands other than `git status` / `git diff`. Record approvals in Apurva's name. Read or print credentials.

## MAIN-CHECK 1 (main thread, 2026-11-03 09:45) — run this now, same rules and gates

Decisions on REPORT.md §7 are made (decision log D-84 note, COPY-RULES v2.1). Do only this:
1. **F10–F14 outcome lines and F21 dose chip:** fix them in `ui-screens/case/case.html`'s existing relabel / override layer (the `showSuccessToast` wrapper near line 979, the `TEXT` / `TITLE` maps, or a small override after the old script loads). **Do not edit root `app.js`.** F10, F11, F12, F14: the line under the outcome title is removed (title says it). F13: line becomes "Patient unavailable. The case is on hold." F21: the empty dose chip shows "None".
2. **Scripts:** in `messages.json` drop "shortly": `call.forwardedTell` → "I’ve written your prescription. Our Health Advisor isn’t available right now — they’ll call you back." and `call.scriptForward` → "I’m writing your prescription now. Our Health Advisor will call you." (curly quotes kept). Rebuild messages.
3. **Copy checks:** add the checks for rules 4, 5, 11, 13, 14, 19, 21, 22, 23 to `check-sources.mjs` as proposed in `COPY-AUDIT-v2.md`, with the allowlist (Callback, Skip HA, View Rx, Unavailable, answer buttons, spoken scripts, printed Rx paper, approved exceptions in COPY-RULES v2.1 rule 1, "Wrong code." and `call.notThrough`). Scope: visible strings in the 149 states and `messages.json`; legacy hidden markup excluded. Must pass at 0.
4. **F24, F25, F26, F28:** not in this round (moved to the prototype build). Mark them "Moved to build (D-84)" in the annex status.
5. Write the expected list first, re-render only the changed states (390 + 360), rebuild review aids, run G1–G7 + the new checks, then a fresh subagent check of these rows. Fix and repeat at most twice.
6. Append `## Main-check 1` to `docs/renders/2026-11-03-copy-round/REPORT.md` ending exactly `MAIN-CHECK 1 DONE — failures: <n>`. Stop.

## MAIN-CHECK 2 (Apurva's review of Fallback B, 2026-11-03 09:55) — run after MAIN-CHECK 1 is done

**Why:** when no Health Advisor is free (15, B3), the patient doesn't need to hear about our capacity, and the doctor's card shouldn't repeat the script. Say what happens next, positively. The patient-facing script is the only place the patient hears it.
1. **Patient script** `call.forwardedTell` → “I’ve written your prescription. Our Health Advisor will call you back to help with the next steps.” (one script for A's 15 and B's B3; "back" covers A, where the patient was told they'd be connected).
2. **Doctor card while the call is live** (`t15-ha-no-join`, `g3b-forwarded`): title stays "Forwarded to Health Advisor", amber (the doctor must act); body `call.transferFailed` → "Read the script, then end the call." (no "unavailable").
3. **Doctor card after the hang-up** (`t15-after-hangup`, `g3b-after-hangup`): **title only, "Forwarded to Health Advisor", no body line** (Apurva 10:01: the body repeated the title; same as 10b, which is title only). Retire `call.forwardedAfterHangup` if nothing else uses it. Tone **neutral** (grey, info icon), not amber: nothing left to act on, and the forward isn't confirmed until the result (CW-F2; status-card tones, RULES §9).
4. `call.scriptForward` (not shown in any state): align → “I’m writing your prescription now. Our Health Advisor will call you to help with the next steps.”
4b. **t09 Patient unavailable (MAIN-CHECK 1 question 12, main thread):** title only, no visible line, same as 10b and the after-hang-up card. In `fixOutcomeCopy`, remove the hidden F13 line (empty it) instead of rewriting it. No picture change. Note: t15-ha-no-join looking the same as g3b is by design (B3 = 15, CW-E3), not a defect.
5. Sweep: no doctor- or patient-facing text anywhere says the Health Advisor is "unavailable" / "isn't available" / "no Health Advisor free" (app-logic, state map and README may describe the trigger in those words; that's fine). Update `docs/feedback-state-map.md` and app-logic quotes.
5b. **D-85 (decision log): 17 changed. Only one picture changes, no new state.**
   - `messages.json`: `call.skipHa` → "Health Advisor call will be skipped. End the call when you’re done." (curly apostrophe).
   - `t17-skip-ha-wait` (keep the id): grey note with the new `call.skipHa`, no-HA script (`call.scriptCat4`), bar = status line **"Getting call result…"** (`call.resultWait`) only. No "Calling {name}…", no buttons, no header Back.
   - `ui-screens/app-logic.md`: row 17 and the Skip HA text in §5 / Fallback B per D-85 (one status line from Skip HA to the result; the result routes to 8a / 6 / 9 / 7c–7d). Remove the "Calling… → Getting call result…" sequence. `docs/feedback-state-map.md` row for `call.skipHa` to match. Any other state that shows `call.skipHa` (e.g. on 16) gets the new text too; list them.
6. Same method: expected list first, re-render only changed states (390 + 360), G1–G7 + copy checks, fresh subagent check. Append `## Main-check 2` to REPORT.md ending exactly `MAIN-CHECK 2 DONE — failures: <n>`. Stop.
