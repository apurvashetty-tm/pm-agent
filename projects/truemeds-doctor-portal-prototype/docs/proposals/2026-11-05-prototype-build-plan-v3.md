# Doctor portal — prototype build plan v3

**Status:** **APPROVED v3.2** (Apurva, 2026-11-06, D-90) together with rebuild checklist v3.2 (`docs/reviews/2026-11-05-rebuild-checklist-v3.md`). Changes from here on: bug (fix where it occurs) or next version (backlog).
**Replaces:** `docs/proposals/2026-10-29-prototype-build-plan.md` (v2). **[v3]** = changed from v2 · **[R]** = changed after the independent review · **[R2]** = Apurva's answers after the review (D-89) (`docs/reviews/2026-11-05-plan-v3-review/`: Claude Code + Codex reports, merged in `MERGE.md`).
**Scope:** how the *prototype* is built. Not the production HLD/LLD — that is Engineering's.
**Inputs (frozen):** `ui-screens/` (149 states, re-frozen at D-85) · `ui-screens/app-logic.md` · `ui-screens/feedback/messages.json` · `docs/feedback-state-map.md` · `design-system/` (RULES §7–9) · decision log D-01 – D-88 · calling-flow page `calling-flow/` (`data.js`) as the calling reference **[v3]**.
**Picture version:** `docs/reviews/2026-11-05-plan-v3-review/build-map/` — every step below as its real screens **[R]**.

---

## 0. Decisions this plan rests on [v3]

| Point | Answer | Source |
|---|---|---|
| Build order | Plan + checklist v3 now; they are the base of the engineering spec and the first draft of the test cases. Shell (step 0) first, then one journey at a time | D-88 (Q1) |
| Storyboard review Part C | Closed — every journey was walked through | D-88 (Q5) |
| Pilot flow | Fallback B is the one Pilot flow (Non-Value Meds included). A-only screens (11, 12, 8b) built later as version A | D-87 |
| Preview-site deploys | Only when Apurva asks | D-88 (Q3) |
| Help and bell | Stay active where the pictures show them; open a blank placeholder (`[OPEN DECISION]`) | D-88 (Q4) |
| Home-screen icon | Mark on white — the logo is locked (RULES: never recolour), and on a blue tile its blue half disappears | D-88 (Q4, P6b) |
| What the bare link opens | Review; demo via `?demo=1`; the installed app always opens demo | D-79 P3 |
| PRD, engineering spec, test cases | Not a gate for the build | D-88 (Q1) |
| Back on a case **[R]** | Header Back on 1, 3 and 4 only, while the patient has never been reached; hidden from the tap on Call; never returns once the patient answered; closed case → phone back goes Home | D-80 pt 1, app-logic §4 table (one stale sentence fixed as a bug in step 0) |
| Pilot 7d ending **[R2]** | 7f → **10b Forwarded to Health Advisor** when the record arrives (the doctor tapped Confirm & forward; D-50 keeps forward and confirm apart). Cat4 7d still ends on 10a | D-89 (Q-A) |
| Phone check at step 6 **[R2]** | Yes — one deploy, Apurva plays the Pilot scenarios on her phone | D-89 (Q-B) |
| Testing on a phone **[R2]** | The phone shows only the app. Scenarios are set on the desktop and sent to the phone by QR code (play link); a small hidden drawer on the phone changes things mid-flow. A live desktop remote is a later option (backlog) | D-89 |

## 1. What we're building

A clean, modular rebuild of the doctor app prototype from the approved screens, on a new Netlify site (D-56, D-72).

| | Review mode (bare link) | Demo mode (`?demo=1`, installed app) |
|---|---|---|
| Who it's for | Apurva, design team, Engineering | Anyone trying touch and feel on a phone |
| Case types | Cat4 · Pilot HA free · Pilot no HA free · Pilot HA skipped (customer / system) | Cat4 only |
| States | Every launch state in app-logic and every approved picture (A-only left out) | Happy path: sign-in → OTP → Home → case → prescribe → call → Prescription confirmed → next case |
| Controls | Desktop: review panel beside the phone frame. Phone: app full screen, play link (QR) + hidden drawer **[R2]** | None |
| Call gate | Real 50 s (a setting), with fast-forward | Whole clock runs faster (see B10), so the call still counts as valid **[R]** |
| Installable | — | Yes: Add to Home Screen, opens full screen |

The old `index.html` / `app.js` / `styles.css` stay frozen; the current site keeps serving them until Apurva approves the new one.

## 2. Start gate

1. ✅ Screens frozen (D-85) · ✅ copy round merged (D-84) · ✅ Part C closed (D-88).
2. ✅ `app-logic.md` approved (launch B flow above the version-A tables).
3. ✅ This plan and rebuild checklist v3.2 approved (D-90).

