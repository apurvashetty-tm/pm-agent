# SOP-HGS-Ops-001 — High Governance Salts: Operations Guide

**Version:** 1.0
**Effective Date:** June 2026
**Audience:** Operations Team — Super Doctor

---

## Quick Reference

| I need to… | Go to |
|---|---|
| Understand what's new in the portal | Section 1 |
| Filter HG orders by type | Section 2 |
| Handle a SPLIT order | Section 3 |
| Manually assign an order to a doctor | Section 4 |
| Check which doctor handles which salt | Section 5 |
| Handle a doctor-reported error | Section 6 |

---

## 1. What Is New in the Portal

One new column has been added to the portal order table for HG (High Governance Salt) orders. Everything else in the portal is unchanged.

**New column: High Governance Order Tag**

![Portal order table showing the new High Governance Order Tag column with Good_MBBS and IM tag values](https://apurvashetty-tm.github.io/pm-agent/assets/ops_00_hg_order_tag_column.jpg)

This column shows the HG category of each order: `Good_MBBS`, `IM`, `SPLIT_ORDER`, or `NA` for non-HG orders. Use this column to filter and identify all HG orders at a glance.

**Existing column: Order Category — two new values added**

The Order Category column already existed. It now carries two new values specific to HG orders:

| Order Category value | What it means |
|---|---|
| `CONTROL_CATEGORY_SUBS_NOT_POSSIBLE` | HG order — no substitute available |
| `CONTROL_CATEGORY_SUBS_POSSIBLE` | HG order — substitute exists |

All other Order Category values (e.g. `PHARMACIST_CALL_SUBS`) remain unchanged and are not HG orders.

> Filter by **High Governance Order Tag** first — this is your primary daily view for all HG order monitoring.

### The Order Category Column

The **Order Category** column tells you whether a substitute is possible for the medicines in an HG order. This determines the path the order takes after doctor confirmation.

![Order Category column showing CONTROL_CATEGORY_SUBS_NOT_POSSIBLE and CONTROL_CATEGORY_SUBS_POSSIBLE values](https://apurvashetty-tm.github.io/pm-agent/assets/ops_03_order_category.jpg)

| Order Category value | What it means | Path after doctor confirms |
|---|---|---|
| `CONTROL_CATEGORY_SUBS_NOT_POSSIBLE` | HG order — no substitute available for this salt | Doctor confirms → goes directly to fulfilment |
| `CONTROL_CATEGORY_SUBS_POSSIBLE` | HG order — a substitute exists for this salt | Doctor confirms → enters Health Advisor (HA) call queue for substitution → then fulfilment |

> For `CONTROL_CATEGORY_SUBS_POSSIBLE` orders: after the doctor confirms, the order appears in the HA queue as **Partially Digitised** with high priority — ahead of regular orders. If such an order appears stuck after doctor confirmation, check the HA queue first.

---

## 2. Filtering HG Orders

![Filter dropdown on High Governance Order Tag column showing all three tags selected](https://apurvashetty-tm.github.io/pm-agent/assets/ops_01_filter_all_tags.jpg)

1. Click the **filter icon** on the **High Governance Order Tag** column header
2. Select the tag: `Good_MBBS`, `IM`, or `SPLIT_ORDER`
3. Click **OK**

**Tag reference:**

| Tag | What it means | Who handles |
|---|---|---|
| `Good_MBBS` | Category 1 HG order — Pregabalin / Sildenafil salts | MBBS / General Physician pool |
| `IM` | Category 2 HG order — GLP-1 / Semaglutide / Rybelsus / Tirzepatide salts | MD / General Medicine pool |
| `SPLIT_ORDER` | Contains medicines from both categories — not auto-assigned to any doctor | **Super Doctor only** |
| `NA` | Non-HG order | Standard flow — unaffected |

---

## 3. SPLIT Orders — Full Handling Guide

### 3.1 What Is a SPLIT Order?

A SPLIT order occurs when a customer adds medicines from **two different specialist categories** in the same order (e.g. a Pregabalin medicine + a Semaglutide medicine together).

These orders **cannot be auto-assigned to any doctor** — no single doctor covers both categories. They land directly in the Super Doctor portal.

![Order table showing SPLIT_ORDER tag visible in the High Governance Order Tag column](https://apurvashetty-tm.github.io/pm-agent/assets/ops_02_split_order_row.jpg)

A SPLIT order row shows:
- **High Governance Order Tag:** `SPLIT_ORDER`
- **Doctor column:** blank — no auto-assignment
- **Order Category:** `CONTROL_CATEGORY_SUBS_NOT_POSSIBLE` or `CONTROL_CATEGORY_SUBS_POSSIBLE`

> No specialist doctor will ever see a SPLIT order in their queue. It will sit unassigned until the Super Doctor actions it.

---

### 3.2 Step-by-Step: Handling a SPLIT Order

1. Filter the table by `SPLIT_ORDER` in the High Governance Order Tag column
2. Open the order — identify which medicines belong to Category 1 (Good_MBBS) and which to Category 2 (IM)
   - Use the **Salt Reference Table in Section 5** if unsure
3. Call the customer using the script in Section 7.1
4. **Cancel the original order**

   > ⚠ Cancelling the SPLIT order immediately **releases the molecule capping** held against the customer's account. The customer's capping resets on cancellation. Do not cancel until you are ready to recreate both orders.

5. Create **two new orders** via the Assisted Portal — one per specialist category
6. **Manually assign each new order** to the correct doctor (see Section 4)
7. Record all IDs in the tracking table below

---

### 3.3 SPLIT Order Tracking

| Field | What to record |
|---|---|
| Original Order ID | From the SPLIT order row |
| Medicine → Category 1 (Good_MBBS) | Which medicine(s) go to new Order 1 |
| Medicine → Category 2 (IM) | Which medicine(s) go to new Order 2 |
| New Order ID — Category 1 | After Assisted Portal creation |
| New Order ID — Category 2 | After Assisted Portal creation |
| Doctor assigned — Category 1 | Name from Section 5 |
| Doctor assigned — Category 2 | Name from Section 5 |
| Customer informed | Yes / No + channel |

---

## 4. Manual Order Assignment

### 4.1 When to Assign Manually

- SPLIT order has been split into two new orders
- Order is stuck in pool — no doctor has picked it up
- Customer or CSR has escalated — order needs priority (rank-up)

### 4.2 How to Assign

1. Locate the order in the table
2. Click **Assign / Unassign Doctors**
3. In the **Select Doctor** dropdown, search by doctor name
4. Click **Assign**

### 4.3 ⚠ Critical Rule: Match the Order Tag to the Doctor's Category

**This is the most common error.** The system may not always block a wrong assignment at the time of assigning — the error surfaces later when the doctor tries to prescribe, causing the order to stall.

| Order Tag | Assign to | Outcome |
|---|---|---|
| `Good_MBBS` | MBBS / General Physician (Category 1 list) | ✓ Doctor processes normally |
| `IM` | MD / General Medicine (Category 2 list) | ✓ Doctor processes normally |
| `Good_MBBS` | MD / General Medicine doctor ❌ | Doctor gets authorisation error — order stalls |
| `IM` | MBBS / General Physician doctor ❌ | Doctor gets authorisation error — order stalls |

**If a wrong assignment has already happened:**
1. Unassign the doctor immediately
2. Reassign to a doctor from the correct category (use Section 5)
3. Inform the doctor they can now retry

---

## 5. Salt and Doctor Reference

### 5.1 Salt → Category Mapping

| Salt Category | Key Medicines | Order Tag | Doctor Type |
|---|---|---|---|
| Pregabalin | Pregabalin (all strengths and combinations) | `Good_MBBS` | MBBS / General Physician |
| Sildenafil | Sildenafil, Tadalafil, Avanafil and combinations | `Good_MBBS` | MBBS / General Physician |
| Rybelsus / GLP-1 | Semaglutide 3mg / 7mg / 14mg tablets | `IM` | MD / General Medicine |
| GLP-1 Injectable | Tirzepatide, Semaglutide injectable pens | `IM` | MD / General Medicine |

> If a salt does not appear above, check the `category_sku_mapping_2026-06-03.xlsx` file for the full SKU list.

---

### 5.2 Doctor → Category Mapping

**Category 1 — Good_MBBS (MBBS / General Physician)**

| Doctor ID | Name | Qualification |
|---|---|---|
| 13738 | Ramya Shree | MBBS |
| 5224 | M G Kartheeka | MBBS |
| 5351 | Sanjay Makharia | MBBS |
| 2426 | Sana Ahmed | MBBS |
| 2815 | Nidhinati Mubeena | MBBS |
| 13031 | Nupur Tiwari | MBBS |
| 654 | Sandeep C | MBBS |
| 13746 | Soumyadeep Mahapatra | MBBS |
| 13747 | Hina Khaleel | MBBS |
| 4359 | Anindya Debnath | MBBS |
| 5425 | Gagandeep Chadha | MBBS |
| 2652 | Sai Samhitha | MBBS |
| 13023 | Samyapran Biswas | MBBS |
| 5397 | Ayan Chowdhury | MBBS |

**Category 2 — IM (MD / General Medicine)**

| Doctor ID | Name | Qualification |
|---|---|---|
| 13743 | Lokendra Kashyap | MD |
| 13736 | Mukesh Kamble | MD |
| 13744 | Payal Deshmukh | MD |
| 13745 | Anshula Shrivastava | MD |
| 5928 | Vashistha Chouragade | MD |

> **Note:** Amey Gavli (Mch / Urology, ID 13807) is listed in the doctor file but does not map to Category 1 or 2. Do not assign HG orders to this doctor until category mapping is confirmed.

---

## 6. Handling Doctor-Reported Errors

When a doctor contacts you with an error from their portal, use this table to action it:

| Error the doctor sees | What it means | Your action |
|---|---|---|
| *"Contact Support to route this order to the right department. Department review is required before confirmation."* | Order or medicine needs department-level review before it can be confirmed | Do not cancel the order. Review the medicine and route to the correct department. Inform the doctor they can stand down |
| *"Contact Support to route this consultation to the right department. Department review is required before adding this medicine."* | Same as above — triggered on add medicine instead of confirm | Same action as above |
| *"Couldn't save note. Please enter a meaningful consultation note using professional language and supported characters."* | Doctor Notes validation failed — notes were blank, non-professional, or contained unsupported characters | Inform the doctor to rewrite their notes with a proper clinical summary. No ops action needed — doctor resolves this themselves |
| Doctor reports order stuck after prescribing — confirm button locked | Call attempt not recorded, or Diagnosis / Doctor Notes not filled | Confirm with the doctor: did they tap Call Patient? Are Diagnosis and Notes filled? If yes and still locked, escalate to tech support with Order ID |

---

## 7. Customer Communication Scripts

### 7.1 SPLIT Order — Explaining to the Customer

> *"Your order contains medicines that need review from different medical specialists. To process this correctly, we will split the order and route each part to the relevant specialist for review. Our team will contact you shortly with the updated order details."*

If the customer asks why:
> *"For certain medicines, we follow a process where each specialist reviews only the medicines within their area of expertise. This ensures your prescription is reviewed by the right doctor."*

---

### 7.2 Order Delayed / Stuck

> *"Your order is currently being reviewed by our specialist doctor team. We will process it as soon as possible. Please keep your phone reachable so our doctor can connect with you."*

---

*Document owner: Product — Apurva Shetty*
*Effective: June 2026 — v1.0*
*For corrections or updates, contact the PM directly.*
