# W1a OMS: "Pending Verification" Request State + Enhancements

Date: 2026-10-12 · Status: **Brainstorm round 2 done (picks in §7) — awaiting go-ahead to Finalise W1a**
Builds on `06-brainstorm-oms-request-state.md`. Constraints: Type 1 only (R2), no app release (R3), min effort / max impact (R4).

---

## 1. Confirmed direction (2026-10-12) `[CONFIRMED]`

1. **Every Type 1 action by the customer is a request, not an order.**
2. There is an **intermediate state: Pending Verification.**
3. The **order is created and verified by the pharmacist** in the **Type 1 portal**.

This answers 06's Q1 in principle: the order is created at the pharmacist step, not at upload.

### ⚠ Naming clash to resolve first `[CODE]`
The portal **already has a status called `PENDING VERIFICATION`**. Today it means *digitised, waiting for the patient call*: the Type 1 list routes it to the **Patient Call** screen, and it has its own "Pending Verification" queue page. Reusing the name for the new request state would mix two different stages in routing, lists and reports.
→ **Q1 below:** pick a distinct name for the new state (e.g. `RX REQUEST – PENDING VERIFICATION`, or rename the existing one).

---

## 2. Proposed state model (Type 1 only)

```
Customer submits Rx (+ patient + address)
        │
        ▼
[R1] RX VERIFICATION PENDING  ← not an order; not counted in OP; customer comms say "request"
        │  pharmacist claims it in the Type 1 portal
        ▼
[R2] IN REVIEW (pharmacist tags: Prescription / Not a prescription; no validity gate, D36)
        │
        ▼  Rx valid → digitise
[R3] CART BUILT (awaiting customer confirmation on the call)
        │  call outcome
        ├── not connected ─► [R4] HOLD (1 h, back to queue)        [CONFIRMED meaning]
        ├── "call me at T" ─► [R5] SCHEDULED (until T)               [CONFIRMED meaning]
        ├── declined / N failed attempts / X h ─► [R6] ABANDONED ─► ACOM lead (06 §5)
        ▼  customer agrees
[O1] ORDER CREATED  ← pharmacist presses "Create order"; OP counted here
        │
        ▼  existing flow (doctor call / auto-confirm → confirmed → packed → dispatched)
```

| How to store it | Note |
|---|---|
| **P1: request states on today's order row** (06 §3) | Fits "created by the pharmacist in the Type 1 portal": the row exists, but it only becomes an order at R3 → O1. Smallest portal change. `[RECOMMENDED]` |
| P2: separate request record; order row written at O1 | Cleanest, but rewires the Type 1 queue, lock and Rx viewer (all run on orders today). |

---

## 3. Enhancements around this state (backend + portal only)

Effort and impact are relative PM estimates.

### A. State & data (backend)

| # | Enhancement | Why | Effort | Impact |
|---|---|---|---|---|
| E1 | **Request sub-states R1–R6 + O1**, each with a **timestamp** | Enables the whole funnel, SLA and abandonment logic; instrumentation for free | S–M | High |
| E2 | **OP counted only at O1** ("Create order"); rejected/abandoned requests never count as orders or cancellations | Clean metrics (OP, cancellation rate stop being polluted) | S | High |
| E3 | **Structured rejection reasons** (unreadable, expired, no doctor details, not a valid Rx, medicine not sold…) | Today discard is free-form; reasons drive comms + data | S | Med |
| E4 | **Duplicate-request merge**: same customer, multiple uploads within X h → one request | Saves pharmacist time; portal cancel reasons already include "duplicate order" `[CODE]` | S–M | Med |
| E5 | **Auto-abandon rule**: N failed attempts or X hours in R3/R4 → R6 → ACOM lead | Closes the loop with 06 §5; no request rots in the queue | S | High |

### B. Pharmacist Type 1 portal

