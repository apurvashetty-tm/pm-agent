# JAS Q2 CEO Operating Plan

Project builds July-September JAS operating plan for CEO review.

## Current phase

Phase 4 structure baseline approved under `DEC-01`: Pages 1-11 sequence/jobs/takeaways and Page 12 purpose are frozen. Post-freeze source commit, run manifest, and provider worktrees are next. No page prose, Claude drafting, or final deck production yet.

## Canonical read order

1. `docs/context/project_truth.md` - strategy, outcome tree, initiative definitions.
2. `docs/context/evidence_register.md` - claims, sources, status, allowed wording.
3. `docs/context/open_questions.md` - unresolved decisions, data, owners, dates, blockers.
4. `working/03_operating_plan_blueprint.md` - frozen Pages 1-11 spine plus provisional Page 12 treatment.
5. `working/04_analytics_request_pack.md` - assignable DR-01 to DR-15 measurement contract.
6. `working/page_packets/README.md` then `page_01.md` to `page_12.md` - bounded inputs for future page authors.
7. `working/05_phase3_review_pack.md` - evidence posture, page readiness, decision recommendations, kill-assumptions, and Phase 4 gate.
8. `docs/context/creative_brief.md` - narrative and visual freedom.
9. `docs/process/agent_runbook.md` - independent drafting, review, synthesis, Terminal workflow.
10. `docs/context/session_handoff.md` - current state only.

Original chat is provenance, not dependency. New decisions must enter canonical files before agent runs.

## Folder map

```text
docs/context/   canonical strategy, evidence, decisions, creative brief, handoff
docs/process/   agent workflow and file ownership
docs/roles/     PM working posture
inputs/         immutable evidence and whiteboards
working/        frozen blueprint, Analytics request pack, page packets, and review/run records
references/     archived/superseded context only
outputs/        approved stakeholder artifacts only
```

Future `runs/<run_id>/` folders are created only when independent drafts begin.

## Guardrails

- One initiative, one primary home.
- Numeric claims require evidence-register IDs.
- CONFLICTED claims never enter CEO narrative.
- Page 11 uses initiative lifecycle, not engineer lanes.
- Page 12 is written last.
- Claude first enters in Phase 5, after Phase 4 freeze and post-freeze commit.
- Codex and Claude use same committed source SHA and separate output paths.
- Archived references never override canonical files.
