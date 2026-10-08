# Portal Unification (ACOM Portal Revamp) — Context primer

*Scoped `CLAUDE.md` for this folder. Read before any sub-project's own files —
currently just `My Statistics Page/`.*

## Workspace memory

Before project-specific work, also read:
- `../../../AGENTS.md`
- `../CLAUDE.md` (ACOM umbrella)
- relevant files in `../../../knowledge/context/`

## What this initiative is

Apurva's initiative to enhance Truemeds' multiple internal agent/doctor portals —
individually or in milestones first — leading toward unification. Expect sub-projects,
brainstorming, PRDs, portal designs, and prototypes to accumulate under this folder
over time; it isn't one single build.

**First shipped sub-project:** `My Statistics Page/` — a redesigned My Statistics page
for the ACOM agent portal, with its own PRD (`PRD-My-Statistics.md`) and a working
prototype.

## Sub-initiatives (proposed direction, not yet PRD'd)

These were captured from an earlier chat thread (Sep 2026) and are still at the
brainstorming stage — nothing below is locked:

- **Unified portal experience.** A shared frontend/feature layer for calling +
  commerce (create/edit order) across portals — ACOM, Pill Reminder, Type 1, Discard,
  Create New Order, HA — so agents can be organized by skill (e.g. a pharmacist for
  Type 1/HA, sales for the rest) and move fluidly between portals instead of each
  portal being a separate silo.
- **Configurable Lead Management System (LMS).** Define and update lead-routing rules
  per portal in config, replacing static per-portal routing logic, to enable faster
  experimentation with how leads get assigned.
- **Push-based agent/doctor allocation.** Push orders to agents/doctors to
  accept/decline, instead of today's pull-based "Assign" CTA — to actually instrument
  availability/efficiency (currently manual/unmeasured) and enable allocation
  experiments. Also addresses doctors (non-payroll) marking themselves available
  without processing orders.

## Priority order

1. Latest user instruction
2. This folder's own locked facts, once a `project_truth.md` exists for a given
   sub-project (e.g. `My Statistics Page/PRD-My-Statistics.md` for that page)
3. This file
4. `knowledge/context/`

Until a sub-initiative above gets its own PRD, treat it as a direction to debate, not
a spec to build against.
