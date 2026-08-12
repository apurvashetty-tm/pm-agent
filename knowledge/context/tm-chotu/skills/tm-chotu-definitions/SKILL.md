---
name: tm-chotu-definitions
description: MOST IMPORTANT skill. Canonical locked definitions for 100+ Truemeds terms — FTC / FOP / M1-M3-M6 / GMV / AOV / MRP / PTS / TS / GX / Rx / OTC / chronic / acute / therapy / ROAS variants / CAC variants / Order Type 1/2/3 / Auto-confirm / Digitized / Confirmed / HA / RTO / Backorder / Sub Eligible / DCOE 5-axis / Gold-Silver-Bronze / Golden Geese / 4 lever families / FC vs MFC vs HUB / NetSuite / AWB / CSR / CMT / 3PL / JIT / PO / VRA / DND / OOS / OTIF / organisation_id + anti-patterns + status-code cheatsheet. Load on any "what does X mean", "define Y", "FTC vs FOP", "ROAS vs CAC", "what's TS", or ambiguous-term clarification.
---

# Definitions — LOCKED

These definitions are canonical. Anyone in any function should resolve ambiguity to these versions. Updates only via plugin upgrade after analytics team review.

## Customer lifecycle

| Term | Locked definition |
|---|---|
| **FTC** (First-Time Customer) | Customer whose first delivered order is in the window. Compute on-the-fly via `MIN(created_on) WHERE orderstatus = 55 GROUP BY customer_id`. **Do NOT use `customer_order_rank`** (broken) |
| **FOP** (First Order Placed) | Customer's first row in `order_details` regardless of delivery status. Includes incomplete/cancelled |
| **`is_ftc_order = 1`** (per-order flag) | True on every order placed by a customer **until at least one prior order has cleared doctor-confirmed-or-higher status (or actually delivered)**. Per-order, NOT per-customer. Use to count "first-attempt orders", not unique FTC customers |
| **M1 retention** | Customer placed order 1 AND order 2 within **30 days** of order 1. **Primary retention KPI, DCOE thesis north star** |
| **M3 retention** | Order 1 → order 2 within 90 days |
| **M6 retention** | Order 1 → order 2 within 180 days |
| **Quarterly retention** | Order in quarter N → order in quarter N+1 |
| **Reactivation** | Customer dormant 60+ days who placed an order. Derive on-the-fly via lag pattern on `order_details` |
| **Repeater** | Customer with `cust_order_rank >= 2` (after table fix) OR compute on-the-fly from `order_details` |

## Money / commerce

| Term | Locked definition |
|---|---|
| **GMV** (Gross Merchandise Value) | `SUM(final_calculated_amount.final_amount) WHERE order_details.orderstatus = 55 AND organisation_id = 1`. NEVER use `order_details.order_value` (cart pre-bill) |
| **AOV** (Average Order Value) | GMV / delivered-orders count |
| **Net revenue** | GMV minus returns minus refunds |
| **Customer savings** | `original_mrp − sub_selling_price` per line item. Visible in `final_calculated_amount.saving_value`. NOT the same as TS |
| **Invoiced amount** | `final_calculated_amount.final_amount` per order — billed to customer post-deductions |
| **Cart value** | `order_details.order_value` — pre-bill, no deductions. ~50% higher than invoiced |
| **MRP** | Maximum Retail Price (printed). Varies by warehouse in `medicine_warehouse_master.mrp` |
| **PTS** | Price To Stockist — cost to Truemeds. `medicine_warehouse_master.pts` |
| **PTR** | Price To Retailer |
| **TS** (TruemedsSavings) | Per-unit profit margin window = `maxSellingPrice − minSellingPrice`. **NOT customer savings.** High TS = high TM margin headroom |
| **Discount stack** | Per-order deductions in `final_calculated_amount`: `discount`, `tm_cash`, `tm_credit`, `tm_cashback`, `price_lock_disc`, `adjustment_amt`. Additions: `delivery_charge`, `packaging_charge`, `cash_handling_charge` |
| **Wallet types** | TM Cash / TM Credit / TM Cashback. Burned via `final_calculated_amount`. Balance lives in dedicated `wallet` table, NOT `order_details` |
| **Price Lock** | Customer-facing protection against MRP increases. Eligibility per `PRICE_LOCK_THRESHOLD_X` / `PRICE_LOCK_STAGE`. Captured as `price_lock_disc` |

