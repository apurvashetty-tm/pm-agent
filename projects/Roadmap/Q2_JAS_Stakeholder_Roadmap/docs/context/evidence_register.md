# Evidence Register - JAS Q2 Operating Plan

**Status:** CANONICAL v1.0  
**Owner:** Apurva / assigned truth steward  
**Last updated:** 2026-07-14

This file owns numeric and factual claim provenance. Strategy belongs in `project_truth.md`; owners and due dates for missing data belong in `open_questions.md`.

## 1. Status vocabulary

| Status | Meaning | Allowed use |
|---|---|---|
| FILE-VERIFIED | Claim appears directly in supplied workbook, PDF, or image. Business definition may still need validation. | State directly only when source is internally consistent and definition is clear; otherwise say `source reports`. |
| USER-SUPPLIED | Claim came from user discussion and is not present in supplied evidence. | Label `working baseline` or `user-supplied`; request validation. |
| DERIVED | Arithmetic performed from cited inputs. | Show formula and inherit uncertainty of inputs. |
| HYPOTHESIS | Expected future result, aspiration, or conservative planning assumption. | Use `hypothesis`, `aspiration`, or `to prove`; never use as achieved target. |
| UNKNOWN | Required value or definition does not exist in current evidence. | Show as data request; never fill with estimate silently. |
| CONFLICTED | Source contains incompatible values or definitions. | Prohibited from CEO claim until reconciled. |

## 2. Source manifest

| Source ID | File | Exact scope | Role and caveat |
|---|---|---|---|
| SRC-Q1 | `inputs/evidence/Q1_Retro.xlsx` | `Sheet1!A2:C16` | Q1 initiative list and self-reported impact/status. Raw source preserved. |
| SRC-INC | `inputs/evidence/MUM-DEV_Incident_Log.pdf` | Pages 1-6 | Manual reconstruction of support-channel incidents. Counts are not raw chat analytics. |
| SRC-WB-1 | `inputs/whiteboards/20260711_165705.jpeg` | Whole image | Early metric/initiative brainstorming. Reference only; strategy extraction complete. |
| SRC-WB-2 | `inputs/whiteboards/20260711_180937.jpeg` | Whole image | Discard/payment/portal discovery brainstorming. Reference only. |
| SRC-WB-3 | `inputs/whiteboards/20260711_185654.jpeg` | Whole image | Named July-August-September assignment shorthand. Useful for capacity clues, not initiative lifecycle commitments. |
| SRC-CHAT | Referenced ChatGPT conversation `6a54f1b0-0240-83ee-b78c-082831322344` plus current Codex continuation; canonically transcribed into this register and `project_truth.md` | Through 2026-07-14 | User-authoritative strategy and working baselines; original discussion is provenance, not independent data validation. Archived summary is incomplete and non-authoritative. |

## 3. Q1 retrospective claims

