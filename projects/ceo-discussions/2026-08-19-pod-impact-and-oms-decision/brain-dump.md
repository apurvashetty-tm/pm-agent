# CEO Discussion Brain Dump

## Status

Working document. Exhaustive capture of inputs shared so far. Not final presentation copy.

Approximate figures remain marked for verification.

## Purpose of CEO discussion

Create visibility into the pod’s impact and current work. Avoid defensive framing.

The discussion should establish:

1. What the pod owns and why its work matters.
2. What measurable impact the pod has already created.
3. How the pod is unblocking Cart through the new OMS migration.
4. The decision required from the CEO: 
   - migrate only the reduced minimum scope; or
   - use the migration phase to implement selected high-impact enhancements as well.

This is not intended to end with an operating-model ask. The intended close is a scope/prioritization decision for Cart and OMS migration.

## Core story hypothesis

The pod is not only doing foundational, long-term work.

It is the downstream continuity, reliability, compliance, recovery, and efficiency layer connecting preorder to postorder. Changes made anywhere in the broader order journey create downstream impact in this pod. The pod absorbs that impact, handles short-term fixes, prevents customer and operational failures, and gives other pods breathing space to focus on larger initiatives.

Foundational work is already showing impact in multiple pockets:

- customer experience
- compliance
- OP→OD performance
- CPO and operating cost
- pharmacist and CSR productivity
- engineering capacity
- reliability
- business enablement
- sales unlocks

Potential CEO-level message:

> The pod’s impact is visible not only in features shipped, but also in losses prevented, operating cost removed, reliability created, engineering capacity released, and business initiatives enabled.

## Scope framing

- Payments and Portals should be presented as one pod story, not as separate narratives.
- Payments and Portals are distinct from the Work Managers side for this discussion.
- Team size: 6 engineers.
  - Portals: 4 engineers.
  - Payments: 2 engineers.
- Product is materially involved in the OMS and Portal migration scope reduction.

## Team composition

| Person | Level | Area |
|---|---|---|
| Anmol | SDE 1 | Portals |
| Nikhil | SDE 1 | Portals |
| Pravin | SDE 2 | Portals |
| Shekar | SDE 2 | Portals |
| Jigar | SDE 2 | Payments |
| Yash | SDE 2 | Payments |

Individual names likely do not belong in the CEO narrative. Team shape may matter when explaining capacity, engineering-hours saved, and migration trade-offs.

## What the pod does

### Downstream ownership

The pod is downstream of many changes. Regardless of where a change is made or what type of change it is, the pod is impacted and called for support.

Examples:

- Refund changes or logistics-refund failures trigger support needs.
- Preorder changes, such as experimental delivery charges, reach customers through CSR.
- Customer-facing consequences often surface in CSR even when the originating change belongs to another pod.

There is currently no consistent internal culture or process requiring CSR onboarding before experiments go live. This creates avoidable downstream risk.

### Leadership across dependencies

The team does not stop work by saying that an issue belongs outside its formal bucket. It takes leadership for the complete post-order customer experience, calls out dependencies, follows up proactively, and works with other teams even when those teams have competing priorities.

This is an important part of the impact story: the pod acts as the owner of the customer outcome, not only the owner of a narrow system boundary.

### Capacity released for other work

The pod handles recurring short-term fixes and operational unblocking. This gives other pods room to perform heavier, longer-term work.

Within this pod, recurring bug-fixing and operational support previously consumed most engineering bandwidth:

- Three pod engineers were regularly spending time on pharmacist-efficiency issues reported in the MUM_DEV channel.
- This happened day to day and reduced bandwidth for functional or impactful feature requests.
- Feature delivery was delayed because engineers were repeatedly pulled into bug fixes and operational unblocking and the issues used to be live, customers orders stuck, HAs stuck on orders (not able to confirm orders etc, so the would always be highest priorities)
- Today, just one on-call engineer handles most of this operational load.
- The on-call engineer is also contributing to functional features in addition

This represents an engineering-capacity recovery story. Required measurement: hours previously spent on bugs and operational support versus current hours. 