## Product / catalogue

| Term | Locked definition |
|---|---|
| **GX** | Generic — same molecule + dose + form as branded Rx, ~50% cheaper. Catalogue flag: `medicine_master.generic_branded = 'Generic'` |
| **Rx** | Prescription-required SKU. Flag: `medicine_master.rx_required = 'Yes'` |
| **OTC** | Over-the-counter — no Rx. Mapped via `disease_product_mapping.type = 'HEALTHCARE'` + `otcvalue_master` |
| **Chronic (product)** | Repeating-need molecule (BP, diabetes, thyroid, cardiac). Catalogue flag: `medicine_master.acute_chronic = 140`. Master: `ACUTE_CHRONIC` |
| **Acute (product)** | One-off use (fever, cold, infection). Flag: `acute_chronic = 139` |
| **Chronic (customer)** | Customer with recurring chronic-tagged molecule. **Preferred derivation:** Mixpanel + product order history + product chronic tagging — NOT the legacy `chronicity_*` tables |
| **Therapy / drug category** | Primary clinical grouping. Derive via `disease_product_mapping → disease_category_master.category`, filter `priority = 'D1'` (158 categories total). Top: ANTIBIOTIC, ANALGESIC, ANTIDIABETIC, ANTIHYPERTENSIVE, ANTACID |

## Order lifecycle

| Term | Locked definition |
|---|---|
| **Order Type 1 (52 RX)** | Prescription-only order → **Pharmacist Type 1 queue** for digitization |
| **Order Type 2 (53 RX AND MEDICINES)** | Rx + meds → **Doctor directly** (skips Pharmacist) |
| **Order Type 3 (54 MEDICINES)** | Meds only, no Rx → **Doctor directly** |
| **Auto-confirm** | `workflow_status = 242 NO_DOCTOR_CALL`. Triggered when valid Rx already attached → bypasses doctor call |
| **Digitized** | Order has been verified + structured. `DRX_STATUS = 30 DIGITIZED` line-item; `orderstatus = 39 DIGITIZED` order-level |
| **Confirmed** | `orderstatus = 66 ORDER CONFIRMED` — past doctor/pharmacist review, ready for fulfilment |
| **HA call** | Health Advisor call — substitution explanation. Triggered when SUBSTITUTE is available post-confirm. orderstatus 595 HEALTH ADVISOR CALL ATTEMPTED. HA can add only OTC, not Rx |
| **Warehouse Assigned** | orderstatus 233 — routing decision (MFC vs FC) complete |
| **AWB Printed** | orderstatus 289 — Air Waybill sticker printed for 3PL pickup |
| **Dispatched** | orderstatus 60 — order handed to 3PL |
| **Delivered** | orderstatus 55 — customer received |
| **RTO** (Return To Origin) | Post-dispatch cancel chain: 60 → courier pickup → in transit → cancellation → 57 → RTO marked → RTO-IT (master 121) → RTD (master 124, back at WH) → reverse putaway → restock |
| **Backorder** | Flag in `package_details_tracking` (NOT `order_details`). Triggers Procurement & Inwarding flow |
| **Sub Eligible** | Output of substitution algo Step 6 — boolean per line item. Drives substitution suggestion path |
| **Sub Acceptance Rate** | `COUNT(cx_accepted_subs = 1 AND status_id = 61)` / `COUNT(status_id IN (61, 62) AND not-no-sub-offered)`. Line-item level via `final_substitute_product_cx_confirm` / `_dr_confirm` |

## Acquisition / marketing

