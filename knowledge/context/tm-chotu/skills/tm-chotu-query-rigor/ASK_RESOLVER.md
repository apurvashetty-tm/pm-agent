# Ask Resolver — phrasing → canonical metric → locked answer

People ask the same thing a dozen different ways. This file collapses the wording, so chotu stops re-litigating vocabulary and starts answering.

**This file resolves WORDING. It does not resolve INTENT.** Where two phrasings genuinely mean two different numbers, that is recorded as an *ambiguity killer* below and chotu still says which one it used.

---

## The fast path (behaviour contract — LOCKED 2026-08-19)

When an ask resolves to a canonical metric in the table below, chotu **does not run the Intent-First branch dialogue.** It answers:

1. **The number**, computed on the metric's **DEFAULT branch**.
2. **One line naming the branch** — "PLACED, net of dead-order set", "delivered/GMV", "CM1, product gross margin".
3. **The alternate**, in the same line or the next, with its value when it is cheap to get: *"delivered/GMV for the same day = ₹3.87 Cr"*. If the alternate is expensive, name it without a number.
4. **Back-by-proof stays mandatory** — exact SQL, a capped raw sample, and the aggregate breakdown. A hard-locked metric is not a bare number.
5. Any **mandatory caveat** on that metric still fires (COGS/margin FIFO disclosure, invoice lag, HM/LM gate).

**Escape hatches — the full Intent-First gate still applies when:**
- the ask does **not** resolve to a row below;
- the ask spans an **ambiguity killer** and the user's wording does not pick a side;
- the user asks for something **derived** off a metric (a rate, a ratio, a cohort cut, a trend) rather than the metric itself;
- the ask is **gated** (HM/LM) and the gate is shut — behave exactly as the gate rule says, silently.

**Never** silently pick a branch. The one-line branch declaration is what replaces the question — dropping it is the failure this whole file is meant to prevent.

---

## Ambiguity killers — where words hide two different numbers

These are the six that actually cost us. Chotu names the side it took, every time.

| Words people use interchangeably | But they are NOT the same |
|---|---|
| revenue / sales / GMV / topline | **placed** (booked, all live orders) vs **delivered** (GMV, status 55). Different denominators, different numbers, both legitimate |
| margin / profit / CM | **CM1** = product gross (revenue ex-GST − COGS) vs **cm_net** = fully loaded (shipping, COD, returns, packaging, promo, coupon, CPO). cm_net is nearer CM2/CM3 — never call it CM1 |
| cost / COGS | **same cost basis** — the difference is scope: COGS = that cost on a **sold** line; cost = that cost on **held stock**. See the COST/COGS lock below |
| price | **MRP** (printed on pack) vs **selling price** (what the customer pays) vs **PTS/PTR** (trade prices). Three different numbers, and PTS is access-restricted |
| inventory / stock / holding | **quantity** vs **₹ value**. "How much stock" is nearly always qty; "holding" is nearly always value |
| ROAS / CAC | three ROAS variants and two CAC variants are all locked and all different — never answer without naming which |

---

## COST ≡ COGS — LOCKED (user-stated 2026-08-19)

**They are the same cost basis. Only the scope differs.**

| Term | Scope | Applied to |
|---|---|---|
| **COGS** | goods that **sold** | invoiced order lines |
| **COST** | goods we **hold** | on-hand inventory |

So there is one unit-cost concept in the business, asked about at two different stages of the same goods. Chotu must never present them as rival definitions — it states the scope and moves on.

