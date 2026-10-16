#!/usr/bin/env bash
# Open, create or close the working folder for a project or a shared change.
#   scripts/workspace.sh project <folder-name>          -> branch project/<folder-name>, folder .work/<folder-name>
#   scripts/workspace.sh shared <topic>                 -> branch shared/<topic>,        folder .work/shared-<topic>
#   scripts/workspace.sh close project|shared <name>    -> retire it: only when everything is merged into main;
#                                                          removes the folder, the local branch and the GitHub branch
# Prints the folder path as the last line when opening.
set -uo pipefail
source "$(dirname "$0")/lib-worktree.sh"
close=0; [ "${1:-}" = close ] && { close=1; shift; }
kind="${1:-}"; name="${2:-}"
[[ "$kind" =~ ^(project|shared)$ ]] && valid_name "$name" || { echo "usage: scripts/workspace.sh [close] project|shared <name>  (starts with a letter or digit; then letters, digits, . _ -)"; exit 2; }
root="$(cd "$(git rev-parse --path-format=absolute --git-common-dir)/.." && pwd)"; cd "$root" || exit 1
for l in .git/*.lock; do [ -e "$l" ] && { echo "Stop: git lock file $l exists. See AGENTS.md -> Git (delete permission)."; exit 1; }; done
if [ "$kind" = project ]; then branch="project/$name"; wt=".work/$name"; else branch="shared/$name"; wt=".work/shared-$name"; fi
refuse_collaborator_branch "$branch" || exit 1

if [ $close -eq 1 ]; then
  [ -e "$wt/.git" ] || { echo "Nothing to close: $wt doesn't exist."; exit 0; }
  fix_worktree_links "$root/$wt" || exit 1
  [ "$(git -C "$wt" branch --show-current)" = "$branch" ] || { echo "Stop: $wt is not on $branch."; exit 1; }
  git -C "$wt" status --porcelain >/dev/null || { echo "Stop: couldn't read $wt status."; exit 1; }
  left=$(git -C "$wt" status --porcelain --ignored --untracked-files=all -z | tr '\0' '\n' | grep -v -E '(^| |/)\.DS_Store$' | grep . || true)
  [ -z "$left" ] || { echo "Stop: $wt still has files that would be lost (uncommitted, untracked or ignored):"; echo "$left"; exit 1; }
  git fetch -q --prune origin || { echo "Stop: can't reach GitHub."; exit 1; }
  head=$(git -C "$wt" rev-parse HEAD)
  git merge-base --is-ancestor "$head" origin/main || { echo "Stop: $branch has work that isn't merged into main yet. Open/merge its pull request first."; exit 1; }
  if remote=$(git ls-remote --exit-code origin "refs/heads/$branch" | cut -f1); then
    git merge-base --is-ancestor "$remote" origin/main 2>/dev/null || { echo "Stop: $branch on GitHub has commits that aren't in main."; exit 1; }
  fi
  point_worktree_record_here "$root/$wt"
  rm -f "$(git -C "$wt" rev-parse --absolute-git-dir)/locked"
  git worktree remove --force "$wt" || { echo "Stop: git couldn't remove $wt."; exit 1; }   # safe: only .DS_Store can be left (checked above)
  git branch -q -D "$branch" || echo "(Note: local branch $branch was already gone.)"
  if [ -n "${remote:-}" ]; then git push -q origin --delete "$branch" || { echo "Stop: folder removed, but couldn't delete $branch on GitHub."; exit 1; }; fi
  echo "Closed $wt and retired $branch (folder, local branch and GitHub branch). Reopening starts fresh from main."; exit 0
fi

git fetch -q origin || { echo "Stop: can't reach GitHub."; exit 1; }
if [ -e "$wt/.git" ]; then                                   # reopen an existing folder
  fix_worktree_links "$root/$wt" || exit 1
  [ "$(git -C "$wt" branch --show-current)" = "$branch" ] || { echo "Stop: $wt is not on $branch."; exit 1; }
  if [ -n "$(git -C "$wt" status --porcelain)" ]; then
    echo "(Note: $wt has uncommitted changes — someone may be working in it — so it was not updated.)"; echo "$root/$wt"; exit 0
  fi
elif git show-ref -q --verify "refs/remotes/origin/$branch"; then   # branch exists on GitHub: new folder for it
  git show-ref -q --verify "refs/heads/$branch" || git branch -q --no-track "$branch" "origin/$branch"
  git worktree add -q "$wt" "$branch" && fix_worktree_links "$root/$wt" || { echo "Stop: couldn't create $wt."; exit 1; }
else                                                          # brand-new branch from the latest main
  git show-ref -q --verify "refs/heads/$branch" && { echo "Stop: a local branch $branch exists without a folder. Tell Apurva."; exit 1; }
  git worktree add -q --no-track -b "$branch" "$wt" origin/main && fix_worktree_links "$root/$wt" || { echo "Stop: couldn't create $wt."; exit 1; }
  if [ "$kind" = project ] && [ ! -d "$wt/projects/$name" ]; then
    mkdir -p "$wt/projects/$name" && cp -R templates/project-scaffold/. "$wt/projects/$name/"
    ( cd "$wt" && git add "projects/$name" && git commit -q -m "$name: new project from templates/project-scaffold" ) || { echo "Stop: couldn't commit the new project scaffold."; exit 1; }
  fi
  ( cd "$wt" && git push -q -u origin "HEAD:refs/heads/$branch" ) || { echo "Stop: couldn't create $branch on GitHub."; exit 1; }
  echo "$root/$wt"; exit 0
fi
# bring the folder up to date: GitHub branch first (fast-forward only), then main
if git rev-parse -q --verify "refs/remotes/origin/$branch" >/dev/null; then
  if git -C "$wt" merge-base --is-ancestor HEAD "origin/$branch"; then git -C "$wt" merge -q --ff-only "origin/$branch"
  elif ! git -C "$wt" merge-base --is-ancestor "origin/$branch" HEAD; then echo "Stop: $wt and $branch on GitHub have diverged. Tell Apurva."; exit 1; fi
fi
git -C "$wt" merge -q --no-edit origin/main || { git -C "$wt" merge --abort 2>/dev/null; echo "Stop: $branch can't take the latest main automatically. Tell Apurva."; exit 1; }
echo "$root/$wt"
