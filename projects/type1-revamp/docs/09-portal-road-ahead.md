# Portal Road Ahead: Current Portal Now, Unification Later

Date: 2026-10-12 · Status: **Draft — awaiting Swapnil's review**

## 1. Approach `[CONFIRMED]`
- **No complete portal revamp now.** Portals will be **unified later** (Portal Unification).
- Until then, **use the current pharmacist portal** and make **small, targeted changes** to support this project.
- Anything structural (shared components, new lead model, push allocation, real-time assignment) waits for Unification.

**Rule of thumb for "Now":** a change goes in only if it's a **new status / field / button / column / config** on an existing screen, or a backend rule. No new screens unless unavoidable; no rewrites.

---

## 2. Road ahead

### Now: current portal + backend (this project)

| Area | Change | Ref |
|---|---|---|
| Request state | New status `RX VERIFICATION PENDING` in the Type 1 list, routing, lock and dashboard; sub-state timestamps | 07 E1, P16 |
| Upload tag | Reuse the existing **"Is it RX Image? Yes/No"** control on Verify Rx as the Prescription / Not-a-prescription tag; no validity gate (D36) | 03 §2, `[CODE]` |
| Order creation | **"Create order"** button after the customer agrees (OP counted here) | 07 E7 |
| Call outcome | **Mandatory call outcome** (agreed / declined / call later at T / not connected) → Hold / Schedule / Abandon | 07 E8 |
| Abandon rule | Backend config: attempts + time, per arm | 07 §11 |
| Arm B | **"Send to customer"** button (cart to app), if the app can check out a portal-built cart (06 Q2) | 07 §9 |
| Never-verified (V) | Wait-time **column + sort by age**; SLA clock; ageing above LIFO; morning backlog rule | 08 §11 |
| ACOM leads | Type 1 tag, drop-off step and Rx image visible on ACOM leads; value filter handled | 08 §10 |
| Bug fixes | Patient Call crash on slow load (P19); search warehouse check (P5) — **verify on live first** | 03 §4 |
| OOS data | Log searches / zero results / "Medicine unavailable" picks (backend events) | 03 P7 |
| Coupons | Make the existing coupon modal easier to reach; show savings per coupon (small UI change) | 03 P9–P10 |

### Later: Portal Unification (not in this project)

| Area | What waits |
|---|---|
| Lead model | Upload = **lead tagged Type 1** in a unified lead system (07 §8.2) |
| Allocation | Push-based / real-time pharmacist assignment; configurable lead routing (LMS) |
| Shared components | One search, coupon, cart and bill component across portals (fixes P20 duplication properly) |
| Agents by skill | Rx-capable agents across ACOM / Type 1 / HA |
| Customer real-time | 1mg-style in-app waiting with live status (also needs the app) |
| Search revamp | Full search redesign (price, pack, stock, substitutes in results) if too big for "Now" |

### App (parked, needs a release)
- APP-1: Replace "Proceed to checkout" with a request-style CTA. **CTA wording to be chosen** (§3).
- APP-2: Remove the payment-mode step from Type 1.

---

## 3. APP-1 CTA wording (to choose) `[OPEN]`

"Raise medicine request" is **not** the final wording. Options:

| Option | Tone |
|---|---|
| **Send to pharmacist** | Says exactly what happens next |
| **Get my medicines** | Outcome-focused, simple |
| **Submit prescription** | Plain, factual |
| **Let our pharmacist help** | Reassuring, assisted |
| **Request medicines** | Close to 1mg, but shorter |

Lean: **"Send to pharmacist"**: honest (no "order" promised) and sets up the call.

---

## 4. Note on the duplicated portal code (P20)
The current portal repeats search/coupon/bill logic across 3–4 screens. Under "Now", small fixes must be **applied in each copy** (Type 1 Patient Call, Create Order, and the newer Patient Call). That's accepted as the cost of not revamping; the proper fix is a shared component in Unification.
