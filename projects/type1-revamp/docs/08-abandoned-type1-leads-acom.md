# Abandoned Type 1 → ACOM Leads (including mid-flow abandonment)

Date: 2026-10-12 · Status: **Picks received (§9); requirements framed (§10); V brainstorm (§11) awaiting picks**
Builds on `06` §5 and `07` §10. Constraints: Type 1 only (R2), no app release (R3), min effort / max impact (R4).

---

## 1. Confirmed scope (2026-10-12) `[CONFIRMED]`

- **Mid-flow abandonment counts.** A customer who **uploads a prescription but never clicks through to place/raise the request** is the Type 1 equivalent of a mid-flow cart abandonment. **This must flow to ACOM** too.
- Together with D20: **every abandoned Type 1 journey → ACOM lead.**
- **Incentive calculation is out of scope.** Keep only a callout of the Arm B (cart-creation-only) impact (§7).

---

## 2. Where a Type 1 journey can be abandoned (full taxonomy)

App flow observed (`01-evaluation.md`, TM #1–#12): Home → Upload Rx → *"Successfully uploaded"* → Proceed to checkout → Order Summary → Patient & address → Coupon → **Payment mode** → Place order.

| Lead type | Where the customer stopped | What we have | Cart? |
|---|---|---|---|
| **T1-M1** | Uploaded Rx, never pressed "Proceed to checkout" | Rx image | No |
| **T1-M2** | Reached Order Summary / address, didn't continue | Rx + maybe patient/address | No |
| **T1-M3** | Reached the **payment-mode screen**, didn't place | Rx + patient + address | No |
| T1-V | Request submitted (`RX VERIFICATION PENDING`), never verified | Rx + patient + address | No |
| T1-A | Cart built, pharmacist call failed / declined (Arm A) | Rx + cart | **Yes** |
| T1-B | Cart sent, customer didn't check out (Arm B) | Rx + cart (in app) | **Yes** |

**M1–M3 are the new mid-flow scope.** They are all **Rx-only** leads: no medicines, no cart value.

> Observation: M3 is the screen that asks for a payment mode before any amount exists (critique C3). It's a likely drop point. Capturing which step the customer abandoned at gives us that data for free.

---

## 3. Can we detect mid-flow abandonment without an app release?

The lead has to come from data the app **already sends** to the backend.

| Signal | Evidence | Status |
|---|---|---|
| Rx image is stored server-side at upload, before checkout | "Successfully uploaded" toast; uploads reappear under **Past Prescription** grouped by patient (TM #4, #5) | `[INFERRED]` likely yes |
| An incomplete order row is created during the flow (e.g. at Proceed to checkout / Order Summary) | Order Summary shows patient/address/coupon state; status `49 INCOMPLETE` exists for carts | `[OPEN]` engineering check |
| The step reached (M1/M2/M3) is recorded | Unknown; may only be in app analytics (Mixpanel) | `[OPEN]` |

**Important `[INFERRED]`:** if Rx-only incomplete orders already land in the cart-abandon table, they are **silently filtered out** today by ACOM's value gate (`order_value > 900`). An Rx-only cart has value 0. So the leads may already exist in data and simply never reach an agent.

→ **Engineering check (MQ1):** what does the backend store when a customer uploads an Rx but doesn't place the order? (prescription record only / incomplete order type 52 / nothing)

**Detection options:**

| Option | How | Effort | Lean |
|---|---|---|---|
| D1 | Reuse the incomplete-order row (if it exists) + a **Type 1 lead rule** that ignores the value gate | S | ★ if MQ1 = incomplete order exists |
| D2 | Scheduled job: **Rx uploaded, no request/order within X min** (config) → create lead | S–M | ★ if only a prescription record exists |
| D3 | Use app analytics events (step reached) | M, data pipeline | Later, for M1/M2/M3 step detail |

---

## 4. What happens to a Rx-only lead in ACOM

ACOM agents (and the Ring bot) **can't build a cart from an Rx**: a pharmacist must verify and digitise `[DOC]` (bot guardrail).

| Option | ACOM agent does | Then | Effort | Lean |
|---|---|---|---|---|
| **H1: Qualify & raise the request** | Calls: "You uploaded a prescription. Shall we get your medicines?" → yes → **raises the request on the customer's behalf** (confirm patient + address) | Request enters `RX VERIFICATION PENDING` **with priority** (Rank-Up) → pharmacist builds the cart → Arm A/B as normal | S–M | ★ |
| H2: Nudge first, call second | Backend sends WhatsApp/push: "Need help with your prescription order? Tap / reply HELP" before the ACOM call | Customer self-completes, or the lead goes to the call queue after X min | S | ★ add-on to H1 |
| H3: Send straight to the pharmacist queue | Skip ACOM; treat as a request directly | Pharmacist calls | S | Conflicts with "flow to ACOM"; also floods the Type 1 queue with low-intent uploads |
| H4: Pharmacist-skilled ACOM agents build the cart | ACOM agent digitises via the portal's Create Order flow | Order created on the call | L (skills/ops) | Fits Portal Unification later |

**Recommendation:** **H2 → H1.** Nudge first (cheap, backend only), then ACOM calls and hands back a qualified, prioritised request to the pharmacist. Cart leads (T1-A, T1-B) go to ACOM as normal cart leads (07 §10).

---

## 5. Lead rules for Type 1 in ACOM (all configurable, D21 style)

| Rule | Rx-only leads (M1–M3, V) | Cart leads (A, B) |
|---|---|---|
| Trigger | No progress for `X` min after the last step (suggest 30 min, as cart-abandon) | Abandon rule in 07 §11 |
| Value gate | **None** (no value). Priority instead: repeat/chronic customer, past AOV, FTC, Rx recency, number of Rx uploads | Type 1-specific threshold `[OPEN]` (06 Q6) |
| Tag shown to agent | "Type 1: Rx uploaded, not submitted (step M1/M2/M3)" | "Type 1: pharmacist-built cart" |
| Agent sees | Rx image(s), patient/address if captured, past orders | + cart, pharmacist notes |
| Close automatically when | Customer submits the request / places an order | Customer places the order |
| Dedupe | One open Type 1 lead per customer; newest Rx wins; skip if the customer has an open request/order | Same; and vs a normal cart-abandon lead (06 Q9) |
| DNC / frequency cap | Respect DNC (sales lead, 06 Q8); per-customer cap | Same |
| Hours | Created any time; called within ACOM hours; after-hours uploads called next morning | Same |

---

## 6. Metrics

| Metric | Why |
|---|---|
| Mid-flow drop rate by step (M1 / M2 / M3) | Where Type 1 customers leave; payment-mode screen hypothesis |
| Lead → request raised → order created → delivered | ACOM contribution to Type 1 |
| Nudge (H2) self-recovery rate | How much recovers without a call |
| Time from abandon to first contact | Intent decays fast |

**Sizing link `[INFERRED]`:** the sheet's Assisted Commerce lever, *"55K stagnant opportunities/month → +10K OP/month"*, may be exactly these Type 1 abandons (M1–M3 + V). → BQ4.

---

## 7. Callout: Arm B (cart-creation-only) impact on conversion (incentive calc out of scope)

> In Arm B the **customer**, not the pharmacist, creates the order. So:
> - Today's agent conversion numbers (orders created per pharmacist) **drop for Arm B pharmacists by design**, even if the arm performs better.
> - If an Arm B cart is abandoned and an **ACOM agent** recovers it, **two agents touched one order**.
> - **Experiment results must be read per arm** (request → delivered), not per agent, or Arm B will look worse than it is.
> - Pharmacists aware of the arm may route customers back to the call, which would contaminate the test.
>
> How credit and incentives are calculated is **out of scope** for now `[CONFIRMED]` and flagged for the incentive owners. (Earlier options in `07` §9.2 are parked.)

---

## 8. Decisions needed from Swapnil

| # | Decision | Recommendation |
|---|---|---|
| MQ1 | *(Engineering check)* What does the backend store when an Rx is uploaded but not submitted? | Verify first; decides D1 vs D2 |
| MQ2 | Rx-only lead handling: H2 nudge → H1 ACOM qualifies & raises the request with priority? | Yes |
| MQ3 | Trigger: X minutes of inactivity (suggest 30) | Configurable, default 30 |
| MQ4 | Priority signal for Rx-only leads (no value) | Repeat/chronic, past AOV, FTC, recency |
| MQ5 | Track the abandon step (M1/M2/M3)? Needs app events, may come later | Yes if available, else phase 2 |
| MQ6 | Is the "55K stagnant opportunities" in the sizing sheet this population? | Confirm |

---

## 9. Swapnil's picks (2026-10-12, round 2) `[CONFIRMED]`

| Item | Decision |
|---|---|
| **M1** | "Proceed to checkout" is the current behaviour. **App scope (future):** change it to a 1mg-style **"Raise medicine request"**. Logged as an app requirement (parked under R3). In the current flow, M1 drop-off = abandoned → ACOM lead. |
| **M2** | **In scope** → ACOM lead. |
| **M3** | The payment-mode step **should not exist** in the future flow (app requirement, parked). In the **current** flow, drop-off here = **abandoned** → ACOM lead. |
| **V** (submitted, never verified) | **Not an ACOM lead. Part of Type 1 itself.** Brainstorm the problem and solution (§11). |
| **A, B** | **ACOM leads.** |
| **Nudge vs call** | ACOM **calls irrespective** of the nudge. The **nudge is in scope** too, but customer comms are a **separate scope/track**. |
| **Rx-only leads: who builds the order** | **Open point.** Swapnil's call: **keep it with ACOM**; the ACOM agent talks to the customer and **creates the order over the call**. Implications in §10.3. |
| **Priority** | **ACOM prioritisation logic as-is.** Only the **cart-value filter** must be handled, since Rx-only leads have no value. A Type 1-specific priority is **TBD** (brainstorm later). |
| MQ1 | Frame as a **requirement**; engineering decides how (§10). |
| MQ2 | Call irrespective of nudge; nudge in scope (comms track). |
| MQ3 | **30 min** inactivity, configurable. ✅ |
| MQ4 | Current ACOM logic minus the value filter for now; Type 1 priority TBD. |
| MQ5 | **To confirm** (abandon-step tracking). |
| MQ6 | **Yes:** the sheet's "55K stagnant opportunities/month" = these Type 1 abandons. |

---

## 10. Requirements for engineering (what, not how)

### 10.1 Lead creation (mid-flow M1–M3 + A, B)
| # | Requirement |
|---|---|
| REQ-L1 | When a customer **uploads a prescription** in the Type 1 flow and **does not raise the request / place the order** within **X minutes** (config, default 30), the system creates an **ACOM lead tagged "Type 1"**. |
| REQ-L2 | The lead records **where the customer stopped**: M1 (after upload), M2 (summary/address), M3 (payment step). If the step can't be known without an app change, record "Rx uploaded, not submitted" and flag MQ5. |
| REQ-L3 | The lead carries the **Rx image(s)**, and **patient and address if captured**, plus the customer's history (as ACOM leads do today). |
| REQ-L4 | **A** (cart built, call failed/declined per the configurable abandon rule, 07 §11) and **B** (Arm B cart not checked out in the window) also create ACOM leads tagged "Type 1", with the cart. |
| REQ-L5 | The lead **closes automatically** if the customer raises the request or places an order before the call. |
| REQ-L6 | **One open Type 1 lead per customer**; a newer upload replaces the older lead. Conflict with an open normal cart-abandon lead: `[OPEN]` (06 Q9). |
| REQ-L7 | Lead creation works with **no app release** (uses data the app already sends). Engineering to confirm what's stored at upload today. |

### 10.2 ACOM queue
| # | Requirement |
|---|---|
| REQ-Q1 | Type 1 leads enter the **existing ACOM queue** with the **existing prioritisation logic**. |
| REQ-Q2 | The **cart-value filter must not exclude** Type 1 Rx-only leads (they have no value). |
| REQ-Q3 | Rx-only leads must still get a **usable rank**. Note: if today's ranking score uses order value, an Rx-only lead would score zero and sink to the bottom. Engineering to propose a neutral default until the Type 1 priority is designed. `[OPEN]` |
| REQ-Q4 | The ACOM agent sees the **Type 1 tag**, the drop-off step and the **Rx image**. |
| REQ-Q5 | DNC and frequency caps apply as for other ACOM leads (06 Q8). |
| REQ-Q6 | ACOM **calls regardless of the nudge**. The nudge is sent per the comms track. |

### 10.3 Open point: ACOM agent creates the order from an Rx (Swapnil's lean: yes)
For an **Rx-only** lead, the ACOM agent would read the Rx, search and add medicines, and **create the order over the call**.

| Implication | Note |
|---|---|
| Tooling | ACOM agents need Rx viewing + medicine search + order creation. The pharmacist portal's **Create Order** flow already has Rx upload + medicine search (`03` §3). Reuse it, or add it to the ACOM portal. |
| Rx validation | Who confirms the Rx is valid? Likely the existing **post-order doctor/pharmacist verification** catches it (the order would be "Rx + medicines"). Confirm the order type and routing. `[OPEN]` |
| Skill / accuracy | Non-pharmacist agents reading handwritten Rx → wrong-medicine risk. Guardrail: restrict to clear Rx, or flag for pharmacist review. `[OPEN]` |
| Search quality | Hits the same search problems as the portal (W2b: names only, unavailable = dead end). |
| AI bot | The Ring bot still can't do this (bot guardrail); human ACOM agents only. |
| Future | Fits Portal Unification (agents by skill; Type 1 lead routed to Rx-capable agents). |

### 10.4 App requirements (logged, parked under R3)
- APP-1: Replace "Proceed to checkout" with a request-style CTA. **Wording not "Raise medicine request"**; options in `09` §3.
- APP-2: Remove the **payment-mode step** from the Type 1 flow.

---

## 11. V: request submitted but never verified (Type 1, not ACOM)

### 11.1 Problem
A request sits in `RX VERIFICATION PENDING` and no pharmacist verifies it. The customer has done everything right and still waits indefinitely.

**Likely causes (Type 1 only)** `[INFERRED]`:
- Arrived **after hours** (19:00–09:00) and is buried by fresh uploads under **LIFO** in the morning (`05` §3).
- **Queue volume > pharmacist capacity** at peak hours.
- **Claimed but not worked**: no time limit once a pharmacist opens it (`05` A3).
- **No visibility**: no age column or alert (`05` A2, A6).

This is the same root problem as **W1b allocation**, seen from the request side.

### 11.2 Solution options (backend + portal, Type 1 only)

| # | Option | How | Effort | Impact |
|---|---|---|---|---|
| V1 | **Verification SLA clock** on `RX VERIFICATION PENDING` | Configurable SLA (e.g. 2 working hours), counted only in 09:00–19:00. Timestamp from E1. | S | Enables V2–V5 |
| V2 | **Ageing beats LIFO** | Once a request passes the SLA, it moves above fresh LIFO uploads (oldest breach first) | S–M | High |
| V3 | **Morning backlog rule** | At 09:00, overnight requests are served first (oldest first) until cleared, then normal LIFO | S | High |
| V4 | **Claim time limit** | A claimed-but-unverified request returns to the queue after N minutes (config) | S | Med |
| V5 | **Breach alert + bulk assign** | Super-pharmacist sees SLA breaches (count, oldest) and can bulk-assign; alert when breaches > threshold | S–M | Med |
| V6 | **Age column + sort** | Wait time on the Type 1 list (E6 / A2) | S | Med |
| V7 | **Customer reassurance** | "Still reviewing your prescription" message if the SLA is breached (comms track) | S | Med |

**Lean:** V1 + V3 + V2 + V6 first. This fixes the after-hours case directly and makes the problem visible. V4/V5 next. V7 goes to the comms track.

> These overlap W1b scope A1–A6. Suggest treating V as **the first slice of W1b allocation**, so it's solved once.

### 11.3 Decisions needed
| # | Decision | Lean |
|---|---|---|
| VQ1 | Treat V as the first slice of W1b allocation? | Yes |
| VQ2 | V1 SLA value (working hours) | 2 h, configurable |
| VQ3 | Pick from V1–V7 | V1 + V3 + V2 + V6 |
| VQ4 | After the SLA, does the request ever leave the Type 1 queue (e.g. to ACOM)? | No, per Swapnil: stays in Type 1 |
