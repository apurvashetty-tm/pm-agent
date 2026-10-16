# Price Lock — Bill & Savings Surface Inventory (Today vs Tomorrow)

Status: v0.1 scaffold. Seeded from `reference/CAB/Cost AbsorptionFunctional.md`, the PRD,
and a real paid invoice (Order 48188241). Snapshots and "current live" confirmations still needed.
Last updated: 2026-08-24

## Purpose

Every place the customer (or an agent) sees **bill details** or **savings** must tell one
consistent story under the target model. This file inventories each surface and states, per
surface: what it shows **today**, what it should show **tomorrow** (FSP-invariant model), the
data fields behind it, and the snapshot/confirmation still needed.

Read together with `project_truth.md` (the model) and `decision_log.md` (why we got here).

## The one rule every surface must reflect (tomorrow)

- The customer's per-unit **Final Selling Price (FSP) does not mutate** between quote and fulfilment.
- The invoice shows the **batch MRP** and **one consolidated discount** = `Batch MRP − FSP`.
- **Higher** batch MRP → discount grows, absorbed up to the margin threshold → surfaced as "PriceLock Savings / no extra payment."
- **Lower** batch MRP → FSP held, company keeps the delta → **the post-fulfilment "bill reduced / savings delight" moment goes away** (decision 2026-08-24: hold FSP, no pass-down/refund; lower-price delight is delivered upstream via MCP/correct-batch picking).
- The ordinary **pre-order "Your savings" (MRP − FSP discount) stays** — only the variance-driven *post-order* decrease story is removed.
- Batch rows stay one-per-physical-batch (already true today — see invoice below).

> The lower-MRP behaviour is now decided. The affected decrease-side surfaces below are marked
> DEPRECATED (tomorrow) so the doc reflects the resolved policy, not an open fork.

---

## A. Pre-order surfaces (before order placement)

### A1. Cart — Bill details
- **Today:** New Bill Details component; MRP, discount, charges, total. `[confirm current]`
- **Tomorrow:** Same structure; the locked FSP is the number that carries forward unchanged.
- **Data:** quoted MRP, discount, charges, total (per line + order).
- **Snapshot needed:** Figma frame — Cart bill details.

### A2. Order Summary — Bill details + "Your savings" + PriceLock animation + Trust marker
- **Today:** Bill details; "Your savings" figure; PriceLock animation banner; "Protected by Price Lock Guarantee" trust marker; info bottom sheet (reasons, exclusions, 7-day disclaimer). `[confirm which of these are live now]`
- **Tomorrow:** Same UI; "Your savings" and the locked price are anchored to FSP so nothing the customer sees here can move post-order.
- **Data:** quoted MRP, base discount, coupon discount (frozen snapshot), FSP, savings figure.
- **Snapshot needed:** Order Summary — bill + savings + trust marker + info bottom sheet.

### A3. PSP / Place-order → View Bill bottom sheet
- **Today:** Bill details mirrored from Order Summary; trust marker (not on Dweb). `[confirm current]`
- **Tomorrow:** Same; FSP is the committed number at the moment of payment.
- **Data:** same as A2.
- **Snapshot needed:** PSP → View Bill bottom sheet.

### A4. Order Placed / Confirmation
- **Today:** Order-placed animation with PriceLock trust marker (once per order). `[confirm current]`
- **Tomorrow:** Unchanged in structure; reinforces the locked FSP promise.
- **Snapshot needed:** Order confirmation screen.

### A5. Reorder Summary
- **Today:** New Bill Details component. `[confirm current]`
- **Tomorrow:** Same as A1/A2.
- **Snapshot needed:** Reorder summary bill.

---

## B. Post-order, pre-invoice (Order Status before "Invoice Generated")

### B1. Order Status — Bill details (static snapshot)
- **Today:** From "Assigned to WH" until invoice generation, the bill is a **static snapshot** — WH operations (bulk update, temp edits, batch changes) do **not** reflect in real time; only CSR edits do. `[confirm current]`
- **Tomorrow:** Same static behaviour. The customer sees the locked FSP; the batch reconciliation happens silently and only appears post-invoice.
- **Data:** locked FSP snapshot, products, quantities, discounts, charges.
- **Snapshot needed:** Order Status (pre-invoice) bill details.

