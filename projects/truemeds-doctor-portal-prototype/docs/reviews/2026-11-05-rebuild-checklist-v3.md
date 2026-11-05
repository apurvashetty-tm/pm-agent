# Doctor portal — prototype rebuild checklist v3

**Status:** **APPROVED v3.2** (Apurva, 2026-11-06, D-90). Goes with `docs/proposals/2026-11-05-prototype-build-plan-v3.md`.
**Replaces:** `docs/reviews/2026-10-29-rebuild-checklist.md` (v2). **[v3]** = changed from v2 · **[R]** = changed after the independent review (`docs/reviews/2026-11-05-plan-v3-review/MERGE.md`).
**Use:** every build step is reviewed against this list, not taste. A step passes only when every line whose **Step** column names it passes. Results recorded per step: line ID × state × width, pass / fail / not run, with the build version and source versions. This list is the first draft of the QA test cases (D-79, D-88); each line ID becomes a test ID.
**How:** **auto** = script on every state (360 and 390 compared with pictures; 430 and 360 × 640 layout only) · **compare** = screenshot vs approved picture · **eye** = self-audit + reviewer · **device** = Apurva's phones · **run** = journey played end to end by a test, with its starting state and expected result written in the state map.
**Steps:** 0 shell · 1 entry · 2 Home · 3 case page · 4 Prescribe · 5 calling Cat4 / HA skipped · 6 Pilot B · 7 across journeys · 8 final · **all** = every step from the one it first applies to.
**Scope:** launch build = Fallback B. Version-A states (`t08b`, `t11`, `t12`, current `c-skip-ha` picture) are in the state map, tagged A, and not checked until step 9.

## 0. Carried-over standards

The screen standards in `docs/reviews/2026-10-15-standards-checklist.md`, the gates in `docs/feedback-rules.md` §10 and the regression gate G7 (`docs/renders/2026-11-01-fix-round/CHECKLIST.md`) still apply, **except where a later decision changed them**. The later decision and the approved pictures win:

| Earlier line | Now | Decision |
|---|---|---|
| 1.1, 5.1 — margins 24 | 16 everywhere (page, cards, action bar, sheets) | D-67 |
| 3.5 — pairs have no icons | Callback and Skip HA keep their icons | D-54 |
| 3.6, 7.5 — End call in the bar | No End call in the app; the doctor ends the call on the phone | D-58 |
| 5.7 — status card at the top | Outcome card directly under Order details | D-58 pt 16, D-66 |
| 5.10 — header types | OTP has no Back; logo on every screen except the case page and task overlays; Profile is a page with a task header | D-61, D-70 |
| 7b.3 — Unavailable asks first | Unavailable (7d only) opens the reason sheet; a reason closes the case | D-75, D-58 pt 20 |
| 7b.7 — compare with 2026-10-14 finals | Compare with `ui-screens/` as re-frozen at D-85 | D-73, D-85 |
| Labels "Schedule callback", "Skip HA call" | "Callback", "Skip HA" | D-54, D-70 |
| Leave sheet "before the first attempted call" | Header Back only on 1, 3, 4 while the patient was never reached | D-80 |
| — | One pinned action bar; notice band inside the bar, centred; sheets cover the bar; icon size by button; small phone 360 × 640 | D-82, D-86 |
| — | Copy rules v2.1 | D-84 |

Step 0 confirms no other earlier line conflicts with a decision; any found is added here before step 1.

## 1. Sources and scope

