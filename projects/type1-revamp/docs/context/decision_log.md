# decision_log.md — Type 1 Revamp

Dated decisions. Newest at the bottom. Each links to the narration entry it came from. Superseded decisions stay here, marked as superseded.

| ID | Date | Decision | Why | Source |
|---|---|---|---|---|
| D01 | 2026-10-05 | **Stepwise process:** Evaluation → Critique → Brainstorm → Finalise. Never move to the next step without explicit confirmation. | Avoid unnecessary rework. | Entry 1 |
| D02 | 2026-10-05 | Competitive comparison is **Truemeds vs 1mg only**. PlatinumRx screens excluded. | User instruction. | Entry 2 |
| D03 | 2026-10-08 | **Project scope:** W1 OMS (order → request status change + Type 1 allocation); W2 pharmacist portal: fix + enhance, reuse first (W2a Type 1 leads → ACOM, W2b search, W2c OOS instrumentation, W2d coupons), covering the Type 1 order flow and the Create Order flow; W3 app journey. | Comprehensive Type 1 revamp. | Entry 3 |
| D04 | 2026-10-08 | Work **one workstream at a time**, aiming for **minimum effort, maximum impact**, then close it. | Close the project fast. | Entry 5 |
| D05 | 2026-10-08 | **No app release** for current workstreams (app in experimentation). Backend + portal only. App-side fixes (success screen, payment-before-amount, early ETA, rating/reminder prompts) parked. | App release too slow. | Entry 6 |
| D06 | 2026-10-08 | W1 engagement options narrowed to **B-lite** (L1 backend status/metrics/notification copy; L2 portal "send for approval" via WhatsApp). **Level choice still open.** | Follows D05. | Entry 6 |
| D07 | 2026-10-08 | **Business targets:** OP 1,333 → 1,750/day; OD 133 → 250/day; OP→OD 10% → 14.3%. Levers: Assisted Commerce, Allocation, Engagement, Coupon, OOS Recovery. | Opportunity scoping sheet. | Entry 7 |
| D08 | 2026-10-08 | **Allocation reference:** Pharmacist Type 1 queue, **LIFO**, **Rank-Up**. | Confirmed by Swapnil. | Entry 9 |
| D09 | 2026-10-08 | **Isolate Type 1.** No allocation/ranking logic from other modules (doctor pool, HGS, ACOM, Project South). Parked separately. | Avoid false assumptions. | Entry 11 |
| D10 | 2026-10-09 | **Pharmacist hours** assumed **09:00–19:00**. | Working assumption. | Entry 12 |
| D11 | 2026-10-09 | **Hold** = call not connected → order out of the queue for **1 hour**. **Schedule** = customer explicitly asks to delay the call. | Confirmed meaning. | Entry 12 |
| D12 | 2026-10-09 | **Discovery problem:** after-hours Type 1 orders are reached last (LIFO buries them; no escalation; no wait-time visibility). | Matches the Allocation lever. | Entry 12 |
| D13 | 2026-10-09 | **Allocation improvement scope A1–A6:** next-order button; wait-time column/sort by age; claim time limit; shift awareness; after-hours rule; queue-build-up alert. | In scope to improve. | Entry 12 |
| D14 | 2026-10-09 | Project lives at **`projects/type1-revamp/`** with `CONTINUITY.md` as the session entry point. | Continuity across sessions. | Entry 13 |
