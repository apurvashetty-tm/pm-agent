#!/bin/bash
# Open (or create) the working folder for a project or a shared change. Prints the folder path.
#   scripts/workspace.sh project <folder-name>   -> branch project/<folder-name>, folder .work/<folder-name>
#   scripts/workspace.sh shared <topic>          -> branch shared/<topic>,         folder .work/shared-<topic>
#   scripts/workspace.sh close project|shared <name>  -> remove the folder (only if it has no uncommitted or unpushed work)
# A new project (no projects/<folder-name> yet) is created from templates/project-scaffold.
set -euo pipefail
source "$(dirname "$0")/lib-worktree.sh"
close=0; [ "${1:-}" = close ] && { close=1; shift; }
kind="${1:-}"; name="${2:-}"
[[ "$kind" =~ ^(project|shared)$ && "$name" =~ ^[A-Za-z0-9._-]+$ ]] || { echo "usage: scripts/workspace.sh project|shared <name>  (letters, digits, . _ - only)"; exit 2; }
root="$(cd "$(git rev-parse --path-format=absolute --git-common-dir)/.." && pwd)"
cd "$root"
for l in .git/*.lock; do [ -e "$l" ] && { echo "Stop: git lock file $l exists. See AGENTS.md -> Git (delete permission)."; exit 1; }; done
if [ "$kind" = project ]; then branch="project/$name"; wt=".work/$name"; else branch="shared/$name"; wt=".work/shared-$name"; fi
if [ $close -eq 1 ]; then
  [ -e "$wt/.git" ] || { echo "Nothing to close: $wt doesn't exist."; exit 0; }
  fix_worktree_links "$root/$wt"
  [ -z "$(git -C "$wt" status --porcelain)" ] || { echo "Stop: $wt has uncommitted changes."; exit 1; }
  git fetch -q origin
  [ -z "$(git -C "$wt" log --oneline "origin/$branch..HEAD" 2>/dev/null)" ] || { echo "Stop: $wt has commits not pushed to GitHub."; exit 1; }
  rm -f "$(git -C "$wt" rev-parse --absolute-git-dir)/locked"
  git worktree remove "$wt" && git branch -q -D "$branch" 2>/dev/null; echo "Closed $wt (branch $branch stays on GitHub)."; exit 0
fi
if [ -e "$wt/.git" ]; then fix_worktree_links "$root/$wt"; echo "$root/$wt"; exit 0; fi
git fetch -q origin
if git show-ref -q --verify "refs/remotes/origin/$branch"; then
  git show-ref -q --verify "refs/heads/$branch" || git branch -q --track "$branch" "origin/$branch"
  git worktree add -q "$wt" "$branch"
  fix_worktree_links "$root/$wt"
  ( cd "$wt" && git merge -q --no-edit origin/main ) || { echo "Stop: $branch can't take the latest main automatically (conflict). Tell Apurva."; exit 1; }
else
  git worktree add -q --no-track -b "$branch" "$wt" origin/main
  fix_worktree_links "$root/$wt"
  if [ "$kind" = project ] && [ ! -d "$wt/projects/$name" ]; then
    mkdir -p "$wt/projects/$name" && cp -R templates/project-scaffold/. "$wt/projects/$name/"
    ( cd "$wt" && git add "projects/$name" && git commit -q -m "$name: new project from templates/project-scaffold" )
  fi
  ( cd "$wt" && git push -q -u origin "$branch" )
fi
fix_worktree_links "$root/$wt"
echo "$root/$wt"
