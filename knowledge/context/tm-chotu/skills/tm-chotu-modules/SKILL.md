---
name: tm-chotu-modules
description: Core Truemeds modules — Search (OpenSearch + tiered EXACT/PARTIAL/FUZZY), Pricing (incl. Price Lock), Substitution algo (6-step, 5 FCs, TS formula), Chronic engine, Reminders, Live Inventory, Warehouse Assignment (MFC vs FC), Picklist (3 variants), Replenishment, Putaway (8 types), Central Procurement, Logistics (13 partners), Doctor / Pharmacist / HA / CSR / Assisted Commerce / Pill Reminder portals, CMT Dynamic Content Mgmt, Fraud (3 sub-systems), Diagnostics, Pincode Mapping. Load when user asks "how does X module work", "how is substitution computed", "how does picking / putaway / WH assignment work", "what 3PL partners do we use", "how does Doctor / Pharmacist / HA flow work", or any system/engine question.
---

# Core modules

Grouped: **Customer-facing** → **Order-flow operations** → **Internal portals** → **Admin & control** → **Other**.

---

## Customer-facing modules

### Search

**Source:** Search Engine PRD V1.2 (April 2026, Sujith Cheedella).

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
| 3 — FUZZY | `fuzzy` query, `fuzziness:AUTO, prefix_length:2, max_expansions:50` — **fires only on 0-result queries** | `product_name^5, keywords^3, composition^4` — never strength | FUZZY |

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
| is_oos | boolean | — | **Real-time** (<5 min lag) | Drives OOS de-boost |
| l1_ranking_score | float | — | Daily 00:30 IST | 30-day ATC, normalised [0,1] per L1 category |
| product_type | keyword | — | — | `OTC` / `RX_Original` / `RX_Generic` |
| FC_list, MFC_list | list | — | — | Where the product is available |
| is_searchable | boolean | — | — | Brand-permission gate |
| supplied_by_tm | boolean | — | — | Can TM sell |
| medicine_type | string | — | — | Syrup / tablet / injection |

**Symmetry Contract:** lowercase, ASCII fold, unit canonicalisation, dosage-form removal, synonym dictionary version — identical in both pipelines.

**Query-time only steps:** Q-1 Input Sanitisation / Q-4 Token Splitting / Q-5 Token Classification (`DRUG_NAME` ≥3 alpha chars / `STRENGTH` digits+unit / `DOSAGE_FORM` / `STOP`) / **Q-6 Safety Gate** — zero DRUG_NAME tokens → block / Q-7 Strength Filter Decision / Q-9 Tier Selection cascade.

**Index update pipelines:** product data near-RT Kafka/SQS; L1 ranking score daily 00:30 IST; OOS status near-RT < 5 min lag.

**Scoring Layer formula:**
```
norm_relevance = relevance_score / max_relevance_in_result_set
norm_ranking   = l1_ranking_score / 100.0
blended_score  = (α × norm_relevance) + (β × norm_ranking)    # α=0.70, β=0.30
final_score    = is_oos ? (blended_score − OOS_BAND_PENALTY) : blended_score
# Sort: primary = match_flag tier (EXACT → PARTIAL → FUZZY); secondary = final_score DESC within tier
```

**OOS de-boost rule:** OOS products visible but pushed to end of own band, never below into lower tier.

**Non-functional targets:** p95 < 200ms, p99 < 400ms, 99.9% availability, OOS sync < 5 min, zero-result rate < 5%, 500+ TPS for daily L1 refresh.

**Out-of-scope V1:** personalised recommendations, vector/semantic search, real-time inventory sync.

**Appendix asks:** Primary salt added to index (`^7` boost). Rx surfaced only on product_name / composition / primary_salt.

**Surface entry points:** SEARCH SUGGESTIONS, CATEGORY PAGES, DISEASE PAGES, SALT PAGES, OTC CAROUSELS, MEDICINE LISTING A-Z.

**Validation:** `search-validator` project (replay-dual harness vs Mixpanel).

### Pricing

