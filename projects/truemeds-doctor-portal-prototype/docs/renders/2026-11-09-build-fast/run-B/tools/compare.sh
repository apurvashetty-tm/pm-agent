#!/bin/bash
# Run B compare report (D-95: once at the end of the run, report only). Run from the project folder.
#   bash docs/renders/2026-11-09-build-fast/run-B/tools/compare.sh <steps, e.g. 6 or 2-5> <out folder> [regex]
export CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
export CHROMIUM="${CHROMIUM:-$CHROME}"
export STEPS="$1" OUT="$2"
node tests/compare-step1.mjs ${3:+"$3"} > "$2.log" 2>&1; rc=$?
grep -vE "^ok " "$2.log" | tail -40
exit $rc