| # | Enhancement | Why | Effort | Impact |
|---|---|---|---|---|
| E6 | **Request list shows sub-state + wait time**, sortable by age | Visibility of who has waited longest (overlaps W1b A2) | S | High |
| E7 | **Explicit "Create order" button** after the customer agrees, with a confirmation summary (medicines, substitutes, price, coupon, ETA) to read out | Makes O1 a deliberate pharmacist action = the moment the order exists | S | High |
| E8 | **Mandatory call outcome** (connected-agreed / declined / call later at T / not connected) | Drives Hold / Schedule / Abandon automatically; today "Unreachable" is only enabled after an IVR call (P21) | S | High |
| E9 | **Rx reuse**: if the customer has a recent valid digitised Rx, pre-fill the cart from it (portal "View previous orders" exists) | Faster digitisation for repeat/chronic customers | S | Med |
| E10 | **Type 1 dashboard = request funnel**: R1 → R3 → O1 → delivered, rejection reasons, wait time by hour | Replaces today's Total/Assigned/Discarded/Unreachable counts | M | Med |

### C. Customer comms on state change (backend templates, no app release)

| # | Trigger | Message (draft) | Effort | Impact |
|---|---|---|---|---|
| E11 | R1 submitted, **09:00–19:00** | "Prescription received. Our pharmacist will call you shortly to confirm your medicines." | S | High |
| E12 | R1 submitted, **after hours** | "Prescription received. Our pharmacist will call you after 9 AM." (honest ETA) | S | High |
| E13 | R4 Hold (not connected) | "We tried calling you about your prescription. Reply CALL / tap to get a callback." | S–M | High |
| E14 | R-X Rejected | Reason + how to re-upload | S | Med |
| E15 | O1 Order created | "Your order is placed: medicines, amount, delivery date" (first time we say "order") | S | High |

> App caveat (R3): the app's own hard-coded "Order placed" screen at upload can't change until an app release. Server-driven labels/status text can (EQ2).

---

## 4. Recommended v1 (min effort, max impact)

**E1 + E2 + E7 + E8 + E5 + E6 + E11/E12/E13/E15**
→ the request state exists with timestamps; OP is counted at "Create order"; the pharmacist records every call outcome; held/abandoned requests flow on automatically; agents see wait time; customers get honest messages.

**Later:** E3/E14 (rejection reasons + re-upload), E4 (duplicate merge), E9 (Rx reuse), E10 (funnel dashboard).

---

## 5. What this changes vs 06

| 06 item | Effect |
|---|---|
| Q1 (P1 vs P2) | Direction confirmed: order created by the pharmacist. Storage (P1/P2) still to pick (Q2 below). |
| Arm B self-checkout (D15) | Not mentioned in this instruction. **Still in the experiment, or parked?** (Q3) |
| Abandoned → ACOM (06 §5) | Unchanged. E5 is the trigger feeding it. |

---

## 6. Decisions needed from Swapnil

| # | Decision | Recommendation |
|---|---|---|
| Q1 | ✅ `RX VERIFICATION PENDING` (§7) | — |
| Q2 | Storage: request states on the order row (P1) or a separate request record (P2)? | P1 |
| Q3 | Is Arm B (self-checkout) still in the experiment? | Keep as a later arm, after Q2 of 06 (cart check-out in app) is verified |
| Q4 | Pick the v1 set (§4), or add/remove items | v1 as listed |
| Q5 | Auto-abandon rule: how many failed attempts / how many hours? | Needs AQ3/AQ6 data; start with 3 attempts or 24 h |
| Q6 | After-hours message: promise "after 9 AM"? | Yes (honest ETA) |

---

## 7. Swapnil's picks (2026-10-12, round 2) `[CONFIRMED]`

