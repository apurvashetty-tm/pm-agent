#!/bin/bash
# Run B: tests/run-checks.mjs alone, its screenshots kept in the run folder (not the step-1 evidence folder). Run from the project folder.
#   bash docs/renders/2026-11-09-build-fast/run-B/tools/run-checks-only.sh <log>
export CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
export CHROMIUM="${CHROMIUM:-$CHROME}"
export SHOTS="$(dirname "$1")/run-checks-shots"
node tests/run-checks.mjs > "$1" 2>&1; rc=$?
grep -E "^FAIL" "$1"; tail -1 "$1"
exit $rc
