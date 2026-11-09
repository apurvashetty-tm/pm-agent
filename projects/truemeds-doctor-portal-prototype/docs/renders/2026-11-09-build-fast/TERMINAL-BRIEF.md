# Brief: fast build of steps 2–8 (D-95)

Owner: main Claude thread · Runner: Claude Code (terminal), Codex once per run · 2026-11-09
Folder: `~/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype` (project branch).

**Goal: the whole prototype working today.** The approved screens already exist as audited HTML for every state (`ui-screens/`). Building them means **lifting that HTML into the app and wiring the flows**. Proof goes where a prototype actually breaks: the flows and the rules (gates, routing, limits). It does not go into re-proving pixels.

## Two runs

| Run | Steps (plan v3.2 §5) | Done when |
|---|---|---|
| **A0** | Shell fixes, D-97 (step 0 / 1 follow-ups) | Section "Run A0" below done; **stop for the main-thread review** |
| **A1** | 2 Home · 3 Case page · 4 Prescribe / Disable | Home, case page, prescribe and disable fully working; their states open from `?s=`; their Codex tests pass. Then **stop for the main-thread review** |
| **A2** | 5 Calling (Cat4 and Pilot HA skipped) | The full Cat4 demo plays end to end: sign-in → Home → case → prescribe → call → Prescription confirmed → next case. The calling Codex tests pass |
| **B** | 6 Pilot Fallback B · 7 Across journeys · 8 Final pass | Every Pilot calling-flow edge plays; the step-7 scenarios run; one whole-app check |

Each time you are started: read the run status at the bottom of this file, do the **first run not marked done** completely, then stop.
Before Run A0 (first thing): if `docs/renders/2026-11-09-step1-recovery/SESSION-STATUS.md` says the main thread gave the D-94 go-ahead, do D-94 step 5 first (copy the pictures, rebuild the contact sheets). If it says skip, or says nothing, leave D-94 alone.

## Keep (these rules make it right by construction)

- Plan v3.2 §3 "how it's built" (B1–B14): one file per screen or sheet, the core modules from steps 0–1, mock server and call simulator, one app clock, settings, `MSG()` copy, state map, phone Back, remembering.
- **Lift the approved markup and classes** from `ui-screens/<journey>/…html` (and `home-reference.js`, `case.html`). One CSS file per journey, using only `--tm-*` / `.tm-*`. No inline styles. Every word through `MSG()`, adding registry keys only for labels the pictures already show. Locked flow, CTAs and the valid-call gate exactly as in `app-logic.md`. Don't invent logic: use `[OPEN DECISION]` / `[MOCK ASSUMPTION]` as in CLAUDE.md.
- **"Lift" means structure, not a paste.** The reference files hold every state on one page, with a state switcher and demo scripts. Don't copy those parts. Take each screen's markup structure and class names into a screen module that renders from app state. Styles: the central design system first (`truemeds.css`, `.tm-*`), then one small CSS file per journey for what is specific to it. Words go in `messages.json` (`MSG()`), mock data in `app/data/`, rules in the core modules.
- **Build shared pieces once and reuse them:** case header, pinned action bar with its notice band, bottom-sheet template, medicine row, notices, toasts, confirm buttons. A screen composes them. No CSS rule repeated across journey files: if two journeys need it, it goes in a shared file.
- Existing checks keep passing: `entry-journeys.mjs`, `run-checks.mjs`, `check-sources.mjs`, `layout_check.py --app`, `check_lockup.py`, `scan.mjs`.
- **Commit and push after every step** (`scripts/publish.sh`, own files only, named). "Pushed to …" is the checkpoint. Never `main`, no PR, no deploy. Wait and retry on `.lock` files (the PRD tab works in this folder too).
- On this Mac: `CHROME=` / `CHROMIUM=` (installed Chrome) for tests; `< /dev/null` on `codex exec`; `git -C`, never `cd && git`.

