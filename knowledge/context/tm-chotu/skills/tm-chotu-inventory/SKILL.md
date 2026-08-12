---
name: tm-chotu-inventory
description: Truemeds inventory model — DB 180 PROD INVENTORY `INVENTORY_SCHEMA.product_inventory_data` is the universal live-qty source for ALL active WHs (including ANKW Faridabad / Vinculum, which is synced in). NetSuite is the underlying inventory management system, real-time synced. DB 432 Min Max Redshift `tmmumpsdb.product_inventory_data` is the Airbyte mirror for cross-DB joins with demand trackers. Live qty buckets (total / available / pending_consult HA-Doctor / pending_invoice post-confirm / pending_shipped packed). Layered stockout definitions (onhand qty / mwm.availability Catalogue-managed flag / available_qty for routing / is_searchable hides bad catalog). INVENTORY_TYPE master (281/282/283/370/371) + JIT/BULK demand split (pincode-grain demand on `product_wh_avg_daily_tracker` → BULK→MFC, JIT→FC). Cold-chain serviceability at PINCODE level via `pincode_warehouse_master.is_cold_chain_deliverable` + priority. Quarantine/write-off two-path (inward damaged → VRA; post-inward expired → VRA then adjustment-down). Daily snapshot `product_wh_inventory_daily_tracker`. Analytical views `v_scm_inventory_position_hub/wh`. Backorder via `package_details_tracking.is_back_order` set at WH assignment. 5 PTS-restricted cols on `inward_product_details` (pts/verified_pts/final_pts/invoiced_final_pts/verified_pts_by_cp). 4 WHs decommissioned despite `warehouse_details.status=1` (ids 3, 5, 7, 11). DB 630/2 schema is uppercase TMMUMPSDB. Load when user asks "how does inventory work", "is X in stock", "stockout %", "JIT vs inventory", "where does inventory data live", "backorder", "cold chain", "MFC vs FC", "write-off", "VRA".
---

# Inventory

Per-warehouse SKU live qty system. Drives Warehouse Assignment, Substitution availability, OOS de-boost in Search, and Backorder triggering.

> ✅ **Universal live-qty source for ALL active WHs:** `INVENTORY_SCHEMA.product_inventory_data` on **DB 180 PROD INVENTORY**.
>
> This includes Vinculum-backed warehouses (e.g. **ANKW Faridabad Hub `warehouse_id=21`** runs Vinculum underneath but its inventory IS synced into DB 180).
>
> **NetSuite is the underlying inventory management system**, real-time synced into DB 180.
>
> ❌ **Decommissioned WHs** (despite `warehouse_details.status = 1` showing active — that field is stale):
> | id | Name | Status |
> |---|---|---|
> | 3 | Intellihealth Mumbai Hub | Decommissioned |
> | 5 | Intellihealth Delhi Hub | Decommissioned |
> | 7 | Intellihealth Kolkata Raikva FC | Decommissioned |
> | 11 | Intellihealth Faridabad Hub | Decommissioned (old Faridabad, replaced by id=21 ANKW) |
>
> **Truly active WHs:** verify via `SELECT DISTINCT warehouse_id FROM INVENTORY_SCHEMA.product_inventory_data WHERE active = 1` (32 WHs as of probe 2026-05-26), NOT via `warehouse_details.status`.

---

## Source-of-truth tier — LOCKED

