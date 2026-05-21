---
name: prd-creator-changelog
description: >
  Behavioral amendments for prd-creator. Read at runtime before executing core
  skill steps. Updated by the weekly skill improvement pipeline — do not edit manually.
---

# prd-creator_changelog.md

Amendments to prd-creator.md. Applied before running the core skill steps.
Each entry is dated. Later entries override earlier ones where they conflict.

---

## 2026-05-16 — Token optimisation: lazy-load operational learnings and style guide

**Changes applied to prd-creator.md:**

1. **Operational Learnings extracted** — moved out of the inline skill body into
   `prd-creator-operational-learnings.md`. Step 5 now reads this file via the Read
   tool just before drafting Use Cases, rather than having it loaded on every invocation.
   Saves ~800 tokens per invoke.

2. **Built-in style guide extracted** — moved out of Step 4 into
   `prd-creator-style-guide-fallback.md`. Step 4 now reads this file conditionally
   (only when no past PRDs are found in Drive). Saves ~220 tokens per invoke for
   projects that already have Drive PRDs (i.e., always, for live projects).

---

## 2026-05-15 — Chain metrics-designer before prd-reviewer

**Amendment:** After completing the Success Metrics section of any PRD draft, do not
immediately call prd-reviewer. Instead, call metrics-designer first.

**Exact insertion point:** After the Success Metrics section is drafted (Step 5 in the
core skill), before handing off to prd-reviewer (Step 6).

**What to pass to metrics-designer:** The full PRD draft with the Success Metrics section
visible. metrics-designer will read it as "chained from PRD Creator" context.

**What to do with the return:** When metrics-designer returns the structured Metrics
Definition file, incorporate the validated metric definitions into the PRD's Success
Metrics section — replace any informal metric statements with the structured output
(name, definition, unit, direction, baseline, target, timeframe, instrumentation note).

**Then:** Call prd-reviewer as normal.

**Chain summary:**
prd-creator (draft) → metrics-designer → prd-creator (incorporates definitions)
→ prd-reviewer (minimum 2 passes)

---

## 2026-05-20 — Load 5-pass gap analysis during Use Case drafting

**Amendment:** When drafting Use Cases in Step 5, load and apply
`workflows/core/gap-analysis-5pass.md` before writing any UC content.

**Exact insertion point:** After reading `prd-creator-operational-learnings.md`
(Step 5 lazy-load), before writing the first UC section.

**What to do:** Run all 5 passes on each use case group before outputting that
group's section. Do not write a UC section that covers only Pass 1 (happy path).
Minimum standard per UC: Passes 1–2 fully covered, Pass 3 present for any step
that calls an external system, Pass 5 authorization matrix and audit trail present.

**End of PRD sweep:** After all UC sections are drafted, run the Pass 5 checklist
once across the full PRD — check authorization matrix, audit trail completeness,
concurrency model, PII fields, metrics thresholds, rollout plan, open questions.

**Rating before submitting to prd-reviewer:** Use the gap-analysis-5pass.md rating
heuristic. If score < 8/10, identify which passes are thin and fill gaps before
handing to reviewer.

**Chain summary (updated):**
prd-creator (draft, applying 5-pass per UC) → metrics-designer
→ prd-creator (incorporates definitions + 5-pass final sweep)
→ prd-reviewer (minimum 2 passes)
