# session_handoff.md — Type 1 Revamp
**Purpose:** Exact resume point. Short enough to read every session. (Start with `../../CONTINUITY.md`.)
**Last updated:** 2026-10-13
**Current owner/session:** Claude (with Swapnil)
**Status:** active

---

## 1. Current state
- Steps 1–2 (Evaluation, Critique) done. Portal analysis done. Business case captured.
- **W1a OMS: closed for now (D35), PRD v0.2 (D36: no validity gate, tag only).** `docs/10-oms-prd.md`. Open: E1–E4 (engineering), P1–P7 (product).
- **W1b Allocation (next candidate, now includes never-verified V from `08` §11):** `docs/05-allocation-current-logic.md`. Current logic, discovery problem (§3) and improvement scope A1–A6 (§4) captured. **Waiting for go-ahead to brainstorm fixes.**

## 1b. Portal approach
D34: no revamp; current portal + small changes until Portal Unification. Road ahead `docs/09-portal-road-ahead.md` (awaiting review; RQ1 CTA wording, RQ2 Now/Later).

## 2. Latest completed work (2026-10-09)
- Recorded hours (09:00–19:00), Hold (1 h out of the queue when a call doesn't connect), Schedule (customer-requested delay).
- Added discovery problem + scope A1–A6.
- Moved project from `projects/type1-order-flow/` to `projects/type1-revamp/`; created CONTINUITY.md, CLAUDE.md, narration_log, decision_log, project_truth, open_questions.

## 3. Files changed recently
- `CONTINUITY.md`, `CLAUDE.md`: new
- `docs/context/{narration_log, decision_log, project_truth, open_questions}.md`: new
- `docs/05-allocation-current-logic.md`: Type 1 isolated; §3 problem, §4 scope
- `docs/parked-other-module-allocation.md`: other-module logic, reference only

## 4. Validation status
- Portal analysed by running `reference/portal/pharmacist-portal.html` locally with the sample-data overlay in `reference/portal/tools/` (load `overlay.js`, then `go.js`; patch `this.state.genderList.map(` → `(this.state.genderList||[]).map(` in the payload to avoid crash P19). Serve over http from a non-Documents folder (macOS blocks python http.server from reading Documents).
- Nothing committed to git. Local pm-agent `main` has 3 unpushed Project South commits and has **diverged** from `origin/main` (Apurva's update): needs merge/rebase before any push.

## 5. Known gaps and open decisions
See `open_questions.md`. Allocation: AQ1–AQ6. Engagement: EQ1–EQ8.

## 6. Next exact step
Swapnil reviews `docs/11-problem-statement.md` (PRD feedback, D37) → fold into PRD §2 (remove numbers there per R9) → break problems into workstreams.

## 7. Do not change without approval
- `project_truth.md` (Swapnil only)
- Rules in CONTINUITY.md §2
- `reference/` contents (source evidence)

## 8. Notes for next session
- Read `CONTINUITY.md` first; append to `narration_log.md` as Swapnil talks.
- Don't import other modules' allocation logic (D09).
- Don't propose app-release changes for current workstreams (D05).
