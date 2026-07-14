# JAS Q2 Operating Plan - CEO Blueprint

> **ARCHIVED - SUPERSEDED.** Preserved for provenance only. Current structure lives in `../working/03_operating_plan_blueprint.md`; facts and claim status live in `../docs/context/project_truth.md` and `../docs/context/evidence_register.md`. Do not use timelines or evidence wording from this file.

## Scope

Blueprint only. Not full operating plan. Final plan must preserve four lanes:

1. Improve Order Completion - business metric: OP -> OD
2. Reduce Cost to Serve - business metric: CPO
3. Build Customer Trust
4. Platform & Product Foundations - enables all three outcomes

Each initiative appears once under primary lane. Secondary effects shown only as impact badges.

## Opening announcement

> In three months, JAS moved from reactive delivery and production stabilisation toward an outcome-led operating model. Q2 turns that progress into measurable customer experience gains: improve order completion, reduce cost to serve, build customer trust, and establish foundations that let us discover, measure and scale what works.

## Final page sequence

| # | Page | Single message | Evidence available now | Analytics / decision need |
|---|---|---|---|---|
| 1 | Announcement: from reactive delivery to outcome-led operating plan | JAS has earned right to shift from isolated delivery to measurable customer outcomes. | Incident log: 21 recurring defect families, ~255 reports, ~1,350 replies across 105 days; quarterly retrospective source expected in workbook. | Confirm Q1 shipped/attempted/deferred list and impact owner for every item. |
| 2 | Q1 retrospective: delivered, learned, next | Q2 choices come from Q1 learning, not feature wish-list. | Conversation: Voicebot Phase 1, NFS re-enablement, Skip HA, payment revamp, upfront payments, multiple DID; cited prior figures include 22% platform calls handled, NFS ~Rs50L/month run-rate vs ~Rs1.4Cr/month phase-1 addressable, ~9.2% daily skips, 50% warehouse payment rollout. Must validate against workbook. | For each Q1 item: shipped date, adoption, outcome, financial/customer impact, status of measurement. |
| 3 | Why change now | Current operating model cannot reliably link customer friction to product action; recurring defects consume discovery and delivery capacity. | Incident log: high-volume recurring threads include confirm-call block, portal load, telephony, medicine selection, assignment and login failures. | Quantify portal capacity split: incident/debugging vs roadmap; engineering hours/release; incident recurrence and MTTR. |
| 4 | Operating model and metric tree | Customer Experience improves through three outcome lanes, enabled by foundations. | Known CPO baselines: doctor call Rs23.84/order; assisted commerce Rs4.32/overall order and ~Rs150/touched delivered order; CSR Rs14/order; COD Rs9.17/order; online PG Rs3.69/order; RTO Rs3.45/order. | Establish OP->OD definition, baselines, denominators, cohort attribution; define CPO components and avoid double counting. |
| 5 | Q2 portfolio: one view | Portfolio is deliberately limited, deduplicated, outcome-led. | Initiative context in following pages. | CEO confirms priority order and capacity trade-offs. |
| 6 | Improve Order Completion | Remove recoverable loss across cart, checkout, reconnection, discard and HA substitution journeys. | Ring AI POC: assisted conversion ~5% to ~20%; conservative scale hypothesis: retain 50% uplift = 12.5% conversion, 2.5x baseline. High-intent callback cases ~250/day; total order base ~28,000/day. Payment journey currently fragmented. | Ring AI eligible pool, true incrementality, delivered-order rate; checkout funnel and payment return-state funnel; discard taxonomy; reconnect-to-order conversion; substitution cohort outcomes. |
| 7 | Reduce Cost to Serve | Automate eligible contacts and make unit cost measurable without treating every service contact as bad. | CSR CPO Rs14/order; Voicebot Phase 2 target Rs9/order. | Contact volume by reason; FCR; repeat contacts; containment eligibility; cost-to-serve by channel and journey. |
| 8 | Build Customer Trust | Customers must see, control and resolve money and post-order issues without chasing support. | Returns/refunds: ~1,500 inbound + ~400 outbound calls; meaningful dedicated team. Wallet issues: ledger, credit-note sync/application, expiry visibility. | R&R journey funnel, reasons, TAT, self-serve rate, refund failure/escalation rate; wallet eligible balance, successful application, wallet/refund contact rate. |
| 9 | Platform & Product Foundations | Foundations release capacity and make each outcome measurable and repeatable. | Incident log demonstrates broad defect burden. Known needs: Doctor Experience Platform, Customer Friction Intelligence/CRM, Core Configuration & Controls. | Portal user journey and consultation data; defect/incident telemetry; order-ID ticket mapping; configuration change volumes/risk; current systems inventory. |
| 10 | Initiative scorecards and measurement maturity | Every initiative has outcome, baseline, Q2 hypothesis, proof point, owner, dependency and explicit unknowns. | Baselines and hypotheses listed below. | Analytics commits data delivery dates and named owners. |
| 11 | Execution timeline and capacity | Q2 sequencing protects foundations/discovery first, then MVPs, then proof/scale; team cannot run every stream in parallel. | Provisional capacity only: 2 payment engineers (P1-P2), 4 portal/platform engineers (PO1-PO4), 1 PM. Must validate workbook/whiteboard. | Confirm actual headcount, allocation, leave, shared dependencies, vendor ownership, delivery estimates. |
| 12 | Decisions and support required | CEO decision needed on sequencing, analytics capacity and execution ownership; added execution support protects discovery. | Portfolio has multiple cross-functional streams plus portal incident load. | Approve analytics workstream; approve execution-focused reporting PM/APM or equivalent capacity; resolve ownership for payment, CRM/vendor and R&R automation dependencies. |
| Appendix A | Q1 delivery inventory | Detailed feature list, impact, measurement status. | Workbook once mounted. | Missing/uncertain impact marked "measurement in progress"; never invent values. |
| Appendix B | Portal incident evidence | Defect evidence supports foundation investment; no incident dump in core narrative. | Incident log figures plus named recurring threads. | Incident recurrence, MTTR, customer/order impact, engineering effort. |

