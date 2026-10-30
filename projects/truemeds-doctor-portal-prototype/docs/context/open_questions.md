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

**Status:** Answered (Apurva, 2026-10-24, D-58 point 22) — talk time adds up across calls on the same case (min ~10 s per call, within ~30 min).

---

### OQ-002 — No-pickup handling and hold duration

**Question:** How many no-pickup attempts before a case goes on hold? What is the hold duration? Does it auto-return to the queue?

**Why it matters:** Determines the doctor's available actions before a case escalates or re-queues.

**Safe placeholder:** No-pickup marks a single attempt. Hold is manual with no auto-return. `[MOCK ASSUMPTION]`

**Status:** Answered by D-58 (2026-10-19) — a patient who doesn't answer closes the case as Patient unavailable automatically; no hold.

---

### OQ-003 — Doctor assignment source

**Question:** How does a case arrive in a doctor's queue? Is it automatic (rotational), manual (admin assigns), or self-service (doctor picks from a list)?

**Why it matters:** Determines whether the doctor screen has an assignment/claim action or simply shows cases assigned to them.

**Safe placeholder:** Cases are pre-assigned and arrive in the doctor's queue. No self-pick action in V1. `[MOCK ASSUMPTION]`

**Status:** Answered by D-31/D-36 — doctors request the next case themselves (pull); nothing is pushed (pushed cases: OQ-028, later).

---

### OQ-004 — Medicine review authority

**Question:** Can a doctor add or remove medicines from the order, or only validate/flag what is already there?

**Why it matters:** Determines whether the medicines section is read-only + validation, or editable.

**Answer (Apurva, 2026-10-07):** The doctor cannot add medicines; Add medicine is removed from the prototype. The doctor can edit frequency, duration and advice, and can disable a medicine.

**Status:** Answered (Apurva, 2026-10-22, D-59) — no add; a disabled medicine is removed from the order; if none is left, the order is cancelled later.

---

### OQ-005 — Notes visibility and locking

**Question:** Are notes visible to other teams (e.g., pharmacy, HA)? Are notes locked after call completion so they cannot be edited?

**Why it matters:** Determines whether notes have a submit/lock action or remain freely editable.

**Safe placeholder:** Notes are visible only to the doctor for V1. No lock behavior shown. `[MOCK ASSUMPTION]`

**Status:** Answered (Apurva, 2026-10-22, D-59) — saved only on Confirm, locked after; symptoms printed on the prescription, Doctor notes internal (doctor, HA, ops, pharmacy).

---

### OQ-006 — Pre-call notes capture

**Question:** Can a doctor capture notes/symptoms before the valid call is completed, or only after?

**Why it matters:** Determines whether the notes input is shown before the valid-call gate or only after.

**Safe placeholder:** Notes input is shown before the valid-call gate for pre-call observations. `[MOCK ASSUMPTION]`

**Status:** Answered (Apurva, 2026-10-22, D-59) — notes are editable from the moment the case opens until Confirm.

---

### OQ-007 — Transfer vs Forward — operational distinction

**Question:** What is the operational difference between Confirm & Transfer and Confirm & Forward? Which downstream team does each route to?

**Why it matters:** CTA label and meaning must be accurate. If these map to different systems/teams, the prototype should reflect the right labels even in mock form.

**Safe placeholder:** Both are shown as distinct final CTAs for the relevant Pilot scenarios. Internal routing logic is not implemented in V1. `[MOCK ASSUMPTION]`

**Status:** Answered — Apurva, 2026-10-16, D-57. Transfer = patient handed to an HA on the same call; forward = an HA calls the patient back separately; a failed transfer goes as a forward. Which systems carry this is Engineering's.

---

### OQ-008 — HA skip eligibility condition

**Question:** What field or system condition determines that a Pilot order is eligible for Skip HA Call? Is it based on the patient's prior history, medicine type, time, or something else?

**Why it matters:** Skip HA Call must not appear unless the case qualifies. Showing it incorrectly changes the doctor's workflow.

**Safe placeholder:** Skip HA Call is shown for all Pilot + HA-required scenarios in the prototype, controlled by the mock scenario flag. `[MOCK ASSUMPTION]`

**Status:** Answered (Apurva, 2026-10-22, D-59) — Skip HA is allowed on both Pilot types whenever an HA call follows the doctor call; no other conditions.

---

### OQ-009 — Value Meds vs Non-Value Meds classification

**Question:** How is a medicine classified as Value Meds or Non-Value Meds? Is it a product attribute, an order flag, or a system-level classification?

**Why it matters:** This drives Transfer vs Forward CTA routing. If classification logic changes, the CTA changes.

**Safe placeholder:** Controlled by scenario flag in mock data. Not derived from medicine attributes in V1. `[MOCK ASSUMPTION]`

