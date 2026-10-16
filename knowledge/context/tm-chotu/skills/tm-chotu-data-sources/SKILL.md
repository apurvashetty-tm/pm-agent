---
name: tm-chotu-data-sources
description: All 53 Metabase databases + Mixpanel Production Env 2900163, classified into 8 buckets (default / production transactional / per-WH picker / per-WH checker / analytical / Snowflake / marketing / staging) with a decision tree for routing any query to the right DB. Load when user asks "which DB has X", "where does X data live", "which warehouse DB", "what's the default DB", or any data-source-routing question.
---

# Data sources

53 Metabase databases total + Mixpanel Production Env 2900163.

## MCP routing (HARD RULE)

All Metabase queries go through the **native Metabase MCP** at `https://one-truemeds.metabaseapp.com/api/mcp` — namespace `mcp__<uuid>__*` — **the UUID is per-install; never fingerprint on it.** Toolset observed live **2026-08-25**, read off the connector's own tool schemas: `search`, `construct_query`, `execute_query`, `query`, `create_question`, `create_dashboard`. **The toolset is configurable per install** — some also expose `visualize_query`. Fingerprint on **any two**, never the full list. ⚠️ There is **no** `execute_sql`, `get_table`, `list`, or `get_metric*` — earlier docs claimed those and were wrong. Native SQL goes through `execute_query`.

Do **NOT** use the unofficial community MCP (`mcp__Metabase__Unofficial___Community___*`, toolset `retrieve`, `execute`, `export`, `clear_cache`, `list`). ⚠️ `search` exists on **both** connectors — never use it to tell them apart. It is being sunset. See `tm-chotu-query-rigor` § "Metabase MCP — namespace policy" for the full rule.

## A. Default for tm-chotu

| DB ID | Name | Engine | Why default |
|---|---|---|---|
| **170** | **Redshift** | Redshift | **PRIMARY** — shared Redshift everyone at Truemeds has access to. Main DB mirror + analytical tables. Use this for everything by default |

DB 170 schema:

| Schema | Tables | Use |
|---|---|---|
| `tmmumpsdb` | 156 | Main DB mirror + analytical. Includes `order_details`, `final_calculated_amount`, `customer_details`, `order_status`, `product_details`, `m_system_value_master`, `m_courier_partner_master`, `medicine_master`, `medicine_warehouse_master`, `medicine_molecule`, `disease_product_mapping`, `org_sub_medicine_mapping_*_hub_new_algo` (5 hubs), `final_substitute_product_*` variants, `orders_campaign_attribution`, `appsflyer_installs`, `package_details_tracking`, `net_suite_*` (7 tables), `tm_diagnostics_*` (10 tables) |
| `public` | 2 | (minimal) |

**🔴 `tmmumpsdb.customer_details` on 170 was emptied on 2026-08-13 with no backup** (the operation auto-commits on Redshift and cannot be rolled back). Whether it refilled depends on the connector's sync mode — full-refresh self-heals, incremental does not. **Probe the row count before using it**; if it is empty or short, fall back to DB 630. Do not assume customer-level joins on 170 are complete without checking.

**Note:** DB 663 (Mangesh Redshift) is Mangesh's personal scoped instance (198 tables, includes `maranalytics` + `public` schemas with ads + DMS outputs). Most Truemeds employees do NOT have access. **Do not default users to 663.**

**🔒 `medicine_quarter_master`** (HM/LM product-margin tag) lives on **170** (`tmmumpsdb`, default) + Main DB 630 mirror, grants via group `tm_analytics`. **GATED** — route here only when the leadership + margin-health gate is open (see `tm-chotu-query-rigor`). Otherwise do not touch it.

## B. Production transactional MySQL (live)