| Claim ID | Claim | Value / unit | Period / denominator | Status | Source locator | Allowed wording / caveat |
|---|---|---|---|---|---|---|
| Q1-01 | Doctor Portal order-flow fix released | Jun 23; correct CTAs; Transfer CTA only during HA-call flow; SOP/training completed | Release milestone | FILE-VERIFIED | SRC-Q1 `A2:C2` | Delivered milestone; impact/adoption unavailable. |
| Q1-02 | Skip HA visibility change produced numeric adoption signal | ~150% increase in daily single skips; 9.2% increase in total daily skips | Definition and comparison window missing | FILE-VERIFIED | SRC-Q1 `A3:C3` | Say `workbook reports`; do not convert to order completion or customer impact. |
| Q1-03 | NFS regulated-drug selling current run-rate | ~Rs50 L/month, based on order digitised value | Monthly; source says `currently`; as-of date unknown | FILE-VERIFIED | SRC-Q1 `A4:C4` | Canonical initiative name is NFS per user. `A4:B4` says NPS; `C4` says NFS. |
| Q1-04 | Full historical NFS basket peak | ~Rs2 Cr/month | Historical peak constructed across categories stopped at different times | FILE-VERIFIED | SRC-Q1 `C4` | Opportunity reference, not current addressable revenue or realised impact. |
| Q1-05 | Phase 1 NFS opportunity/target | Source states ~Rs1.4 Cr/month | Monthly historical peak claim | CONFLICTED | SRC-Q1 `C4` | Listed historical category peaks sum to Rs124 L/month excluding ED, whose historical peak is absent. Reconcile before CEO use as precise total. |
| Q1-06 | Upfront Payment impact analysis | Analysis ongoing | No period | FILE-VERIFIED | SRC-Q1 `A5:C5` | Impact measurement pending. |
| Q1-07 | Multiple DID impact/configurability | Impact not measured; fallback manually configured through DB | Current-state statement | FILE-VERIFIED | SRC-Q1 `A6:C6` | Do not claim connectivity improvement. Useful evidence for Core Configuration & Controls. |
| Q1-08 | Payment Revamp rollout | 12 warehouses; 50% live on Jul 9 | Q2 current-state milestone for Q1-built service | FILE-VERIFIED | SRC-Q1 `A7:C7` | Label Q1-built carryover; not Q1 customer/business impact. |
| Q1-09 | Voicebot Phase 1 adoption | Answering 22% of total platform call volume | Period and eligibility unknown | FILE-VERIFIED | SRC-Q1 `A10:C10` | `Answering` does not prove containment, FCR, resolution, quality, or CPO. |
| Q1-10 | HA Subs Skip analysis | Analysis yet to come | No period | FILE-VERIFIED | SRC-Q1 `A11:C11` | Impact measurement pending. |
| Q1-11 | Seven listed initiatives lack impact entry | Value Meds, Cost Absorption, Cancellations via CSR, Fraud Fixes, COD Blocking, Prescription fixes, HA/Doctor confirmation fixes | Q1 retro inventory | FILE-VERIFIED | SRC-Q1 `A8:C9`, `A12:C16` | Show as impact unavailable; do not infer. |
| Q1-12 | Q1 measurement maturity classification | 15 initiatives: 3 numeric signals, 2 delivery/rollout statements, 3 explicit pending/unmeasured, 7 blank impacts | Workbook rows A2:A16 | DERIVED | Derived from SRC-Q1 | Use `numeric signals`, not `quantified outcomes`; categories are editorial classification. |

## 4. Portal incident claims

| Claim ID | Claim | Value / unit | Period / denominator | Status | Source locator | Allowed wording / caveat |
|---|---|---|---|---|---|---|
| INC-01 | Named standing defect families | 21 | Manual review of support-channel history | FILE-VERIFIED | SRC-INC p1, pp2-5 | Safe headline: `21 named recurring defect families in source review`. |
| INC-02 | Closure status at source snapshot | 20 resolved; 1 open | Source snapshot | FILE-VERIFIED | SRC-INC p1, pp2-5 | Safe appendix/core supporting fact. |
| INC-03 | Remaining prescribe defect impact | Source reports ~1,800 -> ~200 impacted orders/day after mitigation | Daily impacted orders; definition not supplied | FILE-VERIFIED | SRC-INC p1, p3, p6 | Say `source reports`; not independently validated. |
| INC-04 | Longest-running defect | Source headline reports 105 days | Active-window method spans dates beyond stated Apr-Jun review | FILE-VERIFIED | SRC-INC p1 | Appendix only unless method reconciled. |
| INC-05 | Headline activity estimate | ~255 pings; ~1,350 replies | Manual estimate across quarter | CONFLICTED | SRC-INC p1 | Prohibited until reconciled with row table. |
| INC-06 | Sum of 21 row-level activity values | 188 pings; 1,495 replies | Sum of rows on pp2-5 | DERIVED | Derived from SRC-INC pp2-5 | Conflicts with INC-05. Do not choose one silently. |

Method note: PDF says incidents were manually hand-tagged; replies are rough proxy for engineering effort. PDF metadata title says `20 Standing Defects`, while rendered content consistently presents 21. Use rendered content and keep metadata mismatch noted here.

## 5. Q2 working baselines and hypotheses

