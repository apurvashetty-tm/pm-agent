# narration_log.md — Type 1 Revamp

**Purpose:** Chronological record of everything Swapnil shares on this project, in his own words (typos fixed only, no paraphrasing away detail), plus the follow-up action taken. It protects against context loss across sessions. **Append new entries at the bottom; never summarise old entries away.**

**Owner:** Swapnil Singh (swapnil.singh@truemeds.in)
**Started:** 2026-10-05

---

## Entry 1 — 2026-10-05 — Project kickoff

> Project Type 1 Order. On Desktop I have a Type 1 project folder with screenshots of the app flow. Go through it; we will need to evaluate Truemeds vs 1mg. I want to improve the Truemeds customer experience, and need to change the flow. Evaluate the current flow of Truemeds. One thing I liked about 1mg was it only adds items in the cart and did not place an order, whereas in Truemeds we place the order. That too is not right to me. Also, after uploading the prescription we are showing "order placed"; that too is incorrect. For reference use Apurva's PM agent to join up the gaps. We will go: evaluation, critique, brainstorm, then finalise the flow. Let's start with the first step. Until I say to move to the next step, do not move; always take confirmation. This will prevent unnecessary rework. Make it a rule for my conversation.

Follow-up: saved the stepwise-confirmation rule; reviewed 24 TM + 45 competitor screenshots (rebuilt order from timestamps; WhatsApp export is reversed); loaded Type 1 definitions from tm-chotu; wrote `docs/01-evaluation.md`. Stopped for confirmation.

---

## Entry 2 — 2026-10-05 — Go to critique; 1mg only

> Both flows. First go into critic mode on TM. 1mg has 1mg-only screenshots; I have deleted one file. Compare both platforms.

Follow-up: found the deleted file was a Google-account screenshot; 9 PlatinumRx screens were still in the 1mg folder → moved to `reference/excluded-platinumrx/`, excluded from scope. Rewrote the evaluation as TM vs 1mg; wrote `docs/02-critique.md` (C1–C15, 1mg M1–M7, scorecard, "trust vs capture" tension). Stopped for confirmation.

---

## Entry 3 — 2026-10-08 — Full scope + pharmacist portal

> So, okay, the Type 1 project is a comprehensive project. It has three parts. First is the customer journey that we are currently doing. Second is the OMS allocation of these Type 1 orders. And third is the portal, the Type 1 portal where our customer service or pharmacist can assist the customer to place an order. Current scope we have defined is two parts. First is the allocation part. Currently we have a logic of creating an order, placing an order at that time. We want to change it to a request, "request medicine", something like that, same as 1mg. So there would be one change in the order statuses. Next would be the portal itself. Currently there are a couple of bugs in the flow; I want to get them corrected. We currently have a portal; it pretty much works. There are a couple of misses in it. Put that in scope: reuse as much as possible, and enhance as much as required. That is the goal. I'll add the HTML file of the portal. Please go through it. Then we can start the brainstorming.
>
> One of the scope items I have added: we have two types of leads. One is orders: the customer has finally submitted, "please place an order for me". And one is: the customer has just uploaded a prescription but never went ahead. Currently, in case of abandoned cart, we have data and a flow. We call it a lead; it flows to the Assisted Commerce portal, where if a customer has added items to a cart and doesn't do anything, we call them to help and know why they are not placing, what the problem was, and if need be we support them to place an order. So those leads are there. In Type 1 we are missing all the leads; there is no cart-abandonment flow in Type 1. I know there is no cart in it, but there is a flow, there is intent by a user. We need that lead flowing to the Assisted Commerce portal, so the agent can call and ask what went wrong, how we can support, and try to convert. That is one of the goals.
>
> Next: currently our search is very bad. When a pharmacist calls to help a customer place a Type 1 order on the portal, their search is very bad. We need to improve the search, and also add instrumentation to know what out-of-stocks we currently have. Agents get the prescription and try to search a medicine. One problem: if a medicine is not available, they are not able to see it. So improve the search. Second: even if it is out of stock, we don't have any instrumentation of what they were looking for. We need the data: how many requests we are getting that are currently out of stock.
>
> Third is discounting. Currently the discount coupon is visible on the portal, but not that good. We need to make it more comprehensive so that whatever discount is applicable to the customer is available, so agents can help apply the coupon and move ahead. It will help improve conversion.
>
> And fourth is the customer journey in the app itself. So this is the scope. We call this portal the pharmacist portal; there is a Type 1 order flow and a Create Order flow. Type 1 order is for all customers who have placed an order via prescription upload; Create Order is where an agent can create a new order altogether for any customer. Go through that flow, analyse it, then we start brainstorming.

