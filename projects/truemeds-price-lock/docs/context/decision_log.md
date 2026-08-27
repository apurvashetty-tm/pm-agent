# Price Lock — Decision Log

Append-only. Newer decisions supersede older interpretations; do not delete history.

## 2026-08-11 — Use BSP as locked truth

Status: Agreed.

Decision: Lock Base Selling Price, not generic FSP and not discount percentage.

Rationale: Final batch MRP can change. Required Base Discount can change to preserve customer-committed BSP.

## 2026-08-11 — Separate additional pricing components

Status: Agreed.

Decision: Coupons, TM rewards, credits, cashback, charges, tax, payments, refunds, and returns remain owned by respective services.

Boundary: Additional discounts use BSP as basis and must not mutate BSP. Price Lock does not own FSP.

## 2026-08-11 — WMS owns batch calculation and invoice creation

Status: Agreed.

Decision: WMS receives customer-visible MRP and locked BSP, selects/recommends batch, calculates Required Base Discount, validates threshold, and creates invoice.

Correction: OMS does not calculate Required Base Discount for this scope.

## 2026-08-11 — Pricing owns one threshold percentage

Status: Agreed direction; fallback open.

Decision: Avoid separate absolute and percentage thresholds. Pricing team sends one configurable threshold percentage based on medicine/product context.

Open: exact breach fallback.

## 2026-08-11 — Invoice must retain batch rows

Status: Agreed.

Decision: Invoice must show one line per Batch ID within same SKU/TM ID. Order totals may sum rows but must not replace them.

## 2026-08-11 — Pack-size changes are out of current scope

Status: Agreed.

Decision: 10-tablet→15-tablet, 50ml→60ml, unit normalization, pack-size substitution, and approval orchestration belong to future OMS/WMS capability.

## 2026-08-11 — Rounding is shared backend infrastructure

Status: Agreed direction; exact mode open.

Decision: Currency-agnostic minor-unit money contract, centralized rounding, no frontend arithmetic. INR uses paise today.

## 2026-08-11 — Returns and refund execution are out of scope

Status: Agreed.

Decision: Price Lock provides immutable line-level calculation data. Payment/refund and returns services execute their own logic.

## 2026-08-11 — Internal benefit-loss policy is out of scope

Status: Agreed.

Decision: Price Lock will not decide whether internal warehouse changes preserve, absorb, or remove coupon/AOV/delivery/reward benefits. Track as cross-feature dependency/open policy.

## 2026-08-24 — Current and target price behaviour

Status: Agreed.

Current behaviour: Higher picked MRP keeps the customer selling price protected through an additional Price Lock discount. Lower-MRP fixed-discount and settlement behaviour remains unchanged.

Target behaviour: Keep Pre-order FSP fixed and mutate discount when fulfilled batch MRP differs.

## 2026-08-24 — Two threshold owners

Status: Agreed.

Decision:

- Pre-order owns and supplies one generic Discount Threshold for higher-MRP price protection.
- Post-order owns a configurable global Lower-MRP Threshold, default 5%, based on the difference between Quoted MRP and Fulfilled Batch MRP.

Lower variance up to 5% proceeds with fixed FSP and reduced discount. Lower variance above 5% routes to Problem Solver. Fulfilled MRP equal to or higher than Quoted MRP does not trigger the lower-MRP check.

## 2026-08-24 — Problem Solver is routing only

Status: Agreed.

Decision: Price Lock flags threshold breaches and invalid prices for Problem Solver. Problem Solver SOP, alternate-batch selection, and resolution policy remain separate scope.

## 2026-08-24 — Simple customer pricing presentation

Status: Agreed.

Decision: Keep existing customer-facing View Bill and invoice structure: MRP, one generic Discount, charges, taxes, and final total. Backend retains the detailed pricing, threshold, tax, charge, and refund snapshot needed for reconciliation.

## 2026-08-24 — Pre-order/Post-order price contract

Status: Agreed.

