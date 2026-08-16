# Learnings — PG Commercial Analysis (Apr–Aug 2026)

**Project:** Payment Gateway Vendor Commercial Comparison
**Analysis completed:** August 2026
**Owner:** Apurva Shetty

---

## What Worked Well

- **Raw transaction export as ground truth** — using Cashfree's `APRIL 2026.xlsx` raw export to extract sub-bucket GMV (Standard vs Corporate credit cards, debit card ≤2k / >2k, individual bank NB splits) eliminated all approximation error from the cost model. Every Cashfree actual fee cross-checked 100% against raw settled data.
- **Separate historical vs working workbook** — keeping `PG_Commercial_Comparison_April2026.xlsx` as a locked historical file and creating `PG_Commercial_Comparison_July2026.xlsx` as a fresh working copy meant we always had a clean rollback reference.
- **Bank-level Net Banking granularity** — representing Net Banking at individual bank level (not grouped buckets) was the right call. Each PG groups banks differently in their actual quotes; a shared 3-bucket table cannot accurately represent all three simultaneously.
- **Cross-tab consistency audits** — writing Python audit scripts that checked sums, GST math, effective rates, and figure cross-references across all 5 tabs caught several silent bugs that were otherwise invisible.

## What to Do Differently Next Time

- **Avoid `insert_rows()` in openpyxl on sheets with merged cells** — openpyxl's `insert_rows()` does not always correctly adjust all merged cell ranges. In this project it left stale merge ranges at wrong row positions, which silently discarded cell values when we tried to write to B–F columns on those rows (MergedCell raises `AttributeError: value is read-only`). The fix: explicitly unmerge affected ranges before writing, OR fully rebuild the section by clearing and rewriting cell-by-cell without insert_rows.
- **Close Excel before running Python scripts** — if Excel has the file open, it caches the old version in memory. If the user then saves-on-close, it overwrites the script's output with the stale cached version. Always quit Excel (not just close the window) before running fix scripts.
- **Keep a "before" dump** — before any structural restructuring (like expanding rows), dump the full current sheet state to a variable/file so you have exact original values to fall back on if something goes wrong.
- **Lock quote capture dates explicitly** — two quotes (Razorpay CC 1.75%, EaseBuzz Corporate Card 1.72%) were ambiguous about whether they were newly quoted or carried forward. Establish this explicitly for every rate before building the model; mark `[CARRIED FORWARD]` or `[RE-QUOTED]` in the workbook.

## Key Product Gotchas for Future Reference

- **UPI is 60% of Truemeds GMV** — any PG that charges for UPI (only Razorpay at 0.04%) incurs a massive structural penalty. This is the single biggest differentiator between Razorpay and others, not credit card rates.
- **Credit Card is 23.6% of GMV but ~66% of MDR cost** — credit card rates dominate the cost comparison despite UPI's volume dominance. A 0.25% difference in CC rate = ~₹50,000/month swing.
- **Cashfree's actual costs are NOT comparable via rate-card** — Cashfree's settled fees include line items (service charge + ST/GST) that do not map to a clean % of GMV formula. Always use actual settled data for Cashfree; use rate × GMV × 1.18 only for modelled PGs.
- **PayU's "blended" CC rate** — PayU does not bifurcate by card tier (Standard/Premium/Diners/AMEX/International). They quote a single 1.75% blended rate across all these. Corporate Cards (2.20%) and CC EMI (1.80%) are separately carved out. This simplifies modelling but means you cannot check their per-tier competitiveness.
- **Juspay compatibility** — Juspay does not work with Razorpay. If Razorpay is ever selected, Juspay must be replaced or dropped. This is a significant indirect cost to consider.
- **Rupay Debit on UPI vs Rupay Debit Card** — these are separate instruments with very different rate treatment. Rupay CC on UPI is priced like a credit card. Rupay Debit Card is priced at ₹0/flat by most PGs. Do not conflate them.

## Cost Modelling Methodology (reuse template)

For any future month's analysis:

```
Cost per payment mode = GMV × MDR% × 1.18
```

For Credit Card:
```
= (Standard_GMV × std_rate + Corporate_GMV × corp_rate) × 1.18
```

For Debit Card:
```
= (le2k_GMV × rate_le2k + gt2k_GMV × rate_gt2k + rupay_GMV × rupay_rate) × 1.18
```

For Net Banking:
```
= Σ(bank_GMV × bank_specific_rate_per_PG) × 1.18
```

Sub-bucket GMV comes from raw transaction export, filtered by `Payment Mode SubType` column for card tiers, `Amount` column for debit card threshold, and `Bank Name` column for NB bank splits.

## Python Script Reference

All scripts are in `~/Documents/Claude/Payment_POD_PG_Architecture_Decision/02_Vendor_Decks/Commercials/`:

| Script | What it did |
|---|---|
| `fix_colors.py` | Initial cross-PG green/red recoloring of Instrument Rate Matrix, Rate Card Reference, Cost by Payment Mode |
| `fix_dashboard.py` | Fixed Summary Dashboard and Juspay Add-on row-level fills (green=cheapest by Total Cost) |
| `fix_payu_and_audit.py` | Set PayU Diners/AMEX/International to 1.75%; fixed number_format on ~10 cells; recolored affected rows |
| `precise_fix.py` | Replaced approximated CC/DC/NB costs with precise sub-bucket GMV calculations; propagated to Summary Dashboard |
| `rebuild_nb.py` | Restructured Rate Card Reference Net Banking from 3-bucket to 7-bank-level rows (CAUTION: used insert_rows — introduced merge bug, see learnings above) |

The **correct** approach for sheet restructuring (avoiding insert_rows merge corruption) is to: unmerge affected ranges → clear rows → write fresh cell-by-cell → re-apply merges at correct new row numbers.