## Impact inventory

### 1. Compliance and customer safety: substitution issue

#### Problem

Multiple orders were being substituted during a doctor call without the customer having opted into the substituted medicine. Customers could receive a substitute medicine they had not selected.

This was a major compliance issue.

#### Business and customer impact

- Compliance exposure.
- Customer frustration and loss of trust.
- Possible cancellations.
- RTOs.
- Discards.
- OP→OD deterioration.
- Customer-retention risk.
- Processing cost for failed or abandoned orders.

#### Cost proxy

Approximate processing-cost assumption: **₹156 per affected order**.

Suggested estimation method:

```text
Affected substitution orders (200 orders per day)(currently 10 orders per day)
× assumed cancellation/RTO/discard rate
× ₹156 processing cost
= estimated direct processing-cost impact
```

Example assumption discussed:

```text
Affected orders
200 × 50%
× ₹156
= rough direct processing-cost impact
```

This excludes:

- customer-retention impact
- customer frustration
- compliance exposure
- support effort
- pharmacist/CSR effort
- delayed or lost revenue

#### Missing metric

Force-substitution/unauthorized-substitution numbers were not yet provided. These should be called out explicitly and verified:

- affected orders per day/month
- percentage of total orders
- substitution rate
- percentage not opted into by customer
- cancellations, RTOs, and discards caused
- customer contacts or complaints
- processing-cost estimate
- OP→OD impact

This is one of the strongest examples of why compliance work should still be translated into measurable business impact.

### 2. Customer support as downstream impact receiver

CSR is called whenever customer-facing consequences appear, including:

- refund changes
- logistics-refund failures
- preorder changes
- experimental delivery charges
- order-confirmation issues
- substitution or replacement issues

Current gap: CSR is not consistently onboarded before experiments go live.

This should be positioned as visibility into downstream impact, not as a request to expand team boundaries.

### 3. Order-confirmation reliability

#### Problem

At one point, almost every alternate Health Specialist call could fail to confirm an order. Doctors/pharmacists then had to call customers multiple times for one order.

The issue was linked to reliability problems involving telecom partners, but internal systems were not stable or observable enough to identify and attribute the failures clearly.

#### Work completed

- Improved internal system reliability and observability.
- Distinguished internal failures from external telecom-partner failures.
- Enabled clear attribution to telecom partners where applicable.
- Reduced repeated confirmation failures.

#### Current impact

- No longer seeing even one such case in a day, according to current observation.
- Fewer repeated calls to customers.
- Better customer experience.
- Better doctor/pharmacist experience.
- Reduced perception that Trumeds requires excessive calls for one order.
- Reduced operational disruption.

Metric verification required:

- baseline daily/weekly confirmation failures
- current daily/weekly failures
- repeated-call rate per order
- customer-contact reduction
- internal versus telecom-attributed failure split

### 4. Pharmacist Portal efficiency

The team identified and fixed multiple efficiency gaps in the Pharmacist Portal.

Reported business impact:

- Business team could reduce pharmacist headcount while processing a similar order volume.
- Throughput remained broadly in line with orders processed.
- 50% CPO reduction was observed. 16.5 to 7.8 
- Pharmacist effort per order decreased.
- Repeated manual work reduced.

Use conservative ₹8/day CPO reduction:
₹8 × 28,000 orders/day = ₹2,24,000/day
₹2,24,000 × 30 days = ₹67,20,000/month
Impact: approximately ₹67 lakh cost saved per month.
Using exact reduction ₹16.5 → ₹7.8:
₹8.7 × 28,000 × 30 = ₹73,08,000/month
Call out ₹67 lakh as conservative estimate; verify CPO definition, order denominator, and period.

### 5. Functional work was not blocked by foundational work

The team did not reject business requests by saying that the pod was busy with foundational or non-functional work.

Business asks continued to be supported alongside foundational work. This is important because the story should show both:

- long-term platform/reliability improvements
- immediate business and customer-impacting feature delivery

### 6. Value-Meds telecom switching

#### Problem

