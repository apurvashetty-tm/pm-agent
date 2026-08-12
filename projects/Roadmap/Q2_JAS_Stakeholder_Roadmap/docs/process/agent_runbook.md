# Roadmap Deck Runbook — Draft, Review, Ship

**Status:** CANONICAL PROCESS v2.0
**Last updated:** 2026-08-04
**Supersedes:** v1.4 (blind-dual-draft + formal synthesis pattern). See `pm-agent/knowledge/learnings/roadmap-deck-process-learnings.md` for why this changed — short version: five parallel worktrees and a formal cross-review/synthesis pass produced real analytical value but the shipped deck came from a direct polish pass anyway, and the frozen page count didn't survive contact with the actual draft. One drafter, one reviewer gets most of the value at a fraction of the coordination cost.

Purpose: let any capable agent (Claude, Codex, or another) draft and review a CEO operating-plan deck without depending on the original chat thread.

## 1. Canonical inputs and domain ownership

| Domain | Authority |
|---|---|
| Strategy, outcome tree, initiative definitions, resolved decisions | `docs/context/project_truth.md` |
| Claim value, status, provenance, allowed wording | `docs/context/evidence_register.md` |
| Unknowns, owners, due dates, blockers | `docs/context/open_questions.md` |
| Voice, visuals, and creative freedom | `docs/context/creative_brief.md` |
| Current state and next step | `docs/context/session_handoff.md` |
| Raw sources | `inputs/` |
| Workflow | This runbook |

Latest user decision must be captured in a canonical file before a new drafting pass begins. Chat history and archived references never override canonical inputs silently.

## 2. Sequence

1. **Truth check.** Confirm `project_truth.md`, `evidence_register.md`, and `open_questions.md` are current. This is the step worth spending real time on — it's what the shipped deck is actually built from.
2. **One narrative draft.** One writer drafts the full deck once, in prose, from canonical inputs. Do not freeze an exact page count or wireframe before this draft exists — let the story determine the shape, not the reverse. Cite evidence-register IDs inline for every claim.
3. **One reviewer pass.** A second agent (or the user) reviews the draft against `evidence_register.md` and `project_truth.md`: every number traces to an ID with its status intact, no claim outside what's permitted, no initiative in more than one primary home, no frozen/locked wording silently altered.
4. **Revise.** Writer accepts or rejects each review note with a reason. Escalate genuine truth/evidence conflicts to `open_questions.md`.
5. **Final audit before `outputs/`** (see Section 4).

No blind dual-drafting, no separate synthesis phase, no git worktree isolation required for a single-owner deck. Use two independent drafts only when a specific decision genuinely warrants two takes — and say explicitly in `session_handoff.md` why this run is the exception.

## 3. Standing habit: kill-assumptions table

Every deck should carry a short table of load-bearing assumptions: what fails if the claim is wrong, the cheapest test, and the kill/change rule. Cheap to write, and it's what a sharp CXO asks for anyway ("what would make you abandon this bet?"). See the preserved JAS example in `pm-agent/knowledge/learnings/roadmap-deck-process-learnings.md` Part 3.

## 4. Final audit — before anything enters `outputs/`

- Every number traces to an evidence-register ID.
- Evidence labels and allowed wording are correct.
- Conflicted claims are absent.
- Unknowns remain visible — do not invent a baseline to fill a gap.
- Each initiative appears once, under one primary home.
- Foundations remain an enabling layer, not a fourth outcome.
- Timeline contains no unsupported commitment.
- Leadership asks name a decision, owner, and consequence.
- Likely CEO questions are red-teamed against the kill-assumptions table.

## 5. Handoff rule

`session_handoff.md` reports current state only — it never becomes source of truth. A new agent should be able to start from canonical inputs without reading the original conversation.
