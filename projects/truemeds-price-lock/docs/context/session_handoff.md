# Price Lock — Session Handoff

## 1. Current status

Product model consolidated from user discussion and CAB reference documents. Latest model captured in `project_truth.md`.

Latest decisions (2026-08-24, CEO/business aligned):
- Lock the price (FSP), not the discount. FSP is the single locked invariant; quoted MRP travels with it; base/coupon/BSP are frozen breakdown, not recomputed post-order. Invoice discount = Fulfilled Batch MRP − FSP. Thresholds only on guardrails.
- Lower MRP: hold FSP, no refund/pass-down. Post-order "savings delight" for decreases is removed; lower-price delight is delivered upstream (MCP/correct-batch picking).
- Price Lock is not a variance-correction engine; variance (up or down) is an upstream MCP/picking problem — currently unowned, flagged as dependency.
- New: `docs/context/surface_inventory.md` maps every bill/savings surface Today vs Tomorrow (v0.1 scaffold; needs Figma snapshots + current-live confirmations).
- CAB grounding: real invoice `docs/context/ORDER_INVOICE_48188241_Paid.pdf` (Order 48188241) confirms batch-level rows + single consolidated discount line already exist today. Use this PDF directly for any invoice-layout question — not a paraphrase of it.

## 2. Latest completed work

- Verified all six CAB source documents.
- Reviewed current cost absorption, batch splitting, WMS/MCP, invoice, customer UI, tax, returns, and charge touchpoints.
- Reframed feature around locked BSP.
- Defined Pre-order as owner of current coupon/TM Rewards selection and FSP calculation.
- Defined one customer-facing Discount line with backend component and sellable-unit allocation.
- Confirmed WMS owns batch calculation and invoice creation.
- Confirmed existing pack-size change and line/version behaviour continues.
- Confirmed batch-level invoice rows.
- Added threshold and shared rounding principles.
- Added immutable sellable-unit pricing and refund snapshot requirements.
- Defined Pre-order taxes/charges as quoted inputs subject to invoice validation where fulfilment-dependent.
- Clarified current higher-MRP Price Lock discount behaviour.
- Clarified current lower-MRP Cost Absorption behaviour: selling price mutates downward and paid difference is refunded.
- Defined target fixed-FSP behaviour.
- Defined Pre-order Discount Threshold and global Post-order Lower-MRP Threshold.
- Restricted Problem Solver to routing; SOP and alternate-batch resolution remain separate.
- Kept View Bill and invoice customer presentation as one generic Discount.

## 3. Files

- `docs/context/project_truth.md` — current truth.
- `docs/context/decision_log.md` — durable decisions.
- `docs/context/open_questions.md` — unresolved items.
- `docs/context/surface_inventory.md` — every bill/savings surface Today vs Tomorrow (needs Figma snapshots + current-live confirmations).
- `prototype/price-lock/` — the interactive walkthrough (modular; see §6).
- `reference/CAB/` — copied historical documents.
- `reference/figma-links.md` — design references.

## 3b. Latest UI pass (2026-08-26)

Invoice table visual hierarchy redesigned per user request: too many columns competed for attention; totals/discount changes weren't legible.
- MRP cell now gets ▲/▼ + violet tint whenever batch MRP differs from quoted MRP (both Today and Tomorrow tables) — was previously only on Discount/Total.
- Total column is now a persistent "spine" (`tot-col`: tinted background, bold, full column) in both tables, not just highlighted on change.
- Today's Total shows ▼ when price passed down below the promised FSP (cost-absorption refund case) — previously no highlight logic existed in Today at all.
- Taxable / GST% / GST Amt demoted to a muted `.mut` style (smaller, lighter) — compliance mechanics, not the decision story.
- Small legend line added under each invoice table explaining the dot/arrow convention.
- Files: `prototype/price-lock/app.js` (calc() now returns `quoted`; todayRow/tomRow rewritten), `styles.css` (`.tot-col`, `.mut`, `.inv-legend`), `index.html` (header classes + legend markup). Rebuilt `price-lock-walkthrough.html` via `build.py`.
- Not yet done: no legend/arrow treatment added to the cart or scenario-panel numbers — scoped to the two invoice tables only, per the ask.

## 3c. Alignment fix (2026-08-26, same session)

