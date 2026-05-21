---
name: prd-reviewer
description: >
  Activate this skill to review a PRD, Vision Doc, or Initiative Doc. Triggered
  automatically by PRD Creator after every draft — never requires user instruction
  to begin. Runs a minimum of two full review passes: Pass 1 flags issues by
  severity, PRD Creator auto-fixes P0 and P1 issues, Pass 2 re-reviews the updated
  draft. If Pass 2 still finds issues, PRD Creator is called again automatically —
  this loop continues until no P0s remain. Visualises findings after each pass.
  Sign-off is only available after Pass 2 completes with no P0s. For Initiative
  Docs, runs a separate review cycle per Executable PRD.
---

# PRD Reviewer

Reviews PRDs, Vision Docs, and Initiative Docs for quality and completeness.
Always invoked automatically by PRD Creator. Never skips sections. Never suggests
fixes — only flags, explains, and hands back to PRD Creator to incorporate changes.
Minimum two full passes. Loop continues automatically until no P0s remain.

---

## Step 1 — Identify the input

Determine what is being reviewed:

- **Draft in chat from PRD Creator** → use what's already in context.
- **Existing doc from Drive** → if a link is provided, use `google_drive_fetch`
  directly. If only a name is provided, use `google_drive_search`. If multiple
  results found, surface top matches and ask the user to confirm.

**For Initiative Docs:** identify how many Executable PRD drafts are present.
Run a complete, independent review cycle (Steps 2–7) for each one in sequence.
Do not batch findings across PRDs — each PRD gets its own pass count, its own
findings visualisation, and its own sign-off.

---

## Step 2 — Check and load context

Before reviewing, ensure the right context is loaded:

- **Use what's already in session** → do not re-fetch context already loaded
  by Context Recall.
- **Identify gaps** → read through the PRD and identify any vertical, process,
  business rule, or integration referenced but not yet covered by loaded context.
  Fetch only what's missing via Context Loader.
- Do not proceed to Step 3 until all relevant context is loaded.

---

## Step 3 — Review every section against three rubrics

Apply all three rubrics to **every section** without exception — RACI, Objective,
Why Now, Use Cases, Metrics, Rollout & Stage Gates, and any other section present.

| Rubric | What it checks | Fails if |
| --- | --- | --- |
| **Clarity** | Language is precise and unambiguous | Wording could mean different things to different readers; a claim is made without enough detail to act on |
| **Metrics quality** | Metrics are measurable and tied to the goal | Baseline, target, or timeframe is silently absent (a written explanation for why they're unavailable is acceptable); metric can't be measured with available data; impact is described qualitatively where a number is possible |
| **Use case coverage** | All realistic scenarios are handled | A user journey, edge case, or failure mode is missing; the solution only covers the happy path |

**Metrics note:** do not flag a metric for missing baseline/target/timeframe if the
PRD explicitly states they are unknown and gives a reason. Flag only if silently absent.

---

## Step 4 — Assign severity to every finding

Every flagged issue must carry a severity tier:

| Tier | Meaning | Gates sign-off? |
| --- | --- | --- |
| **P0** | Blocks execution — ambiguity or gap that would cause the feature to be built wrong or unmeasured | Yes — P0s must be resolved before sign-off |
| **P1** | Degrades quality — weakens the PRD but doesn't make it unbuildable | No — but PRD Creator must address P1s in every fix pass |
| **P2** | Polish — minor clarity or completeness improvement | No — surfaced for awareness, not action |

---

## Step 5 — Output findings section by section

Present findings in this format:

**[Section name]**
- [P0/P1/P2] [Rubric that failed]: [What was flagged] — [Why it is wrong]

If a section passes all three rubrics:
**[Section name]** — No issues found.

Do not group by rubric or by severity. Keep findings section by section.

---

## Step 6 — Visualise findings

After presenting findings in text, immediately render a visual summary using the
`show_widget` tool. The widget must be an HTML table with:

- One row per finding
- Columns: Section | Severity | Rubric | Issue summary
- Row background colours: P0 = `#fde8e8` (red tint), P1 = `#fef3cd` (amber tint),
  P2 = `#dbeafe` (blue tint), No issues = `#dcfce7` (green tint)
- A summary bar at the top showing: Pass number | P0 count | P1 count | P2 count
- From Pass 2 onward, add a "Status" column: `resolved` for issues from the
  previous pass that no longer appear, `persists` for issues that remain,
  `new` for issues that weren't in the previous pass

Title the widget: `PRD Review — Pass [N]: [doc name]`

---

## Step 7 — Route based on findings

### Pass 1 routing

- **P0s or P1s found** → hand back to PRD Creator automatically without asking.
  Say: *"Pass 1 complete — [X] P0s and [Y] P1s found. Handing back to PRD Creator
  to incorporate fixes. Pass 2 will run automatically."*
- **Nothing found** → run Pass 2 immediately as a confirmation pass.

### Pass 2 routing (the default exit point)

- **P0s remain** → hand back to PRD Creator automatically.
  Say: *"Pass 2 complete — [X] P0s remain. Handing back for targeted fixes. Pass 3
  will run automatically."*
- **Only P1s remain (no P0s)** → exit the loop. Offer sign-off with open P1s listed:
  *"Pass 2 complete — no P0s remain. [Y] P1s are open (listed below) — these don't
  block sign-off but will weaken the doc. Confirm sign-off to save, or say 'fix P1s'
  to run another pass."* Wait for user choice before proceeding.
- **Nothing found** → offer sign-off: *"Pass 2 complete — no issues remain. Confirm
  sign-off to save the doc."*

### Pass 3+ routing (only if P0s persisted past Pass 2)

- **P0s still remain** → surface them and ask: *"Pass [N] complete — [X] P0s still
  unresolved. Continue fixing (runs Pass [N+1]) or sign off with these open?"*
  Wait for the user's choice.
- **No P0s** → follow Pass 2 routing above.

### On sign-off

Run one final recheck before handing back to PRD Creator to save the file. If the
recheck finds new P0s, re-enter the loop from Pass 2 routing. If only new P1s found,
surface them and offer sign-off again immediately.

### User override

If the user explicitly instructs to proceed despite open issues, acknowledge by tier
and count, then hand back to PRD Creator to save the file. Record the override inline
in the saved doc as a note at the top.

---

## Edge cases

- **No issues found on Pass 1** → state clearly, run Pass 2 automatically as
  confirmation, offer sign-off only after Pass 2.
- **Context insufficient after fetching** → flag inline which areas may be
  incomplete due to missing org context.
- **User tries to sign off before Pass 2** → do not accept. Explain that minimum
  two passes are required and the next pass will begin automatically.
- **PRD Creator introduces new issues in a fix pass** → these are caught as `new`
  in the next pass widget. Do not try to predict them in the current pass.
- **Initiative Doc — one PRD is clean, another has open issues** → each PRD has
  its own independent loop. A clean PRD can receive sign-off independently.
- **P1s remain after Pass 2** → do not auto-loop. Surface them as open items and
  offer sign-off. The user decides whether to fix them or proceed.
