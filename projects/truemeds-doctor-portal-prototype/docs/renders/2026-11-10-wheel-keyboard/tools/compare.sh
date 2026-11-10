#!/bin/bash
# Steps 2–4 picture compare (report mode) into tmp/compare-<tag>. Run from the project folder: bash docs/renders/2026-11-10-wheel-keyboard/tools/compare.sh <tag> [regex]
export CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
R=docs/renders/2026-11-10-wheel-keyboard
mkdir -p "$R/logs"
sh scripts/copy-shared.sh >/dev/null
cd tests && STEPS=2-4 OUT="../$R/tmp/compare-$1" node compare-step1.mjs $2 > "../$R/logs/compare-$1.log" 2>&1
echo "exit $?"; tail -4 "../$R/logs/compare-$1.log"
