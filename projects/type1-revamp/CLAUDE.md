# Type 1 Revamp — Claude Rules

## What this project is
Revamp of Truemeds' **Type 1 (Rx-only, `ORDER_TYPE 52`) order journey**: how a prescription upload becomes an order, how the pharmacist Type 1 queue allocates it, and how the pharmacist portal helps convert it (search, OOS, coupons, leads). Goal: OP 1,333 → 1,750/day and OD 133 → 250/day (`docs/00-opportunity-sizing.md`).
Discovery + PRD workspace (markdown). Not a code build. The portal HTML under `reference/portal/` is a reference copy, not something to modify.

**Start every session with `CONTINUITY.md`.**

---

## Workspace memory
Before project-specific work, also read:
- `../../AGENTS.md`
- `../../context/Claude.md`
- `../../knowledge/context/tm-chotu/` (Type 1 definitions, status codes). Only Type 1-relevant parts (rule R2).

Use project-local files for project truth and handoff. Use root knowledge files only for reusable company/system context.

---

## Read these files before making any decision
1. `CONTINUITY.md`
2. `docs/context/session_handoff.md`
3. `docs/context/project_truth.md`
4. `docs/context/decision_log.md`
5. `docs/context/open_questions.md`
6. `docs/context/narration_log.md` (latest entries)

---

## Priority order
1. **Latest user instruction**: always wins
2. **`docs/context/project_truth.md`**: confirmed truth
3. **`docs/context/decision_log.md`**: dated decisions
4. **`docs/context/session_handoff.md`**: current resume point
5. **`docs/context/open_questions.md`**: never silently answer these

If two sources conflict, follow the higher one and surface the conflict.

---

## Core rules (see CONTINUITY.md §2 for the full list)
- **Stepwise:** Evaluation → Critique → Brainstorm → Finalise. Stop after each step; wait for an explicit go-ahead.
- **Type 1 only:** no allocation/ranking logic imported from doctor pool, HGS, ACOM or Project South.
- **No app release** for current workstreams: backend + pharmacist portal only.
- **Min effort, max impact**, one workstream at a time.
- Don't invent product logic; mark `[OPEN]` and add to `open_questions.md`.
- Don't commit/push unless asked.

---

## Never silently invent final truth for
Order statuses and their meaning, allocation/ranking rules, pricing/coupons, stock/OOS, customer consent, call/DNC rules, metrics definitions (OP/OD).

---

## Decision labeling rule
- `[LOCKED]` / `[CONFIRMED]`: decided by Swapnil, must be followed
- `[RECOMMENDED]`: best current suggestion, open to override
- `[INFERRED]`: reasoning, to validate with data
- `[OPEN]` / `[OPEN DECISION]`: needs Swapnil's confirmation

---

## End of session
Follow `CONTINUITY.md` §5: append narration, log decisions, update open questions, handoff and the CONTINUITY status table.
