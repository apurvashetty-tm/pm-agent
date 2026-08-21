# FTC Priority in Assisted Commerce

**Owner:** Apurva Shetty · **Date:** 21 Aug 2026 · **Status:** For review
**Stakeholders:** Anbu Dhileepan, Abhishek Rao, Mandar Bondarde, Akshat Nayyar, Engineering, Analytics

---

## 1. Summary

Add a single FTC-priority lead-selection query in front of the existing Assisted Commerce "Assign Order" query. When an agent clicks Assign Order, the system first looks for an eligible **FTC cart above ₹700**. If none exists, it falls back to today's BAU query, unchanged.

This moves FTC cart-recovery calling out of a manual Google Sheet and into the portal, without new headcount, new tooling, or changes to how agents work.

**Build size:** one new query, one hardcoded constant, one CTA change. No new tables, no new columns, no UI build.

---

## 2. Why now

FTC calling was started manually on 7 Aug and immediately moved the numbers:

| | Jun'26 | Jul'26 | Aug'26 (1–13) |
|---|---|---|---|
| FTC orders | 713 | 779 | 674 |
| FTC value | ₹27.5L | ₹35.4L | ₹21.9L |
| **FTC share of orders** | 3.0% | 2.9% | **5.4%** |

The constraint is not opportunity — it is process. Today FTC leads are pulled from Metabase cards, downloaded and sorted by hand, assigned to agents individually, opened by pasting the Order ID into the URL, and dispositions are logged in a Google Sheet. ~12–15 agents attempt ~1,500 of ~10,169 daily FTC incomplete orders, at roughly one-third of potential capacity, with FTC CAC reduction flagged as a company priority.

Putting FTC selection into the portal removes the manual lead-handling step entirely.

**Why a threshold is required.** Calling all FTC carts would consume the entire agent base and starve NFTC — the customers currently generating business. The AOV threshold is what prevents that, and it is the only throttle in this design.

---

## 3. Why ₹700

Two independent reasons land on the same number.

**Delivery fee.** Carts below ₹550 attract a delivery fee, rising steeply as cart value falls. "Delivery charges" is already ~9.3% of FTC cancellation reasons, and it is an objection the agent has no authority to resolve. A ₹700 floor keeps the entire FTC-priority lane above the free-delivery line, with buffer for a customer removing an item mid-cart.

**Agent capacity.** FTC inflow is heavily back-loaded — ~39% of carts drop outside a 09:00–21:00 calling window, peaking at ~718/hour around 22:00. That leaves roughly **3,470 unworked FTC carts in the queue every morning at 09:00**. Unfiltered, clearing that backlog alone would occupy the full agent base until roughly 16:00 every day, and NFTC would get nothing.

At ₹700:

| | Without threshold | At ₹700 |
|---|---|---|
| FTC carts/day | ~10,169 | **~2,300** |
| Morning backlog at 09:00 | ~3,470 | ~800 |
| Time to clear backlog | ~7 hrs | **~1.5–2 hrs** |
| Share of agent dials | ~100% | **~23%** |

~23% of dials to FTC leaves ~77% for NFTC. The threshold does the throttling on its own — no cap, no ratio, no counter.

*Volume figures at ₹700 are interpolated from the reported AOV buckets (~7,200/day below ₹500; 8,869/day below ₹1,000) and should be confirmed against live data before launch.*

**₹700 is a starting point, not a final answer.** It is derived from the delivery-fee floor and from capacity arithmetic — neither of which says anything about which carts actually convert. Analytics will model **conversion probability at AOV-bucket level** using the manual FTC calling data accumulated to date and continuing until this ships, **across the full AOV range** rather than only the band around the threshold. That lets us reset the threshold on expected conversion × order value per bucket, and leaves us with a per-bucket baseline we can reuse for later prioritisation work and card definitions. We expect to revise ₹700 on the back of it.

---

## 4. How it works

**Agent clicks "Assign Order" → Query 1 → if no result → Query 2.**

**Query 1 — FTC priority (new).** Today's BAU query with two additions: `is_ftc` and a ₹700 floor.

```sql
SELECT iod.*
FROM   incomplete_order_details AS iod
       INNER JOIN order_details AS od ON iod.order_id = od.order_id
WHERE  od.orderstatus = 49 AND iod.orderstatus = 49
   AND iod.is_ftc                                                  -- NEW
   AND iod.order_value > 700                                       -- NEW (BAU uses 900)
   AND iod.is_active
   AND iod.cx_modified_on >= NOW() - INTERVAL 1 DAY
   AND iod.cx_modified_on <= NOW() - INTERVAL 30 MINUTE
   AND iod.eligible_for_ranking
   AND iod.assigned_to IS NULL
   AND (iod.rank_again_after IS NULL OR iod.rank_again_after <= NOW())
ORDER BY iod.final_score DESC, iod.order_value DESC
LIMIT 1;
```

