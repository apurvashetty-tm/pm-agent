# ACOM 2.0 × Ring AI — Rapid Pilot PRD

| | |
|---|---|
| **Document type** | Product Requirements Document — Rapid Pilot |
| **Author** | Apurva Shetty (Product) + Engineering |
| **Status** | Draft for review |
| **Model** | **Pull** — Ring requests leads from a Truemeds API. (Internals are direction-agnostic; a Push variant is possible later — §9.) |
| **Structure** | §1–§11 are Product-owned required behaviour. §12 is the **Engineering Implementation Contract** — an implementation baseline Engineering may change provided every behavioural guarantee above is preserved. |
| **Related documents** | *ACOM 2.0 — Voice-Bot Cart Recovery* (PRD) and *Ring AI MVP Engineering Walkthrough* describe the future-state design; this pilot is independent of them. |

---

## 1. Executive summary

**Pilot decision.** Run a controlled Ring AI pilot for dropped-cart recovery as a **minimal change** to today's ACOM flow. Ring pre-qualifies eligible incomplete orders; **Hot/Warm** customers reach human agents with **priority**; Ring and human agents never call the same order at once. The pilot runs on the **Pull** model — Ring pulls leads from a Truemeds API.

**Business objective.** Test whether AI pre-qualification (a) gets more abandoned ACOM carts converted once they reach a human and (b) makes human-agent effort more productive — by routing interested customers to agents first — without increasing customer-contact risk or operational load, and reversibly enough to scale or stop.