- Display on PDP: striked MRP + green TM price + ₹ saved + % saved
- `MRP - order_value = saving_value` (cart). Final billed = `final_calculated_amount.final_amount`
- Discount stack (from `final_calculated_amount` columns):
  - `discount` (item / coupon / GX swap savings)
  - `tm_cash` / `tm_credit` / `tm_cashback` / `tm_cash_back` (wallet redemptions)
  - `price_lock_disc` (price-lock product perk)
  - `adjustment_amt` (manual ops adjustment)
  - **Additions:** `delivery_charge` / `packaging_charge` / `cash_handling_charge` (COD per pincode)
- GST: 6 codes (0 / 5 / 12 / 18 / IGST18 / IGST28)
- **Price Lock feature** — customer-facing protection against MRP increases. Captured at `final_calculated_amount.price_lock_disc`. Config masters: `PRICE_LOCK_THRESHOLD_X`, `PRICE_LOCK_STAGE`
- Margin masters: `TRUEMEDSMARGIN`, `STOCKISTMARKUP`, `CONFIRMEDCOSTREDUCTION`, `MAXSELLINGPERCENTAGE`

### Substitution algo — DEEP

**Source:** probab-subs-persona/memory/ALGO_CONTEXT.md (2026-04-06, locked from Truemeds Algo Summary PDF + DB exploration).

**API:** `findBestSubForProducts` (TMEXP3 bulk pattern: concurrency=10, rate=100/min).

**Coverage:** ~35% of the ~2 lakh-product catalogue has generic substitutes. Customer savings up to 50% on substituted lines.

#### Fulfilment-centre layout

5 FCs, ~26k pincodes total. Each FC maintains its OWN substitution mapping table (pre-computed nightly):

| FC | City | `warehouse_id` | Pincodes | Output table |
|---|---|---|---|---|
| Bangalore Hub | Bangalore | **17** | 10,276 | `org_sub_medicine_mapping_bangalore_hub_new_algo` |
| Kolkata Hub | Kolkata | **22** | 5,249 | `org_sub_medicine_mapping_kolkata_hub_new_algo` |
| Mumbai Hub New | Mumbai | **20** | 4,732 | `org_sub_medicine_mapping_mumbai_hub_new_algo` |
| Delhi Okhla FC | Delhi | **19** | 4,583 | `org_sub_medicine_mapping_delhi_hub_new_algo` |
| Lucknow New | Lucknow | **37** | 2,261 | `org_sub_medicine_mapping_lucknow_hub_new_algo` |

Each output table ~3.2M rows. MRP varies by warehouse; discounts are company-wide.

#### 6-step algorithm

**Step 1 — Should substitution happen?**

- `medicine_master.keep_orginal = 1` → keep original, no sub. (DB typo: column literally `keep_orginal`)
- If original is `Generic AND availability=1 AND supplied_by_tm=1` → keep original (already cheapest)

**Step 2 — Find same-molecule candidates**

```sql
SELECT mm.*, mwm.*
FROM medicine_master mm
JOIN medicine_warehouse_master mwm ON mm.product_code = mwm.product_code
WHERE mm.product_code IN (SELECT product_code FROM medicine_molecule
                           WHERE molecule_code = '<MOL of original>')
  AND mm.drug_type = '<ORG_drug_type>'   -- tablet / syrup / capsule must match
  AND mwm.consider_poduct = 1            -- DB TYPO: consider_poduct (not consider_product)
  AND mwm.warehouse_id = <FC>            -- e.g. 20 for Mumbai
  AND mwm.availability = 1               -- MANUAL flag, NOT real-time inventory
  AND mwm.supplied_by_tm = 1
```

Auto-exclusions: pack has `*` (multi-pack like `10*10`), `availability=0`, `consider_poduct=0`, mismatched `drug_type`.

**Step 3 — Re-add original if excluded but generic**

If original was filtered out (`consider_poduct=0`) but it's `generic_branded='Generic'`, force-add back to candidate list.

**Step 4 — Enrich each candidate**

- Pull warehouse-specific `mrp`, `pts`, `ptr` from `medicine_warehouse_master`
- Determine discount: product-specific → else base → else variant
- Exclude if pack has `*`
- Compute `subRecommendedQty` via pack-ratio formula

**Step 5 — Rank by TS**

**TS = TruemedsSavings = maxSellingPrice − minSellingPrice**

