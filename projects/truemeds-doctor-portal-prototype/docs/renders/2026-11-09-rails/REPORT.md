# Rails run — report (D-100) · 2026-11-09

Unattended run from the chain. RULINGS.md read first and followed: no `run-chain.sh` edit, no dry run, no "Rails ready" print.

## Installed
- **Token linter** — `design-system/tools/package.json` (stylelint 16 + stylelint-declaration-strict-value; `npm install` done; `node_modules/` already ignored by `design-system/.gitignore`). `design-system/stylelint.config.mjs` covers the brief's property list (plus `outline*`, `stroke-width`). Allowed values: `--tm-*` tokens (a `--tm-*` fallback is OK too), `0`, `auto`, `none`, `inherit`, `currentColor`, `transparent`, `100%`, keywords that aren't colour names, and `calc`/`min`/`max`/`clamp` built only from tokens, unitless numbers, `100%` and `env()` safe areas. Colour properties accept tokens and base keywords only.
- `design-system/scripts/check_tokens.py [--scoped] [files…]` prints `file:line: property: value`. Exit codes: 0 clean, 1 findings, 3 linter not installed. It skips: lines with a same-line `/* raw-ok: <non-empty reason> */`, `.tm-otp` blocks after a `[DEPRECATED]` comment, and mock Rx paper blocks. The skip rules match `tests/codex/tokens`.
- **Fixtures** (`design-system/tools/fixtures/`): must-fail gives **9/9** findings (the brief's 5 cases, plus a named colour, opacity, a mixed shorthand and an empty `raw-ok`). must-pass gives **0**. It covers the brief's 5 cases plus a border shorthand, transition, `env()`, a token fallback, a `[DEPRECATED]` `.tm-otp` block and `.mock-rx-paper`.
- **Today's count: 111 findings** in default scope:
  - components.css: 91
  - otp: 9
  - faster-signin-offer: 5
  - returning-unlock: 5
  - sign-in: 1

  This counts declarations, not values. The plugin reports the first raw word in each declaration, so a fixed line can show another raw value. Not fixed here; the token pass fixes them.
- Codex contract `tests/codex/tokens`: "Guard passes repository…" still fails at its first step, because the repo isn't clean until the token pass. The planted `width: 37px` and `opacity: 0.37` are both caught by these rules.

## After-edit hook — NOT live yet (needs Apurva, 2 minutes)
- The script `scripts/claude-hooks/lint-css.sh` is in place:
  - Only `.css` in scope is linted, and only the edited file.
  - Scope: `design-system/src/`, `projects/*/app/` minus `app/shell`, `app/review` and the copy-shared build copies. These are the token-pass brief's file-level exceptions; I read them as overriding "any `projects/*/app/`".
  - On findings it writes them to stderr and exits 2; anything else exits 0.
- Proven by feeding it hook JSON directly: `app/screens/sign-in.css` → exit 2 with the finding; `app/shell/shell.css` and `CLAUDE.md` → exit 0.
- **Blocked:** this session may not write `.claude/` files (sensitive-file guard) and may not launch a nested `claude`. Also, both `.claude/settings*.json` (root `.gitignore`) and the project `.claude/` are git-ignored. So the settings live as a snippet in `scripts/claude-hooks/settings.json`; the same file works in both folders.
- **To finish:**
  1. Copy that file to `.claude/settings.json` in the working-folder root **and** in `projects/truemeds-doctor-portal-prototype/`. If one exists already, merge its `hooks` block.
  2. Prove it from each folder:
     `claude -p "Write app/screens/zz.css containing .zz { margin: 13px; } then quote any hook feedback" --permission-mode acceptEdits`
     From the root, use the path `projects/truemeds-doctor-portal-prototype/app/screens/zz.css`.
  3. Delete `zz.css`.
- Until this is done, the token pass gets its feedback only from the commit gate and `check_tokens.py`.

## Commit gate — proven
- `scripts/git-hooks/check-tokens`, called by `pre-commit` after the existing check (existing checks unchanged).
- It lints the **staged** blob of each staged in-scope `.css`. If `design-system/tools/node_modules` is missing, it warns and allows.
- Proof: staged `app/screens/zz-gate-test.css` (`margin: 13px`) and ran `bash scripts/git-hooks/pre-commit`. Result: exit 1, with `…/zz-gate-test.css:1: margin: 13px` and the fix hint. Then unstaged and deleted the file. No commit was made with it. The three publishes after that passed through the gate normally.
- New scripts are called via `bash` / `python3` (`chmod` was blocked here), so the executable bit doesn't matter.

## Run chain — checked, not dry-run (chain is running; ruling)
- **Bug:** the `DONE` count is `grep -c 'DONE' … || echo 0`.
  - It counts the STATUS header line (it contains `` `DONE <name>` ``) and the runner's own `STOPPED … DONE added: no` text.
  - On zero matches it outputs `0\n0`, which breaks the `-gt` test.
- **Fix:** written to `scripts/run-chain.next.sh`. It counts only lines that start with `DONE ` (a list bullet or backtick prefix is allowed). Nothing else changed; `bash -n` OK. The main thread swaps it in.
- **Environment note for the next runs** (auto mode as seen by this run):
  - Bash `cd`, `ls` and `<` redirection outside the project folder are refused. Use `../../…` paths with a single command, or `git -C`.
  - `chmod` and nested `claude` are refused.
  - `.claude/` writes are refused.
  - `scripts/publish.sh` takes **repo-root-relative** paths (it `cd`s to the top level); run it as `../../scripts/publish.sh` from the project folder.

## Other
- Project `CLAUDE.md`: "Way of working (D-100)" section added near the top (11 lines).
- `workflows/core/build-with-agents.md` isn't on this branch (shared branch), so the link points to where it will be.
- Not done: the `session_handoff.md` update. Sub-runs leave `docs/context/` to the main thread, as in the token-pass brief.
