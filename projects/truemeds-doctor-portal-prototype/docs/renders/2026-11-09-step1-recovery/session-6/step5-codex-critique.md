**Blocker — Step 5 validation is incomplete.** The post-promotion journey run aborts before browser tests because Playwright’s executable is missing. Re-run with the installed Chrome configured and require the full pass before pushing. Evidence: [entry-journeys log:17](docs/renders/2026-11-09-step1-recovery/session-6/step5-checks/node_tests_entry-journeys.mjs.txt#L17).

**Should-fix**
- `visible-strings.json` still has no `offer/unavailable` entries. Regenerate it now that `EXPECTED` includes the promoted state. [extract-visible-strings.py:29](ui-screens/feedback/extract-visible-strings.py#L29); omission noted in [REPORT.md:116](docs/renders/2026-11-09-step1-recovery/REPORT.md#L116).
- README’s case breakdown is stale: its components total 65, while the corrected table and disk contain 61. [README.md:21](ui-screens/README.md#L21).

**Nice-to-have:** mark the old pending-approval/status paragraphs as superseded so they cannot be mistaken for current instructions. [SESSION-STATUS.md:3](docs/renders/2026-11-09-step1-recovery/SESSION-STATUS.md#L3), [REPORT.md:116](docs/renders/2026-11-09-step1-recovery/REPORT.md#L116).

The promotion itself passes review:

- All **298 pictures byte-equal** `session-6/new/`; no missing or extra pictures.
- All seven contact sheets match an in-memory rebuild; calling contact sheet matches its storyboard.
- README, guard `EXPECTED`, picture row, Jump name and pending-override removal are complete.
- State-map drift check passes: **149 pictures**.
- Anti-aliasing allowance removed; listed regions retained.
- Recorded compare: **80 exact, 6 accepted, 0 failed**.
- No stale **148-state count** or pending `offer_unavailable` claim in the requested active paths.

Read-only; excluded the other session’s handoff work.