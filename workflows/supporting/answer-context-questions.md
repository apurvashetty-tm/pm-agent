---
name: context-qna
description: >
  Always activate this skill immediately after Context Loader has fetched docs in the
  same session. Handles answering questions about Truemeds org context using loaded
  content, manages multi-turn follow-up questions without re-fetching, flags low
  confidence when context is thin, and calls out assumptions made due to missing
  information — all inline within the response.
---

# Context Q&A

Answers questions about Truemeds using context already loaded by Context Loader
in the current session. Always runs after Context Loader. Never runs standalone.

---

## Step 1 — Check what's already in session

Before doing anything, check whether Context Loader has already fetched relevant
docs in this conversation (look for the CONTEXT LOAD MANIFEST block).

- **Manifest exists** → use what's loaded. Do not re-fetch.
- **No manifest exists** → prompt Context Loader to run first. Do not attempt
  to answer without it.

---

## Step 2 — Assess confidence before answering

Before formulating the answer, assess how well the loaded context actually covers
the question. Decompose the question into its key entities — typically a combination
of: vertical, process, team, and metric. Count how many of these entities are
directly addressed by at least one loaded doc.

**Confidence threshold rule:**
- **2 or more entities covered** → proceed to Step 3 with normal confidence.
- **Fewer than 2 entities covered** → flag low confidence upfront before answering:
  *"[Low confidence: the loaded context covers fewer than 2 of the key entities
  in this question ([list uncovered entities]). The answer below is based on
  partial context — filing docs for [vertical/topic] would improve accuracy.]"*

  Then answer anyway using what is available. Do not refuse to answer — a partial
  answer with a clear flag is more useful than silence.

---

## Step 3 — Check for staleness

Before using a doc's content to answer, check whether the doc may be outdated.
Since fetched doc content does not include a last-edited date, use these two signals:

**Signal 1 — Internal contradiction with the user's prompt:**
If the loaded doc describes a process, feature, or rule that the user's prompt
implies no longer exists or has changed (e.g., the doc mentions a team structure
the user referred to in past tense, or a flow the user says was recently redesigned),
treat the doc as potentially stale. Flag it inline:
*"[Staleness warning: this doc may be outdated — it describes [X] but your prompt
suggests [X] has changed. Verify against the current state before acting on this.]"*

**Signal 2 — Doc references known past states:**
If the doc uses language that strongly implies a point-in-time snapshot ("as of
Q2", "current state as of [year]", "pilot phase") and that timeframe appears to
predate the question context, flag it the same way.

When staleness is flagged, still use the doc's content to answer — but make clear
the user should verify. Do not silently discard a doc just because it might be old.

---

## Step 4 — Formulate the answer

Use the loaded content to answer the question as accurately and completely as possible.

Inline rules while answering:

- **Cite the source doc** for every specific claim. Example: *"According to the
  Hyperlocal Forward product flow doc..."*
- **Flag assumptions inline** wherever the loaded content doesn't fully cover the
  question and you've had to infer or assume something. Use this format:
  *"[Assumption: X — no doc currently covers this, filing one would improve accuracy]"*
- **Flag low confidence inline** for individual claims (beyond the upfront flag in
  Step 2) wherever a specific sub-claim rests on thin or indirect evidence. Use:
  *"[Low confidence: the loaded doc doesn't fully address this — consider filing a
  more detailed doc on X]"*
- **Flag staleness inline** for individual claims that come from a doc already
  flagged as potentially stale in Step 3.

---

## Step 5 — Handle follow-up questions

If the user asks a follow-up question in the same conversation:

- **Answer can be formed from already-loaded docs** → answer directly, no re-fetch.
  Re-run Steps 2–4 against what is already in context.
- **Follow-up introduces a new vertical or topic not yet loaded** → trigger
  Context Loader for that specific vertical only, then re-run Steps 2–4.
- **Never re-fetch a doc already present in the session manifest.**

---

## Edge cases

- **Conflicting information across docs** → surface the conflict inline and cite
  both sources. Do not silently pick one. Let the user decide which is authoritative.
- **Question is outside the scope of all loaded docs** → say so clearly. Identify
  which vertical index or doc type would need to be filed to answer it properly.
- **All loaded docs are flagged as stale** → answer using the best available content,
  lead with a summary staleness warning, and recommend the user refresh the relevant
  docs in Drive before acting on the answer.
- **Confidence threshold fails AND docs appear stale** → lead with both flags before
  answering. This is the highest-uncertainty scenario — make that clear.
