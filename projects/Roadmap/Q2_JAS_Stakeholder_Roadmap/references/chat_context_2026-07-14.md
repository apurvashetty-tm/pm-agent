# JAS Q2 - Context and Decisions

> **ARCHIVED - SUPERSEDED.** Preserved for provenance only. Current authority: `../docs/context/project_truth.md`, `../docs/context/evidence_register.md`, and `../working/03_operating_plan_blueprint.md`. This file contains stale evidence and capacity status; do not draft from it.

## Purpose

Durable handoff from strategy discussion. Read before changing roadmap, initiative cards or timelines.

## Locked operating model

Customer Experience drives:

1. Improve Order Completion - OP -> OD
2. Reduce Cost to Serve - CPO
3. Build Customer Trust

Platform & Product Foundations enable all three.

## Working principles

- Roadmap is CEO operating plan, not feature inventory.
- One initiative sits in one primary lane. Show secondary impact; do not duplicate.
- Juspay is enabler inside Checkout & Payment Journey Transformation, not roadmap story.
- TM Wallet is one trust initiative. Ledger, credit notes, expiry and checkout application are features inside it.
- Doctor Experience is strategic platform/foundation. Do not reduce it to CPO-only work.
- CSR Voicebot Phase 2 is primary CPO initiative. Customer Friction Intelligence/CRM is separate foundation.
- Discard Intelligence produces reliable attribution first. Do not promise discard reduction before reasons are known.
- Roadmap metrics stay high level. L2 product metrics belong in initiative PRDs.

## Initiative map

### Improve Order Completion

- Ring AI Cart Recovery
- Checkout & Payment Journey Transformation
- High-Intent Reconnection Journey
- Discard Intelligence
- Personalised HA Substitution

### Reduce Cost to Serve

- CSR Voicebot Phase 2

### Build Customer Trust

- TM Wallet Trust Revamp
- Returns & Refunds Transformation

### Platform & Product Foundations

- Doctor Experience Platform
- Customer Friction Intelligence & CRM
- Core Configuration & Controls

## Known baselines and hypotheses

- Doctor call CPO: Rs23.84 per placed order. Primary aim: doctor effort, consultation quality, compliance, workflow stability and visibility.
- Assisted Commerce CPO: Rs4.32 per overall placed order; ~Rs150 per touched and delivered order.
- Ring AI POC: assisted conversion ~5% -> ~20%. Conservative scale hypothesis: retain half uplift, 5% -> 12.5% (2.5x baseline). Must prove true incremental delivered orders.
- CSR CPO: Rs14/order. Voicebot Phase 2 target: Rs9/order.
- COD CPO: Rs9.17/order. Online PG CPO: Rs3.69/order. RTO CPO: Rs3.45/order.
- High-intent missed-call/callback repeat contacts: ~250/day against ~28,000 orders/day. Must measure reconnection and delivered recovery.
- Returns/refunds: ~1,500 inbound and ~400 outbound calls. Need end-to-end journey baseline.
- Substitutes: HA currently sees one option; test multiple relevant options. Track accepted -> delivered -> repeat/LTV cohort, plus GM contribution.

## Evidence

- Incident log: 21 recurring defect families; ~255 reports; ~1,350 replies; 105-day span. Use appendix, not CEO core narrative.
- Q1 retrospective/workbook values need verification after workbook reattachment. Do not claim as verified until source is available.

## Open Analytics asks

1. Common metric contract: OP->OD and CPO denominators, attribution, cohort keys.
2. Payment funnel: entry -> intent -> attempt -> outcome -> return state -> order -> cancellation/RTO/delivery.
3. OP->OD loss tree plus discard taxonomy.
4. Contact/ticket mapping: customer, order, stage, reason, channel, repeat, callback TAT, resolution.
5. Returns/refunds funnel and TAT.
6. Doctor consultation duration, compliance/quality, errors, rework/escalation.
7. Ring AI eligible pool, conversion, incrementality and delivered rate.
8. Reconnection cohort and outcome.
9. Substitution cohort from pitch through LTV.
10. Wallet balance, application and support-contact journey.

## Capacity assumption - pending validation

- Payments: P1, P2 (2 engineers)
- Portal/platform: PO1-PO4 (4 engineers)
- Product: 1 PM

Need validate through original whiteboard/workbook before CEO plan uses it.

## File roles

- `JAS_Q2_CEO_Operating_Plan_Blueprint.md`: page sequence, CEO messages, evidence, Analytics requests, timeline visual.
- This file: continuity context and roadmap guardrails.
- Future files: one initiative card per project; one Q1 retrospective; one data-request tracker.
