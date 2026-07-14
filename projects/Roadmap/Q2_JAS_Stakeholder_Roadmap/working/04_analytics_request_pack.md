# JAS Q2 Analytics & Finance Request Pack

**Status:** WORKING SESSION PACK v0.1  
**Request date:** 2026-07-15  
**Scope:** DR-01 to DR-15  
**Owners and delivery dates:** TBD; assign during working session  

This pack converts measurement gaps in JAS Q2 operating plan into assignable Analytics and Finance work. It defines required decisions and minimum acceptable first cuts. It does not prescribe SQL, dashboard tooling, or implementation architecture.

Use this as a pre-read. The 2026-07-15 session assigns work, decision rights, sources, dates, and blockers; it is not expected to finish all 15 metric definitions live. Detailed definition workshops follow by request or dependent cluster.

## 1. Working-session purpose

Leave session with:

1. One named delivery owner for every P0 request and an owner or explicit queue position for every P1 request.
2. Named definition approver where Finance or business sign-off is required.
3. First-cut and acceptance dates entered for each request.
4. Definitions, exclusions, cohort windows, and deduplication rules either locked or assigned as explicit follow-ups.
5. Source-system feasibility and blockers recorded.
6. P0 delivery order agreed; P1 work sequenced against initiative milestones.
7. Review cadence confirmed.

Meeting is complete only when assignment table in Section 3 is populated or each unassigned row carries explicit blocker and escalation owner.

### Required roles and decision rights

- **Product / operating-plan owner:** chairs, confirms business decision each request must unlock, and resolves priority/order.
- **Analytics delivery owner:** confirms feasibility, assigns delivery ownership, and commits first-cut dates or explicit blockers.
- **Finance approver or delegate:** owns CPO/cost-definition approval and reconciliation decisions.
- **Business validators:** confirm operational meaning for CSR, Doctor, Payments, Returns & Refunds, and other relevant journeys; attendance may be limited to their cluster.
- **Engineering/data-platform representative:** joins where source access or missing instrumentation blocks a first cut.
- Unresolved ownership or decision-right conflicts leave the meeting with a named escalation owner and date, never silent `TBD`.

### Pre-session actions

- Analytics arrives with candidate delivery owners or queue positions, likely source systems, access constraints, instrumentation gaps, and realistic capacity windows for P0 requests.
- Finance arrives with a candidate DR-02 approver/delegate, likely cost sources, and known denominator or reconciliation constraints.
- Product shares the pack in advance, confirms the business decision each request must unlock, and flags any priority dispute for live resolution.
- Journey/business validators identify the right operational SME and known source owner for their cluster; they are not expected to prepare finished definitions.

### Proposed 60-minute agenda

1. **5 min:** Reconfirm three outcomes and meeting decisions.
2. **10 min:** Confirm P0/P1 order and any scope correction.
3. **20 min:** Assign P0 owner, approver, source/access owner, and blocker.
4. **15 min:** Assign P1 owner or queue position; set first-cut dates and dependencies.
5. **10 min:** Read back commitments, follow-up workshops, cadence, and escalations.

## 2. Evidence and measurement rules

- Preserve evidence-register status: `FILE-VERIFIED`, `USER-SUPPLIED`, `DERIVED`, `HYPOTHESIS`, `UNKNOWN`, or `CONFLICTED`.
- Every metric must carry numerator, denominator, period, cohort anchor, exclusions, deduplication rule, and data cut-off where applicable.
- Reconcile totals to agreed source of record. Show unmapped, unknown, and excluded volumes; do not hide them.
- Separate placed-order, delivered-order, touched-order, unique-customer, unique-order, ticket, contact, and call denominators.
- Do not use user-supplied baselines as validated results until request acceptance criteria pass.
- Do not translate Ring AI POC into fixed orders/day or OP -> OD uplift until DR-09 proves eligible pool, production conversion, incrementality, and delivery.
- Do not treat Voicebot call answering as FCR, containment, resolution, or cost reduction.
- Do not claim Juspay directly reduces COD or online-PG CPO. DR-02 and DR-04 must isolate causal components.
- Discard Intelligence first produces actionable attribution. Reduction follows through separately measured fixes.
- Trust stays an outcome. DR-15 decides whether it receives one headline metric or initiative-level Wallet and R&R proofs.

