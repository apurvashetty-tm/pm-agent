#!/bin/bash
# Open (or create) the working folder for a project or a shared change. Prints the folder path.
#   scripts/workspace.sh project <folder-name>   -> branch project/<folder-name>, folder .work/<folder-name>
#   scripts/workspace.sh shared <topic>          -> branch shared/<topic>,         folder .work/shared-<topic>
# A new project (no projects/<folder-name> yet) is created from templates/project-scaffold.
set -euo pipefail
kind="${1:-}"; name="${2:-}"
[[ "$kind" =~ ^(project|shared)$ && "$name" =~ ^[A-Za-z0-9._-]+$ ]] || { echo "usage: scripts/workspace.sh project|shared <name>  (letters, digits, . _ - only)"; exit 2; }
root="$(cd "$(git rev-parse --path-format=absolute --git-common-dir)/.." && pwd)"
cd "$root"
for l in .git/*.lock; do [ -e "$l" ] && { echo "Stop: git lock file $l exists. See AGENTS.md -> Git (delete permission)."; exit 1; }; done
if [ "$kind" = project ]; then branch="project/$name"; wt=".work/$name"; else branch="shared/$name"; wt=".work/shared-$name"; fi
if [ -e "$wt/.git" ]; then echo "$root/$wt"; exit 0; fi
git fetch -q origin
if git show-ref -q --verify "refs/remotes/origin/$branch"; then
  git show-ref -q --verify "refs/heads/$branch" || git branch -q --track "$branch" "origin/$branch"
  git worktree add -q "$wt" "$branch"
  ( cd "$wt" && git merge -q --no-edit origin/main ) || { echo "Stop: $branch can't take the latest main automatically (conflict). Tell Apurva."; exit 1; }
else
  git worktree add -q --no-track -b "$branch" "$wt" origin/main
  if [ "$kind" = project ] && [ ! -d "$wt/projects/$name" ]; then
    mkdir -p "$wt/projects/$name" && cp -R templates/project-scaffold/. "$wt/projects/$name/"
    ( cd "$wt" && git add "projects/$name" && git commit -q -m "$name: new project from templates/project-scaffold" )
  fi
  ( cd "$wt" && git push -q -u origin "$branch" )
fi
echo "$root/$wt"
