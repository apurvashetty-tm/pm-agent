# Price Lock / Cost Absorption — Working Context

Status: working context, not PRD

Purpose: one place for facts, current-system understanding, proposed direction, decision options, and open questions. Do not treat this as approved requirements.

## 1. Product problem

Customer sees and accepts a price before fulfilment. Batch selection can later produce a different MRP. The customer promise should be the quoted selling price, not a discount percentage applied to whichever batch is eventually picked.

Current cost-absorption implementation protects against increases, but its underlying model still calculates an additional discount from final batch MRP and the locked price. This creates a gap between:

- what customer believes is locked;
- what pricing logic stores;
- what invoice displays;
- what payment/refund logic reconciles.

## 2. Source map

### Local reference material

Folder: `/Users/mac/Documents/CAB`

- `Cost Absorption Solution.md` — system design, MCP/MRP logic, operational gaps, technical direction.
- `Cost Absorption Solution1.md` — calculation and implementation details.
- `Invoice Creation, Batch Splitting & Cost Absorption — Reference.md` — controller trace, batch splitting, `priceLock` consumption, invoice and NetSuite behaviour.
- `Cost AbsorptionFunctional.md` — functional logic and stage-wise lock model.
- `[PRD] Cost Absorption.md` — existing customer experience, communication, order status, invoice, events, and experimentation scope.
- `Cost Absorption- Picker-Checker flow changes.md` — exact-MRP recommendation and picker/checker changes across new and old WMS.

### Design reference

