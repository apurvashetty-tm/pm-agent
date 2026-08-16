# PG Commercial Comparison — Knowledge Reference

**Last updated:** 2026-08-14
**Scope:** Payment Gateway MDR cost comparison for Truemeds, based on April 2026 transaction volumes and latest vendor quotes (Jul 2026).

---

## Source Files

All numbers in this document are traceable to these files. Do not treat figures as memorised facts — verify against the source files if anything seems stale.

| File | Location | Purpose |
|---|---|---|
| `PG_Commercial_Comparison_July2026.xlsx` | `~/Documents/Claude/Payment_POD_PG_Architecture_Decision/02_Vendor_Decks/Commercials/` | Primary working model — 5 tabs: Summary Dashboard, Instrument Rate Matrix, Cost by Payment Mode, Rate Card Reference, Juspay Add-on |
| `PG_Commercial_Comparison_April2026.xlsx` | Same folder | Historical baseline + "Latest Quotes (Jul 2026)" tab = verbatim captured vendor quotes used as rate source |
| `APRIL 2026.xlsx` | `.../Commercials/Cashfree data/` | Raw Cashfree transaction export — ground truth for GMV, transaction counts, and Cashfree's actual settled fees |
| `rate 2026.xlsx` | `.../Commercials/` | Cashfree contracted rate card (current, no new quote sought) |
| `Payu_Deck.pdf`, `Razorpay Deck.pdf`, `Truemeds __ Juspay.pdf` | `.../02_Vendor_Decks/` | Vendor pitch decks (supporting context, not rate source) |
| `Payments_GoNoGo_May2026.pdf` | `.../Commercials/` | CEO walkthrough deck (May 2026 snapshot) |

---

## Transaction Volume — April 2026 Actuals

Source: `APRIL 2026.xlsx` (Cashfree raw transaction export)

| Metric | Value |
|---|---|
| Total GMV | ₹35,83,81,978.94 |
| Total Transactions | 2,81,434 |
| Reference month | April 2026 |

### Payment Mode Breakdown

Source: `Cost by Payment Mode` tab, `PG_Commercial_Comparison_July2026.xlsx`

| Payment Mode | Txn Count | GMV (₹) | GMV % |
|---|---|---|---|
| UPI (Intent/Collect) | 1,84,489 | 21,65,67,651 | 60.4% |
| Credit Card | 51,316 | 8,44,69,092 | 23.6% |
| UPI Credit Card (Rupay CC) | 21,748 | 2,71,41,182 | 7.6% |
| UPI Offline / QR | 8,787 | 1,07,33,319 | 3.0% |
| Wallets | 6,936 | 78,49,587 | 2.2% |
| Debit Card | 4,343 | 68,49,350 | 1.9% |
| Net Banking | 1,310 | 21,27,518 | 0.6% |
| Pay Later (LazyPay) | 1,185 | 12,36,532 | 0.3% |
| UPI PPI | 957 | 9,32,942 | 0.3% |
| Prepaid Card | 162 | 2,32,685 | 0.1% |
| UPI Credit Line | 142 | 1,38,826 | 0.0% |
| Credit Card EMI | 14 | 70,590 | 0.0% |
| UPI PPI Offline | 45 | 32,703 | 0.0% |

### Sub-bucket GMV (used for precise cost modelling)

These were extracted from raw `APRIL 2026.xlsx` using `Payment Mode SubType` and `Amount` fields. Used to replace approximate blended-weight calculations.

**Credit Card**
- Standard + Premium (Visa/Master/Rupay): ₹8,29,24,908
- Corporate Cards: ₹15,44,184 (1.83% of total CC GMV)

**Debit Card**
- Visa/Master ≤ ₹2,000: ₹26,63,206 (2,622 txns)
- Visa/Master > ₹2,000: ₹25,47,726 (675 txns)
- Rupay Debit: ₹16,38,418 (1,046 txns)

**Net Banking by bank**
- SBI: ₹12,61,941
- Axis: ₹2,62,990
- Kotak: ₹2,53,775
- ICICI: ₹7,201
- Yes Bank: ₹48,672
- HDFC: ₹0 (no transactions in April)
- All Other Banks: ₹2,92,939

**Wallets by brand**
- PhonePe: ₹39,96,757
- Amazon Pay: ₹29,26,219
- MobiKwik: ₹8,91,061
- OLA Money: ₹21,647
- Airtel Money: ₹13,903

---

## Rate Cards — Jul 2026 Quotes

