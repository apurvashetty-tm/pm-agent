# Doctor portal — prototype rebuild checklist

**Status:** DRAFT v2 for Apurva's approval (2026-10-29). Goes with `docs/proposals/2026-10-29-prototype-build-plan.md`.
**Use:** every build step is reviewed against this list, not taste. A step passes only when every line that applies passes. Results recorded per step: state × width × line, pass / fail / not run, with the build version.
**How:** **auto** = script on every state (360 and 390 compared with pictures; 430 layout only) · **compare** = screenshot vs approved picture · **eye** = self-audit + reviewer · **device** = Apurva's phones · **run** = journey played end to end by a test.

> **v2 — what changed.** Merged from the two independent reviews. Changed or new lines are marked **[v2]**.

## 0. Carried-over standards **[v2]**

The screen standards in `docs/reviews/2026-10-15-standards-checklist.md` and the acceptance gates in `docs/feedback-rules.md` §10 still apply, **except where a later decision changed them**. Where they disagree, the later decision and the approved pictures win:

| 2026-10-15 line | Now | Decision |
|---|---|---|
| 1.1, 5.1 — side margin and sheet margin 24 | 16 everywhere (page, cards, action bar, sheets) | D-67 |
| 3.5 — pairs have no icons | Callback and Skip HA keep their icons | D-54 |
| 3.6, 7.5 — End call (solid red) in the bar | No End call in the app; the doctor ends the call on the phone; bar per the app-logic §5 state table | D-58 |
| 5.7 — status card at the top of the content | Outcome card directly under Order details | D-58 pt 16, D-66 |
| 5.10 — header types | OTP has no Back; logo on entry screens and Home; Profile is a page with a task header | D-61, D-70 |
| 7b.3 — Mark as unavailable asks first | Unavailable (7d only) opens the reason sheet; choosing a reason closes the case and saves the reason; Release case still asks (leave sheet) | D-75, D-58 pt 20 |
| 7b.7 — compare with the 2026-10-14 finals | Compare with the promoted `ui-screens/` pictures | D-73 |
| Labels "Schedule callback", "Skip HA call" | "Callback", "Skip HA" | D-54, D-70 |

Step 0 confirms no other 2026-10-15 line conflicts with a decision; any found is added here before step 1.

## 1. Sources and scope

| # | Check | How |
|---|---|---|
| 1.1 | Every approved picture in `ui-screens/` is in the state map and opens with `?s=<render-id>` (contact sheets and `_qa/` excluded) **[v2]** | auto |
| 1.2 | Every state in app-logic (§2–10), including behaviour-only states in `feedback-state-map.md`, is in the state map with the transitions that reach it, and each transition is tested **[v2]** | auto / run |
| 1.3 | Nothing on screen that isn't in a picture or app-logic — no extra buttons, steps, sections or text | eye |
| 1.4 | Unclear product logic is marked `[MOCK ASSUMPTION]` / `[OPEN DECISION]` and listed in `open_questions.md`, never guessed | eye |
| 1.5 | Old `index.html`, `app.js`, `styles.css` unchanged | auto |
| 1.6 | Help shows where the pictures show it and opens the agreed placeholder (P9) **[v2]** | eye |

## 2. Matches the pictures

| # | Check | How |
|---|---|---|
| 2.1 | Each state at 390 and 360 matches its approved picture — same width, page height and 2× density as the pictures, fixed clock date, animations frozen, same fonts loaded **[v2]** | compare |
| 2.2 | No differing pixels outside the accepted list. Accepted list = spinner frame and anything Apurva approves; it's recorded per step with the region and reason. Every other difference is fixed or goes to Apurva **[v2]** | compare |
| 2.3 | Phone-frame rule (RULES §7): 9:16 on desktop, full screen on phone, one scroll area, sheets / Rx / toasts inside the frame. Layout check pointed at `app/` on a local web server: ALL PASS **[v2]** | auto |
| 2.4 | At 430 wide: no overflow, nothing clipped (no picture to compare) **[v2]** | auto |

## 3. Copy and design system

| # | Check | How |
|---|---|---|
| 3.1 | Every fixed word on screen comes from `messages.json` through `MSG()`, button and sheet labels included. Mock data (names, IDs, medicines) comes from the scenario files; typed input is the doctor's **[v2]** | auto |
| 3.2 | The gate time is read from the one setting; no gate value hard-coded in code or copy **[v2]** | auto |
| 3.3 | "Case", never "order", for the doctor's unit of work; the customer order ID line stays; D-50 button labels exactly | auto / eye |
| 3.4 | Only `--tm-*` tokens and `.tm-*` components; no hex colours, emoji or local restyling (mock Rx paper exempt) | auto |
| 3.5 | Missing component or text added centrally first (design system / registry), never inside the app | eye |
| 3.6 | Logo: the approved lockup file unchanged (`brand/check_lockup.py` passes) **and** placed only on home-base screens as in the pictures **[v2]** | auto / eye |
| 3.7 | Same message IDs and copy as the native copy file (`feedback/check-sources.mjs`) **[v2]** | auto |

## 4. Rules the app must follow

