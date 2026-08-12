# roadmap-deck-process-learnings.md

**Status:** Learnings — reusable across future roadmap/CEO-deck work, not specific to one quarter.
**Last updated:** 2026-08-04
**Source:** JAS Q2 Operating Plan authoring cycle (Jul 6 – Jul 20, 2026) — from initial Q2 roadmap draft, through the archived `Roadmap Creation/` attempt, through the heavy `Q2_JAS_Stakeholder_Roadmap` Phase 1-7 process, to the shipped `AMJ Retro & JAS Roadmap.pdf`. Also benchmarked against Growth Pod's `Growth_Pod_Roadmap_JAS_H2-2026.pdf` (a different Truemeds team's CEO review deck, reference copy at `knowledge/learnings/references/`).

---

## Part 1 — Patterns worth reusing from Growth Pod's deck

- **Stat block before narrative.** Growth Pod opens with 4-5 headline numbers before any prose. A CEO sees the size of the problem in five seconds. Our Q1 retro leads with a shipped-initiative table instead — fine, but less immediate.
- **Proof-before-ask.** A "shipped, measured wins" page comes before the new asks, with each proof point tied directly to the specific initiative it de-risks — not a generic "here's what we did" list.
- **A short, numbered "what we need."** Four items: sign-off, one named policy decision, named blockers, north-star endorsement. Nothing this distilled exists in the AMJ/JAS deck — asks are scattered inside the Analytics/Finance appendix instead.
- **Explicit overlap/double-counting discipline.** Growth Pod's impact bridge applies a stated "30% overlap haircut" to the gross sum of initiative estimates rather than pretending individual estimates just add up, and says so on the slide.
- **Dependency flags inline on the delivery timeline** (⚑ gated on X), not buried in prose elsewhere.

## Part 2 — Anti-patterns to avoid

- **Decimal-precision estimates on unbuilt work** (+₹2/order, +0.86pp) read as more certain than they are. Growth Pod can partly justify this — they have real Jun '26 baselines. JAS/Apurva's charters mostly don't have that instrumentation yet — don't borrow the precision habit before the baselines exist. "Raw, with a clear outcome metric" is the more honest posture for this stage.
- **Asking for a policy decision while already marking the dependent work P0-committed on the same page.** Growth Pod's pricing charter does this. Keep using `[OPEN DECISION]` discipline instead — don't let a sign-off ask double as a fait accompli.

---

## Part 3 — Process retrospective: what the heavy multi-phase authoring cycle actually bought

The `Q2_JAS_Stakeholder_Roadmap` project ran a 7-phase process: canonical truth → evidence register → 12-page blueprint → per-page packets → evidence/decision review → structure freeze (pinned SHA) → blind independent drafting by Claude and Codex in separate git worktrees → cross-review → synthesis. The actual shipped artifact (`AMJ Retro & JAS Roadmap.pdf`, 7 pages) came from a `final_prep` polish pass directly on the Claude-pass1 draft — bypassing the cross-review and synthesis output entirely, and structurally simpler than the frozen 11-page + appendix spine.

**What was worth it — keep doing this:**
- Building an evidence register that classifies every claim (file-verified / user-supplied / derived / hypothesis / conflicted) with a status label and allowed-wording rule. This is what the shipped deck's honesty about baselines is built on.
- Locking capacity truth and an initiative-to-outcome map early, once, in a canonical file — not re-litigated per page.
- A **ranked kill-assumptions list** — the single sharpest artifact the whole cycle produced (`working/05_phase3_review_pack.md` §7, preserved in full below). Nobody used it in the shipped deck. It's cheap to write and it's exactly what a sharp CEO will ask ("what would make you abandon Ring AI?"). Worth including as a standing appendix habit going forward, independent of whether the rest of this process is used again.

**What cost more than it returned — don't repeat as-is:**
- **Freezing exact page count and per-page wireframes (`working/page_packets/`, 12 packets) before a first real narrative draft existed.** The frozen spine was 11 pages plus appendix; what shipped was 7. A lot of packet-writing time went into a shape the content didn't end up wanting. Draft the story first, let structure follow, not the reverse.
- **Blind dual-drafting (Claude + Codex independently, in 5 separate full-repo git worktrees) plus formal cross-review plus a synthesis merge step.** This is expensive coordination — five worktrees, five branches, multiple review/synthesis documents — for a single-owner CEO deck where one person (Apurva) makes the final call regardless. It's not that the analysis was bad: the cross-review caught a real problem (two frozen CEO takeaways silently altered in one draft) and produced a genuinely sharp, well-reasoned 8-item ranked list of decisions blocking finalization. But none of that synthesis output is what got shipped. **Next time: one drafter, one reviewer pass. Skip the formal blind-dual-draft-and-synthesize pattern unless the stakes specifically warrant two independent takes.**

**One thing that fell through the cracks, worth a look independent of process changes:** the reviewer's recommendation to give the CEO deck an appendix surfacing the plan's kill-assumptions and the ranked blocking-decision list never made it into `AMJ Retro & JAS Roadmap.pdf`. That's a small, cheap addition (see the table below) that may still be worth adding to the current deck directly, without re-running any of the heavier process around it.

### Preserved: ranked kill-assumptions (from `05_phase3_review_pack.md §7`, source file now removed)

| Rank | Load-bearing claim | Fails if | Cheapest test | Kill/change rule |
|---:|---|---|---|---|
| 1 | Analytics contract becomes funded work | P0 owners, sources, feasibility, or dates remain TBD | Run 60-minute assignment session | Unowned request becomes unfunded/blocked; if `DR-01`–`DR-03` lack plans, frame Q2 as discovery-first |
| 2 | 11 initiatives become a credible six-engineer sequence | Roster/current work/estimates/trade-offs remain unknown | Run 90-minute capacity cut-line workshop | Initiative without owner, estimate, dependency, and decision gate stays below the commitment line |
| 3 | Three-month operating-model shift is demonstrated | Only planning artifacts changed; no decision or cadence changed | Collect two behavioural examples and review-cadence proof | Weaken opening claim to "built the operating foundation to move" |
| 4 | Initiative contribution avoids double counting | Interventions can't be linked to a final order, or overlap is unknown | Build a one-week order-level overlap/reconciliation sample | Prohibit initiative-level or summed OP→OD contribution claims; report journey metrics only |
| 5 | Plan answers Customer Experience, not only cost/conversion | Trust stays unmeasured, or Voicebot worsens service while lowering cost | Decide the Trust treatment; define FCR/repeat/transfer/quality guardrails | Use Wallet/R&R proofs; never show a Rs14→Rs9 bar without non-regression proof |

---

## Part 4 — What to do differently on the next roadmap deck

1. Gather evidence and lock capacity/initiative-map truth early — this part earned its keep.
2. Write one honest narrative draft before deciding page count or wireframes.
3. Use a single drafter + single reviewer, not a blind-dual-draft-and-synthesize pattern, unless a specific decision genuinely needs two independent takes.
4. Carry a short kill-assumptions / "what would change our mind" table as a standing habit — cheap, and it's the thing a sharp CXO asks for anyway.
5. Borrow Growth Pod's stat-block-first and numbered-asks patterns; skip the decimal-precision-on-unbuilt-work habit until real instrumentation exists.
