# Review brief — build plan v3 + rebuild checklist v3

Owner: main Claude thread · Reviewers: Claude Code (terminal) and Codex, **separately** · Date: 2026-11-05

## One window: Claude Code runs Codex (do this first, Claude Code)
Codex reviews **before** your report exists, so the two stay independent.
1. From this project folder, start Codex in the background, read-only, with its answer saved to its report:
   `codex exec --sandbox read-only --output-last-message docs/reviews/2026-11-05-plan-v3-review/codex-report.md "Read docs/reviews/2026-11-05-plan-v3-review/BRIEF.md and do exactly what it says. You are the Codex reviewer. Your final message is your report in the brief's format; it is saved for you, so write no files. Do not read claude-report.md."`
   If a flag is rejected, check `codex exec --help` and use the equivalent; if `codex` isn't installed or signed in, stop and tell Apurva.
2. While it runs, do your own review and write `claude-report.md`. Don't open `codex-report.md` until yours is written.
3. When Codex finishes, check `codex-report.md` exists and follows the brief's format (don't edit it).
4. Then do **Part 2 — build map** (below, Claude Code only). Tell Apurva the two reports and the build map are ready, and stop. The main thread merges the reports and does the final review.

Apurva wants an independent check before she approves. **The main risk is a flow, state, rule or decision that the plan or checklist leaves out or gets wrong** — she can't verify that from state names and decision numbers herself. You review; you do not decide.

## Part 2 — build map (Claude Code, after both reports)
A picture version of plan v3 §5, so Apurva can approve from screens instead of state names and decision numbers.
- **What:** one image per build step 1 – 6 (step 0 has no screens; step 7 – 8 as one line of text; step 9 version A as its own image marked "LATER"). Each image: title "Step n — journey"; the step's approved 390 pictures in flow order (happy path first, then side branches), each labelled `render id — one short line of what the doctor sees or does` (from app-logic / `calling-flow/data.js`, not invented); a one-line flow under the title (for example "Call patient → Calling… → result → Confirm prescription → Prescription confirmed"). Steps 5 – 6: group by path like the calling-flow page (shared start · Cat4 / HA skipped · Pilot HA free · Pilot no HA free · side branches).
- **How:** a script `ui-screens/_qa/build-map.py` (reuse `build-storyboard.py`'s thumbnail style), reading the step → picture list from plan v3 §5. Only approved pictures from `ui-screens/`; no new renders, no mock-ups. Any picture in §5 that doesn't exist, or any `ui-screens/` state that no step uses, goes in a "Gaps" line on the index — don't fix the plan.
- **Out:** `docs/reviews/2026-11-05-plan-v3-review/build-map/step-<n>.png` + `index.md` (one line per step: journey, picture count, flow line, link to the image).
- **Self-check before saying done:** every §5 picture appears exactly once; labels readable at phone width; no screen cropped.
- Writes only the script and the `build-map/` folder. No commits.

## Already settled — don't flag
- **D-87:** Fallback B is the one Pilot flow (Non-Value Meds included); A-only screens (11, 12, 8b) are built later (step 9).
- **D-88:** v3 now, shell first; PRD / spec / test cases are not a gate; storyboard review Part C closed; preview site deploys only on `[deploy]`; Help and bell open a blank placeholder.
- **D-79 P3:** bare link = review, `?demo=1` = demo, installed app = demo.
- Netlify site name `truemeds-doctor-app-preview`; plain HTML/JS, no framework; demo call about 8 s.
- Icon background: being decided with Apurva in the main thread. Don't flag.
- Screens and app logic are frozen (D-85). Don't propose screen or logic changes; if you find an error in them, list it under "Source errors".

## Review these two drafts
- `docs/proposals/2026-11-05-prototype-build-plan-v3.md`
- `docs/reviews/2026-11-05-rebuild-checklist-v3.md`

## Read first (the ground truth)
Project `CLAUDE.md` · `docs/context/decision_log.md` D-56, D-58, D-73, D-79 → D-88 · `ui-screens/app-logic.md` (whole, esp. §4 – §7, §11, §14) · `ui-screens/README.md` · `calling-flow/data.js` · `docs/feedback-state-map.md` · `docs/feedback-rules.md` §10 · `../../design-system/RULES.md` §7 – 9 · `docs/proposals/2026-11-03-prototype-build-readiness.md` (§3 and §8 list what v3 had to fix) · `docs/renders/2026-11-01-fix-round/CHECKLIST.md` (G7) · `docs/context/backlog.md` §2k, §2l · `docs/context/open_questions.md` · v2 plan and checklist (to see what v3 changed) · `docs/reviews/2026-10-29-build-plan-review/` (earlier reviews; check their adopted points weren't lost).

## Questions to answer
1. **Coverage — states:** every launch state in `ui-screens/` (149 states, A-only tagged) and in app-logic / `feedback-state-map.md` sits in exactly one build step (§5) and is reached by a checklist line. List any missing, duplicated, in the wrong step, or depending on a later step. Give the list as a table: state / render ID · where it should be · where it is now.
2. **Coverage — flows:** walk every path in `calling-flow/data.js` (Cat4, Pilot HA skipped, Pilot HA free, Pilot no HA free, side branches) and every app-logic journey (sign-in → OTP → offer / unlock → Home → case → Prescribe → call → ending → next case). For each, does a checklist "run" line test it end to end? List gaps.
3. **Rules and decisions:** each rule in app-logic §4 – §7 and each decision D-80 → D-87 that affects behaviour — is it in the checklist, stated correctly? Flag wrong or missing ones, quoting the source line.
4. **Readiness fixes:** every ⚠ / ❌ row in the readiness doc §3, §7 and §8 — handled in v3? List any not handled.
5. **Testability:** lines that are vague, duplicated, untestable as written, or have the wrong "How".
6. **Soundness:** anything in plan B1 – B15 or §4 that will break (state map generated from `data.js`, call simulator, settings file, deploy on request, polling, background, install).
7. **P1 – P5:** agree / disagree / can't judge, one line why.

## Rules
- **Read-only** for the review: write only your report file (and, for Claude Code, the Part 2 files). No other edits, no commits, pushes or PRs.
- Stay in scope: the prototype build. Out-of-scope ideas go in "Parked".
- Every finding cites the file and section it relies on. Say "unverified" when you couldn't check.
- Never write decisions or approvals in Apurva's name.

## Report
Claude Code → `docs/reviews/2026-11-05-plan-v3-review/claude-report.md`
Codex → `docs/reviews/2026-11-05-plan-v3-review/codex-report.md`

Format, short:
1. **Verdict:** ready to approve / approve with changes / not ready — one line.
2. **Blockers** (must change before building) — numbered: finding · source · suggested change.
3. **Should change** — same format.
4. **Coverage tables** (questions 1 and 2).
5. **Nice to have** — one line each.
6. **Source errors** (in frozen files, not the drafts) — one line each.
7. **P1 – P5** — table.
8. **Parked.**
Then stop.