| ID | Name | Use |
|---|---|---|
| **2** | **Main_DB (TMMUMPSDB)** | Live transactional. Use only for <30 min fresh data — DB 170 (Redshift) lags by minutes |
| **3** | **Mongo** | **The canonical per-order EVENT LOG** — collection `OrderFootPrintTracking`, one doc per order, `_id` = `order_id`. This is the only source that sees **cart activity** (product add / remove / qty change), because `order_status` records status transitions only. 48.5M docs / 3.6 TB. See "Mongo — how to actually query it" below before touching it |
| 169 | Checker Main DB | Pharmacist checker workflow |
| 135 | Picker Main DB | Picker workflow (general / legacy) |
| 174 | PROD WH PICKER | Warehouse-wide picker (general) |
| 175 | PROD WH CHECKER | Warehouse-wide checker (general) |
| 180 | PROD INVENTORY | **Live qty source for WMS 2.0 WHs.** `INVENTORY_SCHEMA.product_inventory_data` = per-(warehouse_id, product_cd) live qty (available, total, pending_consult, pending_invoice, pending_shipped, threshold, NetSuite-synced). Also `order_inventory_ledger`, `order_inventory_ledger_partitioned`, `order_inventory_tag`. ❌ `inventory_tracking` is legacy. ⚠️ **CONTESTED [subject: Faridabad] — do not treat either side as settled.** `tm-chotu-inventory` states Faridabad (wh 21) **is** synced into 180. Unresolved — ask before answering a Faridabad stock question. Older claim: Faridabad (Vinculum) not here, use DB 432 |
| 136 | Transfer Order main DB | TO operations |
| 960 | Prod Middleware | Middleware service DB |
| 894 | CASS DB | CASS = doctor / HA call infra |
| 861 | PROD CASS | Production CASS instance |

## C. Per-warehouse picker DBs (19 — splits production load per WH/MFC)

| ID | Name | Location |
|---|---|---|
| 1026 | PROD WH BLR PICKER | Bangalore Hub (WH 17) |
| 179 | PROD WH DEL PICKER | Delhi Okhla (WH 19) |
| 927 | PROD WH FC LUCKNOW PICKER | Lucknow (WH 37) |
| 177 | PROD WH KOL PICKER | Kolkata (WH 22) |
| 202 | PROD WH MFC Picker | MFC general |
| 234 | Picker Indore | Indore MFC |
| 730 | PROD WH MFC BHUBANESWAR PICKER | Bhubaneswar MFC |
| 665 | PROD WH MFC CHANDIGADH PICKER | Chandigarh MFC |
| 828 | PROD WH MFC CHENNAI PICKER | Chennai MFC |
| 729 | PROD WH MFC GUWAHATI PICKER | Guwahati MFC |
| 300 | PROD WH MFC HYD PICKER | Hyderabad MFC |
| 400 | PROD WH MFC JAIPUR PICKER | Jaipur MFC |
| 795 | PROD WH MFC NAGPUR PICKER | Nagpur MFC |
| 1059 | PROD WH MFC NEW PATNA PICKER | Patna MFC (new) |
| 399 | PROD WH MFC PATNA PICKER | Patna MFC (legacy) |
| 333 | PROD WH MFC PUNE PICKER | Pune MFC |
| 664 | PROD WH MFC RAIPUR PICKER | Raipur MFC |
| 762 | PROD WH MFC RANCHI PICKER | Ranchi MFC |
| 498 | PROD WH MFC VARANASI PICKER | Varanasi MFC |

These power Single / Multi-order / Pigeon-hole picking flows per WH.

**🔴 One warehouse = one connection. The schema name is NOT the warehouse.** Every MFC has its own database. Proved live 2026-08-19: schema `prod_picker` holds **warehouse 20 (Mumbai)** on **DB 174** but **warehouse 23** on **DB 202** — same name, different host, different stock. Reading it from the wrong connection returns a populated, plausible, wrong answer. DB 202 and DB 399 also return identical rows for the same MFC schema (two connections, one host), so **seeing a schema in `information_schema` does not make that connection the right route to it**.

- Pick the warehouse's **own** Metabase database by name.
- **Assert `warehouse_id` from inside the table before using the rows** — the WH-level tables hold exactly one.
- Cross-WH work = union **across connections**, client-side. Never a cross-schema union on one connection.
- Confirmed: **Mumbai = WH 20 on DB 174** · Pune 26 · Patna 27 · DB 202's `prod_picker` = 23.

Batch-level stock lives here (`wp_bin_product_batch_mapping`) — see `tm-chotu-inventory`.

**🔴 `warehouse_details` is the warehouse MASTER** — use it to resolve or validate a warehouse id/name. **`pincode_warehouse_master` is pincode→WH *serviceability*** (which WH serves a pincode) and must **never** be used to identify or validate a warehouse. Different questions, different tables.

