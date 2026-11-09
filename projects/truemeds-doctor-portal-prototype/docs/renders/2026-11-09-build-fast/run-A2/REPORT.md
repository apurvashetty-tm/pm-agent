# Run A2 — Calling, Cat4 and Pilot HA skipped (plan v3.2 step 5) — REPORT

Unattended run (`docs/runs/RULINGS.md` read first, and again at the end: the 22:35 rulings pre-ruled this run's critique; see
"Rulings" below). No open bugs in `docs/reviews/2026-11-09-prototype-feedback.md` (F-01 closed, F-02 fixed in A1). Done.

## What plays end to end
**The full Cat4 demo:** sign-in → OTP → faster sign-in offer → Home (Set availability, Request a case) → case → Prescribe every
medicine → **Call patient** → Calling (status line, Cat4 script, no Back, phone Back = toast) → the partner's result → **Valid call
(8a): Confirm prescription** → Confirming… → **Prescription confirmed** → **Request next case** → the next case. In review, play and
demo (demo scales every time; an 8 s call passes the 7.5 s gate). `sheet.png` = the calling half at 390, played live in play mode
(`tools/sheet.mjs`; the first half is on `run-A1/sheet.png`).

Every Cat4 / HA-skipped calling edge plays from the panel's **Call simulator** (B9), on the app clock (fast-forward polls at once):
- **3 / 4** doctor-side failures (Call again; header Back and the leave sheet only while the patient was never reached; a later 3 / 4
  after an answer never brings Back back) · **9** patient-side failure by cause → Patient unavailable, case on hold:
  retried by cause every hold-retry gap up to the attempts then plain hold; unknown → plain hold; invalid number → not retried, flagged.
- **Gate** from the partner's talk time, never from the tap: talk counts from the patient's answer (new choice "Rings before the
  answer"), calls of at least the counted minimum add up within the talk-time window, exact boundaries (49 / 50 / 51 s, 10 s counted,
  9 s not). Under → **6 Call too short** (Call again · Callback, no retry cap); over → **8a**.
