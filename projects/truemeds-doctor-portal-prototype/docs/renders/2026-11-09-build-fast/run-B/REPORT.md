# Run B — Pilot Fallback B, across journeys, final pass (plan v3.2 steps 6–8) — REPORT

Unattended run. `docs/runs/RULINGS.md` read first (22:35 and, mid-run, the 23:05 rulings: run A0-happy-path once; B's live gate
counts from `answeredAt`). No open bugs in `docs/reviews/2026-11-09-prototype-feedback.md` (F-03 was fixed by the main thread
during the run). Codex's run-B tests already existed and were committed, so step 1 was skipped. Done.

## What plays end to end
**Every Pilot (Fallback B) calling-flow edge**, from the panel's Call simulator, on the app clock:
- **B0 → B1:** Calling (neutral script, no Back) → at the gate **counted from the patient's answer while the call is live**
  (talk time on the case adds up, D-58 pt 22) → **Confirm prescription · Skip HA** (full width). Ending before the gate → 6;
  no result → 7b → 7c → **Pilot 7d** (Confirm & forward · Callback + Unavailable, no Skip HA).
- **B1 → B2** "Checking for a Health Advisor…" (Skip HA greyed; medicines take no tap, notes disabled) → HA free / HA doesn't
  pick up → **13 Transferring…** → **14 Transferred** (counted at once, transfer event) · no HA free → **B3** · the transfer
  couldn't start → 13 → **15**. A call that ends during B2 / 13 → **16** (critique blocker 1).
- **B3 / 15 live:** amber "Forwarded to Health Advisor · Read the script, then end the call." + forwardedTell script, medicines
  read-only, bar "Waiting for the call to end…" only → hang-up → neutral title-only card, **Request next case · Back to Home**.
  The forward is confirmed only on the partner's result (CW-F2): over the gate → counted once (forward event), under / never
  answered / none after the wait → mismatch + hold, nothing counted; settles also after the doctor left.
- **B1 → call ends before Confirm → 16 / 16b / 16c** (who ended it) → **Confirm & forward → 10b** (confirmed on the result) or
  **Skip HA + reason → Confirm prescription → 10a**.
- **Skip HA on B1 → 17:** grey note + "Getting call result…", Cat4 script → result over → 8a → 10a; under → 6 → Call again stays
  HA-skipped (Cat4 script, no HA controls); a reported hang-up → 5 without the script (critique should-fix 3). ✕ cancels; the
  reason is logged exactly.
- **Pilot 7d → Confirm & forward → 7f → 10b** on a record over the gate; else hold. Still talking keeps the Pilot route.
- Every step-6 state opens from `?s=` at 360 and 390; behaviour ids `call.skipHa`, `call.transfer-failed`,
  `call.waiting-for-hangup`, `call.mismatch-logged`, `case.reopened` open their screens.

**Step 7 (across journeys), each runs end to end:** availability ends mid-case (Cat4 and during B3: never interrupted, then
Back to Home only) · reopen into an open case (notes, medicine changes, stage; also when the story starts at Home / Case —
critique should-fix 2) · backgrounded / reloaded during a call (B1 on return, no OTP) and during 13 (transfer counted once) ·
late record for an earlier case while on the next one · Profile during an open case (Log out blocked).

**Step 8 (final pass):** copy parity — registry, web copy and native copy hold the same 373 keys and strings
(`tools/copy-parity.mjs`); G7 — all four guards and every check pass over all 149 states, compare report below.
`sheet.png`: both Pilot paths played live at 390 (row 1: B0 → B1 → B2 → 13 → 14 → next case; row 2: B3 → after the hang-up →
16 → Skip HA sheet → 8a → 10a).

