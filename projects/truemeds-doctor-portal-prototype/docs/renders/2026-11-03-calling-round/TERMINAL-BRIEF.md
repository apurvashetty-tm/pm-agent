# Terminal brief — calling round (calling-walkthrough decisions CW-A1 … CW-F3)

Owner: main Claude thread · Worker: terminal session · Date: 2026-11-03
Folder: `~/src/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype` (branch `project/truemeds-doctor-portal-prototype`).

**Read first:** `CLAUDE.md` (project); **D-83** in `docs/context/decision_log.md`; `docs/reviews/2026-11-02-calling-walkthrough/README.md` — the decisions, the apply list per path and the summary at the end; **`CHECKLIST.md` in this folder — the definition of done**; `ui-screens/app-logic.md` §4–§7; `docs/feedback-rules.md`. Same capture method and settings as `docs/renders/2026-11-01-fix-round/` (fixed clock date, 390 + 360, animations frozen, scratch Playwright venv).

## Round 1

0. **Gate G0 — before anything else.** Check that `docs/renders/2026-11-01-fix-round/TERMINAL-BRIEF.md` contains `## DONE`, that `docs/context/decision_log.md` contains `### D-83`, and that `git status --short` shows nothing uncommitted under `ui-screens/`, `ui-screens/app-logic.md`, `ui-screens/feedback/messages.json`, `docs/feedback-state-map.md`, `design-system/`. If either fails, write `REPORT.md` with one line `STOPPED — fix round not merged yet` and stop. Change nothing.
1. **Re-check against the merged fix round.** For every K / T item, confirm the state or section still exists as the checklist assumes (rounds 5–6 may have changed it). Anything that no longer matches → NEEDS-APURVA, leave it.
2. **Baseline:** render every state as it is now into `before/` in this folder. Then write the **expected list** into `REPORT.md`: every picture you expect to change or add per item (K1–K13, T7), and the one to remove (K10).
3. Apply **K1–K13** exactly as `CHECKLIST.md` §1 says. New text only through `messages.json` → `build-messages.mjs`. Add new states to the state list, README and the guards' lists; remove `t15b-end-call-first` everywhere (K10).
4. Update the text files **T0–T6** to match.
5. Re-render the changed and new states (390 + 360) into `ui-screens/`; rebuild the review aids (T7) with the `_qa/` scripts.
6. Run the gates **G1–G7** (pixel compare against `before/`, four guards incl. the small-phone pass, copy, determinism, `git diff --stat`, regression).
7. Open each changed picture at full size (390 and 360) and check it against its "pass when".
8. Write `REPORT.md` in this folder:
   - table K1–K13 + T0–T7: PASS / FAIL with one line of evidence each
   - expected list vs actual differences: matched, **unexpected** (with the reason), expected but unchanged
   - guards with counts of states checked; determinism; page errors
   - **NEEDS-APURVA:** the CW-F3 copy proposal, step-1 mismatches, anything the checklist doesn't settle (left as it was)
   - last line exactly: `ROUND 1 COMPLETE — failures: <n>`
9. **Fix and re-check by yourself — overnight loop (no waiting, no polling).** If `failures > 0`: fix only those failures (scope rule and §3 still apply), re-render only the affected states, re-run **all** gates G1–G7 (regression on everything, not just the fixes), append `## Round <n>` to `REPORT.md` ending `ROUND <n> COMPLETE — failures: <n>`. Repeat. **At most 4 rounds.** Stop early if the same failure survives two rounds — list it under NEEDS-APURVA with what you tried.
10. **Independent check before you finish.** When failures reach 0, start a fresh subagent that has not seen your work. Give it only `CHECKLIST.md`, the expected list and the changed pictures (390 + 360). It checks each K / T item against the pictures at full size and reports PASS / FAIL. Any FAIL → back to step 9 (counts toward the 4 rounds).
11. **Finish.** Append to `REPORT.md`: the independent check's table, the final NEEDS-APURVA list, and the last line exactly `CALLING ROUND DONE — failures: <n>, rounds: <n>`.
12. **Wait for the main thread's audit (cheap wait, until 08:00 IST at most).** The main Claude thread audits your result around 04:00 IST and appends either `## MAIN-CHECK <n>` (fixes to make) or `## DONE` to this file. Wait with this one command, re-running it each time it returns without a match:
    `for i in $(seq 1 9); do grep -q '^## MAIN-CHECK\|^## DONE' docs/renders/2026-11-03-calling-round/TERMINAL-BRIEF.md && break; sleep 60; done; grep '^## MAIN-CHECK\|^## DONE' docs/renders/2026-11-03-calling-round/TERMINAL-BRIEF.md`
    Don't do anything else between re-runs. On a new `## MAIN-CHECK <n>`: apply it with the same rules (scope, all gates incl. G7, independent check), append `## Main-check <n>` to `REPORT.md` ending `MAIN-CHECK <n> DONE — failures: <n>`, then wait again for the next heading. On `## DONE`, or at 08:00 IST: stop.

**Unattended:** Apurva is away. Don't stop to ask — anything the checklist doesn't settle goes under NEEDS-APURVA (left as it was) and you carry on.

## Never
Touch anything in `CHECKLIST.md` §3 — decision log, backlog, open questions, project truth, `docs/reviews/**`, the design system, the old prototype, any state not named in §1. Record decisions or approvals in Apurva's name. Commit, push, open PRs, or run git commands other than `git status` / `git diff`. Read or print credentials.
