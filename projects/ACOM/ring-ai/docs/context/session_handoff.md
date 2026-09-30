# ACOM × Ring AI — Session Handoff

Living resume point. Continue from here unless the user gives newer instructions.
Last updated: 2026-09-30

## Current status
- **PRD Draft v3 is published on Confluence** (PROD page 2023260174) and mirrored word-for-word
  in `docs/ai-led-lead-qualification-prd.md` — last synced 30 Sep 2026, 0 dangling comments.
  This cycle Apurva applied edits on Confluence herself; anything she left out of a suggestion
  was deliberate — the published page is the base.
- **Locked facts** are in `project_truth.md`; open items in `open_questions.md`; the why in
  `DESIGN_JOURNAL.md` (log 29–30 Sep) and `knowledge/decisions/2026-09-30-ring-ai-v3-reach-gtm-controls.md`.
- **Review state:** 58 unresolved threads, 0 dangling. Many are answered by the doc and just need
  a closing reply + resolve (list in `open_questions.md`). On 30 Sep Apurva tagged Kartik A and
  Jatin Khatri for review of the new sections.

## What changed this cycle (29–30 Sep)
- **Reframed around reach, not AOV:** ~12,500 eligible leads/day at ₹900, agents attempt ~40%
  (Analytics numbers replace the BRD estimates).
- **Minimum AOV ₹500** for both the AI and the manual queue (~17,000 leads/day; FTC share 20.2% →
  25%, 38% in the ₹500–900 band).
- **POC shown as a funnel** (1,313 attempted → 1,033 connected → 266 Hot/Warm → 112 stale → 154
  attempted by agents → 91 connected → 28 orders). "About 20%" corrected: 18% of attempted,
  10.5% of all Hot/Warm.
- **Dial order = today's queue logic as is** (`final_score` already puts FTC first).
- **One lead at a time per attempt**; every retry sent to Ring fresh; data sent listed in §4
  (no address, no SKU pricing).
- **Hot/Warm stay 24 h from the verdict**; stale defined; a Stale disposition added.
- **Throttle removed** → **pause rule** (no new AI leads while the oldest Hot/Warm has waited
  >2 h) + **GTM split by customer ID**. Kill switch: global now, per use-case later.
- **Setting values made firm** (2 min short-drop retry, 15 s, 3 connected calls / 7 days, 24 h,
  2 h).
- **§9 regrouped** — none blocks the build; vendor-agnostic dropped from scope.
- **§10 rebuilt** as a baseline/target table — ACOM sales (₹/day) is the final number; Hot/Warm
  conversion ≥2× human; 5% Cold sample.
- **§14 GTM & Rollout added** — tech pilot 5% → 25% → 50% → 100% on ₹900+, then ₹500 (75% →
  100%), with gates per step.

## Pending / next exact steps
1. **Close the loop on Confluence** — reply + resolve the answered threads listed in
   `open_questions.md` (incl. "send address" → no address; "48 hours" → 24 h kept).
2. **Get Kartik's and Jatin's review** of the tagged sections.
3. **Analytics** — baselines for AOV of converted orders and ACOM sales/day.
4. **Contracts** — Business to set the verdict + call-outcome SLA with Ring and Knowlarity.
5. **Knowlarity** — telephony specifics + bot-leg failure error code; then add a dated §13 entry.
6. **Ring** — languages; do-not-call as its own label; simultaneous-call limits.

## Git state (as of 30 Sep)
- Branch `acom-portal-revamp`. This cycle's ring-ai files, the new decision log, the learnings
  file, the landscape update and the memory export were committed together (see git log).
  Unrelated already-dirty files (AGENTS.md, CLAUDE.md, projects/Roadmap/README.md,
  templates/lean-prd-guide.md, workflows/core/create-prd.md, workflows/core/review-prd.md,
  "Claude outputs/", projects/ceo-discussions/, "projects/discussions with the CEO/",
  projects/post-order-aop/, projects/valuemeds/) were left untouched.
