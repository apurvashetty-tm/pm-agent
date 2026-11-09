#!/bin/bash
# Publish run signin-d101 (code, docs, test, report, logs, the two new pictures; not the identical compare captures).
# Run from the project folder: bash docs/renders/2026-11-09-signin-d101/publish-run.sh
P=projects/truemeds-doctor-portal-prototype
R=$P/docs/renders/2026-11-09-signin-d101
MSG="Doctor portal: run signin-d101 — D-101 o04 (more than 10 digits → field error, never cut), o10 (Change keeps the number, edits normally), o11 (Terms / Privacy from config URLs), o25 (one signup entry with {link}); app-logic §2 + feedback-state-map; test signin-d101 10/10, entry-journeys 61/61, run-checks 95/95, step-1 compare 80 exact / 6 accepted / 0 failed; Codex should-fix fixed; DONE signin-d101

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
bash ../../scripts/publish.sh -m "$MSG" \
  $P/app/core/auth.js $P/app/core/boot.js $P/app/data/links.js $P/app/review/state-names.js $P/app/screens/otp.js \
  $P/app/screens/sign-in.js $P/app/state-map.js $P/docs/context/session_handoff.md $P/docs/feedback-state-map.md \
  $P/docs/runs/STATUS.md $P/docs/state-map.md $P/tests/entry-journeys.mjs $P/tests/signin-d101.mjs $P/ui-screens/app-logic.md \
  $P/ui-screens/feedback/messages.js $P/ui-screens/feedback/messages.json $P/ui-screens/feedback/metadata.json \
  $P/ui-screens/native/messages.ts \
  $R/REPORT.md $R/checks-summary.log $R/codex-review-prompt.txt $R/codex-review.log $R/codex-review.sh $R/rerun-run-checks.sh \
  $R/run-checks.sh $R/publish-run.sh $R/sign-in_too-long_w360.png $R/sign-in_too-long_w390.png $R/signin-d101-test.log \
  $R/checks/results.json $R/checks/results.md $R/checks/*.txt
