# Type 1: A Prescription Upload Is Treated as an Order

**Owner:** Swapnil Singh · **Updated:** 2026-10-13 · **Status:** Part A (OMS) in review

---

## 1. Problem

A Type 1 journey starts when a customer uploads only a prescription and asks us to arrange the medicines. Today the order system treats that upload as an order. Everything that follows (what the customer sees, what the pharmacist does, what we count, what happens when the journey stops) is built on that wrong assumption. Most Type 1 requests never become a delivered order, and we can't say why.

### 1.1 Customer experience in the app

**It looks like an order, but it isn't one.**
After uploading a prescription, the customer goes through an order-placement flow and is told "Order placed". But nothing about it is an order yet: there are no medicines, no quantities and no price. Because it has none of the attributes of an order, price, payment and discounts can't really apply to it. When we later can't reach the customer, or the cart changes on the call, they see their "order" cancelled or altered and feel misled.

**Payment and discount steps come before there's anything to pay for.**
The flow asks the customer to pick a payment mode and apply a coupon on an empty order. These steps have nothing to act on, add confusion, and are a likely point where customers drop off.

**The wait is a black box.**
After submitting, the customer isn't told what happens next: that a pharmacist will call, roughly when, what the call is for, and when they'll see their medicines and price. Other signals add to the confusion, such as a delivery date before a cart exists and a feedback prompt before anything has happened.

**Nothing keeps the customer engaged while they wait.**
The customer sees a static card: no named pharmacist, no expected call time, no progress and no way to ask for a call. They put the phone down, lose interest, and miss or ignore the call when it comes. An engaging wait, where the customer knows a pharmacist is working on their prescription and when to expect the call, keeps them close to the phone, so more calls connect and more requests convert.

