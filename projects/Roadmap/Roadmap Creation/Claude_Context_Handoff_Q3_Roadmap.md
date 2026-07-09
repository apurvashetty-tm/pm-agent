# Truemeds — Claude Context Handoff
## Q3 Product Roadmap, Metric Architecture, Initiative Inventory, and Operating Context

**Prepared for:** Claude / future product partner
**Prepared from:** user-provided discussion, working drafts, and attachments in this ChatGPT thread
**Roadmap horizon:** July–September (Q3).
**Important naming note:** one working Excel draft was accidentally labelled **Q2**, but the intended planning horizon throughout the discussion is **Q3: July, August, September**.

---

## 1. How to work with Apurva

Apurva is the Senior Product Manager responsible across Portals and Payments at Truemeds. The practical product surface includes Doctors, Health Advisors (HAs), Pharmacist Portal, Customer Support / CSR, Kapture CRM, Assisted Commerce, returns/refunds, TM Wallet, payment journeys, and payment infrastructure.

Working expectations:
- Be direct, product-specific, and Truemeds-relevant.
- Do not invent internal facts or prematurely close open questions.
- Distinguish **user-provided fact**, **working decision**, **inference**, and **open question**.
- Challenge weak framing; do not blindly agree.
- Avoid generic PM frameworks and excessive jargon.
- Leadership audience prefers a simple, filterable Excel initiative view. Do not lead with long narrative documents or novel labels that need explanation.
- The eventual roadmap must mix:
  1. **Top-down metric-backwards thinking**, and
  2. **Bottom-up mapping of already-known / committed initiatives to metrics**.
- Baselines are required because many drivers are not currently observable. Do not wait for perfect measurement before every build, but do not make unsupported attribution claims.

---

## 2. Current planning question

The task is to create a realistic Q3 product roadmap for July–September.

The roadmap should be outcome-led, but must also incorporate:
- a non-negotiable Ring AI pilot carried over from the previous quarter;
- a committed Juspay integration;
- compliance / Doctor quality and anti-impersonation requirements;
- customer care, returns/refunds, TM Wallet, and Kapture foundations;
- Doctor/HA connectivity and workflow improvement;
- payment conversion experiments;
- baseline and instrumentation work that is needed to make future AOP planning evidence-based.

The roadmap must not look like a generic list of Portal, Payments, and Customer Care projects. It should show a small number of business outcomes, initiatives beneath them, and simple output/input metrics.

---

## 3. End-to-end order and customer journey

### 3.1 Order-entry modes

There are two dimensions that should not be mixed:

**A. Order creation mode**
1. **Type 1 — Prescription upload / fully assisted cart creation**
   - Customer uploads prescription.
   - Pharmacist receives a task in CRM.
   - Pharmacist contacts customer, identifies medicines, may add additional SKUs, builds the cart, and confirms the order.

2. **Type 2 — Search and cart / e-commerce journey**
   - Customer searches, adds medicines, and proceeds toward checkout.
   - If the cart remains unattended beyond a threshold, it becomes an incomplete order.
   - Assisted Commerce calls and may create a fresh order; the old cart is scrapped.

**B. Clinical / processing requirement**
1. **Auto-confirm**
   - No Doctor call.
   - No HA call.
   - No substitution opportunity / no required clinical intervention.

2. **Category 4 / Cat4**
   - Doctor call required.
   - No HA call.
   - No meaningful substitution opportunity.

3. **Pilot**
   - Doctor call required.
   - HA call required.
   - Substitution opportunity exists.
   - Value Meds may use a continuous Doctor-to-HA experience; Non-Value Meds may require separate Doctor and HA contacts.

4. **Valid Rx**
   - A valid prescription exists.
   - HA call may still be required.
   - Doctor call is generally not required for the applicable path.

Many metrics must be segmented by both dimensions, e.g. self-serve + Pilot, assisted + Cat4, self-serve + Auto-confirm.

### 3.2 Order Cart / checkout context

Order Cart and Order Summary are separate screens today; the pre-order team plans to combine them. This is a dependency for some future customer-experience changes.