Decision: Pre-order sends Quoted MRP, BSP, FSP, selected discount context, Discount Threshold, and quoted taxes/charges. Post-order stores these values, adds Fulfilled Batch MRP, calculates the required discount/Price Lock adjustment, validates the lower-MRP threshold, and routes exceptions.

## 2026-08-24 — Current lower-MRP Cost Absorption behaviour

Status: Clarified.

Decision: Cost Absorption applies the existing discount logic to a lower picked MRP. Customer selling price mutates downward. If the customer already paid the higher quoted amount, the difference is refunded.

Target boundary: Future Price Lock keeps FSP fixed and changes the discount instead. The global lower-MRP threshold controls whether that target behaviour proceeds or routes to Problem Solver.

## 2026-08-23 — Pre-order sends final merchandise price

Status: Agreed.

Decision: Pre-order sends quoted MRP, locked BSP, and final selling price (FSP) per sellable unit. Pre-order owns the current coupon or TM Rewards selection and applies the relevant merchandise discount before sending FSP.

Boundary: Post-order must not reapply or silently recalculate those Pre-order discounts. Price Lock/WMS calculates the Base Discount required to preserve BSP when fulfilled batch MRP changes.

## 2026-08-23 — Sellable unit is transactional pricing and refund unit

Status: Agreed.

Decision: Store MRP, BSP, FSP, discount allocation, tax basis, and refund snapshot per sellable unit: one orderable SKU/pack such as one strip, bottle, or box.

Boundary: Tablet/ml-normalised rates are optional display or analytics values. Existing pack-size change and line/version behaviour continues; Price Lock does not redesign it.

## 2026-08-23 — Consolidated customer-facing discount

Status: Agreed.

Decision: Customer View Bill and invoice show one generic Discount amount. They do not expose separate base discount, coupon discount, or TM Rewards discount lines.

Boundary: Backend retains the discount source, allocation, and Pre-order detail for reconciliation, tax, support, and future refund policy.

## 2026-08-23 — Current coupon and TM Rewards choice remains unchanged

Status: Agreed.

Decision: Preserve current customer experience where the customer selects either a coupon or TM Rewards. Future TM Rewards ownership and revamp remain open.

## 2026-08-23 — FSP is invoice merchandise-price input

Status: Agreed.

Decision: Invoice merchandise discount is derived from the fulfilled batch MRP and Pre-order FSP:

```text
Total Discount = Fulfilled Batch MRP - FSP
```

The invoice may show the consolidated result while retaining Base Discount and Pre-order discount detail internally.

## 2026-08-23 — Taxes and charges require fulfilment validation

Status: Agreed direction; exact authority open.

Decision: Pre-order may supply quoted taxes and charges. Invoice creation must validate whether they remain applicable after fulfilment changes and recalculate fulfilment-dependent values through the authoritative tax/charge service.

## 2026-08-23 — Refunds use immutable sellable-unit snapshot

Status: Agreed direction; reward policy open.

Decision: Product refunds use the original sellable-unit FSP, discount allocation, taxable value, tax, and fulfilled/returned quantity. Refunds must not recompute historical prices from current promotion or reward state.

Open: TM Rewards expiry, re-credit, non-refundable treatment, charge-waiver refunds, and benefit clawbacks.

## 2026-08-24 — Lock the price (FSP), not the discount — final model

Status: Agreed. Aligned individually with multiple stakeholders including CEO and business.

Decision: The single locked invariant per sellable unit is the customer's quoted Final Selling Price (FSP). Carry the quoted MRP alongside it for variance detection. Freeze base discount, coupon discount, and the rest as reference metadata for tax, returns, and reconciliation — post-order never recomputes them and they are not part of the live Pre-order → Post-order handshake.

Derived value: Invoice discount = Fulfilled Batch MRP − FSP. The customer always pays FSP.

Guardrails only: Thresholds live on the two guardrails (higher-MRP absorption cap, lower-MRP floor), never on the happy path. This keeps the Pre-order → Post-order contract to two live fields (FSP + quoted MRP) and removes multiple handshakes.

Supersedes: The earlier "lock BSP" framing where it conflicts. BSP / base discount / coupon are retained as FSP's frozen breakdown, not as the locked invariant. How those fields are physically stored is an engineering-contract decision — kept separate so future coupon logic can be independent rather than applied directly to MRP.

