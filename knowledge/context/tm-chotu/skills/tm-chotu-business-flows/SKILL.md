---
name: tm-chotu-business-flows
description: End-to-end order lifecycle (app open → checkout → digitize → confirm → fulfilment → dispatch → deliver), substitution flow, prescription handling, AUTO-CONFIRMATION path, doctor call path, chronic-vs-acute, RTO chain (60 → RTO-IT → RTD → reverse putaway), customer return flow, refund destinations. Load when user asks "how does X flow work", "what happens when an order is placed / cancelled / returned", "RTO process", "substitution path", "Rx review process", or any process/flow question.
---

# Business flows

Source: Whimsical bird's-eye PDF (full Truemeds product architecture).

## Order lifecycle — actual path

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
  Picking (one of three variants — see tm-chotu-modules Picklist)
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

## Substitution flow — confirmed steps

1. Customer adds branded Rx product (or unbranded — algo runs anyway)
2. `findBestSubForProducts` algo suggests generic equivalent across warehouse stock
3. Doctor reviews on Doctor Portal, picks substitute (line-item tagged `medicine_status = 61 / SUBSTITUTE`)
4. **Live Inventory blocks BOTH the original AND the substitute** at this point (pre-confirmation hold)
5. Health Advisor / Pharmacist / Assisted Commerce call explains substitution to customer
6. Customer choice:
   - **Replace original** → keep substitute (`medicine_status = 61`)
   - **Keep both** → both lines stay
   - **Reject substitute** → flipped to `medicine_status = 62 / ORIGINAL`
7. If sub rejected → **substitute SKU released/unblocked** in live inventory
8. On order-level cancel during this flow → `orderstatus = 57 / ORDER CANCELED`

## Prescription handling (Pharmacist Portal flow)

1. Customer uploads Rx (image) at checkout
2. Order enters **Pharmacist Type 1 queue** (queue for first-attempt digitization)
3. Pharmacist opens order details → views customer details / past orders / Rx / past customer ratings / subs history / CSR tickets
4. **Pharmacist validates prescription(s)**:
   - Valid → digitize order (calculate delivery date, search/add doctor, apply coupon / TM rewards, add notes) → `DIGITIZE ORDER`
   - Invalid → `DISCARD ORDER` or `MARK UNREACHABLE` if customer cannot be contacted

## AUTO-CONFIRMATION LOGIC

When a single valid prescription IS already attached at order placement, the order can skip doctor call and go straight to `ORDER CONFIRMED`. `workflow_status = 242 NO_DOCTOR_CALL`. Speeds up the path for repeat / verified prescriptions.

## Doctor call path (when triggered)

When `single valid prescription not available`:

1. Order enters Doctor Portal queue (filtered to doctor's assigned warehouse + category)
2. Doctor pulls Order Details → Patient / Delivery / All Originals SKU / All Subs / Bill / Order Info & Subs
3. Doctor either:
   - **Call Patient** → Confirm Order with verbal Rx clarification
   - **Hold Order** (defer)
   - **Cancel Order**
4. On confirm → `ORDER DIGITIZED` → `ORDER CONFIRMED`

## Chronic vs acute path

| Trait | Chronic | Acute |
|---|---|---|
| Reorder cadence | ~30 days | one-off |
| Reminder eligible | yes (Pill Reminder Portal) | no |
| Cohort tag | `order_chronic_map_*` (⚠️ validate before use) | `order_acute_map_*` |
| Discount stickiness | high (bulk savings) | medium |
| CX touchpoint | Pill Reminder + chronic CRM | order-status only |

Preferred chronic-customer derivation today: Mixpanel + product order history + product chronic tagging in catalog, NOT the legacy chronicity tables.

## Cancellation + RTO / return flow

### Pre-ship cancel

Easy, no fee. orderstatus → 57 ORDER CANCELED.

### Post-ship cancel (RTO chain)

```
ORDER DISPATCHED (60)
   → Courier partner pickup
   → ORDER IN TRANSIT (PACKAGE_STATUS values via 3PL webhook)
   → Cancellation received from customer or courier
   → ORDER CANCELED (57)
   → RTO marked
   → RTO IN TRANSIT (master serial 121 'RTO-IT')
   → RTO DELIVERED back to warehouse (master serial 124 'RTD')
   → Verification at WH
   → Reverse putaway (PUTAWAY TYPE: 583 REVERT PICKING PUTAWAY, or 540 ORDER PUTAWAY)
   → Goods restocked in NetSuite + DB
```

### Customer return after delivery (via CSR Portal "Generate return ticket")

```
Customer raises return → 190 RETURN REQUESTED → 191 RETURN GENERATED
   → Verification: 292 VERIFICATION FAILED / 296 REQUEST VERIFIED / 297 ORDER VERIFICATION FAILED
   → Approval: 290 REQUEST APPROVED / 291 REQUEST DECLINED
   → Pickup scheduling: 299 PICKUP SCHEDULED / 298 PICKUP FAILED / 294 OUT FOR PICKUP
   → 263 RETURN IN TRANSIT → 272 RETURN PICKED UP → 273 RETURN DELIVERED (to warehouse)
   → Refund: 199 REFUNDED / 411 PARTIALLY REFUNDED TO BANK / 412 ORDER REFUNDED TO BANK / 200 PARTIALLY RETURNED / 201 PARTIALLY REFUNDED
   → Return ticket can be CANCELLED (301)
```

**Return window:** ~15 days, no item-type limits.

**Refund destinations** (`REFUND_TO` master): TM_CREDIT / TM_CASH / CASHFREE (original gateway) / TM_CASHBACK.

**RTO accounting:** RTO orders ARE reversed (do not count in final GMV). RTD (124) marks the goods physically returning to warehouse — reverse putaway then restocks the SKU.
