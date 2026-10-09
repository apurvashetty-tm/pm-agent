# Type 1 (Rx-only) Order Flow — Step 1: Evaluation

Date: 2026-10-05 · Owner: Swapnil Singh · Status: **Step 1 of 4 (Evaluation) — done**

Process: **Evaluation → Critique → Brainstorm → Finalise flow**. Each step needs explicit sign-off before the next one starts.

Sources:
- `reference/truemeds/`: 24 screenshots, order #56501609, 12:51 → 1:00 PM
- `reference/1mg/`: 35 Tata 1mg screenshots (6:21 → 6:44 PM)
- `reference/excluded-platinumrx/`: 9 PlatinumRx screens that were in the 1mg folder. **Excluded from scope** on user instruction (compare TM vs 1mg only).
- Domain context: `knowledge/context/tm-chotu` (Order Type definitions, status codes)

> Note: WhatsApp exported the screenshots in reverse order. The flows below are rebuilt from the status-bar timestamps.

---

## 0. What a Type 1 order is (system view)

| | |
|---|---|
| Definition | `ORDER_TYPE = 52 (RX)`. The customer uploads only a prescription and adds no medicines. |
| Backend path | ORDER PLACED (`orderstatus 1 NEW`) → **Pharmacist Type 1 queue** → validate Rx → digitise (`39 DIGITIZED`) → doctor call, or auto-confirm (`workflow_status 242`) → `66 ORDER CONFIRMED` → warehouse → packed → payment link → dispatch |
| Key implication | In the backend, an **order exists before anyone knows what is in it**. The customer-facing UX shows the same thing. |

---

## 1. Truemeds: current flow as observed

| # | Time | Screen | What the customer sees / does |
|---|---|---|---|
| 1 | 12:51 | Home | Card: "Add a prescription **to place your order**" → Upload. Also shows a call-to-order number. |
| 2 | 12:51 | Upload Prescription | "Upload your prescription to start ordering". Next Steps: **Pharmacist call (Free)** |
| 3 | 12:51 | Upload source sheet | Camera / Gallery / Past Prescription, plus validity rules (doctor, patient, date, medicine; JPG/PNG/PDF/HEIC; under 5 MB) |
| 4 | 12:52 | Past Prescription | Grouped by patient. Shows an upload date. |
| 5 | 12:53 | Upload Prescription (filled) | Thumbnail + "Successfully uploaded" → **Proceed to checkout** |
| 6 | 12:53 | Order Summary (no address) | "Delivery by (select address)", "Benefit after the order is placed: Pharmacist call", Rx, **Add medicines**, Apply coupon, Add address → **Select payment mode** |
| 7 | 12:53 | Patient & address | Select patient + address → Save & continue |
| 8 | 12:54 | Order Summary | Now shows "Delivery by **Tomorrow 10 PM**" |
| 9 | 12:54 | Coupons | FEST25 (Flat 23% + 2% CB, min ₹799): "**Will apply after prescription is verified**" + Got-it modal |
| 10 | 12:54 | Payment Option | "Total amount will be calculated post processing". The customer still has to pick UPI / Wallet / Card / Netbanking / Pay later / Amazon Pay / COD → **Place order**. FAQ: "Will I have to pay now…?" |
| 11 | 12:55 | Interstitial | "Protected by PRICELOCK guarantee" |
| 12 | 12:55 | Success | **"Order placed — Pay once your order is packed"**. Next steps animation: Consultation call → Order packed → Make payment |
| 13 | 12:55 | Push notification | "Prescription Verification: 56501609. Your prescription is being verified by our pharmacist… confirmation call shortly" |
| 14 | 12:55 | Order #56501609 | "We have received your order!" + **"How was your Truemeds experience?" rating prompt** |
| 15 | 12:56 | Order details | Delivery by Tomorrow 10 PM; tracker: Order placed → Dispatch → Deliver; "Pharmacist call" card; Rx thumbnail; lab-test upsell |
| 16 | 12:56 | "When do I make payment?" | Pay once packed, payment link sent, pay only in app |
| 17 | 12:56 | Reminder sheet | "Set a reminder call for your **next** order" (every 15–90 days) |
| 18 | 12:56 | Detailed status | Order placed → Pharmacist call → Doctor consultation pending → Assigned to warehouse → Packed → Dispatched → Delivered |
| 19 | 1:00 | Incoming call | **Missed** Truemeds call. Truecaller labels it "Truemeds Meducine" (spam-style, 20+ community comments) |

**Taps to "Order placed":** about 9 screens or sheets. **Time to place:** about 4 min. **Medicines, price and payable amount known to the customer at placement:** none.

---

## 2. Tata 1mg: flow as observed

