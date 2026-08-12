---
name: tm-chotu-joins
description: End-to-end join patterns (acquisition → install → signup → order → invoice → lifecycle → substitution → attribution → therapy) with 8 ready-to-run SQL recipes (daily GMV, lifecycle stage counts, ROAS, FTC, Gold/Silver/Bronze, therapy-sub coverage, install→FTC funnel, molecule-level invoiced sales by state & month), join key reference table, Redshift gotchas (bigint cast, LOWER for therapy join, DB typos, organisation_id filter). Load when user asks "how do I join X to Y", "give me a query for X", "ROAS / GMV / FTC query", or any SQL-recipe / join question.
---

# Joins (end-to-end)

All recipes target **DB 170 (Redshift)** — the shared default. Bigint math always needs `::numeric / 1000000.0` cast.

## Macro pipeline

```
Ad spend (maranalytics.google_ads_*)
   ↓  date + campaign_id
Install (tmmumpsdb.appsflyer_installs)
   ↓  device_id / install_id
First app open (appsflyer_homepage_viewed)
   ↓  device_id
Customer signup (customer_details via mobile_otp)
   ↓  customer_id
Order placed (order_details)
   ↓  order_id
Per-order $ (final_calculated_amount)    ← INVOICED amount lives here, NOT order_details
   ↓  order_id
Lifecycle transitions (order_status)     ← USE THIS for stage counts, not order_details snapshot
   ↓  order_id
Substitution outcome (final_substitute_product_cx_confirm / _dr_confirm)
   ↓  order_id × product_code
Attribution rollup (orders_campaign_attribution — pre-joined, 9.8M rows)
   ↓  order_id
Therapy mapping (disease_product_mapping → masters)
```

## Recipe 1 — Daily GMV (invoiced delivered)

```sql
-- Yesterday's GMV per warehouse
SELECT
  o.warehouse_id,
  COUNT(DISTINCT o.order_id) AS delivered_orders,
  SUM(fca.final_amount)::numeric(14,2) AS gmv_invoiced,
  AVG(fca.final_amount)::numeric(10,2) AS aov,
  SUM(fca.saving_value)::numeric(14,2) AS customer_savings,
  SUM(fca.tm_cash + fca.tm_credit + fca.tm_cashback)::numeric(14,2) AS wallet_burn
FROM tmmumpsdb.order_details o
JOIN tmmumpsdb.final_calculated_amount fca USING (order_id)
WHERE o.created_on >= CURRENT_DATE - INTERVAL '1 day'
  AND o.created_on <  CURRENT_DATE
  AND o.orderstatus = 55   -- ORDER DELIVERED
  AND o.organisation_id = 1
GROUP BY 1
ORDER BY gmv_invoiced DESC;
```

## Recipe 2 — Lifecycle stage counts via transition log

```sql
-- "How many orders got HA-called / doctor-confirmed / cancelled yesterday"
-- USE order_status (transition history), NOT order_details.orderstatus (current snapshot)
SELECT
  os.order_status_id,
  svm.value AS status_name,
  COUNT(DISTINCT os.order_id) AS event_count
FROM tmmumpsdb.order_status os
JOIN tmmumpsdb.m_system_value_master svm
  ON svm.serial_id = os.order_status_id AND svm.name = 'ORDER STATUS'
WHERE DATE(os.modified_on) = CURRENT_DATE - 1
  AND os.order_status_id IN (
    66,   -- ORDER CONFIRMED
    317,  -- DR ORDER CONFIRMED
    595,  -- HEALTH ADVISOR CALL ATTEMPTED
    57,   -- ORDER CANCELED
    60,   -- ORDER DISPATCHED
    55    -- ORDER DELIVERED
  )
GROUP BY 1, 2
ORDER BY event_count DESC;
```

## Recipe 3 — Order → attribution (ROAS)

