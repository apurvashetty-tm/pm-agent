#!/bin/bash
# Run a command with the installed Chrome, log to logs/<name>.log, print its exit code and last lines. From the project folder:
#   bash docs/renders/2026-11-10-wheel-keyboard/tools/run.sh <log name> <command…>
export CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
export CHROMIUM="${CHROMIUM:-$CHROME}"
R=docs/renders/2026-11-10-wheel-keyboard
mkdir -p "$R/logs"
n="$1"; shift
"$@" > "$R/logs/$n.log" 2>&1; e=$?
echo "exit $e"; tail -${TAILN:-12} "$R/logs/$n.log"
