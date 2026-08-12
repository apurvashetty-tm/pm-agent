# Agent Instructions

This workspace contains multiple projects under `projects/`.

Use project-local files as the source of truth. Do not rely on chat history when
the same information should live in the project folder.

If instructions conflict, follow this order:
1. Latest user instruction
2. Active project's `docs/context/project_truth.md`
3. Active project's `CLAUDE.md`
4. This file
5. Reusable knowledge files

## Before working on a project

1. Identify the active project folder under `projects/`.
2. Read `context/Claude.md` for global Truemeds context.
3. Read relevant files in `knowledge/context/` when the task touches reusable
   company, system, metric, or role knowledge.
4. Read that project's `CLAUDE.md`.
5. Read `docs/context/project_truth.md`.
6. Read `docs/context/session_handoff.md` if it exists.
7. Read `docs/context/open_questions.md`.
8. Read any role file relevant to the task, such as `docs/roles/frontend_engineer.md`.
9. Continue from `session_handoff.md` unless the user gives newer instructions.

If a project does not have these files, use `templates/project-scaffold/` as the
model for creating them.

## Truemeds domain questions — mandatory routing (tm-chotu)

**Trigger — check this before answering, not after:** the question touches Truemeds
business, product, ops, data, or systems — definitions/acronyms, order lifecycle,
substitution, DB/table names, a metric (GMV, FTC, ROAS, AOV, TS, etc.), customer
cohorts, inventory/stock, TAT/SLA, org/team ownership, or any Truemeds-specific term
you are not 100% certain of. This applies in every tool, not just Claude Code — there
is no auto-loading hook here; you only get this knowledge by actually reading the
files below.

On trigger, before answering:

1. Read `knowledge/context/tm-chotu-integration.md` (read order + truth-handling rules).
2. Read `knowledge/context/tm-chotu/skills/using-tm-chotu/SKILL.md` (entry point).
3. Load **only** the matching domain skill(s) below — not all of them.

| Question is about... | Read this file |
|---|---|
| Company overview, GMV/MAU/AOV, business model | `knowledge/context/tm-chotu/skills/tm-chotu-overview/SKILL.md` |
| Who owns X / which team handles Y | `knowledge/context/tm-chotu/skills/tm-chotu-functions/SKILL.md` |
| Customers, FTC, Gold/Silver/Bronze, retention, DCOE cohorts | `knowledge/context/tm-chotu/skills/tm-chotu-customer/SKILL.md` |
| CM-high / generic champions / coupon-dependent / `cm_net` / reproduce a DCOE cohort on Metabase | `knowledge/context/tm-chotu/skills/tm-chotu-dcoe-cohorts/SKILL.md` |
| Order lifecycle, RTO chain, Rx review, substitution path (the flow, not the algo) | `knowledge/context/tm-chotu/skills/tm-chotu-business-flows/SKILL.md` |
| How a module/engine works — substitution algo, search, WH assignment, picklist, putaway, logistics, fraud, portals | `knowledge/context/tm-chotu/skills/tm-chotu-modules/SKILL.md` |
| Inventory, stock, OOS, JIT vs inventory, backorder, cold chain, MFC vs FC stock | `knowledge/context/tm-chotu/skills/tm-chotu-inventory/SKILL.md` |
| TAT, SLA, OTIF, PDD, courier/Doctor/Pharmacist/Putaway/RTO TAT, any X→Y delay | `knowledge/context/tm-chotu/skills/tm-chotu-tat/SKILL.md` |
| Which DB has X / where data lives | `knowledge/context/tm-chotu/skills/tm-chotu-data-sources/SKILL.md` |
| Enum/status code lookup ("status 55", "61 vs 62"), table schema | `knowledge/context/tm-chotu/skills/tm-chotu-tables-enums/SKILL.md` |
| SQL recipe, "how do I join X to Y" | `knowledge/context/tm-chotu/skills/tm-chotu-joins/SKILL.md` |
| "What does X mean", define a term, FTC vs FOP, ROAS vs CAC | `knowledge/context/tm-chotu/skills/tm-chotu-definitions/SKILL.md` |
| Named project (DCOE, TMEXP1/3/4, tm-po-analytics, search-validator, tm-fraud-engine) | `knowledge/context/tm-chotu/skills/tm-chotu-projects/SKILL.md` |
| Any number/metric/count/date/% being pulled or estimated | **Also** read `knowledge/context/tm-chotu/skills/tm-chotu-query-rigor/SKILL.md` + `METRIC_CATALOG.md` before answering |

Hard rules — these replace what the Claude Code plugin's hook would otherwise enforce
automatically, so apply them manually here:

- Never state a metric without citing source table + DB + time window.
- Never accept "all time / since launch / lifetime / ever" as a query window — cap at
  3 months by default; only widen if the user pushes after you flag it.
- `customer_order_rank` and `cx_lifetime_metrics.chronic_flag` are known-broken —
  don't use them; use the on-the-fly derivations noted in the relevant skill file.
- Treat `KNOWLEDGE_DUMP.md` as dated reference, not live truth, for anything you'd
  otherwise use a domain-skill file for.
- If nothing loaded covers the question, say so explicitly rather than guessing, and
  draft a gap note at `knowledge/context/tm-chotu/SKILL_REQUESTS/<date>_<topic>.md`.

## Knowledgebase

- `context/Claude.md` holds short global Truemeds/team context.
- `knowledge/context/` holds reusable company, system, metric, glossary, and
  user-role knowledge.
- `knowledge/context/tm-chotu/` holds the preserved tm-chotu package — see the
  mandatory routing section above for how/when to read it.
- `knowledge/decisions/` holds durable dated decisions.
- `knowledge/learnings/` holds retrospectives, patterns, and reusable learnings.
- Do not bury reusable company/system knowledge only inside a project handoff.
- Do not move project-specific resume state into `knowledge/`; keep it in the
  active project's `docs/context/session_handoff.md`.

## During work

- Follow latest user instruction first.
- Preserve locked truth in `docs/context/project_truth.md`.
- Do not invent product, backend, UX, pricing, permission, or state behavior.
- If a decision is missing, mark it `[OPEN DECISION]` and add it to
  `docs/context/open_questions.md`.
- Keep edits scoped to the active project unless the user asks for shared
  workspace changes.

## After coding

1. Update `docs/context/session_handoff.md` with:
   - current status
   - files changed
   - validation done
   - known gaps
   - next exact step
2. Update `docs/context/open_questions.md` if new unresolved decisions appeared.
3. Update `knowledge/context/`, `knowledge/decisions/`, or
   `knowledge/learnings/` if the session created reusable company knowledge.
4. Do not modify `docs/context/project_truth.md` unless the user explicitly locks
   a new truth.
5. Report files changed, what changed, assumptions, placeholders, and test plan.

## Git safety

- Do not reset, checkout, or delete user work unless explicitly asked.
- Before syncing with GitHub, check `git status --short --branch`.
- Pull with fast-forward only when bringing down remote changes.
- Keep local project files and handoff files committed together when possible.
