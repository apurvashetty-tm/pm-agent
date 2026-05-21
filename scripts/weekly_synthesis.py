#!/usr/bin/env python3
"""
Weekly Self-Learning Synthesis for PM Agent

Analyzes past 7 days of repo changes, extracts learnings,
refines changelogs intelligently (no duplicates, clarify ambiguous learnings).
"""

import subprocess
import json
import os
from datetime import datetime, timedelta
from pathlib import Path

# Configuration
REPO_PATH = os.path.expanduser("~/pm-agent")
CHANGELOGS_DIR = f"{REPO_PATH}/changelogs"

def get_git_diffs(days=7):
    """Get actual changes from past N days"""
    os.chdir(REPO_PATH)
    since = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    result = subprocess.run(
        ["git", "diff", f"--since={since}", "HEAD"],
        capture_output=True, text=True
    )
    return result.stdout

def call_claude_api(diffs_text):
    """Call Claude API to synthesize learnings from diffs"""
    import anthropic
    
    client = anthropic.Anthropic()
    
    prompt = f"""You are analyzing PM Agent usage patterns from git diffs.

Extract learnings from these changes that are:
1. Genuinely new (not obvious/common knowledge)
2. Derived from user corrections shown in diffs
3. Specific and actionable for future PRD/experiment work

For each potential learning:
- Check if similar wording exists in changelogs already
- If similar exists: Did user violate it in these diffs? If yes, suggest clearer wording
- If new: Include it as a new learning

Return ONLY valid JSON (no markdown, no explanation):

{{
  "new_learnings": [
    {{"workflow": "create-prd", "learning": "specific learning", "date": "{datetime.now().strftime('%Y-%m-%d')}"}}
  ],
  "clarifications": [
    {{"workflow": "review-prd", "old_text": "...", "new_text": "...", "reason": "was violated, needs clarity"}}
  ],
  "skip": false
}}

If no new learnings AND no needed clarifications, set "skip": true.

GIT DIFFS (past 7 days):
{diffs_text[:4000]}
"""
    
    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}]
    )
    
    try:
        return json.loads(message.content[0].text)
    except Exception as e:
        print(f"Failed to parse Claude response: {e}")
        return {"skip": True, "error": str(e)}

def append_to_changelog(workflow, learning, date):
    """Append learning to changelog"""
    changelog_path = f"{CHANGELOGS_DIR}/{workflow}_changelog.md"
    
    if not os.path.exists(changelog_path):
        return False
    
    entry = f"\n## {date}\n- {learning}\n"
    
    with open(changelog_path, 'a') as f:
        f.write(entry)
    
    return True

def clarify_in_changelog(workflow, old_text, new_text):
    """Refine unclear wording in changelog"""
    changelog_path = f"{CHANGELOGS_DIR}/{workflow}_changelog.md"
    
    if not os.path.exists(changelog_path):
        return False
    
    with open(changelog_path, 'r') as f:
        content = f.read()
    
    if old_text in content:
        content = content.replace(old_text, new_text)
        with open(changelog_path, 'w') as f:
            f.write(content)
        return True
    
    return False

def commit_to_github(msg):
    """Commit and push to GitHub"""
    os.chdir(REPO_PATH)
    subprocess.run(["git", "add", "changelogs/"], check=False)
    subprocess.run(["git", "commit", "-m", msg], check=False)
    subprocess.run(["git", "push"], check=False)

def main():
    print("🤖 PM Agent Weekly Synthesis Starting...")
    
    diffs = get_git_diffs(days=7)
    
    if not diffs.strip():
        print("✓ No changes in past 7 days. Exiting.")
        return
    
    print("📊 Analyzing diffs...")
    result = call_claude_api(diffs)
    
    if result.get("skip"):
        print("✓ No new learnings to add. Changelogs remain unchanged.")
        return
    
    updates_made = 0
    
    # Add new learnings
    for learning in result.get("new_learnings", []):
        if append_to_changelog(learning["workflow"], learning["learning"], learning["date"]):
            print(f"✓ Added learning to {learning['workflow']}_changelog.md")
            updates_made += 1
    
    # Clarify ambiguous learnings
    for clarification in result.get("clarifications", []):
        if clarify_in_changelog(clarification["workflow"], clarification["old_text"], clarification["new_text"]):
            print(f"✓ Clarified learning in {clarification['workflow']}_changelog.md")
            updates_made += 1
    
    if updates_made > 0:
        learnings_count = len(result.get("new_learnings", []))
        clarifications_count = len(result.get("clarifications", []))
        msg = f"Weekly synthesis: +{learnings_count} learnings, ~{clarifications_count} clarifications"
        
        print(f"📝 Committing {updates_made} changes to GitHub...")
        commit_to_github(msg)
        print(f"✅ Done! Commit: {msg}")
    else:
        print("✓ No updates needed.")

if __name__ == "__main__":
    main()
