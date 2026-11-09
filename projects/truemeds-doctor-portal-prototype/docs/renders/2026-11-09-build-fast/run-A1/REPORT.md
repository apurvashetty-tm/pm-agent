# Run A1 — Home, case page, Prescribe / Disable (plan v3.2 steps 2–4) — REPORT

Unattended run (`docs/runs/RULINGS.md` read first). Done; stopped for the main-thread review.

## What plays end to end
Sign-in → OTP → faster sign-in offer → **Home** (set availability with presets / wheel, Setting…, countdown, Request a case → the
story's answer: case / couldn't request / no cases) → **case page** (Order details, View Rx with zoom / rotate / reset / drag /
pinch, notes kept, medicines) → **Prescribe** (every form, How often, SOS, duration picker, food, instructions, the live
"On prescription" line, both checks, Discard / Disable sheets) → back on the case with the row Prescribed / Disabled.
Also: Back → Leave this case? → Release (→ Home) or refused (stays, notice); empty case releases directly; offline notice and
the offline action notice; loading / load failed; Add time (35:00), End availability (incl. with a request open), idle expiry,
Profile (earnings = count × ₹20, faster sign-in toggle, Log out → sign-in, blocked during a case); closed case card with
Request next case / Back to Home. `sheet.png` = the live path at 390 (played in play mode). Calling (Call patient onwards) is A2:
Call patient shows the calling look of `a-back-blocked` (status line, script card, no Back, phone-back toast) and stops there.

## Codex tests
- Written ahead (main thread accepted), committed at the start as they were. A0 rulings applied by Codex
  (`tests/codex/run-A0/`); A0 re-run with `scripts/serve.sh`: **10/10** (happy path deferred to the end of A2, per ruling).
  `tests/codex/run-A` has no "Send code" label.
- Run A, steps 2–4: **all pass except 4 disputed** (`test-disputes.md`: A-C01 "Stay" vs the stale app-logic line; A-P07 Other on
  a Daily syrup; A-OPTIONS hours "4 h"; a-loading has no text by design). Whole suite: 194/303; every other failure is step 5 (A2).
- Runner: `bash docs/renders/2026-11-09-build-fast/run-codex.sh <test> <log> [filter] [base url] [network host]` (sets CHROME).

## Own tests (REVIEW-CHECKS automation gaps for this run)
`tests/build-fast-a1.mjs` **15/15**: A-R03 (h:mm:ss / m:ss, 5:00 + 30 = 35:00, request just before expiry honoured, End with a
request open honours it and no new one, 0:00), A-R04 (confirm counts once, release doesn't, earnings = count × setting,
Request next case), A-R05 (Help / bell / User manual placeholders, toggle on / off), A-R06 (order details, zoom clamps
50–400 %), A-R10 (Other: 7 / 7.5 / .5 saved, invalid refused with the form's unit), A-R12 (closing Disable changes nothing,
re-prescribing enables), A-R13 (phone Back: Prescribe → discard sheet → leave sheet). F-02 static check D6 in `run-checks`.
**Eye checks for the main thread:** Rx pinch / drag / double-tap on a phone; the real keyboard hiding / restoring the bar and
keeping the field above it (A-R14); 360×640 feel.

## Existing checks (`checks/`, `checks.log`)
entry-journeys 61/61 · run-checks 92/92 (R-list now treats built screens as built; B4 captures a step-6 picture) ·
layout_check ALL PASS (old and `--app`; the screen, not a picture, must fit the frame) · check-locked-specs PASS ·
check-sources PASS (new screens added to its file list; `Enter` / `Escape` are DOM key names) · check_lockup OK ·
check_tokens 0 findings · scan PASS (`screens/rx-paper.css` exempt like the drawn keyboard) · state map 0 drift ·
compare-step1 (step 1) unchanged 80 exact / 6 accepted / 0 failed. Old `index.html` / `app.js` / `styles.css` unchanged.

## Compare report (D-95)
`STEPS=2-4 node tests/compare-step1.mjs` (report mode added; `compare/results.md`): **132 pictures, 0 over 1 %**
(largest 0.44 %, `a-confirm-failed` / `t10a-confirmed` anti-aliasing). No sheets needed.

## Codex critique
First: 2 blockers + 3 should-fix, all adopted (`codex-response.md`). Second: **no blockers**.

## Tokens (D-99)
All app CSS uses `--tm-*`. Raw values only with `raw-ok` (100 % geometry, the 256 px drawn keyboard) and the exempt mock Rx paper.
Values with no token: none typed. Skeleton heights are token sums (e.g. 8 × target + xl + lg = the approved 424).

## Commits
`run A1 start` (Codex tests) · `A0 rulings + F-02` · `steps 2–4` · `run A1 close` (fixes, tests, report, DONE).

## [MOCK ASSUMPTION]s added (for `open_questions.md`, main thread to record)
- A case opened directly (`?s=` / jump) starts 30 min of availability if none is set (a case only arrives while available).
- Set availability / Add time fail only when offline (the story has no server-failure value for them).
- The drawn text and decimal keyboards appear in capture only (pictures); on a desktop review the computer keyboard types.
- Rx viewer double-tap window 300 ms and toast 4 s are interaction constants (`UI_TIMING` in settings.js), not panel settings.
- "Request next case" = back to Home and request at once.
No new [OPEN DECISION].

## Notes for the main thread
- **Stale app-logic lines:** §4 table and "Leaving a case" still say "Stay on this case"; D-84 CA-22 made it "Stay".
- **View Rx while confirming:** app-logic §9 says disabled; the approved `a-confirm-busy` keeps the outlined button (D-81 F24–F25).
  Built: looks as approved, takes no tap.
- `docs/context/` not written (brief); `session_handoff.md` needs the A1 line from the main thread.

## What's left
Run A2 (step 5 calling: Call patient onwards, call simulator, gate, outcomes, confirm routing, callback / unavailable, hold) and
its Codex tests; the A0 happy-path test at the end of A2.
