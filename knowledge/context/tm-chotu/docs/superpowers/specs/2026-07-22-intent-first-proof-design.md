# tm-chotu v0.1.15 — Intent-First Metrics + Back-by-Proof

**Date:** 2026-07-22
**Status:** Approved design (brainstorming complete)
**Target version:** 0.1.15 (current HEAD: 0.1.14)
**Primary file:** `skills/tm-chotu-query-rigor/SKILL.md` + new `skills/tm-chotu-query-rigor/METRIC_CATALOG.md`

---

## Problem

Two live failures showed chotu handing users confident-but-wrong numbers:

1. **Kunal — "show me all inventory."** chotu found every table containing an inventory quantity and **summed across them**, double-counting live qty against mirror/rack tables that don't reconcile. Result: a wrong total presented as fact.
2. **Rahul — "what was our revenue yesterday."** chotu **invented a derivation on the spot** and counted *all* orders including incomplete/cancelled ones, using a cart-stage value. Result: an inflated number the user believed until the nuance surfaced later.

Root cause is identical in both: chotu silently picks **one** interpretation of an ambiguous metric, pulls, and reports a bare number with no evidence. The user cannot catch the wrong assumption before trusting the figure.

v0.1.13 added an *explain-logic-first* rule to `tm-chotu-query-rigor`, but it is **one-directional** — chotu states a single definition it already knows, then pulls. It does not (a) surface the *structure* of where the data lives, (b) enumerate the competing interpretations, (c) stop to learn the user's goal, or (d) ship the raw evidence behind the number.

## Goals

- **G1 (Update 1 — Intent-first):** Before pulling any metric, chotu explains the data structure + interpretation branches, then **hard-stops** to learn the user's goal and confirm the branch. Work backwards from the goal, never forwards from a guessed derivation.
- **G2 (Update 2 — Back-by-proof):** Every number ships with the evidence it was computed on — exact SQL + a capped raw sample + an aggregate breakdown — so users treat chotu as a fallible assistant, not an oracle.

## Non-goals

- No change to the time-window / index-awareness / DB-preference / backoff / verify-table / schema-case / typo / substitution-join rules already in `tm-chotu-query-rigor` — those stay verbatim.
- No new MCP tooling or data pipeline. Behavioral + reference-content change only.
- Not building an exhaustive catalog of every metric now — seed the high-traffic ones, leave extensible stubs.

---

## Design

### Component 1 — Intent-First Protocol (rewrite of the query-rigor gate)

Replace the current one-way "explain the logic BEFORE pulling data" section with a **hard-gated, goal-first sequence** that fires on ANY request for a metric, number, count, rate, or aggregate.

**The sequence (mandatory order):**

- **Step 0 — Structure + branches.** From the loaded section skill, state up front:
  - *Where the data lives* and its structural caveats — e.g. inventory: live DB 180 vs rack/physical source, **which may not sync**; revenue: the order lifecycle placed → confirmed → dispatched → delivered → returned.
  - *The interpretation branches* — each with its derivation/formula + source table(s) + a one-line caveat. Pulled from the Metric Interpretation Catalog (Component 2), which cites the authoritative section skill.
- **Step 1 — Goal HARD STOP.** Ask the user's goal and which branch. **Do not pull until answered.** Frame it as "what are you trying to do with this?" so the branch falls out of the goal (daily-trend monitoring vs board number vs ops decision).
  - **Session-lock:** once a `(metric, branch)` pair is confirmed in this session, reuse it silently for the rest of the session — do not re-ask the same metric. **Silent = suppress only the re-ask/hard-stop.** The one-line branch disclosure and the Step-4 proof STILL ship every turn; a session-locked repeat is never a bare number.
- **Step 2 — Sample-first** (existing rule, unchanged): run `LIMIT 100` / single-day sample on the **chosen** branch, show shape + a caveman hypothesis of what the full pull will look like.
- **Step 3 — Confirm + proof-scope ask.** Show the sample and ask two things together: "Pull full? And do you want **all raw data**, or just the capped proof rows?" The answer decides delivery format in Step 4. **Carry the existing exemption verbatim:** skip this confirm-halt if `mood = research` and the window is already small (the current sample-first rule) — the protocol must not override a rule it claims to leave unchanged.
- **Step 4 — Deliver with proof (G2).** The number **always** ships with:
  1. the **exact SQL** that produced it,
  2. a **capped raw sample** of the underlying rows (10–20),
  3. an **aggregate breakdown** (e.g. revenue split by status bucket; inventory by source table).
  - If the user asked for **all raw data** → deliver via an **export path** (CSV to scratchpad / a saved Metabase question), because chat cannot hold thousands of rows and the 200-row MCP cap truncates silently.

