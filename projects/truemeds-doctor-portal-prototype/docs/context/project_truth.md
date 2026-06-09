# project_truth.md — Truemeds Doctor Portal Prototype

**Status:** LOCKED v1.0
**Last Updated:** 2026-06-09
**Change authority:** User only. Claude must not modify this file without explicit instruction.

---

## 1. What this product is

The Truemeds Doctor Portal is a mobile-web tool used by Truemeds doctors to conduct patient consultations.

Doctors primarily use this portal on mobile.

This prototype covers the **doctor consultation workflow** only.
It does not cover admin, pharmacy operations, order management, customer-facing flows, or ecommerce sections.

---

## 2. Who uses this

**Primary user:** A Truemeds doctor conducting a consultation.

The doctor's context:
- Works from a phone, not a desktop
- Each doctor logs in on their own personal device — this is NOT a shared-device or clinic setup
- There is no carry-forward from IRIS, BA app, or any shared-device model
- Reviews one case at a time
- Needs to call the patient, validate medicines, and take a post-call action
- Must complete a valid connected call before final action CTAs appear
- Is responsible for capturing symptoms/notes when relevant

---

## 3. The locked consultation workflow

This is the core journey. Claude must not reorder, skip, or add steps without explicit approval.

**Step 1 — Review patient and order context**
Doctor sees the patient name, order ID, order type (Cat4 or Pilot), and any relevant flags.

**Step 2 — Review prescription (if available)**
If a prescription is attached to the order, the doctor can view it.

**Step 3 — Review medicines added for clinical validation**
Doctor sees the medicines in the order and their validation status.

**Step 4 — Assign and call the customer**
Doctor is assigned the case (or self-assigns). Doctor initiates a call to the patient.

**Step 5 — Complete a valid connected call**
A valid call means the call was connected and live for at least 50 seconds.

**Step 6 — Capture symptoms/notes (if needed)**
After a successful call, the doctor may capture notes or symptoms.

**Step 7 — Take the correct post-call action**
The correct final CTA depends on the case type and HA status (see Section 5).

---

## 4. The valid-call gate

**[LOCKED]**

Final operational CTAs must NOT appear before a valid call is completed.

Before the valid-call gate:
- Show: assignment status, call button, no-pickup/hold actions, medicine review, notes input
- Do NOT show: Confirm Order, Confirm & Transfer, Confirm & Forward, Skip HA Call

After a valid call (connected + ≥50 seconds live):
- Show the correct final CTA based on case type
- Show Skip HA Call only if applicable (see Section 5)

The 50-second threshold is locked.
Exact timer behavior (pause on hold, resume on reconnect) is `[OPEN DECISION]`.

---

## 5. Post-call CTA routing — locked decision matrix

**[LOCKED]**

| Case Type | HA Status | Correct Final CTA |
|---|---|---|
| Cat4 | N/A | Confirm Order |
| Pilot | HA already skipped (by customer or system) | Confirm Order |
| Pilot | Value Meds + HA required | Confirm & Transfer |
| Pilot | Non-Value Meds + HA required | Confirm & Forward |

Additional rules:
- **Skip HA Call** button is available only after valid-call gate, and only for Pilot orders where HA is required and not yet skipped.
- Once Skip HA Call is used, the case becomes "HA skipped" → CTA becomes Confirm Order.
- Pilot HA-skipped cases must NOT show Transfer or Forward.
- Pilot HA-skipped cases must NOT show the HA transfer attention banner.
- Cat4 cases must never show Transfer, Forward, Skip HA Call, or any HA-related UI.

---

## 6. Pre-valid-call actions — what is always available before the gate

These actions are available before the valid-call gate:

- View patient/order context
- View prescription (if attached)
- View medicines list
- Self-assign or view assignment status
- Initiate call to customer
- No-pickup action (mark as no pickup attempt)
- Hold action (put case on hold — `[OPEN DECISION]` for hold duration and re-queue logic)
- Capture notes/symptoms (whether notes are saved pre-call or only post-call is `[OPEN DECISION]`)

---

## 7. Prototype scenarios — V1 scope

The prototype must support these five named mock scenarios, selectable by the developer:

| Scenario ID | Description | Expected Final CTA |
|---|---|---|
| `cat4` | Cat4 order, no HA involved | Confirm Order |
| `pilot_value_meds_ha` | Pilot order, value meds, HA required | Confirm & Transfer |
| `pilot_nonvalue_meds_ha` | Pilot order, non-value meds, HA required | Confirm & Forward |
| `pilot_ha_skipped_customer` | Pilot order, HA skipped by customer | Confirm Order |
| `pilot_ha_skipped_system` | Pilot order, HA skipped by system validation | Confirm Order |

Each scenario must show a deterministic, believable mock state for the full screen.

---

## 8. What this prototype is NOT

- Not a full portal rebuild
- Not an admin panel
- Not an order management tool
- Not a pharmacy operations tool
- Not a customer-facing flow
- Not a backend system
- Not a multi-page app for V1

---

## 9. What must never be silently invented

Claude must not guess, fake, or silently hardcode final behavior for:

- **Case type classification** — what makes an order Cat4 vs Pilot
- **Value Meds vs Non-Value Meds** — how this is determined
- **HA requirement logic** — what field or system sets HA required
- **HA skip eligibility** — what conditions allow a Skip HA Call
- **Transfer vs Forward distinction** — operational meaning downstream
- **Medicine add/remove authority** — whether doctor can modify the medicines list
- **Doctor assignment source** — queue system, manual, or rotational
- **Notes visibility and locking rules** — who can see notes, when are they locked

If any of these surface during build, mark `[OPEN DECISION]` and add to `open_questions.md`.
