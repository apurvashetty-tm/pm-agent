---
name: tm-chotu-customer
description: Truemeds customer model — where customer data lives (Mixpanel + Main DB + DCOE), DCOE 5-axis cohorts (HV/CM++/SA/ACT, Golden Geese), customer profile, rank logic, FTC definition, retention shape (M1/M3/M6/quarterly). Load when user asks about "our customers", "customer cohorts", "FTC / Gold/Silver/Bronze", "retention", "LTV", "chronic vs acute customers", "personas", or any question about WHO buys from Truemeds.
---

# Customer

## Where customer data lives

| Layer | Source | Status | Use |
|---|---|---|---|
| **Behavioural** | Mixpanel Production Env 2900163 | ✅ Live, primary | App + web events (view / search / cart / order) |
| **Profile** | `tmmumpsdb.customer_details` | ✅ Live, primary | Identity, mobile, device, signup |
| **Order rank** | `tmmumpsdb.customer_order_rank` (column `cust_order_rank`) | 🔴 **DO NOT USE** — 13 months stale, ~3% coverage. Refresh job appears broken/abandoned. Compute rank on-the-fly: `ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_on)` on `order_details` |
| **Lifetime snapshot per order** | `tmmumpsdb.cx_lifetime_metrics` | ⚠️ **PARTIAL + LAGS** — 73% coverage, 7 days stale. Schema is per-order rolling (`lifetime_op_count`, `lifetime_od_count`, `lifetime_op_revenue`, `lifetime_od_revenue`). Use as reference only; for LTV math compute via `SUM(fca.final_amount) OVER (PARTITION BY customer_id ORDER BY created_on)` |
| **DCOE cohorts (5-axis)** | DCOE pipeline `app.cohort_defs` etc. (separate RDS) | 🟡 **Pipeline live, not yet powering production decisioning.** Will be default cohort lens post go-live |
| **Chronic / acute split** | `chronicity_otc_analytics`, `chronicity_rx_analytics`, `order_chronic_map_*` | ⚠️ **Validate before use** — may be stale. **Preferred until verified: derive chronic via Mixpanel + product order history + product-level chronic tagging in catalog** |

## DCOE 5-dimension cohort model (canonical — when live)

Customers scored on 5 axes; final cohort = combination of bucket labels.

| Dimension | Buckets | Source |
|---|---|---|
| **Value (LTV)** | `HV` (top 20%) / `MV` (20–60th) / `LV` (bottom 40%) / `DM` (no order in 90d) | `order_details` + `final_calculated_amount` |
| **CM1 (Contribution Margin)** | `CM++` (top 10%) / `CM+` (>0) / `CM-` (−3 to 0) / `CM--` (<−3) | FSP + `net_suite_invoice_batch` |
| **Lifecycle** | `NEW` (FTC in 30d) / `ACT` (ordered <30d) / `RISK` (31–60d) / `LAPS` (61–90d) / `CHURN` (>90d) | `order_details`, `order_status` |
| **Coupon dependency** | `NC` (0%) / `LD` (<30%) / `MD` (30–70%) / `HD` (>70%) / `AC` (100%) | `order_details.offer_id`, `discount_applied` |
| **Generic adoption** (was "subs propensity") | `L3` champion (≥50% generic) / `S1` adopter (≥30%) / `S2` branded-loyal (≤10%) — guard ≥5 delivered lines | `final_substitute_product` × `medicine_master.generic_branded` |

> ⚠️ **F1 pivot (2026-06-09):** the 5th axis moved off `subs_accept_rate` (the substitution *mechanism*) onto **`generic_share`** (the *goal* = generic adoption = margin). `subs_accept_rate` (`SA`/`SW`/`SR`/`SNO`, from `final_substitute_product_cx_confirm.status_id`) is kept only as a **secondary explanatory signal** + the Gold/Silver/Bronze bridge below.

**Golden Geese** = `HV ∩ CM++ ∩ S1(generic ≥30%) ∩ ACT` — protect cohort. Minimal spend, organic only. Used in campaign mapper for "variant count = 1" decisions (no exploration on proven winners).

> 🔧 **To DERIVE any of these axes from scratch on Metabase (no DCOE instance) — CM-high, Generic Champions, Coupon dependency, Substitution propensity — see the `tm-chotu-dcoe-cohorts` skill.** Full `cm_net` formula + ready-to-run DB 170 SQL for each.

## Persona tiers (TMEXP1 / probab-subs-persona) — used today

| Tier | Signal | Definition |
|---|---|---|
| 🥇 Gold | `cx_accepted_subs = 1 AND fsp_cx_confirm.status_id = 61` | Self-opts for sub at checkout — no HA needed |
| 🥈 Silver | `cx_accepted_subs = 0 AND fsp_dr_confirm.status_id = 61` | Declined at checkout, HA converted |
| 🥉 Bronze | `cx_accepted_subs = 0 AND fsp_dr_confirm.reason_id = 9` | Explicit reject even after HA push — churn candidate |
| ⭕ N/A | `fsp_cx_confirm.reason_id IS NULL AND subs_product_code = product_code` | No substitute was offered |

This tier mapping bridges into DCOE's Substitution-propensity axis (SA / SW / SR / SNO).

## Customer profile (typical)

- **Age** — 35–60 dominant, chronic-skewed
- **Geography** — pan-India. Tier-1 metros (Mumbai, Delhi, Bangalore, Pune, Hyderabad, Chennai, Kolkata) + **heavy influx of small tier-2 cities** following new MFC (Micro-Fulfilment Centre) launches
- **Device** — Android 95% / iOS 5% / Web <1% (probab-subs-persona)
- **MAU** ~4.2 M / **DAU** ~185 k
- **Language / Income / B2B-B2C split** — not captured anywhere in the data layer; do not promise these breakdowns

## Customer rank — what `customer_order_rank` would give (if it worked)

```
cust_order_rank = 1   →  FTC (first order)
cust_order_rank = 2   →  second order
cust_order_rank = n   →  nth order
```

Rank-based bucketing + DCOE 5-axis answer different questions:
- **Rank**: "where in customer's order sequence are we"
- **DCOE**: "what kind of customer right now (value × profit × lifecycle × coupon × subs)"

⚠️ `customer_order_rank` is broken (see Status table). Compute rank on-the-fly via window function.

## FTC definition

`order_details.is_ftc_order = 1` is **per-order**, not per-customer.

> `is_ftc_order = 1` stays true on **every** order placed by a customer **until at least one prior order has cleared doctor-confirmed-or-higher status (or actually delivered)**. Once any prior order clears that gate, the flag flips false on subsequent orders.

Implications:
- A customer can have multiple orders flagged `is_ftc_order = 1` simultaneously if none have reached the doctor-confirm gate yet (e.g. all cancelled before review)
- Use `is_ftc_order = 1` to count **first-attempt orders**, NOT unique FTC customers
- For unique FTC customers, derive on-the-fly:

```sql
WITH first_delivered AS (
  SELECT customer_id, MIN(created_on) AS first_delivered_on
  FROM tmmumpsdb.order_details
  WHERE orderstatus = 55
  GROUP BY customer_id
)
SELECT customer_id FROM first_delivered
WHERE first_delivered_on >= '<window_start>'
```

## Retention shape

- **M1** — order-1 → order-2 within **30 days** (primary KPI, DCOE thesis north star)
- **M3** — within 90 days
- **M6** — within 180 days
- **Quarterly retention** — order in quarter N → order in quarter N+1 (chronic strength signal)
- **Reactivation** — 60+ day dormant → reordered
