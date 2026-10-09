# project_truth.md — Type 1 Revamp
**Status:** v1, seeded 2026-10-09 from facts Swapnil confirmed (see `decision_log.md`). **Only Swapnil changes this file.** Agents propose; they don't self-lock.
**Owner:** Swapnil Singh
**Last updated:** 2026-10-09

---

## 1. Product definition
Type 1 = an order where the customer uploads **only a prescription** (`ORDER_TYPE 52`). A pharmacist reads the Rx, builds the cart (digitises) and calls the customer. This project revamps how that upload becomes an order, how the Type 1 queue is allocated, and how the pharmacist portal converts it.

## 2. Confirmed problems
- Today an **order is created and "Order placed" is shown at Rx upload**, before the customer sees medicines or price. This is wrong; 1mg's "request → cart → order" is the reference. [D03, Entry 1]
- **After-hours Type 1 orders are reached last** and lose intent. [D12]
- Portal: search is poor and hides unavailable medicines; no OOS data; coupons not comprehensive; abandoned Rx uploads produce no lead. [D03]

## 3. Confirmed current logic (Type 1 queue)
- Type 1 orders enter the **Pharmacist Type 1 queue** for digitisation. [D08]
- Processing order: **LIFO**. **Rank-Up** moves an order to the top. [D08]
- **Hold:** call not connected → out of the queue for 1 hour. **Schedule:** customer-requested delay. [D11]
- Pharmacist hours: **09:00–19:00** (assumption). [D10]

## 4. Confirmed constraints
- **No app release** for current workstreams; backend + portal only. [D05]
- **Type 1 isolated:** no other module's allocation logic. [D09]
- One workstream at a time; min effort, max impact. [D04]
- Stepwise process with explicit go-ahead. [D01]

## 5. Targets
OP 1,333 → 1,750/day · OD 133 → 250/day · OP→OD 10% → 14.3%. [D07]

## 6. Not locked yet
Which B-lite level for engagement; allocation fixes for A1–A6; the OP definition under a request model; lead rules for abandoned Rx; search/OOS/coupon designs. See `open_questions.md`.