Value-Meds flow was disrupted by ozontel reliability issues involving telecom partners.

Each incident required:

- 2 engineers
- approximately half a day to one full day
- switching to and fro of the -Value-Meds flow
- switching telecom partners
- validating that switched flow works and no orders are stuck in transistion

This created a poor customer and pharmacist experience during each switch.

#### Work completed

- Improved system reliability.
- Created a simple business-facing toggle.
- Business team can switch flows and monitor whether Ozontel has fixed the issue.
- Business no longer needs to wait for engineering to perform every telecom switch.

#### Reported impact

- Happened four times in one month.
- Hencefoth does not need any engineering intervention, business tried this feature last week without any single engineer in loop.
- Approximate engineering effort avoided: four incidents × 2 engineers × 0.5–1 day.
- Business gained operational control.
- Engineering gained capacity.
- Customer/pharmacist disruption reduced.

Minimum avoided-effort estimate:

```text
4 incidents
× 2 engineers
× 0.5 day
= 4 engineer-days avoided per month
```

Upper estimate:

```text
4 incidents
× 2 engineers
× 1 day
= 8 engineer-days avoided per month
```

### 7. Valid-Rx categorization experiment

#### Business request

Business requested categorization for valid-Rx orders.

#### Approach

- Team created confidence that the older logic could go live without significant new development.
- Provided a fallback to cache logic if results were poor or business confidence dropped.
- Used minimal development and a reversible approach.
- Took the business along rather than requiring blind adoption.

#### Value

- Created a safe testing ground for the hypothesis that categorization could improve substitution in valid-Rx orders.
- Reduced experimentation risk.
- Enabled faster learning.
- Demonstrated speed, reversibility, and business confidence-building.

This is strong ammunition for the message that the pod enables business experimentation; it does not only maintain systems.

### 8. Ring AI readiness

For Ring AI, Product and Engineering prepared multiple paths:

- platform solution
- quick pilot
- whichever option business selected and found commercially viable

The team was ready to execute faster than the business could close commercials with Ring AI.

Impact message:

- Team was not the commercial or execution bottleneck.
- Product and Engineering had multiple viable implementation paths ready.

### 9. Voice-bot calling

The team supported both phases of voice-bot calling.

Although a longer timeline had been committed, CPO reduction targeted for March exit was achieved in the first quarter itself.

- committed date  - 31st March 2026
- actual achievement date - July 31st 2025
- baseline CPO - Rs 14
- current CPO - Rs 9

### 10. OP→OD improvements from post-order side

The pod affects OP→OD beyond upfront payment.

Problems addressed:

- Orders not getting confirmed.
- Orders stuck in incomplete status.
- Orders stuck in payment-pending status.
- Orders stuck due to payment mismatches due to decimal variations.
- Order getting forced subsitution
- Prepaid orders getting shifted to COD

Previously, some stuck orders had no clear owner or active recovery path. The team chipped into these issues and created cleaner order progression.

#### Payment-pending reduction

Approximate volume:

- Earlier: 1,500+ orders/day in payment-pending status.
- Current: approximately 200–300 orders/day.

Approximate reduction:

- Absolute reduction: approximately 1,200–1,300 orders/day.
- Percentage reduction: approximately 80%–87%, depending on selected baseline/current point.

This needs exact period and denominator verification.

#### Why this matters

Even when upfront payment improves, OP→OD will remain unhealthy if orders are stuck in post-order payment, incomplete, confirmation, or mismatch states.

The team’s fixes created a healthier OP→OD despite:

- a difficult operating month
- external factors such as rain
- operational pressure

Suggested causal chain:

```text
Reliability and order-state fixes
→ fewer stuck orders
→ fewer cancellations/RTOs/discards
→ cleaner order progression
→ healthier OP→OD
```

### 11. Order-cancellation recovery gap

Current approximate volume: **at least 100 orders/day** are canceled because functionality does not exist for:

- warehouse change
- logistics-partner change

Even when CSR convinces the customer to replace or continue the order, the customer must restart the entire order journey.

Impact:

