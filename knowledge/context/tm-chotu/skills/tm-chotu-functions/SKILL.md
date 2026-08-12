---
name: tm-chotu-functions
description: Truemeds org functions and their sub-teams (Marketing, PM, CMT, Analytics, Operations, CX, Doctor, Diagnostics, Tech, Finance, Legal/HR/Compliance, Leadership). Load when user asks "who owns X", "what does the Marketing team do", "which team handles substitution / fulfilment / dispatch / returns / fraud", or any role-scope question. Roles only — no specific people.
---

# Functions

## Marketing — 7 sub-functions + Offers

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

**KPIs:** paid CAC, ROAS (primary), install→FTC%, reactivation rate, blended CAC, organic share

## Product Management — 5 sub-functions

| Sub-team | Scope |
|---|---|
| **Conversion** | Funnel optimisation — homepage → search → PDP → cart → checkout |
| **Growth** | Acquisition product, install funnels, referral, web-app cross-flows |
| **Substitution** | GX recommendation surfaces, doctor / customer substitution console, algo product wrap |
| **Post-order** | Three sub-pillars: **Doctor** (Rx review + teleconsultation tooling), **SCM** (supply-chain + inventory product), **CSR** (CX agent tooling, refund + complaint flows) |
| **Analytics for all modules** | PM-embedded analytics — feeds every sub-team with funnel + cohort + experiment readouts |

**KPIs:** funnel conversion rates by stage, NPS, time-to-deliver, app crash rate, experiment win-rate

## CMT — Catalog Management Team (separate function)

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

## Analytics / Data Science

- Cohort + retention reporting (M1 / M3 / M6, FTC cohorts)
- Substitution algo (`findBestSubForProducts`), pricing models, fraud detection
- DCOE (Dynamic Cohort Optimization Engine) — multi-axis bandit
- Daily / weekly dashboards (Metabase native + Excel handoffs)

**KPIs:** model precision/recall, decision-uplift, dashboard freshness, hypothesis-throughput

## Operations — 9 sub-teams

| Sub-team | Scope |
|---|---|
| **Central Procurement** | Ordering Plan, Generate PO, Cycle Selection, Inwarding & Invoicing, QC Process, Auto-Close PO, Auto VRA, Rate + Quantity Comparison, VRA Inwarding, Bulk VRA, PO Checker, Back Order Procurement |
| **Warehouse — Picking** | 3 picking variants: Single / Multi-order / Multi-order Pigeon-hole (zone-wise). Roles: Picker, Sorter, Checker, Problem Solver |
| **Warehouse — Putaway** | 8 putaway types: Order, TO (Transfer Order), Bill, Bin-to-Bin, Coldchain, Revert Picking, Batch Verification + FBD variant. Quarantine zone for damaged/missing/expired |
| **Warehouse — Replenishment** | Bulk Zone / JIT Zone tasks, Min Limit / Near-Expiry auto-tasks, Min-Max management |
| **Warehouse — Hub Config** | SKU Categorization, Bulk SKU List, Hub Transit Days, Refill PO Tracking, Cold Chain SKU List, Homeopathy SKU List, Pack-size mgmt, Excess Inventory Report, WH Prioritization, Hub-level SKU Forecasting |
| **Faridabad hub** | North-zone fulfilment hub, dedicated FBD putaway workflow exists |
| **Logistics** | Serviceability check, Courier Partner Priority, Pincode Master, Pincode Warehouse Master, Courier Partner Pincode TAT Adherence Calc |
| **3PL partners** | 13 partners locked: XpressBees, Delhivery (Express/NDD), Bluedart (Express), CABT, WeFast, Shipsy, ATS, Ecom (Surface/Air), Shadowfax (Express/Surface/Reverse), Blitz (Express), Ithink, Urbane Bolt, Shiprocket (Delivery/Courier/NDD) + Self/Hand Delivery |
| **Return & Refunds** | RTO chain (RTO-IT → RTD → reverse putaway → restock). Customer returns via CSR Portal. Refund destinations: TM_CREDIT / TM_CASH / CASHFREE / TM_CASHBACK |