```sql
-- Campaign-level ROAS, 14 days
SELECT
  a.final_media_source, a.final_campaign, a.partner,
  COUNT(DISTINCT o.order_id) AS orders,
  SUM(CASE WHEN o.orderstatus = 55 THEN fca.final_amount ELSE 0 END)::numeric(14,2) AS gmv_delivered,
  SUM(g.cost::numeric / 1000000.0) AS google_spend          -- Redshift bigint cast
FROM tmmumpsdb.order_details o
JOIN tmmumpsdb.orders_campaign_attribution a USING (order_id)
LEFT JOIN tmmumpsdb.final_calculated_amount fca USING (order_id)
LEFT JOIN maranalytics.google_ads_main g
  ON g.campaign_id::text = a.ad_id::text   -- [VERIFY join key per project marketing-analytics]
WHERE o.created_on BETWEEN CURRENT_DATE - INTERVAL '14 days' AND CURRENT_DATE
GROUP BY 1, 2, 3
ORDER BY gmv_delivered DESC;
```

## Recipe 4 — FTC customers (compute on-the-fly; do NOT trust `customer_order_rank`)

```sql
-- True FTC customers = those whose FIRST EVER delivered order is in last 7 days
WITH first_delivered AS (
  SELECT customer_id, MIN(created_on) AS first_delivered_on
  FROM tmmumpsdb.order_details
  WHERE orderstatus = 55
    AND organisation_id = 1
  GROUP BY customer_id
)
SELECT
  DATE(first_delivered_on) AS ftc_date,
  COUNT(DISTINCT customer_id) AS ftc_customers
FROM first_delivered
WHERE first_delivered_on >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY 1
ORDER BY 1 DESC;
```

## Recipe 5 — Substitution acceptance (Gold / Silver / Bronze)

```sql
-- Per-customer subs propensity (per probab-subs-persona model)
SELECT
  od.customer_id,
  COUNT(CASE WHEN pd.cx_accepted_subs = 1 AND fsp_cx.status_id = 61 THEN 1 END) AS gold_signals,
  COUNT(CASE WHEN pd.cx_accepted_subs = 0 AND fsp_dr.status_id = 61 THEN 1 END) AS silver_signals,
  COUNT(CASE WHEN pd.cx_accepted_subs = 0 AND fsp_dr.reason_id = 9 THEN 1 END) AS bronze_signals,
  COUNT(CASE WHEN fsp_cx.reason_id IS NULL
              AND fsp_cx.subs_product_code = fsp_cx.product_code THEN 1 END) AS sub_not_offered
FROM tmmumpsdb.order_details od
JOIN tmmumpsdb.product_details pd USING (order_id)
LEFT JOIN tmmumpsdb.final_substitute_product_cx_confirm fsp_cx USING (order_id)
LEFT JOIN tmmumpsdb.final_substitute_product_dr_confirm fsp_dr USING (order_id)
WHERE od.orderstatus = 55                       -- delivered orders only
  AND od.created_on >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY 1;
```

## Recipe 6 — Therapy-tagged sub coverage (Mumbai hub example)

```sql
-- "For each drug category, what % of products have an eligible substitute at Mumbai hub?"
-- Substitute the hub name to switch warehouse
SELECT
  dcm.category AS drug_category,
  COUNT(DISTINCT om.original_product_code) AS products,
  SUM(CASE WHEN om.is_subs_product_info_present = 1 THEN 1 ELSE 0 END) AS with_sub,
  ROUND(100.0 * SUM(CASE WHEN om.is_subs_product_info_present = 1 THEN 1 ELSE 0 END)
        / NULLIF(COUNT(DISTINCT om.original_product_code), 0), 1) AS pct_sub_available
FROM tmmumpsdb.org_sub_medicine_mapping_mumbai_hub_new_algo om
JOIN tmmumpsdb.disease_product_mapping dpm
  ON LOWER(om.original_product_code) = dpm.product_code      -- LOWER required (case-mismatch trap)
JOIN tmmumpsdb.disease_category_master dcm
  ON dpm.type = 'DISEASE_CATEGORY' AND dpm.type_id = dcm.id
WHERE dpm.active = 1
  AND dpm.is_approved = 1
  AND dpm.priority = 'D1'
GROUP BY 1
ORDER BY products DESC
LIMIT 20;
```

## Recipe 7 — Install → FTC conversion funnel

