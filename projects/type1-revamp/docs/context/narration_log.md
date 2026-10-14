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

---

## Entry 25 — 2026-10-13 — Push to repo

> Push everything in Type 1 portal to the repo, along with CONTINUITY.md updated and all the logs as well.

Follow-up: committed all `projects/type1-revamp/` work and pushed branch `project/type1-revamp` to `origin` (commit `39b7cee`, verified against the remote). Updated CONTINUITY.md, session_handoff and logs to record the push, then pushed again.


---

## Entry 26 — 2026-10-13 — Move to OMS: problem → solutioning → PRD

> Let's move to OMS problem and solutioning and PRD. Do not move to create PRD directly.

Follow-up: created `docs/13-oms-problem-and-solution.md` with three gated steps. Step 1 drafted: OMS root problem + O1–O6 mapped to `11`, and what's not OMS. Stopped for review before solutioning.

---

## Entry 27 — 2026-10-13 — OMS problem confirmed

> 1. O5: both, because OMS needs to handle these stages. 2. It's correct.

Follow-up: marked Step 1 confirmed in `13`; O5 labelled CONFIRMED (OMS owns stages, comms uses them); logged D42. Waiting for go-ahead on Step 2 (Solutioning).

---

## Entry 28 — 2026-10-13 — Add the three finish flows; can't see the file

> Also the cart creation, call → cart creation, call → cart and order placement flows are missing; add this as well. I am not able to see the md file.

Follow-up: added "Three finish flows OMS must support" table under O2 in `13` (flow 1 cart → self-checkout, flow 2 call → cart → self-checkout, flow 3 call → cart → order placement). Sent the file to Swapnil.

---

## Entry 29 — 2026-10-13 — Solution structure

> In the solution build, keep the main problem as the header, then we will break everything into 3 parts: OMS, portal and app. PRD will be incremental; we will keep on adding to the main doc.

Follow-up: restructured `13` as the main doc (D43): main problem header, Part A OMS solutioning drafted (lifecycle states, three flows, abandon rules, call results → next state, stage events, counting, open items), Parts B Portal and C App placeholders, PRD section to grow incrementally. Stopped for review of Part A.

---

## Entry 30 — 2026-10-13 — Full problem list goes first

> Problem is missing the heading we have compiled for the project — complete list, then the solution part comes.

Follow-up: §1 of `13` now holds the complete problem list from `11` (A–E + where-solved table). OMS problems O1–O6 and the three flows moved under Part A of the solution.

---

## Entry 31 — 2026-10-13 — Add the intermediate-state introduction

> The intermediate state introduction in the OMS and flow is missing; add that, refer to the old PRD for reference.