| Term | Locked definition |
|---|---|
| **ROAS (primary)** | Revenue (delivered orders) / paid spend. Same-channel attribution only. Default in dashboards |
| **ROAS (all_conv)** | Includes view-through + cross-device. Higher than primary. Source: Google Ads `all_conv_value / cost` |
| **ROAS (true)** | Revenue from incremental customers / spend (excludes brand traffic) |
| **CAC (paid)** | Paid spend / new customers attributed to paid channel |
| **CAC (blended)** | Total marketing spend / total new customers (incl. organic). Always lower than paid CAC |
| **Conversion action** | Google Ads concept — the action counted as conversion. Truemeds uses `Purchase` (primary) + `Install` (secondary). Never double-count |
| **Attribution window** | Default 7-day click + 1-day view |
| **Affiliate orders** | UTM source prefix `AFF`. Same lifecycle as B2C — no separate flow |

## Cohorts (DCOE 5-axis)

| Term | Locked definition |
|---|---|
| **HV / MV / LV / DM** (Value/LTV) | Top 20% / 20–60th / Bottom 40% / Dormant 90d |
| **CM++ / CM+ / CM- / CM--** (Contribution Margin) | Top 10% / >0 / −3 to 0 / <−3 |
| **NEW / ACT / RISK / LAPS / CHURN** (Lifecycle) | FTC<30d / Active<30d / 31–60d / 61–90d / >90d |
| **NC / LD / MD / HD / AC** (Coupon dependency) | 0% / <30% / 30–70% / >70% / 100% orders with coupon |
| **SA / SW / SR / SNO** (Substitution propensity) | >70% accept / 30–70% / <30% / never offered |
| **Golden Geese** | `HV ∩ CM++ ∩ SA ∩ ACT` — protect cohort, minimal spend, organic only |

## Persona tiers (TMEXP1 / probab-subs-persona)

| Term | Locked definition |
|---|---|
| **Gold** | `cx_accepted_subs = 1 AND fsp_cx_confirm.status_id = 61` — self-opts for sub at checkout |
| **Silver** | `cx_accepted_subs = 0 AND fsp_dr_confirm.status_id = 61` — declined at checkout, HA converted |
| **Bronze** | `cx_accepted_subs = 0 AND fsp_dr_confirm.reason_id = 9` — rejected even after HA push |
| **N/A** | `fsp_cx_confirm.reason_id IS NULL AND subs_product_code = product_code` — no substitute offered |
| **4 lever families** | Substitution / Pricing / Margin (TS) / Brand Affinity |

## Facilities

| Term | Locked definition |
|---|---|
| **FC** (Fulfilment Centre) | Full warehouse. 5 main: Mumbai (id 20), Bangalore (17), Delhi (19), Kolkata (22), Lucknow (37) |
| **MFC** (Micro-Fulfilment Centre) | Smaller regional centre. Master `WAREHOUSE TYPE = 553`. Tier-2 expansion driver. Cities: Indore, Bhubaneswar, Chandigarh, Chennai, Guwahati, Hyderabad, Jaipur, Nagpur, Patna (×2), Pune, Raipur, Ranchi, Varanasi |
| **HUB** | Warehouse type 455. Distribution layer between FC and MFC |
| **WAREHOUSE** | Generic warehouse type 454 |
| **Faridabad / FBD** | Specific WH with its own putaway flow variant (`PUTAWAY-FBD`) |

## Operations / systems