- COGS on an order = `SUM(nsib.rate * nsib.quantity) WHERE active = 1`, join `fsp.final_subs_id = nsib.fsp_id`. Full spec + boundary in `tm-chotu-definitions` → COGS & CM1.
- Cost of held stock = the same per-unit cost applied to on-hand quantity, derived as a **90d NSIB product × batch weighted average** — `SUM(rate*quantity)/SUM(quantity)`, `active=1`, `rate>0`. **No table holds cost against held inventory**, so this is always DERIVED; say so. The only alternative basis is `medicine_warehouse_master.pts` (what the system shows now, off the latest inward) — and `mwm` has **no `modified_on`**, so that value cannot be aged. Full model in `tm-chotu-inventory`.
- **🔴 The FIFO disclosure fires on both.** NSIB `rate` = latest batch rate in that WH at invoice-creation, **not** NetSuite FIFO COGS — it will not reconcile to NetSuite or the P&L. Reliable only for orders from **2022-11-17** (NSIB-era boundary).

---

## Resolution table

Legend: **LOCKED** = ship as fact · ⚠️ **PROPOSED** = drafted, awaiting Mangesh's confirmation, say so · 🔒 = gated · ❔ = knowledge-gap, never assert.

### Money

| They say | Canonical | DEFAULT branch | Also name | Authority |
|---|---|---|---|---|
| revenue · sales · topline · turnover · business · "how much did we sell" · booking · collections | **REVENUE** | **SLICE** (per METRIC_CATALOG — a chotu re-slice, not a locked fact; say so) — placed booked, customer payable: `SUM(fca.final_amount)`, `organisation_id=1`, minus the full dead-order set | delivered/GMV | METRIC_CATALOG → Revenue (a) |
| GMV · delivered revenue · board revenue · net sales | **GMV** | **LOCKED** — `SUM(fca.final_amount) WHERE orderstatus = 55` | placed revenue | Revenue (c) |
| net revenue · revenue after returns | **NET REVENUE** | **LOCKED** — GMV − returns − refunds | GMV gross | Revenue (d) |
| AOV · average order value · basket size | **AOV** | **LOCKED** — GMV ÷ delivered-order count | placed-basis AOV | definitions |
| cart value · order value | **CART VALUE** | **LOCKED** — `order_details.order_value`, cart **pre-bill**. ⚠️ never report as revenue | actual billed = `final_amount` | definitions |
| invoiced amount · billed | **INVOICED** | **LOCKED** — `rate × quantity` on `net_suite_invoice_batch`, `active=1` (`amount` is NULL ≥2024) | — | tables-enums |
| savings · customer savings · discount given | **SAVINGS** | **LOCKED** — `final_calculated_amount.saving_value` | discount stack detail | definitions |

### Margin & cost

| They say | Canonical | DEFAULT branch | Also name | Authority |
|---|---|---|---|---|
| margin · profit · GM · gross margin · "are we making money" | **MARGIN** | **LOCKED** — **CM1**, product gross = revenue ex-GST − COGS. 🔴 FIFO disclosure mandatory | cm_net (fully loaded) if the ask is customer/cohort-level | METRIC_CATALOG → Margin (c) |
| contribution margin · CM · customer margin · cohort margin | **CM_NET** | **LOCKED** — `cm_net` fully loaded. Never label it CM1 | CM1 for product-level | Margin (a) |
| cogs · cost of goods · purchase cost · "what we paid" · vendor cost | **COGS** | **LOCKED** — `SUM(nsib.rate*nsib.quantity)`, `active=1`. 🔴 FIFO disclosure | — | definitions |
| cost · cost price · landed cost · "what it costs us" | **COST** | **LOCKED (basis)** — same basis as COGS; scope = held stock. ❔ on-hand unit-cost source is a gap | COGS if they meant sold goods | `tm-chotu-definitions` → COST ≡ COGS |
| item margin · route-A | **ITEM MARGIN** | ❔ **EXTERNAL-GAP** — NetSuite terminology, not a loadable skill. Flag the gap, never assert | CM1 | Margin (b) |
| high margin / low margin products · which products make money | **HM/LM** | 🔒 **GATED** — leadership + margin-health goal only. Gate shut ⇒ close **silently**, fall back to CM1 | — | query-rigor gate rule |

### Price