## 3. Assignment and delivery contract

Populate during 2026-07-15 working session. `TBD` is not an accepted post-session state unless blocker and escalation owner are recorded.

| ID | Priority | Delivery owner / P1 queue position | Definition approver | Business validator | Request date | First-cut date | Acceptance date | Blocker / escalation owner | Quantified/final claims blocked on pages |
|---|---|---|---|---|---|---|---|---|---|
| DR-01 | P0 | TBD | TBD | TBD | 2026-07-15 | TBD | TBD | TBD | 4, 6, 10 |
| DR-02 | P0 | TBD | TBD | TBD | 2026-07-15 | TBD | TBD | TBD | 4, 7, 9, 10 |
| DR-03 | P0 | TBD | TBD | TBD | 2026-07-15 | TBD | TBD | TBD | 6, 10 |
| DR-04 | P0 | TBD | TBD | TBD | 2026-07-15 | TBD | TBD | TBD | 6, 10 |
| DR-05 | P0 | TBD | TBD | TBD | 2026-07-15 | TBD | TBD | TBD | 7, 9, 10 |
| DR-06 | P0 | TBD | TBD | TBD | 2026-07-15 | TBD | TBD | TBD | 7, 10 |
| DR-07 | P0 | TBD | TBD | TBD | 2026-07-15 | TBD | TBD | TBD | 9, 10 |
| DR-08 | P0 | TBD | TBD | TBD | 2026-07-15 | TBD | TBD | TBD | 8, 10 |
| DR-09 | P1 | TBD | TBD | TBD | 2026-07-15 | TBD | TBD | TBD | 6, 10, 11 |
| DR-10 | P1 | TBD | TBD | TBD | 2026-07-15 | TBD | TBD | TBD | 6, 10, 11 |
| DR-11 | P1 | TBD | TBD | TBD | 2026-07-15 | TBD | TBD | TBD | 6, 10, 11 |
| DR-12 | P1 | TBD | TBD | TBD | 2026-07-15 | TBD | TBD | TBD | 8, 10, 11 |
| DR-13 | P1 | TBD | TBD | TBD | 2026-07-15 | TBD | TBD | TBD | 3, 9, 11 |
| DR-14 | P1 | TBD | TBD | TBD | 2026-07-15 | TBD | TBD | TBD | 9, 11 |
| DR-15 | P1 | TBD | TBD | TBD | 2026-07-15 | TBD | TBD | TBD | 4, 8, 10 |

The last column does **not** block qualitative page drafting with visible unknowns. It blocks quantified or final claims until the relevant request passes acceptance. `DEC-01` is resolved; recorded source SHA, Phase 5 launch, and Page 11 execution gate now control release.

### Dependency and source-feasibility contract

Populate candidate sources, access ownership, and instrumentation feasibility during the session before accepting a delivery date.

