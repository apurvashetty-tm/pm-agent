# PRD done-checklist: evidence

Checklist approved in `PRD-PLAN.md` §4 (28 lines). **auto** = `node docs/prd/check-prd.mjs` (run from the project folder). Status after the first draft, before the Codex review.

| # | Check | How | Status | Evidence |
|---|---|---|---|---|
| 1 | Sections match the plan | auto | PASS | check 1 |
| 2 | Executive summary alone tells what, why, what's open | eye | PASS | §1, five sentences |
| 3 | No "how" | eye | PASS | polling appears only as a labelled working default (§10); timing values are constraints in §7 |
| 4 | Setting values only in §7; three key rules stated once | auto + eye | PASS | check 4; the three rules live in §5.7 (gate, final button, unproven confirm), §3 and §10 only point to them |
| 5 | No AI tells or banned words | auto + eye | PASS | check 5; "unlock" is a product word here (Returning unlock) |
| 6 | No decision ids, rejected options or brainstorm residue | auto | PASS | check 6; ids live in `TRACE.md` |
| 7 | Owners on every open item; working defaults labelled | eye | PASS | §10, §7 `[working default]`, `[NEED]` tags |
| 8 | "case", never "order", for the doctor's unit of work | auto (list) + eye | PASS | check 8 lists 14 lines; each means the customer's order or order details |
| 9 | "attempted" / "connected" as Truemeds defines them | eye | PASS | §5.7, §11 |
| 10 | Partner names only in §3 and vendor questions | auto | PASS | check 10 |
| 11 | Quoted copy verbatim | auto | PASS | check 11, 74 quotes against the copy file and the pictures' text |
| 12 | Picture paths exist | auto | PASS | check 12, 16 links |
| 13 | Every rule traces; latest decision wins | eye (section level) | PASS | `TRACE.md` §1; §7 owners are Claude's proposal, flagged there |
| 14 | Fallback B is the launch flow; version A only in Annex A | auto + eye | PASS | check 14 |
| 15 | No calling-state list; nothing contradicts the flow page | auto + eye | PASS | check 15; rules compared with `calling-flow/data.js` and app-logic §5–7 |
| 16 | Every open OQ and D-83 engineering item in §10 or out of scope | auto | PASS | check 16 (18 open OQs, 5 engineering items) |
| 17 | No prototype-only values | auto | PASS | check 17 |
| 18 | State numbers only in captions | auto | PASS | check 18 |
| 19 | Every screen block opens with its job | auto | PASS | check 19, 19b |
| 20 | Built-this-way lines trace to the screen's job | eye | PASS (self-check) | Codex to re-check |
| 21 | Every one of the 148 states maps to a section or the flow page | auto | PASS | check 21; mapping in `TRACE.md` §2 |
| 22 | Each case type's outcome stated | eye | PASS | §5.7 table, §5.8 |
| 23 | Medicine-type table covers every form | eye | PASS | §5.10, 7 forms; printed lines from the pictures |
| 24 | Every 8 Oct PRD item placed | eye | PASS | R1, R2, R3, R6 → §10 "Not decided since the 8 Oct draft"; R4 substitution and R5 in-app calling → §9 Out; Phase 2 items → §9 Out |
| 25 | Metrics defined with source; baselines marked | eye | PASS, open | §11 marked Proposed (Q1 open) |
| 26 | Codex review once, `review-prd` rubrics | Codex + eye | PENDING | `reviews/CODEX-BRIEF.md` |
| 27 | Pictures render in the markdown viewer | eye | PENDING | open `PRD.md` in VS Code / GitHub preview (relative paths) |
| 28 | Only `docs/prd/` written by this thread | eye | PASS | every write went to `docs/prd/`; check 28 lists 31 `ui-screens/` changes from the build thread (D-92 re-renders, copy keys) |

## Found while drafting

- Stale lines in the frozen inputs (copy file and pictures win): `TRACE.md` §3. For the build thread, not fixed here.
- The build thread has uncommitted changes in the same folder. The PRD files are not committed yet, to avoid two threads running git in one folder at once.