| They say | Canonical | DEFAULT branch | Also name | Authority |
|---|---|---|---|---|
| price · selling price · SP · rate · "what do we charge" · customer price | **SELLING PRICE** | **LOCKED** — customer-facing per-unit price (`final_substitute_product.selling_price`; ex-GST via `medicine_master.gst` when comparing to COGS) | MRP | definitions / CM1 spec |
| MRP · printed price · pack price | **MRP** | **LOCKED** — per-WH `medicine_warehouse_master.mrp`; **batch-level locked MRP** = `BATCH_MASTER_V.MRP_REFORMED` on latest version with `STATUS ∈ {LOCKED, VERIFICATION_NOT_REQUIRED}` | which of the two, per use | tm-chotu-inventory |
| PTS · PTR · trade price · stockist price | **TRADE PRICE** | **LOCKED but 🔴 RESTRICTED** — the 5 PTS columns on `inward_product_details` are excluded from the `tm_analytics` grant. `SELECT *` fails by design. Do not route around it | — | pii-register / redshift groups |
| TS · true saving | **TS** | **LOCKED** — see the TS formula | — | tm-chotu-modules |

### Inventory

| They say | Canonical | DEFAULT branch | Also name | Authority |
|---|---|---|---|---|
| inventory · stock · "how much stock do we have" · on hand | **LIVE QTY** | **LOCKED** — DB 180 `INVENTORY_SCHEMA.product_inventory_data`. 🔴 **never SUM across inventory tables**. 🛑 **FAST PATH DOES NOT APPLY to Faridabad** — ⚠️ CONTESTED [subject: Faridabad]: DB 180 vs DB 432 is unresolved. Stop and ask; do not answer from this row | ₹ holding value | METRIC_CATALOG → Inventory (a) |
| inventory holding · stock value · closing stock · holding · inventory valuation | **HOLDING VALUE** | **LOCKED** — qty × **90d NSIB product×batch weighted-avg cost**. Always **DERIVED, never read** (no cost-of-held-inventory table exists). Ships as **sellable / non-pickable / total** split. Batch grain ⇒ `wp_bin_product_batch_mapping` (roll bins up first); product grain ⇒ DB 180 | `mwm.pts` basis (latest inward, un-ageable) | `tm-chotu-inventory` → Inventory VALUATION |
| stockout · OOS · availability | **STOCKOUT** | **LOCKED** — layered, no single definition: onhand qty vs `mwm.availability` flag vs `available_qty` vs `is_searchable`. Name the layer | the other layers | tm-chotu-inventory |
| backorder | **BACKORDER** | **LOCKED** — `package_details_tracking.is_back_order`, set at WH assignment | — | tm-chotu-inventory |

### Customer

| They say | Canonical | DEFAULT branch | Also name | Authority |
|---|---|---|---|---|
| new customer · first order · FTC | **FTC** | **LOCKED** — `is_ftc_order = 1`. ⚠️ FTC ≠ FOP | FOP | definitions |
| FOP · first order placed | **FOP** | **LOCKED** — placed-basis first order | FTC (delivered-basis) | definitions |
| repeat · repeater · returning | **REPEATER** | **LOCKED** | reactivation | definitions |
| retention · M1 · M3 · M6 | **RETENTION** | **LOCKED** — M1 = order-1 **and** order-2 within 30 days | M3 / M6 / quarterly | definitions |
| LTV · lifetime value | **LTV** | **LOCKED** — ⚠️ `cx_lifetime_metrics` is partial (73% coverage, 7d lag) — reference only, disclose it | cm_net-based | tm-chotu-customer |
| order rank · which order number | **ORDER RANK** | **LOCKED** — compute on the fly with `ROW_NUMBER()`. 🔴 `customer_order_rank` is broken (13mo stale, 3% coverage) | — | tm-chotu-customer |
| Gold / Silver / Bronze · persona tier | **PERSONA TIER** | **LOCKED** | DCOE 5-axis cohorts | definitions |
| cohorts · HV/CM++/SA/ACT · Golden Geese | **DCOE COHORTS** | **LOCKED** — derivable on Metabase alone. 🛑 **FAST PATH DOES NOT APPLY to Golden Geese** — ⚠️ CONTESTED [subject: Golden Geese]: the 5th axis is `SA` in `tm-chotu-definitions` vs `generic_share ≥30%` in `tm-chotu-customer`/`tm-chotu-dcoe-cohorts`. Different populations. Stop and ask which | — | tm-chotu-dcoe-cohorts |

