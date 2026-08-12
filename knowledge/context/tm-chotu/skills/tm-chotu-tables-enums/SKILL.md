---
name: tm-chotu-tables-enums
description: Key tables (customer, order, substitution, attribution, search) + locked master enum decodes for orderstatus (96 codes), workflow_status (WORK FLOW 4 codes), order_type_status, medicine_status, order_category, payment fields, doctor, pharmacist, picklist, putaway, container, box, item, package, refund, offer, discount, CMT, inventory, warehouse type, reminder, item type, drx_status. Load when user references an enum code (e.g. "status 55", "61 vs 62", "what does 233 mean"), or asks "what columns does X table have", "what masters exist", or any DB-schema/enum question.
---

# Key tables + master enums

All decodes locked from `m_system_value_master` on DB 170 (2026-05-15).

## Customer tables

| Table | Purpose | Key columns |
|---|---|---|
| `customer_details` | Identity, contact, signup | `customer_id`, `mobile`, `device_id`, `created_on` |
| `mobile_otp` | OTP / login | `mobile`, `otp_sent_on`, `verified` |
| `customer_order_rank` | Order seq per customer | `customer_id`, `order_id`, `cust_order_rank`. 🔴 broken — compute on-the-fly instead |
| `cx_lifetime_metrics` | LTV / per-order snapshot | `customer_id`, `order_id`, `lifetime_op_count`, `lifetime_od_count`, `lifetime_op_revenue`, `lifetime_od_revenue`. ⚠️ partial coverage |

### customer_device_tracker (DB 630 / TMMUMPSDB) — multi-device history

Used by tm-fraud-engine for N2 multi-device-burst signal.

Cols: id, aaid, active, android_device_id, app_version, customer_id, device_manufacturer_by, device_model, firebase_id, os_version, source, device_id (uuid), ip, created_on (timestamp), modified_on, app_instance_id.

**Anti-pattern (caught in tm-fraud Spec 1, 2026-05-27):** `MAX(device_id) GROUP BY customer_id`
collapses multi-device history → N2 always sees 1 device per customer. Fix: ingest all rows in window, query per-order 7d lookback.

**Derived DuckDB table:** `customer_devices_30d` (cols: customer_id, device_id, ip, created_on, source) indexed on (customer_id, created_on).

## Order tables

| Table | Purpose | Key columns |
|---|---|---|
| `order_details` | Order header | `order_id`, `customer_id`, `created_on`, `order_value` (cart pre-bill), `payment_id`, `workflow_status`, `orderstatus`, `order_type_status`, `warehouse_id`, `is_ftc_order`, `is_re_order`, `organisation_id` |
| `order_status` | State transitions (the source of truth for lifecycle counts) | `order_id`, `order_status_id`, `modified_on` |
| `product_details` | Per-line-item | `order_id`, `product_code`, `cx_accepted_subs` |
| `final_calculated_amount` | Per-order $ truth | `order_id`, `final_amount` (invoiced), `discount`, `tm_cash`, `tm_credit`, `tm_cashback`, `delivery_charge`, `packaging_charge`, `cash_handling_charge`, `price_lock_disc`, `adjustment_amt`, `saving_value` |
| `package_details_tracking` | Package + courier + **backorder flag** | various — incl. backorder trigger |
| `offers` | Coupon catalog | `offer_id`, `code`, `discount_pct`, `validity` |

## Substitution tables

| Table | Purpose |
|---|---|
| `org_sub_medicine_mapping_<hub>_hub_new_algo` (5 hubs) | Pre-computed sub mapping per FC (~3.2M rows each) |
| `final_substitute_product` | Live sub map |
| `final_substitute_product_cx_confirm` | Checkout-time sub decision (cx) |
| `final_substitute_product_dr_confirm` | Post-HA-call sub decision (dr) |
| `final_substitute_product_cab` | CAB-variant |
| `medicine_master` | 231k products. DB typos: `consider_poduct`, `keep_orginal` |
| `medicine_warehouse_master` | 8M rows — product × warehouse overrides |
| `medicine_molecule` | 222k rows — product_code → molecule_code |
| `disease_product_mapping` | 439k rows — therapy mapping. Use `LOWER(product_code)` |
| `chronicity_otc_analytics`, `chronicity_rx_analytics` | ⚠️ validate before use |

## Acquisition / attribution tables

