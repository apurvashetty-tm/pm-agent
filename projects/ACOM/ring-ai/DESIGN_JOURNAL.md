# ACOM 2.0 × Ring AI — Design Journal (how we got here)

*A knowledgebase of the **reasoning and evolution** behind the ACOM × Ring AI work — not just what we decided, but why, and what we tried and dropped. Read this alongside the canonical docs in `docs/`. If you're a future agent, also read `claude.md`.*

**Provenance.** Reconstructed from the full working history: the original handoff (`reference/original-handoff.md`), the open-questions tracker, the future-state PRD + engineering walkthrough, the Rapid Pilot PRD and its ~30-iteration review cycle, and the design decisions embedded in each doc. Where a decision was reversed, both the original and the final position are recorded so the reasoning survives.

---

## 0. Where we are now (TL;DR)

Two related but distinct deliverables exist:

1. **Future-state design** — *Voice-Bot Cart Recovery PRD* + *MVP Engineering Walkthrough* (`docs/`). The full vendor-agnostic voice-bot layer for dropped-cart recovery (Ring AI as first vendor): signal-aware integration, normalized outcomes, lead lifecycle/state machine, telephony considerations, milestones M1–M4. Synced to Confluence.
2. **Rapid Pilot PRD** (`docs/rapid-pilot-prd.md`) — the **current active build target**. A deliberately minimal, reversible change to *today's* ACOM queue that proves one thing: *Ring AI pre-qualifies a controlled slice of incomplete-order leads; Hot/Warm customers return to the existing human "Assign Order" flow with priority; Ring and humans never call the same order at once.* Pull model, `max_in_flight` throttle, never-null ownership lock, two-step agent CTA, `call_details` retention, patient-id eligibility filter. Synced to Confluence (page 1850114059).

The Rapid Pilot is **not** a slice of the future-state architecture — it's a thin bolt-on to prove value fast, with the big architecture deferred.

---

## 1. Timeline / phases

### Phase 0 — Brief → "Ringg Integration" PRD (MVP framing)
Started from the business brief/BRD (`reference/ringg-integration-brief.docx`). Produced the first PRD (`reference/ringg-integration-prd-v0.5.*`) and an HTML walkthrough (`reference/early-walkthrough.html`). Framing at this stage:
- Vendor-agnostic voice-bot layer, **Ring AI as first vendor**, via a **thin adapter + Truemeds-owned normalized outcomes** (not a multi-vendor platform).
- Bot calls the customer, qualifies intent (Hot/Warm/Cold); interested customers routed to a human who completes the order.
- **MVP = M1 + M2a (async callback).** Live transfer (M2b) additive, conditional on discovery, never blocking the MVP.
- **Payload = a stale-able snapshot; re-validate latest state before any agent acts.**
- Two gates kept separate: **availability** (queue/staffing/concurrency) vs **order-validity** (at screen-pop). No real-time pre-transfer API in V1.
- Truemeds order/cart data is always the source of truth. Rx/substitution out of scope (existing post-placement flow handles it).

> **In the stakeholder's own words, kicking this off:** *"Its a AI voice bot that calls all my incomplete order... customer base. Currently since we do this manually we aren't able to cover all 100% of orders and hence there are spill overs day on day also the connectivity is bad and we are wasting precious agent bandwidth... Important call out before starting anything clarify all the doubts... don't get stuck in a loop."* That combination — close the coverage gap, protect agent bandwidth, but escalate rather than stall on unknowns — set the working style for the rest of the project.

The v0.1 draft split the work into "Phase 1 / Phase 2" and routed Hot/Warm leads *straight to agents* through the existing assignment logic. A stakeholder re-brief hardened the direction before Phase 1 began, restating it as principles rather than tasks: *"Ring AI should be treated as a lead qualification layer first. Truemeds order/cart/customer state remains the source of truth. Payload sent to Ring AI is only a call-context snapshot, not the final truth... The integration should not be tightly coupled to Ring AI-specific statuses or payload structures... Build scale-safe architecture from the start; do not create a throwaway POC."* It also mandated the milestone shape that stuck through Phase 1: *"M1: Ring AI Integration Foundation with Scale-Safe Architecture / M2: Latest-State Validation + Agent Routing / M3: Configurability + Operational Control / M4: Same Original Order Conversion Feasibility"* — explicitly **not** "Phase 1 vs Phase 2."

