# ACOM × Ring AI — Session Handoff

Living resume point. Continue from here unless the user gives newer instructions.
Last updated: 2026-09-15

## Current status
- **PRD is live and current.** Markdown source of truth: `docs/ai-led-lead-qualification-prd.md`.
  Mirrored to Confluence PROD page 2023260174 — **live version v19** (as of 13 Sep 2026).
  Review baseline: `reference/prd-review-comments-snapshot.md`. Locked facts: `project_truth.md`.
- **Call architecture landed (Ring call, 11 Sep).** Knowlarity opens a WebSocket to Ring
  (our reference id) → "customer answered" event starts the bot → Ring records on its own
  side and returns the verdict by webhook → we store our own recording + event log, and do
  NOT send a recording to Ring. See `knowledge/decisions/2026-09-11-ring-ai-call-architecture.md`.
- **Reviewer comments: 36 of 38 answered.** Open (deliberately, business to answer):
  #34 (ACOM team strength) and #35 (POC design / BRD). #16 reply is posted; Apurva may still
  hand-swap a sharpened "human-agent routing rule" version (Confluence has no edit-comment API).

## What changed this cycle (13–15 Sep)
- §4 flow + fork diagram reworked to the WebSocket architecture; old diagram kept in §13.
- §8 recording/verdict + "retain recording & event log"; §9 three questions resolved + PII-on-event
  control; §12 "forensics not a fix" caveat; new §13 running vendor MoM (Ring entry, 11 Sep).
- §1/§3 "(except the name)" PII callout; §4 diagram fix — Cold = lowest priority (still called),
  added DON'T-CALL prong.
- Knowledgebase wired in: this file, `open_questions.md`, `project_truth.md`, the decision file,
  and `knowledge/learnings/confluence-inline-comment-safe-editing.md`.

## Pending / next exact steps
1. **Knowlarity call** — confirm telephony specifics (WebSocket contract, "customer answered"
   event, UUID pass-through over WS, PII strip). Then add a dated entry under PRD §13 and close
   the related §9 opens.
2. **Verdict latency** — get Ring to confirm ~1-minute turnaround in writing before go-live.
3. **#34 / #35** — business to answer on Confluence.
4. **Git** — see the git note below.

## Git state (as of 15 Sep)
- Branch `acom-portal-revamp`. Local commit `135c7fd` (memory export + project_truth) is NOT
  pushed (device shell has no GitHub credentials). The PRD (`ai-led-lead-qualification-prd.md`),
  the review snapshot, and `knowledge/decisions/2026-09-09-...` are still **untracked** — the
  source-of-truth PRD is not yet in git. Commit + push these from a machine with GitHub auth.
