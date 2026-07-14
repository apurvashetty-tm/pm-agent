# JAS Q2 CEO Operating Plan

Project builds July-September JAS operating plan for CEO review.

## Current phase

Page 11 working lifecycle and capacity inputs are committed at provider source SHA `bca3838f5b74db0bf50957ce1e19abc4547fa4b7`; both Codex and Claude worktrees are pinned to it. Phase 5 Terminal prompts and launch guide are prepared but not approved or launched. No page prose, Claude drafting, or final deck production has begun.

## Canonical read order

1. `docs/context/project_truth.md` - strategy, outcome tree, initiative definitions.
2. `docs/context/evidence_register.md` - claims, sources, status, allowed wording.
3. `docs/context/open_questions.md` - unresolved decisions, data, owners, dates, blockers.
4. `working/03_operating_plan_blueprint.md` - frozen Pages 1-11 spine plus provisional Page 12 treatment.
5. `working/04_analytics_request_pack.md` - assignable DR-01 to DR-15 measurement contract.
6. `working/page_packets/README.md` then assigned page packets - bounded inputs for future page authors. Phase 5 Pass 1 reads `page_01.md` to `page_11.md` only; `page_12.md` remains coordinator-only until synthesis.
7. `working/05_phase3_review_pack.md` - evidence posture, page readiness, decision recommendations, kill-assumptions, and Phase 4 gate.
8. `working/06_phase4_run_manifest.md` - frozen source SHA, provider isolation, release scope, and launch gates.
9. `working/phase5_prompts/README.md` - proposed quality-first models, exact Terminal commands, output paths, and review rule; not launch authorization.
10. `docs/context/creative_brief.md` - narrative and visual freedom.
11. `docs/process/agent_runbook.md` - independent drafting, review, synthesis, Terminal workflow.
12. `docs/context/session_handoff.md` - current state only.

Original chat is provenance, not dependency. New decisions must enter canonical files before agent runs.

## Folder map

```text
docs/context/   canonical strategy, evidence, decisions, creative brief, handoff
docs/process/   agent workflow and file ownership
docs/roles/     PM working posture
inputs/         immutable evidence and whiteboards
working/        frozen blueprint, Analytics request pack, page packets, review/run records, and Phase 5 prompt templates
references/     archived/superseded context only
outputs/        approved stakeholder artifacts only
```

Future `runs/<run_id>/` folders are created only when independent drafts begin.

## Guardrails

- One initiative, one primary home.
- Numeric claims require evidence-register IDs.
- CONFLICTED claims never enter CEO narrative.
- Page 11 uses initiative lifecycle, not engineer lanes.
- Page 11 lifecycle is a `USER-SUPPLIED WORKING PLAN`, not delivery commitment; the engineering lead is not counted among six delivery engineers.
- Page 12 is written last.
- Claude first enters in Phase 5, after Phase 4 freeze and post-freeze commit.
- Codex and Claude use same committed source SHA and separate output paths.
- Archived references never override canonical files.