User flagged: arrow after the number broke right-alignment (digits didn't line up column to column), and the MRP/Discount/Payable totals sat in a floating flex footer below the table, not locked to the table's own columns ("dangling").
- Arrow now renders **before** the number (`▲ ₹115.00`), so the right-aligned edge is always the last digit, not the arrow glyph — columns line up regardless of which rows have an arrow.
- Replaced the flex `.inv-foot .tot` summary with a real `<tfoot>` row inside each `<table>` — MRP Total / Discount / Total sums now sit in the exact same `<td>` grid as the body rows (same table element = same column widths, same scroll), so they can't drift from the columns above them.
- Arrows are now direction-colored: violet ▲ = up, red ▼ = down.
- Files: `app.js` (arrow() returns prefix span; cell builders reordered), `index.html` (tfoot markup added, old `.tot` spans removed from `.inv-foot`), `styles.css` (`.delta.up/.down`, `tfoot` rules, `.inv-foot` simplified). Rebuilt bundle via `build.py`.
- Follow-up: unicode ▲/▼ triangles swapped for inline-SVG stemmed arrows (line + arrowhead, `stroke:currentColor`) — renders consistently across browsers/fonts, unlike glyph triangles. `ARROW_UP`/`ARROW_DOWN` constants in `app.js`.

## 4. Next exact step

Prototype is review-ready. Collect eng/CXO feedback, then use `project_truth.md` + the walkthrough to draft the PRD. Remaining open items (`open_questions.md`): lower-MRP threshold value/basis, higher-MRP absorption cap value + owner, tax treatment of the absorbed amount (finance), MCP/correct-batch-picking owner, and rounding.

## 5. Do not change without explicit approval

- Locked FSP invariant (FSP is the single locked price; base/coupon/BSP are frozen breakdown).
- One customer-facing Discount presentation (blended); no separate Price Lock line on the invoice.
- The two guardrails — higher-MRP absorption cap and lower-MRP threshold (values still open; both are new product knobs).
- Lower-MRP policy: hold FSP, no refund/pass-down.
- Sellable-unit pricing/refund snapshot.
- Same-pack scope boundary.
- WMS/Post-order ownership of the derived discount and invoice creation.
- Batch-level invoice requirement.
- Existing pack-size change behaviour (price absorption continues as-is).
- Problem Solver routing only (no SOP or alternate-batch implementation).
- Coupon on MRP (FIRST23 = flat 23% off MRP, not stacked on base discount).

## 6. Prototype — interactive walkthrough

Location: `prototype/price-lock/` (modular). The old `price-lock-cxo-explainer.html` (built on the superseded BSP model) and the earlier flat `price-lock-walkthrough.html` are retired to `prototype/_to_delete/`.

Structure & build:
- `index.html` — page structure (opens locally on its own).
- `styles.css` — all styling.
- `app.js` — logic + illustrative cooked data.
- `build.py` — inlines the three into the self-contained bundle.
- `price-lock-walkthrough.html` — the built bundle (generated; never hand-edit; this is what renders in the panel / is shared).
- Workflow: edit `index.html`/`styles.css`/`app.js`, then run `python3 prototype/price-lock/build.py`.

What it demonstrates (FSP-invariant model; all figures illustrative):
- Cart + Bill Details with three items — Cardvas 10 is the followed example (quoted ₹100, ordered ×3); Glyco 500 and Telma 40 are unchanged dummy lines (pre = post).
- Coupon FIRST23 (flat 23% off MRP, whole order).
- Fulfilment control: Cardvas batches 1–3 (qty 3 splits 3 / 2+1 / 1+1+1), per-batch MRP dropdown (Same / Higher / Over-cap / Lower / Under-threshold).
- Today invoice (real columns incl. Old MRP) vs Tomorrow invoice (Old MRP dropped → one MRP, one blended discount). No invented columns; Price Lock discount is called out in the scenario panel, not on the invoice.
- Per-scenario "what happens" explainer (cost absorption vs hold FSP), in our terms.
- Guardrails as a loud "does not exist today" callout + the Problem Solver flow.
- Contract note: warehouse edits stay as today; tax/charges re-validated after edits.
- Section 08 — the upstream fix (MCP): highest-quantity pickable MRP across JIT/Urgent/Excess, Bulk excluded, worked example; absorption is the measure of upstream inaccuracy.
- Boundary cards: OG / new product / quantity / pack-size / substitute / re-lock.

Guardrail values are illustrative placeholders (cap +20% above quoted, floor −15% below).