### Phase 1 — Future-state PRD + MVP Engineering Walkthrough
Reworked into two companion docs: the *Voice-Bot Cart Recovery PRD* (mixed business+eng audience) and the *Ring AI MVP Engineering Walkthrough* (per-block engineering design + a Signal Catalog). Pull-based allocation, an `engagement_tier` concept (Hot/Warm/Cold/Undetermined derived by Truemeds, kept separate from the vendor's raw classification), a lead lifecycle/state machine, and a D1–D12 decision log. The full "Telephony Control Plane / BYOT" was **deferred out of the MVP** — MVP runs on Ring's native telephony; the control plane became a future platform note. Both synced to Confluence.

The v0.1→v0.2 rewrite, in the moment: *"The v0.1 PRD framed this as a Ring AI hookup split into Phase 1 / Phase 2, and it routed Hot/Warm leads straight to agents via the existing assigning logic. Three structural changes: (a) reframe as a vendor-agnostic qualification layer with Ring behind an adapter + Truemeds-owned normalized statuses, so the core routing never touches Ring strings; (b) insert latest-state validation as a hard gate before any agent action — the old 'route Hot/Warm to Cat-1' was unsafe because the snapshot can be stale; (c) replace Phase 1/2 with M1–M4."*

The live-transfer availability gate was argued through, not assumed: *"Async lets the bot dial at whatever concurrency it wants because humans pick up leads later. Live transfer requires an HA to be free at the exact second the bot finishes qualifying. If the bot out-dials agent availability, you get failed transfers — which is worse CX than a clean callback."* Landed as: *"V1 live-transfer scope: Agree to the conservative cut — Hot-only, staffed-hours-only, availability-gated, with priority-callback fallback?"* — **Agreed**. A related distinction was drawn between two similar-looking gates: *"Validating the order state and showing the right info on the agent's screen both happen in V1 — at agent pickup (screen-pop time)... What I labelled 'pre-transfer validation API (V2)' is a narrower, earlier gate: a real-time call Ring makes to us before it connects the customer to the agent... it needs Ring to call our API mid-call and honour the response — so it's more integration and reliability burden."* Only the earlier synchronous gate was deferred to V2; screen-pop validation shipped in V1.

`engagement_tier`'s split from Ring's raw label was pinned down with an explicit case for auditability: *"`engagement_tier` should carry provenance + confidence + tiering-rule version (derived-from `client_analysis.intent_score` / `platform_analysis.classification` / our rule vN) so tiers are auditable and re-derivable when we change thresholds — which operationalizes 'change tiering without touching Ring.'"*

The BYOT reversal (own telephony → Ring-native for MVP) is detailed in §3 below.

### Phase 2 — Rapid Pilot pivot (the current doc) + iteration
A decision to prove value in **days**, not on the full architecture. A new, standalone *Rapid Pilot PRD* was written from scratch — explicitly **not** a redesign of the future architecture, but a minimal table+query change reusing the existing ACOM assignment flow. This doc then went through a long, high-signal review cycle (below) that repeatedly tightened the design. It is the current source of truth for what gets built first.

---

## 2. Decision log (with reversals)

Legend: **→** marks a reversal/evolution of an earlier position.

| # | Decision | Options considered | Chosen | Why |
|---|---|---|---|---|
| D1 | Scope of first build | Full future-state MVP vs a thin rapid pilot | **Rapid Pilot** (thin bolt-on) | Prove "does Ring pre-qualification help?" in days, reversibly, before investing in the platform. |
| D2 | Direction | Push (Truemeds initiates) vs Pull (Ring requests) vs both | **Pull for the pilot** (internals direction-agnostic; Push a future option) | Simplest to ship; framed as a stakeholder/commercial decision, so the design stays neutral and Push remains addable. |
| D3 | How to limit Ring's exposure | `MOD(order_id)` cohort/throttle → **rejected**; then `max_in_flight` cap | **`max_in_flight`** (concurrent-hold cap) | A `MOD` cohort on the shared query would also shrink the *human* pool. A concurrency cap throttles Ring without touching the human queue, and self-paces. |
| D4 | Ownership / no-double-call | Release lock on completion vs never null it | **Never-null**: `assigned_to = RING_BOT_USER_ID` stays for life; only a human overwrites it | Today's BAU query filters `assigned_to IS NULL`, so it *automatically* ignores Ring-touched leads — BAU stays literally unchanged, negatives are parked for free. |
| D5 | Human assignment order | Single query vs tiered | **Two-step agent CTA**: Step 1 Hot→Warm (FIFO on `modified_on`), Step 2 = BAU unchanged | Prioritise qualified leads without rewriting the main query; keep BAU pristine. |
| D6 | RING_NO_RESPONSE handling | Above BAU (tier) → interleave with BAU → **listing-only** | **Listing-only** for the pilot; TLs hand-pick a few to observe | "Ring couldn't reach them" is not higher intent; unknown volumes/journey. Keep it out of self-serve, watch it manually, revisit with data. |
| D7 | Recording/transcript retention | New `ring_call_artifacts` table vs reuse existing `call_details` | **`call_details`** (Ring row marked `agent_names = "Ring AI"`) | Engineering confirmed multiple recordings per `order_id` are supported. Reuse existing infra; Ring + human rows coexist under one `order_id`. |
| D8 | Patient eligibility | none vs join vs `EXISTS` on `sub_order_details` | **`EXISTS` semi-join** on `sub_order_details.patient_id` | Ring needs a patient *name* to open the call (addressing + intent). `EXISTS` avoids row fan-out from the one-order→many-sub-orders relationship. |
| D9 | Recency filter | `created_on` (via `order_details`) → **rejected**; use `cx_modified_on` | **`cx_modified_on`** window (30 min–1 day) | `created_on` is fixed at first-SKU; a cart can cross the ₹900 AOV threshold *later* and would be wrongly excluded. `cx_modified_on` is the correct activity clock. |
| D10 | Measurement | Deterministic holdout / ITT experiment → **removed** | **No controlled experiment** in the pilot; descriptive metrics only | A real holdout needs durable cohort assignment, protected control treatment, capacity-fallback rules — a separate milestone, not a days-scale pilot. |
| D11 | Doc structure | Single spec vs layered | **Product (§1–§11) + Engineering Implementation Contract (§12)** | Behaviour is Product-owned and binding; engineering may change *implementation* (query shape, indexing) as long as guarantees hold. |
| D12 | Metrics framing | Hot/Warm-vs-BAU conversion as proof → corrected | **Descriptive, five-layer metrics** (funnel, qualification quality, productivity, safety, economics) | Hot/Warm are post-Ring labels; higher conversion proves qualification quality, not causal lift. Don't over-claim. |
| D13 | `order_details` in the query | Drop it vs keep as status guard | **Keep** the join only as the `orderstatus=49` source-of-truth guard (given `iod` is in sync) | `iod` mirrors status/value/created_on, but `order_details` is authoritative; the join guards against `iod` staleness. Exact shape is engineering's to tune via `EXPLAIN`. |

---

## 3. Reversals worth remembering (the "why we changed our minds")

- **`MOD` cohort → `max_in_flight`.** `MOD(order_id,100) < pct` was proposed to send only X% of orders to Ring. The trap: humans and Ring share the *same* eligibility query, so putting `MOD` there would starve the human pool too. The right control is a **concurrency cap** on how many leads Ring may *hold* at once — it throttles Ring alone and self-paces. (`MOD` briefly came *back* as a measurement holdout in D10, then was removed entirely.)
- **Holdout added → removed.** A senior review argued (correctly) that Hot/Warm-vs-BAU isn't proof of incremental lift, and proposed a deterministic 10% BAU holdout for a clean ITT read. On reflection a valid holdout needs durable cohort markers, protected control treatment, and capacity-fallback rules — a real experimentation milestone. For a days-scale pilot it was **out of scope**; the pilot measures feasibility/quality/productivity/safety and explicitly disclaims causal lift.
- **RING_NO_RESPONSE: above BAU → interleave → listing-only.** First modelled as a priority tier above BAU (anti-orphaning), then "interleave at BAU's tier," then finally **listing-only** — because a Ring-unreached customer carries no positive-intent signal, volumes are unknown, and we'd rather observe a hand-picked sample before wiring it into self-serve.
- **`created_on` filter rejected.** A newer engineering query added `created_on > NOW()-1day`. But `created_on` is stamped at first-SKU; a cart can mature past ₹900 later and be recently active while created days ago — `created_on` would wrongly drop it. `cx_modified_on` (activity) is the correct clock. (Good catch that came from the stakeholder, not the doc.)
- **New retention table → reuse `call_details`.** We initially carried a `ring_call_artifacts` table; once engineering confirmed `call_details` supports multiple rows per `order_id`, we reused it (Ring row tagged `agent_names = "Ring AI"`) rather than add a table.
- **Own telephony (BYOT) → Ring-native for MVP (Phase 1).** Early direction was firm — *"We will not use Ring's native telephony for outbound calls"* — pushing toward Truemeds-owned DIDs/BYOT. It reversed once the tradeoff was named directly: *"If the Telephony Control Plane leaves the MVP, then MVP telephony = Ring's native telephony... That's not a downgrade we're stumbling into — it's the deliberate MVP cut: prove the conversion lift on Ring's stack first; invest in our own telephony platform once the model is proven."* Supporting evidence: the ~4× lift POC (~1,300 leads) had *already run without our own telephony control plane*, so Ring-native was shown sufficient to validate the business case. The Control Plane was reframed as a **Truemeds-owned capability any voice vendor plugs into** (not Ring-specific glue) and deferred to a future track, detail-designed only when picked up.

---

## 4. Settled — do NOT reopen (unless explicitly asked)

- Rapid Pilot is a **thin, reversible bolt-on**, not a slice of the future architecture.
- **No `MOD`/cohort throttle**, and **no holdout/incrementality experiment** in the pilot.
- **`max_in_flight`** is the single rollout + throttle lever; `max_in_flight = 0` is the kill switch.
- **Never-null ownership**: Ring-touched leads keep `assigned_to = RING_BOT_USER_ID`; BAU query is unchanged.
- **Two-step CTA**: Hot→Warm (FIFO on `modified_on`), then BAU unchanged.
- **RING_NO_RESPONSE / COLD / DECLINED / CALLBACK = listing-only** (not self-serve) for the pilot.
- **Retention in `call_details`** (Ring row = `agent_names = "Ring AI"`), not a new table.
- **`cx_modified_on` window**, **not** `created_on`.
- **Patient filter via `EXISTS` on `sub_order_details.patient_id`.**
- **Product/Engineering two-layer split**; behaviour is binding, implementation is engineering's.

## 5. Still open (see the PRD §11 for detail)

- **O1** RING_NO_RESPONSE placement — listing-only for now; revisit with data.
- **O2** Send-failure rollback — park vs release to `NULL`.
- **O3** CALLBACK — listing-only; possible scheduled-time column later.
- **O4** `ring_lead_ttl` value.
- **O5** Transcript storage — recommend `transcript_s3_uri` column on `call_details`; engineering to confirm.
- **Open questions:** the Ring **webhook contract** (assume-and-build behind a mapping table), starting values for `reaper_minutes`/`max_in_flight`/`ring_lead_ttl`, economics targets, the listing-page assignment mechanism, and manual-agent hold/callback behaviour (`call_details`).

## 6. How the stakeholder works (apply these)

- **Markdown is the source of truth**; rendered formats (Confluence, HTML) are generated from it.
- **Present → debate → agree → then edit.** Do not edit during brainstorming; surface proposed changes for review first.
- **Never sync to Confluence/Atlassian unless explicitly told "sync."**
- Write for **external readers** — no meta-scaffolding, no "this is the plain-language layer," no narrating the process into the doc; cut filler.
- **Be concise and direct.** Don't over-flag/over-engineer; distinguish a real blocker from a nit.
- Don't invent vendor (Ring) API details — verify from official docs or mark clearly as pending.

## 7. Key source facts (as verified during the work)

**Data model (from live samples in `reference/schema-samples/`):**
- `incomplete_order_details` (`iod`) — the abandoned-cart working table. Columns include `order_id`, `customer_id`, `order_value`, `final_score`, `assigned_to`, `orderstatus`, `is_active`, `eligible_for_ranking`, `rank_again_after`, `created_on`, `modified_on`, `cx_modified_on`. One open incomplete order per customer. (`patient_id` is **not** here.)
- `order_details` — authoritative order table (status source of truth).
- `sub_order_details` — holds `patient_id` per `order_id` (one order → many sub-orders; one patient per cart in practice).
- `call_details` — existing telephony (Knowlarity) call log; supports multiple rows per `order_id`; has `recording_url` / `s3bucket_recording_url`, `disposition`, `on_hold_reason`, `is_status_call_back_hold`, `agent_names`, `agent_status`; **no** `agent_id` column and **no** transcript column.
- Today's eligibility/BAU query: `orderstatus=49`, `order_value>900`, `is_active`, `cx_modified_on` in [NOW−1day, NOW−30min], `eligible_for_ranking`, `assigned_to IS NULL`, `rank_again_after` ok; `ORDER BY final_score DESC, order_value DESC LIMIT 1`.

**Ring AI (verified from docs.ringg.ai; anything not confirmed is marked pending in the PRD):** outbound "Initiate Individual Call"; `custom_args_values` echoes on every webhook event; consolidated terminal event carries status/classification/transcript/`recording_url`; **`recording_url` valid ~24h**; webhook auth is a shared-secret/bearer header (**no HMAC**); Ring manages call retries via `call_retry_config`. The exact pilot webhook contract is **assume-and-build behind a mapping table** until confirmed.

---

*This journal is the "why." For the "what/how," read `docs/rapid-pilot-prd.md` (current build) and the future-state docs. For a fast agent onboarding, read `claude.md`.*
