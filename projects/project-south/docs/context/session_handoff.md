# session_handoff.md — Project South
**Last updated:** 2026-09-29
**Current owner/session:** Claude (this session)
**Status:** active — ideation phase, nothing built

---

## 1. Current implementation state
Nothing built. This is pure PM ideation — no code, no schema changes made yet. Project South does not exist as a scoped/funded initiative anywhere else in the org's roadmap docs (confirmed via repo search).

## 2. Latest completed work
- Full repo research on current Dr-call portal/assignment flow, doctor data model, and discard documentation (summarized in chat 2026-09-29; sources indexed in `docs/context/narration_log.md` Entry 1).
- Formalized Swapnil's baseline proposal as "Layer 0" and ran a deep stakeholder + edge-case + alternatives brainstorm: `docs/brainstorm/solution-layers.md`.
- Logged raw narration for continuity: `docs/context/narration_log.md`.
- Captured locked facts / never-invent list: `docs/context/project_truth.md`.
- Captured 9 open decisions blocking Layer 1 design: `docs/context/open_questions.md`.

## 3. Files changed recently
- `docs/context/narration_log.md` — new, raw narration capture (append here going forward)
- `docs/context/project_truth.md` — new, locked facts + Layer 0 proposal summary
- `docs/context/open_questions.md` — new, 9 open decisions (OQ-1 through OQ-9)
- `docs/brainstorm/solution-layers.md` — new, the main deep-dive deliverable

## 4. Validation status
- Not applicable — no code. Content is PM analysis grounded in repo research (HGS PRD/SOPs, tm-chotu knowledge docs, roadmap docs) cited by file path throughout.

## 5. Known gaps and open decisions
See `docs/context/open_questions.md` — most critical: OQ-1 (does doctor `language` really exist in prod, where) and OQ-3 (per-language doctor supply) — both block sizing the central risk identified (pool-starvation on the fallback path, solution-layers.md §2.1).

## ▶▶▶▶▶ CURRENT (narration Entry 14)
**PRD v1 written:** `archives/projects/2026-09-29-project-south-language-routing-v1.md`. It uses the style of the sample PRD `2026-08-18-doctor-consultation-callback-v1.md`, as Swapnil asked: human, lean, focused on problem / feature / journeys / stakeholders.
- Not committed or pushed. Ask before `scripts/commit-and-push.sh`.
- Open items in PRD §13: go-live minimum per language; C1/C2 confirmation; pilot language; conflict with the call-back card's 5-minute promise; the 2h value.

## ▶▶▶▶ Earlier (narration Entry 13)
The allocation logic is FINAL in `docs/solution/allocation-logic.md` (rewritten):
- NFS is never routed by language;
- LIFO → FIFO is kept;
- Language Pool → normal flow after T operational hours;
- the availability flag is used;
- R7 is a condition;
- Super Doctor manual assign bypasses the language check;
- nudges are future scope.

Only C1 and C2 are left to confirm (§9). Next: Step 7 (supply / go-live minimum N) and Step 8 (pilot / metrics). Then consolidate everything into the final solution doc (v3).

## ▶▶▶ Earlier (narration Entry 12)
The release and no-doctor-available spec is written in `allocation-logic.md` §4 (R1–R8, N1–N8). The T clock counts **working hours** (08:00–22:00). Waiting for Swapnil to confirm. Also need Eng to confirm doctor online/available status is tracked. Still open: AL-D2 to AL-D5. Then Step 7 (supply / go-live gate) and Step 8 (pilot / metrics).

## ▶▶ Earlier (narration Entry 11)
- Steps 1–2 are closed as data provided by the business, loaded by Tech.
- **Allocation logic is drafted in `docs/solution/allocation-logic.md`:**
  - order tag at pool entry;
  - three pool states: Language Pool / Released / Assigned;
  - priority for doctors who speak L;
  - fallback via max wait T;
  - extensions to the Super Doctor pending view and manual assign.
- Waiting on Swapnil for AL-D1 to AL-D7.
- Then Step 7 (supply / go-live gate) and Step 8 (pilot / metrics).

## ▶ Earlier (narration Entry 9)
**Working doc: `docs/solution/step-by-step.md`.** The solution is one language per pincode. A language mix per pincode is future scope. We go one step at a time through 8 steps. **Step 1 is closed (Entry 10).** The DB has no language data today. A new comma-separated `doctor_languages` column is loaded from Ops' data. See step-by-step.md §1.10. Small confirmations S1-C1 to S1-C4 are pending. **Next: Step 2** (pincode → language master, including how mixed-city pincodes get a single language). After all steps close, fold the result into a final solution doc.

## 5-now+1. Earlier thread (narration Entry 8)
Brainstorming mixed cities: v2's open decision D1 changed from "exclude them" to "handle them". Working doc: `docs/brainstorm/mixed-city-brainstorm.md`. The leading idea is a language mix per pincode plus a doctor coverage score, which is one rule for all of South. It can be seeded from past order outcomes. Waiting on Swapnil's answers to §7 of that doc. Once decided, fold the result into solution v2 (§5.2, §5.4).

## 5-now. Current state (as of narration Entry 7)
**`docs/solution/project-south-solution-v2.md` is the current solution.** It routes all South orders (FTC and NFTC). The sizing is accepted, and the pilot with a control group validates it. v1 is superseded. Next step: review v2 with Swapnil, starting with its open decisions D1–D8 (§11).

## 5-latest. Earlier state (narration Entry 6)
Scope is locked in `project_truth.md` §6 and the business case is in §7. The working doc is now `docs/brainstorm/south-scoped-brainstorm.md`, which is still in brainstorm mode. Next step: go through its §10 questions with Swapnil. Offer to check whether the gap is really language (§5: discard for orders that happened to get a local-language doctor vs orders that didn't).

## 5a. Earlier mode (narration Entry 5)
**Brainstorm mode, starting from the problem.** Swapnil does not want a final solution yet. North star: *language barrier is leading to discard*. The working doc is `docs/brainstorm/problem-first-brainstorm.md`. Solution v1 (below) is one possible direction and should not be presented as the answer.

## 5b. Earlier draft (narration Entry 4)
**`docs/solution/project-south-solution-v1.md` is the current standalone solution. It has no HGS references, per Swapnil's instruction.** Its §12 (D1–D9) replaces the older OQ list for solution work. `docs/brainstorm/solution-layers.md` is kept as history only.

## 6. Next exact step (superseded by 5b — review solution v1 with Swapnil, starting with D1 and D2)
Talk with Swapnil through the HGS PRD mapping (solution-layers.md §5), specifically OQ-10 (whether to stay in the ETA logic or move to pull-FIFO) and OQ-12 (reactive vs predictive routing). After that, get OQ-1 and OQ-3 answered, then design the fallback and category-intersection state machine.

HGS PRD source copy: `reference/PRD-HGS-Phase1-source.md` (narration Entry 3).

## 7. Do not change without approval
- Nothing locked/built yet to protect.

## 8. Notes for next engineer/session
- Start by reading this file, then `docs/context/project_truth.md`, then `docs/brainstorm/solution-layers.md`, then `docs/context/open_questions.md`.
- **Always append new user narration to `docs/context/narration_log.md` verbatim (typo-cleaned only) before/while responding — this is an explicit standing instruction from Swapnil (Entry 2), not a one-time request.** Do this every time he shares new ideation on Project South, in this session or a future one.
- Nothing here is committed to git yet — files exist in the working tree only, per repo git-safety rules (commit only when explicitly asked).