- avoidable cancellation
- customer effort
- CSR effort
- possible loss of customer intent
- additional order-processing work
- OP→OD impact
- potential retention impact

Potential enhancement:

- preserve original order context
- allow warehouse/logistics-partner change
- recover or replace order without forcing a full restart

Need verify:

- exact daily cancellation volume
- percentage recoverable by functionality
- CSR save rate
- replacement completion rate
- time saved per CSR/customer
- OP→OD and revenue impact

### 12. Compliance ownership

The pod handles an important compliance thread.

#### Incorrect invoice identity

Many invoices were being generated in the name of Dr. Sachin. This is not advisable and creates a compliance issue.

Required work:

- correct invoice identity logic
- quantify affected invoices
- confirm compliance resolution

#### ABHA cards

There is a request to generate ABHA cards for all health workers.

Need clarify whether:

- this is completed
- this is in progress
- this is planned
- there is a measurable compliance/business outcome

### 13. NFS salts

The team enabled NFS salts as a business ask.

Reported business impact:

- unlocked sales of up to ₹2 crore

Need verify:

- whether ₹2 crore is actual realized sales or maximum unlocked opportunity
- measurement period
- incremental versus total sales
- direct attribution to NFS salts

## Cost and CPO impact

### HA CPO

Reported values:

- Start of financial year: ₹16.5 per order/day.
- Current: ₹7.8 per order/day.
- Reduction: ₹8.7 per order/day.
- Percentage reduction: approximately 52.7%.

Conservative presentation estimate uses approximately ₹8/day saved.

Assumed daily orders delivered: **28,000**.

#### Conservative monthly calculation

```text
₹8 CPO reduction/order
× 28,000 orders/day
= ₹2,24,000 saved/day
```

```text
₹2,24,000 saved/day
× 30 days
= ₹67,20,000 saved/month
```

Estimated impact: **approximately ₹67 lakh saved per month**.

#### Exact-reduction monthly calculation

```text
₹8.7 CPO reduction/order
× 28,000 orders/day
= ₹2,43,600 saved/day
```

```text
₹2,43,600 saved/day
× 30 days
= ₹73,08,000 saved/month
```

Estimated impact using exact stated CPO difference: **approximately ₹73 lakh saved per month**.

Use ₹67 lakh as a conservative estimate until CPO definition, order denominator, and measurement period are verified.

### CSR CPO

Similar CPO improvement has been achieved for CSR.

Missing inputs:

- starting CSR CPO
- current CSR CPO
- CPO reduction per order
- CSR order volume/day
- measurement period
- monthly cost saved

### Engineering capacity saved

Potential calculations:

```text
Hours avoided on recurring bugs
× fully loaded hourly engineering cost
= monthly engineering capacity/cost released
```

For Value-Meds switching specifically:

```text
4 incidents/month
× 2 engineers
× 0.5–1 day/incident
= 4–8 engineer-days avoided/month
```

For recurring pharmacist-portal support:

- quantify hours spent by three engineers before the on-call model
- quantify current on-call hours
- calculate hours released for functional work
- show feature delivery or cycle-time improvement enabled by released capacity

## Cart and OMS unblocking

### Current dependency

Cart cannot be fully unblocked until the new OMS goes live.

For OMS to go live:

- portals need to migrate to the latest OMS
- payment services need to migrate to the latest OMS
- existing functionality must be assessed
- unnecessary feature scope should be removed

### Current team work

Product and Engineering are reducing migration scope while protecting useful business capability.

Example:

- Super Doctor Portal has 29 existing features.
- Migration currently targets 16 useful features.
- Product is doing substantial discovery and prioritization:
  - identify required features
  - identify unused features
  - identify discardable features
  - identify enhancement opportunities
  - expose portal gaps

### Product impact

This migration acts as a practical crash course for Product:

- deeper understanding of Portal behavior
- better understanding of user workflows
- visibility into gaps across portals
- awareness of duplicated or inconsistent features
- stronger basis for future prioritization

Current limitation: enhancements are being documented or noted, but are not necessarily being implemented during migration.

## Enhancement candidates for decision