---

## C. Post-invoice (Order Status)

### C1. Savings bottom sheet (once per order)
- **Today:** Shown once after invoice generation if Savings ≥ Y1 or Absorption ≥ Y2 (₹ display floor). Title/subtitle reason-driven. `[confirm current]`
- **Tomorrow:** For **higher** MRP → "₹X extra cost avoided" still valid. For **lower** MRP → FSP is held, so there is no bill reduction to celebrate → this sheet does **not** fire on lower-MRP-only orders. (DEPRECATED for the decrease case per decision 2026-08-24.)
- **Data:** absorption amount, savings amount, reason code, thresholds Y1/Y2.
- **Snapshot needed:** Savings bottom sheet (absorption case + savings case).

### C2. Price Change Summary bottom sheet (tabs + accordions)
- **Today:** Two tabs — "Price Decrease" and "PriceLock Savings"; accordions for price increase/decrease, pack-size, substitution; multi-batch grouped by MRP. `[confirm current]`
- **Tomorrow:** "PriceLock Savings" (absorption) tab stays. The **"Price Decrease" tab is DEPRECATED** — FSP is held on lower MRP, so there is no post-order decrease to show (decision 2026-08-24).
- **Data:** per-item locked SP vs box-verified SP, per-modification totals, batch groups.
- **Snapshot needed:** Price Change Summary — both tabs, collapsed + expanded.

### C3. Bill details — PriceLock Savings line + tooltips
- **Today:** Adds a **"PriceLock Savings"** line item when Absorption > 0; MRP row and PriceLock row are clickable → tooltips (locked SP ↑/↓ box-verified SP). `[confirm current]`
- **Tomorrow:** Absorption still shown as its own line (this is the delight). Decide whether target keeps it folded as one discount or as a distinct "PriceLock Savings" line. `[OPEN — see project_truth §8: single generic discount vs named savings line]`
- **Data:** absorption amount, locked SP, box-verified SP per item.
- **Snapshot needed:** Bill details post-invoice + both tooltips.

### C4. Savings strip (when order-mod log not shown)
- **Today:** For MRP-only changes (no logs), a strip: "₹X protected with PRICELOCK" / "₹Y saved with PRICELOCK". `[confirm current]`
- **Tomorrow:** "protected" (absorption) strip stays; "saved" (price-decrease) strip is DEPRECATED where FSP is held (decision 2026-08-24).
- **Snapshot needed:** Savings strip variants.

### C5. Order Modification Logs — savings/absorption strips
- **Today:** Top strip + per-modification strips for batch/pack-size price changes; inclusion/exclusion rules (batch/subs-only price changes suppress the log). `[confirm current]`
- **Tomorrow:** Same log framework; decrease-side messaging changes per the FSP-hold policy.
- **Snapshot needed:** Order mod logs — strip + per-mod.

---

## D. Invoice (downloadable PDF) — concrete baseline from Order 48188241

**Today (real invoice, verified):**
- Per-line columns: Item, Manufacturer, HSN, **Batch No.**, Exp. Date, **Old MRP\***, **Revised MRP\***, Qty, MRP Total, Discount, Taxable Amt, GST%, GST Amt, Total.
- **Batch-level rows already exist:** same SKU across two batches = two rows (Clopilet GTG3267A + GTH0550B; Repace 50 SIG1881A + SIG2450A).
- Old/Revised MRP columns carry the GST-change case (e.g. Repace H: Old 186.0 → Revised 174.38).
- Order-level: MRP Total ₹1185.5, Packaging & Handling, Cash Handling, Delivery Charges, **single "MRP Discount Amount" −₹237.11**, Bill Amount ₹959.39, Payable ₹959.39.
- **No "Price Lock Savings" line** (this order had no absorption event).

