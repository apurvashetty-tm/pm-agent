---
name: gap-analysis-5pass
description: >
  A reusable 5-pass mental model for achieving exhaustive PRD coverage. Use when
  writing a PRD from scratch, gap-filling an existing spec, or reviewing a PRD for
  blind spots. Each pass targets a different class of scenario that first-draft specs
  almost always miss. Invoke after Pass 1 (happy path) is drafted — not before.
---

# 5-Pass Gap Analysis — PRD Coverage Framework

Synthesised from DMS Integration (Locus) milestone PRD rewrites, May 2026.
Applied to: M2 Geography Setup, M3 Driver Module, M5 Order Sorting, M6 Planning Engine, M7 Driver App.
Validated across 6 PRDs. Ratings before/after: M2 7→9, M3 7.5→9, M5 4→8.5, M6 8→9.5, M7 7→9.

---

## What This Model Is

A structured pass sequence that forces you to ask different questions about the same use case. Each pass surfaces a class of scenarios that is invisible when you only think about the success flow.

**The single most common PRD failure mode:** Spending 80% of spec effort on Pass 1 (happy path) and 20% on Pass 2 (direct failures), with zero coverage of Passes 3–5. This produces a spec that Engineering can build in ideal conditions but cannot implement safely in production.

---

## The Five Passes

### Pass 1 — Happy Path

**Question:** What happens when everything works?

Write the complete success flow — step by step, actor by actor, system by system. Be specific: name the API call, name the state the entity enters, name the field that gets written.

**Minimum standard:**
- Every actor's action is named (not just "the system does X")
- Every entity state transition is explicit (e.g., "order moves from Open → Assigned")
- Every field that gets written is named
- Pre-conditions and post-conditions are stated

**Red flag:** A happy path described in one sentence ("AWB is generated and printed") is not a happy path spec — it is a feature name. Expand until each step is a distinct action.

---

### Pass 2 — First-Order Failures

**Question:** What happens when each step in Pass 1 fails directly?

For every action in Pass 1, ask: what is the failure mode for THIS specific action?

**Not:** general error handling
**Yes:** the specific failure that happens when THIS step breaks

**Checklist:**
- [ ] What if the API call in step N returns an error?
- [ ] What if the required data field is null or malformed?
- [ ] What if the entity is in an unexpected state at the moment this action runs?
- [ ] What if the user performing this action lacks the required role?
- [ ] What if the action is attempted twice (duplicate trigger)?
- [ ] What if the action is attempted on an already-terminal entity?
- [ ] What if a required pre-condition is no longer true at execution time (was valid when checked, invalid when acted on)?

**Common omissions at this pass:**
- Duplicate submission handling (submit button hit twice, webhook fires twice)
- Race condition between validation check and action execution
- Actions performed on entities in wrong lifecycle state

---

### Pass 3 — External System Failures

**Question:** What happens when systems this UC depends on fail?

Pass 2 handles failures WITHIN the use case. Pass 3 handles failures in systems the use case calls out to. These are different: Pass 2 = "the AWB barcode generation call returns an error". Pass 3 = "the barcode generation service is completely unreachable for 20 minutes."

**Checklist:**
- [ ] What if the external API is completely down — not slow, not per-request failure, but service unreachable?
- [ ] What if the database table this UC reads is unavailable?
- [ ] What if a webhook this UC expects is never delivered?
- [ ] What if the external service is up but returns malformed/unexpected data?
- [ ] Is there a circuit breaker? What does the queue look like while it's open?
- [ ] What is the recovery path when the external system comes back?
- [ ] Are there cached values? What is the staleness threshold before cache is rejected?

**Why this pass is systematically skipped:** Engineers know how to think about this; PMs assume it will be handled in implementation. The result: no explicit spec → each engineer handles it differently → inconsistent retry policies, different alert thresholds, silent failures.

**Rule:** If your UC calls an external system, you must spec: retry count, retry backoff, failure state name, alert recipient, and recovery trigger.

---

