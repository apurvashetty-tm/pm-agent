# project_truth.md
**Status:** Draft v1
**Owner:** [FILL: name / role]
**Purpose:** Working truth for the [FILL: project name] build
**Last updated:** [FILL: date]

---

## 1. Purpose
This file is the **working truth** for the [FILL: project name] build.
It locks:
- core product behavior the build must support
- journey and state rules the build must not violate
- what backend owns vs what the frontend only represents
- what may be mocked for now
- what is intentionally still open for iteration

This file is **not** a full PRD, a brainstorm dump, or a screen-by-screen UX spec.

---

## 2. How to use this file
Use it to answer: what must be supported, what may be faked/mocked, what the
build must not invent, what backend must own, and what is still open.
If older references conflict with this file, this file decides behavior until
explicitly updated.

---

## 3. Product definition
[FILL: What is the product in 3–5 lines? What is it, and what is it explicitly
NOT? Who is the user and what is the primary job to be done?]

---

## 4. Locked core journey
[FILL: The backbone flow the build must support, written as states not clicks.
Example format: State A → trigger → State B → fallback/failure state.
List the non-negotiable steps and the rules that must never break.]

---

## 5. Locked shell / layout truth
[FILL: The structural surfaces that must exist and their hierarchy — what is
primary, what is secondary, what is persistent. Note anything that must not be
normalized into generic UI.]

---

## 6. State model
[FILL: The important product states — session, identity, cart/record,
checkout/submission, etc. For each: what enters it, what survives refresh, what
clears on exit.]

---

## 7. What backend owns vs what frontend represents
[FILL: The business-critical logic backend must own — e.g. pricing, offers,
eligibility, stock, payment, permissions. Frontend renders backend truth and
must not encode this logic itself.]

---

## 8. What may be mocked
[FILL: Payloads and states safe to fake while preserving locked truth — e.g.
content payloads, list data, success/failure states, config-driven composition.]

---

## 9. What must never be casually hardcoded
[FILL: The sensitive areas — pricing, offers, stock, payment outcome, order
finality, identity/PII, attribution, permissions. If unclear, mark
`[OPEN DECISION]` and record it in open_questions.md.]

---

## 10. Instrumentation (if relevant)
[FILL: Critical transitions to log for learning/debugging. Optional at MVP.]

---

## 11. What is intentionally not locked yet
[FILL: Things open to iteration — exact screen UX, exact copy, exact layouts,
future capabilities. These may evolve but must not break the locked journey,
state model, or backend-ownership rules above.]

---

## 12. Final build principle
Build like a real product shell with stable state logic and backend-owned
business truth. Preserve the locked journey, allow mock-to-real transition
cleanly, and stay flexible only where this file leaves room.