| Tier | Where | Use |
|---|---|---|
| **Underlying IMS** | **NetSuite** (most WHs) + **Vinculum** (ANKW Faridabad id=21 underneath) | Financial truth, item master, on-hand qty |
| **Live operational qty (universal)** | **DB 180 PROD INVENTORY** → `INVENTORY_SCHEMA.product_inventory_data` | Per-WH per-SKU live qty. Real-time NetSuite sync. Covers ALL active WHs including Vinculum-backed Faridabad |
| **Analytics mirror (Redshift)** | **DB 432 Min Max Redshift** → `tmmumpsdb.product_inventory_data` (Airbyte mirror of DB 180) | Use for cross-DB joins with demand trackers / SCM views / daily snapshots living in DB 432 |
| **Search visibility** | OpenSearch `is_oos` (<5 min lag) | Powers OOS de-boost band — fed by `medicine_warehouse_master.availability` |
| **NetSuite mirror tables (DB 170)** | `net_suite_items`, `net_suite_purchased_order`, `net_suite_invoice_batch`, `net_suite_pending_purchase_order`, `net_suite_purchase_tracker`, `net_suite_sales_receive`, `net_suite_vendor` | Financial reconciliation, PO tracking |

❌ **`medicine_stock_details`** (DB 630/2) — **LEGACY / DEPRECATED**. Single-WH-era table. Don't use.

---

## `product_inventory_data` — the live qty table

**Grain:** one row per (`warehouse_id`, `product_cd`).

```
warehouse_id           bigint    NOT NULL    Per-WH
product_cd             varchar   NOT NULL    Per-SKU
sku_name               varchar
total_inventory_qty    bigint    NOT NULL    Gross stock at WH
available_qty          bigint                SELLABLE NOW (after older-order allocation)
threshold              bigint                SKU-level threshold
pending_consult_qty    bigint    NOT NULL    Reserved during HA / Doctor call
pending_invoice_qty    bigint    NOT NULL    Reserved post Order Confirmed, pre-invoice
pending_shipped_qty    bigint    NOT NULL    Packed, awaiting handover to 3PL
ns_item_id             bigint                NetSuite item ref
ns_onhand_qty          bigint                NetSuite on-hand mirror
last_synced_on         timestamp             NetSuite sync timestamp
active                 tinyint
```

**Conservation identity (inferred from bucket names):**

```
available_qty = total_inventory_qty − pending_consult_qty − pending_invoice_qty − pending_shipped_qty
```

**Meaning of `available_qty`** (per Mangesh): "which WH has stock left after allocating to older orders" — primary input to WH assignment routing.

### Companion tables (same `INVENTORY_SCHEMA` on DB 180)

- **`order_inventory_ledger`** — per-event ledger. Cols: `order_id, product_cd, warehouse_id, qty, is_add, is_deduct, inventory_type, bucket_type, txn_msg, order_status_id, active, created_on`. Use to audit any stock change.
- **`order_inventory_ledger_partitioned`** — partitioned variant of same.
- **`order_inventory_tag`** — per-order `is_inventory` flag (the routing "Inventory Order?" answer).
- **`inventory_tracking`** — **LEGACY / DEPRECATED**. Same shape as `product_inventory_data` but stale. Don't use.

---

## Layered stockout model — NO single canonical definition

Different contexts use different signals. Pick the right one:

| Context | Signal | Where | Notes |
|---|---|---|---|
| **Onhand qty** (what we *physically* hold) | `total_inventory_qty` or `ns_onhand_qty` | `product_inventory_data` | Closest to a "real" stockout — but JIT means non-onhand ≠ unavailable |
| **Search OOS de-boost** | `medicine_warehouse_master.availability` (bit) | DB 630/2 `tmmumpsdb` | **MANUAL flag, set by Catalogue team**, currently powered by live inventory. NOT real-time |
| **Hide broken catalog rows** | `medicine_warehouse_master.is_searchable` | mwm | NOT a stockout signal — hides incorrectly-created SKUs |
| **WH assignment routing** | `available_qty` | `product_inventory_data` | "WH with stock left after older-order allocation" |
| **Backorder trigger** | `package_details_tracking.is_back_order` | DB 630/2 | Set **at WH assignment** if availability=0 / qty insufficient |

❌ **There is NO single "stockout %" canonical SQL.** Always state which signal you're using.

---

## INVENTORY_TYPE master (`name = 'INVENTORY_TYPE'`)

