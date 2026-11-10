#!/bin/bash
# d105: publish this run's files (repo-root-relative). From the project folder: bash docs/renders/2026-11-10-d105/tools/publish-run.sh
set -e
P=projects/truemeds-doctor-portal-prototype
D=docs/renders/2026-11-10-d105
FILES=()
# tracked files changed by the run (the earlier step1-recovery picture changes are not this run's)
while IFS= read -r f; do FILES+=("$P/$f"); done < <(git diff --name-only --relative HEAD -- . | grep -v '^docs/renders/2026-11-09-step1-recovery/')
# evidence: report, sheets, Codex review, logs, check summaries, tools (no identical re-captures, no screenshots)
for f in "$D/REPORT.md" "$D/before-after-390.png" "$D/before-after-360.png" "$D/codex-review-prompt.txt" "$D/codex-review.log" "$D/codex-review.sh" "$D"/logs/*.log "$D"/checks/*.txt "$D"/tools/*; do FILES+=("$P/$f"); done
bash ../../scripts/publish.sh -m "Doctor portal: run d105 — D-105 returning unlock with two buttons (Switch account removed; Use OTP instead and the 3-failure fallback open Sign-in with the number filled in, no SMS until Send OTP); 14 unlock pictures re-rendered for approval; kit regenerated; PRD §5.4; D-104 wording + wheel line; all checks pass; Codex 0 blockers; not deployed" "${FILES[@]}"
