# open_questions.md — Truemeds Doctor Portal Prototype


> Answered questions and the reasoning behind each design decision are recorded in `decision_log.md` (same folder).

This file tracks all unresolved product decisions that Claude must not silently answer.

Every entry must include:
- **Question** — what is unclear
- **Why it matters** — what breaks if this is wrong
- **Safe placeholder used** — what temporary behavior the prototype uses
- **Status** — Open / Answered / Deferred

---

## Active Open Questions

---

### OQ-001 — Valid call timer behavior on edge cases

**Question:** If a call is connected, hits 45 seconds, drops, and reconnects — does that count toward the 50-second threshold? Does the timer reset or accumulate?

**Why it matters:** Determines whether the valid-call gate triggers after a partial call plus reconnect, or only after a single uninterrupted 50-second call.

**Safe placeholder:** Timer counts continuously from first connection. A drop followed by reconnect resets the timer. `[MOCK ASSUMPTION]`

**Status:** Open

---

### OQ-002 — No-pickup handling and hold duration

**Question:** How many no-pickup attempts before a case goes on hold? What is the hold duration? Does it auto-return to the queue?

**Why it matters:** Determines the doctor's available actions before a case escalates or re-queues.

**Safe placeholder:** No-pickup marks a single attempt. Hold is manual with no auto-return. `[MOCK ASSUMPTION]`

**Status:** Open

---

### OQ-003 — Doctor assignment source

**Question:** How does a case arrive in a doctor's queue? Is it automatic (rotational), manual (admin assigns), or self-service (doctor picks from a list)?

**Why it matters:** Determines whether the doctor screen has an assignment/claim action or simply shows cases assigned to them.

**Safe placeholder:** Cases are pre-assigned and arrive in the doctor's queue. No self-pick action in V1. `[MOCK ASSUMPTION]`

**Status:** Open

---

### OQ-004 — Medicine review authority

**Question:** Can a doctor add or remove medicines from the order, or only validate/flag what is already there?

**Why it matters:** Determines whether the medicines section is read-only + validation, or editable.

**Answer (Apurva, 2026-10-07):** The doctor cannot add medicines; Add medicine is removed from the prototype. The doctor can edit frequency, duration and advice, and can disable a medicine.

**Status:** Partially answered — add is answered (no). Whether disable = order cancellation, and where a disable writes, remain open. See also OQ-011.

---

### OQ-005 — Notes visibility and locking

**Question:** Are notes visible to other teams (e.g., pharmacy, HA)? Are notes locked after call completion so they cannot be edited?

**Why it matters:** Determines whether notes have a submit/lock action or remain freely editable.

**Safe placeholder:** Notes are visible only to the doctor for V1. No lock behavior shown. `[MOCK ASSUMPTION]`

**Status:** Open

---

### OQ-006 — Pre-call notes capture

**Question:** Can a doctor capture notes/symptoms before the valid call is completed, or only after?

**Why it matters:** Determines whether the notes input is shown before the valid-call gate or only after.

**Safe placeholder:** Notes input is shown before the valid-call gate for pre-call observations. `[MOCK ASSUMPTION]`

**Status:** Open

---

### OQ-007 — Transfer vs Forward — operational distinction

**Question:** What is the operational difference between Confirm & Transfer and Confirm & Forward? Which downstream team does each route to?

**Why it matters:** CTA label and meaning must be accurate. If these map to different systems/teams, the prototype should reflect the right labels even in mock form.

**Safe placeholder:** Both are shown as distinct final CTAs for the relevant Pilot scenarios. Internal routing logic is not implemented in V1. `[MOCK ASSUMPTION]`

**Status:** Open

---

### OQ-008 — HA skip eligibility condition

**Question:** What field or system condition determines that a Pilot order is eligible for Skip HA Call? Is it based on the patient's prior history, medicine type, time, or something else?

**Why it matters:** Skip HA Call must not appear unless the case qualifies. Showing it incorrectly changes the doctor's workflow.

**Safe placeholder:** Skip HA Call is shown for all Pilot + HA-required scenarios in the prototype, controlled by the mock scenario flag. `[MOCK ASSUMPTION]`

**Status:** Open

---

### OQ-009 — Value Meds vs Non-Value Meds classification

**Question:** How is a medicine classified as Value Meds or Non-Value Meds? Is it a product attribute, an order flag, or a system-level classification?

**Why it matters:** This drives Transfer vs Forward CTA routing. If classification logic changes, the CTA changes.

**Safe placeholder:** Controlled by scenario flag in mock data. Not derived from medicine attributes in V1. `[MOCK ASSUMPTION]`

**Status:** Open

---

### OQ-010 — Case type classification (Cat4 vs Pilot)

