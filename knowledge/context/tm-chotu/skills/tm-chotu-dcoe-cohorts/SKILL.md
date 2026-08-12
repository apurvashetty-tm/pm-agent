---
name: tm-chotu-dcoe-cohorts
description: How to DERIVE the DCOE cohort axes from scratch on Metabase alone (no DCOE instance needed) — CM-high (contribution margin cm_net), Generic Champions (generic adoption), Coupon dependency, Substitution propensity. Full formula + logic + ready-to-run DB 170 SQL for each, plus the composite cohorts (Golden Geese etc.). Load when user asks "how do I get high-margin / CM-high customers", "generic champions", "coupon-dependent / coupon addicts", "substitution propensity", "contribution margin per customer", "cm_net", "how does DCOE score a customer", or wants to reproduce any DCOE cohort without DCOE.
---

# DCOE Cohorts — derive them yourself on Metabase

**Purpose.** DCOE (TMEXP4) scores every customer on multiple axes and stores the result in its own RDS (`app.cohort_defs`, `dm_dcoe.customer_features`) on an EC2 pipeline. **You do NOT need that instance.** Every axis is computed from **tmprod tables you already have on Metabase**. This skill gives the logic + a runnable query for each, so any Claude wired to Metabase can rebuild the cohorts from source.

- **Default DB: 170 (Redshift), schema `tmmumpsdb`.** All SQL below is Redshift dialect. For <30-min-fresh, DB 2 (Main_DB MySQL) — swap `DATEADD`/`PERCENT_RANK` for MySQL equivalents.
- **Bigint money math** (`final_amount`, `order_value`, etc. are ×10^6 paise-scaled on some cols) → cast `::numeric / 1000000.0` where a col is bigint-scaled. `discount_applied`, `selling_price`, `rate` are already rupee-scaled — do **not** re-divide.
- **Valid-order filter (locked, use everywhere):** `organisation_id = 1 AND orderstatus NOT IN (49,312,174,1,2,3,4,58,274,344,668)`. These are cancel/discard/test statuses DCOE excludes.
- **Delivered order = `orderstatus = 55`.** Cohort features aggregate over *delivered* orders.
- **Windows:** CM = 90d, coupon/subs = 180d, generic = 365d, LTV = lifetime. (DCOE's chosen windows — keep them for parity.)

> **Calibration note.** Percentile cuts (P90 for "high") must be **recomputed on your own pull** — they drift weekly. The absolute floors (generic 0.30/0.50/0.10, coupon 0.70, CM −₹3) are DCOE's provisional defaults; sanity-check against your live distribution before locking a campaign.

---

## The 4 axes at a glance

| Axis | Feature | "High" gate | Source tables |
|---|---|---|---|
| **CM-high** | `cm_net_90d` (avg contribution margin/order) | top decile (`PERCENT_RANK ≥ 0.90`) | `order_details`, `final_substitute_product`, `net_suite_invoice_batch`, `medicine_master`, `final_calculated_amount` |
| **Generic Champion** | `generic_share` (% delivered lines generic) | `≥ 0.50` (adopter `≥0.30`, rejector `≤0.10`) | `order_details`, `final_substitute_product`, `medicine_master.generic_branded` |
| **Coupon dependency** | `coupon_order_ratio_180d` | `≥ 0.70` = dependent (HD/AC) | `order_details.offer_id`, `discount_applied` |
| **Substitution propensity** | `subs_accept_rate` (secondary signal) | `> 0.70` = advocate (SA) | `final_substitute_product_cx_confirm.status_id` |

> ⚠️ **F1 pivot (2026-06-09) — read this.** DCOE's substitution *lever* was **moved off `subs_accept_rate` onto `generic_share`**. Reason: the GOAL is **generic adoption = margin**, not the substitution *mechanism*. A customer who buys generics directly (never shown a sub) is a win the accept-rate axis missed. So:
> - **"Generic Champions" is now the real margin-behaviour cohort** (keys off `generic_branded`).
> - `subs_accept_rate` is kept as a **secondary explanatory signal only** (and still powers the Gold/Silver/Bronze persona bridge). Do not gate a margin campaign on accept-rate.

---

## 1. CM-high — contribution margin (`cm_net`)

**Logic.** `cm_net` = every rupee of revenue we keep on an order minus every rupee of drag we bear to earn it. GST is stripped from revenue (pass-through, not ours).

### Full formula (authoritative — CM_CALCULATION.md, locked)
```
cm_net = product_rev_ex_gst + delivery_rev_ex_gst + packaging_rev_ex_gst
       - COGS                     -- NetSuite invoiced cost
       - zone_shipping_cost       -- SDD=75, ZoneA(≤2d)=25, B(3d)=30, C(4d+)=34
       - cod_surcharge            -- 11.5 if payment_id=17 (COD), else 0
       - return_logistics_cost    -- 38 per RESOLVED return ticket
       - 7                        -- packaging cost (flat/order)
       - promo_comm_cost          -- WA 0.80 / SMS 0.09 / RCS 0.10 / promo-call 10 per billable event in window
       - coupon_discount          -- order_details.discount_applied
       - tm_cash_burn             -- final_calculated_amount.tm_cash
       - adjustment_burn          -- final_calculated_amount.adjustment_amt
       - price_lock_burn          -- final_calculated_amount.price_lock_disc
       - CPO                       -- doctor 20 + HA 25 + WH 28 (order_category-gated)
```

**Component sources + gotchas (the ones that bite):**
- **product_rev_ex_gst** = `SUM( fsp.selling_price / (1 + gst/100) )` over **invoiced FSP lines only** (`invoice_batch_id IS NOT NULL`). `selling_price` is already the per-line total (do **not** ×qty). Summing non-invoiced FSP candidates = phantom revenue → cm explodes. `gst` from `medicine_master.gst` (default 5 if null), join `LOWER(product_code)`.
- **COGS** = `SUM(net_suite_invoice_batch.rate)` where `active=1`, join `nsib.fsp_id = fsp.final_subs_id`. ⚠️ known grain caveat: nsib invoiced value is `rate × quantity` but the DCOE extract sums `rate` only (`amount` col NULL since 2024) — a uniform under-count on both stages; flag, don't silently trust absolute ₹.
- **zone_shipping** needs dispatch time from `order_tat_details.pickup_time` (NOT `delivery_date_tracker.actual_dispatch_date` — that's NULL for 100% of orders and silently zones everything to C). SDD flag wins: `package_details_tracking.is_sdd`.
- **CPO** gates on `order_details.order_category → aov_category_master.id → name`. Must resolve **id→name** and match the name-set (one name = many scattered ids). Hardcoding ids → CPO fires ≈0 → cm overstated ~₹26.6/order. `workflow_status = 242` → skip doctor+HA.
- **return_logistics** = `38 × COUNT(DISTINCT ticket_issues.id)` where `status=90` (RESOLVED only), per ticket, NOT per line. `ticket_issues` is **MySQL-only** (DB 2, not on Redshift) → on Redshift use `return_tracker`+`sales_return_details` (`is_rto=0 AND refunded_on/return_delivered_on NOT NULL`), count `DISTINCT return_id`.

### Ready-to-run: margin PROXY (dominant components, DB 170)
The exact formula needs MySQL-only + TAT + Karix tables. This **proxy** captures the big-ticket components that live on tmprod and is enough to rank customers by margin and cut the top decile. Omitted (all small/flat, subtract to reach exact cm_net): zone shipping, return logistics, promo comm, CPO.

```sql
WITH delivered AS (
  SELECT od.order_id, od.customer_id, od.payment_id,
         COALESCE(od.discount_applied,0) AS coupon_discount
  FROM tmmumpsdb.order_details od
  WHERE od.organisation_id = 1
    AND od.orderstatus = 55                              -- delivered
    AND od.created_on >= DATEADD(day,-90,CURRENT_DATE)   -- DCOE cm window
),
rev AS (                                                 -- product revenue ex-GST, invoiced lines only
  SELECT fsp.order_id,
         SUM(fsp.selling_price / (1 + COALESCE(mm.gst,5)/100.0)) AS product_rev_ex_gst
  FROM tmmumpsdb.final_substitute_product fsp
  JOIN tmmumpsdb.medicine_master mm ON LOWER(mm.product_code) = LOWER(fsp.product_code)
  WHERE fsp.invoice_batch_id IS NOT NULL
  GROUP BY fsp.order_id
),
cogs AS (
  SELECT fsp.order_id, SUM(nsib.rate) AS cogs           -- rate only (grain caveat above)
  FROM tmmumpsdb.final_substitute_product fsp
  JOIN tmmumpsdb.net_suite_invoice_batch nsib ON nsib.fsp_id = fsp.final_subs_id
  WHERE nsib.active = 1
  GROUP BY fsp.order_id
),
chg AS (
  SELECT order_id,
         COALESCE(delivery_charge,0)/1.18   AS delivery_rev_ex_gst,
         COALESCE(packaging_charge,0)/1.18  AS packaging_rev_ex_gst,
         COALESCE(tm_cash,0)                AS tm_cash_burn,
         COALESCE(adjustment_amt,0)         AS adjustment_burn,
         COALESCE(price_lock_disc,0)        AS price_lock_burn
  FROM tmmumpsdb.final_calculated_amount
),
per_order AS (
  SELECT d.customer_id,
         COALESCE(r.product_rev_ex_gst,0) + COALESCE(c.delivery_rev_ex_gst,0)
       + COALESCE(c.packaging_rev_ex_gst,0)
       - COALESCE(cg.cogs,0) - d.coupon_discount
       - COALESCE(c.tm_cash_burn,0) - COALESCE(c.adjustment_burn,0) - COALESCE(c.price_lock_burn,0)
       - 7                                                       -- flat packaging cost
       - CASE WHEN d.payment_id = 17 THEN 11.5 ELSE 0 END        -- COD surcharge
         AS cm_net_proxy
  FROM delivered d
  LEFT JOIN rev  r  ON r.order_id  = d.order_id
  LEFT JOIN cogs cg ON cg.order_id = d.order_id
  LEFT JOIN chg  c  ON c.order_id  = d.order_id
),
cust AS (
  SELECT customer_id, COUNT(*) AS delivered_90d, AVG(cm_net_proxy) AS cm_net_90d
  FROM per_order GROUP BY customer_id
)
SELECT customer_id, delivered_90d, cm_net_90d,
       PERCENT_RANK() OVER (ORDER BY cm_net_90d) AS cm_pctile,
       CASE
         WHEN PERCENT_RANK() OVER (ORDER BY cm_net_90d) >= 0.90 THEN 'CM++  (HIGH — protect, no discount)'
         WHEN cm_net_90d > 0  THEN 'CM+'
         WHEN cm_net_90d > -3 THEN 'CM-'
         ELSE 'CM--  (churn candidate)'
       END AS cm_bucket
FROM cust
ORDER BY cm_net_90d DESC;
```

**CM-high customer = `CM++` = top decile of `cm_net_90d`.** DCOE gates on `cm_net_90d_pctile >= 0.90` over the **active-buyer** base (not the full base — P75-over-full ≈ 62nd pctile of actives, too loose).

---

## 2. Generic Champions — generic adoption (`generic_share`)

**Logic.** Fraction of a customer's **delivered medicine lines (365d)** that are generic. `medicine_master.generic_branded ∈ {'Generic','Branded'}`. Anti-noise guard: need **≥5 delivered lines**, else the ratio is nulled (kills 1/1=1.0 artifacts).

```sql
WITH delivered AS (
  SELECT order_id, customer_id
  FROM tmmumpsdb.order_details
  WHERE organisation_id = 1 AND orderstatus = 55
    AND created_on >= DATEADD(day,-365,CURRENT_DATE)
),
gen AS (
  SELECT d.customer_id,
         SUM(CASE WHEN mm.generic_branded = 'Generic' THEN 1 ELSE 0 END) AS generic_lines_365d,
         COUNT(*)                                                        AS delivered_lines_365d
  FROM delivered d
  JOIN tmmumpsdb.final_substitute_product fsp ON fsp.order_id = d.order_id
  JOIN tmmumpsdb.medicine_master mm ON LOWER(mm.product_code) = LOWER(fsp.product_code)
  WHERE mm.generic_branded IS NOT NULL
  GROUP BY d.customer_id
)
SELECT customer_id, generic_lines_365d, delivered_lines_365d,
       generic_lines_365d::float / delivered_lines_365d AS generic_share,
       CASE
         WHEN generic_lines_365d::float/delivered_lines_365d >= 0.50 THEN 'GENERIC CHAMPION (L3, ≥50%)'
         WHEN generic_lines_365d::float/delivered_lines_365d >= 0.30 THEN 'GENERIC ADOPTER  (S1, ≥30%)'
         WHEN generic_lines_365d::float/delivered_lines_365d <= 0.10 THEN 'BRANDED LOYAL    (S2, ≤10%)'
         ELSE 'MIXED'
       END AS generic_tier
FROM gen
WHERE delivered_lines_365d >= 5            -- shared min-denominator guard (below this → UNKNOWN, drop)
ORDER BY generic_share DESC;
```

- **Generic Champion** = `generic_share ≥ 0.50` (`L3`). **Adopter** = `≥ 0.30` (`S1`, drives Golden Geese). **Branded-loyal / rejector** = `≤ 0.10` (`S2`). `<5` delivered lines → **UNKNOWN**, never tiered.
- These floors are PROVISIONAL — finalize from your live `generic_share` distribution (custs with `delivered_lines_365d ≥ 5`) before a real cut.

### ⚠️ Substitution ≠ generic buyer (the whole reason for the F1 pivot)

**Substitution is a mechanism** (a branded→generic *switch event we caused*). **Generic-buying is an outcome** (what actually shipped, regardless of how). They overlap but neither contains the other — and the margin goal only cares about the outcome, which is why the lever moved to `generic_share`.

| | **Person A — converted on doctor/HA call** | **Person B — default generic buyer** |
|---|---|---|
| What he does | searches *branded* "Shelcal 500", adds it | searches the molecule "Atorvastatin" / picks the generic directly |
| Checkout | offered generic sub → **declines** (`cx_confirm.status_id=62`, `cx_accepted_subs=0`) | **no sub offered** — he already picked generic (SNO: `reason_id IS NULL AND subs_product_code=product_code`) |
| Conversion | HA/doctor call → **accepts** (`dr_confirm.status_id=61`) | none needed |
| Delivered line | generic ✓ | generic ✓ |
| `subs_accept_rate` sees him | **yes** — in the offered/accepted funnel | **no** — SNO, never in the denominator |
| `generic_share` sees him | **yes** (generic line) | **yes** (generic line) |
| Persona bridge | **Silver** (declined@checkout, HA-converted) | **⭕ N/A** (no sub offered) |
| Cost to us | HA/doctor call (CPO ₹25/₹20) | **zero** — no nudge, no call |

**Punchline:** the old `subs_accept_rate` axis was *blind to Person B* — a pure-margin customer needing zero nudge and zero call cost — because he never triggered a substitution. `generic_share` catches **both**. Person B is arguably the *better* customer (same generic margin, no CPO). Substitution is a *lever we pull*; generic-buying is the *result we want* — sometimes we cause it, sometimes the customer arrives already aligned.

**Stage precision:** `subs_accept_rate` reads differently by FSP stage — `final_substitute_product_cx_confirm` = the self-serve *checkout* decision (Person A reads as a **decline** here); `final_substitute_product` = the *final delivered* line post-HA/doctor (Person A reads as an **accept**). §4 below uses `_cx_confirm` (checkout intent = the Gold signal); DCOE's production feature uses the final table. Same customer, opposite reading — choose the stage on purpose.

---

## 3. Coupon dependency (`coupon_order_ratio_180d`)

**Logic.** Share of a customer's valid orders (180d) that carried a coupon. `offer_id > 0` = coupon order.

```sql
WITH valid AS (
  SELECT customer_id, order_id, COALESCE(offer_id,0) AS offer_id,
         COALESCE(discount_applied,0) AS discount_applied, order_value
  FROM tmmumpsdb.order_details
  WHERE organisation_id = 1
    AND orderstatus NOT IN (49,312,174,1,2,3,4,58,274,344,668)
    AND created_on >= DATEADD(day,-180,CURRENT_DATE)
)
SELECT customer_id,
       COUNT(DISTINCT order_id)                                              AS orders_180d,
       COUNT(DISTINCT CASE WHEN offer_id>0 THEN order_id END)                AS coupon_orders_180d,
       COUNT(DISTINCT CASE WHEN offer_id>0 THEN order_id END)::float
         / NULLIF(COUNT(DISTINCT order_id),0)                                AS coupon_order_ratio_180d,
       AVG(CASE WHEN offer_id>0 AND order_value>0
                THEN discount_applied::float/order_value END)                AS avg_discount_depth,
       CASE
         WHEN COUNT(DISTINCT CASE WHEN offer_id>0 THEN order_id END)=0 THEN 'NC (no coupon)'
         WHEN COUNT(DISTINCT CASE WHEN offer_id>0 THEN order_id END)::float/NULLIF(COUNT(DISTINCT order_id),0) < 0.30 THEN 'LD (low)'
         WHEN COUNT(DISTINCT CASE WHEN offer_id>0 THEN order_id END)::float/NULLIF(COUNT(DISTINCT order_id),0) < 0.70 THEN 'MD (medium)'
         WHEN COUNT(DISTINCT CASE WHEN offer_id>0 THEN order_id END)::float/NULLIF(COUNT(DISTINCT order_id),0) < 1.00 THEN 'HD (HIGH — dependent)'
         ELSE 'AC (always coupon)'
       END AS coupon_bucket
FROM valid GROUP BY customer_id;
```

- **Coupon-dependent (DCOE V3 lever)** = `coupon_order_ratio_180d ≥ 0.70` (HD + AC). This is the ~44k cohort where offers actually move the needle — target coupons here, wean the rest.
- **Full-price loyal (V4)** = ratio `≤ 0.20` with `≥3` orders — never discount them.
- **True burn ≠ dependency.** For rupee burn per order, `discount_applied` (instant leg) **undercounts** — add the cashback leg: `+ SUM(wallet_money.cash WHERE type=264 (TM_CASHBACK) AND order_id=<order>)` (wallet_money is MySQL-only, DB 2). Dependency uses order counts (above); burn uses this two-leg sum.

---

## 4. Substitution propensity (`subs_accept_rate` — secondary signal)

**Logic.** Item-level: of the sub *candidates shown at checkout*, what share did the customer accept. On `final_substitute_product_cx_confirm.status_id`: **61 = accepted**, **62 = declined** (medicine_status enum). 180d window.

```sql
WITH valid AS (
  SELECT customer_id, order_id
  FROM tmmumpsdb.order_details
  WHERE organisation_id = 1
    AND orderstatus NOT IN (49,312,174,1,2,3,4,58,274,344,668)
    AND created_on >= DATEADD(day,-180,CURRENT_DATE)
)
SELECT v.customer_id,
       SUM(CASE WHEN fsp.status_id=61 THEN 1 ELSE 0 END)                     AS subs_accepted,
       SUM(CASE WHEN fsp.status_id IN (61,62) THEN 1 ELSE 0 END)            AS subs_offered,
       SUM(CASE WHEN fsp.status_id=61 THEN 1 ELSE 0 END)::float
         / NULLIF(SUM(CASE WHEN fsp.status_id IN (61,62) THEN 1 ELSE 0 END),0) AS subs_accept_rate,
       CASE
         WHEN SUM(CASE WHEN fsp.status_id IN (61,62) THEN 1 ELSE 0 END)=0 THEN 'SNO (never offered)'
         WHEN SUM(CASE WHEN fsp.status_id=61 THEN 1 ELSE 0 END)::float
              / NULLIF(SUM(CASE WHEN fsp.status_id IN (61,62) THEN 1 ELSE 0 END),0) > 0.70 THEN 'SA (advocate)'
         WHEN SUM(CASE WHEN fsp.status_id=61 THEN 1 ELSE 0 END)::float
              / NULLIF(SUM(CASE WHEN fsp.status_id IN (61,62) THEN 1 ELSE 0 END),0) >= 0.30 THEN 'SW (willing)'
         ELSE 'SR (resistant)'
       END AS subs_bucket
FROM valid v
JOIN tmmumpsdb.final_substitute_product_cx_confirm fsp ON fsp.order_id = v.order_id
GROUP BY v.customer_id;
```

- `SA` >0.70 · `SW` 0.30–0.70 · `SR` <0.30 · `SNO` never offered.
- **Remember the F1 pivot:** for a *margin* cohort use **generic_share (§2)**, not this. This axis is the mechanism/persona view. It also feeds the **Gold/Silver/Bronze** persona bridge (Gold = accepted at checkout `cx_accepted_subs=1 & cx_confirm 61`; Silver = HA-converted `dr_confirm 61`; Bronze = rejected even after HA `dr_confirm reason_id=9`).

---

## 5. Composite cohorts (assemble the axes)

Join the four per-customer feature tables (+ LTV percentile + recency) and AND the buckets:

| Cohort | Definition | Play |
|---|---|---|
| **Golden Geese** | `CM++` ∧ LTV top-decile ∧ generic `S1`(≥0.30) ∧ ordered ≤30d | Protect. Minimal spend, organic only. No coupon. |
| **Generic Champions** | `generic_share ≥ 0.50` | Margin heroes — retain, cross-sell, barely coupon. |
| **Coupon Addicts** | `HD/AC` ∧ `CM-` ∧ ordered ≤30d | Wean off coupons; test without. |
| **Margin Bleeders** | `CM--` ∧ `HD` ∧ active | Cut spend, stop couponing, accept churn. |
| **Lapsed HV Subs-Lovers** | LTV top-tier ∧ `SA` ∧ 31–60d lapsed | Worth a reactivation coupon. |

**Supporting feature SQL** (fold into the joins as needed):
- **LTV percentile** = `PERCENT_RANK() OVER (ORDER BY SUM(cm_net_delivered))` — or `SUM(final_calculated_amount.final_amount::numeric/1e6)` per customer if you want gross LTV. Top decile = `HV`.
- **Recency / lifecycle** = `DATEDIFF(day, MAX(created_on), CURRENT_DATE)` over valid orders → `ACT` ≤30 · `RISK` 31–60 · `LAPS` 61–90 · `CHURN` >90 · `NEW` = first order in 30d.

---

## 6. Metabase execution notes (for whoever runs this)

- **Run it** in Metabase's native SQL editor on **DB 170**, or via the Metabase MCP `execute_sql` path. (Some MCP `execute_query`/native endpoints reject raw SQL — use the SQL question / `execute_sql`.)
- **Everything is derivable from tmprod.** No DCOE RDS, no EC2, no `app.*` / `dm_dcoe.*` tables required.
- **Parity caveat (documented, not silent):** these queries window on `created_on` + `orderstatus=55`. DCOE's exact feature-builder windows on `delivery_date_tracker.actual_delivery_date` (true delivered date). For strict parity, join `append_only_delivery_date_tracker` (DB 170) and filter on `actual_delivery_date` instead of `created_on`. The margin proxy also omits zone-shipping / CPO / promo-comm / return-logistics — add them per §1 for exact cm_net.
- **Recalibrate percentiles per pull.** P90 for "high" and the generic/coupon floors drift; re-cut on your own data before a campaign.
- **See also:** `tm-chotu-customer` (persona bridge, retention), `tm-chotu-definitions` (FTC/CM/GMV terms), `tm-chotu-joins` (join-key reference), `tm-chotu-tables-enums` (status enums: 55 delivered, 61/62 sub accept/decline).
