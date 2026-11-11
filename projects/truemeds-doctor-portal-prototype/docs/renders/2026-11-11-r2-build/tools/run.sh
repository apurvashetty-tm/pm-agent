#!/bin/bash
# Run one check from the project folder with the installed Chrome, logging to docs/renders/2026-11-11-r2-build/logs/<name>.log
#   bash docs/renders/2026-11-11-r2-build/tools/run.sh <name> <command...>
export CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
export CHROMIUM="$CHROME"
D="$(cd "$(dirname "$0")/.." && pwd)/logs"
mkdir -p "$D"
name="$1"; shift
"$@" > "$D/$name.log" 2>&1
code=$?
echo "exit $code" >> "$D/$name.log"
tail -n "${TAIL:-25}" "$D/$name.log"
exit $code