| # | Time | Screen | What the customer sees / does |
|---|---|---|---|
| 1 | 6:25 | Home | "Upload Prescription" pill in the header, plus a persistent "Your prescription is being processed" strip |
| 2 | 6:26 | Upload prescriptions | "Upload prescriptions **and let us arrange your medicines for you**", "What is a valid prescription?" link |
| 3 | 6:26 | Valid Rx guide | 4-card carousel: doctor details / patient details / medicine & dosage / signature & stamp |
| 4 | 6:26 | Source sheet | Take photo / Gallery / Your prescriptions (dated history, multi-select) |
| 5 | 6:27 | Remove confirm | "A valid prescription is needed to purchase Rx medicines…" |
| 6 | 6:27 | Upload (filled) | "Upload more prescriptions" → Continue |
| 7 | 6:28 | **How should we process your request?** | (a) Order everything from the Rx, or (b) Request a pharmacist call. ETA "**4 min**" (rises to **6 min** with the "Call me for above selections" toggle on). The pharmacist will **add medicines, apply best coupon, choose earliest delivery**. Address shown → **"Place medicine request"** (not "Place order") |
| 8 | 6:22/6:29 | Looking for pharmacist | "Assigned within 00:25" countdown |
| 9 | 6:29 | Scanning / Verifying | 4-segment progress bar; "Checking your past orders"; **named pharmacist** (Vineet / Mohini, certified since 2021/2023, 25,077 requests, languages) |
| 10 | 6:24 | Checking your medicines | Option to **Request a call**. Error state seen: "Request for call couldn't be sent, please retry". Success: "Pharmacist will call you on 90xxxx Edit" |
| 11 | 6:36 | **Your medicines are ready** | "Checkout from cart to place your order" (auto-continues) |
| 12 | 6:36 | Cart review | "Your medicines are ready to be ordered". Medicines added as per Rx (3, **Edit**). Earliest delivery chosen (rapid fee ₹49). Line items with prices. **Proceed to pay ₹274.94** |
| 13 | 6:37 | Payment | To be paid ₹283.94; COD +₹9 handling → **Place Order** |
| 14 | 6:38 | Order details | "On time: Arriving by 10 PM tomorrow". Placed → Validated → Shipped → Delivered. Per-item status: "Prescriptions are getting verified" vs "Ready to be shipped" |
| 15 | 6:44 | Order details | Validated. Track order. "Ask your questions" per medicine (dosage, side-effects, what to avoid). Cancel with reasons. |
| 16 | 6:41 | Incoming call | Truecaller shows "Tata Mg" tagged **Doctor** |

**What gets created before checkout:** a *medicine request*, not an order. **An order is placed only after** the customer has seen the medicines, the price and the delivery date. **Time from upload to cart:** about 8–10 min, with live progress throughout.

---

## 3. Side-by-side comparison

| Dimension | Truemeds | 1mg |
|---|---|---|
| Promise at entry | "Upload Rx **to place your order**" | "Let us **arrange your medicines**" |
| Rx validity guidance | Static bullet list in the upload sheet | 4-step visual carousel |
| Customer chooses intent | No | **Yes**: order everything, or call me |
| What is committed after upload | **An order** (#56501609) | A **medicine request** |
| Address/patient captured | Before order | Before request |
| Payment-mode selection | **Before** amount is known | After cart, with exact amount |
| Coupon | Customer picks; "will apply after verification" | Pharmacist applies best coupon |
| Delivery date shown | "Tomorrow 10 PM" before medicines are known | After cart (with rapid-fee choice) |
| Wait-state experience | Static "pharmacist call" card; no ETA | Named pharmacist, ETA (4–6 min), progress bar, retry on call failure |
| Human touch | Unnamed "pharmacist" | Named, credentialed pharmacist |
| Cart review before commit | **None** | Yes, editable |
| Substitution story (TM's core USP) | Not shown pre-order; happens on call | N/A |
| "Order placed" moment | Right after upload | After payment |
| Post-placement asks | Rating prompt, next-order reminder, lab upsell | Ask-a-question per medicine |
| Call experience | Missed call; Truecaller spam-style label | Caller ID tagged "Doctor" |
| Terminology | Pharmacist call / Consultation call / Doctor consultation (3 names) | Pharmacist (consistent) |

---

## 4. Gaps you flagged, validated against the evidence

| # | Your concern | Evidence | Validated? |
|---|---|---|---|
| G1 | TM places an order; 1mg only builds a cart | TM #10–12 vs 1mg #7, #11–13 | ✅ Yes. 1mg's CTA is literally "Place medicine request", and "Order" only appears at payment. |
| G2 | "Order placed" right after Rx upload is incorrect | TM #12 "Order placed" + #14 "We have received your order" + tracker step 1 "Order placed", while the push notification at the same minute says the Rx is still being verified | ✅ Yes. The customer has not seen a single medicine or price. |

## 5. Other observations (evaluation only; critique is in Step 2)

1. Payment mode is asked for with no amount shown (TM #10).
2. The coupon state is uncertain: "will apply after verification" (TM #9).
3. A delivery promise (Tomorrow 10 PM) is made before the contents are known (TM #8).
4. The rating prompt and the next-order reminder fire within one minute of placement, before any value has been delivered (TM #14, #17).
5. Three different names are used for the verification step (TM #2, #12, #18).
6. The pharmacist call was missed, and the caller ID carries a negative Truecaller label (TM #19). There is no in-app recovery: no "call me back", no retry, no ETA.
7. "Add medicines" on the summary screen silently turns a Type 1 order into Type 2 (TM #6). The customer doesn't understand this.
8. TM's substitution/savings USP is not visible anywhere in the Rx flow before commitment.
9. Strengths to keep in TM: past-prescription reuse by patient, pay-after-packing (low commitment, PriceLock), clear payment FAQ, patient selection.

## 6. Open questions

- ~~Q1. Which app is the pink-UI reference?~~ Resolved: PlatinumRx, excluded from scope.
- **Q2.** Do we have Type 1 funnel data, e.g. Rx upload → digitised → confirmed → delivered, or the % discarded/unreachable at the pharmacist queue? (Needs tm-chotu data access.)
- **Q3.** Is "pay after packing" a locked business constraint?
- **Q4.** Scope: app only, or also web/m-site?