> ⚠️ TS is **TrueMeds' per-unit profit margin window**, NOT customer savings.

```
minSellingPrice = PTS + (PTS × GST%) + (OriginalMedicine_MRP × TrueMeds_Margin%)
                  # floor; TrueMeds_Margin ≈ 5% of original MRP
maxSellingPrice = min(
  Substitute_MRP × (1 - baseDiscount%),
  OriginalMedicine_MRP × CostReduction%             # cap at original × ~92%
)
                  # ceiling
```

Sort all candidates by TS DESC, keep those with `TS ≥ original_TS`, pick top.

**Step 6 — Eligibility gate**

| Case | Rule |
|---|---|
| TS ≥ 0 | `subsEligible = true` UNLESS `keepOrg=1` |
| TS < 0 | Use `orgSubsDiff` tolerance (~2%). Reject only if both rate-bound tests fail; else accept the loss-making sub |
| `keepOrg=1` | Always `subsEligible = false` |

#### Output table key columns (`org_sub_medicine_mapping_*_hub_new_algo`)

`original_product_code`, `subs_product_code`, `subs_found` (bit), `subs_available` (tinyint), `savings_percentage`, `savings_value`, `ts`, `score`, `top_product_rank`, `subs_taken_count`, `substitute_taken_count`, `prod_searched_count`, `is_chronic`, `is_otc`, `med_type`, `experiment_id` / `variant_id`, `sub_recommended_qty`.

#### Source tables

| Table | Rows | Use |
|---|---|---|
| `medicine_molecule` | 222,807 | product_code → molecule_code |
| `medicine_master` | 231,012 | One row per product (typos: `consider_poduct`, `keep_orginal`) |
| `medicine_warehouse_master` | 8,063,217 | Product × warehouse overrides |
| `warehouse_details` | — | id → name, city, alias, GSTIN |

#### Persona signals on order line items

| Signal | Source | Meaning |
|---|---|---|
| `product_details.cx_accepted_subs` | Per line item | Self-opt at checkout (1) or not (0) |
| `final_substitute_product_cx_confirm.status_id` | Per line item | 61 = sub kept, 62 = original kept at checkout |
| `final_substitute_product_cx_confirm.reason_id` | Per line item | Rejection reason (null = no sub offered) |
| `final_substitute_product_dr_confirm.status_id` | Post-HA call | 61 = sub kept after HA, 62 = original kept |
| `final_substitute_product_dr_confirm.reason_id` | Per line item | 9 = explicit rejection after HA push |

#### Gold / Silver / Bronze persona tiers

| Tier | Signal |
|---|---|
| 🥇 Gold | `cx_accepted_subs=1 AND cx_confirm.status_id=61` |
| 🥈 Silver | `cx_accepted_subs=0 AND dr_confirm.status_id=61` |
| 🥉 Bronze | `cx_accepted_subs=0 AND dr_confirm.reason_id=9` |
| ⭕ N/A | `cx_confirm.reason_id IS NULL AND subs_product_code = product_code` |

#### Four lever families (probab-subs-persona Goal 2)

1. **Substitution** — improve algo / selection where high-potential, low-acceptance
2. **Pricing** — Silver/Bronze price-sensitive → discount/price structure
3. **Margin (TS)** — high-TS-low-acceptance signals brand affinity (not price)
4. **Brand affinity** — Bronze stuck on branded → HA scripts / trials / offers

#### Outcome on order

- `medicine_status`: 61 SUBSTITUTE / 62 ORIGINAL / 211 NO SUBSTITUTE
- `ORDER_CATEGORY` (10 codes) cohort: FTC × Repeat × {partial sub / no sub / not possible / valid Rx / not in stock / pharmacist sub}

#### Critical caveats (propagated to query-rigor skill)

1. DB column typos: `consider_poduct`, `keep_orginal` (literal misspellings — quoting correct spelling returns no rows)
2. `availability` is a MANUAL flag, not real-time inventory
3. Multi-pack exclusion: `pack` containing `*` (e.g. `10*10`) auto-excluded
4. TS ≠ customer savings (TS is profit margin)
5. `disease_product_mapping` join requires `LOWER(product_code)` — therapy table stores lowercase