Source: `Rate Card Reference` tab + `Latest Quotes (Jul 2026)` tab in `PG_Commercial_Comparison_April2026.xlsx`

All rates are MDR % of transaction value, **excluding GST** (add 18% for all-in cost).

### Credit Card

| Scheme | Cashfree | PayU | EaseBuzz | Razorpay |
|---|---|---|---|---|
| Visa / Master / Rupay (Standard) | 1.92% | 1.75% | 1.50% | 1.75% |
| Corporate Cards | 2.25% | 2.20% | 1.72%* | 3.00% |
| Diners | 2.95% | 1.75% | 1.85% | 2.50% |
| AMEX | 2.95% | 1.75% | 2.40% | 2.30% |
| International | 2.99% | 1.75% | 2.75% | 3.00% |
| CC EMI | 2.00% | 1.80% | 1.70% | 2.50% |

**PayU note:** PayU quotes a uniform 1.75% blended rate for all credit card types (including Diners, AMEX, International) — they do not bifurcate by card tier. Corporate Cards (2.20%) and CC EMI (1.80%) are separately carved out.

*EaseBuzz Corporate rate is carried forward from April 2026 — not separately re-quoted in Jul 2026.

**Razorpay note:** CC rate of 1.75% is best-case (subject to bank approval); falls back to 1.85% if not approved.

### Debit Card

| Scheme | Cashfree | PayU | EaseBuzz | Razorpay |
|---|---|---|---|---|
| Visa / Master ≤ ₹2,000 | 0.35% | 0.30% | 0.36% | 0.40% |
| Visa / Master > ₹2,000 | 0.75% | 0.76% | 0.72% | 0.80% |
| Rupay Debit | ₹0.50 flat | 0% | 0% | 0.10% |

### UPI

| Instrument | Cashfree | PayU | EaseBuzz | Razorpay |
|---|---|---|---|---|
| UPI Intent / Collect / Offline | 0% | 0% | 0% | 0.04% ⚠ |
| Rupay CC on UPI | 2.15% | 1.95% | 1.60% | 2.35% |
| UPI Credit Line | 1.50% | 1.35% | 1.50%* | 2.35%* |
| UPI PPI | 1.50% | 0.98% | 2.30% | 1.85%* |

⚠ Razorpay charges 0.04% on UPI — the only PG doing so. At 60.4% GMV share, this is a significant cost driver (₹1,02,220/month).

*Not separately quoted; rate assumed/interpolated.

### Net Banking (bank-level rates)

| Bank | Cashfree | PayU | EaseBuzz | Razorpay |
|---|---|---|---|---|
| HDFC | 1.40% | 1.52% | 1.40% | 1.60% |
| ICICI | 1.40% | 1.52% | 1.40% | 1.60% |
| Axis | 1.40% | 1.00% | 1.40% | 1.20% |
| SBI | 1.40% | 1.00% | 1.40% | 1.20% |
| Yes Bank | 1.40% | 1.00%* | 1.05% | 1.20%* |
| Kotak Mahindra | 1.05% | 1.35% | 1.05% | 1.45% |
| All Other Banks | 1.05% | 1.00% | 1.05% | 1.20% |

*PayU and Razorpay do not separately quote Yes Bank — "Others" rate applied.

**Grouping note:** Each PG groups banks differently in their actual quotes. The bank-level table above preserves individual PG groupings accurately. A single 3-bucket grouped view cannot represent all three simultaneously.

### Wallets

| Wallet | Cashfree | PayU | EaseBuzz | Razorpay |
|---|---|---|---|---|
| PhonePe | 1.45% | 1.15% | 1.00% | 1.55% |
| Amazon Pay | 1.45% | 1.30% | 1.00% | 1.55% |
| MobiKwik / Others | 1.45% | 1.45% | 1.10% | 1.55% |
| OLA Money | 1.45% | 1.25% | 1.10% | 1.55% |
| Airtel Money | 1.45% | 1.50% | 1.10% | 1.55% |

### Others

| Instrument | Cashfree | PayU | EaseBuzz | Razorpay |
|---|---|---|---|---|
| Pay Later (LazyPay) | 2.50% | 1.25% | 1.60% | 1.85%* |
| Prepaid Card | 2.50% | 1.25% | 2.30% | 1.85%* |

*Not separately quoted; CC rate assumed.

---

## Cost Model — Methodology

Source: `Cost by Payment Mode` tab + Python scripts in `.../Commercials/`

