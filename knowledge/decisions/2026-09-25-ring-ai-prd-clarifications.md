---
name: 2026-09-25-ring-ai-prd-clarifications
description: Three PRD clarifications locked after a Confluence comment-review cycle on ACOM × Ring AI (23–25 Sep) — retry threshold confirmed at 4 attempts, a human-assigned lead is never assigned to the bot, and a retry-exhausted closure is permanent per lead. Read for the exact wording and why each was needed.
metadata:
  type: decision
  domain: acom
  status: locked
  supersedes: 2026-09-09-ring-ai-fresh-platform-prd (retry threshold value only — was a ~3-attempt placeholder)
---

# ACOM × Ring AI — retry threshold + two new locked rules (25 Sep 2026)

**Context.** A round of Confluence inline-comment review on the AI-led Lead
Qualification PRD (PROD page 2023260174) surfaced three edge cases that needed a
product answer rather than an engineering one. Resolved with the reviewing team,
comment-by-comment, then written into the PRD.

## 1. Retry threshold confirmed at 4 attempts

The PRD had carried a working placeholder — "~3 attempts, business to finalise" — in
the §6 settings table. Business confirmed **4 attempts**, within TRAI/DND limits (no
TRAI-mandated cap on the number itself), with gaps of 30 min after attempt 1, 60 min
after attempt 2, and 60 min after attempt 3.

This number appeared in three places in the PRD (the settings table, the retry-gap
row, and the "when we stop" prose paragraph); a first edit pass updated only two of
the three — caught in review, and now the practice going forward is to scan the whole
document for every occurrence of a changed fact before calling an edit done.

## 2. A human-assigned lead is never assigned to the bot

**Question raised:** how do we avoid the AI calling a lead a human agent already has
in hand (e.g. via the manual queue)?

**Answer:** once a human agent is assigned to a lead, that lead is never assigned to
the bot. This is already mechanically true — the "Assigned to a human agent"
disposition (PRD §6 dispositions table) already exists and already means the lead
isn't picked up elsewhere — so this isn't a new mechanism, just a new locked
requirement stating it explicitly, scoped to that lead. A new cart or order creates a
fresh lead with its own reference id (§12), evaluated fresh — it is not "sticky" across
a customer's whole history.

**Drafting note.** An earlier draft named the "Assigned To" field as the detection
mechanism, and a version before that framed it as an unresolved Engineering open
question. Both were corrected: a PRD states the bare product requirement; it doesn't
suggest or name an implementation mechanism — that's Engineering's to figure out. The
final wording added to PRD §9 is:

> Once a human agent is assigned to a lead, that lead is never assigned to the bot.
> Scoped to that lead — a new cart or order creates a fresh lead (§12) and is
> evaluated fresh.

## 3. Retry-exhausted closure is permanent per lead

**Question raised:** once a lead is closed for hitting the retry threshold, does it
ever get reopened or re-checked?

**Answer:** no. Closure on retries-exhausted is permanent for that lead — it is never
reopened or rechecked later. The only way the same customer re-enters the system is a
new cart or order, which creates a fresh lead with its own reference id; nothing
resurrects a closed one. Added to PRD §6:

> This closure is permanent for that lead. Retries exhausted means done — we don't
> reopen it or recheck it later. The only way this customer re-enters is a new cart or
> order creating a fresh lead with its own reference ID; nothing resurrects a closed one.

## Where this lives in the PRD

- Retry threshold: §6 (settings table, retry-gap row, "when we stop" paragraph).
- Human-assigned-never-to-bot: §9, Decided, 🆕 Added 25 Sep.
- Retry-exhausted-permanent: §6, 🆕 Added 25 Sep.

## Status

Locked. All three are live on Confluence (0 dangling comments after the push) and
mirrored into `docs/ai-led-lead-qualification-prd.md` and `docs/context/project_truth.md`.
