# Type 1 Project: Scope & Pharmacist Portal Analysis

Date: 2026-10-08 · Status: **Analysis done — awaiting go-ahead to Brainstorm**
Source: `reference/portal/pharmacist-portal.html` (packed build of the real portal, v4.8.8, with a mock API). Screens in `reference/portal/screens/`.

> **How this was analysed.** The prototype's mock only covers post-order, ticket and refund screens, so the Type 1 and Create Order screens showed "No Data". I fed them sample data in a local copy (not in your file) to click through the real UI, and read the code for anything that couldn't be rendered. Prices, bill totals and Rx images in the screenshots are placeholders; **the layout and behaviour are real.**

---

## 1. Project scope (as you defined it, 2026-10-08)

| # | Workstream | What it means | Status |
|---|---|---|---|
| **W1** | **OMS: order → request** | Stop creating a real order at Rx upload. Create a *medicine request* (1mg model) that becomes an order only when the customer confirms. Needs new order statuses. | In scope |
| **W2** | **Pharmacist portal: fix + enhance** | Portal mostly works. Fix the misses; reuse as much as possible and enhance only what's needed. Focus: the **Type 1 order** flow and **Create Order** flow. | In scope |
| W2a | ↳ Type 1 leads → Assisted Commerce (ACOM) | Customer uploaded an Rx but never submitted = intent with no lead. Send these to the ACOM portal like cart-abandonment leads, so an agent can call and convert. | In scope |
| W2b | ↳ Search | Agents can't find medicines that are unavailable; search quality is poor. | In scope |
| W2c | ↳ OOS instrumentation | No data on what agents/customers searched for that was out of stock. Need demand-lost data. | In scope |
| W2d | ↳ Discounts / coupons | Coupons exist on the portal but aren't prominent or complete. Show every applicable discount so agents can apply it and convert. | In scope |
| **W3** | **Customer app journey** | The Step 1–2 work (request, not order; no false "Order placed"). | In scope |

---

## 2. How the Type 1 flow works in the portal today

```
Customer uploads Rx (app)  →  order created, ORDER_TYPE 52
        │
        ▼
Order Type 1 list  ── Super-pharmacist assigns orders to pharmacists
        │  click row → lock check (role=CHECKER): "already assigned to another pharmacist" / "not resolved by admin"
        │  then route by status string:
        ├── new / ORDER PLACED ─────► VERIFY RX: "Is it Rx image? Yes/No", add patient, doctor,
        │                              search + add medicines → "Digitize Medicine"
        ├── "PENDING VERIFICATION" ──► PATIENT CALL: call customer, confirm medicines, coupon,
        │                              payment, address → Submit for substitution / Unreachable / Discard
        └── "INVALID ORDER" ────────► DIGITIZE ORDER (error fix): re-digitise, "!!MEDICINES ARE MISSING!!"
                                        │
Submit for substitution ────────────────┘──► doctor / HA call (or "Skip substitute call" if eligible) → confirmed
```

### Screen by screen

| Screen | What the agent sees and does | Evidence |
|---|---|---|
| **Order Type 1 list** | Columns: Order ID (suffix -1/-2/-3 = Type), date, mobile, name, pincode, status, payment, attempted calls, unreachable flag, assignee. Super-pharmacist can assign/unassign and filter by pharmacist. | `01-type1-list.jpg` |
| **Order Type 1 Dashboard** | Date range → only 4 counts: Total, Assigned, Discarded, Unreachable. | code |
| **Verify Rx** | Customer header (orders, value, TM credit/rewards, CSR tickets, SMS log), Rx image viewer with zoom/rotate, "Is it Rx image? Yes/No", patient, doctor (search by reg. no. or add), search medicine + qty → **Digitize Medicine**. | `02`, `03` |
| **Patient Call** | Same header, payment option, address, patient, doctor, **+ Add Medicines** / View Previous Orders, Rx viewer next to the medicine table (qty, price, disable), Apply Coupon, Bill Details, Notes. Sticky action bar: **Call Patient · Unreachable · Submit for substitution · Discard Order**. | `04`–`07` |
| **Add Medicines modal** | Search box + duration, frequency, chronology, qty, morning/afternoon/evening/night dosage. | `08`, `09` |
| **Coupon modal** | Code entry + offer cards (code, title, description, expiry, T&C, and an ineligibility strip such as "Add Rs 412 more to apply"). | `10` |