**Question:** What makes an order Cat4 vs Pilot? Is this an order field, a customer attribute, a medicine attribute, or a combination?

**Why it matters:** The entire post-call CTA logic branches on this. The prototype must not silently invent it.

**Safe placeholder:** Case type is a top-level field in mock scenario data. Not derived from any logic in V1. `[MOCK ASSUMPTION]`

**Status:** Open

---

---

### OQ-011 — Medicine qty editability and disable scope

**Question:** Can a doctor reduce/increase qty beyond what the customer ordered? Is there a min/max constraint? What downstream system does a qty change or disable action write to?

**Why it matters:** Doctor can now edit qty and disable medicines in the prototype. If there are business rules (e.g., doctor cannot increase qty beyond what was ordered, or disabling a medicine cancels it from the order), those rules are not yet defined.

**Answer on qty (Apurva, 2026-10-07):** The doctor never sees or edits quantity on the Prescribe screen. Two quantities exist: (1) the customer's cart quantity, shown read-only on the medicine row and unchanged by any doctor edit; (2) the prescription quantity, owned by the backend. The backend preselects frequency and duration for the maximum configured period (6 months; Ongoing preselected) and stores the quantity; if the doctor changes frequency or duration, the backend recalculates the quantity and prints it on the prescription, replacing the default.

**Status:** Qty part answered. Disable scope (does disabling cancel the item from the order; where it writes) still open.

---

### OQ-012 — Callback scheduling terminal behavior

**Question:** When a doctor schedules a callback (from the pre-gate escape hatch, the early-call-end recovery path, or the post-gate chip), the prototype treats this as terminal — it ends the doctor's session for that order, marks `consultationState = 'completed'`, and shows a success toast saying the order "moved to callback queue." Is this actually correct? Should the order really leave the doctor's queue, or should the doctor stay on the case? Does a "callback queue" exist as a real downstream concept?

**Why it matters:** If scheduling a callback should NOT remove the case from the doctor's queue, or if there's no real "callback queue" system to route to, the current terminal-completion behavior misrepresents what happens to the order after the doctor taps "Confirm Callback."

**Safe placeholder:** Scheduling a callback ends the session (`consultationState = 'completed'`), shows success toast "Callback Scheduled ... Order moved to callback queue," doctor proceeds via Next Order. `[MOCK ASSUMPTION]` — not confirmed backend truth.

**Status:** Open

---

### OQ-013 — Early call-end retry limit

**Question:** When a doctor ends a call before the 50-second valid-call gate, the prototype now shows "Call Again" with no cap on retries. Should there be a maximum number of early-end attempts before the case escalates or behaves differently (similar in spirit to the no-pickup attempt question in OQ-002)? Does an early hangup count toward the same attempt counter as a no-pickup?

**Why it matters:** Without a limit, a doctor could end and restart a call indefinitely in the real product. If there's a real operational cap, the prototype should reflect it rather than silently allowing infinite retries.

**Safe placeholder:** "Call Again" has no retry limit in the prototype. Each early end-call simply resets to the pre-call state with the recovery UI (Call Again + Schedule Callback ghost button) shown. `[MOCK ASSUMPTION]`

**Status:** Open

---

### OQ-016 — Re-check for orders automatically?
**Question:** On "No orders right now", should the app re-check every N seconds (and open an order when one appears), or only when the doctor taps Check again?
**Safe placeholder:** Only on tap. `[MOCK ASSUMPTION]`

### OQ-017 — Sign-in rules for production
**Question:** OTP expiry, wrong-try counting/reset window, OTP issue-cap window/reset, lock duration, signed-in session length, and Doctor Ops approval timing. OTP is 4 digits; faster sign-in is optional. D-35 sets a configurable OTP issue cap, initially 4 codes per mobile number (first send plus up to 3 resends); the server-enforced window and reset rule remain open. D-34 sets 5 server-confirmed wrong OTP submissions as the number-lock threshold; the attempted mobile number is locked, not the account. Resending or restarting sign-in does not reset the count. A different number needs Doctor Ops approval for that doctor before sign-in.
**Safe placeholder:** 5 min code life, resend 30 s → 1 min → 2 min, 15 min number lock after the decided 5 wrong tries; session 24 h; ops approval timing still unconfirmed. `[MOCK ASSUMPTION]`
**Confirmed 2026-10-12:** Signed-in session remains valid until the case is closed; no OTP prompt over a live case. Technical token renewal must not interrupt the doctor. Re-authentication after case closure remains open; the 24 h session value above is only a mock placeholder.

### OQ-018 — Patient consent when the doctor calls (legal)
**Question:** Telemedicine Practice Guidelines: a consultation the doctor starts needs explicit, recorded patient consent. Does the patient's order count as the patient starting it?
**Safe placeholder:** Not built. Needs Legal before the order page changes.