### Marketing

| They say | Canonical | DEFAULT branch | Also name | Authority |
|---|---|---|---|---|
| ROAS · return on ad spend | **ROAS** | **LOCKED** — three variants (primary / all_conv / true). 🔴 Never answer without naming which; default **primary** | the other two | definitions |
| CAC · acquisition cost | **CAC** | **LOCKED** — two variants (paid / blended). Default **paid** | blended | definitions |
| attribution | **ATTRIBUTION** | **LOCKED** — `orders_campaign_attribution`; window per definitions | — | tm-chotu-joins |

### Operations

| They say | Canonical | DEFAULT branch | Also name | Authority |
|---|---|---|---|---|
| TAT · delivery time · how long | **TAT** | **LOCKED** — `delivery_date_tracker`; promised vs actual | dispatch / doctor / WH-processing pairs | tm-chotu-tat |
| OTIF · on time | **OTIF** | **LOCKED** — `actual_delivery_date <= promised_delivery_date` | — | tm-chotu-tat |
| PDD · promised date | **PDD** | **LOCKED** — `promised_*` set once at placement, never changes | `current_*` | tm-chotu-tat |
| in transit · dispatched | **IN TRANSIT** | **LOCKED** — `orderstatus = 60`; ⚠️ sticky, bound by `created_on` | — | tm-chotu-tat |
| AWB · waybill · tracking number | **AWB** | **LOCKED** — `net_suite_shipment_details.awb_no`, **DB 630 only** | — | tm-chotu-tat |
| RTO | **RTO** | **LOCKED** — chain across 6 serial_ids; 284 DELIVERY FAILED is **real billed**, not dead | customer return chain | tm-chotu-tat |
| cancelled · "net of cancels" | **DEAD-ORDER SET** | **LOCKED** — `NOT IN (49, 274, 668, 57, 232, 174, 312)`, never just 57. ⚠️ `400` removed — it is a **WORK FLOW** code, not ORDER STATUS (0 rows); measured, only 49/312/174/57 actually occur as current status | — | definitions |

### Substitution

| They say | Canonical | DEFAULT branch | Also name | Authority |
|---|---|---|---|---|
| substitution rate · sub acceptance | **SUB ACCEPTANCE RATE** | **LOCKED** — `subs_accept_rate` on FSP confirm tables | generic_share (the outcome) | tm-chotu-dcoe-cohorts |
| generic share · generic adoption | **GENERIC SHARE** | **LOCKED** — off `medicine_master.generic_branded`, delivered lines | sub acceptance (the mechanism) | tm-chotu-dcoe-cohorts |
| wrong sub · mismatch | **MISMATCH** | **LOCKED** — invoice vs its own original via the `fsp_id` chain, compare on `sub_group` + `drug_type`. ⚠️ invoice-lag lower bound | FORM_CHANGE / consent misfire | tm-chotu-joins |

---

## Maintaining this file

- A new alias goes in the moment someone actually says it — not speculatively.
- A new **canonical** metric needs a locked definition in an owning section skill first. This file **cites**, it never defines — every Authority cell must name another file, never this one. If it starts defining, it will drift from the skill that owns it.
- Anything marked ⚠️ PROPOSED or ❔ gap must be resolved with Mangesh before it can be quoted as fact.
