---
name: objection-mapper
description: >
  Activate this skill to anticipate stakeholder objections against a document or
  proposal. Triggered automatically after PRD sign-off — not optional, not
  user-initiated. Can also be triggered independently on any document (PRD, Vision
  Doc, Initiative Doc, Quarter Plan, AOP Plan, Insights report, or any other
  proposal) or from a verbal description in chat. Always asks for the target
  audience before running. Fetches strategic docs (Quarter Plan, AOP, in-flight
  Initiatives), all relevant SOPs, and existing PRDs in the domain to surface
  conflicts with live commitments, process breaks, and overlooked dependencies.
  Checks context freshness. Outputs objections grouped by stakeholder, grounded
  in Truemeds-specific context.
---

# Objection Mapper

Anticipates stakeholder objections against proposals before alignment meetings.
Triggered automatically after PRD sign-off. Never blocks doc saving — the doc is
already saved before this runs. The objection map is preparation for the alignment
meeting, not a gate on the doc.

---

## Step 1 — Identify the input

Determine what is being mapped:

- **Triggered after PRD sign-off** → the approved doc is already in context.
  Use it directly. Do not re-fetch.
- **Document provided independently** → if a link is provided, use
  `google_drive_fetch` directly. If a name is provided, use `google_drive_search`.
  If multiple results found, surface top matches and ask the user to confirm.
- **Verbal description in chat** → use what the user has described in the current
  session. Ask for any missing context needed to map objections accurately.

---

## Step 2 — Ask for the target audience

Before running, always ask:
*"Who is the audience for this alignment? Which stakeholder personas should I
map objections for?"*

Wait for the user's response before proceeding. Do not assume a default set of
personas — different proposals go to different audiences.

---

## Step 3 — Load base context

Use context already loaded by Context Recall in the current session. Do not
re-fetch what is already in context.

Identify any additional vertical-specific context needed — operational constraints,
past decisions, known team priorities, business rules. Fetch only what is missing
via Context Loader.

---

## Step 4 — Fetch strategic docs and SOPs

Three categories of docs must be fetched before mapping objections. Each surfaces a different class of objection. Fetch all three in parallel; skip doc types that return no results but note the gap.

| Category | What to fetch | Objection class surfaced |
|---|---|---|
| **A — Strategic docs** | Quarter Plan, AOP, In-flight Initiative Docs, Recent decision docs (use `google_drive_search`) | Conflicts with live commitments — most likely from leadership |
| **B — SOPs** | All SOPs for the vertical(s) touched (use `google_drive_search`, fetch all results not just top match) | Process breaks — from teams that own those SOPs |
| **C — Existing PRDs** | PRDs in the same vertical/feature area (use `google_drive_search`) | Duplicated work, contradicted decisions, unacknowledged dependencies |

**For each SOP fetched (Category B), identify:**
- Which steps or roles intersect with the proposal
- Whether the proposal changes, removes, or bypasses any of those steps or roles
- Which team owns the SOP and would raise the objection

**For each PRD fetched (Category C), identify:**
- Overlap: does this proposal duplicate something already built?
- Contradiction: does this proposal reverse a decision in a past PRD without acknowledging it?
- Dependency: does this proposal assume something the past PRD built — and is that called out?

---

## Step 5 — Check context freshness

Before mapping, assess how recent the loaded context is. Use these signals since
Drive docs do not surface a last-edited date in fetched content:

- **Explicit timestamps** — if any doc says "as of Q2 2024" or "current as of
  [date]", and that date appears to be more than 90 days before today, treat it
  as potentially stale.
- **References to past states** — if a doc describes a team structure, process,
  or initiative that the proposal or user's prompt implies has since changed,
  treat it as potentially stale.
- **Quarter Plans specifically** — if the Quarter Plan loaded is not the current
  quarter's plan, flag it explicitly. Last quarter's priorities ≠ this quarter's.

