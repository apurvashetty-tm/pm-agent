# Brief — rails: token linter, edit hook, commit gate, run chain (D-100)

Owner: main Claude thread · Runner: Claude Code (terminal) · 2026-11-09 · **Time-box: 40 minutes.**
Folder: `~/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype` (project branch).
Why: `workflows/core/build-with-agents.md` (central playbook, shared branch) and decision log D-100.
This is set-up, not a build: no app or screen changes. Commit after each part with `scripts/publish.sh`.
On this Mac: `CHROME=` / `CHROMIUM=`, `< /dev/null` on `codex exec`, `git -C`, wait-and-retry on `.lock`.

## 1 · Token linter (rules that can't have exceptions → a tool, not a prompt)

1. `design-system/tools/package.json` with `stylelint` and `stylelint-declaration-strict-value`; `npm install` there;
   `design-system/tools/node_modules/` git-ignored.
2. `design-system/stylelint.config.mjs`: values must be a `var(--tm-*)` token (or allowed keyword) for colour,
   background, border colour / width / radius, box-shadow, fill, stroke, width / height / min / max, margin, padding,
   gap, inset / top / right / bottom / left, font-size, line-height, letter-spacing, z-index, opacity, transition and
   animation durations. Allowed: `0`, `auto`, `none`, `inherit`, `currentColor`, `transparent`, `100%`, layout
   keywords, `calc()` built only from tokens.
3. `design-system/scripts/check_tokens.py [files…]`: runs stylelint over `design-system/src/components.css` and
   `projects/*/app/screens/*.css` (or the files given), drops findings on lines carrying `/* raw-ok: <reason> */`, prints
   file:line:value, exits 1 on any finding. Must pass the Codex contract in `tests/codex/tokens/` for this script.
4. **Fixtures prove it** (`design-system/tools/fixtures/`): must fail — `margin: 13px`, `color: #fff`, `z-index: 5`,
   `transition: 150ms`, `width: calc(20px - var(--tm-space-sm))`; must pass — `margin: var(--tm-space-sm)`,
   `width: 100%`, `display: flex`, `margin: calc(-1 * var(--tm-space-page))`, a `raw-ok` line.
   Today's codebase **will** fail (the token pass fixes it next): record the count, don't fix here.

## 2 · After-edit hook (instant feedback to whoever edits)

`.claude/settings.json` + `.claude/hooks/lint-css.sh`: a `PostToolUse` hook on `Edit|Write|MultiEdit`. If the edited
file is a `.css` under `design-system/src/` or `projects/*/app/`, run `check_tokens.py <that file>`; on findings print
them to stderr and exit 2 (Claude sees them and fixes now). Anything else: exit 0 fast. Lint only the edited file, never
the whole tree (several tabs share this folder).
**Prove it fires** where Apurva starts sessions: launch `claude -p` from the project folder **and** from the worktree
root, ask it to add `margin: 13px` to a temp CSS file under `app/screens/`, confirm the hook message reaches it; delete
the temp file. Put the settings where it actually fires (both places if needed); note which in REPORT.

## 3 · Commit gate (covers every tool, Codex included)

In `scripts/git-hooks/pre-commit` (repo-wide; active in Apurva's checkout via `core.hooksPath`): for staged `.css`
files under `design-system/src/` or `projects/*/app/`, run `check_tokens.py` on them; refuse the commit on findings with
a one-line fix hint. If `design-system/tools/node_modules` is missing, print a warning and allow (collaborators). Keep the
existing checks unchanged. Prove it: stage a temp CSS with a raw value, run the hook script directly, see the refusal,
unstage and delete. **Do not make a real commit with the raw value.**

## 4 · Run chain (unattended builds, one fresh session per brief)

`scripts/run-chain.sh` (project `scripts/`), started by Apurva once in a plain terminal tab:
- Re-runs itself under `caffeinate -i` (Mac stays awake while it runs; it must be plugged in, lid open).
- Reads `docs/runs/QUEUE.md`; takes the first unchecked line (`- [ ] <prompt>`). Stops if `docs/runs/HOLD` exists.
- Runs that prompt in a **fresh headless Claude session** from the project folder, with a turn cap (`--max-turns 400`)
  and a permission set that lets it work unattended **without** `--dangerously-skip-permissions`: check this CLI's
  `claude --help` for `--permission-mode` values; use auto mode if available, else `acceptEdits` with an
  `--allowedTools` list covering Read / Edit / Write / Glob / Grep and Bash for node, npm, npx, python3, sh, bash,
  codex exec, git -C, scripts/*.sh. Log to `docs/runs/logs/<n>-<slug>.log` (git-ignored).
- After it exits: success = a new `DONE …` line in `docs/runs/STATUS.md` **and** the branch is pushed (nothing ahead of
  GitHub). Then tick the queue line, publish `QUEUE.md` + `STATUS.md`, macOS notification, next line.
  Otherwise: append `STOPPED by runner: <reason>` to STATUS, publish, notification, exit.
- Prints one line per step to the terminal (what's running, since when).

`docs/runs/QUEUE.md` (in this order):
```
- [ ] Run docs/renders/2026-11-09-token-pass/TERMINAL-BRIEF.md
- [ ] Run docs/renders/2026-11-09-build-fast/TERMINAL-BRIEF.md (next run not marked done: A1)
- [ ] Run docs/renders/2026-11-09-build-fast/TERMINAL-BRIEF.md (next run not marked done: A2)
- [ ] Run docs/renders/2026-11-09-build-fast/TERMINAL-BRIEF.md (next run not marked done: B)
```
`docs/runs/STATUS.md` (header + log lines), `docs/runs/RULINGS.md` (header: "Main-thread rulings. Every run reads this
first; rulings override briefs."), `docs/runs/README.md` (5 lines: what the files are; to pause, create `HOLD`).

**Dry run:** put a one-line test prompt first in a temp queue (`docs/runs/QUEUE-dry.md`, script option `--queue`):
"Append `DONE dry-run` to docs/runs/STATUS.md and publish it with scripts/publish.sh." Run the chain on it: it must run
headless, publish, tick, notify and stop cleanly. Also test `HOLD`. Remove the dry-run line from STATUS afterwards.

## 5 · Project rules file

Add a short **"Way of working (D-100)"** section near the top of the project `CLAUDE.md`: point to
`../../workflows/core/build-with-agents.md`; the check commands (`check_tokens.py`, `node tests/run-checks.mjs`,
`run-checks.sh`); small job vs big job; runs end with `DONE` / `STOPPED` in `docs/runs/STATUS.md`. Under 15 lines.

## 6 · Report and stop

`REPORT.md` here, half a page: what's installed, where the hook fires, gate proof, dry-run result, current token-lint
count, anything not done. Append `DONE rails` to `docs/runs/STATUS.md`. Publish. Then print exactly:
`Rails ready. In a plain terminal tab run: cd <project folder> && scripts/run-chain.sh`
