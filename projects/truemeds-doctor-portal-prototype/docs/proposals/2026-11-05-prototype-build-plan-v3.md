# Doctor portal — prototype build plan v3

**Status:** DRAFT v3 for Apurva's approval (2026-11-05). Nothing is built until this plan and rebuild checklist v3 (`docs/reviews/2026-11-05-rebuild-checklist-v3.md`) are approved.
**Replaces:** `docs/proposals/2026-10-29-prototype-build-plan.md` (v2). Changed or new parts are marked **[v3]**.
**Scope:** how the *prototype* is built. Not the production HLD/LLD — that is Engineering's.
**Inputs (frozen):** `ui-screens/` (149 states, re-frozen at D-85) · `ui-screens/app-logic.md` · `ui-screens/feedback/messages.json` · `docs/feedback-state-map.md` · `design-system/` (RULES §7–9) · decision log D-01 – D-88 · **calling-flow page `calling-flow/` (`data.js`) as the calling reference [v3]**.

---

## 0. Decisions this plan rests on [v3]

| Point | Answer | Source |
|---|---|---|
| Build order | Plan + checklist v3 now; they are the base of the engineering spec and the first draft of the test cases. Shell (step 0) first, then one journey at a time | D-88 (Q1) |
| Storyboard review Part C | **Closed** — every journey was walked through; only the calling flow needed the long review (D-83). No journey waits on a review | D-88 (Q5) |
| Pilot flow | **Fallback B** is the one Pilot flow (Non-Value Meds included). A-only screens (11, 12, 8b) are built later as version A | D-87 |
| Preview-site deploys | Only when Apurva asks — `[deploy]` in the PR title, as the current site | D-88 (Q3) |
| Help and bell | Stay active where the pictures show them; tapping opens a blank placeholder page, marked `[OPEN DECISION]` | D-88 (Q4) |
| Home-screen icon background | White (the mark's blue would disappear on a blue tile) — Claude's default, Apurva had no preference; change on request | D-88 (Q4, P6b) |
| What the bare link opens | Review (panel beside the phone); demo via `?demo=1`; the installed app always opens demo | D-79 P3 |
| PRD, engineering spec, test cases | Not a gate for the build. Written from the frozen screens, app-logic and this plan + checklist (no rework, since none of them changes) | D-88 (Q1) |

## 1. What we're building

A clean, modular rebuild of the doctor app prototype from the approved screens, on a new Netlify site (D-56, D-72).

| | Review mode (bare link) [v3] | Demo mode (`?demo=1`, installed app) [v3] |
|---|---|---|
| Who it's for | Apurva, design team, Engineering | Anyone trying touch and feel on a phone |
| Case types | Cat4 · Pilot HA free · Pilot no HA free · Pilot HA skipped (customer / system) — Fallback B [v3] | Cat4 only |
| States | Every launch state in app-logic and every approved picture (A-only states left out) [v3] | Happy path: sign-in → OTP → Home → case → call → Prescription confirmed → next case |
| Controls | Review panel beside the phone frame | None |
| Call gate | Real 50 s (a setting), with fast-forward | Short demo call, about 8 s (whole demo clock faster, so the call still counts) |
| Installable | — | Yes: Add to Home Screen, opens full screen |

The old `index.html` / `app.js` / `styles.css` stay frozen; the current site keeps serving them until Apurva approves the new one.

## 2. Start gate [v3]

1. ✅ Screens frozen (D-78, D-82, re-frozen D-85) · ✅ copy round merged (D-84) · ✅ Part C closed (D-88).
2. ✅ `app-logic.md` approved; §6 and §11 carry the launch (B) flow above the version-A tables (staleness sweep, 2026-11-03).
3. **This plan and rebuild checklist v3 approved.**

## 3. How it's built

| # | Choice | Recommendation | Why |
|---|---|---|---|
| B1 | Technology | Plain HTML, CSS and JavaScript modules; no framework, no app build. A small deploy step copies the shared files in (§4) | The production app is React Native, so prototype code is not reused — it has to be easy to read and change |
| B2 | Location | New folder `app/` in the project; old files untouched | Clean start; old demo keeps working |
| B3 | Structure | One file per screen, one per sheet, plus a small core: navigation, app state, copy (`MSG()`), mock server, call simulator, clock, mock phone unlock | Each journey can be built, checked and frozen on its own |
| B4 | States and addressing | One **state map** file: journey, state ID, scenario, render ID, picture, build step, transitions to test. Every state opens with `?s=<render-id>`. **[v3]** The calling rows are generated from `calling-flow/data.js` (states, pictures, buttons, events) and a check fails if the two drift. Launch IDs added: `g0`, `t15-after-hangup`, `g3b-after-hangup`, `c-callback-refused`, `s7d-result-missing-pilot`; `t15b` gone; `t08b`, `t11`, `t12` tagged version A | One source for the calling flow — Engineering's page and the prototype can't disagree |
| B5 | Look | Only `truemeds.css`, `icons.js`, `--tm-*` tokens, `.tm-*` components; markup lifted from the approved `ui-screens/` files | The screens come out the same as the pictures |
| B6 | Copy | Every word through `MSG()` from `messages.json` (copy annex already applied, D-84). Labels still typed in the pictures move into the registry in the step that builds them. Copy-rule checks in `check-sources.mjs` run on `app/` [v3] | One source of copy for HTML and native |
| B7 | Server and polling | A mock server plays the backend; the app polls it (`[MOCK ASSUMPTION]`), one loop per case and call; stale or duplicate answers ignored; re-reads the case when the app comes back to the front. **[v3]** Partner-aware: 5 (Getting call result) only after a known hang-up (Ozonetel sends it); a Cat4 call on Knowlarity stays on Calling until the result; 7b only when the end can't be known | Same shape as the real system (D-83) |
| B8 | Clock and gate | One app clock; gate worked out from time stamps (patient answered → now), never a counter. Demo speeds up the whole clock | Phones pause timers in the background |
| B9 | Call simulator [v3] | Review panel picks the outcome per call: connected (above / under the gate) · doctor-side failure (3 Didn't go through, 4 You didn't answer) · patient-side failure (→ 9) · partner (Ozonetel / Knowlarity) · call record arrives / never arrives (unproven confirm → not confirmed, hold and retry, no ₹20) · callback refused (leg 2 never answered) · release refused after the call request is accepted · HA free / no HA free at the tap (B2) · transfer ends before the tap (16 / 16b / 16c) | Every D-83 branch reachable without code changes |
| B10 | Settings [v3] | One settings file, each value labelled: gate 50 s · no-result timeout 3 min · `[MOCK ASSUMPTION]` call-record wait 30 min (D-73 value; D-83 makes it a setting) · `[MOCK ASSUMPTION]` hold-retry gap 15 min · `[MOCK ASSUMPTION]` polling every 3 s | Nothing hard-coded; Engineering sees what is a real rule and what is a stand-in |
| B11 | Data | Synthetic only: the four launch scenarios + stress cases (10 medicines, long names, empty case) | No real patient, phone or doctor data |
| B12 | Remembering | The installed app remembers sign-in, faster sign-in, availability and an open case. Demo and review keep separate storage; capture writes nothing; Reset and Log out clear it | Reopening must feel real (production: OQ-025) |
| B13 | Phone back [v3] | Every screen and sheet is a step in the app's history. In a case: **Back only while a call button is offered (1, 3, 4)**; hidden from the tap on Call for every case type; phone back after that shows the toast; never closes the app mid-case (D-80) | Otherwise back closes the installed app |
| B14 | Phone unlock | Mock: the review panel picks success / cancelled / failed / unavailable; the demo succeeds. Real unlock is the native team's | A browser can't use the phone's unlock like the native app |
| B15 | Checks | Playwright for tests only. Step 0 points `layout_check.py` at `app/` on a local server; adds the screenshot compare (calling round's capture method: 390 + 360, fixed clock, frozen animations, spinner mask) and journey tests. **[v3]** Every step runs the regression gate G7 | The current layout check tests the old `index.html` |

## 4. Modes, install and hosting

- **Review mode (bare link) [v3]:** panel beside the frame (RULES §7.5) — scenario, call simulator (B9), phone-unlock outcome, jump to any state, fast-forward, offline / failure switches, width 360 / 390, reset, event log (four confirm outcomes as separate events, once per completed confirm, D-50).
- **Demo mode (`?demo=1`; the installed app always) [v3]:** Cat4 happy path, no review controls; review or capture settings in a link are ignored by the installed app.
- **Capture mode (`?capture=1`):** no panel, screen width only, fixed clock, animations frozen — for the picture comparison.
- **Running locally:** `python3 -m http.server` (JavaScript modules don't run from a file). Same folder layout locally and deployed.
- **Install:** manifest (name "truemeds for doctors", opens demo, standalone, portrait); icons 180 / 192 / 512 PNG from `design-system/logo/truemeds-icon.svg` unchanged, **on white** [v3]; iPhone tags; safe areas; no offline cache in the first build; hidden from search engines.
- **Hosting [v3]:** second Netlify site **`truemeds-doctor-app-preview`**, its own settings file inside `app/` (current site untouched); only `app/` published. **Deploys only when Apurva asks** (`[deploy]` in the PR title). Claude asks for one deploy when a journey is ready for her review on the phone; between deploys, review happens on screenshots. Apurva creates the site — step-by-step guide when step 0 gets there.

## 5. Build order — Fallback B first [v3]

Each step: build → automatic checks + G7 → self-audit side by side with the pictures at 360 and 390 → Codex critique → Claude's final review → frozen. Apurva gets only pointed questions; she approves at the phone-demo milestone (step 5) and the final pass (step 8). A change to the shared core re-runs every frozen journey's checks.

| Step | Journey | Pictures | Done when |
|---|---|---|---|
| 0 | Shell: frame, navigation + phone back (D-80), state, storage, clock, settings, `MSG()`, mock server + call simulator, mock unlock, state map (calling rows from `data.js`), review panel, install, checks on `app/`, preview site | — | Layout check passes on `app/`; state map lists all 149 states (A-only tagged); state map ↔ `data.js` check passes |
| 1 | Sign-in, OTP, faster sign-in offer, returning unlock | `sign-in/`, `otp/`, `faster-signin-offer/`, `returning-unlock/` | Every state matches |
| 2 | Home, availability, Profile, Log out, Help / bell placeholder | `home/` | Every state matches |
| 3 | Case page incl. empty case, leave sheet, release failed, Rx failed | `case/a-*`, `s-*`, `s7e-leave-sheet`, `prescribe/d-rx-failed` | Every state matches |
| 4 | Prescribe and Disable | `prescribe/d-*` | Every state matches |
| 5 | Calling, Cat4 and Pilot HA skipped: 1 – 10a, 7b – 7f, 8c, callback, patient unavailable, Request next case → next case | `t01`–`t06`, `t08a`, `t08c`, `t09`, `t10a`, `s7a`–`s7f`, `s7d-unavailable-sheet`, `c-callback*`, `e-callback-scheduled`, `e-availability-ended` | Every state matches · **phone demo ready → deploy on request** |
| 6 | **Pilot, Fallback B:** B1 Calling and Confirm prescription (before / after the gate), B2, 13 → 14, 15 + after hang-up, B3 + after hang-up, 16 / 16b / 16c → 10b, Skip HA → 17, 7d Pilot | `g0`, `g1`, `g2`, `t13`, `t14`, `t15-ha-no-join`, `t15-after-hangup`, `g3b-forwarded`, `g3b-after-hangup`, `t16*`, `t10b`, `t17`, `c-skip-ha`, `s7d-result-missing-pilot` | Every state matches; every calling-flow path for Pilot plays end to end |
| 7 | Across journeys: availability ends mid-case, reopen into an open case, app backgrounded during a call | app-logic §3 – 4 | Every scenario runs end to end |
| 8 | Final pass: copy parity with native, G7 over everything | all | Whole checklist passes → Apurva approves → frozen; old link retired after (redirect, D-79 P8) |
| 9 (later) | **Version A:** route known at call start | `t11`, `t12`, `t08b` | Separate approval |

## 6. Who does what

- **Claude (main thread):** briefs per step, self-audit, final review, decision log, handoff, commits on the project branch.
- **Terminal / Codex sub-sessions:** build one step per brief, run checks, critique; report under NEEDS-APURVA; never write the decision log or record approvals.
- **Apurva:** approves this plan; answers pointed questions; creates the Netlify site; tests the demo on her phone; says when to deploy.

## 7. Not in this build

Production architecture · real backend or telecom partner · in-app calling (VoIP) · native app and real phone unlock · offline cache · version A (step 9) · Help / bell content · token inspector (next) · PRD, engineering spec, test cases (written separately, D-88).

## 8. Points to approve

| # | Point | Recommendation |
|---|---|---|
| P1 | Build order and steps (§5) | As written — B first, A as step 9 |
| P2 | Plain HTML/JS, no framework (B1) | Yes (both reviewers agreed in v2) |
| P3 | Calling rows of the state map generated from `calling-flow/data.js`, with a drift check (B4) | Yes |
| P4 | Mock settings values (B10) | As listed; all labelled `[MOCK ASSUMPTION]` except gate and timeout |
| P5 | Apurva's review points: step 5 (phone demo) and step 8 (final); other steps run autonomously | Yes |