**Escape hatch.** If the user says "just the number" / "skip the explanation," chotu **collapses the dialogue steps**: skip the Step-1 hard-stop AND the Step-3 confirm-halt, run the pull directly, and ship **number + one-line branch tag + minimal cited proof** (the exact SQL as a one-liner + the aggregate breakdown). The 10–20-row raw sample is offered "(say 'show rows' for the raw sample)" rather than dumped. So in escape-hatch mode Step 4's "always" degrades to *minimal proof inline, full sample on request* — the branch and the SQL are still never hidden. The nuance is *surfaced*, never *hidden* — this is the whole point of both updates.

**Interaction with existing rules.** The protocol sits *before* the existing sample-first/window/index rules and feeds them the chosen branch. All downstream rules (window cap, index probe, DB preference, backoff, output discipline, refuse-to-fake) apply unchanged to the pull the protocol authorizes.

### Component 2 — Metric Interpretation Catalog (new reference file)

New file: `skills/tm-chotu-query-rigor/METRIC_CATALOG.md`. A **thin presentation index** — for each common metric it lists the branches chotu presents at Step 0, and **cites the authoritative section skill** for the full derivation rather than copying it (prevents drift from `tm-chotu-definitions` / `tm-chotu-inventory` / `tm-chotu-dcoe-cohorts`). `tm-chotu-query-rigor/SKILL.md` instructs: *on any metric request, read METRIC_CATALOG.md; if the metric isn't listed, derive branches from the section skill and add a stub.*

**Seed entries (2026-07-22).** Two grades of claim, kept distinct: **locked** = a formula/anti-pattern quoted verbatim from a section skill; **presentation slice** = a chotu-derived re-slice the user may want, which must not *contradict* the skill but is not itself definitions-locked.