| ID | Dependency / relationship | Candidate source(s) | Source/access owner | Instrumentation gap or feasibility note |
|---|---|---|---|---|
| DR-01 | None | TBD in session | TBD | TBD |
| DR-02 | None | Finance source(s) TBD | TBD | Cost-pool and denominator availability TBD |
| DR-03 | **Hard:** DR-01 discard/outcome boundary. **Enrichment/partial feeds:** DR-04 payment states, DR-05 contact cohorts; missing feeds must remain unknown, not block first attribution cut. | TBD in session | TBD | Stage/cause/recoverability instrumentation TBD |
| DR-04 | **Hard for final outcome bridge:** DR-01. Payment-path first cut may proceed while definition is being locked. | TBD in session | TBD | Step, navigation, latency, payment-return, and order-state linkage TBD |
| DR-05 | None | CRM/contact source(s) TBD | TBD | Order mapping, reason taxonomy, repeat/FCR events TBD |
| DR-06 | **Hard for cost claim:** DR-02. **Enrichment/definition reuse:** DR-05. | Voicebot/contact/cost source(s) TBD | TBD | Resolution, repeat, transfer, quality, and cost linkage TBD |
| DR-07 | **Enrichment only:** DR-05 complaint/contact signal; DR-13 portal-error/capacity evidence. Neither blocks Doctor effort/quality first cut. | Doctor workflow/quality source(s) TBD | TBD | Consultation effort, quality/compliance, complaint, and error linkage TBD |
| DR-08 | **Hard for secondary CPO claim:** DR-02. **Enrichment:** DR-05 contact model. Core case funnel may proceed independently. | R&R/contact/refund source(s) TBD | TBD | Case-state, evidence, refund-credit, contact, and cost linkage TBD |
| DR-09 | **Hard for result acceptance:** DR-01 outcome definition and DR-02 cost definition. Design-ready gate can proceed in parallel. | Ring AI/assisted/order source(s) TBD | TBD | Treatment/control assignment and delivered incrementality TBD |
| DR-10 | **Hard for delivered recovery:** DR-01. **Enrichment/definition reuse:** DR-05. | Call/callback/order source(s) TBD | TBD | Missed-call intent, reconnect, repeat, and delivered attribution TBD |
| DR-11 | **Hard for delivered-outcome comparison:** DR-01. | HA/substitution/order/GM source(s) TBD | TBD | Options-shown, downstream outcome, repeat, and GM linkage TBD |
| DR-12 | **Hard for financial correctness:** DR-02. **Enrichment:** DR-05 support-contact view. | Wallet/ledger/checkout/contact source(s) TBD | TBD | Credit sync, eligibility, application, failure, and contact linkage TBD |
| DR-13 | None | Raw support messages/threads plus incident source TBD | TBD | Raw messages/threads are not in supplied evidence; access must be confirmed |
| DR-14 | None | Configuration log/source TBD | TBD | If no history exists, agree bounded manual-sample fallback |
| DR-15 | **Hard for final recommendation:** DR-08 and DR-12. **Enrichment:** DR-05. | Accepted outputs from dependencies | Product/business co-owner TBD | Recommendation waits on dependency quality and strategic decision ownership |

## 4. Shared acceptance gate

Every first cut must include the following **where applicable to its request type**:

1. Metric dictionary with business name and plain-language purpose.
2. Exact formula or state-transition definition.
3. Source-of-record and refresh/as-of statement.
4. Grain: customer, order, order line, ticket, contact, call, payment attempt, consultation, or incident.
5. Cohort anchor, observation window, cut-off, exclusions, and deduplication.
6. Required dimensions and explicit `unknown/unmapped` bucket.
7. Reconciliation against agreed source totals with unexplained variance called out.
8. Baseline output for latest complete cohort or period agreed during working session.
9. Data-quality limitations and missing instrumentation.
10. Named owner, approver, and next decision.

A request becomes `Accepted` only when its request-specific criteria and the applicable shared gate items pass. Metric/funnel requests require formula, grain, reconciliation, and baseline; a definition pack requires an approved dictionary and reconciliation; an experiment request requires an executable design and analysis contract; a reconciliation request requires a reproducible counting method; a recommendation request requires explicit options, selection criteria, and decision ownership.

## 5. P0 requests - definitions and first cuts

### DR-01 - OP -> OD definition and baseline

**Purpose:** Establish one headline Order Completion definition and baseline before attributing initiative impact.

**Definition contract to lock**

- Exact event/status that enters Order Placed denominator.
- Exact event/status that qualifies as Order Delivered numerator.
- Cohort anchor timestamp and delivery observation cut-off.
- Treatment of partial deliveries, split orders, replacements, cancellations, returns, RTO, fraud/test orders, duplicates, and reopened orders.
- Whether metric is customer-, order-, or order-line based.
- Attribution rule for initiatives touching same order.

**Required dimensions**

- Cohort date/week.
- Journey/channel and HA/Doctor touch state.
- Order category.
- Payment intent, attempted method, and final method.
- Customer cohort where available.
- Final outcome: delivered, discarded, cancelled, RTO, or still open.

**Minimum viable first cut**

- One definition note plus overall OP, OD, and OP -> OD rate for latest complete cohort and agreed comparison periods.
- Outcome bridge from OP denominator to delivered/discarded/cancelled/RTO/open.
- Dimension availability matrix and unknown-volume share.

**Acceptance criteria**