**What changes.** A new `ring_outcome` on `incomplete_order_details`; a Ring "bot" user ID used in `assigned_to` as the ownership lock; a Pull API that hands Ring reserved, enriched leads up to a hold-at-once cap; a two-step agent CTA (Hot/Warm, then today's flow); a `ring_outcome` column + filter on the team-lead listing page; recording/transcript retention; and background safety jobs (reaper, retention sweep).

**What stays unchanged.** `incomplete_order_details` creation and the 30-minute abandonment window; `final_score` and its scoring job; the existing BAU "Assign Order" query (it filters `assigned_to IS NULL`, so it automatically ignores Ring-touched leads); cart visibility; the human assignment write.

**Success criteria.** Eligible orders are qualified by Ring at a controlled rate; **Hot/Warm** customers reach human agents faster and with priority; **Ring and humans never call the same order at the same time**; team leads can see and filter `ring_outcome` on the listing page; every recording/transcript is retained; and we can read Ring's qualification quality, human productivity, and operational safety.

**Reading the results.** Ring works only orders that are eligible, **have a patient attached**, and are available when it pulls, within queue rank and the `max_in_flight` cap — **not a random sample** of all eligible carts. Read pilot outcomes **descriptively** (qualification quality, productivity, safety), not as proof of causal conversion lift.

## 2. Context, current flow & problem

- **Incomplete-order creation.** When the first SKU is added to a cart, a row is created in `incomplete_order_details`, keyed by `order_id`. A customer has **one** open incomplete order at a time. *(The fields the design relies on are introduced below and shown in the §12 queries/DDL.)*
- **30-minute abandonment.** A cart becomes eligible for assisted recovery only after **≥ 30 minutes** of customer inactivity (and < 1 day) without being placed. This window is **not weakened**.
- **Current "Assign Order" flow.** An agent clicks the CTA; the backend assigns the single best eligible *unassigned* order (`final_score`, then `order_value`). *(Query in §12.A.)*
- **`assigned_to` behaviour.** `NULL` = available; `<agent id>` = claimed by that agent. The eligibility query only returns `assigned_to IS NULL`.
- **Listing page.** Today the team-lead listing page shows all currently-eligible orders (effectively the eligibility query without `LIMIT 1`) and lets the TL filter by `order_id`.

**The problem.** The human abandoned-cart queue is broad and capacity-bound — agents work interested and uninterested customers alike. If Ring pre-qualifies intent *before* human effort, Hot/Warm leads can be prioritised — provided Ring and humans never call the same order, Ring can't outrun human capacity, and team leads can see and filter Ring outcomes.

This pilot tests whether Ring pre-qualification improves human-assisted conversion using a **thin, reversible change** to the current ACOM queue rather than a new workflow platform.

## 3. Goals

Qualify eligible orders via Ring at a **controlled, throttleable rate**; never let Ring and a human call the same order; route **Hot/Warm** leads into the human queue with **priority**; surface every Ring outcome on the TL listing page; retain every recording/transcript; stay reversible (instant kill switch); and measure **qualification quality, human follow-up speed, human productivity, and operational safety**.

## 4. Non-goals

No agent-categorisation/routing engine (TL assignment is manual); **no automated callback scheduling**; no Truemeds-side call-retry engine (Ring manages call retries); no change to `final_score` or the 30-minute window; no live transfer; **no controlled incrementality experiment / holdout in this pilot** (see §10 note). No reuse of `rank_again_after`, `is_active`, `is_substitable`, or `substitution_possible_score` until their current writers and dependencies are confirmed.

## 5. Users

| User | Pilot impact |
|---|---|
| Customer | Receives the Ring call; interested customers get prioritised human follow-up |
| ACOM agent | Gets Hot/Warm leads with priority in the existing CTA flow |
| Team lead | Sees `ring_outcome` on the listing page, filters by it, and can hand-pick non-Hot/Warm outcomes to test |
| Ring | Pulls reserved leads from our API and returns a result per order |
| Ops | Tunes `max_in_flight`, monitors outcomes, retention, the reaper, and the metrics |

## 6. Proposed pilot flow

### 6.1 End-to-end journey
1. Ring calls our **Pull API** asking for work.
2. We check how many orders Ring is **currently holding**. If it's at the cap, we reply *"none now, retry after X"*. Otherwise we return enough leads to **top Ring back up to `max_in_flight`** (e.g. cap 10, holding 4 → return 6).
3. For each lead, we **reserve** it first — stamp `assigned_to = RING_BOT_USER_ID` so no human can pick it — and send the enriched context to Ring.
4. Ring calls the customer and classifies intent (**Hot / Warm / Cold / Declined / Callback / no-response**); Ring manages its own call retries.
5. Ring returns the result (per `order_id`). We **store the outcome** in `ring_outcome`, **keep `assigned_to = RING_BOT_USER_ID`** (we do *not* release it), and **retain** the recording + transcript.
6. The agent CTA serves **Hot**, then **Warm** (oldest-first), then falls back to **today's BAU queue, unchanged**. **RING_NO_RESPONSE / Cold / Declined / Callback are not auto-assigned** — they appear on the TL listing page only, where TLs can hand-pick a few to observe.
7. Safety: a **reaper** stamps any lead stuck with Ring as `RING_NO_RESPONSE`; the **kill switch** (`max_in_flight = 0`) stops new hand-outs instantly.

```
Ring ──pull──► [holding < max_in_flight?] ──no──► return: retry after X
                        │ yes
                        ▼
   reserve top-up leads, assigned_to = RING_BOT_USER_ID
                        │
                        ▼
   Ring calls customers ──result──► set ring_outcome (keep bot id), retain recording
                        │
                        ▼
   Agent CTA:  HOT  →  WARM  (FIFO)  →  BAU query (unchanged)
   RING_NO_RESPONSE / Cold / Declined / Callback ──► TL listing page only
```

### 6.2 Ownership model (`assigned_to` is the lock; never nulled by Ring)

A Ring-touched order **keeps** `assigned_to = RING_BOT_USER_ID` for its whole life — through the call and after the result. It is only overwritten when a **human agent** is assigned. This keeps the design minimal: today's BAU query already filters `assigned_to IS NULL`, so it ignores every Ring-touched lead and stays unchanged.

| `assigned_to` | `ring_outcome` | Meaning | Who serves it |
|---|---|---|---|
| `NULL` | `NULL` | Never sent to Ring | BAU queue (humans) |
| `RING_BOT_USER_ID` | `NULL` | In flight with Ring | Nobody (counts toward `max_in_flight`) |
| `RING_BOT_USER_ID` | `HOT` / `WARM` | Qualified, awaiting human | Agent CTA — priority tiers 1–2 |
| `RING_BOT_USER_ID` | `RING_NO_RESPONSE` | Ring exhausted attempts, no contact | TL listing page only |
| `RING_BOT_USER_ID` | `COLD` / `DECLINED` / `CALLBACK` | Parked | TL listing page only |
| `<agent id>` | any | Claimed by a human | Nobody |

**No-double-call guarantee:** a lead is **atomically** reserved (`assigned_to: NULL → RING_BOT_USER_ID`, compare-and-set) *before* it is handed to Ring. Every claim — bot or human — is a compare-and-set, so two actors can never hold one order. *(Mechanics in §12.)*

### 6.3 Flow control (`max_in_flight`)

Ring may hold only up to **`max_in_flight`** active (un-resolved) leads at once. On each pull we hand out only enough to top Ring back up to that cap; if Ring is already at the cap, the endpoint returns *retry-after X*. The system reconciles this cap against the **actual** count of bot-owned unresolved orders to prevent drift. **Kill switch:** `max_in_flight = 0` returns *retry-after* to every pull; in-flight calls finish and report; the reaper clears stragglers; reversible, no schema rollback. *(Counter reconciliation, idempotency and recovery in §12.)*

## 7. Functional requirements

Each item states required **behaviour**; the implementation baseline is in §12.

- **Pull endpoint + flow control.** Ring requests work from a Truemeds API. The endpoint returns up to `max_in_flight − current_in_flight` leads, or *retry-after X* when at the cap (or when `max_in_flight = 0`).
- **Candidate selection.** Ring leads come from **today's eligibility pool** (incomplete, `is_active`, customer-inactive 30 min–1 day, unassigned; order status cross-checked against `order_details`), ordered `final_score`, then `order_value`. **A lead must also resolve to a `patient_id`** — a patient attached to the cart (via `sub_order_details`); orders without one are skipped. So Ring's candidate set is a **subset** of the human-eligible pool (same eligibility **plus** a `patient_id`); humans run the unfiltered BAU query. For orders that *have* a `patient_id`, Ring and humans compete first-come-first-served (the reservation lock decides who gets it); orders **without** a `patient_id` are human-only.
- **Reserve before hand-off.** Each lead is atomically reserved (`assigned_to: NULL → RING_BOT_USER_ID`) before it leaves our system; only rows that win the lock are handed out. A reserved-but-undeliverable lead is rolled back (open decision O2).
- **Lead payload.** For each lead, return `callee_name` (the patient's name — from the cart's `patient_id`, one patient per cart — used to address the customer and as an intent signal), `mobile_number` (the **customer's** account number; there is no patient-level number), `cart_items`, `customer_id`, `address`, `cart_value` (₹), `discount_amount` (₹), `eta` (days), and `order_id` as the correlation key.
- **Outcome handling.** When Ring returns a result for an order:
  - **Normally:** save the result in `ring_outcome` (Ring's label is translated to our values via a **config mapping table**) and leave the order owned by Ring (`assigned_to` is **not** released).
  - **Guard — only update if the order is still Ring-owned and has no outcome yet.**
  - **If the result arrives too late to count** — the lead was already closed by the reaper as `RING_NO_RESPONSE` (and may since have been hand-assigned by a TL from the listing), or this result duplicates one already recorded — then **ignore it for assignment**: leave the current owner unchanged, but still save the recording/transcript and log the ignored result.

  (While Ring is actively on a call, the reservation lock keeps the lead off every human path, so a human can only end up owning it *after* the reaper has closed it. This guard stops a very-late Ring reply from over-writing a lead the reaper closed and a TL has since picked up.)
- **Human assignment (self-serve).** The agent CTA serves, in order:
  1. `HOT`, then `WARM` — **FIFO, oldest `modified_on` first**.
  2. Fallback: **today's BAU query, unchanged**.

  `RING_NO_RESPONSE`, `CALLBACK`, `COLD`, `DECLINED` are **not** auto-assigned (listing-only, below). On assign, the agent ID overwrites the bot lock. *(FIFO clock dependency in §12.)*
- **TL listing page (column + filter).** Add `ring_outcome` as a column and a filter (same pattern as today's `order_id` filter). The listing must include Ring-held rows so all outcomes are visible. For the pilot, TLs may **manually assign** RING_NO_RESPONSE / Cold / Declined / Callback leads to observe behaviour (small volume, revisited later). Assignment mechanism from the listing is **to be confirmed**; no agent-category construct; no automated callback scheduling.
- **Recording/transcript retention.** On each Ring result, write the Ring call as a row in the existing **`call_details`** table against `order_id`, marked `agent_names = "Ring AI"` (so it's distinguishable from the human call). Download the recording to Truemeds S3 (Ring's link expires ~24h) and store the transcript in S3 referenced from that row; retry + alert before expiry. A HOT/WARM order will therefore have two `call_details` rows — the Ring call and the later human call. *(Transcript column is an engineering decision — see O5.)*
- **Reaper (no orphans).** A scheduled sweep stamps any lead stuck with Ring (no result within `reaper_minutes`) as `RING_NO_RESPONSE`; it does **not** null `assigned_to`.
- **Kill switch.** `max_in_flight = 0` halts all new hand-outs immediately and reversibly.

## 8. Data and portal changes

- **`ring_outcome` column** on `incomplete_order_details` (`VARCHAR(24) NULL`; values `HOT | WARM | COLD | DECLINED | CALLBACK | RING_NO_RESPONSE`; `NULL` = never went through Ring or in flight).
- **Ring bot user.** A unique agent-level ID (`RING_BOT_USER_ID`) created as a **system-tagged** row so human-agent reports exclude it.
- **Recording/transcript storage.** Ring calls are stored as rows in the existing **`call_details`** table (no new table), one row per Ring call, marked `agent_names = "Ring AI"`; recording downloaded to S3 (`s3bucket_recording_url`), transcript to S3 referenced from the row. Multiple rows per `order_id` (Ring + human) are supported.
- **Outcome mapping table.** Config table: Ring's classification label → our `ring_outcome`, so Ring's vocabulary can change without code.
- **Two-step agent CTA.** New Hot/Warm (FIFO) query in front of the **unchanged** BAU query.
- **Portal — listing page.** New `ring_outcome` column + filter; row set broadened to include Ring-held rows. No other portal change.
- **Measurement instrumentation.** Per-order timeline capture for the funnel, latency and conversion metrics (§10) — Ring/agent/placement timestamps.
- **`modified_on`.** Bumped on hand-over to Ring and on result (reaper + Hot/Warm FIFO clock; dependency in §12).
- **Fields explicitly untouched.** `final_score`, `rank_again_after`, `is_active`, `is_substitable`, `substitution_possible_score`, `cx_modified_on` — no Ring write touches these.

## 9. Pull model (pilot) — and Push as a future option

The pilot ships **Pull**: Ring calls our endpoint and we hand back reserved, enriched leads up to the cap. Selection, reservation, outcome handling, retention and prioritisation are **direction-agnostic**, so a **Push** variant (a Truemeds scheduler initiating instead) could be added later with the same internals and the same `max_in_flight` throttle. Direction is otherwise a commercial/integration decision with Ring and is out of scope for the pilot.

## 10. Rollout, success metrics & measurement

**Rollout lever = `max_in_flight`.** Start small (e.g. 5–10), watch the Hot/Warm backlog vs agent capacity, then raise it. A low cap means Ring works only a small share of the eligible (patient-bearing) leads, leaving the rest to humans; raising it gives Ring more.

**Rollback / kill switch.** `max_in_flight = 0` stops all new hand-outs instantly; in-flight calls drain and report; the reaper clears stragglers. No schema rollback.

**Selection caveat.** Ring works only a **subset** of eligible carts — those that have a `patient_id`, are available when it pulls, and fall within `final_score`/`order_value` rank and the `max_in_flight` cap. So the orders Ring touches are **not a random or representative sample** of all eligible carts. Compare outcomes **descriptively**; do not read them as incremental conversion lift versus BAU.

**Attribution.** Primary conversion event = **order placed / confirmed within 24 hours of human assignment**. The relevant question for this pilot is whether a Ring-qualified (or Ring-unreached, when a TL tries it) lead performs **once it reaches a human**. Delivered / cancelled is a downstream **quality** check, not the primary attribution event.

### 10.1 Metric layers

**1. Ring funnel** — eligible → Ring reserved → handed to Ring → attempted → connected → final outcome → human picked/assigned → human connected → order placed/confirmed → delivered/cancelled.

**2. Qualification quality** — conversion by `HOT`, `WARM`; conversion of `RING_NO_RESPONSE` and later conversion of `COLD`/`DECLINED` (from the manual TL-assigned sample); human-assignment latency by outcome. Expected ordering to test: **HOT > WARM**.

**3. Human productivity** — placed orders per human-picked Ring lead; per connected human call; human assignment / pick-up latency by Ring outcome. Compare the Ring-fed human lane vs the BAU human lane (descriptive, not a controlled comparison).

**4. Safety & operational health (hard scale gates)** — duplicate Ring + human contact incidents; stuck Ring-owned orders; stale results ignored; Ring API/webhook failure rate; artifact-retention success; reaper release rate; customer complaints / opt-outs / repeat-contact rate.

**5. Economics** *(targets `[TBD pending Ring commercials and contribution assumptions]`)* — cost per Ring-attempted lead; cost per Ring-qualified lead; cost per human-assisted placed order; human calls avoided per placed order.

### 10.2 Operational latency (tracked separately)

```
ACOM eligibility       → Ring reservation
Ring final outcome     → human assignment
Human assignment       → human connection
Human connection       → order placed / confirmed
```

### 10.3 Decision table

| Decision question | Metric | Comparison | Scale signal |
|---|---|---|---|
| Does Ring classify intent usefully? | Conversion by HOT / WARM (within 24h of assignment) | Among Ring-qualified leads | Clear expected ordering (HOT > WARM) |
| Does Ring improve human productivity? | Placed per human-picked lead / connected call / productive hour | Ring-fed lane vs BAU lane | Meaningful uplift |
| Is it operationally safe? | Duplicate contacts, stuck locks, retention, errors | Absolute thresholds | No material breach |
| Is it commercially viable? | Cost per placed order / contribution | Ring vs BAU | Meets agreed business threshold |

### 10.4 Instrumentation, cadence & targets

- **Instrument** per `order_id` (event log or timestamp columns): `acom_eligible_at`, `ring_handed_at`, `ring_attempted`, `ring_connected`, `ring_result_at`, `ring_outcome`, `human_assigned_at`, `agent_id`, `human_connected_at`, `order_placed_at`, `order_value`, `reaper_stamped_at`, `retention_status`. Join with `call_details` on `order_id` — which now holds both the Ring call row (`agent_names = "Ring AI"`) and the human call row(s) — for call-level truth (connect, disposition, hold/callback, recording).
- **Cadence & ownership:** a daily ops dashboard (funnel, reach, outcome mix, retry-after rate, retention, reaper, drift, duplicate = 0) plus a weekly product readout on the decision table. Owner: Product + Ops.
- **Targets (placeholders — set with Product/Ops before go):** duplicate calls = **0** (hard gate); retention ≥ **99%**; counter drift = **0** after reconciliation; reach rate ≥ **[TBD]**; productivity uplift ≥ **[TBD]**; economics ≥ **[TBD]**.

> **Note.** A controlled incrementality experiment may be designed after the Rapid Pilot stabilises. It is out of scope for this release.

## 11. Dependencies, risks, assumptions & open questions

**Dependencies.** `ring_outcome` + counter + mapping table; `RING_BOT_USER_ID` system-tagged; Pull endpoint; two-step CTA + listing changes; `call_details` retention path (Ring row marked `agent_names = "Ring AI"`, recording → S3, transcript reference) + retention sweep; reaper; measurement instrumentation (§10.4); read access to `sub_order_details` (`patient_id`) for the Ring eligibility filter; Ring assistant configured (classification, webhook, recording on).

**Risks (product / operational).**
- **Counter drift** if a release path misses a decrement → Ring starves. Mitigate: decrement on all paths, idempotent, reconcile against the live count (§12).
- **Parked leads get no automatic human call** — `RING_NO_RESPONSE` / `COLD` / `DECLINED` / `CALLBACK` are reachable only via the listing (conscious choice; revisit RING_NO_RESPONSE after observing the manual TL sample).
- **Recording 24h expiry** → download to S3 promptly + retry/alert.
- **Duplicate webhooks** → outcome write and counter decrement must be idempotent.
- **Bot-user reporting contamination** → system-tag the Ring ID; exclude from agent metrics.

**Assumptions (confirm before go).**
- **Hot/Warm FIFO clock.** FIFO for Ring-returned human-follow-up leads is based on `modified_on`, assuming the final Ring outcome update reliably refreshes this field and unrelated updates do not distort ordering. Engineering must validate this before implementation. No new timestamp column is added for the pilot unless that validation fails; if it fails, stop and bring back the smallest safe alternative before changing the data model.
- Between hand-over and result, **no other process writes `modified_on`** on these rows (else the reaper clock + FIFO are unreliable).
- Reserve and human claim are atomic compare-and-sets.
- `assigned_to` accepts the Ring bot ID without breaking joins/reports.
- The CTA/listing changes don't disturb other consumers of today's eligibility query.
- One open incomplete order per customer (confirmed) → no same-customer double-call.
- One patient per cart (confirmed) → `patient_id` enrichment is unambiguous.
- Order status is cross-checked against `order_details` (source of truth) and `incomplete_order_details` is assumed **in sync**; `created_on` is deliberately not a filter (see §12.D). Query shape/indexing is engineering's to tune.

**Open decisions (to close).**
- **O1 — RING_NO_RESPONSE handling.** Decided for the pilot: **listing-only** (not in self-serve). TLs hand-pick a few to observe; revisit (promote / demote / keep) once we see conversion, connect rate, and volume.
- **O2 — Send-failure handling.** Reserved + counted but hand-off fails: stamp a terminal value + decrement, or release to `NULL` for a BAU attempt.
- **O3 — CALLBACK.** Listing-only for the pilot. A later option is a scheduled callback-time column bringing CALLBACK into the CTA — but honouring a time needs a "don't surface until due" gate that complicates the query, so it is out of scope now. Revisit once the webhook confirms whether Ring sends a callback time.
- **O4 — `ring_lead_ttl`** (how long after qualification a Hot/Warm lead stays in the CTA).
- **O5 — Transcript storage (engineering to confirm).** Ring calls are stored in `call_details` (marked `agent_names = "Ring AI"`); recordings reuse `s3bucket_recording_url`. `call_details` has **no transcript column** today — recommended approach is to store the transcript in S3 and add a `transcript_s3_uri` column on the Ring row. Engineering to confirm the column vs an S3 naming-convention alternative.

**Open questions (Ring / data / business).**
- **Webhook contract** (events, payload, classification values) — assume-and-build behind the mapping table; confirm with Ring and adjust the mapping (no code change). Gates end-to-end testing.
- `reaper_minutes`, `max_in_flight`, `ring_lead_ttl` starting values.
- **Economics targets** pending Ring commercials and contribution assumptions.
- How a TL assigns a filtered lead from the listing (existing mechanism to verify).
- Manual-agent hold / scheduled-callback behaviour is recorded in **`call_details`** (`on_hold_reason`, `is_status_call_back_hold`, `disposition`, `customer_status`); confirm whether the order stays assigned to the agent or re-enters the pool in those cases.

**Launch blockers (green before go).** `RING_BOT_USER_ID` created + system-tagged; `ring_outcome` + counter + mapping table live; `call_details` retention path live (Ring row marked `agent_names = "Ring AI"`, recording → S3, transcript reference); Pull endpoint + cap + atomic reserve; two-step CTA (Hot/Warm FIFO, then BAU) + listing deployed; reaper running; retention verified against a real Ring test call; instrumentation capturing the funnel; `modified_on` FIFO/reaper dependency validated.

---

## 12. Appendix: Engineering Implementation Contract

> This appendix proposes an implementation baseline for the pilot. **Engineering may change the implementation, but must preserve all main-PRD behavioural guarantees. Any deviation affecting ownership, queue priority, callback/stale-result safety, artifact retention, or rollout controls requires Product alignment.** Ring API specifics are marked **pending verification** and must be confirmed before go-live; the mapping table absorbs label changes without code.

### A. Current "Assign Order" / BAU query (unchanged baseline)
```sql
SELECT iod.*
FROM   incomplete_order_details AS iod
       INNER JOIN order_details AS od ON iod.order_id = od.order_id
WHERE  od.orderstatus = 49 AND iod.orderstatus = 49
   AND iod.order_value > 900
   AND iod.is_active
   AND iod.cx_modified_on >= NOW() - INTERVAL 1 DAY
   AND iod.cx_modified_on <= NOW() - INTERVAL 30 MINUTE
   AND iod.eligible_for_ranking
   AND iod.assigned_to IS NULL
   AND (iod.rank_again_after IS NULL OR iod.rank_again_after <= NOW())
ORDER BY iod.final_score DESC, iod.order_value DESC
LIMIT 1;
```
This is the **Step-2 fallback** of the agent CTA and is **not modified**; it filters `assigned_to IS NULL`, so it never sees a Ring-touched lead.

### B. Pull endpoint (Ring → Truemeds)
Auth: shared-secret/bearer header over HTTPS (optionally gateway / IP allowlist). Logic:
```
1. if max_in_flight == 0            -> return [], retry_after            # kill switch
2. available = max_in_flight - current_in_flight
3. if available <= 0                -> return [], retry_after
4. select top `available` candidates (D: Ring-selection query,
   ORDER BY final_score DESC, order_value DESC)
5. reserve each atomically (D); keep only winners; counter += winners
6. enrich winners via patient_id; return the lead list
```
Per-lead payload returned to Ring:

| Field | Source | Notes |
|---|---|---|
| `order_id` | `incomplete_order_details` | correlation key — must round-trip on the result |
| `callee_name` | patient/customer | |
| `mobile_number` | patient/customer | |
| `customer_id` | order | |
| `cart_items` | cart | pre-rendered display string (name + qty) |
| `cart_value` | order | in ₹ |
| `discount_amount` | order | in ₹ |
| `address` | patient/customer | display string |
| `eta` | order | in days |

### C. Result webhook & outcome mapping (Ring → Truemeds) — **pending verification**
Expected to carry `order_id` (correlation), a classification, transcript, and a `recording_url`. We map classification → `ring_outcome` via the **config mapping table**, then apply the conditional outcome update (D). Duplicate deliveries update 0 rows → ignored. **Confirm with Ring:** exact event(s), payload shape, classification vocabulary, no-connect representation, recording-link lifetime (assume ~24h). Until confirmed, build against assumed values; only the mapping table changes.

### D. Core SQL

*Three lead-selection queries: **(1)** Ring candidate selection (below); **(2)** agent CTA Step-1 prioritisation — Hot/Warm; **(3)** agent CTA Step-2 BAU (§A, unchanged). Plus the reserve / conditional-outcome / reaper write statements.*

**Ring candidate selection (pull):** today's eligibility query **+** a patient-exists filter.
```sql
SELECT iod.*
FROM   incomplete_order_details AS iod
       INNER JOIN order_details AS od ON iod.order_id = od.order_id   -- order-status source-of-truth guard
WHERE  od.orderstatus = 49 AND iod.orderstatus = 49
   AND iod.order_value > 900
   AND iod.is_active
   AND iod.cx_modified_on >= NOW() - INTERVAL 1 DAY                   -- recent activity clock (NOT created_on)
   AND iod.cx_modified_on <= NOW() - INTERVAL 30 MINUTE
   AND iod.eligible_for_ranking
   AND iod.assigned_to IS NULL
   AND (iod.rank_again_after IS NULL OR iod.rank_again_after <= NOW())
   AND EXISTS (SELECT 1 FROM sub_order_details sod                    -- must have a patient attached
               WHERE sod.order_id = iod.order_id
                 AND sod.patient_id IS NOT NULL)
ORDER BY iod.final_score DESC, iod.order_value DESC
LIMIT :available;                               -- available = max_in_flight - current_in_flight
```
*Query shape and indexing are engineering's to finalize via `EXPLAIN` — JOIN vs `EXISTS` for the status guard; whether `order_details` is needed at all given `iod` is in sync; supporting indexes on `sub_order_details(order_id, patient_id)` and the `iod` filter columns. `created_on` is deliberately **not** a filter: it is fixed at first-SKU and would wrongly exclude carts that cross the ₹900 threshold later — `cx_modified_on` is the correct activity clock. Behaviour must be preserved.*

**Reserve one candidate (per lead in the pull loop):**
```sql
UPDATE incomplete_order_details
SET    assigned_to = :RING_BOT_USER_ID, modified_on = NOW()
WHERE  id = :id AND assigned_to IS NULL;        -- 1 row = lock won, counter += 1
```

**Conditional outcome update (on result; keeps the bot id):**
```sql
UPDATE incomplete_order_details
SET    ring_outcome = :mapped_outcome, modified_on = NOW()
WHERE  order_id = :order_id
  AND  assigned_to = :RING_BOT_USER_ID
  AND  ring_outcome IS NULL;
-- 1 row  -> counter -= 1
-- 0 rows -> late/stale result: ignore for assignment, keep the recording/transcript, log `ring_late_result_ignored`
```

**Reaper (scheduled sweep; stamps no-response, does NOT null assigned_to):**
```sql
UPDATE incomplete_order_details
SET    ring_outcome = 'RING_NO_RESPONSE', modified_on = NOW()
WHERE  assigned_to = :RING_BOT_USER_ID
  AND  ring_outcome IS NULL
  AND  modified_on < NOW() - INTERVAL :reaper_minutes MINUTE;   -- counter -= (rows affected)
-- depends on modified_on reliability (see §11 FIFO/reaper assumption)
```

**Agent CTA — Step 1: HOT then WARM (FIFO, oldest-first):**
```sql
SELECT iod.*
FROM   incomplete_order_details AS iod
       INNER JOIN order_details AS od ON iod.order_id = od.order_id
WHERE  od.orderstatus = 49 AND iod.orderstatus = 49
   AND iod.is_active AND iod.order_value > 900
   AND iod.assigned_to = :RING_BOT_USER_ID
   AND iod.ring_outcome IN ('HOT','WARM')
   AND iod.modified_on >= NOW() - INTERVAL :ring_lead_ttl
ORDER BY CASE iod.ring_outcome WHEN 'HOT' THEN 1 WHEN 'WARM' THEN 2 END,
         iod.modified_on ASC                  -- FIFO clock (see §11 assumption)
LIMIT 1;
-- If 0 rows -> Step 2 = Appendix A (BAU), unchanged.
-- Claim on assign: WHERE id=:id AND assigned_to=:RING_BOT_USER_ID
```

### E. DDL & new objects
```sql
ALTER TABLE incomplete_order_details ADD COLUMN ring_outcome VARCHAR(24) NULL;

-- Ring calls are stored in the existing call_details table (no new table):
--   * one row per Ring call, agent_names = 'Ring AI'  (source marker)
--   * recording downloaded to S3 -> s3bucket_recording_url
--   * transcript stored in S3, referenced by a new transcript_s3_uri column (O5 - engineering to confirm)
ALTER TABLE call_details ADD COLUMN transcript_s3_uri VARCHAR(512) NULL;   -- recommended (O5)

-- plus: RING_BOT_USER_ID as a system-tagged row in the assigned_to-referenced table;
--       an in-flight counter (F); an outcome mapping table (Ring label -> ring_outcome);
--       measurement instrumentation per §10.4 (event log or timestamp columns).
```

### F. In-flight counter — reconciliation & idempotency
- **Definition (source of truth):** `current_in_flight = COUNT(*) WHERE assigned_to = RING_BOT_USER_ID AND ring_outcome IS NULL`.
- **Stored counter (if used):** `+1` per reserved+handed lead; `−1` on (a) first valid result, (b) reaper stamp, (c) send-failure rollback.
- **Idempotency:** decrement only when the conditional update (D) affects **1** row, so duplicate webhooks can't double-decrement; key on `order_id` + `ring_call_id`.
- **Drift control:** reconcile the stored counter against the live `COUNT(*)` on a schedule and alert on mismatch. *(A live `COUNT(*)` per pull avoids drift entirely and is the simpler option.)*

### G. Retention implementation
```
On a Ring result:
  1. write a call_details row for the Ring call: order_id, Ring's call id, agent_names = 'Ring AI'
  2. download recording -> Truemeds S3 (s3bucket_recording_url)
  3. store transcript -> S3 (transcript_s3_uri)        # O5: column vs naming convention - engineering
  4. mark the row stored (retention status)
Failure: retry with backoff within the link lifetime; sweep re-attempts pending/failed; alert on persistent failure.
```

### H. Webhook security & retry/backoff
- Shared-secret/bearer header over HTTPS (Ring has **no HMAC**); optionally behind a gateway / IP allowlist.
- Webhook consumer is idempotent (per F).
- Retry/backoff expectations and any Ring-side delivery retries to be confirmed with Ring (C, pending).

### I. Outcome → action mapping

| `ring_outcome` | `assigned_to` after result | Agent CTA (auto-assign) | TL listing page |
|---|---|---|---|
| `HOT` | `RING_BOT_USER_ID` | Tier 1 (highest), FIFO | Shown; filterable |
| `WARM` | `RING_BOT_USER_ID` | Tier 2, FIFO | Shown; filterable |
| `RING_NO_RESPONSE` | `RING_BOT_USER_ID` | **Excluded** (listing-only) | Shown; filterable; TL may hand-pick |
| `CALLBACK` | `RING_BOT_USER_ID` | Excluded (O3) | Shown; filterable |
| `COLD` | `RING_BOT_USER_ID` | Excluded | Shown; filterable |
| `DECLINED` | `RING_BOT_USER_ID` | Excluded | Shown; filterable |
| *(blank / `NULL`)* | `NULL` | BAU (today's behaviour) | Shown; filterable |

Ring-touched leads keep `assigned_to = RING_BOT_USER_ID`, so the unchanged BAU query (`assigned_to IS NULL`) never serves them — non-Hot/Warm outcomes are parked without touching BAU.

### J. Failure-handling summary
| Failure | Behaviour |
|---|---|
| Hand-off to Ring fails after reserve | Roll back per O2 (stamp terminal + decrement, or release to NULL); never leave a phantom in-flight |
| Late / stale Ring result | Conditional update affects 0 rows → ignore for assignment, keep the recording/transcript, log `ring_late_result_ignored` |
| Ring never returns | Reaper stamps `RING_NO_RESPONSE`, decrements counter |
| Duplicate webhook | Idempotent (no double outcome, no double decrement) |
| Recording fetch fails | Retry with backoff within link lifetime; sweep; alert |
| Counter drift | Scheduled reconciliation vs live `COUNT(*)`; alert |
| Ring over-pulling | Capped by `max_in_flight`; retry-after when full |
| Incident / stop | Kill switch `max_in_flight = 0`; in-flight drains; reaper clears |
