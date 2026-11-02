# Terminal brief — calling round (calling-walkthrough decisions CW-A1 … CW-F3)

Owner: main Claude thread · Worker: terminal session · Date: 2026-11-03
Folder: `~/src/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype` (branch `project/truemeds-doctor-portal-prototype`).

**Read first:** `CLAUDE.md` (project); `docs/reviews/2026-11-02-calling-walkthrough/README.md` — the decisions, the apply list per path and the summary at the end; **`CHECKLIST.md` in this folder — the definition of done**; `ui-screens/app-logic.md` §4–§7; `docs/feedback-rules.md`. Same capture method and settings as `docs/renders/2026-11-01-fix-round/` (fixed clock date, 390 + 360, animations frozen, scratch Playwright venv).

## Round 1

0. **Gate G0 — before anything else.** Check that `docs/renders/2026-11-01-fix-round/TERMINAL-BRIEF.md` contains `## DONE` and that `git status --short` shows nothing uncommitted under `ui-screens/`, `ui-screens/app-logic.md`, `ui-screens/feedback/messages.json`, `docs/feedback-state-map.md`, `design-system/`. If either fails, write `REPORT.md` with one line `STOPPED — fix round not merged yet` and stop. Change nothing.
1. **Re-check against the merged fix round.** For every K / T item, confirm the state or section still exists as the checklist assumes (rounds 5–6 may have changed it). Anything that no longer matches → NEEDS-APURVA, leave it.
2. **Baseline:** render every state as it is now into `before/` in this folder. Then write the **expected list** into `REPORT.md`: every picture you expect to change or add per item (K1–K11, T7), and the one to remove (K10).
3. Apply **K1–K11** exactly as `CHECKLIST.md` §1 says. New text only through `messages.json` → `build-messages.mjs`. Add new states to the state list, README and the guards' lists; remove `t15b-end-call-first` everywhere (K10).
4. Update the text files **T1–T6** to match.
5. Re-render the changed and new states (390 + 360) into `ui-screens/`; rebuild the review aids (T7) with the `_qa/` scripts.
6. Run the gates **G1–G7** (pixel compare against `before/`, four guards incl. the small-phone pass, copy, determinism, `git diff --stat`, regression).
7. Open each changed picture at full size (390 and 360) and check it against its "pass when".
8. Write `REPORT.md` in this folder:
   - table K1–K11 + T1–T7: PASS / FAIL with one line of evidence each
   - expected list vs actual differences: matched, **unexpected** (with the reason), expected but unchanged
   - guards with counts of states checked; determinism; page errors
   - **NEEDS-APURVA:** the CW-F3 copy proposal, step-1 mismatches, anything the checklist doesn't settle (left as it was)
   - last line exactly: `ROUND 1 COMPLETE — failures: <n>`
9. **Wait for the next round — don't stop.** The main Claude thread reads `REPORT.md`, checks the pictures and appends `## Round 2` (then 3, …) to this file. Wait with:
   `until grep -q '^## Round 2\|^## DONE' docs/renders/2026-11-03-calling-round/TERMINAL-BRIEF.md; do sleep 60; done`
   (change the number each round; re-run the command if it times out — there is no time limit). Do each new round the same way, append `## Round <n>` to `REPORT.md` ending `ROUND <n> COMPLETE — failures: <n>`, then wait again.
10. The loop ends when this file contains `## DONE`. Then stop.

**Unattended:** Apurva is away. Don't stop to ask — anything the checklist doesn't settle goes under NEEDS-APURVA (left as it was) and you carry on.

## Never
Touch anything in `CHECKLIST.md` §3 — decision log, backlog, open questions, project truth, `docs/reviews/**`, the design system, the old prototype, any state not named in §1. Record decisions or approvals in Apurva's name. Commit, push, open PRs, or run git commands other than `git status` / `git diff`. Read or print credentials.
