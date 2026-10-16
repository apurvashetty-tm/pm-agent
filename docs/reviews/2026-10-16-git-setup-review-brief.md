# pm-agent git setup — review brief (2026-10-16)

**For the reviewer.** You are reviewing how a product manager's GitHub repo is organised for work done mostly by AI assistants. Below: the setup, what went wrong on 2026-10-16, the root causes, what was considered, and the fix now waiting in pull request #9. Please (1) say whether the fix addresses each root cause, (2) point out gaps or risks we haven't listed, (3) say if anything is over-engineered for one PM plus one collaborator. If you can read the repo, the changes are on branch `shared/git-branch-model` (PR #9): `scripts/workspace.sh`, `scripts/lib-worktree.sh`, `scripts/publish.sh`, `scripts/git-hooks/pre-commit`, `AGENTS.md` → "Git safety", `docs/TEAM_GIT_WORKFLOW.md`. **Review only — don't commit, push or change anything.**

---

## 1. The setup

- **Repo:** `apurvashetty-tm/pm-agent` (private). One repo for everything: ~9 of Apurva's projects in `projects/<name>/` (PRDs, docs, and two HTML prototypes), plus shared folders: `design-system/` (CSS used by the prototypes), `knowledge/` (company knowledge incl. tm-chotu, learnings, memory export), `templates/`, `workflows/`, `scripts/`, and root rules files (`AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`).
- **People:** Apurva (owner/admin). Swapnil (his report, write access) has two projects on his own branches and works by pull request.
- **How work happens:** almost entirely through AI assistants:
  - several Claude threads at once (Claude desktop app "Cowork"), each running git through a bridge into the same folder on Apurva's Mac (`/Users/mac/src/pm-agent`), seen inside each thread's sandbox under a *different* absolute path (`/sessions/<session-id>/mnt/pm-agent`);
  - Codex / a terminal on the same folder;
  - two weekly scheduled AI tasks (memory export, "self-learning synthesis") that commit and push.
- **Pushing:** HTTPS with a repo-local credential helper. `main` has GitHub branch protection ("changes through a pull request"); Apurva is admin, so his pushes can bypass it (GitHub prints a warning).
- **Live sites (Netlify):** doctor-portal prototype deploys from `main` (root `netlify.toml`); Price Lock prototype deployed from its own branch `price-lock-proto` (its own root `netlify.toml`).

## 2. What went wrong (incidents)

| # | What happened | Effect |
|---|---|---|
| 1 | A thread committing ACOM work used broad staging and swept doctor-portal files (another thread's uncommitted work) into the commit. | Mixed-project commit; had to be split by hand. |
| 2 | A thread working on the doctor portal was on another project's branch and read July copies of the doctor-portal files (handoff "last updated 13 July", no screens). | Wrong picture of the project; it nearly built on stale files. |
| 3 | All threads shared one working folder; switching branches in it changed the files under every other thread. | Same as 1 and 2; unpredictable state. |
| 4 | Repeated stale `.git/*.lock` files (`HEAD.lock`, `index.lock`). | The next git command — any thread's — failed with "File exists". |
| 5 | Pushing from a temporary worktree failed. | Credential helper resolved its file via `--absolute-git-dir`, which is per-worktree. |
| 6 | Project branches lived for months without merging: ACOM 46 and Price Lock 64 commits behind `main`. | Every branch carried a stale copy of every other project (cause of #2). |
| 7 | Weekly scheduled tasks pushed to "whatever branch is checked out"; the synthesis script hard-coded `git push origin main`; an old helper `commit-and-push.sh` did `git add -A` + `git push`. | Memory exports landed on the doctor-portal branch; risk of sweeping commits. |
| 8 | Direct pushes to `main` bypassing review (owner bypass), including several by Claude during the clean-up. | `main` wasn't "approved only". |
| 9 | Netlify: two root `netlify.toml` files on different branches would collide on merge; every push to `main` (even ACOM docs) rebuilt the doctor-portal site. | Merge trap; noisy deploys. |
| 10 | Uncommitted work from August (CEO discussions, ValueMeds, post-order AOP, Roadmap README) sat only on the Mac. | Not backed up; invisible to other threads. |

## 3. Root causes

1. **One shared working folder** for many concurrent threads, with branch switching in it.
2. **Long-lived project branches that never merged back**, so each carried stale copies of everything else.
3. **Nothing enforced "one project per commit"** — only written rules, which sessions didn't always read.
4. **Sandboxed sessions without delete permission** can't let git remove its own lock files.
5. **Automation (scripts, scheduled tasks) bypassed the rules** — pushing to `main` or the current branch, staging everything.
6. **Absolute paths** in git's worktree links and the credential helper, while every session sees the folder under a different path.

## 4. Options considered

| Option | Outcome |
|---|---|
| Delete other projects' folders from each project branch | Rejected — merging that branch would delete those projects from `main`. |
| Rewrite history to strip projects from branches | Rejected — breaks every clone and open PR. |
| Split into one repo per prototype + design-system repo | Rejected after discussion — migration cost, Netlify re-linking, shared design system and knowledge harder to keep in step. |
| One `main`, no project branches, Apurva's threads push straight to `main` | Built, then reverted the same day — Apurva's requirement is that `main` holds only approved work. |
| **`main` approved-only; one project, one branch, each in its own folder; scripts + a commit check enforce it** | **Chosen — PR #9.** |

## 5. The fix (PR #9, after review with Codex)

**Model:** `main` holds only approved work (pull requests only; normal merge commits; merged only when Apurva says so). One project, one branch (`project/<folder>`), alive while the project is active, each in its own folder `.work/<folder>/`; retired (folder, local and GitHub branch) by `workspace.sh close` once everything is merged. Shared changes for a project travel with it; standalone ones use `shared/<topic>`. Swapnil's branches are excluded everywhere.

**Enforced by code (scripts and local checks in Apurva's checkout)**
- `scripts/workspace.sh` (`start-project.sh`): validated names; refuses Swapnil's branches; reopening checks the folder is on the right branch, syncs with GitHub (fast-forward only), then merges `main`; leaves a folder with uncommitted work untouched; `close` stops if anything is unmerged, unpushed, or would be lost (untracked/ignored files except `.DS_Store`), then removes folder, local branch and GitHub branch.
- `scripts/publish.sh`: commits only named files; on a refused commit keeps the work staged and says how to unstage; syncs with the GitHub branch before merging `main`; **final content check** of everything the branch would bring into `main` (catches fast-forwards, which skip hooks); reports not-committed / committed-not-pushed / pushed; never pushes `main`.
- `scripts/git-hooks/pre-commit` + **`pre-merge-commit`** (automatic merges skip `pre-commit`): refuse `main`, detached HEAD, Swapnil's branches, cross-project changes; a merge may only bring in what's in `main`. NUL-safe file-name handling.
- `scripts/lib-worktree.sh`: relative, locked folder links; the session-specific reverse record is only rewritten at close.
- Weekly runner (`run-synthesis.js`) refuses to run outside `shared/weekly-auto` and exits non-zero if publishing fails; the Python runner is retired.

**Enforced by local configuration:** `core.hooksPath`, the credential helper (`--git-common-dir`).

**Enforced by GitHub:** pull request required for `main`; with "do not allow bypassing" switched on, also for the admin login (pending — after checking that no required-approval rule would block the owner's own merges).

**Instruction only (behavioural):** merge only when Apurva says so; always use the scripts; one git command at a time per folder; request delete permission first in Cowork; one writer per file.

**External configuration:** the two scheduled tasks (run in `.work/shared-weekly-auto`, publish for approval); Netlify (`ignore` rule; Price Lock re-link pending).

**Tested (34/34, throwaway repo with its own fake GitHub):** commit on `main` refused · bad names refused · Swapnil's branch refused by open, publish and hook · new project scaffolded with a relative, locked link · own-project publish pushed · cross-project publish refused with work kept staged · cross-project rename refused · newline file names handled · detached HEAD refused · automatic merge of `main` allowed · automatic merge of another project's branch refused · fast-forward bypass stopped by the publish content check · folder on the wrong branch refused · runner outside `shared/weekly-auto` stops · shared branch can't change a project · close stops on unmerged work, on untracked/ignored files (lists them, skips `.DS_Store`, removes nothing) and on GitHub-branch commits not in `main` · close of merged work retires folder, local and GitHub branch · reopening starts fresh from `main` · close works when the GitHub branch is already gone. **Still to validate:** git inside a `.work/` folder from a second real environment (Apurva's Mac terminal).

## 6. Clean-up already done (2026-10-16)

- Every branch backed up as tags (`backup/2026-10-16/*`, `backup/pre-trunk/*`).
- ACOM and Price Lock work merged into `main` (each project folder verified identical to its branch); old branches deleted (all Apurva's).
- Swapnil's two branches had a catch-up merge pushed by mistake, then were restored exactly to their earlier commits (verified he hadn't pushed in between).
- August uncommitted projects committed one project per commit (checked for secrets and size); "discussions with the CEO" decks moved into `ceo-discussions/`.
- Stale worktrees and lock files cleared; tm-chotu knowledge package updated v0.1.20 → v0.4.3 (PR #10, merged).
- The last direct pushes to `main` happened during this clean-up; PR #9 ends them.

## 7. Known limits (after review)

1. Local checks live in Apurva's checkout only; raw git commands (`--no-verify`, manual fast-forwards, pushing by hand) can skip them. Mitigation: GitHub protection on `main`; scripts required by instruction.
2. GitHub can't tell Apurva's approval from an AI merging with his login — "merge only on his say-so" is an instruction.
3. Opening pull requests needs a GitHub tool (Claude threads have one); terminal sessions get the link.
4. Weekly jobs: after a `shared/weekly-auto` pull request is merged, the next week's push needs a new pull request.
5. Unattended runs may not get delete permission; they then stop on a lock file instead of working around it.
6. Two threads must not run git in the same project folder at the same time (instruction). Reading in parallel is fine.
7. Two branches changing the same shared file conflict at the second merge; `publish.sh` stops and a human decides.
8. Netlify's `ignore` rule relies on `$CACHED_COMMIT_REF`; first builds always run.