### OQ-023 — When to offer faster sign-in again after "Not now"
**Question:** After a doctor taps "Not now" on the faster sign-in offer (D-45), when is it offered again? Options: after the next N OTP sign-ins on the same device (e.g. 3); after N days; never (Profile only).
**Safe placeholder:** Never re-offer automatically; Profile always has the switch (D-45). Needs product + SMS-cost input.


### OQ-024 — Releasing a case (backend) [OPEN — Engineering]
D-48: Back before the first attempted call releases the case to the queue. Needs an unassign action that is only allowed while no call has been attempted, is safe to retry, and returns the case to the pool immediately. Who else is notified, and whether released cases go to the front of the queue, is Engineering/Ops to confirm.

### OQ-025 — Restoring an open case; doctor never returns [OPEN — Engineering]
D-48: reopening the app goes straight back into an open case. Needs the server to report the doctor's open case on launch. Also: if a case is assigned and the doctor never returns or calls (app killed, phone dead), when is it released automatically, and by whom?

### OQ-026 — "Order" in case-page data and locked CTAs [ANSWERED — Apurva, 2026-10-14, D-50]
Order ID line stays ("Order 12345 · ₹1,240" — shared reference between customer order and doctor case). CTAs renamed: Confirm prescription / Confirm & transfer / Confirm & forward / Skip HA call. **Open for Engineering:** how the four paths are tracked (separate events vs one event with a flow field) — required: each path distinguishable, never derived from the label.
## Answered Questions

*(None yet)*

---

## Deferred Questions


### OQ-019 — "Looking for a case" (Home)
**Question:** After one Next order tap with no case, may the app keep re-checking while the doctor stays on Home and open a case when one appears? How often, and is it fair across doctors? To discuss with Apurva, then backend.
**Safe placeholder:** "No cases right now" with a manual Try again. `[MOCK ASSUMPTION]`

### OQ-020 — Pooled callback hand-over
**Question:** When a callback returns to the pool (D-36), does the doctor who picks it up see the earlier doctor's notes and outcome on the case page?
**Safe placeholder:** Assume yes; the case page shows the earlier attempt. `[MOCK ASSUMPTION]`

### OQ-021 — Support contacts and links
**Answered 2026-10-12 (Apurva):** Sign up → `https://pwa-doctor.truemeds.in/onboarding`. Doctor Ops / support
WhatsApp: **+91 86524 24617** (`https://wa.me/918652424617`). Terms & Conditions and Privacy Policy stay dummy links.
The number takes both voice calls and WhatsApp, so "Call Doctor Ops" (tel:) and "Message support" (WhatsApp) stay as
approved. **Production:** sign-up URL, Terms, Privacy and support numbers must be configurable, not hard-coded.
**Safe placeholder:** Terms/Privacy point to a "link pending" page. `[MOCK ASSUMPTION]`

**Added 2026-10-14:** what the case-page **Help** button opens (call Doctor Ops, FAQ, or a choice) — needed before the case page is built (D-49).

**Added 2026-10-14:** transfer-failed alert (warm transfer to HA fails) has no spec yet. PRD: blocking alert, doctor confirms before the case is re-routed to forward. Needed before the case page is built (D-51).

### OQ-022 — Crash and freeze reporting
**Partly answered 2026-10-12 (Apurva):** the Android and iOS apps use both **Sentry** and **Crashlytics** today.
Crashlytics covers native apps only; the mobile-web doctor app would report through Sentry. The help-message
reference ID can be Sentry's event ID, so tech can open the exact report.
**Answered 2026-10-12 (Apurva):** The app team owns technical triage. Help provides an explicit report action; merely opening Help does not submit a report. Automatic crash and freeze logging remains useful. Exact report contents and support routing remain to be defined.
**Safe placeholder:** Explicit report action shows a mock reference ID. `[MOCK ASSUMPTION]`

### OQ-014 — Prescription quantity units for non-tablet forms
**Question:** For syrups, injections, creams, drops and inhalers, does the backend's prescription quantity count whole packs (bottles, tubes, vials) or doses? Cart quantity today is whole units.
**Status:** Deferred — Apurva to brainstorm separately.

### OQ-015 — Per-medicine detail view (price, image)
**Question:** Line-item price was removed from the medicine row (2026-10-07). Apurva's direction: a row-level icon (e.g. eye) opens a per-medicine view showing price, product image and similar reference details, for when a customer asks. Order value stays visible as is.
**Status:** Deferred — not designed or built yet.

- **Profile / Logout sheet render** (2026-10-15, round 15): listed on the sheet template (D-52) but not in the Home screen files. Render it when `index.html` is rebuilt; not part of the A–D standards pass.