**There's only one way to finish.**
The only path today is: the pharmacist calls, builds the cart and places the order. A customer who would rather review a cart and check out themselves can't. The journey should support three ways to finish:
1. The pharmacist adds everything on the prescription to the cart; the customer reviews it and checks out.
2. The pharmacist calls, the customer says what they want and don't want, the cart is built from that, and the customer checks out.
3. The pharmacist calls, builds the cart and places the order (today's path).

### 1.2 Demand we lose

**Customers cancel before we call.**
Many customers drop the request within minutes of placing it, before any pharmacist reaches them. The misleading "Order placed", the empty payment step and the silent wait all push them to give up early.

**Calls don't connect.**
The whole journey depends on one phone call. Customers miss it, there's no easy way for them to ask for a callback or pick a time, and our calling number sometimes shows as spam. A request whose call never connects simply dies.

**After-hours requests wait too long.**
Requests that arrive when pharmacists aren't working wait until morning. Then newer requests are picked first, so the oldest wait longest. By the time we call, the customer has lost interest or bought elsewhere.

**Abandoned journeys reach nobody.**
A customer who uploads a prescription and stops at any step (before submitting, at the address or payment step), whose call fails, or who doesn't complete a cart is never followed up. Abandoned carts in other journeys become leads for the Assisted Commerce (ACOM) team; abandoned Type 1 journeys don't. That wastes leads ACOM could convert.

### 1.3 Medicines we can't supply

This is the biggest reason requests die after the call.

**Prescribed medicines often aren't available.**
Many medicines on the prescription aren't on Truemeds or are out of stock. The pharmacist finds out only while building the cart, often after already talking to the customer.

**No substitutes are offered.**
When a medicine is out of stock, the portal doesn't suggest a substitute, so the pharmacist has no alternative to offer and the line is simply dropped.

**Partial carts put customers off.**
Often only some of the medicines can be supplied. Many customers don't want a partial order and decline the whole request.

**Fulfilment can't be checked before the call.**
The pharmacist can't look at the prescription, try building the cart and see how much can be supplied before calling. Calls are spent on requests that can't be fulfilled, while requests that could be fulfilled wait.

**Low-fill requests can't be closed cleanly.**
There's no way to close a request because too little can be supplied, with a clear reason. These requests are discarded under vague reasons, so the real size of the problem is hidden.

### 1.4 Pharmacist portal

**Pharmacists pick their own work.**
A pharmacist has to choose a request from the list and assign it to themselves. There's no "next request" and no view of how long each request has waited, so the oldest don't get priority.

**The prescription check is a gate it doesn't need to be.**
The pharmacist must confirm the prescription is valid before going further. That decision doesn't change the outcome: these orders get a doctor call anyway, and a photo of a medicine strip works just as well for building the cart. A simple tag ("prescription" or "not a prescription") is enough.

**The call comes last.**
The pharmacist must verify the prescription and digitise at least one medicine before they can call the customer and create the order. Calling first and building the cart with the customer would be faster and avoid wasted work.

**Search doesn't help the pharmacist find the right medicine.**
Results show little more than the name, not the pack, price or stock needed to pick the right item. Unavailable medicines are hidden, so the pharmacist can't even confirm the medicine exists in our catalogue.

**Coupons are hard to apply.**
Pharmacists can't easily see and apply the discounts a customer is eligible for, so customers miss offers that would help them decide.

### 1.5 Data

**We can't see why requests die.**
After a call, the pharmacist can only mark "Unreachable". Call results (agreed, declined, call later, not connected), discard reasons, what was searched, and which medicines were unavailable or out of stock aren't recorded. We can't size each problem, follow up correctly, fix the catalogue or plan stock.

**Type 1 is counted at the wrong moment.**
An upload is counted as an order placed, even though no order has been agreed. Order and cancellation numbers for Type 1 are misleading as a result.

### 1.6 Opportunity snapshot

Type 1 funnel today (per day, from the CX / Portals FY26-27 roadmap appendix):

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

Out of stock alone kills about a quarter of placed Type 1 orders, and another quarter dies for "other Truemeds reasons" we can't break down.

Targets:
| Metric | Today | Target |
|---|---|---|
| Orders placed (OP) / day | 1,333 | 1,750 (+417) |
| Orders delivered (OD) / day | 133 | 250 (+117) |
| OP → OD conversion | 10% | 14.3% |
| OP GMV / month (AOV ₹1.5K) | ₹6 Cr | ₹7.88 Cr (+₹1.88 Cr) |

Where it comes from:
- **Assisted Commerce:** about 55K Type 1 journeys a month stall and reach nobody; sending them to ACOM targets +10K OP a month.
- **Allocation:** after-hours requests reached sooner → fewer cancellations.
- **Engagement:** a clear request flow and an engaging wait → more calls connect, fewer cancellations.
- **Coupons:** agents can apply coupons → higher conversion.
- **Stock-out recovery:** about 10K orders a month hit a stock-out; substitutes recover part of them.

About two-thirds of the delivered-order gain has to come from better conversion, not more leads. Once an upload stops counting as an order placed, the OP baseline needs restating.

---

## 2. Solution

### 2.1 Solution by problem
Each problem is solved and closed in turn. The detailed design for each layer follows in 2.2.

#### P1. It looks like an order, but isn't one — ✅ Closed
- **OMS:** the upload creates a request in `RX VERIFICATION PENDING`, not an order. The order is created only when the cart is complete: the pharmacist presses Create order, or the customer checks out a created cart. Now this lives on today's order record; after Portal Unification it becomes a Type 1 lead.
- **Portal:** the Type 1 list, lock and dashboard show the new status.
- **App (no release):** status texts sent by the backend use request wording: **"Prescription received – pharmacist will call"**. The hard-coded "Order placed" screen stays until an app release.
- **Comms:** a message on submit says it's a request and a pharmacist will call.
- **Open (engineering):** which app texts come from the backend (E3).

#### P21. Type 1 is counted at the wrong moment — ✅ Closed
- A **request** is counted at submit (`RX VERIFICATION PENDING`); an **order placed** only at `ORDER CREATED`. The main success measure is request → delivered.
- **Open (Analytics):** how the order-placed baseline is restated.

#### P5. There's only one way to finish — ✅ Closed
- **Every request gets a call** from the Type 1 pharmacist. The experiment then assigns one of three flows.
- **Flow 1, call → full Rx cart → self-checkout:** the pharmacist adds everything on the Rx as written, presses Create cart; the customer checks out.
- **Flow 2, call → cart as the customer wants → self-checkout:** the pharmacist builds the cart from what the customer wants, presses Create cart; the customer checks out.
- **Flow 3, call → cart → order:** the pharmacist builds the cart and presses Create order.
- **OMS:** new state `CART CREATED`; a created cart not checked out within 2 working hours becomes an ACOM lead.
- **Portal:** the pharmacist works in a draft cart (today edits show in the customer's cart instantly); Create cart and Create order buttons; the request shows its assigned flow; an existing customer cart is shown and edited with the customer on the call.
- **App (no release):** portal-built carts already appear in the app and can be checked out.
- **Engagement:** the cart is built on the call while the customer is engaged on the phone and in the app, so they see it and check out during or right after the call.
- **Not in this launch:** a "Your cart is ready" message.
- **Later, with an app release (APP-3):** an in-app waiting screen lets flow 1 run without a call. The backbone for it is built now in OMS and the portal (see Part C).
- **Open (Analytics):** experiment design (unit, split, duration).

#### P9. Abandoned journeys reach nobody — ✅ Closed
- **OMS, abandon rules** (all configurable; clocks pause outside pharmacist hours):
- **Rx uploaded, never submitted** → ACOM lead after inactivity, the same as today's cart abandonment.
- **Call keeps failing or customer declines** → ACOM lead after the attempt or time limit, or straight away on "Declined".
- **Cart created, not checked out** → ACOM lead after the checkout window.
- **Values are placeholders** (e.g. 3 attempts); final values are set after Analytics validates the data.
- **Every Type 1 lead** carries the Rx, patient and address, the step where the customer stopped, any cart and the call history; closes itself if the customer completes first; one per customer, the newest wins, including over an open cart-abandon lead.
- **ACOM:** leads join the existing queue with the current priority logic minus the cart-value filter; the agent sees the Type 1 tag, the stop step and the Rx.
- **"Asked not to call" (feature):** no ACOM call for that request. It applies to that one request only and resets when the customer places a new order or cart.
- **Not ACOM leads:** never picked up (allocation); closed as not actionable; **can't supply** (tagged with the reason and closed at the Type 1 stage; substitutes are offered on the call, see P10–P14).
- **Comms:** reminders are a separate track; ACOM calls regardless.
- **Dependency (Part D):** ACOM lead assignment, Type 1 handling in the ACOM portal, and who creates the order from an Rx-only lead.
- **Open (Analytics / ACOM):** extra ranking variables for Rx-only leads.
- **Open (Engineering):** confirm the stop step (after upload, address, payment) can be identified; current data suggests it can.
- **Open (Swapnil):** finalise the "Asked not to call" flow.

#### P20. We can't see why requests die — ✅ Closed
- **Portal:** after every call the pharmacist must pick one **specific reason** from a dropdown. Reasons that need no call (e.g. blank image, not on Truemeds) can be picked from the request itself. A **free-text note stays** next to the reason; we review the notes regularly and add new specific reasons from them.
- **Each reason stands on its own**, never grouped under another. "Order placed by mistake" and "Duplicate upload" are separate reasons.
- **OMS:** each reason moves the request to its next state and is saved with time, who picked it and the note.
- **Data:** Analytics reports reasons by stage (before call, after call, after cart) and by flow, replacing the "other Truemeds reasons" bucket. Search and stock-out logging is covered in P10–P14.
**Starting list** (final list with Pharmacy ops):

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

- **Open (Swapnil + Pharmacy ops):** final reason list and the next state for each.
- **Open (Analytics):** reporting view of reasons by stage and flow.

#### P10–P14. Medicines we can't supply — ✅ Closed
- **P13, check fulfilment before the call (portal):** the pharmacist reads the Rx and builds the draft cart before calling. Each searched medicine shows in stock, out of stock or not on Truemeds, and the portal shows the request's **fill rate** (lines that can be supplied, counting substitutes).
- **P14, close low-fill requests cleanly (OMS + portal):** below a **configurable fill-rate threshold** the pharmacist closes the request with the reason "Fill rate below threshold"; no ACOM lead. Above it, the pharmacist calls.
- **P11, substitutes on the call (portal):** for an out-of-stock or unlisted medicine, search shows substitutes using the **existing substitution logic** (business rules and tech already exist). The pharmacist offers them on the call; an accepted substitute replaces the line.
- **P12, partial carts:** the pharmacist tells the customer upfront what can be supplied and what is substituted; the customer accepts the partial cart or declines ("Customer declined a partial cart").
- **P10, unavailable medicines visible (portal):** search shows unavailable medicines flagged instead of hiding them.
- **Logging (data):** every search term, result count, zero result, item picked, unavailable or out-of-stock pick, substitute shown and accepted, and the fill rate per request. The data is handed over to the teams that act on it (catalogue, procurement).
- **Open (Analytics):** fill-rate threshold value.
- **Open (Swapnil, comms):** how the customer is told when a request is closed for low fill without a call. Suggested copy: "We couldn't fulfil your medicine request because the medicines are unavailable, so we've cancelled it."

#### P15–P19. Pharmacist portal — ✅ Closed
Small, targeted changes on the current portal; no revamp.
- **P15, pharmacists pick their own work:** a "Next request" button assigns the next request in queue order; a wait-time column with sort by age. The queue order is set by the assignment logic (P8 + P15).
- **P16, the Rx check is a gate:** the existing "Is it RX Image? Yes/No" control becomes a tag (Prescription / Not a prescription). It never blocks the flow; the doctor call still happens downstream.
- **P17, the call comes last:** the call button is available as soon as a request is opened; verify and digitise aren't forced first. Building the draft cart before calling (to check fill rate, P13) is recommended, not required.
- **P18, search doesn't help:** results show pack, price and stock; unavailable medicines are shown and flagged; substitutes appear for them; every search is logged.
- **P19, coupons are hard to apply:** the coupon option sits on the cart screen, lists the customer's eligible coupons with the saving on each, and applies in one click, using the existing coupon engine.
- **All five:** the portal repeats the same code on several screens, so each change goes into every copy until Portal Unification.

#### P8 + P15. Assignment logic and after-hours requests — ✅ Closed
- **Push assignment:** "Assign" / "Next request" hands the pharmacist the top request. Current manual assignment, admin reassignment and supervisor override **stay as they are**. Rank-Up stays.
- **User-controlled pace:** no shift logic; as long as the pharmacist clicks Assign or Next, they keep getting requests.
- **Queue order:**
- **First-time customers (FTC) always come first**, in every tier.
- **Top of the queue:** callbacks the customer asks for from the app (APP-4).
- **Tier 1:** scheduled or held requests that are now due (back on time, to the same pharmacist if online).
- **Tier 2:** requests waiting past the SLA, oldest breach first.
- **Tier 3:** fresh requests, newest first, ranked by the priority score.
- **Tier 4:** the backlog (including overnight requests), served whenever there are no fresh requests.
- **Priority score (design, values TBD):** repeat customer ↑, past order value ↑, refill of medicines ordered before ↑, several uploads in a short time ↑, tagged "Prescription" ↑, history of no-answer or declines ↓; expected fill rate later. **Analytics owns the weights.**
- **After hours:** the customer is told the pharmacist will call after 9 AM; clocks pause; overnight requests join the backlog and the ageing override stops them being buried.
- **Out of scope for now:** claim time limit (supervisors reassign manually); one-active-request limit (conflicts with bulk manual assignment); stuck-request / SLA-breach dashboard (suggestion).
- **Open (Analytics):** SLA value, score weights.

#### P6 + P7. Customers cancel before we call; calls don't connect — ✅ Closed
- **P6, cancel before the call:** the backend status reads "Prescription received – pharmacist will call" (P1); a WhatsApp message on submit says the pharmacist will call shortly to confirm medicines and price; first-time customers and fresh requests are called first (P8 + P15). A request the customer cancels before any call is **closed** with the reason "Cancelled by customer" (no ACOM lead). Measure time from upload to first call and pre-call cancellations by hour.
- **P7, calls don't connect:**
- **WhatsApp before the call** (highest-converting channel): "Our pharmacist will call you from [number] shortly".
- **WhatsApp after a missed call:** a link into the app, where a callback bottom sheet opens; a callback request goes to the **top of the queue** (APP-4).
- **Save our number:** the app prompts the customer to save our calling number at install and nudges on the home page when needed, so it isn't flagged as spam (APP-5). The verified caller ID is already in place.
- **Portal / OMS:** every attempt is recorded with a reason (P20); not-connected requests go on hold and come back on time; after the attempt limit, ACOM lead (P9).
- **Open (comms track):** channel and copy for these messages, following the no-spam comms rule (P2–P4).

#### P2–P4. Customer experience in the app — ✅ Closed
- **P2, payment and discount too early (APP-2):** remove the payment-mode and coupon steps from Type 1; payment and coupons only once a real cart exists. No change until an app release.
- **P3, the wait is a black box:** now, the backend status "Prescription received – pharmacist will call" and a message on submit and before the call. App: live status with the pharmacist's name (APP-3), and **no delivery date or rating prompt until an order exists (APP-6)**; if these texts come from the backend (E3), they can be hidden now.
- **P4, nothing keeps the customer engaged:** now, the cart is built on the call while the customer is engaged (P5). App: the waiting screen that opens the cart when it's ready (APP-3) and "Call me now" with the callback sheet (APP-4). The backbone (live stage, pharmacist name, `CART CREATED` event) ships in this launch.
- **Comms rule, no spam:** if the customer is engaged in the app, no WhatsApp or SMS is sent. Messages go out only when the customer isn't in the app (e.g. after a missed call, or once they leave), with **push notifications** considered alongside WhatsApp. The channel per stage is decided with the comms track.
- **Open (Engineering):** which app texts come from the backend (E3).
- **Open (Swapnil + comms track):** channel per stage (push notification vs WhatsApp) and copy.
- **Open (Swapnil + app team):** timing of the app release carrying APP-1 to APP-6.

### 2.2 Detailed design

### Part A. OMS

#### A.1 What OMS gets wrong today
- An order is created at upload; there is no request stage.
- Only one way to finish exists in the system (pharmacist places the order).
- A stalled journey is never marked abandoned, so nothing reaches ACOM.
- Call results don't move the request to a next step.
- Stages aren't recorded with timestamps, so messages and reporting can't use them.
- An upload is counted as an order placed.

#### A.2 The core change: an intermediate state
Between the upload and the order we add one state, **`RX VERIFICATION PENDING`**. While a journey is in this state it is a **request**: not shown as an order, not counted as one. The order is created only when the cart is complete.

```
Today:  Upload → ORDER CREATED ("Order placed") → verify + digitise → call → confirm
New:    Upload → RX VERIFICATION PENDING (request) → tag Rx → build cart → ORDER CREATED → today's flow continues
```

- **Now (no app release):** the state lives on today's order record. The record exists but becomes an order only at the end. *[Recommended: smallest change; the portal already works on this record.]*
- **Later (Portal Unification):** the upload becomes a lead tagged Type 1. We use the same state names and events now so this carries over.
- The Rx tag (Prescription / Not a prescription) is a field, never a gate.

#### A.3 Three ways to finish
The Type 1 pharmacist calls every customer. The experiment decides which flow the request then follows; the pharmacist follows it.

1. **Call → full Rx cart → self-checkout.** Pharmacist calls, adds everything on the Rx to the cart as written, presses **Create cart**; the customer checks out.
2. **Call → cart → self-checkout.** Pharmacist calls, builds the cart from what the customer wants, presses **Create cart**; the customer checks out.
3. **Call → cart → order.** Pharmacist calls, builds the cart and presses **Create order**.

Portal-built carts already reach the customer's app cart with no release. Because edits show up instantly today, the pharmacist now works in a **draft cart**; only Create cart / Create order sends it. If the customer already has a cart, the pharmacist sees it, edits it with them on the call and gets their confirmation. In flow 1, if the customer already has a cart, the pharmacist calls first and asks whether they want those items along with the Rx items.

Reading the experiment: results are compared per flow (request → delivered), not per pharmacist. In flows 1 and 2 the customer places the order, so pharmacist conversion drops by design, and a cart recovered by ACOM has two agents on one order. Incentives are out of scope.

#### A.4 States

| State | Meaning |
|---|---|
| `RX UPLOADED` | Rx uploaded, not submitted. Handled like today's cart that a customer leaves. |
| `RX VERIFICATION PENDING` | Submitted; waiting for the pharmacist. |
| `CART CREATED` | Cart sent to the customer; waiting for checkout. |
| `ORDER CREATED` | Real order; today's flow continues. Counted as order placed here. |
| `ON HOLD` / `SCHEDULED` | Existing: call not connected (back in 1 hour) / customer asked for later. |
| `ABANDONED → ACOM` | Journey stalled; becomes an ACOM lead. |
| `CLOSED - NOT ACTIONABLE` *(name proposed)* | Pharmacist removed it (e.g. unusable upload). No ACOM lead. |

#### A.5 When a journey is abandoned
All timings are configurable and pause outside pharmacist hours.
- **Uploaded but never submitted** → ACOM lead after inactivity, same as cart abandonment.
- **Call keeps failing or customer declines** → ACOM lead with the Rx, any cart and call history.
- **Cart created but not checked out** → ACOM lead with the cart.
- **Submitted but never picked up** → not a lead; fixed in allocation.
- **Submitted after hours** → the customer is told the pharmacist will call after 9 AM; clocks pause; calls start in the morning.

Working defaults (placeholders; final values set after Analytics validates the data): 30 minutes of inactivity before a mid-flow lead; 3 not-connected attempts or 24 working hours on a call; 2 working hours to check out a created cart; 1 hour on hold.

Every Type 1 lead:
- carries the Rx, the patient and address if captured, and where the customer stopped (after upload, at summary or address, or at payment);
- closes itself if the customer submits or orders before ACOM calls;
- is one per customer, with the newest upload winning;
- is called whether or not a reminder message went out (reminders belong to the comms track).

#### A.6 Call results decide the next step
Every call needs a result and a reason:
- **Agreed, place the order** → order created (flow 3).
- **Agreed, will check out myself** → cart created (flow 2).
- **Not connected** → on hold; after the attempt limit, ACOM lead.
- **Call me later** → scheduled.
- **Declined** → ACOM lead.
- **No point pursuing** → closed, not actionable. For an unusable upload the pharmacist can call anyway or close it without a call.
- **Can't supply** (unavailable, out of stock with no substitute, fill rate below the configured threshold) → tagged with that reason and closed at the Type 1 stage. **Not sent to ACOM.** Substitutes are offered by the Type 1 pharmacist on the call itself.

Sample reasons (final list with Pharmacy ops):

| Result | Sample reasons |
|---|---|
| Declined | Doesn't want the medicines · Asked not to call · Order placed by mistake · Bought elsewhere · Price too high · Only checking price |
| Not connected | No answer · Switched off · Call cut · Invalid number |
| Call me later | Gave a time · Busy, no time given |
| Not actionable | Blank or unreadable image · Unrelated photo · Duplicate upload · Test upload |
| Can't supply | Medicines not on Truemeds · Out of stock, no substitute · Fill rate too low · Customer declined a partial cart |

#### A.7 Stages and counting
- Every state change is saved with time, who did it and why. The comms track sends messages on these; reporting reads them.
- **Live status for the app (backbone for APP-3):** OMS exposes each request's current stage (received, pharmacist assigned, cart being built, cart created) with the pharmacist's name, and raises a `CART CREATED` event with a link to the cart. Built now; the app uses it when it ships.
- A **request** is counted at submit; an **order placed** only at `ORDER CREATED`. The main success measure is request → delivered.

We also track request → order created, time from upload to order, ACOM recovery (leads → orders) and the share of uploads tagged "Not a prescription". Guardrail: complaints and cancellations after an order is created.

#### A.8 Dependency: ACOM
OMS creates Type 1 leads, but ACOM needs two things we will solution separately:
- **Lead assignment** for Type 1 leads (today's logic relies on cart value, which Rx-only leads don't have).
- **Handling Type 1 in the ACOM portal**: seeing the Rx, where the customer stopped, and completing the purchase.
- **Who creates the order from an Rx-only lead.** The lean is that the ACOM agent creates it on the call, which needs Rx viewing, medicine search and safeguards for agents who aren't pharmacists.

Until then, Type 1 leads use ACOM's current logic without the cart-value filter.

#### A.9 Open questions
- Final name for the closed state (proposed `CLOSED - NOT ACTIONABLE`).
- "Asked not to call" flow details (feature agreed: no ACOM call for that request; resets on a new order or cart).
- Final call-result reason list (Swapnil + Pharmacy ops).
- *Engineering:* which app status texts come from the backend (changeable now) vs the app (needs a release)?
- *Analytics / ACOM:* extra ranking variables for Rx-only leads (on top of current ACOM priority minus the value filter).
- *Analytics:* how targets restate once upload stops counting as an order placed.

### Part B. Portal
Not started. Can't-supply decisions so far: drop a request when its fill rate is below a **configurable threshold**, tag it with the reason, and **log every search, zero result and unavailable or out-of-stock medicine** for catalogue and procurement. To check feasibility first: the pharmacist sees the Rx and tries the cart **before** calling, sees the fill rate, and can close a low-fill request with a reason; every unavailable or out-of-stock medicine is logged. Backbone for APP-3: opening a request and adding the first item update the live status the app will show. Also covers the agreed portal fixes: wait-time view, Rx tag, call first, call results, stock-outs with substitutes, richer search, search recording, coupons. From the road-ahead review: reuse the existing "Is it RX Image? Yes/No" control as the tag; apply small fixes in each copy of the repeated portal code.

### Part C. App
Requirements only for now (app release parked). The backend and portal backbone is built in this launch so the app needs no backend change later.

The app journey ships in two phases. **Phase 1** goes out with this launch on today's app (no release): OMS, portal and comms change underneath it. **Phase 2** is the new app flow, built on the reference flow we reviewed, and needs an app release. The doctor call stays in both phases, whatever the prescription.

#### C.1 Phase 1: this launch, today's app

| # | What the customer does and sees (today's app) | What happens underneath |
|---|---|---|
| 1 | Uploads the Rx, taps "Proceed to checkout", adds patient and address | OMS records `RX UPLOADED`. If they stop here for 30 minutes, it becomes an ACOM lead (P9) |
| 2 | Picks a payment mode and taps "Place order" (screens unchanged until Phase 2) | OMS creates a **request** in `RX VERIFICATION PENDING`, not an order. Not counted as an order placed |
| 3 | Sees the success screen and order page. Backend-driven status texts now read "Prescription received – pharmacist will call" | The app's own "Order placed" screen stays. Delivery date and rating prompt hidden if backend-driven (E3) |
| 4 | Waits; gets a message only if they've left the app (no-spam rule) | The request enters the Type 1 queue (FTC first, tiers, score). A pharmacist gets it via Assign / Next |
| 5 | — | The pharmacist tags the Rx, builds a draft cart, sees the fill rate. Below the threshold: closed "Fill rate below threshold" and the customer is told (copy TBD). Otherwise the pharmacist calls |
| 6 | Picks up the call | Not connected: on hold and retried; after the limit, ACOM lead. Missed-call message sent |
| 7 | On the call, agrees the medicines, substitutes and price, while watching their app cart | Flow set by the experiment. Flows 1–2: pharmacist presses Create cart; the cart appears in the customer's app. Flow 3: pharmacist presses Create order |
| 8 | Flows 1–2: checks out the cart in the app during or right after the call. Flow 3: nothing to do | `ORDER CREATED`; counted as an order placed. Cart not checked out in time → ACOM lead |
| 9 | Normal order journey: doctor call, packing, payment, delivery | Today's flow, unchanged |

#### C.2 Phase 2: new app flow (needs an app release)

**Screen 1. Home.** The entry card reads "Have a prescription? Upload it. A Truemeds pharmacist prepares your cart with the best savings. Pharmacist call is free." When a request is open, a strip on Home shows its live status and opens Screen 6.

**Screen 2. Upload prescription.**
- Camera, gallery or past prescriptions; several prescriptions allowed.
- A short checklist of what a usable prescription shows: doctor's name, patient's name, medicines and dosage, date.
- A photo of the medicine strip is fine; the pharmacist tags it.
- Logic: the upload is saved straight away as `RX UPLOADED`; leaving here starts the 30-minute abandon clock (P9).

**Screen 3. Patient and address.** Pick the patient and the delivery address. No payment mode, no coupon, no delivery date (APP-2, APP-6).

**Screen 4. Choose and send.**
- "How should our pharmacist prepare your cart?" The customer picks: **Add all medicines from my prescription** (flow 1) or **Call me before adding medicines** (flow 2 or 3, decided on the call). In Phase 1 the experiment assigns the flow; in Phase 2 the customer chooses.
- A note that the pharmacist call is free and a doctor consultation follows for every order.
- Button: **"Send to pharmacist"** (APP-1).
- After hours, the screen says the pharmacist will call after 9 AM.
- Logic: creates the request in `RX VERIFICATION PENDING`. Prompts to save our calling number if not yet saved (APP-5).

**Screen 5. Request sent.** "Prescription received – pharmacist will call", with a link to the live status. No "Order placed", no rating prompt.

**Screen 6. Live status (the waiting screen, APP-3).** Stages driven by OMS events:
- **Assigning a pharmacist**, with a short timer.
- **Checking your prescription**: the named Truemeds pharmacist, once assigned.
- **Preparing your cart**: once the first item is added ("Finding the best price and substitutes").
- A **"Call me now"** button at every stage (APP-4); a callback request goes to the top of the queue.
- If the customer leaves the app, they get a push notification or WhatsApp at the next stage change (no-spam rule).
- **Your cart is ready** (`CART CREATED`): the screen shows success and opens Screen 7 automatically.
- Other outcomes: "We couldn't prepare your cart" when it is closed for low fill or can't supply; "We tried calling you" with Call me now or pick a time after a missed call.

**Screen 7. Cart.**
- "Prepared by [pharmacist]": the medicines added, substitutes marked "same salt", quantities editable.
- Best coupon already applied, savings shown, delivery date shown now that the cart is real.
- Button: **"Proceed to checkout"** with the amount.
- Logic: not checked out within the window → ACOM lead with the cart.

**Screen 8. Payment.** The exact amount; the customer picks a payment mode (including "Pay once your order is packed") and places the order. Logic: `ORDER CREATED`, counted as an order placed.

**Screen 9. Order placed.** "Order placed – Pay once your order is packed", now a real order: medicines, price, doctor consultation, delivery date. The rating prompt comes only after delivery.

**Mock:** a clickable walkthrough of both phases is in `docs/14-type1-journey-mock.html`.

**TBD (backend business logic, no change to the journey):** drugs that need a physical prescription, and Type 2 drugs.

**Flow 3 in Phase 2:** when the pharmacist places the order on the call, Screen 6 jumps straight to Screen 9.


#### C.3 App requirements

**APP-1. A request, not an order.** Replace "Proceed to checkout" with a request-style button (lean: "Send to pharmacist") and drop "Order placed" wording.

**APP-2. No payment step for Type 1.** Remove the payment-mode and coupon steps until a cart exists.

**APP-3. An engaging wait that builds the cart in front of the customer.**
- **Problem:** after submitting, the customer leaves the app and doesn't know when a cart is ready. Without a call or a message, a pharmacist-built cart sits unseen, so flow 1 can't run without a call.
- **Solution:** after submitting, the customer stays on a waiting screen with a timer and live status ("Pharmacist assigned", "Building your cart"). In the background the pharmacist builds the cart. When they press Create cart, the screen shows "Your cart is ready" and takes the customer straight to the cart to check out. To the customer it looks like the cart is being built while they wait.
- **Backbone now (OMS):** live request stage with the pharmacist's name; `CART CREATED` event with a cart link.
- **Backbone now (portal):** assigning or opening a request sets "pharmacist assigned"; adding the first item sets "building your cart"; Create cart fires the event.
- **Unlocks:** flow 1 without a call; addresses "nothing keeps the customer engaged" (P4).

**APP-4. Ask for a call.** A "Request a call" / "Call me now" option in the app, and a callback bottom sheet that opens from the missed-call WhatsApp link. A callback request goes to the top of the pharmacist queue.

**APP-5. Save our number.** Prompt the customer to save our calling number at install, and nudge on the home page when needed, so calls aren't flagged as spam.

**APP-6. No order signals on a request.** No delivery date and no rating or feedback prompt until an order is created.
### Part D. ACOM
To be solutioned: lead assignment and Type 1 handling in the ACOM portal.

---

## 3. PRD
The full PRD is in the "PRD v1.0" tab (source `docs/15-type1-prd.md`).
