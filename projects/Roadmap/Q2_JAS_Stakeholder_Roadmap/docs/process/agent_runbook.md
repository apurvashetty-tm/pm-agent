# Independent Draft, Review, and Synthesis Runbook

**Status:** CANONICAL PROCESS v1.3  
**Last updated:** 2026-07-14

Purpose: let Codex, Claude, or another capable agent draft and review CEO operating plan without depending on original chat window.

Phase boundary: Claude does not participate in Phases 1-4. Blind Claude drafting starts only in Phase 5 after `DEC-01` and post-freeze commit.

## 1. Canonical inputs and domain ownership

| Domain | Authority |
|---|---|
| Strategy, outcome tree, initiative definitions, resolved decisions | `docs/context/project_truth.md` |
| Claim value, status, provenance, allowed wording | `docs/context/evidence_register.md` |
| Unknowns, owners, due dates, blockers | `docs/context/open_questions.md` |
| Frozen page sequence, page jobs, takeaways, wireframes, timeline form | `working/03_operating_plan_blueprint.md` |
| Voice, visuals, and creative freedom | `docs/context/creative_brief.md` |
| Assigned page objective, evidence subset, unknowns, and failure modes | `working/page_packets/page_XX.md` after Phase 2; never overrides canonical inputs |
| Phase 3 page readiness, claim posture, kill-assumptions, and gate status | `working/05_phase3_review_pack.md`; recommendations never override unresolved canonical decisions |
| Phase 4 freeze SHA, provider isolation, release scope, and launch state | `working/06_phase4_run_manifest.md` |
| Raw sources | `inputs/` |
| Workflow and file ownership | This runbook |

Latest user decision must be captured in canonical file before run begins. Session chat or archived references never override canonical inputs silently.

## 2. Required pre-run gate

Do not start independent drafting until:

1. Phase 3 evidence/decision review is complete enough for visible unknowns and claim restrictions.
2. `DEC-01` is resolved and Page 1-11 structure plus provisional Page 12 purpose are frozen.
3. Phase 4 post-freeze canonical snapshot is committed.
4. Run coordinator records source commit SHA.
5. Assigned pages and output paths are unique.
6. Blind-draft flag is set.
7. Unresolved evidence conflicts are known.

## 3. Run directory - create only when run starts

```text
runs/<run_id>/
├── manifest.md
├── prompts/
│   ├── codex/
│   └── claude/
├── codex/
│   ├── pass1/pages/
│   ├── proposals/
│   └── pass2/pages/
├── claude/
│   ├── pass1/pages/
│   ├── proposals/
│   └── pass2/pages/
├── reviews/
│   ├── codex_reviews_claude/
│   └── claude_reviews_codex/
└── synthesis/
    ├── pages/
    ├── synthesis_log.md
    └── deck_edit.md
```

No run folders are committed before needed.

## 4. Run manifest

`manifest.md` records:

- Run ID and start date.
- Source commit SHA.
- Worktree path, branch, and working directory.
- Phase and blind-draft status.
- Truth/evidence/blueprint versions.
- Assigned pages.
- Page-packet and prompt paths.
- Writer and reviewer identities.
- Allowed output path per agent.
- Exact CLI command and expected output filename, such as `page_01.md`.
- Status and completion timestamp.
- Result commit SHA.
- Collection/cherry-pick status.
- Review-release gate.
- Coordinator identity.

Minimal manifest entry:

```text
Provider / agent
Source SHA
Worktree / branch / cwd
Assigned page packet
Prompt path
Exact command
Expected output path
Blind draft: yes/no
Result commit SHA
Collected into orchestration branch: yes/no
Released for cross-review: yes/no
```

## 5. Roles and exclusive ownership

| Role | Responsibility | Exclusive write scope |
|---|---|---|
| Truth steward | Capture approved fact/strategy changes | `project_truth.md`, `evidence_register.md`, `open_questions.md` |
| Run coordinator | Assign work, maintain run state | `manifest.md`, `session_handoff.md` |
| Codex writer | Blind page draft | Assigned Codex page files only |
| Claude writer | Blind page draft | Assigned Claude page files only |
| Cross-reviewer | Review peer output without editing it | Assigned review files only |
| Synthesis editor | Select strongest treatment and resolve page draft | `synthesis/pages/`, `synthesis_log.md` |
| Deck editor | Fix full-deck flow and expression | `deck_edit.md` and approved artifact source |
| Evidence auditor | Verify every claim against register/source | Audit report only |

One writer per file. No concurrent append to shared Markdown. Only approved truth steward changes canonical context.

## 6. Pass 1 - blind independent drafting

Codex and Claude:

