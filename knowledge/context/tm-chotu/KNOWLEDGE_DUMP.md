# tm-chotu — KNOWLEDGE DUMP

**v0.0.1 draft — 2026-05-15. PRE-REDLINE.**

This file is the source-of-truth for every section skill. After Mangesh redlines, sections translate 1:1 into `skills/tm-chotu-<section>/SKILL.md` bodies.

**Markup conventions:**
- `[VERIFY]` — item needs user confirm before locking
- `[REDLINE]` — bigger question / strategic call needed
- `[SOURCE: ...]` — pointer to table / dashboard / file
- All numbers herein are **placeholders** unless `[CITED]`

---

## § 1 — Overview

### What Truemeds is

Truemeds is an India online pharmacy specialising in **generic** medicines (GX) at significant discount vs MRP. Founded **2019**. HQ Mumbai; second office Bangalore (opened Dec 2025) housing mostly engineering + product. Operates pan-India delivery with own + partner warehouses. Primary moat = generic substitution at scale + chronic-customer retention.

### Business model — the levers

| Lever | What it means | Why it matters |
|---|---|---|
| **GX substitution** | Doctor swaps branded Rx for generic equivalent (same molecule + dose) | Savings vary by molecule — majority 50%+ vs MRP, captures margin |
| **Chronic capture** | Customers on long-term meds (BP, diabetes, thyroid, cardiac) reorder every 30 days | Predictable revenue + retention compounding |
| **Direct procurement** | Buy from manufacturers, bypass distributor margin | Margin |
| **Tech-led ops** | Centralised pharmacist + doctor review per order | Trust + compliance |
| **Multi-channel acquisition** | Google Ads (UAC + Search), Meta, ASO, web SEO, affiliates, BTL | Funnel breadth |

### Channels

- **App** (Android dominant, iOS smaller) — primary channel, chronic-heavy
- **Web** — discovery-focused (acute + first-time exploration), paid-search-heavy, higher fraud surface
- **B2B / Affiliate** — fraction of orders, UTM source prefix `AFF`

### Headline metrics [CITED — probed Redshift (Mangesh-scope mirror of DB 170) on 2026-05-15, 8–14 May 2026 window. Same numbers reproducible on DB 170 since tables mirror.]

| Metric | Value | How calculated / sourced |
|---|---|---|
| Catalogue size | **~2 lakh products** (`medicine_master` 231,012 rows) | probab-subs-persona |
| Products with generic substitutes | **~35%** of catalogue | probab-subs-persona |
| MAU | **~4.2 M** | probab-subs-persona |
| DAU (avg) | **~185 k** | probab-subs-persona |
| Platform split | **Android 95% / iOS 5% / Web <1%** | probab-subs-persona |
| Fulfilment Centres | **5** — Bangalore (id 17), Kolkata (22), Mumbai (20), Delhi (19), Lucknow (37). Serve ~26k pincodes | probab-subs-persona |
| Orders placed / day | **~23–25k** | `order_details` row count excluding rejects: `orderstatus NOT IN (49 INCOMPLETE, 312 SCRAPPED, 174 DISCARD, 1 NEW, 58 PAYMENT_PENDING)` |
| Orders delivered / day (steady-state) | **~19–20k** | `orderstatus = 55 (ORDER DELIVERED)` |
| Deliver rate (mature cohort) | **~80–82%** | delivered / placed-excl-rejects, May 8–9 fully cured |
| AOV (invoiced) | **~₹1,200–1,240** | `final_calculated_amount.final_amount` on delivered orders |
| GMV delivered (invoiced) / day | **~₹2.3–2.4 cr** | `SUM(fca.final_amount) WHERE orderstatus = 55` |
| Savings vs MRP / day | **~₹1.2 cr** (~50% of GMV) | `SUM(fca.saving_value)` |
| Active customers (any order, 90d) | **~20.9 lakh** | `order_details` distinct `customer_id` (90d) |
| Customers with delivered order (90d) | **~9.06 lakh** | `orderstatus = 55` distinct `customer_id` (90d) |
| Chronic share of customers | XX% [VERIFY — query `cx_lifetime_metrics.chronic_flag`] |
| M1 retention | XX% [VERIFY — query `customer_order_rank`] |

**Funnel shape** (single day, May 9 mature cohort):

```
60k rows in order_details
   ↓
25k orders placed (cleared INCOMPLETE / SCRAPPED / DISCARD reject set)
   ↓
~20k delivered (80% of placed)
```

The big leakage points are pre-confirmation reject states (`49 INCOMPLETE` 130k/wk and `312 SCRAPPED` 90k/wk) — they get a row in `order_details` but never enter active funnel.

**Monthly GMV: ~₹76 cr** (directional — actual finance close). My probe-extrapolation gave ₹70cr from 7-day window; gap is within directional tolerance. **Always tag probe-derived numbers as directional** unless cross-checked with finance close.

**IMPORTANT — counting orders by lifecycle stage:**

- For **"orders placed"** → use `order_details` snapshot with reject-status exclusion (above approach).
- For **all other lifecycle stages** (cancelled, processed, doctor-confirmed, HA-confirmed, dispatched, returned, etc.) → query `tmmumpsdb.order_status` **transition history table**, NOT `order_details.orderstatus`.

**Where things actually live (not in `order_details`):**

