# Brief — re-render `a-confirm-failed` (bug, backlog 2026-11-05)

Owner: main Claude thread · Runner: Claude Code (terminal) · 2026-11-06 · Folder: this project (`.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype`).

**The bug:** `ui-screens/case/a-confirm-failed` (390 + 360) shows **Callback** under Confirm prescription. After a valid call only the confirm button shows (D-83 CW-C3). **The recipe is already fixed** in `ui-screens/case/case.html` (line with `'a-confirm-failed'`: now hides `ab-secondary`, same pattern as `t08c`). Don't change the recipe or anything else in `case.html`.

## Do
1. Copy the two current pictures to `docs/renders/2026-11-06-confirm-failed-fix/before/`.
2. Render only this state, with the same method as every approved picture:
   `python3 docs/renders/2026-11-03-calling-round/capture-method-cap.py docs/renders/2026-11-06-confirm-failed-fix/after 'case/a-confirm-failed$'`
3. Check both new pictures yourself (open them): no Callback; red band "Couldn't confirm. Nothing was lost." inside the bar above **Confirm prescription**; everything else as before. `after/capture-log.json` shows 0 page errors. Compare before vs after: differences only in the action bar area.
4. Copy the two new pictures over `ui-screens/case/a-confirm-failed_w390.png` and `_w360.png`.
5. Run the guards — all must be 0 failures / PASS: `python3 ui-screens/feedback/check-locked-specs.py` · `node ui-screens/feedback/check-sources.mjs` · `python3 docs/layout_check.py` · `python3 brand/check_lockup.py`.
6. Rebuild review aids: `python3 ui-screens/_qa/build-contact-sheets.py` and `python3 ui-screens/_qa/build-map.py`. If any script rewrites an unrelated file, revert that file.
7. Write `docs/renders/2026-11-06-confirm-failed-fix/REPORT.md`: files changed, guard results, before / after note. Then tell Apurva it's done and stop.

## Don't
Commit, push, tick the backlog or touch the decision log — the main thread does that after checking.