## D. Per-warehouse checker DBs (3)

| ID | Name | Location |
|---|---|---|
| 201 | PROD WH AMD CHECKER | Ahmedabad |
| 178 | PROD WH DEL CHECKER | Delhi |
| 176 | PROD WH KOL CHECKER | Kolkata |

## E. Analytical / Data Platform

| ID | Name | Engine | Use |
|---|---|---|---|
| **170** | **Redshift** | Redshift | **Shared default** (see bucket A) |
| 663 | Mangesh Redshift | Redshift | Personal scoped instance (198 tables, +maranalytics +public). Most users don't have access |
| 630 | Mangesh DB | MySQL | Unrestricted Main_DB replica. Used by tm-po-analytics. Personal scope |
| 432 | Min max redshift | Redshift | **Replenishment + Min/Max analytics + Redshift mirror for cross-DB joins.** Hosts `tmmumpsdb.product_inventory_data` (Airbyte mirror of DB 180 — use for joining live qty to demand trackers without crossing MySQL/Redshift boundary). Hosts `product_wh_avg_daily_tracker` (pincode-grain demand, 180M rows, daily-fresh, drives JIT/BULK split → MFC vs FC), `product_wh_inventory_daily_tracker` (canonical daily inventory snapshot), `v_scm_inventory_position_wh` / `_hub` (analytical views). Schema case: **lowercase `tmmumpsdb.`** (Redshift). ❌ `scm_wh_stock_threshold_master` is empty / unused |
| 696 | Prod Min Max SQL | MySQL | Replenishment ops DB (live) |
| 1092 | TM Instrumentation | Redshift | Telemetry / instrumentation |

## F. Snowflake migration (started March 2026)

Picker DBs being moved MySQL → Snowflake:

| ID | Name | Purpose |
|---|---|---|
| 993 | `SF WAREHOUSE_MANAGEMENT_SYSTEM ` ⚠️ **trailing space in the DB name** — include it in MBQL field refs | WMS aggregate (Snowflake). Hosts **`WMS.BATCH_MASTER_V`** = the batch-level **locked MRP** source (see `tm-chotu-inventory`). ⚠️ **Native SQL is blocked via the MCP** — through the MCP use MBQL only (`construct_query` / `query`); pages cap at 200 rows. **The block is an MCP limitation, not a Snowflake one**: the Metabase REST path (`POST /api/dataset/csv` with `x-api-key`) runs native SQL against DB 993 fine, and bypasses the row cap |
| 994 | SF LOGISTICS | Logistics / TAT / courier |
| 995 | SF TRUEMEDS | General Truemeds analytics |
| 996 | SF MUMBAI PICKER | Mumbai picker |
| 997 | SF LUCKNOW PICKER | Lucknow picker |
| 998 | SF KOLKATA PICKER | Kolkata picker |

**Implication:** Mumbai / Lucknow / Kolkata picker analytical queries should prefer Snowflake (996/997/998) over MySQL. Other hubs still on MySQL.

## G. Marketing

| ID | Name | Use |
|---|---|---|
| 103 | Marketing DB | Marketing-specific tables. Primary marketing data path for users without access to DB 663's `maranalytics` |

## H. Staging / UAT / non-prod

| ID | Name |
|---|---|
| 69 | STAGE DB |
| 267 | STAGE INVENTORY |
| 366 | STAGE REDSHIFT |
| 173 | STAGE WH CHECKER |
| 172 | STAGE WH PICKER |
| 36 | UAT |
| 564 | Redshift test |

## Bucket totals

