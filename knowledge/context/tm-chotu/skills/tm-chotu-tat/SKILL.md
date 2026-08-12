---
name: tm-chotu-tat
description: Truemeds TAT model — `delivery_date_tracker` (DDT) on DB 630 MySQL (mirror `append_only_delivery_date_tracker` on DB 170 Redshift) is the canonical source for promised vs actual delivery dates. One row per order, `promised_*` set ONCE at placement and NEVER changes (unless incomplete), `current_*` updates each step, `actual_*` set when actuals happen. 5 tracked promise/actual pairs: delivery / dispatch / doctor_call / warehouse_processing / air_delivery. `metadata` longtext JSON carries full PDD audit (wh_processing_type, wh_processing_mins, doctor/warehouse/logistics work hours, buffer config). `delivery_date_timeline` = PDD-change audit log. OTIF = `actual_delivery_date <= promised_delivery_date` (network OTIF 30d probed 2026-05-26 = 62.59%). Business hours: Doctor 08:00–22:00, WH `warehouse_details.work_start/_end`, WH week-off `wh_weekoff_schedule`, courier cutoff `courier_partner_schedule`. WH processing TAT: 4-bucket grid (`SDD/NON_SDD × INVENTORY/NON_INVENTORY`) per WH on `wh_processing_time` (`processing_time_in_mins`, filter `active=1`). RTO chain decoded across 6 serial_ids in multiple master groups (119 RTON / 120 RTO / 121 RTO-IT / 123 RTO-OFD / 124 RTD / 125 RTU). Customer return chain separate (56/190/191/263/272/273). Refund SLA: TM_CREDIT/CASH/CASHBACK instant; CASHFREE 5-7d. ❌ `order_tat_base_model` stale; `order_tat_details` + `pincode_tat_adherence_data` need deep-dive before locking. Load when user asks "what's our TAT", "doorstep TAT", "PDD math", "OTIF", "TAT breach", "courier cutoff", "RTO TAT", "business hours", "delivery date", "any time-based SLA".
---

# TAT (Turnaround Time)

Time elapsed between order events. Truemeds maintains a **promised-vs-actual model** on `delivery_date_tracker` for customer-facing SLAs, and **`order_status` transition log** for operational state-hop deltas.

> ✅ **Canonical TAT source: `delivery_date_tracker` (DDT).**
> 
> - DB 630 MySQL (`TMMUMPSDB.delivery_date_tracker`) — live
> - DB 170 Redshift mirror via Airbyte: `tmmumpsdb.append_only_delivery_date_tracker`
> - One row per order — `promised_*` set ONCE at placement and **NEVER changes** (unless order goes INCOMPLETE)
> - `current_*` updates at every step (live re-projection)
> - `actual_*` set when actuals occur, then frozen
> - `metadata` longtext JSON carries the **full PDD audit trail**

---

## ❌ Tables NOT to use (caught by probe + Mangesh confirmation)

| Table | DB | Why |
|---|---|---|
| `order_tat_base_model` | 170 | **Stale.** Has 40 tempting cols (op2od, drc2ful, etc.) but data is unreliable. Don't use. |
| `order_tat_details` | 170 | Needs deep-dive before locking (promise_tat / supposed_tat / delay_days). v0.1.5 gap. |
| `pincode_tat_adherence_data` / `_mfc` | 630/170 | Rich (21 cols, breach buckets, adherence %) but needs deep-dive before locking. v0.1.5 gap. |

---

## `delivery_date_tracker` schema + grain

**Grain:** ONE row per order_id. INSERT on order placement; UPDATE on each step.

| Col | Type | Behaviour |
|---|---|---|
| `order_id` | bigint | PK proxy |
| **`promised_delivery_date`** | datetime | Set ONCE at placement. NEVER changes (unless incomplete). The customer's original commitment. |
| **`promised_dispatch_date`** | datetime | Set ONCE. |
| **`promised_doctor_call_time`** | datetime | Set ONCE — respects Doctor working hours (08:00–22:00). |
| **`promised_warehouse_processing`** | datetime | Set ONCE — derived from `wh_processing_time` lookup. |
| **`promised_air_delivery_date`** | datetime | Set ONCE — for air-eligible pincodes. |
| **`current_delivery_date`** | datetime | **Live re-projection** — UPDATES at every step. |
| **`actual_delivery_date`** | datetime | Set when delivered. Frozen. |
| **`actual_dispatch_date`** | datetime | Set when dispatched. Frozen. |
| **`actual_doctor_call_time`** | datetime | Set when doctor connects. Frozen. |
| **`actual_warehouse_processing`** | datetime | Set when WH processing completes. Frozen. |
| `created_on`, `modified_on` | timestamps | Standard. |
| **`metadata`** | longtext JSON | **Full PDD audit trail** — see below. |

