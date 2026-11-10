# Run status (D-100)

Each run appends one line at the end: `DONE <name>` or `STOPPED <name>: <reason>`. The runner adds `STOPPED by runner: …` if a run ends without a DONE line or without pushing.

DONE rails — linter + commit gate live (111 findings today); edit hook needs Apurva to install .claude/settings.json; run-chain.next.sh has a DONE-count fix (see docs/renders/2026-11-09-rails/REPORT.md)

DONE token-pass — 111 raw values -> 0 (25 raw-ok), pictures 298/298 identical, all checks pass, fresh-AI Codex strict PASS; 45 Codex tests disputed (see docs/renders/2026-11-09-token-pass/REPORT.md)

DONE build-fast run-A1 — Home, case page, Prescribe / Disable built; 132 step 2–4 pictures all under 1 % changed; Codex A1 tests pass except 4 disputed; critique-2 no blockers; all checks pass (see docs/renders/2026-11-09-build-fast/run-A1/REPORT.md)

DONE build-fast run-A2 — calling for Cat4 / Pilot HA skipped built; full Cat4 demo plays sign-in → call → Prescription confirmed → next case; Codex run A 303/303 (A0 10/10, happy path disputed on 2 labels); own tests 26/26; 42 step-5 pictures 0 over 1 %; critique 3 blockers fixed, critique-2 no blockers; all checks pass (see docs/renders/2026-11-09-build-fast/run-A2/REPORT.md)

DONE build-fast run-B — Pilot Fallback B built (B0/B1 live gate from the answer, B2, 13→14, B3/15 + after hang-up, 16/16b/16c → 10b or Skip HA → 10a, 17, Pilot 7d); step-7 scenarios run; final pass: copy parity + all checks pass; Codex run B 94/99 (5 play-link cases disputed, one cause), run A 303/303, A0-happy-path PASS, own tests 23/23; steps 2–6 compare 206 pictures, 2 over 1 % (version-A picture backgrounds/script, for the main thread); critique 1 blocker + 2 should-fix fixed, critique-2 no blockers (see docs/renders/2026-11-09-build-fast/run-B/REPORT.md)

DONE signin-d101 — D-101 o04 (more than 10 digits → field error, never cut), o10 (Change keeps the number, edits normally), o11 (Terms / Privacy from config URLs), o25 (one signup entry with {link}) built; app-logic §2 + feedback-state-map updated; own test 10/10, entry-journeys 61/61, run-checks 95/95, step-1 compare exact 80 / accepted 6 / failed 0, all guards pass; Codex 1 should-fix fixed, no blockers; o04 pictures 360/390 for the walkthrough (see docs/renders/2026-11-09-signin-d101/REPORT.md)
STOPPED by runner: "Run docs/renders/2026-11-09-handoff-kit-all/TERMINAL-BRIEF.md" (exit 0, DONE added: no, pushed: yes; log docs/runs/logs/1110-0042-Run-docs-renders-2026-11-09-handoff-kit-all-TERMINAL-BRIEF-m.log)
STOPPED by runner: "Run docs/renders/2026-11-09-handoff-kit-all/TERMINAL-BRIEF.md" (exit 1, DONE added: no, pushed: yes; log docs/runs/logs/1110-0051-Run-docs-renders-2026-11-09-handoff-kit-all-TERMINAL-BRIEF-m.log)
DONE handoff-kit-all — all 7 journeys (149 states, 8 viewer tabs) in the D-103 viewer, generated; --check up to date; Codex handoff tests 38/38 (2 disputes upheld, test fixed); Codex critique 2 blockers + 4 should-fix fixed, critique-2 no blockers; fresh-AI one round NOT passed (DECIDED questions 1/0/3/4, kit defects fixed in the generator, not re-tested); lockup + check-sources pass; NEEDS-APURVA: feedback-map vs messages copy conflict, scrim token conflict, new gaps list (see docs/renders/2026-11-09-handoff-kit-all/REPORT.md)