| Claim ID | Area | Claim/value | Unit / denominator / period | Status | Source | Allowed wording / validation |
|---|---|---|---|---|---|---|
| BASE-01 | Scale | ~28,000 orders/day | Daily order base; date and placed/delivered definition unknown | USER-SUPPLIED | SRC-CHAT | Working scale reference only; validate with Analytics. |
| BASE-02 | Doctor | Rs23.84 | Doctor-call cost per placed order; May working baseline | USER-SUPPLIED | SRC-CHAT | Secondary business baseline; primary Doctor outcome remains effort/quality/compliance. |
| BASE-03 | Assisted Commerce | Rs4.32 | Cost per overall placed order; May working baseline | USER-SUPPLIED | SRC-CHAT | Preserve denominator. |
| BASE-04 | Assisted Commerce | ~Rs150 | Per assisted order created and delivered; user described as order `touched`; May working baseline | USER-SUPPLIED | SRC-CHAT | Denominator wording requires Finance/operations confirmation. Never compare directly with BASE-03. |
| BASE-05 | Assisted Commerce | ~15,000/month; ~500/day | Current assisted output | USER-SUPPLIED | SRC-CHAT | Eligible lead pool unknown. |
| BASE-06 | Ring AI | ~5% human baseline -> ~20% POC high-intent conversion | Assisted lead conversion; cohort/sample/period unknown | USER-SUPPLIED | SRC-CHAT | POC signal only; scale and incrementality unproven. |
| HYP-01 | Ring AI | 12.5% scaled conversion | 5% + 50% x (20%-5%) | HYPOTHESIS | Derived from BASE-06 | Conservative scale hypothesis, not achieved target. |
| DER-01 | Ring AI | 2.5x baseline conversion | 12.5% / 5% | DERIVED | BASE-06, HYP-01 | Use only beside HYPOTHESIS label. |
| BASE-07 | CSR | Rs14/order | CSR CPO; period and exact denominator unknown | USER-SUPPLIED | SRC-CHAT | Requires Finance definition. |
| HYP-02 | CSR Voicebot Phase 2 | Rs9/order | CSR CPO aspiration | HYPOTHESIS | SRC-CHAT | Must be connected to eligible containment and quality guardrails. |
| BASE-08 | COD | Rs9.17/order | COD-related CPO; period unknown | USER-SUPPLIED | SRC-CHAT | Component scope unknown; Juspay cannot claim direct reduction. |
| BASE-09 | Online PG | Rs3.69/order | Online PG CPO; period unknown | USER-SUPPLIED | SRC-CHAT | Separate MDR/commercials, failed-payment cost, and support/operations cost. |
| BASE-10 | RTO | Rs3.45/order | RTO CPO; period unknown | USER-SUPPLIED | SRC-CHAT | Payment-at-cart cohort must prove effect. |
| BASE-11 | Reconnection | ~250 customers making repeated callback-related contacts | Daily period inferred from comparison with daily orders; unique customers/orders, deduplication and overlap unknown | USER-SUPPLIED | SRC-CHAT | High-intent demand signal, not recovered-order result. Validate period and uniqueness. |
| DER-02 | Reconnection | ~0.89% directional ratio | 250 customers / 28,000 orders | DERIVED | BASE-01, BASE-11 | Numerator is customers and denominator is orders; populations may overlap or misalign. Never present as clean incidence rate. |
| BASE-12 | Returns & Refunds | ~1,500 inbound + ~400 outbound calls | Period, unique cases, repeat rate, team size, and cost unknown | USER-SUPPLIED | SRC-CHAT | Trust/friction signal; no rate or CPO claim yet. |
| BASE-13 | Portal | ~50% of portal bandwidth spent on debugging/clutter | Period and capacity method unknown | USER-SUPPLIED | SRC-CHAT | User estimate; do not present as verified baseline. |
| BASE-14 | HA Substitution | HA currently sees one substitute option | Current product constraint | USER-SUPPLIED | SRC-CHAT | Validate current variants before final wording. |
| CAP-01 | Engineering | 6 active engineers | Working planning count | USER-SUPPLIED | SRC-CHAT, supported directionally by SRC-WB-3 | Whiteboard shows one additional blank/unallocated row; validate roster. |
| CAP-02 | Engineering mix | 2 Payment + 4 Portal/Platform | Working planning representation | USER-SUPPLIED | SRC-CHAT, SRC-WB-3 | Names removed from CEO view; role mapping needs confirmation. |
| CAP-03 | Product | 1 SPM; 0 execution PM/APM | Current operating model | USER-SUPPLIED | SRC-CHAT | Basis for capacity discussion; validate approved headcount/status. |
| CAP-04 | Engineering grade mix | 4 SDE2 + 2 SDE1 | Working team composition | USER-SUPPLIED | SRC-CHAT | Preserve for internal capacity context; validate roster before CEO use. |

## 6. Data-request register

Owners, request dates, delivery dates, and blockers are tracked in `open_questions.md` using same IDs.

