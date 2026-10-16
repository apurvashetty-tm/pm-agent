#!/bin/bash
# Publish named files to GitHub `main` in one safe step (Apurva's checkout; see AGENTS.md -> Git).
#   scripts/publish.sh -m "Commit message" path [path ...]
# Optional: --pr  pushes to a short-lived branch instead of main, for a pull request.
set -euo pipefail
msg=""; pr=0; paths=()
while [ $# -gt 0 ]; do
  case "$1" in
    -m) msg="$2"; shift 2;;
    --pr) pr=1; shift;;
    *) paths+=("$1"); shift;;
  esac
done
[ -n "$msg" ] && [ ${#paths[@]} -gt 0 ] || { echo "usage: scripts/publish.sh -m \"message\" [--pr] path [path ...]"; exit 2; }
cd "$(git rev-parse --show-toplevel)"
for l in "$(git rev-parse --git-common-dir)"/*.lock; do [ -e "$l" ] && { echo "Stop: git lock file $l exists (another git command running or crashed). Tell Apurva."; exit 1; }; done
branch=$(git branch --show-current)
[ "$branch" = "main" ] || { echo "Stop: this folder is on '$branch'. Work happens on main (AGENTS.md -> Git)."; exit 1; }
already=$(git diff --cached --name-only)
[ -z "$already" ] || { echo "Stop: files are already staged by someone else:"; echo "$already"; echo "Leave them; ask Apurva."; exit 1; }
git fetch -q origin
git merge -q --ff-only origin/main || { echo "Stop: local main and GitHub main have diverged. Tell Apurva; do not force anything."; exit 1; }
git add -- "${paths[@]}"
staged=$(git diff --cached --name-only)
[ -n "$staged" ] || { echo "Nothing to publish: the named files have no changes."; exit 0; }
echo "Publishing:"; echo "$staged" | sed 's/^/  /'
git commit -q -m "$msg"            # the commit check (scripts/git-hooks/pre-commit) runs here
if [ $pr -eq 1 ]; then
  b="publish/$(date +%Y%m%d-%H%M%S)"
  git push -q origin "HEAD:refs/heads/$b"
  git reset -q --soft HEAD~1 && git reset -q   # keep local main equal to GitHub; changes stay in the folder
  echo "Pushed to branch $b. Open a pull request into main (Claude: GitHub tool; others: github.com)."
else
  git push -q origin HEAD:main
  git fetch -q origin
  [ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ] && echo "Published: $(git log -1 --format='%h %s')" || { echo "Push did not land on main; check."; exit 1; }
fi