| # | Check | How | Step |
|---|---|---|---|
| 1.1 | Every approved picture in `ui-screens/` (149) is in the state map with one owning step and opens with `?s=<render-id>` | auto | 0, all |
| 1.2 **[R]** | Every behaviour-only state (`feedback-state-map.md`, e.g. `offer.cancelled`, `offer.not-now`, `offer.unsupported`, `offer.enabled`, `rx.load-failed`, `case.reopened`, hold / mismatch) is in the state map with an ID and a step; retired keys are not | auto | 0 |
| 1.3 **[R]** | Calling rows match `calling-flow/data.js` after normalising (plan B4); drift check passes. Map checked once against app-logic §5 before step 1. If `data.js` and app-logic disagree, app-logic wins and the page is fixed | auto / eye | 0 |
| 1.4 **[R]** | Stale source lines listed in `MERGE.md` §4 fixed before the state map is generated | eye | 0 |
| 1.5 | Nothing on screen that isn't in a picture or app-logic — no extra buttons, steps, sections or text | eye | all |
| 1.6 **[R]** | Unclear logic marked `[MOCK ASSUMPTION]` / `[OPEN DECISION]` and in `open_questions.md`, never guessed: OQ-001, 017, 019, 020, 021, 023, 024, 025, 029 (if used), 030 – 032, 035, Knowlarity call-ended event, partner for Pilot Non-Value Meds | eye | all |
| 1.7 | Old `index.html`, `app.js`, `styles.css` unchanged | auto | all |
| 1.8 **[R]** | Help and the bell show where the pictures show them, stay active, open the blank placeholder page, and Back returns to where the doctor was | eye / run | 2 |

## 2. Matches the pictures

| # | Check | How | Step |
|---|---|---|---|
| 2.1 | Each state at 390 and 360 matches its picture — same width, page height and 2× density, fixed clock, animations frozen, same fonts | compare | 1 – 6 |
| 2.2 | No differing pixels outside the accepted list (spinner frames + anything Apurva approves, recorded per step with region and reason) | compare | 1 – 6 |
| 2.3 | Phone-frame rule (RULES §7); `layout_check.py` on `app/`: ALL PASS | auto | 0, all |
| 2.4 | At 430 wide and at 360 × 640: no overflow, nothing clipped | auto | all |
| 2.5 | Four guards 0 failures on `app/`: `check-locked-specs.py`, `check-sources.mjs`, `layout_check.py`, `check_lockup.py` | auto | all |

## 3. Copy and design system

| # | Check | How | Step |
|---|---|---|---|
| 3.1 | Every fixed word comes from `messages.json` through `MSG()`, button and sheet labels included; mock data from the scenario files | auto | all |
| 3.2 **[R]** | Every value in plan B10 read from the one settings file; none hard-coded in code or copy; demo mode scales every time value by one factor | auto | 0, all |
| 3.3 **[R]** | "Case", never "order", for the doctor's unit of work; the customer order ID line stays. Labels exactly: Confirm prescription · Confirm & transfer (A only) · Confirm & forward · Skip HA · Callback · Unavailable · Release case · Request next case · Back to Home | auto / eye | all |
| 3.4 | Only `--tm-*` tokens and `.tm-*` components; no hex colours, emoji or local restyling (mock Rx paper exempt) | auto | all |
| 3.5 | A missing component or text is added centrally first (design system / registry), never inside the app | eye | all |
| 3.6 | Logo: approved lockup unchanged and placed as in the pictures | auto / eye | all |
| 3.7 | Copy rules v2.1 checks in `check-sources.mjs` pass on `app/`; same message IDs and copy as the native copy file | auto | all, 8 |

## 4. Rules the app must follow

### 4A. Entry and Home

| # | Check | How | Step |
|---|---|---|---|
| 4.1 | Sign-in and OTP limits, messages and lock as app-logic §2; test numbers and codes as §11 (read from the data file) | run | 1 |
| 4.2 **[R]** | Faster sign-in: offered once; failed or cancelled stays on the offer; screen-lock fallback; skipped without screen lock; "Not now" → Home; Profile toggle — via the mock unlock | run | 1, 2 |
| 4.3 **[R]** | Returning unlock: success → Home (or the open case); "Not you? Switch account" → sign-in; 3 failed tries → OTP | run | 1 |
| 4.4 **[R]** | Availability: 15-min minimum, 15-min wheel steps; timer h:mm:ss from one hour (1:00:00), m:ss below (9:42), 0:00 at end; "+ Add time" doesn't move the timer; near-expiry warning; end availability with a pending request | run | 2 |
| 4.5 **[R]** | A request accepted before the window ends is honoured even if the case arrives after; the window ending during a case never interrupts it | run | 2, 7 |
| 4.6 **[R]** | One phone active at a time (app-logic §3) | run | 2 |
| 4.7 **[R]** | Log out sheet; during an open case "You can log out after this case is closed"; session stays valid through an open case (no OTP over a live case) | run | 2, 7 |

