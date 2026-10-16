#!/bin/bash
# Publish named files from a working folder (.work/...) to its branch on GitHub, ready for a pull request.
#   scripts/publish.sh -m "Commit message" path [path ...]
# Never commits to main: main changes only through a pull request Apurva approves.
set -euo pipefail
msg=""; paths=()
while [ $# -gt 0 ]; do case "$1" in -m) msg="$2"; shift 2;; *) paths+=("$1"); shift;; esac; done
[ -n "$msg" ] && [ ${#paths[@]} -gt 0 ] || { echo 'usage: scripts/publish.sh -m "message" path [path ...]'; exit 2; }
cd "$(git rev-parse --show-toplevel)"
common="$(git rev-parse --path-format=absolute --git-common-dir)"
for l in "$common"/*.lock "$(git rev-parse --absolute-git-dir)"/*.lock; do [ -e "$l" ] && { echo "Stop: git lock file $l exists. See AGENTS.md -> Git (delete permission)."; exit 1; }; done
branch=$(git branch --show-current)
[ -n "$branch" ] && [ "$branch" != main ] || { echo "Stop: you're on '${branch:-no branch}'. Work in your project's folder: scripts/start-project.sh <project>."; exit 1; }
already=$(git diff --cached --name-only)
[ -z "$already" ] || { echo "Stop: files already staged by someone else:"; echo "$already"; exit 1; }
git add -- "${paths[@]}"
if [ -n "$(git diff --cached --name-only)" ]; then
  echo "Committing:"; git diff --cached --name-only | sed 's/^/  /'
  git commit -q -m "$msg"          # the commit check runs here
else
  echo "No changes in the named files."
fi
git fetch -q origin
git merge -q --no-edit origin/main || { git merge --abort; echo "Stop: latest main conflicts with this branch. Tell Apurva; nothing was pushed."; exit 1; }
git push -q -u origin "HEAD:refs/heads/$branch"
git -C "$common/.." merge -q --ff-only origin/main 2>/dev/null || true   # keep the main folder current
echo "Pushed to $branch."
echo "Pull request: https://github.com/apurvashetty-tm/pm-agent/compare/main...$branch?expand=1"
echo "(If a pull request for this branch is already open, it has updated itself.)"
