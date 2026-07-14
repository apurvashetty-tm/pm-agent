# Project Truth - JAS Q2 Operating Plan

**Status:** CANONICAL v3.2  
**Owner:** Apurva  
**Last updated:** 2026-07-14  
**Change authority:** User; canonical edits made only by assigned truth steward

This file owns strategy decisions. It does not own numeric provenance, unresolved questions, page expression, or agent workflow.

## 1. Assignment and audience

- Build CEO-ready JAS Q2 operating plan for July-September. Truemeds fiscal year begins in April.
- Show how JAS improves Customer Experience through measurable business outcomes, not feature delivery alone.
- Explain what Q1 delivered and taught us, what Q2 will test/build, how impact will be measured, how capacity constrains sequencing, and what leadership support is required.
- Phase 4 structure freeze is approved and recorded: Pages 1-11 sequence, page jobs, and CEO takeaways are frozen as comparison baseline; only Page 12 purpose is frozen, while its wireframe and exact asks remain provisional. Independent drafting begins only in Phase 5 from recorded post-freeze source SHA.

Core narrative direction, not locked copy:

> In three months, JAS moved from issue-led delivery and production stabilisation toward an outcome-led operating model. Q2 converts that progress into measurable customer outcomes, supported by stronger measurement and product foundations.

Tone must show evolution without blaming prior teams or sounding defensive.

## 2. Source authority

Use this order when sources conflict:

1. Latest explicit user decision captured in canonical files.
2. This project truth for strategy and initiative definitions.
3. `docs/context/evidence_register.md` for claim value, status, provenance, and allowed wording.
4. `docs/context/open_questions.md` for unresolved decisions and data gaps.
5. `working/03_operating_plan_blueprint.md` for frozen page sequence, page jobs, takeaways, and wireframes.
6. `working/04_analytics_request_pack.md` and `working/page_packets/` as derived working contracts; they may narrow but never override items 1-5.
7. `working/05_phase3_review_pack.md` as derived readiness/audit record; it may recommend but never resolve decisions without owner approval.
8. Raw sources under `inputs/`.
9. Archived material under `references/`, for provenance only.

Chat is provenance, not runtime dependency. New user decisions must be written into canonical files before another agent run begins.

## 3. Locked outcome tree

```text
Customer Experience
|
+-- Improve Order Completion
|   `-- Business metric: OP -> OD
|
+-- Reduce Cost to Serve
|   `-- Business metric: CPO
|
`-- Build Customer Trust