| Table | Purpose |
|---|---|
| `appsflyer_installs` | App install events |
| `appsflyer_homepage_viewed` | First app open |
| `appsflyer_open_events` | Re-opens |
| `attributed_orders` | Attribution rollup |
| **`orders_campaign_attribution`** | **9.8M rows pre-joined order × campaign.** Schema: `order_id, customer_id, created_on, final_media_source, final_campaign, partner, adset, adset_id, ad, ad_id, final_channel` |
| `web_paid_search_orders_ond` | Web Google Ads paid-search orders only |

## Search tables

| Table | Purpose |
|---|---|
| `search_analytics_final_chain` | Final search chain per query |

## NetSuite mirror tables (financial)

`net_suite_invoice_batch`, `net_suite_purchased_order`, `net_suite_items`, `net_suite_pending_purchase_order`, `net_suite_purchase_tracker`, `net_suite_sales_receive`, `net_suite_vendor`.

- **`net_suite_invoice_batch`** = **line-level** invoice (`order_id`, `product_code`, `quantity`, `rate`, `mrp`, `discount`, `ns_tax_amt`, `returned_qty`, `active`, `created_on`). Correct grain for **product/molecule-level invoiced sales**. ⚠️ `amount` col is **NULL** (≥2024) → invoiced value = **`rate * quantity`**; filter `active = 1`. `final_calculated_amount.final_amount` is per-ORDER (can't split by product).

## Molecule & geography tables (locked 2026-06-05)

| Table | Purpose / gotcha |
|---|---|
| `medicine_molecule` (222k) | `product_code → molecule_code` + **`molecule_combination_cd`**. `molecule_code` is a composite strength-string (`TM-M00167125.0MG`), NOT the int code. To get **all products of a molecule** (single + combos) match `molecule_combination_cd` token: `LIKE '%-<code>' OR LIKE '%-<code>-%'`. |
| `molecule_master` | `molecule_code` (INT) → `molecule_name`. **DB 2 / 630 only — NOT on Redshift 170.** Resolve a molecule's int code here (e.g. PREGABALIN = 1527), then use the token above. |
| `d_address_master` | Delivery address. ⚠️ `state_id` AND `city_id` are **100% NULL**; `customer_state` is dirty free-text (~40% filled). `pincode_id` is 100% populated → use it for state. |
| `pincode_warehouse_master` | `id` (PK) = `d_address_master.pincode_id`; carries 6-digit `pincode` + `city_id` (100% filled). No `state_id`/region-as-state. |
| `m_city_master` | `city_id` (PK) → `state_id`, `city_name`. |
| `m_state_master` | `state_id` (PK) → `state_name` (clean canonical). |

**State of an order/customer — canonical chain (100%):**
`d_address_master.pincode_id → pincode_warehouse_master.id → city_id → m_city_master.state_id → m_state_master.state_name`. All PK hops (no fan-out). The direct `d_address_master.state_id → m_state_master` join returns **0** (state_id NULL).

## `medicine_quarter_master` — HM/LM product-margin tag  🔒 GATED (loaded 2026-07-23)

> 🔒 **Leadership + margin-health goal gate applies — see `tm-chotu-query-rigor` / `tm-chotu-definitions` → HM/LM. Do NOT query or expose to non-leadership or quick-analysis asks.**

Per-product-×-quarter High-Margin / Low-Margin tag. **Grain: unique `(product_code, quarter)`** — 631,811 rows, 18 quarters (2022-Q2→2026-Q3), cannot fan out. On **Redshift 170** (`tmmumpsdb`, default) + **Main DB 630** (mirror); grants via group `tm_analytics`.

| Column | Notes |
|---|---|
| `product_code` | TM SKU, join key (PK part 1) |
| `quarter` (DATE) / `quarter_label` (`2026-Q3`) | quarter start / label (PK part 2 = `quarter`) |
| `product_name`, `company_name`, `branded_generic` | readability; `branded_generic` ∈ Generic/Branded (the *label* — decoupled from margin) |
| `threshold_pct` | 18 or 20 (Scenario 5) |
| `gm_prev_quarter_pct` / `gm_current_quarter_pct` | Q−1 GM% (primary) / Q GM% (fallback) |
| `effective_gm_pct` | value compared to threshold; **NULL = no GM** |
| `gm_source` | `1Q lag` \| `current quarter (no prior-quarter sales)` \| `no GM available` |
| **`hm_lm`** | **HM / LM — the tag** |
| `used_in_published_pack` | 1 = Apr-2023+ published window (use to drop unusable pre-2022-Q4) |
| `created_on` / `modified_on` | audit; `created_on` = quarter start (backfill), `modified_on` auto-on-update |

**Join contract:** `product_code` AND `date_trunc('quarter', order.created_on) = quarter`; **unmatched line → LM** (`COALESCE(hl,'LM')`). Full definition + 1Q-lag + thresholds in `tm-chotu-definitions` → HM/LM.

## Diagnostics tables

`tm_diagnostics_catalog_master`, `tm_diagnostics_order_master`, `tm_diagnostics_order_master_lineitem`, `tm_diagnostics_order_master_event`, `tm_diagnostics_order_master_address`, `tm_diagnostics_order_master_order`, `tm_diagnostics_order_master_phlebo`, `tm_diagnostics_serviceability`.

---

# Master enums (LOCKED — sourced from `m_system_value_master`)

> Codes overlap across master families — always look up via `m_system_value_master WHERE serial_id = <code> AND name = '<family>'`.

## `orderstatus` — FULL 96-CODE DECODE

Stored as `bigint`. Codes are `serial_id` in master `name = 'ORDER STATUS'`. `order_details.orderstatus` shows CURRENT state. For lifecycle counts use `order_status` transition table.

### Customer-side terminal states
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

### Pre-confirm / placement states
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

### Doctor / Pharmacist / HA / Agent workflow
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

### Fulfilment / warehouse / packing
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

### Logistics / dispatch / delivery
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

### RTO + return flow
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

### Reorder / rank / transfer
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

## `order_details.workflow_status` (`name = 'WORK FLOW'`)

Only 4 codes:

| Code | Meaning |
|---|---|
| **242** | **NO_DOCTOR_CALL** (Auto-confirm path) |
| 343 | CUSTOMER_ORDER_ONHOLD |
| 381 | RE_ORDER_PRODUCT_CHECK (Reorder 2.0) |
| 400 | PORTAL INCOMPLETE ORDER |

## `order_details.order_type_status` (`name = 'ORDER_TYPE'`)

| Code | Meaning | Routed to |
|---|---|---|
| **52** | **RX** | Pharmacist Type 1 queue |
| **53** | **RX AND MEDICINES** | Doctor directly |
| **54** | **MEDICINES** | Doctor directly |

## `medicine_status` (`name = 'MEDICINE_STATUS'`)

Line-item level, not order level.

| Code | Meaning |
|---|---|
| 61 | SUBSTITUTE (doctor's GX recommendation) |
| 62 | ORIGINAL (customer kept branded) |
| **211** | **NO SUBSTITUTE** (no GX exists for this molecule) |

## `order_details.order_category` (`name = 'ORDER_CATEGORY'`)

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

## Payment enums

**`payment_id` (`name = 'PAYMENT'`):** 16 ONLINE / 17 COD

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

**`payment_type` (`name = 'PAYMENT_TYPE'`):** 127 XPRESS / 128 PAYTM / 167 HAND DELIVERED

## Smaller enums

- **`ORDER_SOURCE`:** 260 APP / 261 WEBSITE / 262 PORTAL / 406 DOCTOR_PORTAL
- **`ORDER_STATUS_DOCTOR`:** 32 ASSIGNED / 33 CONFIRMED / 34 DECLINED / 35 MODIFIED
- **`ACUTE_CHRONIC`:** 139 ACUTE / 140 CHRONIC
- **`WAREHOUSE TYPE`:** 454 WAREHOUSE / 455 HUB / 553 MFC
- **`INVENTORY_TYPE`:** 281 INVENTORY / 282 JIT 1 / 283 JIT 2 / 370 Central Bulk / 371 WH weekly JIT
- **`ITEM_TYPE`:** 472 ALL PRODUCT / 473 RX / 474 SUBSTITUTE / 475 OTC / 478 ORIGINAL
- **`REFUND_TO`:** 206 TM_CREDIT / 207 TM_CASH / 208 CASHFREE / 264 TM_CASHBACK
- **`OFFER_TYPE`:** 469 Instant / 470 Cashback / 471 Instant + Cashback
- **`OFFER_STATUS`:** 78 ACTIVE / 79 INACTIVE / 80 DELETED
- **`DISCOUNT_TYPE`:** 76 BY PRICE / 77 BY PERCENTAGE / 223 BY % UPTO / 224 BY % ALL / 248 BY CASHBACK
- **`CMT STATUS`:** 394 APPROVED / 395 PAUSED / 396 REJECTED
- **`CMT APPROVALS`:** 397 CATALOGUE / 398 SUBSTITUTION / 399 BOTH
- **`DOCTOR_BLOCK_TYPE`:** 328 CALL LIMIT BREACHED / 329 NO SUBSTITUTION LIMIT BREACHED
- **`DOCTOR_CATEGORY`:** 252 ONE / 253 TWO / 254 THREE / 288 FOUR / 351 FIVE
- **`DRX_STATUS`:** 29 PENDING FOR DIGITIZATION / 30 DIGITIZED / 31 INVALID_RX / 37 MULTIPLE RX
- **`PILL_REMINDER_STATUS`:** 309 NOT NEEDED / 310 UNREACHABLE / 311 ORDER PLACED / 314 CANCEL REMINDER / 537 SKIP REMINDER / 538 DO NOT DISTURB / 539 REATTEMPT LATER
- **`REMINDER CATEGORY`:** 528 CHRONIC / 529 NON CHRONIC

## Warehouse-ops enums

- **`PUTAWAY TYPE`:** 540 ORDER / 541 TO (Transfer Order) / 542 BILL / 551 BIN TO BIN / 562, 576 COLDCHAIN / 583 REVERT PICKING / 683 BATCH VERIFICATION
- **`PICKLIST STATUS`:** 482 Open / 483 Picker Assigned / 484 Picked / 485 Picker issue / 499 Closed / 500 CANCELLED / 521 Picking In Progress
- **`CONTAINER STATUS`:** 510 Open / 511 Assigned / 512 Picking In Progress / 513 Picked / 550 Full
- **`BOX_STATUS`:** 179 Medicine Missing / 180 Wrong Product Details / 181 Box Verified / 182 Cold Chain / 231 Correction / 243 Picker Medicine Missing / 554 Box Packed
- **`ITEM STATUS`:** 584 Item Edited / 585 Send to checker / 586 Item added / 587 Item replaced / 591 Item disabled / 592 Item Inwarded / 605 Order cancelled
- **`ORDER PICKER STATUS`:** 577 PENDING / 578 PICKED / 579 ISSUE
- **`ORDER CHECKER STATUS`:** 580 PENDING / 581 CHECKED / 582 ISSUE

## `PACKAGE_STATUS` (36 codes — courier partners + ops states)

3PL universe: XpressBees, Delhivery, Delhivery Express, Bluedart, Bluedart Express, CABT, WeFast, Self Delivery, Hand Delivery, Shipsy, ATS, Ecom Surface, Ecom Air, Shadowfax (Express / Surface / Reverse), Blitz, Blitz Express, Ithink Forward, Urbane Bolt, Shiprocket (Delivery / Courier / NDD), Delhivery NDD. Ops states: HOLD CANCELED, APPROVED CANCELED, COLDCHAIN_PICKING_PENDING, Runner Assigned, ORDER VERIFICATION REQUIRED.

## Other masters

- `SCHEDULE_DRUG` — 8 codes (drug schedule H, H1, X etc.)
- `GST` — 6 codes (0 / 5 / 12 / 18 / IGST18 / IGST28)
- `VENDOR_TYPE` — 5 codes
- `PROCUREMENT TYPE` / `PROCUREMENT STATUS` / `PROCUREMENT TAG TYPE`
- `PRODUCT_SOURCE_TYPE` — 10 codes (Customer-App, Customer-Web, Doctor, Operation, Pharmacist, CSR, Checker, Assisted, Scheduler — who added a product to cart)

**Total masters:** 200+ distinct `name` groups in `m_system_value_master`. Sweep:

```sql
SELECT name, COUNT(*) FROM tmmumpsdb.m_system_value_master WHERE active = 1 GROUP BY name;
```

## `organisation_id`

Multi-tenant marker. **Truemeds main = 1.** Filter `WHERE organisation_id = 1` for Truemeds-only data unless cross-tenant analysis intended.

### Fraud-engine table index map (DB 630, probed 2026-05-28)

| Table | Leading-index access key | Notes |
|---|---|---|
| order_details | order_id (INDEX6), customer_id (INDEX2/10/11/12) | created_on NOT leading anywhere — never filter on it directly |
| order_device_mapping | order_id (INDEX1/6), customer_id (INDEX5) | |
| customer_details | customer_id (PRIMARY) | |
| d_address_master | address_id (PRIMARY) | |
| customerrtoorder_percentage | customer_id (INDEX1) | |
| customer_device_tracker | customer_id (INDEX2) | query by customer_id; keep ALL rows (no MAX-collapse) for N2/N3 |
| customer_traffic_tracking | order_id (idx added 2026-05-28) | **128M rows** — was full-scan on order_id; INDEX(order_id) added |

Redshift (DB 170) has order_details/odm/d_address/customer_details but NOT cdt/ctt/rto% (MySQL-only).