```sql
-- Install cohort → signup → first delivered order (90d window)
SELECT
  DATE(i.install_date) AS install_dt,
  COUNT(DISTINCT i.device_id) AS installs,
  COUNT(DISTINCT c.customer_id) AS signups,
  COUNT(DISTINCT CASE WHEN o.orderstatus = 55 THEN o.customer_id END) AS ftc_delivered,
  ROUND(100.0 * COUNT(DISTINCT c.customer_id) / NULLIF(COUNT(DISTINCT i.device_id), 0), 1) AS signup_pct,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN o.orderstatus = 55 THEN o.customer_id END)
        / NULLIF(COUNT(DISTINCT c.customer_id), 0), 1) AS signup_to_ftc_pct
FROM tmmumpsdb.appsflyer_installs i
LEFT JOIN tmmumpsdb.customer_details c ON c.device_id = i.device_id
LEFT JOIN tmmumpsdb.order_details o ON o.customer_id = c.customer_id
WHERE i.install_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY 1
ORDER BY 1 DESC;
```

## Recipe 8 — Molecule-level invoiced sales by state & month (single + ALL combinations)

Validated live 2026-06-05 (Pregabalin, Jan–Sep 2024). Three traps it avoids:

1. **Molecule universe** — `medicine_molecule.molecule_code` is a composite strength-string (`TM-M00167125.0MG`), **NOT** the integer code. To catch a molecule's single-salt AND every combination product, match the **`molecule_combination_cd`** token (`TM-M-<code>` single, `TM-M-<c1>-<c2>` combo). Resolve `<code>` from `molecule_master` (name→int code) which lives on **DB 2 / 630 only, not Redshift** — e.g. PREGABALIN = 1527.
2. **Invoiced value** — `net_suite_invoice_batch.amount` is **NULL** (≥2024 rows). Use **`rate * quantity`**. Filter `active = 1` (drops reversed lines).
3. **State** — `d_address_master.state_id` AND `city_id` are **100% NULL** → the direct `m_state_master` join returns nothing. Recover via the **pincode chain** (100% coverage).

```sql
-- Step 0 (DB 2 or 630, NOT Redshift): resolve molecule code by name
--   SELECT molecule_code, molecule_name FROM molecule_master
--   WHERE LOWER(molecule_name) LIKE '%pregabalin%';   -- → 1527

-- Step 1 (DB 170): molecule invoiced sales by state × month
SELECT
  sm.state_name,
  DATE_TRUNC('month', nib.created_on) AS mth,
  SUM(nib.rate * nib.quantity)::numeric(14,2) AS invoiced_value,
  SUM(nib.quantity) AS units
FROM tmmumpsdb.net_suite_invoice_batch nib
JOIN      tmmumpsdb.order_details od            ON nib.order_id   = od.order_id
LEFT JOIN tmmumpsdb.d_address_master dam        ON od.address_id  = dam.address_id
LEFT JOIN tmmumpsdb.pincode_warehouse_master pwm ON dam.pincode_id = pwm.id
LEFT JOIN tmmumpsdb.m_city_master cm            ON pwm.city_id    = cm.city_id
LEFT JOIN tmmumpsdb.m_state_master sm           ON cm.state_id    = sm.state_id
WHERE nib.product_code IN (
        SELECT product_code FROM tmmumpsdb.medicine_molecule
        WHERE molecule_combination_cd LIKE '%-1527'      -- single + combo-last
           OR molecule_combination_cd LIKE '%-1527-%')   -- combo-mid/lead (the leading '-' stops 21527 matching)
  AND nib.active = 1
  AND od.organisation_id = 1
  AND nib.created_on >= DATE '2024-01-01'
  AND nib.created_on <  DATE '2024-10-01'
GROUP BY 1, 2
ORDER BY 2, invoiced_value DESC;
```

