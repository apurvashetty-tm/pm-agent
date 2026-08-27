# Price Lock — Discussion Archive

Purpose: preserve rich reasoning from working sessions. This is not current truth by itself. Use `project_truth.md` for active decisions and `decision_log.md` for durable outcomes.

## 1. Starting problem

Historical Cost Absorption protected customers from batch-MRP increases after order placement. Earlier implementation compared locked selling price with final batch-derived selling price and represented protection as additional invoice discount / Price Lock Savings.

Initial discussion assumed discount percentage was locked. Document review corrected this: existing implementation already uses a locked selling-price baseline, but final invoice representation derives an additional discount from final batch economics.

## 2. Reframed model

The customer commitment is Base Selling Price (BSP), not generic FSP and not discount percentage.

```text
MRP - Base Discount = BSP
BSP - Additional Discounts = FSP
FSP + Tax + Charges - Credits = Final Payable
```

Price Lock preserves BSP. Coupon, TM rewards, credits, charges, tax, payments, refunds, and returns remain separate service responsibilities.

## 3. Example reasoning

Checkout:

```text
MRP ₹100
Base discount ₹20
Locked BSP ₹80
```

Higher batch MRP:

```text
Final MRP ₹110
Required base discount ₹30
Locked BSP ₹80
```

Lower batch MRP:

```text
Final MRP ₹95
Required base discount ₹15
Locked BSP ₹80
```

The normal case does not create a Price Lock refund. MRP changed; BSP did not.

Impossible case:

```text
Final MRP ₹75
Locked BSP ₹80
```

Cannot preserve ₹80 without charging above MRP. Raise alert, try correct batch, hold/cancel/refund. Final handling remains open.

## 4. Threshold reasoning

Threshold is a Pricing-owned safety valve. Avoid separate flat and percentage thresholds unless later required.

WMS compares required incremental base discount against Pricing-provided threshold percentage. If threshold breaches, batch is commercially unacceptable for automatic fulfilment. System must not silently charge above BSP.

Fallback remains open: alternate batch, operational review, customer approval, cancellation/refund.

Legacy documents contain a dangerous missing-threshold case where null configuration can allow unlimited absorption. New implementation must fail safe.

## 5. WMS and MCP reasoning

Historical MCP selects Most Common Price using available stock and can blindly favour high-stock, higher-MRP batch.

New WMS input should include customer-visible MRP and locked BSP. For same pack, WMS may filter candidate batches by:

```text
candidate batch MRP <= customer-visible MRP
```

Prefer exact MRP, then lower MRP, then operational FEFO/FIFO rules.

Price Lock is fallback protection. WMS filtering prevents avoidable variance.

## 6. Pack-size reasoning

Normalized unit BSP matters for future pack-size handling:

```text
₹80 / 10 tablets = ₹8/tablet
₹100 / 50 ml = ₹2/ml
```

But pack-size changes are outside current Price Lock scope. Do not blindly charge a 15-tablet replacement as 15 × old unit price. OMS/WMS must decide equivalence and customer approval.

Same-pack batch variation remains in scope. 10-tablet→15-tablet, 50ml→60ml, unit conversion, and pack approval are future orchestration scope.

## 7. Lineage reasoning

No committed BSP may be mutated.

```text
OG at cart ₹80
→ substitute at HA ₹65
→ substitute at HA ₹70
→ OG restored at original ₹80
```

Use line versions/lineage. Do not overwrite historical line values.

## 8. Invoice reasoning

Invoice must show each physical Batch ID within same SKU/TM ID as a separate row. Aggregated totals may exist for reconciliation but cannot replace batch-level detail.

Each batch line needs quantity, actual MRP, required base discount, BSP, discounts, taxable value, tax, and line total.

## 9. Discounts and benefits reasoning

Price Lock does not define discount stacking. Discount team owns coupon and TM rewards. Contract requirement only:

```text
Additional discounts use BSP as basis, never MRP.
No additional service mutates BSP.
```

Credits are payment instruments applied after final payable is calculated unless Finance defines another treatment.

Customer-driven modifications may independently change coupon/AOV/reward/delivery eligibility. Internal fulfilment benefit-loss policy is outside Price Lock scope and must remain a cross-feature dependency/open policy.

## 10. GST and charges reasoning

Price Lock does not calculate GST. Tax service applies component-specific rules consistently in pre-order, post-order, and invoice.

Potential components:

- Product merchandise value.
- Delivery/shipping.
- Packaging.
- Cash handling.
- Other service charges.

Each may have separate taxable treatment, rate, inclusive/exclusive status, and rounding. Finance/Tax must confirm. View Bill and invoice must not show contradictory tax values for same inputs.

## 11. Rounding reasoning

Use one currency-agnostic backend money contract:

```text
ISO currency code
integer minor-unit amount
currency precision
central rounding mode
```

INR uses paise today. No frontend arithmetic. Threshold comparisons use unrounded values. Final line/order amounts use currency precision. Mixed-batch residual minor units are assigned deterministically.

Recommended default: ROUND_HALF_UP. Final mode remains open for Engineering/Finance confirmation.

## 12. Scope boundary

In scope:

- Locked BSP.
- Same-pack batch-MRP variation.
- Required base discount.
- Pricing threshold validation.
- WMS batch recommendation dependency.
- Batch-level invoice rows.
- Shared rounding contract.

Out of scope:

- Coupon/reward rule changes.
- AOV/MOV policy.
- Delivery, packaging, cash-handling rules.
- Tax policy.
- Payment/refund execution.
- Returns.
- Pack-size orchestration.
- Substitution orchestration.
- Customer-benefit policy for internal fulfilment changes.

## 13. Why this archive exists

Earlier responses contained corrections, rejected framings, and alternative models. Preserve them here so future work can understand why current truth is narrower than historical Cost Absorption documents.
