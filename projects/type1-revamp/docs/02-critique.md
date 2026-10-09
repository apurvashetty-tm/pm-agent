# Type 1 (Rx-only) Order Flow — Step 2: Critique

Date: 2026-10-05 · Status: **Step 2 of 4 (Critique) — awaiting review**
Input: `01-evaluation.md` (TM screen refs = `TM #n`, 1mg refs = `1mg #n`)

Scope: **Truemeds vs Tata 1mg only.** Critique mode: what is broken and why it matters. No solutions here; those come in Step 3 (Brainstorm).

Severity: **S1** breaks trust or blocks the order · **S2** adds friction or confusion · **S3** polish

---

## Part A: Critique of the Truemeds flow

### The core problem in one line
> Truemeds asks the customer to **commit to an order before telling them what the order is**. Every later screen then has to defend a promise that hasn't been earned.

At the moment of "Order placed" (TM #12) the customer does not know:
- which medicines will come (brand or substitute)
- how many
- the price, the discount, or whether the coupon applies
- whether the Rx is even valid

…yet they have already picked a payment mode and been shown a delivery date.

### A1. Commitment & honesty

| # | Sev | Issue | Evidence | Why it hurts | How 1mg handles it |
|---|---|---|---|---|---|
| C1 | **S1** | **"Order placed" for an order with no contents.** The success screen, order page, tracker step 1 and detail status all say the order is placed. | TM #12, #14, #15, #18 | The customer's mental model of an order is "I know what I bought and what I pay". Ours is really an *Rx request awaiting digitisation*. When the pharmacist discards the Rx or can't reach the customer, the customer sees "my order got cancelled", not "my request needs fixing". This is a trust hit we create ourselves. | Calls it a "**medicine request**" (1mg #7). "Placed" only appears after payment (1mg #13–14). |
| C2 | **S1** | **No in-app consent to contents or price.** The only way the customer approves what they're getting is the pharmacist/doctor **phone call**. | TM #2, #12, #18; no cart screen exists | The phone call is a single point of failure. Miss it (TM #19 shows exactly that) and the order is stuck in the queue. A voice call is also the worst channel for comparing prices and substitutes. | In-app cart with line items, prices and **Edit** (1mg #12). The call is optional (toggle, 1mg #7). |
| C3 | **S1** | **Payment mode asked before any amount exists.** "Total amount will be calculated post processing", then pick UPI/Card/COD and tap "Place order". | TM #10 | We ask for a money decision with nothing to decide on. And since TM collects payment *after packing* anyway, the choice is meaningless right now. The FAQ "Will I have to pay now?" (TM #10) shows the screen itself creates the confusion. | Amount first (₹274.94 → ₹283.94), then mode (1mg #12–13). |
| C4 | **S2** | **Promises made before the facts are known:** delivery "Tomorrow 10 PM", coupon "will apply after verification" (min ₹799), PriceLock "guarantee". | TM #8, #9, #11 | Each is an IOU that can bounce. The ETA can slip if stock or the call is late. The coupon fails if the digitised value is under ₹799. PriceLock "protects" a price the customer never saw. A broken promise costs more than no promise. | Shows ETA and coupon **after** the cart is built. The pharmacist picks the best coupon (1mg #7, #12). |

### A2. The wait state (after placing, before confirmation)

| # | Sev | Issue | Evidence | Why it hurts | How 1mg handles it |
|---|---|---|---|---|---|
| C5 | **S1** | **Call-dependent and fragile, with no in-app recovery.** The call was missed at 1:00, with no ETA beforehand, and no "call me back", retry or "I'm busy, call later" option. | TM #13, #19 | Backend has `MARK UNREACHABLE` → the order dies. Customer has no lever to save it. | "Request a call" + retry on failure + editable number (1mg #10). |
| C6 | **S1** | **Caller ID reputation.** Truecaller shows "Truemeds Meducine" with spam-style community comments. | TM #19 | The single most important touchpoint in the whole flow arrives looking like spam. Pickup rate is directly at risk, and C2/C5 depend on that pickup. | Caller ID shows "Tata Mg", tagged **Doctor** (1mg #16). |
| C7 | **S2** | **Black-box waiting.** A static "Pharmacist call" card with no ETA, no named person and no progress indicator. | TM #15 | The customer can't plan ("should I keep my phone near me?"). Uncertainty drives "where is my order" contacts and cancellations. | Assignment countdown (00:25), named and credentialed pharmacist, 4–6 min ETA, progress bar, home-screen strip (1mg #1, #8–9). |
| C8 | **S2** | **Three names for the step, and the customer doesn't know how many calls are coming.** "Pharmacist call", "Consultation call" and "Doctor consultation pending" all appear. In the backend there can be **two** calls (pharmacist digitisation + doctor), unless auto-confirm applies. | TM #2, #12, #18; tm-chotu flow | The customer answers one call, thinks they're done, then misses the second one. | Uses "pharmacist" consistently. The doctor call is tagged as such. |

### A3. Timing & information architecture

| # | Sev | Issue | Evidence | Why it hurts |
|---|---|---|---|---|
| C9 | **S2** | **Asks come before value.** The rating prompt fires 0 min after placement, the "remind me for my **next** order" sheet at 1 min, plus a lab-test upsell. | TM #14, #15, #17 | Rating an experience that hasn't happened gives bad data and irritates. Asking about the next order before the first is confirmed reads as pushy. |
| C10 | **S2** | **"Add medicines" silently changes the order type.** On the Rx-only summary, adding a medicine converts Type 1 (52 → pharmacist queue) into Type 2 (53 → doctor directly). | TM #6; tm-chotu definitions | The customer is unaware of the routing change. Two paradigms ("you build the cart" vs "we build the cart") are mixed on one screen. |
| C11 | **S2** | **Our main selling point is invisible.** Substitutes and savings are what make Truemeds different, but nothing in the Rx flow shows them before commitment. They only come up later on a call (HA call). | Whole flow | The moment of highest intent passes without the pitch. Explaining substitutes over the phone is weaker than a visual comparison. |
| C12 | **S3** | **Entry copy frames it as an order from the first tap:** "Add a prescription to place your order". | TM #1 | This sets up the wrong mental model for everything that follows (feeds C1). |
| C13 | **S3** | **Too many confirmations:** success screen + PriceLock interstitial + push + "We have received your order" + detailed status, all within about 60 seconds. | TM #11–14 | This is noise, and it makes C1 louder: the false "placed" message is repeated five times. |
| C14 | **S3** | **Rx quality is checked late.** Validity rules are text bullets only, with no visual guide and no image-quality check at upload. | TM #3 | A bad Rx is only caught when the pharmacist sees it → discard. The customer already has "Order placed" (C1). |
| C15 | **S3** | **Screen ordering:** the order summary shows "Delivery by (select address)" and only then sends the customer to address selection. | TM #6 → #7 | A back-and-forth that adds a step. |

### A4. Failure moments the "order-first" framing makes worse
*(from Apurva's 5-pass gap model: Pass 2 first-order failures and Pass 4 state intersections)*

| Failure | Backend reality | What the customer experiences today |
|---|---|---|
| Rx invalid / unreadable | Pharmacist → `DISCARD ORDER` | "My order got cancelled" |
| Customer unreachable | `MARK UNREACHABLE` | Order sits silently, then dies |
| Medicine OOS / substitute only | Digitised with changes | First learns of changes on the call or at packing |
| Digitised value under ₹799 | Coupon drops | "You promised me 23%" |
| Customer adds medicines while pharmacist is digitising | Type/route conflict | Undefined `[OPEN]` |
| Customer uploads a 2nd Rx after placing | Separate order or merge? | Undefined `[OPEN]` |
| Customer cancels during the call | Order in mid-state | Undefined `[OPEN]` |

Hypothesis, needs data (Q2): Type 1 discard and unreachable orders land in the **dead-order set** (tm-chotu locked definition). That inflates "orders placed" while depressing conversion, so today's metrics may *overstate* Type 1 demand and hide the real drop-off point.

### A5. What Truemeds does well (protect these)

| Strength | Evidence | Why keep it |
|---|---|---|
| **Pay after packing** | TM #12, #16 | Zero financial risk for the customer. This is a genuine edge over 1mg, which wants payment upfront. |
| Past-prescription reuse, grouped by patient | TM #4 | Fast repeat path for chronic patients |
| Patient selection | TM #7 | Supports family ordering |
| Fast to hand off (about 4 min, no waiting) | TM #1–12 | Low effort for "just handle it for me" customers |
| Clear payment FAQ | TM #16 | Good content, even though it exists because of C3 |

---

## Part B: Critique of 1mg (don't copy it blindly)

| # | Issue | Evidence | Risk if we copy it |
|---|---|---|---|
| M1 | **The customer has to come back.** 8–10 min of waiting before the cart, so the customer must return to the app to check out. | 1mg #8–12 | **This creates a cart-abandonment step that doesn't exist at TM today.** TM's order-first model captures intent immediately. Directly relevant: Apurva's ACOM voice-bot cart-recovery PRD (`projects/acom-ring-ai`) already deals with this problem. |
| M2 | **Pay-first.** Payment is collected at order placement. | 1mg #13 | TM's pay-after-packing edge is lost if we copy 1mg's checkout as-is. |
| M3 | **Fees added by default.** "Earliest delivery chosen" auto-adds a ₹49 rapid fee; COD adds ₹9. | 1mg #12–13 | Charging fees the customer didn't actively choose looks like a dark pattern and erodes trust. |
| M4 | **Two decisions upfront, and the ETA changes:** process option + call toggle, with the ETA going 4 → 6 min. | 1mg #7 | Cognitive load at the upload moment |
| M5 | **Call request can fail:** "Request for call couldn't be sent, please retry". | 1mg #10 | Recovery exists, but the failure is still visible |
| M6 | **Even 1mg verifies after placement:** after "Placed", items still show "Prescriptions are getting verified". | 1mg #14 | Cart-first does **not** remove post-order verification. The real question is *what the customer has agreed to* at "Placed". |
| M7 | Auto-advance timer: "Continuing to next step in 1 sec". | 1mg #11 | Rushes the customer at the review moment |

---

## Part C: Summary scorecard (subjective, 1–5, based on screenshots)

| Dimension | TM | 1mg | Notes |
|---|---|---|---|
| Honesty of state ("what's really happening") | 1 | 4 | C1, C4 |
| Customer control / consent | 1 | 4 | C2, C3 |
| Wait-state confidence | 2 | 4 | C5–C8 |
| Speed to hand off | **4** | 2 | TM's strength; M1 |
| Financial risk to customer | **5** | 3 | Pay after packing vs pay-first |
| USP visibility (savings/substitutes) | 1 | n/a | C11 |
| Call reliability / reputation | 1 | 4 | C6 |

---

## Key tension to carry into the Brainstorm

> **Trust vs. capture.** 1mg's "request → cart → order" model wins on honesty and control, but adds a return-to-checkout step where customers can drop off. TM's "order first" model wins on capture and zero-risk payment, but over-promises and depends on one phone call.
> The brainstorm should look for a flow that keeps **TM's capture and pay-after-packing** while gaining **1mg's honesty and in-app consent.**

Constraints to validate before or during the brainstorm:
- The pharmacist queue and ops metrics are keyed on `orderstatus = 1 NEW` *orders*. A "request" state may need backend work. `[OPEN]`
- Where should the doctor call (Rx compliance) sit in a cart-first model? `[OPEN]`
- Funnel data (Q2) to size each critique item. `[OPEN]`
