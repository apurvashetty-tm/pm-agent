---
name: tm-chotu-data-sources
description: All 53 Metabase databases + Mixpanel Production Env 2900163, classified into 8 buckets (default / production transactional / per-WH picker / per-WH checker / analytical / Snowflake / marketing / staging) with a decision tree for routing any query to the right DB. Load when user asks "which DB has X", "where does X data live", "which warehouse DB", "what's the default DB", or any data-source-routing question.
---

# Data sources

53 Metabase databases total + Mixpanel Production Env 2900163.

## MCP routing (HARD RULE)

All Metabase queries go through the **native Metabase MCP** at `https://one-truemeds.metabaseapp.com/api/mcp` — namespace `mcp__3955c18e-…__*` or `mcp__plugin_tm-chotu_metabase__*`. Toolset includes `search`, `get_table`, `execute_query`, `construct_query`, `query`, `list`.

Do **NOT** use the unofficial community MCP (`mcp__Metabase__Unofficial___Community___*`, toolset `list / retrieve / execute / export / clear_cache`). It is being sunset. See `tm-chotu-query-rigor` § "Metabase MCP — namespace policy" for the full rule.

## A. Default for tm-chotu

| DB ID | Name | Engine | Why default |
|---|---|---|---|
| **170** | **Redshift** | Redshift | **PRIMARY** — shared Redshift everyone at Truemeds has access to. Main DB mirror + analytical tables. Use this for everything by default |

DB 170 schema:

| Schema | Tables | Use |
|---|---|---|
| `tmmumpsdb` | 156 | Main DB mirror + analytical. Includes `order_details`, `final_calculated_amount`, `customer_details`, `order_status`, `product_details`, `m_system_value_master`, `m_courier_partner_master`, `medicine_master`, `medicine_warehouse_master`, `medicine_molecule`, `disease_product_mapping`, `org_sub_medicine_mapping_*_hub_new_algo` (5 hubs), `final_substitute_product_*` variants, `orders_campaign_attribution`, `appsflyer_installs`, `package_details_tracking`, `net_suite_*` (7 tables), `tm_diagnostics_*` (10 tables) |
| `public` | 2 | (minimal) |

**Note:** DB 663 (Mangesh Redshift) is Mangesh's personal scoped instance (198 tables, includes `maranalytics` + `public` schemas with ads + DMS outputs). Most Truemeds employees do NOT have access. **Do not default users to 663.**

**🔒 `medicine_quarter_master`** (HM/LM product-margin tag) lives on **170** (`tmmumpsdb`, default) + Main DB 630 mirror, grants via group `tm_analytics`. **GATED** — route here only when the leadership + margin-health gate is open (see `tm-chotu-query-rigor`). Otherwise do not touch it.

## B. Production transactional MySQL (live)

| ID | Name | Use |
|---|---|---|
| **2** | **Main_DB (TMMUMPSDB)** | Live transactional. Use only for <30 min fresh data — DB 170 (Redshift) lags by minutes |
| 3 | Mongo | Document store (product catalog / unstructured data) |
| 169 | Checker Main DB | Pharmacist checker workflow |
| 135 | Picker Main DB | Picker workflow (general / legacy) |
| 174 | PROD WH PICKER | Warehouse-wide picker (general) |
| 175 | PROD WH CHECKER | Warehouse-wide checker (general) |
| 180 | PROD INVENTORY | **Live qty source for WMS 2.0 WHs.** `INVENTORY_SCHEMA.product_inventory_data` = per-(warehouse_id, product_cd) live qty (available, total, pending_consult, pending_invoice, pending_shipped, threshold, NetSuite-synced). Also `order_inventory_ledger`, `order_inventory_ledger_partitioned`, `order_inventory_tag`. ❌ `inventory_tracking` is legacy. Faridabad (Vinculum) NOT here — use DB 432 |
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

These power Single / Multi-order / Pigeon-hole picking flows per WH. National-scale picking queries need a UNION OR use the Redshift mirror.

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
| 993 | SF WAREHOUSE_MANAGEMENT_SYSTEM | WMS aggregate (Snowflake) — scope TBD vs DB 180/432 |
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
| **Total** | **53** ✅ |

## Mixpanel

- **Project:** Production Env, ID **2900163** (default)
- Use for app + web event funnels — pre-order behaviour, post-order engagement
- Canonical events + properties: `~/.claude/projects/.../memory/mixpanel_events.md`

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
