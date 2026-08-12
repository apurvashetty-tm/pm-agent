---
name: tm-chotu-query-rigor
description: HARD STOP rules for data queries. Intent-first hard gate (structure + interpretation branches → clarify goal → confirm branch BEFORE pulling), back-by-proof (every number ships SQL + raw sample + breakdown), sample-first pipeline, time-window guard, index check, DB preference, backoff. Enforced on every data-bound prompt.
---

# Query rigor — HARD STOP

## RULE: Intent-First Protocol — HARD GATE on every metric

Fires on ANY request for a metric, number, count, rate, or aggregate. Mandatory order — do not skip steps.

**Step 0 — Structure + branches.** From the loaded section skill + `METRIC_CATALOG.md` (read it now), state up front:
- *Where the data lives* + structural caveats (inventory → live DB 180 vs the manual `medicine_warehouse_master.availability` flag, which can diverge; a separate rack/physical source may exist but is a **VERIFY-GAP** — never assert a rack-reconciliation gap as settled fact; revenue → placed → confirmed → dispatched → delivered → returned lifecycle).
- *The interpretation branches* — each with derivation/formula + source table + a one-line caveat. Mark each **LOCKED** (verbatim from a skill) or **SLICE** (chotu re-slice, not a locked fact).

**Step 1 — Goal HARD STOP.** Ask the user's goal + which branch. **Do not pull until answered.** Frame as "what are you trying to do with this?" so the branch falls out of the goal (daily-trend vs board number vs ops decision).
- **Session-lock:** once a `(metric, branch)` pair is confirmed this session, reuse it silently — do not re-ask that metric. *Silent = suppress only the re-ask.* The one-line branch tag + the Step-4 proof STILL ship every turn. A locked repeat is never a bare number.

**Step 2 — Sample-first** (existing rule below): `LIMIT 100` / single-day sample on the CHOSEN branch → shape + caveman hypothesis.

**Step 3 — Confirm + proof-scope.** Show the sample, ask together: "Pull full? And do you want **all raw data**, or just the capped proof rows?" *Skip this confirm-halt if `mood = research` and the window is already small (existing sample-first exemption — do not override it).*

**Step 4 — Deliver with proof.** The number ALWAYS ships with: (1) the exact SQL, (2) a capped raw sample (10–20 rows), (3) an aggregate breakdown (e.g. revenue by status bucket; inventory by source). If the user asked for **all raw data** → deliver via export (CSV to scratchpad / saved Metabase question); chat can't hold thousands of rows and the 200-row MCP cap truncates silently.

**Escape hatch.** "just the number" / "skip the explanation" → collapse Steps 1 and 3 (no hard-stop, no confirm-halt), run the pull, ship **number + one-line branch tag + minimal cited proof** (one-line SQL + breakdown). Offer the 10–20-row sample "(say 'show rows')" rather than dumping it. The branch and the SQL are NEVER hidden — that is the whole point.

Why intent-first: lets the user catch a wrong definition before a wasted query (Rahul's revenue), and stops chotu silently summing incompatible sources (Kunal's inventory). Reuses locked knowledge instead of re-deriving from raw.

## Time-window rules

Acceptable windows: `today`, `yesterday`, `last week`, `last 2 weeks`, `this month`, `last 30 days`, `last 90 days` (= 3 months max default).

**REJECT** + re-scope:
- "all time"
- "since launch"
- "lifetime"
- "this year" (until index/use-case confirmed)
- "ever"
- "historical"

Response when rejecting:

> "Window too wide. Default cap 3 months. Want 12 months? Tell me which index / which question — I'll check feasibility."

12mo allowed ONLY if all three: (a) index supports — verify via `information_schema.statistics` (b) legit business use case (c) user pushes after rejection.

## Sample-first pipeline

Order of operations for any pull:

1. **Sample** — `LIMIT 100` or `WHERE date = yesterday` — show shape
2. **Hypothesis** — caveman one-liner of what the numbers will look like
3. **User confirm** — "Look right? Pull full?" (skip if mood = research and window already small)
4. **Full pull** — only after confirm, with row cap