Follow-up: unpacked the portal HTML (v4.8.8, packed React app + mock API), fed sample data to render Type 1 screens, read code; captured 12 screens; wrote `docs/03-portal-analysis.md` (flows, findings P1–P21, reuse list). Stopped before brainstorm.

---

## Entry 4 — 2026-10-08 — Apurva's repo update

> Also go through the Type 1 portal in the PM agent from Apurva; he has updated the repo.

Follow-up: fetched `origin/main` (local main has 3 unpushed Project South commits, diverged, not merged). No dedicated Type 1 portal project. Added §6 to `03-portal-analysis.md`: Portal Unification, ACOM lead machinery, who handles Type 1 today, DNC rules.

---

## Entry 5 — 2026-10-08 — One by one; min effort, max impact

> Let's break it one by one: the allocation and type of order, placed flow. That I want to find first: minimum effort, maximum impact, and close this project.

Follow-up: wrote `docs/04-brainstorm-w1-order-to-request.md`: options A (copy only), B (request stage + in-app approval, recommended), C (new request entity).

---

## Entry 6 — 2026-10-08 — No app release

> 1. The app is big for me; it would require an app release and the app is currently in experimentation, will take time. Let's focus on backend small changes and portal; that is the priority.

Follow-up: added §4b B-lite: L1 backend only (status, metrics, notification copy, server-driven labels); L2 portal "Send for approval on WhatsApp". App-side fixes parked.

---

## Entry 7 — 2026-10-08 — Opportunity sizing sheet

> Type 1 — Opportunity Scoping. Target: 1,333 → 1,750 OP/day | 133 → 250 OD/day.
> Funnel: OP/day 1,333 → 1,750 (+417); OP/month 40K → 52.5K (+12.5K); OD/day 133 → 250 (+117); OD/month 4K → 7.5K (+3.5K); OP→OD 10% → 14.3% (+4.3 pp); OP GMV/month @ ₹1.5K AOV ₹6 Cr → ₹7.88 Cr (+₹1.88 Cr).
> Levers: Assisted Commerce (55K stagnant opportunities/month → +10K OP/month); Allocation (after-hours orders not called/allocated in time → reduce cancellation → ↑ OD); Engagement (prescription upload → order placement lacks clarity → reduce surprise/cancellation → ↑ OD); Coupon (agents cannot apply coupons → improve conversion → ↑ OD); OOS Recovery (~10K orders impacted by OOS → substitute search → recover OD).
> Bottom line: +12.5K OP/month → +₹1.88 Cr OP GMV/month; +3.5K OD/month → +₹52.5L delivered GMV/month.

Follow-up: saved as `docs/00-opportunity-sizing.md`; checked the math; ~64% of the OD gain must come from conversion levers; flagged the OP-definition tension and the unattributed +2.5K OP.

---

## Entry 8 — 2026-10-08 — Fetch current allocation logic

> Allocation logic can be fetched from the PM agent or the HTML if available: the current logic. Check that.

Follow-up: read portal code (claim-on-open lock, super-pharmacist assign, no age/SLA) and repo knowledge.

---

## Entry 9 — 2026-10-08 — Confirmed reference

> "Pharmacist Type 1 queue", a LIFO mention, and Rank-Up: this is correct, refer to this.

Follow-up: wrote `docs/05-allocation-current-logic.md` with this as the reference.

---

## Entry 10 — 2026-10-08 — Dig into ranking

> Probe further in the repo; any other thing that can be identified. Need details about the ranking.

Follow-up: found the doctor-pool ranking stack, HGS mechanics, ACOM `final_score` (verified on 100/100 sample rows), rank status codes. (Later isolated per Entry 11.)

---

## Entry 11 — 2026-10-08 — Isolate Type 1

> Do not mix up allocation logic from other modules into this module; only isolate Type 1.