**Tomorrow (decision 2026-08-24):** minimal change to the existing invoice, not a redesign.
- **Drop Old MRP** (7th column); **rename Revised MRP → MRP** (the actual batch MRP billed); **drop the GST old/new footnote**.
- Resulting columns: Sr, Item, Manufacturer, HSN, Batch No., Exp. Date, MRP, Qty, MRP Total, Discount, Taxable Amt, GST%, GST Amt, Total Amt.
- **No "Selling Price" column** — Selling Price / FSP is an internal name only.
- MRP Total (gross) and Total Amt (net payable) are separate existing columns; nothing redefined. Total Amt = what the customer pays.
- **One blended Discount** (base + coupon + price-lock absorption); Discount = Batch MRP − FSP, so absorption is inside it. **No separate "Price Lock Savings" line** (reverses CAB).
- Absorption/delight story moves to the **Price Lock frontend page**, not the invoice.
- GST amount per-line column or summary block — flexible. Batch-row structure unchanged (already correct).
- Open (finance): absorbed amount must stay a taxable-value-reducing discount — see open_questions.

**Snapshot needed:** Figma invoice template frame (to compare against this real PDF).
**Note:** the attached PDF contains patient name/address (PII) — say the word if you want the raw file stored in the repo; otherwise only this structural summary is kept.

---

## E. Agent / CSR portals

### E1. Order placement & digitization portals
- **Today:** "Price Lock Guarantee Applicable" flag for eligible customers. `[confirm current]`
- **Tomorrow:** Flag stays; agents brief the FSP-hold promise.

### E2. Doctor / CSR Edit-Order — address-change price prompt
- **Today:** On WH-changing address edits, a confirm prompt warns prices may update; item-level delta = `Σ[(Last MRP−BD−CD)×Qty − (New MRP−BD−CD)×Qty]` + delivery delta. `[confirm current]`
- **Tomorrow:** **This is the re-lock surface** — a Doctor/HA/CSR change re-locks the price at that stage for touched items. The prompt is where the new lock is set.
- **Snapshot needed:** Edit-Order address-change confirmation prompt.

### E3. CSR Post-order — bill details + comparative view
- **Today:** PriceLock/Additional Savings column; clickable MRP tooltip; **comparative "pre vs post Price Lock" bill** (box-verified before absorption vs invoice after); item-level view; mod-log strips. `[confirm current]`
- **Tomorrow:** Comparative view becomes the main support tool for explaining held-FSP vs batch MRP.
- **Snapshot needed:** CSR post-order bill + comparative view + item-level.

---

## What I still need from you

1. **Figma exports (PNG, 2×)** for the surfaces marked "Snapshot needed" — or say the word and I'll capture the key frames live via your logged-in Chrome. Drop them under `reference/surfaces/` (I'll create `today/` and `tomorrow/`).
2. **Confirm "current live" state** on every `[confirm current]` — since CAB is now 100% rolled out, several of these may already be live rather than "tomorrow."
3. ~~Close the lower-MRP policy fork~~ — **RESOLVED 2026-08-24**: hold FSP, no pass-down/refund; decrease-side surfaces (C1 decrease case, C2 Price Decrease tab, C4 saved strip) deprecated. Delight moves upstream to MCP/picking.
4. ~~Close the invoice discount-presentation decision~~ — **RESOLVED 2026-08-24**: simplified columns, one blended discount, no Price Lock line, no Old/Revised MRP; absorption story on the frontend page. Finance/legal confirms still pending (see open_questions).

## Surface → snapshot checklist

- [ ] A1 Cart bill · [ ] A2 Order Summary (bill/savings/trust/info) · [ ] A3 PSP View Bill · [ ] A4 Order Confirmation · [ ] A5 Reorder
- [ ] B1 Order Status pre-invoice bill
- [ ] C1 Savings bottom sheet · [ ] C2 Price Change Summary (both tabs) · [ ] C3 Bill details + tooltips · [ ] C4 Savings strip · [ ] C5 Order mod logs
- [ ] D Invoice template (vs real PDF baseline ✓)
- [ ] E1 Portal flag · [ ] E2 Edit-Order prompt · [ ] E3 CSR post-order comparative view
