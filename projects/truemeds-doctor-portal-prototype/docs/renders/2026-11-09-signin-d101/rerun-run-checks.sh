#!/bin/bash
# Re-run tests/run-checks.mjs after the state-map rebuild. Run from the project folder.
export CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
export CHROMIUM="${CHROMIUM:-$CHROME}"
D=docs/renders/2026-11-09-signin-d101/checks
export SHOTS="$D/shots"
node scripts/check-state-map.mjs > "$D/node_scripts_check-state-map.mjs.txt" 2>&1; echo "check-state-map -> exit $?"
node tests/run-checks.mjs > "$D/node_tests_run-checks.mjs.txt" 2>&1; echo "run-checks -> exit $? : $(tail -2 "$D/node_tests_run-checks.mjs.txt" | tr '\n' ' ')"