## Initiative map - deduplicated

| Primary lane | Initiative | CEO-level promise | Primary proof | Secondary impact |
|---|---|---|---|---|
| Improve Order Completion | Ring AI Cart Recovery | Prove AI-led qualification recovers more high-intent carts with less human calling. | Conversion: 5% baseline -> 12.5% conservative scale hypothesis. | Assisted commerce CPO. |
| Improve Order Completion | Checkout & Payment Journey Transformation | Make pay-at-checkout, online and COD journeys clean, attributable and optimisable. Juspay is enabling technology, not initiative. | Online completion, online payment share, payment-return success, checkout drop-off. | RTO CPO, COD exposure, PG commercials. |
| Improve Order Completion | High-Intent Reconnection Journey | Customers who want to continue can reconnect to right HA/doctor path. | Reconnection rate; recovered delivered orders. | Avoidable contacts. |
| Improve Order Completion | Discard Intelligence | Every discard gets stage, cause, owner and recoverability before solution bets scale. | % discards reliably attributed. | Quick-win pipeline. |
| Improve Order Completion | Personalised HA Substitution | Give HA multiple relevant substitutes; measure delivered conversion and stickiness, not one-time pitch. | Substitution acceptance, delivered conversion, GM contribution, repeat/LTV cohort. | HA effectiveness. |
| Reduce Cost to Serve | CSR Voicebot Phase 2 | Contain eligible, FCR-blocking contacts while retaining correct human escalation. | CSR CPO: Rs14 -> Rs9/order. | Faster resolution where suited. |
| Build Customer Trust | TM Wallet Trust Revamp | Every customer rupee visible, explainable and usable. | Eligible balance successfully applied; wallet/refund contact rate. | CPO, repeat purchase. |
| Build Customer Trust | Returns & Refunds Transformation | Move returns/refunds from fragmented support to app-led, evidence-backed, progressively automated service. | Self-serve initiation, refund TAT, automation rate. | Inbound/outbound R&R load; CPO. |
| Foundations | Doctor Experience Platform | Reduce doctor effort; enable faster, compliant, higher-quality consultations and performance visibility. | Consultation duration; compliance/quality score; doctor workflow failure rate. | Doctor-call CPO; internal ops and engineering effort. |
| Foundations | Customer Friction Intelligence & CRM | Map contacts to customer, order, journey and reason so product can work backward from friction. | % contacts mapped to order/journey/reason; FCR/repeat-contact measurement coverage. | Voicebot, chat, callbacks, R&R, product discovery. |
| Foundations | Core Configuration & Controls | Safely self-serve high-frequency category/workflow changes and remove recurring manual/backend dependency. | Configuration lead time; in-day change success; configuration-linked incident rate. | Portal delivery capacity, operational effort. |