| Code | Type | Meaning |
|---|---|---|
| 281 | **INVENTORY** | Stocked at WH. Live qty maintained. Normal pick. |
| 282 | **JIT 1** | Tier-1 just-in-time procurement per order. Not stocked. |
| 283 | **JIT 2** | Tier-2 fallback procurement. |
| 370 | **Central Bulk** | Held centrally, distributed on demand. |
| 371 | **WH weekly JIT** | Replenished weekly in JIT zone. |

> ⚠️ **JIT rule:** Non-onhand product does NOT automatically mean `availability = false` on mwm. JIT means we'll procure-per-order. Catalogue team manually manages `mwm.availability` based on whether they can fulfil.

---

## JIT vs BULK demand split → MFC vs FC stocking — LOCKED

**Demand classification happens at PINCODE level.**

| Demand class | Stocked at | Reasoning |
|---|---|---|
| **BULK demand** | **MFC (553)** | Hyperlocal, fast-moving — pre-stock at MFC |
| **JIT demand** | **FC (454)** | Long-tail / variable — procured on-demand at FC |

**Source:** DB 432 Min Max Redshift → `tmmumpsdb.product_wh_avg_daily_tracker` (**180M rows, daily-fresh**)

**Grain:** (`product_cd`, `pincode`, `warehouse_id`, `gen_dataset_dt`).

**Demand windows:** L7D / L15D / L30D / L60D. Separate cols for regular sale/demand, `_own_*` (Own Demand — see below), `_subs_*` (substitute), `_old_pack`.

**Utilization buckets:** `avg_daily_utilization_branded`, `avg_daily_utilization_generic_own`, `avg_daily_utilization_generic_sub`.

### "Own Demand" (the `_own_*` cols)

Truemeds recommends generic alternatives for branded products. Returning customers learn the generic name and **search/buy the generic directly** on next order → this creates **"Own Demand"** for the generic. Mapped via `_own_*` cols on demand tracker and `gen_*_od_loc_*` cols on threshold master.

---

## Cold-chain — serviced at PINCODE level, NOT WH level

Cold-chain products require a **special cold package** valid only within a distance-radius from WH. So serviceability is decided per-pincode.

**Source:** `tmmumpsdb.pincode_warehouse_master`

| Column | Meaning |
|---|---|
| `pincode` | Customer pincode |
| `warehouse_id` | Assigned WH |
| `priority` | Priority tier (1, 2, …) — check `priority = 1` for primary serving WH |
| **`is_cold_chain_deliverable`** | Bit. **TRUE** → accept cold-storage orders. **FALSE** → reject |
| `surface_delivery_days` / `air_delivery_days` | TAT estimates for PDD (use in `tm-chotu-tat`) |
| `is_serviceable_by_delhivery` / `_xpress_bees` / `_air_delhivery` | Per-courier serviceability |
| `is_sdd` | Same-day delivery flag |
| `is_cold_chain_deliverable` on **priority-1** rows | The right filter for cold-chain serviceability decisions |

> The `cold_storage` bit on `medicine_warehouse_master` is **per-SKU-at-WH** (which SKUs are cold-chain), NOT WH-level enabled. Use `pincode_warehouse_master` for the WH-pincode-radius decision.

---

## Backorder

| Property | Value |
|---|---|
| **Flag location** | `tmmumpsdb.package_details_tracking.is_back_order` (bit) |
| **NOT on** | ❌ `order_details` |
| **Set when** | **At Warehouse Assignment** (orderstatus 233) if `availability = 0` or qty insufficient at chosen WH |
| **Triggers** | Procurement & Inwarding → Back Order Procurement dashboard in Central Procurement |
| **Downstream** | Procure-to-fill, or cancel / partial / re-route |

---

## Live Inventory mechanics

- Real-time NetSuite sync into `product_inventory_data` for WMS 2.0 WHs
- Threshold-flag: `SKU Threshold` (`product_inventory_data.threshold`)
- `mwm.availability` (Catalogue-managed manual flag) drives Search OOS
- `Update Inventory` event drives PUTAWAY / PICKLIST / WAREHOUSE ASSIGNMENT downstream

