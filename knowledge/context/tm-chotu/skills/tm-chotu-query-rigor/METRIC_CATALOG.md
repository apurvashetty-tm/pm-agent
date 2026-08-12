# Metric Interpretation Catalog

Presentation index for the Intent-First Protocol (see `SKILL.md`). For each metric: the branches chotu presents at **Step 0**, each citing the **authoritative section skill** for the full derivation. Do NOT copy formulas here — cite, so this never drifts from the owning skill.

Grades of claim:
- **LOCKED** — formula / status code / anti-pattern quoted verbatim from a section skill. Ship as fact.
- **SLICE** — a chotu-derived re-slice a user may want. Must NOT contradict the skill; label it a slice, never a locked fact.
- ⚠️ **VERIFY-GAP / EXTERNAL-GAP** — a branch whose source table isn't locked in any skill yet, or whose authority is an external canon not packaged as a loadable section skill. Never assert as fact — flag it as a knowledge-gap and route per the gap loop.

If a requested metric is not listed → derive branches from the owning section skill, present them, and add a stub here.

---

## Revenue — authority: `tm-chotu-definitions`

| Branch | Grade | Derivation | When |
|---|---|---|---|
| (a) Placed booked revenue (customer payable, net of dead) | **SLICE** | `SUM(fca.final_amount)` (customer payable, NOT `order_value`) at order-placed stage, `organisation_id = 1`, `orderstatus NOT IN (49,274,400,668, 57,232, 174, 312)` = strip incomplete + cancelled + discard + scrapped. **"Net of cancels" = the full DEAD-ORDER STATUS SET, never just 57** (LOCKED in `tm-chotu-definitions`). | Daily trend of what we actually book (Mangesh's canonical "revenue yesterday") |
| (b) Placed gross volume proxy | **SLICE** | `SUM(order_details.order_value)`, all placement rows. ⚠️ `order_value` = cart pre-bill, NOT billable — crude volume signal only, never report as revenue. | Rough order-volume momentum |
| (c) Business / delivered = **GMV** | **LOCKED** | `SUM(final_calculated_amount.final_amount) WHERE order_details.orderstatus = 55 AND organisation_id = 1`. **Never** `order_details.order_value`. | Board / business revenue |
| (d) Net revenue | **LOCKED** | GMV − returns − refunds. | Revenue net of returns |

**Anti-pattern (Rahul's failure), LOCKED:** (1) using `order_value` as revenue (cart pre-bill); (2) **excluding only `57` when the user says "net of cancels"** — must strip the whole DEAD-ORDER STATUS SET (49,274,400,668, 57,232, 174, 312 = incomplete + cancelled + discard + scrapped; see `tm-chotu-definitions`). Excluding only 57 leaks discarded/incomplete/scrapped junk. Flag explicitly.

## Inventory — authority: `tm-chotu-inventory`

| Branch | Grade | Source | When |
|---|---|---|---|
| (a) Business / analytics live qty | **LOCKED** | DB 180 `INVENTORY_SCHEMA.product_inventory_data` (real-time NetSuite sync, universal across all active WHs incl. Vinculum-backed Faridabad). Cross-DB joins → DB 432 `tmmumpsdb.product_inventory_data` (Airbyte mirror). | Business case, availability, stockout% |
| (b) WH / physical / rack-level ops | ⚠️ **VERIFY-GAP** | Exact rack/bin-level table NOT yet locked in `tm-chotu-inventory`. Do NOT name a table. State the gap; route to WMS/NetSuite bin data. | Physical/rack ops |

- **Caveat (anchored):** live onhand qty diverges from the *manual* `medicine_warehouse_master.availability` Catalogue flag (JIT → non-onhand ≠ unavailable; flag not real-time). The stronger "live vs a physical/rack source may not reconcile" stays conditional on resolving the VERIFY-GAP.
- **Anti-pattern (Kunal's failure), LOCKED:** **never SUM a quantity across inventory tables** — pick one source by use-case; they don't reconcile. Grounded in `tm-chotu-inventory` anti-patterns block. Legacy `inventory_tracking` / `medicine_stock_details` deprecated — never use.

## Margin — two distinct concepts; never conflate labels

| Branch | Grade | Derivation | Authority |
|---|---|---|---|
| (a) Customer / cohort contribution margin | **LOCKED** | `cm_net` / `cm_net_90d`. **Fully-loaded** (rev − COGS − zone shipping − COD − return logistics − packaging − promo/comms − coupon − tm_cash − adjustment − price-lock − CPO). **NOT** COGS-only CM1 (nearer CM2/CM3) — never report as "CM1". Cohorts skill ships an exact-source spec AND a runnable raw **PROXY** (omits zone-shipping/return-logistics/promo-comm/CPO) — proxy = rank-and-cut tool, not an exact ₹ figure. | `tm-chotu-dcoe-cohorts` §1 |
| (b) Item-level margin | ⚠️ **EXTERNAL-GAP** | **route-A** = Formula − all 4 discount layers. "route-A" is NetSuite item-margin terminology ONLY — never attach it to `cm_net`. **Not yet a loadable tm-chotu skill** — treat as unverifiable-in-plugin; flag as a knowledge-gap rather than asserting as locked fact. | NetSuite item-margin canon (external — gap) |
| (c) CM1 — gross margin (rev ex-GST − COGS) | **LOCKED** | `CM1 = product_rev_ex_gst − SUM(nsib.rate*nsib.quantity WHERE active=1)`. Revenue = FSP `selling_price` stripped of GST (`medicine_master.gst`, default 5), **invoiced FSP lines only** (`invoice_batch_id IS NOT NULL`). COGS source = `net_suite_invoice_batch`, join `fsp.final_subs_id = nsib.fsp_id`. Product gross-margin line only (NOT shipping/packaging/burns/CPO — that's `cm_net`). Full spec + boundary in `tm-chotu-definitions` → COGS & CM1. | `tm-chotu-definitions` (from DCOE `CM_CALCULATION.md`) |
| (d) HM/LM product segregation | 🔒 **GATED-LOCKED** | Per-product-×-quarter HM/LM tag = the *true* "which products make money" segregation (branded/generic label ≠ real margin). **HARD GATE: only if `persona = Founder/Leadership` AND goal = margin-health/business-decision** (query-rigor); else say nothing, fall back to (c) CM1. Source `medicine_quarter_master`. **Join: `product_code` AND `date_trunc('quarter', order.created_on) = quarter`; unmatched → LM** (`COALESCE(hl,'LM')`). Line source = `final_substitute_product.product_code` (delivered). ⚠️ HM share of *products* ≠ of *revenue*; restrict `used_in_published_pack=1`; 2026-Q3 partial. | `tm-chotu-definitions` → HM/LM |

**⚠️ MANDATORY on every margin/COGS answer:** NSIB `rate` = latest batch rate in that WH at invoice-creation, **NOT NetSuite FIFO COGS** — won't reconcile to NetSuite/P&L; IMS project (upcoming) brings true FIFO. Also: COGS reliable only for orders ≥ **2022-11-17** (NSIB-era boundary); pre-that → `product_pts_tracker.pts*qty` proxy or flag N/A. Do NOT invent a margin formula.

## Extensible stubs (add branches on first real ask)

- **GMV** → = Revenue (c), delivered-only. LOCKED in definitions.
- **AOV** → GMV / delivered-order count. LOCKED in definitions.
- **Active users** → install vs signup vs FTC-delivered vs FOP-placed are NOT the same — cite definitions anti-patterns; ask which.
- **Retention** → M1 / M3 / M6 — cite definitions; M1 = order-1 AND order-2 within 30 days.