### Pass 4 — State Intersections

**Question:** What happens when two valid states collide?

These are scenarios where both states are legal on their own, but their simultaneous occurrence creates an undefined or dangerous situation.

**The pattern:** "What if X is happening AND Y happens at the same time?"

**Checklist:**
- [ ] What if the entity's status changes WHILE this operation is in flight?
- [ ] What if this UC's input data was valid when written but stale when read?
- [ ] What if two actors perform conflicting operations on the same entity simultaneously?
- [ ] What if an upstream UC's output (that this UC depends on) gets modified AFTER this UC already ran?
- [ ] What if a deletion or cancellation event hits an entity that is currently mid-operation?
- [ ] What if this UC runs during a migration/cutover window when both old and new systems are live?

**Examples from DMS:**
- Driver terminated (M3) AFTER their trip was assigned (M6) — neither event is invalid; the intersection is
- Hub alias changed in Geography (M2) AFTER AWB was printed referencing that alias (M5)
- Parked order's pincode zone mapping changes while order is waiting for address resolution (M6)
- Shipsy AWB + Locus AWB both non-cancelled for same order during cutover window (M5)

**Why this pass is hard:** These scenarios don't appear in any single UC — they emerge from interactions between UCs. You only find them by systematically asking "what could change in any other UC that would affect the state assumed by this UC?"

---

### Pass 5 — Cross-Cutting Concerns

**Question:** What applies to ALL use cases in this milestone?

These are concerns that are too easy to defer ("we'll figure it out in implementation") and too important to leave unspecified.

#### Authorization
- Who can perform each action? Not just "users" — which specific roles?
- What happens if an unauthorised user attempts the action? (Block? Log? Alert?)
- Are there role-based restrictions on viewing vs acting?

Write an explicit **Authorization Matrix** for every milestone that involves human actors.

#### Audit Trail
- What events must be logged for compliance, debugging, and ops review?
- For each event: who, what, when, and why (reason code for human-initiated events)
- How long are logs retained?

Rule: Every state change that a human initiated must be auditable. "We'll log it" is not a spec.

#### Concurrency
- Can two users perform the same action simultaneously?
- If yes: what is the conflict resolution model? Last-write-wins? Optimistic locking? Queue?
- If optimistic locking: what does the conflict error tell the user, and what can they do?

#### PII
- Which fields in this milestone contain personal data?
- Where is PII written (database, physical label, log file, webhook payload)?
- What is the retention policy? What is the disposal SOP?

#### Versioning and Format Stability
- If this milestone defines a format (label, code, payload schema): what happens when the format changes post-launch?
- Are old-format records still valid? For how long?
- Is there a version identifier in the format?

#### Metrics and Thresholds
- What metrics does this milestone generate?
- Are alert thresholds defined, or just "alert when rate is high"?
- Who defines the baseline? When? (Answer: in the first N weeks of production)

#### Rollout and Dual-System Risk
- What is the cutover plan from old system to new?
- Is there a parallel-run window? What is produced during parallel run (real data, shadow data)?
- What is the decommission trigger for the old system?
- What data migration is required before go-live?

#### Open Questions
- List every assumption that needs stakeholder confirmation before implementation starts
- Tag each open question to the spec section it blocks

---

## How to Apply — Pass Sequencing

**When writing a PRD from scratch:**
1. Draft Pass 1 first (happy path only)
2. Run Pass 2 on each step of Pass 1
3. Run Pass 3 for each external system referenced in Pass 1 or Pass 2
4. Run Pass 4 by listing all entities that change state, then asking what other UCs also change those entities
5. Run Pass 5 as a final sweep — authorization matrix, audit trail, concurrency, PII, metrics, rollout

**When gap-filling an existing spec:**
1. Score existing spec by pass (which passes are partially covered?)
2. Run only the uncovered passes — do not re-do passes that are already complete
3. Start with Pass 5 cross-cutting concerns (authorization matrix and audit trail) — these are the fastest to add and have the highest downstream value
4. Then Pass 3 (external system failures) — most commonly absent
5. Then Pass 4 (state intersections) — requires most domain knowledge