At Order Cart, the customer may see:
- whether a Doctor call is required;
- whether an HA call is required;
- whether an HA call can be skipped by customer or internal logic;
- payment mode selection;
- Pay Now versus Place Order CTA;
- for first-time customers, Select Payment Mode may appear instead of Place Order.

The exact CTA and payment path depend on order category, first-time/repeat status, and skip logic.

### 3.3 Post-order loss definitions

Use a common **total placed order** denominator for the primary order-health waterfall:

- **OP → OD:** delivered orders ÷ total placed orders.
- **Discard rate:** orders discarded before reaching the warehouse ÷ total placed orders.
- **Cancellation rate:** orders cancelled after reaching the warehouse ÷ total placed orders.
- **RTO:** important downstream guardrail. For this pod, focus on payment/customer-commitment levers; do not overload this roadmap with address quality, delivery ETA, and broader logistics causes that belong to other teams.

### 3.4 Key causal relationships discussed

- Doctor/HA connectivity and call quality can reduce discard for call-required flows.
- Payment timing, payment reliability, payable changes, and customer commitment can affect cancellation and RTO.
- False / unwanted substitution can create cancellation even if short-term HA substitution metrics look good.
- Substitute quality should eventually be tied to retention, not just substitution acceptance or HA incentives.
- Customer Care, returns/refunds, Wallet correctness, and payment clarity influence trust, repeat contacts, retention, and CPO.
- Ring primarily affects **pre-order abandoned-cart recovery and human-agent conversion**, not OP → OD directly.

---

## 4. Current business / product problems

### 4.1 Doctor and HA workflows

Current Doctor/HA flows are operational and SOP-driven rather than system-controlled.

Known issues:
- Actual call attempts are not reliably captured or controlled. “Attempts” may be assumed as two per assignment rather than measuring each dial and controlling subsequent redials.
- Doctor and HAs can pull assigned orders and make multiple attempts without a strong system-level attempt-control layer.
- Connectivity matters because flows are primarily outbound.
- Missed Doctor/HA call experience is broken: customer sees a callback number, calls it, lands with CSR, and CSR may only say that they will get another call.
- HAs may see only one substitute option against an original medicine; the hypothesis is that multiple appropriate options could improve the customer conversation and conversion.
- HAs are on payroll; their incentives are tied to substitution percentage / substitution performance. Optimising for substitute percentage alone can create false substitution and future cancellation / retention harm.
- Doctors are external supply paid per successful confirmation, not payroll. Product should not frame Doctor cost as a simple cost-reduction lever. Better connectivity can increase successful confirmations per active Doctor hour, reduce customer wait, improve Doctor earnings, and potentially improve Doctor quality/retention.
- Doctor/HAs share a broad portal with CSRs / other roles, creating clutter and role-misaligned workflows.

### 4.2 Doctor compliance, quality, and impersonation

This is a hard gate, not a weighted trade-off.

Problems / needs:
- Stop Doctor impersonation.
- Make every Doctor interaction auditable.
- Aim for 100% audit coverage. Clarify whether this means 100% interaction capture and workflow coverage, or literal 100% human review of every interaction.
- Improve Doctor quality and process adherence.
- Improve patient name, age, diagnosis, prescription completeness, multi-patient prescription handling, routing, and handoff context.
- Current work is heavily operational; target state is systemised controls through a new Doctor Portal and supporting backend services.

### 4.3 Customer Care / Kapture

**Tool name:** Kapture (not “Capture”, “Kapdesk”, etc.).

Current situation:
- Kapture receives inbound call/ticket context.
- Agents use an internal tool/portal in parallel to inspect customer/order history and act.
- Order-related calls/tickets/chats are not reliably mapped to order IDs.
- It is unclear which kinds of orders / stages create which tickets and contacts.
- Doctors, HAs, CSRs, and other users share overlapping portal surfaces, creating unnecessary visibility and workflow leakage.
- L2/L3 cases often happen over email rather than accountable case management.
- Agents need a decision-tree / next-best-action structure rather than only SOP documents.
- Customer Care needs a foundation that can later support chatbots and AI agent flows.

