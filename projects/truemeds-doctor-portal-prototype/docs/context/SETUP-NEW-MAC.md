# Setting up pm-agent on a new Mac / new user (written 2026-11-11, before the JumpCloud reinstall)

**What is safe already (nothing to do):**
- **All work is on GitHub** (`apurvashetty-tm/pm-agent`). Every local branch was pushed and none was ahead of GitHub on 2026-11-11 18:45. That covers `main`, `project/truemeds-doctor-portal-prototype`, `deliver/…`, and the `shared/…` branches, including PR #41.
- **Claude chats, memory and scheduled tasks** live in your Claude account, not on the laptop.
- **The live sites** are on Netlify.

**What lived only on the laptop:** `pm-agent-local-backup-2026-11-11.zip`, which Apurva uploads to Google Drive. It holds:
- `projects/doctor-agreement-acceptance/` (never committed to any branch)
- `Claude outputs/truemeds-doctor-app-handoff-signin-pilot.zip`
- the git-ignored Claude settings (`.claude/settings.local.json`, the project's `.claude/`)
- the run logs (`docs/runs/logs/`)
- the fresh-AI kit test rounds

It contains **no passwords or tokens**. Those are set up again by signing in.

## Reinstall, in order
1. **Apps:** Google Chrome; Claude desktop app (sign in); Netlify needs nothing local.
2. **Command-line tools:**
   - Xcode command-line tools: `xcode-select --install`
   - Homebrew
   - `brew install git node python@3.12 gh`
3. **GitHub sign-in:** `gh auth login` (HTTPS), then `gh auth setup-git`. This replaces the old repo-local credential helper. Don't paste tokens into chats.
4. **Get the repo:**
   - `git clone https://github.com/apurvashetty-tm/pm-agent.git ~/pm-agent`
   - then `cd ~/pm-agent && git worktree add .work/truemeds-doctor-portal-prototype project/truemeds-doctor-portal-prototype`
5. **Agents:**
   - Claude Code CLI: `npm install -g @anthropic-ai/claude-code`, then `claude` to sign in.
   - Codex CLI: `npm install -g @openai/codex`, then `codex` to sign in.
6. **Project dependencies:**
   - `cd ~/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype/tests && npm install`
   - `npx playwright install chromium`
   - `npm install --prefix ~/pm-agent/.work/truemeds-doctor-portal-prototype/design-system/tools` (token lint)
7. **Restore from the backup zip:** unzip it at `~/pm-agent`. It keeps the same folder layout.
8. **Claude desktop app:**
   - Connect the folder `~/pm-agent` so the main chat can reach it.
   - Re-allow file deletion when asked.
   - Install the Claude in Chrome extension again if needed.
9. **Check:**
   - `cd ~/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype && node tests/entry-journeys.mjs` (61/61)
   - `bash scripts/serve.sh` (opens the prototype locally)
10. **Runner:** `bash scripts/run-chain.sh --watch`. The queue and rulings are in git, so it continues where it was.

## Where the doctor-portal work stands (2026-11-11)
- **Built and reviewed:** D-106–D-109 (r2-build).
- **Waiting on Apurva:**
  - OK to merge PR #41 (shared design rules);
  - the r3 audit's 8 questions;
  - the phone check;
  - then the fix run, then the release PR `[deploy]` (the last of the two deploys).
