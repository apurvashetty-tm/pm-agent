# Terminal brief: Claude + Codex review loop on the doctor app PRD

Work in `projects/truemeds-doctor-portal-prototype` (paths below are relative to it).

You are the fixer in a capped review loop on `docs/prd/PRD.md` ("Truemeds For Doctors - App_PRD", v0.1). Codex is the reviewer. Read first: `docs/prd/PRD-PLAN.md` (structure + 28-line checklist), `docs/prd/reviews/CODEX-BRIEF.md` (Codex's instructions and the agreed choices), `docs/prd/TRACE.md`, `../../templates/lean-prd-guide.md`.

**Each round n (max 3):**
1. Run `node docs/prd/check-prd.mjs`.
2. Run Codex non-interactively with the brief and save its stdout: `codex exec "$(cat docs/prd/reviews/CODEX-BRIEF.md)" > docs/prd/reviews/codex-round-n.md` (no `timeout`; macOS doesn't have it). If Codex reports a usage limit, stop and write LOOP-REPORT.md with the retry time. From round 2 on, also give Codex the previous `merge-round-(n-1).md` and tell it: don't re-raise a rejected point unless you cite new evidence from a source file.
3. Triage every finding in `docs/prd/reviews/merge-round-n.md`, one row each: finding · severity · verdict (ADOPT / REJECT / DOUBT / NEEDS-APURVA / OUT-OF-SCOPE) · one-line reason · source checked (file:line). Verify every fact claim against the frozen sources yourself; Codex lacks context and can be wrong.
4. Apply all ADOPT rows in one pass. Re-run the checks; all must pass.
5. Bump the draft version in the PRD header (v0.2, v0.3…).

**Stop** when a round has zero P0 and you adopted no P1, or after round 3, whichever comes first. Never run a 4th round.

**Hard rules:**
- The agreed choices in the brief are locked. A finding against one is REJECT.
- A finding that needs a product decision is NEEDS-APURVA: list it, don't decide it, don't write a working answer into the PRD.
- Facts only from the frozen sources (ui-screens/, app-logic.md, feedback-state-map.md, decision log ≤ D-92, calling-flow/data.js, messages.json, visible-strings.json, open_questions.md). Copy file and pictures win over older docs.
- No new sections. Don't let it grow: if `wc -w docs/prd/PRD.md` ends more than 10% above v0.1 (7057), cut or justify each addition in the merge file.
- Write only in `docs/prd/`. No git commits (the build thread shares this folder). No decision log, no Confluence, nothing in Apurva's name.
- Lean guide voice: plain words, say it once, no AI tells, no decision ids in the body (TRACE.md gets them).

**At the end** write `docs/prd/reviews/LOOP-REPORT.md`: rounds run and why it stopped; P0/P1/P2 per round; what changed (one line each); rejected points with reasons; NEEDS-APURVA list; OUT-OF-SCOPE items with where they belong; check-prd result; CHECKLIST.md lines updated. Then stop and tell Apurva the loop is done.
