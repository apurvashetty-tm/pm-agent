#!/bin/bash
# D-99 token pass §5.2: regenerate the hand-off kit with this Mac's Chrome, then --check. Run from the project folder.
export CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
export CHROMIUM="${CHROMIUM:-$CHROME}"
node scripts/build-handoff.mjs 2>&1 | grep -v "^    at " | tail -15
echo "build exit ${PIPESTATUS[0]}"
node scripts/build-handoff.mjs --check 2>&1 | tail -15
echo "check exit ${PIPESTATUS[0]}"
