#!/bin/bash
# signin-d101 checks. Run from the project folder:  bash docs/renders/2026-11-09-signin-d101/run-checks.sh [only-d101]
# 1. the D-101 sign-in test (and the o04 capture at 360 / 390), 2. every existing guard via the build-fast check script.
export CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
export CHROMIUM="${CHROMIUM:-$CHROME}"
D=docs/renders/2026-11-09-signin-d101
sh scripts/copy-shared.sh >/dev/null
node tests/signin-d101.mjs > "$D/signin-d101-test.log" 2>&1; echo "signin-d101 -> exit $? : $(tail -1 "$D/signin-d101-test.log")"
[ "${1:-}" = "only-d101" ] && exit 0
OUT="$D/checks" bash docs/renders/2026-11-09-build-fast/run-checks.sh "$D/checks"
