# decision_log.md — Type 1 Revamp

Dated decisions. Newest at the bottom. Each links to the narration entry it came from. Superseded decisions stay here, marked as superseded.

| ID | Date | Decision | Why | Source |
|---|---|---|---|---|
| D01 | 2026-10-05 | **Stepwise process:** Evaluation → Critique → Brainstorm → Finalise. Never move to the next step without explicit confirmation. | Avoid unnecessary rework. | Entry 1 |
| D02 | 2026-10-05 | Competitive comparison is **Truemeds vs 1mg only**. PlatinumRx screens excluded. | User instruction. | Entry 2 |
| D03 | 2026-10-08 | **Project scope:** W1 OMS (order → request status change + Type 1 allocation); W2 pharmacist portal: fix + enhance, reuse first (W2a Type 1 leads → ACOM, W2b search, W2c OOS instrumentation, W2d coupons), covering the Type 1 order flow and the Create Order flow; W3 app journey. | Comprehensive Type 1 revamp. | Entry 3 |
| D04 | 2026-10-08 | Work **one workstream at a time**, aiming for **minimum effort, maximum impact**, then close it. | Close the project fast. | Entry 5 |
| D05 | 2026-10-08 | **No app release** for current workstreams (app in experimentation). Backend + portal only. App-side fixes (success screen, payment-before-amount, early ETA, rating/reminder prompts) parked. | App release too slow. | Entry 6 |
| D06 | 2026-10-08 | W1 engagement options narrowed to **B-lite** (L1 backend status/metrics/notification copy; L2 portal "send for approval" via WhatsApp). **Level choice still open.** | Follows D05. | Entry 6 |
| D07 | 2026-10-08 | **Business targets:** OP 1,333 → 1,750/day; OD 133 → 250/day; OP→OD 10% → 14.3%. Levers: Assisted Commerce, Allocation, Engagement, Coupon, OOS Recovery. | Opportunity scoping sheet. | Entry 7 |
| D08 | 2026-10-08 | **Allocation reference:** Pharmacist Type 1 queue, **LIFO**, **Rank-Up**. | Confirmed by Swapnil. | Entry 9 |
| D09 | 2026-10-08 | **Isolate Type 1.** No allocation/ranking logic from other modules (doctor pool, HGS, ACOM, Project South). Parked separately. | Avoid false assumptions. | Entry 11 |
| D10 | 2026-10-09 | **Pharmacist hours** assumed **09:00–19:00**. | Working assumption. | Entry 12 |
| D11 | 2026-10-09 | **Hold** = call not connected → order out of the queue for **1 hour**. **Schedule** = customer explicitly asks to delay the call. | Confirmed meaning. | Entry 12 |
| D12 | 2026-10-09 | **Discovery problem:** after-hours Type 1 orders are reached last (LIFO buries them; no escalation; no wait-time visibility). | Matches the Allocation lever. | Entry 12 |
| D13 | 2026-10-09 | **Allocation improvement scope A1–A6:** next-order button; wait-time column/sort by age; claim time limit; shift awareness; after-hours rule; queue-build-up alert. | In scope to improve. | Entry 12 |
| D14 | 2026-10-09 | Project lives at **`projects/type1-revamp/`** with `CONTINUITY.md` as the session entry point. | Continuity across sessions. | Entry 13 |
| D15 | 2026-10-09 | **OMS scope (W1a reframed):** Rx upload creates a **request**, not an order; order is created after the pharmacist call/cart build. **Experiment:** Arm A assisted (pharmacist builds cart + places order, today's flow) vs Arm B self-checkout (pharmacist builds cart, customer completes). **Abandoned requests → ACOM leads**, like cart-abandon; Rx-only case to be evaluated. Supersedes B-lite level choice (EQ1). | Scope given by Swapnil. | Entry 14 |
| D16 | 2026-10-12 | **Every Type 1 customer action is a request, not an order.** Intermediate state **Pending Verification**; the **order is created and verified by the pharmacist in the Type 1 portal**. Answers 06 Q1 in principle; name clash with the existing `PENDING VERIFICATION` status and storage (P1/P2) still open (07 Q1–Q2). | Scope given by Swapnil. | Entry 15 |
| D17 | 2026-10-12 | New request status name: **`RX VERIFICATION PENDING`**. Existing portal status `PENDING VERIFICATION` unchanged. | Avoid name clash. | Entry 16 |
| D18 | 2026-10-12 | **Two horizons.** *Now* (no app release): today's order-creation flow + one intermediate state. *Future* (Portal Unification): upload = **lead tagged Type 1**, pharmacist calls. Build *Now* as a stepping stone (same states/events). | Ship now, align with unification later. | Entry 16 |
| D19 | 2026-10-12 | **Experiment Arm B confirmed:** pharmacist only adds medicines to the cart; customer takes it forward. Must address agent conversion credit and incentives. | Test the self-checkout model. | Entry 16 |
| D20 | 2026-10-12 | **Scope added:** every abandoned Type 1 cart → **lead in the ACOM portal** for a call. | Recover abandoned Type 1 carts. | Entry 16 |
| D21 | 2026-10-12 | Abandon rule **configurable** (attempts + time), per arm. | Tune without a release. | Entry 16 |
| D22 | 2026-10-12 | **After-hours handling in scope** (honest message; clocks pause outside 09:00–19:00). | Customer expectation + fair abandon clock. | Entry 16 |
| D23 | 2026-10-12 | **Future scope (parked):** 1mg-style in-app engagement while waiting; real-time call wait and pharmacist assignment. | Needs app release + unified allocation. | Entry 16 |
| D24 | 2026-10-12 | **Mid-flow abandonment in scope:** Rx uploaded but request/order never submitted = Type 1 mid-flow abandon → **ACOM lead**. | Equivalent of mid-flow cart abandon. | Entry 17 |
| D25 | 2026-10-12 | **Incentive calculation out of scope.** Keep only a callout of Arm B's (cart-creation-only) impact on agent conversion. | Focus. | Entry 17 |
| D26 | 2026-10-12 | **ACOM lead types:** M1 (uploaded, not proceeded), M2 (summary/address), M3 (payment step, current flow only), A (call failed/declined), B (Arm B not checked out). | Full abandon coverage. | Entry 18 |
| D27 | 2026-10-12 | **V (submitted, never verified) is not an ACOM lead**; it's solved inside Type 1 (brainstorm `08` §11). | Customer already did their part. | Entry 18 |
| D28 | 2026-10-12 | **ACOM calls regardless of the nudge.** Nudge in scope, but **customer comms are a separate track**. | Separation of scope. | Entry 18 |
| D29 | 2026-10-12 | **ACOM prioritisation as-is**; only the **cart-value filter** is handled for Type 1 leads. Type 1-specific priority TBD. Inactivity trigger **30 min**, configurable. | Min effort. | Entry 18 |
| D30 | 2026-10-12 | Lead detection framed as **requirements**; engineering decides how. | PM owns what, eng owns how. | Entry 18 |
| D31 | 2026-10-12 | The sizing sheet's **"55K stagnant opportunities/month" = these Type 1 abandons.** | Confirmed. | Entry 18 |
| D32 | 2026-10-12 | **App requirements logged (parked, R3):** APP-1 "Raise medicine request" instead of "Proceed to checkout"; APP-2 remove the payment-mode step from Type 1. | Future app release. | Entry 18 |
| D33 | 2026-10-12 | **APP-1 CTA is not "Raise medicine request"**; wording to choose (options in `09` §3). | Swapnil asked for different wording. | Entry 19 |
| D34 | 2026-10-12 | **Portal approach: no complete revamp.** Use the **current portal** with small, targeted changes until Portal Unification; structural changes wait for Unification. Road ahead in `09`. | Unification planned later. | Entry 19 |
| D35 | 2026-10-12 | **OMS (W1a) closed for now** as `docs/10-oms-prd.md`. Open items carried with owners (E1–E4, P1–P5). **Never-verified requests (V) move to W1b allocation.** | Swapnil: close OMS. | Entry 20 |
| D36 | 2026-10-12 | **No Rx-validity gate.** The pharmacist only **tags** the upload as Prescription / Not a prescription (medicine photos are fine); the Type 1 flow continues either way (call, build cart). No "rejected" branch. Rx compliance stays with today's post-order flow. PRD → v0.2. | Medicine photos still work; validity check adds no value here. | Entry 21 |
| D37 | 2026-10-13 | **PRD must state every problem the work solves** (app, lost demand, portal, data), not only OMS. Problem statements carry **no numbers and no competitor names**. | Review feedback on the PRD. | Entry 22 |
| D38 | 2026-10-13 | **Three ways to finish a Type 1 journey:** (1) pharmacist adds the full Rx to the cart → customer self-checks out; (2) pharmacist calls, builds the cart from what the customer wants → customer self-checks out; (3) pharmacist calls, builds the cart and places the order. | Future flow as described. | Entry 22 |
| D39 | 2026-10-13 | **Portal flow:** the pharmacist should be able to **call first and create**, not be forced to verify + digitise before the call; Rx validity is a tag (reaffirms D36: doctor call happens anyway). | Wasted steps. | Entry 22 |
| D40 | 2026-10-13 | **Portal fix list (8):** wait-time column + sort; Rx check as tag; call before digitising; call-result options with reason dropdown; OOS shown with substitute; pack/price/stock in search; record searches + unavailable picks; coupons easier to find with savings. Only "call results" added to the problem statement (C6); others already covered. | Swapnil's pick. | Entry 24 |
| D41 | 2026-10-13 | Project work lives on branch **`project/type1-revamp`** on `origin` (apurvashetty-tm/pm-agent). Merge to `main` via pull request (repo CONTRIBUTING). | Repo convention; main is protected. | Entry 25 |
