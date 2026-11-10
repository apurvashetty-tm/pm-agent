#!/bin/bash
# Second Codex review, blockers only (D-100). Run from the project folder.
D=docs/renders/2026-11-10-wheel-keyboard
codex exec -s read-only "$(cat "$D/codex-review-2-prompt.txt")" < /dev/null > "$D/codex-review-2.log" 2>&1
echo "codex exit $?"
