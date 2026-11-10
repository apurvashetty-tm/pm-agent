#!/bin/bash
# d105 run: run one check with the installed Chrome, log to logs/<name>.log, print the summary.
#   bash docs/renders/2026-11-10-d105/tools/run.sh <name> <command...>   (from the project folder)
export CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
export CHROMIUM="${CHROMIUM:-$CHROME}"
L="docs/renders/2026-11-10-d105/logs"; mkdir -p "$L"
n="$1"; shift
"$@" > "$L/$n.log" 2>&1; rc=$?
echo "exit $rc"
grep -E "^(FAIL|Error|  at )|FAIL " "$L/$n.log" | head -30
echo "PASS lines: $(grep -c '^PASS' "$L/$n.log")"
tail -4 "$L/$n.log"
