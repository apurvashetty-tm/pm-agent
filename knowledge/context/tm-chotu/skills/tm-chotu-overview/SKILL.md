---
name: tm-chotu-overview
description: Truemeds company overview — what the company does, business model, channels, headline metrics. Load when user asks "what is Truemeds", "how big is Truemeds", "what's our GMV / MAU / DAU / AOV", "what's our business model", "how many orders / day", or any question needing high-level company context.
---

# Truemeds — overview

## What Truemeds is

Truemeds is an India online pharmacy specialising in **generic** medicines (GX) at significant discount vs MRP. Founded **2019**. HQ Mumbai; second office Bangalore (opened Dec 2025) housing mostly engineering + product. Operates pan-India delivery with own + partner warehouses. Primary moat = generic substitution at scale + chronic-customer retention.

## Business model — the levers

| Lever | What it means | Why it matters |
|---|---|---|
| **GX substitution** | Doctor swaps branded Rx for generic equivalent (same molecule + dose) | Savings vary by molecule — majority 50%+ vs MRP, captures margin |
| **Chronic capture** | Customers on long-term meds (BP, diabetes, thyroid, cardiac) reorder every 30 days | Predictable revenue + retention compounding |
| **Direct procurement** | Buy from manufacturers, bypass distributor margin | Margin |
| **Tech-led ops** | Centralised pharmacist + doctor review per order | Trust + compliance |
| **Multi-channel acquisition** | Google Ads (UAC + Search), Meta, ASO, web SEO, affiliates, BTL | Funnel breadth |

## Channels

- **App** (Android dominant 95%, iOS 5%) — primary channel, chronic-heavy
- **Web** — discovery-focused (acute + first-time exploration), paid-search-heavy, higher fraud surface
- **B2B / Affiliate** — fraction of orders, UTM source prefix `AFF`

## Headline metrics

Probe sources: probab-subs-persona project + DB 170 probes (8–14 May 2026 window).

| Metric | Value | How calculated |
|---|---|---|
| Catalogue size | ~2 lakh products (`medicine_master` 231,012 rows) | probab-subs-persona |
| Products with generic substitutes | ~35% of catalogue | probab-subs-persona |
| MAU | ~4.2 M | probab-subs-persona |
| DAU (avg) | ~185 k | probab-subs-persona |
| Platform split | Android 95% / iOS 5% / Web <1% | probab-subs-persona |
| Fulfilment Centres | 5 — Bangalore (id 17), Kolkata (22), Mumbai (20), Delhi (19), Lucknow (37). Serve ~26k pincodes | probab-subs-persona |
| Orders placed / day | ~23–25k | `order_details` row count excluding rejects: `orderstatus NOT IN (49 INCOMPLETE, 312 SCRAPPED, 174 DISCARD, 1 NEW, 58 PAYMENT_PENDING)` |
| Orders delivered / day (steady-state) | ~19–20k | `orderstatus = 55 (ORDER DELIVERED)` |
| Deliver rate (mature cohort) | ~80–82% | delivered / placed-excl-rejects, May 8–9 fully cured |
| AOV (invoiced) | ~₹1,200–1,240 | `final_calculated_amount.final_amount` on delivered orders |
| GMV delivered (invoiced) / day | ~₹2.3–2.4 cr | `SUM(fca.final_amount) WHERE orderstatus = 55` |
| Savings vs MRP / day | ~₹1.2 cr (~50% of GMV) | `SUM(fca.saving_value)` |
| Active customers (any order, 90d) | ~20.9 lakh | `order_details` distinct `customer_id` (90d) |
| Customers with delivered order (90d) | ~9.06 lakh | `orderstatus = 55` distinct `customer_id` (90d) |
| **Monthly GMV (directional)** | **~₹76 cr** | Finance close. Probe-extrapolation gives ~₹70 cr from 7-day window — within tolerance. Tag probe-derived numbers as directional unless cross-checked with finance. |

**Funnel shape** (single day, May 9 mature cohort):

```
60k rows in order_details
   ↓
25k orders placed (cleared INCOMPLETE / SCRAPPED / DISCARD reject set)
   ↓
~20k delivered (80% of placed)
```

## How to count orders by lifecycle stage

- **"Orders placed"** → use `order_details` snapshot with reject-status exclusion (above approach).
- **All other lifecycle stages** (cancelled, processed, doctor-confirmed, HA-confirmed, dispatched, returned, etc.) → query `tmmumpsdb.order_status` **transition history table**, NOT `order_details.orderstatus`.

Why: `order_details.orderstatus` is the *current* state. An order delivered today no longer carries the "doctor-confirmed" status it once had. The transition log `order_status` (cols: `order_id`, `order_status_id`, `modified_on`) records every state hop — that's the source of truth for stage-level funnel counts.

```sql
-- "Orders cancelled yesterday" (anywhere in lifecycle)
SELECT COUNT(DISTINCT order_id)
FROM tmmumpsdb.order_status
WHERE order_status_id = 57         -- ORDER CANCELED
  AND DATE(modified_on) = CURRENT_DATE - 1;
```

## Where things actually live (not in `order_details`)

| Concept | Lives in | Notes |
|---|---|---|
| Backorder flag | `tmmumpsdb.package_details_tracking` (NOT `order_details`) | Triggers Procurement & Inwarding flow |
| TM Wallet (cash balance) | Dedicated `wallet` table (NOT `order_details`) | Customer-level coin balance |
| Per-order TM cash / credit / cashback / discount | `final_calculated_amount` columns | Per-order deductions/additions |
| Invoiced final amount (for GMV) | `final_calculated_amount.final_amount` | NOT `order_details.order_value` (cart pre-bill) |

## The five "what changes if Truemeds wins"

1. Generic-first becomes default for chronic households
2. Doctor-led substitution becomes the trust anchor (not the discount)
3. Chronic-engine compounding makes CAC < LTV by month 3 of cohort
4. Tier-2/3 reach via Hindi-first UX
5. Diagnostics + reminders tie in — diagnostics launched recently, picking up well