These examples should be used to make the migrate-only versus enhance-and-migrate choice concrete.

### 1. Substitute-pricing consistency

Current problem:

- In Assisted Commerce, each original medicine shows a substitute recommendation with proportional pricing.
- In Type 1 orders or CSR-created orders through the Pharmacist Portal, substitute pricing is not matched consistently.
- Pharmacist may need to pitch the substitute from memory.
- Price can be higher than the app or website.

Impact:

- Customer sees inconsistent pricing for the same medicine/order.
- Customer distrust increases.
- Pharmacist substitution conversation becomes harder.
- Potential conversion, cancellation, and retention impact.

Potential enhancement:

- unified substitute recommendation and proportional-pricing logic across commercial order flows.

### 2. HA-call opt-out propagation

Current problem:

- Customer who opted out of HA calls may still be included in Assisted calls.

Potential enhancement:

- propagate customer call preference across all relevant call flows.

Impact:

- respect customer preference
- reduce unwanted calls
- reduce compliance/customer-experience risk

### 3. HA-call skip path

Current problem:

- In Type 1 orders, pharmacist is already the substitution touchpoint.
- There is no separate path or skip option for the HA call.

Potential enhancement:

- allow HA call to be skipped when pharmacist workflow has already completed the required interaction.

Impact:

- fewer repeated calls
- lower call cost
- better customer/pharmacist experience
- improved order speed

### 4. Unified CRM and Commerce capabilities

Current state:

- CRM portals and Commerce portals are separated.
- Commercial platforms operate in silos.
- Platforms share similar capabilities but have inconsistent feature coverage.
- Some portals have features that others lack.

Relevant platforms:

- Type 1 order
- Pill Reminder
- Assisted Commerce
- Pharmacist Portal
- other commercial order platforms

Potential enhancement:

- create unified capabilities across commercial platforms rather than repeating fragmented implementations.

Potential value:

- consistent customer experience
- consistent pharmacist/CSR workflow
- less duplicate development
- easier future migration
- common instrumentation
- fewer portal-specific gaps

Need clarify whether this is:

- an immediate OMS migration enhancement
- an architectural direction exposed by migration
- a future opportunity outside current Cart scope

### 5. TM credits and coupons in Pill Reminder

Current problem:

- Pill Reminder Portal cannot apply TM credits and coupons.
- Order is discarded.
- Pharmacist then recreates the order in Pharmacist Portal.

Impact:

- avoidable discard
- repeated order creation
- customer effort
- pharmacist effort
- possible loss of conversion
- possible OP→OD impact

Potential enhancement:

- support credits/coupons in Pill Reminder flow or provide a seamless recovery path.

### 6. Warehouse/logistics-partner change

Current problem:

- At least 100 orders/day are canceled due to missing warehouse-change or logistics-partner-change functionality.
- CSR may convince customer to continue, but customer must restart full journey.

Potential enhancement:

- preserve order and customer context while changing warehouse or logistics partner.

### 7. Instrumentation

Potential enhancement:

- add instrumentation during migration to expose order-state, customer, operational, and business gaps.

Potential value:

- measure business goals directly
- quantify cancellations, stuck orders, retries, recovery, and call outcomes
- identify portal-level inefficiencies
- prove impact after launch
- reduce future debate about foundational work

## Decision framing

### Option A: migrate-only

Migrate only the reduced set of required/useful functionality.

Benefits:

- protects Cart delivery timeline
- reduces immediate scope
- lower migration complexity
- faster move to new OMS

Trade-offs:

- known customer and operational gaps remain
- duplicated portal behavior remains
- customer trust issues remain
- some rework may be required later
- instrumentation gaps may continue

### Option B: enhance-and-migrate

Implement a selected set of high-impact enhancements during migration.

Benefits:

- addresses known customer pain while touching the systems
- improves consistency across commercial platforms
- removes avoidable order failures and manual work
- creates stronger foundation for Cart and OMS
- may reduce future rework

Trade-offs:

- can increase scope
- can increase delivery risk
- may derail or delay Cart date
- requires explicit prioritization and capacity allocation

