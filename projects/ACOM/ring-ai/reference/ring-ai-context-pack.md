# ACOM 2.0 × Ring AI — Full Context Pack (for a fresh PRD / brainstorm)

*Synthesised from every file in `projects/Acom/ring-ai/` — the two PRDs, the design journal, the engineering walkthrough (+ Signal Catalog), the original BRD, PRD v0.5, the open-questions tracker, and the schema samples. This is a **read-only context brief**, not an edit to any repo doc. It exists so we can start a fresh PRD without re-reading six documents.*

---

## 0. The one-paragraph orientation

Truemeds runs an **Assisted Commerce (ACOM)** team that manually cold-calls every eligible **dropped/incomplete cart** to recover the order. It's capacity-bound, low-converting, and expensive. A **Ring AI** voice-bot POC pre-qualified intent on ~1,300 real leads and roughly **4×'d** human conversion on transferred leads. The project turns that POC into production. Two layers of thinking now exist in the folder: a **future-state vendor-agnostic voice-bot layer** (the ambitious design) and a **Rapid Pilot** (a thin, reversible bolt-on to today's queue that is the *current build target*). A fresh PRD has to decide which of these it is — and reconcile them.

---

## 1. Business case & baseline numbers *(from BRD / POC — Ops+Analytics to re-verify)*

| Metric | Baseline (human-only) | Notes |
|---|---|---|
| Eligible leads/month (patient + address on file) | **~17,000** | the serviceable universe |
| Actually attempted | **~10,000** | **~40% never called** — standing recoverable revenue |
| Lead-assigned → order-placed conversion | **~5%** | the human-only baseline |
| POC bot-transferred-lead conversion | **~20%** | **~4× lift** on ~1,300 real leads |
| Implied manpower saving | **~75%** less | for the same output |
| Total monthly cost (payroll + variable telephony/ops) | **~₹50L** | |
| Orders placed/month | **~20,000** | |
| Cost per order (CPO) | **~₹250** | ₹50L ÷ ~20k |
| Telephony | Knowlarity (packet-loss issues) | TATA under evaluation; "single config change" |
| Commercials | in negotiation | per-call vs outcome-based — CPO target set once closed |

**The prize (both sides of the ledger):** more revenue (reach the full 17k with a faster first touch) **and** lower variable cost (fewer agent-hours per converted order).

**Stakeholder's framing at kickoff:** *"It's an AI voice bot that calls all my incomplete-order customer base. We do this manually, can't cover 100%, spillover day-on-day, bad connectivity, wasting agent bandwidth. Clarify doubts before starting; don't get stuck in a loop."*

---

## 2. Today's flow & data model (the ground truth to build on)

**Flow:** first SKU added → row in `incomplete_order_details` (`iod`), one open incomplete order per customer → cart inactive **≥30 min (and <1 day)** without placement → enters ACOM pool → agent clicks **"Assign Order"** → backend assigns single best eligible *unassigned* order (`final_score` desc, then `order_value` desc) → agent calls to place it. A **team-lead listing page** shows all eligible orders and can filter by `order_id`.

**Today's BAU eligibility query (the untouchable baseline):**
```
orderstatus = 49 (iod AND order_details) · order_value > 900 · is_active
· cx_modified_on in [NOW−1day, NOW−30min] · eligible_for_ranking
· assigned_to IS NULL · (rank_again_after IS NULL OR <= NOW())
ORDER BY final_score DESC, order_value DESC LIMIT 1
```
`assigned_to`: `NULL` = available; `<agent id>` = claimed. The query only returns `assigned_to IS NULL`.

**Tables:**
- **`incomplete_order_details` (`iod`)** — the abandoned-cart working table. Keys: `order_id`, `customer_id`, `order_value`, `final_score`, `assigned_to`, `orderstatus`, `is_active`, `eligible_for_ranking`, `rank_again_after`, `created_on`, `modified_on`, `cx_modified_on`. **`patient_id` is NOT here.** One open incomplete order per customer.
- **`order_details`** — authoritative order/status table (source-of-truth guard for status).
- **`sub_order_details`** — holds `patient_id` per `order_id` (one order → many sub-orders; one patient per cart in practice).
- **`call_details`** — existing telephony (Knowlarity) log. Multiple rows per `order_id`. Has `recording_url` / `s3bucket_recording_url`, `disposition`, `on_hold_reason`, `is_status_call_back_hold`, `agent_names`, `agent_status`, `customer_status`. **No `agent_id` column, no transcript column.**
- **Enrichment sourcing:** `callee_name` = patient's name (via `sub_order_details.patient_id`); `mobile_number` = the **customer** account number (there is no patient-level number).

> ⚠️ **Data check to close:** PRD queries filter `orderstatus = 49`, but the `iod` sample rows show `orderstatus = 39`. Confirm the correct eligible status value before any query is finalised.

---

## 3. The two layers in the folder (and how they differ)

### Layer A — Rapid Pilot *(current build target — `docs/rapid-pilot-prd.md`, Confluence 1850114059)*
A deliberately minimal, reversible **bolt-on to today's ACOM queue**. Proves exactly one thing: *Ring pre-qualifies a controlled slice of incomplete-order leads; Hot/Warm customers re-enter the existing "Assign Order" flow with priority; Ring and humans never call the same order at once.* **Not a slice of the future architecture** — the big architecture is deliberately deferred.

Mechanism in one screen:
- **Pull model.** Ring calls a Truemeds API for work; we hand back reserved, enriched leads up to a cap.
- **`max_in_flight`** caps how many un-resolved leads Ring may hold at once — the rollout lever *and* throttle. **`max_in_flight = 0` = kill switch.**
- **Never-null ownership lock.** A handed lead is stamped `assigned_to = RING_BOT_USER_ID` (atomic compare-and-set on `assigned_to IS NULL`) and **keeps** it for life; only a human overwrites it. So today's BAU query (`assigned_to IS NULL`) ignores Ring-touched leads and stays literally **unchanged**.
- **Outcome** written to a new `ring_outcome` column (`HOT|WARM|COLD|DECLINED|CALLBACK|RING_NO_RESPONSE`) via a **config mapping table** (Ring label → our value). Lock is kept, not released.
- **Two-step agent CTA:** (1) HOT then WARM, FIFO on `modified_on`; (2) fallback = today's BAU query, unchanged.
- **Listing-only (not self-serve):** `RING_NO_RESPONSE / COLD / DECLINED / CALLBACK`. TLs filter by `ring_outcome` and may hand-pick a few to observe.
- **Retention** in existing `call_details` (Ring row = `agent_names = "Ring AI"`), recording → S3, transcript → S3 (proposed `transcript_s3_uri` column). Two rows per `order_id` in the happy path (Ring + human).
- **Safety:** a **reaper** stamps stuck-in-Ring leads `RING_NO_RESPONSE`; kill switch halts hand-outs instantly.
- **Eligibility:** today's pool **+ a `patient_id` EXISTS** filter on `sub_order_details` (Ring needs a patient name to open the call). So Ring's candidate set is a **subset** of the human pool; humans run the unfiltered BAU query.
- **Doc structure:** §1–§11 = binding Product behaviour; §12 = Engineering Implementation Contract (implementation may change; guarantees must hold).
- **Measurement is descriptive, not causal** — Ring works a non-random subset, so no incrementality/lift claim; **no holdout** in the pilot.

### Layer B — Future-state voice-bot layer *(`docs/voicebot-cart-recovery-prd.md` v0.7 + `docs/mvp-engineering-walkthrough.md`)*
The full, scale-safe, **vendor-agnostic** qualification-and-routing layer. Ring AI is the first vendor behind a thin adapter; Truemeds owns normalized outcomes and the engagement tier.

- **Milestones:** **M1** integration foundation + telephony/live-transfer discovery (M1A build / M1B discovery gates) → **M2a** latest-state validation + async agent routing *(committed MVP baseline)* → **M2b** live transfer *(conditional on discovery)* → **M3** configurability/ops controls. **MVP = M1 + M2a (async).**
- **Two ways a hot customer reaches a human:** **live transfer** (best CX, only when an agent is reliably free) vs **async callback** (safe default + fallback).
- **Hard safety gate:** every bot outcome is re-checked against latest Truemeds order/cart state **before any agent acts** (at screen-pop in V1). The payload to the bot is a stale-able **snapshot**, never truth.
- **Two separate gates:** *availability* ("can a human take it now?") vs *order-validity* ("is the cart still actionable?"). No real-time pre-transfer API in V1 (that's V2).
- **Normalized outcomes (Truemeds-owned):** `CONNECTED` (+ engagement tier), `CALLBACK_REQUESTED`, `NOT_CONNECTED`, `WRONG_NUMBER`, `INVALID_NUMBER`, `DO_NOT_CALL`, `VENDOR_FAILED`, `ANALYSIS_PENDING`, `MANUAL_VALIDATION_REQUIRED`. **Engagement tier** (`HOT/WARM/COLD/UNDETERMINED`) is **derived by Truemeds** from Ring's structured classification via a versioned rule — Ring does not hand us our labels.
- **Interaction model:** *we* call the vendor (commands); the *vendor webhooks us* (events); polling is a reconciliation backstop only.
- **Telephony:** MVP runs on **Ring-native** telephony (accepted trade-off, measured). A **Truemeds-owned Telephony Control Plane / BYOT** is a *later, separate platform*, not MVP; M2b builds only the thin live-transfer slice it needs.
- **Signal Catalog:** one configurable catalog; the Ring payload is an approved projection of it per campaign × use-case × script version. **MVP minimum ≈ 15 signals** across launch-gates / correlation-metadata / conversation-context / outcome-validation.
- **Rx/substitution out of scope** — handled by the existing post-placement flow (doctor / HA-pharmacist).
- **Sizing:** live transfer modelled as an Erlang-B **loss system** (Appendix A) — **all inputs assumed; illustrative only**; peak clustering (not average load) is what breaks it.

**Relationship between the layers:** the Rapid Pilot is explicitly **not** the first slice of Layer B. It reuses today's queue to prove value in days; Layer B is the scale-safe platform to build once the model is proven.

---

## 4. Decision log — what is LOCKED (do not reopen unless explicitly asked)

**Rapid Pilot (Layer A):**
| # | Decision | Why |
|---|---|---|
| D1 | First build = **Rapid Pilot** (thin bolt-on), not full MVP | prove value in days, reversibly |
| D2 | **Pull** for the pilot (internals direction-agnostic; Push a future option) | simplest to ship; direction is a commercial call |
| D3 | Throttle via **`max_in_flight`** concurrency cap — *not* a `MOD`/cohort throttle | a MOD on the shared query would also starve the human pool |
| D4 | **Never-null ownership**: `assigned_to = RING_BOT_USER_ID` for life; only a human overwrites | keeps BAU query literally unchanged; parks negatives for free |
| D5 | **Two-step CTA**: HOT→WARM (FIFO on `modified_on`), then BAU unchanged | prioritise qualified leads without rewriting the main query |
| D6 | **RING_NO_RESPONSE / COLD / DECLINED / CALLBACK = listing-only** (not self-serve) | no positive-intent signal; observe a hand-picked sample first |
| D7 | Retention reuses **`call_details`** (Ring row `agent_names = "Ring AI"`) — no new table | multiple rows per `order_id` already supported |
| D8 | Patient eligibility via **`EXISTS` semi-join** on `sub_order_details.patient_id` | avoids row fan-out; Ring needs a patient name |
| D9 | Recency filter = **`cx_modified_on`** window, **not `created_on`** | `created_on` is fixed at first-SKU; a cart can cross ₹900 later |
| D10 | **No controlled holdout / incrementality experiment** in the pilot | a valid holdout is its own milestone, not a days-scale pilot |
| D11 | Doc = **Product (§1–11, binding) + Eng Contract (§12, changeable)** | behaviour is Product-owned; implementation is engineering's |
| D12 | **Descriptive five-layer metrics**, not Hot/Warm-vs-BAU as causal proof | Hot/Warm are post-Ring labels; don't over-claim lift |
| D13 | Keep `order_details` join only as the `orderstatus` source-of-truth guard | `iod` mirrors status but `order_details` is authoritative |

**Future-state (Layer B):** vendor-agnostic adapter + Truemeds-owned normalized outcomes; payload = snapshot + mandatory latest-state re-validation; **async MVP first (M2a), live transfer conditional (M2b)**; availability vs order-validity as two separate gates (no pre-transfer API in V1); **Ring-native telephony for MVP**, control plane deferred; we call the vendor, vendor webhooks us; backend/admin config (M3), not self-serve; **live transfer A/B-gated on *delivered* orders before scale-up**; engagement tier Truemeds-derived; retry policy Truemeds-owned/versioned/guardrailed; one Signal Catalog with a configured payload projection.

## 4b. Reversals worth remembering (why we changed our minds)
- **`MOD` cohort → `max_in_flight`.** A MOD on the *shared* eligibility query would shrink the human pool too; a concurrency cap throttles Ring alone.
- **Holdout added → removed.** A senior review pushed a 10% BAU holdout for a clean ITT read; on reflection a valid holdout needs durable cohorts + protected control + capacity-fallback — its own milestone, not a days pilot.
- **RING_NO_RESPONSE: above BAU → interleave → listing-only.** "Ring couldn't reach them" carries no positive intent; observe a sample first.
- **`created_on` → `cx_modified_on`.** (Stakeholder catch, not in the doc.)
- **New retention table → reuse `call_details`.**
- **Own telephony (BYOT) → Ring-native for MVP.** The POC already produced its lift *without* our telephony; control plane reframed as a later, vendor-agnostic platform.
- **BRD "Ring pulls orders" framing → Truemeds-owned orchestration** (future-state: we initiate the call; Rapid Pilot keeps Pull but we still reserve/own state).

---

## 5. Ring AI — verified vs pending (from docs.ringg.ai)

**Verified / resolved:**
- Endpoint (v0.5): `POST /calling/outbound/individual`, base `https://prod-api.ringg.ai/ca/api/v0`, header `X-API-KEY` (server-side). **v1 marked deprecated → pool-based v2** (auto number rotation/spam-skipping) — confirm which to build against.
- Required fields: `name`, `mobile_number` (E.164), `agent_id` (pin a `version_id`), exactly one of `from_number_id` / `from_number`.
- `custom_args_values` echoes on **every** webhook event (so a correlation id like `bot_attempt_id`/`order_id` round-trips).
- **Six webhook events**; `all_processing_completed` is the **consolidated terminal event** to normalize off (carries status, `platform_analysis` incl. `classification` + `callback_requested`/`callback_requested_time`, `client_analysis`, transcript, `recording_url`).
- **`recording_url` valid ~24h** → must download to Truemeds S3 promptly.
- Webhook auth = **shared-secret / bearer header, NO HMAC**.
- **Three distinct "retries" — do not conflate:** (1) BRD conversation-SOP re-attempts (narrative only); (2) **webhook-delivery** retry — initial + 3 at 10s/1m/2m, 30s timeout (this is the "~4 attempts" figure, about *event delivery* not dialling); (3) **outbound call** retry via `call_config.call_retry_config` (`retry_count`, per-reason delays; vendor default 30 min) — Truemeds-owned/vendor-executed.
- Reconciliation: Get Call Details / Get Call History. Cancellation: Terminate API.

**Still pending (confirm with Ring):** exact pilot webhook contract & classification vocabulary (assume-and-build behind the mapping table); no-connect representation; whether `wrong_number` / `callback_requested` are reliable per branch; concurrency/rate limits; language support (Hindi/Hinglish/English + transliteration); recording/transcript retention & stitchability; test/staging workspace; **real-time mid-call opt-out** (today opt-out is post-call only — a feature request); live-transfer modes/DIDs/CLI (M2b / control-plane, not MVP).

---

## 6. Open decisions & questions (the brainstorming surface)

**Rapid Pilot open decisions (PRD §11):**
- **O1 — RING_NO_RESPONSE placement** — listing-only for now; revisit (promote/demote/keep) with data.
- **O2 — Send-failure rollback** — reserved+counted but hand-off fails: stamp terminal + decrement, or release to `NULL` for BAU.
- **O3 — CALLBACK** — listing-only; a scheduled callback-time column + "don't surface until due" gate is a later option (needs webhook to confirm Ring sends a time).
- **O4 — `ring_lead_ttl`** — how long a Hot/Warm lead stays in the CTA.
- **O5 — Transcript storage** — recommend `transcript_s3_uri` column on `call_details`; engineering to confirm vs an S3 naming convention.
- Plus starting values for **`reaper_minutes` / `max_in_flight` / `ring_lead_ttl`**; **economics targets** (pending commercials); the **listing-page assignment mechanism**; manual-agent hold/scheduled-callback behaviour in `call_details` (does the order stay assigned or re-enter the pool?).

**Future-state open questions (grouped by owner — full list in `open-questions-tracker.md`):**
- **Engineering [DISCOVERY]:** source-of-truth data model for dropped order/cart/customer/address/payment; is the dropped order an order/cart/lead object; why a new order ID in the assisted flow; linkage dropped↔final order; atomic bot lock + timeout; latest-state fetch within latency (incl. screen-pop); where to store call-id/snapshot/raw-webhook/normalized-outcome/transfer-events; reconciliation; change-detection after handover; dedup bot vs human; screen-pop feasibility (CLI vs DID+number); Doctor→HA transfer pattern reference; reporting coverage; feasible config controls; **pull-allocation atomic-claim CRM support**; agent-category config; cart-concurrency (agent + customer editing the same live cart).
- **Ring [RINGG]:** production endpoint, payload limits, terminal event, structured fields, retry behaviour, recording/transcript expiry & stitchability, concurrency, language, live-transfer modes, test workspace.
- **Telephony [TELCO]:** dedicated Ring transfer DID/queue; CLI to HA; metadata to portal; route to selected agents; expose HA availability; log/stitch transfer legs; monitor queue/abandonment.
- **Ops [OPS]:** POC eligibility segment & safe traffic %; live-transfer eligibility (Hot-only?) & staffing & max wait; bot script pre-transfer & on-failure; callback SLAs; frequency caps; success metrics; suppress-vs-manual matrix; Ops vs Product approval.

---

## 7. Metrics framing (carry into a fresh PRD)

**Rapid Pilot — five descriptive layers:** (1) Ring funnel; (2) qualification quality (conversion by HOT/WARM, expect HOT>WARM); (3) human productivity (placed per picked lead / connected call, Ring lane vs BAU lane, descriptive); (4) **safety & operational health = hard scale gates** (duplicate contacts = 0, stuck locks, stale results ignored, API/webhook failure rate, retention success, reaper rate, complaints/opt-outs); (5) economics (CPO per placed order — targets TBD on commercials). **Primary conversion event = order placed/confirmed within 24h of human assignment.** Delivered/cancelled = downstream quality check.

**Future-state adds:** live-transfer connect/wait/abandon/fallback rates; per-DID pickup/spam; and the **A/B gate on delivered-order conversion** before any live-transfer scale-up.

---

## 8. How the stakeholder works (apply to the rewrite)
- **Markdown is the source of truth**; Confluence/HTML are generated from it.
- **Present → debate → agree → then edit.** Don't edit during brainstorming; surface changes for review first.
- **Never sync to Confluence/Atlassian unless explicitly told "sync."**
- Concise, external-reader prose; no meta-scaffolding, no narrating the process into the doc; don't over-flag or over-engineer; distinguish a real blocker from a nit.
- Don't invent Ring API fields — verify from docs.ringg.ai or mark clearly as pending.
- Escalate rather than stall on unknowns; *"don't get stuck in a loop."*

---

## 9. The forks a fresh PRD has to resolve first
1. **Which PRD are we rewriting?** The **Rapid Pilot** (tighten/restart the thin bolt-on), the **future-state layer** (the scale-safe platform), or a **new unified doc** that sequences pilot → platform in one narrative?
2. **What triggered "start fresh"?** New info from the POC/commercials, an engineering discovery answer, a scope change, or dissatisfaction with the current doc's structure? (This decides whether locked decisions in §4 are still locked.)
3. **Altitude/audience** — Product-binding + Eng-contract (Rapid Pilot's two-layer split), or the mixed business+engineering shape of the future-state PRD?
4. **Has anything in §5 (Ring) or §2 (data model) been confirmed since** — e.g. the `orderstatus` 39-vs-49 question, the webhook contract, the linking key — that should now move from "pending" to "verified"?

---

*Sources: `CLAUDE.md`, `DESIGN_JOURNAL.md`, `docs/rapid-pilot-prd.md`, `docs/voicebot-cart-recovery-prd.md`, `docs/mvp-engineering-walkthrough.md`, `docs/open-questions-tracker.md`, `reference/original-handoff.md`, `reference/ringg-integration-brief.docx` (BRD), `reference/ringg-integration-prd-v0.5.docx`, `reference/schema-samples/*.csv`.*
