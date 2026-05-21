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

**Execution:** See scripts/weekly_synthesis.py
