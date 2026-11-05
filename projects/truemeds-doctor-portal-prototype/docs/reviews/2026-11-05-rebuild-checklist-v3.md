# Doctor portal — prototype rebuild checklist v3

**Status:** DRAFT v3 for Apurva's approval (2026-11-05). Goes with `docs/proposals/2026-11-05-prototype-build-plan-v3.md`.
**Replaces:** `docs/reviews/2026-10-29-rebuild-checklist.md` (v2). Changed or new lines are marked **[v3]**.
**Use:** every build step is reviewed against this list, not taste. A step passes only when every line that applies passes. Results recorded per step: state × width × line, pass / fail / not run, with the build version. This list is the first draft of the QA test cases (D-79, D-88).
**How:** **auto** = script on every state (360 and 390 compared with pictures; 430 layout only) · **compare** = screenshot vs approved picture · **eye** = self-audit + reviewer · **device** = Apurva's phones · **run** = journey played end to end by a test.
**Scope [v3]:** launch build = Fallback B. Version-A states (`t08b`, `t11`, `t12`) are in the state map, tagged A, and not checked until step 9.

## 0. Carried-over standards

The screen standards in `docs/reviews/2026-10-15-standards-checklist.md`, the gates in `docs/feedback-rules.md` §10 and the fix-round gate G7 (`docs/renders/2026-11-01-fix-round/CHECKLIST.md`) still apply, **except where a later decision changed them**. The later decision and the approved pictures win:

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
| Leave sheet "before the first attempted call" **[v3]** | Back only while a call button is offered (1, 3, 4); hidden from the tap on Call | D-80 |
| — **[v3]** | One pinned action bar; notice band inside the bar, centred; sheets cover the bar; icon size by button; small phone 360 × 640 on every state | D-82, D-86 |
| — **[v3]** | SOS daily total in the printed line; dose choices by form (tablet ½ · 1 · 2, capsule 1 · 2); scroll to the first error; pinned bar hides while the keyboard is open | D-80 pt 3, D-81 |
| — **[v3]** | Copy rules v2.1 | D-84 |

Step 0 confirms no other earlier line conflicts with a decision; any found is added here before step 1.

## 1. Sources and scope

| # | Check | How |
|---|---|---|
| 1.1 | Every approved picture in `ui-screens/` (149 states) is in the state map and opens with `?s=<render-id>` (contact sheets and `_qa/` excluded) | auto |
| 1.2 | Every launch state in app-logic (§2 – 10, §14), including behaviour-only states in `feedback-state-map.md`, is in the state map with the transitions that reach it; each transition is tested | auto / run |
| 1.3 **[v3]** | Calling rows of the state map match `calling-flow/data.js` (states, pictures, buttons, events, paths); drift check passes. If `data.js` and app-logic disagree, app-logic wins and the page is fixed | auto |
| 1.4 | Nothing on screen that isn't in a picture or app-logic — no extra buttons, steps, sections or text | eye |
| 1.5 | Unclear product logic is marked `[MOCK ASSUMPTION]` / `[OPEN DECISION]` and listed in `open_questions.md`, never guessed (OQ-025, OQ-030 – 032, OQ-035, Knowlarity call-ended event, partner for Pilot Non-Value Meds) | eye |
| 1.6 | Old `index.html`, `app.js`, `styles.css` unchanged | auto |
| 1.7 **[v3]** | Help and the bell show where the pictures show them, stay active and open the blank placeholder page (`[OPEN DECISION]`) | eye |

## 2. Matches the pictures

| # | Check | How |
|---|---|---|
| 2.1 | Each state at 390 and 360 matches its picture — same width, page height and 2× density, fixed clock, animations frozen, same fonts | compare |
| 2.2 | No differing pixels outside the accepted list (spinner frames + anything Apurva approves, recorded per step with region and reason) | compare |
| 2.3 | Phone-frame rule (RULES §7): 9:16 on desktop, full screen on phone, one scroll area, sheets / Rx / toasts inside the frame; `layout_check.py` on `app/`: ALL PASS | auto |
| 2.4 | At 430 wide and at 360 × 640: no overflow, nothing clipped **[v3]** | auto |
| 2.5 **[v3]** | Four guards 0 failures on `app/`: `check-locked-specs.py`, `check-sources.mjs`, `layout_check.py`, `check_lockup.py` | auto |