| ID | Required data product | Minimum output | Decision unlocked |
|---|---|---|---|
| DR-01 | OP -> OD definition and baseline | Numerator, denominator, cohort window, cut-off, attribution, current baseline | Headline Order Completion measurement and initiative contribution. |
| DR-02 | CPO definition pack | Finance-approved numerator, denominator, allocations, period, placed/delivered/touched variants | Comparable cost baselines and no double counting. |
| DR-03 | Discard Intelligence | Stage, payment method/state/return path, order category, customer/call cohort, root cause, recoverability, value, owner | Identify and prioritise controllable discard levers. |
| DR-04 | Payment funnel | Entry page, intent, attempt, PG, outcome, retry, return state, order state, cancellation/RTO/delivery | Checkout/Juspay hypothesis and clean online/COD attribution. |
| DR-05 | Contact/friction model | Customer, order, stage, reason, channel, inbound/outbound, resolution, repeat, callback TAT | CRM scope, FCR, product-backward friction, and future automation. |
| DR-06 | Voicebot cost bridge | Eligible volume, containment, transfer, FCR, repeat contact, quality, human minutes/cost avoided | Test HYP-02 safely. |
| DR-07 | Doctor baseline | Consultation duration, workflow effort, completion, quality/compliance, rework, escalation, portal error/intervention | Doctor Experience targets and proof. |
| DR-08 | R&R funnel | Period, unique cases, repeat rate, team size/cost, channel, eligibility, evidence, approval, pickup, refund, TAT | Self-service, automation, Trust and CPO milestones. |
| DR-09 | Ring AI production experiment | Eligible pool, treatment/control, contact, intent, conversion, delivery, cost, incrementality | Scale, iterate, or stop. |
| DR-10 | Reconnection cohort | Unique customer, unique order, contact deduplication/overlap, missed call/callback intent, reconnect, time, confirmation, delivery | Validate BASE-11/DER-02 and size recoverable high-intent orders. |
| DR-11 | Substitution cohort | Options, pitch, acceptance, delivery/RTO/cancel, GM, repeat 30/60/90, LTV | Prove personalised substitution and long-term HA value. |
| DR-12 | Wallet funnel/correctness | Balance/credit creation, sync, eligibility, application, expiry, failure, support contact | Trust and wallet correction priorities. |
| DR-13 | Incident/capacity model | Raw-message/thread reconciliation for INC-05/INC-06, family, recurrence, MTTR, affected users/orders, engineer hours | Resolve source conflict, quantify foundation capacity release, and validate BASE-13. |
| DR-14 | Configuration baseline | Change volume, lead time, backend/DB effort, failed changes, incidents, rollback | Size Core Configuration & Controls. |
| DR-15 | Trust measurement choice | Candidate headline metric and/or initiative-level Wallet/R&R proof framework | Decide how Trust is represented on Page 4 and Page 8. |

## 7. Prohibited or conditional claims

| Claim | Rule |
|---|---|
| Any fixed Ring AI daily-order, incremental-order, or OP -> OD uplift translation, including 2,500/day, 1,250/day, 750/day, or 0.5pp | Do not use until eligible pool, production conversion, true incrementality, and delivered rate reconcile. |
| Juspay directly reduces full Rs9.17 COD CPO | Prohibited. Juspay enables orchestration and experiments; causal effect must be measured. |
| Better payment success automatically reduces Rs3.69 Online PG CPO | Prohibited. Separate MDR/commercial, failed-attempt, and operational components. |
| Voicebot 22% call answering equals FCR, containment, resolution, or cost reduction | Prohibited. Q1-09 is adoption only. |
| Whiteboard-only Voicebot `22% -> 46%` notation | Unvalidated brainstorming. Do not use 46% as target, forecast, or commitment. |
| Incident log has verified ~255 pings and ~1,350 replies | Prohibited until INC-05 and INC-06 reconcile. |
| NFS Phase 1 opportunity is reconciled Rs1.4 Cr/month | Conditional; source statement conflicts with listed peaks. |
| Portal debugging consumes verified 50% capacity | Prohibited as verified fact; BASE-13 is user estimate. |
| Every initiative starts in July or is committed through September | Prohibited until execution inputs and estimates are complete. |
| Discard Intelligence itself immediately reduces discards | Prohibited. First result is actionable attribution and lever pipeline. |