**Status:** Answered (Apurva, 2026-10-19/22, D-58/D-59) — ideal is Value Meds (transfer on the same call); fallback is Non-Value Meds. Either set before the doctor call (categories with no dedicated HA) or at the moment of transfer (no HA free). Apurva to confirm with Engineering and Ops.

---

### OQ-010 — Case type classification (Cat4 vs Pilot)

**Question:** What makes an order Cat4 vs Pilot? Is this an order field, a customer attribute, a medicine attribute, or a combination?

**Why it matters:** The entire post-call CTA logic branches on this. The prototype must not silently invent it.

**Safe placeholder:** Case type is a top-level field in mock scenario data. Not derived from any logic in V1. `[MOCK ASSUMPTION]`

**Status:** Answered (Apurva, 2026-10-19, D-58) — four order categories: Cat4 (= doctor category 4) doctor call only · Valid Rx HA call only (not in the doctor app) · Pilot Value Meds · Pilot Non-Value Meds (both calls).

---

---

### OQ-011 — Medicine qty editability and disable scope

**Question:** Can a doctor reduce/increase qty beyond what the customer ordered? Is there a min/max constraint? What downstream system does a qty change or disable action write to?

**Why it matters:** Doctor can now edit qty and disable medicines in the prototype. If there are business rules (e.g., doctor cannot increase qty beyond what was ordered, or disabling a medicine cancels it from the order), those rules are not yet defined.

**Answer on qty (Apurva, 2026-10-07):** The doctor never sees or edits quantity on the Prescribe screen. Two quantities exist: (1) the customer's cart quantity, shown read-only on the medicine row and unchanged by any doctor edit; (2) the prescription quantity, owned by the backend. The backend preselects frequency and duration for the maximum configured period (6 months; Ongoing preselected) and stores the quantity; if the doctor changes frequency or duration, the backend recalculates the quantity and prints it on the prescription, replacing the default.

**Status:** Answered (Apurva, 2026-10-22, D-59) — quantity is the backend's (D-06); a disabled medicine is removed from the order; last one disabled → order cancelled later.

---

### OQ-012 — Callback scheduling terminal behavior

**Question:** When a doctor schedules a callback (from the pre-gate escape hatch, the early-call-end recovery path, or the post-gate chip), the prototype treats this as terminal — it ends the doctor's session for that order, marks `consultationState = 'completed'`, and shows a success toast saying the order "moved to callback queue." Is this actually correct? Should the order really leave the doctor's queue, or should the doctor stay on the case? Does a "callback queue" exist as a real downstream concept?

**Why it matters:** If scheduling a callback should NOT remove the case from the doctor's queue, or if there's no real "callback queue" system to route to, the current terminal-completion behavior misrepresents what happens to the order after the doctor taps "Confirm Callback."

**Safe placeholder:** Scheduling a callback ends the session (`consultationState = 'completed'`), shows success toast "Callback Scheduled ... Order moved to callback queue," doctor proceeds via Next Order. `[MOCK ASSUMPTION]` — not confirmed backend truth.

**Status:** Answered by D-36 — a confirmed callback closes the case for this doctor and goes to the callback pool (see OQ-020 for the hand-over).

---

### OQ-013 — Early call-end retry limit

**Question:** When a doctor ends a call before the 50-second valid-call gate, the prototype now shows "Call Again" with no cap on retries. Should there be a maximum number of early-end attempts before the case escalates or behaves differently (similar in spirit to the no-pickup attempt question in OQ-002)? Does an early hangup count toward the same attempt counter as a no-pickup?

**Why it matters:** Without a limit, a doctor could end and restart a call indefinitely in the real product. If there's a real operational cap, the prototype should reflect it rather than silently allowing infinite retries.

**Safe placeholder:** "Call Again" has no retry limit in the prototype. Each early end-call simply resets to the pre-call state with the recovery UI (Call Again + Schedule Callback ghost button) shown. `[MOCK ASSUMPTION]`

**Status:** Answered (Apurva, 2026-10-19, D-58) — no retry limit; Unavailable is always one tap away; misuse is handled by ops.

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


### OQ-024 — Releasing a case [DECIDED — Apurva, 2026-10-24, D-58 point 20; backend still needed]
Release was discussed, never agreed; parked with `a-leave-sheet`. If adopted later: D-48 described Back before the first attempted call releasing the case to the queue. Needs an unassign action that is only allowed while no call has been attempted, is safe to retry, and returns the case to the pool immediately. Who else is notified, and whether released cases go to the front of the queue, is Engineering/Ops to confirm.

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
**Update 2026-10-16 (D-57):** routing answered — a failed transfer goes as a forward (HA calls back). Still open: what the doctor sees (alert or silent switch).

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