| # | Decision |
|---|---|
| PV1 | New status name: **`RX VERIFICATION PENDING`** (the existing `PENDING VERIFICATION` stays as-is). |
| PV2 | **Both.** *Now* (no app change): today's order-creation flow + one intermediate state. *Future* (Portal Unification): the upload becomes a **lead tagged Type 1** that a pharmacist calls. Explore both (§8). |
| PV3 | **Arm B is in.** Experiment flow where the pharmacist **only adds medicines to the cart and the customer takes it forward**. Look at the knock-on effect on agent conversion credit and incentives (§9). |
| PV4 | **Add scope:** every abandoned Type 1 cart flows as a **lead to the ACOM portal** for a call (§10). |
| PV5 | Abandon rule is **configurable**: attempts and time (§11). |
| PV6 | **After-hours handling: yes** (§12). |
| Future | 1mg-style: customer kept engaged in the app while waiting; call wait and pharmacist assignment in **real time** (§13). |

---

## 8. Now vs Future: the request state, explored both ways

### 8.1 Now (no app release): one intermediate state on today's flow

```
Upload ─► RX VERIFICATION PENDING ─► (pharmacist verifies + digitises + calls) ─► "Create order" ─► today's statuses
           (order row exists, NOT an order for the customer or OP)            (order counted here)
```

| Layer | Change |
|---|---|
| OMS | New status `RX VERIFICATION PENDING` + transitions R1–R6 → O1 (§2), with timestamps. Upload writes this status instead of today's new-order status. |
| Portal | Type 1 list/API, routing, lock and dashboard include the new status (P16). "Create order" button (E7) + mandatory call outcome (E8). |
| Metrics | OP counted at O1 only. |
| App | No change. It shows server-sent status text where it's server-driven (EQ2). The hard-coded "Order placed" screen at upload stays until an app release. |
| Effort | **S–M** |

### 8.2 Future (Portal Unification): the upload is a lead, not an order row

```
Upload ─► LEAD (tag: Type 1, Rx attached) in the unified lead system
            │  routed to pharmacist-skilled agents (real-time assignment, §13)
            ▼
          pharmacist calls / builds cart ─► customer agrees (or self-checks out) ─► ORDER created
            │
            └─ abandoned ─► same lead re-routed (ACOM / sales agents), no hand-off between systems
```

