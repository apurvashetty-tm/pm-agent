# ACOM × Ring AI — Session Handoff

Living resume point. Continue from here unless the user gives newer instructions.
Last updated: 2026-09-25

## Current status
- **PRD is live and current.** Kept in sync with Confluence PROD page 2023260174 —
  **last synced 25 Sep 2026, 0 dangling (orphaned-anchor) comments** on the live page.
  Edits this cycle were made directly on Confluence (comment-by-comment, with the
  reviewers) and backfilled to `docs/ai-led-lead-qualification-prd.md`.
  Review baseline: `reference/prd-review-comments-snapshot.md`. Locked facts: `project_truth.md`.
- **Call architecture landed (Ring call, 11 Sep).** Knowlarity opens a WebSocket to Ring
  (our reference id) → "customer answered" event starts the bot → Ring records on its own
  side and returns the verdict by webhook → we store our own recording + event log, and do
  NOT send a recording to Ring. See `knowledge/decisions/2026-09-11-ring-ai-call-architecture.md`.
- **Reviewer comments: 52 root-level, 47 with a reply.** 5 without a reply yet — 4 are
  already answered by current doc content but need a closing reply posted (callee/patient
  name, telephony-confirmed-no-verdict, bot-leg failure, frequency-cap-vs-retry-threshold);
  1 is genuinely new and unanswered (25 Sep): why WebSocket and not SIP.

## What changed this cycle (23–25 Sep)
- **Recovered the Confluence page from an accidental corruption** (a bad full-body update)
  back to a known-good state — verified zero dangling comments before and after.
- Posted 6 outstanding replies to reviewers; resolved SKU-level pricing (dropped from the
  doc), the `discount_amount`/`discount_percent` fields question, and the callee-name /
  patient-name-fallback wording.
- **Two new locked rules added (🆕 Added 25 Sep, both in the PRD):** a human-assigned lead
  is never assigned to the bot (§9); a retry-exhausted closure is permanent for that lead
  (§6). Both state the bare requirement only — no implementation mechanism named.
- **Retry threshold confirmed at 4 attempts** — corrected in all three places it appears in
  the doc (a first pass missed one occurrence; adopted the practice of scanning the whole
  document for every occurrence of a changed fact before calling an edit done).
- Synced the local knowledgebase to match: this file, `open_questions.md`, `project_truth.md`,
  the PRD markdown, a new decision-log entry
  (`knowledge/decisions/2026-09-25-ring-ai-prd-clarifications.md`), and the memory export.

## Pending / next exact steps
1. **Close the loop on Confluence** — post replies to the 4 already-answered-in-doc
   comments, and a reply (or a fuller answer) to the new SIP-vs-WebSocket comment.
2. **Knowlarity call** — confirm telephony specifics (WebSocket contract, "customer answered"
   event, UUID pass-through over WS, PII strip). Then add a dated entry under PRD §13 and close
   the related §9 opens.
3. **Verdict latency** — get Ring to confirm ~1-minute turnaround in writing before go-live.
4. **Bot-leg failure error code** — Engineering to confirm the exact Knowlarity error code
   and handling before go-live (PRD §12).
5. **`prd-review-comments-snapshot.md`** — this cycle's update was a status/delta refresh
   (counts + what changed), not a full line-by-line rebuild of all 52 threads. A full
   rebuild is still the largest remaining piece of "housekeeping" work if wanted.

## Git state (as of 25 Sep)
- Branch `acom-portal-revamp`. This cycle's ring-ai files (PRD, review snapshot, the four
  context files, the DESIGN_JOURNAL append, the new decision-log entry, and the memory
  export) were committed and pushed together in one commit — see git log for the hash.
  Unrelated already-dirty files in the repo (AGENTS.md, CLAUDE.md, projects/Roadmap/README.md,
  templates/lean-prd-guide.md, workflows/core/create-prd.md, workflows/core/review-prd.md,
  "Claude outputs/", projects/ceo-discussions/, "projects/discussions with the CEO/",
  projects/post-order-aop/, projects/valuemeds/) were deliberately left untouched — not part
  of this work.