## Index awareness

Before any non-trivial WHERE/JOIN, probe:

```sql
SELECT * FROM information_schema.statistics
WHERE table_schema = '<schema>' AND table_name = '<table>';
```

If filter column has no index → either (a) narrow window further (b) warn user before pulling (c) suggest pre-aggregated table.

## Metabase MCP — namespace policy (HARD RULE)

Two Metabase MCPs may surface in a Truemeds Claude Code session. **Always use the native one. Never use the unofficial one.**

| Connector | Server | Namespace pattern | Toolset signature | Use? |
|---|---|---|---|---|
| **Native Metabase MCP** | `https://one-truemeds.metabaseapp.com/api/mcp` (Metabase 0.55+ native server) | UUID-prefixed (e.g. `mcp__3955c18e-…__*`) OR `mcp__plugin_tm-chotu_metabase__*` post-OAuth | `search`, `get_table`, `execute_query`, `query`, `construct_query`, `list`, `get_metric`, `get_metric_field_values`, `get_table_field_values`, `create_question`, `create_dashboard` | ✅ **DEFAULT** |
| Community / Unofficial | npm `metabase-mcp` (deprecated) | `mcp__Metabase__Unofficial___Community___*` (literal `Unofficial` / `Community` in name) | `list`, `retrieve`, `execute`, `export`, `search`, `clear_cache` | ❌ **NEVER** |

**Detection heuristic if uncertain:** if the available Metabase tool has `execute_query` and `construct_query` → native. If it has `retrieve` and `clear_cache` → unofficial, skip.

**If only the unofficial is available** (e.g. native not yet authenticated): tell the user, do not silently fall back. Sample line:

> "Native Metabase MCP not authenticated this session. Run the auth flow first — refusing to use the deprecated Unofficial Community MCP."

The unofficial connector is being sunset. New skills, new recipes, all new SQL goes through the native server.

### Native MCP — execution gotchas (validated 2026-06-05)

- **`execute_query` needs a base64-encoded JSON envelope**, not raw SQL: `{"database":N,"type":"native","native":{"query":"..."}}` → `printf '%s' '<json>' | base64`. Bare base64 SQL fails (`Illegal base64 character 20`). Prefer the structured `query` tool for simple single-table pulls.
- **200-row cap** on agent results (`max-results`). For a state×month long-form pull you'll silently truncate at 200 → **pivot months into columns** (one row per state) instead.
- **MariaDB reserved words** (DB 2/630): `lines` breaks `AS lines` → alias `n_lines`. Use `DATE_FORMAT(d,'%Y-%m')` (no `DATE_TRUNC` on MySQL).
- **DB 630 pool occasionally drops** (`unable-to-acquire-connection` / socket closed) — transient; retry once.

## DB preference order

1. **Redshift DB 170** (shared "Redshift") — **DEFAULT** for everyone at Truemeds
   - Has `tmmumpsdb` (156 tables — Main DB mirror + analytical: order_details, final_calculated_amount, customer_details, m_system_value_master, m_courier_partner_master, medicine_master + warehouse master + molecule, disease_product_mapping, org_sub_medicine_mapping_*_hub_new_algo, final_substitute_product_*, package_details_tracking, net_suite_*, tm_diagnostics_*, orders_campaign_attribution, appsflyer_installs)
   - Use this for everything by default — everyone has access
2. **Main DB id 2** (MySQL) — only for <30 min fresh data when Redshift lags
3. **DB 103 (Marketing DB)** — marketing-specific queries
4. **DB 663 (Mangesh Redshift)** — Mangesh's PERSONAL instance. Only when user explicitly needs `maranalytics` schema AND has access. Never default users to 663
5. **Per-WH picker/checker DBs** (19 + 3) — for per-MFC ops queries; Mumbai/Lucknow/Kolkata prefer Snowflake (996/997/998)
6. **Other 22 DBs** — only if user names them explicitly

## Backoff