Target state:
1. Every contact is mapped to the relevant customer and, where applicable, a primary order ID.
2. Kapture shows the relevant order/customer/payment/return/wallet context.
3. A decision tree / guided resolution layer recommends or enables the next action.
4. Eligible actions, including refund actions, can happen in the correct operational system.
5. L2/L3 cases become accountable flows rather than email threads.
6. The same structure becomes the future foundation for chatbot / AI resolution.

### 4.4 Returns, refunds, and TM Wallet

Current returns/refunds are disjointed:
- Customers cannot fully create and resolve returns in-app today.
- Return Tracker exists and had been scaled to roughly 25% of app traffic at the point of discussion.
- User-reported working volume snapshot: about 1,500 inbound calls/day for about 900 unique return/refund cases; roughly 400 app requests. These figures should be revalidated with date/time context before executive use.
- Agents currently handle both inbound and app-originated requests.

Target return/refund milestones:
1. **Milestone 1:** Move initiation from inbound calls to app-first requests; where needed, agents operate outbound rather than customers repeatedly calling inbound.
2. **Milestone 2:** Reduce outbound dependency with clear status, evidence upload, eligibility, and decisioning.
3. **Milestone 3:** Automate low-risk refund decisions; preserve human / inspection / warehouse exception flows.

TM Wallet:
- Contains TM Rewards and TM Credits.
- User described Rewards as a function of TM Cash plus Cashback; Credits can be issued when something is returned.
- Current issues include wrong balance, incorrect ledger, missing/wrong expiry, and insufficient customer/agent visibility.
- This produces support tickets and prevents first-contact resolution.

### 4.5 Payments

**Current user-stated status overrides earlier roadmap material:**
- Upfront payment rollout and implementation are complete.
- Payment technical revamp is done.
- Juspay integration is agreed and needs to start.
- Earlier statement said the new payment service had gone live on six warehouses / around 50% of warehouses. Confirm current production rollout coverage before using that externally.

Payments now needs to focus on:
- Juspay integration and controlled rollout.
- Payment reliability and correctness: pending/failed/mismatch/duplicate/refund/paid-vs-payable correctness.
- Payment funnel instrumentation.
- Discovery and experiments to increase online payment contribution / reduce COD in eligible cohorts.
- The business ambition discussed was directionally reducing COD share from around 55% to around 35%; this is not yet a committed target and should not be promised without baselines and cohort evidence.
- Partial COD, selective COD restrictions, and COD fees for frequent defaulters were discussed as possible future experiments. These need careful cohorting, disclosure, customer-trust and conversion guardrails; they are not broad rollout commitments.

Important metric logic:
- Online payment contribution is its own primary business outcome.
- It also contributes to OP → OD, cancellation, RTO, support load, and trust, but those are secondary outcomes / guardrails for the payments bet.

### 4.6 Assisted Commerce and Ring AI

Current Assisted Commerce:
- Abandoned carts / incomplete orders are called manually.
- Every qualified lead may be called, regardless of true customer intent.
- This creates low agent efficiency and unnecessary human calling.

Ring AI direction:
- Ring calls / qualifies eligible leads into hot, warm, cold.
- Human agents focus on better-qualified leads.
- The primary promise is **higher human-agent conversion from assigned / qualified leads to placed orders** and lower human effort per recovered order.
- Ring may improve connectivity and may secondarily improve substitution conversations, but it should not be positioned as a substitution initiative or primarily measured against OP → OD.

Ring status:
- Non-negotiable carryover from the prior quarter.
- Separate from the four Q3 business bets in the executive roadmap.
- Core design concepts from the attached Ring PRDs:
  - one shared eligible lead pool;
  - atomic bot ownership / reservation to avoid duplicate human + bot contact;
  - `assigned_to = RING_BOT_USER_ID` / ownership lease concept;
  - select-and-claim rather than select-then-claim;
  - `max_in_flight` throttles bot pull / concurrency rather than filtering the pool;
  - outcomes normalised into Truemeds-owned taxonomy;
  - latest-state validation before human action;
  - M2a async agent routing is the committed MVP direction;
  - M2b live transfer is conditional;
  - M3 configurability / operational control is future scope;
  - need kill switch, reconciliation, outcome ledger, attempt ledger, suppressions, and operational controls.

