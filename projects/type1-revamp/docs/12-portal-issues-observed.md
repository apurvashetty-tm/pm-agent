# Pharmacist Portal: Issues Observed in the Mock Flow

Date: 2026-10-13 · Source: portal v4.8.8 run locally with sample data; screens in `reference/portal/screens/` (01–12) + code reading (`03`).
Maps to problems in `11-problem-statement.md` (C1–C5, D1).

**Not issues (sample-data artifacts):** bill totals of ₹0, a ₹NaN price row, a blank Rx image, and the "rosuvas" search returning unrelated medicines. These come from my test data, not the portal.

Severity: **High** slows or blocks conversion · **Med** friction or confusion · **Low** polish. `[VERIFY]` = check on the live portal.

---

## 1. Type 1 order list (screen 01)

| # | Issue | Sev | Problem |
|---|---|---|---|
| L1 | **No wait time.** Only a date column; you can't sort by age or see who has waited longest. Sort exists only on "Attempted Calls" and "Unreachable". | High | C1, B2 |
| L2 | **No "next order".** The pharmacist must scan the list and click a row; the super-pharmacist assigns in bulk by hand. | High | C1 |
| L3 | **Different stages mixed in one list** (new, pending verification, invalid order), told apart only by coloured text. No filter by status or by after-hours arrivals. | Med | C1 |
| L4 | Narrow status column wraps text ("PENDING VERIFICATIO N"). The table scrolls sideways at 1440 px, so "Unreachable" and "Assigned To" are cut off. | Low | — |
| L5 | Order type shown as a cryptic suffix on the ID ("7005201-1"). | Low | — |
| L6 | List doesn't auto-refresh. New requests appear only after a reload or an action. | Med | C1 |

## 2. Verify Rx (screens 02–03)

| # | Issue | Sev | Problem |
|---|---|---|---|
| V1 | **Prescription check is a gate.** "Is it RX Image? Yes/No" must be answered before going further, though the outcome doesn't matter (doctor call happens anyway). | High | C2 |
| V2 | **The call isn't available here.** The pharmacist must add a patient, a doctor and at least one medicine, then press "Digitize Medicine", before reaching the screen with "Call Patient". | High | C3 |
| V3 | **Extra mandatory steps before digitising:** "No patient found → Add Patient"; doctor search by registration number or "Add". Both could be captured on the call. | Med | C3 |
| V4 | **Task is below the fold.** Customer stats (ratings "Not Enough Data", subs history, TM credit, SMS, CSR tickets) fill the top; the Rx image and the work area start below. | Med | — |
| V5 | Medicines are added **one at a time** (search → qty → Additional Details → ADD). | Med | C3, C4 |
| V6 | Patient name shows as ", -" when missing (formatting). | Low | — |
| V7 | "Address Unavailable" label shows even when an address exists (also on Patient Call). | Low | `[VERIFY]` |

## 3. Patient Call (screens 04–07)

| # | Issue | Sev | Problem |
|---|---|---|---|
| P1 | **Very long page; the medicine table is two scrolls down.** Order: customer stats → payment/address → patient → doctor (again) → medicines → bill → notes. | High | — |
| P2 | **Sticky action bar covers content.** It hides "+ Add Medicines", "View Previous Orders" and the bill heading (05, 06). | Med | — |
| P3 | **Unclear and risky actions.** "Submit For Substitution" is what confirms the order but doesn't say so. "Discard Order" sits next to it, the same size. | Med | A4, C3 |
| P4 | **"Unreachable" is disabled until a call is made through the portal's IVR.** It can't be marked if the pharmacist called another way. | Med | C3 |
| P5 | **No call outcome options** beyond Unreachable (no "call later at T", "declined", "agreed"). | High | A4, B1 |
| P6 | **Medicine table has only "Disable".** No remove, no replace-with-substitute, no stock status, no substitute column. | High | C4 |
| P7 | **Rx image is small (250×250) next to the table.** Hard to read handwriting while building the cart. | Med | — |
| P8 | **Coupon is a small link under the table**; the bill/total is further down, so the pharmacist can't see the total while editing. | Med | C5 |
| P9 | **Patient field shows an ID ("8801011") instead of a name.** Age/Gender are locked until "Enable Changes" is clicked. | Med | `[VERIFY]` |
| P10 | **Shipping address dropdown shows blank** while the address text is printed under it. | Low | `[VERIFY]` |
| P11 | **Doctor search repeated** here after Verify Rx. | Low | C3 |
| P12 | Info banner grammar and vagueness: "ETA and prices **has** been updated basis the product availability…". | Low | — |
| P13 | **Page crashed to blank** on load in my run (gender list built before it arrives; P19 in `03`). | High | `[VERIFY]` |

## 4. Add Medicines + search (screens 08–09)

| # | Issue | Sev | Problem |
|---|---|---|---|
| S1 | **Search results show only the name.** No pack size, manufacturer, price, Rx/OTC or stock status. | High | C4 |
| S2 | **Out-of-stock medicines can't be found or chosen.** Picking an unavailable one gives "Medicine unavailable" and stops; **no substitute offered**. | High | C4 |
| S3 | **Nothing is recorded** for searches, zero results or unavailable picks. | High | D1 |
| S4 | **Dosage fields to add one medicine:** duration, frequency, chronology, quantity, morning/afternoon/evening/night. Heavy during a live call. | Med | C3 |
| S5 | Two-step confirm: "ADD" then "OK". | Low | — |

## 5. Coupons (screen 10)

| # | Issue | Sev | Problem |
|---|---|---|---|
| CP1 | **Hard to find:** opened from a small "Apply Coupon" link. | Med | C5 |
| CP2 | **No savings amount per coupon** and **no best-coupon suggestion**. The pharmacist tries codes one by one. | Med | C5 |
| CP3 | Good to reuse: cards already show title, terms, expiry and why a coupon doesn't apply ("Add Rs 412 more to apply"). | — | — |

## 6. Create Order (screens 11–12)

| # | Issue | Sev | Problem |
|---|---|---|---|
| CO1 | **Places the order directly.** No step for the customer to confirm the cart. | Med | A4 |
| CO2 | **"Select Organization" pop-up** with an empty, unlabelled dropdown after entering a number. An extra step with no explanation for a normal customer. | Low | — |
| CO3 | Same search limits as above (S1–S3). | High | C4, D1 |

## 7. Across the portal

| # | Issue | Sev |
|---|---|---|
| G1 | The same search/coupon/bill logic is copied in 3–4 screens; a fix must be made in each (`03` P20). | Med |
| G2 | Type 1 dashboard shows only four counts (Total, Assigned, Discarded, Unreachable): no funnel, wait time or conversion. | Med |
| G3 | Header clutter: warehouse chips and environment selector take space on every screen. | Low |

---

## Portal fix list (Swapnil's pick, 2026-10-13)
1. L1 wait-time column + sort by age
2. V1 prescription check → tag only
3. V2/V3 call before digitising
4. P5 call-result options with a **reason dropdown**
5. S2 out-of-stock medicines shown with a substitute
6. S1 pack, price and stock in search results
7. S3 record searches and unavailable picks
8. CP1/CP2 coupons easier to find, with savings shown

Not picked for now: P3 (rename "Submit For Substitution" / separate "Discard"), P13 (blank-page crash, verify on live).
Only item 4 was new to the problem statement → added as **C6** in `11`. The rest were already covered (C1–C5, D1).