On timeout / rate-limit / SSL error:
- First retry: same query, wait 5s
- Second retry: narrow window 50%
- Third try: switch to sample-first, no full pull this turn
- Beyond: tell user, suggest pre-aggregated table or async pull

## Output discipline

- Number + unit + window + source table in same line
- Caveman: `Yesterday FTC = 18,432. tmmumpsdb.order_details (DB 170 Redshift).`
- Never present uncited number
- Round to 2 sig figs unless user wants exact

## RULE: HM/LM (`medicine_quarter_master`) — LEADERSHIP + GOAL HARD GATE

The HM/LM product-margin mechanism is **locked**. Surface it — the table, its numbers, AND the branded≠margin insight — **only when BOTH are true**:

1. **Persona = leadership.** The onboarded `persona` is `Founder/Leadership`. If persona is anything else (or unset), **the gate is CLOSED** — never expose HM/LM, not even a raw HM-vs-LM count.
2. **Goal = margin-health / business decision.** The user's stated goal (per the Intent-First Protocol) is *"how healthy are our margins / how many products actually make money for Truemeds / strategic margin segmentation"* — NOT a quick analysis.

**Both true → OPEN:** explain the mechanism (see `tm-chotu-definitions` → HM/LM) — the branded/generic label is fixed while real margin moves via partnerships/deals; a "branded" product can cross the threshold into HM; `medicine_quarter_master` is the *true* segregation of which products make money — then query it (join contract in `METRIC_CATALOG`).