**When reviewing a spec (as a reviewer):**
1. Check Pass 1 completeness first (is happy path fully stepped out?)
2. Sample-check Pass 2 — pick 3 steps from Pass 1 and ask "what is the failure mode?" If none is specified, Pass 2 is absent
3. Check for any external system listed in Pass 1 without a retry/failure spec — signals Pass 3 absence
4. Look for entity state transitions — for each one, ask "what other UC could interrupt this?" If none addressed, Pass 4 is absent
5. Check for authorization matrix, audit trail, and open questions — if all absent, Pass 5 is absent

---

## Rating Heuristic

Use this to calibrate a spec's coverage level consistently:

| What's Present | Score | What It Means |
|---|---|---|
| Pass 1 only | 3–4/10 | Feature name with steps. Engineering can prototype but not ship safely |
| Pass 1 + partial Pass 2 | 5–6/10 | Common failures handled. Still misses systemic failure modes |
| Pass 1 + full Pass 2 | 7/10 | Solid engineering spec for the main path. Production incidents will surface Passes 3–5 |
| Pass 1 + Pass 2 + Pass 3 | 7.5–8/10 | Infrastructure-ready. Missing cross-cutting concerns still |
| All 5 passes present | 9–10/10 | Production-safe spec. All known unknowns surfaced as open questions |

**Calibration notes from DMS:**
- M5 was 4/10: entire spec was field tables without narrative flow; even Pass 1 was thin
- M2/M3/M7 were 7/10: Pass 1 full, Pass 2 partial, Passes 3–5 absent
- M6 was 8/10: Pass 2 was unusually thorough (4-sub-case cancellation UC, edit lock differentiation); still missing Passes 3–5

---

## Most Common Gaps by Milestone Type

### Integration milestones (system A ↔ system B)
Most commonly missing: Pass 3 (external system failures) and circuit breaker spec, Pass 5 rollout (dual-system window), Pass 4 (data valid in system A but stale when system B reads it)

### Entity management milestones (CRUD on a domain entity)
Most commonly missing: Pass 4 (entity state change mid-operation), Pass 5 authorization matrix, Pass 2 locked-field edit attempts

### Physical output milestones (labels, manifests, barcodes)
Most commonly missing: Pass 1 is often thin (format spec without narrative flow), Pass 3 print service failure, Pass 5 PII handling and disposal, multi-unit handling (what if N items, not 1?)

### Orchestration milestones (planning, routing, scheduling)
Most commonly missing: Pass 4 (entity state change post-assignment), Pass 5 concurrency (two planners editing same plan), Pass 5 metric thresholds undefined

---

## Quick-Reference Checklist

Run this at the end of every PRD section before marking it complete:

**Pass 1**
- [ ] Every actor's action named
- [ ] Every entity state transition named
- [ ] Pre-conditions and post-conditions stated

**Pass 2**
- [ ] Each step has a named failure mode
- [ ] Duplicate submission handled
- [ ] Wrong-state action handled
- [ ] Unauthorised actor handled

**Pass 3**
- [ ] Each external system has retry count + backoff + failure state name
- [ ] Circuit breaker / queue behaviour specified if relevant
- [ ] Cache staleness threshold defined if relevant
- [ ] Recovery trigger after service restoration specified

**Pass 4**
- [ ] Each entity state transition checked against other UCs that affect same entity
- [ ] Cutover / dual-system scenario covered if migration milestone
- [ ] Concurrent actor conflict scenario covered

**Pass 5**
- [ ] Authorization matrix exists
- [ ] Audit trail events listed with fields
- [ ] Concurrency model stated (or explicitly "not a risk" with reasoning)
- [ ] PII fields identified with retention + disposal policy
- [ ] Metrics listed with threshold (or "baseline to establish in first N weeks")
- [ ] Rollout plan + old-system decommission trigger
- [ ] Open questions table with blocking dependencies identified