### `metadata` JSON structure (real audit trail per order)

Every PDD has provenance. Sample fields seen in production:

```jsonc
{
  "is_sdd": true,                                   // Same-Day Delivery routing
  "buffer_applied_flag": false,                     // Was a buffer applied?
  "pickup_buffer_in_minutes": 0,
  "drop_buffer_in_minutes": 0,
  "promised_delivery_partner": 287,
  "instrumentation_details": {
    "doctor_attributes": {
      "promised_doctor_call_time": "2026-05-26T16:06:34",
      "default_doctor_call_minutes_config": 60,     // network default
      "doctor_call_required": true,
      "cass_flow_enabled": true,
      "doctor_working_hours": {                     // 🔑 BHrs reference
        "work_start": "08:00",
        "work_end":   "22:00"
      }
    },
    "warehouse_attributes": {
      "warehouse_id": 24,
      "is_mfc": true,
      "is_inventory": false,
      "is_sdd": true,
      "wh_processing_type": "SDD_NON_INVENTORY",    // 🔑 drives wh_processing_time lookup
      "wh_processing_mins": 810,                    // the lookup result, stamped for audit
      "warehouse_work_start": "10:00",              // per-WH BHrs
      "warehouse_work_end":   "19:00",
      "input_pincode": "453441"
    },
    "logistics_attributes": {
      "warehouse_id": 24,
      "resolved_pincode": "453441",
      "payment_type": "PREPAID",
      "delivery_partner_id": 287,
      "delivery_tat_mins": 0,                       // 0 for SDD
      "air_delivery_tat_mins": 0,
      "air_delivery_enabled": false,
      "is_air": false
    }
  },
  "pb_audit_source": "customer-service",            // who updated the promise
  "pb_audit_ts": "2026-05-26T10:21:34.235Z"
}
```

> Use the `metadata` JSON to **validate why a PDD was set the way it was**. Stored values (e.g. `wh_processing_mins: 810`) are audit-pinned — they survive even if the underlying lookup (`wh_processing_time`) changes later.

---

## `delivery_date_timeline` — PDD-change audit log

Companion table on DB 630. Per-row event log of every PDD change:

```
order_id, promised_delivery_date, estimated_delivery_date,
order_status_id, package_status_id, source, user_id, file_id,
courier_remark, created_on
```

Use this to answer "when did this order's promised date shift, and who/what changed it".

---

## 5 promise-vs-actual pairs

| Stage | Promised col | Actual col |
|---|---|---|
| Delivery | `promised_delivery_date` | `actual_delivery_date` |
| Dispatch | `promised_dispatch_date` | `actual_dispatch_date` |
| Doctor call | `promised_doctor_call_time` | `actual_doctor_call_time` |
| WH processing | `promised_warehouse_processing` | `actual_warehouse_processing` |
| Air delivery | `promised_air_delivery_date` | **— (no actual col)** |

---

## OTIF — canonical formula + LOCKED LIVE NUMBER

**Formula:**

```
OTIF = COUNT(actual_delivery_date <= promised_delivery_date) / COUNT(delivered orders)
```

Use **promised_delivery_date** directly (it IS the original commitment — never changes).

**Network OTIF (last 30d, probed 2026-05-26):**

| Delivered orders | On-time | OTIF % |
|---|---|---|
| **624,149** | **390,663** | **62.59%** |

> Source query: `SELECT COUNT(*), SUM(CASE WHEN actual_delivery_date <= promised_delivery_date THEN 1 END) FROM tmmumpsdb.delivery_date_tracker WHERE actual_delivery_date IS NOT NULL AND actual_delivery_date >= CURRENT_DATE - INTERVAL '30 day'` on DB 170.

---

## Business hours — three layers

Wall-clock vs business-hours matters for each segment differently:

### Doctor — 08:00–22:00 (14h window)

Source: `doctor_working_hours` in DDT `metadata.instrumentation_details.doctor_attributes`. Stored per-order for audit. Doctor TAT is measured against `promised_doctor_call_time` directly.

### Warehouse — per-WH

Source: `TMMUMPSDB.warehouse_details.work_start / work_end` (varies per WH; ANKW MFCs typically 10:00–19:00).

WH week-off for **non-inventory orders only**: `TMMUMPSDB.wh_weekoff_schedule (warehouse_id, week_off_day)`. Inventory orders are processed 7-days-a-week.

### Logistics — courier cutoff per (WH, courier, express-tier)