- Numerator and denominator reconcile to agreed operational totals.
- Cohort closure and late-delivery handling are explicit.
- Outcome categories are mutually exclusive at stated grain or overlap is documented.
- Definition is approved for CEO reporting and reusable by DR-03, DR-04, DR-09, DR-10, and DR-11.

**Decision unlocked:** Headline Order Completion measurement and defensible initiative contribution.

### DR-02 - Finance-approved CPO definition pack

**Purpose:** Prevent denominator errors, double counting, and unsupported savings claims.

**Definition contract to lock**

- CPO numerator for each cost pool and whether fixed, variable, allocated, or pass-through.
- Denominator for placed, delivered, touched, assisted, COD, prepaid, RTO, CSR, and Doctor views.
- Recognition period and allocation logic.
- Treatment of refunds, failed attempts, retries, cancellations, RTO, and shared overhead.
- Payment-cost treatment by PG/provider, fee type, payment attempt, successful transaction, paid order, retry, refund, and commercial-volume tier.
- Reconciliation source and Finance approval path.

**Required dimensions**

- Cost component.
- Denominator type.
- Period.
- Journey/channel.
- Payment mode.
- PG/provider and commercial tier.
- Fee type and attempt/success/refund state.
- Order outcome.
- Initiative-relevant cost pool.

**Minimum viable first cut**

- Finance-approved metric dictionary and cost bridge for BASE-02, BASE-03, BASE-04, BASE-07, BASE-08, BASE-09, and BASE-10.
- Side-by-side denominator labels; no blended comparison across incompatible units.
- Reconciliation to Finance source for agreed period.

**Acceptance criteria**

- Every baseline has explicit numerator, denominator, period, and cost components.
- Cost pools do not double count.
- Finance approver signs off or records unresolved variance.
- ₹14 -> ₹9 Voicebot aspiration and payment-cost hypotheses can be modelled without changing definitions mid-test.

**Decision unlocked:** Comparable Cost to Serve baselines and valid cost-impact tests.

### DR-03 - Discard Intelligence

**Purpose:** Move from aggregate discard count to controllable, prioritised discard levers.

**Definition contract to lock**

- Exact discard event/state and order grain.
- Difference between discard, cancellation, RTO, timeout, still-open order, and data-quality failure.
- Journey-stage taxonomy.
- Root-cause taxonomy and evidence required to assign cause.
- Recoverability rule, value/opportunity calculation, and accountable owner.
- Single-primary-cause versus multi-cause handling.

**Required dimensions**

- Journey stage.
- Payment method, intent, attempt state, failure state, and return path.
- Order category.
- HA/Doctor call state and customer/contact cohort.
- Root cause.
- Recoverability.
- Order value or agreed opportunity measure.
- Owning product/operations team.

**Minimum viable first cut**

- Discard cohort table for agreed complete period with stage, payment state, category, cohort, cause, recoverability, value, and owner.
- Coverage summary: attributable, ambiguous, unknown, and missing-instrumentation shares.
- Ranked controllable cohorts with volume and value; no solution promise yet.

**Acceptance criteria**

- Total discards reconcile to existing aggregate view.
- Unknown/unmapped volume is visible.
- Cause assignment is traceable to event or agreed rule.
- Cancellations and RTO remain separate downstream outcomes/guardrails.
- Output supports prioritisation of at least first investigation/lever backlog without claiming reduction.

**Decision unlocked:** Which discard cohorts deserve Q2 discovery or quick-win action.

### DR-04 - End-to-end payment funnel

**Purpose:** Expose broken online/COD paths, payment-return failures, and opportunity to move eligible orders through clean Pay-at-Checkout flow.

**Definition contract to lock**

- Eligible checkout-entry population.
- Online/COD intent and final-method definitions.
- Payment attempt, success, failure, timeout, retry, abandonment, and fallback states.
- Return-to-app/site state and linkage between payment state and order state.
- Order placed, discarded, cancelled, RTO, and delivered outcomes.
- Treatment of multiple entry pages, multiple attempts, PG routing, and direct order placement after failed online flow.
- Checkout-friction events: step/page, click count, elapsed time, latency, back navigation, and exit point.

**Required dimensions**