| Aspect | Future design |
|---|---|
| Record | No order row until conversion. One lead record carries the Rx, patient, address and the cart. |
| Routing | Lead-routing rules in config (Apurva's Portal Unification: LMS + push allocation) — not Type 1-specific logic here; to be designed in that track. |
| Why it's better | Type 1 and cart-abandon leads become the same object; no `order_id` workarounds; clean funnel. |

### 8.3 Making "Now" a stepping stone to "Future"
- Use the **same state names and events** (R1–R6, O1) in both, so the future lead system inherits the data model and reports.
- Store the **timestamps and call outcomes** now; they're the inputs the future routing needs.
- Keep the **Type 1 tag** on the request now, so ACOM leads (§10) are already labelled.

---

## 9. Experiment Arm B: pharmacist builds the cart, customer takes it forward

### 9.1 Flow

```
RX VERIFICATION PENDING
   │  pharmacist verifies Rx + adds medicines (no "Create order")
   ▼
CART READY ─► "Send to customer" (portal button)
   │  backend: cart lands in the customer's app cart [needs engineering check, 06 Q2]
   │  + push/SMS/WhatsApp: "Your medicines are ready. Review and place your order."
   ▼
customer places the order in the app ─► ORDER CREATED (by the customer)
   │
   └─ no checkout within the configured window (§11) ─► ACOM lead (§10)
```

**Dependency:** Arm B with no app release only works if a portal-built cart shows up in the customer's existing app cart and checks out normally (06 Q2). If not, Arm B waits for an app release or runs on web only.

### 9.2 Conversion callout (incentive calculation out of scope, 2026-10-12)

> In Arm B the customer, not the pharmacist, creates the order. Agent conversion counts drop for Arm B pharmacists by design; an ACOM recovery means two agents on one order; results must be read **per arm**, not per agent. Incentive calculation is **out of scope** `[CONFIRMED]`. Full callout: `08` §7.
> *(Parked: earlier options — attribution window, split credit, incentive-neutral test, carts-built productivity, report-based reconciliation.)*

### 9.3 Experiment guardrails (detail in `design-experiment` at Finalise)
- **Unit:** customer. **Primary:** request → delivered. **Secondary:** time to order, pharmacist minutes per order, AOV, cancellations.
- **Guardrails:** complaints, abandonment rate, pharmacist earnings parity between arms.

---

## 10. New scope: every abandoned Type 1 cart → ACOM lead

| Source | Trigger (configurable, §11) | Lead |
|---|---|---|
| Arm A: call failed | N failed attempts / Holds, or T hours in CART BUILT | Cart lead, tag **Type 1** |
| Arm A: customer declined / "later" not honoured | Call outcome = declined, or Schedule missed | Cart lead, tag Type 1 |
| Arm B: no checkout | No order within X hours of "Send to customer" | Cart lead, tag Type 1 (cart already in app) |
| Never digitised (Rx only) | — | Not a cart lead. See `08` (incl. mid-flow abandon: Rx uploaded, never submitted) |
| **Mid-flow: Rx uploaded, request never submitted** | X min inactivity | Rx-only lead, tag Type 1. **In scope** (2026-10-12) → `08` |

**Reuse:** move the abandoned cart into today's incomplete-cart pipeline so it appears in the **ACOM portal** like any cart-abandon lead. Additions:
- **Type 1 tag** visible to the ACOM agent ("from prescription; pharmacist-built cart").
- Rx image + pharmacist notes visible to the ACOM agent.
- Medicine changes by ACOM agent limited (qty/remove); substitutions go back to a pharmacist `[OPEN]`.
- Value threshold, DNC, and dedupe with an existing cart lead: open (06 Q6, Q8, Q9).

---

## 11. Configurable abandon rule

| Parameter | Applies to | Suggested default | Note |
|---|---|---|---|
| `max_call_attempts` | Arm A | 3 | Counts not-connected calls (each = 1 h Hold) |
| `max_hours_in_cart_built` | Arm A | 24 working hours | Clock counts only Type 1 working hours (09:00–19:00) |
| `checkout_window_hours` | Arm B | 2 working hours | Then → ACOM lead |
| `hold_minutes` | Arm A | 60 | Today's Hold = 1 h `[CONFIRMED]` |
| `respect_schedule` | Both | true | A customer-scheduled time overrides the abandon clock |
| Per-arm on/off + values | Both | — | So the experiment can tune without a release |

Backend config (no UI needed in v1), changeable without deployment.

---

## 12. After-hours handling (Type 1 working hours 09:00–19:00)

| Situation | Handling |
|---|---|
| Rx submitted after 19:00 / before 09:00 | Status `RX VERIFICATION PENDING`; message: "Prescription received. Our pharmacist will call you after 9 AM." (E12) |
| Abandon clocks (§11) | Pause outside 09:00–19:00, so overnight requests aren't abandoned before anyone could call |
| Morning queue order | Overnight requests must not sink below fresh uploads → **W1b allocation** (scope A5) |
| Arm B after hours | Pharmacist can't build carts overnight; the cart is sent in the morning; the checkout window starts then |

---

## 13. Future scope (logged, not in current build)

1mg-style real-time experience:
- Customer stays engaged in the app while waiting: named pharmacist, live status, ETA.
- Call wait and **pharmacist assignment in real time**.
- Lead-based model (§8.2) inside Portal Unification.
Requires an app release and the unified lead/allocation system → parked until then.

---

## 14. Next
On go-ahead → **Finalise W1a**: lock the state model, v1 enhancement set, Arm A/B flows, abandon config, after-hours rules, ACOM lead hand-off; then `design-experiment` for Arm A vs B.
Engineering checks needed first: **06 Q2** (portal-built cart visible/checkout-able in the app) and **EQ2** (which app texts are server-driven).
Incentive calculation: out of scope (callout only, `08` §7).
