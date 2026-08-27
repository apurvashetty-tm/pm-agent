# PRD: Post-order Price Lock — Selling Price Protection

## 1. Summary

Truemeds currently locks the discount percentage shown when an order is placed. This can change the customer’s final selling price when the picked batch has a different MRP. The new model will lock the customer’s quoted selling price at cart/order placement, regardless of the batch eventually picked or when payment is collected.

Post-order customer views must preserve the original commercial promise. Operational and statutory documents must still represent the actual picked batch and MRP, subject to validation with Finance, Tax, Legal, and Compliance.

## 2. Contacts

| Stakeholder | Role | Responsibility |
|---|---|---|
| Product | Post-order board | Product scope, prioritisation, acceptance |
| Engineering | Order, pricing, invoice, refund systems | Price calculation, persistence, integrations |
| Finance / Tax | Billing and reconciliation | Invoice treatment and accounting correctness |
| Legal / Compliance | Healthcare and consumer compliance | Validate customer promise and invoice presentation |
| Fulfilment / Operations | Picking, packing, exception handling | Batch variance and operational workflow |
| Customer Support | Customer issue resolution | Copy, dispute handling, refund visibility |

## 3. Background

### Current state

- Cart and pre-order pages show an approximate price.
- Payment may happen at cart, after order confirmation, after invoice generation, or through COD.
- Invoice is generated after picking and packing, when the final batch and MRP are known.
- Existing Price Lock / cost absorption locks discount percentage.
- If picked-batch MRP is higher, Truemeds absorbs the difference.
- If picked-batch MRP is lower, the same discount percentage is applied and the customer receives a refund for the difference.

### Problem

The customer does not buy a discount percentage. The customer buys at the selling price shown and accepted at cart/order placement. Recalculating price from a fixed discount percentage after picking creates three problems:

1. Customer-facing price promise is not truly locked.
2. View bill details can differ from what the customer saw and paid.
3. Lower-MRP batches create avoidable refund and support workflows, especially when orders contain multiple quantities or line items.

### Why now

Price Lock has already established a customer promise. The next step is to make that promise mathematically and operationally correct across payment timing, batch allocation, invoices, refunds, and post-order communication.

## 4. Objective

### Objective

Ensure every order retains the exact selling price quoted at cart/order placement, independent of picked batch MRP and payment timing, while preserving billing, tax, audit, and fulfilment correctness.

### Goals

- Lock quoted unit selling price and order-level payable amount.
- Preserve quoted MRP, discount, and selling price in customer-facing view bill wherever this is the commercial order view.
- Absorb higher picked-batch cost without charging the customer more.
- Identify and automate eligible lower-MRP refunds.
- Support mixed batches and partial quantities.
- Keep pricing consistent across prepaid, postpaid, and COD orders.
- Provide auditability from quote snapshot to picked batch to final adjustment.

### Non-goals

- Changing medicine substitution or fulfilment selection logic.
- Redesigning all invoice templates in MVP.
- Reworking payment collection journeys except where required to enforce locked price.
- Defining legal invoice treatment without Finance, Tax, and Legal approval.

### Key results

Targets require baseline measurement before launch. Proposed success measures:

- 100% of eligible orders retain locked customer payable price after fulfilment.
- 0 customer charges above locked payable amount due to batch-MRP variance.
- 100% of mixed-batch orders have traceable quantity-level price reconciliation.
- Reduce manual lower-MRP refund cases by an agreed target after baseline review.
- Reduce price-related post-order contacts and disputes after rollout.
- No unresolved invoice, tax, or ledger reconciliation defects during pilot.

## 5. Market Segment(s)

Primary segment: customers who place medicine, OTC, FMCG, or other eligible orders where final batch MRP can differ from the MRP shown before fulfilment.

Important subsegments:

- Prepaid customers: payment collected using locked price.
- Postpaid customers: amount due at later payment step must remain locked.
- COD customers: payable amount at delivery must remain locked.
- Mixed-batch orders: one SKU fulfilled using multiple MRPs.
- Zero-discount SKO/FMCG/OTC items: lower picked MRP can create a refund even when discount is 0%.

## 6. Value Proposition(s)

### Customer job

“When I place an order, I need confidence that the price shown and accepted will not change before delivery.”

### Customer gains