## 2026-08-24 — Lower-MRP: hold FSP, no pass-down or refund

Status: Agreed. Stakeholder + CEO/business alignment. Closes the prior open item "is the no-refund-for-lower-MRP policy accepted?"

Decision: When the fulfilled batch MRP is lower than quoted, hold FSP. The customer continues to pay the locked FSP; the MRP delta is retained — not refunded, not passed down as a reduced bill.

Rationale: The founding principle is "lock the price, not the discount." Passing lower-MRP variance down to the customer means mutating the locked price, which contradicts that principle. Lower-price delight is real and acknowledged, but it must be delivered by quoting the right price up front (MCP / correct-batch picking), not by correcting the price after fulfilment.

Guardrail: If batch MRP falls below FSP (cannot legally sell above MRP) or beyond the configured lower-MRP threshold, it is an exception to be flagged — not a silent adjustment.

Consequence: This removes the post-fulfilment "your bill reduced / savings delight" moment for lower MRP. It does not affect the ordinary pre-order "Your savings" (MRP − FSP discount), which continues unchanged.

## 2026-08-24 — Price Lock is not a variance-correction engine

Status: Agreed.

Decision: Price Lock's job is to hold the customer's committed price stable. Correcting price variance (batch MRP ≠ quoted MRP, up or down) is not Price Lock's responsibility — it belongs upstream at MCP and batch-picking (show the right price, pick the right batch). Absorbing or refunding variance at invoice time is the right problem solved in the wrong place.

Risk / dependency: Formalising Price Lock makes upstream pricing accuracy (MCP, correct-batch picking) more important and more measurable, yet it currently has no owner — teams allow absorption instead of fixing the source. Tracked as a cross-feature dependency that needs an explicit owner.

## 2026-08-24 — Invoice presentation: keep existing columns, drop Old MRP, one blended discount

Status: Agreed. One finance point open (tax treatment of the absorbed amount).

Approach: Do not redesign the invoice. Keep the existing column set as-is (it already reconciles correctly) and make the minimal change:
- Drop the Old MRP column (the 7th column in the current layout).
- Rename "Revised MRP" → "MRP" — it is now the only MRP, i.e. the actual batch MRP being billed.
- Drop the footnote "MRPs may differ due to new GST rules; this invoice shows old and new prices" — meaningless once there is a single MRP column.
- Optional: "MRP Total" may be renamed for clarity (e.g. "Gross MRP" / "MRP × Qty"); not required.

Resulting columns: Sr, Item, Manufacturer, HSN, Batch No., Exp. Date, MRP, Qty, MRP Total, Discount, Taxable Amt, GST%, GST Amt, Total Amt.

Key clarifications (these dissolve the earlier "Total Amount" confusion):
- MRP Total (gross = MRP × qty) and Total Amt (net payable = MRP Total − Discount) are two separate columns that already exist and already reconcile. Nothing is redefined.
- Total Amt = what the customer pays. Verified on the real invoice: 159.26 − 31.87 = 127.39 = 121.32 taxable + 6.07 GST.
- No "Selling Price" column. "Selling Price" / FSP is an internal name only, not shown on the invoice.
- The single Discount already absorbs everything — base + coupon + price-lock absorption. Discount = Batch MRP − FSP, so a higher batch MRP just makes the discount larger; absorption sits inside it. No separate Price Lock / Additional Savings line (reverses CAB).
- GST presentation flexible: keep the per-line GST-amount column or use the CGST/SGST summary block — either is fine as long as the GST amount is shown.

The absorption/delight story ("we covered ₹X") lives on the Price Lock frontend display page, not the tax invoice. Trade-off accepted: absorption is not visible on the downloadable PDF; the app carries that transparency.

Confirm with finance (open): the absorbed amount must stay a pre-tax, taxable-value-reducing discount (as coupon is today) to fold into Discount correctly.

Backend: base/coupon/absorption breakdown still retained as frozen metadata for tax and returns, despite the blended presentation.
