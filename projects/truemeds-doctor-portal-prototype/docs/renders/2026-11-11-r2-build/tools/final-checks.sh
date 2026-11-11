#!/bin/bash
# Step 7 end: every check once more after the fix pass. From the project folder. One line per check: name, exit code, last line.
T=docs/renders/2026-11-11-r2-build/tools/run.sh
L=docs/renders/2026-11-11-r2-build/logs
line() { printf '%-22s exit %-3s %s\n' "$1" "$2" "$(grep -v '^exit' "$L/$1.log" | grep -v '^\s*$' | tail -1 | cut -c1-120)"; }
run() { n=$1; shift; bash $T "$n" "$@" > /dev/null 2>&1; line "$n" $?; }
bash scripts/copy-shared.sh > /dev/null
run tokens python3 ../../design-system/scripts/check_tokens.py
run checker-unit node --test ../../design-system/scripts/tests/
run r2-tests node tests/codex/r2/r2.test.mjs
run entry-journeys node tests/entry-journeys.mjs
run run-checks node tests/run-checks.mjs
run wheel-keyboard node tests/wheel-keyboard.mjs
run signin-d101 node tests/signin-d101.mjs
run f03-profile-back node tests/f03-profile-back.mjs
run build-fast-a1 node tests/build-fast-a1.mjs
run build-fast-a2 node tests/build-fast-a2.mjs
run build-fast-b node tests/build-fast-b.mjs
run codex-run-A node tests/codex/run-A/all.mjs
run codex-run-B node tests/codex/run-B/all.mjs
run codex-run-A0-happy env CODEX_FILTER=A0-happy-path node tests/codex/run-A0/all.mjs
run check-sources node ui-screens/feedback/check-sources.mjs
run state-map node scripts/check-state-map.mjs
run lockup python3 brand/check_lockup.py
run check-locked-specs python3 docs/renders/2026-11-11-r1-rules/tools/run_locked_specs.py
run visible-gaps node docs/renders/2026-11-11-r2-build/tools/visible-gaps.mjs --out docs/renders/2026-11-11-r2-build/visible-gaps --no-pictures
run ref-diff node docs/renders/2026-11-11-r2-build/tools/ref-diff.mjs
run compare-step1 env OUT=docs/renders/2026-11-11-r2-build/compare/step1 node tests/compare-step1.mjs
run compare-steps2-4 env STEPS=2-4 OUT=docs/renders/2026-11-11-r2-build/compare/steps2-4 node tests/compare-step1.mjs
run kit-build node scripts/build-handoff.mjs
run kit-check node scripts/build-handoff.mjs --check
run handoff-tests node --test tests/codex/handoff/
run prd-check node docs/prd/check-prd.mjs
python3 -m http.server 8765 --bind 127.0.0.1 --directory app > /dev/null 2>&1 & SRV=$!
sleep 1
run layout-app python3 docs/layout_check.py --app
kill $SRV
run layout python3 docs/layout_check.py
python3 -c "import pathlib; [p.unlink() for p in pathlib.Path('docs/renders/2026-11-11-r2-build/compare/step1').glob('*_w3[69]0.png')]"
