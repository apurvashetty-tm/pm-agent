#!/bin/bash
# Runs one Codex test file with the installed Chrome (run A1+). Run from the project folder.
#   bash docs/renders/2026-11-09-build-fast/run-codex.sh <test.mjs> <log file> [CODEX_FILTER]
export CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
export CHROMIUM="${CHROMIUM:-$CHROME}"
#   optional 4th / 5th: CODEX_BASE_URL (an app served by scripts/serve.sh) and A0_NETWORK_HOST (the address serve.sh printed)
[ -n "${3:-}" ] && export CODEX_FILTER="$3"
[ -n "${4:-}" ] && export CODEX_BASE_URL="$4"
[ -n "${5:-}" ] && export A0_NETWORK_HOST="$5"
node "$1" > "$2" 2>&1; rc=$?
grep -E "^FAIL" "$2" | head -60
tail -1 "$2"
exit $rc
