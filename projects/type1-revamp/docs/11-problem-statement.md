# Type 1: Problems We're Solving

Date: 2026-10-13 · Status: **Draft for review.** Once agreed, this becomes §2 of the PRD (`10-oms-prd.md`).
Style rule for this section (Swapnil, 2026-10-13): **no numbers, no competitor names.** Problem statements only.

A Type 1 order starts when a customer uploads only a prescription and asks us to arrange the medicines. Today the journey, from the app through the pharmacist portal, has problems at every step. They lead to drop-offs and cancellations, and to demand we never see.

---

## A. Customer experience in the app

**A1. Type 1 looks like an order, but it isn't one yet.**
After uploading a prescription, the customer goes through an order-placement flow and is told "Order placed". Nobody has seen the medicines or agreed a price. When we later can't reach them or the cart changes, the customer feels misled.

**A2. Payment and discount steps come too early.**
The customer is asked to choose a payment mode and apply a coupon before there is anything to pay for. These steps don't belong in a Type 1 journey and add confusion.

**A3. The customer doesn't know what happens next.**
After submitting, they get no clear explanation: that a pharmacist will call, roughly when, what the call is for, and when they'll see their medicines and price. Other signals add to the confusion: a delivery date shown before the cart exists, and a feedback prompt before anything has happened. Nothing keeps the customer engaged while they wait.

**A4. There's only one way to finish.**
Today the only path is: the pharmacist calls, builds the cart and places the order. Customers can't complete the purchase themselves, even when they would prefer to. The journey should support three ways to finish:
1. The pharmacist adds everything on the prescription to the cart; the customer reviews it and **checks out themselves**.
2. The pharmacist calls, the customer says what they want and don't want, the cart is built from that, and the customer **checks out themselves**.
3. The pharmacist calls, builds the cart and **places the order** for the customer (today's path).

---

## B. Demand we lose

**B1. Abandoned Type 1 journeys reach nobody.**
A customer who uploads a prescription and stops, at any step, is never followed up. Neither is a customer whose pharmacist call fails or who doesn't complete a cart. Abandoned carts in other journeys become leads for the Assisted Commerce (ACOM) team; abandoned Type 1 journeys don't. This wastes ACOM leads and the conversion they could bring.

**B2. Requests that arrive after hours wait too long.**
Requests that come in when pharmacists aren't working are not called or allocated in time. In the morning, newer requests are picked first, so earlier ones wait longest. Customers lose interest and cancel.

---

## C. Pharmacist portal

**C1. Pharmacists pick their own work.**
A pharmacist has to choose an order from the list and assign it to themselves. There's no "next order" and no view of how long each request has waited, so the oldest requests don't get priority.

**C2. The prescription check is a gate it doesn't need to be.**
Before going further, the pharmacist must confirm whether the prescription is valid. That decision doesn't change the outcome: the customer gets a doctor call for these orders anyway, and a photo of a medicine works just as well for building the cart. It should be a simple tag ("prescription" or "not a prescription") that doesn't block the flow.

**C3. The call comes last.**
The pharmacist must verify the prescription and digitise at least one medicine before they can move to the customer call and create the order. Calling the customer first and building the cart with them would be faster.

**C4. Search doesn't help the pharmacist find medicines.**
Out-of-stock medicines don't appear in search, so the pharmacist can't even confirm the customer's medicine. When a medicine is out of stock, no substitute is offered. Results show only the name, not what the pharmacist needs to choose the right item.

**C5. Coupons are hard to apply.**
Agents can't easily see and apply the discounts a customer is eligible for, so customers miss offers that would help them decide.

**C6. Call results can't be recorded.**
After a call, the pharmacist can only mark the customer "Unreachable", and only if the call was made through the portal. There's no way to record what happened (agreed, declined, asked to be called later, not connected) or why, using a reason list. So requests aren't followed up correctly, and we don't learn why customers don't convert.

---

## D. Data we don't have

**D1. We don't know what's being searched or what's out of stock.**
Searches, zero results and unavailable medicines aren't recorded. We can't measure the demand we lose to stock-outs, fix gaps in the catalogue, or plan stock.

**D2. Type 1 numbers are counted at the wrong moment.**
A Type 1 upload is counted as an order placed, even though no order has been agreed. Order and cancellation numbers for Type 1 are misleading as a result.

---

## E. Observed, not yet scoped

- **E1. Calls are easy to miss.** The whole journey depends on one phone call. Customers miss it, there's no easy way for them to ask for a callback, and our calling number is sometimes shown to customers as spam.

---

## Where each problem gets solved

| Problem | App (needs a release; later) | OMS (backend) | Pharmacist portal | ACOM | Data |
|---|---|---|---|---|---|
| A1 Looks like an order | ✔ wording/flow | ✔ request status; order created later | | | |
| A2 Payment/coupon too early | ✔ remove steps | | | | |
| A3 What happens next | ✔ status screens | ✔ messages on each stage (comms track) | | | |
| A4 Three ways to finish | ✔ checkout of a pharmacist-built cart | ✔ request → cart → order states | ✔ "Send to customer", "Create order" | | |
| B1 Abandoned journeys | | ✔ abandon rules | | ✔ Type 1 leads | |
| B2 After-hours waits | | ✔ queue rules | ✔ age view | | |
| C1 Self-pick | | ✔ next order | ✔ | | |
| C2 Rx gate | | | ✔ tag only | | |
| C3 Call comes last | | | ✔ call first, then create | | |
| C4 Search | | ✔ search results | ✔ | | |
| C5 Coupons | | | ✔ | | |
| C6 Call results | | ✔ next step per result | ✔ reason dropdown | | ✔ |
| D1 Search/OOS data | | ✔ | | | ✔ |
| D2 Counted too early | | ✔ | | | ✔ |

## Why OMS and the portal first
- The app is in experimentation, and an app release takes time. **OMS and the portal can change now.**
- OMS changes stop Type 1 being treated as an order before the customer agrees. They also make every stage measurable and send abandoned journeys to ACOM.
- Portal changes remove wasted pharmacist steps (self-pick, Rx gate, call last). They also fix search and coupons, so more requests turn into orders.
- Both set up the app changes for later: when the app is ready, the states and data it needs already exist.
