# Calling round — report (2026-11-03)

Brief: `TERMINAL-BRIEF.md`; definition of done: `CHECKLIST.md`; expected list written before the after-render: `expected.md`.

## Gate G0 (precondition) — PASS

- `docs/renders/2026-11-01-fix-round/TERMINAL-BRIEF.md` contains `## DONE` (line 43).
- `docs/context/decision_log.md` contains `### D-83` (line 887).
- `git status --short` under `ui-screens/`, `ui-screens/app-logic.md`, `ui-screens/feedback/messages.json`, `docs/feedback-state-map.md`, `design-system/`: clean at start.

## Capture method and validation

- Scratch tooling, outside the repo: Playwright Chromium, 390 and 360 × 844 viewport, DPR 2, clock fixed to 28 Oct 2026 15:00, animations frozen. Copies in this folder: `capture-method-cap.py`, `capture-method-compare.py`, `capture-method-bar-probe.py`.
- Compare: RGB, a pixel counts as different only above 3 levels. Pixels inside `.tm-spinner` boxes are reported as spinner-only. The spinners in busy approved pictures are at arbitrary frames, so they cannot be reproduced byte for byte.
- Method check: the pre-change code, rendered with this method, matches the approved `ui-screens/` set: 274 of 290 identical, 16 differ only inside spinner boxes, 0 other differences. This is the baseline in `before/`.
- Note: an earlier compare pass in this session was wrong (alpha-only bounding box); it was found and fixed before any result above was used.

## Expected list vs actual

Full list: `expected.md`. Actual, comparing `after/` (298 pictures, 149 states) with `before/` (290 pictures, 145 states):

| | Count | Notes |
|---|---|---|
| Identical | 252 | `compare-after-vs-before.json` |
| Differ (expected) | 36 pictures = 18 states | t02, s7a, a-back-blocked, t11, t05, t12, t08b, t08c, t17, c-callback, c-callback-error, c-callback-failed, g1, g2, t13, g3b, t15-ha-no-join, a-no-medicines |
| Expected, but unchanged | 1 state | `c-skip-ha`: the sheet covers the bar behind it, so the Skip HA change is not visible in the picture |
| New (expected) | 10 pictures = 5 states | t15-after-hangup, g3b-after-hangup, g0-calling-pilot, s7d-result-missing-pilot, c-callback-refused |
| Removed (expected) | 2 pictures | t15b-end-call-first (K10) |
| Unexpected differences | none | |

Differences in the bar-adjacent states (t15, g3b, t13, g2, t17, t02) start a little above the bar: a shorter bar uncovers more of the content behind it. No card moved. `c-callback-failed` differs by one row of pixels at the sheet top (the sheet sits above the bar, whose height changed); the sheet content is identical.

Bar probe (pinned bar contents at 390, `after-bar-probe.txt` and `before/bar-probe.txt`) confirms the changes state by state.

## Gates G1–G7

| Gate | Result | Evidence |
|---|---|---|
| G1 pass-when at full size | Checked on the bar probe and the changed pictures (see K/T table); independent check below | `after-bar-probe.txt`, `independent-check/` |
| G2 pixel comparison | PASS: only expected pictures differ, no unexpected differences | expected vs actual above |
| G3 guards | PASS: `check-locked-specs.py`: STANDARDS GUARD PASS, 0 failures across 149 states × 3 viewports (incl. small-phone pass 360×640, 149 states). `check-sources.mjs`: PASS (12 sign-in, 17 OTP, 85 registry IDs). `docs/layout_check.py`: ALL PASS. `brand/check_lockup.py`: lockup OK. | `guard-after.json` |
| G4 copy | PASS: new and changed keys only in `messages.json`, regenerated with `build-messages.mjs` (`messages.js`, `native/messages.ts`). New copy uses curly apostrophes and the ellipsis character like the rest. | `ui-screens/feedback/messages.json` |
| G5 determinism | PASS: second full render identical 298/298; page errors 0 | `after/capture-log.json` |
| G6 scope | PASS: tracked changes are only the files named in §1 (list below) | `git diff --stat` |
| G7 regression | PASS: every state not named in §1 is pixel-identical to before (252 identical, incl. all sign-in, OTP, offer, unlock, Home, Prescribe) | `compare-after-vs-before.json` |