### OQ-027 — Calling model: phone call now, in-app call later [PARTLY ANSWERED — 2026-10-19, D-58]
Answered: one telecom partner at a time (Ozonetel or Knowlarity); leg 1 and leg 2 are reported separately, so "doctor didn't answer" is its own state. Still open: in-app (VoIP) calling, later.
First release uses Knowlarity click-to-call: the doctor's phone rings first, the call is ended on the phone (no End call in the app). To confirm with Knowlarity: leg 1 not connected = "doctor didn't answer". In-app (VoIP) calling with native controls to be explored later; patient receives a normal call. Calling screens are redesigned in a separate thread; see `ui-screens/app-logic.md` §5a.

### OQ-028 — Pushed cases (future) [OPEN — later, 2026-10-16]
Today doctors only request cases; nothing is pushed (D-31, D-36). Apurva: pushing cases to doctors may be explored later. Not in this version.

### OQ-029 — Doctor volume figures [OPEN — Apurva, 2026-10-16]
project_truth §2 uses approximate figures: ~12,000 orders handled by ~300 active doctors. Apurva to confirm both numbers and the period (per day / per month).

### OQ-030 — Live call events and result reconciliation [OPEN — Engineering, 2026-10-19]
D-58 needs, from the telecom partner: (1) **live** events during the call — leg 1 answered, leg 2 answered — for "Connecting to patient", "On call" and the transfer count; (2) a way for the backend to ask for call details when a result is late, before the app shows "Result not received"; (3) the mapping of each vendor's codes (Ozonetel `CustomerStatus`, Knowlarity hangup causes) to D-58's buckets, per leg; (4) how a failed HA transfer leg is reported. Without (1), "Connecting" disappears and transfer cases can't be counted.

**Update 2026-10-23 (D-58 point 14):** requirement — the app shows the call's status within about 5 seconds of the partner reporting it; Engineering chooses polling or push. Also needed: a backend check "is this call valid" (gate time since `customerAnswered`, call live) before Confirm & transfer shows; measure from today's logs the usual result delay (sets the wait) and a maximum call length. Which partner handles Cat4 / Non-Value Meds, and whether it sends live events, is still to confirm. Ozonetel reference: `reference/telephony/ozonetel-webhook-reference.md`.

**Update 2026-10-24:** method decided — polling, in both the web portal and the app (D-58 point 19). Remaining for Engineering: interval, maximum call length, result-wait time.

**Update 2026-10-24:** confirm that Ozonetel reports who ended a non-transfer call (`doctorAnswered` HANGUP/DIAL or CDR `Comments`) in time for state 16 — the reference says yes; Apurva has seen hang-up mainly during transfers.

### OQ-031 — Mobile data during a normal call [OPEN — Engineering, 2026-10-19]
On phones without VoLTE, mobile data pauses during a normal call, so the app can't count or send Confirm & transfer. Agreed for now (D-58): the case goes as a forward; track how often it happens. Engineering: can the app detect data loss during a call?

### OQ-032 — HA reservation and allocation [OPEN — Apurva + Engineering + Ops, 2026-10-24]
Target design (D-58 point 15, option A) needs an HA reserved at the start of the doctor's call, so the route (transfer / forward) is known before Confirm. Today HAs click Assign and wait 60 s for a live transfer, else get a failed-transfer order — about 35% of single-call cases end as two calls, and failed-transfer callback TAT suffers. Apurva is relooking at HA allocation separately (outside this project); until reservation exists, the fallback (option B) applies.

### OQ-033 — Ops review for calls without a record [OPEN — Apurva + Ops, 2026-10-24]
D-58 point 20 depends on Ops. To lock: (1) a review queue for "Prescription submitted" cases whose call record **never arrives** (after how long?); (2) what Ops does with each — confirm, cancel, or callback — and who tells the patient; (3) the flag and per-doctor metric for Unavailable and for submitted-without-record (thresholds, SOP, who acts); (4) whether doctor earnings count only after confirmation. Lock before the doctor app goes live.
**Separate discussion (Apurva, 2026-10-24):** what happens when a submitted case's record arrives late showing **under 50 s or no answer** — not part of this review queue; to be decided on its own (relates to the 50-second rule across dropped calls).

### OQ-034 — Icons on buttons: one rule [ANSWERED — RULES §9.1, 2026-10-24; no screen changes needed] [was OPEN — Apurva, 2026-10-24; do before the final render]
Buttons are inconsistent today: Call patient / Call again (phone), Callback (calendar), Skip HA (track-next), Unavailable (phone-off), Request next case (arrow after) have icons; Confirm prescription / transfer / forward, Back to Home, Yes still talking / No call ended, Release case, Stay on this case have none. Needs one design-system rule (RULES §9.1) and a pass over every screen — ideally before the terminal's final render so screens aren't rendered twice.
