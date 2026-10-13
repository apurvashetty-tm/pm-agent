# project_truth.md — Project South
**Status:** [LOCKED where marked; everything else [RECOMMENDED] or [OPEN DECISION] until Swapnil locks it]
**Last updated:** 2026-09-29

---

## 1. Problem statement [LOCKED — per Swapnil, Entry 1]
There is measurable discard/drop-off in the Doctor-call flow caused by **language mismatch** between the assigned doctor and the customer. This has not been previously scoped or named in the `pm-agent` repo (confirmed via full-repo + all-branch search) — Project South is a new hypothesis, not a validated, already-measured root cause. `INIT-04 Discard Intelligence` (Q2 roadmap) is the initiative meant to produce discard root-cause data generally, but had not attributed specific causes as of its last repo update.

## 2. Existing analogous pattern this solution is modeled on [LOCKED — confirmed in repo]
**NFS / HGS specialist-pool bypass logic:** certain medicines require a specific doctor specialization (`DOCTOR_CATEGORY`: `DR_CATEGORY_ONE`–`FIVE`). Orders needing that specialization bypass normal pool logic and route strictly into the matching category's pool. Mechanics (from `archives/projects/hgs-nfs-phase1/prds/PRD-HGS-Phase1.md`):
- Pull-based FIFO within pool, row-locked (no two doctors grab the same order).
- 4-minute assignment window before auto-return to pool.
- Hold cap of 20 attempts before escalation to a manual "Max Attempt Team" queue.
- `SPLIT_ORDER` (needs 2+ categories at once) **never auto-assigns** — always manual Super Doctor assignment.
- Doctor hours: 08:00–22:00. `promised_doctor_call_time` is the SLA.

This is the mechanic Swapnil is proposing to reuse for language.

## 3. Baseline solution proposal — "Layer 0" [RECOMMENDED — Swapnil's proposal, Entry 2, not yet built or approved]
1. Doctor has a `language` attribute today in production tables. **[USER-PROVIDED, unconfirmed table/column — see Open Question OQ-1]**
2. New static lookup table: `pincode → preferred_language` (pincode-language master).
3. On order receipt: resolve order's pincode → preferred language → route into that language's doctor pool, same bypass mechanic as the NFS category pool.
4. Full deep-dive, stakeholder analysis, edge cases, and alternative approaches: [`docs/brainstorm/solution-layers.md`](../brainstorm/solution-layers.md).

## 4. Never silently invent final truth for
- Whether `language` actually exists as a doctor attribute in production, and which table/column it lives in, and how it was populated (self-declared at onboarding? verified? inferred?).
- Pincode → language mapping source, accuracy, and how mixed/migrant/multi-language pincodes are handled.
- Current per-language doctor headcount/capacity — without this, pool-starvation risk (OQ-3) cannot be sized.
- Whether `INIT-04 Discard Intelligence` has since produced actual root-cause data attributing some % of discard to language — check with Apurva/Analytics before pitching this externally as *the* fix rather than *a* candidate fix.
- Interaction behavior when an order needs BOTH an NFS specialist category AND a language match (pool intersection) — not defined anywhere yet (OQ-4).

## 5. Related repo context (for continuity)
Full current-state research (Doctor Portal, assignment mechanics, discard docs, gaps) was captured in-chat on 2026-09-29 — see [`docs/context/narration_log.md`](narration_log.md) Entry 1 for the trigger and file-path index of every repo source cited.

---

## 6. Scope [LOCKED — Swapnil, narration Entry 6, 2026-09-29]
**In scope**
- Doctors can speak **multiple languages** (e.g. Tamil + English + Hindi).
- Route orders to doctors by language, **starting with South pincodes (GTM region)**, because South has the higher drop.
- **Supply callout:** plan future doctor demand per language from current pincode order trends.

**Future scope (not now)**
- Knowing the customer's own language (asking at checkout, via WhatsApp, customer profile, etc.).
- Instant recovery / "hand over" button after a mismatch.

**Not in scope**
- Removing the dependence on voice (chat consultations, questionnaires, translation).

**Stated by Swapnil:** time / attempt limits are **not** the blocker.

## 7. Business case [USER-PROVIDED — Aug data, ex-Bangalore, narration Entry 6]
- South FTC OP→WH reached (Dr confirm): **72.04% → 76.49%** target (Non-South parity), **+4.46pp**
- Impact: **+1,091 confirmed/month → +774 delivered/month → +25 delivered orders/day**
- OP2OD: **+3.16pp** South FTC, **+0.96pp** South all orders
- NFTC South discard (6.31%) is **at parity with or slightly better than** Non-South (6.49%). **The gap is FTC-only.**

## 8. Decisions [LOCKED — Swapnil, narration Entry 7, 2026-09-29]
- Route **all** South orders (FTC and NFTC) by language. No FTC / NFTC split.
- Proceed on the current sizing. The pilot with a control group validates the impact. No attribution study before building.

## 9. Decisions [LOCKED — Swapnil, narration Entry 9, 2026-09-29]
- **One language per pincode** is the solution being closed.
- A language mix per pincode (coverage score, bilingual/multilingual routing) is **future scope**.
- The solution is worked through step by step in `docs/solution/step-by-step.md`.

## 10. Doctor language data [LOCKED — Swapnil, narration Entry 10, 2026-09-29]
- **Correction:** doctor language is **not** stored in any DB table today. The Entry 2 claim is superseded. The data is maintained separately, outside the DB.
- **Decision:** add a new column on the doctor table, filled with the languages Ops provides as a **comma-separated** value (e.g. `TAMIL,ENGLISH,HINDI`). Routing reads this column.

## 11. Allocation rules [LOCKED — Swapnil, narration Entry 13, 2026-09-29]
- **NFS orders:** always the highest priority. They **never** enter the Language Pool.
- **Today's LIFO → FIFO ordering is kept**, including inside the Language Pool.
- **Flow:** Language Pool (doctors who speak L and are available) → after **T operational hours**, released to the **normal flow**.
- **T runs only during operational hours.** The existing doctor **availability flag** is used for eligibility.
- **R7 kept:** a language with no or too few doctors is inactive and goes to the normal flow.
- **Super Doctor manual assign bypasses the language check completely.** Super Doctor gets visibility of Language Pool pending orders.
- **Future scope:** nudges/alerts before release; Super Doctor release/extend buttons.

## 12. GTM [LOCKED — Swapnil, narration Entry 15, 2026-09-29]
- **South is the GTM and experiment region.** The experiment runs across South (not a single language), with a control group.
- After South proves out: roll out to 100% of South, then **extend to other regions**.
