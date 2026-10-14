# PRD: Type 1 Revamp (Prescription Request Before Order)

**Owner:** Swapnil Singh · **Version:** v1.0 draft · **Date:** 2026-10-14 · **Status:** in review
**Working doc:** problem and solution notes are in the "PRD" tab (source `docs/13-oms-problem-and-solution.md`). This tab is the build document.

## 1. Executive summary

A Type 1 journey starts when a customer uploads only a prescription and asks us to arrange the medicines. Today the order system treats that upload as an order, before anyone has seen the medicines or the price. Most Type 1 orders never get delivered, and we can't say why.

We will treat the upload as a **request**. A pharmacist checks what can be supplied, calls the customer, builds the cart with them and the order is created only when the cart is real. Abandoned journeys go to Assisted Commerce (ACOM), every call and closure gets a specific reason, pharmacists get a push queue with first-time customers first, and the portal shows stock, substitutes and fill rate before the call.

**Phase 1** ships on the backend (OMS), the pharmacist portal and ACOM, with no app release. **Phase 2** adds a new app flow on the same backend.

Still open: values Analytics must set, a few engineering checks, comms channel and copy, and ACOM's handling of Type 1 leads (§12).

## 2. Problem

Today the order system treats a Type 1 prescription upload as an order. Everything that follows (what the customer sees, what the pharmacist does, what we count, what happens when the journey stops) is built on that wrong assumption.

### 2.1 Customer experience in the app

**P1. It looks like an order, but it isn't one.**
After uploading a prescription, the customer goes through an order-placement flow and is told "Order placed". It has no medicines, no quantities and no price, so it has none of the attributes of an order, and price, payment and discounts can't apply to it. When we later can't reach the customer, or the cart changes on the call, they see their "order" cancelled or altered and feel misled.

**P2. Payment and discount steps come before there's anything to pay for.**
The customer picks a payment mode and applies a coupon on an empty order. These steps have nothing to act on, add confusion and are a likely drop-off point.

**P3. The wait is a black box.**
After submitting, nothing explains that a pharmacist will call, when, or why. A delivery date before a cart exists and a feedback prompt before anything has happened add to the confusion.

**P4. Nothing keeps the customer engaged while they wait.**
A static card, no named pharmacist, no expected call time, no progress and no way to ask for a call. Customers put the phone down and miss the call.

**P5. There's only one way to finish.**
The pharmacist must call, build the cart and place the order. A customer who would rather review a cart and check out themselves can't.

### 2.2 Demand we lose

**P6. Customers cancel before we call.** Many drop the request within minutes, before any pharmacist reaches them.

**P7. Calls don't connect.** The journey depends on one call. Customers miss it, can't easily ask for a callback, and our number sometimes shows as spam.

**P8. After-hours requests wait too long.** In the morning newer requests are picked first, so the oldest wait longest and customers lose interest.

**P9. Abandoned journeys reach nobody.** A customer who stops at any step, whose call fails, or who leaves a cart is never followed up. Other abandoned carts go to ACOM; Type 1 doesn't.

### 2.3 Medicines we can't supply

The biggest reason requests die after the call.

**P10. Prescribed medicines often aren't available** on Truemeds or are out of stock, and the pharmacist finds out only while building the cart.

**P11. No substitutes are offered** for out-of-stock medicines.

**P12. Partial carts put customers off.** Often only some medicines can be supplied and many customers decline the whole request.

**P13. Fulfilment can't be checked before the call.** Calls are spent on requests that can't be fulfilled while others wait.

**P14. Low-fill requests can't be closed cleanly** with a clear reason, so the real size of the problem is hidden.

### 2.4 Pharmacist portal

**P15. Pharmacists pick their own work.** No "next request" and no view of how long a request has waited.

**P16. The prescription check is a gate it doesn't need to be.** The doctor call happens anyway and a medicine-strip photo works for building the cart; a tag is enough.

**P17. The call comes last.** Verify and digitise are forced before the pharmacist can call.

**P18. Search doesn't help.** Little more than the name; no pack, price or stock; unavailable medicines hidden.

**P19. Coupons are hard to apply.**

### 2.5 Data

**P20. We can't see why requests die.** Only "Unreachable" can be recorded. Call results, discard reasons, searches and stock-outs aren't.

**P21. Type 1 is counted at the wrong moment.** An upload counts as an order placed, so order and cancellation numbers are misleading.

## 3. Opportunity and success metrics

### 3.1 Type 1 funnel today (per day, CX / Portals FY26-27 roadmap)