**How the agent reaches the customer:** only by phone. "Call Patient" is click-to-call through IVR from the pharmacist's number. "Unreachable" becomes clickable **only after a call** and needs a reason (did not answer / not reachable / disconnected / didn't pick up / asked to call later) plus a callback date/time.

---

## 3. Create Order flow (CSR Feature → CREATE ORDER)

```
Enter contact number → Verify → Select Organization → customer / patient / address
→ Search Medicine + qty (or View Previous Orders to reorder) → upload Rx → Apply Coupon
→ payment mode → CREATE ORDER  →  "Order Created Successfully"
```
(`11-create-order-mobile.jpg`, `12-create-order-org.jpg`; the rest is from the code.)

- It **places the order directly**. There is no step where the customer confirms the cart on their side; the agent is the only consent.
- It reuses the same medicine search and the same "Medicine unavailable" / "not supplied by Truemeds" dead ends as Type 1.
- Guardrails exist: unserviceable pincode, cold-storage not serviceable, minimum cart value, invalid warehouse for pincode, age ≥ 18, duplicate medicine, and "all medicines are out of stock".

---

## 4. Findings mapped to your workstreams

Severity: **S1** blocks conversion · **S2** friction · **S3** polish. Tags: `[CODE]` read in code · `[SEEN]` seen rendered · `[VERIFY]` needs confirmation on the live portal.

### W2b: Search

| # | Sev | Finding | Tag |
|---|---|---|---|
| P1 | **S1** | **The search dropdown shows only the SKU name.** No price, pack size, manufacturer, Rx/OTC flag, stock status, or substitute. The agent can't tell the right pack or an available one before picking. | `[SEEN]` `09` |
| P2 | **S1** | **Unavailable medicine = dead end.** Picking an item that isn't supplied by TM or isn't available shows a toast, "Medicine unavailable", and stops. No substitute suggested, no "notify me", nothing captured. | `[CODE]` |
| P3 | S2 | If the backend filters unavailable SKUs out of results (as you described), the agent can't even confirm "we don't stock it" and may keep retyping variants. The client doesn't filter, so the filtering is server-side. | `[VERIFY]` |
| P4 | S2 | Search fires on each keystroke after a 300 ms pause (`SKU_SEARCH`). There is no spelling/salt tolerance on the client; quality depends entirely on the Elastic query. Composition (salt) search isn't exposed. | `[CODE]` |
| P5 | S2 | The search call used `warehouseId=20`, while the order's warehouse was 14. It may be checking availability against the wrong warehouse. | `[VERIFY]` |
| P6 | S3 | "View Previous Orders" reorder **silently drops** unavailable items with a generic message: "Cannot add the medicine(s) from the previous order due to unavailability…". | `[CODE]` |

### W2c: OOS instrumentation

| # | Sev | Finding | Tag |
|---|---|---|---|
| P7 | **S1** | **There is zero product analytics in the portal.** No event fires on search, zero results, "Medicine unavailable", or disabling a line. (The "amplitude"/"logEvent" matches in the code are an animation library and Firebase push internals.) So today we **cannot** answer "how many requests did we lose to OOS, for which SKUs, in which warehouse". | `[CODE]` |
| P8 | S2 | The Type 1 dashboard only counts Total / Assigned / Discarded / Unreachable. There's no conversion %, digitisation TAT, call attempts to connect, or OOS-lost lines. | `[CODE]` |

### W2d: Coupons / discounts

