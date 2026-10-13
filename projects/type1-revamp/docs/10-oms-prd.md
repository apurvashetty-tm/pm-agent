# Type 1 OMS: Prescription Request Before Order (PRD v0.2)

**Status:** v0.2 · closed for now (2026-10-12), pending engineering checks in §8 · **Owner:** Swapnil Singh
**Sources:** decisions D15–D36 (`context/decision_log.md`); working docs `06`, `07`, `08`, `09`.

---

## 1. Executive summary

Today, when a customer uploads only a prescription (Type 1), we create an order straight away and tell them "Order placed", before anyone has seen the medicines or the price. We will create a **request** instead, with a new status `RX VERIFICATION PENDING`. The pharmacist **does not gate on prescription validity**: they tag whether the upload is a prescription or not (a photo of a medicine strip also works) and the flow continues. The order is created only when the pharmacist builds the cart and the customer agrees on the call. We will test a second path where the pharmacist only builds the cart and the customer places the order. Every abandoned Type 1 journey, including customers who upload a prescription and never submit, becomes a lead for the Assisted Commerce (ACOM) team to call. This ships on the backend and the current pharmacist portal, with no app release.

## 2. The problem

- "Order placed" is shown at upload, but the customer hasn't agreed to any medicines or price. When we can't reach them, they see a cancelled order.
- Type 1 converts 10% of orders placed into delivered orders (133 of 1,333 a day). The target is 14.3% (250 of 1,750).
- About **55K Type 1 journeys a month stall** (prescription uploaded, nothing placed) and reach no one.

## 3. What we're building

| Choice | Why |
|---|---|
| A request status, `RX VERIFICATION PENDING`, on today's order record | Smallest change that stops calling it an order. The pharmacist portal already works on this record. |
| The pharmacist creates the order in the Type 1 portal after the customer agrees | The order exists only once the customer has said yes to a real cart. |
| No validity gate: the pharmacist only **tags the upload** as "Prescription" or "Not a prescription" | Customers often upload a medicine photo instead of an Rx; that still works for building the cart. Rx compliance stays with today's flow after the order is created. |
| An experiment: pharmacist places the order (Arm A) vs customer places it (Arm B) | Tests whether customers will complete a pharmacist-built cart themselves. |
| Every abandoned Type 1 journey goes to ACOM | Recovers the stalled 55K a month with an existing team and queue. |
| Rules (attempts, times) are configurable | Tune during the experiment without a release. |

## 4. How it works (Arm A, clean path)

```
Customer uploads Rx + patient + address  →  RX VERIFICATION PENDING (a request, not counted as an order)
   →  pharmacist tags the upload (Prescription / Not a prescription) and builds the cart in the Type 1 portal
   →  pharmacist calls; customer agrees
   →  pharmacist presses "Create order"  →  ORDER CREATED (counted as an order placed here)
   →  today's flow continues (doctor call / auto-confirm, packing, dispatch)
```

**Arm B:** same until the cart is built. The pharmacist then presses **"Send to customer"**. The cart lands in the customer's app with a message to review and place the order, and the order is created when the customer places it. [Assumption, see §8 E1]

## 5. The journey: branches

| Situation | What happens |
|---|---|
| Upload is not a prescription (e.g. a medicine-strip photo) | Tagged "Not a prescription". **Flow continues**: pharmacist calls, builds the cart. Rx needs are handled by today's flow after the order is created. |
| Upload is unusable (blank, unrelated image) | `[OPEN]` P6: call the customer anyway, or close the request? |
| Call not connected | **Hold**: out of the queue for 1 hour, then back. |
| Customer asks for a later time | **Scheduled** until that time. The abandon clock waits for it. |
| Arm A: attempts or time exceeded, or the customer declines | Request abandoned → ACOM lead with the cart. |
| Arm B: no checkout within the window | ACOM lead with the cart. |
| Customer uploads an Rx but never submits | After 30 min of inactivity → ACOM lead (prescription only). Covers stopping after upload, at summary/address, or at the payment step. |
| Customer submits but no pharmacist picks up the request | **Stays in Type 1.** Handled under allocation (W1b), not ACOM. |
| Submitted after hours (19:00–09:00) | Message: our pharmacist will call after 9 AM. Abandon clocks pause outside 09:00–19:00. Arm B carts are sent in the morning. |

**Configurable rules** (working defaults; values to be set and validated by the Type 1 owner):

