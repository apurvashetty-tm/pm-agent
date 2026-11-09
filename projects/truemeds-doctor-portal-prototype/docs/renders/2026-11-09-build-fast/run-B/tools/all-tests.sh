#!/bin/bash
# Run B: every browser test suite once, one log each, into <out folder>. Run from the project folder.
#   bash docs/renders/2026-11-09-build-fast/run-B/tools/all-tests.sh <out folder>
O="${1:?out folder}"; mkdir -p "$O"
R=docs/renders/2026-11-09-build-fast/run-codex.sh
for t in tests/codex/run-B/all.mjs tests/codex/run-A/all.mjs tests/build-fast-b.mjs tests/build-fast-a2.mjs tests/build-fast-a1.mjs \
         tests/f03-profile-back.mjs docs/renders/2026-11-09-build-fast/run-B/tools/b-play-textcontent.mjs; do
  n=$(basename "$(dirname "$t")")-$(basename "$t" .mjs)
  echo "$t -> $(bash $R "$t" "$O/$n.log" | tail -1)"
done
# RULINGS 23:05: A0-happy-path (fixed by the main thread) runs once in run B; it is filtered out unless named.
echo "run-A0 A0-happy-path -> $(bash $R tests/codex/run-A0/all.mjs "$O/run-A0-happy-path.log" A0-happy-path | tail -1)"
