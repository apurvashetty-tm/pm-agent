# Weekly Self-Learning Synthesis Routine

**Frequency:** Every Sunday 3:00 AM IST

**Function:** Analyze past 7 days of repo changes, extract learnings, refine changelogs.

**Logic:**
1. Parse all git commits from past 7 days (entire repo)
2. For each workflow that changed:
   - Extract corrections/fixes user made
   - Check if learning already exists in changelog
   - If exists: Verify user followed it. If not → Rewrite for clarity
   - If new: Append to changelog
   - If neither: Skip (no update)
3. Commit all updates to GitHub

**Output:** 
- Updated changelog files (append only, never overwrite)
- Git commit with learnings
- Zero involvement from user

**Token Budget:** ~10K per week (under 15% of typical plan)

**Execution:** `node scripts/run-synthesis.js`, run from `.work/shared-weekly-auto` (`scripts/weekly_synthesis.py` is retired).

**Publishing (2026-10-16):** the weekly job runs in `.work/shared-weekly-auto` (branch `shared/weekly-auto`, via `scripts/workspace.sh shared weekly-auto`) and publishes with `scripts/publish.sh`; Apurva approves the pull request. It never pushes to `main`.