## 3. How it's built

| # | Choice | Recommendation | Why |
|---|---|---|---|
| B1 | Technology | Plain HTML, CSS and JavaScript modules; no framework, no app build. A deploy step copies shared files in (§4). Node + Playwright only for checks and tests | Production is React Native, so prototype code isn't reused — easy to read and change |
| B2 | Location | New folder `app/` in the project; old files untouched | Clean start; old demo keeps working |
| B3 | Structure | One file per screen, one per sheet, plus a small core: navigation, app state, copy (`MSG()`), mock server, call simulator, clock, settings, mock phone unlock | Each journey built, checked and frozen on its own |
| B4 | States and addressing **[R]** | One **state map**: journey, state ID, scenario, render ID, picture (or "behaviour only"), build step, transitions to test. Every state, incl. behaviour-only ones (`offer.cancelled`, `offer.not-now`, `offer.unsupported`, `offer.enabled`, `rx.load-failed`, `case.reopened`, hold / mismatch), opens with `?s=<id>`. Calling rows generated from `calling-flow/data.js` with a **normalising step**: one owner per picture, Pilot retries keep Pilot context (`data.js` draws 6 → Call again and 7b → Still talking into the Cat4 lane), joins resolved, backend-only outcomes kept. A drift check fails if the map and `data.js` disagree; the map is also checked once against app-logic §5 before step 1 (a match with `data.js` doesn't prove `data.js` right). Retired keys (`call.forwarded-after-hangup`, `call.end-call-first`, `case.end-call-first`) not carried. Header shows the source versions (calling-flow page, D-85) | One source for the calling flow; drift visible |
| B5 | Look | Only `truemeds.css`, `icons.js`, `--tm-*` tokens, `.tm-*` components; markup lifted from the approved `ui-screens/` files; icons from the design system, never emoji | Screens come out the same as the pictures |
| B6 | Copy | Every word through `MSG()` from `messages.json` (copy annex applied, D-84). Labels still typed in the pictures move into the registry in the step that builds them. Copy-rule checks run on `app/` | One source of copy for HTML and native |
| B7 | Server and polling **[R]** | Mock server plays the backend; the app polls it (`[MOCK ASSUMPTION]`), one loop per case and call; stale or duplicate answers ignored; a late answer for an earlier case never updates the open one; re-reads the case when the app returns to the front. Partner rules (D-83 pt 7): **5 Getting call result only for Pilot after the partner reports the hang-up — Cat4 never reaches 5**; 7b only when the end can't be known, otherwise the 3-min timeout goes straight to 7c. Whether Knowlarity sends a call-ended event is **open** (Engineering) — a simulator switch, default "no event" | Same shape as the real system |
| B8 | Clock and gate | One app clock; the gate worked out from time stamps (patient answered → now), never a counter. Talk time adds up across counted calls (B10) | Phones pause timers in the background |
| B9 | Call simulator **[R]** | Review panel picks per call: connected (above / under the gate, length) · doctor-side failure (3, 4) · patient-side failure by cause (busy / no answer / switched off / network → retried; unknown → plain hold; invalid number → not retried, flagged) → 9 · partner (Ozonetel / Knowlarity) + Knowlarity call-ended event on/off · hang-up reported / not · who ended (doctor / patient / unknown → 16 / 16b / 16c) · B2: HA free / no HA free / transfer request failed (→ 15) · HA doesn't pick up (→ 14 for the doctor) · call record: arrives over the gate / under the gate / patient never answered / never, with a delay · callback refused (leg 2 never answered) · release refused after the call request was accepted | Every D-83 branch reachable without code changes |
| B10 | Settings **[R]** | One settings file. Rules: gate 50 s · no-result timeout 3 min, 7b repeats every 3 min · counted call ≥ ~10 s, talk-time window ~30 min (D-58 pt 22). `[MOCK ASSUMPTION]`: call-record wait 30 min · hold-retry gap 15 min and attempts 3 · polling every 3 s (inside D-58 pt 14's "about 5 s") · OTP window 10 min, lock 15 min, resend waits 30 / 60 / 120 s (OQ-017) · near-expiry warning 5 min · returning unlock falls back to OTP after 3 failures. **Demo scales every time value** by one factor (gate, ~10 s minimum, 30-min window, timeouts, waits, polling), so an 8 s demo call still passes | Nothing hard-coded; real rules vs stand-ins visible |
| B11 | Data | Synthetic only: four launch scenarios + stress (10 medicines, long names, empty case); test numbers and codes from app-logic §11 in one data file the tests read | No real patient, phone or doctor data |
| B12 | Remembering **[R]** | The installed app remembers sign-in, faster sign-in, availability and an open case: medicines reviewed, notes typed, deadlines, call stage. Session stays valid through an open case (no OTP over a live case). Demo and review keep separate storage; capture writes nothing; Reset and Log out clear it | Reopening must feel real (production: OQ-025) |
| B13 | Phone back **[R]** | Every screen and sheet is a step in the app's history. In a case: header Back per §0 "Back on a case"; during a call phone back shows the toast; on a closed case phone back goes Home; never closes the app mid-case | Otherwise back closes the installed app |
| B14 | Phone unlock | Mock: the review panel picks success / cancelled / failed / unavailable; the demo succeeds | A browser can't use the phone's unlock like the native app |
| B15 | Checks | Playwright. Step 0 points `layout_check.py` at `app/` on a local server; adds the screenshot compare (390 + 360, fixed clock, frozen animations, spinner mask) and journey tests, incl. one test per calling-flow edge generated from the state map, and a play-link test for each launch scenario (the same story through the link and through the desktop panel ends in the same state) **[R2]**. Every step runs G7 | The current layout check tests the old `index.html` |

## 4. Modes, install and hosting [R]

- **Review mode (bare link):** panel beside the frame (RULES §7.5) — scenario, call simulator (B9), phone-unlock outcome, jump to any state, fast-forward, offline / failure switches, width 360 / 390, reset, event log (four confirm outcomes as separate events, once per completed confirm, D-50; mismatch events).
- **Phone testing [R2]:** on a phone the review panel never sits on top of the app.
  - **Play link (QR):** the desktop review panel has a "Test on phone" section — choose the scenario and the story (call outcome per attempt, partner, who ends the call, HA free or not, call record, phone-unlock outcome). It shows a QR code and a short link (`?play=<code>`, the story written into the link; no server). Scanned on the phone, the app opens full screen and plays that story as the tester taps through — outcomes arrive by themselves at realistic times. Opens in the phone's browser (the installed app stays demo-only). An unreadable code opens review with a notice.
  - **Hidden drawer:** in review or play on a narrow screen, a small control handle sits at the screen edge — never over the header controls, the action bar or a sheet. Tapping it slides the same controls up from the bottom; tapping outside closes it. Not shown in demo or capture.
  - **Later (backlog):** live remote, where the desktop drives the phone in real time — needs a message relay (Netlify function credits or a third-party service).
- **Demo mode (`?demo=1`; the installed app always):** Cat4 happy path, no review controls; the installed app ignores review or capture settings in a link.
- **Capture mode (`?capture=1`):** no panel, screen width only, fixed clock, animations frozen.
- **Folder layout (same locally and deployed):** `app/` holds the app. The deploy step copies in `design-system/` (styles, icons, fonts, logo), the "truemeds for doctors" lockup and the copy registry, so all shared paths resolve inside `app/`; these copies are git-ignored, never committed. Locally: `python3 -m http.server` from the project folder.
- **Install:** manifest (id, scope, name "truemeds for doctors", short name, opens demo, standalone, portrait, theme and background colours); icons 180 / 192 / 512 PNG from `design-system/logo/truemeds-icon.svg` unchanged, mark on white with safe padding; iPhone tags and touch icon; safe areas; no offline cache in the first build; always checks for a new version; hidden from search engines. Android: install from the browser menu; iPhone: Share → Add to Home Screen.
- **Hosting:** second Netlify site **`truemeds-doctor-app-preview`**, from the same repo. Settings: base directory = the project's `app/` folder (its own `netlify.toml` there; the current site's root file untouched); production branch = the project branch, so review needs no merge to `main`; build command = the copy step above; publish = `app/` only (no `docs/`). **Deploy gate:** the same `ignore` rule as the current site — the site builds only when the latest commit message contains `[deploy]`. Claude adds `[deploy]` to a commit only when Apurva asks. Step 0 tests both cases (unmarked commit → skipped, marked → deployed, design-system files load, `docs/` not served). Apurva creates the site — step-by-step guide in step 0.

## 5. Build order — Fallback B first [v3, R]

Each step: build → automatic checks + G7 → self-audit against the pictures at 360 and 390 → Codex critique → Claude's final review → frozen. A change to the shared core re-runs every frozen journey's checks. Each picture has **one** owning step. A picture whose real trigger arrives in a later step is checked by `?s=` (looks right) in its own step and by a journey test (gets there) in the later step — marked ↗ below.

| Step | Journey | Pictures (owner) | Done when |
|---|---|---|---|
| 0 | Shell + staleness fixes **[R]**: frame, navigation + phone back, state, storage, clock, settings, `MSG()`, mock server + call simulator, mock unlock, state map, review panel + phone drawer + play link (QR) **[R2]**, install, checks, preview site. **Before generating the state map:** fix the stale source lines found by the review (MERGE.md §4) | — | Layout check passes on `app/`; state map lists 149 pictures + behaviour-only states; drift check passes; deploy gate tested both ways |
| 1 | Sign-in, OTP, faster sign-in offer, returning unlock | `sign-in/*`, `otp/*`, `faster-signin-offer/*`, `returning-unlock/*` + behaviour-only offer states | Every state matches; "→ Home" checked against a stub until step 2 |
| 2 | Home, availability, Profile, Log out, Help / bell placeholder | `home/*` (↗ `home_profile-case-open`: open case from step 3) | Every state matches |
| 3 | Case page incl. empty case, leave sheet, release failed, Rx viewer and Rx failed | `case/a-*` (↗ `a-back-blocked`, `a-confirm-busy`, `a-confirm-failed` → step 5), `case/s-*` (↗ `s-medicine-disabled` → step 4), `s7e-leave-sheet`, `prescribe/d-rx-failed`, `rx.load-failed` | Every state matches |
| 4 | Prescribe and Disable | `prescribe/d-*` except `d-rx-failed` | Every state matches; Prescribe checklist group passes |
| 5 | Calling, Cat4 and Pilot HA skipped: 1 – 10a, 7b – 7f, 8c, callback, patient unavailable, Request next case → next case | `t01`–`t06`, `t08a`, `t08c`, `t09`, `t10a`, `s7a-calling`, `s7b-still-on-call`, `s7c-checking`, `s7d-result-missing`, `s7d-unavailable-sheet`, `s7f-submitted`, `c-callback`, `c-callback-error`, `c-callback-failed`, `c-callback-refused`, `e-callback-scheduled`, `e-availability-ended` | Every state matches · full demo run (sign-in → prescribe → call → confirmed → next case) · **phone demo → deploy on request** |
| 6 | Pilot, Fallback B: B1 before / after the gate, B2, 13 → 14, 15 + after hang-up, B3 + after hang-up, 16 / 16b / 16c → 10b or Skip HA → 10a, Skip HA on B1 → 17, 7d Pilot | `g0-calling-pilot`, `g1-generic-confirm`, `g2-checking-ha`, `t13-connecting-ha`, `t14-transferred`, `t15-ha-no-join`, `t15-after-hangup`, `g3b-forwarded`, `g3b-after-hangup`, `t16-transfer-missed`, `t16b-…`, `t16c-…`, `t10b-forwarded`, `t17-skip-ha-wait`, `c-skip-ha`, `s7d-result-missing-pilot` | Every state matches; every Pilot calling-flow edge plays end to end · **phone check (Q-B)** |
| 7 | Across journeys: availability ends mid-case, reopen into an open case (`case.reopened`), app backgrounded during a call, late record for an earlier case while on the next one, Log out / Profile during an open case | app-logic §3 – 4 | Every scenario runs end to end |
| 8 | Final pass: copy parity with native, G7 over everything | all | Whole checklist passes → Apurva approves → frozen; old link retired after (redirect, D-79 P8) |
| 9 (later) | Version A: route known at call start | `t11`, `t12`, `t08b` | Separate approval |

**`c-skip-ha` note [R]:** the frozen picture shows the sheet over the version-A transfer screen (12). In the launch build the sheet opens over B1 (neutral script) and 16 (no script). Treated as a bug: before step 6, re-render the sheet over B1 and 16 (render only, same sheet), promote as `c-skip-ha-b1` / `c-skip-ha-16`; the current picture moves to version A.

## 6. Who does what

- **Claude (main thread):** briefs per step, self-audit, final review, decision log, handoff, commits on the project branch.
- **Terminal / Codex sub-sessions:** build one step per brief, run checks, critique; report under NEEDS-APURVA; never write the decision log or record approvals.
- **Apurva:** approves this plan; answers pointed questions; creates the Netlify site; tests on her phone; says when to deploy.

## 7. Not in this build

Production architecture · real backend or telecom partner · in-app calling (VoIP) · native app and real phone unlock · offline cache · version A (step 9) · Help / bell content · Call again after a valid call (CW-C4) · token inspector · PRD, engineering spec, test cases (written separately, D-88).

## 8. Points to approve

| # | Point | Recommendation |
|---|---|---|
| P1 | Build order, one owner per picture, ↗ rule (§5) | As written |
| P2 | Plain HTML/JS, no framework (B1) | Yes (both reviewers agree) |
| P3 | Calling rows generated from `data.js`, normalised, drift check + one check against app-logic (B4) | Yes (both reviewers agree with the normalising step) |
| P4 | Settings and mock values, demo scales all time values (B10) | As listed |
| P5 | Review points: step 5 (phone demo), step 6 (Pilot phone check), step 8 (final); other steps run autonomously | Yes |
| P6 **[R2]** | Phone testing: play link (QR) + hidden drawer; live remote later | As agreed (D-89) |
