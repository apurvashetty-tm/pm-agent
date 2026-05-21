---
name: prd-creator
description: >
  Activate this skill to create or edit Executable PRDs, Initiative Docs, or Vision
  Docs. Triggered by Context Recall after org context is loaded. Handles both building
  from scratch and editing partially built docs. Always collects a detailed problem
  statement and high level solution before drafting. Automatically triggers PRD
  Reviewer after every draft without asking for permission. Saves approved docs as
  .md files to Claude's working folder for manual upload to Drive.
---

# PRD Creator

Creates and edits PRDs, Initiative Docs, and Vision Docs. Always invoked by Context
Recall. Never runs standalone. Context is always loaded before this skill runs.

---

## Step 1 — Identify mode

Determine how to proceed:

- **Build from scratch** → user has no existing doc. Proceed to Step 2.
- **Edit existing doc** → user references a partial or existing doc.
  - If a link is provided → use `google_drive_fetch` directly.
  - If a name is provided → use `google_drive_search` to find it automatically.
    If multiple results found, surface top matches and ask the user to confirm.
  - Once fetched, identify what sections are missing or incomplete.
  - Work only on the gaps. Do not rewrite sections that are already complete
    unless the user explicitly asks.

---

## Step 2 — Identify doc type

Infer from what the user said:

| What the user wants | Doc type |
| --- | --- |
| A feature, fix, or operational change with defined scope | Executable PRD |
| A large initiative broken into multiple workstreams | Initiative Doc |
| A long-term product direction without defined scope yet | Vision Doc |

If intent is unclear, ask once: *"Is this an Executable PRD, an Initiative Doc,
or a Vision Doc?"*

---

## Step 3 — Gather mandatory inputs

Before any drafting begins, always collect both of the following:

1. **Detailed problem statement** — what is broken, missing, or suboptimal, and
   for whom? What is the measurable impact of this problem today?
2. **High level solution** — what is the proposed approach to solving it?

Do not proceed to Step 4 until both inputs are provided. If either is missing,
ask for it explicitly before continuing.

---

## Step 4 — Fetch past PRDs for style reference

Before drafting, use `google_drive_search` to find past PRDs relevant to the
current vertical or topic. Use these to understand writing style, level of
detail, and how use cases and edge cases are typically structured.

Apply this style reference specifically when drafting the Use Cases section.

**If no past PRDs are found in Drive**, load the fallback style guide using the
Read tool on `prd-creator-style-guide-fallback.md` in the same folder as this
skill file, then apply those guidelines instead of producing unconstrained output.

Flag inline that the fallback guide was used rather than a past PRD:
*"[No past PRDs found in Drive — Use Cases written using built-in style guide.
Filing a past PRD in Drive will enable style mirroring in future runs.]*"

---

## Step 5 — Draft the doc

Write the full doc in chat using the correct section structure for the doc type.

### Executable PRD sections

**RACI**
A table identifying who is Responsible, Accountable, Consulted, and Informed.
Covers key stakeholders across product, engineering, ops, and any other relevant
function. Sets ownership expectations before work begins.

**Objective**
A single crisp statement of what this PRD is trying to achieve. The outcome, not
the problem or the solution.

**Why Now?**
The business case for prioritising this right now. What has changed recently —
data, market conditions, operational pain, strategic priority — that makes this
the right moment to act.

**Use Cases**
Every user journey this solution must handle. Structure as primary cases with
sub-cases nested underneath where needed. Each use case covers: who does what,
under what condition, and what the expected outcome is.

Rules for this section:
- Always refer to past PRDs fetched in Step 4 (or the fallback style guide if
  none were found) to mirror writing style
- Before drafting Use Cases, use the Read tool to load `prd-creator-operational-learnings.md`
  from the same folder as this skill file and apply the learnings inline
- Always cover all edge case scenarios that can arise — not just the happy path
- Solutions must be designed to be applicable across verticals where relevant
- Solutions must be sustainable for ~1 year

**Metrics**
The measurable outcomes that will tell you whether this initiative worked.
Split into:
- **Primary metrics** — directly measure the objective
- **Secondary metrics** — leading indicators or guardrail metrics

Each metric must include:
- **Name** — what is being measured
- **Definition** — how it is calculated
- **Baseline** — current state value, or "unknown — to be established in
  instrumentation phase" if genuinely unavailable at time of writing
- **Target** — the desired end state, or a directional goal if a precise number
  is not yet known
- **Timeframe** — when the target is expected to be reached

Do not leave baseline, target, or timeframe blank without an explicit note on
why they are unavailable. A metric with no baseline and no target is not a metric
— it is a label.