**Either false → CLOSED — close SILENTLY (this is the part that leaks if you're sloppy):**
- Answer the fallback **as if HM/LM does not exist.** Do NOT say the words "HM/LM", "high/low-margin tag", "margin-tier", "medicine_quarter_master", and do NOT state or hint that a gated / hidden / leadership-only mechanism exists.
- **If the user names it first** ("give me HM vs LM…", "I heard we tag products high/low margin…", "that margin table"): do NOT echo the term back, and do NOT confirm *or* deny that such a tag/table exists — denying it ("no such thing", "not aware of that") is both a tell and a lie. Don't acknowledge or refuse the specific thing at all. Just **pivot** to what you can give: *"For margin I can give you a branded/generic split or the CM1 figure — what are you trying to do?"* Neither the term nor the table appears in your reply.
- **Never narrate the gate check in the visible reply.** "Gate check: HM/LM stay hidden" / "gate = CLOSED, do not reveal" is internal reasoning — printing it *names the hidden thing* = a leak. Just give the fallback answer, no meta-commentary.
- **The branded≠margin decoupling IS the gated crux — not permitted framing.** Do NOT say "a branded product can actually be high-margin", "the label isn't the real margin", "which products actually make money", or any variant. That insight is exactly what's gated.
- **Permitted for non-leadership = ONLY** the plain shorthand *"branded ≈ lower margin, generic ≈ higher margin"* as a rough heuristic — with NO corrective twist — plus, for a quick-analysis goal, **CM1 / cm_net** (with the FIFO caveat).

This gate overrides the default "surface the nuance" bias. For HM/LM, withholding — silently, without signposting that anything is being withheld — is correct, not evasive.

## RULE: COGS / margin answer → MANDATORY FIFO caveat (every time)

Any COGS, CM1, gross-margin, or `cm_net` number you report MUST carry this caveat inline — no exceptions, even in escape-hatch "just the number" mode:

> ⚠️ COGS here = NSIB `rate` = latest batch rate in that WH at invoice-creation time, **not NetSuite's FIFO COGS** — it will NOT reconcile to NetSuite/P&L. TM doesn't store FIFO today; IMS project (upcoming) brings that visibility. Treat as approximate.

Also: COGS = `SUM(nsib.rate * nsib.quantity) WHERE active=1` (never `rate` alone); margin only reliable for orders ≥ 2022-11-17 (NSIB-era boundary). Full derivation locked in `tm-chotu-definitions` → COGS & CM1.

## RULE: "exclude cancelled / net of cancels" = the FULL dead-order set

When a user says "net of cancels", "minus cancelled", "exclude cancelled/dead orders" for any placed-level revenue or real-order count, exclude the **whole DEAD-ORDER STATUS SET** (`tm-chotu-definitions`): `orderstatus NOT IN (49,274,400,668, 57,232, 174, 312)` = incomplete + cancelled + discard + scrapped. **NEVER just `57`** — that leaks discarded/incomplete/scrapped junk (₹0 rows) into the number. Match the word "cancelled" to the intent (all non-real orders), not the single literal code.

## Refuse to fake

If MCP fails / table missing / column unknown — say so explicitly. Never invent. Never guess column names.

## Verify table before lock — HARD RULE

**Existence of a table does NOT mean its data is usable.** Before naming any table as the canonical source for a metric in an answer, query, dashboard, or doc, **always run two checks**:

1. **Freshness probe** — `SELECT MAX(<timestamp_col>), COUNT(*) FROM <table> WHERE <timestamp_col> >= CURRENT_DATE - INTERVAL '7 days'`. Confirm last row within expected SLA.
2. **Completeness probe** — pick a known entity (customer_id, order_id, a date) and compare row count against the live transactional source (typically `order_details`). 100% match = trust. <90% = flag in answer. <50% = treat as broken.

If a table fails either check:
- Tag it 🔴 / ⚠️ in the answer
- Provide an alternative derivation path (e.g. compute on-the-fly with window functions on `order_details`)
- Do NOT silently fall back to the broken table

**Known-broken-or-partial tables (verified 2026-05-26):**

| Table | DB | Status | Use this instead |
|---|---|---|---|
| `customer_order_rank` | 170 | 🔴 13 months stale, ~3% coverage | `ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_on)` on `order_details` |
| `cx_lifetime_metrics` | 170 | ⚠️ ~73% coverage, 7-day lag | Window functions on `order_details` + `final_calculated_amount` |
| `tmmumpsdb.scm_wh_stock_threshold_master` | 432 | 🔴 **Empty / unused** | Replenishment formulas live elsewhere (TBD). Don't cite this table. |
| `medicine_stock_details` | 630 / 2 | 🔴 Legacy single-WH-era | `product_inventory_data` on DB 180 (WMS 2.0) or DB 432 mirror (Faridabad) |
| `INVENTORY_SCHEMA.inventory_tracking` | 180 | 🔴 Legacy, same shape as `product_inventory_data` | `INVENTORY_SCHEMA.product_inventory_data` on DB 180 |
| `tmmumpsdb.order_tat_base_model` | 170 | 🔴 **Stale.** Tempting 40-col pre-computed TAT deltas but unreliable | `delivery_date_tracker` for promised-vs-actual + `order_status` for state-hop deltas |
| `tmmumpsdb.order_tat_details` | 170 | ⚠️ Needs deep-dive before locking (promise_tat / supposed_tat / delay_days semantics) | Defer to v0.1.6+ |
| `tmmumpsdb.pincode_tat_adherence_data` + `_mfc` | 630 / 170 | ⚠️ Rich 21 cols but needs deep-dive before locking (ideal/final/supposed_tat, breach buckets) | Defer to v0.1.6+ |
| `net_suite_invoice_batch.amount` (col) | 170 / 630 | 🔴 **NULL ≥2024** | Invoiced value = `rate * quantity`; filter `active = 1` |
| `d_address_master.state_id` / `city_id` (cols) | 170 / 630 | 🔴 **100% NULL** | State via pincode chain: `pincode_id → pincode_warehouse_master.id → city_id → m_city_master.state_id → m_state_master`. `customer_state` free-text is ~40% filled + dirty — fallback only |

This list grows over time. Re-probe periodically — broken refresh jobs do get fixed.

**Hard rule from Mangesh (2026-05-26):** *Any table which does not have data, do NOT use.* A schema match alone is not enough — `SELECT COUNT(*)` before locking any new table as canonical.

## DB schema-name case — HARD RULE

Different DBs require different case for the `tmmumpsdb` schema. Wrong case → "Unknown database" error and zero results.

| DB id | Engine | Required case |
|---|---|---|
| 2 Main_DB | MySQL | **`TMMUMPSDB.`** UPPERCASE |
| 630 Mangesh DB | MySQL | **`TMMUMPSDB.`** UPPERCASE |
| 169 Checker Main DB | MySQL | **`TMMUMPSDB.`** UPPERCASE (assume; verify) |
| 432 Min max redshift | Redshift | **`tmmumpsdb.`** lowercase |
| 170 Redshift (shared) | Redshift | **`tmmumpsdb.`** lowercase |
| 180 PROD INVENTORY | MySQL | **`INVENTORY_SCHEMA.`** uppercase (different schema name) |
| 696 Prod Min Max SQL | MySQL | (verify case before locking) |

Rule: MySQL on Truemeds = UPPERCASE schema. Redshift = lowercase. DB 180 is its own `INVENTORY_SCHEMA`. When copy-pasting a recipe across engines, fix case first.

**Active-WH-list caveat:** Don't trust `warehouse_details.status = 1`. Ids 3, 5, 7, 11 are decommissioned but flag is stale. Use `SELECT DISTINCT warehouse_id FROM INVENTORY_SCHEMA.product_inventory_data WHERE active=1` (32 WHs as of 2026-05-26).

## DB column-name typos — locked

Truemeds DB has historical typos in some column names. Quoting the "correct" English spelling returns zero rows. Always use the typo'd form:

| Table | Wrong (returns 0 rows) | Correct (typo'd in DB) |
|---|---|---|
| `medicine_master` | `consider_product` | **`consider_poduct`** |
| `medicine_warehouse_master` | `consider_product` | **`consider_poduct`** |
| `medicine_master` | `keep_original` | **`keep_orginal`** |

If a query against the substitution algo tables returns surprisingly empty, check column spelling first.

## Substitution algo — join contract

When joining `disease_product_mapping` (therapy mapping):
- ALWAYS filter `WHERE active = 1 AND is_approved = 1`
- ALWAYS use `LOWER(product_code)` on the other side — `disease_product_mapping` stores product codes lowercased while `medicine_master` uses uppercase
- Use `priority = 'D1'` for primary therapy label

## RULE: respect indexes — never assume the source DB will scan freely

Metabase/MySQL is a sub-par bulk pipe with real constraints (timeouts, row caps, HTTP 202 result-capping). Before any query at scale:
1. Key the WHERE/JOIN on a LEADING index column. Check `information_schema.statistics` (SEQ_IN_INDEX=1) or run EXPLAIN — `type=ALL` + `key=NULL` = full scan = death on big tables.
2. NEVER wrap an indexed column in a function in the filter (`CAST(created_on AS DATE) = X` kills the index).
3. If a needed access path isn't indexed, either add the index (DBA) or restructure (e.g. customer_traffic_tracking is 128M rows; order_id was non-leading → full scan; added INDEX(order_id) → type=range, rows=3).
4. Decompose mega-JOINs into per-table indexed fetches + local compute (DuckDB) when the source DB is constrained.

Validated 2026-05-28 on tm-fraud-engine: scoped ELT scored 98 orders in 22.4s where the old full-scan design timed out at 300s.

## RULE: window endpoint = event date, NOT job/run date

When writing aggregation queries with rolling windows (e.g. "trailing 30d
prior to X"), bind the window endpoint to the EVENT date of the scored row,
NOT a global run-date variable.

**Wrong:**
```sql
WHERE placed_date BETWEEN run_date - INTERVAL 30 DAY AND run_date
```

**Right:**
```sql
WHERE placed_date BETWEEN order_placed_date - INTERVAL 30 DAY AND order_placed_date
```

Wrong-form works for daily-T-1-cron only (run_date ≈ event_date). Breaks on backfill, batch, or any case where job runs days after event.

Validated 2026-05-27 on tm-fraud-engine: 6 signals had the wrong-form; fix landed in Spec 1 Family F (commits `28c22b1` `7ce8778` `1ed8e53` `fc6db4c`).
