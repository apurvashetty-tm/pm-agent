---
name: exec-brief-writer
description: >
  Activate this skill to package a proposal for leadership in a concise,
  decision-ready format. Triggered manually when the PM wants to take a proposal
  to executives. Works from any input — a PRD, an Initiative Doc, supporting
  data, a verbal description, or any technical doc not written for leadership.
  Translates and distils the input into a standard 4-section executive brief
  (The Ask, Why Now, Options Considered, Recommendation). Format and emphasis
  adapt to the target audience. After producing the brief, automatically chains
  to Objection Mapper using the brief as the source document.
---

# Exec Brief Writer

Translates proposals into decision-ready leadership documents. The source material
can be anything — the skill's job is distillation, translation, and audience
calibration, not creation. Always chains to Objection Mapper after the brief
is produced.

---

## Step 1 — Identify and consolidate the input

Determine what source material is available. This skill accepts any combination of:

- **PRD or Initiative Doc in context or Drive** → primary source; use for The Ask,
  Why Now, and Recommendation sections
- **Supporting data docs** (metrics, post-release analyses, market research) →
  use to quantify claims in Why Now and Recommendation
- **Verbal description in chat** → use when no formal doc exists; treat as the
  primary source and flag that the brief is not grounded in a signed-off PRD
- **Technical or operational docs not written for leadership** → translate and
  distil; strip implementation detail, retain business impact and decision logic

If multiple inputs are provided, consolidate them. The brief must read as a single
coherent narrative — not a summary of multiple docs. Identify any conflicts or gaps
across sources before drafting.

If the input is thin (verbal description only, less than 3 sentences), ask for
more before proceeding:
*"Can you give me more detail on the problem, the proposed solution, and the
expected business impact? The brief will be stronger with more to work from."*

---

## Step 2 — Ask for the target audience

Before drafting, always ask:
*"Who is this brief going to? Name the specific role(s) — e.g. CEO, CTO, COO,
CFO, board."*

Wait for the response. The audience determines the emphasis, language register,
and which sections get the most depth. Do not assume a default audience.

If the audience includes multiple roles at different abstraction levels (e.g., both
CTO and CFO), write for the highest-abstraction role and note at the top:
*"[Note: this brief is calibrated for [higher-abstraction role]. A version with
[technical / financial] depth can be produced separately if needed.]*"

---

## Step 3 — Load strategic context

Before drafting, load context that strengthens Why Now and helps calibrate the
Options Considered section. Use context already in session first — do not
re-fetch what is already loaded.

Fetch if not already present:
- **Quarter Plan** — to establish which existing commitments the proposal fits
  alongside or potentially displaces
- **AOP** — to anchor the investment ask within annual strategic priorities
- **Cross-Cutting team structure** — to correctly name stakeholders in the brief

If strategic docs are empty or missing, proceed without them but flag inline:
*"[No Quarter Plan / AOP found in Drive — the Why Now section is based on the
input docs only. Filing these docs would allow stronger strategic grounding.]*"

---

## Step 4 — Draft the brief

Write the brief in chat. Maximum 400 words for the full brief. Every section
must fit within this constraint — the point of an executive brief is that it
respects the reader's time.

**Language rules that apply to every section:**
- No technical jargon or internal acronyms without a one-clause definition on first use
- Every impact claim must be quantified where possible. "Significant improvement" is not acceptable. "3pp improvement in delivery rate" is.
- Write in plain declarative sentences. Avoid hedges ("might", "could potentially"). If uncertain, say "estimated" with the basis.
- Do not include implementation details (tech stack, sprint plans, API specs). Those belong in the PRD.

**Audience calibration reference** — apply per-section using this table:

| Audience | The Ask | Why Now | Recommendation |
|---|---|---|---|
| CEO | Strategic commitment or investment decision | Revenue, growth, or competitive risk | Growth or retention impact |
| CTO | Technical direction or resourcing decision | Technical debt cost, system risk, or platform dependency | System quality or technical risk reduction |
| COO | Operational or process change approval | Operational pain, error rate, or team capacity | Process improvement or error rate reduction |
| CFO | Budget approval with specific cost figures | Cost of inaction (estimate if exact figure unavailable) | ROI or payback period estimate |
| Board | Strategic commitment or investment decision | Market context, competitive positioning, or governance risk | Strategic alignment and governance accountability |