| Stage | Per day | % of orders placed |
|---|---|---|
| Prescriptions uploaded | 3,196 | — |
| Orders placed | 1,347 | 100% |
| Discarded before any call | 402 | 29.8% (mostly by the customer, 70% within 5 minutes) |
| Called, never connected | 216 | 16.0% |
| Discarded after the call: out of stock | 326 | 24.2% |
| Discarded after the call: other Truemeds reasons | 346 | 25.7% |
| Digitised (real cart built) | 211 | 15.6% |
| Delivered | 138 | 10.2% |

### 3.2 Targets

| Metric | Today | Target |
|---|---|---|
| Orders placed (OP) / day | 1,333 | 1,750 |
| Orders delivered (OD) / day | 133 | 250 |
| OP → OD conversion | 10% | 14.3% |
| OP GMV / month (AOV ₹1.5K) | ₹6 Cr | ₹7.88 Cr |

About two-thirds of the delivered-order gain has to come from better conversion, not more leads. Once an upload stops counting as an order placed, the OP baseline is restated (§12).

### 3.3 How we'll know it worked
- **Primary:** request → delivered, by flow.
- Request → order created; order created → delivered.
- Time from upload to first call; cancellations before the call, by hour.
- Requests closed for low fill or can't supply, by reason.
- ACOM recovery: Type 1 leads → orders.
- **Guardrail:** complaints and cancellations after an order is created.

## 4. Solution overview

**Core change.** The upload creates a request in `RX VERIFICATION PENDING`. The order is created only when the cart is complete. Every request gets a pharmacist call; the doctor consultation still follows for every order.

```
Upload Rx ─► RX UPLOADED (draft) ─► submit ─► RX VERIFICATION PENDING (request)
   ─► queue (FTC first) ─► pharmacist: tag Rx, draft cart, fill rate ─► call
   ─► Create cart ─► CART CREATED ─► customer checks out ─► ORDER CREATED ─► today's flow
```

**Three ways to finish**
1. **Full Rx cart, customer checks out:** the pharmacist adds everything on the Rx as written and presses Create cart.
2. **Cart as the customer wants, customer checks out:** built on the call, then Create cart.
3. **Pharmacist places the order:** built on the call, then Create order.

**Phases**
- **Phase 1 (no app release):** OMS, portal, ACOM and comms changes on today's app. The experiment assigns the flow.
- **Phase 2 (app release):** the new app journey (§7). The customer chooses the flow.

| Problem | OMS | Portal | App | ACOM | Comms / Data |
|---|---|---|---|---|---|
| P1 Looks like an order | ✔ | ✔ | ✔ | | |
| P2 Payment too early | | | ✔ | | |
| P3 Black-box wait | ✔ | | ✔ | | ✔ |
| P4 No engagement | ✔ | ✔ | ✔ | | ✔ |
| P5 One way to finish | ✔ | ✔ | ✔ | | |
| P6 Cancel before call | ✔ | ✔ | ✔ | | ✔ |
| P7 Calls don't connect | ✔ | ✔ | ✔ | | ✔ |
| P8 After hours | ✔ | ✔ | | | ✔ |
| P9 Abandoned journeys | ✔ | | | ✔ | |
| P10–P14 Can't supply | ✔ | ✔ | | | ✔ |
| P15–P19 Portal | | ✔ | | | |
| P20 Why requests die | ✔ | ✔ | | | ✔ |
| P21 Counted wrong | ✔ | | | | ✔ |

## 5. OMS (backend)

**Solves:** P1, P5, P6, P7, P8, P9, P14, P20, P21.

### 5.1 Request lifecycle

