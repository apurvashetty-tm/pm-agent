# open_questions.md — Truemeds Doctor Portal Prototype

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

**Safe placeholder:** Medicines list is read-only in V1. Doctor can flag/validate but not add or remove. `[MOCK ASSUMPTION]`

**Status:** Open

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

**Safe placeholder:** Doctor can adjust qty freely (min 1) and disable any medicine. Changes are mock-only and not persisted. `[MOCK ASSUMPTION]`

**Status:** Open

---

## Answered Questions

*(None yet)*

---

## Deferred Questions

*(None yet)*