| Concept | Lives in | Notes |
|---|---|---|
| **Backorder flag** | `tmmumpsdb.package_details_tracking` (NOT `order_details`) | Trigger for Procurement & Inwarding flow |
| **TM Wallet (cash balance)** | Dedicated `wallet` table (NOT `order_details`) | Customer-level coin balance |
| **Per-order TM cash / credit / cashback / discount application** | `tmmumpsdb.final_calculated_amount` columns: `tm_cash`, `tm_credit`, `tm_cashback`, `discount`, `delivery_charge`, `packaging_charge`, `cash_handling_charge`, `price_lock_disc`, `adjustment_amt` | These are the per-order deductions/additions |
| **Invoiced final amount (for GMV)** | `final_calculated_amount.final_amount` | NOT `order_details.order_value` (that's pre-bill cart value) |

Why: `order_details.orderstatus` is the *current* state. An order delivered today no longer carries the "doctor-confirmed" status it once had. The transition log `order_status` (cols: `order_id`, `order_status_id`, `modified_on`) records every state hop — that's the source of truth for stage-level funnel counts.

Example pattern:

```sql
-- "Orders cancelled yesterday" (anywhere in lifecycle)
SELECT COUNT(DISTINCT order_id)
FROM tmmumpsdb.order_status
WHERE order_status_id = 57         -- ORDER CANCELED
  AND DATE(modified_on) = CURRENT_DATE - 1;
```

### The five "what changes if Truemeds wins"

1. Generic-first becomes default for chronic households
2. Doctor-led substitution becomes the trust anchor (not the discount)
3. Chronic-engine compounding makes CAC < LTV by month 3 of cohort
4. Tier-2/3 reach via Hindi-first UX
5. Diagnostics + reminders tie in — diagnostics launched recently, picking up well

---

## § 2 — Functions (roles, not names)

### Marketing — 7 sub-functions

| Sub-team | Scope |
|---|---|
| **Paid** | Google Ads (UAC + Search + Display), Meta Ads, ASO partners, paid budget allocation |
| **Retention** | CRM — push, SMS, WhatsApp, email. Chronic reminders, reactivation, lapsed-customer winback |
| **Content** | Editorial, blog, video, social organic, regional content (Hindi-first). Also owns CMS / Disease Pages / Salt Pages / Banner content authoring |
| **SEO** | Organic web growth, product/category SEO, technical SEO |
| **Affiliate** | Affiliate partner programs (UTM source prefix `AFF`), commission negotiation. **Affiliate orders follow exact same lifecycle as B2C — no separate flow, attribution via UTM** |
| **Leadgen** | Lead pipelines into the funnel (forms, partner referrals, doctor referrals) |
| **Activation** | First-order activation programs, install→FTC moves, onboarding nudges |
| **Offers** | Coupon catalog, promo design, cashback rules. Lives operationally on Dynamic Content Mgmt (Coupon Management) — owner is Marketing |

**KPIs (function-level):** paid CAC, ROAS (primary), install→FTC%, reactivation rate, blended CAC, organic share

### Product Management — 5 sub-functions

| Sub-team | Scope |
|---|---|
| **Conversion** | Funnel optimisation — homepage → search → PDP → cart → checkout |
| **Growth** | Acquisition product, install funnels, referral, web-app cross-flows |
| **Substitution** | GX recommendation surfaces, doctor / customer substitution console, algo product wrap |
| **Post-order** | Three sub-pillars: **Doctor** (Rx review + teleconsultation tooling), **SCM** (supply-chain + inventory product), **CSR** (CX agent tooling, refund + complaint flows) |
| **Analytics for all modules** | PM-embedded analytics — feeds every sub-team with funnel + cohort + experiment readouts |

**KPIs (function-level):** funnel conversion rates by stage, NPS, time-to-deliver, app crash rate, experiment win-rate

### CMT — Catalog Management Team (separate function)

Owns the **Dynamic Content Management** surface from a product perspective. Operates the catalog backbone that everything else depends on.

| Responsibility | Scope |
|---|---|
| **Catalog** | Manage Molecules / Companies / Products (WH-level + Global). Approver Flow via CMT STATUS (394 APPROVED / 395 PAUSED / 396 REJECTED) and CMT APPROVALS (397 CATALOGUE / 398 SUBSTITUTION / 399 BOTH) |
| **Substitution master** | GX-original pair maintenance, approval gates for new subs |
| **Disease + Salt pages** | Disease Master, Disease Category Master, Salt Master, Salt Page maintenance |
| **OTC pages + master** | OTC product surfaces + master taxonomy |
| **Homepage / Category / Banner / Carousel** | Surface composition (operationally executed; PM-owned) |
| **Capping / Blocking** | Per-SKU, per-warehouse, global blocking rules — with approver workflow |

**KPIs:** catalog-completeness %, GX-sub coverage %, approval TAT, content-freshness lag

### Analytics / Data Science

- Cohort + retention reporting (M1 / M3 / M6, FTC cohorts)
- Substitution algo (`findBestSubForProducts`), pricing models, fraud detection
- DCOE (Dynamic Cohort Optimization Engine) — multi-axis bandit
- Daily / weekly dashboards (Metabase native + Excel handoffs)
- **KPIs:** model precision/recall, decision-uplift, dashboard freshness, hypothesis-throughput

### Operations — sub-functions

| Sub-team | Scope | Whimsical module |
|---|---|---|
| **Central Procurement** | Ordering Plan, Generate PO, Cycle Selection, Inwarding & Invoicing, QC Process, Auto-Close PO, Auto VRA, Rate + Quantity Comparison, VRA Inwarding, Bulk VRA, PO Checker, Back Order Procurement | CENTRAL PROCUREMENT |
| **Warehouse — Picking** | 3 picking variants: Single / Multi-order / Multi-order Pigeon-hole (zone-wise). Roles: Picker, Sorter, Checker, Problem Solver | DISPATCH PORTAL |
| **Warehouse — Putaway** | 8 putaway types: Order, TO (Transfer Order), Bill, Bin-to-Bin, Coldchain, Revert Picking, Batch Verification + FBD variant. Quarantine zone for damaged/missing/expired | PUTAWAY / PUTAWAY-FBD |
| **Warehouse — Replenishment** | Bulk Zone / JIT Zone tasks, Min Limit / Near-Expiry auto-tasks, Min-Max management | REPLENISHMENT |
| **Warehouse — Hub Config** | SKU Categorization, Bulk SKU List, Hub Transit Days, Refill PO Tracking, Cold Chain SKU List, Homeopathy SKU List, Pack-size mgmt, Excess Inventory Report, WH Prioritization, Hub-level SKU Forecasting | Min-Max admin module |
| **Faridabad hub** | North-zone fulfilment hub, dedicated FBD putaway workflow exists | PUTAWAY-FBD |
| **Logistics** | Serviceability check, Courier Partner Priority, Pincode Master, Pincode Warehouse Master, Courier Partner Pincode TAT Adherence Calc | Logistics Management |
| **3PL partners** | XpressBees, Delhivery (Express/NDD), Bluedart (Express), CABT, WeFast, Shipsy, ATS, Ecom (Surface/Air), Shadowfax (Express/Surface/Reverse), Blitz (Express), Ithink, Urbane Bolt, Shiprocket (Delivery/Courier/NDD) + Self/Hand Delivery | PACKAGE_STATUS master |
| **Return & Refunds** | RTO chain (RTO-IT → RTD → reverse putaway → restock). Customer returns via CSR Portal. Refund destinations: TM_CREDIT / TM_CASH / CASHFREE / TM_CASHBACK | RTO + return clusters |

**KPIs (function-level):** order-to-ship time, RTO%, stockout%, OTIF, return rate, refund-SLA, picker/checker throughput, putaway TAT

### Customer Experience (CX) — 4 portals

| Portal | Use | Whimsical module |
|---|---|---|
| **CSR Portal — Create Order** | Inbound customer call → search mobile → place new order | CSR PORTAL CREATE ORDER |
| **CSR Portal — Post Order** | Servicing existing orders: view past orders, customer ratings, subs history, CSR tickets, invoice/return bills. Generate return ticket, Rank up order, Track status, Mark Unreachable, Cancel | CSR PORTAL POST ORDER |
| **Assisted Commerce Portal** | Outbound sales (OTC focus). Agent Shift/Statistics/Score/Target Mgmt, OTC Sales Dashboard (Connected %, Substitution AOV, Customer Type Converted %), Reschedule order, Incentive Management | ASSISTED COMMERCE PORTAL |
| **Pill Reminder Portal** | Chronic refill outbound. Group Mapping, Assign/Unassign Reminder. Statuses: NOT NEEDED / UNREACHABLE / ORDER PLACED / CANCEL REMINDER / SKIP REMINDER / DO NOT DISTURB / REATTEMPT LATER. Reminder type: BY DATE / BY FREQUENCY | PILL REMINDER PORTAL |

**KPIs:** CSAT, response time, repeat complaint rate, OTC connect %, chronic-reorder conversion rate

### Doctor / Medical Ops — 4 arms

| Arm | Scope | Whimsical module |
|---|---|---|
| **Doctor Portal — Rx review + substitution** | Live order picking from assigned warehouse, view Order Details (Patient / Delivery / All Originals SKU / All Subs / Bill / Order Info & Subs), Call Patient, Confirm Order, Hold/Cancel Order, Patient Ranking, ETA, Doctor Fraud detection | DOCTOR PORTAL |
| **Doctor Super-Admin** | Doctor Onboarding (Registration form → Super Admin approval Pending/Approved/Not-Approved lists), Dashboard Statistics, Earnings & Incentives, Broadcast Message, Doctor Allocation, Doctor Blocked List, Live Order, Doctor Category (5 categories), Doctor Calls Mgmt, Category Blocking, Dosage Tagging, Doctor Fraud module, OTC Insights, Pilot Order Statistics, IVR | DOCTOR PORTAL Super-Admin |
| **Pharmacist Type 1** | First-attempt digitization for **prescription-only orders** (`ORDER_TYPE = 52 RX`). Validate prescription(s), calculate delivery date, search/add doctor, apply coupon + TM rewards, add notes → DIGITIZE / DISCARD / MARK UNREACHABLE. **Type 2 (RX AND MEDICINES = 53) and Type 3 (MEDICINES = 54) bypass Pharmacist and go straight to Doctor.** | PHARMACIST PORTAL TYPE 1 ORDER |
| **Health Advisor (HA)** | Substitution explanation + customer confirmation call. **Triggered when SUBSTITUTE is available** — post ORDER CONFIRMED, pre WAREHOUSE ASSIGNED. orderstatus 595 HEALTH ADVISOR CALL ATTEMPTED. HA can add only OTC (not Rx) to cart. Substitution actions: Replace original / Keep both / Hold Order | HEALTH ADVISOR CALL |

**KPIs:** Rx-generation TAT, sub-acceptance rate, HA single-call connect %, Doctor approval TAT, Pharmacist Type-1 digitize TAT

### Fulfillment / Procurement

(Covered under Operations above — `Procurement` + `WH` sub-teams.)

### Finance

- AR/AP, GMV reporting, P&L closes
- CAC + LTV unit economics
- Audit + compliance
- **KPIs:** cash conversion cycle, gross margin, contribution margin

### Tech / Engineering

- App + web + backend services
- Data platform (Redshift, Metabase, MCPs, HEVO pipelines — abstracted for non-engineer audiences)
- DevOps / SRE
- **KPIs:** uptime, p95 latency, crash-free rate

### Diagnostics

Separate function — launched recently, picking up well. Home sample collection, lab partner integration, tied to chronic customers. Has dedicated lead. Data lives in `tmmumpsdb.tm_diagnostics_*` (catalog, order_master, lineitem, phlebo).

### Legal / HR / Compliance (high level)

- Legal — contracts, regulatory (CDSCO / state pharmacy councils), data-privacy
- HR — talent, payroll, performance
- Compliance — pharmacy licensing, Rx audit trails, GST

Light coverage in plugin — these don't drive analytical / business queries day-to-day.

### Leadership / Founder office

- Strategy, capital, board reporting
- Cross-function unblocks
- **KPIs:** revenue growth, GM%, retention curve shape

---

## § 3 — Customer

### Where customer data lives

| Layer | Source | Status | Use |
|---|---|---|---|
| **Behavioural** | Mixpanel Production Env 2900163 | ✅ Live, primary | App + web events (view / search / cart / order) |
| **Profile** | `tmmumpsdb.customer_details` | ✅ Live, primary | Identity, mobile, device, signup |
| **Order rank** | `tmmumpsdb.customer_order_rank` (column `cust_order_rank`) | 🔴 **DO NOT USE** — probed customer_id=4: only 64 rows out of 1,989 actual orders (3% coverage), last row **2025-04-08 (13 months stale)**. Refresh job appears broken/abandoned. Compute rank on-the-fly instead: `ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_on)` on `order_details` | Compute, don't read |
| **Lifetime snapshot per order** | `tmmumpsdb.cx_lifetime_metrics` | ⚠️ **PARTIAL + LAGS** — probed customer_id=4: 1,454 rows out of 1,989 actual orders (73% coverage), last row **2026-05-08 (7 days stale)**. Schema is per-order rolling (`lifetime_op_count`, `lifetime_od_count`, `lifetime_op_revenue`, `lifetime_od_revenue`). Likely captures only orders that crossed a lifecycle gate. Use as reference only; for LTV math compute via `SUM(fca.final_amount) OVER (PARTITION BY customer_id ORDER BY created_on)` against `order_details` + `final_calculated_amount` | LTV math: compute on-the-fly |
| **DCOE cohorts (5-axis)** | DCOE pipeline `app.cohort_defs` etc. (separate RDS, not in Metabase 663) | 🟡 **Pipeline live, not yet powering production decisioning.** Will be default cohort lens post go-live | Multi-axis cohort bucketing — see table below |
| **Chronic / acute split** | `chronicity_otc_analytics`, `chronicity_rx_analytics`, `order_chronic_map_*` | ⚠️ **Validate before use** — may be stale. **Preferred until verified: derive chronic via Mixpanel + product order history + product-level chronic tagging in catalog** |

### DCOE 5-dimension cohort model (canonical — when live)

Customers scored on 5 axes; final cohort = combination of bucket labels.

| Dimension | Buckets | Source |
|---|---|---|
| **Value (LTV)** | `HV` (top 20%) / `MV` (20–60th) / `LV` (bottom 40%) / `DM` (no order in 90d) | `order_details` + `final_calculated_amount` |
| **CM1 (Contribution Margin)** | `CM++` (top 10%) / `CM+` (>0) / `CM-` (−3 to 0) / `CM--` (<−3) | FSP + `net_suite_invoice_batch` |
| **Lifecycle** | `NEW` (FTC in 30d) / `ACT` (ordered <30d) / `RISK` (31–60d) / `LAPS` (61–90d) / `CHURN` (>90d) | `order_details`, `order_status` |
| **Coupon dependency** | `NC` (0%) / `LD` (<30%) / `MD` (30–70%) / `HD` (>70%) / `AC` (100%) | `order_details.offer_id`, `discount_applied` |
| **Substitution propensity** | `SA` (>70% accept) / `SW` (30–70%) / `SR` (<30%) / `SNO` (never offered) | `product_details.cx_accepted_subs` + sub-confirm tables |

**Golden Geese** = `HV ∩ CM++ ∩ SA ∩ ACT` — protect-cohort. Minimal spend, organic only. Used in campaign mapper for "variant count = 1" decisions (no exploration on proven winners).

Source: `~/Desktop/Truemeds /Claude/TMEXP4-DCOE/context/COHORT_DEFINITIONS.md`

### Customer profile (typical)

- **Age** — 35–60 dominant, chronic-skewed
- **Geography** — pan-India. Tier-1 metros (Mumbai, Delhi, Bangalore, Pune, Hyderabad, Chennai, Kolkata) + **heavy influx of small tier-2 cities** following new MFC (Micro-Fulfilment Centre) launches
- **Device** — Android majority, iOS minority, web for discovery. [REDLINE: pull exact % split via Mixpanel `Order Placed` event breakdown by `$os` / platform property]
- **Chronic vs acute share** — [REDLINE: derive from Mixpanel + product chronic tagging, NOT the maybe-stale chronicity tables]
- **Language / Income / B2B-B2C split** — not captured anywhere in the data layer; do not promise these breakdowns

### Customer rank — what `customer_order_rank` actually gives

```
cust_order_rank = 1   →  FTC (first order)
cust_order_rank = 2   →  second order
cust_order_rank = n   →  nth order
max seen in 7d slice  →  2,166 (heavy chronic)
```

After validation, rank-based bucketing + DCOE 5-axis answer different questions:
- **Rank**: "where in customer's order sequence are we"
- **DCOE**: "what kind of customer right now (value × profit × lifecycle × coupon × subs)"

### FTC definition (corrected)

`order_details.is_ftc_order = 1` is **per-order**, not per-customer.

> `is_ftc_order = 1` stays true on **every** order placed by a customer **until at least one prior order has cleared doctor-confirmed-or-higher status (or actually delivered)**. Once any prior order clears that gate, the flag flips false on subsequent orders.

Implications:
- A customer can have multiple orders flagged `is_ftc_order = 1` simultaneously if none have reached the doctor-confirm gate yet (e.g. all cancelled before review)
- Use `is_ftc_order = 1` to count **first-attempt orders**, NOT unique FTC customers
- For unique FTC customers: do **NOT** trust `customer_order_rank` (broken). Derive on-the-fly: `WHERE customer_id IN (SELECT customer_id FROM tmmumpsdb.order_details GROUP BY customer_id HAVING MIN(created_on) >= '<date>' AND COUNT(*) = 1)` against fresh `order_details` snapshots

### Retention shape

- **M1** — order-1 → order-2 within **30 days** (primary KPI, DCOE thesis north star)
- **M3** — within 90 days
- **M6** — within 180 days
- **Quarterly retention** — order in quarter N → order in quarter N+1 (chronic strength signal)
- **Reactivation** — 60+ day dormant → reordered

---

## § 4 — Business flows

Source for this section: `~/Desktop/Bird's eye view.pdf` (Whimsical export, 2026-05-15) — full Truemeds product architecture, every node label preserved.

### Order lifecycle — actual path (from Whimsical)

```
[Customer surface — App or Website]
  app open / homepage → discovery surfaces (Search / Disease Pages / Saltpages /
                       Medicine Listing A-Z / OTC Carousels / Banners / Health Articles)
  → Login (Skip / OTP via SMS or Call / Truecaller verified)
  → Search → Search Suggestions → PDP (Subs Algo: Substitute / Both / Replace Original)
  → Add to Cart (Capping / Blocking enforced)
  → View Cart (Apply Coupon, View Substitute, change qty)
  → Proceed to Checkout
  → Select Address (Manage Address) + Select Patient (Manage Patient)
  → Location Bottomsheet (current / select / skip / default)
  → Get Pincode → Assign Warehouse → Live Inventory check
  → COD enable/disable per pincode + Cash Handling Charge applied if needed
  → Order Summary + View Bill Details → Payment Selection → PLACE ORDER

[Backend lifecycle]
  ORDER PLACED (orderstatus = 1 NEW) → INCOMPLETE / ORDER CREATED
    ↓
  Check Order Type (`order_type_status` master 'ORDER_TYPE')
    ├─ Type 1 (52 = RX-only)
    │     → Pharmacist Type 1 queue → validate Rx → ORDER DIGITIZED
    │     OR if valid Rx already attached → AUTO-CONFIRMATION LOGIC (workflow_status 242 NO_DOCTOR_CALL)
    ├─ Type 2 (53 = RX AND MEDICINES)
    │     → Doctor directly (skip Pharmacist queue)
    └─ Type 3 (54 = MEDICINES-only, no Rx)
          → Doctor directly
    ↓
  ORDER CONFIRMED (orderstatus = 66 ORDER CONFIRMED)
    ↓
  Decision: Health Advisor call required? (triggered when SUBSTITUTE is available)
    ├─ Yes → Health Advisor call (orderstatus 595 HEALTH ADVISOR CALL ATTEMPTED)
    ├─ Or  → Pharmacist call
    └─ Or  → Assisted Commerce call
    ↓
  Order Fulfilment
    → Warehouse assigned (orderstatus 233 WAREHOUSE ASSIGNED) — MFC (553) / HUB (455) / WAREHOUSE (454)
    → Create Sales Order in NetSuite
    → FIFO Fulfilment
    → All items + customer created in NS & DB
    → Backorder flag? Yes → Procurement & Inwarding flow
    → Order eligible for picking
    ↓
  Picking (one of three variants — see § 5 Picklist module)
    → Generate Invoice → Deduct qty from NetSuite → Pack → Print Pack-slip
    ↓
  Logistics + Payment flow
    → Assign AWB → Print AWB
    → orderstatus = 60 ORDER DISPATCHED → Receive Webhook Updates from 3PL
    → Online Payment? Yes → done. No → "Payment after dispatch" → Generate payment link → Customer Payment
    ↓
  ORDER DELIVERED (orderstatus = 55)
    └─ Or ORDER RETURNED (56) / REFUNDED (199) / CANCELLED (57) / RTO / DTO
```

### Substitution flow — confirmed steps

1. Customer adds branded Rx product (or unbranded — algo runs anyway)
2. `findBestSubForProducts` algo suggests generic equivalent across warehouse stock
3. Doctor reviews on Doctor Portal, picks substitute (line-item tagged `medicine_status = 61 / SUBSTITUTE`)
4. **Live Inventory blocks BOTH the original AND the substitute** at this point (pre-confirmation hold) — see Live Inventory module
5. Health Advisor / Pharmacist / Assisted Commerce call explains substitution to customer
6. Customer choice:
   - **Replace original** → keep substitute (`medicine_status = 61`)
   - **Keep both** → both lines stay
   - **Reject substitute** → flipped to `medicine_status = 62 / ORIGINAL`
7. If sub rejected → **substitute SKU released/unblocked** in live inventory (see threshold rule)
8. On order-level cancel during this flow → `orderstatus = 57 / ORDER CANCELED`

### Prescription handling — actual path (from Pharmacist Portal flow)

1. Customer uploads Rx (image) at checkout
2. Order enters **Pharmacist Type 1 queue** (queue for first-attempt digitization)
3. Pharmacist opens order details on portal → views customer details / past orders / Rx / past customer ratings / subs history / CSR tickets
4. **Pharmacist validates prescription(s)**:
   - Valid → digitize order (calculate delivery date, search/add doctor, apply coupon / TM rewards, add notes) → `DIGITIZE ORDER`
   - Invalid → `DISCARD ORDER` or `MARK UNREACHABLE` if customer cannot be contacted

### AUTO-CONFIRMATION LOGIC (system path)

When a single valid prescription IS already attached at order placement, the order can skip doctor call and go straight to `ORDER CONFIRMED`. Speeds up the path for repeat / verified prescriptions.

### Chronic vs acute path

| Trait | Chronic | Acute |
|---|---|---|
| Reorder cadence | ~30 days | one-off |
| Reminder eligible | yes (Pill Reminder Portal — see § 5) | no |
| Cohort tag | `order_chronic_map_*` (⚠️ validate before use — see § 3) | `order_acute_map_*` |
| Discount stickiness | high (bulk savings) | medium |
| CX touchpoint | Pill Reminder + chronic CRM | order-status only |

Preferred chronic-customer derivation today: Mixpanel + product order history + product chronic tagging in catalog, NOT the legacy chronicity tables.

### Cancellation + RTO/return flow (locked)

**Pre-ship cancel** — easy, no fee. orderstatus → 57 ORDER CANCELED.

**Post-ship cancel (RTO chain):**

```
ORDER DISPATCHED (60)
   → Courier partner pickup
   → ORDER IN TRANSIT (PACKAGE_STATUS values via 3PL webhook)
   → Cancellation received from customer or courier
   → ORDER CANCELED (57)
   → RTO marked
   → RTO IN TRANSIT (separate master code: serial 121 'RTO-IT')
   → RTO DELIVERED back to warehouse (serial 124 'RTD')
   → Verification at WH
   → Reverse putaway (PUTAWAY TYPE: 583 REVERT PICKING PUTAWAY, or 540 ORDER PUTAWAY)
   → Goods restocked in NetSuite + DB
```

**Customer return after delivery** (via CSR Portal "Generate return ticket"):

```
Customer raises return → 190 RETURN REQUESTED → 191 RETURN GENERATED
   → Verification: 292 VERIFICATION FAILED / 296 REQUEST VERIFIED / 297 ORDER VERIFICATION FAILED
   → Approval: 290 REQUEST APPROVED / 291 REQUEST DECLINED
   → Pickup scheduling: 299 PICKUP SCHEDULED / 298 PICKUP FAILED / 294 OUT FOR PICKUP
   → 263 RETURN IN TRANSIT → 272 RETURN PICKED UP → 273 RETURN DELIVERED (to warehouse)
   → Refund: 199 REFUNDED / 411 PARTIALLY REFUNDED TO BANK / 412 ORDER REFUNDED TO BANK / 200 PARTIALLY RETURNED / 201 PARTIALLY REFUNDED
   → Return ticket can be CANCELLED (301)
```

**Return window:** ~15 days, no item-type limits. Different refund destinations available — see `REFUND_TO` enum: TM_CREDIT / TM_CASH / CASHFREE (original gateway) / TM_CASHBACK.

**RTO accounting:** RTO orders ARE reversed (do not count in final GMV). RTD (124) marks the goods physically returning to warehouse — reverse putaway then restocks the SKU.

### Doctor call path (when triggered)

When `single valid prescription not available`:

1. Order enters Doctor Portal queue (filtered to doctor's assigned warehouse + category)
2. Doctor pulls Order Details → Patient Details / Delivery Details / All Originals SKU / All Subs / Bill Details / Order Info & Subs
3. Doctor either:
   - **Call Patient** → Confirm Order with verbal Rx clarification
   - **Hold Order** (defer)
   - **Cancel Order**
4. On confirm → `ORDER DIGITIZED` → `ORDER CONFIRMED`

---

## § 5 — Core modules

Source: Whimsical bird's-eye PDF (2026-05-15) + Mangesh DB master sweep + prior project memory (TMEXP3, TMEXP4 DCOE, search-validator, tm-fraud-engine).

Grouped: **Customer-facing** → **Order-flow operations** → **Internal portals** → **Admin & control** → **Other**.

---

### Customer-facing modules

#### Search

**Source:** Search Engine PRD V1.2 (April 2026, Sujith Cheedella) at `/Users/mangeshtoraskar/Downloads/Chrome/[PRD] Search Engine - TrueMeds V1.docx.pdf`.

**Engine:** OpenSearch cluster + stateless **Preprocessing Library** (shared index-time + query-time) + custom **Scoring Layer** post-OpenSearch.

**Core design constraint:** medicine search has clinical stakes. Partial-numeric matches (e.g. `650` returning every product with 650 anywhere) are actively harmful — system blocks numeric-only queries via Safety Gate before any OpenSearch call.

**Six-component pipeline:**

1. API Gateway → Query Builder Service (constructs OpenSearch DSL from `QueryIntent` object)
2. Preprocessing Library (lowercase + Unicode NFC + ASCII fold + Unit Canonicalisation + Dosage-form removal + Synonym injection — applied BOTH at index-time and query-time, enforced via **Symmetry Contract**)
3. OpenSearch Cluster (executes tiered DSL, returns hits + `_score` + `l1_ranking_score` + `is_oos`)
4. Scoring Layer (normalises relevance, blends with `l1_ranking_score` via α/β weights, applies OOS band penalty)
5. Product Catalogue Service (post-search enrichment: price, images, pack size, discounts — never indexed)
6. Response (ordered list with `match_flag`, scores, OOS indicators)

**Three-tier matching strategy** (only one tier's results returned per query — highest tier with ≥1 hit):

| Tier | Mechanism | Fields | Flag |
|---|---|---|---|
| 1 — EXACT | `multi_match` `type:best_fields, operator:AND, 100% minimum_should_match` + `match_phrase` boost | `product_name^10, brand^8, composition^7, keywords^6, disease^4` | EXACT |
| 2 — PARTIAL | `multi_match` on shingle + ngram sub-fields, `minimum_should_match:60%` | `product_name.shingle^8, product_name.ngram^5, composition.shingle^7, keywords.ngram^6, brand^6` | PARTIAL |
| 3 — FUZZY | `fuzzy` query, `fuzziness:AUTO, prefix_length:2, max_expansions:50` — **fires only on 0-result queries (no exact and no partial)** | `product_name^5, keywords^3, composition^4` — never strength | FUZZY |

**Field boost weights:** product_name `^10` > brand `^8` > primary_salt `^7` > keywords `^6` > composition `^4` ≈ disease `^4` > category_l1/l2/l3 `^2`.

**Strength boost = 0.** Strength participates only as filter clause, never scoring. A query of just `650` is blocked by Safety Gate before OpenSearch.

**Index schema (11 indexed fields + 4 control fields):**

| Field | Type | Analyser | Update Freq | Notes |
|---|---|---|---|---|
| product_id | keyword | none (ingest lowercased) | On create | `'PROD-0042'` → `'prod-0042'` |
| product_name | text | `standard_medicine + shingle + ngram` | On change | `.exact` sub-field also lowercased |
| brand | text+keyword | `standard_medicine` + `.exact` | On change | Dual-mapped |
| composition | text | `standard_medicine + shingle` | On change | Split to array for combination drugs |
| strength | text+keyword | `whitespace_exact` | On change | `'650 MG'` → `'650mg'`. **NEVER standalone numeric** |
| disease | text | `standard_medicine` | On change | Intent search e.g. `'fever tablet'` |
| category_l1/l2/l3 | keyword | none (ingest lowercased) | On change | Pure keyword fields |
| keywords | text | `standard_medicine + ngram` | On change | Aliases, trade names, curated synonyms |
| is_oos | boolean | — | **Real-time** (<5 min lag) | Drives OOS de-boost in Scoring Layer |
| l1_ranking_score | float | — | Daily 00:30 IST | 30-day ATC rate, normalised [0,1] per L1 category |
| product_type | keyword | — | — | `OTC` / `RX_Original` / `RX_Generic` |
| FC_list, MFC_list | list | — | — | Where the product is available |
| is_searchable | boolean | — | — | Brand-permission gate (don't surface on search) |
| supplied_by_tm | boolean | — | — | Can TM sell the product or not |
| medicine_type | string | — | — | Syrup / tablet / injection |

**Key analyser:** `whitespace_exact` on `strength` is what prevents partial numeric matches — strength values are stored as single tokens (`650mg`), not ngram-expanded.

**Keyword Lowercase Rule:** All keyword fields lowercased by ingest pipeline (no analyser does it). Query-time preprocessor applies the same step. Without this, `"Pain Relief"` indexed and `"pain relief"` queried wouldn't match.

**Preprocessing — Symmetry Contract (must be identical both pipelines):**
- Lowercase + Unicode NFC
- ASCII fold (ä→a)
- Unit Canonicalisation (`650 MG` → `650mg`)
- Dosage-form removal from ngram/shingle
- Synonym dictionary

**Query-time only steps:**
- Q-1 Input Sanitisation (strip HTML, truncate 100 chars)
- Q-4 Token Splitting
- Q-5 Token Classification (`DRUG_NAME` ≥3 alpha chars / `STRENGTH` digits+unit / `DOSAGE_FORM` / `STOP`)
- **Q-6 Safety Gate** — if zero `DRUG_NAME` tokens → block, return empty result, NO OpenSearch call
- Q-7 Strength Filter Decision (filter clause only, not scoring)
- Q-9 Tier Selection (cascade EXACT → PARTIAL → FUZZY)

**Index update pipelines:**
- Product data → near-real-time Kafka/SQS
- L1 ranking score → daily 00:30 IST bulk partial-update
- OOS status → near-real-time, < 5 min lag

**Scoring Layer formula:**
```
norm_relevance = relevance_score / max_relevance_in_result_set
norm_ranking   = l1_ranking_score / 100.0
blended_score  = (α × norm_relevance) + (β × norm_ranking)    # recommended α=0.70, β=0.30
final_score    = is_oos ? (blended_score − OOS_BAND_PENALTY) : blended_score

# Sort: primary = match_flag tier (EXACT → PARTIAL → FUZZY); secondary = final_score DESC within tier
```

**OOS de-boost rule:** OOS products visible but pushed to **end of their own relevance band**, never below into a lower tier. Enforced in Scoring Layer (not via OpenSearch function_score).

**Search Output Contract:**
```json
{ "product_id": "...", "product_name": "...", "brand": "...",
  "is_oos": bool, "match_flag": "EXACT|PARTIAL|FUZZY",
  "relevance_score": float, "ranking_score": float, "final_score": float,
  "oos_demoted": bool }
```

**Non-functional targets:** p95 < 200ms, p99 < 400ms, 99.9% availability, OOS sync < 5 min, zero-result rate < 5%, daily L1-score throughput 500+ TPS.

**Out-of-scope for V1:** personalised recommendations, vector/semantic search, real-time inventory sync, non-indexed field storage.

**Appendix asks:**
1. Primary salt added to index (now `^7` boost)
2. Rx medicines surfaced only when user searches by product_name / composition / primary_salt — index restricts other fields from matching Rx products

**Surface entry points (Whimsical):** SEARCH SUGGESTIONS, CATEGORY PAGES, DISEASE PAGES, SALT PAGES, OTC CAROUSELS, MEDICINE LISTING A-Z.

**Ground truth for validation:** Mixpanel events (`Search Initiated`, `Search Result Clicked`, `PDP Viewed`).

**Internal validator:** `search-validator` project (replay-dual harness) [memory `project_search_validator`].

#### Pricing

- Display on PDP: striked MRP + green TM price + ₹ saved + % saved
- `MRP - order_value = saving_value` (cart). Final billed = `final_calculated_amount.final_amount`
- Discount stack (from `final_calculated_amount` columns):
  - `discount` (item / coupon / GX swap savings)
  - `tm_cash` / `tm_credit` / `tm_cashback` / `tm_cash_back` (wallet redemptions)
  - `price_lock_disc` (price-lock product perk)
  - `adjustment_amt` (manual ops adjustment)
  - **Additions:** `delivery_charge` / `packaging_charge` / `cash_handling_charge` (charged when COD enabled per pincode)
- GST: 6 codes (0 / 5 / 12 / 18 / IGST18 / IGST28) on every line item
- **Price Lock feature** — customer-facing protection against MRP increases. When a customer adds an item with price-lock eligibility, `price_lock_disc` is captured at `final_calculated_amount` so the user sees stable pricing even if MRP later goes up. Config masters: `PRICE_LOCK_THRESHOLD_X`, `PRICE_LOCK_STAGE`
- Margin masters: `TRUEMEDSMARGIN`, `STOCKISTMARKUP`, `CONFIRMEDCOSTREDUCTION`, `MAXSELLINGPERCENTAGE`

#### Substitution algo — DEEP

**Source:** `probab-subs-persona/memory/ALGO_CONTEXT.md` (2026-04-06, locked from Truemeds Algo Summary PDF + DB exploration).

**API:** `findBestSubForProducts` (TMEXP3 bulk pattern: concurrency=10, rate=100/min [memory `project_tmexp3`]).

**Coverage:** ~35% of the ~2 lakh-product catalogue has generic substitutes. Customer savings up to 50% on substituted lines.

##### Fulfilment-centre layout

5 FCs, ~26k pincodes total. Each FC maintains its OWN substitution mapping table (pre-computed nightly):

| FC | City | `warehouse_id` | Pincodes | Output table |
|---|---|---|---|---|
| Bangalore Hub | Bangalore | **17** | 10,276 | `org_sub_medicine_mapping_bangalore_hub_new_algo` |
| Kolkata Hub | Kolkata | **22** | 5,249 | `org_sub_medicine_mapping_kolkata_hub_new_algo` |
| Mumbai Hub New | Mumbai | **20** | 4,732 | `org_sub_medicine_mapping_mumbai_hub_new_algo` |
| Delhi Okhla FC | Delhi | **19** | 4,583 | `org_sub_medicine_mapping_delhi_hub_new_algo` |
| Lucknow New | Lucknow | **37** | 2,261 | `org_sub_medicine_mapping_lucknow_hub_new_algo` |

Each output table ~3.2M rows (covers all branded × candidate-substitute combinations). Mapping is pre-computed; runtime API just reads it. Pricing rules: **MRP varies by warehouse, discounts are company-wide**.

##### 6-step algorithm

**Step 1 — Should substitution happen?**

- `medicine_master.keep_orginal = 1` → keep original, no sub. (DB typo: column literally spelled `keep_orginal`)
- If original is `Generic AND availability=1 AND supplied_by_tm=1` → keep original (already cheapest)

**Step 2 — Find same-molecule candidates**

```sql
-- 2.1 Get molecule code for original
SELECT molecule_code FROM medicine_molecule WHERE product_code = '<ORG>'

-- 2.2 Get all products with same molecule
-- NOTE: works for SUBSTITUTION because <MOL> = the original's exact composite molecule_code
-- string from 2.1 (matches identical composition only). It does NOT find a molecule's products
-- by NAME (different strengths/combos have different molecule_code strings). For molecule-by-name
-- → all products (single + combos) use molecule_combination_cd token — see tm-chotu-joins Recipe 8.
SELECT product_code FROM medicine_molecule WHERE molecule_code = '<MOL>'

-- 2.3 Filter eligible candidates (per warehouse)
SELECT mm.*, mwm.*
FROM medicine_master mm
JOIN medicine_warehouse_master mwm ON mm.product_code = mwm.product_code
WHERE mm.product_code IN (...same molecule set...)
  AND mm.drug_type = '<ORG_drug_type>'   -- tablet / syrup / capsule must match
  AND mwm.consider_poduct = 1            -- DB TYPO: consider_poduct (not consider_product)
  AND mwm.warehouse_id = <FC>            -- e.g. 20 for Mumbai
  AND mwm.availability = 1               -- MANUAL flag, NOT real-time inventory
  AND mwm.supplied_by_tm = 1
```

Auto-exclusions: pack has `*` (multi-pack like `10*10`), `availability=0`, `consider_poduct=0`, mismatched `drug_type`.

**Step 3 — Re-add original if excluded but generic**

If original was filtered out (`consider_poduct=0`) but it's `generic_branded='Generic'`, force-add it back to the candidate list. Let ranking decide.

**Step 4 — Enrich each candidate**

Per candidate:
1. Pull warehouse-specific `mrp`, `pts`, `ptr` from `medicine_warehouse_master` (overrides master)
2. Determine discount: product-specific → else base discount → else variant discount
3. Exclude if pack has `*`
4. Compute substitute recommended quantity:
   ```
   ratio = originalPack / subsPack
   ratio ≥ 1 AND exact     → subRecommendedQty = ratio
   ratio ≥ 1 AND not exact → subRecommendedQty = floor(ratio) + 1   # round up
   ratio < 1               → subRecommendedQty = 1                  # minimum 1
   ```

**Step 5 — Rank by TS (critical)**

**TS = TruemedsSavings = maxSellingPrice − minSellingPrice**

> ⚠️ TS is **TrueMeds' per-unit profit margin window**, NOT customer savings.

```
minSellingPrice = PTS + (PTS × GST%) + (OriginalMedicine_MRP × TrueMeds_Margin%)
                  # floor; never sell below this
                  # PTS = cost to acquire (medicine_warehouse_master.pts)
                  # TrueMeds_Margin ≈ 5% of original MRP

maxSellingPrice = min(
  Substitute_MRP × (1 - baseDiscount%),
  OriginalMedicine_MRP × CostReduction%             # cap at original × ~92%
)
                  # ceiling; guarantees customer never pays more than original
```

Process:
1. Calculate TS for each candidate (including original)
2. Add original to candidate list
3. Sort all candidates by TS DESC
4. Keep only those with `TS ≥ original_TS`
5. Pick top-ranked

**Step 6 — Final business-eligibility gate**

| Case | Rule |
|---|---|
| TS ≥ 0 | `subsEligible = true` UNLESS `keepOrg=1` |
| TS < 0 | Use `orgSubsDiff` tolerance (~2%). Reject if BOTH: (a) `maxSP ≥ orgMrp/unit × (baseDiscount + orgSubsDiff)/100` AND (b) `orgMrp/unit × costReduc/100 + abs(TS) > orgMrp/unit × (baseDiscount + orgSubsDiff)/100`. Else accept the loss-making sub. |
| `keepOrg=1` | Always `subsEligible = false` |

Plain English: "Accept a slightly loss-making substitute only if it's not too expensive relative to the original."

##### Output table columns (`org_sub_medicine_mapping_*_hub_new_algo`)

Pre-computed per warehouse. Key columns:

| Column | Meaning |
|---|---|
| `original_product_code` | Branded SKU customer searched / ordered |
| `original_mrp`, `original_pts` | Branded price at this warehouse |
| `subs_product_code` | Best substitute selected |
| `subs_mrp`, `subs_pts` | Substitute price at this warehouse |
| `subs_found` | bit — 1 = eligible sub exists |
| `subs_available` | tinyint — 1 = sub currently in stock |
| `savings_percentage`, `savings_value` | Customer-facing savings |
| `ts` | TruemedsSavings (margin window) |
| `score` | Overall ranking score |
| `top_product_rank` | Rank of substitute among candidates |
| `subs_taken_count` / `substitute_taken_count` | Acceptance signals (count shown vs accepted) |
| `prod_searched_count` | Times original was searched |
| `is_chronic`, `is_otc`, `med_type` | Classification flags |
| `experiment_id` / `variant_id` | A/B test linkage |
| `sub_recommended_qty` | Quantity to match original pack size |

##### Source tables (algo inputs)

| Table | Rows | Use |
|---|---|---|
| `medicine_molecule` | 222,807 | `product_code → molecule_code` + `molecule_combination_cd` for multi-salt |
| `medicine_master` | 231,012 | One row per unique product (default MRP/PTS/PTR, `consider_poduct`, `keep_orginal`, `generic_branded`, `drug_type`, `pack`, `med_type`, `acute_chronic`, `rx_required`, `strength`, `mat_sales`, `mat_units`) |
| `medicine_warehouse_master` | 8,063,217 | Product × warehouse overrides. Includes warehouse-specific MRP, PTS, availability flag, consider_poduct override, branded_tag, is_otc |
| `warehouse_details` | — | Maps `id` → name, city, alias, GSTIN. WH ID 20 = Mumbai (per algo PDF) |

##### Persona signals on order line items

| Signal | Source | Meaning |
|---|---|---|
| `product_details.cx_accepted_subs` | Per line item | Did the customer self-opt for sub at checkout (1) or not (0)? |
| `final_substitute_product_cx_confirm.status_id` | Per line item | 61 = sub kept, 62 = original kept at checkout |
| `final_substitute_product_cx_confirm.reason_id` | Per line item | Rejection reason (null = no sub offered) |
| `final_substitute_product_dr_confirm.status_id` | Post-HA call | 61 = sub kept after HA, 62 = original kept after HA |
| `final_substitute_product_dr_confirm.reason_id` | Per line item | 9 = explicit rejection after HA push |

##### Gold / Silver / Bronze persona tiers (probab-subs-persona)

| Tier | Signal | Definition |
|---|---|---|
| 🥇 Gold | `cx_accepted_subs=1 AND cx_confirm.status_id=61` | Self-opts at checkout — no HA needed |
| 🥈 Silver | `cx_accepted_subs=0 AND dr_confirm.status_id=61` | Declined at checkout, HA converted them |
| 🥉 Bronze | `cx_accepted_subs=0 AND dr_confirm.reason_id=9` | Explicit reject even after HA push — churn candidate |
| ⭕ N/A | `cx_confirm.reason_id IS NULL AND subs_product_code = product_code` | No substitute was offered |

This tier mapping is the bridge from TMEXP1 (probab-subs-persona) into the DCOE Substitution-propensity dimension (SA/SW/SR/SNO — see § 3).

##### Four lever families (probab-subs-persona Goal 2)

1. **Substitution** — therapies/products with high potential but low acceptance → improve algo/selection
2. **Pricing** — Silver/Bronze price-sensitive customers → which discount/price structure tips them
3. **Margin (TS)** — where is Truemeds absorbing a loss for sub uptake, is it working? High-TS-low-acceptance signals brand affinity (not price)
4. **Brand affinity** — Bronze customers stubbornly stick to branded → HA scripts / trials / offers experiments

##### Outcome on order

- `medicine_status` master values: 61 SUBSTITUTE / 62 ORIGINAL / 211 NO SUBSTITUTE
- `ORDER_CATEGORY` master (10 codes) for cohort segmentation: FTC × Repeat × {partial sub / no sub / not possible / valid Rx / not in stock / pharmacist sub}

##### Critical caveats — propagate to query rigor

1. **DB column typos** — must use exact typo'd names: `consider_poduct` (NOT `consider_product`), `keep_orginal` (NOT `keep_original`). Quoting the correct spelling will return no rows.
2. **`availability` is a MANUAL flag**, not real-time inventory. Can be stale.
3. **Multi-pack exclusion** — `pack` containing `*` (e.g. `10*10`) is auto-excluded from sub.
4. **TS ≠ customer savings** — TS is profit margin. Customer savings = `original_mrp − subs_selling_price`.
5. **`disease_product_mapping` join requires `LOWER(product_code)`** — therapy mapping table stores product codes in lowercase while `medicine_master` uses uppercase.

##### Therapy / disease mapping (drives propensity tiers)

Therapy via 4 master tables linked through `disease_product_mapping` (439,760 rows; active+approved ~399k; **83.9% catalogue coverage** = 194k of 231k products mapped):

| Master | Rows | Purpose |
|---|---|---|
| `disease_master` | 176 | Disease names (HYPERTENSION, DIABETES TYPE 2, …) |
| `disease_category_master` | 158 | Drug categories (ANTIHYPERTENSIVE, ANTIDIABETIC, …) |
| `otcvalue_master` | 203 | OTC categories (`name` = top-level, `value` = sub-level) |

`disease_product_mapping.type` drives the join: `DISEASE` → `disease_master`, `DISEASE_CATEGORY` → `disease_category_master`, `HEALTHCARE` → `otcvalue_master`. Always filter `priority='D1'` for primary label. ALWAYS filter `active=1 AND is_approved=1`.

**Top 5 drug categories by product count:** ANTIBIOTIC (35,710) / ANALGESIC (12,708) / ANTIDIABETIC (11,307) / ANTIHYPERTENSIVE (11,130) / ANTACID (10,574).

**Sub propensity tiers (clinical):**

| Tier | Drug categories |
|---|---|
| 🟢 High | ANTIBIOTIC, ANALGESIC, ANTIPYRETIC, ANTACID, ANTIEMETIC, ANTIDIARRHOEAL, ANTIFUNGAL (topical), VITAMIN, NUTRITIONAL SUPPLEMENT, COUGH COLD PREPARATION |
| 🟡 Medium | ANTIDIABETIC, ANTIHYPERTENSIVE, HYPOLIPIDEMIC DRUGS, ANTIASTHMATIC, ANTIALLERGIC, MUSCLE RELAXANT, HAEMATINICS |
| 🔴 Low | ANTINEOPLASTIC, ANTIEPILEPTIC, STEROID (systemic), HORMONE REPLACEMENT THERAPY, ANTIPSYCHOTIC, DRUGS FOR PERIPHERAL NEUROPATHY |
| ⭕ OTC/HealthCare | Hair Care, Baby/Mom Care, Ayurvedic — high propensity, low clinical stakes |

##### Golden rule (locked across TMEXP1 + DCOE)

**Retain more subs-accepting users = higher CM users.** Subs acceptance → better margins because generic products have higher TS, branded products often have thin or negative margins. Substitution IS Truemeds' core value proposition.

#### Chronic engine

- Identifies recurring molecule pattern per customer (chronic vs acute split via `ACUTE_CHRONIC` master: 139 ACUTE / 140 CHRONIC)
- Drives reorder reminder cadence (~30 days, tunable via masters)
- Master config knobs: `CHRONIC_AVG_ORDER_CYCLE`, `CHRONIC_QUARTER_COUNT`, `CHRONIC_REORDER_BATCHSIZE`, `CHRONIC_PRIOR_TRIGGER`
- Tagging tables: `order_chronic_map_*` + `chronicity_rx_analytics` + `chronicity_otc_analytics` (⚠️ all flagged validate-before-use in § 3 — preferred derivation is Mixpanel + product order history + product chronic tagging in catalog)
- Output feeds Pill Reminder Portal

#### Reminders (channel mix)

- 30-day chronic refill: Push (primary) + SMS (fallback) + WhatsApp (high-value chronic)
- Cart-abandon: Push within 24h
- Re-engagement: 60+ day dormant
- DND honoured via `PILL_REMINDER_STATUS = 538 DO NOT DISTURB`
- Send-channel master: `SEND WHATSAPP SMS`

---

### Order-flow operational modules

#### Live Inventory

- Per-warehouse SKU live qty in NetSuite + DB
- Threshold-flag system: `SKU Threshold` + `Set Inventory/Non Inventory Flag` (config in NetSuite)
- `INVENTORY_TYPE` master: INVENTORY / JIT 1 / JIT 2 / Central Bulk / WH weekly JIT
- **Threshold breach behaviour**: blocks BOTH the original AND the substitute pre-confirmation (where sub possible). On doctor call — if substitute NOT opted-for — sub is released/unblocked.
- **Recalc every 3 days**
- Triggers `Update Inventory` event → drives downstream PUTAWAY / PICKLIST / WAREHOUSE ASSIGNMENT state

#### Warehouse Assignment

- Trigger points: SEARCH / CATALOG / PDP / CART / SUMMARY (5 surfaces all re-check)
- Routing decision: `Inventory Order?`
  - **Yes** → MFC Assignment (Micro-Fulfilment Centre) → MFC Most Common Price → Subs Calc on MFC Price → MFC ETA
  - **No** → FC Assignment (Full Centre) → FC Most Common Price → Subs Calc on FC Price → FC ETA
- Warehouse types (master 'WAREHOUSE TYPE'): 454 WAREHOUSE / 455 HUB / 553 MFC
- Pincode → warehouse mapping via `pincode_warehouse_master`, `pincode_microfc_master`, `analytics_pincode_microfc_master`
- Sets `order_details.warehouse_id` on confirmation
- orderstatus transition: → 233 WAREHOUSE ASSIGNED

#### Picklist module — 3 variants

| Variant | Flow |
|---|---|
| **Single picking** | One picker per order. Login → Mark Available → Assign/Search Order → View 1-1 med on pick-path → Scan order box → Pick + qty → Deduct from rack + DB → Submit → Scan shown rack |
| **Multi-order picking** | One picker picks for many orders in one pass into a master container → Sorter (no, that's pigeon-hole) — wait no, multi-order = master container, picker scans bin per order. Add: Login as Admin → Create Picklist Rule → Upload CSV → Generate Picklist. Then Picker → Scan master container → 1-1 med per rack + order bin → Pick → Deduct |
| **Multi-order pigeon-hole (zone-wise)** | Zone-wise picklist per picker; Sorter role added downstream. Picker drops into drop-zone → Sorter scans picked container → Assigns picklist to pigeon hole → Places med in pigeon-hole box/bin |

**Roles in module:** Picker / Sorter / Checker / Problem Solver. Statuses: PICKLIST STATUS (Open / Picker Assigned / Picking In Progress / Picked / Picker Issue / Closed / Cancelled). PICKER + CHECKER statuses (PENDING / PICKED / CHECKED / ISSUE).

**Issue handling:** Mark Issue → Entry in issue dashboard → Login as Problem Solver → Resolve (procure remaining qty / adjust order / etc.)

**Checker flow:** Mark Available → Scan order box → View med + qty → Select picked batches → Verify box → Verify all meds with expiry → Generate Invoice → Deduct qty from NetSuite → Ready to ship

#### Replenishment module

- Two zones: **Bulk Zone** + **JIT Zone**
- Replenishment Task driven by:
  - **Min Limit** check → No → continue; Yes → No action
  - **Near Expiry** check → Auto-task: Near Expiry routing
- Picking-Path → Qty/Info → Excess/Short/Damage tracking → Picking Task → Update Reports
- Reports: Replenishment vs Pending, Excess vs Short
- Min/Max controls: Pause Min Max / Reinitiate Min Max
- Login → Home → Assigned Hub

#### Putaway module

8 putaway types ('PUTAWAY TYPE' master):

| Code | Type |
|---|---|
| 540 | ORDER PUTAWAY |
| 541 | TO PUTAWAY (Transfer Order — between WHs / HUBs) |
| 542 | BILL PUTAWAY (post-procurement inwarding) |
| 551 | BIN TO BIN |
| 562 / 576 | COLDCHAIN PUTAWAY |
| 583 | REVERT PICKING PUTAWAY |
| 683 | BATCH VERIFICATION PUTAWAY |

**FBD variant** (Faridabad-specific): dedicated PUTAWAY-FBD flow exists; identical state machine, different physical zone routing. Receives: TO / Bill / Cancel/RTO/DTO orders → Search/scan container → 1-1 med with qty/batch/expiry/rack → Rack + enter qty → Add to rack, DB, NetSuite → Submit → Scan shown rack.

**Edge handling:** Found damaged/missing/expired → Quarantine zone. Rack-full → Suggest next rack.

**Adjustments:** Bin-to-Bin Inventory Adjustment, Rack/Product Locator, Batch Adjustment.

#### Central Procurement

Operates the Procurement dashboard:

- **Workflows:** Ordering Plan → Generate PO → Cycle Selection → Upload Sheet → Inwarding & Invoicing → View PO Download → Close PO → Edit/Update PO → QC Process → Bill Inwarding → Auto-Close PO → Edit/Update Invoice → Auto VRA → Rate Comparison → Quantity Comparison → Bill Closed?
- Other dashboards: Inwarding / Bulk operation / Change Pack Size / Refill Procurement / Inventory Count / VRA Inwarding + VRA Details + Bulk VRA / PO Checker / Temp Edit / Back Order Procurement / Create PO / Receive Products
- Masters: PROCUREMENT TYPE, PROCUREMENT STATUS, PROCUREMENT TAG TYPE, PARENT PROCUREMENT TAG TYPE, RATE_MISMATCH_ACTION (auto-handles rate disputes), EXCESS_QUANTITY_ACTION, BULK PROCURMENT ACTION
- NetSuite is the financial source-of-truth: customer + item + invoice live there. `net_suite_invoice_batch` + `net_suite_purchased_order` (+ `net_suite_items`, `net_suite_pending_purchase_order`, `net_suite_purchase_tracker`, `net_suite_sales_receive`, `net_suite_vendor`) tables on DB 170 mirror NS state for analytics

##### Product/molecule-level invoiced sales + geography (locked 2026-06-05)

For "sales of product/molecule X by state & month" use **`net_suite_invoice_batch`** (line-level: `order_id`, `product_code`, `quantity`, `rate`, `mrp`, `returned_qty`, `active`, `created_on`) — NOT `final_calculated_amount` (per-ORDER, can't split by product).

- **Invoiced value = `rate * quantity`.** The `amount` column is **NULL** (≥2024). Filter `active = 1` (drops reversed lines), `organisation_id = 1` (via `order_details`).
- **Molecule universe (single + ALL combinations):** match `medicine_molecule.molecule_combination_cd` token `LIKE '%-<code>' OR LIKE '%-<code>-%'`. `medicine_molecule.molecule_code` is a composite strength-string, NOT the int code. Resolve `<code>` from `molecule_master` (name→int code; **DB 2/630 only, not Redshift**) — e.g. PREGABALIN = 1527 → 1,512 SKUs.
- **State** (`d_address_master.state_id` & `city_id` are 100% NULL): canonical chain (100% coverage) =
  `d_address_master.pincode_id → pincode_warehouse_master.id → city_id → m_city_master.state_id → m_state_master.state_name`. All PK hops, no fan-out. `customer_state` free-text is ~40% filled + dirty — fallback only.
- ⚠️ `net_suite_invoice_batch` can be **incomplete for the latest month** (e.g. Sep-2024 northern states ≈ 0) — verify tail-month completeness before trusting.
- Full runnable recipe: `tm-chotu-joins` Recipe 8.

#### Logistics

- **Serviceability check** at PDP + checkout (pincode → warehouse → courier partner)
- **Courier Partner Priority** matrix (which partner gets the order first for a given pincode)
- Masters: `m_courier_partner_master`, `pincode_master`, `pincode_warehouse_master`, courier partner pincode TAT adherence calculation
- **3PL universe — locked from `m_courier_partner_master` (13 partner IDs):**

| Partner ID | Name | Express? | Notes |
|---|---|---|---|
| 3 | EcomExpress | Yes + Surface | |
| 4 | Delhivery | Yes + Surface | Routed via Shiprocket too (`Delhivery Surface`) |
| 5 | Bluedart | Yes + Surface | Via Shiprocket: `Blue Dart` + `Blue Dart Surface` |
| 6 | XpressBees | Yes + Surface | |
| 9 | Shadowfax Express + Shadowfax Surface | Yes | |
| 35 | Self | No | In-house |
| 105 | Shiprocket | No | Aggregator routing to others |
| 130 | WeFast | No | Routes via `Borzo Timeslot` |
| 150 | Shipsy | No | |
| 170 | Ithink Logistics | No | |
| 193 | CABT | No | |
| 207 | Blitz (formerly Grow Simplee) | No | |
| 212 | ATS (Amazon Transportation Services) | No | |
| 564 | Urbanebolt ANKW | No | ANKW WH entity |
| `null` | Hand Delivery | No | In-house manual |

**Additional fields on master:** `reverse_courier_partner_id` (separate ID for return pickup), `zoho_account_id` + `net_suite_account_id` (financial integration), `svm_id`, `ankw_*` variants (ANKW WH-specific accounts).

- AWB lifecycle: orderstatus 217 ASSIGNED TO DELIVERY PARTNER → 289 AWB STICKER PRINTED → 60 DISPATCHED → 275 OUT FOR DELIVERY → 285 PICKED UP → 55 DELIVERED (or 284 DELIVERY FAILED)

#### Dispatch Portal

Three roles: Picker / Sorter / Checker / Problem Solver / Packer.

End state: Generate Invoice → Deduct qty from NetSuite → Pack to new container → Print Pack-slip → Paste on container → Order packed and ready to ship.

---

### Internal portals

#### Doctor Portal — Rx review + substitution

- **Onboarding:** Registration form → Super Admin approval (Pending / Approved / Not Approved lists)
- **Daily ops:** Login → Assigned Warehouse → Enable Online → Earnings & Incentives, Fraud Count, Pending Orders, Assign Order List, Order Details (Patient, Delivery, All Originals SKU, All Subs, Bill Details, Order Info & Subs)
- **Actions:** Call Patient → Confirm Order / Hold Order / Cancel Order
- **Order-doctor state:** `ORDER_STATUS_DOCTOR` master: 32 ASSIGNED / 33 CONFIRMED / 34 DECLINED / 35 MODIFIED
- **Doctor categories** (5): DR_CATEGORY_ONE to FIVE (`DOCTOR_CATEGORY` master) — drives routing + pricing
- **Doctor blocking:** `DOCTOR_BLOCK_TYPE`: 328 CALL LIMIT BREACHED / 329 NO SUBSTITUTION LIMIT BREACHED
- **Patient Ranking** drives delivery address ETA prioritisation
- orderstatus events tracked: 209 DOCTOR ASSIGNED, 215 DOCTOR CALL ATTEMPTED, 216 DOCTOR ORDER ON HOLD, 276 DOCTOR CALL SCHEDULED, 317 DR ORDER CONFIRMED, 405 ASSIGN TO DR, 407 DOCTOR_FRAUD_HOLD

#### Doctor Super-Admin

Dashboard / Statistics / Earnings / Delivery Statistics / Broadcast Message / Doctor Blocked List / Doctor Allocation / Live Order / Category / Incentive Management / Schedule / Role Management / Doctor Category / Doctor Calls / Call Management / Category Blocking / Dosage Tagging / Doctor Fraud / OTC Insights / Pilot Order Statistics / IVR

#### Pharmacist Portal — Type 1 (RX-only)

**Routing rule (locked):** `ORDER_TYPE` determines who handles digitization.

| ORDER_TYPE code | Meaning | Routed to |
|---|---|---|
| **52** | RX (prescription only) | **Pharmacist Type 1 queue** |
| 53 | RX AND MEDICINES | **Doctor directly** (bypasses Pharmacist) |
| 54 | MEDICINES (only meds, no Rx) | **Doctor directly** (bypasses Pharmacist) |

Pharmacist Portal handles ONLY Type 1 orders.

Flow: Login → Type 1 Order Listing → Assign/Unassign/Filter Order → Open Order Details → View customer ratings / past orders / Rx / subs history / CSR tickets / communication / call status → Search Products / Change Quantity / Set Payment / Add/Remove cart / Manage Addresses/Profile/Patients → Calculate delivery date → Search/Add doctor → Apply coupon + TM rewards → Add notes → DIGITIZE ORDER / DISCARD ORDER / MARK UNREACHABLE / View bill details / Validate prescription(s)

orderstatus events: 213 PHARMACIST MAKER ASSIGNED, 214 PHARMACIST CHECKER ASSIGNED, 236 PHARMACIST CALL ATTEMPTED, 300 PHARMACIST ORDER ON HOLD, 452 PARTIALLY DIGITIZED.

`DRX_STATUS` master tracks Rx-digitization state: 29 PENDING FOR DIGITIZATION / 30 DIGITIZED / 31 INVALID_RX / 37 MULTIPLE RX.

#### Health Advisor (HA) Call portal

- Triggered when SUBSTITUTE is available (post ORDER CONFIRMED, pre WAREHOUSE ASSIGNED)
- orderstatus → 595 HEALTH ADVISOR CALL ATTEMPTED
- Flow: Login → Dashboard → Agent Shift / Statistics / Target Mgmt / OTC Sales Dashboard / Assign-Unassign Order / Incentive Management
- Per-order: Fetch Order → View details → Call Customer → Read Prescription(s) → View Products → Change Quantity / Payment method → Substitution (Replace original / Keep both) → Cancel / Hold / Place Order
- **Cart constraint:** HA can add only OTC (`ITEM_TYPE = 475 OTC`); cannot add Rx
- HA-eligibility config: `HA CALL ELIGIBILITY Y`, `HA CALL X DATE RANGE`, `HA CALL Y DATE RANGE` masters

#### CSR Portal — Create Order

Inbound customer call entry point. Login → Receive customer call → Search Mobile number → View customer details → Call → Upload Prescription / Search Products / View / Change qty / Manage everything → Place Order → ORDER FLOW.

#### CSR Portal — Post Order

Servicing existing orders. Login → Order Listing → Filter / Search / Open Order → View order details / customer details / past orders / customer ratings / subs history / CSR tickets / communication / Invoice details / return bill / bill details / TM Rewards.

Actions: Call Customer / Cancel Order / Mark Unreachable / Track order status / Add alternate number / Add email / Calculate delivery date / Generate return ticket (post-confirm) / Generate return request / Rank up order / Upload Prescription.

#### Assisted Commerce Portal

Outbound sales (OTC-heavy). Login → Dashboard → Agent Shift / Statistics / Score / Target Mgmt + OTC Sales Dashboard (OTC Sales Connected %, Substitution AOV, OTC Sales Customer Type Converted %) + Assign Order + Incentive Management.

Per-order: Fetch Order → View order details → Call Customer → Search Products → Read Prescription(s) → View Products → Change Quantity / Payment method → Cancel Order → Add/Remove cart → Manage Addresses/Profile/Patients → View Bill → Place Order / Reschedule → ORDER FLOW.

orderstatus events: 331 AGENT CALL ATTEMPTED, 332 AGENT ORDER ON HOLD, 333 AGENT CALL SCHEDULED. `ASSISTED_COMMERCE_AGENT_ROLE` master pins role.

#### Pill Reminder Portal

Chronic refill outbound. Login → Dashboard → Manage Group Mapping / Download Reports / Assign Reminder / Un-assign Reminder.

Per-reminder: Fetch reminder details → View customer details → Call Customer → Search Products → View past Prescription(s) → View Products → Change Quantity / Set Payment method → DO NOT DISTURB / Add or Remove cart → Manage Addresses/Profile/Patients → View Bill → PLACE ORDER / SET NEW REMINDER / RESCHEDULE / RE-ATTEMPT LATER → ORDER FLOW.

Statuses (`PILL_REMINDER_STATUS`): 309 NOT NEEDED / 310 UNREACHABLE / 311 ORDER PLACED / 314 CANCEL REMINDER / 537 SKIP REMINDER / 538 DO NOT DISTURB / 539 REATTEMPT LATER. Reminder type: BY DATE / BY FREQUENCY. Reminder category: CHRONIC / NON CHRONIC.

orderstatus: 316 REMINDER CALL ATTEMPTED.

---

### Admin & control modules

#### Hub Config / Min-Max admin

Mega-panel covering hub-level controls:

- Role & Access Management
- SKU Categorization (`SKU_INV_CATEGORY`)
- Bulk SKU List
- Hub Transit Days & Threshold
- Potential Bulk List
- Hub Inventory + Refill at Hub
- Refill PO Tracking
- TO Transit Days, Local Ordering Transit Days
- Hub Picking Calendar (+ Holiday List)
- Parent-Child Mapping
- Hub-level SKU Forecasting
- TO SKU List + Refill SKU List
- RQ-TO Request Tracking + RQ-Refill Request Tracking + Urgent Orders Request Tracking
- **Permanent Pincode Movement** (re-routing pincodes between WHs)
- **Cold Chain SKU List** (separate handling)
- **Homeopathy SKU List**
- Old/New Pack Size mgmt + Inventory Reports
- Excess Inventory Report
- Thresholds
- WH Prioritization

#### Dynamic Content Management (owned by CMT, executed across PM + Marketing)

Surfaces:
- Homepage Category Management
- Coupon Management (Marketing) — masters: OFFER_TYPE (Instant / Cashback / Both), OFFER_STATUS, DISCOUNT_TYPE (BY PRICE / % / % UPTO / % ALL / CASHBACK)
- OTC Product Carousel Management
- Catalog Management — Manage Molecules / Companies / Products (WH-Level + Global)
- Banner Management
- CMS
- Disease Pages + Disease Master + Disease Category Master → Approver Flow
- OTC Pages + OTC Master + OTC Sub Category
- Salt Master + Salt Page Legends
- Role Management
- **Capping / Blocking** (per-SKU max-allowed cap per customer) → Approver Flow

CMT workflow: `CMT STATUS` (APPROVED / PAUSED / REJECTED) × `CMT APPROVALS` (CATALOGUE / SUBSTITUTION / BOTH).

#### Fraud

Three sub-systems:

| Sub-system | Scope | Project |
|---|---|---|
| **Affiliate Fraud** | Affiliate orders across ALL channels (web/app/ios) — `utm_source` like `aff*` (web) + `odm.source` channel tag. Address/phone injection, identity rings, RTO abuse. Daily engine scores a curated scope file → 24 signals → FRAUD/SUSPECT/CLEAN. **SHIPPED & LIVE** (see KD §15) | `tm-fraud-engine` [memory `project_tm_fraud_engine`] |
| **Doctor Fraud** | Doctor Portal "Fraud Count" + Super Admin "Doctor Fraud" module. orderstatus 407 DOCTOR_FRAUD_HOLD when triggered | DOCTOR PORTAL Super-Admin |
| **Order Fraud** (general) | Verification states: 292 REQUEST VERIFICATION FAILED, 297 ORDER VERIFICATION FAILED, 293 ORDER VERIFIED, 296 REQUEST VERIFIED | Order verification flow |

---

### Other

#### Diagnostics (high-level)

Recently launched vertical, picking up well. Lead: Prajwal.

**Flow (confirmed):**

```
Customer calls (or books via app/web)
   → We book the test
   → Phlebotomist (phlebo) visits home → collects sample
   → Sample sent to partner lab
   → Reports sent to customer
```

**Tables:**
- `tm_diagnostics_catalog_master` — test catalog (HbA1c, lipid panel, etc.)
- `tm_diagnostics_order_master` — order header
- `tm_diagnostics_order_master_lineitem` — tests booked per order
- `tm_diagnostics_order_master_event` — event log (booking → collection → result)
- `tm_diagnostics_order_master_address` — collection address
- `tm_diagnostics_order_master_order` — link to medicines order if combined
- `tm_diagnostics_order_master_phlebo` — phlebo assignment + routing

Tied to chronic customers (recurring tests for diabetes, lipid panel, thyroid). Deep expansion deferred — Prajwal to push via plugin update.

#### Pincode Mapping module

- Maps pincode → serviceable warehouse(s) (Full Centre / MFC / Hub)
- Drives serviceability check at PDP / checkout + COD eligibility decision
- Tables:
  - `pincode_master` — base pincode list
  - `pincode_warehouse_master` — pincode → warehouse mapping
  - `pincode_microfc_master` — pincode → MFC mapping
  - `analytics_pincode_microfc_master` — analytical rollup
  - **Permanent Pincode Movement** admin (re-route pincodes between WHs) lives under Hub Config
- Used by:
  - Warehouse Assignment module (routes order to MFC vs FC)
  - Logistics module (courier partner pincode TAT adherence)
  - COD enable/disable per pincode (in checkout flow)
- [REDLINE: deeper context available in other projects per user]

---

## § 6 — Data sources

53 Metabase databases total + Mixpanel Production Env 2900163. Sweep via native Metabase MCP `list` (2026-05-15, re-verified 2026-05-27).

### MCP routing — HARD RULE (v0.1.6)

All Metabase queries route through the **native Metabase MCP** at `https://one-truemeds.metabaseapp.com/api/mcp` (Metabase 0.55+ native server). Tool namespace is UUID-prefixed (`mcp__<uuid>__*`) or `mcp__plugin_tm-chotu_metabase__*` post-OAuth. Toolset signature: `search`, `get_table`, `execute_query`, `construct_query`, `query`, `list`, `get_metric`, `create_question`, `create_dashboard`.

The **unofficial community MCP** (`mcp__Metabase__Unofficial___Community___*`, toolset `list / retrieve / execute / export / clear_cache`) is sunset. Do not use. If only the unofficial is available, tell user — never silently fall back. Full policy in `tm-chotu-query-rigor` § "Metabase MCP — namespace policy".

### A. Default for tm-chotu

| DB ID | Name | Engine | Why default |
|---|---|---|---|
| **170** | **Redshift** | Redshift | **PRIMARY** — shared Redshift everyone at Truemeds has access to. Main DB mirror + analytical tables. Use this for everything by default |

DB 170 schema:

| Schema | Tables | Use |
|---|---|---|
| `tmmumpsdb` | 156 | Main DB mirror + analytical (probed 2026-05-15). Includes all critical tables: `order_details`, `final_calculated_amount`, `customer_details`, `order_status`, `product_details`, `m_system_value_master`, `m_courier_partner_master`, `medicine_master`, `medicine_warehouse_master`, `medicine_molecule`, `disease_product_mapping`, `org_sub_medicine_mapping_*_hub_new_algo` (5 hubs), `final_substitute_product_*` variants, `orders_campaign_attribution`, `appsflyer_installs`, `package_details_tracking` |
| `public` | 2 | (minimal) |

**Note:** DB 663 (Mangesh Redshift) is Mangesh's personal scoped instance with 198 tables (incl. `maranalytics` + `public` schemas with ads + DMS outputs). Most Truemeds employees do NOT have access. **Do not default users to 663.** Use it only if a query explicitly requires the extra tables AND the user has access.

### B. Production transactional MySQL (live)

| ID | Name | Use |
|---|---|---|
| **2** | **Main_DB (TMMUMPSDB)** | Live transactional. Use only for <30 min fresh data — DB 170 (Redshift) lags by minutes |
| 3 | Mongo | Document store (likely product catalog / unstructured data) |
| 169 | Checker Main DB | Pharmacist checker workflow |
| 135 | Picker Main DB | Picker workflow (general / legacy) |
| 174 | PROD WH PICKER | Warehouse-wide picker (general) |
| 175 | PROD WH CHECKER | Warehouse-wide checker (general) |
| 180 | PROD INVENTORY | Live inventory state |
| 136 | Transfer Order main DB | TO operations |
| 960 | Prod Middleware | Middleware service DB |
| 894 | CASS DB | CASS = doctor / HA call infra (Customer Assistance / Sales Service) |
| 861 | PROD CASS | Production CASS instance |

### C. Per-warehouse picker DBs (19 — operations splits production load per WH/MFC)

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

These power the Single / Multi-order / Pigeon-hole picking flows per WH (see § 5 Picklist module). National-scale picking queries need a UNION across these OR use the Redshift mirror.

### D. Per-warehouse checker DBs (3)

| ID | Name | Location |
|---|---|---|
| 201 | PROD WH AMD CHECKER | Ahmedabad |
| 178 | PROD WH DEL CHECKER | Delhi |
| 176 | PROD WH KOL CHECKER | Kolkata |

### E. Analytical / Data Platform

| ID | Name | Engine | Use |
|---|---|---|---|
| **170** | **Redshift** | Redshift | **Shared default for tm-chotu** (see bucket A above) |
| 663 | Mangesh Redshift | Redshift | Mangesh's personal scoped instance (198 tables, +maranalytics +public schemas). Most users don't have access |
| 630 | Mangesh DB | MySQL | Unrestricted Main_DB replica. Used by `tm-po-analytics` project. Personal scope. |
| 432 | Min max redshift | Redshift | Replenishment + Min/Max analytics |
| 696 | Prod Min Max SQL | MySQL | Replenishment ops DB (live) |
| 1092 | TM Instrumentation | Redshift | Telemetry / instrumentation |

### F. Snowflake migration (in progress — started March 2026)

Picker DBs being moved MySQL → Snowflake. Five Snowflake DBs created mid-March:

| ID | Name | Purpose |
|---|---|---|
| 993 | SF WAREHOUSE_MANAGEMENT_SYSTEM | WMS aggregate |
| 994 | SF LOGISTICS | Logistics / TAT / courier |
| 995 | SF TRUEMEDS | General Truemeds analytics |
| 996 | SF MUMBAI PICKER | Mumbai picker (Snowflake-migrated) |
| 997 | SF LUCKNOW PICKER | Lucknow picker (Snowflake-migrated) |
| 998 | SF KOLKATA PICKER | Kolkata picker (Snowflake-migrated) |

**Implication:** Mumbai / Lucknow / Kolkata picker analytical queries should prefer Snowflake DBs (996/997/998) over the MySQL counterparts going forward. Other hubs still on MySQL pickers.

### G. Marketing

| ID | Name | Use |
|---|---|---|
| 103 | Marketing DB | Marketing-specific tables. Primary marketing data path for users without access to DB 663's `maranalytics` schema |

### H. Staging / UAT / non-prod

| ID | Name |
|---|---|
| 69 | STAGE DB |
| 267 | STAGE INVENTORY |
| 366 | STAGE REDSHIFT |
| 173 | STAGE WH CHECKER |
| 172 | STAGE WH PICKER |
| 36 | UAT |
| 564 | Redshift test |

### Bucketed totals

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

### Mixpanel

- **Project:** Production Env, ID **2900163** (default)
- Use for app + web event funnels only — pre-order behaviour, post-order engagement
- Canonical events + properties saved in memory at `~/.claude/projects/.../memory/mixpanel_events.md`

### What NOT to mention to non-engineers

- BigQuery — abstracted; data lives in Metabase DBs (`pr_adh` dataset is dev-only reference)
- HEVO — pipeline plumbing
- AppsFlyer-external — already mirrored in `tmmumpsdb.appsflyer_*`

### Default-routing decision tree

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

---

## § 7 — Key tables + master enums

### Customer

| Table | Purpose | Key columns |
|---|---|---|
| `customer_details` | Identity, contact, signup | `customer_id`, `mobile`, `device_id`, `created_on` |
| `mobile_otp` | OTP / login | `mobile`, `otp_sent_on`, `verified` |
| `customer_order_rank` | Order seq per customer | `customer_id`, `order_id`, `rank`, `is_ftc` [VERIFY] |
| `cx_lifetime_metrics` | LTV / cohort | `customer_id`, `ltv`, `m1_retained`, `chronic_flag`, `total_orders` |

### Order

| Table | Purpose | Key columns |
|---|---|---|
| `order_details` | Order header | `order_id`, `customer_id`, `created_on`, `final_amount`, `payment_id`, `workflow_status`, `orderstatus` |
| `order_status` | State transitions | `order_id`, `status_code`, `changed_on` |
| `FCA` | First customer acquisition snapshot [VERIFY] | `customer_id`, `acquisition_channel`, `first_order_id` |
| `offers` | Coupon catalog | `offer_id`, `code`, `discount_pct`, `validity` |
| `SVM` | Substitution value mapping [VERIFY] | `branded_sku`, `gx_sku`, `score` |

### Substitution

| Table | Purpose |
|---|---|
| `final_substitute_product` | Live sub map |
| `final_substitute_product_*` (4 variants) | Historical / experimental |
| `chronicity_otc_analytics`, `chronicity_rx_analytics` | Chronic tagging |

### Acquisition / attribution

| Table | Purpose |
|---|---|
| `appsflyer_installs` | App install events |
| `appsflyer_homepage_viewed` | First app open |
| `appsflyer_open_events` | Re-opens |
| `attributed_orders` | Attribution rollup |
| **`orders_campaign_attribution`** | **9.8M rows pre-joined order × campaign**. Schema: `order_id, customer_id, created_on, final_media_source, final_campaign, partner, adset, adset_id, ad, ad_id, final_channel` |
| `web_paid_search_orders_ond` | Web Google Ads paid-search orders only |

### Search

| Table | Purpose |
|---|---|
| `search_analytics_final_chain` | Final search chain per query |

### Master enums (LOCKED — nobody re-defines)

#### `orderstatus` — FULL 96-CODE DECODE [CITED — `m_system_value_master.name = 'ORDER STATUS'`, 2026-05-15]

Stored as `bigint`. Codes are `serial_id`. Note: `order_details.orderstatus` shows CURRENT state. For lifecycle counts use `order_status` transition table.

**Customer-side terminal states:**
| Code | Meaning |
|---|---|
| 55 | ORDER DELIVERED (success — filter for GMV) |
| 56 | ORDER RETURNED |
| 57 | ORDER CANCELED |
| 199 | ORDER REFUNDED |
| 200 | PARTIALLY RETURNED |
| 201 | PARTIALLY REFUNDED |
| 411 | PARTIALLY REFUNDED TO BANK |
| 412 | ORDER REFUNDED TO BANK |
| 413 | REFUND REVERSED BY BANK |
| 410 | REFUND LINK SENT |
| 481 | CASH HANDLING CHARGE REFUND |

**Pre-confirm / placement states:**
| Code | Meaning |
|---|---|
| 1 | NEW ORDER |
| 2 | PENDING VERIFICATION |
| 3 | ERROR ORDER |
| 4 | INVALID ORDER |
| 49 | INCOMPLETE ORDER (abandoned cart) |
| 274 | INCOMPLETE ORDER ASSIGNED |
| 344 | ORDER CREATED |
| 668 | REVERTED TO INCOMPLETE |

**Doctor / Pharmacist / HA / Agent workflow:**
| Code | Meaning |
|---|---|
| 39 | DIGITIZED |
| 452 | PARTIALLY DIGITIZED |
| 209 | DOCTOR ASSIGNED |
| 213 | PHARMACIST MAKER ASSIGNED |
| 214 | PHARMACIST CHECKER ASSIGNED |
| 215 | DOCTOR CALL ATTEMPTED |
| 216 | DOCTOR ORDER ON HOLD |
| 236 | PHARMACIST CALL ATTEMPTED |
| 276 | DOCTOR CALL SCHEDULED |
| 300 | PHARMACIST ORDER ON HOLD |
| 316 | REMINDER CALL ATTEMPTED |
| 317 | DR ORDER CONFIRMED |
| 318 | SCHEDULER ERROR DR CONFIRM ORDER |
| 331 | AGENT CALL ATTEMPTED |
| 332 | AGENT ORDER ON HOLD |
| 333 | AGENT CALL SCHEDULED |
| 405 | ASSIGN TO DR |
| 407 | DOCTOR_FRAUD_HOLD |
| **595** | **HEALTH ADVISOR CALL ATTEMPTED** |
| 66 | ORDER CONFIRMED |
| 222 | EDIT SUBS CONFIRM |
| 81 | ON HOLD |
| 142 | PROCESSING |

**Fulfilment / warehouse / packing:**
| Code | Meaning |
|---|---|
| **233** | **WAREHOUSE ASSIGNED** |
| 277 | BOX ASSIGNED |
| 278 | RACK ASSIGNED |
| 245 | Picker Assigned |
| 244 | Checker Assigned |
| 590 | PROBLEM_SOLVER_ASSIGNED |
| 220 | INVOICE CREATED |
| 221 | PACKAGE CREATED |
| 279 | ORDER FETCHED FROM BOX |
| 219 | CREDIT NOTE CREATED |
| 330 | ORDER FULFILLED |
| 59 | READY TO DISPATCH |

**Logistics / dispatch / delivery:**
| Code | Meaning |
|---|---|
| 217 | ORDER ASSIGNED TO DELIVERY PARTNER |
| **289** | **AWB STICKER PRINTED** |
| **60** | **ORDER DISPATCHED** |
| 285 | PICKED UP (by courier) |
| 275 | OUT FOR DELIVERY |
| 284 | ORDER DELIVERY FAILED |
| 380 | PAYMENT_RECEIVED_AFTER_DISPATCH |
| 390 | PAYMENT_RECEIVED_AFTER_OFD |
| 464 | PAYMENT COMPLETED |
| 372 | CLICKPOST_CHANGE_PAYMENT_FAILED |

**RTO + return flow (full chain):**
| Code | Meaning |
|---|---|
| 218 | SALES RETURN GENERATED |
| 190 | RETURN REQUESTED |
| 191 | RETURN GENERATED |
| 192 | RETURN DECLINED |
| 232 | REQUEST CANCELLATION |
| 290 | REQUEST APPROVED |
| 291 | REQUEST DECLINED |
| 292 | REQUEST VERIFICATION FAILED |
| 293 | ORDER VERIFIED |
| 296 | REQUEST VERIFIED |
| 297 | ORDER VERIFICATION FAILED |
| 294 | OUT FOR PICKUP |
| 298 | PICKUP FAILED |
| 299 | PICKUP SCHEDULED |
| 263 | RETURN IN TRANSIT |
| 272 | RETURN PICKED UP |
| 273 | RETURN DELIVERED (back to warehouse) |
| 301 | RETURN TICKET CANCELLED |
| 193 | ORDER DELAYED AT WAREHOUSE |
| 312 | SCRAPPED |
| 174 | ORDER DISCARD |
| 58 | PAYMENT PENDING |

**Reorder / rank / transfer:**
| Code | Meaning |
|---|---|
| 235 | ORDER RANK INCREASED |
| 613 | ORDER_RANK_INCREASED_TO_MAX |
| 596 | ORDER TRANSFER POSSIBLE |
| 597 | ORDER TRANSFERRED |
| 368 | ORDER UNASSIGN BY SCHEDULER |
| 340 | CUSTOMER ORDER MODIFICATION REQUESTED |
| 341 | CUSTOMER ORDER MODIFIED |
| 342 | CUSTOMER ORDER MODIFICATION DROP |
| 386 | CHECK AVAILABILITY |
| 387 | CHECK AVAILABILITY UNASSIGNED |

#### `order_details.workflow_status` [CITED — `m_system_value_master.name = 'WORK FLOW'`]

Only 4 distinct codes. Small enum:

| Code | Meaning |
|---|---|
| **242** | **NO_DOCTOR_CALL** (Auto-confirm path — when valid Rx already attached) |
| 343 | CUSTOMER_ORDER_ONHOLD |
| 381 | RE_ORDER_PRODUCT_CHECK (Reorder 2.0) |
| 400 | PORTAL INCOMPLETE ORDER |

#### `order_details.order_type_status` [CITED — `name = 'ORDER_TYPE'`]

The Pharmacist Type 1/2/3 queue split:

| Code | Meaning | Pharmacist queue |
|---|---|---|
| **52** | **RX** | Type 1 — prescription only |
| **53** | **RX AND MEDICINES** | Type 2 — Rx + meds |
| **54** | **MEDICINES** | Type 3 — only meds |

#### `medicine_status` [CITED — `name = 'MEDICINE_STATUS'`]

Line-item level, not order level. Stored in line-item tables (not on `order_details`).

| Code | Meaning |
|---|---|
| 61 | SUBSTITUTE (doctor's GX recommendation) |
| 62 | ORIGINAL (customer kept branded) |
| **211** | **NO SUBSTITUTE** (no GX exists for this molecule) |

#### `order_details.order_category` [CITED — `name = 'ORDER_CATEGORY'`]

FTC × Substitution-availability matrix — useful for cohort cuts:

| Code | Meaning |
|---|---|
| 320 | FTC PARTIAL SUBSTITUTION APP |
| 321 | FTC NO SUBSTITUTION APP |
| 322 | FTC SUBSTITUTION NOT POSSIBLE |
| 324 | REPEAT PARTIAL SUBSTITUTION APP |
| 325 | REPEAT NO SUBSTITUTION APP |
| 326 | REPEAT SUBSTITUTION NOT POSSIBLE |
| 383 | FTC VALID PRESCRIPTION ORDER |
| 384 | REPEAT VALID PRESCRIPTION ORDER |
| 393 | NOT IN STOCK APP |
| 451 | PHARMACIST CALL SUBS |

#### `payment_id` / `payment_status` / `payment_type` [CITED]

**`payment_id` (`name = 'PAYMENT'`):**
| Code | Meaning |
|---|---|
| 16 | ONLINE |
| 17 | COD |

**`payment_status` (`name = 'PAYMENT_STATUS'`):**
| Code | Meaning |
|---|---|
| 129 | OPEN |
| 130 | CLOSED |
| 663 | PAYMENT FAILED |
| 664 | PAYMENT INITIATED |
| 665 | PAYMENT RECEIVED |
| 666 | PAYMENT REQUESTED |
| 667 | UPFRONT PAYMENT PENDING |

**`payment_type` (`name = 'PAYMENT_TYPE'`):**
| Code | Meaning |
|---|---|
| 127 | XPRESS |
| 128 | PAYTM |
| 167 | HAND DELIVERED |

#### Order-side smaller enums [CITED]

**`name = 'ORDER_SOURCE'`** (where the order originated):
| 260 | APP | 261 | WEBSITE | 262 | PORTAL | 406 | DOCTOR_PORTAL |

**`name = 'ORDER_STATUS_DOCTOR'`** (doctor's view of an order):
| 32 | ASSIGNED | 33 | CONFIRMED | 34 | DECLINED | 35 | MODIFIED |

**`name = 'ACUTE_CHRONIC'`** (order classification):
| 139 | ACUTE | 140 | CHRONIC |

**`name = 'WAREHOUSE TYPE'`** (warehouse_id types):
| 454 | WAREHOUSE (full FC) | 455 | HUB | 553 | MFC (Micro-Fulfillment Centre) |

**`name = 'INVENTORY_TYPE'`** (SKU inventory classification):
| 281 | INVENTORY | 282 | JIT 1 | 283 | JIT 2 | 370 | Central Bulk | 371 | WH weekly JIT |

**`name = 'ITEM_TYPE'`** (cart line-item type):
| 472 | ALL PRODUCT | 473 | RX | 474 | SUBSTITUTE | 475 | OTC | 478 | ORIGINAL |

**`name = 'REFUND_TO'`** (where refund goes):
| 206 | TM_CREDIT | 207 | TM_CASH | 208 | CASHFREE (original payment via gateway) | 264 | TM_CASHBACK |

**`name = 'OFFER_TYPE'` / `OFFER_STATUS'`:**
| OFFER_TYPE: 469 Instant / 470 Cashback / 471 Instant + Cashback |
| OFFER_STATUS: 78 ACTIVE / 79 INACTIVE / 80 DELETED |

**`name = 'DISCOUNT_TYPE'`:**
| 76 BY PRICE (Org only) | 77 BY PERCENTAGE (Org only) | 223 BY % UPTO | 224 BY % ALL | 248 BY CASHBACK |

**`name = 'CMT STATUS'` / `CMT APPROVALS'`** (Catalog Management Team):
| CMT STATUS: 394 APPROVED / 395 PAUSED / 396 REJECTED |
| CMT APPROVALS: 397 CATALOGUE / 398 SUBSTITUTION / 399 BOTH |

**`name = 'DOCTOR_BLOCK_TYPE'`:**
| 328 CALL LIMIT BREACHED | 329 NO SUBSTITUTION LIMIT BREACHED |

**`name = 'DOCTOR_CATEGORY'`:**
| 252 ONE | 253 TWO | 254 THREE | 288 FOUR | 351 FIVE |

**`name = 'DRX_STATUS'`** (digital Rx status):
| 29 PENDING FOR DIGITIZATION | 30 DIGITIZED | 31 INVALID_RX | 37 MULTIPLE RX |

**`name = 'PILL_REMINDER_STATUS'`:**
| 309 NOT NEEDED | 310 UNREACHABLE | 311 ORDER PLACED | 314 CANCEL REMINDER | 537 SKIP REMINDER | 538 DO NOT DISTURB | 539 REATTEMPT LATER |

**`name = 'REMINDER CATEGORY'`:**
| 528 CHRONIC | 529 NON CHRONIC |

#### Warehouse-ops smaller enums [CITED]

**`PUTAWAY TYPE`:** 540 ORDER / 541 TO (Transfer Order) / 542 BILL / 551 BIN TO BIN / 562, 576 COLDCHAIN / 583 REVERT PICKING / 683 BATCH VERIFICATION

**`PICKLIST STATUS`:** 482 Open / 483 Picker Assigned / 484 Picked / 485 Picker issue / 499 Closed / 500 CANCELLED / 521 Picking In Progress

**`CONTAINER STATUS`:** 510 Open / 511 Assigned / 512 Picking In Progress / 513 Picked / 550 Full

**`BOX_STATUS`:** 179 Medicine Missing / 180 Wrong Product Details / 181 Box Verified / 182 Cold Chain / 231 Correction / 243 Picker Medicine Missing / 554 Box Packed

**`ITEM STATUS`:** 584 Item Edited / 585 Send to checker / 586 Item added / 587 Item replaced / 591 Item disabled / 592 Item Inwarded / 605 Order cancelled

**`ORDER PICKER STATUS`:** 577 PENDING / 578 PICKED / 579 ISSUE
**`ORDER CHECKER STATUS`:** 580 PENDING / 581 CHECKED / 582 ISSUE

**`PACKAGE_STATUS`** (36 codes — courier partners are stored here):
Includes the 3PL universe: XpressBees, Delhivery, Delhivery Express, Bluedart, Bluedart Express, CABT, WeFast, Self Delivery, Hand Delivery, Shipsy, ATS, Ecom Surface, Ecom Air, Shadowfax (incl. Express + Surface + Reverse), Blitz, Blitz Express, Ithink Forward, Urbane Bolt, Shiprocket (Delivery / Courier / NDD), Delhivery NDD. Plus operational states (HOLD CANCELED, APPROVED CANCELED, COLDCHAIN_PICKING_PENDING, Runner Assigned, ORDER VERIFICATION REQUIRED, etc.)

#### Other key masters captured

- `name = 'SCHEDULE_DRUG'` — 8 codes (drug schedule H, H1, X etc.) [REDLINE: get exact list if needed]
- `name = 'GST'` — 6 codes (GST 0/5/12/18/IGST18/IGST28)
- `name = 'VENDOR_TYPE'` — 5 codes
- `name = 'PROCUREMENT TYPE'` / `PROCUREMENT STATUS'` / `PROCUREMENT TAG TYPE'` — procurement workflow
- `name = 'PRODUCT_SOURCE_TYPE'` — 10 codes tracking WHO added a product to cart (Customer-App, Customer-Web, Doctor, Operation, Pharmacist, CSR, Checker, Assisted, Scheduler)

**Total masters in `m_system_value_master`:** 200+ distinct `name` groups. Full sweep can be done with: `SELECT name, COUNT(*) FROM tmmumpsdb.m_system_value_master WHERE active = 1 GROUP BY name`.

#### `organisation_id`

Multi-tenant marker. **Truemeds main = 1**. Filter `WHERE organisation_id = 1` for Truemeds-only data unless cross-tenant analysis intended.

---

## § 8 — Joins (end-to-end)

All recipes target **DB 170 (Redshift)** — the shared default everyone has access to. For Redshift gotchas, see § 9 + the `tm-chotu-query-rigor` skill (`::numeric / 1000000.0` cast for bigint math).

### Macro pipeline

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

### Recipe 1 — Daily GMV (invoiced delivered)

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

### Recipe 2 — Lifecycle stage counts via transition log

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

### Recipe 3 — Order → attribution (ROAS)

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

### Recipe 4 — FTC customers (compute on-the-fly; do NOT trust `customer_order_rank`)

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

### Recipe 5 — Substitution acceptance (Gold / Silver / Bronze)

```sql
-- Per-customer subs propensity (per probab-subs-persona persona model)
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

### Recipe 6 — Therapy-tagged sub coverage (Mumbai hub example)

```sql
-- "For each drug category, what % of products have an eligible substitute at Mumbai hub?"
-- Per-hub catalogue analysis — substitute the hub name to switch warehouse
SELECT
  dcm.category AS drug_category,
  COUNT(DISTINCT om.original_product_code) AS products,
  SUM(CASE WHEN om.is_subs_product_info_present = 1 THEN 1 ELSE 0 END) AS with_sub,
  ROUND(100.0 * SUM(CASE WHEN om.is_subs_product_info_present = 1 THEN 1 ELSE 0 END)
        / NULLIF(COUNT(DISTINCT om.original_product_code), 0), 1) AS pct_sub_available
FROM tmmumpsdb.org_sub_medicine_mapping_mumbai_hub_new_algo om
JOIN tmmumpsdb.disease_product_mapping dpm
  ON LOWER(om.original_product_code) = dpm.product_code      -- LOWER required (typo lock)
JOIN tmmumpsdb.disease_category_master dcm
  ON dpm.type = 'DISEASE_CATEGORY' AND dpm.type_id = dcm.id
WHERE dpm.active = 1
  AND dpm.is_approved = 1
  AND dpm.priority = 'D1'
GROUP BY 1
ORDER BY products DESC
LIMIT 20;
```

### Recipe 7 — Install → FTC conversion funnel

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

### Join key reference

| From → To | Key | Notes |
|---|---|---|
| `order_details` ↔ `final_calculated_amount` | `order_id` | Always join when calculating $ (invoiced amount is here, not in `order_details`) |
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
| `orders_campaign_attribution` ↔ `maranalytics.google_ads_main` | `ad_id::text = campaign_id::text` | [VERIFY in marketing-analytics project] |
| `m_system_value_master` ↔ any status column | `serial_id` × `name` | Always filter `name` (e.g. `name = 'ORDER STATUS'`) — codes overlap across master groups |

### Redshift-specific gotchas

1. **bigint division returns 0** unless cast: `SUM(col)::numeric / 1000000.0`. Burned a 132× wrong-total in marketing-analytics [memory `feedback_redshift_bigint_div_cast`]
2. **MySQL → Redshift case difference** — `disease_product_mapping.product_code` is lowercase; wrap with `LOWER()` on the join
3. **DB column typos** — `consider_poduct`, `keep_orginal` (use exact typo'd names)
4. **`organisation_id = 1`** filter for Truemeds-tenant data — otherwise multi-tenant rows leak in

---

## § 9 — Definitions (LOCKED — most important section)

These definitions are canonical. Anyone in any function should resolve ambiguity to these versions. Updates only via plugin upgrade after analytics team review.

### Customer lifecycle

| Term | Locked definition |
|---|---|
| **FTC** (First-Time Customer) | Customer whose first delivered order is in the window. Compute on-the-fly via `MIN(created_on) WHERE orderstatus = 55 GROUP BY customer_id`. **Do NOT use `customer_order_rank`** (broken — § 3) |
| **FOP** (First Order Placed) | Customer's first row in `order_details` regardless of delivery status. Includes incomplete/cancelled |
| **`is_ftc_order = 1`** (per-order flag) | True on every order placed by a customer **until at least one prior order has cleared doctor-confirmed-or-higher status (or actually delivered)**. Per-order, NOT per-customer. Use to count "first-attempt orders", not unique FTC customers (§ 3) |
| **M1 retention** | Customer placed order 1 AND order 2 within **30 days** of order 1. **Primary retention KPI, DCOE thesis north star** |
| **M3 retention** | Order 1 → order 2 within 90 days |
| **M6 retention** | Order 1 → order 2 within 180 days |
| **Quarterly retention** | Order in quarter N → order in quarter N+1 |
| **Reactivation** | Customer dormant 60+ days who placed an order. Derive on-the-fly via lag pattern on `order_details` |
| **Repeater** | Customer with `cust_order_rank >= 2` (after table fix) OR compute on-the-fly from `order_details` |

### Money / commerce

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
| **TS** (TruemedsSavings) | Per-unit profit margin window = `maxSellingPrice − minSellingPrice`. **NOT customer savings.** Computed in substitution algo Step 5 (§ 5). High TS = high TM margin headroom |
| **Discount stack** | Per-order deductions in `final_calculated_amount`: `discount`, `tm_cash`, `tm_credit`, `tm_cashback`, `price_lock_disc`, `adjustment_amt`. Additions: `delivery_charge`, `packaging_charge`, `cash_handling_charge` |
| **Wallet types** | TM Cash (credit pool) / TM Credit (refund credit) / TM Cashback (offer reward). Burned via `final_calculated_amount` columns. Wallet balance lives in dedicated `wallet` table, NOT `order_details` |
| **Price Lock** | Customer-facing protection against MRP increases. Eligibility per `PRICE_LOCK_THRESHOLD_X` / `PRICE_LOCK_STAGE` masters. Captured as `price_lock_disc` |

### Product / catalogue

| Term | Locked definition |
|---|---|
| **GX** | Generic — same molecule + dose + form as branded Rx, ~50% cheaper. Catalogue flag: `medicine_master.generic_branded = 'Generic'` |
| **Rx** | Prescription-required SKU. Flag: `medicine_master.rx_required = 'Yes'` |
| **OTC** | Over-the-counter — no Rx. Mapped via `disease_product_mapping.type = 'HEALTHCARE'` + `otcvalue_master` |
| **Chronic (product)** | Repeating-need molecule (BP, diabetes, thyroid, cardiac). Catalogue flag: `medicine_master.acute_chronic = 140`. Master: `ACUTE_CHRONIC` |
| **Acute (product)** | One-off use (fever, cold, infection). Flag: `acute_chronic = 139` |
| **Chronic (customer)** | Customer with recurring chronic-tagged molecule. **Preferred derivation:** Mixpanel + product order history + product chronic tagging — NOT the legacy `chronicity_*` tables (validate-before-use, § 3) |
| **Therapy / drug category** | Primary clinical grouping. Derive via `disease_product_mapping → disease_category_master.category`, filter `priority = 'D1'` (158 categories total). Top: ANTIBIOTIC, ANALGESIC, ANTIDIABETIC, ANTIHYPERTENSIVE, ANTACID |

### Order lifecycle

| Term | Locked definition |
|---|---|
| **Order Type 1 (52 RX)** | Prescription-only order → **Pharmacist Type 1 queue** for digitization |
| **Order Type 2 (53 RX AND MEDICINES)** | Rx + meds → **Doctor directly** (skips Pharmacist) |
| **Order Type 3 (54 MEDICINES)** | Meds only, no Rx → **Doctor directly** |
| **Auto-confirm** | `workflow_status = 242 NO_DOCTOR_CALL`. Triggered when valid Rx already attached → bypasses doctor call |
| **Digitized** | Order has been verified + structured. `DRX_STATUS = 30 DIGITIZED` line-item-level; `orderstatus = 39 DIGITIZED` order-level |
| **Confirmed** | `orderstatus = 66 ORDER CONFIRMED` — past doctor/pharmacist review, ready for fulfilment |
| **HA call** | Health Advisor call — substitution explanation. Triggered when SUBSTITUTE is available post-confirm. orderstatus 595 HEALTH ADVISOR CALL ATTEMPTED. HA can add only OTC, not Rx |
| **Warehouse Assigned** | orderstatus 233 — routing decision (MFC vs FC) complete |
| **AWB Printed** | orderstatus 289 — Air Waybill sticker printed for 3PL pickup |
| **Dispatched** | orderstatus 60 — order handed to 3PL |
| **Delivered** | orderstatus 55 — customer received |
| **RTO** (Return To Origin) | Post-dispatch cancel chain: 60 → courier pickup → in transit → cancellation → 57 ORDER CANCELED → RTO marked → RTO-IT (master 121) → RTD (master 124, back at WH) → reverse putaway → restock |
| **Backorder** | Flag in `package_details_tracking` (NOT `order_details`). Triggers Procurement & Inwarding flow |
| **Sub Eligible** | Output of substitution algo Step 6 — boolean per line item. Drives substitution suggestion path |
| **Sub Acceptance Rate** | `COUNT(cx_accepted_subs = 1 AND status_id = 61)` / `COUNT(status_id IN (61, 62) AND not-no-sub-offered)`. Line-item level via `final_substitute_product_cx_confirm` and `_dr_confirm` |

### Acquisition / marketing

| Term | Locked definition |
|---|---|
| **ROAS (primary)** | Revenue (delivered orders) / paid spend. Same-channel attribution only. Default in dashboards |
| **ROAS (all_conv)** | Includes view-through + cross-device. Higher than primary. Source: Google Ads `all_conv_value / cost` |
| **ROAS (true)** | Revenue from incremental customers / spend (excludes brand traffic). Custom calc; not in default dashboards |
| **CAC (paid)** | Paid spend / new customers attributed to paid channel |
| **CAC (blended)** | Total marketing spend / total new customers (incl. organic). Always lower than paid CAC |
| **Conversion action** | Google Ads concept — the action counted as conversion. Truemeds uses `Purchase` (primary) + `Install` (secondary). Never double-count |
| **Attribution window** | Default 7-day click + 1-day view [VERIFY exact numbers per marketing-analytics project] |
| **Affiliate orders** | UTM source prefix `AFF`. Same lifecycle as B2C — no separate flow |

### Cohorts (DCOE 5-axis)

| Term | Locked definition |
|---|---|
| **HV / MV / LV / DM** (Value/LTV) | Top 20% / 20–60th / Bottom 40% / Dormant 90d |
| **CM++ / CM+ / CM- / CM--** (Contribution Margin) | Top 10% / >0 / −3 to 0 / <−3 |
| **NEW / ACT / RISK / LAPS / CHURN** (Lifecycle) | FTC<30d / Active<30d / 31–60d / 61–90d / >90d |
| **NC / LD / MD / HD / AC** (Coupon dependency) | 0% / <30% / 30–70% / >70% / 100% orders with coupon |
| **SA / SW / SR / SNO** (Substitution propensity) | >70% accept / 30–70% / <30% / never offered |
| **Golden Geese** | `HV ∩ CM++ ∩ SA ∩ ACT` — protect cohort, minimal spend, organic only |

### Persona tiers (TMEXP1 / probab-subs-persona)

| Term | Locked definition |
|---|---|
| **Gold** | `cx_accepted_subs = 1 AND fsp_cx_confirm.status_id = 61` — self-opts for sub at checkout |
| **Silver** | `cx_accepted_subs = 0 AND fsp_dr_confirm.status_id = 61` — declined at checkout, HA converted |
| **Bronze** | `cx_accepted_subs = 0 AND fsp_dr_confirm.reason_id = 9` — rejected even after HA push |
| **N/A** | `fsp_cx_confirm.reason_id IS NULL AND subs_product_code = product_code` — no substitute offered |
| **4 lever families** | Substitution / Pricing / Margin (TS) / Brand Affinity — see § 5 |

### Facilities

| Term | Locked definition |
|---|---|
| **FC** (Fulfilment Centre) | Full warehouse. 5 main: Mumbai (id 20), Bangalore (17), Delhi (19), Kolkata (22), Lucknow (37) |
| **MFC** (Micro-Fulfilment Centre) | Smaller regional centre. Master `WAREHOUSE TYPE = 553`. Tier-2 expansion driver. Cities: Indore, Bhubaneswar, Chandigarh, Chennai, Guwahati, Hyderabad, Jaipur, Nagpur, Patna (×2), Pune, Raipur, Ranchi, Varanasi |
| **HUB** | Warehouse type 455. Distribution layer between FC and MFC |
| **WAREHOUSE** | Generic warehouse type 454 |
| **Faridabad / FBD** | Specific WH with its own putaway flow variant (`PUTAWAY-FBD`) |

### Operations / systems

| Term | Locked definition |
|---|---|
| **NetSuite (NS)** | ERP / financial system of record. Customer + item + invoice + qty deduct all happen here. Pipeline tables on DB 170: `net_suite_invoice_batch`, `net_suite_purchased_order`, `net_suite_items`, `net_suite_sales_receive`, `net_suite_vendor`, `net_suite_purchase_tracker`, `net_suite_pending_purchase_order` |
| **NSDB tables** | Generic shorthand for NetSuite-mirrored tables in `tmmumpsdb` schema |
| **AWB** | Air Waybill — courier shipping label. Printed at orderstatus 289 |
| **HA** (Health Advisor) | Internal role + portal. Substitution confirmation calls (post-confirm, pre-WH-assign). OTC-only cart additions |
| **CSR** (Customer Service Rep) | Inbound + outbound customer support. Two portals: Create Order + Post Order |
| **CMT** (Catalog Management Team) | Function owning Dynamic Content Mgmt. Approves catalog + substitution pairs via `CMT STATUS` × `CMT APPROVALS` |
| **3PL** | Third-party logistics partner. Locked roster: 13 partners (Delhivery, Bluedart, XpressBees, Shadowfax, Ecom, Shiprocket, Blitz, CABT, ATS, WeFast, Shipsy, Ithink, Urbanebolt) + Self / Hand Delivery (§ 5) |
| **JIT** (Just-In-Time) | Inventory type. Masters 282 JIT 1, 283 JIT 2, 371 WH weekly JIT. Lower-volume / faster-cycle stocking |
| **PO** (Purchase Order) | Procurement order to vendor |
| **VRA** (Vendor Receipt Authorization) | Step in Central Procurement flow — receipt of inwarded goods |
| **DND** | Do Not Disturb — Pill Reminder portal status (538). Customer opted out of reminder calls |
| **Capping / Blocking** | Cart-layer constraint — max-allowed qty per SKU per customer, per warehouse, or global. Admin via Dynamic Content Mgmt with approver flow |
| **Pincode Movement** | Re-routing pincode → warehouse mapping. Admin in Hub Config |
| **OOS** | Out Of Stock. Drives sub-fallback in Substitution algo + search de-boost (Scoring Layer) |
| **OTIF** | On-Time In-Full delivery KPI |
| **OFD / OFP / DLVD / LOST / PND** | Master enums for shipment sub-statuses (Out For Delivery / Out For Pickup / Delivered / Lost / Pending) — `m_system_value_master` single-row names |

### Projects / internal initiatives

| Term | Locked definition |
|---|---|
| **DCOE** (Dynamic Cohort Optimization Engine) | Multi-axis bandit for marketing decisioning. 5 cohort dimensions, M1 retention thesis. Pipeline live, not yet powering production decisioning [project `TMEXP4-DCOE`] |
| **TMEXP1** | probab-subs-persona project — Gold/Silver/Bronze persona model. Bridges into DCOE Substitution-propensity axis |
| **TMEXP3** | Bulk algo-hit script for substitution coverage (~1k products × 5 WHs, concurrency=10, rate=100/min) |
| **TMEXP4** | DCOE build (current major initiative) |
| **tm-chotu** | This plugin — Claude Code knowledge plugin for every Truemeds employee |
| **tm-po-analytics** | Faridabad inventory-adjustment dashboard (DuckDB + FastAPI + daily SES digest) |
| **tm-fraud-engine** | Daily rule-based fraud-detection for affiliate orders across all channels (web/app/ios). SHIPPED & LIVE on EC2, 24 signals, scope-file mode (KD §15) |
| **search-validator** | Replay-dual harness validating Search Engine (PRD V1) vs Mixpanel ground truth |
| **marketing-analytics** | Paid-ad ROAS / CAC pipeline under `tminsights` umbrella (DB 663 `maranalytics`) |

### Multi-tenancy

| Term | Locked definition |
|---|---|
| **`organisation_id`** | Multi-tenant marker on every Main DB table. **Truemeds main = 1.** Always filter `WHERE organisation_id = 1` unless cross-tenant analysis is the explicit goal |

### Anti-patterns — don't say these without qualifying

| Vague term | Required clarification |
|---|---|
| "Active user" | active customer (90d) / active session / active device / active subscriber |
| "Loyal customer" | rank 3+ / LTV bucket / chronic flag |
| "New user" | install / signup / FTC (delivered) / FOP (placed) — they are NOT the same |
| "Conversion" | install → signup / signup → first order / FTC → repeater / etc. |
| "Substitution" | offered (algo found) / shown (UI exposed) / accepted (cx_accepted_subs=1) / kept (status_id=61) |
| "Cancelled" | pre-ship cancel / post-ship RTO / customer-requested / scheduler-auto |
| "Refund" | TM_CREDIT / TM_CASH / CASHFREE (original gateway) / TM_CASHBACK — `REFUND_TO` master decides |
| "Order" | placed (24h-fresh) / digitized / confirmed / dispatched / delivered — specify lifecycle stage |

### Status-code shorthand cheatsheet (lifts from § 7)

When someone says "status 55" or "status 61", check which master family they mean:
- **ORDER STATUS** family: 55 = DELIVERED, 57 = CANCELED, 60 = DISPATCHED, 66 = CONFIRMED, 39 = DIGITIZED, 233 = WAREHOUSE ASSIGNED, 595 = HA CALL ATTEMPTED
- **MEDICINE_STATUS** family: 61 = SUBSTITUTE, 62 = ORIGINAL, 211 = NO SUBSTITUTE
- **ORDER_TYPE** family: 52 = RX (Type 1), 53 = RX AND MEDICINES (Type 2), 54 = MEDICINES (Type 3)
- **WORK FLOW** family: 242 = NO_DOCTOR_CALL (auto-confirm), 343 = CUSTOMER_ORDER_ONHOLD
- **PAYMENT** family: 16 = ONLINE, 17 = COD

Codes overlap across families — always look up via `m_system_value_master WHERE serial_id = <code> AND name = '<family>'`.

---

## § 10 — Projects

### Mangesh's active projects (shareable)

| Project | Status | Repo / location | What it does |
|---|---|---|---|
| **tm-chotu** (this) | Building v0.0.1 (2026-05-15) | `~/.claude/plugins/tm-chotu/` → TBD GitLab | Claude Code plugin packaging full Truemeds knowledge for every employee. Caveman default, soft onboard wizard, query-rigor HARD STOPs |
| **probab-subs-persona** (TMEXP1) | Active — 2026-04-06 last update | `~/Desktop/Truemeds /Claude/probab-subs-persona/` | Customer persona model (Gold/Silver/Bronze) + substitution probability across 5 FCs. Produces the persona signals that DCOE consumes |
| **TMEXP3 algo hit** | Active probe pattern | `~/Desktop/Truemeds /Claude/` | Bulk `findBestSubForProducts` replay (~1k products × 5 warehouses, concurrency=10, rate=100/min). Validates sub-coverage across hubs |
| **TMEXP4 DCOE** | Active build — main at ~85% dashboard, §3 next (2026-05-15) | `~/Desktop/Truemeds /Claude/TMEXP4-DCOE/` | Dynamic Cohort Optimization Engine — multi-axis bandit (5 dimensions: LTV/CM1/Lifecycle/Coupon/Subs). M1 retention thesis (order-1 → order-2 within 30 days). Pipeline live, not yet powering production decisioning |
| **tm-po-analytics** | SHIPPED 2026-05-12 | `gitlab.com:tm-exp/tm-po-dashboard` | Faridabad inventory-adjustment dashboard. DuckDB + FastAPI + daily SES digest. 50/50 tests green |
| **search-validator** | v2 SHIPPED 2026-05-11 | `~/Desktop/Truemeds /Claude/` (under `tminsights/`) | Two-stage search validation (suggestions + results) vs Mixpanel ground truth. Replay-dual harness. Now validates Search Engine PRD V1 (Sujith) implementation |
| **marketing-analytics** | Active — Google ready, Meta pending HEVO sync | `~/Desktop/Truemeds /Claude/tminsights/marketing-analytics/` | Paid-ad ROAS / CAC under `tminsights` umbrella. Uses DB 663 `maranalytics` schema. Burned a 132× wrong-total once via Redshift bigint division — taught us the `::numeric / 1000000.0` cast rule |
| **tm-fraud-engine** | **P1 SHIPPED & LIVE 2026-05-29; all-channel since 2026-06-01; SES prod 2026-06-12** | `gitlab.com:tm-exp/tm-fraud-engine` | Daily rule-based fraud detection for affiliate orders (web/app/ios). Team drops a scope file → 24 signals over 30d customer-keyed substrate → CSV email (SES) + Google Sheet. Scoped-ELT on EC2 via systemd timer 06:30 IST. First prod file: 34.2% FRAUD. Full detail: KD §15. P2 (AI augmentation) gated on 7d-stable + 30d ops feedback |

### Project umbrellas

| Umbrella | Repo | Scope |
|---|---|---|
| **tminsights** | `gitlab.com:tm-exp/tminsights` | Default home for analytics projects — EXCEPT `tm-po-analytics` (moved out 2026-05-12 after divergence). Currently hosts: marketing-analytics, search-validator |
| **tm-po-analytics standalone** | `gitlab.com:tm-exp/tm-po-dashboard` | Faridabad inventory dashboard repo (moved out of umbrella after divergence) |

### Stack / patterns adopted across projects

- **Subagent-driven plan execution** — all plan execution via `superpowers:subagent-driven-development`, never inline executing-plans [memory `feedback_subagent_driven_always`]
- **Feature-branch always** — implementation on `impl/<phase>-<feature>`, never main; never worktrees unless asked [memory `feedback_feature_branch_always`]
- **Pre-install deps in main session** — never let subagent run pip/brew [memory `feedback_install_deps_via_bash`]
- **Metabase MCP primary** for tm-po-analytics; direct DB deprecated [memory `feedback_metabase_only_no_direct_db`]
- **DB 170 (Redshift) default** for tm-chotu (shared, everyone has access); DB 663 (Mangesh Redshift) is personal-scoped only; DB 630 for tm-po-analytics
- **No Claude attribution** in commits / docs — use neutral LLM phrasing [memory `feedback_no_claude_attribution`]

### "Everyone" projects (BAU + revamp tracker)

Placeholder. Pushed by analytics team via tm-chotu plugin updates.

**Update pattern** (proposed — confirm with Mangesh):
1. Analytics team author drafts entry as a skill-request file at `~/.claude/plugins/tm-chotu/SKILL_REQUESTS/<date>_<topic>.md`
2. Mangesh (or designated reviewer) approves + folds into `KNOWLEDGE_DUMP.md`
3. Plugin version bumps (semver)
4. Users `git pull` the GitLab repo to get the update

[REDLINE: lock the cadence — monthly? per-PR? on-demand? — and confirm reviewer ownership]

### Knowledge-gap loop (live mechanism)

When a question asked of tm-chotu doesn't match any loaded skill content:

1. Plugin drafts a skill-request markdown at `~/.claude/plugins/tm-chotu/SKILL_REQUESTS/<YYYY-MM-DD>_<topic>.md`
2. Prompts user: "Email this to Mangesh"
3. Analytics team beefs up plugin → ships update via GitLab pull

This grows the plugin's knowledge over time without every user needing to be an analytics person.

---

## § 11 — Inventory

> Lifted into `skills/tm-chotu-inventory/SKILL.md` v0.1.3. This is the canonical KD source.
> **v0.1.3 deep-rewrite:** multi-WMS reality, layered stockout model, JIT/BULK pincode-level split, cold-chain-at-pincode correction. Confirmed live via DB 180 + DB 432 probes 2026-05-26.

### ✅ Universal live-qty source (foundational — corrected v0.1.4)

**DB 180 PROD INVENTORY → `INVENTORY_SCHEMA.product_inventory_data` is the universal live-qty source for ALL active WHs.**

This includes Vinculum-backed WHs (e.g. ANKW Faridabad `warehouse_id=21` runs Vinculum underneath, but its inventory IS synced into DB 180). **NetSuite is the underlying inventory management system**, real-time synced.

**Decommissioned WHs (despite `warehouse_details.status=1` showing active — that flag is stale):**

| id | Name | Status |
|---|---|---|
| 3 | Intellihealth Mumbai Hub | Decommissioned |
| 5 | Intellihealth Delhi Hub | Decommissioned |
| 7 | Intellihealth Kolkata Raikva FC | Decommissioned |
| 11 | Intellihealth Faridabad Hub | Decommissioned (old; replaced by ANKW id=21) |

**Truly active WHs:** `SELECT DISTINCT warehouse_id FROM INVENTORY_SCHEMA.product_inventory_data WHERE active=1` returns 32 WHs as of 2026-05-26 probe. Don't use `warehouse_details.status`.

### Source-of-truth tier — LOCKED

| Tier | Where | Use |
|---|---|---|
| **Underlying IMS** | **NetSuite** | Financial + item master + on-hand qty truth |
| **Live qty (WMS 2.0)** | DB 180 `INVENTORY_SCHEMA.product_inventory_data` | Per-WH per-SKU live qty, NetSuite real-time sync |
| **Live qty (Faridabad)** | DB 432 `tmmumpsdb.product_inventory_data` (Airbyte mirror of DB 180; filter `warehouse_id IN (11, 21)`) | Vinculum-sourced |
| **Search visibility** | `medicine_warehouse_master.availability` → OpenSearch `is_oos` | Catalogue-team MANUAL flag drives OOS de-boost |
| **NetSuite mirror (DB 170)** | `net_suite_items`, `net_suite_purchased_order`, `net_suite_invoice_batch`, `net_suite_pending_purchase_order`, `net_suite_purchase_tracker`, `net_suite_sales_receive`, `net_suite_vendor` | Financial recon |

❌ `medicine_stock_details` — **LEGACY / DEPRECATED**. Don't use.
❌ `inventory_tracking` (DB 180) — **LEGACY / DEPRECATED**. Don't use.

### `product_inventory_data` schema (the live qty table)

Grain: (`warehouse_id`, `product_cd`).

| Col | Meaning |
|---|---|
| `total_inventory_qty` | Gross stock at WH |
| **`available_qty`** | **Sellable now** (after older-order allocation) — primary input to WH assignment |
| `threshold` | SKU-level threshold |
| `pending_consult_qty` | Reserved during HA / Doctor call |
| `pending_invoice_qty` | Reserved post Order Confirmed, pre-invoice |
| `pending_shipped_qty` | Packed, awaiting handover to 3PL |
| `ns_item_id` / `ns_onhand_qty` | NetSuite item + on-hand mirror |
| `last_synced_on` | NetSuite sync timestamp |

**Conservation identity:** `available_qty = total_inventory_qty − pending_consult_qty − pending_invoice_qty − pending_shipped_qty`

**Companion tables** (same `INVENTORY_SCHEMA`):
- `order_inventory_ledger` — per-event ledger (`order_id, product_cd, warehouse_id, qty, is_add, is_deduct, inventory_type, bucket_type, txn_msg, order_status_id`)
- `order_inventory_ledger_partitioned` — partitioned variant
- `order_inventory_tag` — per-order `is_inventory` bit (the "Inventory Order?" routing answer)

### Layered stockout model — NO single canonical def

| Context | Signal | Where |
|---|---|---|
| Onhand qty (what we physically hold) | `total_inventory_qty` or `ns_onhand_qty` | `product_inventory_data` |
| Search OOS de-boost | `medicine_warehouse_master.availability` (MANUAL, Catalogue-managed, powered by live inventory) | DB 630/2 `tmmumpsdb` |
| Hide broken catalog rows | `mwm.is_searchable` (NOT a stockout signal) | mwm |
| WH assignment routing | `available_qty` ("WH with stock left after older-order allocation") | `product_inventory_data` |
| Backorder trigger | `package_details_tracking.is_back_order` (set **at WH Assignment**) | DB 630/2 |

❌ There is NO single "stockout %" SQL. Always state which signal you use.

### INVENTORY_TYPE master

| Code | Type | Meaning |
|---|---|---|
| 281 | INVENTORY | Stocked. Live qty maintained. Normal pick. |
| 282 | JIT 1 | Tier-1 just-in-time per-order procurement. Not stocked. |
| 283 | JIT 2 | Tier-2 fallback procurement. |
| 370 | Central Bulk | Central, distributed on demand. |
| 371 | WH weekly JIT | Replenished weekly in JIT zone. |

> JIT rule: non-onhand product does NOT auto-mean `availability = false`. JIT means we'll procure-per-order. Catalogue team manually sets `mwm.availability` based on fulfilment ability.

### JIT vs BULK demand split → MFC vs FC stocking (LOCKED)

Demand classification happens at **PINCODE level**.

- **BULK demand → MFC (553)** — hyperlocal pre-stock
- **JIT demand → FC (454)** — long-tail procure-on-demand

**Source:** DB 432 `tmmumpsdb.product_wh_avg_daily_tracker` — **180M rows, daily-fresh (latest 2026-05-20 as of probe)**.

Grain: (`product_cd, pincode, warehouse_id, gen_dataset_dt`). Demand windows: L7D / L15D / L30D / L60D. Variants: regular, `_own_*`, `_subs_*`, `_old_pack`.

**"Own Demand" (`_own_*`):** Truemeds recommends generic for branded → returning customers learn generic name → search/buy generic directly → creates Own Demand for the generic.

### Cold chain — PINCODE-level serviceability (LOCKED)

Cold-chain requires a special cold package, valid only within distance-radius from WH → serviceability is per-pincode.

**Source:** `tmmumpsdb.pincode_warehouse_master`. Filter `priority = 1` rows, check `is_cold_chain_deliverable` (bit):
- TRUE → accept cold-storage orders for that pincode
- FALSE → reject

Same table also carries `surface_delivery_days` / `air_delivery_days`, `is_serviceable_by_delhivery/_xpress_bees/_air_delhivery`, `is_sdd` — used in `tm-chotu-tat` for PDD.

The `cold_storage` bit on `medicine_warehouse_master` is **per-SKU-at-WH** (which SKUs are cold-chain), NOT a WH-level enable.

### Backorder

- Flag: `package_details_tracking.is_back_order` (bit) — NOT `order_details`
- Set: **at Warehouse Assignment** (orderstatus 233) if `availability = 0` or qty insufficient
- Trigger: Procurement & Inwarding → Back Order Procurement dashboard
- Downstream: procure-to-fill / cancel / partial / re-route

### Pre-confirmation block (substitution)

Sub offered → both original + sub SKU blocked. Decision:
- Sub kept (`medicine_status = 61`) → original released
- Sub rejected (`medicine_status = 62`) → sub released

OOS-driven sub decisions logged per (order × WH) in `not_in_stock_order_details` (cols: `original_product_code, replaced_product_code, subs_product_code, cx_accepted_sub, is_dr_confirm, is_dispatched, status_id, warehouse_id`).

### Warehouse types (stock pools)

| Code | Type | Pool |
|---|---|---|
| 553 | MFC | Hyperlocal, ~1-day radius — gets BULK demand |
| 455 | HUB | Mid-tier (incl. Faridabad — Vinculum) |
| 454 | WAREHOUSE / FC | Main FC, full breadth — gets JIT demand |

**36 active WHs** on `warehouse_details` (DB 630/2 tmmumpsdb) across Intellihealth + ANKW entities.

### Daily trackers (DB 432 Min Max Redshift, `tmmumpsdb` schema)

| Table | Use |
|---|---|
| **`product_wh_avg_daily_tracker`** | Pincode-grain demand forecast — drives JIT/BULK split (180M rows, daily-fresh) |
| `product_hub_avg_daily_tracker` | Hub-rollup |
| `salt_wh_avg_daily_tracker` | Salt-grain demand |
| `product_wh_avg_utilization_daily_tracker` | WH-level utilization |
| `product_wh_proposed_avg_daily_tracker` / `_result_*` | Proposed vs realized Min-Max |
| **`product_wh_inventory_daily_tracker`** | **Canonical daily inventory snapshot** (`curr_inv / open_to_qty / open_po_qty / total_inv / availability`) |
| `scm_daily_sku_inventory` | Secondary salt-grain snapshot |
| `v_scm_inventory_position_wh` | Lean WH position view (4 cols) |
| `v_scm_inventory_position_hub` | Hub position view |

`*_sf_test` / `*_temp` — ignore.

❌ **`scm_wh_stock_threshold_master` — UNUSED, EMPTY table. Do NOT use.** Hard rule: never use any table without first verifying it has data.

### Quarantine / write-off — two-path

**Path 1 — At inwarding (damaged/expired on arrival):**
```
Inward QC → damaged/expired → VRA → vendor accepts → return + debit-note settle
```

**Path 2 — Post-inward (stock already at WH expires/damages):**
```
Stock at WH → expiry/damage → Try VRA
   → Vendor accepts → return + settle
   → Vendor rejects → Adjustment Down → write-off
```

Tables:
- `inward_product_details` VRA cols: `vrachecked`, `vra_quantity`, `remaining_quantity_for_vra`, `reason_for_vra_checked`, `vra_accepted_reason_id`
- `inventory_adjustment_request` + `inventory_adjustment_details` — adjustment-down records
- `inventory_audit` — cycle-count audit (`old_quantity`, `is_audit_done`)

### Putaway (8 types — `PUTAWAY TYPE` master)

| Code | Type |
|---|---|
| 540 | ORDER PUTAWAY (RTO / cancel reverse) |
| 541 | TO PUTAWAY (Transfer Order between WHs) |
| 542 | BILL PUTAWAY (post-procurement inwarding) |
| 551 | BIN TO BIN |
| 562 / 576 | COLDCHAIN PUTAWAY |
| 583 | REVERT PICKING PUTAWAY |
| 683 | BATCH VERIFICATION PUTAWAY |

Faridabad variant: PUTAWAY-FBD. Edge → Quarantine zone or next-rack suggest.

### 5 PTS-restricted cols on `inward_product_details` (LOCKED)

For `tm_analytics` Redshift group, these 5 cols are GRANT-hidden:

1. `pts`
2. `verified_pts`
3. `final_pts`
4. `invoiced_final_pts`
5. `verified_pts_by_cp`

PTR / MRP family stay visible.

### Hub Config (per-WH, on `warehouse_details`)

`procurement_cut_off_time` (IST time-of-day), `warehouse_processing_days`, `work_start` / `work_end`, `vinculum_loc_code` + `ims_enable` (WMS routing), `ns_warehouse_id` (NetSuite ref).

Admin-UI dimensions: SKU Categorization (A/B/C), Bulk SKU List, Cold Chain SKU List, Homeopathy SKU List, Pack-size mgmt, Excess Inventory Report, WH Prioritization, Hub-level SKU Forecasting.

### Anti-patterns

- ❌ Trust `mwm.availability` as real-time qty — it's MANUAL, Catalogue-team-managed
- ❌ Treat `is_searchable` as stockout signal — only hides broken catalog rows
- ❌ Read backorder from `order_details` — use `package_details_tracking.is_back_order`
- ❌ Use `scm_wh_stock_threshold_master` — empty
- ❌ Use `medicine_stock_details` or `inventory_tracking` — legacy
- ❌ Forget Faridabad runs Vinculum — naive joins on `product_inventory_data` (DB 180) miss Faridabad; use DB 432 mirror with `warehouse_id IN (11, 21)`
- ❌ Bypass 5 PTS-restricted cols for `tm_analytics` group
- ❌ Assume cold-chain at WH level — it's pincode-level (`pincode_warehouse_master.is_cold_chain_deliverable` on priority=1 rows)

### Remaining gaps (lower-priority dump for v0.1.4+)

- [GAP] Actual `bucket_type` enum values on `order_inventory_ledger`
- [GAP] Cycle-count cadence + shrinkage benchmark
- [GAP] Excess-inventory threshold + age-bucket + ops owner team
- [GAP] Replenishment Min-Max formulas (the empty `scm_wh_stock_threshold_master` was supposed to hold these — confirm where live formulas live now)
- [GAP] DB 993 SF WAREHOUSE_MANAGEMENT_SYSTEM Snowflake scope — what does it cover that DB 180 + DB 432 don't?

---

## § 12 — TAT (Turnaround Time)

> Lifted into `skills/tm-chotu-tat/SKILL.md` v0.1.5. This is the canonical KD source.
> **v0.1.5 deep-rewrite:** DDT model replaces order_status-only model, OTIF locked at 62.59%, business-hours decomposed, WH processing 4-bucket grid, RTO chain decoded across 6 master groups. Confirmed live via DB 630 + DB 170 probes 2026-05-26.

### Canonical TAT source — LOCKED

**`delivery_date_tracker` (DDT)** on DB 630 MySQL `TMMUMPSDB.delivery_date_tracker`. Mirror: DB 170 Redshift `tmmumpsdb.append_only_delivery_date_tracker` (Airbyte CDC stream).

**Grain rule:** ONE row per order_id. `promised_*` set ONCE at placement and **NEVER changes** (unless order goes INCOMPLETE). `current_*` updates each step (live re-projection). `actual_*` set when actuals happen, then frozen.

5 promise/actual pairs: delivery / dispatch / doctor_call / warehouse_processing / air_delivery (no actual col).

`metadata` longtext JSON carries full PDD audit (`is_sdd`, `wh_processing_type`, `wh_processing_mins`, `doctor_working_hours`, `warehouse_work_start/_end`, buffer config, `pb_audit_source`).

Companion: `delivery_date_timeline` = per-event change log of PDD updates.

### ❌ Tables NOT to use

| Table | DB | Why |
|---|---|---|
| `order_tat_base_model` | 170 | **Stale.** Tempting 40-col pre-computed deltas (op2od, drc2ful, …) but data unreliable |
| `order_tat_details` | 170 | Needs deep-dive (promise_tat / supposed_tat / delay_days semantics) |
| `pincode_tat_adherence_data` / `_mfc` | 630/170 | Rich 21 cols (ideal/final/supposed_tat, breach buckets, adherence %) but needs deep-dive |

### OTIF — LOCKED LIVE NUMBER

**Formula:** `actual_delivery_date <= promised_delivery_date` (promised IS the original commitment).

**Network OTIF (last 30d, probed 2026-05-26 on DB 170):**

| Delivered | On-time | OTIF |
|---|---|---|
| 624,149 | 390,663 | **62.59%** |

### Business hours — three layers

| Layer | Window | Source |
|---|---|---|
| Doctor | **08:00–22:00** | `metadata.instrumentation_details.doctor_attributes.doctor_working_hours` on DDT |
| WH | per-WH (varies — ANKW typically 10:00–19:00) | `TMMUMPSDB.warehouse_details.work_start / work_end` |
| WH week-off (NON-inventory only) | per-WH weekly off-day | `TMMUMPSDB.wh_weekoff_schedule (warehouse_id, week_off_day)` |
| Logistics (courier cutoff) | per-(WH, courier, express, pincode) | `TMMUMPSDB.courier_partner_schedule.courier_partner_schedule_time` |

### WH processing TAT — 4-bucket grid

Source: `TMMUMPSDB.wh_processing_time (wh_id, type, processing_time_in_mins, active)`. Filter `active=1`; inactive rows are audit history.

Type enum (4):
- `SDD_INVENTORY` / `NON_SDD_INVENTORY` / `SDD_NON_INVENTORY` / `NON_SDD_NON_INVENTORY`

Sample active (probed 2026-05-26):

| WH | NON_SDD_INVENTORY | NON_SDD_NON_INVENTORY |
|---|---|---|
| 17 BLR Hub | 60 min | 660 min |
| 20 Mumbai New | 60 min | 750 min |
| 22 Kolkata Dhulagarh | 60 min | 615 min |

Stamped on each order in DDT `metadata.warehouse_attributes.wh_processing_mins` for audit.

### `order_status` transition log — operational deltas

For state-hop questions DDT doesn't answer. Schema:
```
order_status_tracking_id, order_id, order_status_id, modified_by_id, modified_on
```

Pattern: `MIN(modified_on)` per (order_id, status_id) → delta. `MIN` = first-entry; `MAX` = last-transition / breach.

### RTO chain — decoded across 6 master groups

⚠️ NOT all under `name='ORDER STATUS'` — RTO statuses sit in their own master groups (RTON / RTO / RTO-IT / RTO-OFD / RTD / RTU) but reference the same `order_status_id` column.

| serial_id | name | value |
|---|---|---|
| 119 | RTON | RTO Notified |
| 120 | RTO | RTO |
| 121 | RTO-IT | RTO In Transit |
| 123 | RTO-OFD | RTO Out For Delivery |
| 124 | RTD | RTO Delivered (terminal) |
| 125 | RTU | RTO Undelivered (branch) |

RTO TAT = MIN(modified_on at 124 RTD) − MIN(modified_on at 60 DISPATCHED).

### Customer return chain (post-delivery, separate from RTO)

56 ORDER RETURNED / 190 RETURN REQUESTED / 191 RETURN GENERATED / 192 RETURN DECLINED / 200 PARTIALLY RETURNED / 218 SALES RETURN GENERATED / 263 RETURN IN TRANSIT / 272 RETURN PICKED UP / 273 RETURN DELIVERED / 301 RETURN TICKET CANCELLED.

### Module-internal SLAs — locked

| Segment | SLA |
|---|---|
| Doctor approval | `promised_doctor_call_time` on DDT IS the SLA. Compare actual vs promised. |
| Pharmacist Type-1 digitize (DRX 29→30) | **NO formal SLA.** Rolls up into pre-confirm window. |
| Putaway (inward→bin) | **NO formal SLA.** No breach metric. |
| WH processing | `wh_processing_time` 4-bucket grid (see above). |
| HA single-call connect % | [GAP] live number, HA module owns. |
| Refund | Per-destination (see below). |

### Refund SLA per REFUND_TO destination

(`m_system_value_master name='REFUND_TO'`)

| serial | Destination | SLA |
|---|---|---|
| 206 | TM_CREDIT | **Instant** |
| 207 | TM_CASH | **Instant** |
| 264 | TM_CASHBACK | **Instant** |
| 208 | CASHFREE | **5–7 working days** (bank-side) |

### Courier-partner pincode TAT (PDD input)

Per-(pincode, warehouse_id) row on `TMMUMPSDB.pincode_warehouse_master`: `surface_delivery_days`, `air_delivery_days`, `is_sdd` (bit), `is_serviceable_by_delhivery/_xpress_bees/_air_delhivery`, `shipping_partner_id`, `priority`. Filter `priority=1` for primary WH-pincode pair.

Drives logistics leg of PDD; stamped into DDT `metadata.logistics_attributes` for audit.

### Anti-patterns

- ❌ Use `order_tat_base_model` — stale
- ❌ Compute OTIF off `order_details.delivery_date` (varchar, ambiguous) — use DDT
- ❌ Recompute PDD when DDT `metadata` JSON has full audit
- ❌ Filter RTO via `name='ORDER STATUS'` alone — RTO statuses are spread across 6 master groups (use `order_status_id IN (119, 120, 121, 123, 124, 125)`)
- ❌ Measure Doctor TAT wall-clock — respect 08:00–22:00 window
- ❌ Compare actual vs `current_*` for OTIF — always use `promised_*`
- ❌ Lock `pincode_tat_adherence_data` or `order_tat_details` without deep-dive
- ❌ Apply `wh_weekoff_schedule` to inventory orders — only non-inventory
- ❌ Mix `tmmumpsdb` lowercase (Redshift) with `TMMUMPSDB` uppercase (MySQL)

### Remaining gaps for v0.1.6+

- [GAP] `order_tat_details` deep-dive (promise_tat vs supposed_tat semantics + DDT relationship)
- [GAP] `pincode_tat_adherence_data` deep-dive (21-col semantics + per-bucket use case)
- [GAP] Air-delivery actuals storage (no actual_air_delivery_date col on DDT)
- [GAP] DB 994 SF LOGISTICS scope (MFA required to probe)
- [GAP] OTIF target / business goal (current 62.59% — what's the goal?)
- [GAP] Doctor TAT P50/P90 current network number
- [GAP] HA single-call connect % current
- [GAP] CASHFREE refund actuals (target 5-7d, current?)

---

## § 13 — tm-fraud-engine Spec 1 (v2 prod-hardening, 2026-05-27)

> ⏳ **HISTORICAL build record.** Current canonical state is **§ 15** (shipped & live). Kept for spec lineage.

Reference docs in tm-fraud-engine repo:
- Spec: `docs/superpowers/specs/2026-05-27-spec1-prod-hardening-design.md`
- Plan: `docs/superpowers/plans/2026-05-27-spec1-prod-hardening-plan.md`
- Probe re-run learnings: `docs/LEARNINGS_SPEC1.md` (template; values pending manual run)

### Fixes shipped (6 families, 21 plan tasks)

- A: Data integrity — T6 transactional ingest day-loop, T17 transactional score loop + sorted REGISTRY
- B: Signal accuracy — N2 fix (customer_devices_30d table), T9-S1 customer_name inspection, T9-S2 SQL normalize, T10 SPLIT_PART, S11 boundary-anchored, L2 NULL guard
- C: DRY — _helpers.py extraction, pkgutil auto-import, WEIGHT constant
- D: Output — sheets_writer monthly cache, conditional row tinting
- E: Deploy hygiene — Secrets Mgr dual-path, real DRIVE_FOLDER_ID, ad-hoc audit
- F: Per-order lookback — F-LBW1 (6 signals), F-LBW2 (substrate window), F-LBW3 (CLI flag)

### Key learnings dumped into skills

- customer_device_tracker schema → `tm-chotu-tables-enums`
- Signal windowing semantics → `tm-chotu-modules`
- "Window endpoint = event date" rule → `tm-chotu-query-rigor`
- Project status bump → `tm-chotu-projects`

### Branch state at dump time

- Branch: `impl/spec1-prod-hardening`
- Last commit: `d563781` (verification log)
- 46 files changed vs main, ~4961 insertions / ~164 deletions

---

## § 14 — tm-fraud-engine Spec 2 — scoped ELT scale re-architecture (2026-05-28)

> ⏳ **HISTORICAL build record.** The scoped-ELT design below is now the shipped production path — current canonical state is **§ 15**. Kept for spec lineage.

Problem: Spec 1 ingest full-scanned + mega-JOINed via Metabase REST → 300s timeouts, doesn't scale with order volume.
Fix: file scope → indexed parallel raw fetches → DuckDB compute → score scope. 98 orders / 22.4s (was 300s timeout).
Branch impl/spec2-scoped-elt (16-task plan). Refs: docs/superpowers/specs/2026-05-28-scoped-elt-ingest-design.md, docs/LEARNINGS_SPEC2.md.
6 prod bugs caught across Spec 1+2 (ARN, JSON secret, X-API-Key, MySQL CAST, timeout, HTTP 202) — none caught by unit tests, only live EC2 probes. Reinforces integration-test-before-merge.

### Key learnings dumped into skills

- Scoped ELT pattern + MySQL-vs-Redshift selective-lookup finding → `tm-chotu-data-sources`
- "Respect indexes / decompose mega-JOINs" rule → `tm-chotu-query-rigor`
- Fraud-engine 7-table index map + ctt 128M row / INDEX(order_id) note → `tm-chotu-tables-enums`
- Spec 2 status bump → `tm-chotu-projects`

---

## § 15 — tm-fraud-engine — fraud-detection LOGIC (reuse on demand) + current state (2026-06-18)

> Supersedes §13 (Spec 1) + §14 (Spec 2), kept above as dated build history.
> Repo `gitlab.com:tm-exp/tm-fraud-engine`, branch `main`, HEAD `5a6d68e`.
> All secrets / infra IDs (ARNs, AWS account, EC2 host, RDS host, GCP SA, Drive folder ids, recipient emails) live in **AWS Secrets Manager** + repo `docs/REFERENCE.md` — **never** in this plugin.

### ⛔ Scope guardrail — read first
**What tm-chotu DOES with this section:** carry the **reusable fraud-detection logic** — the 24 signals, their SQL mechanisms, the verdict thresholds — and **apply it on demand** (when a user triggers it) to score orders and surface **new** suspicious/fraud orders via tm-chotu's normal Metabase data path (DB 630 / 170). tm-chotu is a knowledge + ad-hoc-detection layer.

**What tm-chotu must NEVER do:** run, deploy, trigger, SSH into, schedule, or otherwise **operate** the deployed `tm-fraud-engine` on the **DCOE EC2** instance. The production deployment (systemd timer, SES email, Google Sheet, scope-file pipeline) is operated **separately** and is **reference-only** here. If a user asks tm-chotu to "run the fraud engine" / "kick off the daily run" / "deploy it" / "SSH and trigger it" → **decline**, and instead offer to *apply the detection logic ad-hoc* (see "Applying the signals ad-hoc" below) or point them to the engine's owner.

**One-liner (the deployed engine, for context only):** a daily rule-based fraud-detection engine for Truemeds affiliate orders across all channels (web/app/ios) — team drops a curated scope file, it scores every order against 24 rule signals over a 30-day customer-keyed substrate, emails a CSV + writes a Google Sheet. **tm-chotu reuses its *logic*, not its *runtime*.**

### Status (HEAD `5a6d68e`)
- **P1 (rule-based MVP): SHIPPED & LIVE since 2026-05-29.** Full ELT pipeline runs daily on EC2.
- **All-channel since 2026-06-01** (was web-only). Channel from `order_device_mapping.source` → `orders_30d.channel_source` → lowercased `channel` CSV col + `by_channel` email/Sheet breakdown. Operational unblock only — no new signals, no recalibration. App orders still scored on web-tuned weights (web-only signals L1/L2/N5 no-fire on app → mild systematic under-scoring; deferred follow-up).
- **SES production access GRANTED 2026-06-12** — quota 50k/24h, 14/s, healthy (ap-south-1). Sender `fraudengine@<COMPANY_DOMAIN>`; domain DKIM + custom MAIL FROM + DMARC all pass → inbox.
- **Automation:** systemd timer `tm-fraud-engine-daily.timer` @ 01:00 UTC (**06:30 IST**) → `scope_run.sh` → `main scope-file`. Host uses systemd timers (no cron). Skip-if-stale when newest scope file older than `TMFE_SCOPE_MAX_AGE_DAYS=1` (exit 0).
- **All specs merged to `main`** (MR !1–!6 + all-channel `impl/app-scope-expansion`). Test suite grew 154→334 passing; mypy strict + ruff clean.
- **Next:** P2 (AI augmentation — Haiku address parser + Sonnet case narrator) gated on "P1 stable 7d + ≥30 days ops feedback". P3 = Opus weekly pattern miner + monthly red-team + feedback learner.

### Architecture — scoped-ELT (the deployed engine's internals; REFERENCE only)
> This is how the *operated* engine is built — read it for understanding. tm-chotu does **not** run this pipeline; it reuses the **Signals** logic below. Stages: **file-scope → indexed parallel raw fetch (no joins) → DuckDB local compute → score → report/email/sheet.**

| Module | Role |
|---|---|
| `scope/drive_source.py` | Poll Drive folder, download `Affiliate_Merged_YYYY-MM-DD.csv/xlsx` → `ScopeSet` (the order_id universe to score) |
| `extract/fetcher.py` + `extract/queries.py` | Chunked parallel raw fetch, **ONE indexed query per table** keyed on order_id / customer_id / address_id. Scope orders + each customer's trailing-30d history |
| `preflight.py` | Fail-loud checks (enforces the `ctt` order_id index exists) before expensive work |
| `load/duck_loader.py` | Load raw results into ephemeral DuckDB `raw_*` staging (`CREATE OR REPLACE`, zero accumulation) |
| `transform/assemble.py` | DuckDB-local joins: `raw_*` → `orders_30d` + `customer_devices_30d`; cdt device-collapse done locally on the small scoped set; carries `channel_source` |
| `normalize.py` | Pure idempotent raw→canonical column-rename layer (defends vs upstream alias drift — see learnings) |
| `features/substrate_index.py` | Precompute a `SubstrateIndex` ONCE per run; S9/S2/S1 do O(1) lookups (the perf fix; scan fallback retained) |
| `features/*` + `registry.py` | 24 signals, `@register(code,name,weight,family)` decorator |
| `score.py` | Composite verdict + per-order eval → DuckDB `signals`+`verdicts`; `prune_verdicts` reaper |
| `report.py` | CSV rows + summary incl. `by_channel` breakdown |
| `email_sender.py` | AWS SES; renders "FRAUD BY CHANNEL" body; persists failed emails to disk |
| `sheets_writer.py` | gspread monthly Sheet, tab-per-day, colour-coded, `ops_*` feedback cols (must be a Shared Drive — service account has no My-Drive quota) |
| `metabase_client.py` | Metabase REST (`POST /api/dataset`); auto-detects `X-API-Key` (mb_ prefix) vs `X-Metabase-Session`; 300s timeout floor; accepts HTTP 200 **and 202** |
| `secrets.py` | AWS Secrets Manager (FULL ARN always; `fetch_secret_json` for the JSON-shaped Metabase secret) |
| `main.py` | CLI: `daily` \| `probe` \| `scope-file` |
| `ingest.py` | **LEGACY `daily` path** — full-scan + mega-JOIN via `AFFILIATE_ORDERS_SQL`, timeout-prone, retired from cron, kept for manual probes |

**Run modes:** `scope-file` (prod — scores the file's order_ids; substrate = customer-keyed T-30d, bounded by file size not platform volume) · `daily` (legacy/manual self-pull from Metabase) · `probe` (backfill a date range, no email/sheet, needs `[start−30d]` substrate preload).

### Signals — 24 across 9 families
Families: **blocklist** (S0) · **identity_ring** (S1/S2/S3/N3) · **network** (S5/S6) · **address** (S7/S9/S10/S11/N6/N8) · **identity** (S8) · **history** (N1/N2/N7/N10/N11) · **economics** (S13/S14) · **attribution** (N5) · **session** (L1/L2). *(SIGNALS.md still lists the original 19; N6/N7/N8/N10/N11 added in the P1.5 sweep.)*

Weights `HARD_HIGH=99` · `HIGH=3` · `MED=1` · `LOW=0.3`. Verdict (in `score.py`):
- **S0 blocklist = the only HARD_HIGH** — a single rapidfuzz `token_set_ratio ≥ 0.85` match vs `fraud_customers_address` force-sets **FRAUD**.
- **FRAUD** if ≥1 HIGH **OR** ≥2 MED **OR** score ≥ 3.0.
- **SUSPECT** if 1 MED + ≥2 LOW **OR** score ≥ 1.5. Else **CLEAN**.
- **N7** is tiered: MED at 2–4 affiliate orders → **HIGH at ≥5** (heavy-farmer fix).
- Thresholds are **hardcoded in `score.py`**; `automations/signal_weights.yaml` is the human-readable spec/source-of-truth (wiring YAML→code is a future task — change **both** when tuning).
- **Append-only rule (CLAUDE.md #1):** new signal = new `@register` entry + SIGNALS.md row + yaml row; retire via `active=False`, **never delete code**. Sole exception: the `prune_verdicts` reaper (rolling `TMFE_VERDICT_KEEP_DAYS=7`) — allowed only because a durable copy lives in CSV + email + Sheet; disable the reaper if exports ever stop.

### ✅ Applying the signals ad-hoc (what tm-chotu actually does on trigger)
**This is tm-chotu's fraud job** — no engine, no EC2, no DuckDB runtime. The signal table above **is** the runnable detection logic: each signal is a deterministic rule over order + 30-day-history fields. On a user trigger ("find new affiliate frauds in last N days", "is order X suspicious", "score these orders for fraud"):
1. Pull candidate orders + their 30-day customer-keyed substrate via **Metabase MCP** (DB 630 / 170) — the same tables listed under Data sources.
2. Evaluate the relevant signals as SQL/Python predicates: recurrence counts (phone/name/device/IP), embedded-phone regex `[6-9]\d{9}`, address fingerprint md5, IP /24 burst, blocklist fuzzy-match (`token_set_ratio ≥ 0.85`), RTO%, multi-device burst, p95 economics.
3. Apply the verdict rule (**≥1 HIGH** OR **≥2 MED** OR **score ≥ 3.0** → FRAUD; **1 MED + ≥2 LOW** OR **≥ 1.5** → SUSPECT; else CLEAN) and return the flagged orders + which signals fired (the evidence).
- Per-signal SQL/logic reference: repo `docs/SIGNALS.md` + `docs/REFERENCE.md`. Reuse the *rule*, run it against a live Metabase query result — that's the whole job.
- Apply tm-chotu **query rigor** (time-window guard, sample-first, index-aware): `order_details` / `customer_traffic_tracking` are large; filter by date + affiliate scope first.

### Data sources
- **Metabase REST only, DB id 630** (the unrestricted Main_DB replica), `POST /api/dataset`. No on-disk creds. DuckDB = transient local working store, **not** system-of-record.
- Tables: `order_details`, `customer_details`, `d_address_master`, `order_device_mapping` (odm), `customer_traffic_tracking` (ctt), `customerrtoorder_percentage` (rto), `customer_device_tracker` (cdt), `fraud_customers_address` (blocklist, `active=1`; source typo `fruad_address_string` aliased → `fraud_address_string`), `p95_baselines` (S13/S14 cohort thresholds).
- **`ctt` INDEX(order_id)** = `idx_customer_traffic_tracking_order_id` on the 128M-row ctt — turned a full-scan into a range scan (EXPLAIN type=ALL → type=range, rows≈3). `preflight.py` enforces its presence.
- **Channel discriminator:** `odm.source` (WEBSITE / APP / IOS / ASSISTED PORTAL). ⚠️ `odm.platform` = 100% NULL (dead column). ⚠️ `odm.utm_source` = NULL for APP/IOS (web-only; app attributes via AppsFlyer, not ingested).
- DuckDB tables: `orders_30d`, `fraud_blocklist`, `signals`, `verdicts`, `p95_baselines` (+ un-collapsed `customer_devices_30d`, ephemeral `raw_*`).
- Status codes used: 39 placed · **55 delivered (in-scope)** · 56/57/121/124/174 cancelled · 199 refunded. `payment_id` 16 ONLINE / 17 COD.

### Deployed engine — REFERENCE ONLY (NOT operated by tm-chotu)
> Context for how the production engine runs, owned + operated separately. **tm-chotu must not run, deploy, trigger, SSH, or schedule any of this.** See the scope guardrail at the top of §15.
- Shared **DCOE EC2** host (`<EC2_HOST — Secrets Manager / REFERENCE>`); deploy path `/home/ec2-user/tm-fraud-engine`; Python 3.11 venv; reserved port **9700** (unused in MVP). Co-tenants DCOE (8000) + inventory-adjustment-dash (8800) — strict namespace isolation, never touch others.
- systemd timer 06:30 IST → scope-file mode; skip-if-stale; unit files in `automations/systemd/`. Disable via `systemctl disable --now`.
- SES sender `fraudengine@<COMPANY_DOMAIN>`; **recipients in `automations/recipients.yaml`** (project owner + fraud-ops roles) — never paste personal emails into this plugin.
- Output: per-run CSV `reports/tm-fraud-scope-{run_date}.csv` (named-by-date, never overwritten) + failed-email CSVs in `logs/failed-emails/`; monthly Google Sheet `tm-fraud-YYYY-MM` in the "Fraud Engine" **Shared Drive**, one colour-coded tab per day, `ops_*` feedback columns. **No PDF** in the automated path (a one-off marketing findings PDF exists in `reports/`).
- **No CI/CD** — manual deploy (`git pull` + `pip install -r requirements.txt` + `make test`).

### Key learnings (live-only prod bugs + lessons)
The **6 prod bugs** that no unit test caught — only live EC2 probes against real Metabase/AWS:
1. Wrong default Secrets Manager ARN (guessed short name didn't exist) → use the real full ARN everywhere.
2. JSON-shaped Metabase secret `{base_url, api_key, …}`, not a raw token → `fetch_secret_json` + extract `api_key`.
3. `X-API-Key` vs `X-Metabase-Session` — prod uses mb_-prefix API keys → auto-detect by prefix.
4. MySQL CAST dialect — MariaDB rejects `CAST(NULL AS DOUBLE/VARCHAR)` → use `DECIMAL/CHAR`.
5. Query timeout — 120s → **300s floor** (cdt MAX-collapse subquery scanned the whole table per call).
6. **HTTP 202** — Metabase returns 202 when it caps results; client must accept 200 **and** 202.
- **Column-alias drift → 89.8% silent under-detection** (Apr 2026): 7,400 / 8,241 orders carried raw DB column names (`orderstatus`, `address_line`, `is_ftc_order`) instead of canonical aliases → scorer saw `None` → address + FTC-gated signals silently no-fired. The "17% FRAUD" headline was a floor, not a measurement. Fix: idempotent `normalize.py` rename layer. **Lesson: pipelines reading canonical-named rows MUST defend against raw-DB-column drift** [memory `feedback_normalize_upstream_rows`]. *(Note: `normalize_order_row` not yet wired into the new ELT fetcher — latent; mitigated because `assemble.py` references aliased cols as hard SQL identifiers → drift fails LOUD at parse, not silent-NULL.)*
- **S9 = 89% of scoring time** (profiler): per-order re-scan recomputing all md5 address fingerprints. The "5 equal scanners" guess was WRONG → **profile-first**. Fixed by the `SubstrateIndex` precompute.
- **N2/N3 device-collapse bug:** cdt subquery did `MAX(device_id)` per customer (one device only) → N2 could never fire, N3 under-fired. Fixed by counting from un-collapsed `customer_devices_30d`.
- **Integration-test-before-merge:** unit tests pass on synthetic dicts; run a LIVE integration test on the deploy target before merging — that surfaced all 6 runtime bugs [memory `feedback_integration_test_before_merge`].
- Security: a GCP service-account private key was once pasted into chat → rotated same day, moved to Secrets Manager.

### Performance
- **Spec 2 live proof (98 orders, EC2):** full pipeline **22.4s** end-to-end (old full-scan design timed out at 300s).
- **Real 13.3k-order prod file:** assemble 2s; scoring 37min (killed) → **2m50s** after `SubstrateIndex`; end-to-end ~9 min. **First production fraud distribution: 34.2% FRAUD** (4,549/13,312) — aff_cashkaro 40.3% · aff-maatr 48.8% · aff-gpartner 27.5%.
- **99,038-order all-channel acceptance file:** L1/L2/N5 fired 0× on app/ios (fail-safe verified); backfill ~1h11m (substrate-fetch is I/O-bound — scaling watch for large backfills).
- **Normal daily (~250–486 affiliate orders, ~7–10k trailing-30d):** scoring in seconds.
- **Calibration:** Rhea 935-fraud recall 78.18% — reference / direction-check only, **NOT a CI gate** [memory `feedback_real_probes_over_mocks`].

---

## § 16 — DCOE cohort axes, derivable on Metabase alone (2026-07-07)

Full logic + ready-to-run DB 170 SQL lives in `skills/tm-chotu-dcoe-cohorts/SKILL.md`. Purpose: reproduce DCOE's customer scoring **without the DCOE RDS/EC2** — every axis is computed from tmprod tables on Metabase. Shipped so the plugin can be shared with someone who has Metabase but no DCOE access.

**Shared rules:** DB 170 `tmmumpsdb` (Redshift). Valid-order filter `organisation_id=1 AND orderstatus NOT IN (49,312,174,1,2,3,4,58,274,344,668)`. Delivered = `orderstatus=55`. Windows: CM 90d · coupon/subs 180d · generic 365d. Recompute percentile cuts per pull.

**The 4 axes:**
1. **CM-high** — `cm_net` (contribution margin) = rev_ex_gst (product invoiced-only + delivery + packaging) − COGS − zone_shipping − COD_surcharge − return_logistics − 7 packaging − promo_comm − coupon − tm_cash − adjustment − price_lock − CPO. High = `PERCENT_RANK(cm_net_90d) ≥ 0.90` over active base (`CM++`). Skill ships a runnable **margin proxy** (dominant tmprod components) + the full formula spec + the sharp gotchas (invoiced-FSP-only revenue, `pickup_time` for zoning, id→name CPO gating, ticket status=90 returns / `return_tracker` on Redshift, nsib `rate` grain caveat).
2. **Generic Champions** — `generic_share` = generic delivered lines / all delivered lines (365d), `medicine_master.generic_branded='Generic'`, guard ≥5 lines. Champion `L3` ≥0.50 · adopter `S1` ≥0.30 · branded-loyal `S2` ≤0.10.
3. **Coupon dependency** — `coupon_order_ratio_180d` = coupon orders / valid orders (`offer_id>0`). Dependent `HD/AC` ≥0.70 (V3 lever) · full-price loyal `V4` ≤0.20. True **burn** ≠ dependency: burn = `discount_applied` (instant) + `wallet_money.cash` type=264 (cashback leg, MySQL-only).
4. **Substitution propensity** — `subs_accept_rate` = accepted(61)/offered(61+62) on `final_substitute_product_cx_confirm.status_id`, 180d. `SA` >0.70 · `SW` 0.30–0.70 · `SR` <0.30 · `SNO`. **F1 pivot (2026-06-09):** DCOE's margin *lever* moved off accept-rate onto `generic_share` (goal = generic adoption, not the sub mechanism); accept-rate is now a secondary signal + Gold/Silver/Bronze bridge only.

**Composite cohorts:** Golden Geese = `CM++ ∩ HV(LTV top-decile) ∩ S1(generic≥0.30) ∩ ACT(≤30d)`. Coupon Addicts = `HD ∩ CM- ∩ ACT`. Margin Bleeders = `CM-- ∩ HD ∩ ACT`. Generic Champions = `generic_share≥0.50`.

**Parity caveat (documented):** skill windows on `created_on`+`orderstatus=55`; DCOE windows on `delivery_date_tracker.actual_delivery_date` — join `append_only_delivery_date_tracker` (DB 170) for strict parity. Proxy omits shipping/CPO/promo-comm/return-logistics — add per §1 of the skill for exact cm_net.

---

## End-of-file

After Mangesh redline pass:
1. Each `§` body lifts into `skills/tm-chotu-<section>/SKILL.md`
2. `[VERIFY]` items resolved via direct Metabase MCP probes
3. `[REDLINE]` items resolved 1:1 with Mangesh
4. Numbers / enums get `[CITED]` tag with actual source query
5. v0.1.0 tag → push to GitLab

## Intent-First + Back-by-Proof (v0.1.15)

Every metric request is hard-gated: chotu states the data structure + interpretation branches (from `tm-chotu-query-rigor/METRIC_CATALOG.md`), HARD-STOPS for the user's goal + branch, then sample-first, then pulls. Every number ships back-by-proof — exact SQL + capped raw sample (10–20 rows) + aggregate breakdown; "all raw data" → export path. Session-lock stops re-asking the same metric; "just the number" collapses the dialogue but still discloses branch + SQL. Catalog cites section skills (never copies formulas). Grounds two failures: Kunal (summed across inventory tables) → never-sum anti-pattern in `tm-chotu-inventory`; Rahul (invented revenue from incomplete orders) → revenue branch table with LOCKED GMV vs SLICE placement-momentum.

## Dead-order status set (v0.1.16)

"Net of cancels" / "exclude cancelled" for placed-level revenue or real-order counts = the FULL DEAD-ORDER STATUS SET, never just orderstatus 57. Locked in tm-chotu-definitions: `orderstatus NOT IN (49,274,400,668, 57,232, 174, 312)` = incomplete (49/274/400/668) + cancelled (57/232) + discard (174) + scrapped (312). Pre-conversion (1 NEW/2 PENDING VERIFICATION/3 ERROR) excluded per use-case; 284 DELIVERY FAILED is a real billed order (RTO path, not dead). Fixes the "revenue yesterday" miss where only 57 was excluded and discarded/incomplete (₹0) rows leaked in. Enforced by a query-rigor rule + METRIC_CATALOG revenue branch (a) now = SUM(final_amount) placed, net of dead set.

## COGS & CM1 gross margin (v0.1.17)

COGS locked from DCOE CM_CALCULATION.md (user-validated): source = net_suite_invoice_batch, `COGS = SUM(nsib.rate*nsib.quantity) WHERE active=1`, join fsp.final_subs_id=nsib.fsp_id. rate = per-unit, GST-EXCLUSIVE. CM1 = product_rev_ex_gst − COGS (both ex-GST): revenue = FSP selling_price / (1+medicine_master.gst/100), invoiced lines only (invoice_batch_id NOT NULL). CM1 = product gross margin only (NOT shipping/packaging/burns/CPO = cm_net). MANDATORY caveat every COGS/margin answer: NSIB rate = latest batch rate in that WH at invoice-creation, NOT NetSuite FIFO COGS — won't reconcile; TM doesn't store FIFO today, IMS project brings it. NSIB-era boundary 2022-11-17 (pre → product_pts_tracker.pts*qty capped at MRP, or N/A). Enforced by query-rigor mandatory-caveat rule + METRIC_CATALOG margin branch (c) + definitions COGS&CM1 section.

## HM/LM product-margin segregation — GATED (v0.1.18)

New table `medicine_quarter_master` (per-product-×-quarter HM/LM tag; 631,811 rows; Redshift 170 + Main DB 630; group tm_analytics). HM ⇔ effective GM% ≥ quarter threshold (Scenario 5: 18% except 2024-Q4/2025-Q1/2025-Q4 = 20%). 1-quarter-lag rule (tag for Q uses Q−1 GM; fallback current-qtr → LM default; gm_source records which). GM% = (rev_exGST − COGS)/rev_exGST over delivered lines; COGS is NSIB-cousin → FIFO caveat applies. Join: product_code AND date_trunc('quarter', order.created_on)=quarter; unmatched → LM. 🔒 HARD GATE (query-rigor): surface HM/LM ONLY if persona=Founder/Leadership AND goal=margin-health/business-decision — else say nothing, fall back to CM1/cm_net (quick analysis). The crux (leadership insight): branded/generic label is fixed while real margin moves via partnerships; a "branded" product can cross the threshold into HM; this table is the true "which products make money" segregation, decoupled from the branded/generic label. Caveats: HM share of products ≠ revenue (~37-43% GMV, reconciles 42.90%); used_in_published_pack=1 for Apr-2023+; 2026-Q3 partial quarter.

## HM/LM gate — silent close (v0.1.19)

When the HM/LM gate is CLOSED, close SILENTLY: never say "HM/LM"/"medicine_quarter_master"/"margin-tier", never narrate the gate check in the visible reply, never surface the branded≠margin decoupling insight (that IS the gated crux, not permitted framing). Permitted for non-leadership = plain "branded≈low/generic≈high" shorthand (no corrective twist) + CM1/cm_net for quick analysis. Fix from v0.1.18 battery: 2 leaks were meta-leaks (chotu printed "HM/LM stay hidden" / its gate scratchpad, and leaked the decoupling caveat to a CX persona).
