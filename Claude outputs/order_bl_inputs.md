# Price Lock — Order BL Engineering Inputs

Status: Pre-build inputs for the Order BL (post-order) implementation starting the week of 2026-09-29. Not a full PRD. Consolidates the 2026-09-25 model brainstorm into decisions the eng team should build against.

**This supersedes the 2026-08-24 decision "Lower-MRP: hold FSP, no pass-down or refund."** Per CXO/business direction (25 Sep), refunds/pass-down are restored — because that is what earns customer trust, which was the whole point of Cost Absorption (CAB). The task is to deliver that outcome **without** CAB's complexity.

---

## 1. The model in one line

**The customer pays `MIN(promised price, actual price)`.** Never more than we promised; if the fulfilled batch is genuinely cheaper, they benefit. Everything below is how that one rule is computed, who computes it, and how it shows up.

## 2. Core principle

> **Price Lock only holds the price against changes the customer did not make.** Warehouse/system changes are protected against (cap the customer at the promise, absorb overage, refund/pass-down underage). Anything the customer themselves does — swap an item or edit the order — reprices under normal rules.

Two design commitments that flow from this and must not be violated:

- **The booked selling price (FSP) is frozen end-to-end and is never mutated downstream.** No re-pricing propagates into pricing/catalogue systems (this is CAB's root complexity — the batch split rewriting `product_details.price` across ~11 services). Variance is delivered as a **single derived adjustment computed once in Order BL**, not as a price rewrite.
- **Order BL is the only decision-maker. WMS is a dumb service** that reports what physically happened and executes what Order BL returns. WMS computes no prices.

## 3. Consent taxonomy — how Order BL routes every change

Order BL derives "consent" from the **origin** of the change event (which channel/actor triggered it), not a manually set flag.

| Bucket | Trigger (examples) | Origin | Order BL behaviour |
|---|---|---|---|
| **A. System / warehouse change** | Pack-size change, variant change, warehouse allocation change, JIT-procured batch | Warehouse ops | **Protect.** Cap at promise; absorb up / refund down; preserve entitlements (free shipping). |
| **B. Customer item swap** | Substitution via HA today; app / other channels in future | Customer channel | **Reset the price baseline** to the newly-agreed price (no absorb/refund on the swap itself). It's a swap, not a reduction, so **free-shipping entitlement is preserved.** |
| **C. Customer order-parameter edit** | Address change, payment-method change (e.g. online→COD), quantity change | Customer channel | **Standard rules apply; new charges are legitimate** (cash-handling on COD, shipping if AOV drops below the free bar, tax-zone changes on address). **No Price Lock protection.** |

One-liner for the spec: *Price Lock holds the price against changes the customer didn't make. Anything the customer does reprices normally — swaps keep the shipping entitlement; parameter edits don't.*

Open confirm: B vs C both are customer-initiated but treated differently on purpose (generous on medical swaps, neutral on order edits). Confirm this asymmetry is intended.

## 4. What "the promise" is, and when it's set

The promise is locked per **sellable unit** (one orderable SKU/pack — strip/bottle/box) at the **price-lock stage**, using the existing precedence: **HA consultation → Doctor consultation → Order placed** (most recent applicable). It carries:

```
quoted_mrp              MRP shown to the customer at lock
fsp                     Final Selling Price — the price the customer agreed to pay per unit (the promise)
normalized_rate         fsp per base unit (per tablet / per ml) — needed for pack-size/variant compares
quantity
entitlements            order-level status the customer qualified for at lock (e.g. free_shipping = true/false)
prepaid_amount          if prepaid, what was collected upfront (incl. its GST)
```

Baseline resets to a new agreed price on a **Bucket B** swap, and reprices under standard rules on a **Bucket C** edit. It is otherwise immutable.

## 5. The calculation (Order BL, per line)

For a **Bucket A** change:

```
1. If pack size / variant changed → work in normalized (per-base-unit) terms:
      promised_equiv = normalized_rate × delivered_base_units
   else:
      promised_equiv = fsp × quantity

2. actual_price = selling price computed on the ACTUAL billed batch MRP(s)
                  using the frozen discount structure  (batch rows sum at the line level)

3. target      = MIN(promised_equiv, actual_price)     ← the whole model
   absorbed    = max(0, actual_price − target)         ← company cost (increase case)
   refund_due  = max(0, prepaid_amount − target)       ← customer benefit (decrease, prepaid)

4. Guardrails (see §11): if absorbed exceeds the higher-MRP cap, or actual MRP ≤ FSP
   (cannot sell above MRP), or lower variance beyond the floor → route to Problem Solver,
   do not silently adjust.
```

Multi-batch: one SKU split across batches stays **one comparison at the line level**; the invoice still shows one row per physical batch (legal/statutory requirement, unchanged).

Open decisions for the contract: whether the "frozen discount structure" recomputes as a flat amount or a percentage against the actual MRP; and rounding mode + deterministic residual allocation across batch rows.

## 6. Responsibilities

**WMS (sensor + actuator, no decisions):**
- Reports fulfilment facts to Order BL: actual batch MRP(s), pack delivered, substitution done, quantities, and the change origin.
- Executes invoice creation using the exact line values Order BL returns. Prints batch-level rows at real MRPs.

**Order BL (the brain — the new post-order layer):**
- Holds the frozen promise.
- Routes each change by consent bucket (§3).
- Runs the calculation (§5), applies guardrails, computes the exact invoice numbers and the refund amount.
- Calls Payment's existing refund API when a refund is due.
- Emits the MCP feedback event.
- Writes the reconciliation snapshot.

**Payment service:** exposes an existing refund API; Order BL calls it. No new refund rail is built.

**MCP / picking:** consumes the feedback event to reduce future variance at source.

## 7. End-to-end flow

```
1. PRE-ORDER → Order BL   Freeze the promise (§4). Prepaid: collect promised amount.

2. CHANGE EVENT → Order BL  Tagged with origin → route to Bucket A / B / C (§3).
                            B → re-quote & reset baseline.  C → standard reprice.  A → protect ↓

3. WMS → Order BL   "Here's what I physically did": actual batch MRP(s), pack,
                    substitution, quantities.  No pricing.

4. ORDER BL         normalize → target = MIN(promise, actual); absorbed / refund_due;
                    guardrail check; compute exact invoice line values.

5. ORDER BL → WMS   "Create the invoice with THESE numbers."  WMS executes.

6. ORDER BL → PAYMENT   refund API(order, line, refund_due, reason="price_lock_mrp_deviation")
                        only if refund_due > 0.  (Increase case: refund_due = 0, no call.)

7. ORDER BL → MCP   feedback event {quoted_mrp, billed_mrp, delta, reason, sku, batch}.

8. ORDER BL stores   reconciliation snapshot (§10).
```

## 8. Tax treatment — "MRP deviation" (already blessed)

Because the physical batch genuinely has a different printed MRP, the invoice legitimately bills at the real batch MRP and GST simply sits on the resulting taxable value. The Price Lock amount is a **pre-tax, taxable-value-reducing trade discount** — mechanically identical to a coupon.

This is **already live in CAB** (which reduces taxable value and reverses GST "like a coupon"), so finance has accepted the principle. Our version is *less* to approve, not more: we **fold the amount into the existing discount against the real MRP** instead of CAB's separate "Price Lock Savings" GL line. The only remaining finance touch is signing off on the presentation simplification, not a new tax object.

- Increase: bill real (higher) MRP, enlarge the discount so taxable value = promised price; GST on the promised price.
- Decrease: bill real (lower) MRP; taxable value and GST drop; the refund carries its proportional GST back.

## 9. Presentation — invoice and app (one simple, symmetric surface)

Collapse CAB's separate increase/decrease/pack-size/replace/batch screens into **one** representation, identical in shape regardless of direction or reason.

**Invoice (statutory PDF):**
- Keep the existing columns. `Discount = actual batch MRP − final price paid` already contains the Price Lock effect automatically. **No new column. No separate Price Lock line.**
- For visibility (CXO wants it seen), at most **one labelled line** in the bill-details breakdown, same label family up or down: e.g. "Price Lock — you paid ₹0 extra" / "Price Lock — ₹X back to you."

**App:**
- One bottom sheet, **one line per changed item, one net number**, same layout every time. The reason (pack size / batch / substitute) is a small caption under the item, not its own screen.

## 10. Refund + reconciliation

- **Prepaid + refund_due > 0** → Order BL calls Payment's refund API to the original method, records refund id + status.
- **COD** → WMS bills the (lower/capped) `target` at delivery; no refund needed.
- **Increase** → customer already paid the promise; nothing owed either way; only `absorbed` is recorded.
- **Reconciliation snapshot per order/line (immutable):** `{quoted_mrp, actual_mrp, promised, actual, customer_paid, absorbed, refund_due, refund_id, reason, origin_bucket}`. A daily reconciliation sums absorbed + refunded and matches refund_ids against Payment — one adjustment number per line, not CAB's multi-entity trace.
- **Returns interaction (reuse CAB logic):** on a return, **recover the Price Lock benefit first** (proportional to returned qty) from the stored snapshot, then compute the return refund — so a Price Lock refund and a later return don't double-pay.

## 11. Guardrails & exceptions

- **Higher-MRP absorption cap:** do not absorb unboundedly. (CAB's live bug: a null threshold silently absorbs *unlimited* amounts.) Beyond the cap → route to Problem Solver instead of auto-absorbing.
- **Legal floor:** if actual batch MRP ≤ FSP (cannot sell above MRP) → exception, flag; do not adjust silently.
- **Lower-MRP floor:** variance beyond the configured floor → flag as exception rather than auto-refund.
- **Problem Solver is routing only.** Order BL flags; SOP, alternate-batch selection, and resolution policy are separate scope.
- **Threshold/cap values are open** (see §13) — but the design must fail safe (never "absorb unlimited on null config").

## 12. Entitlement preservation (free shipping)

The promise includes the free-shipping status the order qualified for at lock.

- **Bucket A (warehouse) or Bucket B (customer swap):** a resulting AOV drop **does not** revoke free shipping. Don't punish a warehouse change or a medical swap with surprise shipping.
- **Bucket C (customer parameter edit, incl. voluntary qty reduction):** standard rules — free shipping may legitimately be lost, cash-handling may apply on COD, etc.

Open confirm: is free-shipping preservation unconditional on A/B, or capped (e.g. only within some shortfall)?

## 13. MCP feedback loop

Every non-zero adjustment (absorb or refund) is a signal that the quote/pick was wrong. Order BL emits an **async, non-blocking** event to MCP/picking: `{quoted_mrp, billed_mrp, delta, reason, sku, batch}`. This makes upstream pricing accuracy measurable and is the *real* long-term fix for variance (Price Lock is the safety net, not the correction engine). This finally gives the long-unowned "who reduces variance at source" dependency a concrete data feed.

## 14. Full use-case matrix

| # | Scenario | Bucket | Outcome |
|---|----------|--------|---------|
| 1 | Same SKU, batch MRP ↑ (warehouse) | A | Absorb → customer pays promise, ₹0 extra |
| 2 | Same SKU, batch MRP ↓ (warehouse) | A | Pass down → refund the difference (prepaid) |
| 3 | One SKU split across batches | A | Compare at line level; invoice shows batch rows |
| 4 | Pack-size change (e.g. 10→15) by WH | A | Normalize per unit, then cap/refund |
| 5 | Variant change (WH) | A | Same as pack-size (normalize) |
| 6 | Warehouse allocation change / JIT | A | Cap/refund against promise |
| 7 | Customer substitution (HA/app) | B | Baseline resets to agreed price; free shipping preserved |
| 8 | Address change / payment method / qty change | C | Standard rules; new charges legitimate |
| 9 | Qty reduced / partial fulfilment (OOS) | A/C | Charge fulfilled qty at promise; refund unfulfilled |
| 10 | Actual MRP ≤ FSP, or delta beyond guardrail | A | Route to Problem Solver; no auto-adjust |
| 11 | Return after a Price Lock refund | — | Recover benefit first, then return refund |
| 12 | COD instead of prepaid | A | Bill capped/lower amount at delivery; no refund |
| 13 | Mixed order (some ↑, some ↓) | A | Per line; app shows one net Price Lock summary |

## 15. Open decisions to close before / during build

- Exact higher-MRP absorption **cap** value and the lower-MRP **floor** value/basis (both new product knobs; the old "5%" had no basis).
- Whether the frozen discount recomputes as **flat vs percentage** against actual MRP.
- **Rounding** mode (e.g. ROUND_HALF_UP) and deterministic residual allocation across batch rows; GST rounding at line vs invoice.
- **Consent-origin reliability:** can HA/app substitutions be trusted to always arrive tagged as customer-origin, with no risk a warehouse swap masquerades as one?
- **Free-shipping preservation:** unconditional on A/B, or capped?
- **Finance:** sign-off on folding the amount into the existing discount (presentation change only).
- **Payment/Returns contract:** exact fields for the refund call and the returns savings-recovery.

## 16. What this supersedes

- Supersedes decision **2026-08-24 "Lower-MRP: hold FSP, no pass-down or refund."** Refund/pass-down is restored.
- Reframes **2026-08-24 "Price Lock is not a variance-correction engine":** still true in spirit (the *real* fix is upstream MCP/picking), but Price Lock now actively delivers the benefit downstream via the adjustment layer, and feeds MCP the variance signal rather than staying silent.
- Consistent with (does not change): FSP as the frozen invariant, one blended customer-facing discount, batch-level invoice rows, sellable-unit refund snapshot, Problem Solver routing-only, coupon-on-MRP.
