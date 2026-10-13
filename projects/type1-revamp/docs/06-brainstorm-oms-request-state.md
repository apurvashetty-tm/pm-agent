# W1 OMS Brainstorm: Request State, Two Experiment Arms, Abandoned Leads → ACOM

Date: 2026-10-09 · Status: **Brainstorm — awaiting Swapnil's picks (§7) before Finalise**
Supersedes the framing in `04-brainstorm-w1-order-to-request.md` §4b (B-lite) for OMS scope. 04 stays as history.

Tags: `[CONFIRMED]` Swapnil said so · `[DOC]` PM-agent repo / tm-chotu · `[CODE]` portal v4.8.8 · `[INFERRED]` · `[OPEN]`.
Constraints carried: Type 1 only (R2), no app release (R3), min effort / max impact (R4).

---

## 1. Scope as given (2026-10-09) `[CONFIRMED]`

1. **Intermediate state.** Rx upload no longer places an order. It creates a **request**. The order is created only after the pharmacist call / cart build.
2. **Experiment, two arms after the pharmacist builds the cart:**
   - **Arm A: Assisted (today's flow).** Pharmacist adds medicines and **places the order** on the call.
   - **Arm B: Self-checkout.** Pharmacist **only creates the cart**; the customer is asked to complete it.
3. **Abandoned flow → ACOM.** Requests that are abandoned become ACOM leads, like today's cart-abandonment flow.
4. **Key difference to evaluate:** a cart-abandon lead has medicines + a cart; a Type 1 abandoned request may have **only a prescription**.

---

## 2. Target flow

```
Customer uploads Rx + patient + address  ──►  REQUEST (not an order)
                                               │
                         Pharmacist Type 1 queue (unchanged allocation; W1b separate)
                                               │
                              Verify Rx ──► invalid ──► Discard (as today)
                                               │
                                     Digitise = CART BUILT
                                               │
                      ┌──── experiment split (per request/customer) ────┐
                      ▼                                                 ▼
             ARM A: Assisted                                  ARM B: Self-checkout
     call → customer agrees → ORDER CREATED            cart sent (push/SMS/WhatsApp link)
     (today's flow, just later in time)                customer checks out in app → ORDER CREATED
                      │                                                 │
       unreachable / declines / "later"                  no checkout in X h
                      └──────────────►  ABANDONED REQUEST  ◄────────────┘
                                               │
                                          lead → ACOM
```

---

## 3. How to build the request state: two paths

| | **P1: Request = a status on today's order row** ★ recommended | P2: New request entity |
|---|---|---|
| What | Upload still writes the `order_details` row (type 52) but with a **request status** (e.g. `RX REQUEST`). It only becomes an order (counts as OP) when Arm A confirms or Arm B checks out. | No order row at upload. A separate request record; the order row is created at cart build. |
| Portal impact | Small: add the status to the list API, routing, lock and dashboard (P16) | Large: the Type 1 queue, lock and Rx viewer all run on orders today |
| ACOM fit | The row already has an `order_id` → plugs into `iod` keying | Needs a request ID key in ACOM (AI-lead PRD anticipates it, but it's new) |
| Effort | **S–M** | L–XL |
| Purity | "Order" exists technically, but not for the customer or the metrics | Clean 1mg model |

**Recommendation: P1.** It delivers the business outcome (no "order placed" before a cart, OP counted at real creation) without rewiring the portal. P2 can come later with Portal Unification. → **[OPEN] Q1:** does "order creation after the call" mean the business event/metric (P1) or a new data model (P2)?

> App caveat (R3): the app's hard-coded **"Order placed" success screen** at upload can't change without a release. Server-driven labels and notification copy can (EQ2). Until the app ships, customers may still see "Order placed" at upload.

---

## 4. The two arms

### Arm A: Assisted (control)
Today's flow, unchanged for the pharmacist. The only difference is that the status moves `RX REQUEST → order created` on confirmation, instead of being an order from upload.

### Arm B: Self-checkout
Pharmacist digitises → clicks **"Send cart to customer"** (new portal button) → customer gets a push/SMS/WhatsApp link → checks out in the app → order created.

**Biggest reuse opportunity `[INFERRED]`:** in Arm B, the pharmacist-built cart can be written as an **incomplete order**. Status `400 PORTAL INCOMPLETE ORDER` already exists `[DOC]`, and the portal has a dormant `confirmOrderFromIncompleteState` flow (P14) `[CODE]`. If the app already shows such a cart to the customer for checkout:
- Arm B needs **no app release**.
- If the customer doesn't check out, the cart **is already an ACOM cart-abandon lead**, with medicines and value, through today's pipeline.

→ **[OPEN] Q2 (critical, engineering check):** does a portal-created incomplete cart (49/400) appear in the customer's app cart and check out normally? If **no**, Arm B needs an app release and is parked (R3), or it runs only on web/m-site.

**Arm B design choices:**

| Choice | Options | Lean |
|---|---|---|
| Call before sending? | B1: send the cart without calling · B2: short call, then send the cart to close | **B1** gives the cleanest test of "no call needed" (and the largest pharmacist-time saving) |
| Fallback | No checkout in X h → pharmacist call (hybrid) · or → ACOM lead directly | **Pharmacist call once, then ACOM.** Pure "no fallback" risks losing orders during the test |
| Doctor call (Rx validation) | Before or after checkout | Before checkout keeps the cart final (as EQ5) |
| Payment | Pay after packing stays (EQ8) | Unchanged |

### Experiment shape (to detail in `design-experiment` once picked)
- **Unit:** customer (not request), so a repeat customer isn't in both arms.
- **Split:** start Arm B small (e.g. 20%), then 50/50 once Q2 is verified.
- **Primary metric:** request → delivered (OD per request).
- **Secondary:** time from upload to order, pharmacist minutes per order (Arm B frees pharmacist capacity, which also helps W1b allocation), AOV, cancellations after order.
- **Guardrails:** complaints, Rx-validation misses, abandonment rate.

---

## 5. Abandoned requests → ACOM

### 5.1 Where a Type 1 request can be abandoned

| # | Abandonment point | What exists | Lead type |
|---|---|---|---|
| L1 | Customer drops **before submitting** the Rx in the app | Maybe an uploaded image, if the app stores it before submit `[OPEN]` | Rx-only (likely parked: app-side) |
| L2 | Submitted, but **Rx not yet digitised** (e.g. after-hours, queue backlog) | Rx + patient + address | **Rx-only** |
| L3 | Digitised, **pharmacist call fails** (unreachable after Holds / Schedule missed) — Arm A | Rx + **cart built** | **Cart** |
| L4 | Digitised, customer **declines / "later"** on the call — Arm A | Rx + cart | Cart |
| L5 | Arm B: cart sent, **no checkout in X h** (and fallback call failed) | Rx + cart | **Cart** (native 49/400) |

**Key insight `[CODE]`:** the portal sequence is **Verify Rx → Digitise → Call**, so the cart is built *before* the call. Most abandoned requests (L3–L5) therefore **already have a cart** and can go through today's cart-abandon flow. True Rx-only leads are mainly **L2** (never digitised) and L1 (parked).

### 5.2 Cart leads (L3–L5): reuse today's ACOM flow

On abandonment, move the digitised cart to `49 INCOMPLETE` / `668 REVERTED TO INCOMPLETE` → it enters `iod` → the BAU/FTC queue picks it up.

Gaps against today's ACOM gates `[DOC]`:

| ACOM rule today | Issue for Type 1 | Option |
|---|---|---|
| `order_value > 900` (FTC > 700) | Many Type 1 carts may fall below this | A Type 1 tag with its own threshold, or none `[OPEN]` |
| Last cart activity 30 min–24 h | Fine; set "activity" = cart built / sent time | Reuse |
| One open incomplete order per customer | The customer may already have a normal cart-abandon lead | Keep the **newer or higher value** one; or merge `[OPEN]` |
| Order by `final_score`, then value | Type 1 has a strong intent signal (they uploaded an Rx) | Add a Type 1 boost, or let it compete as-is |
| DNC respected for lead calls | The Type 1 *order* call was DNC-exempt; is an abandoned *request* a sales lead? | Treat as lead → **respect DNC** `[OPEN]` |
| ACOM agent can edit the cart | Rx medicines: can an ACOM agent substitute or change them? | Edits limited to qty/remove; substitutions back to pharmacist `[OPEN]` |

### 5.3 Rx-only leads (L2): the hard case

ACOM agents and the AI bot **cannot build a cart from an Rx** (bot guardrail: a pharmacist must validate the Rx and build the cart `[DOC]`). Options:

| Option | How it works | Effort | Lean |
|---|---|---|---|
| **R1: Don't create Rx-only leads; digitise first** | Fix the cause (W1b allocation: after-hours orders reached last). Every request gets digitised before it's abandoned → becomes a cart lead | Comes with W1b | ★ primary |
| **R2: ACOM qualifies, pharmacist builds** | ACOM agent/Ring bot calls: "Still need these medicines?" → yes → **Rank-Up** the request in the pharmacist queue (existing CTA) → pharmacist digitises → back into Arm A/B | S–M (new ACOM lead type without value; reuse Rank-Up) | ★ for the remainder |
| R3: Rx-only lead in the pharmacist queue | A "lead" tab in the Type 1 portal; pharmacists call | S | Duplicates the Type 1 queue; doesn't use ACOM |
| R4: Pharmacist-skilled ACOM agents | ACOM agents trained to digitise | L (ops) | Fits Portal Unification later |

**Rx-only lead priority signal (no cart value)** `[INFERRED]`: repeat or chronic customer, past AOV, Rx recency, number of medicines on the Rx, FTC flag. → `[OPEN]` PQ7.

**Recommendation:** R1 + R2. Make "digitise before abandon" the norm so most leads carry a cart and reuse ACOM as-is. Route the Rx-only remainder through ACOM as a **qualify-and-hand-back** lead.

---

## 6. Metrics (both arms)

| Metric | Today | New |
|---|---|---|
| **Request** | — | Rx upload submitted (new top of the funnel) |
| **OP (order placed)** | Order row created at upload `[CONFIRMED]`; whether OP counts it is `[OPEN]` | Counted at **order creation**: Arm A confirmation / Arm B checkout |
| **OD** | Delivered | Unchanged |
| Request → OP, OP → OD | — | Report per arm |

`[OPEN]` EQ7: OP targets (1,333 → 1,750) are based on the upload-time definition. Under the new model, OP drops mechanically while OD is the true measure. Targets need restating, or should move to **Request → OD**.
`[DOC]` note: tm-chotu's company "orders placed/day" already excludes `1 NEW`. Check whether Type 1 uploads are in that number today.

---

## 7. Decisions needed from Swapnil

| # | Decision | Recommendation |
|---|---|---|
| Q1 | Request as a **status on the order row (P1)** or a **new entity (P2)**? | P1 |
| Q2 | *(Engineering check)* Can a portal-created incomplete cart (49/400) be checked out in the app today, with no release? | Verify first; Arm B depends on it |
| Q3 | Arm B: send the cart **without** a call (B1) or after a short call (B2)? | B1 |
| Q4 | Arm B fallback: pharmacist call once, then ACOM? And X = how many hours? | Yes; 2 working hours |
| Q5 | Abandonment trigger for Arm A: after how many Holds / failed attempts / hours? | `[OPEN]` needs AQ3 data |
| Q6 | Type 1 cart leads: same ACOM value threshold (₹900) or a Type 1-specific one? | Type 1-specific, set from data |
| Q7 | Rx-only leads: R1 + R2 (ACOM qualifies → Rank-Up to pharmacist)? | Yes |
| Q8 | Abandoned request = **sales lead (DNC applies)**? | Yes |
| Q9 | Conflict with an existing open cart-abandon lead for the same customer? | Keep the newer one |
| Q10 | OP restated, or move the target to Request → OD? | Request → OD as the primary metric |