- Entry page/source.
- Checkout step/page, click count, elapsed time, latency, back navigation, and exit point.
- Customer/order identifier.
- Payment intent and final payment method.
- Attempt number, PG, instrument, outcome, and failure family.
- Return page/state and order state.
- Order category and agreed customer cohort.
- Final order outcome.

**Minimum viable first cut**

- State-transition funnel from eligible entry through payment/order outcome.
- Separate clean online, clean COD, fallback, broken return, and unknown paths.
- Counts and rates by major entry point and payment state.
- Friction view by step: clicks, time, back navigation, exits, and latency where instrumented; explicit instrumentation-gap list otherwise.

**Acceptance criteria**

- Funnel entrance reconciles to eligible checkout population.
- Each attempt links to order and final order outcome where possible.
- Online intent is not equated with successful online payment.
- Broken return/direct-placement path is measurable rather than buried in COD or discard.
- Reduced-click and reduced-friction hypotheses can be tested against explicit step/navigation/time measures.
- Payment success and cost components remain separate.

**Decision unlocked:** Checkout/Juspay priorities, instrumentation needs, and testable online-payment/RTO hypotheses.

### DR-05 - Order-linked customer-friction model

**Purpose:** Replace manual dump bucketing and fragmented CSR interfaces with measurable, order-linked customer friction.

**Definition contract to lock**

- Unique contact, ticket, conversation, callback request, and customer definitions.
- Order-linked, pre-order, post-order, and unlinked contact rules.
- Contact-reason and journey-stage taxonomy.
- Inbound, outbound, automated, and callback classifications.
- Resolution, FCR, transfer, repeat-contact window, and callback-TAT definitions.
- Multi-contact and multi-order deduplication.

**Required dimensions**

- Customer ID and order ID where applicable.
- Journey stage and contact reason.
- Channel and inbound/outbound/automated state.
- Agent/bot handling path.
- Resolution, transfer, repeat, and callback timestamps.
- Product/initiative attribution where evidence supports it.

**Minimum viable first cut**

- Mapping-coverage view for customer, order, stage, reason, channel, and resolution.
- Baseline contact volume, FCR, repeat contacts, and callback TAT with unmapped bucket.
- Feasibility note for Kapture/equivalent CRM source versus interim bounded extract.

**Acceptance criteria**

- Unique-contact and repeat-contact logic is reproducible.
- Order-linked and unlinked populations remain separate.
- Mapping coverage and unknown reason share are visible.
- FCR is not inferred solely from ticket closure.
- Model can support Voicebot, R&R, Wallet, reconnection, and future chatbot measurement.

**Decision unlocked:** CRM foundation scope, friction priorities, and valid service-automation baselines.

### DR-06 - Voicebot cost bridge and guardrails

**Purpose:** Test CSR CPO aspiration from BASE-07 to HYP-02 without confusing answered calls with safe resolution.

**Definition contract to lock**

- Eligible FCR-type contact population.
- Answered, handled, contained, transferred, abandoned, resolved, FCR, and repeat definitions.
- Human-intervention and repeat-contact observation windows.
- Bot cost, human cost, human minutes avoided, fixed/variable allocation, and CPO denominator.
- Quality and escalation guardrails.

**Required dimensions**

- Contact reason and eligibility.
- Bot path/outcome.
- Transfer reason and human handle time.
- Resolution/FCR and repeat contact.
- Order linkage and journey stage.
- Quality exception and customer-impact flag.

**Minimum viable first cut**

- Volume bridge: eligible -> answered -> contained/resolved -> transferred -> repeated.
- Cost bridge from current user-supplied ₹14/order baseline toward ₹9/order aspiration using DR-02 definitions.
- Guardrail view for repeats, transfers, unresolved cases, and quality exceptions.

**Acceptance criteria**

- 22% Phase 1 answering signal remains labelled adoption only.
- Containment requires no human handling under agreed rule; FCR/repeat definitions are explicit.
- Cost avoided reconciles to human and bot cost inputs.
- Finance approves cost bridge and business owner accepts quality guardrails.

**Decision unlocked:** Which call types move to Voicebot Phase 2 and whether ₹9/order remains credible hypothesis.

