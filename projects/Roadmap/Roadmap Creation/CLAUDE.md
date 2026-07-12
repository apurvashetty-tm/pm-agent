# Q2 Portals & Payments Roadmap — Claude Rules

## What this project is

This is the Q2 (July–September) product roadmap for Apurva's charters at Truemeds: Portals (Doctor, HA, Assisted Commerce, CSR/Kapture) and Payments.

It is a planning artifact — a roadmap workbook plus supporting strategic context — not a code-build project. No code ships from this folder.

---

## Workspace memory

Before project-specific work, also read:
- `../../../AGENTS.md`
- `../../../context/Claude.md`
- relevant files in `../../../knowledge/context/`

Use project-local files for project truth and handoff. Use root knowledge files only for reusable company/system context.

---

## Read these files before making any decision

1. `docs/context/project_truth.md`
2. `docs/context/session_handoff.md`
3. `docs/roles/product_manager.md`
4. `docs/context/open_questions.md`

---

## Priority order

1. **Latest user instruction** — always wins
2. **`docs/context/project_truth.md`** — locked roadmap truth, cannot be invented around
3. **`docs/context/session_handoff.md`** — current resume point and latest state
4. **`docs/roles/product_manager.md`** — roadmap working rules
5. **`docs/context/open_questions.md`** — unresolved decisions that must not be silently answered

If two sources conflict, follow the higher-priority source and surface the conflict rather than silently blending.

---

## Core rules

- Stay at roadmap altitude: initiative name, metric home, type, timing, risk. Do not design exact UX flows, taxonomies, or spec-level detail unless explicitly asked.
- Do not brainstorm and edit in the same breath — iron out a section in discussion first; only write to the roadmap file when told to go ahead.
- Do not invent baselines, capacity figures, completion status, or internal operational facts.
- This quarter's roadmap is intentionally raw (no real baselines yet) — that is expected, not a gap to fix by inventing numbers.
- Work section-by-section (one bet at a time) when refining, not the whole roadmap at once.
- Keep the roadmap sheet itself filterable and tag-based — short tags, not repeated paragraphs. Long reasoning belongs in `project_truth.md` or chat, not in a spreadsheet cell.

---

## What requires explicit user confirmation before implementing

Do not silently decide or implement the following — ask first:
- CPO official definition (Finance-owned)
- Current payment production rollout coverage
- Scope of "100% Doctor audit coverage"
- Returns/refunds baseline figures
- Any change to team capacity assumptions
- Any change to which bets/initiatives are Q2-committed vs Q3-deferred

If one of these surfaces and no clear answer exists, mark it `[OPEN DECISION]` and add it to `docs/context/open_questions.md`.

---

## Never silently invent final truth for

- Finance-owned cost definitions (CPO)
- Team capacity
- Baseline figures not yet measured
- Doctor Portal classification/eligibility logic (owned by the `truemeds-doctor-portal-prototype` project — see its own `docs/context/open_questions.md`, not this one)

---

## Decision labeling rule

- `[LOCKED]` — already decided, must be followed exactly
- `[RECOMMENDED]` — best current suggestion, open to override
- `[OPEN DECISION]` — requires user confirmation before implementing

(No `[MOCK ASSUMPTION]` label here — that's for code-build projects. Roadmap items instead carry a `Q2 Role` tag: Discovery / Discovery + Delivery / Delivery / Correctness / Pilot.)

---

## Reporting rule after every roadmap task

After each roadmap edit, output a short structured report:
1. **What changed** — plain English summary
2. **What was intentionally not changed** — and why
3. **Open items still pending user confirmation**
4. **Manual review plan** — 2–3 things for the user to check

Before this report, update `docs/context/session_handoff.md` with current status, files changed, and next exact step.

---

## Final principle

Build a roadmap a CXO can read start to finish without confusion. Preserve capacity discipline — challenge scope that doesn't fit the team. Stop and ask where the decision belongs to the user.