Enabled by Platform & Product Foundations
```

Rules:

- Customer Experience is umbrella, not peer metric.
- CPO remains business metric under Reduce Cost to Serve; it is not initiative name or customer promise.
- Platform & Product Foundations sit beneath and enable three customer outcomes; they are not fourth customer outcome.
- Each initiative appears once under one primary home. Secondary effects appear only as badges or notes.
- Roadmap pages stay at outcome level. L2 funnel metrics appear only when decision-critical; detailed schemas belong in Analytics pack or PRDs.
- Unknown baselines, targets, dates, owners, estimates, and attribution remain visibly unknown.

## 4. Locked initiative map

| ID | Primary home | Initiative | Outcome statement | Primary proof | Secondary effect / boundary |
|---|---|---|---|---|---|
| INIT-01 | Improve Order Completion | Ring AI Cart Recovery | Enable abandoned assisted-commerce customers to re-enter order journey through scalable AI intent qualification so incremental delivered orders rise without proportional human calling. | Assisted lead conversion and incremental delivered orders. | Assisted Commerce CPO. Cart recovery only; not missed-call journey. |
| INIT-02 | Improve Order Completion | Checkout & Payment Journey Transformation | Enable 100% of eligible orders to enter one observable Pay-at-Checkout flow, then follow clean online or COD paths, so payment abandonment becomes measurable and order completion improves. | Eligible unified-checkout entry, payment completion, clean return state, and delivered-order outcome. | RTO/COD exposure, PG commercials. Juspay is enabler, never initiative name. |
| INIT-03 | Improve Order Completion | High-Intent Reconnection Journey | Enable customers who miss Doctor/HA calls or request callbacks to reconnect to correct journey so high-intent orders continue instead of reaching dead ends. | Reconnection and recovered delivered orders. | Avoidable CSR contacts. Communication changes remain inside this journey. |
| INIT-04 | Improve Order Completion | Discard Intelligence | Enable teams to locate where controllable discards occur, why they occur, and which cohorts are recoverable so product and operations can act on largest levers. | Actionably attributed discard coverage and prioritised lever pipeline. | Subsequent discard reduction. Aggregate Discard/Cancellation/RTO already exists; Q2 focus is diagnostic depth inside Discards. |
| INIT-05 | Improve Order Completion | Personalised HA Substitution | Enable HAs to offer multiple relevant substitutes by customer need so accepted, delivered, and repeat substitution improves alongside GM contribution. | Accepted-to-delivered substitution and repeat/LTV cohort. | GM and HA effectiveness. Do not judge only one-time pitch. |
| INIT-06 | Reduce Cost to Serve | CSR Voicebot Phase 2 | Contain eligible FCR-type calls through Voicebot so CSR CPO can fall without harming resolution quality. | Eligible containment and Finance-approved CSR CPO bridge. | FCR, repeats, transfers, and quality are proof guardrails, not separate customer-effort story. |
| INIT-07 | Build Customer Trust | TM Wallet Trust Revamp | Make every customer rupee visible, explainable, and usable across ledger, credit notes, expiry, and checkout application. | Balance/credit correctness and successful eligible application. | CPO and repeat purchase. Wallet remains one initiative. |
| INIT-08 | Build Customer Trust | Returns & Refunds Transformation | Enable customers to initiate, evidence, track, and progressively automate legitimate returns/refunds without repeatedly chasing support. | Self-service completion, refund TAT, and automation. | R&R contact load and CPO. Trust remains primary home. |
| INIT-09 | Platform & Product Foundations | Doctor Experience Platform | Enable doctors to deliver faster, compliant, higher-quality consultations with less workflow effort and stronger quality visibility. | Consultation effort/time, workflow correctness, and quality/compliance. | Doctor CPO and reduced operations/engineering effort. Do not split generic stability or telephony initiatives. |
| INIT-10 | Platform & Product Foundations | Customer Friction Intelligence & CRM | Map each customer contact to customer, order where relevant, journey, reason, channel, resolution, repeats, and callback TAT in one service workspace so product friction becomes measurable backwards from customer need. | Mapping coverage, FCR/repeat visibility, and unified agent workflow. | Enables Voicebot, R&R, Wallet, reconnection, payment diagnosis, and future chatbot/AI. Kapture or equivalent is implementation choice. |
| INIT-11 | Platform & Product Foundations | Core Configuration & Controls | Enable safe self-service changes for high-frequency portal/category operations so lead time and backend/manual DB dependency fall. | Self-service coverage, configuration lead time, failed-change and incident rate. | Capacity release. Owns reusable control plane, not doctor consultation UX. |

### Scope notes retained for page packets

- INIT-02 current problem: online and COD journeys are intertwined; payment return paths are inconsistent; customers can fall back or have orders placed without clean state attribution; multiple entry/return pages obscure drop-offs. Capability options include multi-PG routing, saved instruments, fewer checkout steps, CVV-less/native OTP where supported, partial upfront/COD charges, COD surcharge/restriction experiments, commercial leverage, and success-rate routing.
- INIT-03 includes missed Doctor and HA calls, callback requests, customers calling dead-end numbers, repeat CSR contacts, and inconsistent messaging across IVR/voicebot/app/order tracking. Communication fixes are embedded scope, not separate initiative.
- INIT-07 includes ledger correctness, credit-note creation/sync/application, balance and expiry visibility, and checkout usability.
- INIT-08 milestone direction: app initiation -> image/evidence upload -> digital eligibility/validation -> eligible refund automation -> end-to-end status visibility.
- INIT-09 includes doctor JTBD discovery, faster consultation workflow, compliance mismatch removal, quality/effort heat maps, workflow correctness, and reduction in recurring operational/engineering debugging.
- INIT-10 starts from manual dump bucketing, weak Order ID mapping, and multiple CSR interfaces. It should support inbound/outbound/callback decisions, FCR/repeat visibility, one agent workspace, and later chatbot/AI integration.
- INIT-11 examples include auto-serve category configuration, Value Meds/non-Value Meds controls, safe in-day switching, and operational fallback such as telephony-provider backup. These are examples inside foundation, not separate roadmap initiatives.

## 5. Measurement decisions

- OP -> OD is headline metric for Order Completion. Exact numerator, denominator, cohort window, cut-off, attribution, and baseline remain open (`DR-01`).
- CPO is retained under Reduce Cost to Serve. Finance-approved component definitions and denominators remain open (`DR-02`).
- Trust is locked as outcome. Choice between one headline Trust metric and initiative-level Wallet/R&R proofs remains open (`DEC-04`).
- Discards are primary controllable OP -> OD lever. Required depth: stage, payment method/state and return path, order category, customer/call cohort, root cause, recoverability, value, and owner (`DR-03`). Cancellations and RTO remain downstream outcomes/guardrails.
- Discard Intelligence first proves actionable attribution. It must not be sold as immediate discard reduction.
- Ring AI 12.5% scale conversion is hypothesis, not target achieved. Incremental delivered orders must be proven.
- Voicebot Rs14 -> Rs9 is aspiration/hypothesis until eligible scope and cost bridge are validated.
- Every numeric claim must cite evidence-register ID and retain status label.

## 6. Q1 interpretation

- Q1 produced meaningful delivery and adoption signals, but measurement is uneven. Source workbook contains 15 initiatives: 3 numeric signals, 2 delivery/rollout statements, 3 explicit pending/unmeasured entries, and 7 blank impact fields (`Q1-12`).
- Q1 retro core pages show initiative, observed outcome/impact, and measurement status. No long problem statements.
- Payment Revamp Jul 9 rollout is Q1-built carryover/current-state milestone, not Q1 realised impact.
- Portal incident evidence supports breadth of recurring operating load. Safe headline is 21 named defects, 20 resolved and 1 still open in source snapshot (`INC-01`, `INC-02`). Source headline ping/reply totals conflict with row totals and are prohibited until reconciled (`INC-05`, `INC-06`).
- Named incident list belongs in appendix; main narrative uses one aggregate lesson.

## 7. Capacity and execution truth

- Working planning model: 6 active engineers, represented as 2 Payment and 4 Portal/Platform; 1 SPM; 0 execution PM/APM (`CAP-01` to `CAP-03`).
- Whiteboard includes one additional blank/unallocated row. It is not committed capacity.
- User-supplied grade mix is 4 SDE2 + 2 SDE1 (`CAP-04`). Six-engineer count, role mix, and grade mix require validation before being presented as independently verified.
- CEO execution page uses initiative lifecycle rows across July/August/September. It does not use engineer swimlanes.
- Timings stay uncommitted until current in-flight work, estimates, dependencies, allocation, and explicit trade-offs are reconciled.
- Internal engineer/stream matrix may support planning or appendix; it must not replace portfolio timeline.
- SPM bandwidth is portfolio constraint across discovery, measurement, prioritisation, delivery coordination, and stakeholder alignment. Leadership ask must describe throughput impact, not personal workload.

## 8. Authoring workflow and phase map

1. **Phase 1 - Canonical truth:** harden truth, evidence, blueprint, open questions, creative brief, and runbook.
2. **Phase 2 - Drafting inputs:** build Analytics request pack and page packets; no page prose and no Claude drafting.
3. **Phase 3 - Evidence and decision review:** assign data owners/dates, resolve critical evidence conflicts, and review packets.
4. **Phase 4 - Structure freeze and run setup:** user freezes Pages 1-11 plus provisional Page 12 purpose; truth steward records decision, commits post-freeze SHA, and prepares run manifests/worktrees.
5. **Phase 5 - Blind independent drafting:** Codex and Claude draft independently from same post-freeze commit.
6. **Phase 6 - Cross-review and revision:** each provider reviews peer output without editing original; writers create Pass 2.
7. **Phase 7 - Synthesis and artifact:** finalise Page 12, select strongest treatment page by page, apply one deck-level edit, audit evidence, red-team CEO questions, and produce approved artifact.

Claude first enters at Phase 5.

Detailed workflow and file ownership live in `docs/process/agent_runbook.md`.

## 9. Artifact direction

- Proposed structure: 12-page CEO operating plan plus evidence/metric appendix.
- Recommended medium: landscape PowerPoint source plus PDF export.
- Structure baseline is frozen under `DEC-01`; final medium remains an open user decision (`DEC-03`).
- Final artifacts enter `outputs/` only after structure, evidence use, and medium are approved.