G6 tracked files changed: `ui-screens/case/case.html`; 36 changed pictures in `ui-screens/case/` (× 390/360) and 2 deleted (`t15b-end-call-first`); `ui-screens/case/contact-case.png`; `ui-screens/feedback/{messages.json, messages.js, metadata.json, check-locked-specs.py}`; `ui-screens/native/messages.ts`; `ui-screens/app-logic.md`; `ui-screens/README.md`; `ui-screens/REVIEW.html`; `ui-screens/_qa/{build-review.py, build-storyboard.py}`; `docs/feedback-state-map.md`; `docs/renders/2026-10-22-calling/storyboard-final.png`. Not touched: `decision_log.md`, `backlog.md`, `open_questions.md`, `project_truth.md`, `docs/reviews/**`, `design-system/`, `index.html`, `app.js`, `styles.css`, any state outside §1.

## K1–K13 and T0–T7

| Item | Result | Evidence |
|---|---|---|
| K1 | PASS | Probe: Callback appears only on 6 (`t06`), on the callback sheets over 6, and on 7d (`s7d-*`). Bars: status line only on 2, 7a, 11, 5, 17, back-blocked (`t02`, `s7a`, `t11`, `t05`, `t17`, `a-back-blocked`); 12 Confirm & transfer + Skip HA full width; 8a Confirm prescription alone (unchanged); 8b Confirm & forward + Skip HA full width; 8c Confirm only + red line. |
| K2 | PASS | `c-callback`, `c-callback-error`, `c-callback-failed`, `c-callback-refused` bars read "Call too short" (6); the sheet opens over 6. |
| K3 | PASS | `callback.notReached` = "Couldn’t schedule a callback. The patient wasn’t reached." in `messages.json`; feedback-state-map row; new picture `c-callback-refused` at 390 and 360 shows it as the sheet error. |
| K4 | PASS | `a-no-medicines`: amber notice at the top of the panel (same white-card placement as the other standing notices), new text; the medicines card keeps its title and shows no text; bar = Release case only, no Call patient. |
| K5 | PASS (text) | app-logic §4: Release → Home (also §4 leaving paragraph, CW-A5). |
| K6 | PASS | `s7d-result-missing-pilot`: bar Confirm & forward · Callback + Unavailable; no Skip HA. |
| K7 | PASS | `t17-skip-ha-wait`: grey "Health Advisor call will be skipped." + "Calling Sunita…"; script visible; no Callback. app-logic row 17 updated. |
| K8 | PASS | `t15-ha-no-join`: card unchanged; bar = "Waiting for the call to end…" only. `t15-after-hangup`: same card, bar Request next case · Back to Home. Key `call.waitingForHangup`. |
| K9 | PASS | `g3b-forwarded`: bar "Waiting for the call to end…" only; `g3b-after-hangup`: Request next case · Back to Home. |
| K10 | PASS | `t15b-end-call-first` pictures deleted; recipe, guard list, README row, storyboard group removed; REVIEW.html rebuilt (149 states, no 15b). `call.endCallFirst` used only by 15b, so the key is removed from `messages.json`, `metadata.json`, `messages.js`, `native/messages.ts`; feedback-state-map row retired. Nothing else used the key. |
| K11 | PASS | `g1-generic-confirm`: Confirm prescription + Skip HA full width under it; no Callback. |
| K12 | PASS | `g0-calling-pilot`: Pilot live call before the gate; neutral script; bar "Calling Sunita…" only; no header Back; no Callback. |
| K13 | PASS | `t13-connecting-ha` and `g2-checking-ha`: greyed row = Skip HA only, full width, disabled. Bar height unchanged (152 px before and after). |
| T0 | PASS | app-logic header "Covers decisions up to D-83"; README "decisions D-58 → D-83". |
| T1 | PASS | app-logic §4: Calling, Transfer ready, Call not valid, Valid rows; Release → Home; empty case paragraph; 7e row "1, 3, 4 only"; leaving paragraph parenthesis and double full stop fixed. |
| T2 | PASS | app-logic §5 rules: Callback only on 6 / 7d; backend refuses without leg 2; 3 / 4 doctor-side, patient side → 9; 5 only after a known hang-up (Pilot; Cat4 stays on Calling); 7b only when the end can't be known; 7d bar by route; 7f not confirmed → hold and retry; 15 = transfer couldn't start; 15 / B3 buttons after the hang-up; forward confirmed on the result. |
| T3 | PASS | app-logic §5 state table rows 2, 5, 7d (+ Pilot), 7e, 7f, 8a, 8b, 8c, 11, 12, 13, 15, 15 after hang-up, 15b retired, 17. B1 / B3 are in the Fallback B paragraph (no separate table rows). |
| T4 | PASS | §5 Fallback B = the launch Pilot flow (CW-F1); B1 → 16 (CW-F3). |
| T5 | PASS | §6 transfer-vs-forward (CW-E1, CW-F2), new 7d route note; §7 Callback only on 6 / 7d, backend refusal; Patient unavailable = hold, system retries, no Ops (CW-B2); Flag 6 updated. |
| T6 | PASS | feedback-state-map rows for `callback.notReached` (K3), `call.waitingForHangup` (K8, K9), 7d Pilot (K6); 15b row retired; `case.no-medicines` row updated; README index lists the new states, 15b dropped. |
| T7 | PASS (with notes) | Contact sheets, `REVIEW.html` (149 states, 8 sections) and storyboard rebuilt with `_qa/` scripts (storyboard at `docs/renders/2026-10-22-calling/storyboard-final.png` and `ui-screens/case/contact-call.png`, as in previous rounds). Flow diagram: `calling-flow.mmd` (round folder, D-83 flow) → `calling-flow.png` via mermaid CLI 11. Walkthrough: `WALKTHROUGH.html` + `walkthrough/` pictures (32, from current `ui-screens/case/`). Old page left as history. See NEEDS-APURVA 6. |