### DR-07 - Doctor effort, quality, compliance, and workflow baseline

**Purpose:** Give Doctor Experience Platform measurable primary outcomes beyond cost.

**Definition contract to lock**

- Consultation start, end, completion, and valid consultation.
- Doctor effort proxy and operational intervention.
- Quality and compliance measures, audit method, and failure severity.
- Rework, escalation, reassignment, duplicate call, and portal-error definitions.
- Relationship between consultation and final customer/order outcome.

**Required dimensions**

- Consultation/call type.
- Order category and workflow.
- Doctor and team for operational analysis; aggregate view for CEO use.
- Duration and completion.
- Compliance/quality result.
- Rework, escalation, portal error, and intervention.
- Order outcome where link exists.

**Minimum viable first cut**

- Baseline for consultation duration/completion plus available quality/compliance, rework, escalation, and portal-error signals.
- Doctor/team distribution or heatmap view for consultation effort, quality/compliance, rework, and workflow failure; use for diagnosis, not punitive ranking.
- DR-05-linked consultation complaint/contact signal where order/contact mapping exists.
- Signal-availability matrix separating measurable now, instrumentable, and unavailable.
- Reconciliation to Doctor consultation/order totals.

**Acceptance criteria**

- Start/end and completion logic is consistent across workflows.
- Missing or unreliable events are quantified.
- Quality/compliance is not replaced by speed alone.
- Doctor-call CPO remains secondary and uses DR-02 definition.

**Decision unlocked:** Doctor Experience targets, discovery focus, and required instrumentation.

### DR-08 - Returns & Refunds funnel

**Purpose:** Size broken trust journey and define milestones for self-service and progressive refund automation.

**Definition contract to lock**

- Unique return/refund case, order, and order-line grain.
- Request, eligibility, evidence upload, approval/rejection, pickup, refund initiation, processing, credit, and closure states.
- TAT start/end and paused-clock rules.
- Inbound, outbound, repeat-contact, and escalation definitions.
- Automation-eligible and manual-review populations.

**Required dimensions**

- Customer, order, and order line.
- Return/refund reason and eligibility.
- Channel and contact direction.
- Evidence state.
- Decision, pickup, refund, and closure state.
- Payment method and refund rail.
- TAT and repeat contact.
- Agreed customer/order category cohorts.

**Minimum viable first cut**

- Deduplicated case funnel with counts, conversion between stages, and TAT.
- Contact bridge linking inbound/outbound calls to unique cases.
- Manual versus potential self-service/automation population.
- Team/cost input availability for DR-02-linked CPO view.

**Acceptance criteria**

- Period for user-supplied ~1,500 inbound/~400 outbound calls is identified or figures remain labelled unvalidated.
- Calls, contacts, cases, orders, and order lines are not mixed.
- Funnel totals reconcile and unresolved/open cases remain visible.
- Refund completion means customer credit under agreed definition, not only internal initiation.

**Decision unlocked:** R&R milestone sequence, automation opportunity, Trust proof, and secondary CPO case.

## 6. P1 requests - initiative proof and foundation sizing

### DR-09 - Ring AI production experiment

**Definition contract to lock:** eligible abandoned-cart pool, assignment, treatment/control, contact, high intent, conversion, confirmed order, delivered order, cost, incrementality, and observation window.

**Required dimensions:** assignment cohort, lead source, eligibility reason, contact outcome, intent, order creation/confirmation/delivery, category, timing, assisted touch, and cost.

**Minimum viable first cut:** experiment design plus production cohort output that places human baseline, POC signal, and production result on comparable definitions.

**Design-ready gate:** treatment/control populations and assignment are comparable; eligibility/exclusions, named conversion and delivered outcomes, observation window, cost capture, and analysis plan are explicit; no fixed daily-order extrapolation from 5% -> 20% POC.

**Result-accepted gate:** production assignment integrity is verified; conversion and delivered incrementality are measured on the approved definitions; cost is included; variance and data-quality limits are reported.

Experiment design may be accepted before results exist. The Ring AI impact claim remains blocked until the result-accepted gate passes.

**Decision unlocked:** Scale, iterate, or stop Ring AI Cart Recovery.

### DR-10 - High-Intent Reconnection cohort

