# Terminal brief 2: Codex confirmation round on the doctor app PRD (v0.4)

Work in `projects/truemeds-doctor-portal-prototype` (paths below are relative to it). Write only in `docs/prd/`. No git commits, no decision log, nothing in Apurva's name.

You are the fixer; Codex is the reviewer. Read first: `docs/prd/PRD-PLAN.md`, `docs/prd/reviews/CODEX-BRIEF.md` (agreed choices, format), `docs/prd/reviews/FINAL-PASS.md`, `docs/prd/TRACE.md`.

**What changed since Codex last looked (v0.1):** the two calling-rule fixes (who decides validity; confirm with no call result), Prescribe choice lists, §7 settings, §9 / §10 old-PRD items, §11 measures (decided by Apurva), the §4 happy-path strip, and the D-93 line in §5.3. See `git diff a63ad3a -- docs/prd/PRD.md`.

**Decided by Apurva on 9 Nov (locked, don't flag):** §11 goal, primary measure and guardrail; §7 owners; the old-PRD items in §9 Out; masking / recording open for Legal; the §4 strip.

## Steps

1. Run `node docs/prd/check-prd.mjs`.
2. Run Codex once and save its stdout: `codex exec "<prompt>" > docs/prd/reviews/codex-round-2.md` (no `timeout`). The prompt is `CODEX-BRIEF.md` plus this:
   - Review the diff since v0.1 first, then re-check the whole of §5.7, §5.8 and §5.9 against `ui-screens/app-logic.md` §4–§7 and `calling-flow/data.js`.
   - Also check §5.3 against decision D-93 in `docs/context/decision_log.md`.
   - Then write `docs/prd/reviews/rule-tests.md`: one test case per rule in §5.7–§5.9 and §7 (given / when / then, the source line it proves). Flag any rule you can't write a test for as unclear.
   - Don't re-raise points already judged in `merge-round-1.md` / `FINAL-PASS.md` unless you cite new evidence.
3. Triage every finding in `docs/prd/reviews/merge-round-2.md` (verdict, one-line reason, source checked), verifying facts yourself.
4. Apply ADOPT rows in one pass, bump to v0.5, re-run the checks (all must pass). Keep growth under 5%.
5. If a P0 remains after the fix, run Codex once more on that point only. Never more than that.

## Report

Write `docs/prd/reviews/LOOP-REPORT-2.md`: P0 / P1 / P2 found, what changed, rejected points, NEEDS-APURVA (only true product decisions), check result, and whether `rule-tests.md` found unclear rules. Then stop and tell Apurva it's done.