**Tokens only (D-99, applies to A1, A2 and B):** every size, colour, border width, spacing, radius, shadow, timing, layer and opacity in `app/` CSS comes from a `--tm-*` token (D-99 added sizes, borders, timing, layering). When lifting Home, Case and Prescribe, replace the reference files' raw values with tokens (e.g. off-scale 6 / 18 / −9 / −14px spacing → the nearest token by meaning; `rgba(0,0,0,.32)` → the overlay token; ad-hoc z-index → `--tm-layer-*`; 0.25 / 0.28 / 0.3s → `--tm-duration-medium` with `--tm-easing-sheet` for sheets). `design-system/scripts/check_tokens.py` must pass. A value with no token: don't type it; list it in the run's REPORT for the main thread. Mock Rx paper and prototype chrome stay exempt.

## Cut (decided by Apurva, D-95)

- **No per-state pixel gate.** Run `tests/compare-step1.mjs` (extend its state list to the new steps) **once at the end of each run, as a report**: list states whose changed area is over 1% of the picture, with the side-by-side sheet. Fix those only if the cause is wrong markup, a missing element or the wrong state. Anti-aliasing, retries and region explanations are not needed.
- **Tests only where the logic is real:** valid-call gate (50 s, talk time across calls, fast-forward), call outcomes → screen (one test per calling-flow edge from the state map, as B15 already asks), Confirm routing (prescription / transfer / forward / Skip HA), hold and retry, callback refused, release refused, availability ends mid-case, reopen into an open case. Screens that only display a state need no test of their own; opening from `?s=` is enough (one loop over all ids).
- **Codex is the tester and the critic (see "Codex in each run" below).** Spend freely on it; don't skip or shorten its steps to save time.
- No per-session screenshots or contact sheets. One sheet per run (`run-<A|B>/sheet.png`: the demo path at 390, one picture per screen).

## Codex in each run (D-95, Apurva: use Codex fully)

Codex writes the tests **from the spec, before the build**, so the build isn't grading itself.

1. **Tests first (start of the run, before any build).**
   `codex exec --sandbox workspace-write --output-last-message docs/renders/2026-11-09-build-fast/run-<X>/codex-tests.md "You are the tester for run <X> of docs/renders/2026-11-09-build-fast/TERMINAL-BRIEF.md (plan v3.2 steps <n–m>). From the spec only — ui-screens/app-logic.md, ui-screens/README.md, docs/feedback-state-map.md, the approved ui-screens/*.html, app/state-map.js, settings and test data — write (a) tests/codex/run-<X>/CASES.md: every scenario, rule and edge for these steps (each with its source line), incl. the valid-call gate, routing, CTAs per state, phone Back, offline, refusals, timers, remembering; and (b) Playwright tests in tests/codex/run-<X>/*.mjs that drive the app the way tests/entry-journeys.mjs does (?s=, play links, review-panel story / call simulator) and assert visible text from messages.json. Don't read or change app/ code. Write only under tests/codex/run-<X>/." < /dev/null`
   Commit and push them as they are (checkpoint "run <X> Codex tests").
   **If `tests/codex/run-<X>/CASES.md` already exists** (Codex was run ahead in another tab), skip writing. Commit and push what's there, then go on.
2. **Build** (the steps above). Run the Codex tests as you go. A failing test means fixing the app, **unless** the test contradicts the spec. Then don't edit Codex's test: list it in `run-<X>/test-disputes.md` with the spec line for the main thread to rule on.
3. **Full critique at the end.**
   `codex exec --sandbox read-only --output-last-message docs/renders/2026-11-09-build-fast/run-<X>/codex-critique.md "Critic for run <X> of docs/renders/2026-11-09-build-fast/TERMINAL-BRIEF.md. Review the built app/ for steps <n–m> against ui-screens/app-logic.md, the approved ui-screens/ HTML, plan v3.2 and tests/codex/run-<X>/CASES.md. Report only gaps that affect correctness against the spec (behaviour, routing, gates, copy, tokens), as blockers or should-fix with file, line and spec line; skip style and preferences; also list CASES.md scenarios with no passing test. Read-only." < /dev/null`
   Fix every blocker and should-fix (say why in `run-<X>/codex-response.md` for any not adopted). If there were blockers, re-run once (`codex-critique-2.md`).
