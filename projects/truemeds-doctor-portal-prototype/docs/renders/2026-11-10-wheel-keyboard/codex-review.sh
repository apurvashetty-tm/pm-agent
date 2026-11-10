#!/bin/bash
# One Codex review (D-100), read-only. Run from the project folder: bash docs/renders/2026-11-10-wheel-keyboard/codex-review.sh
D=docs/renders/2026-11-10-wheel-keyboard
codex exec -s read-only "$(cat "$D/codex-review-prompt.txt")" < /dev/null > "$D/codex-review.log" 2>&1
echo "codex exit $?"
