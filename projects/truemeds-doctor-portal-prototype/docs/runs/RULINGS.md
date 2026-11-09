# Main-thread rulings

Every run reads this first. Rulings override briefs where they conflict. Newest at the top.

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
