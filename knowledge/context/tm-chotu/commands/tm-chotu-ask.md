---
description: Force-route a question through the full tm-chotu pipeline (mood-router → query-rigor → section skill). Use when default behaviour isn't pulling.
---

# tm-chotu ask

User passes a question as argument. Forced pipeline:

## Step 1 — Read state

Read `~/.claude/tm-chotu-state.json` for `persona` + `default_mood`. If file missing → suggest `/tm-chotu-onboard` first.

## Step 2 — Mood route

Invoke the `tm-chotu-mood-router` skill with the user's question. Override `default_mood` if the question contains strong mood signals (see mood-router skill triggers).

## Step 3 — Section routing

**Use the routing map in `using-tm-chotu` — read it, do not work from memory.** It is the single source; this command deliberately does not duplicate it, because a stale copy here silently drops whole skills (it previously omitted `rx-cadence`, `inventory`, `tat`, `dcoe-cohorts`, `learnings`, `pii-register` and `excel-deliverable`, so Rx and stock questions routed nowhere).

Multiple skills may apply — load each.

## Step 4 — Query rigor (if data-bound)

This command forces the **full** pipeline — every mandatory gate from `using-tm-chotu`, not a subset:

1. **`ASK_RESOLVER.md` first** — resolve the wording. If it resolves → fast path, and **declare the branch in one line**. If not → the Intent-First gate.
2. **`tm-chotu-learnings`** before any non-trivial analysis — check for a matching failure mode.
3. **`tm-chotu-pii-register`** before any query touching personal data.
4. **`tm-chotu-query-rigor` HARD STOPs**: default 3-month window (reject "all time"), sample-first → hypothesis → confirm → full pull, index-aware, DB 170 preferred, verify table before locking.
5. **Back-by-proof** on every number: exact SQL + capped raw sample + aggregate breakdown.
6. **Excel deliverable** → `tm-chotu-excel-deliverable`, and `verify.py` must PASS with its output pasted into chat.

## Step 5 — Answer

Reply in the routed mood. Cite source table + DB + time window. Never present uncited number.

## Step 6 — Knowledge gap

If the question doesn't match any loaded skill, draft a skill-request markdown at `SKILL_REQUESTS/<YYYY-MM-DD>_<topic>.md` **inside the installed plugin folder** (find it with `claude plugin list`; it is versioned). ⚠️ That directory is **replaced on every update** — email it to Mangesh the same day — with:

- The exact question
- What the answer would need
- Which existing skill is closest

Then tell user: "I don't have this loaded. Drafted a skill-request for Mangesh — email it so the analytics team can ship a plugin update."
