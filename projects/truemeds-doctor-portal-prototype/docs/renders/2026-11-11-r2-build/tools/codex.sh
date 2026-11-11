#!/bin/bash
# Codex calls for run r2-build. Run from the project folder:
#   bash docs/renders/2026-11-11-r2-build/tools/codex.sh tests     (tests first, workspace-write)
#   bash docs/renders/2026-11-11-r2-build/tools/codex.sh review    (one review, read-only)
D=docs/renders/2026-11-11-r2-build
case "$1" in
  tests)  codex exec -s workspace-write "$(cat "$D/codex-tests-prompt.txt")" < /dev/null > "$D/codex-tests.log" 2>&1 ;;
  review) codex exec -s read-only "$(cat "$D/codex-review-prompt.txt")" < /dev/null > "$D/codex-review$2.log" 2>&1 ;;
  *) echo "usage: codex.sh tests|review [suffix]"; exit 2 ;;
esac
echo "codex exit $?"
