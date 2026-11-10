#!/bin/bash
# One Codex review (D-100), read-only. Run from the project folder: bash docs/renders/2026-11-10-d105/codex-review.sh [suffix]
D=docs/renders/2026-11-10-d105
codex exec -s read-only "$(cat "$D/codex-review-prompt.txt")" < /dev/null > "$D/codex-review$1.log" 2>&1
echo "codex exit $?"
tail -5 "$D/codex-review$1.log"
