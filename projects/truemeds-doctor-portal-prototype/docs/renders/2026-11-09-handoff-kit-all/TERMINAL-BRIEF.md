# Brief — native hand-off kit, all journeys (D-96, after the Sign-in pilot)

Owner: main Claude thread · Runner: `scripts/run-chain.sh` (headless Claude Code), Codex as tester and critic · 2026-11-09
Folder: `~/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype` (project branch).
Evidence folder: `docs/renders/2026-11-09-handoff-kit-all/` (this folder).

## What this run does

The Sign-in pilot built the kit's foundation (`handoff/`, `scripts/build-handoff.*`, `tests/codex/handoff/`):
token map, screen-file format, `DECIDED` / `OPEN` format, the AI pack and the viewer. **This run adds every other
approved journey to that same kit**, the same way. It does not redesign the kit.

Journeys to add (the approved states in `ui-screens/README.md`): OTP, faster sign-in offer, returning unlock, Home
(incl. Profile / Log out), case page (incl. leave / release, Rx viewer, closed card), Prescribe / Disable, calling
(Cat4, HA skipped, Pilot Fallback B — the calling states live under `ui-screens/case/`).

**Aim: a few hours.** Generated, not typed: the generator does the work, so most of the effort is extending it and
checking its output.

## Before you start

- Read `docs/runs/RULINGS.md` first (it overrides this brief).
- Read: the pilot brief `docs/renders/2026-11-09-handoff-kit/TERMINAL-BRIEF.md` (its hard rules, layout §1, token
  rules §2 and every section after still apply — read it whole), its `REPORT.md` and `REPORT-2.md`;
  `docs/proposals/2026-11-09-native-handoff-kit.md` (§6 is the done-checklist); D-96, D-98, D-99 in the decision log;
  `ui-screens/README.md`; `ui-screens/app-logic.md` (all of it); `docs/feedback-state-map.md`.
- This runs after build-fast run B, so `app/` is final for this pass.

## Hard rules (in addition to the pilot brief's)

- **Read-only:** `app/`, `ui-screens/`, `../../design-system/`, `docs/context/`. Problems there go under
  NEEDS-APURVA in the report.
- **You may write:** `handoff/`, `scripts/build-handoff.*`, `tests/codex/handoff/` (Codex only), this folder.
- **Don't change the pilot's foundation** (token map, screen-file structure, DECIDED / OPEN format, AI pack layout)
  unless it can't hold a new journey; if you must, say exactly what changed and why in the report, and keep
  Sign-in's output identical apart from that.
- **Product questions already in OPEN stay OPEN** (o04, o05, o07, o08, o10, o11, o17, o18, o25, o26 and any new
  ones). Don't ask, don't decide.
- `DECIDED.md` / `OPEN.md` must cover every rule in `app-logic.md` that touches each new screen, with decision
  numbers. "case", never "order".
- One Codex review (correctness against the proposal only, style skipped), one fix pass, a second review only for
  blockers (D-100). Small things you can't fix in one try: list them and move on.
- Evidence: commit proof (report, JSON, test logs, one evidence sheet) and only pictures that **differ** from what
  is already committed — no identical re-captures (backlog §2m point 4).

## Steps

0. **Codex tests first.** Codex extends `tests/codex/handoff/` (CASES.md + node tests) from §6 to every new screen:
   every native token name exists in `tokens.ts`; every copy key exists in `messages.ts`; every element of every
   approved state is in `screens/<screen>.json`; every raw value is flagged; nothing internal leaked; `--check`
   fails when a source changes. Run it with `< /dev/null`, `--sandbox workspace-write`, writing only under
   `tests/codex/handoff/`. Commit as written. A test that contradicts the proposal → `test-disputes.md` with the
   source line; don't edit it.
1. **Extend the generator** to all journeys; regenerate; `--check` passes. Commit.
2. **Components:** a spec for every building block the new screens use (parts × states → native token).
3. **Screens:** one `screens/<screen>.json` per journey; every state inspectable at 390 in the viewer, 360 as the
   approved pictures; a "tokens used" table per screen.
4. **DECIDED / OPEN / CHANGES** regenerated and reviewed for every new screen.
5. **Fresh-AI test, one round**, on the case page in a calling state and on Prescribe (pilot §3.1 method, Claude and
   Codex): questions already in DECIDED = 0. Record in `fresh-ai/SCORES.md`.
6. **Codex critique**, fix pass, Sign-in pilot checks still pass (`tests/codex/handoff/` all, `brand/check_lockup.py`,
   `check-sources.mjs`).
7. `REPORT.md` (short): screens added, §6 checklist per screen (pass / fail), Codex tests (written / passing /
   disputed), fresh-AI result, foundation changes (if any), NEEDS-APURVA, new OPEN items.

## End

Append `DONE handoff-kit-all` (or `STOPPED handoff-kit-all: <reason>`) to `docs/runs/STATUS.md`, publish with the
run's files (`bash ../../scripts/publish.sh -m "..." <files>` — must print "Pushed to …"), stop. No deploys.
