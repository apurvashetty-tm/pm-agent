#!/bin/bash
# Run one test file with the installed Chrome, log into logs/<name>.log. From the project folder:
#   bash docs/renders/2026-11-10-wheel-keyboard/tools/test.sh tests/wheel-keyboard.mjs [args]
export CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
export CHROMIUM="${CHROMIUM:-$CHROME}"
R=docs/renders/2026-11-10-wheel-keyboard
mkdir -p "$R/logs"
f="$1"; shift
n=$(basename "$f" .mjs)
node "$f" "$@" > "$R/logs/$n.log" 2>&1; e=$?
echo "exit $e"; grep -E "^(FAIL|PASS)|passed|page errors" "$R/logs/$n.log" | tail -40
