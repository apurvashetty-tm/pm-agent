#!/usr/bin/env bash
# Run the build queue unattended (D-100): one fresh headless Claude session per unchecked line
# of docs/runs/QUEUE.md. Success = a new "DONE" line in docs/runs/STATUS.md and the branch pushed.
# Pause: create docs/runs/HOLD. Start: bash scripts/run-chain.sh   (keep the Mac plugged in, lid open)
# --watch: when the queue is empty, wait for new lines (checks every minute) instead of exiting. Stop with Ctrl+C or docs/runs/HOLD.
set -u
cd "$(dirname "$0")/.." || exit 1
PROJ="$(pwd)"
ROOT="$(cd ../.. && pwd)"
REL="projects/$(basename "$PROJ")"
BRANCH="project/$(basename "$PROJ")"
QUEUE="docs/runs/QUEUE.md"
WATCH=0
for a in "$@"; do [ "$a" = "--watch" ] && WATCH=1; done
[ "${1:-}" = "--queue" ] && [ -n "${2:-}" ] && QUEUE="$2"
STATUS="docs/runs/STATUS.md"

# Keep the Mac awake while the chain runs.
if [ -z "${TM_CAFFEINATED:-}" ] && command -v caffeinate >/dev/null 2>&1; then
  export TM_CAFFEINATED=1; exec caffeinate -i bash "$0" "$@"
fi

mkdir -p docs/runs/logs
# Count only real "DONE <name>" lines (not the header, not "DONE added:" inside a runner STOPPED line).
# grep -c prints 0 AND exits 1 on no match, so "|| echo 0" would give "0\n0"; default with :- instead.
done_count() { local n; n="$(grep -cE '^[-*[:space:]]*`?DONE[[:space:]]' "$STATUS" 2>/dev/null)"; echo "${n:-0}"; }
say() { echo "[$(date +%H:%M)] $1"; osascript -e "display notification \"$1\" with title \"Doctor portal build chain\"" >/dev/null 2>&1 || true; }
publish() { (cd "$ROOT" && scripts/publish.sh -m "$1" "$REL/$QUEUE" "$REL/$STATUS") >/dev/null 2>&1 || say "Publish failed (will retry with the next run): $1"; }

# Unattended permissions without --dangerously-skip-permissions: auto mode if this CLI has it.
if claude --help 2>/dev/null | grep -- '--permission-mode' | grep -q 'auto'; then
  PERM=(--permission-mode auto)
else
  PERM=(--permission-mode acceptEdits --allowedTools "Read,Edit,Write,MultiEdit,Glob,Grep,TodoWrite,Bash(node:*),Bash(npm:*),Bash(npx:*),Bash(python3:*),Bash(sh:*),Bash(bash:*),Bash(codex:*),Bash(git:*),Bash(scripts/*),Bash(../../scripts/*),Bash(ls:*),Bash(cat:*),Bash(head:*),Bash(tail:*),Bash(mkdir:*),Bash(cp:*),Bash(mv:*),Bash(find:*),Bash(grep:*),Bash(sed:*),Bash(wc:*),Bash(diff:*),Bash(date:*)")
fi
say "Chain started (permissions: ${PERM[*]:0:2})"

while true; do
  [ -f docs/runs/HOLD ] && { say "Paused: docs/runs/HOLD exists. Delete it and run again to continue."; exit 0; }
  line="$(grep -m1 '^- \[ \] ' "$QUEUE" || true)"
  if [ -z "$line" ]; then
    [ "$WATCH" = 1 ] || { say "Queue finished."; exit 0; }
    [ "${waiting:-0}" = 1 ] || { say "Queue empty — watching for new lines (Ctrl+C to stop)."; waiting=1; }
    sleep 60; continue
  fi
  waiting=0
  prompt="${line#- \[ \] }"
  slug="$(printf '%s' "$prompt" | tr -cs 'A-Za-z0-9' '-' | cut -c1-60)"
  log="docs/runs/logs/$(date +%m%d-%H%M)-$slug.log"
  before="$(done_count)"
  say "Running: $prompt"
  claude -p "$prompt. Before starting, read docs/runs/RULINGS.md (main-thread rulings; they override the brief). You are unattended: nobody will answer questions, so take the most reasonable reading and note it in your report. Finish exactly as the brief says, ending with a DONE or STOPPED line in docs/runs/STATUS.md, published with scripts/publish.sh." \
    "${PERM[@]}" --max-turns 400 > "$log" 2>&1
  rc=$?
  after="$(done_count)"
  git -C "$ROOT" fetch -q origin "$BRANCH" 2>/dev/null
  pushed=no; git -C "$ROOT" merge-base --is-ancestor HEAD "origin/$BRANCH" 2>/dev/null && pushed=yes
  if [ "$after" -gt "$before" ] && [ "$pushed" = yes ] && ! tail -n 1 "$STATUS" | grep -q 'STOPPED'; then
    perl -0pi -e 's/^- \[ \] /- [x] /m' "$QUEUE"
    publish "Run chain: done — $prompt"
    say "Done: $prompt"
  else
    echo "STOPPED by runner: \"$prompt\" (exit $rc, DONE added: $([ "$after" -gt "$before" ] && echo yes || echo no), pushed: $pushed; log $log)" >> "$STATUS"
    publish "Run chain: stopped — $prompt"
    say "Stopped: $prompt — see docs/runs/STATUS.md"
    exit 1
  fi
done