Important Ring metric hierarchy:
- **Primary:** Human-agent conversion from Ring-qualified leads to placed orders.
- **Secondary:** overall abandoned-cart recovery, human calls/minutes per recovered order, lead qualification / handoff quality.
- **Guardrails:** no duplicate bot + human calls, lead aging, complaint/opt-out/DND impact, contact frequency, and post-placement discard/cancellation.
- Do not let higher agent conversion alone mask a fall in total abandoned-cart recovery because Ring incorrectly classifies viable leads as cold.

### 4.7 Contact / connectivity platform direction

Potential future direction is an order-aware demand/supply and contact-routing system, but do not over-label it in executive material as “marketplace” or other new terminology.

Conceptually:
- Demand: order/customer that needs Doctor, HA, CSR, bot, or no contact.
- Supply: role, eligibility, language/skill, availability, capacity, priority.
- Routing: who should contact which customer, when, on which channel, at what cost / priority.
- Long-term use cases: customer callbacks, live transfer, slot-based calling, pull calls, better routing, bot-human handoffs, personalized contact preferences, DND, regular-customer experience, and future AI voice/chat agents.

Near-term items:
- missed-call recovery;
- customer callback / order-aware routing;
- HA-first live transfer or callback queue where feasible;
- pull-call / customer-initiated / slot-based experiments;
- customer-first pre-connect before involving Doctor/HA;
- first-call pickup / first-connect baseline;
- anti-spam / number health;
- Truecaller and Ozonetel directory / whitelisting;
- operations self-service controls to enable/disable / rotate numbers through the day;
- a global DND / customer preference mechanism, with carefully defined exceptions for mandatory transactional/clinical communication.

---

## 5. Metric-backwards roadmap architecture

The final working model is intentionally simple.

### Hard gates — not scored against growth/cost
1. **Compliance and Doctor Quality**
2. **Customer financial correctness**
3. **Critical journey reliability**

### Four business bets
1. **OP → OD**
   - Primary metric: OP → OD.
   - Key outputs: discard rate, cancellation rate, first-call pickup, successful Doctor/HA connection, call-to-confirmation, false-substitution cancellation.
   - Includes baseline/impact items for Doctor/HA connectivity, missed-call recovery, substitution context, pre-connect, number health, and routing.

2. **CPO & Productivity**
   - Primary metric: CPO / operating cost per delivered order. Finance-aligned official definition still needed.
   - Key outputs: Doctor confirmations per active hour, HA confirmations per paid hour, CSR FCR, AHT, contacts per order, repeat contacts, transfers/escalations.
   - Includes Kapture mapping, case taxonomy, CSR actioning, accountability flow, role-specific CSR workspace, later chatbot foundation.
   - Do not optimise merely for fewer calls. The objective is fewer **unproductive** contacts while protecting required clinical contact and successful confirmation.

3. **Online Payments**
   - Primary metric: Successfully prepaid orders ÷ payment-eligible orders.
   - Key outputs: payment selection, initiation, success/finality, payment-related cancellation and support contacts.
   - Includes Juspay, payment funnel baseline, payment-flow experiments, correctness monitoring, and later risk-based COD experiments.
   - OP → OD is a key guardrail / secondary outcome.

4. **Trust & Retention**
   - Primary metric: repeat purchase / retention for eligible cohorts.
   - Key outputs: refund TAT, app self-service adoption, repeat contacts, Wallet correctness, substitute retention.
   - Includes returns/refunds milestones, customer-facing status/communication, Wallet fixes, substitute retention measurement.

### Separate non-negotiable carryover
**Ring AI Pilot**
- Primary metric: human-agent conversion from Ring-qualified leads to placed orders.
- It is pre-order Assisted Commerce / abandoned-cart recovery, so it is separate from the four post-order / operating bets.

### Initiative mapping rule
Each initiative should eventually have:
- one primary metric home;
- optional secondary outcome / guardrail;
- output metrics;
- input/baseline metrics;
- type: Impact, Foundation, Experiment, Correctness, or Pilot;
- Q3 role: Build, Pilot, Discovery, Foundation, Scale, or Fix;
- September decision: Scale / Iterate / Stop / Take to Q4.

