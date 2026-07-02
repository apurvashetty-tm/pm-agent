# ACOM 2.0 — Voice-Bot Cart Recovery (PRD)

*(Ring AI as the first vendor)*

| | |
|---|---|
| **Document type** | Product Requirements Document — layered for a mixed (business + engineering) audience |
| **Companion doc** | [ACOM 2.0 — Ring AI MVP Engineering Walkthrough](https://truemeds.atlassian.net/wiki/spaces/PROD/pages/1839530030) — engineering-grade, per-block design (Blocks 1–6 + Signal Catalog) |
| **Author** | Apurva Shetty (Product) |
| **Status** | Draft v0.7 — reconciled with the engineering walkthrough (M1/M2a boundary, pull-based async allocation, `ACTIONABLE_CHANGED`/validation-status routing, Ring-derived tiering, policy/reliability-dependent launch gates, lifecycle §14.4) |
| **Last updated** | 19 June 2026 |
| **Reviewers** | Truemeds Engineering, Data/Analytics, ACOM Ops, Telephony/Ozonetel, Ring AI Tech Team |
| **Base context** | ACOM 2.0 BRD; PRD v0.1–v0.4; Ring AI API — [Initiate Individual Call](https://docs.ringg.ai/api-reference/endpoint/calling/initiate-individual-call); internal Doctor→HA live-transfer pattern (Ozonetel) |

*Open-question markers used below: **[DISCOVERY]** = needs an internal engineering answer; **[RINGG]** = needs a Ring AI answer; **[TELCO]** = needs an Ozonetel/telephony answer; **[OPS]** = a Product/Ops decision; **[ANALYTICS]** = a data input needed.*

---

## 1. Decision summary

**What we're building.** A scalable voice-bot layer that helps recover dropped/incomplete carts. The bot calls the customer, works out how interested they are, and the system routes the genuinely interested ones to a human agent who completes the order. **Ring AI is the first vendor** on this layer — but the layer is built so we're not locked to any one vendor. Truemeds' own order/cart data is always the source of truth; whatever we send the bot is just a *snapshot* for the conversation.

**The two ways a hot customer reaches a human:**
- **Live transfer** — if the customer is interested *right now* and a human is available, pass the live call straight to an agent. Best experience, but only when an agent is reliably available.
- **Async callback** — the safe default: the bot ends, and an agent calls the customer back shortly. Always available, and the fallback whenever live transfer can't happen.

**Milestones.** **M1** = build the core integration + run discovery on live transfer/telephony → **M2a** = validate + route to agents asynchronously (the committed baseline) + **M2b** = live transfer (only if discovery is green) → **M3** = operational controls for Ops. **The MVP is M1 + M2a (async); live transfer (M2b) is additive and never blocks or delays the MVP.**

**Explicitly not in V1:** the bot placing orders itself; a real-time "is this transferable?" check before transfer; a full multi-vendor platform; automatic telephony failover; a **Truemeds-owned telephony control plane** (the MVP runs on Ring AI's own telephony — see §7); a self-serve campaign builder.

**Key safety gates:** every bot result is re-checked against the latest Truemeds order state before a human acts; and live transfer is A/B tested against fast callback (on *delivered* orders) before it's scaled.

## 2. Problem & why now

### 2.1 The problem (the status quo and its cost)
The ACOM team today manually cold-calls every eligible dropped cart. That model is capacity-bound and expensive:

- Of ~17,000 eligible leads a month (those with patient + address on file), only ~10,000 are even attempted — **~40% are never called.** That's a standing pool of recoverable revenue we simply can't reach.
- **Conversion is low:** only ~5% of assigned leads convert (lead-assigned → order-placed, on the human-only baseline).
- **And it's expensive:** ~₹50L in total monthly cost (agent payroll + variable telephony/ops) produces ~20,000 placed orders — i.e. a cost-per-order (CPO) of ~₹250 (₹50L ÷ ~20,000).
- Connectivity is poor on the current telephony line (packet loss), which degrades conversations and burns agent time on calls that never connect well.

*(All baseline figures are per BRD/POC input — Ops/Analytics to verify.)*

**Why this is worth solving now.** A Ring AI proof-of-concept on ~1,300 real leads converted **~20% of bot-transferred leads vs ~5% on the human-only baseline** — a ~4× lift — while bot concurrency means we can finally attempt the whole eligible universe instead of 60% of it. So the prize is on both sides of the ledger: **more revenue** (broader, faster reach) and **lower cost** (fewer agent-hours per converted order). Commercials (per-call vs outcome-based) are still in negotiation and will be appended.

### 2.2 What a good solution must do
Attempt a far higher share of dropped carts; reduce day-on-day spillover; improve connectivity; stop wasting agent time on unreachable/low-intent customers; qualify intent with AI voice; route high-intent customers to the right human via live transfer or callback; keep order/cart correctness intact before any agent acts; reduce repeat calling and customer frustration; and stay future-compatible for more vendors, more telephony providers, and more automation later.

## 3. Product direction & scope

### 3.1 Direction
This is **not** a one-off Ring AI hookup — it's a reusable **voice-bot qualification-and-routing layer** for dropped-cart recovery, with Ring AI as the first vendor on it. The bot qualifies; humans convert. The layer is deliberately vendor-agnostic and telephony-agnostic so the first vendor is replaceable and we keep control of customer identity and orchestration.

### 3.2 In scope
The Ring AI integration and milestones M1–M3 needed for the layer to be integrated, operationalized, and scaled safely — **including live/async routing and the telephony/DID foundations** for live transfer.

### 3.3 Out of scope (active requirements)
- The bot placing/confirming orders itself — cart edits, address capture, coupons, SKU search (future-compatibility note only — Section 8).
- Real-time pre-transfer validation API (the synchronous "is this transferable?" check Ring makes *before* connecting) — **V2** (Section 5, M2b).
- Ring intelligence/context handoff *before* agent pickup (intent/summary/transcript pushed pre-pickup) — **V2**.
- A full multi-vendor *platform* — we build the **adapter + normalized outcomes in V1**; a second live vendor + vendor-selection/routing is deferred.
- Active multi-telephony **failover** — we build a provider-agnostic **integration boundary in V1**; automatic failover is deferred.
- Self-serve campaign-builder UI (M3 is backend/admin config only).
- Predictive/ACD-grade agent matching (a simple availability check is enough for V1).
- **Rx validation & substitution** — Rx validation, doctor consultation, and substitution decisions remain handled by existing post-placement/order workflows (a doctor calls if an Rx is required; an HA/pharmacist calls if substitution is possible). This layer may carry **Rx-related flags** for conduct and routing guardrails, but the bot does not perform Rx validation, give medical advice, or make substitution decisions.

### 3.4 Guiding principles
The standing tenets behind the design (the specific choices and their trade-offs are in the decision log, Section 6):

1. **Ring AI is a qualification + routing-trigger layer first** — it classifies intent and (where supported) initiates transfer; it does not transact.
2. **Truemeds order/cart/customer state is the source of truth**, always.
3. **The payload to the bot is a call-context snapshot, not final truth.**
4. **Every outcome passes latest-state validation** before agent action (at screen-pop in V1).
5. **No duplicate bot + human calling**, and no async assignment while a live transfer is in progress.
6. **Loose coupling to the vendor** — Ring-specific statuses/payloads isolated in an adapter.
7. **Loose coupling to the telephony provider** — provider/DID behind a boundary; caller identity kept internal where possible.
8. **Customer-backward** — prefer the path that respects the customer's live attention; never make CX worse with a failed transfer.
9. **Scale-safe from day one** — M1 is not a throwaway POC.
10. **Controlled configurability** — backend/admin rules first, not self-serve.
11. **Live transfer is proven before it is scaled** — A/B tested against priority callback before any scale-up.
12. **Healthcare conduct first** — the bot never gives medical advice, suggests substitutions, claims Rx/doctor approval, or guarantees delivery/stock (Section 8.1).

## 4. How it works

In plain terms, here's the journey for one dropped cart:

1. **Pick.** The system selects an eligible dropped cart (patient + address on file) and hands it to the bot, marking it "bot is handling this" so no human calls the same customer at the same time.
2. **Call & qualify.** The bot (Ring AI) calls the customer, has the conversation, and returns a structured read of intent; **Truemeds maps that into Hot, Warm, or Cold** (we derive the tier — Ring doesn't hand us those labels). Retries are **Truemeds-owned** (a versioned, guardrail-bounded policy the adapter applies, re-checking order/DNC/ownership state before each attempt) — not left to the vendor to decide.
3. **Bring back a clean result.** Ring reports the outcome back to us. We translate it into our *own* status names (so we're not tied to Ring's wording) and store it.
4. **Re-check the truth.** Before any human acts, we re-fetch the latest order/cart from Truemeds — because the cart could have changed, or the order could already be placed, since the bot started.
5. **Route to a human.**
   - If the customer is Hot and ready *now* and an agent is available → **live transfer** the call (M2b, if enabled).
   - Otherwise → **async callback**: assign the lead to an agent who calls back shortly (M2a — the MVP path).
6. **Human completes the order.** The agent sees the latest cart and, where available, bot context, and places the order. Anything needing a prescription or substitution flows into the existing normal post-order process (doctor/HA), which is outside this layer.

Cold, unreachable, invalid-number, and do-not-call outcomes are suppressed or retried per configurable rules, so agents only spend time where it counts.

## 5. Milestones & what each delivers

**The MVP is M1 + M2a (async).** M1 builds the plumbing and brings back each order's **normalized outcome + engagement tier** (Truemeds derives Hot/Warm/Cold from Ring's structured result); M2a validates the latest state and assigns the lead to an agent who makes a **fresh outbound callback**. That two-leg async flow is the shippable MVP. **Live transfer (M2b) is an additive enhancement** — it never replaces or delays the MVP, and proceeds only if M1B discovery is green; even then, async stays the mandatory fallback, so M2a is always built regardless.

> **Sequencing.** M2 is split: **M2a (async) is the committed baseline** that ships value regardless of telephony discovery; **M2b (live transfer) is conditional** on M1 discovery proving transfer + CLI/screen-pop are tractable. If M1 discovery reveals a large telecom/OMS/portal build, live transfer becomes its own milestone rather than overloading M2b; otherwise no separate live-transfer milestone is created.
>
> Cross-cutting *technical* requirements (idempotency, reconciliation, security, latency, observability, scalability) are gathered in **Section 13 (Non-Functional Requirements)** rather than repeated per milestone; the deeper design sits in **Section 14 (Technical design)**.

### M1 — Integration foundation (+ live-transfer & telephony discovery)

**Purpose.** Build the core integration so it is reliable, observable, reversible, and not coupled to Ring- or provider-specific details. Not a throwaway POC. M1 is organized as **M1A (build)** and **M1B (discovery / decision gates)** — the build scope is firm; the discovery gates decide whether M2b proceeds.

**Why this first.** Everything downstream (routing, live transfer, config, metrics) depends on being able to dispatch a call, get a reliable result back, and switch it off safely. Getting these foundations right in M1 is what stops the integration becoming a throwaway POC that needs re-building at scale.

#### M1 is a signal-aware lead lifecycle foundation — not just API plumbing

It creates the signal foundation for safe handoff, validation, routing, measurement, and future configurability. Core M1 lifecycle:

**ELIGIBLE → BOT_OWNED → NORMALIZE** — M1 ends at outcome normalization. *M1 produces the normalized outcome; **M2a** then performs latest-state validation and async routing/agent assignment. M1 does **not** perform latest-state validation (the fuller lifecycle is in Section 14).*

**Signal principle.** M1 captures the core lead signals and lifecycle events; M3 exposes selected captured signals as configurable rules, filters, throttles, priorities, suppressions, and routing controls. M1 is *not* a business-rule engine or a config UI — but it must avoid a thin hardcoded eligibility query that needs an Engineering change for every new business rule.

**M1 creates a reusable lead-context foundation.** In M1 the system should: (1) apply **launch gates** to decide whether a lead can enter the Ring AI flow; (2) capture **qualification / prioritization signals** where available; (3) store a **lead context snapshot** for audit, debugging, analytics, and future routing; (4) store a **validation baseline** to detect live cart/order changes after handoff; (5) send only the **safe vendor payload** subset to Ring AI; (6) keep **sensitive / internal-only signals** within Truemeds; (7) allow **future enrichment** without redesigning the integration.

These are deliberately different concepts — "can we call?", "should we prioritize?", "what do we store?", "what do we validate?", "what do we send to Ring?". Field-level design (per-signal source, availability, role, fallback) lives in the standalone **M1 Engineering Walkthrough**.

| Layer | Meaning | Examples |
|---|---|---|
| **Launch gates** | Must pass to enter the Ring AI flow | **Safety/dedup floor (hard):** valid mobile · cart not empty · order not already placed · not DNC · calling-window · not already assigned/bot-owned. **Policy/reliability-dependent (not universal hard gates):** `patient_id`, `address_id`, serviceable pincode, in-stock/fulfillable — gated only where the workflow requires it and the signal is reliable; otherwise captured and revalidated later (M2a) |
| **Qualification / prioritization** | Help decide which eligible leads to call first | AOV / cart value · cart recency · chronic/refill indicator · repeat customer · potential-savings signal · past responsiveness · drop stage · platform · city/pincode |
| **Lead context snapshot** | Stored at handoff for audit, debugging, traceability, analytics, later routing | customer / order / cart / address / payment context available at handoff |
| **Validation baseline** | Used after the bot outcome to detect material live cart/order changes | cart items · quantity · payable amount · address · payment preference · order status · Rx/order attributes |
| **Vendor payload** | Safe subset sent to Ring AI | customer name/phone + approved order/cart context needed for the call (Appendix C) |
| **Internal-only signals** | Used by Truemeds, not sent to the vendor | DNC · suppression history · internal risk flags · sensitive operational/customer signals |
| **Future enrichment** | Addable later without redesigning the integration | LTV · churn/win-back score · COD/RTO risk · propensity score · agent-skill match |

**Normalization is M1's job; routing is M2a's.** M1 receives the Ring outcome, stores the raw payload, normalizes it into a Truemeds outcome + engagement tier (`CONNECTED` + tier, `NOT_CONNECTED`, `WRONG_NUMBER`, `INVALID_NUMBER`, `DO_NOT_CALL`, `VENDOR_FAILED`, `ANALYSIS_PENDING`, `MANUAL_VALIDATION_REQUIRED` — full set in Section 14.2), stores it, and emits lifecycle events. **M2a** then consumes that normalized outcome plus latest-state validation to decide the route and assign the agent (the per-outcome action table lives under M2a).

**Launch gates are M1 policy decisions** based on technical availability, reliability, compliance, and Ops readiness. Over time the same signal may move between roles — hard gate → soft gate → priority weight → suppression rule → routing input → personalization input — without redesigning the integration. *(Example: `address_id` is treated as a policy/reliability-dependent signal, not a universal hard gate — a missing address can route to an agent-collects flow rather than a hard suppression, unless Ops require it as a gate.)*

#### M1A — Build scope

In plain terms, M1A is the plumbing — pick the right dropped carts, call them through Ring, keep track of which leads the bot is handling, take each result back reliably, and be able to switch the whole thing off safely, all without disturbing today's manual ACOM flow. The specific build items:

- Identify eligible dropped carts for the initial bot flow.
- Trigger bot calls; build/send the **call-context snapshot** (Ring request parameters in Appendix C).
- Store the vendor **call/reference ID** against the internal Truemeds lead/order reference; persist the **payload snapshot** for audit/stale-state checks.
- Mark the lead **bot-owned / in-progress**; **prevent simultaneous bot + human assignment**.
- Receive outcomes; store the **raw** payload and the **normalized** outcome (the technical "how" — idempotency, reconciliation, etc. — is in Section 13).
- **Kill-switch / concurrency control**; existing manual ACOM continues as fallback.
- Basic **event logging** for funnel measurement.
- **Confirm the linking key** for funnel measurement — the order ID is retained end-to-end (the agent completes the customer's same order), so it is the natural dropped-cart → final-order key.

**M1A exit criteria.** Eligible leads selected, locked, and call initiation attempted; outcomes normalized idempotently, stuck events reconciled, whole flow kill-switchable with manual ACOM unaffected. *(M1 is foundation only — it categorises and stores outcomes but does not yet route to agents; the usable MVP completes at M2a.)*

#### M1B — Discovery / decision gates

**Live-transfer & telephony feasibility (decides whether M2b proceeds)** — *[RINGG]/[TELCO]/[DISCOVERY]*

M1B must resolve the open questions in **Section 15 (Ring AI and Telephony)** — they are not restated here. The decisions those answers must produce, all of which gate M2b, are:
- **Telephony model:** can Ring **dial from Truemeds-owned DIDs** and **transfer into a Truemeds/Ozonetel queue** (ideally on our existing carrier)? Target is the **hybrid** — Ring keeps its own media path but uses our DIDs and our queue. *(This one answer simplifies CLI, transfer events, screen-pop, recording, and DID ownership together — Section 7.)*
- **CLI preservation on the transferred leg** — the single fact that decides the V1 screen-pop design (number-lookup vs minimal metadata).
- **Transfer events + recording** — availability and stitchability across the bot and HA legs.

**M1B exit.** A written go/no-go on M2b live transfer with the telephony model chosen.

#### M1 scope boundary *(M1-specific; program-level out-of-scope remains in Section 3.3)*

| M1 includes | Not in M1 |
|---|---|
| Signal-capture foundation | Full business-rule engine |
| Hard-gate eligibility | Self-serve config UI |
| Lead context + validation snapshots | Bot-script optimization |
| Bot-ownership lock | Live-transfer implementation (M2b) |
| Ring AI call trigger | Advanced / ML prioritization |
| Webhook ingestion + outcome normalization | Configurable rule exposure (M3) |
| Basic observability / event logging | Full campaign builder |

**Deep design → standalone doc.** Field-level signal design, state transitions, payload boundaries, event logging, validation logic, failure handling, and Engineering open questions live in the **standalone M1 Engineering Walkthrough**.

### M2a — Latest-state validation + async agent routing *(committed baseline — the async MVP)*

**Purpose.** Make bot outputs operationally safe and useful via the dependable async path. **Core rule: never route a Hot/Warm outcome to an agent without re-checking the latest Truemeds order/cart/customer state** — the snapshot may be stale by the time the outcome returns.

**Why re-validate.** The bot conversation takes minutes; in that window the customer may have placed the order, emptied the cart, or changed the address. Acting on the stale snapshot would mean wrong or awkward agent calls — exactly the frustration we're trying to remove.

> **Note — single order, agent pseudo-logged-in.** There is one order ID throughout: the agent operates inside the customer's *own* cart/order (pseudo-logged-in) and completes it. So latest-state validation is a check on the **live** cart, not on a separate assisted order. This also raises a concurrency consideration (agent and customer touching the same cart) — see Section 15.1.

**What it does**
- Re-fetch latest order/cart/customer state after the bot outcome.
- Validate actionability; suppress if **already placed**; suppress / manual-recovery if **cart empty**.
- Detect **cart / address / payment / order** changes after handover → keep as a **normal ACOM task with latest context + a changed-state indicator** (`ACTIONABLE_CHANGED`); reserve **manual review** for genuinely indeterminate validation.
- If actionable → place the lead in the appropriate **pull queue** (PRIORITY for Hot / human-request / callback-due; STANDARD for Warm), per the routing table below and the pull-based allocation model.
- Handle **callback requests** with callback-SLA logic.
- Resolve Cold, Not Connected, Invalid Number, and Do-Not-Call per the routing table below; exact retry counts, cool-down, and suppress-vs-retry thresholds are Ops-configurable (M3).
- Show bot context to agents; capture agent **disposition** (feeds the intent-quality loop).
- Clean funnel tracking: eligible → bot call → outcome → agent action → final order.

**Pull-based agent allocation (MVP).** Agents work a **list view**: clicking **"Assign Order"** returns the best unclaimed lead the agent is eligible to handle. Each agent has a **static configuration** — a stable **base category** (Ops/reporting designation) and **eligible lead categories** (base + approved fallback). On a request the system takes the **highest-priority unclaimed eligible lead** — base category first, then approved fallback categories, ranked by callback-due → business priority → oldest-waiting — and **atomically claims** it (returning "No order available" if none). **No real-time availability, ACD, ETA, workload feed, forecasting, or marketplace optimiser is required for the MVP**; the atomic claim is the only critical runtime dependency. *(Engineering detail: Walkthrough Block 6.)*

**Routing logic (async)** — routing is a function of **(normalized outcome × engagement tier × validation status)**; outcome and tier are defined in §14.2, validation status in the Engineering Walkthrough Block 5. *("Hot/Warm/Cold" = `CONNECTED` + that engagement tier.)* Engagement tier sets **urgency**; validation status sets **whether a human action can exist at all**. Execution is **pull-based** (agents pull the best eligible unclaimed lead).

| Outcome × tier | Validation status | Action |
|---|---|---|
| `CONNECTED` · HOT | `ACTIONABLE_UNCHANGED` | Priority ACOM task |
| `CONNECTED` · WARM | `ACTIONABLE_UNCHANGED` | Standard ACOM task |
| `CONNECTED` · HOT/WARM | `ACTIONABLE_CHANGED` | **Normal ACOM task — latest context + "changed after bot interaction" indicator** (not manual-validation) |
| `CONNECTED` · COLD / declined | actionable | No task / suppress + cooldown (config) |
| `CALLBACK_REQUESTED` | actionable | Callback task (Truemeds-owned, calling-window) |
| Any | `DEFERRED` | Revalidate later; **no immediate outreach** |
| Any | `VALIDATION_INDETERMINATE` | Manual review; no outreach (never guessed) |
| Any | `NOT_ACTIONABLE` (placed / cart-empty / DNC / human-owned / wrong-number) | Suppress / close |
| `NOT_CONNECTED` | retries pending | No human task (retry owned by Block 3) |
| `NOT_CONNECTED` | retries exhausted | **Suppress/close + cooldown by default**; human fallback only if policy-enabled **and** still actionable |
| `INVALID_NUMBER` | any | Suppress; flag for data-quality correction; no retry |

### M2b — Live transfer routing *(conditional on M1 discovery)*

**Purpose.** Deliver the customer-backward ideal: when the bot identifies a connected, ready-now customer, transfer the live call to an available HA — with a clean fallback so we never worsen CX with a failed transfer.

**Why bother (and why conditional).** Customer attention is scarce; if someone is already on the line and ready, calling them back later loses conversions and annoys them. But a transfer that fails ("connecting you…" → silence) is *worse* than a clean callback — so live transfer is only worth it when a human is reliably available, and only built if discovery proves the telephony works. Hence the two gates below.

**Two separate gates (the backbone of V1).**
- **Availability gate — "can a human take this call now?"** Handled in V1 *without* a real-time Ring→Truemeds API, via the five operational controls below.
- **Order-validity gate — "is the order/cart still actionable?"** Handled in V1 by the agent at **screen-pop** (latest Truemeds state), not before transfer.

**V1 admission control (availability gate) — all five required:**
1. **Dedicated Ozonetel Ring-AI HA queue** for transferred calls.
2. **Configurable max-wait / fail-fast threshold** — if no HA answers within the configured threshold, the transfer is treated as **failed** and the customer is moved to priority callback. *The threshold is a config value set with Ops; exact seconds are not hardcoded here.*
3. **Ops-controlled live-transfer concurrency**, tied to staffed HA capacity.
4. **Staffed-HA operating windows** — live transfer is enabled only during configured HA hours.
5. **Priority-callback fallback** whenever 1–4 cannot connect the customer.

**V1 scope (conservative cut)**
- **Eligibility:** `CONNECTED` + `HOT` tier only, subject to the admission control above (which includes staffed-HA windows). Everything else → priority async callback (M2a).
- **Transfer execution** via the telephony model chosen in M1 (target: Truemeds DIDs + transfer into the dedicated Ozonetel HA queue).
- **Screen-pop (V1):** dedicated Ring transfer DID + customer-number lookup *if CLI is preserved*; **minimal metadata-push** only if M1 discovery shows CLI is not preserved (see entry criteria).
- **Order-validity validation (V1):** **at agent screen-pop** — agent sees latest Truemeds order/cart/address/serviceability + any stale-state warning; closes gracefully if no longer valid.
- **Bot conduct (V1):** because order-validity is checked only at pickup, **the bot must not confirm exact cart/order/payment details as final** — it may confirm interest/intent and that an advisor will help complete the order; the agent validates the latest state after pickup.
- **Agent context (V1, minimum):** source tag "Ring AI live transfer" + latest cart/order truth. Opening line, e.g.: *"Hi, I'm from Truemeds — I see you were just speaking with our assistant about your cart, I'll help you complete the order."*
- **Fallback & script:** if transfer fails / no agent / customer drops / order invalid → **priority callback queue**. Working assumption for the bot script: ask the customer to hold briefly while we connect an **advisor**; if none is available, tell them our **advisors** are busy and a callback will be arranged ASAP. *(Final wording is an Ops/CX decision; use "advisor / health advisor", not "senior agent".)*
- **Logging:** full transfer-state events (Section 14); block async assignment while a live transfer is in progress.

**M2b entry criteria (go/no-go — all must be true to start the build):**
1. Ring supports transfer to a Truemeds-owned DID / Ozonetel queue.
2. Truemeds/Ozonetel can route to the selected HA queue.
3. **Either** customer CLI is preserved on the transferred leg **or** a minimal transfer-metadata mechanism is available. *If neither, live transfer is deferred and async (M2a) remains the production path.*
4. The availability / admission-control mechanism (the five controls) is agreed and implementable.
5. Transfer fallback behaviour is defined.
6. The bot transfer script is approved by Product/Ops.

**Deferred to V2 (explicitly):** the real-time **Ring→Truemeds pre-transfer API** (asks "transferable? + destination/availability" *before* connecting) and **Ring intelligence handoff before pickup** (intent, objection, callback preference, summary, transcript, recording link, confidence, transfer reason). V1 catches the same invalid-order cases one step later, at screen-pop.

**Live-transfer fallback scenarios** are handled in the edge-case matrix (Section 9, rows 10 and 15–17) — no agent / queue full / drop during wait, screen-pop failure, missing transfer event, and order-invalid-on-pickup all fall back to priority callback or the relevant existing flow.

### M3 — Configurability + operational control

**Purpose.** Let Product/Ops scale, tune, and govern flows **without an engineering change for every rule** — operational knobs, safe rollout, and governance built on the scale-safe foundations delivered in M1.

**M3 builds on M1's signals, it doesn't rebuild them.** M3 should not rediscover or re-create the signal foundation — it exposes selected **M1-captured signals** as configurable eligibility filters, traffic throttles, priority weights, suppression rules, retry/cooldown rules, routing controls, and campaign-level guardrails.

**Why.** Eligibility, traffic, concurrency, and routing rules will change constantly as we learn; routing every change through engineering would throttle the program and starve manual queues by accident. M3 puts safe, bounded controls in Ops' hands.

**Configurable controls (backend/admin):** Ring enable/disable; concurrency; traffic %; cart-age threshold; platform/city/pincode/AOV filters; customer frequency cap; retry/cooldown rules; campaign on/off; outcome-to-routing config; Hot/Warm routing rules; **live-transfer enable/disable**; **live-transfer eligibility rules** (e.g. Hot-only, high-confidence-only, staffing-hours, queue/city/platform/AOV, max transfers/hour); **dedicated transfer-queue controls**; **fallback-SLA controls**; manual-fallback toggle.

**Governance & monitoring:** audit log for config changes; dashboards; error monitoring; reconciliation for stuck/missed webhooks; safe defaults; guardrails so Ops/Product **cannot accidentally over-call** customers; guardrails so the bot **does not starve manual ACOM queues**; visibility into bot-owned, stuck, and returned-to-manual leads; **live-transfer success/failure monitoring** (connect rate, wait time, abandoned transfers, fallback volume).

**Boundary.** Backend/admin-configurable only; a self-serve campaign builder is not in active scope.

### Milestone entry/exit criteria & ownership

| Milestone | Entry | Exit | Lead owner(s) |
|---|---|---|---|
| M1A (build) | Data-model + linking-key answers (Section 15, Engineering ★) | Dispatch→lock→normalized outcome→reconcile→kill-switch working; linking key defined | Engineering |
| M1B (discovery) | Ring + Ozonetel discovery sessions booked | Written go/no-go on M2b + chosen telephony model | Eng + Ring + Telephony |
| M2a (async) | M1A complete | Every outcome validated + routed/suppressed per table; dispositions captured | Engineering + Ops |
| M2b (live) | All six M2b entry criteria met | Live transfer working with admission control + fallback; transfer states logged; passes A/B before scale-up | Eng + Telephony + Ops |
| M3 (config) | M2a (and M2b if live) in pilot | Ops can tune within guardrails; audit + dashboards live | Eng + Ops |

**Indicative RACI:** Engineering owns integration/build; Ring AI owns the bot, call infra, and transfer capability; Ozonetel/Telephony owns DID/CLI/queue/transfer execution; Product/Ops owns eligibility, scripts, SLAs, and rollout decisions; Analytics owns metric definitions, the sizing inputs, and the A/B readout.

---

## 6. Key decisions & rationale (decision log)

This is the layer to challenge. Each row is a significant choice, the problem it solves, the options we weighed, and why we chose what we did — so reviewers can poke at the reasoning and surface better options.

| # | Decision | Problem it solves | Options considered | Choice & why |
|---|---|---|---|---|
| D1 | AI voice bot qualifies; humans convert | 40% of carts never called; ~5% conversion; capped capacity | More agents; predictive dialer; AI voice bot | **AI bot** — POC showed ~4× conversion on transferred leads and lets us reach the full universe at lower variable cost |
| D2 | Vendor-agnostic adapter + Truemeds-owned normalized outcomes | Risk of locking ACOM logic to Ring; painful swap later | Hardcode Ring; build full multi-vendor platform; thin adapter now | **Thin adapter now** — cheap insurance against lock-in without overbuilding a platform we don't yet need |
| D3 | Payload = snapshot; re-validate latest state before any agent action | Cart/order can change during the call → wrong/awkward agent actions | Trust the bot's payload; re-validate against Truemeds | **Re-validate** — Truemeds stays the source of truth; protects CX and order correctness |
| D4 | Async MVP first (M2a); live transfer conditional (M2b) | Live transfer may be hard/slow to land; can't let it block value | Build live transfer first; async only; async committed + live conditional | **Async committed + live conditional** — ships value regardless of telephony discovery; protects the timeline |
| D5 | Availability vs order-validity treated as two separate gates | "Offer transfer only when an agent is free" seemed to need a real-time API we'd deferred | One combined pre-transfer API; queue + fail-fast + staffed hours | **Queue + fail-fast + staffed-hours + concurrency** (no pre-transfer API in V1) — achieves availability-gating simply and consistently |
| D6 | Telephony: Ring native for MVP; Truemeds-owned DIDs / control plane deferred | Caller trust/pickup/spam vs MVP speed | Build Truemeds telephony now; use Ring native now | **Ring native for MVP** — fastest path to prove the model (the POC already ran without our telephony). A Truemeds-owned **Telephony Control Plane** (DIDs, carriers, reputation, BYOT) is a later platform (§7); M2b builds only the thin live-transfer slice it needs |
| D7 | We call the vendor; the vendor webhooks us | Who owns orchestration, and how events arrive | Vendor "pulls" work and owns logic; we orchestrate + webhooks in | **We orchestrate (call out) + webhooks in** — Truemeds owns eligibility/concurrency/kill-switch; vendor surface kept minimal |
| D8 | Backend/admin config (M3), not self-serve | Ops needs agility without an engineering change per rule | Hardcode rules; admin config; self-serve builder | **Admin config** — agility within guardrails, without building a product surface we don't need yet |
| D9 | Live transfer A/B-gated on delivered orders before scale-up | Live transfer is *intuitively* better but not proven net of failures | Roll out on conviction; A/B gate before scale | **A/B gate** — prove it beats fast callback on delivered orders before scaling |
| D10 | Retry policy is Truemeds-owned, versioned, guardrail-bounded | Vendor-owned retry would bypass our state/compliance re-checks | Let Ring manage retries; Truemeds owns policy | **Truemeds owns** the policy; the adapter applies it (MVP via Ring `call_retry_config`); every retry re-checks order/DNC/ownership first |
| D11 | Engagement tier is Truemeds-derived, not Ring-returned | Avoid coupling tiering to vendor labels | Use Ring's Hot/Warm/Cold directly; derive our own | **Derive our own** tier from Ring's structured classification/score via a versioned rule — re-tune thresholds without touching Ring |
| D12 | One Signal Catalog as the configurable signal source; payload = a projection of it | Eligibility/priority/payload were scattered or hardcoded | Hardcode per block; one configurable catalog | **One catalog**; the Ring payload is the approved, configured subset per campaign × use-case × script-version + mandatory correlation |

## 7. Telephony, DID & caller identity

This section is the **single home** for telephony decisions — what the MVP uses, what live transfer (M2b) needs, and the larger telephony platform we may build later. The boundary is stated once here and referenced (not repeated) elsewhere.

### 7.1 MVP — Ring native telephony
**The MVP (M1 + M2a) runs on Ring AI's own telephony.** We do not build Truemeds telephony to ship the MVP. This is a deliberate scope cut: it's the fastest way to prove the conversion model, and the POC already produced its lift without our own telephony. The known trade-off — Ring-native caller IDs may have weaker pickup/spam behaviour in India — is **accepted and measured** in the MVP (per-DID pickup/spam tracked in metrics), not solved by a telephony build. Because the vendor-adapter and provider-boundary principles already hold, shipping on Ring native does not lock us out of owning telephony later.

### 7.2 Live transfer (M2b) owns its minimal telephony slice
Live transfer inherently needs a DID, transfer-into-queue, and CLI preservation. **That slice is part of M2b's own scope and entry criteria** (Section 5, M2b) — M2b builds the minimal telephony it needs and is gated by its own go/no-go. It does **not** depend on the full platform below, so M2b is not blocked by a separate telephony programme. The internal Doctor→HA transfer on Ozonetel is a pattern to adapt (not reuse): the first leg here is an external AI bot, and agent visibility/metadata/recording/fallback need discovery.

*Three layers to keep distinct when scoping that slice:* the **carrier/trunk** the call rides (Knowlarity today; TATA under evaluation for packet loss); **who owns the DID** the customer sees; and the **platform executing the transfer** (Ozonetel today).

### 7.3 Telephony Control Plane — *future platform direction (not MVP, not a milestone in this line)*
A Truemeds-owned telephony platform — caller trust, pickup, spam reputation, and long-term control are upstream of every conversion metric, and owning telephony is what makes them controllable at scale. It is a **separate, later platform investment** (likely owned by telephony/infra), broader than this bot programme; the M2b slice (7.2) is simply its first seed. Indicative scope:

- carrier abstraction & routing (incl. least-cost / quality-based);
- DID inventory & lifecycle management;
- DID health, reputation & suppression (incl. Truecaller/verified-caller partners, subject to feasibility/commercials);
- per-call routing, retries, cancellation & failover;
- AI-vendor BYOT integration (Ring + future vendors);
- call lifecycle, recording & a reconciliation ledger;
- live-transfer & queue-routing support (consumed by M2b);
- per-carrier/per-DID observability, capacity, and centralized calling-window/DNC compliance.

*(The detailed BYOT/Control-Plane engineering design — the Ring "bring-your-own-telephony" model and its hangup-callback/WebSocket/DTMF requirements — is captured separately and is not MVP work.)*

## 8. Bot conduct & future opportunities

### 8.1 Healthcare trust & bot-conduct guardrails *(active, from V1)*

The bot operates in a pharmacy context, so conduct guardrails are in active scope from V1. The bot must **not**: provide medical advice; suggest or recommend substitutions; claim Rx/doctor approval or that a prescription is validated; guarantee delivery dates or promise stock/availability; or confirm final cart/order/payment as binding (see M2b bot conduct). The bot **must**: defer any Rx/clinical/substitution matters to the normal post-placement order flow (it is not a pharmacist); capture consent and recording per the signed NDA and Truemeds policy; and stay within approved scripts. Guardrail violations are a release blocker, and disclosure that the caller is an AI assistant should follow Ops/Legal guidance. A customer **opt-out** ("do not call") is treated as an authoritative do-not-call that immediately suppresses further bot/manual/campaign calling; in the MVP it is detected from Ring's **post-call analysis** (Ring exposes no real-time mid-call opt-out today — a future vendor request).

### 8.2 Bot-led order confirmation — *future compatibility only (NOT active scope)*

Not a current requirement. If ever pursued, automated confirmation would require at minimum: customer **consent captured on call**; **no** cart/address/payment/order change; latest system validation; inventory/serviceability validation; Rx/prescription checks; full **audit trail**; explicit business + compliance approval. Captured only so M1–M3 choices don't preclude it.

### 8.3 Adjacent / future opportunities *(not active scope)*

- **Live-transfer to a doctor for Rx-required orders.** Today, when a recovered order needs a prescription, a doctor calls *after* placement. Because the customer is already engaged on the bot call, a future option is to **transfer the live call straight to an available doctor** — converting in the moment and reducing post-call drop-off / cancellations. The same admission-control and availability constraints as HA live transfer would apply.
- **Rx-added-but-idle ("Type 1") customers.** Customers who upload a prescription but don't proceed are handled today by a separate team (a pharmacist reads the Rx, builds the cart, and calls to complete). If useful to that team, this voice-bot layer could later be extended to cover that segment as an additional use case.
- **Substitution handling (deep-dive later).** The pharmacists recovering carts already pitch substitutes on the call, so the downstream HA substitution call may be redundant for these recovered orders — worth revisiting in detail later.

## 9. Edge cases & handling

Decision rule: **handle now** if it can cause wrong customer communication, duplicate calling, stale agent action, incorrect order handling, stuck operational state, or trust/compliance risk; **defer** if it only improves personalization/optimization/automation.

| # | Edge case | Handling | When |
|---|---|---|---|
| 1 | Cart changed after handover | Normal ACOM task with latest context + changed-state indicator (`ACTIONABLE_CHANGED`) | Now |
| 2 | Items added/removed while call pending | Latest-state diff at validation | Now |
| 3 | Address changed after handover | Changed-state indicator on a normal task; manual review only if validation is indeterminate | Now |
| 4 | Payment method/preference changed | Stale-state warning; agent confirms | Now |
| 5 | Order placed before call starts | Eligibility re-check at dispatch; suppress/abort | Now |
| 6 | Order placed while call in progress | On outcome: placed → suppress (config: terminate live call) | Now |
| 7 | Order placed after call, before callback | Validation at routing → suppress | Now |
| 8 | Cart emptied after handover | Suppress or manual-recovery | Now |
| 9 | Hot/Warm but latest order not actionable | Suppress if `NOT_ACTIONABLE` (placed / empty / DNC); manual review if `VALIDATION_INDETERMINATE` | Now |
| 10 | Webhook delayed/missed | Reconciliation + polling backstop; lock timeout | Now |
| 11 | Bot/API call fails | `VENDOR_FAILED`; retry per config; release lock; manual fallback | Now |
| 12 | Duplicate bot+human assignment | Ownership lock + atomic transition | Now |
| 13 | Customer says do not call | `DO_NOT_CALL`; suppress all future calling | Now |
| 14 | Invalid number / no-connect | `INVALID_NUMBER`/`NOT_CONNECTED`; retry-or-suppress per config | Now |
| 15 | Live transfer: no agent / queue full / drop during wait | Fallback to priority callback; log `TRANSFER_FAILED/DROPPED/FALLBACK_TO_CALLBACK` | Now (M2b) |
| 16 | Live transfer: screen-pop fails on pickup | Agent proceeds via number/DID + manual lookup | Now (M2b) |
| 17 | Live transfer: order invalid on pickup | Agent closes gracefully; mark accordingly | Now (M2b) |

## 10. Metrics

**Funnel:** eligible dropped carts; sent to bot; call initiated; connected; not connected; Hot/Warm/Cold; callback requested; **live-transfer attempted / connected / failed**; assigned to agent; agent callback completed; order placed; order delivered; cancelled/RTO/DTO where relevant.

**Operational quality:** time eligibility→bot call; time Hot/Warm→agent assignment; time Hot/Warm→agent callback; **async allocation: `ROUTE_QUEUED`→`ROUTE_ACCEPTED` time, lead wait-time by category, agent pull / atomic-claim rate, duplicate-claim incidents, "No order available" rate**; **live-transfer connect rate, wait time, abandoned-transfer rate, fallback-to-callback volume**; stuck bot-owned leads; webhook failure rate; reconciliation volume; duplicate-assignment incidents; suppressed leads by reason; manual-fallback volume.

**Business impact:** human-agent productivity; conversion of bot-qualified Hot/Warm leads (**live-transfer vs async, via A/B**); incremental recovered orders; delivered-order uplift; cost per qualified lead; cost per converted order; customer complaint rate; DNC/refusal rate.

> **A/B gate (rollout).** Live transfer must be piloted and **A/B tested against priority async callback before any scale-up**, judged on **delivered-order conversion** (not transferred-call count), net of transfer failures, drops, wait time, and complaints. Measure: order placed, delivered order, transfer connect rate, transfer drop rate, fallback-callback completion, customer complaint rate, agent productivity, repeat-call reduction.
>
> *[ANALYTICS]* Lock metric definitions + event sources once (tie to M1 event logging). Full-funnel computation uses the retained order ID as the dropped-cart → final-order linking key (the agent completes the customer's same order).

## 11. Live-transfer supply/demand (illustrative sizing only)

Live transfer is a **loss system**: a transfer connects only if an HA is free at that moment, else it falls back to callback. We sized it with an Erlang-B model (full method + table in **Appendix A**). **These figures are illustrative and built on assumed inputs — they must be replaced with actual POC/Ops data before any staffing or rollout decision.** *[ANALYTICS]*

**What it tells us (directional only).** On illustrative assumptions, live-transfer demand is a small, bursty stream (~8 transfers/hour even at full 17k/month volume), and a **small dedicated HA pool *may* keep failed transfers low** — so capacity *looks* manageable, pending real data. The design consequences are firmer than the numbers: (1) **peak clustering, not average load, is what breaks it** → the V1 admission control (Section 5, M2b) is the right mitigation, not over-hiring; (2) **Hot-eligible rate is the dominant sensitivity** — the better the bot gets at producing ready-now customers, the more HAs are needed; (3) the model assumes a **dedicated** pool — a shared queue hits the M3 starvation guardrail.

**Analytics dependency.** Replace the assumed inputs (connect rate, Hot-eligible rate, AHT, intraday peak profile — the last two matter most) with real POC/Ops data, then prove net uplift via the **A/B gate** before scaling (Section 10).

## 12. Risks & dependencies

**Risks:** stale-state routing (mitigated by latest-state validation as a hard gate); **MVP runs on Ring-native telephony** — caller-ID pickup/spam may be weaker than Truemeds-owned DIDs (accepted for MVP; tracked per-DID in metrics; addressed later by the Telephony Control Plane §7.3); failed live transfers worsening CX (admission control + conservative script + clean callback fallback); supply/demand mismatch at peaks (Section 11 + staffing); webhook loss/duplication (idempotency + reconciliation — Section 13); vendor coupling (adapter + normalized outcomes); telephony coupling (provider boundary); CLI not preserved (forces metadata screen-pop — resolve in M1); deprecated endpoint rework (resolve Section 15, Ring AI, early); over-calling / queue starvation (M3 guardrails).

**Dependencies:** data-model answers (Section 15, Engineering ★) before M1/M2 design freeze; Ring webhook schema + endpoint + **live-transfer/CLI** answers and Ozonetel transfer feasibility (Section 15) before M1 go/no-go on M2b; analytics inputs for the supply/demand model (Section 11) and metric definitions (Section 10) before live-transfer scaling; Ops eligibility/SLA/script before pilot; telephony quality (low-packet-loss trunk) as an operational config.

---

## 13. Non-Functional Requirements (NFRs)

The cross-cutting quality attributes the layer must meet, gathered here so the milestones can stay functional. These apply across M1–M3.

- **Reliability & idempotency.** Webhook/event processing must be **idempotent** (safe if the same event arrives twice); store both the **raw** vendor payload and the **normalized** outcome; a given call's result produces exactly one downstream effect.
- **Reconciliation.** A backstop process resolves missed/delayed/stuck events via status polling (`get-call-details` / `get-call-history`). On **bot-ownership lease expiry**, the system **reconciles with the vendor first**, then releases and routes the lead per the **configured routing policy** — expiry does **not** automatically create a human task.
- **Consistency & ownership.** Lead ownership transitions are **atomic** — no simultaneous bot + human assignment; async assignment is blocked while a live transfer is in progress.
- **Latency.** Latest-state re-fetch must complete within budget, including **at screen-pop** (target the low single-digit seconds so the agent sees context on pickup).
- **Scalability & concurrency.** Concurrency is controllable and able to scale toward the full eligible universe; live-transfer load is a loss system sized in Appendix A.
- **Availability & reversibility.** A **kill-switch** can take Ring concurrency to zero without breaking ACOM; the manual flow always remains as fallback.
- **Security & compliance.** `X-API-KEY` held server-side only; inbound vendor webhook is a **hardened, authenticated** endpoint — Ring provides **no HMAC signature**, so auth is a **configured shared-secret / bearer header over HTTPS** (optionally behind a gateway) — versioned, minimal surface (no internal order/cart APIs exposed in V1); PII handled per policy; **recordings stored on Truemeds side** with retention per the signed NDA/Truemeds policy.
- **Observability.** Event logging supports the full funnel; dashboards + error monitoring; visibility into bot-owned, stuck, and returned-to-manual leads; per-DID pickup/spam/call-quality monitoring.

## 14. Technical design

### 14.1 Conceptual components
- **Eligibility engine** — selects eligible dropped carts; applies filters/guardrails.
- **Voice-bot orchestrator** — builds the call-context snapshot, triggers the call, owns lead state, prevents duplicate assignment.
- **Vendor adapter (Ring AI)** — the only place that knows Ring's request/response/webhook/transfer shapes; maps to/from **Truemeds-owned normalized outcomes**.
- **Webhook normalizer** — idempotent ingestion (safe if the same event arrives twice); stores raw + normalized.
- **Latest-state validator** — re-fetches latest Truemeds truth before any agent action.
- **Live/async routing engine** — decides Mode A vs Mode B and the fallback chain.
- **Telephony/transfer orchestration** — DID/CLI handling and transfer execution, behind a provider-agnostic boundary (Ozonetel today; provider swappable).
- **Agent portal / screen-pop** — auto-loads ("pops") the latest order/cart truth + source tag onto the agent's screen at pickup.
- **Config / control plane** — knobs, guardrails, audit, dashboards, reconciliation, kill-switch.
- **HA availability / capacity signal** — used for live-transfer admission control where available; in V1 this may be approximated through dedicated queue capacity, staffed windows, and Ops-controlled live-transfer concurrency.

### 14.2 Normalized internal outcomes (Truemeds-owned)
Routing keys off **two separate Truemeds-owned fields**, never off Ring strings: the **normalized outcome** (what happened on the call) and the **engagement tier** (how interested). The tier is **derived by Truemeds from Ring's structured classification/score via a versioned rule** — not Ring returning our labels — so we can re-tune thresholds without touching Ring or the outcome set.

**Normalized outcome:**

| Normalized outcome | Meaning |
|---|---|
| `CONNECTED` | Call connected and a usable conversation occurred (engagement tier carried separately) |
| `CALLBACK_REQUESTED` | Customer asked to be called back (with/without time) |
| `NOT_CONNECTED` | Call did not connect (busy/no-answer/max-retry; voicemail as a sub-outcome) |
| `WRONG_NUMBER` | Reached the wrong person (distinct from `INVALID_NUMBER`) |
| `INVALID_NUMBER` | Number invalid/unreachable |
| `DO_NOT_CALL` | Customer refused / opted out |
| `VENDOR_FAILED` | Vendor/API/provider/session failure |
| `ANALYSIS_PENDING` | Outcome not yet finalized by vendor |
| `MANUAL_VALIDATION_REQUIRED` | Connected but no usable / contradictory classification — route to a human, never guess |

**Engagement tier** *(separate field, Truemeds-derived, versioned)*: `HOT` · `WARM` · `COLD` · `UNDETERMINED`.

*Backward-compat shorthand used elsewhere in this doc: "Hot/Warm/Cold" = `CONNECTED` + the corresponding engagement tier.*

### 14.3 Live-transfer state statuses
`TRANSFER_INITIATED` · `TRANSFER_CONNECTED` · `TRANSFER_FAILED` · `TRANSFER_DROPPED` · `TRANSFER_FALLBACK_TO_CALLBACK`

### 14.4 Lead lifecycle (vendor- and channel-agnostic)
```
ELIGIBLE → BOT_OWNED → (Truemeds-owned retry policy) → OUTCOME NORMALIZED        ← M1 ends here
                                                              │
                                                              ▼
                                                  LATEST-STATE VALIDATED            ← M2a
                                                              │
   ┌──────────────┬──────────────────┬───────────────┬───────┴───────────────┐
   ▼              ▼                  ▼               ▼                        ▼
NOT_ACTIONABLE  VALIDATION_        DEFERRED        ACTIONABLE_CHANGED       ACTIONABLE_UNCHANGED
→ suppress/     INDETERMINATE      → timed         → normal task +          → route
  close         → manual review    revalidation    changed indicator          (PRIORITY / STANDARD)
                                   (no outreach)          │                        │
                                                          └───────────┬────────────┘
                                                                      ▼
                                                                ROUTE_QUEUED
                                                                      ▼
                                              ROUTE_ACCEPTED  (agent "Assign Order" → atomic claim)
                                                                      ▼
                                              pickup re-check (lightweight latest-state)
                                                                      ▼
                                                          outreach / closure
```
No human action occurs while `BOT_OWNED`. On bot-ownership **lease expiry**, the system reconciles with the vendor, then routes per the **configured routing policy** (not an automatic human task). **M2b live transfer** is the conditional high-intent alternative for Hot leads (Section 5, M2b) and blocks async assignment while in progress — not shown here.

### 14.5 Integration interaction model (who calls whom)
Two directions, both routed through the vendor adapter so vendor specifics never reach core ACOM:

- **Commands (we → vendor), synchronous.** Truemeds owns orchestration — eligibility, dispatch, concurrency, kill-switch — so our orchestrator *calls the vendor's API* to initiate calls, set config, and query status. We do not let the vendor "pull" work and own that logic.
- **Events (vendor → us), asynchronous.** Ring pushes **lifecycle events plus structured classification / client-analysis** (and transfer-state events) to a webhook endpoint we own; the adapter **normalizes them into our outcome model (14.2) and Truemeds derives the engagement tier** — Ring does **not** return our Hot/Warm/Cold labels. Polling the vendor's status API is a **reconciliation backstop only**, not the primary path.

Guardrails: **(1)** the only surface a vendor touches in V1 is a **hardened webhook endpoint** — authenticated, idempotent, versioned, returns a fast 2xx then processes async; we do **not** expose internal order/cart APIs to vendors (a single narrow pre-transfer endpoint is a deliberate V2 exception). **(2)** A vendor event is a **signal, not truth** — on receipt we re-fetch the latest Truemeds state (latest-state validation, M2a) rather than trusting the pushed payload.

## 15. Open questions

### 15.1 — Engineering **[DISCOVERY]** (★ = also an M1/M2 design prerequisite)
- ★ Source of truth + data model for dropped order / cart / customer / address / payment.
- ★ Confirm the data-model / entity shape of the dropped order/cart (single retained order ID — the agent completes the customer's same order).
- Current assignment state model.
- How to lock bot-owned leads (atomic transition + timeout) and block async during a live transfer.
- How to fetch latest state within latency budget (including at screen-pop time).
- Where to store: vendor call ID, payload snapshot, raw webhook, normalized outcome, transfer-state events.
- How to reconcile missed/stuck bot or transfer events.
- How to detect cart/address/payment/order changes after handover (what to diff, and when).
- How to avoid duplicate calling between bot and humans.
- **Cart concurrency:** the agent (pseudo-logged-in) edits the customer's live cart while the customer may also be editing it / placing the order — do these collisions occur today, and how are they handled (lock / last-write-wins / conflict detection / order-placed state)?
- **Customer-side cart experience during agent edit:** if an agent is editing the same live cart/order, what does the customer's app/web show — editable, locked, stale, auto-refreshed, or a conflict state? (UX + support implication.)
- Screen-pop: feasible via caller number? via dedicated DID + number? tie-break if multiple active dropped orders exist for the same customer?
- Can existing Doctor→HA transfer patterns be referenced (even if not reusable)? Minimum V1 for live transfer? How hard to add pre-transfer validation later?
- Whether current reporting can support the full bot + live-transfer funnel.
- Which configuration controls are feasible in the first release.
- **M2a pull allocation:** CRM support for **atomic claim** of a lead by an agent (compare-and-set), idempotent task creation/cancellation, and scheduled (callback) eligibility — and `ROUTE_QUEUED → ROUTE_ACCEPTED` instrumentation.
- **Agent-category configuration:** where `base_category` + `eligible_lead_categories` are defined and maintained (Ops-owned, static).
- **Optional task cap:** whether/how a per-agent `max_open_tasks` cap is enforced (simple open-task count).
- **Lead wait-time by category** — measurement source for the twin-failure signal (eligible leads waiting while eligible agents get "No order available").

### 15.2 — Ring AI **[RINGG]**
*Several items below are **resolved from Ring's docs** (marked); the rest still need Ring's confirmation.*
- **[Resolved]** Webhook model: six events (`call_started`, `call_completed`, `recording_completed`, `platform_analysis_completed`, `client_analysis_completed`, `all_processing_completed`); **`all_processing_completed` is the consolidated terminal event to normalize off**. `custom_args_values` echoes in every event (so `bot_attempt_id` round-trips). Structured `classification`, `callback_requested`/`callback_requested_time` present.
- **[Resolved]** Call retry: configurable per call via `call_retry_config` (count + per-reason delays). Webhook-delivery retry: initial + 3 (10s/1m/2m), 30s timeout.
- **[Resolved]** Reconciliation: Get Call Details / Get Call History. Cancellation: Terminate API (by call-id/numbers/campaign/agent). Webhook auth: **no HMAC** — shared-secret/bearer header only.
- Recommended **production call endpoint** for MVP (v1 *Initiate Individual Call* vs pool-based v2) — confirm.
- Configure agent **analysis classification vocabulary** to match the approved conversation branches; can **`client_analysis`** emit our structured signals/score (for the Truemeds tiering rule)? Is a `wrong_number` classification reliable? Is `callback_requested` reliable per branch?
- Confirm `call_id` behaviour across retries; any **per-delivery event ID**; webhook **ordering** guarantees (assume none).
- **Concurrency / rate-limit** controls; **language** support (Hindi/Hinglish/English; transliteration); **recording/transcript** retention.
- **Real-time mid-call opt-out** signal — *feature request* (today opt-out is post-call only).
- **Test/staging workspace** support.
- **[Moved to the Telephony Control Plane / M2b — §7]** BYOT (Ring over Truemeds telephony), live-transfer modes/DIDs/CLI, number-pool rotation, transfer events/cost — these are **not MVP** and live with §7.3 / M2b, not here.

### 15.3 — Ozonetel / Internal Telephony **[TELCO]**
- Create a dedicated Ring transfer DID/queue?
- Show original customer number (CLI) to HA on transfer?
- Pass call metadata to the agent portal; identify source as "Ring AI transfer"?
- Route Ring transfers only to selected HA/ACOM agents?
- Expose HA availability/queue capacity to a service?
- Log transfer initiated/connected/failed/dropped; record the HA leg; stitch/reference bot + HA recordings?
- Monitor queue wait time and abandoned transfers; behaviour if transfer DID busy / no agents?

### 15.4 — Product / Ops **[OPS]**
- First POC eligibility segment; safe traffic %/concurrency.
- Which customers are live-transfer eligible (Hot-only to start?); which HA queue receives transfers; staffing hours; max acceptable wait.
- Bot script before transfer and on failure; callback SLA after failure.
- Hot-lead callback SLA; Cold/no-connect handling; customer frequency caps.
- Success metrics (primary) for live transfer (connect-to-agent rate / order placed / delivered / reduced repeat calls / complaint reduction); frustration/drop-off monitoring.
- Which outcomes suppress further calling; which return to manual; which changes need Ops vs Product approval.

---

## Appendix A — Live-transfer sizing model (illustrative)

Erlang-B **loss model**: a transfer connects only if an HA is free instantly, else it falls to callback, so failed-transfer % = Erlang-B blocking of the dedicated pool. **All inputs are assumed — replace with POC/Ops data before any decision.**

*Assumptions:* connect rate 45%; Hot-&-transfer-eligible 25% of connected; AHT 7 min; window 10h × 25 days.

*Average offered load by monthly bot volume:* 10k → ~0.53 Erlang; 13.5k → ~0.71; 17k → ~0.89 (~8 transfers/hour).

*Failed-transfer % vs dedicated HAs (full 17k volume):*

| Dedicated HAs | avg (1.0×) | 2× peak | 3× peak |
|---|---|---|---|
| 2 | 17% | 36% | 49% |
| 3 | 5% | 18% | 31% |
| 4 | 1% | 7% | 17% |
| 5 | 0.2% | 3% | 8% |

*Hot-eligible sensitivity (4 HAs, 2× peak):* 15% → ~2% failed; 25% → ~7%; 40% → ~19%; 60% → ~34%.

Interpretation is in Section 11; these numbers are sizing guidance only, not a staffing commitment.

## Appendix B — Glossary

| Term | Meaning |
|---|---|
| ACOM | Assisted Commerce — Truemeds' assisted order team/flow |
| HA | Health Advisor — the human agent who helps the customer place the order |
| DID | Direct Inward Dialing number — the phone number used for a call |
| CLI | Calling Line Identification — the number shown to the recipient |
| M2a / M2b | Async routing (committed) / Live transfer (conditional) |
| `BOT_OWNED` | Lead state while the bot is handling it (locked from human assignment) |
| `LIVE_TRANSFER_IN_PROGRESS` | Lead state during a live transfer (blocks async assignment) |
| Erlang-B | Loss-system formula for blocking probability (Appendix A) |
| Snapshot | Call-context payload sent to the bot; not the source of truth |
| Adapter | Vendor-specific mapping layer isolating Ring from core ACOM logic |
| Source of truth | The latest Truemeds order/cart/customer state |
| Admission control | The five availability controls that gate live transfer (Section 5, M2b) |
| Screen-pop | The agent's screen auto-loading the customer's order/cart the moment they pick up |
| Idempotent | Safe to process the same event more than once without side effects |
| Normalized outcome | A Truemeds-owned status name (e.g. `CONNECTED`, with engagement tier as a separate field) that Ring's raw statuses map into |

## Appendix C — Ring AI API reference (first vendor)

The concrete instance behind the vendor adapter (Section 14). **Confirm the production call endpoint (v1 *Initiate Individual Call* vs pool-based v2) before build (Section 15, Ring AI).** Live-transfer / BYOT parameters are **not MVP** (Telephony Control Plane, §7.3).

> **The payload is a configured projection, not a fixed list.** The conversation payload Truemeds sends is the **approved, configured subset of the Signal Catalog** (engineering Walkthrough §10) for a specific **campaign × use-case × bot/script version**, plus mandatory operational-correlation fields. The field table below is **illustrative** of candidate fields, not a launch checklist; raw clinical/Rx and other `INT-ONLY` signals are never sent regardless of config.

**Endpoint & auth.** `POST /calling/outbound/individual` on base `https://prod-api.ringg.ai/ca/api/v0`; header `X-API-KEY` (server-side only).

**Required fields.**

| Field | Notes |
|---|---|
| `name` | Recipient name (also used as `callee_name` if not set in custom args) |
| `mobile_number` | E.164 format, e.g. `+9198…` |
| `agent_id` | Ring assistant UUID (pin a `version_id` for stability) |
| `from_number_id` *or* `from_number` | Caller ID — exactly one; prefer `from_number_id`. Ties to the Truemeds-DID direction (Section 7) |

**`call_config` (optional overrides).** `call_retry_config` (`retry_count`, `retry_busy`, `retry_not_picked`, `retry_failed` — minutes); `call_time` (`call_start_time`, `call_end_time`, `timezone`, `scheduled_at`); `max_call_length`; `idle_timeout_warning` / `idle_timeout_end`.

**Other optional fields.** `smart_formatter` (first-name extraction, transliteration); `callback_url` + `callback_args` (per-request webhook target/headers); `version_id`; `call_category`; `parent_call_id`.

**`custom_args_values` — the personalization snapshot.** Referenced in the bot prompt as `@{{variable}}`; keys must stay stable across code, prompt, and analytics. Mapped to Truemeds data points:

| Truemeds data point | Ring variable (suggested) |
|---|---|
| Customer name | `callee_name` |
| Mobile number | `mobile_number` |
| Order ID | `order_id` |
| Cart contents (SKU + qty) | `cart_items` |
| Total MRP / SP / discount % | `total_mrp`, `total_sp`, `total_discount_pct` |
| Previously bought medicines | `previous_meds` — **governance REVIEW (clinical-sensitive); off by default, only if compliance-approved** |
| Address — discrete fields | `flat`, `building`, `area`, `city`, `state`, `pincode` |
| Delivery ETA (days) | `eta_days` — **volatile; only if reliable** |
| TM Cash balance (future) | `tm_cash_balance` |

*Send address as discrete fields, not one blob, and avoid NA/null leakage — validate/sanitise before sending (see Section 15, Engineering).*

**Response & webhook (confirmed from Ring docs).** The call returns `call_id` + `call_status` (`registered`/`ongoing`/`retry`/`error`/`completed`/`failed`/`cancelled`/`forwarded`) + echoed `custom_args_values`. Outcomes arrive via six webhook events; **normalize off the consolidated `all_processing_completed`** (carries `status`, `platform_analysis` incl. `classification` + `callback_requested`, `client_analysis`, transcript, recording) for connected calls, and off terminal `call_completed` for no-connects. `custom_args_values` echoes in every event. Webhook auth is a **shared-secret/bearer header (no HMAC)**. Ingest per the interaction model (14.5) — idempotent, with Get Call Details / History as the reconciliation backstop. *Truemeds maps Ring's structured `classification`/`client_analysis` into its own normalized outcome and derives the engagement tier via a versioned rule (§14.2) — the transcript is supporting evidence only.*

---

*End of draft v0.7. Source-of-truth document is this markdown; an interactive web view for the team walkthrough can be generated on request.*