## 3. Copy and design system

| # | Check | How |
|---|---|---|
| 3.1 | Every fixed word comes from `messages.json` through `MSG()`, button and sheet labels included; mock data from the scenario files | auto |
| 3.2 | Gate time, no-result timeout, record wait, hold-retry gap and polling interval read from the one settings file; none hard-coded **[v3]** | auto |
| 3.3 | "Case", never "order", for the doctor's unit of work; the customer order ID line stays; D-50 labels exactly | auto / eye |
| 3.4 | Only `--tm-*` tokens and `.tm-*` components; no hex colours, emoji or local restyling (mock Rx paper exempt) | auto |
| 3.5 | A missing component or text is added centrally first (design system / registry), never inside the app | eye |
| 3.6 | Logo: approved lockup unchanged and placed as in the pictures | auto / eye |
| 3.7 **[v3]** | Copy rules v2.1 checks in `check-sources.mjs` pass on `app/`; same message IDs and copy as the native copy file | auto |

## 4. Rules the app must follow

| # | Check | How |
|---|---|---|
| 4.1 | Before the gate, no Confirm prescription, Confirm & forward or Skip HA in any scenario. 7d offers its confirm, and confirming there shows 7f "Waiting for the call record". **[v3]** 7f and every forward are confirmed only on the partner's result: an unproven confirm is not confirmed, the case holds and retries, no ₹20 | run |
| 4.2 **[v3]** | Final button and ending per case type (launch flow): Cat4 / HA skipped → Confirm prescription → 10a · Pilot live call → B1 Confirm prescription → B2 → HA free: 13 → 14 · none: B3 · Pilot call ended before confirm (16) or 7d Pilot → Confirm & forward → 10b | run |
| 4.3 | Cat4 never shows anything about the Health Advisor; HA-skipped Pilot never shows transfer or forward | run |
| 4.4 **[v3]** | Skip HA only for Pilot, after the gate, when an HA call follows and isn't skipped: on B1 and on 16; never on 7d. On a live call it leads to 17 (note + "Getting call result…"), then the normal result path (D-85) | run |
| 4.5 | Confirm blocked while a medicine is Pending: notice in the bar with the count, scroll to the first Pending medicine | run |
| 4.6 | Confirm is single-flight: "Confirming…", everything else read-only and muted, no second submit; unclear result stays on Confirming… then resolves | run |
| 4.7 **[v3]** | Leaving: Back only on 1, 3, 4; hidden from the tap on Call for every case type; phone back after that shows the toast. Release refused once the call request is accepted → `a-release-failed`. Release → Home. Empty case: no Call patient, notice at the top, Release case releases without a sheet | run |
| 4.8 **[v3]** | Attempted call = patient (leg 2) answered. 3 / 4 only for doctor-side failures; a patient-side failure → 9 whenever detected; 9 = hold + system retry | run |
| 4.9 | Talk time adds up across connected calls on the case; the doctor never sees the count | run |
| 4.10 **[v3]** | Every launch calling state reached by its trigger: `t01`–`t06`, `t08a`, `t08c`, `t09`, `t10a`, `t10b`, `t13`, `t14`, `t15-ha-no-join`, `t15-after-hangup`, `t16`, `t16b`, `t16c`, `t17`, `s7a`–`s7f`, `g0`, `g1`, `g2`, `g3b-forwarded`, `g3b-after-hangup`, `s7d-result-missing-pilot`, `c-callback-refused`. No `t15b`. A-only states not reachable in the launch build | run |
| 4.11 **[v3]** | 5 Getting call result only after a known hang-up (Ozonetel); Cat4 on Knowlarity stays on Calling until the result; 7b only when the end can't be known | run |
| 4.12 | Late call result updates the screen by itself; stale or duplicate answers ignored; a transfer that ends before the tap is handled (16 / 16b / 16c) | run |
| 4.13 | App in the background for 60 s during a call, then reopened: correct state, gate worked out right | run / device |
| 4.14 | Notes saved only on confirm; discarded on Callback / Unavailable; locked after confirm | run |
| 4.15 **[v3]** | Callback offered only on 6 and 7d; refused when leg 2 never answered (`c-callback-refused`); saves close the case with its card; a failed save keeps the choices | run |
| 4.16 | Availability: 15 min minimum, time formats, add time, end with a pending request, window ending during a case never interrupts it | run |
| 4.17 | Sign-in and OTP limits, messages and lock as app-logic §2; test numbers and codes as §11 | run |
| 4.18 | Faster sign-in: offered once; failed or cancelled stays on the offer; screen-lock fallback; skipped without screen lock; Profile toggle — via the mock unlock | run |
| 4.19 **[v3]** | Closed case read-only and muted. On 15 / B3: "Waiting for the call to end…" while live; Request next case · Back to Home only after the hang-up. Availability left: Request next case (primary) + Back to Home (quiet); ended: Back to Home only, primary | run |
| 4.20 | Phone back on every screen and sheet does the app-logic action; never closes the app during a case | run / device |
| 4.21 | Four confirm outcomes logged as four separate events, once per completed confirm; 7f not logged as confirmed | auto |
| 4.22 **[v3]** | Every call-simulator outcome (plan B9) reaches the state app-logic gives it | run |

