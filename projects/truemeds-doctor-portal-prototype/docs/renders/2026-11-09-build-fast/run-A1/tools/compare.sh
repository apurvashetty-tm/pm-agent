#!/bin/bash
# Run A1 compare report (steps 2–4) into run-A1/compare. Run from the project folder.
export CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
export STEPS=2-4 OUT="$PWD/docs/renders/2026-11-09-build-fast/run-A1/compare"
sh scripts/copy-shared.sh >/dev/null
cd tests && node compare-step1.mjs > "$OUT.log" 2>&1; rc=$?; tail -3 "$OUT.log"; grep "OVER" "$OUT.log"; exit $rc
