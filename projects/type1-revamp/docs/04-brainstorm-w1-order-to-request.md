# W1 Brainstorm: Order → Request (Type 1 placed flow)

Date: 2026-10-08 · Status: **Brainstorm (W1 only) — awaiting your pick before we finalise**
Goal (yours): **minimum effort, maximum impact, close it.**
Inputs: `02-critique.md` (C1–C15), `03-portal-analysis.md` (P16–P18).

Effort and impact below are **relative, PM estimates**, not engineering sizing.

---

## 1. The problem in one line

At Rx upload we create a real order (`orderstatus 1 NEW`, type 52) and tell the customer **"Order placed"**. But nobody has seen the medicines or price, the customer never approves the cart in the app, and the only consent is a phone call.

What has to be true when we're done:
1. The customer is never told "Order placed" before they've seen and accepted what they're getting. (C1, C4)
2. We don't ask for money decisions before there's an amount. (C3)
3. The phone call is a fallback, not the only path to consent. (C2, C5)
4. "Orders placed" metrics stop counting Rx uploads that never became orders.

---

## 2. Three options

### Option A: Copy & screen clean-up only (no backend change)

The backend stays exactly as is. We change what the customer sees.

| Change | Fixes |
|---|---|
| CTA "Place order" → **"Submit prescription"** | C1, C12 |
| Success screen: "Prescription submitted. Our pharmacist will prepare your medicines" instead of "Order placed" | C1 |
| Tracker: **Prescription submitted → Pharmacist reviewing → Order confirmed → Packed → Dispatched → Delivered** | C1, C8 |
| Remove payment-mode selection and coupon picking before submit (pay after packing is unchanged) | C3, C4 |
| Hide "Delivery by Tomorrow 10 PM" until confirmed | C4 |
| Remove the rating prompt, next-order reminder and PriceLock interstitial from this moment | C9, C13 |
| One name for the call: "Pharmacist call", plus "you may also get a doctor call" | C8 |

- **Effort:** S (app copy + removing a screen/step; no OMS, no portal change)
- **Impact:** Medium. Fixes honesty and confusion. **Doesn't fix** consent (still phone-only) or metrics.

### Option B: "Request" as a customer-facing stage + in-app cart approval ★ recommended

Keep the backend order (so the pharmacist queue, digitisation, doctor call and OMS stay as they are). Add **one new step**: the customer approves the digitised cart in the app.

```
Customer: Upload Rx → patient + address → "Submit prescription"
   │   (backend: order created as today, type 52, status NEW — customer sees "Request")
   ▼
Pharmacist (portal): Verify Rx → Digitize (as today)
   │   NEW: "Send to customer for approval"  (instead of calling first)
   ▼
Customer: push / WhatsApp "Your medicines are ready" → Review screen:
   medicines · substitutes & savings · price · best coupon applied · ETA
   → "Confirm order"   (payment still after packing)        → becomes "Order placed"
   → "Call me" / "Change something"                          → pharmacist call (today's flow)
   No response in X hours                                     → pharmacist call (today's flow, fallback)
   ▼
Doctor call / auto-confirm → ORDER CONFIRMED → packed → dispatched (unchanged)
```

| Layer | Change |
|---|---|
| **App** | Everything in Option A, **plus** a "Review your medicines" screen (reuse the order-details page with line items, prices and savings) with **Confirm** / **Call me**. |
| **OMS** | **One new status** between digitised and confirmed, e.g. `AWAITING CUSTOMER APPROVAL`, plus a timer that moves unanswered requests to the pharmacist call. No new entity. |
| **Portal** | One new button, **"Send to customer for approval"**, next to "Call Patient". Add the new status to the hard-coded routing list (P16). |
| **Metrics** | Count a Type 1 as an "order placed" only from customer approval, or from pharmacist-call confirmation. Earlier states = "request". This is a status filter change. |

- **Effort:** M (one status, one app screen, one portal button, one notification, a metric filter)
- **Impact:** High. Fixes honesty (C1, C3, C4), consent (C2), call dependency (C5), and shows the substitution savings in the app (C11). Fixes metrics.

### Option C: Full request entity (the clean 1mg model)

A new *request* object. No order exists until the customer checks out a pharmacist-built cart. The portal works on requests, not orders.

- **Effort:** L–XL. New entity, OMS + pharmacist portal rewired (hard-coded statuses, lock, dashboard), changes to ACOM keys, analytics re-baselined.
- **Impact:** Highest and cleanest, but most of the *customer-visible* value is already delivered by B.
- Better done inside Apurva's **Portal Unification** track than as a Type 1 one-off.

---

## 3. Side by side

| | A: Copy only | **B: Request stage + approval** | C: New request entity |
|---|---|---|---|
| Effort | **S** | M | L–XL |
| "Order placed" honesty (C1, C4) | ✅ | ✅ | ✅ |
| No money ask before amount (C3) | ✅ | ✅ | ✅ |
| In-app consent, call becomes fallback (C2, C5) | ❌ | ✅ | ✅ |
| Savings/substitutes visible (C11) | ❌ | ✅ | ✅ |
| Clean "orders placed" metric | ❌ | ✅ (status filter) | ✅ (native) |
| Touches pharmacist portal | No | 1 button + status | Rewire |
| Creates a cart-abandonment step (critique M1) | No | Yes, but with call fallback | Yes |
| Can ship in phases | — | **Yes: A first, then approval** | No |

