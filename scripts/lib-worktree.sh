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

# NUL-safe list of project folders touched by a diff. Args go to `git diff --name-only --no-renames -z`.
# Returns non-zero (and prints nothing) if git can't produce the diff — callers must treat that as a refusal.
touched_projects() {
  local tmp rc; tmp=$(mktemp) || return 1
  git diff --name-only --no-renames -z "$@" > "$tmp"; rc=$?
  if [ $rc -ne 0 ]; then rm -f "$tmp"; return 1; fi
  python3 - "$tmp" <<'PYX' || { rm -f "$tmp"; return 1; }
import sys
names = open(sys.argv[1], 'rb').read().split(b'\0')
out = set()
for n in names:
    parts = n.split(b'/')
    if len(parts) >= 3 and parts[0] == b'projects':
        name = parts[1].decode('utf-8', 'backslashreplace')
        if '\n' in name or '\r' in name:      # never let a line break split one folder into several names
            name = 'INVALID:' + name.encode('unicode_escape').decode('ascii')
        out.add(name)
for p in sorted(out): print(p)
PYX
  rm -f "$tmp"
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
  bad=$(printf '%s\n' "$list" | grep -v -E '^[A-Za-z0-9][A-Za-z0-9._ -]*$' || true)
  [ -z "$bad" ] || { echo "unusual project folder name (line break or other special character): $(echo $bad)"; return 1; }
  case "$scope" in
    NONE) echo "shared/ branches don't change project folders (found: $(echo $list))"; return 1;;
    ANY1) [ "$(printf '%s\n' "$list" | grep -c .)" -le 1 ] || { echo "touches more than one project: $(echo $list)"; return 1; };;
    *) bad=$(printf '%s\n' "$list" | grep -v -x -F "$scope" || true)
       [ -z "$bad" ] || { echo "branch $1 may only change projects/$scope/, not: $(echo $bad)"; return 1; };;
  esac
}