### Pre-confirmation block (substitution)

When sub offered at checkout → both original SKU and sub SKU are **blocked** in live inventory until decision:
- **Sub kept (`medicine_status = 61`)** → original released
- **Sub rejected (`medicine_status = 62`)** → sub released back to pool

### `not_in_stock_order_details` — OOS substitution ledger

When OOS forces a sub decision at order time, the (original / replaced / subs) `product_code` triplet plus customer accept/reject is logged here per order × WH. Cols: `original_product_code, replaced_product_code, subs_product_code, cx_accepted_sub, is_dr_confirm, is_dispatched, status_id, warehouse_id, cancelled_reason_id`.

---

## Warehouse types (stock pools)

| Code | Type | Pool |
|---|---|---|
| 553 | **MFC** | Hyperlocal, ~1-day radius — gets BULK demand |
| 455 | **HUB** | Mid-tier (includes Faridabad — Vinculum) |
| 454 | **WAREHOUSE / FC** | Main FC, full breadth — gets JIT demand |

Each WH-type is a separate logical pool. MFC stockout → WH assignment re-routes.

**36 active WHs** on `warehouse_details` (DB 630/2 tmmumpsdb) split across two entities: `Intellihealth` (older) and `ANKW Pharma Retail` (newer).

---

## Replenishment & daily trackers (DB 432 Min Max Redshift)

| Table | Use |
|---|---|
| **`product_wh_avg_daily_tracker`** | **Pincode-grain demand forecast (canonical for JIT/BULK split). 180M rows, daily-fresh.** |
| `product_hub_avg_daily_tracker` | Hub-rollup of above |
| `salt_wh_avg_daily_tracker` | Salt-grain demand |
| `product_wh_avg_utilization_daily_tracker` | WH-level utilization tracking |
| `product_wh_proposed_avg_daily_tracker` | Proposed Min-Max adjustments |
| `product_wh_result_avg_daily_tracker` | Realized vs proposed |
| **`product_wh_inventory_daily_tracker`** | **Canonical daily snapshot of inventory (per Mangesh)** |
| `scm_daily_sku_inventory` | Secondary snapshot (similar shape, salt-grain) |
| `v_scm_inventory_position_wh` | Lean WH-position view (4 cols: product_cd, warehouse_id, available_qty, threshold) |
| `v_scm_inventory_position_hub` | Hub-level position view |

`*_sf_test` / `*_temp` variants — test/temp, ignore unless investigating sync.

### `product_wh_inventory_daily_tracker` schema

```
product_cd, warehouse_id, gen_dataset_dt, curr_inv, open_to_qty, open_po_qty,
total_inv, salt_drug_type_master_id, warehouse_type, availability
```

Use this for "inventory on date X" or "stockout days last 30d" trend queries.

---

## Quarantine / write-off — two-path

**Path 1 — At inwarding** (damaged or expired on arrival):
```
Inward QC → damaged/expired detected → VRA (Vendor Return Authorization)
   → vendor accepts → qty returned, settled via debit note
```

**Path 2 — Post-inwarding** (stock already in WH expires or gets damaged):
```
Stock at WH → expiry / damage detected
   → Try VRA (vendor return)
      → Vendor accepts → return + settle
      → Vendor rejects → Adjustment Down → write-off
```

**Tables:**
- `inward_product_details` — VRA cols: `vrachecked` (bit), `vra_quantity`, `remaining_quantity_for_vra`, `reason_for_vra_checked`, `vra_accepted_reason_id`
- `inventory_adjustment_request` + `inventory_adjustment_details` — adjustment-down records
- `inventory_audit` — cycle-count audit with `old_quantity`, `is_audit_done`

---

## Putaway (8 types — `PUTAWAY TYPE` master)