- `net_suite_invoice_batch` is **line-level** (`order_id`, `product_code`, `quantity`, `rate`, `mrp`, `returned_qty`) → correct grain for molecule attribution. `final_calculated_amount.final_amount` is per-ORDER, **cannot** be split by molecule.
- Bucket by `nib.created_on` = invoice date. For placement basis use `od.created_on`. For net-of-returns subtract `returned_qty * rate`.
- Pincode chain has **no fan-out** — every hop is a PK (`pwm.id`, `cm.city_id`, `sm.state_id`). Cross-check pincode via `pwm.pincode` (clean 6-digit).
- MySQL flavour (DB 630): swap `DATE_TRUNC` → `DATE_FORMAT(nib.created_on,'%Y-%m')`; avoid alias `lines` (reserved word).

## Join key reference

| From → To | Key | Notes |
|---|---|---|
| `order_details` ↔ `final_calculated_amount` | `order_id` | Always join when calculating $ (invoiced amount is here, NOT in `order_details`) |
| `order_details` ↔ `order_status` | `order_id` | order_status is transition history (one row per state hop) |
| `order_details` ↔ `orders_campaign_attribution` | `order_id` | Attribution pre-joined (9.8M rows) |
| `order_details` ↔ `product_details` | `order_id` | One product_details row per line item per order |
| `product_details` ↔ `final_substitute_product_cx_confirm` | `order_id` (+ optionally `product_code`) | Checkout-time sub snapshot |
| `product_details` ↔ `final_substitute_product_dr_confirm` | `order_id` | Post-HA-call snapshot |
| `customer_details` ↔ `order_details` | `customer_id` | Standard |
| `customer_details` ↔ `appsflyer_installs` | `device_id` | First-touch attribution |
| `medicine_master` ↔ `disease_product_mapping` | `LOWER(product_code)` | **Case-mismatch trap** — disease side is lowercase |
| `medicine_master` ↔ `medicine_warehouse_master` | `product_code` | Warehouse overrides default master |
| `medicine_master` ↔ `medicine_molecule` | `product_code` | Molecule code for substitution lookup |
| `net_suite_invoice_batch` ↔ `order_details` | `order_id` | Line-level invoiced $ = `rate*quantity` (`amount` col is NULL). `organisation_id` filter via order_details |
| `net_suite_invoice_batch` ↔ `medicine_molecule` | `product_code` | Molecule attribution; match `molecule_combination_cd` token for single + combos |
| `d_address_master` → state | `pincode_id → pincode_warehouse_master.id → city_id → m_city_master.state_id → m_state_master` | **Only working state path** — `d_address_master.state_id`/`city_id` are 100% NULL. 100% coverage, all PK hops |
| `orders_campaign_attribution` ↔ `maranalytics.google_ads_main` | `ad_id::text = campaign_id::text` | [VERIFY in marketing-analytics project] |
| `m_system_value_master` ↔ any status column | `serial_id` × `name` | Always filter `name` (e.g. `name = 'ORDER STATUS'`) — codes overlap across master groups |

## Redshift-specific gotchas

1. **bigint division returns 0** unless cast: `SUM(col)::numeric / 1000000.0`. Burned a 132× wrong-total in marketing-analytics once.
2. **MySQL → Redshift case difference** — `disease_product_mapping.product_code` is lowercase; wrap `LOWER()` on the join.
3. **DB column typos** — `consider_poduct`, `keep_orginal` (use exact typo'd names — quoting "correct" spelling returns no rows).
4. **`organisation_id = 1`** filter for Truemeds-tenant data — otherwise multi-tenant rows leak in.
5. **`net_suite_invoice_batch.amount` is NULL** (≥2024) — invoiced value = `rate * quantity`. Filter `active = 1` to drop reversed lines.
6. **Order/customer state lives ONLY in the pincode chain** — `d_address_master.state_id` & `city_id` are 100% NULL; `customer_state` is dirty free-text (~40% filled, hundreds of J&K spellings). Resolve via `pincode_id → pincode_warehouse_master.id → city_id → m_city_master → m_state_master` (100%).
7. **"All products of a molecule" by name** — `medicine_molecule.molecule_code` is a composite strength-string (≠ the int code; `= 1527` returns 0 rows). Match `molecule_combination_cd` token: `LIKE '%-<code>' OR LIKE '%-<code>-%'`. Resolve `<code>` from `molecule_master` (DB 2/630 only). (For exact same-composition substitution matching, the self-join on identical `molecule_code` string is still correct — different use case.)