- Clear and reliable price promise.
- No surprise increase after picking or invoicing.
- Consistent order history and bill visibility.
- Automatic refund when fulfilment creates a lower payable value, where applicable.

### Business gains

- Stronger trust in Price Lock.
- Fewer pricing disputes and support contacts.
- Lower manual refund workload.
- Cleaner pricing, payment, and fulfilment reconciliation.
- Better audit trail for variance absorption.

## 7. Solution

### 7.1 Pricing principle

At order placement, persist an immutable commercial quote snapshot:

- Quoted MRP per unit.
- Quoted discount amount and percentage.
- Quoted unit selling price.
- Ordered quantity.
- Locked line-item payable amount.
- Order-level payable amount.
- Price-lock eligibility and version.
- Quote timestamp and source surface.

The locked unit selling price is the customer promise. The discount percentage is descriptive metadata, not the post-order pricing rule.

### 7.2 Post-order pricing rules

For every fulfilled unit:

`Customer charge = locked quoted selling price`

The picked batch MRP must not increase the customer charge.

#### Higher picked MRP

- Charge locked quoted selling price.
- Truemeds absorbs the difference between actual batch economics and locked customer price.
- Do not recompute customer discount from actual MRP.
- Do not request additional payment because of batch-MRP increase.

#### Lower picked MRP

- Customer should not be charged more than the amount supported by the final fulfilment and approved pricing rules.
- Calculate variance between locked commercial value and final actual value.
- Trigger refund automatically where refund policy and invoice treatment permit.
- If automation is not available in MVP, create an operational exception with reason, amount, and SLA.

#### Same picked MRP

- No adjustment.
- Preserve locked quote and normal fulfilment flow.

#### Mixed batches for one SKU

- Allocate picked quantities by batch.
- Maintain quantity, actual batch MRP, and locked unit selling price for each allocation.
- Customer charge remains the sum of locked unit selling prices for fulfilled quantity.
- Reconciliation must show total variance, even if customer view does not expose batch-level complexity.

#### Short fulfilment or cancellation

- Charge only fulfilled quantity at locked unit selling price.
- Refund unfulfilled quantity using locked unit selling price and applicable payment rules.
- Do not use actual batch MRP to calculate customer refund.

#### Zero-discount SKO / OTC / FMCG item

- Treat 0% discount as a valid locked price, not as an exemption from price protection.
- If actual picked MRP is lower and customer paid the higher locked amount, flag for refund calculation.
- MVP may use an operational queue if automated refund is not yet safe.

### 7.3 View bill and invoice treatment

#### Customer-facing view bill

For the commercial order view, show the original quote snapshot:

- Same quoted MRP.
- Same quoted discount amount and percentage.
- Same quoted selling price.
- Same quantity and line-item total, adjusted only for fulfilment quantity/cancellation.
- Price Lock message where applicable.

Do not replace the quoted values with picked-batch MRP values in the customer’s commercial order view.

#### Statutory invoice

The invoice must show actual batch, quantity, MRP, tax, and other fields required by applicable rules. Finance, Tax, and Legal must confirm the presentation model.

Preferred design to validate:

- Show actual picked-batch details for statutory correctness.
- Add an explicit “Price Lock adjustment” or equivalent discount/absorption line to reconcile invoice total to locked customer payable amount.
- Ensure invoice total, payment captured, refund, ledger, and order total reconcile exactly.

The product must not assume that customer-friendly view bill and statutory invoice are the same document.

### 7.4 Refund handling

MVP:

- Calculate refund at line/allocation level.
- Aggregate refund at order level.
- Store refund reason: lower-MRP fulfilment, short fulfilment, cancellation, or other approved reason.
- Show refund status to customer.
- Create an exception queue when automated refund fails or eligibility is unclear.

Future:

- Fully automated refund for lower-MRP variance.
- Customer-visible item-level explanation for mixed batches.
- Proactive notification with amount and expected refund timeline.
- Rules for wallet, card, UPI, COD, and split payments.

### 7.5 Data and audit requirements

Persist:

- Original quote snapshot, immutable after order placement.
- Payment events and amounts.
- Picked batch and actual MRP per quantity allocation.
- Locked price used for customer charge.
- Price-lock adjustment amount.
- Refund amount, trigger, status, and payment reference.
- Manual override actor, reason, and timestamp.

Every order must answer: what did we quote, what did we pick, what did we charge, what did we absorb, and what did we refund?

