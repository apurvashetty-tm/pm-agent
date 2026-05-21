# [PRD] Promise Buffer Enhancement

**Document type:** Executable PRD
**Author:** Tejas Bhalerao
**Date:** 2026-05-17
**Status:** Approved (2-pass review complete — 0 P0s, 0 P1s)
**Version:** v1

---

## RACI

| Role | Person / Team | Responsibility |
|---|---|---|
| **Responsible** | Tejas Bhalerao (Product) | Write PRD, define requirements, coordinate delivery |
| **Responsible** | Engineering (Backend + Frontend) | Build and ship the feature |
| **Accountable** | Kartik (VP Product/Finance) | Final approval on scope and launch |
| **Consulted** | Anbu (Chief Ops Officer) | Define buffer values, validate ops impact |
| **Consulted** | Logistics Ops Team | Validate SLA assumptions, test buffer values in staging |
| **Consulted** | Customer Support | Provide signal on promise-related complaints |
| **Informed** | Ashish (CEO) | Aware of launch and OTD% impact |
| **Informed** | Data / Analytics | Instrument metrics and build dashboards |

---

## Objective

Enable ops to configure a delivery promise buffer (in hours) per vertical so that customer-facing delivery promises are padded enough to be reliably met, improving OTD% while reducing rushed fulfillment and logistics strain.

---

## Why Now?

Three converging pressures make this the right moment:

1. **OTD% is a tier-1 metric.** On-time delivery directly affects customer trust, repeat purchase rate, and NPS. Any improvement here has compounding downstream value.
2. **Rush fulfillment is an avoidable cost.** Without a buffer, orders that land close to the fulfilment cutoff require expedited handling — creating logistics strain, higher error rates, and increased courier cost. A configurable buffer eliminates the structural cause rather than treating the symptom.
3. **Ops already knows the right buffer values.** This is not a research problem. Anbu's team has operational intuition about how much buffer each vertical needs. This feature simply gives them the knob to turn. Build time is low; payoff is immediate.

---

## Use Cases

### UC-1: Ops sets a global delivery promise buffer