| Code | Type |
|---|---|
| 540 | ORDER PUTAWAY (RTO / cancel reverse) |
| 541 | TO PUTAWAY (Transfer Order between WHs) |
| 542 | BILL PUTAWAY (post-procurement inwarding) |
| 551 | BIN TO BIN |
| 562 / 576 | COLDCHAIN PUTAWAY |
| 583 | REVERT PICKING PUTAWAY |
| 683 | BATCH VERIFICATION PUTAWAY |

Faridabad variant: PUTAWAY-FBD. Edge → Quarantine zone. Rack-full → next-rack suggest.

---

## 5 PTS-restricted columns on `inward_product_details` — LOCKED

For the `tm_analytics` Redshift group, these 5 cols are **hidden by GRANT policy**:

1. `pts`
2. `verified_pts`
3. `final_pts`
4. `invoiced_final_pts`
5. `verified_pts_by_cp`

PTR / MRP family stay visible. See `tm-chotu` memory `reference_redshift_groups` for the GRANT pattern.

---

## Hub Config — admin layer

(Per-WH config controlling inventory behaviour. Confirmed on `warehouse_details`:)

- `procurement_cut_off_time` (time of day, IST) — orders past this → next-day processing
- `warehouse_processing_days` (bigint, default 1)
- `work_start` / `work_end`
- `vinculum_loc_code` + `ims_enable` — WMS routing
- `ns_warehouse_id` — NetSuite ref

Other Hub Config dimensions (admin UI): SKU Categorization (A/B/C), Bulk SKU List, Cold Chain SKU List, Homeopathy SKU List, Pack-size mgmt, Excess Inventory Report, WH Prioritization, Hub-level SKU Forecasting.

---

## Anti-patterns — DO NOT do these

- ❌ Trust `medicine_warehouse_master.availability` as real-time qty — it's a MANUAL flag set by Catalogue team
- ❌ Treat `is_searchable` as a stockout signal — it hides broken catalog rows, nothing more
- ❌ Read backorder from `order_details` — flag lives on `package_details_tracking.is_back_order`
- ❌ Use `scm_wh_stock_threshold_master` — **unused, empty table**. (And: never use ANY table without first verifying it has data — see `tm-chotu-query-rigor`)
- ❌ Use `medicine_stock_details` or `inventory_tracking` — both **legacy/deprecated**
- ❌ **SUM a quantity across inventory tables** (live DB 180 + mirror + rack/physical) — they don't reconcile. Pick ONE source by use-case: business/analytics → `product_inventory_data`; physical/rack ops → WMS/NetSuite bin data. Summing double-counts.
- ❌ Trust `warehouse_details.status = 1` as "active WH" list — 4 ids (3, 5, 7, 11) are decommissioned but still status=1. Use `SELECT DISTINCT warehouse_id FROM INVENTORY_SCHEMA.product_inventory_data WHERE active=1`
- ❌ Mix MySQL/Redshift schema case — DB 630/2 need `TMMUMPSDB.` UPPERCASE; DB 432 Redshift uses `tmmumpsdb.` lowercase; DB 180 uses `INVENTORY_SCHEMA.`. Wrong case → "Unknown database" error
- ⚠️ Old skill caveat "Faridabad on Vinculum so query DB 432" was misleading — ANKW Faridabad (id=21) IS synced into DB 180 PROD INVENTORY despite Vinculum being the underlying WMS. id=11 (old Intellihealth Faridabad) is decommissioned
- ❌ Bypass 5 PTS-restricted cols on `inward_product_details` for `tm_analytics` group queries
- ❌ Assume cold-chain at WH level — it's pincode-level (`pincode_warehouse_master.is_cold_chain_deliverable` on priority=1 rows)
- ❌ Read 5 PTS cols and share externally — restricted

---

## SQL recipes

