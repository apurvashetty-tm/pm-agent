# r4-rest-build — overnight build (2026-11-25 / 26)

Asked by Apurva: fix everything that needs attention (prototype, flows, PRD), render, audit, move to the right folders; sanity check in the morning, then merge. Nothing merged, released or synced to Confluence.

## Done
- **D-110** Duration 1–12. **D-111 [RECOMMENDED, awaiting Apurva]**: r3 spacing fixes on the case page, Prescribe, sheets, Profile, Rx viewer; the r3 answers (see the decision log).
- **Agreed earlier, never built, built now** (found by reading all 111 decisions): overlays keep focus inside (D-20), "On prescription" flash (D-25), focus back to the medicine's row (D-30). Also: "Other dose" error linked to its field; read-only medicine rows no longer say "Edit"; Help stays on the right while loading.
- **Rule text corrected** where it contradicted later decisions (app-logic, state map, README, RULES A-14, PRD o04).
- **Pictures:** all 149 states × 2 re-rendered in place in `ui-screens/` (Chrome 158); contact sheets and REVIEW.html rebuilt; before/after in `before-after/`.
- **Reference:** `ui-screens/case/case.html` generated from the app (`scripts/build-case-reference.mjs`); version-A states 8b, 11, 12 composed from built parts. t13 and the Skip HA sheet now show the launch version (D-102, backlog).
- **Kit:** rebuilt; `handoff/CHANGES.md` is one diff against the 10 November kit (963c2b5): written list, exact wording, parts, before/after pictures.
- **PRD** file v0.7 (and the Confluence copy file; not synced).

## Checks
`logs/final-checks.txt`: everything green except two that were then fixed and re-run: kit tests (a broken link line in the viewer and an internal name in CHANGES; now **38 / 38**) and layout `--app` (Python's test server drops a connection now and then: 1 of 60 loads; with a Node server **ALL PASS 3 / 3**; the app is unchanged). After the full run only `handoff/`, `scripts/build-handoff.mjs`, `scripts/kit-changes/` and `docs/layout_check.py` changed. Work screens: 172 captures, 0 open gaps (accepted anatomy listed with reasons in `tools/audit.mjs`).
Reviews: one independent Claude review (1 blocker, 15 should-fix), Codex (2 blockers, 6 should-fix; run on Apurva's yes), one decision audit (111 / 111 read). All blockers fixed.

## Not done / open
- CHECKIN items 11–13 and D-111 approval. Phone check.
- Shared design system: PR #41 unmerged; D-111's design-system edits are on this branch only and need to reach `main` through a shared PR.
- Text trim still in `task-gaps.css`, not in the design system's text styles. Four unused copy keys (call.onCall, call.onCallTransfer, case.noPickup, case.didntConnect) left. Callback error not linked to its chips; button pairs don't stack at very large text (CA-20). Case skeleton heights not re-measured.
- Two states have three buttons (7d, both routes): allowed by D-54, D-58, D-83; no decision asks for two.
- Not checked: real phones, live sites, Confluence.