**Actor:** Ops Admin (Anbu's team)
**Precondition:** Ops Admin is logged into the Truemeds ops console.

| Sub-case | Condition | Expected outcome |
|---|---|---|
| UC-1a: Set buffer for all verticals | Admin enters a buffer value (e.g., 2 hours) and selects "Apply to all verticals" | All delivery promise calculations across Hyperlocal Forward, Hyperlocal Reverse, Courier Forward, Courier Reverse, B2B Forward, B2B Reverse are padded by 2 hours |
| UC-1b: Buffer is set to 0 | Admin enters 0 | System reverts to original promise logic — no padding applied. Existing behaviour preserved. |
| UC-1c: Buffer exceeds system maximum | Admin tries to enter a value above the allowed ceiling (configurable; suggested default max = 24 hours) | System blocks the save and displays an inline error: "Buffer cannot exceed [max] hours. Please enter a valid value." |

---

### UC-2: Ops sets a per-vertical delivery buffer

**Actor:** Ops Admin
**Precondition:** Ops Admin is on the buffer configuration screen.

| Sub-case | Condition | Expected outcome |
|---|---|---|
| UC-2a: Different buffers per vertical | Admin sets 3 hours for Courier Forward, 1 hour for Hyperlocal Forward, 0 for B2B Forward | Each vertical uses its own buffer independently. Promise logic for each vertical reads its own config value at runtime. |
| UC-2b: Some verticals set, others left default | Admin configures 3 of 6 verticals; 3 remain at their default (0 or inherited global value) | Unconfigured verticals fall back to the global buffer. If no global buffer is set, they use 0. |
| UC-2c: Admin updates a vertical's buffer mid-day | Buffer for Courier Forward is changed from 3h to 5h at 14:00 | All promise calculations from 14:00 onward use the new value. Orders whose promise was already communicated to the customer are not retroactively changed. |

---

### UC-3: Customer sees buffered delivery promise at checkout

**Actor:** Customer
**Precondition:** Buffer is configured and active for the relevant vertical.

| Sub-case | Condition | Expected outcome |
|---|---|---|
| UC-3a: Standard order | Customer checks out on Hyperlocal Forward with a 1h buffer set | Customer sees a delivery promise that includes the buffer window. Internally: `promise_time = base_promise + buffer`. Customer-facing time reflects the padded value. |
| UC-3b: Express checkout / same-day | Customer is in an express flow where promise is shown pre-checkout (e.g., "Get it in 2 hours") | Buffer is applied to this estimate too. The pre-checkout promise and the post-checkout promise must be consistent — no promise inflation/deflation between screens. |
| UC-3c: No slots available after buffer | After applying the buffer, no valid fulfilment slot exists within the promise window across all hubs | System shows the next available slot with the buffer applied, or "Not available for same-day delivery." Does not promise an unfulfillable time. |
| UC-3d: Partial hub availability after buffer | One of multiple hubs has a slot, others do not | System routes to the available hub. Customer sees a single promise — no hub-level exposure in the UI. If the available hub is materially further (affecting delivery time), the correct (longer) promise is shown. |

---

### UC-4: Ops views and audits buffer configuration history

**Actor:** Ops Admin / Ops Lead
**Precondition:** Buffer has been set or changed at least once.

| Sub-case | Condition | Expected outcome |
|---|---|---|
| UC-4a: View current config | Admin opens buffer configuration screen | Current buffer value per vertical is shown. If a global buffer exists, it is shown separately from vertical-level overrides. |
| UC-4b: View change history | Admin views audit log | Log shows: timestamp, who changed the value, previous value, new value, vertical affected. Retention: minimum 90 days. |
| UC-4c: Revert to previous value | Admin sees incorrect value and wants to revert | Admin can re-enter the old value manually. No auto-revert feature in v1; scope for v2. |

---

### UC-5: Edge cases and failure modes

| Sub-case | Condition | Expected outcome |
|---|---|---|
| UC-5a: Config service unavailable | Promise calculation service cannot read the buffer config at query time | Fail-safe: apply buffer = 0 (original behaviour). Do not block checkout. Log the config read failure for alerting. |
| UC-5b: Simultaneous edits by two admins | Two admins update the same vertical's buffer at the same time | Last-write-wins. Warning shown to the editor whose change was overwritten: "This config was updated by [user] at [time] while you were editing. Your change has been saved — please verify." |
| UC-5c: Buffer applied to already-promised order | An in-flight order was promised before a buffer change was made | Buffer change does not retroactively alter communicated promises. Only new orders use the new buffer. |
| UC-5d: Vertical is inactive / turned off | A vertical has no active fulfilment routes | Buffer config can still be set (pre-configured for when the vertical resumes). Promise calculation for that vertical simply returns no available slots. |

---

## Metrics

### Primary Metrics

| Metric | Definition | Baseline | Target | Timeframe |
|---|---|---|---|---|
| **OTD% (On-Time Delivery Rate)** | % of delivered orders where actual delivery time ≤ promised delivery time. `(orders delivered on or before promised_time) / (total delivered orders) × 100`. Measured per vertical and in aggregate. | To be established — pull last 30 days of delivery data before Stage 2 begins. Logged at Stage 2 entry. | +3–5 pp improvement over baseline | 8 weeks post Stage 4 (all-vertical rollout) |
| **Promise Breach Rate** | % of orders where the customer-facing promise was missed. `(orders where actual_delivery_ts > promised_time) / (total orders with a delivery promise) × 100` | To be established in Stage 2 shadow mode (minimum 500 orders per live vertical) | 20% relative reduction vs. baseline | 8 weeks post Stage 4 |

> **Instrumentation dependency (required for Stage 1 sign-off):** Both `base_promise_ts` and `buffered_promise_ts` must be written to the order record at checkout. Without this, Stage 2 shadow comparison has no data. Engineering must implement this in Stage 1 — verify with a test order before Stage 2 begins.

---

### Secondary / Guardrail Metrics

| Metric | Definition | Baseline | Target / Guardrail | Timeframe |
|---|---|---|---|---|
| **Fulfilment Rush Rate** | % of orders where fulfilment completion falls within 15 minutes of `base_promise_ts`. Proxy for logistics strain. `(orders completed within 15min of base_promise_ts) / (total orders) × 100` | To be established in Stage 2 shadow mode | 25% relative reduction vs. baseline | 8 weeks post Stage 4 |
| **Checkout Conversion Rate** | % of customers who initiate checkout and complete the order. Guardrail — buffer must not inflate the promise so much that it deters purchase. | Current rate — pull from analytics before Stage 3 | No degradation > 0.5 pp vs. pre-buffer baseline | Monitored daily from Stage 3 onward |
| **Buffer Utilisation Rate** | % of orders where `actual_delivery_ts` falls in the window `[base_promise_ts, buffered_promise_ts]`. Orders that would have been breaches without the buffer. | N/A (new metric) | Healthy: 20–40%. Below 5% = buffer too small. Above 80% = base promise calculation is structurally broken. | Monitored weekly from Stage 3 onward |
| **Config Change Frequency** | Number of times ops adjusts the buffer per vertical per week. High frequency = buffer is compensating for a structural problem. | N/A (new metric) | < 2 changes/vertical/week on average after Week 2 of rollout | Ongoing |

---

## Rollout & Stage Gates

### Stage 1 — Build & Internal Config Validation (Week 1–2)

**What ships:** Config UI in ops console, backend buffer logic, audit log, fail-safe behaviour.
**Who tests:** Ops Admin team (Anbu's team) in staging.

**Stage Gate criteria before Stage 2:**
- [ ] Config UI functional — values can be set, updated, and cleared per vertical and globally
- [ ] Audit log captures all changes with timestamp and actor
- [ ] Buffer = 0 produces identical output to pre-feature promise calculation (regression test passed)
- [ ] Fail-safe tested: config service unavailable → promise falls back to buffer = 0, checkout not blocked
- [ ] Max-value guardrail tested: values above ceiling rejected with correct error message
- [ ] Concurrent edit conflict tested: overwrite warning shown to losing editor
- [ ] **`promise_ts` (buffered) and `base_promise_ts` both written to order record at checkout — verified with a test order. This is a prerequisite for Stage 2 shadow data to be valid.**

---

### Stage 2 — Shadow Mode (Week 3)

**What ships:** Buffer calculated in the backend but **not** applied to the customer-facing promise. Both buffered and unbuffered promise values are logged side-by-side on every order.

**Purpose:** Validate that ops-chosen buffer values are sensible before customer exposure. Compare buffered promise vs. actual delivery time using shadow data.

**Stage Gate criteria before Stage 3:**
- [ ] Minimum 500 shadow orders collected per vertical being evaluated
- [ ] Shadow data shows that applying the configured buffer would have reduced promise breaches by ≥ 10% vs. the unbuffered baseline in the shadow period, **OR** ops explicitly confirms buffer values are operationally correct based on their review of the shadow data
- [ ] No promise inconsistency issues detected (pre/post checkout, express vs. standard)
- [ ] Ops has confirmed final buffer values for Stage 3 vertical

---

### Stage 3 — Single Vertical Live Rollout (Week 4)

**What ships:** Buffer applied to customer-facing promises for **Courier Forward** only.

> *Courier Forward selected as the Stage 3 pilot because: (a) highest order volume among forward verticals — reaches statistical significance faster; (b) courier-partner-driven SLAs are more predictable than hyperlocal routes, isolating the buffer's effect cleanly; (c) promise breach patterns are most visible in this vertical per ops team input.*

**Stage Gate criteria before Stage 4:**
- [ ] OTD% for Courier Forward is flat or improving vs. pre-rollout baseline after 7 days live
- [ ] Checkout conversion rate on Courier Forward shows no degradation > 0.5 pp
- [ ] Zero customer-facing promise inconsistencies reported by support
- [ ] No spike in fulfilment errors attributable to the buffer change
- [ ] Buffer Utilisation Rate is in the 5–80% range (not at either extreme)

---

### Stage 4 — All Verticals (Week 5–6)

**What ships:** Buffer rolled out to all remaining verticals with values confirmed in Stage 2 shadow data and Stage 3 live learnings.

**Success check at Week 8:**
- Primary metrics reviewed against targets
- Buffer Utilisation Rate reviewed per vertical — values adjusted if outside 20–40% range
- Config Change Frequency reviewed — if > 2 changes/vertical/week, escalate for root cause analysis

---

## Metrics Framework (Full Definition)

### M1 — OTD% `[PRIMARY]`

| Field | Value |
|---|---|
| **Definition** | `(orders delivered on or before promised_time) / (total delivered orders) × 100` |
| **Segmentation** | By vertical, by city, by hour-of-day |
| **Baseline** | Last 30 days pre-buffer. Logged at Stage 2 entry. |
| **Target** | +3–5 pp over baseline at 8-week mark |
| **Data source** | Order fulfilment events; delivery confirmation events |
| **Owner** | Data / Analytics (instrumentation); Product (target accountability) |

### M2 — Promise Breach Rate `[PRIMARY]`

| Field | Value |
|---|---|
| **Definition** | `(orders where actual_delivery_ts > promised_time) / (total orders with a delivery promise) × 100` |
| **Segmentation** | By vertical, by fulfilment slot type, by courier partner |
| **Baseline** | Stage 2 shadow mode (min 500 orders/vertical) |
| **Target** | 20% relative reduction vs. baseline by Week 8 |
| **Instrumentation note** | `promise_ts` and `base_promise_ts` persisted on order record at checkout — required by Stage 1 |

### M3 — Fulfilment Rush Rate `[SECONDARY]`

| Field | Value |
|---|---|
| **Definition** | `(orders where fulfilment completion ≤ 15min before base_promise_ts) / (total orders) × 100` |
| **Baseline** | Stage 2 shadow mode |
| **Target** | 25% relative reduction vs. baseline by Week 8 |

### M4 — Buffer Utilisation Rate `[SECONDARY — sizing signal]`

| Field | Value |
|---|---|
| **Definition** | `(orders where actual_delivery_ts ∈ [base_promise_ts, buffered_promise_ts]) / (total delivered orders) × 100` |
| **Target** | 20–40% healthy range. Action trigger if > 60% for 2 consecutive weeks. |
| **Monitored from** | Stage 3 onward, weekly |

### M5 — Checkout Conversion Rate `[GUARDRAIL]`

| Field | Value |
|---|---|
| **Definition** | `(orders completed) / (checkout sessions initiated) × 100` |
| **Baseline** | Pull from analytics pre-Stage 3 |
| **Guardrail** | No degradation > 0.5 pp vs. baseline |
| **Monitored from** | Daily from Stage 3 onward |

---

## Objection Map

*Generated automatically post sign-off. For alignment meeting preparation.*

### Anbu — Chief Ops Officer

- A single per-vertical buffer value will be wrong for peak vs. non-peak and metro vs. tier-2 geographies. The v1 scope may need to evolve to per-vertical-per-slot or per-vertical-per-city before it is fully useful at scale. *(source: Truemeds multi-geography operational model)*
- Changing the customer-facing promise without adjusting internal WMS pick targets or SLA triggers means warehouse teams still operate against unbuffered deadlines. The buffer must be paired with an ops process change to actually reduce rush. *(source: fulfilment trigger architecture — internal targets are set separately from customer-facing promise)*
- Audit log retention of 90 days may be insufficient for quarterly business reviews that need to correlate buffer changes against OTD% trends. *(source: standard quarterly ops review cadence)*
- B2B verticals may not reach 500 shadow orders per week — Stage 2 gate may block Stage 3 longer than anticipated for low-volume verticals. *(source: Truemeds vertical volume structure — B2B volumes are lower than consumer verticals)*

### Kartik — VP Product/Finance

- The +3–5 pp OTD% target is directional, not validated against a conversion trade-off model. Finance will want sensitivity modelling: at what buffer size does OTD% improvement get offset by conversion drop? The PRD has a guardrail but no optimum estimate. *(source: standard financial review for features with a conversion guardrail)*
- The feature pads a symptom rather than fixing root-cause promise inaccuracy. Engineering investment here may crowd out a more durable fix (dynamic slot availability, better SLA prediction). Explicit justification for buffer-first over root-cause-fix required. *(source: standard product strategy review — features that mask root causes require explicit justification)*
- No engineering effort estimate is included. Stage 1 instrumentation scope (audit log, dual `promise_ts` fields) may be larger than it appears. Slippage here compresses the full rollout timeline. *(source: standard product-engineering resourcing review)*

### Ashish — CEO

- Customer-facing promise inflation (even by 2 hours) could widen the gap vs. competitors offering faster promises. The PRD does not address customer messaging strategy or whether any mitigating communication is needed. *(source: competitive context — online pharmacy delivery is speed-sensitive)*
- A mis-set buffer (e.g., 12 hours by mistake) degrades customer experience at scale with no automated rollback. The PRD does not include alerting or an automated guardrail that triggers if conversion or OTD% drops materially after a config change. *(source: operational risk — manual config in production requires automated safety nets)*
- No revenue or retention hypothesis quantifies what a 3–5 pp OTD% improvement translates to in business outcomes. Leadership will expect this before committing to full rollout. *(source: standard CEO-level business case review)*

---

*This objection map is ready to use for your alignment meeting. If you want to address any of these in the doc before the meeting, amend the PRD and re-trigger PRD Reviewer — that will also re-run this mapper after the next sign-off.*