#### Therapy / disease mapping

| Master | Rows | Purpose |
|---|---|---|
| `disease_master` | 176 | Disease names |
| `disease_category_master` | 158 | Drug categories |
| `otcvalue_master` | 203 | OTC categories |

`disease_product_mapping` (439,760 rows; active+approved ~399k; **83.9% catalogue coverage**). `.type` drives join: DISEASE / DISEASE_CATEGORY / HEALTHCARE. Always `priority='D1'`, `active=1 AND is_approved=1`.

**Top 5 categories:** ANTIBIOTIC (35,710) / ANALGESIC (12,708) / ANTIDIABETIC (11,307) / ANTIHYPERTENSIVE (11,130) / ANTACID (10,574).

**Sub propensity tiers (clinical):**

| Tier | Categories |
|---|---|
| 🟢 High | ANTIBIOTIC, ANALGESIC, ANTIPYRETIC, ANTACID, ANTIEMETIC, ANTIDIARRHOEAL, ANTIFUNGAL (topical), VITAMIN, NUTRITIONAL SUPPLEMENT, COUGH COLD PREPARATION |
| 🟡 Medium | ANTIDIABETIC, ANTIHYPERTENSIVE, HYPOLIPIDEMIC DRUGS, ANTIASTHMATIC, ANTIALLERGIC, MUSCLE RELAXANT, HAEMATINICS |
| 🔴 Low | ANTINEOPLASTIC, ANTIEPILEPTIC, STEROID (systemic), HORMONE REPLACEMENT THERAPY, ANTIPSYCHOTIC, DRUGS FOR PERIPHERAL NEUROPATHY |
| ⭕ OTC/HealthCare | Hair Care, Baby/Mom Care, Ayurvedic |

#### Golden rule

**Retain more subs-accepting users = higher CM users.** Subs acceptance → better margins because generic products have higher TS, branded products often thin or negative margins.

### Chronic engine

- Recurring-molecule detection per customer (chronic vs acute split via `ACUTE_CHRONIC` master: 139 ACUTE / 140 CHRONIC)
- Drives reorder reminder cadence (~30 days, tunable)
- Master config: `CHRONIC_AVG_ORDER_CYCLE`, `CHRONIC_QUARTER_COUNT`, `CHRONIC_REORDER_BATCHSIZE`, `CHRONIC_PRIOR_TRIGGER`
- Tagging tables (⚠️ validate before use): `order_chronic_map_*`, `chronicity_rx_analytics`, `chronicity_otc_analytics`
- Preferred derivation: Mixpanel + product order history + product chronic tagging in catalog
- Output feeds Pill Reminder Portal

### Reminders (channel mix)

- 30-day chronic refill: Push (primary) + SMS (fallback) + WhatsApp (high-value)
- Cart-abandon: Push within 24h
- Re-engagement: 60+ day dormant
- DND honoured via `PILL_REMINDER_STATUS = 538 DO NOT DISTURB`
- Master: `SEND WHATSAPP SMS`

---

## Order-flow operational modules

### Live Inventory

- Per-warehouse SKU live qty in NetSuite + DB
- Threshold-flag system: `SKU Threshold` + `Set Inventory/Non Inventory Flag`
- `INVENTORY_TYPE` master: INVENTORY / JIT 1 / JIT 2 / Central Bulk / WH weekly JIT
- **Threshold breach behaviour**: blocks BOTH original AND substitute pre-confirmation. On doctor call — if sub NOT opted-for — sub is released/unblocked
- **Recalc every 3 days**
- Triggers `Update Inventory` event → drives PUTAWAY / PICKLIST / WAREHOUSE ASSIGNMENT

### Warehouse Assignment

- Trigger points: SEARCH / CATALOG / PDP / CART / SUMMARY (5 surfaces all re-check)
- Routing decision: `Inventory Order?`
  - Yes → MFC Assignment → MFC Most Common Price → Subs Calc on MFC Price → MFC ETA
  - No → FC Assignment → FC Most Common Price → Subs Calc on FC Price → FC ETA