## Round 1 result

Gate results above. Own checks: failures 0 (the first G3 run showed 10 "picture missing" for the new states; these were cleared by promotion, not by a fix).

ROUND 1 COMPLETE — failures: 0

## Independent check

Fresh subagent given only `CHECKLIST.md`, `expected.md` and the changed pictures at 390 and 360 (`independent-check/pictures/`). Its table is appended below.

Subagent (fresh, given only CHECKLIST.md, expected.md and the 48 pictures at 390 and 360). Its report: 1 FAIL (K12). Main-thread review of that report:

| Item | Subagent | Main thread | Basis |
|---|---|---|---|
| K1 | PASS | PASS | agreed |
| K2 | NOT JUDGED | PASS by probe, not visible in the picture | The callback sheets cover the bar. The bar probe shows the "Call too short" bar (6) behind each sheet. Checklist wants it "behind it"; the picture cannot show it. See NEEDS-APURVA 10. |
| K3 | PASS | PASS | agreed |
| K4 | PASS | PASS | agreed |
| K5 | not checked (text) | PASS (text) | app-logic §4 |
| K6 | PASS | PASS | agreed |
| K7 | PASS | PASS | agreed |
| K8 | PASS | PASS | agreed |
| K9 | PASS | PASS | agreed |
| K10 | not judged | PASS | files, recipes and state lists checked by grep: no t15b left outside renders/ and this report's history |
| K11 | PASS | PASS | agreed |
| K12 | FAIL | PASS (checker misread) | The subagent read the script in g0 as the transfer wording. The picture shows "I'm writing your prescription now. Our Health Advisor will help you with the next steps." (call.scriptNeutral). Script region of g0 is pixel-identical to g1's script region; DOM text at 0, 300 and 1500 ms is the neutral key. Its medicine statuses (Pending / Prescribed) differ from g1 because g1 has passGate + allRx; g0 is pre-gate, so the medicines are not yet prescribed. Same fixture (Sunita Patel), as K12 asks. No code change. |
| K13 | PASS | PASS | agreed |
| T0–T7 | not checked (text) | see T table above | text |

Checker count: 1 FAIL (K12). Main thread overturns it with the evidence above and made no change. Checker's picture-set check: all 19 changed and 5 new states present; nothing unexpected.

INDEPENDENT CHECK — failures: 0 (after main-thread review; checker reported 1, K12, overturned)

## NEEDS-APURVA

