# Context primer — ACOM (Assisted Commerce)

*Scoped `CLAUDE.md` for this umbrella folder. Read before any sub-initiative's own `CLAUDE.md`.*

## Workspace memory

Before project-specific work, also read:
- `../../AGENTS.md`
- `../../context/Claude.md`
- relevant files in `../../knowledge/context/`

Use project-local files for project truth and handoff. Use root knowledge files only for reusable company/system context.

## What this is
**ACOM (Assisted Commerce)** is the umbrella for cart-recovery / cart-dropout work at Truemeds — reaching customers who abandoned an in-progress order (an "incomplete order") and helping them complete it, whether that reach-out is a human agent call, an AI voice call, or something else.

Each way of catering to this problem is a sub-folder here:
- **`ring-ai/`** — AI voice pre-qualification via Ring AI, the first vendor in this space. Current build: the Rapid Pilot bolt-on to the ACOM "Assign Order" flow. See `ring-ai/CLAUDE.md`.
- **`ftc-priority/`** — quick-win change to prioritize FTC customers (via `iod.is_ftc`) ahead of the existing queue, to cut CAC: one FTC-priority query, gated on an ₹700 AOV threshold, in front of the unchanged BAU query. Independent of `ring-ai/`, ships before it. Spec complete, in review. See `ftc-priority/CLAUDE.md`.
- *(future sibling initiatives — other vendors, manual-outreach experiments, query/cohort changes on the same incomplete-order problem — get their own folder here, alongside the above.)*

## Shared problem, not shared implementation
Sub-initiatives may target the same underlying data (`incomplete_order_details`, `order_details`, `sub_order_details`, `call_details` — see `ring-ai/CLAUDE.md` for the schema detail) but each owns its own build, PRD, and guardrails. Don't assume settled decisions in one sub-initiative (e.g. Ring AI's lock/outcome model) apply to another unless explicitly carried over.

## Pointers
- Ring AI (current, active) → `ring-ai/CLAUDE.md`
- FTC Priority (spec complete, in review) → `ftc-priority/CLAUDE.md`
- Confluence: *ACOM 2.0 — Ring AI Rapid Pilot PRD* (page 1850114059, space PROD) — Ring-specific, not the umbrella
- Confluence: *ACOM — FTC Priority* (page 1981251599, space PROD) — FTC-specific, not the umbrella