## Analytics request - send tomorrow

### Shared measurement contract

- Lock OP->OD numerator, denominator, date cut-off and attribution rules.
- Lock CPO taxonomy: cost per placed order vs delivered order vs touched order. State denominator on every metric.
- Build cohort keys across customer, order, doctor/HA, payment attempt, contact/ticket, return/refund and discard event.
- Publish baseline, weekly trend and initiative-exposed/control cohort view.

### Priority 0 - needed before Q2 targets

1. Payment funnel: entry point -> pay-at-checkout -> online/COD intent -> attempt -> success/failure -> return state -> order placement -> cancellation/RTO/delivery. Include duplicate/retry and inconsistent return-path detection.
2. OP->OD loss tree: placed -> confirmation -> payment -> fulfillment -> delivered, with discard/cancellation/RTO reasons and owner.
3. CSR/contact foundation: ticket/contact -> customer ID -> order ID where present -> journey stage -> reason -> channel -> inbound/outbound -> resolution -> repeat contact -> callback TAT.
4. Returns/refunds funnel: request, eligibility, image/evidence, approval, pickup, refund initiation, refund completion, TAT, contact/escalation.
5. Doctor/portal baseline: consultation duration, completion, compliance mismatch, rework/escalation, workflow errors, doctor-level quality signal, incidents linked to orders.

### Priority 1 - initiative proof

6. Ring AI: eligible-lead pool, assigned/touched cohort, conversion, incremental orders, delivered rate, human-cost avoided; randomised or matched comparison if practical.
7. Reconnection: missed HA/doctor call, callback intent, reconnect success, time to reconnect, placed/delivered outcome.
8. Substitution: option shown, option pitched, accepted, delivered/cancelled/RTO, GM, repeat substituted purchase and 30/60/90-day LTV.
9. Wallet: balance creation, ledger correctness, credit note sync, eligibility, application at checkout, expiry, support contact.
10. Foundations: incident family, frequency, time to resolve, repeat recurrence, affected orders/users and engineering time.

## Recommended timeline visualization

Use one capacity-constrained swimlane, not Gantt. Four horizontal lanes: Payments (P1-P2); Portal/Platform (PO1-PO4); PM; Analytics/Operations dependencies. Three vertical phases: July - instrument and foundation; August - MVP and controlled launch; September - prove, scale or stop.

```text
                          JULY                         AUGUST                       SEPTEMBER
Payments P1-P2     Funnel + payment-state design   Checkout MVP / controlled test  Scale winners + routing/commercials
Portal PO1-PO4     Doctor baseline, CRM schema,    Doctor workflow MVP, CRM pilot  Configuration controls + quality dashboards
                    R&R/Wallet discovery           R&R app raise + Wallet fixes    R&R evidence/refund automation milestone
PM                 Targets, PRDs, cohorts,         Experiment reviews, decisions   Q3 evidence-led prioritisation
Analytics/Ops      Baselines + event contract      Weekly exposed/control views     Outcome readout + next-bet sizing
```

Portfolio rule: start no new build stream unless it has (1) one accountable owner, (2) baseline or explicit discovery gate, (3) allocation shown in lane, (4) decision date, (5) a paused/deprioritised trade-off. Ring AI production proof can run during July-August only if dedicated operational/vendor capacity exists; do not silently displace payment or portal foundation work.

## Capacity message

Present capacity as decision, not complaint:

> Current plan needs strategic product discovery plus execution control across payment, portal, CRM, returns/refunds and operating teams. Without execution-focused support, PM time becomes coordination and incident-management throughput. Add one reporting PM/APM or equivalent program capacity so product leadership remains accountable for discovery, measurement, prioritisation and CEO-level outcomes.

## Source limitations

- PDF inspected: `MUM-DEV_Incident_Log.pdf` available outside supplied `/mnt/data` path.
- Workbook `Untitled spreadsheet.xlsx` not present in `/mnt/data` or mounted workspace at review time. Do not state workbook-derived capacity or Q1 results as verified until reattached.
- Provisional capacity above comes from conversation/whiteboard only: 2 payment engineers, 4 portal/platform engineers, 1 PM.