Follow-up: added A0 to Part A of `13`: the intermediate state `RX VERIFICATION PENDING` (D16–D18), today vs new flow, Now (today's order record) vs Future (Type 1 lead) with stepping-stone rule, per-layer changes, and Arm A / Arm B flows, from old PRD §1/§3/§4 and `07` §8–9 (updated for D36).

---

## Entry 32 — 2026-10-13 — Answers on Part A open items

> E1: this already exists; any addition on the portal directly affects the cart. There should be a submit button for the pharmacist so it reflects on the cart; in the current flow if you add a medicine it immediately reflects in the cart. Need to handle that as well.
> E2: this will be equivalent to the current cart where the user adds to the cart and leaves it.
> E3: what do you mean here?
> A-Q1: experiment. A-Q2: Create cart, create order. A-Q3: Swapnil and ops.
> P6: add handling where the pharmacist can call, or if it's inferred there's no point, mark such an order for removal from the Type 1 lead.
> P7: yes.

Follow-up: updated Part A of `13` (D44–D49): draft cart + "Create cart" (A1a), `CART CREATED` state, `RX UPLOADED` = cart-abandon equivalent, experiment picks the flow, `REMOVED FROM TYPE 1` state and call result, name kept. Explained E3 in the doc. New opens: A-Q4 (removal name / skip ACOM), A-Q5 (add vs replace an existing customer cart).

---

## Entry 33 — 2026-10-13 — ACOM dependency callout

> Also add the dependency callout for ACOM: lead assignment logic and handling of Type 1 orders in the ACOM portal need to be solutioned. Just call it out; we will solve that as well for ACOM.

Follow-up: added "Dependency: ACOM" block in Part A of `13` and a Part D (ACOM) row in the status table (D50).

---

## Entry 34 — 2026-10-13 — Reason list, removal state, existing cart

> Call-result reason list: list down a sample list, e.g. do not want medicine, asked not to call, order placed mistakenly, etc.
> REMOVED FROM TYPE 1: suggest some relevant category name; yes, exclude from ACOM.
> Existing cart: display the created cart to the pharmacist so that he can talk and edit the same cart, mutate if needed and confirm from the customer.
> E3: keep it open.

Follow-up: added a sample reason list by call result, removal-state name options (lean `CLOSED - NOT ACTIONABLE`), existing-cart handling (D52), removal excluded from ACOM (D51). New opens: A-Q6 (flow 1 with an existing cart), A-Q7 ("asked not to call" blocks ACOM?). E3 kept open.

---

## Entry 35 — 2026-10-13 — Make it read like a PRD

> The doc seems too tabular; keep tables if needed, but it should be text, pointers and headers so it reads as a PRD, not a checklist. Keep it brief; don't over-write and explain everything.

Follow-up: rewrote `13` in PRD style: headers, short text, bullets; only two tables kept (states, sample reasons). Decision IDs and labels moved out of the body (they stay in the logs). Content unchanged.

---

## Entry 36 — 2026-10-13 — Engagement missing from the problem

> In the problem of the customer experience, engagement is missing; add that as a problem. Engagement will give better call connectivity and conversion; have an engaging experience where the call gets connected. Refer to the 1mg flow; it is very engaging.

Follow-up: added "Nothing keeps the customer engaged while they wait" to §1.1 of `13` (static card, no named pharmacist, no call ETA, no progress, no request-a-call → missed calls; engaging wait → better connectivity and conversion). Drew on the reference flow in `01`/`02` (critique C7) without naming the competitor (R9).

---

## Entry 37 — 2026-10-13 — Push to Google Docs

> I want to push this directly to Google Doc and keep on updating; can I do it? … create folder in My Work and folder PRD … [then shared] https://docs.google.com/document/d/1YwoJwH8j08sYYtvNcFXhXP7NqcSXkXyN7-EQZp398IU/edit?tab=t.ety8nis1n1hj

Follow-up: Google Drive wasn't connected (no folder creation); Swapnil shared a doc instead. Wrote `13` into Tab 2 with headings, bullets and the two tables; verified the structure. Tab 1 untouched. Link saved in CONTINUITY.md (D54).

---

## Entry 38 — 2026-10-13 — Opportunity snapshot

> Also add the opportunity snapshot below the problem.

Follow-up: added §1.6 Opportunity snapshot (targets table, levers, conversion note) from `00` to `13` and to the Google Doc; verified. Mirrored Swapnil's own Google Doc edits back into the `.md` (intro paragraph removed; Tab 1 deleted by him).

---

## Entry 39 — 2026-10-13 — Gap check against 08 and 09; answers in the Google Doc

> 08-abandoned-type1-leads-acom.md, 09-portal-road-ahead.md: refer to these as reference; see if we missed something to add.
> (In the Google Doc, on A.9:) Flow 1 with existing cart — "Call customer and ask for the action if he needs the items in the cart as well along with the Rx items." "Asked not to call" — "TBD".

Follow-up: added to `13` Part A: experiment-reading callout (A.3), after-hours handling, working defaults and lead rules (A.5), extra metrics + guardrail (A.7), who creates the order from an Rx-only lead (A.8); road-ahead notes in Part B; app requirements in Part C. Folded Swapnil's doc answers in (D55). Google sync paused while Swapnil was editing (revision kept changing).

---

## Entry 40 — 2026-10-13 — Supply problem + funnel data

> One more problem statement: whenever the agent receives a Type 1 order, a very high number of cases have Rx medicines not available on Truemeds or out of stock, with no substitutes shown; sometimes only partial is fulfilled and the customer doesn't want that. We need the feasibility where the agent can see the prescription before the call, try to make the cart, and if the fill rate is low, abandon the cart. Out-of-stock and unavailable cases need to be instrumented to quantify and take necessary action, along with discarding the Type 1 lead with a clear reason. This too is a bigger problem.
> Read page 20 Type 1 funnel data from the doc (CX/Portals/Payments Roadmap FY26-27).

Follow-up: added §1.3 "Medicines we can't supply" (no numbers), discard reasons to portal problems, the Type 1 funnel table to the opportunity snapshot (OOS = 24.2% of placed; "other TM reasons" 25.7%; 29.8% discarded before any call), "Can't supply" call result + reasons in A.6, and a feasibility note (Rx preview, trial cart, fill rate, low-fill close, OOS logging) at the top of Part B. Image in the source doc not read (table data used).

---

## Entry 41 — 2026-10-13 — Finalise the problem statement first

> Two questions: this too needs to be added in the scope. Before adding, let's refine the problem statement; let's first finalise the above problem statement.

Follow-up: refined §1 of `13` (no numbers): merged overlaps (search vs supply; data bullets into one "we can't see why requests die"); added "Customers cancel before we call" (funnel: most pre-call discards are by the customer within minutes); promoted "Calls don't connect" from observed to Demand we lose; removed the "Observed" section and the allocation footnote. Opportunity snapshot is now 1.6. Pending scope additions (after the problem is final): "Can't supply" → ACOM?; doctor-call skip for agent-vetted Rx, physical-Rx drugs, Type 2 drugs.

---

## Entry 42 — 2026-10-13 — Problem statement needs more detail

> "It looks like an order, but isn't one" — because it doesn't have any attribute of an order, so price, payment and discount cannot be applied. Too brief; needs a little more detail. Problems need to detail all the pain points and the journey; it should not miss the problem's crux.

Follow-up: rewrote §1 of `13` as headed problems with short paragraphs (journey + pain point + effect), no numbers; added "no attributes of an order → price, payment, discount can't apply"; three finish ways restated under "only one way to finish".

---

## Entry 43 — 2026-10-13 — Add the detailed problem statement to the doc

> Add this to the doc.

Follow-up: mirrored Swapnil's Google edits (tabs renamed "PRD" / "Notes"; empty "3. PRD" section removed) into the `.md`, then rewrote the PRD tab from the `.md` in full (all pending additions + detailed §1 + four tables). Verified headings, 4 tables, bullets; Notes tab untouched.

---

## Entry 44 — 2026-10-13 — Solve problem by problem

> Let's start breaking and structuring the problem one by one and close the solutioning.

Follow-up: problem statement marked final (D57). Proposed numbering P1–P21, a solving order, and a fixed structure per problem; drafted P1 for review.

---

## Entry 45 — 2026-10-13 — Close P1 + P21

> Interim app wording for those texts: "Raise medicine request". Go ahead; keep the engineering open point in the PRD.

Follow-up: added §2.1 "Solution by problem" to `13` with P1 and P21 closed (D58); existing Parts moved under §2.2 Detailed design. Drafted P5.

---

## Entry 46 — 2026-10-13 — P1 wording; P5 open items

> "Prescription received – pharmacist will call": change the "Raise medicine request".
> Open: 1. Analytics owns it. 2. No, not part of this launch. 3. (On flow 1 / cart-ready message) Refer the 1mg flow that keeps me engaged on call and app and creates my cart on the call itself.

Follow-up: P1 status text changed in `13` and the Google Doc (D59). Logged experiment owner and no cart-ready message this launch. Asked to confirm what this means for flow 1 (no-call) before closing P5.

---

## Entry 47 — 2026-10-13 — Flow 1 also starts with a call

> (On "flow 1 with no existing cart: is the customer never called?") The Type 1 pharmacist will call and ask the customer, and follow 1 of the three flows.

Follow-up: P5 closed (D60): every request gets a call; flows differ in how the cart is built and who places the order. Updated A.3 flow 1 and the after-hours line in `13`; added P5 to §2.1.

---

## Entry 48 — 2026-10-13 — In-app waiting screen (APP-3)

> Can we do it such that the customer is engaged on the app, in the background the pharmacist builds the cart, and on the continuation of the timer screen we show success that the cart is built and redirect to the cart, so we won't need the message; it will look like the cart is building.
> Add this as an app-part problem and solution, but also put the backbone needed in OMS and portal for this.

Follow-up: Part C rewritten with APP-1/2/3 (APP-3 = waiting screen); backbone added to A.7 (live stage + CART CREATED event) and Part B (portal sets stages); P5 notes the later no-call flow 1 (D61).

---

## Entry 49 — 2026-10-13 — P9 answers

> 3 attempts is configurable dummy data; derive after analytics validation. Can't supply should not go to ACOM; tag with the reason and drop at the Type 1 stage; need a configuration for the fill-rate % below which we drop; heavy instrumentation on searches for catalogue updating and procurement. Substitutes: when a product isn't available but a sub is, give that option to the Type 1 agent on the call itself; no need for ACOM. "Asked not to call": yes, as a feature; limit to that one order; reset if a new order or cart is placed; finalise the flow. Ranking: TBD with Analytics; follows current prioritisation minus value filter, then extra variables; keep as ACOM dependency. Newer lead wins. Stop step: we can identify today; still keep as engineering open point.

Follow-up: P9 closed in `13` §2.1 (D62); A.5 values marked placeholders; A.6 can't-supply updated; A.9 open list updated; supply decisions noted in Part B for P10–P14.

---

## Entry 50 — 2026-10-14 — P20 answers

> Free text field still remains; we will keep on updating the reasons based on that. Create separate reasons for "Order placed by mistake" and "Duplicate"; I want each reason specific, not clubbed under any other reason.

Follow-up: P20 closed in `13` §2.1 with a flat list of specific reasons, each mapped to a next state; free-text note kept (D63).

---

## Entry 51 — 2026-10-14 — P10–P14 answers

> Substitutes: existing flow, no need to go deep; subs works here; all business logic and tech exists already. Low-fill close without a call: keep as an open point; suggestion: comms telling that the medicine request cannot be fulfilled due to unavailability, we have cancelled the request. Data consumers: should not be an open point; remove it; we're planning data consumption that can be handed over.

Follow-up: P10–P14 closed in `13` §2.1 (D64).

---

## Entry 52 — 2026-10-14 — P15–P19; assignment logic

> Remove mention of the bugs from the doc. Queue-order rule behind "Next request": let's brainstorm it as assignment logic.

Follow-up: P15–P19 closed in `13` (D65); removed the crash/warehouse mention from Part B; started the assignment-logic brainstorm (Type 1 only).

---

## Entry 53 — 2026-10-14 — Assignment logic picks

> Manual assignment and admin reassignment stay as-is; introduce push. Shift logic too complicated; user controls assignment by clicking Assign/Next. Breach dashboard: suggestion, out of scope. A1 rejected. Keep A2 plus A4. Backlog: newest always priority; if no new ones, go to old ones. A4: brainstorm further. C3: keep. C2: contradicts bulk manual assignment; not right. C1: MVP out of scope; supervisor can override; a stuck dashboard would help. FTC is always the highest priority in all the logic. Signals: keep as in design, TBD, but put in the PRD. Weights: Analytics owns.

Follow-up: closed P8 + P15 assignment logic in `13` §2.1 (D66).

---

## Entry 54 — 2026-10-14 — P6 + P7 answers

> Customer cancel before call: close it. Save contact prompted at install and nudged on the homepage when required, so we're added to contacts and stop being flagged as spam. "Request a call" / "Call me now": add to the app flow. WhatsApp has the highest conversion; keep WhatsApp. Verified caller ID: done already. Callback button in WhatsApp: no need; take them to the app, a callback bottom sheet is shown, and as soon as it's clicked it should be the highest priority for a call.

Follow-up: P6 + P7 closed in `13` (D67); APP-4 and APP-5 added to Part C; callbacks added at the top of the queue order.

---

## Entry 55 — 2026-10-14 — Comms: avoid spam

> (On WhatsApp copy for each stage) We will decide; can we do it by notifications as well? I don't want to spam the customer; if I'm keeping the customer engaged, there should be no need for SMS/WA comms.

Follow-up: P2–P4 closed with a no-spam comms rule and push notifications as an option (D68); APP-6 added; P6+P7 comms open point now points to that rule. All problems solutioned.

---

## Entry 56 — 2026-10-14 — Scope items, ACOM, app flow

> Doctor call will be required irrespective of prescription requirement. Part D ACOM: TBD. Write the PRD sections: go ahead, but the app part is still pending (what happens when, screens, flow and logic). I've shared the 1mg screenshots in the folder; use them to create the new TM flow, along with Phase 1 for the OMS flow.

Follow-up: logged D69. Wrote Part C journeys in `13`: C.1 Phase 1 step table (today's app + OMS underneath), C.2 Phase 2 screens 1–9 with logic, C.3 app requirements. Asked for review before syncing and writing the PRD.

---

## Entry 57 — 2026-10-14 — Truemeds copy, customer choice, mock journey

> Don't use the same copy as 1mg; change it to Truemeds-like; I've also shared Truemeds app screenshots. Phase 2 flow: yes, give the customer the option to select. Physical-Rx and Type 2 drugs: put as TBD; it's backend business logic and does not change the user journey. Walk me through with a mock user journey; use Truemeds screenshots for design logic.

Follow-up: rewrote C.2 copy in Truemeds language, added the customer flow choice on screen 4, logged TBD items (D70). Built a clickable mock of both phases in Truemeds visual style: `docs/14-type1-journey-mock.html` (local file; not published since it uses Truemeds branding).

---

## Entry 58 — 2026-10-14 — Make the mock functional and engaging

> Upload prescription is very basic; need it to be an exact functional mock; design is too rough; make it more intuitive, user friendly and engaging. If needed, refer to the Type 1 folder on the Desktop with all the screenshots.

Follow-up: reviewed ~/Desktop/Type 1 Project (Truemeds + reference flows; same set as reference/). Rebuilt `docs/14-type1-journey-mock.html` as a working prototype in Truemeds style: real upload (camera/gallery/past/sample) with thumbnails, remove and add-more; usable-Rx checklist + example sheet; what-happens-next steps; patient/address; flow choice with live estimate and after-hours state; save-number sheet; live status with countdown, named pharmacist, live feed and running savings, Call me now; cart-ready moment; editable cart with substitutes (keep original), coupon, bill; payment; order placed. Branch simulations: missed call, low fill, after hours. Phase 1 kept as today's screens with changes outlined. Tested end to end in the browser.

---

## Entry 59 — 2026-10-14 — Push app requirements to the PRD

> Push the app requirement to the PRD.

Follow-up: replaced Part C in the Google Doc PRD tab with the `.md` Part C: C.1 Phase 1 table, C.2 Phase 2 screens 1–9 (Truemeds copy, customer flow choice, mock reference, TBD items), C.3 APP-1 to APP-6. Verified headings, table and bullets.

---

## Entry 60 — 2026-10-14 — Write the PRD

> Go ahead.

Follow-up: wrote §3 PRD v1.0 draft in `13` (D71) and synced it to the Google Doc.

---

## Entry 61 — 2026-10-14 — PRD too short; full PRD in its own tab

> PRD is too short. I wanted the same as the problem section above; the PRD will have multiple sections (OMS, portal, app, ACOM), same as the problem. If needed, create the PRD in a different tab, but it needs to be comprehensive. The problem-and-solution md is better structured; I want it that way. The problem needs to be prominent in the PRD, then metrics, then the parts (OMS, portal, app, etc.), and each section has its own PRD detail, but not too long.

Follow-up: wrote `docs/15-type1-prd.md` and created the "PRD v1.0" tab with it (7 tables, numbered requirements per part). Verified structure; fixed one mis-styled paragraph. Replaced the short §3 in the "PRD" tab and `13` with a pointer (D72).

---

## Entry 62 — 2026-10-14 — PRD review comments (Apurva) and reason-table fix

> There are comments on the doc; go through them. The table has ACOM lead incorrectly marked: "Doesn't want the medicines / Price too high / Only checking the price / Bought elsewhere → ACOM lead" — why are these ACOM leads? Doesn't make any sense.
> Then: push everything to git with continuity and the last feedback.

Apurva Shetty's comments on the "PRD v1.0" tab (12 open, 1 resolved):
1. ACOM is wrongly captured; needs a complete revisit.
2. Too cramped for zero-context readers; simplify, drop sections, use user stories (customer's life, agent's life).
3. Keep ACOM to just uploads without a request for verification; avoid confusion.
4. Customer explicitly said they don't want the medicine → not an ACOM lead; capture the reason instead. "None of the ACOM leads make sense" (reason table).
5. Upload doesn't create an order; the CTA does (Swapnil replied: will correct).
6. "Order placed" sets wrong expectations: customers feel we have everything they need.
7. OP GMV row is misleading; remove.
8. §3.3 metrics too generic.
9. Avoid the word "OMS"; use "order state" or simply "requirement".
10. No shift logic: agreed, but show the customer when they'll get a call / how we engage them, with what input.
11. PORT-9 should also cover Type 2 (medicines in cart + Rx upload), which gets blocked in the portal today; stop splitting Type 1 / Type 2.
12. Substitutes (resolved): even for in-stock medicines; our USP; today the pharmacist must remember/search the original or use the website, and the price doesn't match because substitute pricing depends on the original selected.
13. "Good table" (problem → parts).

Follow-up: summarised with proposed changes; three confirmations pending (ACOM scope, user-story format, Type 1/2 merge). Pushed all work to git.