| Bucket | Count |
|---|---|
| tm-chotu default (170) | 1 |
| Production transactional MySQL/Mongo | 11 |
| Per-WH picker DBs | 19 |
| Per-WH checker DBs | 3 |
| Analytical / Data Platform (incl. Mangesh's 663/630) | 6 |
| Snowflake migration | 6 |
| Marketing | 1 |
| Staging / UAT | 7 |
| **Total distinct DBs** | **53** |

⚠️ The bucket rows sum to 54 because **DB 170 is listed twice** — in bucket A as the default and in bucket E as the analytical platform. 53 is the distinct-database count.

## Mixpanel

- **Project:** Production Env, ID **2900163** (default)
- Use for app + web event funnels — pre-order behaviour, post-order engagement
- Canonical events + properties: `~/.claude/projects/.../memory/mixpanel_events.md`

## Mongo (DB 3) — how to actually query it

`OrderFootPrintTracking`: one doc per order, `_id` = `order_id` (indexed PK, so a chunked `$in` is prod-safe). Everything else sits in the embedded array `footPrintTrackingList` — ~39 events per order, **~242 KB per doc**. Full-doc pulls are infeasible (72k orders ≈ 17 GB); always `$filter` + `$project` server-side.

Per-event keys: `createdOn`, `statusId`, `statusName`, `comments`, `userId`, `userName`, `warehouseId`, `currentMedList`, `lockedMedList`, `currFinalCalc`, `prevFinalCalc`, `couponDetails`. `currentMedList` / `lockedMedList` per event mean **cart state is diffable across events** — that is the basis of any "what did the algo change" analysis.

**🔴 The Metabase MCP cannot query Mongo.** `execute_query` wraps SQL into `native.query` only, and the driver rejects it: *"Cannot execute MongoDB query without a :collection name"*. MBQL works but cannot unwind or filter inside arrays. The only working path is the raw HTTP API, where the body is ours:

```
POST https://one-truemeds.metabaseapp.com/api/dataset/csv     (header: x-api-key)
{"database":3,"type":"native",
 "native":{"collection":"OrderFootPrintTracking",
           "query":"<JSON aggregation pipeline as a STRING>"}}
```

**Querying by time window** — the hard part. A naive time range is a full scan of 3.6 TB. The collection's useful index is `comments_date` = (`footPrintTrackingList.comments`, `footPrintTrackingList.createdOn`). Give `comments` a full string range so the compound index can bound `createdOn`:

```js
{"$match": {"footPrintTrackingList": {"$elemMatch": {
    "comments":  {"$gte": "", "$lt": "￿"},
    "createdOn": {"$gte": ISODate(LO), "$lt": ISODate(HI)}}}}}
```

**`$elemMatch` is required** — bare dot-notation does not get index bounds on a multikey array and scans. Measured: **0.9 s** with it, >5 min timeouts without. Dates parse as both `{"$date":"..."}` and `ISODate("...")`, in `$match` and inside `$filter`.

⚠️ **Completeness caveat:** events with `comments` null/missing sort before `""` in BSON and would be skipped. Validated once (0 blank-comment events; 67/67 orders recovered against an independent `_id`-based pull) — **re-validate on a new window** before trusting it.

**Timezone (verified):** Mongo `createdOn` is **UTC**; `order_details.created_on` is **IST** and equals the **DIGITIZED** footprint event, *not* cart creation (statusId 49). Same-doc comparisons are tz-safe; only day-scoping needs the +5:30 care.

**Comment strings are exact, and are not one event:** `Algo Completed For A Product : <NAME>` is line-level and steady background (~1,700 events / 2,000 orders per day); `Algo Completed For An Order` is order-level and rare.

**Scope-collapse tip:** filter to orders that actually reached the anchor status first — on one day 72,204 orders were placed but only 24,971 reached status 317 (the rest were abandoned carts, status 49). Cuts the Mongo pull ~3×.

For big pulls, a direct driver beats Metabase: Metabase caps at `maxTimeMS` 20 min and materialises the whole CSV before responding, where a streaming cursor succeeds. Throughput reference: a 67-minute window = 99,287 events / 22,528 orders in **587 s**. Cost scales with **matched-doc count**, not window length.

## Known source traps — check before you trust

| Source | Trap |
|---|---|
| `logistics_tracker` (170, Redshift-only) | Carries courier-scan status + `awb_number`, and the mapping is 100% clean — but the **Airbyte feed has been dead since 2026-07-20** (0 rows in 7d, all partners). Cannot be used for "current" courier status |
| **AWB numbers** | Live only on **DB 630** (`net_suite_shipment_details.awb_no`, join `order_id`, `active=1`, latest by `modified_on`). **Not in the Redshift 170 mirror.** `package_details_tracking` has only `is_awb_no_printed` / `awb_sticker_print_date`; its `package_number` ("PKG-…") is an internal id, ~2% filled, **not** an AWB |
| `customer_details` on 170 | Emptied 2026-08-13, no backup — probe row count first (see bucket A) |
| `medicine_quarter_master` on 170 🔒 | **Gated table — see the gate rule in `tm-chotu-query-rigor` before touching it.** Operationally: a DMS full reload recreates the target and **loses every GRANT** → reads fail `permission denied for relation`. Re-grant to group `tm_analytics` after any reload |
| `customer_order_rank` | Broken — 13mo stale, 3% coverage. Compute rank on the fly |
| `cx_lifetime_metrics` | Partial — 73% coverage, 7d lag. Reference only |
| `mobile_otp` | Superseded — use gateway logs + `customer_details` |

General rule: **existence is not usability.** Probe freshness (`MAX(created_on)`) and coverage against a table you trust before locking any source into an answer. See `tm-chotu-learnings` L12.

## PII routing

Before writing any query that touches mobile / email / name / address / DOB / prescription / bank / call-recording / device-identity columns, load **`tm-chotu-pii-register`**. Prod CDC users now read through a no-PII role, several tables carry confirmed plaintext, and `SELECT *` fails on column-restricted tables by design.

## Bulk export — past the row caps

The Metabase MCP `query` tool caps at **2,000 rows** (200-row pages). For anything bigger, run server-side on DCOE (`ssh dcoe-prod`) and POST to `https://one-truemeds.metabaseapp.com/api/dataset/csv` with the `x-api-key` from Secrets Manager — that path is uncapped up to **1,048,575 rows** (chunk weekly beyond that). A large IN-list blows `ARG_MAX`: write the SQL to a file, build the JSON with `jq --rawfile`, and pass `query@file.json`.

## What NOT to mention to non-engineers

- BigQuery — abstracted; data lives in Metabase DBs
- HEVO — pipeline plumbing
- AppsFlyer-external — already mirrored in `tmmumpsdb.appsflyer_*`

## Default-routing decision tree

```
Question is about historical / analytical data?
  → Use DB 170 (Redshift). Default for everyone.

Question needs <30-min-fresh transactional?
  → Use DB 2 (Main_DB) directly.

Question needs Marketing analytics tables (maranalytics schema)?
  → Use DB 663 (Mangesh Redshift) IF user has access — otherwise DB 103 (Marketing DB)

Question is per-warehouse picking / packing ops?
  → Use the corresponding WH-picker DB from C above.
    For Mumbai / Lucknow / Kolkata, prefer Snowflake (F) over MySQL.

Question is per-warehouse checking ops?
  → Use the WH-checker DB from D above.

Question is replenishment / Min-Max?
  → Use DB 432 (Min max redshift) for analytics OR DB 696 (live).

Question is logistics TAT / courier perf?
  → Use DB 994 (SF LOGISTICS).
    AWB number specifically → DB 630 net_suite_shipment_details (NOT 170).
    Do NOT use logistics_tracker — feed dead since 2026-07-20.

Question is about what HAPPENED INSIDE an order (cart edits, algo
events, who touched it, event timeline)?
  → Mongo DB 3, OrderFootPrintTracking. order_status CANNOT answer this.

Question is batch-level MRP / locked MRP?
  → DB 993 Snowflake, WMS.BATCH_MASTER_V (MBQL only).
```

### Scoped ELT pattern (tm-fraud-engine Spec 2, 2026-05-28)

When a source DB (Metabase/MySQL) can't take arbitrary scale — long-running mega-JOINs time out — DON'T pull everything in one server-side join. Instead:
1. Get a bounded SCOPE (e.g. order_ids from a file the team drops).
2. Resolve keys (customer_ids, address_ids) from the scope.
3. Pull each table RAW + SEPARATELY, filtered on its LEADING INDEX column (order_id / customer_id / address_id), in PARALLEL (thread pool, IN-list chunks ≤1000).
4. Load raw into a local compute layer (DuckDB) and JOIN there.
5. Score only the scope, with the broader pulled data as substrate.

**Probe result:** MySQL DB 630 was 4× FASTER than Redshift DB 170 for selective `customer_id IN (...)` lookups (1.4s vs 6.1s) — Redshift columnar wins on big scans, loses on selective seeks. For scoped-fetch workloads, prefer the indexed MySQL replica.

Substrate is customer-keyed (T-30d history of the scope's customers), NOT date-keyed — because customer_id is indexed everywhere and created_on usually isn't.