## Codex tests
- Run B (99, written ahead): **94 / 99 pass**. **5 disputed** (`test-disputes.md` #1, one cause): B-play-* read `#rp-link` with
  `innerText` after opening the Story row, which folds Test on phone (exclusive accordion, D-97); the same five with
  `textContent` pass 5 / 5 (`tools/b-play-textcontent.mjs`). Found on the way and fixed in the app: the closed phone drawer is
  now `visibility: hidden` (it was only moved off screen, its controls stayed focusable).
- Run A: **303 / 303** (unchanged). **A0-happy-path: PASS** (ruling 23:05). Main thread's F-03 test: PASS.
- B-open-profile failed once in the pre-build baseline (the Profile Back loop, F-03); it passes since.

## Own tests (`tests/build-fast-b.mjs`, 23 / 23) — REVIEW-CHECKS automation gaps
B-R01 (gate from the answer with 20 s ringing; ends before the gate → 6; talk time adds up; Non-Value same flow) · B-R02 (HA no
pick-up → 14; B2 frozen; ends during 13 → 16) · B-R03 (forward proven once; under → mismatch + hold; settles after leaving) ·
B-R04 (✕ cancels, reason exact) · B-R05 (17 → 6 → retry stays skipped → 10a; 17 → 8a; 17 hang-up → 5) · B-R06 (7d → 10b;
never answered → hold; Still talking stays Pilot) · B-R07 (availability ends during B3) · B-R08 (reopen with story start Case) ·
B-R09 (reload during 13) · B-R12 (distinct completed events) · offline on B1 · phone Back on B1 / B3 / after the hang-up.
A1 15 / 15, A2 26 / 26 still pass. **Not automated (for the main thread / phone walkthrough):** B-R07 for every ending type,
B-R09 every deadline in the background with duplicate events, B-R10 reset / logout storage isolation beyond run-checks B6,
B-R11 desktop / phone parity to the final card (Codex's cases stop at the CTA), the phone check Q-B on a real phone.

## Existing checks (`checks-final/`)
entry-journeys 61 / 61 · run-checks 95 / 95 (R-list now counts step-6 states as built; the picture examples moved to version A
`t12-transfer-ready`) · layout_check ALL PASS (old and `--app`) · check-locked-specs PASS (149 states × 3 viewports) ·
check-sources PASS (skip-ha-sheet.js listed) · check_lockup OK · check_tokens 0 findings · scan PASS · state map 0 drift ·
compare step 1: 80 exact / 6 accepted / 0 failed · old `index.html` / `app.js` / `styles.css` unchanged. Copy parity PASS.

## Compare report (D-95)
`compare-2-6/results.md`: **steps 2–6, 206 pictures, 2 over 1 %** (steps 2–5 unchanged by this run). Over 1 %:
- **t13-connecting-ha @390 (16 %):** the frozen picture shows the **version-A transfer script** ("Please stay on the line…");
  launch B keeps the neutral Pilot script on the live call (app-logic §4). Not changed — **for the main thread**: either
  re-render t13 with the neutral script, or rule that 13 shows `call.scriptTransfer` in launch B (a new decision).
- **c-skip-ha @390 (2.5 %):** the sheet itself matches (its third reason now wraps balanced, as in case.html — fixed); the
  background is the version-A screen 12 in the picture and B1 in the build, as plan v3.2 §5's c-skip-ha note says. The re-render
  over B1 / 16 (`c-skip-ha-b1`, `c-skip-ha-16`) is the main thread's.

## Codex critique
First (`codex-critique.md`): **1 blocker + 2 should-fix, all adopted** (`codex-response.md`): a call ending during B2 / 13 → 16,
never Transferred; reopen restores the open case before the story's Home / Case start; 17 drops the script on a reported
hang-up. Second (`codex-critique-2.md`): **no blockers**.

## Settings
New review-tool value `pilotTalkAfterGate` (60 s, "Pilot talk past gate", Stand-in): a default "over the gate" Pilot call stays
live this long past the gate so the doctor can confirm on the live call. 13 Transferring… lasts two simulated server answers.
(A separate HA-ring setting was tried and dropped: the extra line pushed the panel past 1280 × 800, run-checks P5.)

## [MOCK ASSUMPTION]s added (for `open_questions.md`, main thread to record)
- **14 Transferred counts the prescription at once** (one transfer event); forwards (B3 / 15 / 16 / Pilot 7d) count only on the
  partner's result (CW-F2).
- **The `pilot_no_ha_free` scenario reads the simulator's HA "free" as none** (the scenario names HA capacity; other HA answers
  apply as chosen).
- **B2 → transfer request failed** goes through 13 to 15 (the state map has only B2 → 13 / B3).
- **A call that ends during B2 / 13 → 16** (nothing was transferred; Confirm & forward · Skip HA).
- **B3 / 15 wait for the hang-up only** (no 7b question); the result arriving also counts as the hang-up.
- **On the live B1 the 7b question still comes** after the no-result timeout (Still talking returns to B1).
- **B1 Confirm prescription** goes straight to B2 (the story's confirm-failed / confirm-busy answers apply to the post-call
  confirms only).
- **Story "Pending blocks confirm"** chosen on a case with nothing Pending puts its last medicine back to Pending (review tool).
- **13 keeps the neutral script** (see the compare note; app-logic names `call.scriptTransfer` for version A only).
- A Fallback B picture opened with a story case that has no HA call uses the picture's Pilot case (`pilot_ha_free`, t10b
  `pilot_no_ha_free`).
No new [OPEN DECISION]. Skip HA eligibility stays `[OPEN DECISION OQ-008]` (offered where the approved screens show it).

## Files
App: `core/call-engine.js`, `core/call-sim.js`, `core/call-events.js`, `core/settings.js`, `core/boot.js`, `screens/case.js`,
`screens/case.css`, `screens/skip-ha-sheet.js` (new), `review/labels.js`, `shell/shell.css`. Copy: `ui-screens/feedback/
messages.json` / `metadata.json` (+ generated `messages.js`, `native/messages.ts`): 12 picture labels. Checks:
`ui-screens/feedback/check-sources.mjs`, `tests/run-checks.mjs`. Tests: `tests/build-fast-b.mjs`. `docs/context/` not written.

## What's left
Main-thread rulings: dispute #1; the t13 script and the c-skip-ha re-render; the [MOCK ASSUMPTION]s above. Apurva's phone check
(Q-B) through the QR link. Then the queued runs (`signin-d101`, hand-off kit).
