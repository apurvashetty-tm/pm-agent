# Truemeds Price Lock — Project Truth

Status: Working product truth. Not a PRD.
Last updated: 2026-08-24

## 1. Purpose

Price Lock keeps the customer-committed merchandise price stable when the MRP of the fulfilled batch differs from the MRP shown at Pre-order.

This file describes the current behaviour, the target behaviour, and the Pre-order → Post-order contract. Historical CAB and PRD material is reference only.

Core principle (decision 2026-08-24): lock the **price (FSP)**, not the discount. Price Lock holds the committed price stable; it is **not** a variance-correction engine. Correcting variance — batch MRP ≠ quoted MRP, up or down — belongs upstream at MCP and batch-picking, not at invoice time.

## 2. Canonical terms

```text
Quoted MRP          = MRP shown to the customer by Pre-order (carried for variance detection)
Fulfilled Batch MRP = MRP of the batch picked for fulfilment
FSP                 = Final Selling Price — the LOCKED INVARIANT the customer pays per sellable unit
BSP                 = Base Selling Price — retained as part of FSP's frozen breakdown, not the lock
Discount            = Customer-facing reduction from MRP to FSP; on-invoice = Fulfilled Batch MRP - FSP
Sellable Unit       = One orderable SKU/pack, such as one strip, bottle, or box
Final Payable       = Merchandise + taxes + charges - applicable credits
```

Locked invariant = FSP. The two live fields in the Pre-order → Post-order handshake are FSP and quoted MRP. Base discount, coupon/reward detail, Price Lock discount, tax, and charge components are retained as a **frozen breakdown** for tax, returns, and reconciliation — post-order does not recompute them. How they are stored is an engineering-contract choice, kept separable so future coupon logic can be independent rather than applied directly to MRP. Customer-facing View Bill and invoice use one generic Discount line (with a named Price Lock Savings line where absorption applies — presentation still open, see §8).

## 3. What happens now

Current calculation keeps the existing discount behaviour when the picked batch changes MRP.

### Higher fulfilled MRP

- Customer selling price remains protected.
- Additional Price Lock discount absorbs the batch-MRP increase.
- The additional discount is retained for financial reconciliation.

### Lower fulfilled MRP

- Cost Absorption applies the existing discount logic to the lower picked MRP.
- Customer selling price mutates downward.
- If the customer already paid the higher quoted amount, the difference is refunded.
- This is current Cost Absorption behaviour, not a separate legacy flow.

## 4. What we are trying to do

Target behaviour keeps the Pre-order FSP constant and mutates discount instead.

```text
Fulfilled Batch MRP - required discount = fixed FSP
```

### Higher fulfilled MRP

- Keep FSP unchanged.
- Increase the required Price Lock/base discount.
- Compare against the Discount Threshold supplied by Pre-order.
- If the threshold is exceeded, route to Problem Solver.

### Lower fulfilled MRP

Principle: hold FSP. A lower batch MRP does **not** reduce the customer's bill and is **not** refunded — the customer pays the locked FSP and the delta is retained (decision 2026-08-24). Lower-price delight is delivered upstream by quoting the right price (MCP / correct-batch picking), not by correcting price after fulfilment.

Calculate:

```text
Lower variance % = (Quoted MRP - Fulfilled Batch MRP) / Quoted MRP × 100
```

- Fulfilled MRP equal to or higher than Quoted MRP: lower-MRP check does not trigger; FSP held.
- Lower variance within the configured lower-MRP threshold: keep FSP, reduce discount, no customer refund/pass-down.
- Lower variance beyond the threshold: flag as an exception (guardrail), do not silently adjust.
- Fulfilled MRP less than or equal to FSP: exception — cannot legally sell above MRP.

Threshold basis: the lower-MRP threshold is a new product/fairness knob, not a CAB value. The "5%" carried earlier had no basis in source and is to be set deliberately (see open_questions). Exception routing is in Price Lock scope; exception resolution and batch-selection SOP are separate scope.

## 5. Pre-order → Post-order contract

Pre-order sends and Post-order stores, per sellable unit:

```text
line_id / SKU / pack identity
quantity
quoted_mrp
bsp
fsp
selected discount context and internal breakdown
discount_threshold value and configuration context
quoted taxes and charges
```

Post-order/WMS adds:

```text
fulfilled_batch_mrp
required discount and Price Lock adjustment
threshold result
problem_solver_required flag and reason
invoice/refund snapshot
```

Post-order must not reapply Pre-order coupon or TM Rewards logic. FSP is the merchandise-price input.

## 6. Thresholds

### Pre-order Discount Threshold

Pre-order owns and supplies one generic Discount Threshold for higher-MRP price protection.

The threshold basis—base discount, total discount, or another explicitly defined discount amount—must be present in the technical contract before implementation. Product scope does not create a separate Base Discount Threshold or Margin Floor.

If required discount exceeds the supplied threshold, route to Problem Solver. Do not silently ship a loss-making outcome.

### Post-order Lower-MRP Threshold

Post-order owns a configurable global lower-MRP threshold. Default: 5%.

This threshold measures the difference between Quoted MRP and Fulfilled Batch MRP. It is separate from the Pre-order Discount Threshold.

Future enhancements may add SKU/category-specific thresholds, a separate Base Discount Threshold, or a Margin Floor. They are not current scope.

## 7. Responsibilities

### Pre-order

- Show Quoted MRP.
- Calculate and send BSP and FSP.
- Decide current coupon versus TM Rewards selection.
- Send Discount Threshold.
- Send quoted taxes and charges.