4. If Codex hits its usage limit, write that in REPORT.md and carry on; the main thread decides what to do.

The run is done when all Codex tests pass (except disputed ones), the existing checks pass, and no blocker is open.

## Run A0 — shell fixes from Apurva's review (D-97; read it in the decision log)

Short run. App shell and review tools only, no screen or approved picture changes.
1. **Frame 390 : 844** (`design-system/RULES.md` §7, already updated): `app/shell/shell.css` frame variables. Update the frame assertion in `docs/layout_check.py` (and any test that asserts 9:16, e.g. entry-journeys B8 / F9) to 390 : 844. Also update the desktop frame in the reference pages (`ui-screens/home/home-reference.css`, `ui-screens/case/case-styles.css`, and any other `ui-screens` page with a 9:16 frame). **Prove the approved pictures don't change:** re-capture all of them with the D-94 settings after the edit and compare: 0 px difference. The old `styles.css` stays frozen.
2. **One right-hand control column, top-aligned with the frame:** "Test on phone" becomes the first folding row of the review panel (open by default, collapses like the others; QR, steps, link, Copy link inside), and the left-gutter card is removed. The panel's top edge is the frame's top edge at every desktop size. No row ever pushes another off screen at 1280 × 800 (the panel itself doesn't scroll, per §7.3: rows fold).
3. **QR / play link works from a phone:** when served from `localhost` / `127.0.0.1`, build the link with the Mac's network address and port, with one plain line under the QR ("Phone and Mac on the same Wi-Fi"). On the preview site, use its own address. Test that the link decodes to a non-localhost host when an address is configured. The address comes from the server, so add a tiny `scripts/serve.sh` that starts `python3 -m http.server` on 8080 for `app/` and prints the network URL, after running `copy-shared.sh`.
4. **Default story = happy path:** Cat4, patient answers, call over the gate, record over the gate, so playing straight through ends on Prescription confirmed → next case. Failure choices stay in the panel. Update the default QR steps.
5. **Panel summaries wrap** to two lines instead of being cut off ("Turns on · Unl…").
5b. **Test numbers and codes, visible:** inside the **Sign-in answers** row, a short list built from `app/data/test-numbers.js` (the same data the mock server uses, so it can't drift): each number / code with its result in plain words (app-logic §11 table). Tapping a line fills it into the sign-in or OTP field of the running app. On the phone drawer, show the same list when the current screen is sign-in or OTP.
5c. **Settings made understandable:** rename the row **"Timings and limits"**. Show each value with a plain name ("Valid-call minimum", "OTP lock", "Resend waits", …), its value in seconds or minutes, and a tag **Rule** or **Stand-in** (from `source`), with its reference on hover or tap. Move it and **Event log** to the bottom of the panel under a quiet label "Advanced". Order the panel: Test on phone · Story · Jump to a state · Sign-in answers · Home and case answers · Call simulator · Advanced (Timings and limits, Event log).
6. Checks: all existing checks and tests pass. Screenshots for review in `docs/renders/2026-11-09-build-fast/run-A0/`: desktop at 1280 × 800 and 1440 × 900 (Story open, then Call simulator open), and the frame at 1920 × 1080, each next to a before shot. Push. Set run status "Run A0: waiting for main-thread review" and stop.

## Every run starts with Apurva's open bugs

Read `docs/reviews/2026-11-09-prototype-feedback.md`. Fix every **BUG** with status **Open** first (only where it occurs), add a test for it, set its status to "Fixed in run <X> (commit)", and push before the run's own work. Don't touch NEXT VERSION or NO CHANGE rows.

## Main-thread rulings on the Run A0 test disputes (2026-11-09 18:35)

All four proposed rulings in `run-A0/test-disputes.md` are accepted: (1) align the panel card's top, not the first row; (2) anchor the code / number names (`^0000\b`); (3) select the QR (`#rp-qr svg`), not the chevron; (4) the happy-path test belongs to the end of A2, and it uses the approved labels "Send OTP" / "Verify & sign in". **At the start of A1**, have Codex correct its own tests to these rulings (`codex exec --sandbox workspace-write "Apply the main-thread rulings in docs/renders/2026-11-09-build-fast/TERMINAL-BRIEF.md 'Main-thread rulings on the Run A0 test disputes' to tests/codex/run-A0/. Change only what the rulings name." < /dev/null`), then re-run A0's Codex tests: all must pass except A0-happy-path, which re-runs at the end of A2. Before writing the A1 / A2 tests' expectations into the app, check `tests/codex/run-A/` for the same label mistake ("Send code") and correct any you find the same way, through Codex.

## Codex tests: already written (main-thread review, 2026-11-09 16:20)

Codex wrote both runs' tests ahead: `tests/codex/run-A/` (one set for A1 + A2; run the ids for the steps in hand, e.g. `CODEX_FILTER=A-H` / `A-C` / `A-P` / `S-` for A1, and the rest for A2) and `tests/codex/run-B/`. Read `tests/codex/README.md` → "Driver contract and limits" first. The main thread reviewed them: they are spec-sourced and accepted as the oracle. Commit them as they are at the start of A1. Then:
- **Adapter gaps are build work, not disputes.** Keep the approved reference ids when lifting markup (`#medicines-list`, `#doctor-notes-input`, …). The call simulator gets a visible per-call **talk length in seconds** (`#rp-length`, B9 already asks for a length) so the gate-boundary tests run. Use the B9 semantic values the tests choose (map enum spellings in the driver if needed, without changing expected behaviour). The event log names hold / retry / mismatch / confirm-completed events, so the tests can find them.
- **`REVIEW-CHECKS.md` "automation gap" items:** turn into tests, in the step that builds them, A-R03 (timer format and deadlines), A-R04 (counts and earnings), A-R16 (gate anchored on the patient's answer; exact minimum counted call), A-R18 (record wait and hold policy), A-R19 (callback missing-date and retained values), A-R20 (pending block count, no duplicate submit). Others where cheap. "Eye" items (Rx gestures, keyboard) are for the main thread; list them in REPORT.md.
- Codex's tests stay unchanged. Disagreements go in `run-<X>/test-disputes.md` with the spec line.

## End of each run

`run-<A|B>/REPORT.md`, short: what plays end to end, Codex tests (written / passing / disputed), the compare report (flagged states and what was done), the tests, Codex blockers and fixes, commits, `[OPEN DECISION]`s / `[MOCK ASSUMPTION]`s added (with the `open_questions.md` lines for the main thread to record; don't write `docs/context/`), what's left. Mark the run done below, push, stop.

## Runner contract (D-100)
This brief may be started by `scripts/run-chain.sh` in a fresh headless session. Before starting, read `docs/runs/RULINGS.md` (main-thread rulings; they override this brief where they conflict). Do one run, then: append `DONE build-fast run-<X>` to `docs/runs/STATUS.md`, publish it with the run's files, stop. If the run can't finish, append `STOPPED build-fast run-<X>: <one-line reason>` instead, publish, stop. Fix every open bug in `docs/context/feedback-log.md` that belongs to this run first, as before.

## Run status
- Run A0: ✅ done — main-thread review passed 2026-11-09 18:35 (rulings on its test disputes below)
- Run A1: ✅ done 2026-11-09 — main-thread review passed 21:50 (4 test disputes ruled as test bugs and fixed; see `docs/runs/RULINGS.md`)
- Run A2: ✅ done 2026-11-09 (`run-A2/REPORT.md`; Codex run A all pass; 1 dispute, A0-happy-path labels, in `run-A2/test-disputes.md`)
- Run B: ✅ done 2026-11-10 (`run-B/REPORT.md`; Codex run B 94/99, 5 disputed on one cause in `run-B/test-disputes.md`; run A 303/303; critique blocker fixed, critique-2 no blockers)