- Warehouse types (master 'WAREHOUSE TYPE'): 454 WAREHOUSE / 455 HUB / 553 MFC
- Pincode → warehouse via `pincode_warehouse_master`, `pincode_microfc_master`, `analytics_pincode_microfc_master`
- Sets `order_details.warehouse_id` on confirmation
- orderstatus transition: → 233 WAREHOUSE ASSIGNED

### Picklist module — 3 variants

| Variant | Flow |
|---|---|
| **Single picking** | One picker per order. Login → Mark Available → Assign/Search Order → View 1-1 med → Scan order box → Pick + qty → Deduct rack + DB → Submit |
| **Multi-order picking** | Admin → Create Picklist Rule → Upload CSV → Generate Picklist. Picker → Scan master container → 1-1 med per rack + order bin → Pick → Deduct |
| **Multi-order pigeon-hole (zone-wise)** | Zone-wise picklist per picker; Sorter role added downstream. Picker → drop-zone → Sorter scans picked container → Assigns picklist to pigeon hole → Places med in pigeon-hole bin |

**Roles:** Picker / Sorter / Checker / Problem Solver.

**Statuses:** PICKLIST STATUS (Open / Picker Assigned / Picking In Progress / Picked / Picker Issue / Closed / Cancelled). PICKER + CHECKER (PENDING / PICKED / CHECKED / ISSUE).

**Issue handling:** Mark Issue → Issue dashboard → Problem Solver resolves (procure / adjust order / etc.).

**Checker flow:** Mark Available → Scan box → View med + qty → Select picked batches → Verify box → Verify expiry → Generate Invoice → Deduct from NetSuite → Ready to ship.

### Replenishment module

- Two zones: **Bulk Zone** + **JIT Zone**
- Driven by Min Limit check + Near Expiry check (auto-task)
- Picking-Path → Qty/Info → Excess/Short/Damage → Picking Task → Update Reports
- Reports: Replenishment vs Pending, Excess vs Short
- Min/Max controls: Pause / Reinitiate
- Login → Home → Assigned Hub

### Putaway module

8 putaway types ('PUTAWAY TYPE' master):

| Code | Type |
|---|---|
| 540 | ORDER PUTAWAY |
| 541 | TO PUTAWAY (Transfer Order between WHs / HUBs) |
| 542 | BILL PUTAWAY (post-procurement inwarding) |
| 551 | BIN TO BIN |
| 562 / 576 | COLDCHAIN PUTAWAY |
| 583 | REVERT PICKING PUTAWAY |
| 683 | BATCH VERIFICATION PUTAWAY |

**FBD variant:** Faridabad-specific PUTAWAY-FBD flow exists (different physical zone routing).

**Edge handling:** damaged/missing/expired → Quarantine zone. Rack-full → Suggest next rack.

**Adjustments:** Bin-to-Bin Inventory, Rack/Product Locator, Batch Adjustment.

### Central Procurement

- **Workflows:** Ordering Plan → Generate PO → Cycle Selection → Upload Sheet → Inwarding & Invoicing → View PO Download → Close PO → Edit/Update PO → QC Process → Bill Inwarding → Auto-Close PO → Edit/Update Invoice → Auto VRA → Rate Comparison → Quantity Comparison → Bill Closed?
- Dashboards: Inwarding / Bulk operation / Change Pack Size / Refill Procurement / Inventory Count / VRA Inwarding + VRA Details + Bulk VRA / PO Checker / Temp Edit / Back Order Procurement / Create PO / Receive Products
- Masters: PROCUREMENT TYPE, STATUS, TAG TYPE; RATE_MISMATCH_ACTION (auto-handles disputes); EXCESS_QUANTITY_ACTION; BULK PROCURMENT ACTION
- **NetSuite** is the financial source-of-truth. Tables on DB 170: `net_suite_invoice_batch`, `net_suite_purchased_order`, `net_suite_items`, `net_suite_pending_purchase_order`, `net_suite_purchase_tracker`, `net_suite_sales_receive`, `net_suite_vendor`

### Logistics

- **Serviceability check** at PDP + checkout (pincode → warehouse → courier partner)
- **Courier Partner Priority** matrix
- Masters: `m_courier_partner_master`, `pincode_master`, `pincode_warehouse_master`, courier partner pincode TAT adherence
- **3PL universe — locked from `m_courier_partner_master` (13 partner IDs):**

