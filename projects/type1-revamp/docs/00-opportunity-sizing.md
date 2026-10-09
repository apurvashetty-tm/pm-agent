# Type 1: Opportunity Sizing (user-provided, 2026-10-08)

[USER-PROVIDED] figures. My checks and derived numbers are marked [DERIVED].

## Targets

| Funnel | Current | Target | Opportunity |
|---|---|---|---|
| OP / day | 1,333 | 1,750 | +417 |
| OP / month | 40K | 52.5K | +12.5K |
| OD / day | 133 | 250 | +117 |
| OD / month | 4K | 7.5K | +3.5K |
| OP → OD | 10% | 14.3% | +4.3 pp |
| OP GMV / month @ ₹1.5K AOV | ₹6 Cr | ₹7.88 Cr | +₹1.88 Cr |

Bottom line: +12.5K OP/month → +₹1.88 Cr OP GMV/month; +3.5K OD/month → +₹52.5L delivered GMV/month.
Arithmetic checks out. [DERIVED]

## Levers

| Lever | Current gap | Expected impact | Workstream |
|---|---|---|---|
| Assisted Commerce | 55K stagnant opportunities/month | +10K OP/month | W2a (leads → ACOM) |
| Allocation | After-hours orders not called/allocated in time | Fewer cancellations → ↑ OD | **W1** |
| Engagement | Rx upload → order placement lacks clarity | Less surprise/cancellation → ↑ OD | W1 / W3 (order → request) |
| Coupon | Agents cannot apply coupons | ↑ conversion → ↑ OD | W2d |
| OOS Recovery | ~10K orders impacted by OOS | Substitute search → recover OD | W2b + W2c |

## Where the +3.5K OD actually comes from [DERIVED]

| Source | OD / month | Share |
|---|---|---|
| Volume: +12.5K OP at today's 10% conversion | +1.25K | ~36% |
| Conversion: 10% → 14.3% on 52.5K OP | +2.25K | ~64% |

→ **Two-thirds of the delivered-order gain has to come from conversion levers** (Allocation, Engagement, Coupon, OOS), not from new leads.

- Assisted Commerce's +10K OP at 10% conversion = **+1K OD**. Agent-built carts may convert better; to be validated.
- **+2.5K OP of the +12.5K target isn't attributed to any lever.** `[OPEN]`

### OOS sensitivity [DERIVED]
~10K OOS-impacted orders/month (= ~25% of today's OP).

| Recovered to delivery | OD / month | Delivered GMV / month |
|---|---|---|
| 10% | +1K | +₹15L |
| 20% | +2K | +₹30L |
| 30% | +3K | +₹45L |

Each +1K OD ≈ +₹15L delivered GMV/month.

## Tensions to resolve

1. **The OP definition changes if we move to "request".** Today a Type 1 OP is counted at Rx upload. If uploads become requests (W1 Engagement), OP drops by definition while real orders don't. Targets should be re-stated as **Rx requests → confirmed → delivered**, or OP kept as "Rx submitted" for this project's baseline. `[OPEN]`
2. **"Allocation" in this sheet = after-hours call/assignment latency**, not the order → request change. W1 should cover both. `[CONFIRM]`
3. OD conversion of only 10% means ~90% of Type 1 OPs never deliver. The split of that 90% (discarded / unreachable / cancelled / OOS) decides lever priority.

## Data needed to rank levers
- Monthly Type 1 OP split by outcome: delivered / discarded (by reason) / unreachable / cancelled (by reason) / OOS-impacted.
- Rx uploads by hour of day × time to first pharmacist call × outcome (sizes the after-hours lever).
- "OOS-impacted" definition: any line OOS, or the whole order? Share of those with an available substitute.
- Assisted Commerce: what "55K stagnant opportunities" are (Rx uploaded, not submitted?) and the expected OP → OD of agent-built carts.
