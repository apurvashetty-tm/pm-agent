#!/usr/bin/env bash
# Publish named files from a working folder (.work/...) to its branch on GitHub, ready for a pull request.
#   scripts/publish.sh -m "Commit message" path [path ...]
# Never pushes to main. main changes only through a pull request Apurva merges.
set -uo pipefail
msg=""; paths=()
while [ $# -gt 0 ]; do case "$1" in -m) msg="$2"; shift 2;; *) paths+=("$1"); shift;; esac; done
[ -n "$msg" ] && [ ${#paths[@]} -gt 0 ] || { echo 'usage: scripts/publish.sh -m "message" path [path ...]'; exit 2; }
source "$(dirname "$0")/lib-worktree.sh"
here="$(pwd -P)"; while [ "$here" != / ] && [ ! -e "$here/.git" ]; do here=$(dirname "$here"); done
[ -f "$here/.git" ] && { fix_worktree_links "$here" || exit 1; }
cd "$(git rev-parse --show-toplevel)" || exit 1
common="$(git rev-parse --path-format=absolute --git-common-dir)"
for l in "$common"/*.lock "$(git rev-parse --absolute-git-dir)"/*.lock; do
  [ -e "$l" ] && { echo "Stop (nothing committed): git lock file $l exists. See AGENTS.md -> Git (delete permission)."; exit 1; }
done
branch=$(git branch --show-current)
[ -n "$branch" ] && [ "$branch" != main ] || { echo "Stop (nothing committed): you're on '${branch:-no branch}'. Work in your project's folder: scripts/start-project.sh <project>."; exit 1; }
refuse_collaborator_branch "$branch" || exit 1
already=$(git diff --cached --name-only)
[ -z "$already" ] || { echo "Stop (nothing committed): files already staged by someone else:"; echo "$already"; exit 1; }

# 1. Commit only the named files.
git add -- "${paths[@]}" || { echo "Stop (nothing committed): couldn't stage the named paths."; exit 1; }
if [ -n "$(git diff --cached --name-only)" ]; then
  echo "Committing:"; git diff --cached --name-only | sed 's/^/  /'
  if ! git commit -q -m "$msg"; then
    echo "Stop (NOT committed): the commit check refused (reason above). Your changes are still staged."
    echo "To unstage them: git restore --staged -- ${paths[*]}"
    exit 1
  fi
else
  echo "No changes in the named files."
fi

# 2. Sync with this branch on GitHub first (fast-forward only), then bring in the latest main.
git fetch -q origin || { echo "Stop (committed locally, NOT pushed): can't reach GitHub."; exit 1; }
if git rev-parse -q --verify "refs/remotes/origin/$branch" >/dev/null; then
  if git merge-base --is-ancestor HEAD "origin/$branch"; then
    git merge -q --ff-only "origin/$branch"
  elif ! git merge-base --is-ancestor "origin/$branch" HEAD; then
    echo "Stop (committed locally, NOT pushed): $branch on GitHub has commits this folder doesn't, and vice versa. Tell Apurva; nothing was forced."; exit 1
  fi
fi
if ! git merge -q --no-edit origin/main; then
  git merge --abort 2>/dev/null
  echo "Stop (committed locally, NOT pushed): the latest main conflicts with this branch, or the merge check refused it. Tell Apurva."; exit 1
fi

# 3. Final content check of everything this branch would bring into main (covers fast-forwards, which skip hooks).
if ! reason=$(touched_projects origin/main HEAD | check_scope "$branch"); then
  echo "Stop (committed locally, NOT pushed): this branch would change more than it may — $reason"; exit 1
fi

# 4. Push the branch (never main).
if ! out=$(git push -q -u origin "HEAD:refs/heads/$branch" 2>&1); then
  echo "Stop (committed locally, NOT pushed): $out"; exit 1
fi
mainwt="$common/.."
if [ "$(git -C "$mainwt" branch --show-current)" = main ]; then
  git -C "$mainwt" merge -q --ff-only origin/main 2>/dev/null || echo "(Note: the main pm-agent folder could not be refreshed; it has local changes.)"
else
  echo "(Note: the main pm-agent folder is not on main, so it was not refreshed. Tell Apurva.)"
fi
echo "Pushed to $branch."
echo "Pull request: https://github.com/apurvashetty-tm/pm-agent/compare/main...$branch?expand=1"
echo "(If a pull request for this branch is already open, it has updated itself. Merge only when Apurva says so.)"