**Definition contract to lock:** unique customer/order/contact, missed Doctor/HA call, callback intent/request, dead-end contact, successful reconnect, confirmation, delivery, repeat-contact window, and time-to-reconnect.

**Required dimensions:** Doctor versus HA call, channel/CTA/IVR/CSR entry, missed-call reason where available, repeat count, callback TAT, reconnect outcome, and final order outcome.

**Minimum viable first cut:** deduplicated missed-call/callback-intent funnel from signal to reconnect, confirmation, and delivery, with overlap and unmapped populations.

**Acceptance criteria:** customers, contacts, and orders stay separate; source signal of ~250 customers making repeated callback-related contacts is validated, including inferred daily period and uniqueness, or remains explicitly labelled; recovered delivered orders require attributable reconnect; DER-02 is not treated as order-rate baseline.

**Decision unlocked:** Size recoverable demand and prioritise reconnection journey interventions.

### DR-11 - Personalised HA Substitution cohort

**Definition contract to lock:** options shown, option relevance, pitch, acceptance, substituted order, delivered/cancelled/RTO, GM contribution, repeat order, same-substitute repeat, and LTV observation.

**Required dimensions:** original medicine, substitute options, selected option, price/value/brand position, HA interaction, category, availability, doctor approval, order outcome, GM, and 30/60/90-day repeat.

**Minimum viable first cut:** linked cohort from options shown through delivered outcome and available repeat/GM view, plus comparator or confounder note.

**Acceptance criteria:** one-time acceptance is not final success; downstream order outcome and repeat are linked; availability, price, and approval confounders are visible; GM definition approved.

**Decision unlocked:** Whether multiple-option HA decision support creates durable customer and GM value.

### DR-12 - TM Wallet funnel and correctness

**Definition contract to lock:** ledger entry, credit note creation, sync, eligible balance, expiry, checkout eligibility, application attempt, successful application, failure, refund credit, and support contact.

**Required dimensions:** customer, order/credit source, balance type, creation/sync timestamp, eligibility, expiry, checkout/application state, failure reason, and linked contact.

**Minimum viable first cut:** correctness funnel from credit/balance creation to visible, eligible, and successfully applied value, with failure and support-contact cohorts.

**Acceptance criteria:** balances reconcile to financial ledger; sync and application failures remain distinct; denominator is eligible balance/application opportunity; expiry rules are explicit; customer-facing status matches source of record.

**Decision unlocked:** Wallet correctness priorities and initiative-level Trust proof.

### DR-13 - Incident and capacity model

**Definition contract to lock:** defect family, top-level incident report/ping, thread, reply, recurrence, open/close/reopen, MTTR, affected user/order, engineering effort, and release capacity displaced.

**Required dimensions:** family/category, first/last seen, status, recurrence, affected workflow, customer/order impact, engineer effort, linked fix/release, and source confidence.

**Minimum viable first cut:** first confirm a source/access owner for raw support messages and threads, which are not in supplied evidence; then reconcile INC-05 versus INC-06 and produce reproducible defect-family and capacity view. If raw access cannot be obtained, record DR-13 as blocked rather than estimating reconciliation.

**Acceptance criteria:** ~255/~1,350 and 188/1,495 conflict resolved or both remain prohibited; manual versus system-derived counts labelled; replies are not equated with engineering hours; BASE-13 remains estimate until effort method passes.

**Decision unlocked:** Foundation capacity case and defensible capacity-release baseline.

### DR-14 - Core configuration baseline

**Definition contract to lock:** configuration request, configuration type, request timestamp, approval, change start/live time, manual backend/DB effort, failed change, rollback, and linked incident.

**Required dimensions:** configuration type, system/workflow, requesting and executing team, self-serve/manual state, time of day, lead time, effort, failure, rollback, and incident linkage.

**Minimum viable first cut:** inventory of configuration changes with volume, lead time, manual effort, failure/rollback, and current self-serve coverage. If system history does not exist, agree a bounded, dated manual sample and label its coverage limits.

**Acceptance criteria:** manual and automated changes separated; timestamps and effort method explicit; incident linkage requires traceable evidence; unsupported capacity savings are not inferred.