### 7.6 Assumptions

- Customer price promise begins at order placement, not invoice generation.
- Quote snapshot can be stored reliably before fulfilment changes the order.
- Pricing service, order service, invoice service, payment service, and refund service can exchange a stable price-lock identifier.
- Finance and Tax will approve an invoice reconciliation approach.
- Existing Price Lock communication can be updated without changing its customer promise.

## 8. Edge cases

- One SKU split across higher, equal, and lower MRP batches.
- Multiple line items with different price variances.
- Partial fulfilment, cancellation, or substitution.
- Payment collected in multiple stages.
- COD amount after refund eligibility is identified.
- Payment failure or retry after price lock.
- Duplicate invoice or refund event.
- Batch MRP missing, invalid, or changed after pick confirmation.
- Customer service manual adjustment.
- Order modification after quote snapshot.
- Price-lock eligibility changes between order placement and fulfilment.

## 9. Metrics and instrumentation

Track by order, line item, quantity allocation, payment mode, and fulfilment centre:

- Orders with price lock.
- Orders with higher, lower, or equal MRP variance.
- Total absorbed amount.
- Total refund amount.
- Refund automation success rate.
- Manual exception rate and ageing.
- Price-related support contact rate.
- Customer dispute rate.
- Invoice reconciliation failure rate.
- Difference between locked payable, captured payment, invoiced amount, and refunded amount.

## 10. Dependencies and risks

### Dependencies

- Pricing and order services.
- Picking and batch allocation data.
- Invoice generation and document rendering.
- Payment collection and refund systems.
- Customer app order details and notifications.
- Finance ledger and reconciliation.
- Operations exception tooling.

### Risks

- Invoice cannot legally display the customer view bill format.
- Mixed-batch allocation creates rounding or quantity reconciliation errors.
- Refund triggered twice because of retries or duplicate events.
- Customer sees different totals across order details, invoice, payment screen, and refund screen.
- Margin leakage if price-lock eligibility or adjustments are applied incorrectly.
- Manual operational queue grows faster than fulfilment capacity.

## 11. Rollout

### MVP

1. Persist immutable quote snapshot.
2. Use locked selling price for all customer charges after order placement.
3. Support higher, lower, equal, mixed-batch, partial-fulfilment, and zero-discount scenarios.
4. Preserve original commercial values in view bill.
5. Add price-lock adjustment and reconciliation mechanism, pending Finance/Tax/Legal approval.
6. Provide manual exception handling for lower-MRP refunds and automation failures.
7. Add end-to-end audit and reconciliation metrics.

### Later phases

- Automated lower-MRP refunds across payment modes.
- Customer-visible batch-level explanation.
- Automated proactive notifications.
- Advanced margin and variance controls.
- Self-serve support resolution.

### Rollout approach

- Shadow calculation against current cost-absorption logic.
- Internal and test-order validation across all payment modes.
- Limited fulfilment-centre pilot.
- Monitor invoice, payment, refund, margin, and support defects.
- Expand only after reconciliation and compliance sign-off.

## 12. Open questions

1. What exactly is the legal/statutory invoice representation when actual batch MRP differs from locked selling price?
2. Should lower-MRP variance always be refunded, or can approved commercial rules retain any portion?
3. Is Price Lock applied to all SKOs, OTC, and FMCG products, including 0% discount items?
4. What is the source of truth when order quantity, substitution, or price changes after placement?
5. How should COD refunds work before or after delivery?
6. What rounding rule applies at unit, allocation, line, and order level?
7. Which customer document is called “view bill,” and how is it distinguished from the statutory invoice?
8. What refund SLA and customer copy should apply?
9. What margin thresholds require operational review or approval?

## 13. Acceptance criteria

- Customer never pays more than locked payable amount because of picked-batch MRP variance.
- Customer-facing view bill retains original quoted MRP, discount, and selling price for fulfilled quantity.
- Mixed-batch order reconciles quantity and amount without rounding loss.
- Higher-MRP variance records absorption amount.
- Lower-MRP variance records refund amount and status.
- Zero-discount lower-MRP case is detected and routed correctly.
- Payment, invoice, order, refund, and ledger totals reconcile.
- Duplicate fulfilment, invoice, and refund events are idempotent.
- Finance, Tax, Legal, Operations, Support, and Engineering approve launch readiness.
