# Context primer — ACOM 2.0 × Ring AI

*Scoped `CLAUDE.md` for this project folder. Fast onboarding for any agent working on this project: current state, the rules of the road, and where the detail lives.*

## Workspace memory

Before project-specific work, also read:
- `../../AGENTS.md`
- `../../context/Claude.md`
- relevant files in `../../knowledge/context/`

Use project-local files for project truth and handoff. Use root knowledge files only for reusable company/system context.

## What this is
Truemeds is adding **AI voice pre-qualification** to dropped-cart (incomplete-order) recovery, with **Ring AI** as the first vendor. There are two layers of work:
- **Rapid Pilot** — the **current build target**. A thin, reversible bolt-on to today's ACOM "Assign Order" flow. Canonical spec: **`docs/rapid-pilot-prd.md`** (also on Confluence, page 1850114059).
- **Future-state** — the full vendor-agnostic voice-bot layer: `docs/voicebot-cart-recovery-prd.md` + `docs/mvp-engineering-walkthrough.md`. Context, not the immediate build.

Read **`DESIGN_JOURNAL.md`** for *why* things are the way they are (and what we tried and dropped).

## Rapid Pilot in one screen
- **Pull model.** Ring calls a Truemeds API for work; we hand back reserved, enriched leads up to a cap.
- **`max_in_flight`** caps how many leads Ring may hold un-resolved at once. It's the rollout lever *and* the throttle. `max_in_flight = 0` = kill switch.
- **Ownership lock, never nulled by Ring.** A lead handed to Ring is stamped `assigned_to = RING_BOT_USER_ID` (atomic compare-and-set on `assigned_to IS NULL`) and **keeps** that until a human is assigned. So today's BAU query (`assigned_to IS NULL`) ignores Ring-touched leads and stays **unchanged**.
- **Outcome** is written to a new `ring_outcome` column (`HOT|WARM|COLD|DECLINED|CALLBACK|RING_NO_RESPONSE`) via a **config mapping table** (Ring label → our value); the lock is **kept**, not released.
- **Two-step agent CTA:** (1) `HOT` then `WARM`, FIFO on `modified_on`; (2) fallback = today's BAU query, unchanged.
- **Listing-only (not self-serve):** `RING_NO_RESPONSE`, `COLD`, `DECLINED`, `CALLBACK`. TLs filter by `ring_outcome` and may hand-pick.
- **Retention** in existing `call_details` (Ring row = `agent_names = "Ring AI"`), recording → S3, transcript → S3 (`transcript_s3_uri`, pending eng confirm). Two rows per `order_id` in the happy path (Ring + human).
- **Safety:** a **reaper** stamps stuck-in-Ring leads `RING_NO_RESPONSE`; the kill switch halts hand-outs instantly.
- **Three lead-selection queries:** Ring candidate (BAU eligibility **+** patient `EXISTS`), prioritisation (Hot/Warm), and human BAU (unchanged).

## Data model you need
- `incomplete_order_details` (`iod`) — abandoned-cart table. Key cols: `order_id`, `customer_id`, `order_value`, `final_score`, `assigned_to`, `orderstatus`, `is_active`, `eligible_for_ranking`, `rank_again_after`, `created_on`, `modified_on`, `cx_modified_on`. New col added by the pilot: `ring_outcome`. **One open incomplete order per customer.**
- `order_details` — authoritative order/status table (source-of-truth guard for `orderstatus=49`).
- `sub_order_details` — has `patient_id` per `order_id` (one order → many sub-orders; one patient per cart). The Ring eligibility filter is `EXISTS (… patient_id IS NOT NULL)`.
- `call_details` — existing telephony log; multiple rows per `order_id`; `recording_url`/`s3bucket_recording_url`, `disposition`, `on_hold_reason`, `is_status_call_back_hold`, `agent_names`, `agent_status`. **No `agent_id` column, no transcript column.**
- Enrichment sourcing: `callee_name` = the patient's name (from `sub_order_details.patient_id`); `mobile_number` = the **customer** account number (no patient-level number).

## Guardrails — do NOT do these (settled)
- **Don't add a `MOD`/cohort throttle** or a **holdout/incrementality experiment** to the pilot.
- **Don't release the lock to `NULL`** on a Ring result — keep `assigned_to = RING_BOT_USER_ID`.
- **Don't put RING_NO_RESPONSE (or COLD/DECLINED/CALLBACK) into self-serve** — listing-only.
- **Don't filter on `created_on`** — use `cx_modified_on` (activity), 30 min–1 day.
- **Don't create a new artifacts table** — retention goes in `call_details`.
- **Don't modify the BAU query** — it's the unchanged Step-2 fallback.
- **Don't invent Ring API fields** — verify from docs.ringg.ai or mark pending; the webhook contract is assume-and-build behind the mapping table.

## Open items to close (PRD §11)
O1 RING_NO_RESPONSE placement · O2 send-failure rollback · O3 CALLBACK scheduling · O4 `ring_lead_ttl` · O5 transcript storage. Plus: Ring webhook contract, `reaper_minutes`/`max_in_flight`/`ring_lead_ttl` starting values, economics targets, listing-page assignment mechanism.

## How to work here (stakeholder norms)
- **Markdown is the source of truth**; Confluence/HTML are generated from it.
- **Present → debate → agree → then edit.** Don't edit during brainstorming; surface changes for review.
- **Never sync to Confluence/Atlassian unless explicitly told "sync."**
- Concise, external-reader prose; no meta-scaffolding or filler; don't over-flag or over-engineer.
- The PRD is **two-layer**: §1–§11 = required Product behaviour (binding); §12 = Engineering Implementation Contract (implementation may change, guarantees must hold).

## Pointers
- Current build spec → `docs/rapid-pilot-prd.md`
- Why/history → `DESIGN_JOURNAL.md`
- Future-state → `docs/voicebot-cart-recovery-prd.md`, `docs/mvp-engineering-walkthrough.md`
- Open questions → `docs/open-questions-tracker.md`
- Schema samples → `reference/schema-samples/`
- Confluence: *ACOM 2.0 — Ring AI Rapid Pilot PRD* (page 1850114059, space PROD)
