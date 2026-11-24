# Building with agents — speed with accuracy (all projects)

Agreed with Apurva on 2026-11-09 after the doctor-portal hand-off kit and design-system audit (doctor portal D-99, D-100).
Applies to every project: prototypes, PRDs, docs, analyses. Project files add their own commands; they don't relax this.

## Why this exists

Long check loops still missed a basic gap (design tokens for sizes, borders, timing, layering). Three causes:
- **Reviews checked work against its brief.** When the rule itself is wrong, the work passes every time.
- **The checking was upside down.** Slow checks (picture re-captures, AI critiques, full AI builds) ran on every change;
  fast automatic checks didn't exist.
- **Reviewers asked to find problems always find something.** Fixing every finding causes loops and bloat.

## The rules

1. **Size the job first.**
   - *Small* (a few files, mechanical: a wording key, a token, a rule line): the main thread does it directly, runs the one
     check that covers it, commits. No brief, no terminal, no AI review.
   - *Big* (build a journey, a new document, a migration): a terminal run from a brief, under the rules below.
2. **Foundation check before building on anything shared** (design system, kit, template, data model): 15 minutes on
   *"who uses this next, and what will they need?"*. Write the answer into the definition of done.
3. **Rules with no exceptions are tools, not instructions.** A linter, a test, a commit gate, a Claude Code hook. A line in
   CLAUDE.md is a guideline an agent may decide doesn't apply; a tool runs every time. Keep the tool set small.
4. **Fast checks always, slow checks once.**
   - Every edit / commit: linters and quick scripts (seconds).
   - At the start of a build: tests written from the spec by a different agent (Codex), before the build.
   - At the end of a build, once: the full check suite, picture compare if visuals changed, **one** review.
5. **One review, against the spec, correctness only.** The reviewer gets the spec and reports gaps that affect correctness
   (behaviour, rules, copy, tokens), skipping style and preferences. Use a different model family for logic and risky
   changes. All findings go on one list → **one fix pass**. A second review only if the first found blockers.
6. **Human eyes for looks.** Machines check rules and logic; Apurva's walkthrough on the phone link (about 10 minutes per
   journey) checks how it looks and feels. His notes join the same one list.
7. **Every bug gets its smallest test** (or lint rule) so it can't come back, plus a line in the project's feedback log.
8. **Time-box every run; half-page reports.** A run states its time limit; at the limit it reports what's left instead of
   looping. Screenshots only when someone's eyes are needed.

## Unattended runs

Before a run goes unattended, answer five questions (Anthropic's checklist): what "done" looks like; how it checks its
own work; what it may touch; what stops it (turn cap, time-box); who signs off.
- One fresh session per brief, chained by a runner script on the Mac (e.g. doctor portal `scripts/run-chain.sh`):
  queue → run → `DONE` / `STOPPED` line in `docs/runs/STATUS.md` → next. A `HOLD` file pauses it.
- The main thread reviews each report (scheduled check-in) and writes rulings to `docs/runs/RULINGS.md`, which every run
  reads first. Decisions are still recorded only by the main thread.
- Commits through `scripts/publish.sh` only; never `main`; no deploy unless Apurva asks.
- While a chain runs, nothing merges to `main` (`publish.sh` pulls `main` into the branch). Evidence rules, what goes to
  `main` and the archive tag before a close: `AGENTS.md` → Git safety.

## Screens: checking how they look, not only the numbers
Learned on the doctor portal (2026-11-11, D-106–D-108). Screens passed two rule audits and still looked different, because the audits counted layout boxes, not what the eye sees.
- **Measure visible gaps.** Gaps are taken between visible edges (text ink, borders, filled shapes), never between layout boxes. Tap areas and reserved lines must not add visible space. `design-system/RULES.md` §8.3 has the rule; `design-system/scripts/check-visible-gaps.mjs` checks it and fails the build.
- **Open hidden parts before measuring.** Collapsed sections, sheets, pickers and error states are captured opened; a default capture misses them.
- **Look at sibling screens side by side once** (same scale, flow order) before freezing. One sheet answers "do these look like one app?", which no per-screen check does.
- **Audits review the look, not only the rules.** Two independent reviewers (Claude and Codex) review, critique each other, then conclude; the human answers only the yes/no questions left.
- **Screen changes start from building blocks** (wireframe, each block and why), agreed before any render; approved copy stays unless the change is about the copy.

## Sources

Anthropic, *Best practices for Claude Code* (hooks for no-exception rules; give the agent a pass/fail check; review
against the spec, skip style; the five questions before unattended runs) · Paweł Huryn (review results, not code;
smallest test per bug; a second model family for risky changes; human eyes for taste regressions) · Gabor Meyer on
Aakash Gupta's podcast (most effort in the spec; reviews before building) · the test pyramid (many fast checks, few
slow ones).
