#!/bin/bash
# Run A2: every Codex run-A suite, the A0 suite, own tests (A1, A2) and the check bundle, one log each. Run from the project folder.
#   bash docs/renders/2026-11-09-build-fast/run-A2/tools/all-tests.sh <tag>
R=docs/renders/2026-11-09-build-fast/run-A2; T="${1:-final}"; C=docs/renders/2026-11-09-build-fast/run-codex.sh
for t in edges rules journeys options; do echo "run-A $t: $(bash $C tests/codex/run-A/$t.mjs $R/codex-$t-$T.log | tail -1)"; done
echo "run-A0: $(bash $C tests/codex/run-A0/all.mjs $R/codex-a0-$T.log | tail -1)"
echo "own A1: $(bash $C tests/build-fast-a1.mjs $R/build-fast-a1-$T.log | tail -1)"
echo "own A2: $(bash $C tests/build-fast-a2.mjs $R/build-fast-a2-$T.log | tail -1)"
bash docs/renders/2026-11-09-build-fast/run-checks.sh $R/checks-$T