Do not force every foundation item into a separate fifth business bet. Put it under the business bet it enables.

---

## 6. Baseline and instrumentation gaps

These are not separate projects. They sit under the relevant business bet.

### OP → OD baselines
- Actual dial attempts, not assumed attempts per assignment.
- First Doctor/HA call pickup.
- First successful connection.
- Time from order placed to first Doctor/HA contact.
- Missed-call callback funnel and callback-to-confirmation.
- Call-required discard / cancellation reasons by order category.
- Substitution offered / accepted / rejected / later-cancelled.

### CPO & Customer Care baselines
- Contacts per order: Doctor, HA, CSR, Ring, bot, inbound, outbound, chat.
- Doctor active hours, connected calls, successful confirmations, pending-order aging.
- HA paid hours, connected calls, successful confirmations, substitution outcomes.
- CSR AHT, FCR, transfers, repeat contacts, escalation rate by reason.
- Kapture ticket/contact mapped to order or explicitly non-order.
- Bot-to-human handoff-to-final-business-outcome linkage.
- Returns/refunds touches per case.
- Finance-aligned CPO cost decomposition.

### Payment baselines
- Eligibility → CTA exposure → payment mode selection → initiation → success/failure/pending → order outcome.
- Cuts by first-time/repeat, order category, app/web, skip logic, customer history.
- Pending, failure, retry, duplicate, mismatch, refund exception reasons.
- Post-payment cancellation, refund, and support-contact outcomes.

### Trust / retention baselines
- Accepted substitute → later purchase / refill / continued treatment linkage.
- No-Subs-Taken reason → later behavior.
- Repeat contacts by customer/order/reason/channel.
- Return/refund request → closure across app, inbound, outbound, inspection/warehouse.
- Wallet error taxonomy and closure outcome.

---

## 7. Doctor Portal direction

The Doctor Portal is the default delivery vehicle for most compliance and Doctor-workflow controls. It should not be treated as one undifferentiated rewrite.

Desired direction:
- New Doctor Portal / new service.
- Move front-end logic to backend where appropriate.
- Show Doctor only the information/actions needed.
- Cover Doctor journey from onboarding and credentialing through patient assessment, diagnosis, prescription, confirmation, quality/audit, and Doctor-to-HA handoff.
- Phased delivery, not a full rewrite promise in Q3.

Potential Phase 1 scope:
- Doctor onboarding / credentials / role access.
- Identity/session/call/prescription attribution.
- Patient name and age.
- Diagnosis capture.
- Patient-specific prescription creation.
- Multiple-patient Rx handling.
- Audit queue / evidence / review outcome.
- Doctor-to-HA context handoff.
- clinical routing / exception path.

---

## 8. Known supporting documents / evidence

Use the latest user statements over older documents when they conflict.

Available / referenced materials:
- `Doctor Initiatives - Compliance & Tech.xlsx` — source for broad Doctor, clinical rules, portal, HA, and compliance ideas.
- `Payment POD Roadmap - MJJ.docx` — historical payment roadmap. Superseded in part: user says upfront-payment work is complete and technical payment revamp is done; Juspay is agreed.
- `voicebot-cart-recovery-prd.md` — ACOM 2.0 / Ring AI full PRD.
- `mvp-engineering-walkthrough.md` — detailed Ring MVP lifecycle, ownership, attempt ledger, outcome normalization, latest-state validation, async routing.
- `rapid-pilot-prd.md` — Ring rapid pilot, pull model, max_in_flight, metrics, SQL / implementation contract.
- `Vineet_May_June Ask.pdf` — Portal fixes / HA workflow asks.
- `Vineet_Truecaller.pdf` — connectivity / Truecaller / spam-related work.
- `Vineet_MyRx.pdf` — MyRx pilot/integration context.
- `FRD-Doctor Call Compliance - Business Requirement...pdf` — Doctor call compliance context.
- `Order TAT Portal _ Order Fill rate _ Generic Deletion.pdf` — operational reporting / RCA ask.
- `CSR Empowerment – Gratification and Tools...xlsx` — CSR empowerment asks (where available earlier).
- `Not-for-sale drugs_ Phase 1...pdf` — Category X / not-for-sale drug enablement.
- `Truemeds Mail - ... Broken App Math, Missing Balance ...pdf` — Wallet/customer correctness signal.