**Query 2 — BAU (unchanged).** Today's Assign Order query exactly as it is today, ₹900 floor included. It is the fallback and is **not modified**.

**Note the direction of the floor.** ₹700 is **lower** than BAU's ₹900, so Query 1 is not a subset of Query 2 — it deliberately admits FTC carts in the ₹700–900 band that the portal has never served before.

**Re-attempts work exactly as they do today.** When an agent cannot reach a customer, they put the order on hold. The order leaves the queue for a cool-off period, then re-enters it and is served to the next agent who clicks Assign Order. There is no cap on attempts — the agent can see how many attempts have already been made on the order and decides whether to call it again. FTC leads sit in the same queue and inherit this behaviour unchanged. **No retry logic is being built.**

---

## 5. Out of scope

- **The BAU query is not modified.**
- No dedicated FTC agent pool or agent categorisation — all agents get FTC-first.
- No retry / re-attempt engine — hold-order already covers it.
- No changes to `final_score`, `rank_again_after`, `eligible_for_ranking`, `is_active`, or the 30-minute / 1-day activity window on `cx_modified_on`.
- No configurable threshold in this phase (see §8).
- No coverage for FTC carts below ₹700 (~7,900/day) — unchanged from today, where they are also not called.
- No holdout or incrementality experiment.

---

## 6. Known call-outs — accepted, not blocking

**FTC flag.** We use `incomplete_order_details.is_ftc`. This flag is derived from `order_details` with additional run-time computation before it is set. The derivation is not documented and has not been validated against the canonical FTC definition (first *delivered* order). **Accepted as-is.** Known edge case: if the flag inherits `order_details.is_ftc_order` behaviour, a customer with several in-flight carts may be treated as FTC on all of them. This affects prioritisation fairness, not queue correctness. If FTC-lane conversion materially underperforms, this flag is the first thing to re-examine.

**Threshold is hardcoded.** ₹700 is a constant in this phase. Any change requires a deployment. Accepted deliberately to keep the build small.

**Delivery fee.** The ₹700 floor sits above the level at which delivery fees apply, so the delivery-charge objection is structurally out of scope for this lane. It only returns if the threshold is lowered materially.

**Sheet cutover.** Manual Google Sheet calling stops once this is live. **Sequencing dependency:** the portal flow must be live and verified *before* the sheet process is switched off, so there is no FTC coverage gap on cutover day.

---

## 7. Measuring it

**Primary:** FTC orders and FTC order value per day originating from the portal lane.
**Tripwire:** NFTC attempts per day — the signal that FTC-first is starving the BAU lane.

Because the manual FTC push already moved August's numbers, a clean before/after is not available and there is no holdout. Read these descriptively.

**Two Metabase cards — product suggestion, for Analytics to scope:**

1. **Below-threshold FTC leads.** A list of FTC carts between ₹550 and ₹700 — leads the query is skipping *only* because they fall under the threshold. Shows order ID, order value, how long the cart has been waiting, and `final_score`. If the FTC queue empties and agents still have time, a TL can pick from this list and assign the leads by hand. Without it, calling a ₹650 cart would require changing the threshold, which means a deployment.
2. **FTC vs NFTC split card.** Assignments split FTC vs NFTC **by hour**, plus FTC backlog depth at 09:00. The by-hour cut matters more than the daily total — a healthy daily average can still hide NFTC receiving nothing until midday.

These are good-to-have suggestions from Product. Definition and build sit with Analytics.

---

## 8. Open questions

| # | Question | Owner |
|---|---|---|
| 1 | What NFTC attempts/day constitutes "starved"? Needed to make the tripwire card actionable. | Business + Analytics |
| 2 | Confirm the ~2,300/day volume at ₹700 against live data before launch (current figure is interpolated). | Analytics |
| 3 | Model conversion probability by AOV bucket using all manual FTC calling data to date (continuing until this ships), across the full AOV range — not only the band around ₹700. Recommend a revised threshold. Output should stand as a reusable per-bucket baseline. | Analytics |
| 4 | Confirm how `final_score` is composed on `incomplete_order_details`, so the bucket analysis does not double-count AOV. Our current understanding is **unverified**: `final_score = aov_score × connected_percentage_score × converted_percentage_score × substitution_possible_score`. This fits a 100-row sample exactly, but `converted_percentage_score` is `1` on 99 of those rows and is therefore effectively untested. Note that `final_score` already embeds AOV via `aov_score`, so ordering by it re-applies value on top of the threshold. | Engineering + Analytics |
| 5 | Scope and build the two Metabase cards. | Analytics |

---

## 9. Phase 2

Make the ₹700 threshold configurable so it can be tuned without a deployment. To be raised as a separate Jira after Phase 1 ships. Not in scope now.
