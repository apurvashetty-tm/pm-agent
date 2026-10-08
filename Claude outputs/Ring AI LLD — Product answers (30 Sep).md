# Ring AI LLD — Product answers (30 Sep 2026)

For: Kartik A · From: Apurva (Product)

## 1. Answers to the open product decisions

| # | Question | Answer |
|---|---|---|
| 1 | Verdict and call-outcome SLA | **Under discussion** (see section 4) |
| 2 | Do-not-call as its own Ring label | Not a release-1 blocker. Build after release if Ring supports it. |
| 3 | Concurrent-call limits | Ring and Knowlarity confirmed ~17,500 simultaneous leads is fine. Set the counter limit per GTM phase. |
| 4 | Spoken PII in recordings / number on the "answered" event | Not a dev blocker. InfoSec clears it externally. Store recordings. |
| 5 | Languages | No effect on the build. Business and Ring handle it. |
| 6 | Hold reasons that mean "not reached" | All of them count: "Customer did not answer.", "Customer is not reachable/unavailable.", "Customer disconnected.", "Poor Network." **Exception:** "Order already placed." closes the lead. |
| 7 | 24 h timeout vs the 48 h window and 5-day fallback | 24 h everywhere. Drop both; turn the closure sweep on. |
| 8 | "Attempted by an agent" | The agent **dialled** the lead. Claiming alone doesn't count. |
| 9 | Overnight counts toward the 2 h pause? | Yes. |
| 10 | DECLINED | Treat as **Cold** (bottom tier), not the general pool. |
| 11 | RESCHEDULED | If Ring's webhook sends the callback time, schedule for that time and hand the lead back to the AI. If not, release it to the general pool. |
| 12 | Cold keeps the normal window | Yes. |
| 13 | Timeout before "outcome unknown" | **Under discussion** (same as #1) |
| 14 | Frequency cap: customer leg only; agent callback counts? | Yes to both. |
| 15 | ₹500 minimum AOV for the manual queue | By GTM phase, together with the AI. |
| 16 | GTM split | Last 2 digits of `customer_id`. Leads that fail AI eligibility stay in the manual queue. |
| 17 | Cold sample | Ops handles it. Nothing to build. |
| 18 | Agent dispositions / frontend | No frontend changes in release 1. |
| 19 | Callback routing | Same agent, falling back to the queue. |
| 20 | Invalid number | Close the lead, no retry. |
| 21 | Retiring the Hold button | Hold stays in release 1. Retire it once telephony-driven retries are live. |
| 22 | Leads without patient + address | Later. |
| 23 | Shared do-not-call list across portals | Later. |

**From your technical checklist:**
- **Human not-connected rows:** yes, write them for every agent hold (except "Order already placed."), and count them with AI attempts toward the limit of 4.
- **Manual assignment by order ID reaching a closed lead:** accepted as a release-1 gap.

## 2. Mismatches with the PRD — changes needed

| # | Area | Change |
|---|---|---|
| 1 | Callee name | **Patient name first**; customer name only as the fallback. |
| 2 | Callee variables | Add **total MRP, selling price, total savings**. Keep `previously_bought`. |
| 3 | Hot/Warm tier order | **Hot FTC > Hot NFTC > Warm FTC > Warm NFTC**. |
| 4 | Hold-time | **24 h**, not 36. |
| 5 | Retry limit | AI attempts + human holds together, up to **4**. At 4, the lead is excluded from the AI picker **and** the agent Assign button. "Order already placed." closes the lead. |
| 6 | Frequency cap | **3 connected calls in a rolling 7 days** (AI + human). Beyond that, the lead is excluded from the AI picker and the Assign button. |
| 7 | Pause rule / stale | Waiting ends when an agent **dials** the lead, not when they claim it. |
| 8 | DECLINED | Cold tier, not the general pool. |
| 9 | RESCHEDULED | As answer #11 above. |
| 10 | 24 h window | Drop the ~48 h calendar-day window and the 5-day fallback. |
| 11 | GTM split | Picker filters on the last 2 digits of `customer_id` per phase: 00–04 → 00–24 → 00–49 → all (₹900+), then ₹500 at 00–74 → all. |
| 12 | Invalid number | Close the lead, no retry. |
| 13 | Recordings | Store them. |

## 3. Known gaps accepted for release 1

- **No do-not-call capture** on either channel.
- **No frontend changes:** the Hold button stays, and the call button isn't blocked by the backend.
- **Manual assignment** by order ID can still reach a closed or capped lead.

## 4. Still under discussion

Verdict and call-outcome handling. This covers when a lead becomes "outcome unknown", how a call that didn't connect is detected, retries, and the short-drop retry. **Please hold reaper changes until we close this.**
