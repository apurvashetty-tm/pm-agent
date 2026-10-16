# Shared helpers for workspace.sh, publish.sh and the git hooks (bash).
COLLABORATOR_BRANCHES="project/type1-revamp project/project-south"   # Swapnil's — never touched by these scripts

refuse_collaborator_branch() {   # $1 = branch
  local b; for b in $COLLABORATOR_BRANCHES; do
    [ "$1" = "$b" ] && { echo "Stop: $1 is Swapnil's branch; these scripts never touch it."; return 1; }
  done; return 0
}

valid_name() {   # $1 = project folder name or shared topic
  [[ "$1" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]] && [[ "$1" != *..* ]] && git check-ref-format --branch "project/$1" >/dev/null 2>&1
}

# Everyday use: make the folder's own .git link relative (identical in every session/device) and keep the
# folder locked so another session's `git worktree prune` can't remove it. Writes only when something changes.
# It does NOT touch the repo's reverse record (.git/worktrees/<name>/gitdir) — only close does, see below.
fix_worktree_links() {   # $1 = absolute path of the working folder
  local wt="$1" link adm want
  [ -f "$wt/.git" ] || return 0
  link=$(sed -n 's/^gitdir: //p' "$wt/.git")
  adm="$(cd "$wt/../.." && pwd)/.git/worktrees/$(basename "$link")"
  [ -d "$adm" ] || { echo "Stop: $wt is not registered in this repo (missing $adm). Tell Apurva."; return 1; }
  want="gitdir: $(python3 -c 'import os,sys;print(os.path.relpath(sys.argv[1],sys.argv[2]))' "$adm" "$wt")"
  if [ "$(cat "$wt/.git")" != "$want" ]; then printf '%s\n' "$want" > "$wt/.git.tmp" && mv "$wt/.git.tmp" "$wt/.git"; fi
  [ -f "$adm/locked" ] || printf 'shared across sessions and devices (scripts/lib-worktree.sh)\n' > "$adm/locked"
}

# Only for close: point the reverse record at this session's path so `git worktree remove` can find the folder.
point_worktree_record_here() {   # $1 = absolute path of the working folder
  local wt="$1" adm
  adm="$(cd "$wt/../.." && pwd)/.git/worktrees/$(basename "$(sed -n 's/^gitdir: //p' "$wt/.git")")"
  printf '%s\n' "$wt/.git" > "$adm/gitdir.tmp" && mv "$adm/gitdir.tmp" "$adm/gitdir"
}

# NUL-safe list of project folders touched by a diff. Args are passed to `git diff --name-only --no-renames -z`.
touched_projects() {
  git diff --name-only --no-renames -z "$@" | while IFS= read -r -d '' f; do
    case "$f" in projects/*/*) f=${f#projects/}; printf '%s\n' "${f%%/*}";; esac
  done | sort -u
}

# Which project folders a branch may change: prints own folder, "NONE" (shared/*), or "ANY1" (other).
branch_scope() {
  case "$1" in project/*) printf '%s\n' "${1#project/}";; shared/*) echo NONE;; *) echo ANY1;; esac
}

# Check a list of touched project folders (stdin) against a branch; prints the reason and returns 1 if refused.
check_scope() {   # $1 = branch
  local scope list bad
  scope=$(branch_scope "$1"); list=$(cat)
  [ -z "$list" ] && return 0
  case "$scope" in
    NONE) echo "shared/ branches don't change project folders (found: $(echo $list))"; return 1;;
    ANY1) [ "$(printf '%s\n' "$list" | grep -c .)" -le 1 ] || { echo "touches more than one project: $(echo $list)"; return 1; };;
    *) bad=$(printf '%s\n' "$list" | grep -v -x -F "$scope" || true)
       [ -z "$bad" ] || { echo "branch $1 may only change projects/$scope/, not: $(echo $bad)"; return 1; };;
  esac
}