### Formula
```
PG Cost (all-in) = GMV × MDR Rate × 1.18 (GST gross-up)
```

### Cashfree column
Cashfree is the **live processor** — its cost column uses **actual settled fees** (`Service Charge + ST/GST`) summed directly from `APRIL 2026.xlsx`. Never recompute Cashfree costs via rate-card formulas — 100% of rows cross-check exactly against raw settled data.

### PayU / EaseBuzz / Razorpay columns
These are **rate-card estimates** (not live processors). Costs are computed from raw GMV × rate × 1.18 using the most granular sub-bucket GMV available:

- **Credit Card:** (Standard GMV × standard rate + Corporate GMV × corporate rate) × 1.18
- **Debit Card:** (≤2k GMV × rate_le2k + >2k GMV × rate_gt2k + Rupay GMV × rupay rate) × 1.18
- **Net Banking:** Σ(bank GMV × bank-specific rate) × 1.18, per bank individually
- **All other modes:** Total mode GMV × single rate × 1.18

### Why sub-bucket GMV matters
Earlier versions used a blended-weight approximation (back-solving a single corporate-card weight from each PG's stored cost). This produced inconsistent weights (0.0159–0.0186) across PGs because the underlying raw mix was unknown. The final model uses the precise real split from raw transaction data — eliminating approximation error entirely.

---

## Monthly Cost Summary — April 2026 Volumes, Jul 2026 Rates

Source: `Summary Dashboard` tab, `PG_Commercial_Comparison_July2026.xlsx`

| PG | MDR Cost (₹) | GST (₹) | Total Cost (₹) | Effective Rate |
|---|---|---|---|---|
| Cashfree (Actual) | 21,51,198 | 3,87,216 | 25,38,414 | 0.708% |
| PayU | 21,92,511 | 3,94,652 | 25,87,163 | 0.722% |
| EaseBuzz | 18,90,376 | 3,40,268 | 22,30,644 | 0.622% |
| Razorpay | 24,56,857 | 4,42,234 | 28,99,091 | 0.809% |

**vs Cashfree:**
- EaseBuzz: **₹3,07,770/month cheaper** (−12.1%)
- PayU: ₹48,749/month more expensive (+1.9%)
- Razorpay: ₹3,60,677/month more expensive (+14.2%)

---

## Juspay Orchestration Add-on

Source: `Juspay Add-on` tab, `PG_Commercial_Comparison_July2026.xlsx`

- **Platform fee:** 14 bps (0.14%) on GMV — covers Payment Page + Offers full suite
- **GST:** 18% on platform fee
- **Monthly cost (at April volumes):** ₹5,92,047
- **Annualised:** ₹71,04,564
- **Effective rate:** 0.165% of GMV

**Important:** Juspay cost is GMV-based and completely independent of PG rates — it does not change when PG rates change. Juspay is **not compatible with Razorpay**.

| PG + Juspay | Combined Monthly Cost (₹) |
|---|---|
| Cashfree + Juspay | 31,30,461 |
| PayU + Juspay | 31,79,210 |
| EaseBuzz + Juspay | 28,22,691 |
| Razorpay (not compatible) | — |

---

## Key Differentiators by PG

**EaseBuzz:** Cheapest overall. Lowest credit card standard rate (1.50%), lowest wallet rates (1.00% across most brands). No UPI charge.

**PayU:** Uniform 1.75% blended CC rate (simplest pricing, no tier breakout). Competitive NB rates for SBI/Axis/Others (1.00%). However, Corporate Card repricing (1.67%→2.20%) hurt them vs April baseline. Now slightly pricier than Cashfree overall.

**Razorpay:** Only PG charging for UPI (0.04%) — the single biggest structural cost penalty at 60.4% GMV on UPI. Despite a dramatic UPI rate cut (from 0.20% to 0.04%), they remain the most expensive. Best-case CC rate (1.75%) requires bank approval.

**Cashfree:** Current live processor. No new commercial quote sought — contracted rates unchanged. Benchmark for all comparisons.

---

## Quote Capture Dates

| PG | Quote Source | Date |
|---|---|---|
| Cashfree | `rate 2026.xlsx` (contracted) | Current (no re-quote) |
| PayU | Shared vendor rate sheet | 16 Jun 2026 |
| EaseBuzz | Shared vendor rate sheet | 16 Jun 2026 |
| Razorpay | Shared vendor rate sheet | 16 Jun 2026 (22 Jul 2026 revision used) |
