# open_questions.md — Q2 Portals & Payments Roadmap

This file tracks unresolved decisions that Claude must not silently answer.

---

## Active Open Questions

---

### OQ-001 — CPO official definition

**Question:** What is Finance's official numerator, denominator, and cost allocation for CPO (cost per delivered order)?
**Why it matters:** Bet 2's primary outcome metric depends on this. Without it, "CPO improvement" can't be measured consistently.
**Status:** Open.

---

### OQ-002 — Current payment production rollout coverage

**Question:** What % of warehouses/order volume is actually live on the new payment service today?
**Why it matters:** Earlier material suggested partial (~50%/6-warehouse) rollout; user states the technical revamp is done. These need reconciling before claiming full rollout externally.
**Status:** Open, needs revalidation.

---

### OQ-003 — Scope of "100% Doctor audit coverage"

**Question:** Does this mean 100% evidence/workflow capture, 100% automated screening, or 100% human review of every Doctor interaction?
**Why it matters:** Changes the actual build scope of the audit workstream.
**Status:** Open. Lower urgency this quarter — Doctor identity/audit work is Discovery-only in Q2 regardless (see `project_truth.md` §7).

---

### OQ-004 — Returns/refunds baseline figures

**Question:** Are the previously stated figures (~1,500 inbound calls/day, ~900 unique return/refund cases, ~400 app requests) still accurate, and as of what date?
**Why it matters:** These were stated once in an earlier discussion without a firm date/time context. Using them as a formal baseline without revalidation risks an inaccurate CXO-facing claim.
**Status:** Open, needs revalidation before use as a formal baseline.

---

### OQ-005 — Doctor Portal reject-workflow

**Question:** Should Truemeds' Doctor Portal build a structured case-rejection flow with reasons (e.g. cannot prescribe over call, refused consultation, already bought, duplicate order, reassign to admin) this quarter?
**Why it matters:** The locked consultation workflow today has no reject path at all — only Hold/No-pickup. PharmEasy's DocStat app has a working 5-reason template that could be adapted with low ambiguity if this is prioritized.
**Status:** Open — not currently scored into the Q2 roadmap. Flagged, not decided.

---

### OQ-006 — Hold vs Reschedule distinction

**Question:** Should the Doctor Portal separate "call unanswered/busy" (Hold) from "call answered but customer wants to reconnect later" (Reschedule), as DocStat does? The Truemeds prototype currently only has Hold.
**Why it matters:** Smaller UX/workflow gap; likely lower priority than the reject-workflow question above.
**Status:** Open, likely deferred to Q3.

---

### OQ-007 — Doctor Portal classification/eligibility logic

**Question:** Case type (Cat4 vs Pilot), HA eligibility/skip conditions, Transfer vs Forward operational meaning, Value vs Non-Value Meds classification, doctor assignment source.
**Why it matters:** This entire cluster drives the Doctor Portal's CTA routing and workflow logic.
**Status:** **Deferred — not owned by this roadmap project.** Real resolution status lives in `../../../../truemeds-doctor-portal-prototype/docs/context/open_questions.md` (OQ-003, OQ-007, OQ-008, OQ-009, OQ-010 in that file). Do not re-litigate here; check that file for current status if it becomes relevant to roadmap scoping.

---

## Answered Questions

*(None yet)*

---

## Deferred Questions

*(None yet)*