**If any loaded doc appears stale**, flag it before mapping:

> *"[Freshness warning: [doc name] appears to be from [inferred period] — more
> than 90 days old. Objections derived from this doc may not reflect current
> priorities. Verify or refresh this doc in Drive for more accurate output.]*"

Still use stale docs — they are better than nothing — but make the staleness
visible so the user can weight the objections appropriately.

---

## Step 6 — Map objections by stakeholder

For each stakeholder persona provided, generate a list of objections they are
likely to raise against this proposal.

Rules for generating objections:

| Rule | Requirement |
|---|---|
| Ground every objection | Must trace to a fetched doc. Generic objections ("too slow", "bad timing") not acceptable without source. |
| SOP conflicts | One objection per SOP intersection. Name the process being broken, not just the outcome. |
| PRD conflicts | One objection per overlap/contradiction/dependency. Name the existing PRD and describe the conflict precisely. |
| Order within stakeholder | Strategic docs (Quarter Plan, AOP) first → SOP conflicts → PRD conflicts → general operational concerns |
| Dimensions to cover | Feasibility, resourcing, timing, strategic fit, operational impact, metrics, dependencies |
| Scope | Do not generate objections outside this stakeholder's domain |

---

## Step 7 — Output format

Present objections grouped by stakeholder in this format:

**[Stakeholder persona]**
- [Objection] *(source: [doc name])*

Where the objection comes from a specific SOP or PRD conflict, make the source
explicit:
- *"This proposal changes step 4 of the returns SOP without reassigning ownership —
  the ops team will flag this as an unplanned process change."*
  *(source: Returns Processing SOP)*

No suggested counters. No recommendations. Objections only.

After presenting all objections, say:
*"This objection map is ready to use for your alignment meeting. If you want to
address any of these in the doc before the meeting, amend the PRD and re-trigger
PRD Reviewer — that will also re-run this mapper after the next sign-off."*

---

## Edge cases

- **Audience is broad or unclear** → ask the user to narrow it down to the
  specific personas who will be in the room. Generic audiences produce generic
  objections.
- **No strategic docs found in Drive** → proceed with vertical context only.
  Flag inline; recommend filing a Quarter Plan and AOP in Drive.
- **No SOPs found for the relevant vertical** → flag inline. Objections about
  process breaks cannot be generated without SOPs. Recommend filing SOPs in Drive.
- **No existing PRDs found in the domain** → note inline that no prior decisions
  were found to cross-reference. Proceed without PRD conflict objections.
- **All strategic docs are stale** → lead the output with a consolidated freshness
  warning naming all stale docs before presenting objections.
- **Verbal description is thin** → ask for enough detail to generate meaningful
  objections before proceeding. Thin input produces surface-level output.
- **User wants to address objections** → user amends the PRD manually and triggers
  PRD Reviewer again. Objection Mapper does not manage this loop — it ends its
  operation after presenting the map. It will run again automatically after the
  next sign-off.

---

---

## Final Step: Save Objections Separately and Push to GitHub

I will automatically:

1. **Save objections to a separate file** (NOT appended to PRD):
   - Path: `~/pm-agent/archives/objections/[YYYY-MM-DD]-[feature-name]-v#-objections.md`
   - Example: `2026-05-17-promise-buffer-v1-objections.md`
   - I will auto-detect the version number to match the PRD being analyzed

2. **Include a reference** to the PRD file this analyzes:
   - Header: "Objections Analysis for: promise-buffer-v1.md"
   - This links the objections back to the specific PRD version

3. **Auto-commit and push**:
```bash
   ~/pm-agent/scripts/commit-and-push.sh "Add Objections: [feature-name] (v#)"
```

4. **Result**:
   - ✅ PRD stays in `archives/projects/`
   - ✅ Objections saved separately in `archives/objections/`
   - ✅ Both version-controlled on GitHub
   - ✅ Linked by filename matching

**Fully automated. Zero manual steps.**