---

### Section 1 — The Ask

One to three sentences maximum. States:
1. What decision or approval is being sought
2. By when (if time-sensitive)
3. What resources, budget, or headcount are required (if applicable)

This is not a summary of the proposal. It is a precise, unambiguous request. Calibrate framing using the Audience calibration table above.

---

### Section 2 — Why Now

Two to four sentences. States the business case for prioritising this right now.
Must include at least one of:
- A recent data point that has changed (metric movement, competitive signal, user research finding)
- An operational constraint that creates urgency (SLA pressure, capacity cliff, compliance deadline)
- A strategic window that closes (seasonal timing, partner dependency, platform migration)

Do not repeat the problem statement from the PRD verbatim. This section answers "why is now the right moment" — not "what is the problem." Calibrate lead using the Audience calibration table above.

---

### Section 3 — Options Considered

A table with 2–3 rows. Columns: Option | Summary | Why not recommended (or "Recommended").

Rules:
- Always include at least one "do nothing" or "status quo" option
- Each alternative must be a real option that was genuinely considered — not a strawman set up to lose
- The "Why not recommended" column must give a concrete reason, not a vague dismissal ("too slow", "too expensive" are acceptable only with a supporting data point)
- The recommended option has "Recommended" in the final column instead of a rejection reason

---

### Section 4 — Recommendation

Two to four sentences. States:
1. The recommended path forward
2. The expected outcome, quantified where possible
3. The key risk and how it will be managed

Do not repeat what was in The Ask or Options Considered. This section closes the brief — it should give the reader confidence that the writer has thought through the downside and has a plan for it. Calibrate closing using the Audience calibration table above.

---

## Step 5 — Length and language check

After drafting, before presenting to the user, self-check:

- Word count ≤ 400. If over, identify which section is running long and cut.
  The Ask and Why Now should rarely exceed 60 words each. Options Considered is
  a table. Recommendation should be tight.
- Every quantified claim has a source or basis (even if approximate)
- No section uses the same framing as the source PRD verbatim — the brief must
  read as a distinct document, not an excerpt
- The Options Considered table has at least one "do nothing" row
- The Ask states a specific decision, not a vague request for "support" or
  "alignment"

If any check fails, revise before presenting.

---

## Step 6 — Present the brief and save

Present the brief in chat. After presenting, save it as a Markdown file to
Claude's working folder using this naming convention:

`[Brief] Feature Name — Audience.md`

Example: `[Brief] Courier Allocation v2 — CEO.md`

Share the file link with the user.

---

## Step 7 — Chain to Objection Mapper (automatic)

After saving the brief, automatically invoke Objection Mapper. Pass the brief
itself as the source document — not the original PRD. The brief is what will
be presented in the alignment meeting, so the objections should be mapped
against what leadership will actually read.

Say: *"Brief saved. Running Objection Mapper against the brief now — which
stakeholders will be in the room?"*

Wait for the audience response and let Objection Mapper run from there.

---

## Edge cases

- **Input is a PRD written in technical language** → do not summarise the PRD.
  Translate it. The brief must be readable by someone who has never seen the PRD
  and has no technical background.
- **No formal doc exists — verbal description only** → produce the brief from
  the verbal description. Flag at the top: *"[Note: this brief is based on a
  verbal description, not a signed-off PRD. Sections may need revision once a
  PRD is available.]*"
- **Multiple audiences with conflicting emphasis** → write for the highest-
  abstraction audience. Offer to produce a variant for other roles after.
- **Input doc is confidential or contains sensitive personnel/financial data** →
  ask before including specific figures in the brief. Executive briefs are often
  shared beyond the immediate meeting.
- **Options Considered is genuinely binary (do it or don't)** → still present
  two rows. The "do nothing" option is always a legitimate choice to document.
- **User wants to edit the brief before Objection Mapper runs** → let them.
  Wait for explicit confirmation before chaining to Objection Mapper.
