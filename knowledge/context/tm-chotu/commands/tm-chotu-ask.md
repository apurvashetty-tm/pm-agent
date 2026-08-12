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

Based on question content, invoke the matching section skill(s) per the routing map in `using-tm-chotu`:
- Definitions / acronyms / "what does X mean" → `tm-chotu-definitions`
- Numbers / metrics / "how many" → `tm-chotu-overview` + `tm-chotu-joins` + `tm-chotu-query-rigor`
- Flow / lifecycle / process → `tm-chotu-business-flows`
- Module / system / engine → `tm-chotu-modules`
- DB / table / where data lives → `tm-chotu-data-sources` + `tm-chotu-tables-enums`
- Enum code → `tm-chotu-tables-enums`
- SQL recipe → `tm-chotu-joins`
- Customer / persona / cohort / FTC → `tm-chotu-customer`
- Function / team / who-owns → `tm-chotu-functions`
- Project name → `tm-chotu-projects`

## Step 4 — Query rigor (if data-bound)

If the question requires pulling numbers from a DB, invoke `tm-chotu-query-rigor` HARD STOP rules first:
- Default 3-month window (reject "all time")
- Sample-first → hypothesis → user confirm → full pull
- Index-aware
- DB 170 (Redshift) preferred
- Verify table before locking as authoritative

## Step 5 — Answer

Reply in the routed mood. Cite source table + DB + time window. Never present uncited number.

## Step 6 — Knowledge gap

If the question doesn't match any loaded skill, draft a skill-request markdown at `~/.claude/plugins/tm-chotu/SKILL_REQUESTS/<YYYY-MM-DD>_<topic>.md` with:

- The exact question
- What the answer would need
- Which existing skill is closest

Then tell user: "I don't have this loaded. Drafted a skill-request for Mangesh — email it so the analytics team can ship a plugin update."