| # | Sev | Finding | Tag |
|---|---|---|---|
| P9 | S2 | **The coupon modal is better than its entry point.** It already shows title, description, expiry, T&C and *why* a coupon isn't eligible ("Add Rs 412 more…"). But it sits behind a small "Apply Coupon" link under the medicine table. | `[SEEN]` `10` |
| P10 | S2 | **No "you save ₹X" per coupon and no best-coupon suggestion.** The agent has to try codes one by one. (1mg's pharmacist auto-applies the best coupon.) | `[SEEN]` |
| P11 | S2 | Offers come from `fetchAllCxOffers` filtered by `offersVisible`. TM Rewards ("Use ₹X from TM Rewards") and coupons are *either/or* in the UI, and the agent isn't told which is better. | `[CODE]` |
| P12 | S3 | Coupon validity depends on payment mode ("not applicable for selected payment mode"), but this only shows up as an error after applying. | `[CODE]` |

### W2a: Type 1 leads to ACOM

| # | Sev | Finding | Tag |
|---|---|---|---|
| P13 | **S1** | **Rx upload abandonment never reaches anyone.** The portal only sees Type 1 *orders*. A customer who uploaded an Rx and dropped before submitting doesn't exist for ops. | `[CODE]` + your input |
| P14 | — | **Something reusable exists.** The newer Patient Call screen has an "incomplete order" flow (`confirmOrderFromIncompleteState`, `fetchIncompleteSalesDashboard`, tabs and address/patient panels), but its listing page (`/CSRFeatures/incompleteListing`) **isn't registered as a route** in this build. It may be legacy or may have moved to the ACOM portal. Could be a base for Type 1 leads. | `[CODE]` `[VERIFY]` |
| P15 | S3 | The "Sales Team" menu item is just an embedded Metabase report. | `[CODE]` |

### W1 / W3: Order → request (portal impact)

| # | Sev | Finding | Tag |
|---|---|---|---|
| P16 | **S1** | **The portal routes on hard-coded status strings** ("INVALID ORDER", "PENDING VERIFICATION", everything else → Verify Rx). Any new request statuses must be added to the list API, the routing, the lock check (`Proceed`/`Hold`) and the dashboard counts. | `[CODE]` |
| P17 | **S1** | **No way to send the cart to the customer for approval.** The only consent channel is a phone call (IVR). This is the portal side of critique C2: a 1mg-style "your medicines are ready, review & checkout" needs a "share cart to app / WhatsApp" action here. | `[CODE]` |
| P18 | S2 | **Create Order places the order directly** with no customer-side confirmation. Should it also become request → customer confirms? | `[CODE]` |

### Other bugs / misses found along the way

| # | Sev | Finding | Tag |
|---|---|---|---|
| P19 | S2 | **The Patient Call screen crashed to a blank page** on load because it builds the gender dropdown before the gender list arrives (a race between two API calls). I had to patch one line to continue. It may only reproduce on slow responses. | `[SEEN]` `[VERIFY]` |
| P20 | S2 | **The same logic is duplicated across 3–4 screens.** Patient Call, Patient Call (new), Create Order and one more chunk each carry their own copy of search, "Medicine unavailable", coupon and bill logic. A fix in one place won't fix the others. This matters for "reuse as much as possible". | `[CODE]` |
| P21 | S3 | "Unreachable" is disabled until a call is made through the portal's IVR. If the agent called from another phone, they can't mark it. | `[CODE]` |

---

## 5. What's worth reusing as-is

- The order-list + assignment model (super-pharmacist assign/unassign, lock check).
- The Verify Rx → Digitize → Patient Call sequence and its Rx viewer.
- The coupon modal component, including its ineligibility messages.
- Unreachable reasons + callback date/time.
- The customer header (history, TM credit, tickets, SMS log).
- Create Order guardrails (serviceability, cold storage, min cart, warehouse).
- Possibly the dormant "incomplete order" flow (P14) for Type 1 leads.

---

## 6. What Apurva's latest PM-agent update adds (read 2026-10-08 from `origin/main`)

The repo has no dedicated Type 1 portal project. But four pieces bear directly on our scope.

### 6.1 Portal Unification (Apurva's initiative, brainstorm stage, not PRD'd)
Source: `projects/ACOM/acom-portal-revamp/CLAUDE.md`, `knowledge/memory-export/areas/portal-unification.md`

| Sub-initiative | What it says | Impact on Type 1 |
|---|---|---|
| **Unified portal experience** | One shared calling + commerce (create/edit order) layer across **ACOM, Pill Reminder, Type 1, Discard, Create New Order, HA**. Agents grouped by skill (pharmacist → Type 1/HA). | Our portal fixes (search, coupon, cart, call) should be built **once, as shared components**, not patched in 3–4 copies (P20). Type 1 + Create Order are explicitly named. |
| **Configurable Lead Management System** | Lead-routing rules per portal in config, not hard-coded. | Type 1 leads (W2a) should be a **config entry in the LMS**, not a one-off query. |
| **Push-based allocation** | Push orders to agents/doctors to accept/decline, replacing the pull "Assign" CTA, to measure real availability. | The Type 1 list today is pull plus super-pharmacist manual assign (§2). Is pharmacist allocation part of our "OMS allocation" scope, or does it stay with Apurva? `[OPEN]` |

A **central design system** now exists (`design-system/`, used by the doctor portal and ACOM My Statistics). Portal UI work should reuse it.

### 6.2 ACOM lead machinery (what Type 1 leads would plug into)
Source: `projects/ACOM/CLAUDE.md`, `ring-ai/CLAUDE.md`, `ring-ai/DESIGN_JOURNAL.md`, `ftc-priority/`

- Leads live in `incomplete_order_details` (`iod`), with **one open incomplete order per customer, keyed on `order_id`**.
- BAU pick query:
  - Filters: `orderstatus = 49`, `order_value > 900`, active, last cart activity 30 min–24 h ago, not assigned.
  - Order: by `final_score`, then by value.
  - FTC-priority query in front of it, for FTC carts with `order_value > 700`.
- AI (Ring) leads have extra rules: min AOV ₹500, and **patient + address** required. Customers are put on Hold/Schedule, DNC is respected, and there's a cap of 3 connected calls per 7 days.

**Why a Type 1 abandoned Rx doesn't fit as-is:**

| ACOM gate | Abandoned Rx upload |
|---|---|
| `order_value` threshold / AOV score | **No value**: no medicines are priced yet |
| Patient + address | Often missing (customer dropped before that step) |
| `order_id` key | If we move to the request model (W1), there may be no order at all |

→ Type 1 leads need **their own eligibility and priority signal** (e.g. repeat/chronic customer, past AOV, Rx recency) and a **request ID** as the key. The AI lead-qualification PRD already anticipates this. It tags leads with "our own reference, not the order number" and lists **"prescription uploaded but no order"** as a target drop-off: a configuration change, not a rebuild.

### 6.3 Who handles Type 1 today (needs reconciling)
`voicebot-cart-recovery-prd.md` §8.3 says Rx-uploaded-but-idle customers are "handled today by a separate team (a pharmacist reads the Rx, builds the cart, and calls to complete)".
That is the **Type 1 order** queue in this portal. It fits your point: once an Rx is *submitted*, there's a team; if the customer *drops before submitting*, there's no lead. Worth confirming that's the split. `[OPEN]`

### 6.4 Rules that carry over
- **DNC:** the Type 1 *order* call is exempt from Do-Not-Call ("calls an order needs to progress"). An abandoned-Rx *lead* call is a sales call and **should respect DNC**. Under the request model we must decide which kind of call a "request" call is. `[OPEN]`
- **AI bot guardrail:** the bot never validates an Rx or suggests substitutes. AI can qualify a Type 1 lead, but **a pharmacist must build the cart**.
- **Substitution:** pharmacists who recover carts already pitch substitutes, so the later HA substitution call may be redundant. The Type 1 portal already has a "Skip substitute call" option. Worth using more.

---

## 7. Questions before we brainstorm

1. **Live vs. prototype.** Is v4.8.8 in this file what agents use today? P5 (warehouse 20) and P19 (crash) should be checked on the live portal.
2. **"Incomplete order" flow (P14).** Is that the current cart-abandonment lead flow, now living in the ACOM portal? If yes, Type 1 leads could plug into it.
3. **Search backend.** Does `SKU_SEARCH` filter out unavailable SKUs on the server? Who owns the Elastic query?
4. **Customer consent channel.** Can the portal trigger an app push / WhatsApp with a cart link today, or is that net-new?
5. **Create Order.** Should it also move to request → customer confirms, or stay agent-placed?
6. **Pharmacist allocation.** Is push-based allocation for Type 1 (§6.1) in our scope, or does it stay in Apurva's Portal Unification track?
7. **Lead definition.** For abandoned Rx uploads, what's the eligibility/priority signal when there's no cart value? And does the lead go to ACOM agents or straight to the Type 1 pharmacist team?
8. **Build path.** Should portal fixes be built as shared components under Portal Unification (coordinate with Apurva), or as Type 1-only patches first?
