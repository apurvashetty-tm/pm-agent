# Terminal brief: centre the notice band inside the action bar (D-86)

Folder: `~/src/pm-agent/.work/truemeds-doctor-portal-prototype` (branch `project/truemeds-doctor-portal-prototype`). Apurva is away: don't ask her anything. Report folder: `projects/truemeds-doctor-portal-prototype/docs/renders/2026-11-03-bar-notice-centre/`.

**Decision (D-86):** a notice inside the pinned action bar (`.tm-actionbar > .tm-notice`, the edge-to-edge band) is **centred**: icon and text centred as a group, wrapped lines centred, and balanced line breaks kept. Every other notice (top of the page, inside sheets, in content) **stays left-aligned**. Comparison: `docs/reviews/2026-11-03-copy-audit/bar-notice-alignment.png`.

## Steps
1. **Expected list first.** Render every state at 390 into `before/`, then probe the DOM to find every state with a `.tm-actionbar > .tm-notice` showing. That is the expected list (390 + 360). Write it to `REPORT.md` before changing anything.
2. **Central change only.** In `design-system/src/components.css`, on the existing `.tm-actionbar > .tm-notice` rule, centre the content (`justify-content: center; text-align: center`). Keep the icon next to the first line and keep `text-wrap: balance`. Rebuild with `design-system/scripts/build.py`, then revert date-only changes in `native/tokens.json`, `native/tokens.ts` and `preview.html`. No per-screen CSS, and no new values.
3. **Docs:** add one sentence to `design-system/RULES.md` §9.5 (the band in the bar is centred; other notices are left-aligned) and one row to `design-system/beyond-salt.md`. In `design-system/scripts/build_artifact.py`, add "centred" to the Notice and Action bar guide text where the band is described.
4. **Re-render** only the states on the expected list (390 + 360) into `ui-screens/`, and rebuild the review aids with `_qa/`.
5. **Gates:**
   - G2: only expected pictures differ.
   - G3: four guards at 0, including the 360×640 small-phone pass and the copy checks.
   - G5: a second render is identical, with 0 page errors.
   - G6: `git diff --stat` touches only the files named here.
   - G7: every other state is pixel-identical; top-of-page and sheet notices are unchanged.
   - Also check at 360 that any band that wraps to 2 lines is centred and balanced, and that the icon doesn't float away from the text.
6. **Independent check:** a fresh subagent gets only this brief and the changed pictures, and reports PASS / FAIL per picture. Fix and repeat, at most 2 rounds.
7. **Finish:** end `REPORT.md` with exactly `BAR NOTICE CENTRE DONE — failures: <n>`. Stop.

## Never
Touch anything else: no copy, no other components, no decision log or backlog, and not the prototype-build files the other thread may be writing. Don't commit, push or open PRs. Don't edit root `app.js`. Never read or print credentials.
