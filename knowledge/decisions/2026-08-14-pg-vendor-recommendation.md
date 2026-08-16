---
name: 2026-08-14-pg-vendor-recommendation
description: Cost-based PG vendor ranking and recommendation for Truemeds, based on April 2026 volumes and July 2026 quotes. EaseBuzz is cheapest; Razorpay most expensive; Juspay add-on is PG-agnostic.
metadata:
  type: decision
  domain: payments
  status: analysis-complete, vendor-selection-pending
---

# PG Vendor Commercial Recommendation — Jul 2026

## Context

Truemeds currently processes all payments through Cashfree. This analysis models what our April 2026 transaction volume (₹35.84 Cr GMV, 2.81L transactions) would cost if processed through PayU, EaseBuzz, or Razorpay instead, using their latest Jul 2026 commercial quotes.

**Primary source:** `PG_Commercial_Comparison_July2026.xlsx`
Located at: `~/Documents/Claude/Payment_POD_PG_Architecture_Decision/02_Vendor_Decks/Commercials/`

---

## Monthly Cost Ranking (April volumes, Jul 2026 rates, incl. GST)

| Rank | PG | Monthly Cost (₹) | vs Cashfree |
|---|---|---|---|
| 1 (cheapest) | **EaseBuzz** | **22,30,644** | **−₹3,07,770 (−12.1%)** |
| 2 | Cashfree (current) | 25,38,414 | baseline |
| 3 | PayU | 25,87,163 | +₹48,749 (+1.9%) |
| 4 (costliest) | Razorpay | 28,99,091 | +₹3,60,677 (+14.2%) |

Effective MDR rates: EaseBuzz 0.622% → Cashfree 0.708% → PayU 0.722% → Razorpay 0.809% of GMV.

---

## Key Findings

### EaseBuzz is the cheapest PG
Driven by the lowest credit card standard rate (1.50% vs 1.75–1.92% elsewhere) and the lowest wallet rates (1.00% across most wallet brands). Saves ₹3.08L/month vs Cashfree.

### Razorpay's UPI charge is the primary structural penalty
Razorpay is the only PG charging for UPI (0.04%). At 60.4% of GMV on UPI, this alone adds ₹1,02,220/month in cost vs every other PG. Even after their UPI rate cut from 0.20% to 0.04% (an 80% reduction), they remain the most expensive PG overall. Their gap to Cashfree narrowed from ₹9,32,861 (April rates) to ₹3,60,677 (Jul rates).

### PayU moved from cheapest to more expensive than Cashfree
Between April and July quotes: Corporate Card rose 1.67%→2.20%, Debit Card >₹2,000 rose 0.65%→0.76%. These increases flipped PayU from the previous cheapest option to ₹48,749/month pricier than Cashfree.

### Juspay is PG-agnostic
Juspay's orchestration layer (Payment Page + Offers) costs 14 bps on GMV = ₹5,92,047/month (₹71L annualised). This is fully independent of PG choice and does not change with PG rates. **Juspay does not support Razorpay** — that combination is not available.

With Juspay added:

| PG + Juspay | Combined Monthly Cost (₹) |
|---|---|
| EaseBuzz + Juspay | **28,22,691** (cheapest combination) |
| Cashfree + Juspay | 31,30,461 |
| PayU + Juspay | 31,79,210 |
| Razorpay (not compatible) | — |

---

## Rate Changes Since April 2026 (notable movements)

| PG | Instrument | April Rate | Jul Rate | Direction |
|---|---|---|---|---|
| Razorpay | UPI Intent/Collect | 0.20% | 0.04% | ↓ significant improvement |
| EaseBuzz | Credit Card Standard | 1.72% | 1.50% | ↓ improvement |
| PayU | Corporate Card | 1.67% | 2.20% | ↑ worsened |
| PayU | Debit Card >₹2k | 0.65% | 0.76% | ↑ worsened |
| PayU | Diners/AMEX/International | Tiered | 1.75% blended | Reclassified (uniform rate) |

---

## Open Items Before Final Vendor Selection

- [ ] Confirm EaseBuzz integration timeline and tech readiness
- [ ] Validate EaseBuzz Corporate Card rate (1.72% was NOT re-quoted in Jul 2026 — carried forward from April; seek explicit confirmation)
- [ ] Confirm Razorpay CC rate actually achieves 1.75% (subject to bank approval; fallback is 1.85%)
- [ ] Assess non-cost factors: settlement TAT, chargeback handling, support SLA, API reliability
- [ ] Decide on Juspay dependency (if adopting EaseBuzz, Juspay is compatible; if Razorpay, Juspay is not available)
- [ ] Define cutover plan (parallel processing, gradual traffic shift, rollback criteria)

---

## How to Re-run This Analysis

1. Export fresh raw transaction data from Cashfree (same format as `APRIL 2026.xlsx`)
2. Re-request updated commercial quotes from PGs
3. Capture new quotes in the `Latest Quotes` tab of the April workbook
4. Update rates in `Rate Card Reference` and `Instrument Rate Matrix` tabs
5. Recompute `Cost by Payment Mode` using sub-bucket GMV from raw export (see `knowledge/context/pg-commercial-comparison.md` for methodology)
6. `Cost by Payment Mode` totals auto-propagate to `Summary Dashboard` and `Juspay Add-on`
7. Python scripts for the rebuild are in `.../Commercials/` (see `precise_fix.py` for the precise sub-bucket computation approach)
