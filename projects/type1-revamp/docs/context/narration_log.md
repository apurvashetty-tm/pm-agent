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