| Term | Locked definition |
|---|---|
| **NetSuite (NS)** | ERP / financial system of record. Customer + item + invoice + qty deduct happen here. Pipeline tables on DB 170: `net_suite_invoice_batch`, `net_suite_purchased_order`, `net_suite_items`, `net_suite_sales_receive`, `net_suite_vendor`, `net_suite_purchase_tracker`, `net_suite_pending_purchase_order` |
| **AWB** | Air Waybill — courier shipping label. Printed at orderstatus 289 |
| **HA** (Health Advisor) | Internal role + portal. Substitution confirmation calls (post-confirm, pre-WH-assign). OTC-only cart additions |
| **CSR** (Customer Service Rep) | Inbound + outbound customer support. Two portals: Create Order + Post Order |
| **CMT** (Catalog Management Team) | Function owning Dynamic Content Mgmt. Approves catalog + substitution pairs via `CMT STATUS` × `CMT APPROVALS` |
| **3PL** | Third-party logistics partner. Locked roster: 13 partners (Delhivery, Bluedart, XpressBees, Shadowfax, Ecom, Shiprocket, Blitz, CABT, ATS, WeFast, Shipsy, Ithink, Urbanebolt) + Self / Hand Delivery |
| **JIT** (Just-In-Time) | Inventory type. Masters 282 JIT 1, 283 JIT 2, 371 WH weekly JIT |
| **PO** (Purchase Order) | Procurement order to vendor |
| **VRA** (Vendor Receipt Authorization) | Step in Central Procurement flow — receipt of inwarded goods |
| **DND** | Do Not Disturb — Pill Reminder portal status (538). Customer opted out of reminder calls |
| **Capping / Blocking** | Cart-layer constraint — max-allowed qty per SKU per customer, per warehouse, or global |
| **Pincode Movement** | Re-routing pincode → warehouse mapping. Admin in Hub Config |
| **OOS** | Out Of Stock. Drives sub-fallback in Substitution algo + search de-boost |
| **OTIF** | On-Time In-Full delivery KPI |
| **OFD / OFP / DLVD / LOST / PND** | Master enums for shipment sub-statuses (Out For Delivery / Out For Pickup / Delivered / Lost / Pending) |

## Projects / internal initiatives

| Term | Locked definition |
|---|---|
| **DCOE** (Dynamic Cohort Optimization Engine) | Multi-axis bandit for marketing decisioning. 5 cohort dimensions, M1 retention thesis. Pipeline live, not yet powering production decisioning |
| **TMEXP1** | probab-subs-persona project — Gold/Silver/Bronze persona model. Bridges into DCOE Substitution-propensity axis |
| **TMEXP3** | Bulk algo-hit script for substitution coverage (~1k products × 5 WHs, concurrency=10, rate=100/min) |
| **TMEXP4** | DCOE build (current major initiative) |
| **tm-chotu** | This plugin |
| **tm-po-analytics** | Faridabad inventory-adjustment dashboard |
| **tm-fraud-engine** | Daily rule-based fraud-detection for affiliate orders, all channels (web/app/ios). 24 signals. tm-chotu reuses the detection *logic* ad-hoc (via Metabase), does NOT operate the deployed engine on DCOE EC2 (KD §15) |
| **search-validator** | Replay-dual harness validating Search Engine vs Mixpanel ground truth |
| **marketing-analytics** | Paid-ad ROAS / CAC pipeline under `tminsights` umbrella |

## Multi-tenancy

| Term | Locked definition |
|---|---|
| **`organisation_id`** | Multi-tenant marker on every Main DB table. **Truemeds main = 1.** Always filter `WHERE organisation_id = 1` unless cross-tenant analysis is the explicit goal |

## Anti-patterns — don't say these without qualifying

| Vague term | Required clarification |
|---|---|
| "Active user" | active customer (90d) / active session / active device / active subscriber |
| "Loyal customer" | rank 3+ / LTV bucket / chronic flag |
| "New user" | install / signup / FTC (delivered) / FOP (placed) — they are NOT the same |
| "Conversion" | install → signup / signup → first order / FTC → repeater / etc. |
| "Substitution" | offered (algo found) / shown (UI exposed) / accepted (cx_accepted_subs=1) / kept (status_id=61) |
| "Cancelled" | pre-ship cancel / post-ship RTO / customer-requested / scheduler-auto |
| "Refund" | TM_CREDIT / TM_CASH / CASHFREE (original gateway) / TM_CASHBACK — `REFUND_TO` master decides |
| "Order" | placed / digitized / confirmed / dispatched / delivered — specify lifecycle stage |

## Status-code shorthand cheatsheet

When someone says "status 55" or "status 61", check which master family they mean:
- **ORDER STATUS** family: 55 = DELIVERED, 57 = CANCELED, 60 = DISPATCHED, 66 = CONFIRMED, 39 = DIGITIZED, 233 = WAREHOUSE ASSIGNED, 595 = HA CALL ATTEMPTED
- **MEDICINE_STATUS** family: 61 = SUBSTITUTE, 62 = ORIGINAL, 211 = NO SUBSTITUTE
- **ORDER_TYPE** family: 52 = RX (Type 1), 53 = RX AND MEDICINES (Type 2), 54 = MEDICINES (Type 3)
- **WORK FLOW** family: 242 = NO_DOCTOR_CALL (auto-confirm), 343 = CUSTOMER_ORDER_ONHOLD
- **PAYMENT** family: 16 = ONLINE, 17 = COD