### Suggested CEO question

> We have reduced the migration scope from existing functionality to what is genuinely useful. During this migration, should we also implement a defined set of high-impact enhancements, or should we protect the Cart date and defer those improvements?

The decision should not be framed as “do everything” versus “do nothing.” A practical middle option is:

- migrate-only baseline
- plus a small, explicitly approved set of enhancements
- with clear impact and delivery-risk estimates

## Recommended narrative order

### Opening: impact first

Start with measurable outcomes, not detailed project history.

Suggested opening:

> This pod has created measurable impact across cost, reliability, customer experience, compliance, and business enablement. The work often appears foundational because it sits downstream, but it has removed recurring operational losses and released capacity across the order journey.

Then show a compact impact scorecard:

- HA CPO: ₹16.5 → ₹7.8.
- Conservative HA cost saving: ~₹67 lakh/month at 28,000 orders/day.
- CSR CPO: baseline/current to be added.
- Payment-pending: ~1,500+/day → ~200–300/day.
- Telecom confirmation failures: near zero daily.
- Value-Meds switching: 4 incidents/month no longer require engineering intervention.
- NFS salts: up to ₹2 crore sales opportunity enabled.

### Middle: demonstrate how impact was created

Use only one or two detailed proof stories:

1. Reliability story: repeated confirmation failures → attribution and reliability → near-zero cases.
2. Cost/capacity story: CPO reduction plus recurring bug/support effort removed.

Keep substitution, payment, compliance, and other examples in a scorecard or appendix unless CEO asks for detail.

### Pivot: current Cart work

> The same team is now unblocking Cart by moving the required portals and payment services to the new OMS and reducing migration scope from existing functionality to useful functionality.

Show Super Doctor example: 29 features → 16 useful features.

### Close: CEO decision

> The migration creates a choice. Do we migrate the reduced minimum scope and protect the date, or use this phase to implement selected high-impact enhancements that address known customer and operational gaps?

## Data and verification checklist

### CPO and cost

- Verify HA CPO baseline: ₹16.5.
- Verify current HA CPO: ₹7.8.
- Confirm exact measurement dates.
- Confirm whether CPO means cost per order, cost per delivered order, or another definition.
- Confirm 28,000 daily orders are the correct denominator.
- Confirm whether 30-day month assumption is acceptable.
- Add CSR baseline/current CPO.
- Add pharmacist baseline/current CPO.
- Verify whether CPO reduction is fully attributable to this pod’s work or shared with other initiatives.

### Force substitution

- Get affected order volume.
- Get percentage of orders involving substitution.
- Get rate of substitution without customer opt-in.
- Get cancellation/RTO/discard rate.
- Validate ₹156 processing-cost proxy.
- Identify compliance and retention metrics.

### Reliability

- Baseline and current confirmation-failure counts.
- Repeated calls per order before/after.
- Telecom-partner failure counts.
- Internal failure counts.
- Exact current definition of “not even one case in a day.”

### Payments and order states

- Payment-pending baseline and current period.
- Incomplete-order volume before/after.
- Payment-mismatch volume before/after.
- Decimal-mismatch recovery volume.
- Orders released/recovered by engineers before fixes.
- Engineer-hours avoided.

### Pharmacist and CSR efficiency

- Pharmacist headcount before/after.
- Orders processed before/after.
- Pharmacist time per order before/after.
- CSR CPO before/after.
- CSR volume and order mix.
- Number of recurring issues moved to on-call or self-service.

### Value-Meds

- Exact number of incidents/month.
- Engineers involved per incident.
- Hours per incident.
- Business downtime or customer impact per incident.
- Fully loaded engineering cost.

### Cancellations and recovery

- Validate ≥100 cancellations/day.
- Split by warehouse versus logistics-partner cause.
- Estimate recoverable percentage.
- CSR save rate.
- Replacement completion rate.
- Customer and CSR time saved.

### Business enablement

- Voice-bot CPO target and result.
- Ring AI readiness date versus commercial closure date.
- Valid-Rx experiment outcomes.
- NFS salts: actual sales versus opportunity unlocked.

