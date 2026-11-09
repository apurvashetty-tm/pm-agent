# Main-thread rulings

Every run reads this first. Rulings override briefs where they conflict. Newest at the top.

## 2026-11-09 23:05 (after run A2 — main thread review: passed)
- **A2 passed.** A0-happy-path dispute: test bug (Set availability *is* the confirm, app-logic §3; the approved label is "Request a case"). Fixed by the main thread in `tests/codex/run-A0/all.mjs` (no second availability click; `/Request (a |next )?case/`). **Run B: run `tests/codex/run-A0/` once and confirm A0-happy-path passes.**
- A2's extra builds (scheduled hold retries, ring time / `answeredAt`) stay. **B's live Pilot gate counts from `answeredAt`.**
- **D-101 (Apurva):** Product answers for the Sign-in kit items o04, o05, o07, o08, o10, o11, o17, o18, o25, o26 — read D-101 in the decision log. Queue: `signin-d101` (small prototype run) after B, then the kit run.
- **Kit run (handoff-kit-all):** move o04, o05, o07, o08, o10, o11, o17, o18, o25, o26 from OPEN to DECIDED with D-101 (in `scripts/build-handoff.mjs`'s list, generated as before). This replaces the brief's "these stay OPEN" line for these ten; any new Product question still stays OPEN.
- **Kit = prototype hand-off with a fake backend (D-101 amended):** move o01, o02, o03, o12, o15, o16, o19, o21, o22, o24 to DECIDED too, each with the prototype's current mock value / behaviour (from the build and `open_questions.md`), labelled `[MOCK]` and "keep configurable". o23 → stated as the app team's choice. o09 → prototype-only note. For the other journeys, do the same: a backend or design gap gets the prototype's mock answer, not an OPEN line; only genuinely undecided **Product** questions stay OPEN.
- **Archive tag:** none when the chain ends — only after Apurva approves everything (backlog §2m point 1).

## 2026-11-09 22:35 (for run B and later — main thread, new thread)
- **A2 Codex critique, pre-ruled:** blockers 1–3 are valid (unclear confirm must reconcile and never resubmit, D-69; everything else disabled while Confirming, incl. Callback / Unavailable on 7d; a late result closes or revokes a sheet the new stage doesn't allow, and the Callback / Unavailable handlers check the stage). Should-fix 4 (scheduled retries / attempt counts) is backend behaviour the doctor never sees — **not needed in the prototype**; a log line is enough. Should-fix 5 (time anchored to the patient's answer) is **run B's**: the Pilot live-call gate counts from the patient answering (app-logic §5, Launch B), so B's simulator needs a separate answer time and ring interval.
- **Lighter evidence from run B on (backlog §2m point 4):** commit proof (REPORT, JSON, test logs, compare report, one sheet) and only pictures that **differ** from what's committed; no identical re-captures.
- **Queue:** a hand-off-kit run for all journeys runs after B (`docs/renders/2026-11-09-handoff-kit-all/TERMINAL-BRIEF.md`). B doesn't touch `handoff/`.

## 2026-11-09 21:50 (after run A1 — main thread review: passed)
- **A1 test disputes (4): all test bugs, app follows the approved pictures.** Fixed in `tests/codex/run-A/` by the main thread: A-C01 clicks **Stay** (D-84 CA-22); A-P07 picks **Weekly** before **Other** (Other is single-dose only); A-OPTIONS-d-every-x-hours matches the accessible names **Every 4 hours…**; `a-loading` accepts the skeleton's status region (text-free by design, D-81 F28). Syntax and inventory checked; **A2: run the whole run-A suite once and confirm these four pass.**
- **app-logic §4** stale "Stay on this case" lines corrected to **Stay**.
- **A1's five `[MOCK ASSUMPTION]`s accepted** (recorded as OQ-037 in `open_questions.md`). View Rx during "Confirming…": looks as approved, takes no tap — correct.
- **Eye checks** (Rx pinch / drag / double-tap on a phone, real keyboard hiding / restoring the bar, 360×640 feel) go to Apurva's phone walkthrough, not to a run.

## 2026-11-09 20:45 (after the token pass)
- **Token-pass test disputes 1–3: the build is right, Codex's tests were wrong.** Native tokens follow the D-98 pattern `tokens.<group>.<name>` (e.g. `iconSize.sm`, `spinner.sizeLg`), with no `tokens` root in `tokens.json`; SALT semantic tokens may alias core tokens (`--tm-radius-full` → `--tm-core-radius-full`); `transparent` is a keyword, not a raw colour. The main thread fixed `tests/codex/tokens/token-pass.test.mjs` accordingly: **90 / 90 pass**. Don't reopen these.
- **25 `raw-ok` lines reviewed:** all valid (geometry, ≤3px optical nudges, the listed exceptions). Keep the bar: a new `raw-ok` needs a reason a reviewer would accept; anything else becomes a token or goes to the report.

## 2026-11-09 20:30 (after the rails run)
- **After-edit hook is live** for every run from now on (installed by the main thread in `.claude/settings.json`, both folders). If an edit returns "Token lint (D-100): raw values…", fix that value in the same step.
- **Environment in unattended runs:** run `../../scripts/publish.sh` from the project folder, with repo-root-relative paths (e.g. `projects/truemeds-doctor-portal-prototype/app/…`). Don't `cd` outside the project folder; use `git -C` and `../../` paths in one command. `chmod`, nested `claude` and `.claude/` writes are refused — don't try; call scripts with `bash` / `python3`.
- **Codex tests written ahead** for runs A and B are in `tests/codex/run-A/`, `run-B/`, `validate.mjs`, `README.md`, `VALIDATION.md` (not yet committed): commit them as they are at the start of A1, then use them.
- **Runner:** `scripts/run-chain.sh` now counts only real `DONE <name>` lines (rails fix swapped in). Keep ending with one `DONE` / `STOPPED` line.

## 2026-11-09 (before the chain)
- **Apurva is he / him.** Use he / him in everything you write; if a file you're already editing says she / her about Apurva, correct it.
- **Rails run:** `scripts/run-chain.sh`, `docs/runs/QUEUE.md`, `STATUS.md`, `RULINGS.md` already exist (written by the main thread) and the chain is running you. **Do not edit `scripts/run-chain.sh`** (it is running). In rails §4 only check it: read it, run its dry run with `--queue docs/runs/QUEUE-dry.md` **only if no other chain is running** — it is, so skip the dry run and say so. If you find a bug, write the fix to `scripts/run-chain.next.sh` and note it in your REPORT; the main thread swaps it in. Skip rails §6's "Rails ready" print.
- **Product questions in the kit (o04, o05, o07, o08, o10, o11, o17, o18, o25, o26):** not decided yet; leave them OPEN. Don't ask.
- **Reviews:** one Codex review per run, correctness against the spec only, style skipped; one fix pass; a second review only for blockers (D-100).
- **Small things you can't fix in one try:** list them in the report and move on; don't loop.