**KPIs:** order-to-ship time, RTO%, stockout%, OTIF, return rate, refund-SLA, picker/checker throughput, putaway TAT

## Customer Experience (CX) — 4 portals

| Portal | Use |
|---|---|
| **CSR Portal — Create Order** | Inbound customer call → search mobile → place new order |
| **CSR Portal — Post Order** | Servicing existing orders: view past orders, customer ratings, subs history, CSR tickets, invoice/return bills. Generate return ticket, Rank up order, Track status, Mark Unreachable, Cancel |
| **Assisted Commerce Portal** | Outbound sales (OTC focus). Agent Shift/Statistics/Score/Target Mgmt, OTC Sales Dashboard (Connected %, Substitution AOV, Customer Type Converted %), Reschedule order, Incentive Management |
| **Pill Reminder Portal** | Chronic refill outbound. Group Mapping, Assign/Unassign Reminder. Statuses: NOT NEEDED / UNREACHABLE / ORDER PLACED / CANCEL REMINDER / SKIP REMINDER / DO NOT DISTURB / REATTEMPT LATER. Reminder type: BY DATE / BY FREQUENCY |

**KPIs:** CSAT, response time, repeat complaint rate, OTC connect %, chronic-reorder conversion rate

## Doctor / Medical Ops — 4 arms

| Arm | Scope |
|---|---|
| **Doctor Portal — Rx review + substitution** | Live order picking from assigned warehouse, view Order Details (Patient / Delivery / All Originals SKU / All Subs / Bill / Order Info & Subs), Call Patient, Confirm Order, Hold/Cancel Order, Patient Ranking, ETA, Doctor Fraud detection |
| **Doctor Super-Admin** | Doctor Onboarding (Registration form → Super Admin approval Pending/Approved/Not-Approved lists), Dashboard Statistics, Earnings & Incentives, Broadcast Message, Doctor Allocation, Doctor Blocked List, Live Order, Doctor Category (5 categories), Doctor Calls Mgmt, Category Blocking, Dosage Tagging, Doctor Fraud module, OTC Insights, Pilot Order Statistics, IVR |
| **Pharmacist Type 1** | First-attempt digitization for **prescription-only orders** (`ORDER_TYPE = 52 RX`). Validate prescription(s), calculate delivery date, search/add doctor, apply coupon + TM rewards, add notes → DIGITIZE / DISCARD / MARK UNREACHABLE. **Type 2 (RX AND MEDICINES = 53) and Type 3 (MEDICINES = 54) bypass Pharmacist and go straight to Doctor.** |
| **Health Advisor (HA)** | Substitution explanation + customer confirmation call. **Triggered when SUBSTITUTE is available** — post ORDER CONFIRMED, pre WAREHOUSE ASSIGNED. orderstatus 595 HEALTH ADVISOR CALL ATTEMPTED. HA can add only OTC (not Rx) to cart. Substitution actions: Replace original / Keep both / Hold Order |

**KPIs:** Rx-generation TAT, sub-acceptance rate, HA single-call connect %, Doctor approval TAT, Pharmacist Type-1 digitize TAT

## Diagnostics

Separate function — launched recently, picking up well. Home sample collection, lab partner integration, tied to chronic customers. Has dedicated lead. Data lives in `tmmumpsdb.tm_diagnostics_*` (catalog, order_master, lineitem, phlebo).

## Finance

- AR/AP, GMV reporting, P&L closes
- CAC + LTV unit economics
- Audit + compliance

**KPIs:** cash conversion cycle, gross margin, contribution margin

## Tech / Engineering

- App + web + backend services
- Data platform (Redshift, Metabase, MCPs, HEVO pipelines — abstracted for non-engineer audiences)
- DevOps / SRE

**KPIs:** uptime, p95 latency, crash-free rate

## Legal / HR / Compliance (high level)

- Legal — contracts, regulatory (CDSCO / state pharmacy councils), data-privacy
- HR — talent, payroll, performance
- Compliance — pharmacy licensing, Rx audit trails, GST

Light coverage — these don't drive analytical / business queries day-to-day.

## Leadership / Founder office

- Strategy, capital, board reporting
- Cross-function unblocks

**KPIs:** revenue growth, GM%, retention curve shape