## Items needing clarification before final presentation

1. Exact Cart go-live date and schedule buffer.
2. Mandatory OMS migration scope.
3. Which enhancements are feasible without changing the date.
4. Estimated effort for each enhancement.
5. Whether CRM/Commerce unification belongs in current scope or future roadmap.
6. Exact CSR CPO impact.
7. Force-substitution count and financial impact.
8. Engineering-hours saved from recurring bug fixes.
9. Whether CEO should choose from a ranked shortlist or decide only between migration-only and enhance-and-migrate.
10. Whether the final artifact should be a short CEO deck, a one-page memo, or both.

## Final discussion points — latest direction

This section captures the latest agreed discussion direction. Initial raw dump above remains unchanged.

### Meeting objective

Paint a brief, credible picture of impact already created. Then show how Product and Engineering are unblocking Cart through new OMS adoption. End with one decision:

> Should we protect Cart delivery by migrating only reduced useful scope, or implement selected enhancements in parallel and accept possible Cart-release risk?

No operating-model ask. Engineering bandwidth is not the main discussion; Director of Engineering can defend capacity. Focus on Product contribution and decision trade-off.

### Part 1 — brief impact lookback

Use a few short stories showing:

```text
Business ask → foundational work built → measurable impact
```

Suggested stories:

- Order-confirmation failures → reliability fixes, attribution, telecom-partner controls → near-zero daily cases, fewer repeated customer calls, better pharmacist experience.
- Payment-pending/incomplete orders → order-state, payment-mismatch, and decimal-difference fixes → payment-pending orders reduced from ~1,500/day to ~200–300/day; healthier OP→OD; recurring engineering effort removed.
- Value-Meds switching failures → business-controlled toggle and reliable partner switching → four monthly incidents no longer require engineering intervention.
- Valid-Rx categorisation request → low-development, reversible rollout with cache fallback → safe business testing and faster hypothesis validation.

Impact directions:

- CPO reduction.
- Pharmacist and CSR productivity.
- Engineering hours released from recurring bug fixes.
- Customer contacts avoided.
- Cancellations, RTOs, and discards prevented.
- Compliance and customer-trust risk reduced.
- Business and sales initiatives enabled.

Force-substitution numbers should be added once verified. This remains a key compliance and customer-risk story, not an item to omit because direct metric impact was not initially tracked.

### Part 2 — Product contribution to Cart unblocking

Cart requires new OMS adoption. Portals and payment services need to migrate to the latest OMS.

Product is doing heavy lifting before and during migration:

- Mapping existing features.
- Identifying actual usage.
- Separating useful functionality from redundant functionality.
- Avoiding throwaway work.
- Reducing ambiguity before Engineering builds.
- Identifying cross-portal gaps and enhancements.
- Creating faster alignment between Product and Engineering.

Super Doctor example:

```text
29 existing features → 16 useful features selected for migration
```

Value created by Product:

- Less redundant development.
- Lower rework risk.
- Faster Cart delivery through reduced scope.
- Better understanding of portal workflows.
- Better understanding of missing capabilities.
- A clearer enhancement backlog for future phases.

### Part 3 — Enhancement direction

Current state: enhancements are being identified, not implemented. Implementing them in parallel may push Cart release.

Longer-term direction: unified commerce platforms with consistent capabilities to execute and place orders across commercial journeys.

Keep enhancement examples limited to two:

- **Call-preference propagation:** Customers who opt out of HA calls also skip Assisted Commerce calls, except mandatory Doctor calls.
- **Configurable agent categorisation:** Categorise agents uniquely across portals and route orders/customers using relevant signals *(rule engine)*.

These examples show how future capabilities can reduce customer friction, support differentiated workflows, and enable faster business experimentation with lower recurring Product and Engineering dependency.

### Final decision framing

> We are currently reducing OMS migration scope and identifying high-value gaps. Should this phase remain migration-only to protect Cart delivery, or should we implement a focused set of enhancements in parallel with an explicit risk to the release date?