Source: `TMMUMPSDB.courier_partner_schedule`:
```
courier_partner_id, warehouse_id, pincode (nullable), express, priority,
schedule_time (double, decimal-hour: 23.3 = 23:30),
courier_partner_schedule_time (time, e.g. "23:30:00"),
active
```

Per-(WH, courier, express-flag, pincode) cutoff time. After cutoff → next courier window.

Plus per-WH `procurement_cut_off_time` on `warehouse_details` (different concept — procurement, not dispatch).

---

## WH processing TAT — 4-bucket grid

**Source:** `TMMUMPSDB.wh_processing_time`

```
wh_id, type, processing_time_in_mins, active
```

**`type` enum (4 values):**

| Type | Meaning |
|---|---|
| `SDD_INVENTORY` | Same-Day Delivery + Inventory order |
| `NON_SDD_INVENTORY` | Next/Later Day Delivery + Inventory order |
| `SDD_NON_INVENTORY` | Same-Day Delivery + JIT/Non-Inventory order |
| `NON_SDD_NON_INVENTORY` | Next/Later Day + JIT/Non-Inventory |

> **Filter `active = 1`** to get current TAT. Inactive rows are audit history of prior values (TAT changes over time; old rows kept for traceability).

**Sample active values (probed 2026-05-26):**

| WH id | Name | NON_SDD_INVENTORY | NON_SDD_NON_INVENTORY |
|---|---|---|---|
| 17 | Bangalore Hub (ANKW) | 60 min | 660 min (~11h) |
| 20 | Mumbai Hub New (ANKW) | 60 min | 750 min (~12.5h) |
| 22 | Kolkata Dhulagarh | 60 min | 615 min |

**Stamped on each order in DDT** as `metadata.warehouse_attributes.wh_processing_mins` → use this for retroactive audit (survives table changes).

---

## `order_status` — transition log (operational deltas)

For state-hop questions DDT doesn't answer (e.g. "time from order placed to dispatched", "time from confirmed to WH-assigned"):

```
TMMUMPSDB.order_status
  order_status_tracking_id  int
  order_id                  bigint
  order_status_id           bigint   ← maps to m_system_value_master
  modified_by_id            bigint
  modified_on               timestamp
```

**Pattern:**

```sql
WITH a AS (
  SELECT order_id, MIN(modified_on) AS t1
  FROM TMMUMPSDB.order_status WHERE order_status_id = :status_from GROUP BY 1
),
b AS (
  SELECT order_id, MIN(modified_on) AS t2
  FROM TMMUMPSDB.order_status WHERE order_status_id = :status_to GROUP BY 1
)
SELECT
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY TIMESTAMPDIFF(MINUTE, a.t1, b.t2)) AS p50_min,
  PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY TIMESTAMPDIFF(MINUTE, a.t1, b.t2)) AS p90_min
FROM a JOIN b USING (order_id);
```

`MIN(modified_on)` per status = first-entry. Use `MAX` for last-transition / breach analysis.

---

## RTO TAT — chain decoded

Post-dispatch return-to-origin chain. **Statuses split across 6 master groups** (NOT all under `name = 'ORDER STATUS'`):

| serial_id | name | value | Stage |
|---|---|---|---|
| 119 | RTON | RTO Notified | 1 — 3PL declares RTO |
| 120 | RTO | RTO | 2 — finalized |
| 121 | RTO-IT | RTO In Transit | 3 — reverse leg starts |
| 123 | RTO-OFD | RTO Out For Delivery | 4 — at WH gate |
| 124 | RTD | RTO Delivered | 5 — back at WH (terminal) |
| 125 | RTU | RTO Undelivered | branch — RTO failed |

> ⚠️ When querying RTO via `order_status`, filter `order_status_id IN (119, 120, 121, 123, 124, 125)` — they ARE the statuses on the same `order_status_id` column, even though they sit in different master groups.

RTO TAT = `MIN(modified_on at status=124 RTD)` − `MIN(modified_on at status=60 ORDER DISPATCHED)`.

---

## Customer return chain (post-delivery, separate from RTO)

| serial_id | value |
|---|---|
| 56 | ORDER RETURNED |
| 190 | RETURN REQUESTED |
| 191 | RETURN GENERATED |
| 192 | RETURN DECLINED |
| 200 | PARTIALLY RETURNED |
| 218 | SALES RETURN GENERATED |
| 263 | RETURN IN TRANSIT |
| 272 | RETURN PICKED UP |
| 273 | RETURN DELIVERED |
| 301 | RETURN TICKET CANCELLED |

---

