# Phase 4 Freeze and Phase 5 Run Manifest

**Status:** PREPARED - NOT LAUNCHED  
**Run ID:** `jas-q2-20260714-blind-v1`  
**Prepared:** 2026-07-14  
**Coordinator / truth steward:** Apurva  
**Canonical freeze SHA:** `ad2722067d22f0b3841018d892a9af56f6571e62`  
**Freeze commit:** `docs(roadmap): freeze JAS Q2 operating-plan structure`

This manifest records Phase 4 setup. It does not authorize page drafting.

## 1. Frozen comparison baseline

- Pages 1-11 sequence, page jobs, and single CEO takeaways are frozen.
- Only Page 12 purpose is frozen. Its wireframe, takeaway, cards, asks, owners, commitments, and wording remain provisional.
- Outcome tree, 11 initiative homes, evidence posture, prohibited claims, Page 11 lifecycle form, and Page 12-last rule remain canonical constraints.
- Headlines, prose, visual metaphor, hierarchy, density, evidence emphasis, and within-page block order remain creative choices.
- Page merge/split/removal/reorder remains allowed only through explicit provider proposal; never silent mutation.

## 2. Provider isolation

| Provider | Branch | Worktree | Starting SHA | Reserved output root | Blind |
|---|---|---|---|---|---|
| Codex | `jas-q2-phase5-codex-pass1` | `/Users/mac/src/pm-agent-worktrees/jas-q2-codex-pass1` | `ad2722067d22f0b3841018d892a9af56f6571e62` | `runs/jas-q2-20260714-blind-v1/codex/` | Yes |
| Claude | `jas-q2-phase5-claude-pass1` | `/Users/mac/src/pm-agent-worktrees/jas-q2-claude-pass1` | `ad2722067d22f0b3841018d892a9af56f6571e62` | `runs/jas-q2-20260714-blind-v1/claude/` | Yes |

Provider paths and branches are unique. Neither provider may read peer output before Pass 1 closes.

## 3. Release scope

| Scope | Phase 5 release state | Rule |
|---|---|---|
| Pages 1-10 | Structurally eligible; **not launched** | May draft with visible unknowns after explicit Phase 5 launch. |
| Page 11 | **Not released for substantive drafting** | Populate `EVD-04`, `DEC-05`, and `EXE-01` to `EXE-06`, or obtain explicit user approval for Pages 1-10-only Pass 1. Never invent timeline bars. |
| Page 12 | **Excluded from Pass 1** | Author after Pages 1-11 synthesis and decision resolution. |

No provider command may run until release scope is explicitly recorded here.

## 4. Reserved Pass 1 files

For each released page `XX`:

```text
runs/jas-q2-20260714-blind-v1/codex/pass1/pages/page_XX.md
runs/jas-q2-20260714-blind-v1/claude/pass1/pages/page_XX.md
```

Structural proposals:

```text
runs/jas-q2-20260714-blind-v1/codex/proposals/structure.md
runs/jas-q2-20260714-blind-v1/claude/proposals/structure.md
```

Prompt records:

```text
runs/jas-q2-20260714-blind-v1/prompts/codex/
runs/jas-q2-20260714-blind-v1/prompts/claude/
```

One writer owns each provider-specific file. No shared-file appends.

## 5. Provider authoring contract

Both providers must:

1. Start from canonical freeze SHA above.
2. Read sources in order defined by `README.md` and `docs/process/agent_runbook.md`.
3. Draft independently without peer visibility.
4. Preserve frozen semantic takeaway while choosing their own expression.
5. Keep claim IDs and unresolved IDs visible in working drafts.
6. Keep hypotheses, user-supplied values, and conflicted claims labelled exactly as governed.
7. Put structural challenges in provider proposal file using `creative_brief.md` format.
8. Write only reserved provider paths.

## 6. Open gates carried into Phase 5

- Analytics/Finance: `DR-01` to `DR-15` remain unassigned. P0 needs owner, approver, source/access owner, feasibility, and first-cut/acceptance date or explicit blocker plus escalation owner.
- Execution: `EVD-04`, `DEC-05`, and `EXE-01` to `EXE-06` block substantive Page 11 timing/capacity.
- Trust: `DEC-04` / `DR-15` may remain visible during blind drafts but must resolve before final synthesis.
- Final medium: `DEC-03` remains open.
- Page 12: `DEC-02`, `DEC-05`, and `DEC-06` remain open.
- Opening strength: operating-model claim needs two concrete changed-decision examples or weaker wording.
- Attribution: no summed initiative OP -> OD contribution until overlap/double-counting test exists.

## 7. Commands and completion record

Exact commands must be recorded immediately before Phase 5 launch.

| Provider | Exact command | Released pages | Result SHA | Collected | Cross-review released |
|---|---|---|---|---|---|
| Codex | TBD - Phase 5 launch | None | TBD | No | No |
| Claude | TBD - Phase 5 launch | None | TBD | No | No |

## 8. Launch checklist

- [x] `DEC-01` resolved.
- [x] Frozen source SHA recorded.
- [x] Codex and Claude worktrees created from same SHA.
- [x] Provider branches and output roots do not collide.
- [x] Creative proposal channel preserved.
- [ ] Pass 1 release scope explicitly approved.
- [ ] Exact Codex command and prompt paths recorded.
- [ ] Exact Claude command and prompt paths recorded.
- [ ] Page assignments/waves recorded.
- [ ] Cross-review remains closed until both Pass 1 runs complete.

## 9. Current stop point

Phase 4 complete when this manifest is committed and worktree/SHA audit passes. Stop before page drafting.