---

## 9. Capacity and operating reality

Earlier stated planning capacity (revalidate for Q3):
- 1 SPM + 1 APM.
- 3 engineers nominally; only 2 effectively available at that point; one was loaned to Return Tracker and might return later.
- TL provides guidance/reviews but is not hands-on.
- Most engineers were SD1/new to Truemeds; contextual ramp-up matters.
- Product bandwidth is shared across payments, Doctor/HA portal, CSR/returns, stakeholder alignment, and baseline work.

Do not assume all initiatives can be committed. The raw initiative inventory is intentionally wider than Q3 capacity.

---

## 10. Important constraints / corrections from the discussion

- Do not call AOV/GMV “conversion” metrics. They are order-value / economics measures.
- Do not treat Doctor and HA cost identically:
  - Doctors are external supply paid per successful confirmation.
  - HAs are payroll; their productivity and substitution incentive design matter.
- Do not treat Ring as an OP → OD initiative. It is abandoned-cart recovery / agent conversion.
- Do not create a separate “foundation” business bet in executive material. Foundation items sit under the outcome they enable.
- Do not introduce new labels such as “Clinical Fulfilment” or “Marketplace” into executive material if existing language such as Compliance, OP → OD, CPO, Online Payments, Trust & Retention is clearer.
- Do not replace a simple roadmap with long initiative cards. Detailed metric trees belong in working notes / appendix.
- Do not treat address quality, delivery ETA, and broader logistics as primary levers for this pod’s COD/RTO roadmap.
- Do not assume a broad COD fee rollout. Treat as narrow, evidence-led, and trust-sensitive experiment only.
- Do not promise full Doctor Portal rewrite, full CRM replacement, universal chatbot automation, full contact marketplace, or full returns/refunds automation in Q3.

---

## 11. Open questions / uncertainties to preserve

These are not blockers for planning, but must not be silently invented:

1. **Quarter naming:** Roadmap should be Q3 / July–September. Existing workbook title uses Q2 and needs correction.
2. **CPO definition:** Confirm Finance’s official numerator, denominator, and cost allocations.
3. **Current payment rollout:** User says technical revamp is done; earlier evidence suggested partial warehouse rollout. Confirm current live coverage / migration status.
4. **Q3 team capacity:** Revalidate actual Product, Engineering, TL, Analytics, and dependency capacity before final commitment.
5. **100% Doctor audits:** Confirm whether it means 100% evidence/workflow coverage, 100% automated screening, or 100% human review.
6. **Returns figures:** Revalidate the 1,500 inbound calls / 900 unique cases / 400 app requests and current Return Tracker coverage before using them as a formal baseline.
7. **FTC refund scope:** Preserve as a separate workflow until its exact decision logic and relationship to returns/refunds is finalized.
8. **Customer-first pre-connect:** Still an experiment; customer behavior and spam perception are unknown.
9. **Pull-call / callback model:** HA-first may be a safer experimental starting point. Doctor flows have clinical, availability, and audit constraints.
10. **Partial COD / fees:** Legal/commercial/customer-trust policy and cohort design are open.
11. **MyRx:** Initial phase is manual-assisted POC / Postman bulk-runner testing; system integration only follows successful validation.
12. **Some historic initiatives:** Need reconciliation / removal where the latest user statement supersedes older May–June material.

---

## 12. Immediate next working step

Use the raw initiative Excel inventory with this sequence:

1. Remove / mark initiatives that are completed, obsolete, or explicitly dropped.
2. For each remaining item, assign one primary metric home:
   - Compliance
   - OP → OD
   - CPO
   - Online Payment Contribution
   - Retention
   - Ring Agent Conversion (Ring only)
3. Mark the item as Impact / Foundation / Experiment / Correctness / Pilot.
4. Decide whether Q3 role is Build / Pilot / Discovery / Foundation / Scale / Fix.
5. Add only the minimum output metrics needed.
6. Capacity-test the shortlist.
7. Turn the committed subset into a July–August–September roadmap.
