#!/bin/bash
# Run A2 compare (D-95 report mode). Run from the project folder.
#   bash docs/renders/2026-11-09-build-fast/run-A2/tools/compare.sh <steps|1> [filter]
export CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
R=docs/renders/2026-11-09-build-fast/run-A2
if [ "$1" = "1" ]; then
  OUT="$R/compare-step1" node tests/compare-step1.mjs $2 > "$R/compare-step1.log" 2>&1; tail -3 "$R/compare-step1.log"
else
  OUT="$R/compare-$1" STEPS="$1" node tests/compare-step1.mjs $2 > "$R/compare-$1.log" 2>&1; grep -E "^OVER" "$R/compare-$1.log" | head -40; tail -1 "$R/compare-$1.log"
fi