**Rollout & Stage Gates**
How the solution goes live and under what conditions it progresses to the next
stage. Each stage gate defines the criteria that must be met before proceeding.

---

### Initiative Doc sections

All sections from Executable PRD, plus:

**Milestones**
A table with columns: Sr No | Milestone Name | Description | Outcome

Each milestone maps to one Executable PRD drafted as part of this Initiative Doc.
Write the Milestones table first and get confirmation before proceeding to draft
individual Executable PRDs.

**Sequencing rule for Executable PRDs within an Initiative Doc:**
- Draft Executable PRD 1 in chat
- Trigger PRD Reviewer automatically (Step 6) → get sign-off → save to file (Step 7)
- Begin drafting PRD 2 in chat in parallel while PRD 1 is being saved
- Present PRD 2 draft as soon as PRD 1 is saved — no waiting
- Repeat until all milestones are complete

---

### Vision Doc sections

No fixed template. Before drafting, ask the user what this Vision Doc needs to
communicate and define the section structure together. Confirm the structure
before writing.

---

## Step 6 — Trigger PRD Reviewer (automatic, no permission needed)

After completing any draft, immediately invoke the PRD Reviewer skill. Do not ask
the user whether to run a review — it always runs. The review is not optional and
does not require the user's instruction to begin.

Do not proceed to Step 7 until:
- PRD Reviewer has run to completion across all sections, and
- The user has given explicit sign-off (per PRD Reviewer's sign-off loop)

---

## Step 7 — Save the approved doc as a .md file

Triggered only after explicit sign-off from PRD Reviewer.

Save the full approved content as a Markdown file to Claude's working folder.
Use the correct naming convention:
- Executable PRD → `[PRD] Feature Name.md`
- Initiative Doc → `[PRD] Initiative Name.md`
- Vision Doc → `[Vision] Vision Name.md`

After saving, share the file link with the user and say:
*"Your doc is saved. You can upload it to Drive manually when ready."*

For Initiative Docs, save each approved Executable PRD as a separate .md file
with its milestone name appended:
- `[PRD] Initiative Name — Milestone 1.md`
- `[PRD] Initiative Name — Milestone 2.md`

Do not use browser automation or any Drive API to write content. File creation
is Claude's responsibility; uploading to Drive is the user's.

---

## Step 8 — Scheduler handoff

After every Executable PRD file is saved, identify the review owner from the
loaded context. Check the Cross-Cutting team structure doc for a field named
"PRD reviewer" or equivalent.

- **Reviewer found in context** → ask: *"Should I schedule a review with
  [reviewer name]?"*
- **Reviewer not found in context** → ask: *"Who should I schedule a PRD review
  with? (Once confirmed, I'd recommend filing this in the Cross-Cutting team
  structure doc so I can load it automatically next time.)"*

On confirmation:
- **Yes** → invoke Scheduler Agent with the reviewer's name/calendar ID
- **No** → proceed to Step 9

---

## Step 9 — Trigger Objection Mapper (automatic, no permission needed)

After the doc is saved (and after any scheduler interaction in Step 8), immediately
invoke the Objection Mapper skill. Do not ask the user whether to run it — it always
runs after sign-off. The doc is already saved; this step does not gate saving.

Say: *"Doc saved. Running Objection Mapper now to surface stakeholder objections
before your alignment meeting."*

Objection Mapper will ask for the target audience. Pass control to it and let it run
to completion. PRD Creator's operation ends when Objection Mapper finishes.

---

## Edge cases

- **Missing mandatory inputs** → do not draft anything until both problem
  statement and high level solution are provided. Ask once clearly for what
  is missing.
- **Vision Doc structure unclear** → do not guess. Always define the structure
  with the user before writing.
- **No past PRDs found in Drive** → load `prd-creator-style-guide-fallback.md` per
  Step 4. Do not produce the Use Cases section without style guidance of some kind.
- **Initiative Doc — milestone count is large** → confirm the full milestones
  table with the user before beginning any Executable PRD drafting. Do not
  start drafting PRDs against milestones that may change.
- **User tries to skip PRD Reviewer** → do not comply. The review step is
  mandatory. If the user pushes back, acknowledge their preference but explain
  that the review runs automatically before any file is saved. They can choose
  to override sign-off after seeing the results, but the review itself cannot
  be skipped.
---

## Final Step: Save and Push to GitHub

See `templates/FINAL-STEP-TEMPLATE.md` for instructions on saving your PRD and pushing to GitHub with automatic versioning (v1, v2, v3, etc.).