1. Start from same committed SHA.
2. Read canonical inputs in order listed in Section 1.
3. Do not read peer draft.
4. Write only assigned provider/pass/page path.
5. Cite claim IDs and unresolved IDs in working draft.
6. Preserve one primary home per initiative.
7. Put structural challenges in provider-specific proposal file.
8. Do not edit canonical truth, peer files, or outputs.

Each assigned `working/page_packets/page_XX.md` compiles page objective, CEO takeaway, relevant evidence IDs, unknown IDs, suggested visual, and failure modes. Packet is convenience layer only; canonical files win conflicts.

Creativity remains open within `creative_brief.md`. Pass 1 begins only from post-`DEC-01` freeze commit. Structural challenges remain allowed through provider-specific proposal files, but agents draft against frozen spine until coordinator accepts a new user-approved source commit.

## 7. Codex multi-agent waves

Current Codex environment supports four concurrent agents including coordinator. Recommended pattern:

- Coordinator remains one slot.
- Up to three page agents run per wave.
- Pages grouped for coherence, not assigned randomly:
  - Wave A: Pages 1-3 - transformation and Q1 learning.
  - Wave B: Pages 4-6 - operating model and Order Completion.
  - Wave C: Pages 7-9 - Cost, Trust, Foundations.
  - Wave D: Pages 10-11 - measurement and execution.
  - Page 12 waits until Pages 1-11 synthesis.
- Global deck editor reviews all pages after synthesis.

One-agent-per-page is allowed, but no page becomes final without cross-review and deck-level edit.

## 8. Collect Pass 1 outputs

Before cross-review:

1. Each provider commits only provider-specific Pass 1 files.
2. Coordinator records result commit SHAs.
3. Coordinator cherry-picks both provider commits into orchestration branch/worktree.
4. Verify paths do not collide and source SHA remains identical.
5. Release peer drafts to reviewers only after both blind drafts are collected.

## 9. Cross-review

Reviewer never edits original draft. Review file uses:

```text
Verdict
Strongest element to preserve
Factual/evidence issues
Missing context
Initiative-mapping errors
CEO clarity
Visual clarity
Unsupported claims
Required fixes
Optional improvements
Structural proposal
```

Scores:

| Dimension | Scale |
|---|---|
| Factual fidelity | Pass / Fail |
| CEO takeaway | 1-5 |
| Narrative contribution | 1-5 |
| Outcome alignment and deduplication | 1-5 |
| Visual clarity | 1-5 |
| Decision usefulness | 1-5 |

Any unsupported number is automatic factual-fidelity failure.

## 10. Revision

Original writer creates Pass 2 and records review response:

- Accepted.
- Rejected with reason.
- Escalated as truth/evidence conflict.

Never overwrite Pass 1. Escalated conflicts enter `open_questions.md` through truth steward.

## 11. Synthesis

- Choose strongest treatment page by page; never average mechanically.
- Evidence register wins factual conflicts.
- Project truth wins strategy conflicts.
- Formally frozen blueprint wins structure conflicts.
- Creative brief governs expression.
- Unresolved conflicts return to open questions.
- Record selected source, rejected alternative, and rationale in `synthesis_log.md`.
- Page 12 is authored after Pages 1-11 expose exact leadership decisions.

## 12. Deck-level edit

One editor fixes:

- Story flow and pacing.
- Voice and headline consistency.
- Repetition and missing transitions.
- Visual grammar.
- Cross-page metric and status consistency.
- Page 12 specificity.
- 10-minute CEO narration.

## 13. Final audit

Before anything enters `outputs/`:

- Every number traces to evidence-register ID.
- Evidence labels and allowed wording are correct.
- CONFLICTED claims are absent.
- Unknowns remain visible.
- Each initiative appears once.
- Foundations remain enabling layer.
- Timeline contains no unsupported commitment.
- Leadership asks name decision, owner, commitment, and consequence.
- Likely CEO questions are red-teamed.
- PPTX/PDF, if created, pass visual inspection.

## 14. Terminal execution rules

- Codex and Claude may run entirely from Terminal once the Phase 4 post-freeze snapshot is committed.
- Concurrent Codex and Claude runs require separate Git worktrees and separate provider output paths. Branches alone do not isolate simultaneous writers.
- Same-worktree runs must be sequential and still use separate provider output paths.
- Pin both systems to same source commit SHA.
- Never launch both providers against same writable draft file.
- Reviewers receive peer draft only after Pass 1 completes.
- Synthesis uses one exclusive writer.
- Provider commits are collected into one orchestration branch before cross-review.
- Exact provider commands belong in run manifest because installed CLI flags may change; do not hardcode stale commands here.

## 15. Handoff rule

`session_handoff.md` reports current state only. It never becomes source of truth. New agent should be able to start from canonical inputs without reading original conversation.