Codes overlap across families — always look up via `m_system_value_master WHERE serial_id = <code> AND name = '<family>'`.

## DEAD-ORDER STATUS SET — LOCKED (verified 2026-07-22)

A "dead" order never became real revenue. **"Net of cancels" / "exclude cancelled" NEVER means just `57`** — it means the full dead set. Excluding only 57 leaks discarded, incomplete and scrapped junk into the number (caused a wrong "revenue yesterday").

`orderstatus IN (49, 274, 400, 668, 57, 232, 174, 312)` — grouped:

| Category | Codes | Labels |
|---|---|---|
| **Incomplete / abandoned** | 49, 274, 400, 668 | INCOMPLETE ORDER, INCOMPLETE ORDER ASSIGNED, PORTAL INCOMPLETE ORDER, REVERTED TO INCOMPLETE |
| **Cancelled** | 57, 232 | ORDER CANCELED, REQUEST CANCELLATION |
| **Discard** | 174 | ORDER DISCARD |
| **Scrapped** | 312 | SCRAPPED |

Also non-real, exclude when the goal is *booked/confirmed* revenue (pre-conversion, decide per use-case): **1 NEW ORDER, 2 PENDING VERIFICATION, 3 ERROR ORDER**.
Delivery-side failures (**284 ORDER DELIVERY FAILED**, RTO chain) are *real billed orders* that failed logistics — handle via returns/RTO, do NOT lump into the dead set.

**Rule:** any placed-level revenue or real-order count → `orderstatus NOT IN (<dead set>)`. Full 96-code decode in `tm-chotu-tables-enums`.

## COGS & CM1 (gross margin) — LOCKED (from DCOE `CM_CALCULATION.md`, user-validated 2026-07-22)

**COGS source = `net_suite_invoice_batch` (NSIB).** Per order:
```
COGS_order = SUM(nsib.rate * nsib.quantity)  WHERE nsib.active = 1
  join: final_substitute_product.final_subs_id = nsib.fsp_id
```
- `rate` = per-unit cost, **GST-EXCLUSIVE** (no GST on cost). `amount` col NULL since 2024 → always `rate * quantity`.
- ⚠️ DCOE's live `cm_net_sql.cogs_cte` sums `rate` only (drops `quantity`) — that is a known bug; canonical COGS uses `rate * quantity`.

**CM1 (gross margin) = product revenue ex-GST − COGS**, both ex-GST:
```
sp_ex_gst_line     = final_substitute_product.selling_price / (1 + medicine_master.gst/100)   -- gst default 5% if null; SP is GST-inclusive, per-line total (already ×qty)
product_rev_ex_gst = SUM(sp_ex_gst_line)  over INVOICED FSP lines (invoice_batch_id IS NOT NULL)
CM1 = product_rev_ex_gst − COGS_order
CM1% = CM1 / product_rev_ex_gst
```
CM1 is the **product gross-margin line only** — it does NOT subtract shipping / packaging / burns / CPO. Those extra layers = the fuller `cm_net` (see `tm-chotu-dcoe-cohorts`; `cm_net` ≠ CM1).

**GST:** strip GST from the selling side (MRP/SP carry GST); `rate` is already net → both ex-GST, apples-to-apples.

### ⚠️ MANDATORY DISCLOSURE — state on EVERY COGS / margin answer (user-mandated 2026-07-22)

> **NSIB `rate` is NOT NetSuite's true COGS and will NOT reconcile to it.** It is the *latest rate of that batch in that warehouse at the moment the invoice was created*. **NetSuite books COGS on FIFO** (first-in-first-out batch costing), which Truemeds does **not** store today — so our margin is an approximation, not the NetSuite/P&L figure. True FIFO cost visibility arrives with the **IMS project** (upcoming). Never present a COGS/margin number without this caveat.