**Decision unlocked:** Scope and priority for Core Configuration & Controls.

### DR-15 - Trust measurement recommendation

**Definition contract to lock:** whether Trust has one headline metric or is represented through Wallet and R&R initiative proofs; selection criteria, denominator, period, sensitivity, and controllability.

**Required inputs:** DR-08 R&R funnel, DR-12 Wallet correctness/application, DR-05 related friction/contact data, metric availability, and data-quality constraints.

**Decision ownership:** Product/business co-owner required alongside Analytics; Analytics establishes measurability, while Product/business owns the strategic representation choice.

**Minimum viable first cut:** recommendation comparing candidate headline metric against initiative-level proof model, with pros, risks, data availability, and proposed CEO wording.

**Acceptance criteria:** recommendation does not invent NPS or trust score; chosen metrics have exact definitions and owners; named Product/business decision owner accepts the representation; Wallet and R&R remain distinct initiatives under one Trust outcome; CPO remains secondary effect.

**Decision unlocked:** How Trust appears on Pages 4, 8, and 10.

## 7. Known conflicts and reconciliation queue

| Conflict / uncertainty | Claim IDs | Required resolution | Owned through |
|---|---|---|---|
| Incident headline reports ~255 pings/~1,350 replies; row sum is 188/1,495. | INC-05, INC-06 | Reproduce counts from raw messages/threads; lock definitions. | DR-13 |
| NFS Phase 1 source says ~₹1.4 Cr/month; listed historical category peaks sum to ₹124 L/month excluding ED. | Q1-05 | Reconcile category scope, missing historical peak, and target basis before precise CEO claim. | Owner/date TBD in session |
| Voicebot Phase 1 answers 22% of call volume; resolution/FCR/cost impact unknown. | Q1-09 | Separate answered, contained, resolved, transferred, repeated, and cost. Ignore whiteboard-only 46% notation. | DR-06 |
| Ring AI 5% human and 20% POC may use different cohorts; production eligible pool unknown. | BASE-06, HYP-01 | Lock comparable denominators and run production experiment. | DR-09 |
| Reconnection numerator is user-supplied customers/day while comparison denominator is orders/day. | BASE-11, DER-02 | Deduplicate customers/orders/contacts and stop treating ratio as order rate. | DR-10 |
| Cost baselines use different denominators and incomplete component definitions. | BASE-02 to BASE-04, BASE-07 to BASE-10 | Finance definition and reconciliation pack. | DR-02 |
| R&R call volumes lack period, unique-case count, repeat rate, and team cost. | BASE-12 | Link calls to deduplicated case funnel and period. | DR-08 |
| Portal 50% debugging/clutter share is user estimate. | BASE-13 | Build reproducible incident/effort method. | DR-13 |

## 8. Proposed review order and cadence

Confirm cadence during working session; no calendar dates beyond request date are committed here.

### Review order

1. Lock shared definitions first: DR-01 and DR-02.
2. Review core diagnostic foundations: DR-03, DR-04, and DR-05.
3. Review P0 initiative baselines: DR-06, DR-07, and DR-08.
4. Sequence P1 proof work against initiative milestones: DR-09 to DR-15.

### Cadence to confirm

- **Assignment review:** End of 2026-07-15 session; owners, approvers, first-cut dates, blockers.
- **Delivery review:** Proposed weekly checkpoint until P0 first cuts pass shared acceptance gate.
- **Definition/QA review:** At each first-cut delivery; record accepted, revision required, or blocked.
- **Operating review:** Proposed recurring review after acceptance to track baseline movement, data quality, and decision triggered.
- **Escalation:** Any missed committed date or unresolved definition conflict receives named escalation owner and revised date; no silent rollover.

## 9. Working-session close-out record

Complete before session ends:

- P0 owners assigned: `Yes / No`
- P0 first-cut dates assigned: `Yes / No`
- P1 owners or queue positions assigned: `Yes / No`
- Finance approver assigned for DR-02 and cost-dependent requests: `Yes / No`
- Definition conflicts logged with owners: `Yes / No`
- Review cadence confirmed: `Yes / No`
- Unresolved blockers and escalation owners recorded: `Yes / No`
- Next review date: `TBD during session`