### 4B. Case page and Prescribe

| # | Check | How | Step |
|---|---|---|---|
| 4.8 **[R]** | Leaving: header Back only on 1, 3, 4 while the patient was never reached → leave sheet → Release → Home, or Stay. Hidden from the tap on Call; never returns once the patient answered (also on a later 3 / 4). Release refused once the call request is accepted, unless the result is 3 or 4 → `a-release-failed`, doctor stays on the case. Behind the sheet, Releasing… and Release failed the screen is Ready | run | 3, 5 |
| 4.9 | Empty case: no Call patient, notice at the top, Release case releases without a sheet → Home | run | 3 |
| 4.10 **[R]** | Rx viewer: zoom 50 – 400 %, rotate, reset; load failure → Try again; ✕ always closes; disabled while confirming; usable on a closed case | run | 3 |
| 4.11 **[R]** | Notes: kept through a dropped connection; saved only on confirm; discarded on Callback / Unavailable; locked after confirm | run | 3, 5 |
| 4.12 **[R]** | Prescribe: dose choices by form (tablet ½ · 1 · 2, capsule 1 · 2; ml / units for liquids and injections) | run | 4 |
| 4.13 **[R]** | Prescribe errors: "Choose a dose for at least one time of day", "Enter the dose in …", "Use numbers only" and the date checks; each tied to its field; page scrolls to the first error | run | 4 |
| 4.14 **[R]** | SOS: daily total shown in the printed line; SOS-only and SOS-on variants as the pictures | run | 4 |
| 4.15 **[R]** | Save → medicine Prescribed with its printed line; Discard-changes sheet on leaving with edits; Cancel keeps the edits | run | 4 |
| 4.16 **[R]** | Disable: reason / note as the sheet; medicine shows the disabled note and is left out of the prescription; re-enable restores it | run | 4 |
| 4.17 **[R]** | Keyboard: focused field stays visible at 360; pinned bar hides while the keyboard is open and comes back after | device | 3, 4 |
| 4.18 | Confirm blocked while a medicine is Pending: notice in the bar with the count, scroll to the first Pending medicine — on every confirm button (8a, 7d, B1, 16) | run | 5, 6 |
| 4.19 | Confirm is single-flight: "Confirming…", everything else read-only and muted, no second submit; unclear result stays on Confirming… then resolves — on every confirm route | run | 5, 6 |

### 4C. Calling (launch flow)

