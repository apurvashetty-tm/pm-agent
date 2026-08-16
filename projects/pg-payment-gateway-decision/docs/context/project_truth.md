# Project Truth — PG Payment Gateway Decision

**[LOCKED]** — Do not modify without explicit user instruction.

---

## What is decided / confirmed

- **Reference volume:** April 2026 (₹35.84 Cr GMV, 2.81L transactions) [USER-PROVIDED]
- **Cashfree** is the current live payment processor [USER-PROVIDED]
- **Cashfree cost column** in the model uses actual settled fees from raw export — never rate-card derived [USER-PROVIDED]
- **PayU CC rate** is uniform 1.75% blended (no tier breakout), per PayU's explicit quote [USER-PROVIDED]
- **Razorpay CC rate** of 1.75% is best-case, subject to bank approval; fallback is 1.85% [USER-PROVIDED]
- **EaseBuzz Corporate Card rate** of 1.72% is carried forward from April 2026 — NOT re-quoted in Jul 2026 [INFERRED from quote sheet]
- **Juspay does not support Razorpay** [USER-PROVIDED]
- **Juspay platform fee:** 14 bps on GMV, covering Payment Page + Offers full suite [USER-PROVIDED]
- **GST rate:** 18% applicable on all MDR and platform fees [USER-PROVIDED]

## Cost model formula

```
PG Cost (all-in, incl. GST) = GMV × MDR Rate × 1.18
```

Applies to PayU, EaseBuzz, Razorpay only. Cashfree = actual settled data.

## Final verified monthly costs (April volumes, Jul 2026 rates)

| PG | Monthly Cost (₹) | Effective Rate |
|---|---|---|
| Cashfree (Actual) | 25,38,414 | 0.708% |
| PayU | 25,87,163 | 0.722% |
| EaseBuzz | 22,30,644 | 0.622% |
| Razorpay | 28,99,091 | 0.809% |

Source: `Cost by Payment Mode` TOTAL row + `Summary Dashboard`, `PG_Commercial_Comparison_July2026.xlsx`
Last verified: 2026-08-14