- **Revenue** (authority: `tm-chotu-definitions`)
  - (a) *Daily-trend / placement momentum* — **presentation slice, NOT billable revenue.** `SUM(order_details.order_value)` at order-placed stage, all placement rows, no delivery filter, `organisation_id = 1`. Flag inline: `order_value` is cart pre-bill (definitions), so this is a momentum proxy, not revenue. Use only for day-over-day placement trend. *(This is the branch the user named for "daily trends" — legitimate, but must be labelled a slice, not a locked revenue figure.)*
  - (b) *Placed − canceled* — presentation slice: (a) minus `orderstatus = 57` (canceled). `57 = canceled` is locked (definitions L174); the "minus cancelled" re-slice is chotu-derived. Do **not** use the undefined token "discarded" — if a discard status is needed, cite its code from `tm-chotu-tables-enums` first.
  - (c) *Business / delivered* → **GMV** = `SUM(final_calculated_amount.final_amount) WHERE order_details.orderstatus = 55 AND organisation_id = 1`. **Never** `order_details.order_value`. **Locked in definitions.**
  - (d) *Net revenue* → GMV − returns − refunds. **Locked in definitions.**
  - **Anti-pattern (Rahul's failure), locked:** counting all orders incl. incomplete, or using `order_value` as revenue. Flag explicitly.
- **Inventory** (authority: `tm-chotu-inventory`)
  - (a) *Business / analytics live qty* → **DB 180** `INVENTORY_SCHEMA.product_inventory_data` (real-time NetSuite sync, universal across all active WHs incl. Vinculum-backed Faridabad). Cross-DB joins → DB 432 `tmmumpsdb.product_inventory_data` (Airbyte mirror).
  - (b) *WH / physical / rack-level ops* → ⚠️ **VERIFY-GAP:** the exact rack/bin-level source table is **not yet locked** in `tm-chotu-inventory`. Do NOT name a table until confirmed (see Open Questions). Until then, for physical/rack questions, state the gap and route to WMS/NetSuite bin data rather than guessing.
  - **Caveat (anchored to the skill):** live onhand qty diverges from the *manual* `medicine_warehouse_master.availability` Catalogue flag (JIT → non-onhand ≠ unavailable, L85; the flag is not real-time, L86). The stronger "live-qty vs a physical/**rack** source may not reconcile" statement stays **conditional on resolving the VERIFY-GAP** — do not assert a rack-reconciliation gap the skill doesn't yet define.
  - **Anti-pattern (Kunal's failure):** **never sum a quantity across inventory tables** — pick one source by use-case; they don't reconcile. This is *derived from the Kunal failure*, not yet verbatim in the skill, so **implementation adds it as an explicit anti-pattern line to `tm-chotu-inventory`** (see Component 3) — grounding the rule before the catalog cites it. Legacy `inventory_tracking` deprecated — never use (locked, L75).
- **Margin** — two *distinct* concepts; the branch chosen depends on the goal (customer/cohort economics vs item P&L). Never conflate their labels.
  - (a) *Customer / cohort contribution margin* → DCOE **`cm_net` / `cm_net_90d`** (authority: `tm-chotu-dcoe-cohorts` §1). **Caveat:** `cm_net` is **fully-loaded** — rev − COGS − zone shipping − COD surcharge − return logistics − packaging − promo/comms − coupon − tm_cash − adjustment − price-lock − CPO. It is **not** a COGS-only CM1 (it's nearer CM2/CM3); do not report it as "CM1". If the user means COGS-only CM1, confirm against `tm-chotu-definitions` first. The cohorts skill ships both an exact-source `cm_net` spec **and** a runnable raw **PROXY** (omits zone-shipping / return-logistics / promo-comm / CPO) — the proxy is the practical rank-and-cut tool, **not** an exact ₹ figure.
  - (b) *Item-level margin* → **route-A** = Formula − all 4 discount layers (authority: NetSuite item-margin reference). "Route-A" is **NetSuite item-margin terminology only** — it does not appear in the cohorts skill; never attach it to `cm_net`.
  - **Do not invent a margin formula.** Route to (a) or (b) by use-case and cite the owning authority verbatim.
- **Extensible stubs (branches TBD, add on first real ask):** GMV (≈ revenue-c, delivered-only), AOV (= GMV / delivered-order count), Active users (install vs signup vs FTC-delivered vs FOP-placed — cite definitions anti-patterns), Retention (M1 / M3 / M6 — cite definitions).

### Component 3 — Touchpoints

- `skills/using-tm-chotu/SKILL.md`: add one line so intent-first + proof-by-default is front-of-mind at session entry (it already routes to query-rigor as the gatekeeper).
- `skills/tm-chotu-query-rigor/SKILL.md` frontmatter `description:`: update to name the intent-first hard gate + back-by-proof so the skill triggers on metric asks.
- `skills/tm-chotu-inventory/SKILL.md`: **add the anti-pattern line** `❌ Never SUM a quantity across inventory tables — pick one source by use-case; they don't reconcile.` This grounds the Kunal-failure rule in the authoritative skill so the catalog cites (not invents) it.

### Component 4 — Ship

- Version bump `0.1.14 → 0.1.15` in `.claude-plugin/plugin.json` (installed copy is stale at 0.1.11 — reconcile to 0.1.15).
- Update `KNOWLEDGE_DUMP.md` with the intent-first protocol + catalog pointer.
- Secret-scrub (shared repo), commit with **neutral attribution** (no Claude co-author), tag `v0.1.15`, push `main` + tag.
- Rebuild the leak-safe zip via `git archive --prefix=tm-chotu/` (tracked-only).

---

## Testing / verification

- **Fact-check the catalog** against the section skills, holding the two grades to different bars: **locked** claims (GMV / net-revenue formulas, status codes, `cm_net`, route-A, the anti-patterns) must match the owning skill **verbatim** — no invented tables, no drifted formulas, no mislabelled terms (`cm_net` ≠ CM1, route-A ≠ cohorts). **Presentation slices** (placed-level momentum, placed−cancelled) must **not contradict** the skill and must be labelled as slices, not locked facts. Done via the ultracode verification workflow before user review (first pass 2026-07-22 caught the route-A/CM1 conflation + the placed-level framing — folded in).
- **Scenario replay** — re-run the two failure prompts mentally against the new protocol:
  - "show me all inventory" → chotu explains 2 sources + may-not-sync, hard-stops for goal, never sums.
  - "revenue yesterday" → chotu presents 4 branches, hard-stops, delivers with SQL + raw sample + status breakdown.
- **Common-question round** (per the audit-after-ship rule): 6–10 metric prompts run through the protocol to confirm the gate fires and proof ships.
- **Consistency self-review** — no placeholders, no section contradicting another, scope fits one plan.

## Open questions

- **Rack-level inventory source table** — the user references a "rack level table" distinct from live inventory. The exact table is not locked in `tm-chotu-inventory`. Resolve during implementation (probe WMS/NetSuite bin data) or leave as an explicit VERIFY-GAP in the catalog for a follow-up version. **Does not block** v0.1.15 — the anti-sum rule + gap-flag is the safe interim behavior.

## Rollout

Single version, no migration. The behavior activates the moment `tm-chotu-query-rigor` loads (every data-bound prompt). Session-lock is in-context only; no persisted state.