> ⚠️ **Schema-case rule:** DB 630 (Mangesh) + DB 2 (Main_DB) require **UPPERCASE `TMMUMPSDB.`** in MySQL queries — lowercase `tmmumpsdb.` returns "Unknown database". DB 432 (Redshift) uses lowercase `tmmumpsdb.`. DB 180 uses `INVENTORY_SCHEMA.`. Match case to engine.

### Live qty for any active WH (includes Vinculum-backed Faridabad id=21)

```sql
-- DB 180 PROD INVENTORY (universal source)
SELECT
  warehouse_id, product_cd, sku_name,
  total_inventory_qty, available_qty, threshold,
  pending_consult_qty, pending_invoice_qty, pending_shipped_qty,
  last_synced_on
FROM INVENTORY_SCHEMA.product_inventory_data
WHERE warehouse_id = :wh_id
  AND active = 1
  AND product_cd = :sku
LIMIT 10;
```

### Same query via Redshift mirror (for cross-DB joins with demand trackers)

```sql
-- DB 432 Min Max Redshift (Airbyte mirror of DB 180)
SELECT warehouse_id, product_cd, available_qty, threshold
FROM tmmumpsdb.product_inventory_data
WHERE warehouse_id = :wh_id
  AND product_cd = :sku;
```

### "Is X cold-chain orderable for this pincode?"

```sql
-- DB 630 (Mangesh) — UPPERCASE TMMUMPSDB required
SELECT pincode, warehouse_id, priority, is_cold_chain_deliverable
FROM TMMUMPSDB.pincode_warehouse_master
WHERE pincode = :pin
  AND priority = 1
  AND active = 1
  AND is_serviceable = 1;
```

### Daily inventory trend (canonical)

```sql
-- DB 432 Redshift (lowercase tmmumpsdb)
SELECT gen_dataset_dt, SUM(curr_inv) AS total_qty
FROM tmmumpsdb.product_wh_inventory_daily_tracker
WHERE warehouse_id = :wh_id
  AND product_cd = :sku
  AND gen_dataset_dt >= CURRENT_DATE - INTERVAL '30 day'
GROUP BY 1 ORDER BY 1;
```

### Stockout days last 30d (using `availability = FALSE` on daily tracker)

```sql
-- DB 432 Redshift
SELECT product_cd, warehouse_id,
       SUM(CASE WHEN availability = FALSE THEN 1 ELSE 0 END) AS oos_days,
       COUNT(*) AS total_days
FROM tmmumpsdb.product_wh_inventory_daily_tracker
WHERE gen_dataset_dt >= CURRENT_DATE - INTERVAL '30 day'
GROUP BY 1, 2
HAVING SUM(CASE WHEN availability = FALSE THEN 1 ELSE 0 END) > 0;
```

### Truly-active WH list (don't trust `warehouse_details.status`)

```sql
-- DB 180 — actual active universe
SELECT DISTINCT warehouse_id
FROM INVENTORY_SCHEMA.product_inventory_data
WHERE active = 1
ORDER BY warehouse_id;
-- 32 WHs as of 2026-05-26 probe.
-- warehouse_details.status=1 incorrectly includes ids 3, 5, 7, 11 (all decommissioned).
```

---

## See also

- `tm-chotu-modules` → Live Inventory, Warehouse Assignment, Picklist, Putaway, Replenishment, Central Procurement (process detail)
- `tm-chotu-tables-enums` → INVENTORY_TYPE, WAREHOUSE TYPE, PUTAWAY TYPE, PICKLIST STATUS masters
- `tm-chotu-business-flows` → Order lifecycle, backorder branch, RTO chain
- `tm-chotu-tat` → Putaway TAT, inwarding TAT, courier-pincode TAT (uses `pincode_warehouse_master` surface/air_delivery_days)
- `tm-chotu-data-sources` → DB 180 PROD INVENTORY, DB 432 Min Max Redshift, DB 993 SF WAREHOUSE_MANAGEMENT_SYSTEM
- `tm-chotu-query-rigor` → Verify-table-before-lock + verify-table-HAS-DATA hard rules