| Partner ID | Name | Express? | Notes |
|---|---|---|---|
| 3 | EcomExpress | Yes + Surface | |
| 4 | Delhivery | Yes + Surface | Also via Shiprocket (`Delhivery Surface`) |
| 5 | Bluedart | Yes + Surface | Via Shiprocket: `Blue Dart` + `Blue Dart Surface` |
| 6 | XpressBees | Yes + Surface | |
| 9 | Shadowfax Express + Surface | Yes | |
| 35 | Self | No | In-house |
| 105 | Shiprocket | No | Aggregator |
| 130 | WeFast | No | Routes via Borzo Timeslot |
| 150 | Shipsy | No | |
| 170 | Ithink Logistics | No | |
| 193 | CABT | No | |
| 207 | Blitz (formerly Grow Simplee) | No | |
| 212 | ATS (Amazon Transportation Services) | No | |
| 564 | Urbanebolt ANKW | No | ANKW WH entity |
| `null` | Hand Delivery | No | In-house manual |

Additional master fields: `reverse_courier_partner_id` (return pickup), `zoho_account_id`, `net_suite_account_id`, `svm_id`, `ankw_*` variants.

**AWB lifecycle:** orderstatus 217 ASSIGNED TO DELIVERY PARTNER → 289 AWB STICKER PRINTED → 60 DISPATCHED → 275 OUT FOR DELIVERY → 285 PICKED UP → 55 DELIVERED (or 284 DELIVERY FAILED).

### Dispatch Portal

Roles: Picker / Sorter / Checker / Problem Solver / Packer.

End state: Generate Invoice → Deduct qty from NetSuite → Pack to new container → Print Pack-slip → Paste on container → Order packed and ready to ship.

---

## Internal portals

### Doctor Portal — Rx review + substitution

- **Onboarding:** Registration form → Super Admin approval (Pending / Approved / Not Approved lists)
- **Daily ops:** Login → Assigned Warehouse → Enable Online → Earnings & Incentives, Fraud Count, Pending Orders, Order Details
- **Actions:** Call Patient → Confirm Order / Hold Order / Cancel Order
- **`ORDER_STATUS_DOCTOR` master:** 32 ASSIGNED / 33 CONFIRMED / 34 DECLINED / 35 MODIFIED
- **`DOCTOR_CATEGORY`:** DR_CATEGORY_ONE to FIVE — drives routing + pricing
- **`DOCTOR_BLOCK_TYPE`:** 328 CALL LIMIT BREACHED / 329 NO SUBSTITUTION LIMIT BREACHED
- orderstatus events: 209 DOCTOR ASSIGNED, 215 DOCTOR CALL ATTEMPTED, 216 DOCTOR ORDER ON HOLD, 276 DOCTOR CALL SCHEDULED, 317 DR ORDER CONFIRMED, 405 ASSIGN TO DR, 407 DOCTOR_FRAUD_HOLD

### Doctor Super-Admin

Dashboard / Statistics / Earnings / Delivery Statistics / Broadcast Message / Doctor Blocked List / Doctor Allocation / Live Order / Category / Incentive Management / Schedule / Role Management / Doctor Category / Doctor Calls / Call Management / Category Blocking / Dosage Tagging / Doctor Fraud / OTC Insights / Pilot Order Statistics / IVR

### Pharmacist Portal — Type 1 (RX-only)

**Routing rule (locked):**

| ORDER_TYPE code | Meaning | Routed to |
|---|---|---|
| **52** | RX (prescription only) | **Pharmacist Type 1 queue** |
| 53 | RX AND MEDICINES | **Doctor directly** (bypasses Pharmacist) |
| 54 | MEDICINES (only meds, no Rx) | **Doctor directly** (bypasses Pharmacist) |

Pharmacist Portal handles ONLY Type 1.

Flow: Login → Type 1 Order Listing → Assign/Unassign/Filter → Open → View customer ratings / past orders / Rx / subs history / CSR tickets → Search Products / Change Qty / Set Payment → Calculate delivery date → Search/Add doctor → Apply coupon + TM rewards → Add notes → DIGITIZE ORDER / DISCARD ORDER / MARK UNREACHABLE.

