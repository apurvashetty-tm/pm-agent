# Type 1 Allocation: Current Logic (Type 1 only)

Date: 2026-10-08 (updated 2026-10-09) · Status: **Current-state capture — awaiting go-ahead to brainstorm allocation**

> **Scope rule [USER-PROVIDED, 2026-10-08]:** Type 1 only. Allocation logic from other modules (doctor pool, ACOM, Project South, HGS) is **not** applied here. That material is parked in `parked-other-module-allocation.md` for reference only.

Tags: `[CONFIRMED]` you confirmed · `[DOC]` PM-agent repo · `[CODE]` pharmacist portal v4.8.8 · `[OPEN]` not documented.

---

## 1. Type 1 queue: reference logic

| Rule | Detail | Tag |
|---|---|---|
| **Entry** | Type 1 orders (`ORDER_TYPE 52`, Rx only) enter the **Pharmacist Type 1 queue** for first-attempt digitisation. (Type 2/3 don't enter this queue.) | `[DOC]` tm-chotu |
| **Pharmacist work** | Open order → view customer, past orders, Rx, ratings, subs history, CSR tickets → **validate Rx** → Digitize Order, or Discard Order, or Mark Unreachable. | `[DOC]` tm-chotu |
| **Order of processing** | **LIFO**: newest order first. | `[CONFIRMED]` |
| **Rank-Up** | Moves an order to the top of the queue, ahead of LIFO. Used when the customer signals they're available (e.g. calls CSR asking for a callback → CSR presses the CTA on the Pharmacist Portal). | `[CONFIRMED]` + `[DOC]` rank-up-order-priority |
| **Hold** | Call attempted but **not connected** → order moves **out of the queue for 1 hour**, then returns. (Portal message: "not resolved by the admin. Please wait.") | `[CONFIRMED]` |
| **Schedule** | Customer **explicitly asks** to be called later → order is held until the requested time. (Portal: callback date/time on the Unreachable/call flow.) | `[CONFIRMED]` |
| **Pharmacist hours** | **09:00–19:00** (working assumption). Outside these hours (19:00–09:00, 14 h) the queue isn't worked. | `[CONFIRMED]` assumption |
| Rank-Up statuses | `235 ORDER RANK INCREASED`, `613 ORDER_RANK_INCREASED_TO_MAX` (order-level codes) | `[DOC]` tm-chotu |

---

## 2. Type 1 in the pharmacist portal: how orders reach a pharmacist `[CODE]`

| Mechanism | How it works |
|---|---|
| **Queue lists** | **New Orders**, **Order Type 1** (`getneworderlist`), **Pending Verification**. The server decides which orders appear and in what order. 10 rows per page. |
| **Claim on open (pull)** | Pharmacist clicks any row → server lock check (`role=CHECKER`) → `Proceed` (order is theirs); or `Hold` ("not resolved by the admin"); or "already assigned to another Pharmacist". |
| **Manual push** | Only a **super-pharmacist** can bulk-select orders and Assign / Unassign to a named pharmacist (`setPharmacistIdToOrder`). The list can be filtered by assignee. INVALID ORDER rows can't be assigned. |
| **Columns shown** | Order ID, date, mobile, name, pincode, status, payment, attempted calls, unreachable flag, assignee. Sortable only by attempted calls and unreachable (client-side, visible page only). |
| **Rank-Up on the Type 1 list** | **Not available.** The portal's rank-up call (`increaseDigitizedOrderRank`) sits on the Post Orders screen and targets *digitised* orders. |
| **Type 1 dashboard** | Date range → Total, Assigned, Discarded, Unreachable counts only. |

**Not present for Type 1** `[CODE]`:
- No auto-assign / "give me next order"
- No order-age or wait-time column; no sort by age
- No time limit after claiming; no auto-release
- No pharmacist shift / availability awareness
- No rule for orders that arrive outside working hours
- No auto-refresh of the list
- No alerts when the queue builds up

---

## 3. Discovery: problem to solve [CONFIRMED as problem statement, 2026-10-09]

**After-hours Type 1 orders are reached last and lose intent.**

1. Orders arrive overnight (19:00–09:00) while nobody is working the queue.
2. In the morning, newest-first (LIFO) ordering puts fresh uploads on top, so overnight customers are reached last, hours later.
3. Nothing raises them back up unless the customer escalates (Rank-Up).
4. Without a wait-time column, a super-pharmacist can't even see who has waited longest.

Matches the sizing sheet lever: "Allocation: after-hours orders not called/allocated in time → cancellations".

**Discovery questions to answer with data:**
- Share of Type 1 uploads between 19:00 and 09:00.
- Time to first pharmacist call by upload hour.
- Outcome (delivered / discarded / unreachable / cancelled) by wait time.
- How often Hold (1 h) and Schedule fire, and their outcomes.

---

## 4. Scope for improvement [CONFIRMED, 2026-10-09]

Gaps in today's Type 1 allocation, all **in scope** to improve:

| # | Gap | Today |
|---|---|---|
| A1 | No "next order" button (auto-assign) | Pharmacist picks any row; super-pharmacist assigns by hand |
| A2 | No wait-time column, no sort by age | Can't see who has waited longest |
| A3 | No time limit once an order is claimed | A claimed order can sit with one pharmacist indefinitely |
| A4 | No shift awareness | Queue doesn't know who's working |
| A5 | No rule for orders that arrive after hours | Overnight orders compete with fresh LIFO uploads |
| A6 | No alert when the queue builds up | Nobody is told when the queue grows |

---

## 5. Open items (Type 1 only)

1. ~~Pharmacist working hours~~ → assume **09:00–19:00** `[CONFIRMED]`. Headcount by hour still `[OPEN]`.
2. ~~What does Hold mean~~ → call not connected → out of queue for **1 hour** `[CONFIRMED]`. Is there a cap on how many times an order can be held? `[OPEN]`
3. Is the Type 1 queue **pure LIFO**, or is there any time-of-day rule in the backend? `[OPEN]`
4. Does Rank-Up (235/613) work on **undigitised** Type 1 orders in the backend? `[OPEN]`
5. Does a held or scheduled order re-enter the queue by LIFO position (i.e. on top) or at its original time? `[OPEN]`
