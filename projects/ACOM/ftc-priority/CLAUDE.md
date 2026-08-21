# Context primer — ACOM × FTC Priority

*Scoped `CLAUDE.md` for this project folder. Fast onboarding for any agent working on this project: current state, the rules of the road, and where the detail lives.*

## Workspace memory

Before project-specific work, also read:
- `../../../AGENTS.md`
- `../../../context/Claude.md`
- relevant files in `../../../knowledge/context/`
- `../CLAUDE.md` (ACOM umbrella — the cart-recovery problem this initiative serves, and its sibling initiatives)

Use project-local files for project truth and handoff. Use root knowledge files only for reusable company/system context.

## What this is
Quick-win, immediate fix to the **current BAU cart-recovery process** —
independent of `ring-ai/`, ships **before** it. Not a new vendor, not a new
build track: an addition to the existing lead-selection query.

Status: **brainstorming stage** — scaffolding only, no query/logic decided yet.

## Why
Reduce CAC by converting more new customers. Cart-recovery outreach today
treats all incomplete orders alike; this adds an FTC-priority pass so
new-customer carts get worked ahead of the BAU queue.

## Working definition (locked by user, this session)
FTC = customer with **zero delivered orders** in `order_details`.
- Ignore returns, partial returns — they don't count against/for this.
- `[OPEN DECISION]` Reconcile against org-wide FTC definition (tm-chotu) before
  this ships — may already differ (delivered vs. placed, time window, etc).

## Relationship to ring-ai/
No dependency. `../ring-ai/CLAUDE.md` is read-only reference for understanding
today's process/query (`incomplete_order_details`, `assigned_to`, BAU query
shape) — nothing here waits on or feeds into Ring AI.

## Open questions
- Exact insertion point: new query *in addition to* BAU (as stated) — does it
  run first, or interleave? What breaks the tie among multiple FTC carts?
- Priority mechanism: separate query tier, or a sort/weight added to BAU output?
- Any cap/throttle, or unlimited FTC-first?

## Pointers
- Current-process reference (read-only) → `../ring-ai/CLAUDE.md`
- ACOM umbrella → `../CLAUDE.md`
