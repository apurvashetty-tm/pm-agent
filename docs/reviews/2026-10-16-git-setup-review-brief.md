# pm-agent git setup — review brief (2026-10-16)

**For the reviewer.** You are reviewing how a product manager's GitHub repo is organised for work done mostly by AI assistants. Below: the setup, what went wrong on 2026-10-16, the root causes, what was considered, and the fix now waiting in pull request #9. Please (1) say whether the fix addresses each root cause, (2) point out gaps or risks we haven't listed, (3) say if anything is over-engineered for one PM plus one collaborator. If you can read the repo, the changes are on branch `shared/git-branch-model` (PR #9): `scripts/workspace.sh`, `scripts/lib-worktree.sh`, `scripts/publish.sh`, `scripts/git-hooks/pre-commit`, `AGENTS.md` → "Git safety", `docs/TEAM_GIT_WORKFLOW.md`. **Review only — don't commit, push or change anything.**

---

## 1. The setup

- **Repo:** `apurvashetty-tm/pm-agent` (private). One repo for everything: ~9 of Apurva's projects in `projects/<name>/` (PRDs, docs, and two HTML prototypes), plus shared folders: `design-system/` (CSS used by the prototypes), `knowledge/` (company knowledge incl. tm-chotu, learnings, memory export), `templates/`, `workflows/`, `scripts/`, and root rules files (`AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`).
- **People:** Apurva (owner/admin). Swapnil (her report, write access) has two projects on his own branches and works by pull request.
- **How work happens:** almost entirely through AI assistants:
  - several Claude threads at once (Claude desktop app "Cowork"), each running git through a bridge into the same folder on Apurva's Mac (`/Users/mac/src/pm-agent`), seen inside each thread's sandbox under a *different* absolute path (`/sessions/<session-id>/mnt/pm-agent`);
  - Codex / a terminal on the same folder;
  - two weekly scheduled AI tasks (memory export, "self-learning synthesis") that commit and push.
- **Pushing:** HTTPS with a repo-local credential helper. `main` has GitHub branch protection ("changes through a pull request"); Apurva is admin, so her pushes can bypass it (GitHub prints a warning).
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

## 5. The fix (PR #9)

**Model**
- `main` holds only approved work: nothing is committed on it; it changes only by merging a pull request Apurva approves (as repo owner she can't formally "approve" her own PRs, so merging = approving). Netlify's doctor-portal site deploys from `main`, so it only shows approved work.
- One project, one branch: `project/<folder-name>`. A branch exists only while the project is active; it's created fresh from `main` and catches up with `main` on every publish, so it can't drift for months.
- One folder per branch: `.work/<folder-name>/` inside the repo (git worktree, git-ignored). Threads for a project work only there. The main folder stays on `main` and is read-only.
- Shared changes made *for* a project go on that project's branch (same PR). Standalone shared changes go on `shared/<topic>` with their own PR.
- Swapnil's branches and PR flow are unchanged and excluded from all of this.

**Enforcement**
- `scripts/start-project.sh <name>` / `scripts/workspace.sh project|shared <name>`: creates or opens the branch and its folder (new projects get the scaffold), catches up with `main`, prints the folder. `workspace.sh close …` removes a folder only if nothing is uncommitted or unpushed.
- `scripts/publish.sh -m "msg" <files>`: refuses on `main`, on files staged by someone else, or on a lock file; commits only the named files; merges the latest `main` into the branch (stops on conflict); pushes the branch; prints the PR link. Never pushes to `main`.
- `scripts/git-hooks/pre-commit` (enabled in Apurva's checkout via `core.hooksPath`; collaborators unaffected): refuses commits on `main`; on `project/<name>` refuses changes to any other project folder; on `shared/*` refuses project-folder changes; allows the commit that completes a merge of `main`.
- `scripts/lib-worktree.sh`: keeps each `.work/` folder's git link **relative**, re-points the repo's record of the folder to the current session's path, and **locks** the folder so another session's `git worktree prune` can't remove it (found and fixed while writing this brief; tested by simulating another session's path).
- Credential helper now resolves via `--git-common-dir` (works from worktrees).
- `commit-and-push.sh` retired. `run-synthesis.js` / `weekly_synthesis.py` publish through `publish.sh`.
- Scheduled tasks rewritten: both work in `.work/shared-weekly-auto` (branch `shared/weekly-auto`), publish for approval, request delete permission first, and stop (never work around) on any "Stop:".
- Rule for every Cowork thread: request delete permission for the pm-agent folder before the first git command (prevents stale locks).
- Netlify: doctor-portal site rebuilds only when `projects/truemeds-doctor-portal-prototype/`, `design-system/` or `netlify.toml` change (`ignore` rule). Price Lock got its own `projects/truemeds-price-lock/netlify.toml`, used once Apurva re-links that site to `main` (base directory = the project folder); then `price-lock-proto` is deleted.

**Tested** (with the new check switched on): commit on `main` refused · cross-project commit on a project branch refused · project change on a `shared/` branch refused · own-project commit allowed · new project scaffolded · existing folder reopened · folder with another session's absolute path repaired by `publish.sh` and pushed · locked folder survives another session's prune · close refuses nothing-to-lose cases correctly and removes the folder · push from a worktree works.

## 6. Clean-up already done (2026-10-16)

- Every branch backed up as tags (`backup/2026-10-16/*`, `backup/pre-trunk/*`).
- ACOM and Price Lock work merged into `main` (each project folder verified identical to its branch); old branches deleted (all Apurva's).
- Swapnil's two branches had a catch-up merge pushed by mistake, then were restored exactly to their earlier commits (verified he hadn't pushed in between).
- August uncommitted projects committed one project per commit (checked for secrets and size); "discussions with the CEO" decks moved into `ceo-discussions/`.
- Stale worktrees and lock files cleared; tm-chotu knowledge package updated v0.1.20 → v0.4.3 (PR #10, merged).
- The last direct pushes to `main` happened during this clean-up; PR #9 ends them.

## 7. Known limits and open risks (please challenge these)

1. **Enforcement is local.** The commit check lives in Apurva's checkout only (`core.hooksPath`); a session with a different clone, or `git commit --no-verify`, bypasses it. GitHub branch protection still blocks non-admin pushes to `main`, but Apurva's admin credential can bypass it.
2. **Opening PRs** needs a GitHub tool (Claude threads have one); a terminal/Codex session only gets the link to open it by hand.
3. **Weekly jobs:** after Apurva merges a `shared/weekly-auto` PR, the next week's push needs a new PR to be opened (GitHub doesn't reopen merged PRs).
4. **Delete permission in unattended runs** may not be granted, so a scheduled run could still leave a lock file; the job then stops and reports instead of working around it.
5. **Two threads on the same project** share one folder; the "one writer per file, re-read before writing" rule is behavioural, not enforced.
6. **Shared files edited on two branches** (e.g. `design-system/`) conflict at the second PR's merge; `publish.sh` stops and a human decides.
7. **Netlify `ignore` rule** relies on `$CACHED_COMMIT_REF`; if wrong, a needed rebuild could be skipped (first builds always run).
8. **Folder locks** mean `.work/` folders must be closed with `workspace.sh close`, not deleted by hand (otherwise a stale lock record remains in `.git/worktrees/`).
9. **Approval = merge** by the owner; there's no second reviewer for her own threads' PRs.