## Module-internal SLAs

| Segment | SLA source | Notes |
|---|---|---|
| **Doctor approval** | `promised_doctor_call_time` on DDT | Per-order promise IS the SLA. No separate "default 60 min" config to rely on. Compare actual vs promised. |
| **Pharmacist Type-1 digitize** (DRX_STATUS 29 → 30) | — | **NO formal SLA.** Rolls up into broader pre-confirm window. |
| **Putaway** (inward → bin) | — | **NO formal SLA.** Tracked operationally but no breach metric. |
| **WH processing** | `wh_processing_time` per-WH per-type | See 4-bucket grid above. |
| **HA single-call connect %** | HA call logs | [GAP] live number — not in TAT scope, owned by HA module. |
| **Refund** | Per REFUND_TO destination — see below | |

---

## Refund SLA — per destination

(`m_system_value_master name = 'REFUND_TO'`)

| serial | Destination | SLA |
|---|---|---|
| 206 | TM_CREDIT | **Instant** |
| 207 | TM_CASH | **Instant** |
| 264 | TM_CASHBACK | **Instant** |
| 208 | CASHFREE | **5–7 working days** (bank-side) |

Internal-wallet refunds (TM_*) land instantly on customer wallet. CASHFREE refunds route via payment gateway → bank → 5–7 working day lag.

---

## Courier-partner pincode TAT (for PDD computation)

Per-(pincode, warehouse_id) row on `TMMUMPSDB.pincode_warehouse_master`:

```
surface_delivery_days   bigint
air_delivery_days       bigint
is_sdd                  bit          ← Same-Day Delivery flag for this pincode
is_serviceable_by_delhivery / _xpress_bees / _air_delhivery  ← per-courier serviceability
shipping_partner_id     bigint
priority                bigint       ← filter priority=1 for primary WH
is_cold_chain_deliverable  bit       ← (see tm-chotu-inventory)
```

Drives the logistics leg of PDD computation. Stamped into DDT `metadata.logistics_attributes` for audit.

**Adherence tracking** lives on `pincode_tat_adherence_data` (+ `_mfc` variant) — **deep-dive needed before locking** (21 cols including `ideal_tat`, `final_tat`, `supposed_tat`, breach buckets, adherence_percentage). v0.1.5 gap.

---

## SQL recipes — all engine-correct schema case

### Recipe 1 — OTIF (network, last 30d) — the 62.59% probe

```sql
-- DB 170 Redshift (lowercase tmmumpsdb)
SELECT
  COUNT(*) AS delivered_orders,
  SUM(CASE WHEN actual_delivery_date <= promised_delivery_date THEN 1 ELSE 0 END) AS on_time,
  ROUND(100.0 * SUM(CASE WHEN actual_delivery_date <= promised_delivery_date THEN 1 ELSE 0 END)::numeric
        / NULLIF(COUNT(*), 0), 2) AS otif_pct
FROM tmmumpsdb.delivery_date_tracker
WHERE actual_delivery_date IS NOT NULL
  AND actual_delivery_date >= CURRENT_DATE - INTERVAL '30 day'
  AND promised_delivery_date IS NOT NULL;
```

### Recipe 2 — End-to-end TAT P50/P90 (placement → delivery)

```sql
-- DB 170 Redshift
SELECT
  DATE(actual_delivery_date) AS delivery_date,
  COUNT(*) AS orders,
  PERCENTILE_CONT(0.5) WITHIN GROUP (
    ORDER BY EXTRACT(EPOCH FROM (actual_delivery_date - created_on))/3600.0
  ) AS p50_hours,
  PERCENTILE_CONT(0.9) WITHIN GROUP (
    ORDER BY EXTRACT(EPOCH FROM (actual_delivery_date - created_on))/3600.0
  ) AS p90_hours
FROM tmmumpsdb.delivery_date_tracker
WHERE actual_delivery_date >= CURRENT_DATE - INTERVAL '7 day'
GROUP BY 1 ORDER BY 1 DESC;
```

### Recipe 3 — WH processing TAT lookup (current active config)

```sql
-- DB 630 MySQL (UPPERCASE TMMUMPSDB)
SELECT wh_id, type, processing_time_in_mins
FROM TMMUMPSDB.wh_processing_time
WHERE active = 1
ORDER BY wh_id, type;
```

### Recipe 4 — RTO TAT (Dispatch → RTD) per courier

