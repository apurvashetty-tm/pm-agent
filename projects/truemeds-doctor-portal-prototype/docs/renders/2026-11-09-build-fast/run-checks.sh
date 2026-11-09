#!/bin/bash
# Fast build (D-95): every existing guard, test and the compare, one log per check. Run from the project folder.
#   bash docs/renders/2026-11-09-build-fast/run-checks.sh <output folder>
export CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
export CHROMIUM="${CHROMIUM:-$CHROME}"
O="${1:?output folder}"; mkdir -p "$O"
sh scripts/copy-shared.sh >/dev/null
run() { n=$(echo "$*" | tr ' /' '__'); "$@" > "$O/$n.txt" 2>&1; echo "$* -> exit $? : $(tail -2 "$O/$n.txt" | tr '\n' ' ' | cut -c1-220)"; }
run node tests/entry-journeys.mjs
run node tests/run-checks.mjs
run python3 docs/layout_check.py
python3 -m http.server 8765 --directory app >/dev/null 2>&1 & SRV=$!; sleep 1   # layout_check --app reads http://localhost:8765/
run python3 docs/layout_check.py --app
kill $SRV
run python3 ui-screens/feedback/check-locked-specs.py
run node ui-screens/feedback/check-sources.mjs
run python3 brand/check_lockup.py
run node tests/scan.mjs
run node scripts/check-state-map.mjs
run node tests/compare-step1.mjs
git diff --quiet HEAD -- index.html app.js styles.css && echo "old index.html / app.js / styles.css unchanged"
