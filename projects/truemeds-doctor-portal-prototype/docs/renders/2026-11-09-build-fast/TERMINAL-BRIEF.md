# Brief: fast build of steps 2–8 (D-95)

Owner: main Claude thread · Runner: Claude Code (terminal), Codex once per run · 2026-11-09
Folder: `~/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype` (project branch).

**Goal: the whole prototype working today.** The approved screens already exist as audited HTML for every state (`ui-screens/`). Building them means **lifting that HTML into the app and wiring the flows**. Proof goes where a prototype actually breaks: the flows and the rules (gates, routing, limits). It does not go into re-proving pixels.

## Two runs

| Run | Steps (plan v3.2 §5) | Done when |
|---|---|---|
| **A** | 2 Home · 3 Case page · 4 Prescribe / Disable · 5 Calling (Cat4 and Pilot HA skipped) | The full Cat4 demo plays end to end in the app: sign-in → Home → case → prescribe → call → Prescription confirmed → next case. Every step-2–5 state opens from `?s=` |
| **B** | 6 Pilot Fallback B · 7 Across journeys · 8 Final pass | Every Pilot calling-flow edge plays; the step-7 scenarios run; one whole-app check |

Each time you are started: read the run status at the bottom of this file, do the **first run not marked done** completely, then stop.
Before Run A: if `docs/renders/2026-11-09-step1-recovery/SESSION-STATUS.md` says the main thread gave the D-94 go-ahead, do D-94 step 5 first (copy the pictures, rebuild the contact sheets). If it says skip, or says nothing, leave D-94 alone.

## Keep (these rules make it right by construction)

- Plan v3.2 §3 "how it's built" (B1–B14): one file per screen or sheet, the core modules from steps 0–1, mock server and call simulator, one app clock, settings, `MSG()` copy, state map, phone Back, remembering.
- **Lift the approved markup and classes** from `ui-screens/<journey>/…html` (and `home-reference.js`, `case.html`). One CSS file per journey, using only `--tm-*` / `.tm-*`. No inline styles. Every word through `MSG()`, adding registry keys only for labels the pictures already show. Locked flow, CTAs and the valid-call gate exactly as in `app-logic.md`. Don't invent logic: use `[OPEN DECISION]` / `[MOCK ASSUMPTION]` as in CLAUDE.md.
- Existing checks keep passing: `entry-journeys.mjs`, `run-checks.mjs`, `check-sources.mjs`, `layout_check.py --app`, `check_lockup.py`, `scan.mjs`.
- **Commit and push after every step** (`scripts/publish.sh`, own files only, named). "Pushed to …" is the checkpoint. Never `main`, no PR, no deploy. Wait and retry on `.lock` files (the PRD tab works in this folder too).
- On this Mac: `CHROME=` / `CHROMIUM=` (installed Chrome) for tests; `< /dev/null` on `codex exec`; `git -C`, never `cd && git`.

## Cut (decided by Apurva, D-95)

- **No per-state pixel gate.** Run `tests/compare-step1.mjs` (extend its state list to the new steps) **once at the end of each run, as a report**: list states whose changed area is over 1% of the picture, with the side-by-side sheet. Fix those only if the cause is wrong markup, a missing element or the wrong state. Anti-aliasing, retries and region explanations are not needed.
- **Tests only where the logic is real:** valid-call gate (50 s, talk time across calls, fast-forward), call outcomes → screen (one test per calling-flow edge from the state map, as B15 already asks), Confirm routing (prescription / transfer / forward / Skip HA), hold and retry, callback refused, release refused, availability ends mid-case, reopen into an open case. Screens that only display a state need no test of their own; opening from `?s=` is enough (one loop over all ids).
- **One Codex critique per run, at the end**, blockers only: `codex exec --sandbox read-only --output-last-message docs/renders/2026-11-09-build-fast/run-<A|B>/codex.md "Read docs/renders/2026-11-09-build-fast/TERMINAL-BRIEF.md (run <A|B>) and plan v3.2 steps <n–m>. Critic: report only blockers — a flow, gate, routing or CTA that differs from ui-screens/app-logic.md, a state that doesn't open, or invented logic. File and line. Read-only." < /dev/null`. Fix the blockers. No re-run unless a fix was large.
- No per-session screenshots or contact sheets. One sheet per run (`run-<A|B>/sheet.png`: the demo path at 390, one picture per screen).

## End of each run

`run-<A|B>/REPORT.md`, short: what plays end to end, the compare report (flagged states and what was done), the tests, Codex blockers and fixes, commits, `[OPEN DECISION]`s / `[MOCK ASSUMPTION]`s added (with the `open_questions.md` lines for the main thread to record; don't write `docs/context/`), what's left. Mark the run done below, push, stop.

## Run status
- Run A: not started
- Run B: not started