- [Web | Upfront Payment](https://www.figma.com/design/CCdZqYSiZYcRx4o7Y6PsdG/%F0%9F%8C%90--Web-%7C-Upfront-Payment?node-id=91-66395&p=f&t=S9ZkQUFF5fuEiGlu-11)

Design is reference input. It is not yet a decision for the future price-lock model.

## 3. Current implementation — internalised view

Important: sections marked “existing” describe source documents. Sections marked “proposed” describe our current discussion and are not approved decisions.

### Customer and order flow

- Historical model treated pre-invoice price as approximate because final batch/MRP was unknown.
- Payment could happen at cart, later assisted-commerce stages, after invoice generation, or COD.
- Price Lock / cost absorption was introduced to prevent customers paying more when final batch price increased.
- Existing communication includes trust marker, “no extra payment” messaging, savings banners, bottom sheets, order updates, and invoice indicators.
- Existing UX distinguishes price increase, price decrease, and mixed increase/decrease scenarios.

### Pricing model

- A price-lock selling price is determined at a defined order stage.
- System tracks stage-wise MRP, base discount, coupon discount, selling price, quantity, and item changes.
- Lock stage can vary based on order journey and changes such as Doctor/HA call, delivery pincode change, warehouse change, substitution, quantity update, pack-size change, or item addition/removal.
- Existing logic uses thresholds/configuration for absorption decisions.

### Existing lock-stage rule

The source documents define the reference lock stage as:

- HA Call, when HA consultation happened.
- Doctor Call, when no HA call happened but Doctor consultation happened.
- Order Placement, when neither HA nor Doctor consultation happened.

This is existing behaviour. “Lock at cart” remains a proposed policy question, not an established fact.

### Existing price-change scope

Cost absorption is applicable for several same-composition changes, including:

- Same-product batch change.
- Same-product pack-size change.
- Same-composition variant change.
- Substitute replacement in defined same-composition cases.
- Some pack-size and quantity changes, using explicit upper-bound quantity logic.

Known exclusions include selected OG replacements, different-composition substitutions, and certain branded/product replacements. Price Lock cannot be treated as a blanket rule for every order modification.

### Fulfilment model

- Picking and checking need MRP-level awareness when multiple batch MRPs exist.
- New WMS checks rack-level inventory; old WMS uses total Netsuite inventory.
- Exact-MRP recommendation is shown only when inventory conditions support it.
- Invoice creation can split one ordered SKU across multiple final batches.

### Invoice and finance model

- Batch split happens during invoice creation.
- Existing downstream logic reads `priceLock` / `priceLockDiscount` per final batch or line.
- Current implementation converts the difference into an additional discount before the NetSuite call.
- Invoice generation renders this as an extra discount/savings line at item and/or order level.
- Wallet/FCA and NetSuite reconciliation are involved.
- Invoice representation remains an explicit product/tech/finance decision point.

### Post-order experience

- Before Box Verified: existing order-status experience largely remains unchanged.
- After Box Verified: customer may see trust marker, savings banner, order updates, price-change summary, and item/batch-level details.
- Higher final price: communicate amount avoided/absorbed.
- Lower final price: communicate savings or reduced bill.
- Mixed final prices: current UX shows increases under Price Lock Savings and decreases under price reduction/savings.

### Existing commercial and financial dependencies

Locked pricing also affects:

- Coupon minimum-order-value validation.
- Coupon discount calculation.
- Delivery-charge applicability.
- Cash-handling-charge applicability.
- Substitution pricing during Doctor, HA, and CSR calls.
- Return and refund calculations.
- Recovery of Price Lock savings during full or partial returns.
- GST reversal on recovered Price Lock savings.

These dependencies must remain in scope for policy decisions, even if customer UX focuses only on selling price.

### Existing experiment model

Current source documents define an order-level experiment:

- Variant A: control / existing behaviour.
- Variant B: full Price Lock and detailed UI implementation.
- Variant C: Price Lock with minimal UI changes.

Variant assignment persists for the full order lifecycle, even if the customer later enters another experiment group. Any future pricing-policy experiment must preserve this lifecycle consistency or explicitly replace it.

## 4. Proposed direction under discussion

Move from:

> Lock discount percentage and recompute selling price from final MRP.

To:

> Lock customer’s quoted selling price at the applicable order stage.

Implication: final batch MRP should no longer determine customer’s locked unit selling price. It should determine operational, margin, invoice, and reconciliation adjustments.

This is a proposed policy change. It may require changing or removing current absorption thresholds. It is not yet approved.

The precise promise still needs definition:

- Cart quote only.
- Order-placement quote.
- Last confirmed quote after Doctor/HA call.
- Price-lock reference determined by current journey-specific stage.

## 5. Concrete example

Quoted at cart:

- MRP: ₹100
- Discount: 20%
- Selling price: ₹80
- Quantity: 10
- Locked merchandise value: ₹800

Possible fulfilment:

- 5 units at actual MRP ₹95
- 5 units at actual MRP ₹105

Questions this creates:

- Does customer-facing commercial bill continue to show ₹100 MRP, 20% discount, ₹80 selling price for all units?
- Does statutory invoice show actual batch MRP ₹95/₹105?
- Is the difference represented as an additional discount / Price Lock adjustment?
- Is lower-MRP benefit refunded, shown as savings, or netted against higher-MRP absorption?
- What is the correct behaviour when one batch is lower and another higher?

## 6. Decision space — brainstorm all viable models

### Model A — Preserve quoted values everywhere

Customer view bill and invoice show quoted MRP, discount, and selling price. Actual batch detail stays internal.

Pros: strongest customer continuity; simple promise.

Risks: may fail statutory, tax, audit, or batch-traceability requirements.

### Model B — Actual batch invoice plus Price Lock adjustment

Invoice shows actual batch/MRP details. Separate discount/adjustment reconciles total to quoted locked price.

Pros: preserves actual fulfilment truth and customer payable total; closest to current system direction.

Risks: invoice language and accounting treatment need approval; mixed-batch presentation can be complex.

### Model C — Separate commercial bill and statutory invoice

Commercial view bill preserves quoted values. Statutory invoice shows actual batches and an approved adjustment.

Pros: cleanly separates customer promise from legal/financial document.

Risks: customers may see two different representations; terminology and support training matter.

### Model D — Actual batch invoice with adjusted discount percentage

Use actual MRP but alter discount amount/percentage so final price equals locked selling price.

Pros: fits existing invoice structure.

Risks: discount percentage becomes artificial; per-batch discount may be confusing; breaks the “discount is not the promise” principle if treated as primary truth.

### Model E — Actual batch invoice with locked selling-price line

Show actual batch/MRP, then show a “Locked selling price” or “Price Lock adjustment” line.

Pros: makes price promise explicit; avoids fake discount percentage.

Risks: new invoice semantics; needs Finance/Tax/Legal sign-off.

### Model F — Refund every lower-MRP variance

If final actual selling value is below locked value, refund difference. Higher variance is absorbed.

Pros: symmetric customer fairness; easy principle.

Risks: refund volume, payment-mode complexity, rounding, COD handling, and margin impact.

### Model G — Net mixed-batch variance at order level

Higher and lower batch variances offset each other. Refund only net reduction.

Pros: simpler finance/refund behaviour; prevents over-refunding when one batch offsets another.

Risks: weaker item-level transparency; customer may expect lower-MRP unit benefit separately.

### Model H — Refund lower variance at item/allocation level

Each lower-MRP allocation produces its own refund; higher allocations remain absorbed.

Pros: mathematically transparent and fair per unit.

Risks: many refund events/lines; poor experience for multi-batch orders; operational overhead.

### Model I — Lower-MRP variance as savings only, no refund

Show reduced price/savings but do not return money after payment.

Pros: operationally simple.

Risks: unacceptable for prepaid orders if customer paid more; promise and fairness issue.

### Model J — Restrict price lock to medicines / eligible categories

Apply different rules to SKO, OTC, FMCG, or 0%-discount products.

Pros: controls operational and financial exposure.

Risks: inconsistent customer promise; exception complexity; must be clearly communicated.

## 7. Scenario matrix to resolve

| Scenario | Locked customer charge | Actual batch outcome | Candidate handling |
|---|---:|---|---|
| Same MRP | ₹80/unit | ₹100 MRP | No adjustment |
| Higher MRP | ₹80/unit | ₹105 MRP | Absorb difference; no extra payment |
| Lower MRP | ₹80/unit | ₹95 MRP | Refund or approved savings treatment |
| Mixed higher/lower | ₹80/unit | ₹95 + ₹105 | Item-level or net order-level reconciliation |
| Quantity 10, short 2 | ₹80/unit | 8 fulfilled | Charge 8 × ₹80; refund 2 × ₹80 |
| 0% discount SKO | ₹100/unit | ₹95 MRP | Decide whether lower variance refunds |
| Pack-size change | Depends on locked item | New SKU/pack | Treat as order modification, not simple batch variance |
| Substitution | Depends on lock stage | Different product | Separate substitution pricing rules |
| COD | Pay locked amount | Lower variance | Refund mechanism before/after delivery needed |
| Upfront payment | Already paid locked amount | Lower variance | Automated refund or explicit exception required |

## 8. Critical distinctions

### Customer promise vs document truth

Customer promise: amount customer pays must not increase after lock.

Document truth: actual batch, MRP, quantity, tax, and fulfilment must remain auditable and legally valid.

These may require two representations: commercial view bill and statutory invoice.

### Price lock vs order modification

Batch change alone should not change customer locked selling price.

Substitution, pack-size change, item addition/removal, quantity change, delivery pincode change, and warehouse changes may create a new pricing event with separate rules.

### Price protection vs savings delight

Higher price avoided and lower price realised are different events. Mixed orders need one aggregation rule, one customer message, and one financial reconciliation rule.

### Price Lock vs refund recovery

Existing invoicing stores Price Lock savings at SKU level and recovers them proportionately during partial returns or fully during full returns before calculating the final refund. Any new locked-selling-price model must preserve or deliberately replace this behaviour.

### Customer promise vs threshold policy

Current cost absorption permits increases only within configured thresholds. A hard selling-price promise would eliminate or redefine that gate. This is a business-policy decision, not a small formula change.

### Customer experience vs eligibility disclaimer

Existing customer communication includes exclusions and a configurable disclaimer. Current source material describes Price Lock validity for seven days from order placement, subject to product availability and applicable regulations. Future messaging must not promise more than approved eligibility rules.

## 9. Known contradictions / risks in current material

- “Price Lock” is described as selling-price lock, but implementation represents it as additional discount derived from final MRP.
- Customer view bill, invoice, and post-order savings UI may use different notions of initial and final price.
- Existing experience celebrates lower MRP as savings, but upfront payment makes refund treatment more important.
- Current rules include thresholds for absorption; proposed promise may require removing or redefining thresholds.
- Stage-wise locks complicate the simple statement “price quoted at cart is always locked.”
- Batch-level actual price and customer-level commercial price need explicit data ownership.
- Existing multi-batch UI handles mixed increases/decreases, but future refund semantics are not yet defined.
- 0%-discount SKO/OTC/FMCG behaviour is not clearly specified.
- Existing returns logic and GST recovery are not represented deeply enough in this working context.
- Existing experiment assignment is order-level and persists through the order lifecycle; future policy changes must preserve this property or explicitly replace it.
- Existing customer promise includes exclusions and a seven-day validity disclaimer; “always locked” language may conflict with this.

## 10. Questions for next working session

1. What exactly is the customer promise: cart quote, order placement quote, last confirmed quote after Doctor/HA call, or current journey-specific lock stage?
2. Which order modifications are allowed to create a new lock?
3. Do we want lower-MRP refund, savings display, or both?
4. For mixed batches, should variance be netted or calculated per allocation?
5. Is “view bill” commercial documentation or statutory invoice?
6. Can Finance/Tax/Legal approve an explicit Price Lock adjustment line?
7. Should customer-facing MRP remain quoted MRP, actual MRP, or both?
8. Which categories are eligible, especially 0%-discount SKO/OTC/FMCG?
9. What does upfront payment change in payment, refund, and order-modification logic?
10. Which current thresholds remain valid under a hard selling-price promise?
11. Which existing exclusions remain under a selling-price lock?
12. How will returns recover or recalculate Price Lock adjustments?
13. How will coupon MOV, delivery charge, and cash-handling charge use locked values?
14. Does seven-day validity remain, change, or disappear?

## 11. Recommended next step

Do not write requirements yet.

First decide three policy questions:

1. Lock point: what event creates the final customer price promise?
2. Lower-price policy: refund, savings, or both?
3. Document model: quoted commercial view, actual statutory invoice, or one reconciled document?

Then test each policy against the scenario matrix, current invoice implementation, payment modes, fulfilment flows, and compliance constraints.

Also validate against current return recovery, coupon/charge calculations, experiment assignment, eligibility exclusions, and seven-day disclaimer rules.