### Post-order/WMS

- Receive fulfilled batch MRP.
- Calculate required discount and Price Lock adjustment.
- Apply the two threshold checks.
- Route threshold failures and invalid prices to Problem Solver.
- Create batch-level invoice rows.
- Validate quoted taxes and charges against fulfilment before invoice finalisation.

### Price Lock

- Preserve BSP and FSP in the target model.
- Own price-variance calculation and threshold routing.
- Do not redesign promotions, rewards, taxes, charges, payments, refunds, returns, or pack-size orchestration.

## 8. View Bill and invoice

**Reference invoice (real, current, batch-level):** `docs/context/ORDER_INVOICE_48188241_Paid.pdf` — Order 48188241. Ground every invoice-column, discount-line, and batch-row discussion against this file directly, not against a description of it.


### Current View Bill

Keep existing customer-facing structure:

```text
MRP
Discount
Charges, if any
Final total
```

Do not expose base discount, coupon discount, TM Rewards discount, or Price Lock discount as separate customer-facing lines.

### Target invoice (decision 2026-08-24)

Do not redesign the invoice. Keep the existing columns (they already reconcile) and make the minimal change: drop the Old MRP column, rename "Revised MRP" → "MRP" (the actual batch MRP billed), and drop the GST old/new footnote.

```text
Columns: Sr | Item | Manufacturer | HSN | Batch No. | Exp. Date | MRP | Qty | MRP Total | Discount | Taxable Amt | GST% | GST Amt | Total Amt

MRP Total = MRP × qty (gross)
Discount  = single blended line (base + coupon + price-lock absorption) = MRP Total − Total Amt
Total Amt = net payable = MRP Total − Discount   (= Taxable + GST)
```

- MRP Total (gross) and Total Amt (net payable) are separate existing columns; nothing is redefined.
- No "Selling Price" column — Selling Price / FSP is an internal name only, not shown on the invoice.
- No separate Price Lock / additional-discount line. Discount = Fulfilled Batch MRP − FSP, so absorption is inside it automatically.
- The absorption/delight story lives on the Price Lock frontend display page, not the tax invoice.
- GST presentation flexible: per-line GST-amount column or CGST/SGST summary block — either is fine as long as GST amount is shown.

Invoice backend must retain, per batch/sellable-unit row (frozen metadata, even though presentation is blended):

- Quoted MRP.
- Fulfilled Batch MRP.
- BSP.
- FSP.
- Required discount and Price Lock adjustment.
- Pre-order discount detail, if supplied.
- Taxable value and tax.
- Charges.
- Quantity and line total.

Same SKU across multiple batches remains represented by separate batch rows. Customer-facing presentation may remain consolidated where the existing invoice supports it.

## 9. Sellable unit and refund data

One sellable SKU/pack is one transactional pricing and refund unit.

Store the original unit price, discount allocation, taxable value, tax, quantity, and fulfilment state immutably. Product refunds use the original snapshot, not current promotion or reward state.

Tablet/ml-normalised rates are optional display or analytics values, not the transactional refund unit unless the existing product flow explicitly sells or returns at that measure.

Existing pack-size change and line/version behaviour continues. Price Lock does not redesign it.

TM Rewards expiry, re-credit, non-refundable treatment, charge-waiver refunds, and benefit clawbacks remain outside this scope.

## 10. Taxes and charges

Pre-order supplies quoted taxes and charges. Post-order validates them against actual fulfilment.

If fulfilment changes make a tax or charge inapplicable, the authoritative invoice/tax flow determines the final value. This project does not redesign tax or charge rules.

## 11. Money and rounding

Use currency minor units and centralised backend rounding.

```text
currencyCode    = ISO 4217
minorUnitAmount = integer
roundingMode    = centrally configured
```

No frontend money calculations. Batch, line, invoice, payment, and refund outputs must reconcile deterministically.

## 12. Current scope boundaries

In scope:

- Current-versus-target price calculation.
- Pre-order/Post-order price contract (two live fields: FSP + quoted MRP).
- Fixed FSP target model (FSP is the locked invariant).
- Price Lock discount adjustment (derived = Fulfilled Batch MRP − FSP).
- Higher-MRP absorption threshold (guardrail).
- Lower-MRP threshold / floor (guardrail) — hold FSP, no pass-down/refund.
- Exception flagging for threshold/floor breaches.
- Simple customer-facing Discount presentation.
- Batch-level invoice data.
- Sellable-unit refund snapshot (returns execution continues as-is).

Out of scope:

- Price-variance correction at source — MCP accuracy and correct-batch picking. This is the *real* fix for variance and a critical dependency, but Price Lock does not own it. Needs an explicit owner (see open_questions).
- Exception resolution SOP and alternate-batch selection implementation.
- TM Rewards revamp or ownership redesign.
- Reward expiry, re-credit, and refund policy.
- Vendor-funded coupon logic.
- Margin Floor.
- Pack-size orchestration (pack-size price absorption itself continues as-is per CAB).
- Tax, charge, payment, refund, or returns redesign (returns work as-is).

## 13. Remaining launch questions

- Exact Pre-order Discount Threshold basis and formula.
- Exact source of truth for final statutory tax and charge values.
- Final invoice presentation when quoted and fulfilled MRP differ.
- Rounding mode and residual allocation.

## 14. Reference priority

1. Latest user-locked decision.
2. This file.
3. `docs/context/decision_log.md`.
4. `reference/CAB/` and session artifacts.

Historical documents must not override newer decisions.