| # | Check | How | Step |
|---|---|---|---|
| 4.20 **[R]** | Every edge of the calling flow (state map, from `data.js`, non-A) is played as a journey test from its starting state to its expected state | run | 5, 6 |
| 4.21 | Before the gate, no Confirm prescription, Confirm & forward or Skip HA in any scenario | run | 5, 6 |
| 4.22 **[R]** | Endings: Cat4 / HA skipped → 8a Confirm prescription → 10a · Pilot live call → B1 Confirm prescription → B2 → HA free: 13 → 14 · none: B3 · 16 → Confirm & forward → 10b at once, or Skip HA + reason → Confirm prescription → 10a · Cat4 7d → Confirm prescription → 7f · Pilot 7d → Confirm & forward → 7f · 7f → record over the gate → 10a (Cat4) / **10b (Pilot, D-89)** | run | 5, 6 |
| 4.23 **[R]** | Unproven confirm (7f, and forwards from 15 and B3): record under the gate, patient never answered, or no record within the wait → not confirmed, hold and retry, no ₹20, mismatch event logged; a forward from 15 / B3 after the hang-up goes the same way in the background | run | 5, 6 |
| 4.24 | Cat4 never shows anything about the Health Advisor; HA-skipped Pilot never shows transfer or forward | run | 5, 6 |
| 4.25 **[R]** | Skip HA only for Pilot, after the gate, when an HA call follows and isn't skipped: on B1 and on 16, never on 7d; greyed on B2 and 13. On B1 (live call) → 17 note + status line → then each result branch separately: 8a · 6 · 9 · 7c → 7d | run | 6 |
| 4.26 **[R]** | 3 / 4 only for doctor-side failures, with Call again; a patient-side failure → 9 whenever detected, with retry by cause (B9): busy / no answer / switched off / network retried after the gap, unknown → plain hold, invalid number → not retried and flagged | run | 5 |
| 4.27 **[R]** | Talk time adds up across counted calls (≥ ~10 s each, within ~30 min); a call under ~10 s doesn't count; the doctor never sees the count; 6 → Call again has no limit | run | 5 |
| 4.28 **[R]** | 5 Getting call result only for Pilot after a reported hang-up; Cat4 never reaches 5. 7b only when the end can't be known; "Still talking" → Calling → asked again 3 min later; "Call ended" → 7c → result found (result path) or nothing found (7d). Hang-up reported → the 3-min timeout goes straight to 7c. Knowlarity event switch on/off both tested | run | 5, 6 |
| 4.29 **[R]** | Pilot call ended before the gate → result path → 6 or 9; Pilot retries (6 → Call again, 7b → Still talking) stay on the Pilot flow | run | 6 |
| 4.30 **[R]** | Transfer: 13 Transferring — the doctor's leg drops by itself once the HA's phone rings → 14; HA doesn't pick up → 14 for the doctor; transfer couldn't start → 15 | run | 6 |
| 4.31 **[R]** | 15 / B3: "Waiting for the call to end…" while live; after the hang-up, card title only, no script, Request next case · Back to Home | run | 6 |
| 4.32 **[R]** | End-of-call script: shown under Order details from the tap on Call while the call may be live; neutral script on B1 (`call.scriptNeutral`), Cat4 script on Cat4 / HA skipped; hidden once the call has ended, except 15 and B3 (`call.forwardedTell`) until the hang-up | run | 5, 6 |
| 4.33 **[R]** | Callback offered only on 6 and 7d; refused when leg 2 never answered (`c-callback-refused`); validation "Pick a date and a time." / "Pick a date." / "Pick a time."; a save closes the case with its card; a failed save keeps the choices | run | 5 |
| 4.34 **[R]** | Unavailable on 7d (Cat4 and Pilot) → reason sheet → the reason is saved with the case → 9; closing the sheet keeps 7d | run | 5, 6 |
| 4.35 | Late call result updates the screen by itself; stale or duplicate answers ignored; a transfer that ends before the tap is handled (16 / 16b / 16c, named by who ended it) | run | 5, 6 |
| 4.36 **[R]** | Background: patient answered at T, app backgrounded for 60 s, gate passes at T + 50 s → on return the screen shows the post-gate state (B1 Confirm prescription for Pilot; result path for Cat4) | run / device | 5, 6 |
| 4.37 **[R]** | Closed case read-only and muted; availability left: Request next case (primary) + Back to Home (quiet); ended: Back to Home only, primary. Request next case → Requesting → next case opens on Ready with a clean state | run | 5, 6 |
| 4.38 **[R]** | Four confirm outcomes logged as four separate events, once per completed confirm; 7f not logged as confirmed; earnings and count go up exactly once per proven confirm (₹20, D-81) | auto | 5, 6 |
| 4.39 | Phone back on every screen and sheet does the app-logic action; never closes the app during a case; closed case → Home | run / device | all |

## 5. Modes, install and hosting