| State | Meaning |
|---|---|
| `RX UPLOADED` | Rx uploaded, not submitted. Handled like a cart the customer left. |
| `RX VERIFICATION PENDING` | Submitted request, waiting for the pharmacist. |
| `CART CREATED` | Pharmacist pressed Create cart; the cart is in the customer's app. |
| `ORDER CREATED` | Real order; today's flow continues. Counted as an order placed. |
| `ON HOLD` / `SCHEDULED` | Existing: not connected (back after 1 hour) / customer asked for later. |
| `ABANDONED → ACOM` | Journey stalled; becomes an ACOM lead. |
| `CLOSED` + reason | Ended with a specific reason (e.g. not actionable, can't supply, cancelled by customer). No ACOM lead. |

### 5.2 Requirements
- **OMS-1.** Submitting a Type 1 upload creates a request in `RX VERIFICATION PENDING` on today's order record, not an order. It is counted as a request.
- **OMS-2.** An order is created only by Create order (flow 3) or by the customer checking out a created cart (flows 1–2). Order placed is counted at `ORDER CREATED`.
- **OMS-3.** The Rx tag (Prescription / Not a prescription) is a field on the request and never blocks it.
- **OMS-4.** Every state change is saved with time, who made it (customer, pharmacist, system) and the reason.
- **OMS-5.** Live stage for the app: received → pharmacist assigned → preparing cart → cart created, with the pharmacist's name. `CART CREATED` raises an event with a cart link. Built in Phase 1; used by the Phase 2 app.
- **OMS-6.** Each call reason moves the request to its next state (§6.6).
- **OMS-7.** Abandon rules create ACOM leads (§8). All timings are configurable and pause outside pharmacist hours (09:00–19:00).
- **OMS-8.** A request the customer cancels before any call closes with "Cancelled by customer"; no ACOM lead.
- **OMS-9.** The flow (1, 2 or 3) is stored on the request: set by the experiment in Phase 1, by the customer's choice in Phase 2.
- **OMS-10.** Fill rate is stored when the pharmacist builds the draft cart.

### 5.3 Working values (placeholders; Analytics sets the final values)
- Mid-flow inactivity before an ACOM lead: 30 minutes.
- Not-connected attempts before an ACOM lead: 3, or 24 working hours.
- Window to check out a created cart: 2 working hours.
- Hold: 1 hour.

## 6. Pharmacist portal

**Solves:** P5, P8, P10–P20. Small, targeted changes on the current portal; no revamp. Each change goes into every copy of the repeated portal code (Type 1 Patient Call, Create Order, newer Patient Call) until Portal Unification.

### 6.1 Assignment and queue
- **PORT-1.** "Assign" / "Next request" hands the pharmacist the top request. Manual assignment, admin reassignment, supervisor override and Rank-Up stay as they are.
- **PORT-2.** No shift logic: pharmacists keep getting requests as long as they click Assign or Next.
- **PORT-3.** Queue order. **First-time customers always come first**, in every tier:
- **Tier 1:** Callbacks the customer asks for from the app.
- **Tier 2:** Scheduled or held requests now due (to the same pharmacist if online).
- **Tier 3:** Requests past the SLA, oldest breach first.
- **Tier 4:** Fresh requests, newest first, ranked by the priority score.
- **Tier 5:** Backlog, including overnight requests, whenever nothing fresh is waiting.
- **PORT-4.** Priority score signals (weights set by Analytics): repeat customer ↑, past order value ↑, refill of medicines ordered before ↑, several uploads in a short time ↑, tagged "Prescription" ↑, history of no-answer or declines ↓.
- **PORT-5.** Wait-time column with sort by age.

### 6.2 Working a request
- **PORT-6.** The existing "Is it RX Image? Yes/No" control becomes the Prescription / Not a prescription tag. It never blocks the flow.
- **PORT-7.** The call button is available as soon as a request is opened. Verify and digitise aren't forced first.
- **PORT-8.** The pharmacist builds a **draft cart**; the customer's app cart changes only on Create cart. Two end buttons: Create cart (flows 1–2) and Create order (flow 3). The request shows its assigned flow.
- **PORT-9.** If the customer already has a cart, the portal shows it and the pharmacist edits it with the customer on the call. In flow 1, the pharmacist asks whether they want those items along with the Rx items.

### 6.3 Fulfilment before the call
- **PORT-10.** Each searched medicine shows in stock, out of stock or not on Truemeds; the portal shows the request's fill rate, counting substitutes.
- **PORT-11.** Below the configurable fill-rate threshold, the pharmacist closes the request with "Fill rate below threshold". No ACOM lead.
- **PORT-12.** Substitutes appear for out-of-stock or unlisted medicines using the existing substitution logic; an accepted substitute replaces the line.
- **PORT-13.** On partial carts, the pharmacist tells the customer what can be supplied and what is substituted; a decline closes with "Customer declined a partial cart".

### 6.4 Search and coupons
- **PORT-14.** Search results show pack, price and stock; unavailable medicines are shown and flagged, not hidden.
- **PORT-15.** The coupon option sits on the cart screen, lists the customer's eligible coupons with the saving on each and applies in one click (existing coupon engine).

### 6.5 Call results
- **PORT-16.** After every call the pharmacist picks one specific reason. Reasons that need no call can be picked from the request. A free-text note stays next to the reason and is reviewed to add new reasons.

### 6.6 Starting reason list (final list: Swapnil + Pharmacy ops)

| Reason | Next state |
|---|---|
| Agreed, place the order | Order created |
| Agreed, will check out myself | Cart created |
| No answer | On hold |
| Phone switched off or unreachable | On hold |
| Call cut | On hold |
| Customer gave a time to call back | Scheduled |
| Customer busy, no time given | Scheduled |
| Invalid number | Closed |
| Doesn't want the medicines | ACOM lead |
| Price too high | ACOM lead |
| Only checking the price | ACOM lead |
| Bought elsewhere | ACOM lead |
| Asked not to call | Closed, no ACOM call |
| Order placed by mistake | Closed |
| Duplicate upload | Closed |
| Test upload | Closed |
| Blank or unreadable image | Closed |
| Unrelated photo | Closed |
| Medicine not on Truemeds | Closed |
| Out of stock, no substitute | Closed |
| Fill rate below threshold | Closed |
| Customer declined a partial cart | Closed |

## 7. App

**Solves:** P1–P7. Phase 1 changes nothing in the app's screens; Phase 2 needs a release. A clickable mock of both phases is in `docs/14-type1-journey-mock.html`.

### 7.1 Phase 1: this launch, today's app

| # | Customer does and sees | Underneath |
|---|---|---|
| 1 | Uploads the Rx, taps Proceed to checkout, adds patient and address | `RX UPLOADED`; 30 minutes inactive → ACOM lead |
| 2 | Picks a payment mode, taps Place order | Request in `RX VERIFICATION PENDING`, not an order |
| 3 | Success screen and order page; backend-driven status text reads "Prescription received – pharmacist will call" | App's own "Order placed" screen stays; delivery date and rating prompt hidden if backend-driven |
| 4 | Waits; message only if they've left the app | Queue (FTC first); Assign / Next |
| 5 | — | Pharmacist tags Rx, builds draft cart, checks fill rate; low fill → closed and customer told |
| 6 | Picks up the call | Not connected → hold and retry; after the limit → ACOM lead |
| 7 | Agrees medicines and price while the cart appears in their app | Create cart (flows 1–2) or Create order (flow 3) |
| 8 | Checks out (flows 1–2) | `ORDER CREATED`; cart left too long → ACOM lead |
| 9 | Doctor call, packing, payment, delivery | Today's flow |

### 7.2 Phase 2: new app flow
- **Home.** "Have a prescription? Upload it. A Truemeds pharmacist prepares your cart with the best savings. Pharmacist call is free." A live strip shows an open request's status.
- **Upload.** Camera, gallery or past prescriptions; several allowed; thumbnails with remove and add more; a checklist of what a usable prescription shows; "What happens next" in three steps. A medicine-strip photo is fine. Saved as `RX UPLOADED` on upload.
- **Patient & address.** Today's screen. No payment, coupon or delivery date.
- **Choose & send.** "How should we prepare your cart?": Add all medicines from my prescription (flow 1) or Call me before adding medicines (flow 2 or 3). Shows what the pharmacist will do and a live estimate; after hours, says calls start at 9 AM. Button: **Send to pharmacist**.
- **Save our number.** One-time prompt so the call isn't ignored or marked spam.
- **Live status.** Assigning a pharmacist (timer) → named pharmacist checking the prescription → preparing your cart, with a live feed (medicines found, substitute found, coupon applied) and a running savings total. **Call me now** throughout. The customer can leave; Home keeps the status.
- **Your cart is ready.** Success moment, then the cart opens by itself.
- **Cart.** "Prepared by [pharmacist]"; substitutes show what they replace with Keep original; quantities editable; coupon applied; bill, savings and delivery date.
- **Payment.** The exact amount and Truemeds' payment options, including pay once packed. Place order creates the order.
- **Order placed.** Medicines, price, doctor consultation, delivery date. Rating prompt only after delivery.
- **Other outcomes.** "We couldn't prepare your cart" (low fill); "We tried calling you" with Call me now or pick a time (missed call).

### 7.3 App requirements
- **APP-1.** A request, not an order: "Send to pharmacist" replaces "Proceed to checkout"; no "Order placed" wording on a request.
- **APP-2.** No payment-mode or coupon step until a cart exists.
- **APP-3.** Live status screen that opens the cart when it's ready (uses OMS-5).
- **APP-4.** Call me now and a callback sheet (also opened from the missed-call message); a callback goes to the top of the queue.
- **APP-5.** Save-our-number prompt at install and as a home nudge.
- **APP-6.** No delivery date or rating prompt until an order exists.
- **APP-7.** The customer's flow choice on Choose & send (OMS-9).

## 8. ACOM

**Solves:** P9.

- **ACOM-1.** These become Type 1 ACOM leads:
- Rx uploaded, never submitted, after the inactivity window (same as cart abandonment).
- Call keeps failing (attempt or time limit) or the customer declines.
- Cart created, not checked out within the window.
- **ACOM-2.** Not ACOM leads: requests never picked up (fixed by the queue), closed as not actionable, can't supply, cancelled by the customer, or "Asked not to call" (applies to that request only; resets on a new order or cart).
- **ACOM-3.** Each lead carries the Rx, patient and address, the step where the customer stopped, any cart and the call history.
- **ACOM-4.** A lead closes itself if the customer completes first. One open Type 1 lead per customer; the newest wins, including over an open cart-abandon lead.
- **ACOM-5.** Leads join the existing ACOM queue with the current priority logic, without the cart-value filter. ACOM calls whether or not a reminder went out.
- **Dependency (Part D, to be solutioned):** Type 1 lead assignment logic, Type 1 handling in the ACOM portal, and who creates the order from an Rx-only lead (lean: the ACOM agent on the call, with safeguards).

## 9. Comms

**Solves:** P3, P4, P6, P7.

- **COM-1.** No spam: no WhatsApp or SMS while the customer is engaged in the app. Messages go only when they're not in the app.
- **COM-2.** Moments: request received, before the call (with our number), missed call (deep link to the callback sheet), cart ready, low-fill closure.
- **COM-3.** Channel per moment: push notification or WhatsApp (WhatsApp converts best). Decided with the comms track.
- **COM-4.** After hours: the customer is told the pharmacist will call after 9 AM.

## 10. Data and instrumentation

**Solves:** P10, P20, P21.

- **DATA-1.** Request stages, flow, reason and note for every request (OMS-4).
- **DATA-2.** Every search term, result count, zero result, item picked, unavailable or out-of-stock pick, substitute shown and accepted, and fill rate. Handed over to the teams that act on it (catalogue, procurement).
- **DATA-3.** Reporting by stage and flow replaces the "other Truemeds reasons" bucket.
- **DATA-4.** Request and order-placed counts follow OMS-1 and OMS-2.

## 11. Scope

**In (Phase 1):** §5, §6, §8, §9, §10 and the Phase 1 journey in §7.1.
**In (Phase 2):** §7.2 and APP-1 to APP-7.

**Out (people may assume these are included):**
- A portal revamp.
- Skipping the doctor call; it stays for every order.
- Incentive and conversion-credit changes for pharmacists.
- Claim time limit, one-active-request limit and a stuck-request dashboard.
- ACOM lead assignment and Type 1 handling in the ACOM portal (Part D).
- Backend rules for drugs needing a physical prescription and Type 2 drugs (TBD; no journey change).

## 12. Decided vs open

**Decided:** everything in §5–§10.

**Open, confirm first:**
- Which app texts come from the backend, so Phase 1 can change them [Engineering]
- Can the stop step (after upload, address, payment) be identified for ACOM leads? Current data suggests yes [Engineering]
- SLA, priority-score weights, fill-rate threshold, abandon timings and attempt limit [Analytics]
- Experiment design: unit, split, duration [Analytics]
- Restating the order-placed baseline and targets [Analytics]
- Extra ranking variables for Rx-only ACOM leads [Analytics / ACOM]
- Part D: ACOM lead assignment and Type 1 handling in the ACOM portal [Swapnil / ACOM]
- Final reason list and next states [Swapnil / Pharmacy ops]
- "Asked not to call" flow details [Swapnil]
- Comms channel and copy per moment, including the low-fill message [Swapnil / comms track]
- Final name for the closed state (proposed `CLOSED - NOT ACTIONABLE`) [Swapnil]
- Timing of the Phase 2 app release [Swapnil / app team]

**Accepted, not blocking:**
- Until Phase 2 ships, the app's own "Order placed" screen still shows at upload.
- Each portal change is repeated in every copy of the duplicated portal code.

## 13. Rollout and experiment
- Phase 1 behind configuration, so values can be tuned without a release.
- Experiment compares flows by request → delivered, not by pharmacist. In flows 1–2 the customer places the order, so pharmacist conversion drops by design and an ACOM-recovered cart has two agents on one order. Design by Analytics.
- Phase 2 after the app release; the customer's choice replaces experiment assignment.

## 14. Annexure: suggestions, not this build
- Stuck-request and SLA-breach dashboard for supervisors.
- Claim time limit that returns idle requests to the queue.
- A v2 priority score designed from conversion data.

## Change log
| Version | Date | Change | Why | Approved |
|---|---|---|---|---|
| v1.0 draft | 2026-10-14 | Full PRD in its own tab, structured problem → metrics → OMS, portal, app, ACOM, comms, data | Swapnil: earlier PRD too short | — |