```sql
-- DB 630 MySQL
WITH dispatch AS (
  SELECT order_id, MIN(modified_on) AS dispatched_on
  FROM TMMUMPSDB.order_status WHERE order_status_id = 60 GROUP BY order_id
),
rtd AS (
  SELECT order_id, MIN(modified_on) AS rtd_on
  FROM TMMUMPSDB.order_status WHERE order_status_id = 124 GROUP BY order_id
)
SELECT
  COUNT(*) AS rto_orders,
  AVG(TIMESTAMPDIFF(HOUR, d.dispatched_on, r.rtd_on)) AS avg_rto_hours
FROM dispatch d JOIN rtd r USING (order_id)
WHERE r.rtd_on >= CURRENT_DATE - INTERVAL 30 DAY;
```

### Recipe 5 — Courier cutoff lookup per WH

```sql
-- DB 630 MySQL
SELECT warehouse_id, courier_partner_id, express, priority,
       courier_partner_schedule_time AS cutoff_time
FROM TMMUMPSDB.courier_partner_schedule
WHERE active = 1
ORDER BY warehouse_id, priority, express;
```

### Recipe 6 — Re-promise history for an order

```sql
-- DB 630 MySQL — when did this order's PDD change, by whom, why?
SELECT order_id, promised_delivery_date, estimated_delivery_date,
       order_status_id, package_status_id, source, user_id, courier_remark,
       created_on
FROM TMMUMPSDB.delivery_date_timeline
WHERE order_id = :order_id
ORDER BY created_on;
```

---

## Anti-patterns — DO NOT do these

- ❌ Use `order_tat_base_model` — **stale**, despite tempting 40-col schema
- ❌ Compute OTIF off `order_details.delivery_date` (varchar — ambiguous formatting) — use DDT
- ❌ Re-compute PDD by hand when `metadata` JSON on DDT has the full audit
- ❌ Assume RTO statuses all live in `name='ORDER STATUS'` master — they're spread across 6 master groups (RTON, RTO, RTO-IT, RTO-OFD, RTD, RTU). Filter by `order_status_id` numerically
- ❌ Measure Doctor TAT wall-clock outside 08:00–22:00 window — respect doctor working hours
- ❌ Compare `actual_delivery_date` against `current_delivery_date` for OTIF — `current_*` shifts at every step. Always use `promised_*` (the original commitment)
- ❌ Use `pincode_tat_adherence_data` or `order_tat_details` without first running a freshness + completeness probe — both need deep-dive before locking
- ❌ Forget WH week-off applies to non-inventory orders only — `wh_weekoff_schedule` is irrelevant for inventory orders
- ❌ Mix `tmmumpsdb` lowercase (Redshift) with `TMMUMPSDB` uppercase (MySQL) — wrong case → "Unknown database" (see `tm-chotu-query-rigor`)

---

## Known gaps for v0.1.6+

- [GAP] **`order_tat_details` deep-dive** — promise_tat vs supposed_tat semantics + relationship to DDT
- [GAP] **`pincode_tat_adherence_data` deep-dive** — 21 cols (ideal_tat / final_tat / supposed_tat / breach buckets / adherence_percentage) need locked semantics + per-bucket use case
- [GAP] **Air delivery actuals** — no `actual_air_delivery_date` col on DDT; how is air-vs-surface actual measured?
- [GAP] **DB 994 SF LOGISTICS scope** — Snowflake DB exists, MFA-required, content TBC
- [GAP] **OTIF target** — current is 62.59%; what's the network goal? (60? 80? business-pressure number)
- [GAP] **Module-internal current numbers** — Doctor TAT P50/P90, HA single-call connect %, refund SLA actuals (CASHFREE 5-7d target vs current)

---

## See also

- `tm-chotu-modules` → Live Inventory, Warehouse Assignment, Picklist (state machinery underlying TAT)
- `tm-chotu-business-flows` → Order lifecycle, RTO chain, customer-return chain (process detail)
- `tm-chotu-tables-enums` → orderstatus 96-code decode, RTO master groups (RTON / RTO / RTO-IT / RTO-OFD / RTD / RTU), REFUND_TO codes
- `tm-chotu-inventory` → `wh_processing_type` ↔ inventory routing context, `pincode_warehouse_master.is_cold_chain_deliverable` neighbour cols
- `tm-chotu-data-sources` → DB 630 (DDT live), DB 170 (DDT Airbyte mirror), DB 994 SF LOGISTICS (gap)
- `tm-chotu-query-rigor` → Schema-case HARD RULE (TMMUMPSDB uppercase MySQL, tmmumpsdb lowercase Redshift, INVENTORY_SCHEMA on DB 180), verify-table-has-data rule
- `tm-chotu-joins` → Recipe 2 (Lifecycle stage counts) — same `order_status` pattern used in Recipe 4 above