- **No result:** unknown hang-up → **7b** at the timeout (Still talking repeats it, Call ended → 7c); known hang-up → Pilot HA-skipped
  shows **5**, Cat4 stays on Calling (CW-C2); timeout with a known end → **7c** (screen of 5) → record found → result, nothing →
  **7d** (Confirm prescription · Callback + Unavailable). A late result replaces 7d (and closes a sheet the new stage doesn't offer).
- **7d Confirm → 7f** Waiting for the call record → over the gate: **Prescription confirmed** (counted once); under the gate, never
  answered, or none after the record wait → not confirmed, mismatch logged, hold and retry, no earnings. A 7f the doctor leaves
  still settles in the background (counted once if proven).
- **Callback** (6, 7d): Pick a date and a time / Pick a date. / Pick a time.; refused (patient not reached) and save failure keep the
  exact choices; success closes the case "Callback today at 3:00 PM". **Unavailable** (7d): reason closes at once, saved with the case.
- **Confirm:** Pending blocks it (count in words, scroll to the first Pending, no request); one submit; an unclear answer stays on
  Confirming… and checks again (also after a reopen) until confirmed or "Couldn't confirm"; Callback / Unavailable disabled meanwhile.
- **Offline:** polling pauses; Call, Callback, Unavailable and Confirm fail with one notice, nothing lost. **Reopen:** the open case,
  its stage, notes, the app clock and the event log come back (the session stays valid through an open case).
- Every step-5 state opens from `?s=` (and `call.hold` → 9, `flow.HOLD` → 7f); a picture state starts from the call history its
  picture implies (e.g. 7d / 7b / 7f: no result yet) until the reviewer changes the Call simulator.

## Codex tests
- Written ahead (run A, accepted by the main thread), already committed in A1. A1 disputes were fixed by the main thread; **all four
  pass** in this run (A-C01, A-P07, A-OPTIONS-d-every-x-hours, a-loading).
- **run-A: edges 26/26 · rules 15/15 · journeys 254/254 (incl. every steps 2–5 `?s=` at 360 and 390) · options 8/8.**
- **run-A0:** 10/10 with `scripts/serve.sh` (`codex-a0-serve.log`). **A0-happy-path: disputed** (`test-disputes.md`): it expects a
  second availability button and the label "Request (next) case"; the approved Home has neither. With exactly those two label
  adaptations it passes end to end (`tools/a0-happy-minus-confirm.mjs`, PASS).
- Adapter work done in the app, not the tests: the simulator values the tests use (`hangup`, record `no-answer`, ha `request-failed`,
  `callback` refused / failed, `recordDelay` late, causes `rejected` / `unreachable`, appended so old play links still decode); a
  per-call **talk length in seconds** (`#rp-length`, in the panel's bottom bar so it is always in reach); the event log names hold /
  retry / mismatch / confirm-completed events and is kept across a reload; reason titles name the option buttons (`aria-labelledby`).

## Own tests (`tests/build-fast-a2.mjs`, 26/26) — REVIEW-CHECKS automation gaps for this run
A-R16 (exact counted minimum; ringing doesn't count; a new case starts its own count) · A-R17 (Cat4 known end skips 7b; late result
replaces 7d; a late result closes a sheet) · A-R18 (no hold before the wait; mismatch + hold, no earnings; proven counts once;
settles after the doctor left; retries every gap up to the attempts, then plain hold) · A-R19 (date-only / time-only errors; refused
and failed keep the exact choices; reason stored exactly; callback / unavailable / 7f never count) · A-R20 (Pending count, scroll, no
request; one submit; unclear confirm reconciles, survives a reopen; 7d secondaries disabled) · A-R13 (phone Back in the calling sheets;
3 after an answer has no Back; 3 before keeps the leave sheet) · offline · the demo run. A1's own tests still 15/15.
**Eye checks for the main thread:** a real-time call on a phone through the QR link (`scripts/serve.sh`); the 7b question and the
callback sheet at 360×640; A-R15 (symptoms printed vs internal notes) needs the confirm payload / printed Rx, which the prototype
doesn't produce yet.

## Existing checks (`checks-final/`, `run-checks-final.log`, `entry-journeys-final.log`)
entry-journeys 61/61 · run-checks 92/92 (R-list counts step-5 states as built; P5 panel fit at 1280×800 kept by a three-column call
grid) · layout_check ALL PASS (old and `--app`) · check-locked-specs PASS · check-sources PASS (the two new sheet files added to its
list) · check_lockup OK · check_tokens 0 findings · scan PASS · state map 0 drift · compare step 1: 80 exact / 6 accepted / 0 failed ·
old `index.html` / `app.js` / `styles.css` unchanged.

## Compare report (D-95)
`STEPS=5`: **42 pictures, 0 over 1 %** (largest 0.88 %, `s7f-submitted` text anti-aliasing; `compare-5/results.md`). On the way,
the callback sheets (error slot always present 8 under the grid; the failure notice between grid and button), the 7b question line
(no band margin) and the 7f card (icon at the top, line 4 under the title) were wrong markup and were fixed. Steps 2–4 re-checked:
132 pictures, 0 over 1 %.

## Codex critique
First (`codex-critique.md`): **3 blockers + 2 should-fix, all adopted** (`codex-response.md`): unclear confirm reconciles and never
resubmits; Callback / Unavailable disabled while confirming; late results revoke ineligible sheets and the handlers check the stage;
scheduled retries with counts; talk anchored on the patient's answer. Second (`codex-critique-2.md`): **no blockers**.

## Rulings (22:35, read at the end)
Blockers 1–3 valid — fixed as ruled. Should-fix 4 ruled "not needed, a log line is enough": it was already built (a small
session schedule + log lines, nothing the doctor sees); kept, easy to drop. Should-fix 5 ruled "run B's": the A2 version is a
`ring` simulator choice (default 0, so nothing changes unless chosen) and an answer time on each attempt in the engine; B's live-gate
count can start from the same `answeredAt`. "Lighter evidence" applies from B; this run still pruned identical re-captures (no
step-1 / steps 2–4 pictures committed, only results).

## Commits
`run A2, step 5` (build, tests, first evidence) · `run A2 close` (critique fixes, tests, compare, sheet, REPORT, DONE).

## [MOCK ASSUMPTION]s added (for `open_questions.md`, main thread to record)
- The simulated partner reports each event at the app's next poll (polling interval); the result arrives one poll after the hang-up;
  "late" = half the call-record wait. 7c's backend check takes the simulated server answer time.
- The hang-up is **not** reported by default (the app learns the end from the result), so a missing result asks 7b; "known end" =
  hang-up reported, or Knowlarity with its call-ended event (the event itself stays open, Engineering).
- A picture state opens with the simulator answer its picture implies, until the reviewer changes the Call simulator.
- 7f not proven: the doctor's card stays "Waiting for the call record" (the doctor isn't told about the hold; spec names no card change).
- Callback: the backend also refuses when no call on the case was ever answered; Confirm callback shows a busy spinner with its own
  label while saving (no approved busy picture).
- A doctor-chosen Unavailable reason closes the case without a hold / retry schedule (app-logic §7 names hold only for the automatic case).
- Pilot cases with an HA call (`pilot_ha_free`, `pilot_no_ha_free`) currently play the Cat4-style stages with the neutral script —
  run B builds their live gate, B2 and the forward / transfer endings.
- An open case reopens straight into the case even when no sign-in is stored (picture states opened directly).
No new [OPEN DECISION].

## Notes for the main thread
- `docs/context/` not written (brief); `session_handoff.md` needs the A2 line from the main thread.
- `tests/run-checks.mjs` writes its panel screenshots into `docs/renders/2026-11-09-step1-recovery/session-4/panel/` when `SHOTS`
  isn't set; this run restored those files each time (only `run-checks.sh` sets `SHOTS`).
- Files changed outside `app/`: `ui-screens/feedback/messages.json` / `metadata.json` (+ generated `messages.js`, `native/messages.ts`:
  23 picture labels), `ui-screens/feedback/check-sources.mjs` (two sheet files listed), `tests/run-checks.mjs` (step-5 states built).

## What's left
Run B (step 6 Pilot Fallback B, step 7 across journeys, step 8 final pass) and the A0-happy-path ruling.
