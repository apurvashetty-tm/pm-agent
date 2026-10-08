# ACOM 2.0 Ring AI — MVP Engineering Walkthrough

**Scope: M1A + M1B Discovery + M2a Async Routing**

| | |
|---|---|
| **Document type** | Engineering Walkthrough — implementation-reviewable companion to the PRD |
| **Companion to** | *ACOM 2.0 — Voice-Bot Cart Recovery* (PRD) — the product/decision document |
| **Author** | Apurva Shetty (Product) + Engineering |
| **Status** | Draft — Blocks 1–6 + §10 Signal Catalog (the full MVP lifecycle, pull-based routing); §11–14 still to be drafted |
| **Scope of this doc** | The MVP build: **M1A** (signal-aware integration foundation) + **M1B** (live-transfer/telephony discovery) + **M2a** (latest-state validation + async routing). M2b and M3 are referenced for dependencies only. |

---

## 1. Purpose of this document

The PRD answers *what* we're building and *why*, and records the product decisions. **This document is the engineering-grade walkthrough** of the MVP: the lifecycle, per-block state ownership, signals and their sources, payload boundaries, events, failure handling, and the open questions Engineering and Ops need to resolve to build it.

It is deliberately specific enough that Engineering can react to **data availability, source systems, reliability, state ownership, payload boundaries, failure handling, and observability** — but it does **not** re-make product decisions (those stay in the PRD), and it does **not** specify a rule engine or a config UI (that is M3).

If this document and the PRD ever disagree, the PRD wins on intent; this document wins on implementation detail.

**Framing:** Truemeds owns orchestration, state, locking, validation, and routing; Ring AI is the first vendor adapter, not the workflow owner.

## 2. MVP scope and non-scope

**In scope (build):**
- **M1A — signal-aware Ring AI integration foundation.** This is the plumbing: it selects eligible leads, captures the signals and lifecycle events, locks each lead so nothing else calls it, triggers the Ring call, and ingests and normalizes the outcome. It also includes a **kill-switch** (an Ops control that instantly halts all new bot calls — Ring concurrency → 0 — without disturbing the manual ACOM flow) and basic observability.
- **M1B — discovery track.** It resolves whether live transfer is feasible end-to-end: the **telephony path** (can Ring dial from a Truemeds-owned DID and transfer into an Ozonetel queue), whether the **customer's number survives the transfer** (CLI — Calling Line Identification, the number shown to the call recipient), and whether the **agent's screen can auto-load the right customer's order on pickup** (screen-pop). This decides whether M2b can later proceed; **no live transfer is built in the MVP.**
- **M2a — latest-state validation + async routing.** After the bot outcome, it re-checks the live cart/order and then routes the lead into the appropriate ACOM/manual queue as a **fresh outbound callback**. *(Detailed in the M2a section; not in Block 1.)*

**Not built in the MVP (capture dependencies/open questions only):**
- **M2b live transfer** — only its dependencies and open questions are captured (M1B). No transfer execution, no admission control build.
- **M3 config UI / rule engine** — *not built.* The MVP must, however, stay **signal-ready**: capture signals and emit lifecycle events so M3 can later expose selected signals as configurable rules without re-engineering.

**Out of scope (program-level):** bot-led order confirmation, medical advice, Rx validation, and substitution — defined in the PRD (§3.3 scope, §8.1 conduct) and not repeated here.

## 3. MVP lifecycle overview

```
ELIGIBLE ─▶ BOT_OWNED ─▶ RING_CALL_TRIGGERED ─▶ OUTCOME_RECEIVED ─▶ NORMALIZED ─▶ LATEST_STATE_VALIDATED ─▶ ASYNC_ROUTE_EXECUTED
```

| State | What happens | Owner | Doc block |
|---|---|---|---|
| `ELIGIBLE` | A dropped cart passes the launch gates and is selected as a voice-lead candidate; signals + snapshots captured | Truemeds | Block 1 |
| `BOT_OWNED` | Lead atomically locked from human/duplicate assignment; ownership + timeout established | Truemeds | Block 2 |
| `RING_CALL_TRIGGERED` | Vendor call initiated with the approved payload; vendor call/reference ID stored | Truemeds → Ring (command) | Block 3 |
| `OUTCOME_RECEIVED` | Ring pushes the call outcome to our webhook; raw payload stored idempotently | Ring → Truemeds (event) | Block 4 |
| `NORMALIZED` | Raw vendor outcome mapped to a Truemeds-owned normalized status | Truemeds (adapter) | Block 4 |
| `LATEST_STATE_VALIDATED` | Live cart/order re-fetched and diffed against the validation baseline | Truemeds | Block 5 |
| `ASYNC_ROUTE_EXECUTED` | Lead routed/suppressed into the right ACOM/manual queue (M2a) | Truemeds | Block 6 |

*Every transition emits a lifecycle event (Section 11). No human action occurs while `BOT_OWNED`; a lock timeout auto-releases a stuck lead back to the manual pool.*

---

## 4. Block 1: ELIGIBLE

### 4.1 Purpose
Answer one question deterministically and observably: **"From all incomplete orders, which leads are safe and worthwhile to enter the Ring AI flow right now?"**

Block 1 produces an **eligible voice-lead candidate** (or a logged suppression with a reason), captures the signals and snapshots later blocks rely on, and defines what may be sent to the vendor. It does **not** route, dial, or lock — those are Blocks 2–6.

> *[Platform note] Make eligibility a single, versioned decision function that **always records an auditable decision outcome and context** — policy version + pass context on a pass, and machine-readable suppression reason(s) on a fail — not a hardcoded `WHERE` clause scattered across jobs. This one choice is what makes the funnel measurable and lets M3 later expose gates/weights without a rebuild. It is the difference between "signal-ready" and "thin hardcoded query" (PRD principle 5).*