1. **K4 placement and empty body.** The notice is a white card at the top of the panel, above Order details (same placement as the other standing notices). The medicines card keeps its title "Medicines to prescribe" with no body; say if the card should go as well.
2. **Where a released empty case goes (OQ-035).** The copy "our Ops team will check it" is the checklist's placeholder. Unchanged, open.
3. **K6 patient.** The Pilot 7d picture uses the Pilot fixture (Sunita), so it is not the same patient as `s7d-result-missing` (Ramesh). The page is the same. Say if the same patient should be used.
4. **K3 two sheet errors.** `c-callback-error` / `c-callback-failed` (save failure, "Your time is kept") and `c-callback-refused` (backend refusal) now both exist. Both kept. Say if the save failure should go.
5. **c-skip-ha.** The Skip HA change behind the reason sheet is hidden by the sheet; the picture is identical. Nothing to decide.
6. **Flow diagram source.** The checklist said to regenerate from `docs/renders/2026-10-26-margin-16/calling-flow.mmd`. The 26-Oct file is unchanged; the new source `calling-flow.mmd` in this folder is the D-83 version of it.
7. **Knowlarity call-ended event** (CW-C2) and **Pilot Non-Value Meds partner** remain open for Engineering; written as open in the rules.
8. **Approved busy pictures** (spinner frames) cannot be re-rendered byte for byte. Compared with spinner masks; no design effect.
9. No approval has been recorded. `decision_log.md` is untouched. Copy metadata says "decided (D-83 …)".

## Final

**NEEDS-APURVA** above, with two more:
10. **K2 visibility.** The three callback sheets over state 6 hide the bar, so the picture cannot show "Call too short" behind them. The bar is verified by probe only. Say if a picture is wanted with the sheet shorter or the bar drawn.
11. **Checker K12 misread.** Not a design point; logged so you know the independent check had one overturned FAIL.

CALLING ROUND DONE — failures: 0, rounds: 1

## Main-check

Waiting for the main thread's audit (`## MAIN-CHECK <n>` or `## DONE` in TERMINAL-BRIEF.md).

## Main-check 1

Brief: `## MAIN-CHECK 1` in TERMINAL-BRIEF.md (04:00 IST audit). Three fixes, rules as before.

| # | Fix | Result | Evidence |
|---|---|---|---|
| M1 | After the hang-up on 15 and B3 the script card is hidden; the amber card keeps "Forwarded to Health Advisor" with body `call.forwardedAfterHangup` = "Health Advisor unavailable right now. They’ll call the patient back."; Medicines card moves up; bar unchanged (Request next case · Back to Home). Live states `t15-ha-no-join` and `g3b-forwarded` unchanged. | PASS | `t15-after-hangup`, `g3b-after-hangup` promoted (390 + 360). Key in messages.json (rebuilt), metadata, feedback-state-map row, app-logic §4 row 15 and §5 fallback paragraph. Live states identical to previous render. |
| M2 | `t05-result-wait` rendered with the Pilot fixture (Sunita Patel), bar "Getting call result…" only, no script. | PASS | `t05-result-wait` promoted (390 + 360); header shows Sunita Patel. |
| M3 | app-logic §4 "Bar and card rules" example list no longer names "End the call…"; the outcome-card line now says the warning is retired with 15b. | PASS (text) | `grep "End the call"` in app-logic: only the 15b retired row and the retirement line remain. |

Gates after main-check 1:
- Expected list addendum written before the render (`expected.md`, "Main-check 1 addendum").
- G2: after6 vs previous after5: 6 pictures differ, exactly the expected three states (`t15-after-hangup`, `g3b-after-hangup`, `t05-result-wait`). Full set vs pre-change baseline: 252 identical, 36 differ (same 18 states as round 1), 10 new, 2 removed (t15b). No unexpected differences.
- G3: standards guard PASS, 0 failures across 149 states × 3 viewports; `docs/layout_check.py` ALL PASS; `check-sources.mjs` PASS (86 registry IDs); lockup OK.
- G4: new key `call.forwardedAfterHangup` only via messages.json → build-messages.mjs; curly apostrophe; no straight apostrophe.
- G5: second full render after6 vs after5: 298/298 identical; page errors 0.
- G6: scope unchanged from round 1 except the three states above; contact sheets, REVIEW.html and storyboard rebuilt; walkthrough page regenerated (text for 15 and B3 after the hang-up updated).
- G7: unchanged states still identical to pre-change baseline.

Independent check (fresh subagent, the six changed pictures at 390 and 360 only, with the M1 and M2 pass-when): 6 PASS, failures 0. Limitation noted by the checker: the sheet/bottom bar hides content below "Doctor notes"; "Pilot" is confirmed by the patient name only (no label printed).

MAIN-CHECK 1 DONE — failures: 0
