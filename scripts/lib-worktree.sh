# Shared by workspace.sh and publish.sh. Makes a .work/ folder usable from any session or device:
# the folder's .git link is relative, the repo's record of the folder points to the current path,
# and the folder is locked so another session's `git worktree prune` can't remove it.
fix_worktree_links() {   # $1 = absolute path of the working folder
  local wt="$1" link adm common
  [ -f "$wt/.git" ] || return 0
  link=$(sed -n 's/^gitdir: //p' "$wt/.git")
  common="$(cd "$wt/../.." && pwd)/.git"
  adm="$common/worktrees/$(basename "$link")"
  [ -d "$adm" ] || { echo "Stop: $wt is not registered in this repo (missing $adm). Tell Apurva."; return 1; }
  printf 'gitdir: %s\n' "$(python3 -c 'import os,sys;print(os.path.relpath(sys.argv[1],sys.argv[2]))' "$adm" "$wt")" > "$wt/.git"
  printf '%s\n' "$wt/.git" > "$adm/gitdir"
  [ -f "$adm/locked" ] || printf 'shared across sessions and devices (scripts/lib-worktree.sh)\n' > "$adm/locked"
}