### 4.2 Input source
- **Population:** the initial candidate pool is expected to align with the existing ACOM incomplete-order trigger — currently understood as carts/orders inactive for **~30 min after the last cart modification** without being placed. *(Exact trigger definition + refresh mechanism — event-driven vs batch — is open; see §4.12.)*
- **De-dup at source:** a cart already `BOT_OWNED`, already human-assigned, or already placed must not re-enter (overlaps Block 2's lock; selection and lock must be atomic — see §4.9 / Block 2).

### 4.3 M1 launch gates
Launch gates are **pass/fail** checks that decide whether a lead may enter the flow *at all*. In MVP they are a **defined default policy** (config-ready, not a UI). They split by *type*, and severity is a **policy + technical-feasibility decision**, not a given. *(The signals named below are catalogued with full source/freshness/governance metadata in §10 — this section covers only the gate mechanics, not the inventory.)*

| Gate | Type | Default MVP rule | Reliability / severity note |
|---|---|---|---|
| Do-Not-Call / consent | Safety & compliance | Suppress if on DNC or lacking valid calling consent | **Non-negotiable hard gate.** Authoritative DNC source TBD (4.12) |
| Calling-window / DND hours | Compliance | Defer/suppress outside permitted hours | Hard gate; window is config |
| Valid mobile (E.164, dialable) | Contactability | Suppress if structurally invalid | Hard gate; known-bad numbers also surface post-call as `INVALID_NUMBER` |
| Order not already placed | Order-state | Suppress if already converted | Hard gate |
| Not already bot-owned / human-assigned | Order-state / dedup | Suppress if owned/assigned | Hard gate; enforced atomically with the Block 2 lock |
| Frequency cap / cooldown | CX guardrail | Suppress if attempts/window exceeded | Hard gate; thresholds config |
| Serviceable pincode | Fulfillability | Gate **only if reliably known at trigger**; else **capture + revalidate** in Block 5 | See 4.5 example |
| In-stock / fulfillable cart | Fulfillability | Gate **only if reliably known at trigger**; else **capture + revalidate** in Block 5 | See 4.5 example |
| `patient_id` present | Policy | **Severity TBD** — may be a stronger gate depending on the order/placement workflow | Policy/workflow decision (see §4.12) |
| `address_id` present | Policy | **Not an automatic hard gate.** Default: treat as a configurable eligibility/routing signal unless Product/Ops explicitly require it for MVP | See 4.5 example |
| Minimum cart / recoverable value | Policy (rollout) | **Default off.** Optionally suppress very low-value carts during constrained rollout | Config; a *floor* (whether to call), distinct from AOV *ordering* in 4.4 — not a permanent hard gate |

> *[Platform note] Group the first six as the **"never call" safety/dedup floor** (genuinely non-negotiable) and keep `patient_id`, `address_id`, serviceability, in-stock as **policy/fulfillability gates whose severity Ops sets**. That framing is what lets a signal move between hard-gate / routing / suppression later (PRD: "signal severity is configurable over time") without code churn.*

### 4.4 Qualification / prioritization signals
These do **not** decide eligibility — they decide **which eligible leads to call first** and feed later routing. Capture them; do not gate on them.

Representative examples: AOV / cart value · cart recency · substitutable savings · repeat-vs-new · drop stage. **The full inventory (with source, freshness, phase, governance) lives in §10** — this section covers only the *role* of prioritisation signals, not the list.

> *[Platform note] For MVP, don't build a weighted scoring engine. Capture the inputs and order by a **simple default**: if an existing AOV-descending or business-priority assignment logic already exists, MVP can reuse it as the default ordering; if not, start with a simple deterministic ordering and capture richer priority inputs for M3. Leave weighting/tuning to M3 — capturing the inputs now is the cost; the scoring is deferred.*

### 4.5 Signal interpretation examples — why some signals are configurable, not hard gates
- **`address_id` missing ≠ unrecoverable.** A new customer who dropped before adding an address is still a recoverable cart — and because the agent later works the customer's *same* live cart (pseudo-logged-in), the agent can capture the address on the callback. So default-treating "no address" as a hard suppression would throw away recoverable new-customer demand. Treat address as a **routing/eligibility signal** (e.g., "missing-address → route to a flow where the agent collects it") unless Ops decides it's required for MVP.
- **Serviceability / inventory may not be reliable at trigger.** If stock/serviceability isn't trustworthy at selection time, gating on it risks both false-suppress (skipping recoverable carts) and false-pass. Safer: **capture the value + its as-of timestamp, and revalidate at Block 5** (latest-state) right before the agent acts.
- **Potential savings is a prioritization signal, not a script mandate.** A cart with a high generic-substitution saving is worth calling sooner — but whether the **bot voices** the saving is a later **compliance/script** decision (pharmacy context). Capture the signal regardless; gate its use in the conversation separately.

### 4.6 Lead context snapshot
An **immutable snapshot captured at handoff**, for audit, debugging, traceability, and analytics. It records the captured signal **values + source system + as-of timestamp** at the moment of selection.

> *[Platform note] Capture each signal as `{value, source, as_of, reliability}` — not a bare value. Without provenance/freshness you can't reason about reliability, can't safely evolve severity, and can't debug "why was this called." This metadata is cheap to add now and expensive to retrofit.*

This snapshot is for *traceability* — it is **not** the thing we diff for change detection (that's 4.7).

### 4.7 Validation baseline
A **separate, purpose-built "before" record** captured at handoff, diffed later (Block 5) to detect a *material* live change after the bot interaction. It uses the **same canonical validation-snapshot schema as Block 5 (§8.3)** so the before↔after diff is field-for-field:

`order_status` · `cart_revision` · `item_qty_hash` · `cart_nonempty` · `address_id` · `payment_state` · `payable_total` · `rx_workflow_state` · `assignment_owner` · `dnc_state` · `serviceability/inventory` (where flagged) · `snapshot_version`.

Every field is **nullable** and stamped **`{value, source, as_of}`** — Block 1 may not have all of them at handoff, and that's fine; a `null → value` at Block 5 is "newly observed," not automatically a material change (Block 5 §8.4). Kept distinct from the broad context snapshot (§4.6) because its job is narrow (change detection) and its field set must be stable and diff-friendly.

### 4.8 Vendor payload boundary
Block 1 **defines** what is *eligible* to be sent to Ring (the actual send happens in Block 3). The concrete field set is the **configured projection of the §10 Signal Catalog** (§10.5) — this section gives the boundary rule, which is an **allowlist, not a denylist**:

- **May be sent (safe subset):** customer name, mobile, and the approved order/cart context needed for the conversation (e.g., cart items, totals, ETA) — plus script-approved extras (e.g., savings) **only** once compliance/script signs off.
- **Internal-only (never sent):** DNC/consent + suppression history, internal risk flags, raw patient/clinical data, internal scores, and any signal not on the allowlist.
- **Sanitisation:** no `NA`/null leakage into the payload; missing fields are omitted or defaulted, not voiced as "NA".

> *[Platform note] Default-deny is the safe posture for a healthcare vendor boundary: a new captured signal is internal-only until explicitly promoted to the allowlist. This prevents accidental PII/clinical leakage as the signal set grows.*

### 4.9 Output of the ELIGIBLE block
On pass, Block 1 emits an **`EligibleVoiceLead` candidate** carrying:
- internal lead/order reference (the single retained order ID);
- the eligibility **decision = PASS** + **gate-policy version** + reason code;
- captured **signals** (each with `{value, source, as_of, reliability}`);
- reference to the **context snapshot** (4.6) and the **validation baseline** (4.7);
- **priority inputs** (or a simple default ordering key);
- any **deferred re-checks** flagged for Block 5 (e.g., serviceability/stock "not reliable at trigger — revalidate later").

This candidate is handed to **Block 2 (BOT_OWNED)**, where selection is made atomic with the ownership lock. Block 1 itself does not lock or dial.

### 4.10 Suppression / non-eligibility reasons
Every non-eligible lead is logged with a **machine-readable reason code** (for funnel + tuning). MVP set (extensible):

`SUPPRESSED_DNC` · `OUTSIDE_CALLING_WINDOW` · `INVALID_MOBILE` · `ALREADY_PLACED` · `ALREADY_OWNED_OR_ASSIGNED` · `FREQUENCY_CAP` / `COOLDOWN` · `NOT_SERVICEABLE` *(only when reliably known)* · `OUT_OF_STOCK` *(only when reliably known)* · `POLICY_GATE_FAILED` *(e.g., patient_id required-and-missing)* · `ADDRESS_REQUIRED` *(only if Ops set address as a gate)* · `BELOW_MIN_VALUE` *(only if Ops enable the rollout floor)*.

> *[Platform note] Reason codes are not optional polish — they are the funnel. "Eligible → suppressed-by-reason" is how Ops sees coverage gaps and how we later decide which gates to relax/expose in M3.*

### 4.11 Events to log
| Event | When | Key fields |
|---|---|---|
| `eligibility_evaluated` | Every candidate assessed | lead/order ref; decision (pass/suppress); on pass: policy version + pass context; on fail: machine-readable reason code(s); timestamp |
| `lead_selected` | On pass | lead/order ref, snapshot id, baseline id, priority key, deferred-recheck flags |
| `lead_suppressed` | On fail | lead/order ref, reason code, timestamp |

*Naming convention (doc-wide): lifecycle **events** are `lower_snake_case`; **states / status constants** (e.g. `BOT_OWNED_ACTIVE`, `RING_CALL_TRIGGER_ACCEPTED`, `OUTCOME_NORMALIZED`) are `UPPER_SNAKE_CASE`.*

These feed Section 11 (observability) and the funnel metrics in the PRD (eligible → sent → …).

### 4.12 Engineering / Data open questions
- **Source, availability, reliability, freshness** for each signal — especially serviceability, in-stock, potential-savings, responsiveness, TM Cash. Which are trustworthy *at trigger time* vs only at Block 5?
- **Trigger mechanism:** event-driven vs batch sweep for "dropped >30 min"; expected volume/throughput; how fresh is the population.
- **`patient_id` severity:** does order placement require a patient today? If yes, it's a stronger gate; if not, configurable.
- **`address_id` policy:** does Ops want address as a gate for MVP, or as a routing signal (missing-address → agent-collects flow)?
- **Authoritative DNC / consent source** and how calling-window/DND compliance is enforced.
- **Selection ↔ lock atomicity:** how to make "select eligible" and "mark `BOT_OWNED`" atomic to prevent double-selection/duplicate calling (links Block 2).
- **Gate-policy versioning:** where the default gate set lives so it's changeable without scattered code (without yet building M3's UI).
- **Priority in MVP:** is the existing AOV-descending assigning logic sufficient as the ordering, or is a richer priority needed at launch?

### 4.13 Exit criteria (Block 1)
- A **single, versioned eligibility decision** runs over the candidate pool and **always records an auditable decision outcome + context** (policy version + pass context on a pass; machine-readable reason(s) on a suppress).
- On pass it produces an `EligibleVoiceLead` candidate with **signals (+provenance), a context snapshot, a validation baseline, priority inputs, and any deferred-recheck flags.**
- Hard gates vs qualification signals, context snapshot vs validation baseline, and internal-only vs vendor-allowlist are **cleanly separated** in the data model.
- Suppressions are **logged with machine-readable reasons**; selection events are emitted.
- The gate set is **config-defined policy** (not hardcoded across jobs) — signal-ready for M3, without building M3.
- Candidate is ready to hand to **Block 2 (BOT_OWNED)** for atomic locking + dispatch.

---

## 5. Block 2: BOT_OWNED

### 5.1 Purpose
Atomically **claim** an eligible candidate so it is owned by the voice-bot flow and removed from human/duplicate assignment, and establish an **ownership lease** so a stuck lead auto-releases. BOT_OWNED is the guarantee behind PRD principle "no duplicate bot + human calling." It does **not** dial (that's Block 3) and does **not** lock the customer's cart object (see 5.5).

### 5.2 Input
An `EligibleVoiceLead` candidate from Block 1 (keyed by the single retained order ID), with its signals, snapshot, baseline, priority key, and any deferred re-checks.

### 5.3 What BOT_OWNED does
- **Re-check at acquisition:** before claiming, re-verify the lead is still *not placed* and *not already owned/assigned* — state may have moved since eligibility was evaluated.
- **Atomic claim:** transition `ELIGIBLE → BOT_OWNED` via a single conditional/compare-and-set operation keyed on the order ID, so only one writer can win. Selection (Block 1) and this claim must be **atomic together** (the 4.12 open item) — "select-and-claim," not select-then-claim with a gap.
- **Ownership / attempt record:** persist a durable record. Concise core fields: `bot_attempt_id`, `lead_id`, `order_id`, `owner_type = RING_AI`, `ownership_status`, `lock_started_at`, `lock_expires_at`, `attempt_number`, `eligibility_version`, `lead_context_snapshot_id`, `validation_baseline_id`, `vendor_payload_version`, `release_reason`, `last_status_updated_at`, `created_by_system`. *(Design-level core, not a final schema — extend as needed.)*
- **`bot_attempt_id` is the idempotency key** threaded across call-trigger → webhook mapping → retry → reconciliation.
- **Remove from the manual/assignable pool** while owned; restore on release.
- **Idempotent:** re-claiming an already-owned lead is a no-op that returns the existing ownership.
- **Invariant:** Ring is **not** triggered (Block 3) unless ownership has been successfully committed.

### 5.4 Ownership states & lease model

**MVP ownership states.** Block 2 owns **only the ownership axis** — *do we still hold this lead?* It carries **no** trigger-flavoured states; what happened to the call command is the orthogonal trigger axis owned by Block 3 (§6.2, §6.8).

| State | Meaning |
|---|---|
| `BOT_OWNED_ACTIVE` | Ownership held; lead is in the bot flow (covers pre-trigger and awaiting-outcome — the trigger axis carries that detail) |
| `BOT_OWNED_RELEASED` | Ownership ended normally; lead moved to the next handling path |
| `BOT_OWNED_EXPIRED` | Lease expired without a usable outcome |
| `BOT_OWNED_FAILED` | Ownership setup failed |
| `BOT_OWNED_CANCELLED` | Lead became irrelevant (e.g. order placed / cart empty) |

Ownership is held by a **lease with a TTL**; the lead stays `BOT_OWNED_ACTIVE` until a terminal outcome (Block 4) or the lease expires.

> *[Orthogonality — see Block 3 §6.2] Ownership state ("do we still hold this lead?") and **trigger state** ("what happened to the call command we sent Ring?") are two separate dimensions. A lead is routinely `BOT_OWNED_ACTIVE` while its trigger state moves `RING_CALL_TRIGGER_PENDING → IN_FLIGHT → ACCEPTED`. Block 3 (§6.8) is authoritative for the trigger axis; Block 2 deliberately keeps no trigger-flavoured ownership states so Block 4 inherits one consistent model.*

**Lease / TTL policy.** The BOT_OWNED lease is **derived from the applied retry policy and the expected call lifecycle** — not a short fixed timeout after trigger and not a single arithmetic constant. The derivation and the event-driven refresh rule are specified in **Block 3 §6.10** (initial call duration, retry delays, max call duration, permitted call window/scheduled time, analysis completion, webhook grace, reconciliation grace; refresh from Ring lifecycle events; release only on terminal outcome, explicit cancellation, or reconciliation confirming no active/scheduled attempt). Ownership therefore covers Ring's configured retry/schedule window **and** reconciles with Ring before release.

**Bounded windows.** The retry/schedule horizon must be **explicitly bounded** (a `max-ownership cap`). If the configured horizon is long, Product/Ops decide whether the lead **remains bot-owned throughout**, moves into a **scheduled bot-attempt state**, or **partially returns to manual handling** after a threshold. For time-sensitive cart recovery, the MVP default should be **conservative** (short horizon) — set by config, not hardcoded (Block 3 §6.6).

> *[Platform note] On expiry, **reconcile with Ring (poll call status) before force-releasing** — never blind-release a lead Ring may still call, or you risk double-calling.*

### 5.5 Concurrency & dedup
- **Bot-vs-bot:** the atomic claim prevents two workers owning the same order ID.
- **Bot-vs-human:** "not already assigned" is enforced *in the same atomic step* as the claim, not as a prior best-effort check.
- **Persistence:** ownership must survive service restarts (durable state, not in-memory only).

> *[Platform note] BOT_OWNED locks the **lead/assignment**, not the **cart/order object**. The customer can still edit or place their cart while a lead is BOT_OWNED — that is the separate **customer↔agent cart-concurrency** question (PRD §15.1), and it is **not** solved by this lock. We deliberately do not lock the customer's live cart here; that would harm CX. Latest-state validation (Block 5) is how we cope with the cart moving underneath us.*

### 5.6 Timeout, auto-release & reconciliation
- **Lease timeout → auto-release** a stuck lead back to the manual pool (or re-eligible, per policy) so nothing is orphaned if a webhook never arrives.
- **Reconcile-before-release:** near lease expiry, poll Ring (`get-call-details`/history); if Ring is still scheduled/retrying → **extend** the lease; if complete/failed/unknown → release and route per the (possibly late) outcome or to manual.
- **Reconciliation job:** periodic sweep for owned leads past expiry or without a terminal event (ties to the NFR reconciliation backstop).

### 5.7 Kill-switch, concurrency control & manual override
- **Concurrency control** = the cap on simultaneously owned/in-flight leads (the Ops throttle). New claims beyond the cap wait or are skipped.
- **Kill-switch (concurrency → 0):** **stops new claims** immediately; existing owned leads either **drain** (complete/time out) or are **bulk-released** for a fast revert — the drain-vs-release policy must be defined (5.11). **Manual ACOM continues for non-bot-owned leads; bot-owned leads are skipped/hidden from normal ACOM assignment until released or routed.**
- **Ops visibility:** if UI visibility isn't available in MVP, **backend reason codes + query/dashboard visibility are required** so Ops can identify bot-owned leads.
- **Manual / operational override:** Ops (or an authorized system) can release/suppress bot ownership for exceptional cases — Ring outage, customer complaint, mis-selected lead, stuck ownership. MVP needs a **safe backend override path or runbook with an audit trail**, not a self-serve UI.

### 5.8 Output of BOT_OWNED
An **owned lead** with the durable ownership record from 5.3 (keyed by `bot_attempt_id`) and the Block 1 candidate payload, ready for **Block 3 (RING_CALL_TRIGGERED)**.

> **Hard invariant.** The Ring AI call trigger (Block 3) must **not** happen unless bot ownership has been successfully committed — otherwise Ring could call the customer while Truemeds holds no ownership state.

### 5.9 Failure cases
| Case | Handling |
|---|---|
| Order placed before ownership claim | Do not claim; suppress (`bot_ownership_rejected`, reason `already_placed`) |
| Cart empty before ownership claim | Do not claim; suppress or manual review |
| DNC / callability changed before claim | Do not claim; suppress |
| Human assignment happened before claim | Do not claim; yield to the human owner |
| Already bot-owned | Do not duplicate; return existing ownership or reject |
| Lost claim race (another owner won) | Yield; leave to the winner; emit `bot_ownership_conflict_detected` (not an error) |
| Claim succeeds but Block 3 call-trigger fails | Release ownership (or mark for retry per policy) so the lead isn't stuck owned-but-never-called |
| Crash after claim, before trigger/persist | Recovered via lease expiry + state check in the reconciliation sweep |
| Lease expiry while Ring may still call | **Reconcile with Ring first**; extend if still active, release only if confirmed done/unknown |
| Kill-switch mid-ownership | Apply drain-vs-bulk-release policy (5.7) |

### 5.10 Events to log
| Event | When | Key fields |
|---|---|---|
| `bot_ownership_requested` | Eligible lead submitted for ownership | order ID, bot_attempt_id, eligibility_version |
| `bot_ownership_acquired` | Claim succeeds | order ID, bot_attempt_id, owner_type, lock_started_at, lock_expires_at, attempt_number |
| `bot_ownership_conflict_detected` | Claim loses the race | order ID, winning-owner ref, timestamp |
| `bot_ownership_rejected` | Not acquired due to current state | order ID, reason_code, timestamp |
| `bot_ownership_extended` | Lease extended after reconcile | order ID, new lock_expires_at, reason |
| `bot_ownership_released` | Ownership ended normally | order ID, release_reason, timestamp |
| `bot_ownership_expired` | Lease TTL expired | order ID, timestamp |
| `bot_ownership_failed` | Ownership / trigger setup failed | order ID, reason_code, timestamp |
| `bot_ownership_cancelled` | Lead became irrelevant (placed / cart empty) | order ID, reason_code, timestamp |
| `bot_ownership_overridden` | Manual / system override | order ID, actor, reason, timestamp |

### 5.11 Engineering open questions
- **Where ownership/lock lives** — order state-machine row vs a dedicated voice-lead table vs a distributed lock; must be durable across restarts.
- **Lease derivation + max-ownership cap** — derived from the applied retry policy and call lifecycle (Block 3 §6.10) and bounded by a max-ownership cap; needs Ring's retry/schedule limits and per-attempt event semantics (Ring open questions §6.16).
- **Reconcile-before-release**: use Ring Get Call Details / Call History to confirm status before releasing.
- **Concurrency-control enforcement** — counter/semaphore; granularity (global / per-city / per-DID); and how the ownership cap relates to the trigger-time live-call cap (Block 3 §6.3).
- **Kill-switch policy** — drain existing vs bulk-release `BOT_OWNED_ACTIVE` leads not yet triggered.
- **Confirm BOT_OWNED need not lock the cart object** — and that cart-concurrency is handled only by latest-state validation (Block 5) + the §15.1 question.
- **Ownership granularity** — should ownership be held at `order_id`, `lead_id`, `customer_id`, or phone-number level? *(MVP recommendation: primarily at `order_id`/cart level, with phone/customer-level safeguards only for duplicate-calling frequency.)*

### 5.12 Exit criteria (Block 2)
- An eligible candidate is **atomically claimed** to BOT_OWNED with a **single-owner guarantee**; bot-vs-bot and bot-vs-human races are provably prevented and the claim is idempotent.
- A **durable ownership record + lease** is persisted; the lead is removed from the manual pool while owned.
- **Lease timeout auto-releases** stuck leads, with **reconcile-before-release** against Ring where a call may still be scheduled/retrying.
- **Kill-switch** stops new claims; the drain-vs-release policy for existing owned leads is defined.
- Ownership events are emitted; the owned lead is ready for **Block 3 (RING_CALL_TRIGGERED)**.

---

## 6. Block 3: RING_CALL_TRIGGERED

### 6.1 Purpose
Send a **committed bot-owned lead** to Ring for the outbound call attempt — and only after Block 2 has committed ownership. This block is responsible for:

1. a **minimal pre-flight re-check** immediately before the external command;
2. **finalizing the approved vendor payload** from the allowlist (the snapshot from Block 1);
3. **translating the Truemeds-owned retry policy** into Ring's supported `call_retry_config`;
4. sending **one idempotent call-initiation command** to Ring;
5. persisting **requested-vs-applied config, vendor reference(s), and trigger result**;
6. handling **explicit failure versus unknown trigger state** safely.

It does **not** interpret the conversation, normalize final outcomes, validate the live cart after the call, or route work to ACOM — those are Blocks 4–6.

> *Telephony note: the MVP runs on **Ring native telephony**. BYOT / Truemeds-owned telephony (DIDs, carriers, retry execution at the telephony layer) is the deferred **Telephony Control Plane** (PRD §7.3) — not part of this MVP. The retry policy described below stays Truemeds-owned regardless.*

### 6.2 Ownership state × trigger state are orthogonal dimensions
These are two independent axes and must be modelled as such:

- **Ownership axis** (Block 2): *do we still hold this lead?* — `BOT_OWNED_ACTIVE / BOT_OWNED_RELEASED / BOT_OWNED_EXPIRED / BOT_OWNED_FAILED / BOT_OWNED_CANCELLED`.
- **Trigger axis** (this block): *what happened to the call command we sent Ring?* — `RING_CALL_TRIGGER_PENDING / IN_FLIGHT / ACCEPTED / UNKNOWN / FAILED / CANCELLED` (§6.8).

A lead is routinely `BOT_OWNED_ACTIVE` **and** `RING_CALL_TRIGGER_ACCEPTED` at the same time. The trigger axis is **authoritative** for call-command status. Block 2 carries **no** trigger-flavoured ownership states (§5.4), keeping a single, consistent state model across blocks.

### 6.3 Entry preconditions
The block may run only when:

| Precondition | Requirement |
|---|---|
| Ownership | A committed ownership record exists in `BOT_OWNED_ACTIVE` |
| Attempt | A valid `bot_attempt_id` exists |
| Lead state | Lead is still active for bot handling |
| Kill-switch | Bot flow is enabled |
| Concurrency | Live-call concurrency is within the approved limit *(the Ring-concurrency gate; the Block 2 cap is on ownership — §6.3 note)* |
| Vendor config | Ring agent, script/version, caller-number setup, and webhook endpoint are configured |

> **Hard invariant (restated from Block 2 §5.8):** Ring must **not** be triggered unless bot ownership has been successfully committed.
>
> *[Concurrency note] The meaningful gate for Ring is **live-call concurrency at trigger** (this block); Block 2's concurrency cap is on **ownership**. These are two counters — do not double-count. The kill-switch (Ring concurrency → 0) is enforced here.*

### 6.4 Minimal pre-flight re-check
This is **not** a second full eligibility evaluation or a latest-state validation (that is Block 5). It is a final safety check immediately before the irreversible act of calling a customer.

| Check | If failed |
|---|---|
| Ownership still `BOT_OWNED_ACTIVE` for this `bot_attempt_id` | Do not trigger; log ownership conflict |
| Order not already placed | Cancel ownership; suppress from bot flow |
| Cart not empty | Cancel ownership; suppress or retain for manual review |
| Customer not become DNC / non-callable | Cancel ownership; update suppression state |
| Lead not human-owned | Do not trigger; yield to human owner |
| Kill-switch / concurrency allow trigger | Hold in `PENDING` or release per Ops policy |

> *[Why this is not redundant with Block 2's acquisition re-check] A lead can **dwell** in `RING_CALL_TRIGGER_PENDING` (concurrency throttle, kill-switch, scheduled-time). State can move during that dwell, so we re-check at the last moment before dialling — the one action we cannot take back.*

### 6.5 Vendor payload finalization (allowlist)
Ring receives only a **versioned, approved allowlist** — never the full Truemeds lead-context snapshot by default (Block 1 §4.8 boundary applies). The concrete field set is the **configured projection of the §10 Signal Catalog** (§10.5), per campaign × use-case × script-version + mandatory correlation.

| Payload group | MVP treatment |
|---|---|
| Call destination | Customer mobile in E.164 |
| Customer context | Name + preferred language, if approved and available (Ring `smart_formatter` may extract/transliterate the name) |
| Ring configuration | `agent_id`, agent/version where supported, caller-number / number-pool config |
| Truemeds correlation | `lead_id`, `order_id`, `bot_attempt_id`, payload version, campaign/source tag — via Ring `custom_args_values` |
| Call control | webhook endpoint, `call_time` window, `call_retry_config` (§6.6) |
| Optional conversation context | Only approved cart/commercial summary — never assumed current at later routing time |
| Internal-only (never sent) | DNC/suppression history, internal risk flags, raw patient/clinical data, internal scores |

**Correlation fields** carried in `custom_args_values` (or equivalent vendor metadata): `lead_id`, `order_id`, `bot_attempt_id`, `eligibility_version`, `lead_context_snapshot_id`, `vendor_payload_version`, `campaign_tag`. These must return in vendor webhooks or be recoverable via the call record (confirm — §6.16 Q4).

### 6.6 Retry policy — Truemeds-owned, vendor-executed, guardrailed
**Principle (locked):** *Retry policy is Truemeds-owned, versioned, and stored internally. The vendor adapter translates the selected policy into Ring-supported `call_retry_config` for each call. Ring executes the configured retry mechanics; Truemeds remains the source of truth for policy, ownership, audit, reconciliation, and routing.* No permanent value (e.g. "1 retry" / "15 minutes") is hardcoded in the core architecture.

**Confirmed Ring capability** (per the Ring API — see Appendix A.2): the individual-call endpoint accepts `call_config.call_retry_config` with `retry_count`, and **per-reason delays** `retry_busy`, `retry_not_picked`, `retry_failed` (minutes; vendor default 30 each), plus a `call_time` window `{start, end, timezone}`. So retry count and per-reason delays are configurable on every call. *(Distinct from the assistant-level "Retry Call" toggle, which is voicemail-only — do not conflate.)*

**Configurable ≠ unbounded — retry-policy guardrails.** Every retry policy is a versioned object validated against these guardrails before the adapter may translate it into `call_retry_config`:

| Guardrail | Definition / MVP stance |
|---|---|
| Permitted retry reasons | Allowlist; MVP = `NOT_PICKED`, `LINE_BUSY`, pre-engagement technical failure only (no engaged-outcome retries) |
| Maximum vendor retry count | Hard ceiling on `retry_count` regardless of configured value |
| Maximum total retry horizon | Hard ceiling on wall-clock time from first dial to last retry (bounds ownership) |
| Permitted retry-delay range | Min/max on `retry_busy` / `retry_not_picked` / `retry_failed` |
| Permitted calling window | Must reference the **same DND/calling-window source of truth as the Block 1 eligibility gate** (§4.3) — retries cannot fire outside permitted hours; the two windows must not drift |
| Vendor-managed scheduled callbacks | **Disabled for MVP** — see below |
| Manual-pool release policy | When/whether a lead partially returns to manual handling after a threshold (ties to lease, §6.10) |
| Policy version | Every applied policy carries a version, persisted in the attempt ledger (§6.9) |

**MVP callback stance.** Vendor-managed *future/scheduled callbacks* remain **disabled** in MVP. A customer who requests a later callback is **not** handed to Ring to re-schedule — the lead returns to **Truemeds-controlled handling** and is routed as a fresh callback. *(The routing execution of callback-requested customers is Block 4/6; §6.6 only fixes the policy flag.)*

**Retry is pre-engagement only** — aligned to the BRD conversation flow (Appendix A.1). A Ring retry is a retry of the **same bot attempt**, not a new Truemeds lead attempt, and is **non-terminal**: ownership remains `BOT_OWNED_ACTIVE` through the configured horizon and webhook grace.

| Condition | Maps to | Retry? |
|---|---|---|
| Not picked / no answer | `NOT_PICKED` (telephony, pre-pickup) | Yes → `retry_not_picked` |
| Line busy / engaged tone | `LINE_BUSY` (telephony, pre-pickup) | Yes → `retry_busy` |
| Technical failure before conversation | call `failed`/`error` pre-engagement | Yes → `retry_failed` |
| Picked up but says "busy now" | `BUSY_DECLINED` (BRD *BUSY CLOSING* branch — engagement) | No |
| Customer engages and declines | engaged outcome | No |
| Customer requests later callback | engaged outcome | No |
| Original-cart / substitute / discount branch reached | engaged outcome | No |
| Wrong number | engaged/identified | No |
| Customer opts out during call | DNC | No |

> *[Platform note] `LINE_BUSY`/`NOT_PICKED` (telephony, no pickup) is the opposite of `BUSY_DECLINED` (the BRD *BUSY CLOSING* branch — the customer answered and said they're busy). Only the former are retryable. Confirm with Ring exactly which call statuses distinguish these (§6.16 Q7).*

### 6.7 Trigger command contract
The command goes through the current Ring call-initiation API, **wrapped behind the Truemeds vendor adapter**, which isolates Ring-specific request/response fields from the Truemeds lifecycle.

Minimum command attributes: vendor agent/flow id · customer number · caller-number/number-pool config · `bot_attempt_id` (primary Truemeds correlation key) · custom args (correlation passthrough) · webhook URL · `call_retry_config` (applied policy) · script/version id · call-category/campaign tag.

> **Acceptance ≠ connection.** A successful Ring API response means **Ring accepted the command** and returns a `call_id`. It does **not** mean the customer was called, answered, engaged, or qualified.

### 6.8 Trigger states

| State | Meaning |
|---|---|
| `RING_CALL_TRIGGER_PENDING` | Ownership committed; command not yet sent |
| `RING_CALL_TRIGGER_IN_FLIGHT` | Command dispatched; response not yet known |
| `RING_CALL_TRIGGER_ACCEPTED` | Ring accepted and returned a usable `call_id` |
| `RING_CALL_TRIGGER_UNKNOWN` | Cannot determine whether Ring accepted the command |
| `RING_CALL_TRIGGER_FAILED` | Ring explicitly rejected, or a confirmed failure occurred |
| `RING_CALL_TRIGGER_CANCELLED` | Pre-flight failed before dispatch |

### 6.9 Attempt ledger (Truemeds source of truth)
On acceptance, persist the vendor reference **immediately**. The `bot_attempt_id → ring_call_id[]` mapping is **one-to-many** until Ring confirms whether the same `call_id` persists across retries or a new one is created per retry (§6.16 Q9).

For every `bot_attempt_id`, Truemeds keeps its **own complete attempt ledger**, so the full journey can be reconstructed **without relying on Ring's dashboard/history**:

- **requested retry policy + policy version**;
- **Ring configuration actually sent / applied** (`call_retry_config` as dispatched);
- calculated **initial retry horizon / lease**;
- **`ring_call_id[]`** (one-to-many until confirmed) (+ `ring_request_id`, `ring_agent_id`, `ring_version_id` where available);
- **every event** — trigger, retry, lifecycle event, webhook receipt, reconciliation pull, and cancellation (with timestamps and reason codes);
- **raw payload reference** (immutable store);
- **normalized internal outcome** (populated in Block 4);
- **ownership start, extension, release, cancellation — and the reason** for each;
- **final latest-state validation result** (reference; populated by Block 5).

> *[Data-ownership principle] Ring dashboard/history is **supporting tooling only** — never Truemeds' source of truth for RCA, funnel analysis, or vendor comparison. Requested-vs-applied is deliberate: if Ring silently clamps or defaults a value, the diff between *requested* and *sent* is what explains behaviour later.*

### 6.10 Lease derivation & event-driven refresh (authoritative for Block 2 §5.4)
The initial `BOT_OWNED` lease is **derived from the applied retry policy and the expected call lifecycle**, including: initial call duration, retry delays, maximum call duration, permitted call window / scheduled time, analysis completion, webhook grace, and reconciliation grace. The lease is then **refreshed/extended from Ring lifecycle events** (e.g. `call_started`, retry-scheduled, analysis-complete). Ownership is **released only** after a terminal outcome, explicit cancellation, or reconciliation confirming **no active or scheduled vendor attempt** remains.

> *[Why not a static arithmetic TTL] `retry_count × max(delay) + grace` can expire while a retry, post-call analysis, or a scheduled call is still legitimately active — orphaning a lead Ring is still working. Derive-then-refresh-from-events avoids both premature release and indefinite holding (the `max-ownership cap` bounds the latter).*

### 6.11 Trigger response & error handling

| Scenario | Meaning | Handling |
|---|---|---|
| Explicit acceptance + `call_id` | Ring accepted | Persist mapping → `ACCEPTED` |
| Explicit validation rejection (4xx) | Not accepted | `FAILED`; release/route per Block 2 |
| Auth/config error (401) | Integration unsafe | `FAILED`; alert; do **not** retry blindly |
| Vendor 5xx | May or may not have been accepted | `UNKNOWN`; reconcile before retry |
| Network timeout after dispatch | Acceptance unknown | `UNKNOWN`; reconcile before retry |
| Failure before request leaves our service | Ring not called | `FAILED`; safe to retry/release per policy |
| Duplicate command detected | Same `bot_attempt_id` already accepted/in-flight | Do not create another Ring call |

> **Critical rule.** Never send a second Ring trigger merely because we did not receive a response. First **reconcile** whether Ring already accepted or created the call (§6.12).

### 6.12 Reconciliation for unknown trigger state
Reuses the **Block 2 §5.6 reconciliation sweep** (one mechanism, not a second). On `UNKNOWN`: (1) check whether a `call_started`/other webhook has already arrived for this `bot_attempt_id`; (2) query **Get Call Details / Get Call History** using correlation fields (esp. `ring_call_id` where known, custom args where supported); (3) decide created-or-not **before** retrying or releasing; (4) record the reconciliation result + reason. If Ring cannot be queried reliably, retry behaviour must be **conservative** to avoid duplicate calls.

### 6.13 Narrow cancellation
When customer/order state invalidates an active or scheduled Ring attempt (e.g. order placed mid-retry-window), use the **narrowest available vendor termination** — ideally **Terminate by `ring_call_id`** (Ring's Terminate API stops calls in `registered`/`retry` status). **Agent-level bulk termination is an outage / kill-switch control, not the normal per-lead cancellation path.**

### 6.14 Vendor outcome contract (inputs required for Block 4)
Block 3 fixes **what we require Ring to return**; the **mapping/fallback/routing lives in Block 4**. Ring need not use Truemeds' internal status names — its statuses, classifications, callback fields, retry data, transcript, and summary are vendor **inputs** that Block 4 normalizes through a versioned layer.

Minimum expected vendor inputs: stable vendor `call_id` (required) · call lifecycle status (required) · retry status + count (required when retry enabled) · structured classification/disposition for approved branches (subject to Ring config) · callback-requested flag + time where the branch exists · in-call opt-out / DNC signal (required) · script/agent version (required) · transcript + summary (supporting evidence) · webhook delivery + call-history lookup (required for reconciliation).

> *[Moved to Block 4] The fallback hierarchy (structured classification → lifecycle/retry metadata → Truemeds mapping → transcript/summary → manual) and the **route-to-`MANUAL_VALIDATION`-when-ambiguous** rule are normalization/routing decisions and are specified in Block 4, not here.*

### 6.15 Events to log
| Event | When |
|---|---|
| `ring_trigger_preflight_passed` | Minimal re-check succeeds |
| `ring_trigger_preflight_failed` | Minimal re-check fails |
| `ring_call_trigger_requested` | Command ready for dispatch |
| `ring_call_trigger_in_flight` | Command sent to Ring |
| `ring_call_trigger_accepted` | Ring accepts + returns reference |
| `ring_call_trigger_failed` | Confirmed trigger failure |
| `ring_call_trigger_unknown` | Timeout / uncertain acceptance |
| `ring_call_trigger_reconciled` | Unknown state resolved via webhook/history |
| `ring_call_trigger_duplicate_blocked` | Duplicate trigger prevented |
| `ring_retry_window_started` | A Ring retry is pending |
| `ring_retry_window_completed` | Retry horizon ends |
| `ring_call_cancelled` | Narrow cancellation issued (by `ring_call_id`) |

Every event carries `lead_id`, `order_id`, `bot_attempt_id`, relevant Ring reference, timestamp, reason code, payload/version identifiers, and source system. *(Naming convention: events `lower_snake_case`; states `UPPER_SNAKE_CASE`.)*

### 6.16 Engineering / Ring AI open questions
*Items marked **[Resolved — API]** were confirmed from the Ring API docs during this pass; the rest are for the Ring technical team.*

1. Which Ring endpoint for MVP — individual call vs number-pool variant — and number-pool vs specific caller-number selection? *(Both exist — `POST /calling/outbound/individual` and a number-pool v2; choice is open.)*
2. Native idempotency key? **[Resolved — API: none documented]** → Truemeds enforces idempotency (reconcile-before-retrigger); confirm Ring has no hidden support.
3. Guaranteed immediate call reference? **[Resolved — API: `call_id` in the init response `data.call_id`].**
4. Will Ring return Truemeds `custom_args_values` unchanged in **every** relevant webhook and call-history response? *(Response echoes them; webhook confirm pending.)*
5. Can Ring configure structured branch-level classifications for the approved BRD flow?
6. Can Ring return in-call opt-out and callback request/time as explicit machine-readable fields?
7. Exact statuses that distinguish `NOT_PICKED`, `LINE_BUSY`, and pre-conversation technical failure (the `retry_*` reasons imply Ring tracks them).
8. Retry config per call + independent per-reason delays? **[Resolved — API: yes, `call_retry_config{retry_count, retry_busy, retry_not_picked, retry_failed}`].**
9. Does the same `ring_call_id` persist across retries, or a new id per retry? *(`retry` is a status of the same call → likely same id; confirm. Mapping kept one-to-many until then.)*
10. What event marks the **final terminal result** after a retry sequence — and **does Ring emit an event per retry attempt** (needed for lease-refresh + per-attempt data capture) or only a terminal event?
11. History/detail endpoint for reconciliation? **[Resolved — API: Get Call Details (by `call_id`) + Get Call History].**
12. Webhook retry, signing/auth, delivery-SLA? **[Partially resolved — API: initial + 3 retries at 10s/1m/2m, 30s timeout, then stops; data still via API. Signing/auth TBD].**
13. Can a scheduled/retrying attempt be cancelled via API if customer state goes invalid? **[Resolved — API: yes, Terminate by call-id / numbers / campaign / agent].**
14. How are Truemeds DIDs / number-pool routing configured for MVP? *(Depends on M1B telephony discovery; Ring supports BYO telephony/Twilio/Plivo/Exotel.)*
15. Can agent/script version be pinned per attempt for audit and controlled experimentation?

### 6.17 Exit criteria (Block 3)
- A committed bot-owned lead can be sent to Ring **through the vendor adapter** (Ring specifics isolated).
- **Minimal pre-flight** prevents stale/invalid trigger commands.
- Ring receives only **approved, versioned** payload fields (allowlist).
- The **Truemeds-owned retry policy** is applied via `call_retry_config` — versioned, configurable, **not hardcoded**.
- Ring **acceptance is distinguished** from actual call connection/outcome.
- `bot_attempt_id ↔ ring_call_id[]` and **requested-vs-applied config** are persistently mapped (full attempt journey reconstructable without Ring's dashboard).
- The **lease is derived + event-refreshed** (§6.10), authoritative for Block 2 §5.4.
- **Explicit failures and unknown trigger states** are handled without blind duplicate calls; **narrow cancellation** is the per-lead path.
- Vendor outcome **inputs** required for Block 4 normalization are contractually identified.
- All trigger and retry-window **events** are logged and traceable.

---

## 7. Block 4: OUTCOME_RECEIVED + NORMALIZED

### 7.1 Purpose
Receive Ring lifecycle and post-call outcome information, store the raw vendor evidence, correlate it to the right `bot_attempt_id`, deduplicate/reconcile asynchronous events, and produce a **Truemeds-owned normalized outcome** for Block 5.

Block 4 does **not** perform latest-state validation, release/assign work to ACOM, execute callback routing, make any medical/substitution/pricing/order decision, or infer a business outcome from transcript where structured evidence is missing or ambiguous. Those belong to later blocks.

### 7.2 Core principle — who produces what
**Ring does the qualification intelligence; Truemeds does deterministic mapping, lifecycle control, and safe routing.** Truemeds is *not* re-deriving the outcome from the transcript — Ring returns a structured disposition; we map it.

```
Ring lifecycle fields
  -> contactability outcome

Ring configured classification + client analysis (structured signals / score)
  -> conversation outcome / structured signals

Truemeds mapping + versioned tiering rule
  -> normalized outcome + engagement tier + next-action candidate

Transcript / summary
  -> audit, QA, RCA, and exceptional manual-review evidence only
```

Two consequences that shape the whole block:
- **Contactability vs conversation come from different parts of the payload.** "Not connected / busy / voicemail" come from Ring **call-lifecycle fields** (`status`, `sub_status`, `retry_count`) — there is no analysis for a call that never connected. "Interested / declined / callback / wrong number" come from Ring **analysis** (`platform_analysis.classification`, `client_analysis`). This is why `call_outcome` and `conversation_outcome` are separate fields, not one enum.
- **Engagement tier is Truemeds-derived, not Ring-returned.** Ring emits the configured classification and structured signals/score; Truemeds derives the final `engagement_tier` (`HOT/WARM/COLD/UNDETERMINED`) from those fields via a **versioned rule**. We do not depend on Ring returning our Hot/Warm/Cold labels directly — this retains vendor portability and lets us tune thresholds independently.

### 7.3 Event ingestion contract
Ring sends six event types *(quarantined to the adapter; internal names are vendor-neutral)*:

| Ring event | Internal (vendor-neutral) | Role in Block 4 |
|---|---|---|
| `call_started` | `vendor_call_started` | Liveness/progress only |
| `call_completed` (`status` = completed/failed/**retry**) | `vendor_call_attempt_finished` | Progress; **terminal normalization path for no-connect/failed** |
| `recording_completed` | `vendor_recording_ready` | Store recording ref |
| `platform_analysis_completed` | `vendor_platform_analysis_ready` | Structured disposition (if connected) |
| `client_analysis_completed` | `vendor_client_analysis_ready` | Truemeds-configured structured signals/score |
| `all_processing_completed` | `vendor_all_processing_complete` | **Preferred normalization trigger for connected/completed calls** (consolidated) |

**Normalization triggers (dual path).**
- **Connected/completed call → prefer `all_processing_completed`** (carries `status` + `platform_analysis` + `client_analysis` + transcript + recording in one payload). Earlier events are liveness only, so out-of-order/missing earlier events do not block normalization.
- **No-connect / failed call → `call_completed` (terminal) is the normalization path** — don't wait for analysis that will never arrive.
- **Connected call without usable final analysis → `OUTCOME_ANALYSIS_PENDING` → reconciliation → `OUTCOME_UNAVAILABLE` or `MANUAL_VALIDATION_REQUIRED`.**

**"Was there a usable conversation?" predicate** (decides which path): connected ≈ `status = completed` **and** (`user_message_count > 0` or `call_duration` ≥ a configured floor) **and not** `sub_status = VOICEMAIL_DETECTED`. Otherwise treat as no-connect.

**Receipt vs processing.** Return a fast `2xx` after authenticating + persisting the raw event; do all normalization **asynchronously** off the stored event. Ring redelivers on non-2xx (initial + 3 retries at 10s/1m/2m, 30s timeout — Appendix A.2), so the endpoint must be idempotent.

**Authentication.** Ring offers **no HMAC signature**; auth is a **shared bearer/secret header** we configure in the subscription (echoed back by Ring) over HTTPS, optionally behind a gateway. *(This refines PRD §13's "HMAC/shared secret" — Ring supports shared-secret header only.)*

**Dedupe.** Uniqueness key = **`(call_id, event_type, retry_count)`** (+ a vendor event ID **if** Ring provides one — confirm). Do **not** put the payload hash in the key (a trivially-different redelivery would falsely look new → double-processing). Instead store `payload_hash`, `received_ts`, `delivery_count`, `schema_version` as **audit fields**; if the same key arrives with a different hash, **supersede-not-duplicate** and raise an `outcome_event_divergence` alert.

**Out-of-order / invalid / uncorrelated.** Out-of-order tolerated by normalizing off the consolidated event. Invalid-schema or uncorrelated payloads are stored in a **quarantine/dead-letter** with a reason, acked `2xx` (so Ring doesn't pointlessly retry), and surfaced for reconciliation — never silently dropped, never guessed.

### 7.4 Correlation model
Primary key is `bot_attempt_id`, carried in Ring `custom_args_values` (which echoes in **every** event — confirmed in the payloads). Hierarchy:

```
bot_attempt_id  ->  lead_id  ->  order_id  ->  ring call_id  ->  vendor event (call_id, event_type, retry_count)
```

- `custom_args_values` carrying `bot_attempt_id` is **mandatory by our convention** on every trigger (set in Block 3); we treat its absence as a defect, not a normal case.
- **Fallback if custom args absent:** correlate via `ring call_id` → the Block 3 attempt ledger; if still unresolved, quarantine for reconciliation.
- **Zero-match:** quarantine + `outcome_event_uncorrelated` alert; never fabricate a mapping.
- **Multi-match:** never auto-resolve; route to reconciliation/manual.
- **`call_id` reuse across retries:** the model `bot_attempt_id -> ring_call_id[]` tolerates either behaviour (same `call_id` with incrementing `retry_count`, or a new id per attempt) — confirm Ring's actual behaviour (open Q).

### 7.5 Raw event + outcome ledger
Per inbound event, persist: raw payload (or immutable payload reference), `received_ts`, vendor event type, vendor event ID (if any), `ring call_id`, `bot_attempt_id`/`lead_id`/`order_id`, processing status, dedupe key, `payload_hash`, `delivery_count`, mapping/normalization version, processing error/retry metadata.

**Retention classes** (durations are a **policy/compliance dependency — not set here**):
- **Structured event ledger** (the system of record for funnel/RCA/audit) — longest, queryable.
- **Transcript / summary** — retained per policy; supporting evidence only.
- **Recording URL/reference** — store the **reference**; recording bytes retained per NDA/policy (PRD §13).
- **Raw payload archive** — immutable, retained per policy.

*(Forward-compat: "call-transport facts come from the **telephony source** — MVP: Ring's webhook; future: the Telephony Gateway." Keeps the deferred BYOT track additive.)*

### 7.6 Outcome taxonomy (separated fields, not one routing enum)
- **`call_outcome`** (from lifecycle): `NOT_PICKED` · `LINE_BUSY` · `FAILED_PRE_CONVERSATION` · `SESSION_FAILED` · `CONNECTED` · `UNKNOWN_INCOMPLETE`.
- **`call_sub_outcome`** (descriptive slot): e.g. `VOICEMAIL_DETECTED` (machine answered → kept under `NOT_PICKED` for now), failure sub-reasons. *Voicemail is **not** a routing-grade outcome until business decides its action.*
- **`conversation_outcome`** (only if `CONNECTED`; from analysis): `INTERESTED` · `CALLBACK_REQUESTED` · `DECLINED` · `BUSY_DECLINED` (answered-then-busy ≠ `LINE_BUSY`) · `WRONG_NUMBER` · `OPT_OUT_DNC` · `HUMAN_REQUESTED` · `ABANDONED_INCOMPLETE` · `AMBIGUOUS`.
- **`conversation_context`** (non-authoritative colour): `ORIGINAL_CART_CONTINUATION` · `SUBSTITUTE_INTEREST` · `PRICE_DISCOUNT_CONCERN` · `NOT_DECISION_READY` · `NO_RELIABLE_CART_INTENT`.
- **`engagement_tier`** (Truemeds-derived via versioned rule from Ring's classification/score): `HOT` · `WARM` · `COLD` · `UNDETERMINED`. Carries **provenance + confidence + tiering-rule version**.
- **`normalized_outcome`** (routing-grade contract Block 5/6 key off — **= PRD §14.2**): `CONNECTED` (with `engagement_tier` carried separately, above) · `CALLBACK_REQUESTED` · `NOT_CONNECTED` · `WRONG_NUMBER` · `INVALID_NUMBER` · `DO_NOT_CALL` · `VENDOR_FAILED` · `ANALYSIS_PENDING` · `MANUAL_VALIDATION_REQUIRED`.
- **`next_action_candidate`** (a *recommendation*, never the decision): `ROUTE_HOT` · `ROUTE_WARM` · `CALLBACK` · `RETRY_CANDIDATE` · `SUPPRESS_CANDIDATE` · `MANUAL_VALIDATION`. **Block 6 makes the final routing decision after Block 5 validation.**

This mirrors PRD §14.2; routing keys off `(normalized_outcome × engagement_tier × validation_status)`.

### 7.7 Structured-classification-first normalization + `MANUAL_VALIDATION_REQUIRED`
Order of evidence (each step only if the prior is missing/ambiguous):

```
structured Ring classification + client_analysis signals
  -> Ring lifecycle / retry metadata
  -> Truemeds mapping rules (+ versioned tiering)
  -> transcript / summary as SUPPORTING evidence only
  -> MANUAL_VALIDATION_REQUIRED if still ambiguous
```

**Transcript/summary is never the sole primary basis** for an irreversible route, suppression, retry, or business decision.

**`MANUAL_VALIDATION_REQUIRED` criteria:** a connected call where (a) no usable structured classification arrived after the grace window, or (b) `platform_analysis_status`/`client_analysis_status` = failed, or (c) structured signals conflict with each other, or (d) the classification maps to no known Truemeds outcome.

**Mapping artifact.** Ring's `classification` is a free-form, per-agent-configured label; Truemeds maintains a **versioned mapping table** (Ring label → Truemeds taxonomy) aligned to the Appendix A.1 branches. The label vocabulary is **config we own + align with Ring** (not a Ring-shipped enum).

### 7.8 Terminality & analysis-pending model
The block distinguishes: **call-transport terminal** (lifecycle says the attempt ended) from **outcome final** (we have a usable normalized result). A connected call can be transport-terminal but analysis-pending.

- **Analysis grace window = configurable policy (not hardcoded).** While within grace and connected-without-analysis → `OUTCOME_ANALYSIS_PENDING`; do **not** prematurely release/retry/suppress/route.
- **On grace expiry → reconcile** (§7.10) → resolve to `OUTCOME_NORMALIZED`, `OUTCOME_UNAVAILABLE`, or `MANUAL_VALIDATION_REQUIRED`.
- **Terminal-state mismatch** (e.g. transport terminal but conflicting analysis, or analysis without a transport terminal) → `OUTCOME_RECONCILIATION_REQUIRED`.
- **If Ring never returns a usable classification:** after grace + reconciliation → `OUTCOME_UNAVAILABLE` → `MANUAL_VALIDATION_REQUIRED` (never guessed).

### 7.9 In-call DNC, callback, wrong-number, human-requested
- **DNC / opt-out is authoritative and immediate.** On an opt-out signal, write Truemeds **contact-preference** (blocks future bot **+ manual + campaign** calling) and **narrow-cancel** any scheduled/in-flight retry (Block 3 §6.13) — do **not** wait for transcript/summary.
  - *Ring reality:* Ring's documented webhooks surface opt-out **only in post-call analysis** — there is **no documented real-time mid-call opt-out event**. So MVP processes opt-out the instant the analysis event lands; a real-time signal is a **Ring feature request** (deferred), logged as a risk.
  - *DNC asymmetry carve-out:* under-suppressing (missing a real "stop calling") is worse than over-suppressing. So for opt-out **only**, a transcript-detected opt-out without a structured field still triggers **suppress-pending / manual-review** — it is never ignored. This is a narrow, deliberate exception to the "transcript never sole basis" rule (§7.7).
- **Callback request** is **not** a vendor-scheduled callback in MVP — it becomes a **Truemeds-owned next-action candidate** (`CALLBACK`), routed by Block 6.
- **Wrong number** must **not** be treated as a generic decline — it maps to `WRONG_NUMBER` (data-quality flag), distinct from `INVALID_NUMBER` (structurally invalid, from Block 1).
- **Human requested / transfer intent** → captured as `HUMAN_REQUESTED`; in the async MVP this becomes a priority callback candidate (live transfer is M2b).

### 7.10 Reconciliation
**One mechanism — reuses the Block 2 §5.6 reconciliation sweep**, not a second parallel system. Covers: no webhook after an accepted trigger; webhook arrived without classification; unknown trigger state (Block 3 §6.12); conflicting Ring events; delayed analysis past grace; duplicate events. The sweep queries Ring **Get Call Details / Get Call History** to resolve, records the result + reason, and is **retry-safe/idempotent** (re-running never double-applies an outcome).

### 7.11 Outcome-processing state model (orthogonal axis)
Block 4 introduces **only** an outcome-processing axis — vendor-neutral, no overlap with ownership (Block 2) or trigger (Block 3):

| State | Meaning | Hand to Block 5? |
|---|---|---|
| `OUTCOME_AWAITING` | Call live/retrying; no terminal evidence yet | No |
| `OUTCOME_ANALYSIS_PENDING` | Transport terminal; analysis not yet received (within grace) | No |
| `OUTCOME_NORMALIZED` | Terminal + usable normalized result produced | **Yes** |
| `OUTCOME_AMBIGUOUS` | Terminal + analysis received but inconclusive → `MANUAL_VALIDATION_REQUIRED` | **Yes** |
| `OUTCOME_UNAVAILABLE` | Terminal; analysis failed / never usable after grace | **Yes** (→ manual/suppress per policy) |
| `OUTCOME_RECONCILIATION_REQUIRED` | Missing/conflicting evidence; reconciliation in progress | No |

Axes stay orthogonal: ownership `BOT_OWNED_*` (Block 2) × trigger `RING_CALL_TRIGGER_*` (Block 3) × outcome `OUTCOME_*` (Block 4).

### 7.12 Events, observability & metrics
**Events (vendor-neutral):** `outcome_event_received`, `outcome_event_deduplicated`, `outcome_event_divergence`, `outcome_event_uncorrelated`, `outcome_analysis_pending`, `outcome_normalized`, `outcome_ambiguous`, `outcome_unavailable`, `outcome_reconciliation_started/resolved`, `dnc_opt_out_recorded`, `callback_request_captured`, `wrong_number_flagged`. Each carries `bot_attempt_id`, `lead_id`, `order_id`, ring `call_id`, event type, `received_ts`, reason code, mapping/normalization version, source.

**Dashboard fields & funnel cuts:** trigger-accepted → ringing/connected → analysis-received → normalized; webhook latency & failure rate; **classification coverage** (% connected calls with usable structured classification); **ambiguity / manual-validation rate**; DNC-detection rate; callback-request rate; wrong-number rate; vendor-vs-Truemeds reconciliation **mismatch rate**; outcome distribution **by script/agent version and campaign**.

**Alert conditions:** rising `OUTCOME_UNAVAILABLE`/manual-validation rate; analysis-pending breaching grace; reconciliation backlog; divergence/uncorrelated spikes; webhook delivery failures.

### 7.13 Edge cases
| Case | Handling |
|---|---|
| Customer places order during call | Detected at Block 5 latest-state (not here); Block 4 just normalizes the call outcome |
| Customer changes cart during call | Same — surfaced by Block 5 diff |
| Customer contacts human support while Ring call active | Capture `HUMAN_REQUESTED`; dedupe against any human-side action downstream |
| Ring webhook arrives after ownership expiry/cancellation | Still ingest + normalize for the ledger; routing suppressed by Block 5/6 (lead no longer owned) |
| Opt-out arrives after a retry already scheduled | DNC write + **narrow-cancel** the scheduled/in-flight retry immediately |
| Structured classification conflicts with transcript/summary | Structured wins; if structured itself is inconclusive → `MANUAL_VALIDATION_REQUIRED` (never let transcript override) |
| Customer says both "call me later" **and** "do not call again" | **DNC takes precedence** over callback — suppress, do not schedule callback |
| Missing customer/order refs in vendor payload | Fallback correlation via `call_id` → ledger; else quarantine |
| Ring webhook schema version changes | `schema_version` recorded per event; mapping is versioned; unknown schema → quarantine + alert |

### 7.14 Open questions
**Ring confirmations** *(low severity; default-safe assumptions hold if unanswered):*
- Is there a per-delivery unique **event ID**? (else logical key stands)
- Does the same `call_id` **persist across retries** (with `retry_count` incrementing)?
- Webhook **ordering** guarantees? (we assume none)
- Is `callback_requested` reliably emitted per the callback branch?

**Truemeds config tasks** *(we own; documented Ring capability — not blockers):*
- Configure agent **analysis classification vocabulary** aligned to Appendix A.1 (incl. wrong-number, opt-out).
- Configure **`client_analysis`** to emit our structured signals/score for the tiering rule.
- Maintain the versioned **Ring-label → Truemeds-taxonomy mapping**.
- Set the **analysis grace window** and the **conversation-predicate floor** as config.

**Ring feature request** *(deferred; not MVP-critical):*
- A **real-time mid-call structured opt-out** event/signal (today opt-out is post-call only).

### 7.15 Exit criteria (Block 4)
- Every inbound Ring event is **authenticated, idempotently deduped, correlated to `bot_attempt_id`, and persisted raw** (with quarantine for invalid/uncorrelated).
- Connected calls normalize off `all_processing_completed`; no-connect/failed off `call_completed`; analysis-pending handled within a **configurable grace** then reconciled.
- A **Truemeds-owned normalized result** is produced — `call_outcome`(+sub) / `conversation_outcome` / `conversation_context` / **Truemeds-derived `engagement_tier` (versioned)** / `normalized_outcome` / `next_action_candidate` — **structured-classification-first, transcript evidence-only**.
- **DNC is immediate + authoritative** (with the asymmetry carve-out); callback is a Truemeds next-action; wrong-number ≠ decline.
- Ambiguous/unavailable outcomes resolve to **`MANUAL_VALIDATION_REQUIRED`**, never guessed.
- Reconciliation **reuses the Block 2 sweep**; outcome events are emitted and traceable.
- A normalized result is handed to **Block 5 (LATEST_STATE_VALIDATED)** only on `OUTCOME_NORMALIZED/AMBIGUOUS/UNAVAILABLE`; Block 4 never validates live state or routes.

---

## 8. Block 5: LATEST_STATE_VALIDATED

### 8.1 Purpose & non-goals
Before Truemeds acts on a normalized Ring outcome, **re-fetch the live order/cart/customer state, compare it to the Block 1 validation baseline (§4.7), and produce a structured actionability verdict** for Block 6.

Block 5 does **not**: reinterpret Ring's outcome (Block 4), pick a queue, schedule retries or re-checks, execute routing/suppression (Block 6), or **write** any contact-preference/DNC — it is **read-only** on live state. It introduces one new orthogonal axis: the **validation axis** (`validation_status`), independent of ownership (`BOT_OWNED_*`), trigger (`RING_CALL_TRIGGER_*`), and outcome (`OUTCOME_*`).

### 8.2 Entry filter & tiered validation
Not every Block 4 result needs a full cart re-fetch:

- **Light validation (always, cheap)** for any path that could lead to action: live DNC, order-placed, cart-nonempty, human-owned.
- **Full validation (canonical-snapshot diff)** only for outcomes that **may create a human action** — `CONNECTED` × tier, `CALLBACK_REQUESTED`.
- **Terminal non-actionable Block 4 outcomes** (`DO_NOT_CALL`, `WRONG_NUMBER`, `INVALID_NUMBER`, `VENDOR_FAILED`) → pass straight to Block 6 (no live cart re-fetch; an optional light DNC/placed check only).
- **Retry candidates** (`NOT_CONNECTED` to be retried) → rely on the **Block 3 §6.4 pre-trigger validation**, *not* a repeated full Block 5 pass. One mechanism, no duplication.

### 8.3 Canonical validation snapshot
Block 5 captures the **same canonical schema** as the Block 1 §4.7 baseline so the diff is field-for-field. Every field is **nullable** and stamped `{value, source, as_of}` (Block 1 may not have had all of them):

`order_status` · `cart_revision` · `item_qty_hash` · `cart_nonempty` · `address_id` · `payment_state` · `payable_total` · `rx_workflow_state` · `assignment_owner` · `dnc_state` · `serviceability/inventory` *(the deferred Block 1 re-checks, where flagged)* · `snapshot_version`.

**Critical fields** (unavailable → `VALIDATION_INDETERMINATE`): `order_status`, `cart_nonempty`, `dnc_state`. **Non-critical** (unavailable → proceed, flag degraded): e.g. `payable_total`, serviceability.

### 8.4 Decision precedence & material-change rules
**Resolve `validation_status` in this strict order — first match wins.** Each terminal check is **gated on its own field's availability**: if the field it needs is unavailable, that check is *skipped*, and we only fall to `VALIDATION_INDETERMINATE` if what remains can't be determined.

| # | Condition (only if its fields are available) | `validation_status` | Reason |
|---|---|---|---|
| 1 | Live DNC / fresh opt-out | `NOT_ACTIONABLE` | `DNC` |
| 2 | Order placed / cart empty / manual closure | `NOT_ACTIONABLE` | `PLACED` · `CART_EMPTY` · `CLOSED` |
| 3 | **Active** human ownership / manual hold (`assignment_owner` is a *current* human handler ≠ this bot attempt) | `NOT_ACTIONABLE` | `HUMAN_OWNED` |
| 4 | Critical field unavailable **or** authoritative sources genuinely conflict | `VALIDATION_INDETERMINATE` | `SOURCE_UNAVAILABLE` · `STATE_CONFLICT` |
| 5 | Active checkout / payment initiated-or-pending (temporary) | `DEFERRED` | `CHECKOUT_ACTIVE` · `PAYMENT_PENDING` |
| 6 | Recoverable material change since baseline (cart/qty/price/address; Rx-context surfaced as a diff) | `ACTIONABLE_CHANGED` | the material diffs |
| 7 | None of the above | `ACTIONABLE_UNCHANGED` | — |

Supporting rules:
- **"Material" is config (policy-versioned), not hardcoded:** `item_qty_hash` mismatch = material; `payable_total` change beyond `X% or ₹Y` = material; `address_id` change = material; below threshold → treat as unchanged.
- **Null-baseline rule:** a field that was *null at baseline* and is *now known* (`null → value`, e.g. address newly added, serviceability newly resolved) is **"newly observed," not automatically a material change** — distinct from `value → different value`. This stops the missing-address collect-flow from falsely flagging `ACTIONABLE_CHANGED`.
- **Rx-review is context, not a verdict:** `rx_workflow_state` changes surface as a diff under `ACTIONABLE_CHANGED`; whether that means alternate routing, manual, or defer is **Block 6's** call — Block 5 does not auto-`DEFERRED` it.
- **Multiple terminal reasons:** if several terminal conditions hold (e.g. DNC *and* placed), the result is `NOT_ACTIONABLE` and the **highest-precedence reason (DNC) is recorded as primary**, the rest listed.
- **Genuine conflict (for #4):** e.g. the order service reports *placed* while the cart service still returns an *active* cart — not the benign `incomplete + empty-cart` case (that's simply `NOT_ACTIONABLE`/`CART_EMPTY`).
- **`HUMAN_OWNED` means *active*:** a current human ownership/manual-hold signal — **not a stale historical human touch.** A past human interaction that has since ended does not block the bot path.

### 8.5 Validation outcomes

| `validation_status` | Meaning | What Block 6 does next |
|---|---|---|
| `ACTIONABLE_UNCHANGED` | Recoverable, materially unchanged | Route per (outcome × tier) |
| `ACTIONABLE_CHANGED` | Recoverable, but materially changed since the bot interaction | Route per (outcome × tier × diffs) — often manual-validation / agent-warn |
| `DEFERRED` | Temporarily not actionable (checkout/payment in flight) | Re-queue / hold per policy (+ max-defer / give-up) |
| `NOT_ACTIONABLE` | No valid recovery (placed / empty / DNC / human-owned / closure) | Suppress |
| `VALIDATION_INDETERMINATE` | Cannot safely determine (critical source down / conflicting state) | Manual review (`manual_reason_source = block5`) |

### 8.6 Re-runnability
Async routing introduces delay, so Block 5 is a **re-runnable function, invoked at least twice**: once at **routing time** (to produce the verdict Block 6 acts on) and again at **agent pickup / screen-pop** (V1 emphasis — the agent sees the latest truth). The **latest VAR supersedes**; records are timestamp-versioned. A `VALIDATION_INDETERMINATE`/`DEFERRED` at routing may resolve to actionable at pickup, and vice-versa.

### 8.7 Source-availability handling
- **Critical field unavailable** (`order_status`/`cart_nonempty`/`dnc_state`) → `VALIDATION_INDETERMINATE` (don't guess).
- **Non-critical unavailable** → proceed with what's available, mark the field `degraded` in the VAR, and let Block 6 weigh it.
- **Authoritative-source conflict** → `VALIDATION_INDETERMINATE` with `STATE_CONFLICT` + the conflicting values, for reconciliation/manual review.

### 8.8 Validated Actionability Record (VAR) — handoff to Block 6
- `bot_attempt_id`, `lead_id`, `order_id`
- carried from Block 4: `normalized_outcome`, `engagement_tier`, `next_action_candidate`, callback preference (if any)
- `validation_status` (the five) + `validation_reason_codes` (primary + others) + `manual_reason_source` (`block4` | `block5`)
- `material_diffs` (field, before → after) when `ACTIONABLE_CHANGED`
- `defer_reason` when `DEFERRED`
- `degraded_fields` (non-critical unavailable)
- `baseline_snapshot_ref` + `live_snapshot_ref`, **each with its `as_of`** (`baseline_as_of`, `live_as_of`) so staleness is explicit downstream
- `validated_at`, `validation_policy_version`

**Block 6 owns the decision**: it maps **(normalized_outcome × engagement_tier × validation_status)** to a queue / suppress / defer-handling. Block 5 states actionability only.

### 8.9 Edge cases & the residual concurrency limit
| Case | Handling |
|---|---|
| Order placed via another channel since the call | `order_status=placed` → `NOT_ACTIONABLE` (`PLACED`) |
| Cart emptied since handoff | `cart_nonempty=false` → `NOT_ACTIONABLE` (`CART_EMPTY`) |
| Fresh DNC from another channel | `NOT_ACTIONABLE` (`DNC`) — Block 5 reads it; the write happened upstream |
| Cart changed *and* payment pending | Precedence: `DEFERRED` wins over `ACTIONABLE_CHANGED` (can't act now anyway) |
| Cart changed *and* placed | `NOT_ACTIONABLE` (`PLACED`) — terminal beats change |
| Validation at pickup differs from routing | Latest VAR supersedes; agent acts on the freshest |
| Critical source down at routing, up at pickup | `VALIDATION_INDETERMINATE` → re-run resolves it |

> **Residual limitation (honest):** Block 5 **reduces but does not eliminate** the customer-vs-agent cart race — the customer can place/edit *during* the agent's action, after the pickup re-run. The residual is the open **§15.1 cart-concurrency** question; Block 5 mitigates via the pickup re-run + order-placed detection, it doesn't fully solve it.

### 8.10 Events to log
`latest_state_validation_started` · `latest_state_validated` (with `validation_status`, reasons, diff summary) · `validation_source_degraded` · `validation_state_conflict` · `validation_indeterminate` · `validation_rerun_at_pickup` (with prior→new status). Each carries `bot_attempt_id`, `lead_id`, `order_id`, `validated_at`, `validation_policy_version`, source.

### 8.11 Engineering open questions
- **§4.7 reconcile:** align the baseline to the canonical snapshot schema (nullable, stamped).
- **Per-field source availability & latency** for the live re-fetch (must meet the screen-pop latency budget — PRD NFR §13).
- **Material thresholds** (`payable` %/₹, what counts as a material Rx-context change) — config defaults.
- **Cart concurrency (§15.1):** does the agent edit + customer edit collide today, and how (lock / last-write-wins / conflict)? Determines how hard `ACTIONABLE_CHANGED` vs `DEFERRED` should be at pickup.
- **Pickup re-run mechanism:** is validation invoked by the agent-portal screen-pop, the router, or both?

### 8.12 Exit criteria (Block 5)
- For actionable candidates, live state is **re-fetched and diffed** against the §4.7 baseline using the canonical snapshot.
- `validation_status` is resolved by the **strict precedence** (safety/terminal facts before indeterminate), with config material-thresholds, null-baseline handling, and per-field availability gating.
- A **VAR** (status + reasons + diffs + snapshot refs + policy version + timestamp) is handed to Block 6; Block 5 never routes, suppresses, retries, or writes DNC.
- Validation is **re-runnable** (routing + pickup); the latest VAR supersedes.
- Critical-source-down / conflicting state → `VALIDATION_INDETERMINATE` (never guessed); the residual cart-concurrency race is acknowledged (§15.1).

---

## 9. Block 6: ASYNC_ROUTE_EXECUTED (M2a)

### 9.1 Purpose & non-goals
Block 6 is the **execution half of M2a**: it consumes the latest Validated Actionability Record (VAR) from Block 5 and converts it into **one auditable operational action** — create an async human task, schedule a callback, defer for revalidation, route for manual review, suppress/close, or take no human action.

Block 6 **owns:** VAR → Routing Decision; lead-class, **lead-category** & priority assignment; placing the lead in the pull queue; idempotent async task/callback creation; suppression/closure; the pickup-time re-check; routing audit/events/metrics. *(Agent-side fallback across categories is resolved at pull time — §9.8 — not pre-computed per lead.)*

Block 6 **does not:** reinterpret the Ring outcome or engagement tier (Block 4); re-run full latest-state validation (Block 5); execute bot retries (Block 3); handle live transfer (M2b); make any medicine/Rx/substitution/clinical decision; or route Rx/workflow changes to specialist pools (not in MVP). It introduces one orthogonal axis: the **routing axis** (`ROUTE_*`).

> **Organising principle:** **engagement tier controls *urgency*; validation status controls *whether a human action can exist at all*.** Everything in 9.5 follows from this.

### 9.2 Inputs
The **latest VAR only** (a newer VAR supersedes an older one — §8.6): attempt/order/lead refs · `normalized_outcome` · `engagement_tier` · `next_action_candidate` · `validation_status` + reasons + `material_diffs` · callback preference · baseline/live snapshot refs + `baseline_as_of`/`live_as_of` · relevant policy versions.

### 9.3 Output — the Routing Decision
A versioned, auditable record (lead-side):
`routing_decision_id` · `bot_attempt_id`, `lead_id`, `order_id` · `lead_class` · `lead_category` · `priority` · `waiting_since` · callback metadata (`eligible_at`, requested time/source, expiry) · `execution_mode = ASYNC_TASK` · `action_type` · `routing_reason_codes` · `routing_policy_version` · `created_at`.

The Routing Decision describes the **lead**; it carries no agent or fallback fields — fallback is an **agent-config** concern resolved at pull time (§9.8).

> Designed **reusable for M2b**: for live transfer only `execution_mode` changes (→ a live-transfer mode) and live availability/reservation is added — lead class, lead category, priority, and audit reasons carry over. No M2b mechanics here (9.12).

### 9.4 Action types
`CREATE_HUMAN_TASK` · `SCHEDULE_CALLBACK` · `DEFER_REVALIDATION` · `ROUTE_MANUAL_REVIEW` · `SUPPRESS_AND_CLOSE` · `NO_ACTION`.

### 9.5 Base action policy
*(Tier sets urgency; validation status gates whether action can exist. All thresholds are config / policy-versioned.)*

| Validation status | Tier / signal | Action | Lead class |
|---|---|---|---|
| `ACTIONABLE_UNCHANGED` | HOT, or explicit human-request | `CREATE_HUMAN_TASK` (high priority) | `PRIORITY` |
| `ACTIONABLE_UNCHANGED` | WARM | `CREATE_HUMAN_TASK` (standard) | `STANDARD` |
| `ACTIONABLE_CHANGED` | HOT / WARM | `CREATE_HUMAN_TASK` **+ "changed after bot interaction" indicator + refreshed live context** | `PRIORITY` / `STANDARD` (by tier) |
| `ACTIONABLE_UNCHANGED`/`CHANGED` | COLD / declined / low-intent | `NO_ACTION` or `SUPPRESS_AND_CLOSE` + cooldown (config) | — |
| any actionable | explicit **callback request** | `SCHEDULE_CALLBACK` (`eligible_at`, calling-window) | `PRIORITY` (callback due) |
| `DEFERRED` | any | `DEFER_REVALIDATION` (no outreach) | `EXCEPTION` |
| `VALIDATION_INDETERMINATE` | any | `ROUTE_MANUAL_REVIEW` (no outreach) | `EXCEPTION` |
| `NOT_ACTIONABLE` | any | `SUPPRESS_AND_CLOSE` | — |
| `NOT_CONNECTED` (retries pending) | any | `NO_ACTION` — retry owned by Block 3, not Block 6 | — |
| `NOT_CONNECTED` (retries exhausted) | any | **Default `SUPPRESS_AND_CLOSE` + cooldown reason.** Human fallback only if **policy-enabled and still actionable** (and passes the Block 5 light re-check first) | — / `STANDARD` (only if policy-enabled) |
| `VENDOR_FAILED` / `DO_NOT_CALL` / `WRONG_NUMBER` / `INVALID_NUMBER` | any | `SUPPRESS_AND_CLOSE` (or evidence-only for retry where applicable) | — |

**`ACTIONABLE_CHANGED` stays a normal ACOM task** (same agent path) with a clear changed-indicator + refreshed context + a revalidation flag — it is **not** dumped into Exception/manual-validation by default. Rx/workflow state is **context only**; deeper consultation/review happens later in the existing downstream journey.

### 9.6 MVP lead classes & the category model

**Three terms, kept distinct:**
- **Lead category** — how a *lead* is bucketed for pull allocation (the queue it sits in).
- **Agent base category** — an *agent's* stable Ops/reporting/quality designation (does not change with demand).
- **Agent eligible categories** — which *lead categories* an agent may pull (base + approved fallback).

**Lead classes (configurable):**
- **`PRIORITY`** — hot intent, explicit human request, callback due, or a configured high-value threshold.
- **`STANDARD`** — warm, recoverable, actionable.

These two are the **pull-queue classes** agents draw from via "Assign Order."

**`EXCEPTION` is *not* a normal pull queue.** It is a label for cases handled **outside** the agent pull flow:
- `DEFERRED` → a **timed revalidation/defer lane** (re-run Block 5 later); no immediate outreach, agents don't pull these.
- `VALIDATION_INDETERMINATE` → a **manual-review lane**; not in the normal pull queue.

AOV **may contribute** to PRIORITY but is **not the sole determinant** — callback commitments, explicit human request, and wait/SLA urgency may outrank it. A normal `ACTIONABLE_CHANGED` lead remains a regular `PRIORITY`/`STANDARD` ACOM task (by tier) with refreshed context + a changed indicator — it does **not** drop into EXCEPTION.

### 9.7 Agent model — *pull-based, list-view allocation*
The MVP agent workflow is **list-view / pull-based**: when an agent clicks **"Assign Order,"** the system returns the **best unclaimed lead the logged-in agent is eligible to handle.** There is **no** requirement for real-time availability feeds, workload telemetry, queue-occupancy, demand-pressure logic, ACD matching, ETA, or forecasting — the click itself is the availability signal.

**One-time agent configuration** (set by Ops, stable):

```
agent_id
base_category            # stable Ops/reporting/quality designation; not demand-driven
eligible_lead_categories[]   # lead categories this agent may pull (base + approved fallback)
active_flag
optional_max_open_tasks  # simple soft cap on concurrent open tasks
```

`base_category` never changes dynamically; there is **no promotion/demotion** and **no specialist Rx category** in the MVP. "Pool" is just an optional configuration abstraction over `base_category` + `eligible_lead_categories` — **not** a live availability/workload integration.

### 9.8 Allocation & fallback (pull-based, not a marketplace)
On an "Assign Order" request:

1. Identify the **logged-in agent** and their **approved lead categories**.
2. Find the **highest-priority unclaimed lead** in the agent's **base category**.
3. If none, search the agent's **approved fallback categories** (`eligible_lead_categories`).
4. Within an eligible category, **rank leads** by: **callback due / committed callback time → configured business priority → oldest waiting lead.**
5. **Atomically claim and assign** the selected lead.
6. Return **"No order available"** when no eligible unclaimed lead exists.

This prevents both **high-value leads waiting while an eligible agent is idle** and **an agent idle only because their base category is momentarily empty** — without any live-availability engine. It is configurable category routing with cross-category fallback, **not** a dynamic optimiser, demand-pressure scoring, capacity-reservation, ML affinity, or forecasting (all out of MVP).

**The only critical runtime dependency is the atomic human claim** — reuse the **compare-and-set / ownership discipline from Block 2** so two agents clicking simultaneously can't claim the same lead. After claim, the **Block 5 light re-check** runs at pickup (§9.10).

**Hard eligibility (minimum):** agent `active_flag` true · under `optional_max_open_tasks` · lead category ∈ `eligible_lead_categories` · no same-order/same-customer conflict · language/capability only where applicable and available.

### 9.9 Idempotency & routing state
**Idempotent route key:** `bot_attempt_id + action_type + route_generation`. `route_generation` increments only when the actionable plan **materially** changes (e.g. a real callback reschedule) — so retries of the same plan never create duplicate tasks.

**Routing axis** (orthogonal to ownership/trigger/outcome/validation):
- `ROUTE_NOT_REQUIRED` · `ROUTE_PENDING` · `ROUTE_SCHEDULED` (callback `eligible_at`)
- **`ROUTE_QUEUED`** — eligible/unclaimed in the Priority or Standard pull list
- **`ROUTE_ACCEPTED`** — atomically claimed by an agent on "Assign Order"
- `ROUTE_COMPLETED` · `ROUTE_CANCELLED` · `ROUTE_FAILED` · `ROUTE_SUPPRESSED`

### 9.10 Task contract & pickup-time guard
**Agent task carries:** order/cart ref · contact ref · lead class, priority, assigned/target pool · `normalized_outcome` + tier · callback details (if any) · latest `validation_status` + `live_as_of` · material-change indicator + latest relevant context · structured conversation reason/summary · revalidation requirement. *(Raw transcript/recording stay QA/audit artifacts, not default agent workflow.)*

**At pickup/open — reuse the Block 5 light re-check** (not a new engine): valid → proceed · changed → refresh task / warn · not-actionable → auto-close · indeterminate → hold/manual per policy. This is the same re-runnable Block 5 validation invoked at pickup (§8.6).

### 9.11 Callback, suppression, failures, events
- **Callback** = the same task type with `eligible_at`, requested time/source, and expiry; **re-check (Block 5) before the callback action**; Truemeds-owned (not vendor-scheduled).
- **Suppression/closure reasons:** placed · DNC · empty cart · human-owned · declined · stale · policy-suppressed.
- **Failure recovery:** task-creation failure is **idempotently retried** on the route key — never double-create.
- **Events/metrics:** `route_decided`, `route_queued`, `route_claimed` (agent accept), `route_fallback_category_used`, `route_pickup_revalidated`, `route_task_autoclosed`, `route_suppressed`, `route_failed`; metrics for cross-category-fallback rate, **eligible leads waiting while eligible agents pull "No order available"** (the twin-failure signal), SLA/callback adherence, conversion by **lead category × agent base category**, callback completion, duplicate-claim incidents.

### 9.12 M2b reuse boundary
M2a = Routing Decision → async CRM task/callback (pull-based). **M2b can reuse** lead class, lead category, eligible-category fallback, priority, and audit reasons — then adds **live availability/reservation + telephony transfer** (a different `execution_mode`). Those mechanics are **not** designed here.

### 9.13 Open questions, conflicts & exit criteria
**Engineering / Ops open questions (dependencies):**
- CRM support for **task idempotency, cancellation, scheduled eligibility, and atomic claim** (the one critical runtime dependency — reuses Block 2 compare-and-set).
- Actual **lead-category** definitions and **agent category configuration** (`base_category` + `eligible_lead_categories`) — Ops-owned, one-time config (no live availability feed needed).
- **Policy ownership** for priority thresholds, fallback category order, callback SLA, cooldown, and the `NOT_CONNECTED`-exhausted human-fallback toggle.
- How `optional_max_open_tasks` is counted (simple open-task count, not a live workload feed).
- Callback operating constraints (calling-window, expiry).

**Exit criteria (Block 6):**
- The latest VAR is converted into **one idempotent, versioned Routing Decision**; a newer VAR supersedes.
- Action follows the matrix with **tier = urgency, validation = whether action can exist**; `ACTIONABLE_CHANGED` stays a normal task with a changed-indicator.
- Leads route **pull-based**: an agent's "Assign Order" returns the best unclaimed eligible lead by category + ranking (callback-due → priority → oldest), with **atomic claim** (Block 2 discipline) and cross-category fallback via `eligible_lead_categories` — no live-availability engine.
- **Pickup-time re-check reuses Block 5**; tasks auto-close when no longer actionable.
- Idempotency, `ROUTE_*` state, suppression reasons, and routing events are all emitted; nothing reinterprets outcome/tier, re-runs full validation, or handles retries/live transfer.

---

## 10. Signal Catalog

> **Disclaimer — read first.** The Signal Catalog is a **living inventory, not the MVP build contract. Inclusion in the catalog does not create a launch dependency.** The *only* launch-required set is the **MVP Minimum Signal Set (§10.4)** — roughly a dozen signals. Everything else is an enhancer or future work, switchable on later via config without re-engineering. Do not read the 14 groups as a 14-group data-platform build.

### 10.1 Purpose & how to read it
A **living, seed registry** of every signal ACOM may use across **eligibility, prioritisation, vendor (Ring) conversation payload, routing, analytics, and internal control** — one inventory, many consumers. It is **not** a permission/SOP document and **not** a claim that every signal ships immediately. Its job is to let Product + Engineering prioritise pragmatically.

Read it with three honesty rules:
- **Availability is `TO_VALIDATE` by default.** Nothing is marked `available` until confirmed against Truemeds systems. The catalog doubles as the **data-discovery / plumbing backlog**.
- **Prioritise by business impact × decision-criticality × reliability, *versus* engineering effort** — not by ease of sourcing alone. (A compliance gate is P0 even if the plumbing is hard.)
- **Governance is metadata, not the organising principle** — a one-word status, nothing heavier.

**Where the values actually live (runtime).** The catalog is a *dictionary*, not a data store — it holds definitions and rules, not a customer's cart total. At runtime there are **three layers**: (1) **this catalog** = definitions + config (on/off, exposure mode, freshness rule); (2) the **per-lead record / attempt ledger** = the actual signal *values* captured for one lead as it moves through the blocks (what blocks read and write); (3) the **source systems** (often other teams) = the truth, which we either **call on demand** or **subscribe to**, per each signal's source/freshness metadata. Volatile (`⟳`) signals are **re-read live at the decision point** (e.g. Block 5), never trusted from the stored copy. So nothing "syncs" the catalog in the background — each block fetches the values it needs, the way the catalog says to, and *how* each signal is sourced is engineering's to build.

### 10.2 Field schema & enums
Each signal carries (rendered tables show a decision-relevant subset; the rest are registry attributes — this is why the catalog wants to graduate to a maintained spreadsheet):

- `signal` · `definition / why it matters`
- `roles`: `eligibility · prioritisation · routing · analytics` (+ exposure mode below)
- **`exposure_mode`** (the key correction): `internal` · `operational_correlation` (needed to trigger/correlate the integration — e.g. `bot_attempt_id`, order ref, dial target) · `configurable_vendor_payload` (data Ring may use in conversation). *Operational-correlation fields are not configurable conversation payload.*
- **`direction`**: `IN` (captured before/at call — can feed eligibility/priority/payload) · `OUT` (produced by the call/outcome — analytics/routing only, **never** sent to Ring).
- `granularity`: customer / order / cart / SKU / call-attempt / queue.
- `trigger_timing`: eligibility / trigger / retry / outcome / routing.
- `volatility` + `snapshot_vs_live_required` + `refresh_trigger/cadence` + **`change_invalidates_payload / revalidation_required`** (ties volatile signals to Block 5).
- `availability`: available / derivable / unavailable / **unknown** · `readiness`: available-now / requires-validation / requires-new-plumbing / discovery-future.
- `phase`: **P0** (launch-critical, want confirmed) · **P0·TV** (launch-critical but availability to-validate) · **~P0** (near-P0, high-value validation) · **post** (post-MVP) · **disc** (discovery/future).
- `configurable` (yes/limited/no) · **`governance`**: `OPEN` · `REVIEW` (sign-off before external exposure) · `INT-ONLY` (hard floor — never exposed).
- `default_if_missing` · `authoritative_source` / `source_owner` · `data_quality` · `metric_or_experiment_enabled`.

Inline markers in the tables: `[OC]` operational-correlation · `[VP]` configurable-vendor-payload · `[INT]` internal · `‹OUT›` output signal · `⟳` volatile → **revalidate before action (Block 5)**.

### 10.2a How to read this catalog
Before the compact tables, here's what each attribute means in everyday terms:

- **Role** — what the signal is *used for*: deciding **who to call** (eligibility), **who to call first** (prioritisation), **where to send the lead** (routing), or **measuring** the funnel (analytics).
- **Exposure mode** — *where the signal is allowed to go*: `[OC]` plumbing needed to run/connect the call (e.g. IDs, dial number) — **not** conversation content; `[VP]` data Ring may actually use **in the conversation**; `[INT]` internal only, **never** leaves Truemeds.
- **Input vs Output** — **Input** = we know it *before/at* the call (can shape eligibility, priority, or what Ring says); **Output** (`‹OUT›`) = produced *by* the call/outcome (used for routing/analytics, **never** sent to Ring).
- **Readiness** — how ready the data is: *available now*, *needs validation*, *needs new plumbing*, or *discovery/future*.
- **Phase** — when we'd build it: **P0** (want at launch) · **`P0·TV`** (launch-critical *but availability still to-validate*) · **`~P0`** (near-P0, high value, not launch-blocking) · **post** (after MVP) · **disc** (discovery/future).
- **Governance** — exposure control: `OPEN` (free to use/configure) · `REVIEW` (needs a sign-off before going to the vendor) · `INT-ONLY` (hard floor — never exposed).
- **Revalidation / freshness (`⟳`)** — the value can go stale between snapshot and action, so it **must be re-checked at Block 5 before any human acts**.

The compact notation (`[OC]` / `[VP]` / `[INT]`, `P0·TV` / `~P0`, `⟳`) is used in the tables below for brevity.

### 10.3 The catalog

**G1 — Customer identity & trust** *(IN)*

| Signal | Why it matters | Roles · mode | Phase | Gov |
|---|---|---|---|---|
| First name / salutation | Greeting, personalisation | prio · [VP] | P0·TV | OPEN |
| Preferred language (+confidence/source, **fallback**) | Conversation setup, routing | route · [VP] | P0·TV | OPEN |
| First-ever Truemeds order | New-vs-known framing | prio, route, analytics | ~P0 | OPEN |
| Prior bot contact on same mobile | Fatigue/dedupe, prioritisation | elig, route, analytics | P0·TV | OPEN |
| Recent WhatsApp/SMS/payment-link comms + engagement | Channel context, avoid over-contact | prio, route, analytics | post | REVIEW |
| Shared-phone / duplicate-account indicator | Mis-targeting / trust risk | elig · [INT] | post | REVIEW |
| Active order count (same mobile) | Conflict / over-contact guard | elig, route · [INT] | ~P0 | OPEN |

**G2 — Contactability & call-history** *(IN)*

| Signal | Why it matters | Roles · mode | Phase | Gov |
|---|---|---|---|---|
| Valid mobile (E.164) | Dial-validity gate | elig · [OC] | P0 | OPEN |
| Dial target (phone) | Call origination | [OC] | P0 | OPEN |
| DNC / consent status | Hard gate | elig · [INT] | P0 | INT-ONLY |
| Calling-window / DND hours | Compliance gate | elig | P0 | OPEN |
| Frequency cap / cooldown | Over-call guardrail | elig | P0·TV | OPEN |
| Past attempts / connect history | Priority, fatigue | prio, analytics | post | OPEN |
| Best-time-to-call / responsiveness | Priority | prio | disc | OPEN |

**G3 — Journey-state & intent** *(IN)*

| Signal | Why it matters | Roles · mode | Phase | Gov |
|---|---|---|---|---|
| Order status (placed/incomplete) | Hard gate | elig | P0 | OPEN |
| Cart recency / drop age | Trigger + priority | elig, prio | P0 | OPEN |
| Drop stage (cart/address/payment) | Priority, routing, context | prio, route · [VP] | P0·TV | OPEN |
| Journey source / how-dropped | Analytics | analytics | disc | OPEN |
| Browse / intent signals | Priority | prio | disc | OPEN |

**G4 — Commercial / affordability / coupon / savings** *(IN)*

| Signal | Why it matters | Roles · mode | Phase | Gov |
|---|---|---|---|---|
| Cart total (MRP/SP) ⟳ | Price conversation, priority | prio · [VP] | P0·TV | OPEN |
| Discount % | Value proposition | prio · [VP] | **P0 if in approved script, else ~P0** | OPEN |
| Substitutable / generic savings | Strong recovery lever | prio, route · [VP] | ~P0 | REVIEW |
| Payable amount (net) ⟳ | Price reference | [VP] | post | REVIEW |
| Applied / eligible coupon | Offer context | [VP] | post | OPEN |
| TM Cash balance ⟳ | Incentive | prio · [VP] | post | OPEN |

**G5 — Payment state** *(IN)*

| Signal | Why it matters | Roles · mode | Phase | Gov |
|---|---|---|---|---|
| Payment mode selected | Context, routing | route, analytics · [VP] | P0·TV | OPEN |
| Payment initiated / failed / pending ⟳ | Why-dropped, recovery angle | elig, route · [VP] | P0·TV | OPEN |
| Failure reason bucket | Tailored recovery | route, analytics · [VP] | ~P0 | OPEN |
| Payment link generated/sent/opened/expired ⟳ | Nudge context, channel | route, analytics · [VP] | ~P0 | OPEN |
| COD selected / eligible | Offer COD path | route · [VP] | ~P0 | OPEN |
| Payment experiment assignment | Attribution | analytics | post | OPEN |
| Payment mismatch risk *(where available)* | Fraud / risk | route · [INT] | disc | REVIEW |

**G6 — Prescription / clinical guardrail** *(IN)* — *raw clinical content is a hard `INT-ONLY` floor; flags/states are guardrails, not bot decisions*

| Signal | Why it matters | Roles · mode | Phase | Gov |
|---|---|---|---|---|
| Rx-required flag | Conduct guardrail, routing | elig, route · [VP-guardrail] | P0 | REVIEW |
| Raw Rx / clinical content | — | [INT] (never) | P0-floor | INT-ONLY |
| Prescription upload status | Guardrail, routing | elig, route · [VP-status] | P0·TV | REVIEW |
| Verification / review state | Guardrail, routing | route · [INT] | P0·TV | REVIEW |
| Doctor/pharmacist review required/in-progress | Guardrail, routing | route · [INT] | P0·TV | REVIEW |
| Customer-action-pending vs internal-review-pending | Who-acts routing | route · [VP-framing] | P0·TV | REVIEW |
| Order blocked by Rx issue | Hard gate / route | elig, route | P0·TV | REVIEW |
| Chronic / refill indicator | Priority, personalisation | prio · [VP] | post | REVIEW |
| Substitution-eligible flag | Routing guardrail | route | post | REVIEW |
| Previous-medicine history | Personalisation | prio · [VP] | disc | REVIEW |
| Cold-chain / special-handling | Routing | route | disc | OPEN |

**G7 — Fulfilment / inventory / serviceability / delivery** *(IN)*

| Signal | Why it matters | Roles · mode | Phase | Gov |
|---|---|---|---|---|
| Address present (address_id) | Collect-address routing, soft gate | elig, route | P0 | OPEN |
| Serviceable pincode ⟳ | Fulfillability | elig, route | P0·TV | OPEN |
| Address completeness / quality | Routing | route, analytics | post | OPEN |
| In-stock / fulfillable ⟳ | Fulfillability | elig · [INT] | post | REVIEW |
| Delivery ETA ⟳ | Customer context | [VP] | post | REVIEW |
| Delivery SLA / promise | Context | [VP] | disc | REVIEW |

**G8 — Order/cart conflict & freshness** *(IN)* — *feeds Block 5 latest-state validation; all `⟳`*

| Signal | Why it matters | Roles · mode | Phase | Gov |
|---|---|---|---|---|
| Cart revision / version ⟳ | Conflict detection | elig, route · [INT] | P0 | OPEN |
| Cart update timestamp ⟳ | Staleness detection | elig, route · [INT] | P0 | OPEN |
| Cart changed after bot snapshot ⟳ | Stale-state safety | route · [INT] | P0 | OPEN |
| Order/payment completed after trigger ⟳ | Suppress | elig, route · [INT] | P0 | OPEN |
| Active checkout session ⟳ | Conflict guard | elig · [INT] | P0·TV | OPEN |
| Manual agent working the order ⟳ | Duplicate-work guard | elig, route · [INT] | P0·TV | OPEN |

**G9 — Customer value / repeat / assisted-conversion** *(IN)*

| Signal | Why it matters | Roles · mode | Phase | Gov |
|---|---|---|---|---|
| AOV / cart value | Priority | prio | ~P0 *(secondary)* | OPEN |
| Repeat purchaser / order count | Priority, routing | prio, route | post | OPEN |
| Past assisted-conversion responsiveness | Priority | prio | post | OPEN |
| LTV / customer tier | Priority, routing | prio, route | disc | OPEN |
| Churn / win-back score | Priority | prio | disc | OPEN |
| COD / RTO risk | Routing | route · [INT] | disc | REVIEW |

**G10 — Human-ops / queue / capacity / live-transfer** *(IN)* — *mostly M2b / telephony-control-plane → discovery; not MVP*

| Signal | Why it matters | Roles · mode | Phase | Gov |
|---|---|---|---|---|
| HA availability / queue capacity | Live-transfer admission | route | disc | OPEN |
| Live-transfer concurrency state | Admission control | route | disc | OPEN |
| Staffed-window status | Routing / config | route | disc | OPEN |
| Agent skill / language match | Routing | route | disc | OPEN |
| Callback-queue depth | Routing / SLA | route | disc | OPEN |

**G11 — Correlation, versioning, experimentation & flags** *(IN; mostly `[OC]`)*

| Signal | Why it matters | Roles · mode | Phase | Gov |
|---|---|---|---|---|
| `bot_attempt_id` | Master correlation key | [OC] | P0 | OPEN |
| Order reference | Correlation | [OC] | P0 | OPEN |
| Campaign / use-case tag | Scoping + attribution | analytics · [OC] | P0 | OPEN |
| eligibility_policy_version | Attribution | analytics · [OC] | P0 | OPEN |
| retry_policy_version | Attribution | analytics · [OC] | P0 | OPEN |
| payload / config version | Attribution | analytics · [OC] | P0 | OPEN |
| bot / agent script version (`version_id`) | Attribution | analytics · [OC] | P0 | OPEN |
| mapping / normalization version | Attribution | analytics · [OC] | P0 | OPEN |
| Feature-flag / kill-switch / concurrency state | Ops control | [OC], [INT] | P0·TV | OPEN |
| Experiment / variant assignment | A/B attribution | analytics | ~P0 | OPEN |

**G12 — Vendor-outcome, classification & reconciliation quality** *‹OUT› — produced by Block 4; never sent to Ring*

| Signal | Why it matters | Roles · mode | Phase | Gov |
|---|---|---|---|---|
| call_outcome / sub_outcome | Contactability result | route, analytics | P0 | OPEN |
| normalized_outcome | Routing contract | route, analytics | P0 | OPEN |
| engagement_tier (+provenance/confidence) | Routing | route, analytics | P0 | OPEN |
| Ring structured outcome payload (classification + client_analysis) | The disposition input we map | route, analytics | P0 | OPEN |
| Classification coverage / present | Quality | analytics | P0 | OPEN |
| Ambiguity / manual-validation flag | Safety routing | route, analytics | P0 | OPEN |
| Analysis status (success/failed) | Terminality | route, analytics | P0 | OPEN |
| Reconciliation mismatch | Ops quality | analytics · [INT] | post | OPEN |
| Transcript / recording availability | QA / RCA | analytics · [INT] | post | REVIEW |

**G13 — Closed-loop conversion & outcome-quality** *‹OUT/derived›*

| Signal | Why it matters | Roles · mode | Phase | Gov |
|---|---|---|---|---|
| Human accepted/rejected Ring outcome | Tier calibration | analytics | P0·TV | OPEN |
| Final human disposition | Truth label | route, analytics | P0·TV | OPEN |
| Order placed after Ring outcome | Conversion | analytics | P0 | OPEN |
| Order placed after HA contact | Assisted conversion | analytics | P0 | OPEN |
| Time to human contact | SLA | analytics | ~P0 | OPEN |
| Conversion by Ring tier | Tier validity | analytics | P0 | OPEN |
| False-hot / false-cold / missed-opportunity | Model + script quality | analytics | post | OPEN |

**G14 — Suppression / compliance / trust / contact-preference** *(IN)*

| Signal | Why it matters | Roles · mode | Phase | Gov |
|---|---|---|---|---|
| Contact-preference / post-call opt-out (DNC write) | Compliance, suppression | elig · [INT] | P0 | INT-ONLY |
| Suppression reason / state | Funnel, ops | analytics · [INT] | P0 | OPEN |
| Wrong-number flag | Data quality, suppression | route, analytics | P0·TV | OPEN |
| Consent recency / channel consent | Compliance | elig · [INT] | ~P0 | REVIEW |
| Complaint flag / history | Trust, suppression | elig · [INT] | disc | REVIEW |
| Spam / DID reputation | Trust *(control-plane)* | [INT] | disc | OPEN |

### 10.4 MVP Minimum Signal Set, P0 Enhancers & Post-MVP

Three layers, kept strictly distinct. **Usage class** per signal: **`[P]`** required in the Ring payload · **`[S]`** required only for internal safety / validation / operation / measurement · **`[U]`** merely useful for prioritisation/experimentation (**never** a launch dependency). *Availability for most is still `TO_VALIDATE`; this is what we need, each gated on a confirm.*

#### Layer 1 — MVP Minimum Signal Set *(the only launch-required set)*
The smallest set to place one safe, useful bot call and act on it correctly. **If a signal isn't here, it does not block launch.** Grouped under four reader-friendly headings (same items, same `[P]/[S]/[U]` meaning — a regrouping, not a scope change).

**1. Launch gates & control state** *(may we call, and is exactly one owner handling it?)*

| Signal | Class | Why it's minimum |
|---|---|---|
| DNC/consent · calling-window/DND · frequency/cooldown | [S] | don't-harm compliance floor |
| Order not-placed **and** cart-nonempty | [S] | don't call dead/converted carts |
| Bot ownership (`BOT_OWNED`) | [S] | no duplicate bot+human calling |

**2. Mandatory correlation & configuration metadata** *(run, connect, and attribute the attempt)*

| Signal | Class | Why it's minimum |
|---|---|---|
| `bot_attempt_id`, lead/order references | [S] | master correlation across the attempt |
| Dial target / valid mobile (E.164) | [S] | can't place the call without it |
| Campaign / use-case tag | [S] | scoping + attribution |
| Version stamps (payload/config/script/eligibility/retry/mapping) | [S] | reproducibility + A/B attribution |

**3. Minimum Ring conversation context** *(enough for a useful conversation)*

| Signal | Class | Why it's minimum |
|---|---|---|
| Cart item summary (SKU + qty) | [P] | conversation substance |
| Cart total | [P] | the price conversation |
| Rx-required guardrail flag | [P]-guardrail + [S] | bot defers Rx; raw clinical stays `INT-ONLY` |
| Customer name | [P] | **send when available; generic greeting fallback if missing** |
| Language / default-language handling | [P] | **launch-critical only if multi-language is enabled on day one; else default language** |

**4. Required outcome & validation data** *(capture the result and act safely)*

| Signal | Class | Why it's minimum |
|---|---|---|
| Ring lifecycle fields + structured classification / client analysis | [S] | the disposition we map |
| Callback / DNC result | [S] | authoritative contact-preference + next-action |
| Raw event reference + normalized outcome + engagement_tier + ambiguity flag | [S] | store evidence; route safely |
| Latest-state re-check before routing (current order/cart state) | [S] | never act on a stale snapshot (minimal Block 5) |

That's ~15 signals across four buckets — not 14 groups. *(Discount/savings is deliberately **not** here — it's a P0 Enhancer unless the approved launch script explicitly depends on it.)*

#### Layer 2 — P0 Enhancers *(high value if already available; must NOT delay MVP)*
Switch on when present; never gate launch on them: discount/savings *(only if the approved first script uses it)* · drop stage · cart recency/drop-age · payment state (mode + initiated/failed/pending) · richer conflict signals (cart revision + update timestamp, active-checkout, manual-agent-working) · prescription-workflow state (upload/verification/blocked) · prior-bot-contact · serviceable pincode · address present · AOV *(secondary)* · suppression reason · wrong-number · classification coverage · experiment/variant · closed-loop labels (order-placed-after-outcome / after-HA, conversion-by-tier) · time-to-human-contact.

#### Layer 3 — Post-MVP / Discovery *(source validation, new plumbing, or future platform)*
Payable amount · coupons · TM Cash · in-stock/live inventory · delivery ETA/SLA · prior-medicine history · chronic/refill · substitution-eligible · repeat/LTV/churn/RTO/propensity · comms-engagement history · reconciliation mismatch · transcript/recording retention · false-hot/cold · Group 10 human-ops/live-transfer capacity · DID reputation/spam · payment-mismatch risk · browse-intent · complaint history. *(Several are tied to M2b or the deferred Telephony Control Plane.)*

#### Explicitly deferred — NOT MVP dependencies
So engineering does not infer these as launch work: **discount/savings intelligence (unless the first script depends on it), payment intelligence, live inventory, delivery ETA, TM Cash, prior-medicine history, LTV/churn, advanced propensity, live-transfer capacity, and DID-reputation / control-plane signals.** None of these block launch.

### 10.5 The Ring payload is a configurable projection (not a global toggle)
> **The Ring conversation payload = the configured, approved subset of the Signal Catalog for a specific campaign × use-case × bot/script version, where `exposure_mode = configurable_vendor_payload`, `governance ≠ INT-ONLY`, and the field is switched on — plus the mandatory operational-correlation metadata.**

Consequences: different campaigns/use-cases/scripts expose different field sets; `[OC]` correlation fields are always attached and are *not* "conversation content"; `[INT]` fields are never projectable regardless of config; `‹OUT›` signals are outputs and never part of the payload. Per `bot_attempt_id` we log the **final selected payload field set, payload/config version, and bot/agent script version** (Block 3 ledger §6.9) — so every attempt is reconstructable and A/B-attributable.

### 10.6 Graduation rule
A signal moves `capture → REVIEW → OPEN/config`; its role set and phase can change over time (a captured analytics signal later promoted to payload or priority) **without re-engineering** — that configurability is the payoff. The catalog is expected to **grow continuously**; treat this section as the seed and migrate it to a maintained registry/spreadsheet as it expands.

---

## Sections still to be drafted

- **11. Events & observability · 12. Failure cases & fallback · 13. Open questions (Eng/Ops/Ring) · 14. MVP exit criteria.**

*M1B (live-transfer/telephony discovery) and M3 (config exposure) are referenced for dependencies only — not built in this MVP.*

---

## Appendix A — Current Ring AI Conversation SOP / BRD Flow Reference

*This is the **vendor / conversation-side SOP** from the BRD — **not** the Truemeds system-state lifecycle (that is the MVP lifecycle in Section 3 and the per-block design). Reference only.*

### A.1 Ring AI conversation flow (from the BRD)

*ASCII transcription of the BRD conversation flowchart, so it pastes directly into Confluence. Source visual: the BRD flowchart (also saved as `assets/ring_ai_conversation_sop_brd.png`).*

```
                                  START
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │ INTRODUCTION           │  greet + confirm customer name
                        └───────────┬───────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │ wrong number              │ busy / won't talk          │ engages
        ▼                           ▼                            ▼
┌──────────────────┐      ┌──────────────────┐       ┌────────────────────────────┐
│ WRONG-NUMBER     │      │ BUSY CLOSING     │       │ CONFIRM AVAILABILITY       │
│ CLOSING          │      │ "takes ~2 min"   │       │ mention meds already in    │
│ ask for right    │      │ agree? → proceed │       │ cart                       │
│ person's contact │      │ refuse? → close  │       └─────────────┬──────────────┘
│ → note, else end │      └──────────────────┘                     │
└──────────────────┘                              doesn't proceed ─┤ agrees to proceed
                                                                    ▼
                                                  ┌────────────────────────────────┐
                                                  │ IDENTIFY INTENT                │
                                                  │ price blocker, or something    │
                                                  │ else / wants more discount?    │
                                                  └───────┬───────────────┬────────┘
                                price is the problem      │               │  other / wants discount
                                                          ▼               ▼
                                          ┌──────────────────────────────────────────┐
                                          │ OBJECTION HANDLING                         │
                                          │ • offer cheaper substitute (same effect)   │
                                          │ • convince once → agrees? proceed          │
                                          │              └ no → convince once more      │
                                          │ • if special category → extra discount     │
                                          │   (criteria-based)                         │
                                          └───────────────────┬────────────────────────┘
                                                              ▼
                                                  ┌────────────────────────┐
                                                  │ CLOSING                │
                                                  └───┬─────────┬──────────┘
                  accepts substitute ────────────────┘         │         └──────────── keeps original cart
                          ▼                                     ▼                              ▼
              ┌───────────────────────┐         ┌───────────────────────────┐    ┌───────────────────────┐
              │ SUCCESSFUL            │         │ UNSUCCESSFUL              │    │ SUCCESSFUL            │
              │ → hand to human agent │         │ acknowledge concern,     │    │ → hand to human agent │
              │   (complete order)    │         │ close as NO SALE         │    │   (original cart)     │
              └───────────────────────┘         └───────────────────────────┘    └───────────────────────┘
```

*How conversation closings map to our normalized outcomes — illustrative; Truemeds consumes Ring via **normalized statuses**, not by hardcoding these branches:*
- Agrees to complete (substitute or original) → handed to a human → `CONNECTED` (HOT / WARM tier)
- Acknowledged but no sale → `CONNECTED` (COLD tier)
- Busy / wrong number / unreachable → `NOT_CONNECTED` / `INVALID_NUMBER` / `DO_NOT_CALL`

*MVP note: the BRD SOP shows the bot **transferring the live call** to a human. In the MVP the default is **async (M2a)** — a fresh callback; **live transfer is M2b (conditional)**, not part of the MVP build.*

> This flowchart represents the intended Ring AI conversation flow from the BRD/self-serve setup. It should be treated as a conversation SOP reference. Truemeds' system design should not depend on every branch being hardcoded internally. Truemeds should consume Ring outputs through normalized statuses and apply latest-state validation before routing or agent action.

> **Compliance.** Final bot script, substitute language, discount handling, special-category logic, and objection-handling copy require Product/Ops/Compliance approval before rollout. The bot must not provide medical advice, Rx validation, or substitution decisions.

### A.2 Three distinct "retry" behaviours — do not conflate

There are **three different things** called "retry" in this integration. They are independent and must be designed separately:

**1. BRD / current SOP reference behaviour (conversation-side).** As described in the BRD conversation SOP, Ring manages the call conversation and returns dispositions: not-connected → re-attempt; scheduled → hold until connected or max attempts; connected → terminal disposition (Hot/Warm/Cold); max attempts with no connect → no-connect terminal status. This is a *narrative reference*, not the contract we build to.

**2. Webhook delivery retry (event delivery).** *(Confirmed in the Ring API.)* If our webhook endpoint does not return HTTP 200 within 30s, Ring re-delivers the **event**: initial + 3 retries at **10s / 1 min / 2 min**, then delivery stops permanently (event data still retrievable via API). **This is the `≈4 attempts` figure** referenced earlier — it is about *event delivery*, **not** about how many times the customer is called.

**3. Outbound call retry (customer dialling).** *(Confirmed in the Ring API.)* Separately configurable **per call** via `call_config.call_retry_config`: `retry_count`, and per-reason delays `retry_busy` / `retry_not_picked` / `retry_failed` (minutes; vendor default 30 each), plus a `call_time` window. This is the retry that re-dials the customer, and it is **Truemeds-owned and vendor-translated** per Block 3 §6.6 — not the BRD's "≈4". The call object exposes a `retry` status (`registered → ongoing → retry → completed/failed/...`), and calls in `registered`/`retry` status can be cancelled via the Terminate API (Block 3 §6.13).

**Lease implication:** the BOT_OWNED lease is sized to the **outbound call retry horizon (3)** plus analysis + webhook-delivery grace **(2)**, derived and event-refreshed per Block 3 §6.10 — not to the BRD narrative (1). *(Note: the BRD's earlier "Ring pulls orders" framing is superseded by the PRD's Truemeds-owned orchestration — Truemeds initiates the call.)*
