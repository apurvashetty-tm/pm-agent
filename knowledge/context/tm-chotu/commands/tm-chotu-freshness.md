---
description: Probe data freshness on key Redshift tables (DB 170). Tells user how stale the numbers are right now.
---

# tm-chotu freshness

Run light queries on DB 170 via `mcp__Metabase__execute`:

```sql
-- 1. Order pipeline freshness
SELECT MAX(created_on) AS last_order, MAX(modified_on) AS last_mod
FROM tmmumpsdb.order_details;

-- 2. Order status transitions
SELECT MAX(modified_on) AS last_transition
FROM tmmumpsdb.order_status;

-- 3. Invoice freshness
SELECT MAX(created_on) AS last_invoice
FROM tmmumpsdb.final_calculated_amount;

-- 4. Attribution freshness
SELECT MAX(created_on) AS last_attribution
FROM tmmumpsdb.orders_campaign_attribution;

-- 5. Substitution mapping freshness (Mumbai hub as proxy)
SELECT MAX(modified_on) AS last_subs_map
FROM tmmumpsdb.org_sub_medicine_mapping_mumbai_hub_new_algo;

-- 6. NetSuite invoice freshness
SELECT MAX(created_on) AS last_ns_invoice
FROM tmmumpsdb.net_suite_invoice_batch;
```

Compute lag (now − last_timestamp) for each. Show table:

| Source | Latest | Lag (vs now) | Status |
|---|---|---|---|
| order_details | <ts> | <Xh / Xm / Xd> | ✓ if <1h, ⚠️ if <6h, 🔴 if >24h |
| order_status | <ts> | <…> | <…> |
| final_calculated_amount | <ts> | <…> | <…> |
| orders_campaign_attribution | <ts> | <…> | <…> |
| org_sub_medicine_mapping_mumbai_*_algo | <ts> | <…> | <…> |
| net_suite_invoice_batch | <ts> | <…> | <…> |

Caveman output. End with one-line verdict on whether DB is fresh enough for daily reporting.
