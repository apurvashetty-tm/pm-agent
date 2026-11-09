#!/bin/bash
# Run B second Codex critique (only because the first had a blocker). Run from the project folder.
#   bash docs/renders/2026-11-09-build-fast/run-B/tools/critique-2.sh <out .md> <log>
codex exec --sandbox read-only --output-last-message "$1" "Second critic pass for run B of docs/renders/2026-11-09-build-fast/TERMINAL-BRIEF.md (plan v3.2 steps 6–8). The first critique is docs/renders/2026-11-09-build-fast/run-B/codex-critique.md and the response docs/renders/2026-11-09-build-fast/run-B/codex-response.md. Check that its blocker and should-fixes are fixed in app/ (app/core/call-engine.js, app/core/boot.js, app/screens/case.js) against ui-screens/app-logic.md, and report only remaining or new blockers that affect correctness against the spec (behaviour, routing, gates, copy, tokens), with file, line and spec line. Skip style. Read docs/runs/RULINGS.md first. Read-only." < /dev/null > "$2" 2>&1
echo "exit $?"; tail -3 "$1"