| Setting | Working default |
|---|---|
| Max not-connected attempts (Arm A) | 3 |
| Max time with the cart built (Arm A) | 24 working hours |
| Hold duration | 60 min |
| Arm B checkout window | 2 working hours |
| Mid-flow inactivity before a lead | 30 min |
| Customer's scheduled time overrides the abandon clock | On |

## 6. User stories

- As a **customer**, I'm told my prescription was received, and I only hear "order placed" after I've agreed to the medicines and price.
- As a **pharmacist**, I tag whether the upload is a prescription, call the customer either way, record every call result, and create the order only when the customer agrees.
- As an **ACOM agent**, I get Type 1 leads tagged as such, see the prescription and where the customer stopped, and help them complete the purchase.

## 7. Scope

**In:**
- the new status and its stages, with timestamps
- the "Create order" button and a required call result after every call
- the Arm B "Send to customer" button
- configurable abandon rules
- after-hours messages and clock pauses
- ACOM leads for all abandoned Type 1 journeys, with the cart-value filter handled
- the order-placed count moves to order creation

**Out (people may assume these are included):**
- **App changes.** The app's own "Order placed" screen at upload stays until an app release.
- Parked app requirements:
  - APP-1: change "Proceed to checkout" to a request-style button (wording open)
  - APP-2: remove the payment-mode step from Type 1
- **Customer messages (nudges)** have their own track.
- **Incentive calculation.** For Arm B, see the callout in `08` §7.
- **Pharmacist allocation and requests never picked up** move to W1b.
- **A Type 1-specific ACOM priority.** ACOM's current logic is used for now.
- **Portal revamp, lead-based model and real-time assignment** wait for Portal Unification.

## 8. Decided vs open

**Decided:** D15–D34 in `context/decision_log.md` (request status name, pharmacist creates the order, Arm B in the experiment, all abandoned journeys to ACOM, configurable rules, after-hours handling, ACOM logic as-is minus the value filter, no portal revamp, incentives out of scope).

**Open, confirm first:**

| # | Question | Owner |
|---|---|---|
| E1 | Does a cart built in the portal appear in the customer's app cart, and can they check it out with no release? (Arm B depends on this) | [Engineering] |
| E2 | What does the backend store when an Rx is uploaded but not submitted? Can we tell which step the customer stopped at? | [Engineering] |
| E3 | Which app texts come from the backend (tracker steps, status names)? | [Engineering / App] |
| E4 | If ACOM's ranking uses order value, what neutral default do prescription-only leads get so they don't sink to the bottom? | [Engineering / ACOM] |
| P1 | ACOM agent **creates the order from the prescription** over the call (Swapnil's lean). Tooling, who validates the Rx afterwards, and safeguards for agents who aren't pharmacists. | [Swapnil / ACOM / Pharmacy ops] |
| P2 | Arm B: send the cart without calling (working default) or after a short call? | [Swapnil] |
| P3 | If the customer already has an open cart-abandon lead, which lead wins? Working default: the newer one. | [ACOM] |
| P4 | Restate the order-placed target, or track request → delivered as the primary measure? Working default: request → delivered. | [Analytics / Swapnil] |
| P5 | APP-1 button wording (lean: "Send to pharmacist"). Parked with the app. | [Swapnil] |
| P6 | Unusable upload (blank / unrelated image): call anyway or close? | [Swapnil] |
| P7 | Keep the status name `RX VERIFICATION PENDING` now that it means "waiting for pharmacist review", not validity check? | [Swapnil] |

**Accepted, not blocking:**
- Until the app ships, customers may still see "Order placed" at upload.
- The portal repeats the same code across screens, so each portal change is applied in each copy (`09` §4).

## 9. How we'll know it worked

- **Primary:** request → delivered, per arm.
- request → order created; order created → delivered
- time from upload to order created
- abandoned-journey leads → order created (ACOM recovery)
- **Watch:** share of uploads tagged "Not a prescription" (and their conversion).
- **Guardrails:** complaints and cancellations after an order is created.

Experiment design (unit: customer; split; duration) to follow via `design-experiment`, once E1 is answered.

---

## Change log
| Version | Date | Change | Why | Approved |
|---|---|---|---|---|
| v0.1 | 2026-10-12 | First close-out of OMS scope | Swapnil: "close the OMS for now" | — |
| v0.2 | 2026-10-12 | Removed the Rx-validity gate; pharmacist tags Prescription / Not a prescription and the flow continues. Rejected branch removed. Guardrail changed. Added P6, P7. | Customers upload medicine photos that still work (D36) | Swapnil |