## 5. Modes, install and hosting

| # | Check | How |
|---|---|---|
| 5.1 **[v3]** | Each launch scenario (Cat4 · Pilot HA free · Pilot no HA free · HA skipped customer · HA skipped system) reaches each of its endings (table in the state map) | run |
| 5.2 **[v3]** | Bare link opens review; `?demo=1` opens demo (Cat4 happy path, no review controls); the installed app always opens demo and ignores review / capture settings | run |
| 5.3 | Review panel beside the frame, never inside it, never a scroll container | auto |
| 5.4 | Demo, review and capture never share stored data; capture writes nothing; Reset and Log out clear storage | auto |
| 5.5 **[v3]** | Manifest and icons (180 / 192 / 512 PNG, mark on white) present and load on the deployed link | auto |
| 5.6 | Installs and opens without browser bars, portrait, approved name and icon — Android Chrome and iPhone Safari; model and OS recorded | device |
| 5.7 | Reopening the installed app resumes: unlock → Home, or back into an open case | device |
| 5.8 | Safe areas respected; bottom bar never cut by browser bars; OTP keyboard leaves code boxes, error line and Verify visible at 360 | device |
| 5.9 | After a new deploy, the installed app shows the new version on next open | device |
| 5.10 **[v3]** | `truemeds-doctor-app-preview` serves only `app/`, hidden from search engines; deploys only on `[deploy]` in the PR title; current site unchanged | auto / eye |

## 6. Quality

| # | Check | How |
|---|---|---|
| 6.1 | No console errors in any state | auto |
| 6.2 | Offline, loading and failure states per `feedback-state-map.md` reachable and correct | run |
| 6.3 | Largest phone text size: nothing clipped; buttons on one line or wrapping as RULES allows | device |
| 6.4 | Only synthetic data: scan for phone-number and OTP patterns (allowlist for the test numbers) + review of the scenario files | auto / eye |
| 6.5 **[v3]** | Copy-round accessibility and fit items (D-84, backlog §2l): live regions for progress / result messages (F24); medicine-row accessible names (F25); non-breaking "4 h" style units (F26); dose and date errors tied to their fields (F28); two-up button rows stack at large text (CA-20) | auto / device |

## 7. Done and frozen

| # | Check | How |
|---|---|---|
| 7.1 | Commits on the project branch only, inside `projects/truemeds-doctor-portal-prototype/` (central `design-system/` fixes in their own commit); reach `main` through a PR Apurva merges | auto |
| 7.2 | `session_handoff.md` updated after every step; decisions recorded by the main thread after Apurva agrees | eye |
| 7.3 | A change to the shared core re-runs every frozen journey's checks | auto |
| 7.4 **[v3]** | G7 regression gate passes every step: earlier items still pass, unchanged screens pixel-identical, conflicts → standing rule wins, listed for Apurva | auto / eye |
| 7.5 | Step approved → frozen. New findings = bug (fix where it occurs) or next-version idea (backlog §4b) | — |
