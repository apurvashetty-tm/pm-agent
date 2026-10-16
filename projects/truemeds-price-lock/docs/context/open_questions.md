# Price Lock — Open Questions

Only unresolved decisions. Move resolved items to `decision_log.md` and `project_truth.md`.

## Discount Threshold

- [Open] What exact amount does the Pre-order Discount Threshold measure: base discount, total discount, or another defined discount amount?
- [Open] Is the Pre-order Discount Threshold an amount, percentage, or both?
- [Open] What technical field carries the threshold basis and value?

## Lower MRP

- [Resolved 2026-08-24] Pass-down / refund on lower MRP: hold FSP, no refund, no auto-reduction. Delight delivered upstream (MCP / correct-batch picking), not at invoice time. See decision_log.
- [Open] What alert, SLA, and status does Post-order use when lower variance exceeds the lower-MRP threshold (guardrail)?
- [Open] Confirm handling when Fulfilled Batch MRP is less than or equal to FSP (legal floor — cannot sell above MRP).
- [Open] Exact lower-MRP threshold value/basis. Note: the "5%" carried earlier has no basis in CAB (CAB's only "5" is the ₹5 display floor Y1/Y2); this threshold is a new product/fairness knob to be set deliberately.

## Rounding

- [Open] Confirm ROUND_HALF_UP or another mode with Engineering/Finance.
- [Open] Confirm tax rounding at line and invoice levels.
- [Open] Confirm deterministic residual allocation across batch rows.

## Tax and charges

- [Open] Which tax service is authoritative when Pre-order and fulfilled-line values differ?
- [Open] Tax treatment for delivery/shipping, packaging, and cash-handling charges.
- [Open] Which charges are fixed at Pre-order and which must be recalculated after fulfilment changes.
- [Open] Whether each charge is tax-inclusive or tax-exclusive.
- [Open] Required validation between Pre-order quoted taxes and invoice taxes.

## Upstream variance ownership (dependency, not Price Lock scope)

- [Open] Who owns reducing price variance at source — MCP accuracy and correct-batch picking? Currently unowned; teams allow absorption instead of fixing it. Price Lock formalisation makes this more urgent and measurable. Needs an explicit owner.

## Cross-feature policy

- [Open] Internal fulfilment changes that reduce AOV/MOV or remove coupon/reward/delivery benefits.
- [Open] Customer copy when BSP stays fixed but other benefits change.
- [Open] Exact dependency contract with Payment/Refund and Returns.
- [Open] Future TM Rewards ownership: Pre-order or post-order.
- [Open] TM Rewards expiry, re-credit, non-refundable treatment, and cancellation/return policy.

## Price inputs and invoice

- [Resolved 2026-08-24] Invoice presentation: keep existing columns; drop Old MRP (7th column), rename Revised MRP → MRP, drop the GST old/new footnote. One blended Discount; no separate Price Lock line; no "Selling Price" column (internal name only). Total Amt = net payable (already the case). See decision_log.
- [Resolved 2026-08-24] GST presentation flexible — per-line column or summary block, either is fine.
- [Open — finance] Absorbed amount must remain a pre-tax, taxable-value-reducing discount to fold into the single Discount line.
- [Open] Field contract distinguishing quoted MRP from fulfilled batch MRP.
- [Open] Exact backend schema for Pre-order discount source and sellable-unit allocation.

## Returns

- [Open] Exact partial-return allocation when one line contains multiple sellable units.
- [Open] Refund treatment for Pre-order discount components after the product refund snapshot is applied.
- [Open] Refund handling for charge waivers and fulfilment-dependent charges.

## Explicitly out of current scope

- Problem Solver SOP and alternate-batch selection implementation.
- TM Rewards revamp and ownership redesign.
- TM Rewards expiry/re-credit/refund policy.
- Charge-waiver refund policy.
- Coupon/reward rule redesign beyond the current Pre-order selection.
- Margin Floor and vendor-funded discount logic.