---

## 4. Recommendation: B, shipped in two releases

| Release | What | Why first |
|---|---|---|
| **R1 (fast)** | Option A as is: copy, tracker, remove payment/coupon/ETA/rating/reminder before submit. **Plus a quick win:** get the Truemeds number verified on Truecaller ("Truemeds — Pharmacy") (C6). | No backend work. Removes the false "Order placed" right away. Lifts call pickup, which everything still depends on. |
| **R2** | New status `AWAITING CUSTOMER APPROVAL` + review screen + "Send for approval" portal button + push/WhatsApp + no-response timer → call. Metric switch. | Moves consent into the app and makes the call a fallback. |
| Later | Option C only if/when Portal Unification rebuilds the order layer. | Avoid a big rewrite for a small extra gain. |

**Pharmacist allocation** (who gets which Type 1 order) stays **unchanged** in W1. Today's assign/lock logic keeps working because the order still exists. Push-based allocation stays with Apurva's track.

---

## 4b. Revised under your constraint (2026-10-08): no app release, backend + portal only

> **[USER-PROVIDED] The app is in experimentation; an app release takes too long. W1 must ship with backend + portal changes only.**

### What we can still change without an app release

| Lever | Why it needs no app release |
|---|---|
| Order statuses and status *labels* sent by the API | If the app renders the tracker/"Detailed status" text from the API, new labels show without a release `[VERIFY: which app strings are server-driven]` |
| Push, SMS and WhatsApp templates | Sent by the backend |
| WhatsApp interactive messages (buttons) | Handled by backend + WhatsApp provider |
| Metrics definitions | Analytics/backend |
| Pharmacist portal | Web deploy |

### What we **can't** fix without the app (parked for the next app release)
Hard-coded "Order placed" success screen and confetti (C1 partly), payment-mode selection before amount (C3), delivery date shown before the cart (C4), rating and reminder prompts (C9). Any of these that turn out to be server-driven move back in scope.

### Revised option: B-lite, in two levels

**Level 1: backend only (smallest)**
1. **New status at upload.** A Type 1 upload gets a new status, e.g. `RX SUBMITTED` (request), instead of being counted as a placed order. The pharmacist queue keeps working because the order row still exists. The portal's Type 1 list includes the new status.
2. **Metrics.** Type 1 counts as "order placed" only at confirmation. Discarded/unreachable requests stop polluting order counts.
3. **Notification copy.** Push/SMS/WhatsApp at upload say "Prescription received, our pharmacist will prepare your medicines and contact you", not "order placed".
4. **Status labels** (if server-driven): "Prescription submitted → Pharmacist reviewing → Order confirmed".

**Level 2: portal + WhatsApp approval (consent without the app)**

```
Pharmacist digitises in portal (as today)
   → NEW portal button: "Send for approval on WhatsApp"
   → Customer gets WhatsApp: medicines · price · savings vs. prescribed brand · coupon applied
        [Confirm order]  [Call me]
   → Confirm  → status moves to confirmed path (doctor call / auto-confirm as today)
   → Call me / no reply in X h → back to the pharmacist's call list (today's flow)
```
- **OMS:** one status, `AWAITING CUSTOMER APPROVAL`, plus a timer that falls back to the call.
- **Portal:** one button, the status added to routing (P16), and the approval outcome shown on the order row.
- The call becomes a fallback without any app change.

| | Level 1 | Level 2 |
|---|---|---|
| Effort | S (status, metric filter, templates) | M (+ WhatsApp interactive flow, 1 portal button, timer) |
| Fixes | Metrics, notification honesty, labels if server-driven | + in-app-less consent (C2), call dependency (C5), savings shown (C11) |
| Dependency | Which app strings are server-driven | WhatsApp provider supports interactive buttons + approved templates |

**Unchanged in W1:** pharmacist allocation/assignment, digitisation, doctor call, payment after packing.

---

## 5. Decisions needed from you before we finalise

1. ~~**Pick:** A, B (R1 → R2), or C?~~ Superseded: no app release → **B-lite** (§4b). Pick Level 1 only, or Level 1 + 2.
1a. **Server-driven strings:** which app texts come from the API (tracker steps, status names, "Order placed" title)? Needs a quick check with app engineering.
1b. **WhatsApp:** does our WhatsApp provider support interactive reply buttons for this?
2. **Approval timeout:** how long do we wait for the customer before falling back to the pharmacist call? (Suggest 1–2 h in working hours.) `[OPEN]`
3. **Doctor call:** does customer approval happen **before** the doctor call (recommended, so the doctor sees the final cart) or after? `[OPEN]`
4. **Upfront intent (1mg style):** at submit, should we ask "Order everything in my Rx" vs "Call me first"? It adds one tap but lets "call me" customers skip the approval step. `[OPEN]`
5. **Metric definition:** does Analytics accept "Type 1 order placed = customer approved or pharmacist-confirmed"? `[OPEN]`