**NSIB-era boundary — 2022-11-17.** Before that date NSIB is empty → COGS unavailable. For older orders use `product_pts_tracker.pts * qty` (cap pts at MRP; approximate — current not historical) as a cost proxy, or flag margin N/A. Never report the spurious large-negative that empty-NSIB produces.

## HM / LM product-margin segregation — LOCKED + 🔒 GATED (user-validated 2026-07-23)

> 🔒 **HARD GATE — do NOT surface any of this unless `persona = Founder/Leadership` AND the user's goal is margin-health / "how many products actually make money". Enforced in `tm-chotu-query-rigor`.** Either condition false → say nothing about HM/LM; fall back to CM1/cm_net (quick analysis) or the branded/generic shorthand (framing only).

**The crux (the insight to give leadership):** Truemeds' everyday shorthand is *"branded = low margin, generic = high margin."* True broadly — but the **branded/generic label is FIXED while real margin MOVES.** From inception we tag products HM/LM by the actual deals/partnerships we get from companies. A product branded in year 1 may be low-margin; as partnerships improve we earn better terms; once its margin crosses the quarter threshold it becomes **HM while still labelled "branded."** So `medicine_quarter_master` is the **true segregation of which products make money for Truemeds** — decoupled from the branded/generic label. That decoupling is the answer to "how healthy are our margins / how many products make money."

**Definition.** HM/LM is a **per-product-×-quarter** tag (`medicine_quarter_master.hm_lm`), NOT a property of the SKU — the same product flips (~5–8%/quarter). **HM ⇔ effective GM% ≥ that quarter's threshold, else LM.** Designed to be *knowable in advance* so it can drive decisions.

**GM% (how the tag is computed)** — over **delivered** lines (`orderstatus` 55/200/201), per product×quarter:
```
GM% = (Σ revenue_ex_GST − Σ COGS) / Σ revenue_ex_GST × 100
revenue_ex_GST = sp_net_sold / (1 + rate/100)                 -- net of returns + GST
rate = COALESCE("Tax Rate_per_unit_NS", <date-based gst>, gst, 12)
COGS = COALESCE("COGS_per_unit_NS", "COGS_per_unit_approx_NS") * qty_net_sold
```
Quarter is taken from the order **placement date** (`created_on`). This COGS is a cousin of the NSIB COGS → **the FIFO-mismatch caveat still applies** (not NetSuite-FIFO truth).

**1-quarter lag rule (the crux of the mechanic).** A product's tag for quarter Q uses its **Q−1 margin** (so it's knowable before Q starts). Fallback chain, recorded in `gm_source`:
| Priority | Rule | `gm_source` |
|---|---|---|
| 1 | GM in Q−1 (~91% of product-quarters) | `1Q lag` |
| 2 | else GM in Q itself | `current quarter (no prior-quarter sales)` |
| 3 | else **LM by default** | `no GM available` |

**Threshold schedule — "Scenario 5" (LOCKED).** **18%** every quarter **except 2024-Q4, 2025-Q1, 2025-Q4 = 20%.** 2026-Q3 = 18%. (Sensitivity variants v2=19% / v3=20% exist for 2026-Q3 only — base case is 18%.)

**Caveats (must-surface when the gate is open):**
- **HM share of *products* ≠ HM share of *revenue*.** ~44.5% of products are HM in 2026-Q3, but HM is only ~37–43% of GMV (HM SKUs skew smaller-ticket). Never conflate the two. HM GMV share reconciles to the published **42.90%**.
- **Pre-2022-Q4 unusable** (no COGS) — restrict to `used_in_published_pack = 1` (Apr-2023 onward).
- **2026-Q3 is a partial quarter** (base data covers only 1–15 Jul 2026; ~97% stable via the Q2 lag, ~3% rest on half a month).
- **Quarter-specific** — never carry a product's tag across quarters.

**Provenance.** Built from `IRL_base_combined_v3` (prepared 2026-07-21), "Scenario 5" pack; DCOE `CM_CALCULATION` lineage. Table + join contract: `tm-chotu-tables-enums` / `METRIC_CATALOG`.