orderstatus events: 213 PHARMACIST MAKER ASSIGNED, 214 CHECKER ASSIGNED, 236 CALL ATTEMPTED, 300 ORDER ON HOLD, 452 PARTIALLY DIGITIZED.

`DRX_STATUS`: 29 PENDING / 30 DIGITIZED / 31 INVALID_RX / 37 MULTIPLE RX.

### Health Advisor (HA) Call portal

- Triggered when SUBSTITUTE is available (post ORDER CONFIRMED, pre WAREHOUSE ASSIGNED)
- orderstatus → 595 HEALTH ADVISOR CALL ATTEMPTED
- Flow: Login → Dashboard → Agent Shift / Statistics / Target Mgmt / OTC Sales Dashboard / Assign-Unassign / Incentive Mgmt
- Per-order: Fetch → View details → Call → Read Rx → View Products → Change Qty / Payment → Substitution (Replace original / Keep both) → Cancel / Hold / Place
- **Cart constraint:** HA can add only OTC (`ITEM_TYPE = 475 OTC`); cannot add Rx
- HA-eligibility config: `HA CALL ELIGIBILITY Y`, `HA CALL X DATE RANGE`, `HA CALL Y DATE RANGE`

### CSR Portal — Create Order

Login → Receive customer call → Search Mobile → View customer → Call → Upload Rx / Search Products / View / Change qty / Manage everything → Place Order.

### CSR Portal — Post Order

Login → Order Listing → Filter / Search / Open → View order / customer / past orders / customer ratings / subs history / CSR tickets / communication / Invoice / return bill / TM Rewards. Actions: Call / Cancel / Mark Unreachable / Track status / Add alternate number / Add email / Calculate delivery date / Generate return ticket / Rank up / Upload Rx.

### Assisted Commerce Portal

Outbound sales (OTC-heavy). Login → Dashboard → Agent Shift / Statistics / Score / Target Mgmt + OTC Sales Dashboard (Connected % / Substitution AOV / Customer Type Converted %) + Assign Order + Incentive Mgmt.

Per-order: Fetch → View → Call → Search Products → Read Rx → View → Change Qty / Payment → Cancel / Add Cart / Manage Addresses/Profile/Patients → View Bill → Place / Reschedule.

orderstatus: 331 AGENT CALL ATTEMPTED, 332 AGENT ORDER ON HOLD, 333 AGENT CALL SCHEDULED. Master: `ASSISTED_COMMERCE_AGENT_ROLE`.

### Pill Reminder Portal

Login → Dashboard → Manage Group Mapping / Download Reports / Assign Reminder / Un-assign.

Per-reminder: Fetch → View customer → Call → Search Products → View past Rx → View → Change Qty / Set Payment → DO NOT DISTURB / Add or Remove cart → Manage everything → View Bill → PLACE ORDER / SET NEW REMINDER / RESCHEDULE / RE-ATTEMPT LATER.

Statuses (`PILL_REMINDER_STATUS`): 309 NOT NEEDED / 310 UNREACHABLE / 311 ORDER PLACED / 314 CANCEL REMINDER / 537 SKIP / 538 DND / 539 REATTEMPT LATER.

Reminder type: BY DATE / BY FREQUENCY. Category: CHRONIC / NON CHRONIC.

orderstatus: 316 REMINDER CALL ATTEMPTED.

---

## Admin & control modules

### Hub Config / Min-Max admin

- Role & Access Management
- SKU Categorization (`SKU_INV_CATEGORY`)
- Bulk SKU List
- Hub Transit Days & Threshold
- Potential Bulk List
- Hub Inventory + Refill at Hub
- Refill PO Tracking
- TO Transit Days, Local Ordering Transit Days
- Hub Picking Calendar + Holiday List
- Parent-Child Mapping
- Hub-level SKU Forecasting
- TO / Refill SKU List
- RQ-TO Request Tracking + RQ-Refill Request Tracking + Urgent Orders Request Tracking
- **Permanent Pincode Movement** (re-route pincodes between WHs)
- **Cold Chain SKU List** (separate handling)
- **Homeopathy SKU List**
- Old/New Pack Size + Inventory Reports
- Excess Inventory Report
- Thresholds
- WH Prioritization

