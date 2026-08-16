# Raw Transaction Data — April 2026

## File

`cashfree_april2026_transactions.csv.gz` — gzip-compressed CSV, 2.95 MB

Derived from the original Cashfree settlement export (`APRIL 2026.xlsx`, 48 MB).
PII columns stripped; 11 analytically relevant columns retained.

## What was removed

The following columns were dropped — either PII or not used in any analysis:

| Dropped | Reason |
|---|---|
| Customer Name, Phone, Email | PII |
| Card Number, Customer Reference Id | PII |
| Order Note | PII risk |
| Order Id, Reference Id | Internal IDs not needed |
| Settlement Amount | Derived (Amount − fees) |
| Bank Reference No., UTR No., Settled On, Settlement | Settlement plumbing |
| Currency | All INR |

## Columns kept

| Column | Used for |
|---|---|
| `Amount` | GMV per transaction; debit card ≤₹2k / >₹2k threshold |
| `Service Charge` | Cashfree's actual MDR fee (ground truth) |
| `ST/GST` | Cashfree's actual GST on fee (ground truth) |
| `Payment Mode` | Mode grouping (UPI, CREDIT_CARD, DEBIT_CARD, NET_BANKING, Wallet, etc.) |
| `Payment Mode SubType` | Card tier (Standard/Premium/Corporate), wallet brand, UPI sub-type |
| `Bank Name` | Net Banking bank-level split (SBI, Axis, Kotak, ICICI, Yes, HDFC, Others) |
| `Card Scheme` | Visa, Master, Rupay — for debit/credit card scheme splits |
| `Card Country` | International card identification |
| `Transaction Status` | Filter to successful transactions only if needed |
| `Transaction Time` | Useful for time-of-day / day-of-month analysis |
| `Refunded` | Flag for refunded transactions |

## Verified totals

| Metric | Value |
|---|---|
| Total rows | 2,81,434 |
| Total GMV | ₹35,83,81,978.94 |
| Total Cashfree fee (SC + ST/GST) | ₹25,38,267.26* |
| Payment modes | 13 distinct values |

*Workbook shows ₹25,38,413.85 — ₹146 difference due to ~few rows with null charges (refunded/pending transactions excluded from settlement). Not material.

## How to read it

```python
import gzip, csv

with gzip.open('cashfree_april2026_transactions.csv.gz', 'rt', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        # row['Amount'], row['Payment Mode'], row['Payment Mode SubType'], etc.
        pass
```

Or with pandas:
```python
import pandas as pd
df = pd.read_csv('cashfree_april2026_transactions.csv.gz', compression='gzip')
```

## Payment Mode values in this file

| Payment Mode | Txn Count |
|---|---|
| UPI | 1,84,489 |
| CREDIT_CARD | 51,316 |
| UPI_CREDIT_CARD | 21,748 |
| UPI_OFFLINE_STATIC | 8,787 |
| Wallet | 6,936 |
| DEBIT_CARD | 4,343 |
| NET_BANKING | 1,310 |
| PAY_LATER | 1,185 |
| UPI_PPI | 957 |
| PREPAID_CARD | 162 |
| UPI_CREDIT_LINE | 142 |
| UPI_PPI_OFFLINE_STATIC | 45 |
| CREDIT_CARD_EMI | 14 |