| # | Check | How |
|---|---|---|
| 4.1 | Before the gate, no Confirm prescription, Confirm & transfer, Confirm & forward or Skip HA — in any scenario. **Exception:** 7d "Result not received" offers Confirm prescription, and confirming there shows "Waiting for the call record", not "Prescription confirmed" (D-68, D-73) **[v2]** | run |
| 4.2 | Right final button and ending card per case type (app-logic §6 table) | run |
| 4.3 | Cat4 never shows anything about the Health Advisor; HA-skipped Pilot never shows transfer or forward | run |
| 4.4 | Skip HA only for Pilot, after the gate, when an HA call follows and isn't skipped; also after a missed transfer (16) | run |
| 4.5 | Confirm blocked while a medicine is Pending: red line with the count, scroll to the first Pending medicine | run |
| 4.6 | Confirm is single-flight: "Confirming…", everything else disabled, no second submit; unclear result stays on Confirming… | run |
| 4.7 | Leaving: leave sheet before the first attempted call (also in 7a and 7b); blocked after it (toast on phone back) until the case is closed | run |
| 4.8 | Attempted call = patient (leg 2) answered; leg 2 failed closes the case as Patient unavailable by itself | run |
| 4.9 | Talk time adds up across connected calls on the case; the doctor never sees the count | run |
| 4.10 | Every calling state in the state map (render IDs `t01`–`t17` incl. `t08a`–`t08c`, `t10a`/`t10b`, `t15b`, `t16b`/`t16c`; `s7a`–`s7f`; `g1`, `g2`, `g3b`) reached by its trigger in app-logic §5 **[v2]** | run |
| 4.11 | Late call result updates the screen by itself; stale or duplicate answers ignored; a transfer that ends between showing Confirm & transfer and the tap is handled (16) **[v2]** | run |
| 4.12 | App sent to the background for 60 s during a call, then reopened: correct state, gate worked out right **[v2]** | run / device |
| 4.13 | Notes saved only on confirm; discarded on Callback / Unavailable; locked after confirm | run |
| 4.14 | Callback closes the case with its status card; save failure keeps the choices | run |
| 4.15 | Availability: 15 min minimum, time formats (h:mm:ss / m:ss / 0:00), add time, end availability with a pending request, window ending during a case never interrupts it | run |
| 4.16 | Sign-in and OTP limits, messages and lock as app-logic §2 (mock lengths marked) | run |
| 4.17 | Faster sign-in: offered once; failed or cancelled prompt stays on the offer; screen-lock fallback; skipped without screen lock; Profile toggle per D-70 — all driven by the mock phone unlock **[v2]** | run |
| 4.18 | Closed case read-only and muted. Availability left: **Request next case** (primary) + **Back to Home** (quiet). Availability ended: **Back to Home** only, as primary. Request next case checks the call has ended on 15 / B3 **[v2]** | run |
| 4.19 | Phone back on every screen and sheet does the app-logic action; it never closes the app during a case **[v2]** | run / device |
| 4.20 | Four confirm outcomes logged as four separate events, once per completed confirm; "Waiting for the call record" is not logged as confirmed **[v2]** | auto |

## 5. Modes, install and hosting

| # | Check | How |
|---|---|---|
| 5.1 | Each scenario reaches each of its endings (scenario × ending table in the state map) **[v2]** | run |
| 5.2 | Demo mode: Cat4 happy path only, no review controls anywhere; the installed app ignores review or capture settings in a link **[v2]** | run |
| 5.3 | Review panel sits beside the frame, never inside it, never a scroll container | auto |
| 5.4 | Demo, review and capture never share stored data; capture writes nothing; Reset and Log out clear storage **[v2]** | auto |
| 5.5 | Manifest and icons (180 / 192 / 512 PNG) present and load on the deployed link **[v2]** | auto |
| 5.6 | Installs and opens without browser bars, portrait, approved name and icon — Android Chrome and iPhone Safari; phone model and OS version recorded **[v2]** | device |
| 5.7 | Reopening the installed app resumes: unlock → Home, or straight back into an open case (also after a few days) **[v2]** | device |
| 5.8 | Safe areas respected (notch, home bar); bottom bar never cut by browser bars; keyboard on OTP leaves code boxes, error line and Verify visible at 360 | device |
| 5.9 | After a new deploy, the installed app shows the new version on next open **[v2]** | device |
| 5.10 | New link `truemeds-doctor-app-preview` live from the project branch; deploy preview checked first; only `app/` is public on it; hidden from search engines; current site unchanged **[v2]** | auto / eye |

## 6. Quality

| # | Check | How |
|---|---|---|
| 6.1 | No console errors in any state | auto |
| 6.2 | Offline, loading and failure states per `feedback-state-map.md` (as aligned with app-logic) reachable and correct | run |
| 6.3 | Largest phone text size: nothing clipped; buttons on one line or wrapping as RULES allows **[v2]** | device |
| 6.4 | Only synthetic data: scan of the app's files for phone-number and OTP patterns (allowlist for the mock numbers) + review of the scenario files **[v2]** | auto / eye |

## 7. Done and frozen

| # | Check | How |
|---|---|---|
| 7.1 | Commits on the project branch only and touch only `projects/truemeds-doctor-portal-prototype/` (and `design-system/` when a step needs a central fix, in its own commit); reach `main` through a PR Apurva merges **[v2]** | auto |
| 7.2 | `session_handoff.md` updated after every step; decisions recorded by the main thread after Apurva agrees | eye |
| 7.3 | A change to the shared core re-runs the checks of every frozen journey **[v2]** | auto |
| 7.4 | Apurva approves the step → frozen. New findings = bug (fix where it occurs) or next-version idea (backlog) | — |