| # | Check | How | Step |
|---|---|---|---|
| 5.1 **[R]** | Scenario × ending table in the state map (Cat4 · Pilot HA free · Pilot no HA free · HA skipped customer · HA skipped system × each ending app-logic allows); every cell runs | run | 5, 6 |
| 5.2 **[R]** | Demo run: sign-in → OTP → Home → request → case → prescribe → call → Prescription confirmed → next case, end to end. Bare link opens review; `?demo=1` demo; the installed app always demo and ignores review / capture settings | run | 5 |
| 5.3 | Review panel beside the frame, never inside it, never a scroll container | auto | 0 |
| 5.4 | Demo, review and capture never share stored data; capture writes nothing; Reset and Log out clear storage | auto | 0, 7 |
| 5.5 **[R]** | Manifest (id, scope, name, short name, start in demo, standalone, portrait, colours) and icons 180 / 192 / 512 PNG (mark on white, safe padding) load on the deployed link | auto | 0 |
| 5.6 | Installs and opens without browser bars, portrait, approved name and icon — Android Chrome and iPhone Safari; model and OS recorded | device | 5 |
| 5.7 **[R]** | Reopening resumes: unlock → Home, or back into the open case with medicines, notes, deadlines and call stage kept; a late record for an earlier case never changes the open one | run / device | 7 |
| 5.8 | Safe areas respected; bottom bar never cut by browser bars; OTP keyboard leaves code boxes, error line and Verify visible at 360 | device | 1, 5 |
| 5.9 | After a new deploy, the installed app shows the new version on next open | device | 5 |
| 5.11 **[R2]** | Phone (narrow screen) in review or play: the app is full screen; no control sits over the app except the small handle, which never covers the header controls, the action bar or a sheet; the drawer opens from the handle and closes on a tap outside; no handle in demo or capture | auto / device | 0, 5 |
| 5.12 **[R2]** | Play link: every launch scenario and simulator outcome can be written into a link and QR from the desktop panel; scanned on a phone it plays to the same end state as the same story run in the desktop panel; an unreadable code opens review with a notice; the QR library is vendored, not loaded from another site | run / device | 0, 5, 6 |
| 5.10 **[R]** | Preview site: commit without `[deploy]` → build skipped; with `[deploy]` → deployed; design-system styles, icons and fonts load; only `app/` served, `docs/` not reachable; hidden from search engines; current site unchanged | auto / eye | 0 |

## 6. Quality

| # | Check | How | Step |
|---|---|---|---|
| 6.1 | No console errors in any state | auto | all |
| 6.2 **[R]** | Every offline, loading and failure row of `feedback-state-map.md` (generated list in the state map) reachable and correct | run | all |
| 6.3 | Largest phone text size: nothing clipped; buttons on one line or wrapping as RULES allows | device | 8 |
| 6.4 | Only synthetic data: scan for phone-number and OTP patterns (allowlist for the test numbers) + review of the scenario files | auto / eye | all |
| 6.5 | Copy-round accessibility and fit items (D-84, backlog §2l): live regions for progress / result messages (F24); medicine-row accessible names (F25); non-breaking "4 h" style units (F26); dose and date errors tied to their fields (F28); two-up button rows stack at large text (CA-20) | auto / device | 3 – 6 |

## 7. Done and frozen

| # | Check | How | Step |
|---|---|---|---|
| 7.1 | Commits on the project branch only, inside `projects/truemeds-doctor-portal-prototype/` (central `design-system/` fixes in their own commit); reach `main` through a PR Apurva merges | auto | all |
| 7.2 | `session_handoff.md` updated after every step; decisions recorded by the main thread after Apurva agrees | eye | all |
| 7.3 | A change to the shared core re-runs every frozen journey's checks | auto | all |
| 7.4 | G7 regression gate passes every step: earlier items still pass, unchanged screens pixel-identical, conflicts → standing rule wins, listed for Apurva | auto / eye | all |
| 7.5 | Step approved → frozen. New findings = bug (fix where it occurs) or next-version idea (backlog §4b) | — | all |
