> **Superseded 2026-10-16:** Apurva approved a full rewrite instead (project_truth v2.0, D-57). Kept for history only.

# project_truth.md — proposed updates for Apurva (review copy)

`docs/context/project_truth.md` is LOCKED and changes only with Apurva's approval. It was last updated 2026-06-09. Below: every place that no longer matches the decisions (D-31–D-56), with the exact proposed wording. **Accept or reject each one;** nothing is applied until you say so. ~~Struck~~ = remove · **bold** = add.

---

**1. Header**
- Status: LOCKED v1.0 → **LOCKED v1.1**
- Last Updated: 2026-06-09 → **2026-10-16 (labels, calling, scope — see D-31–D-56)**

**2. §1 What this product is** — scope grew beyond the consultation screen.
> This prototype covers the doctor consultation workflow ~~only~~ **and the doctor's day around it: sign-in (mobile + OTP, faster sign-in), Home (availability, request a case) and the case itself.**
> It does not cover admin, pharmacy operations, order management, customer-facing flows, or ecommerce sections.

**3. §2 Who uses this**
> - Reviews one case at a time
> - **Requests the next case when ready; cases are never pushed (pull model, D-31, D-36)**

**4. §3 Step 4 — Assign and call the customer** — click-to-call reality (D-48, D-56).
> Doctor is assigned the case ~~(or self-assigns)~~ **by requesting it**. Doctor initiates a call to the patient **from the app; in the first release the call is placed through Knowlarity click-to-call — the doctor's own phone rings first, and the doctor ends the call on the phone.**

**5. §3 note on leaving a case** — keep as is (already updated 2026-10-14). Add:
> **Before confirming, every medicine must be Prescribed or Disabled; Confirm is blocked while any is Pending (D-56).**

**6. §4 The valid-call gate**
> Before the valid-call gate:
> - Show: assignment status, call button, ~~no-pickup/hold actions~~ **callback, and after a failed call: Retry call / Mark as unavailable**, medicine review, notes input
> - Do NOT show: Confirm prescription, Confirm & transfer, Confirm & forward, Skip HA ~~call~~

(The 50-second threshold stays locked. Timer pause on hold stays `[OPEN DECISION]`.)

**7. §5 Routing** — labels already updated; one wording fix:
> - **Skip HA** ~~call~~ button is available only after valid-call gate … (button label is "⏭ Skip HA" since D-54; the sheet title stays "Skip HA call")
> - Once Skip HA ~~call~~ is used, the case becomes "HA skipped" → CTA becomes Confirm prescription.
> - Pilot HA-skipped cases must NOT show the HA transfer attention banner. → **~~…~~ The HA transfer banner was dropped for all cases (D-52).**

**8. §6 Pre-valid-call actions**
> - ~~Self-assign or view assignment status~~ **View assignment status**
> - ~~No-pickup action (mark as no pickup attempt)~~ **After a failed call (no pickup, didn't connect): Retry call or Mark as unavailable (closes the case as Patient unavailable)**
> - ~~Hold action (put case on hold — `[OPEN DECISION]` for hold duration and re-queue logic)~~ **Callback (schedule a callback; closes the case for this doctor; the case goes to the callback pool)**
> - **Release the case (Back) — only before the first attempted call (D-48)**

**9. §7 Prototype scenarios** — labels in the "Expected Final CTA" column:

| Scenario ID | Expected Final CTA |
|---|---|
| `cat4` | ~~Confirm Order~~ **Confirm prescription** |
| `pilot_value_meds_ha` | ~~Confirm & Transfer~~ **Confirm & transfer** |
| `pilot_nonvalue_meds_ha` | ~~Confirm & Forward~~ **Confirm & forward** |
| `pilot_ha_skipped_customer` | ~~Confirm Order~~ **Confirm prescription** |
| `pilot_ha_skipped_system` | ~~Confirm Order~~ **Confirm prescription** |

**10. §8 What this prototype is NOT**
> - ~~Not a full portal rebuild~~ **Not the production app (the native Android/iOS apps are built by the app team)**
> - ~~Not a multi-page app for V1~~ **(removed — the prototype now has sign-in, Home, case, Prescribe and Rx viewer screens)**

**11. §9 What must never be silently invented** — add:
> - **Calling vendor behaviour** — which call results the provider reports (e.g. doctor didn't answer, switched off) and whether the app can end a call (OQ-027)