Follow-up: rewrote `05-allocation-current-logic.md` as Type 1 only; moved other-module material to `docs/parked-other-module-allocation.md`; saved the isolation rule.

---

## Entry 12 — 2026-10-09 — Allocation inputs

> (On the missing features: no "next order" button, no wait-time column or sorting by age, no time limit once an order is claimed, no shift awareness, no rule for orders that arrive after hours, no alert when the queue builds up) **Keep that as scope for improvement.**
>
> (On: orders arrive overnight while nobody is working the queue; in the morning newest-first puts fresh uploads on top so overnight customers are reached last; nothing raises them unless the customer escalates; without a wait-time column a super-pharmacist can't see who waited longest) **Add this as a problem to solve as part of discovery.**
>
> (On pharmacists' working hours) **Morning: assume 9 to 7.**
>
> (On "Hold — not resolved by the admin") **Means the order is moved out of the queue for 1 hour. There is also Schedule, where the user explicitly asks to delay the call. Hold comes if the call does not get connected.**

Follow-up: added hours, Hold, Schedule to §1; discovery problem §3; scope A1–A6 §4; updated open items.

---

## Entry 13 — 2026-10-09 — Separate project + continuity

> Let's create a separate project in the repo for Type 1. Keep the logs, decisions and all the supporting files, data and chats in the project "Type 1 revamp". Also keep a continuity md, which helps me keep continuity: maintain any chats just by loading the repo folder in Claude in any session.

Follow-up: moved `projects/type1-order-flow/` → `projects/type1-revamp/`; added `CONTINUITY.md`, `CLAUDE.md`, `docs/context/{project_truth, decision_log, open_questions, narration_log}.md`; refreshed `session_handoff.md`. Not committed (awaiting instruction).

---

## Entry 14 — 2026-10-09 — OMS scope: request state, two arms, abandoned → ACOM

> Let's start with OMS. Scope is introducing the intermediate state in the flow rather than directly placing the order, i.e. order creation will be done after the pharmacist call and creates the cart. Here too we will have experimentation: we will just create the cart and ask the customer to take it ahead, and also have the current flow where the pharmacist adds the medicines to the cart and places the order. We also need to add the flow where an abandoned flow moves the lead to ACOM, similar to the current cart-abandoned lead flow; need to evaluate how we handle that. In cart abandoned we have medicines in the cart and the cart already created; here only the prescription will be available.

Follow-up: wrote `docs/06-brainstorm-oms-request-state.md` (request state P1 vs P2; Arm A assisted vs Arm B self-checkout; abandonment points L1–L5; cart leads reuse ACOM; Rx-only leads R1+R2; metrics; decisions Q1–Q10). Stopped for picks.

---

## Entry 15 — 2026-10-12 — Request = Pending Verification; pharmacist creates the order

> Let's focus:
> 1. Every Type 1 action by the user will be considered a request, not the order. Hence we need to create the intermediate state where the Type 1 order is in the Pending Verification state; the order will be created and verified by pharmacists using the Type 1 portal.
> 2. More enhancement in this part.

Follow-up: wrote `docs/07-pending-verification-state.md`: state model R1–R6 → O1; flagged the clash with the existing portal status `PENDING VERIFICATION` (= digitised, awaiting call); enhancements E1–E15 (state/data, portal, comms); recommended v1; decisions Q1–Q6. Stopped for picks.

---

## Entry 16 — 2026-10-12 — Picks on PV1–PV6 + future scope

> 1. Make the new status "RX Verification Pending".
> 2. Let's have both. For no app changes, we will use the current flow of order creation, but with one more intermediate state. But down the line, in the full revamp where we are planning to unify the portal, this will be a lead: pharmacist calls, lead tagged as Type 1, something in this line. Explore both.
> 3. Yes, we need to experiment on the part where the pharmacist only adds the medicine to the cart and the user has to take it forward. Add that as a flow for the experiment. Here there will be complications in current agent conversion and incentive; need to look at that as well.
> 4. Add more scope: ACOM lead flow. For all the abandoned Type 1 carts, a lead flows to the ACOM portal for a call.
> 5. Let's keep the rule configurable, with attempts and time.
> 6. Yes, need to keep handling of that.
>
> In future scope, the plan is that we follow the flow of 1mg where users are kept engaged on the app and call wait and assignment are done in real time. That's future scope.

Follow-up: updated `docs/07-pending-verification-state.md` §7–§14: picks; Now vs Future (intermediate state now; Type 1-tagged lead in Portal Unification later; now as stepping stone); Arm B flow + conversion/incentive complications (attribution window, split credit, incentive-neutral test, carts-built productivity); ACOM lead scope for all abandoned Type 1 carts; configurable abandon parameters; after-hours handling; future 1mg real-time scope. Stopped for go-ahead to Finalise.

---

## Entry 17 — 2026-10-12 — Mid-flow abandonment → ACOM; incentives out of scope

> Abandoned also means: let's say the customer uploads the prescription but never clicks or moves through to the final "place order" or "raise request". This is the equivalent of a cart abandoned mid-flow; this too needs to flow to ACOM.
> Just keep the incentive calculation out of scope currently; just keep the callout of the cart-creation-only flow's impact on this. Let's brainstorm further.

Follow-up: wrote `docs/08-abandoned-type1-leads-acom.md`: full abandon taxonomy (M1–M3 mid-flow, V, A, B); detection without an app release (MQ1 engineering check; value gate likely hides Rx-only incomplete orders today); Rx-only handling H2 nudge → H1 ACOM qualifies & raises a prioritised request; Type 1 lead rules; metrics; Arm B conversion callout. Trimmed `07` §9.2 to a callout (incentive options parked). Stopped for picks MQ1–MQ6.

---

## Entry 18 — 2026-10-12 — Picks on abandon taxonomy + ACOM handling

> M1 — "Proceed to checkout" is current behaviour; need to change app scope to something similar to "raise medicine request", something like 1mg.
> M2 — Yes, in the scope.
> M3 — This I believe should not exist in the flow altogether in the future flow, but for the current flow it should be considered as an abandoned flow.
> V — Shouldn't this be part of Type 1 itself? Never verified; need to brainstorm on this problem's solution.
> A, B — all are part of ACOM.
> ACOM call is irrespective; the comm will be a different scope.
>
> 3. "Back to pharmacist" — this needs to be an open point, how we handle this. My call is to keep it with ACOM: here ACOM can talk and create the order for the customer over the call.
> 4. Priority — ACOM logic of prioritisation will be as is; just the cart-value filter needs to be handled, as there will be no way to identify the cart value.
>
> What I need from you:
> 1. This will be an engineering problem; frame it as a requirement and engineering will figure it out.
> 2. Irrespective of the nudge we will call; scope it that way. Nudge too will be in the scope.
> 3. Yes.
> 4. TBD, how we prioritise will need to be brainstormed; we will use current logic for now, excluding the value filter.
> 5. Need to confirm this.
> 6. Yes.

Follow-up: `docs/08` §9 picks, §10 engineering requirements (REQ-L1–L7 lead creation, REQ-Q1–Q6 ACOM queue, §10.3 open point ACOM-creates-order implications, APP-1/APP-2 parked app requirements), §11 brainstorm for V (never verified): causes, options V1–V7, lean V1+V3+V2+V6, proposal to treat V as first slice of W1b. Stopped for VQ1–VQ4.

---

## Entry 19 — 2026-10-12 — CTA wording; portal approach

> (On "App changes logged and parked: replace 'Proceed to checkout' with 'Raise medicine request', and remove the payment step from Type 1") Change the CTA to something else.
>
> Also, the approach now for the portal will be not to have a complete revamp, as we are going to unify portals later. Before that we will use the current portal; make this the road ahead.

Follow-up: wrote `docs/09-portal-road-ahead.md`: Now (current portal, small changes: status, buttons, columns, config, bug fixes, OOS logging, coupon reach) vs Later (Portal Unification: lead model, push/real-time allocation, shared components, agents by skill); CTA wording options for APP-1 (lean "Send to pharmacist"); P20 duplication note. Updated APP-1 in `08` §10.4.

---

## Entry 20 — 2026-10-12 — Close OMS

> Let's close the OMS for now.

Follow-up: wrote `docs/10-oms-prd.md` (lean PRD format, `templates/lean-prd-guide.md`) consolidating D15–D34: request status, pharmacist creates the order, Arm A/B, all abandoned journeys → ACOM, configurable rules with working defaults, after-hours, scope in/out, open items with owners (E1–E4 engineering, P1–P5 product), metrics. Never-verified (V) handed to W1b. W1a marked closed for now.

---

## Entry 21 — 2026-10-12 — No Rx-validity gate

> Pharmacist verifies or not, still he can call and ask the customer, because sometimes users upload the medicine photo; that too can work. The confirmation of a valid Rx is of no point. It should just take the tag that it is a prescription or not, and the Type 1 flow goes ahead.

Follow-up: PRD bumped to v0.2 (`docs/10-oms-prd.md`): removed the validity gate and the "rejected" branch; pharmacist tags Prescription / Not a prescription and the flow continues; Rx compliance stays with today's post-order flow; guardrail changed; added P6 (unusable upload) and P7 (status name). Noted the portal already has "Is it RX Image? Yes/No" on Verify Rx (reuse) in `09`.

---

## Entry 22 — 2026-10-13 — PRD feedback: list every problem we're solving

> (Paraphrase kept close to the voice note; long dictation.) I got feedback on the PRD. It was supposed to be a smaller part (OMS), but I should include all the problems I'm solving, all that lead to OMS and everything.
> - App side: customer experience isn't engaging for Type 1. There's an order-placement flow, whereas a Type 1 shouldn't be order placement; it's misleading. There's a payment-selection and discount-offer flow; that shouldn't be part of Type 1. It should be informative so users understand what happens next.
> - We're letting go the abandoned flow for Type 1; it should flow to ACOM. It will increase ACOM leads and conversion.
> - Future user flow: user uploads, we keep them engaged, the Type 1 pharmacist calls within that time. Scenarios: (1) the pharmacist checks the prescription, adds all items to the cart, and the user self-checks out; (2) the pharmacist calls, the user says what they want and don't want, a cart is prepared, and the pharmacist asks them to self-checkout; (3) the pharmacist calls, adds to the cart and places the order directly.
> - ACOM leads: we're wasting the stagnant leads. **Don't mention the numbers; just the problem statement. Don't mention 1mg either.**
> - Portal: the user has to select the order and assign it to themselves, then confirm valid or invalid Rx. That's irrelevant: irrespective of it, the customer gets a doctor call for those orders, so a tag is enough and shouldn't impact the flow. Only after they confirm and digitise, adding at least one medicine, is the order created; that flow is a waste of time. They should be able to call directly and create.
> - Search needs to improve a lot: even out-of-stock items should be visible, and if out of stock, the substitute should show; search should be intuitive.
> - Instrumentation: what is being searched, how many out-of-stocks, to improve cataloguing.
> - Also the other problems in the opportunity scoping. List all the problems; on the basis of that we'll break it down, and say why we're building OMS and portal.

Follow-up: wrote `docs/11-problem-statement.md`: problems A1–A4 (app), B1–B2 (lost demand), C1–C5 (portal), D1–D2 (data), E1 (observed, not scoped); a map of where each is solved (App later / OMS / Portal / ACOM / Data); why OMS + portal first. No numbers, no competitor names. Draft for review before folding into PRD §2.

---

## Entry 23 — 2026-10-13 — Portal issues from the mock flow

> Go through the portal mock flow; share some issues observed.

Follow-up: reviewed the 12 captured portal screens + code findings; wrote `docs/12-portal-issues-observed.md`: issues by screen (list L1–L6, Verify Rx V1–V7, Patient Call P1–P13, search S1–S5, coupons CP1–CP3, Create Order CO1–CO3, global G1–G3), mapped to problems in `11`; sample-data artifacts excluded; top 10 to fix first.

---

## Entry 24 — 2026-10-13 — Portal fix list; add only new problems

> 1. Wait-time column with sort by age
> 2. Prescription check as a tag only
> 3. Call before digitising
> 4. Call-result options — reason dropdown
> 5. Out-of-stock medicines shown with a substitute
> 6. Pack, price and stock in search results
> 7. Recording of searches and unavailable picks
> 8. Coupons easier to find, with savings shown
>
> Most of them are repeated; exclude the repeated, add the new one only in the portal problems.

Follow-up: only item 4 was new → added **C6 "Call results can't be recorded"** (reason dropdown) to `11` and the where-solved table. Recorded the 8-item portal fix list in `12` (dropped P3 rename, P13 crash).