### Dynamic Content Management (owned by CMT)

Surfaces:
- Homepage Category Management
- Coupon Management (Marketing) — masters: OFFER_TYPE / OFFER_STATUS / DISCOUNT_TYPE
- OTC Product Carousel Management
- Catalog Management — Molecules / Companies / Products (WH-Level + Global)
- Banner Management
- CMS
- Disease Pages + Disease Master + Disease Category Master → Approver Flow
- OTC Pages + OTC Master + OTC Sub Category
- Salt Master + Salt Page Legends
- Role Management
- **Capping / Blocking** (per-SKU max-allowed cap per customer) → Approver Flow

CMT workflow: `CMT STATUS` (APPROVED / PAUSED / REJECTED) × `CMT APPROVALS` (CATALOGUE / SUBSTITUTION / BOTH).

### Fraud

| Sub-system | Scope | Project |
|---|---|---|
| **Affiliate Fraud** | Affiliate orders, **all channels (web/app/ios)** since 2026-06-01. Address/phone injection, identity rings, RTO abuse. Daily engine scores a curated scope file → 24 signals → FRAUD/SUSPECT/CLEAN → CSV email + Google Sheet. **SHIPPED & LIVE** | `tm-fraud-engine` |
| **Doctor Fraud** | Doctor Portal "Fraud Count" + Super Admin "Doctor Fraud" module. orderstatus 407 DOCTOR_FRAUD_HOLD when triggered | DOCTOR PORTAL Super-Admin |
| **Order Fraud** (general) | Verification states: 292 REQUEST VERIFICATION FAILED, 297 ORDER VERIFICATION FAILED, 293 ORDER VERIFIED, 296 REQUEST VERIFIED | Order verification flow |

> **tm-fraud-engine** full canonical state (architecture, 24 signals, data sources, deploy, learnings) → **KNOWLEDGE_DUMP § 15** + `tm-chotu-projects`.
> ⛔ **tm-chotu scope:** reuse the detection *logic* (24 signals + verdict thresholds) to find new frauds ad-hoc on trigger via Metabase — **do NOT run / deploy / trigger / operate** the deployed engine on DCOE EC2 (reference-only). See KD §15 "Applying the signals ad-hoc".

### Fraud Engine signal windowing (tm-fraud-engine v2, Spec 1, 2026-05-27)

**Rule:** lookback window endpoints are the EVENT date (e.g. order.placed_date),
NOT the run/job date. Correct for daily-T-1-cron only by accident. Breaks on
batch / backfill / multi-day-batch scoring.

**Substrate window:** for batch scoring across [start, end], ingest substrate
covers `[start - max_lookback, end]`. tm-fraud uses 30d max_lookback → substrate
[start - 30d, end + 1d).

**Affected signal families:** history (N2/N7), economics (N10/N11), network (S5),
session (L1/L2). 6 signals fixed in Spec 1 Family F.

---

## Other

### Diagnostics (high-level)

Recently launched vertical, picking up well.

**Flow:**

```
Customer calls (or books via app/web)
   → We book the test
   → Phlebotomist (phlebo) visits home → collects sample
   → Sample sent to partner lab
   → Reports sent to customer
```

**Tables:** `tm_diagnostics_catalog_master`, `tm_diagnostics_order_master`, `tm_diagnostics_order_master_lineitem`, `tm_diagnostics_order_master_event`, `tm_diagnostics_order_master_address`, `tm_diagnostics_order_master_order`, `tm_diagnostics_order_master_phlebo`.

Deep expansion deferred — owner to push via plugin update.

### Pincode Mapping module

- Maps pincode → serviceable warehouse(s) (Full Centre / MFC / Hub)
- Drives serviceability check at PDP / checkout + COD eligibility decision
- Tables: `pincode_master`, `pincode_warehouse_master`, `pincode_microfc_master`, `analytics_pincode_microfc_master`
- Admin: **Permanent Pincode Movement** under Hub Config
- Used by: Warehouse Assignment, Logistics (TAT adherence), COD enable/disable in checkout
