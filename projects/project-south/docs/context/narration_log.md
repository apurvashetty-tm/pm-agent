# narration_log.md — Project South

**Purpose:** Raw, chronological capture of every ideation narration Swapnil shares on Project South, in his own words (lightly cleaned for typos only — no paraphrasing away detail). This exists so nothing is lost to context compression across sessions. **Append new entries here at the bottom, in order, every time Swapnil shares new narration — do not summarize old entries away.**

**Owner:** Swapnil Singh (swapnil.singh@truemeds.in)
**Started:** 2026-09-29

---

## Entry 1 — 2026-09-29 — Problem framing

> Project south is project where we have identified the gap, there is discard and drop off in the Dr call due to language mismatch, then the problem is language and customer and dr not matching, in our current flow — refer the repo for the dr call assignment flow, we have dr details, to solve this problem lets go through the repo — share me everything on the dr call portal and assignment process steps I need to understand the flow.

Follow-up action taken: full [pm-agent](../../../../pm-agent) repo research on the Dr call portal + assignment flow (HGS Phase 1 pull-based FIFO/category logic, tm-chotu production schema, Doctor Portal prototype PRD, discard/INIT-04 roadmap context). Findings shared in-chat; no language attribute for doctors found documented anywhere in the repo prior to Entry 2.

---

## Entry 2 — 2026-09-29 — Baseline solution proposal + brainstorm request

> Also let's go with the solution thought of the most plain simplest, then we will build on it by moving deeper layer by layer. Also save all the chat data narration shared by me in a separate log md file so that I can use it for further ideation rather than getting it missed in compression — keep logged everything, and all the instances.
>
> Solution thought:
> We have an NFS flow where some medicines require a specific type of doctor — not all doctors can prescribe them — hence we have created a special pool of these doctors, and all orders with these medicines get assigned only to that pool. These orders bypass the normal pool logic and are moved strictly to the assigned pool.
>
> Assuming the same logic, I am thinking: currently I have **language as an attribute for doctors**, saved in my tables. Now I will create one static table for **pincode × language** — what is the preferred language of that pincode. Whenever an order is received, we will create a **pool of the language's doctors**, and the pincode of the order will define which pool it goes to — hence the order gets assigned to it. This is the simplest logic I have come up with.
>
> Now we have to probe and brainstorm — how can we achieve this, is there any other way we can solve this problem. Let's brainstorm, and go deeper in all the aspects of the flow, for each stakeholder — what happens if this and that. Go as deep as possible for solutioning this — like what happens if no doctor is available in the pool, multiple languages in one pincode, etc. This is just an example — I want deeper.

Follow-up action taken: formalized this as "Layer 0" baseline, mapped rigorously onto the existing HGS pull-based FIFO/category-pool mechanics, then ran a full stakeholder-by-stakeholder and edge-case-by-edge-case deep brainstorm plus a set of alternative approaches. See [`docs/brainstorm/solution-layers.md`](../brainstorm/solution-layers.md).

**Key fact asserted by Swapnil in this entry (not yet confirmed against the repo/DB, mark as [USER-PROVIDED]):** doctor-level `language` is already an existing attribute in production tables. This contradicts the earlier repo-research finding (no language field documented anywhere in `pm-agent`'s HGS/tm-chotu docs) — the repo docs are evidently incomplete/stale on this point, not authoritative. Treat "doctor language exists in prod" as true per user, but get the exact table/column confirmed before building on it (see open question in `open_questions.md`).

---

## Entry 3 — 2026-09-29 — HGS PRD shared as context

> [Shared file: `PRD - High Governance salts_Phase 1.md`] Refer this for HGS as context and let's discuss.

Follow-up action taken: read the full PRD (text; images not parsed), saved a copy to [`reference/PRD-HGS-Phase1-source.md`](../../reference/PRD-HGS-Phase1-source.md), mapped its mechanics against Layer 0 in [`docs/brainstorm/solution-layers.md`](../brainstorm/solution-layers.md) §5. Main finding: HGS orders use pull-FIFO, but Category P orders (the bulk of volume) use the capacity-based "new ETA logic". HGS added a Category P *filter inside* that logic, and that is the closer analogy for language routing.

---

## Entry 4 — 2026-09-29 — Move to clean, standalone solutioning

> Now let's move to clean solutioning for Project South — no need to mention HGS now, it is standalone. Just take all the learnings and move with solutioning.

Follow-up action taken: wrote the standalone solution doc [`docs/solution/project-south-solution-v1.md`](../solution/project-south-solution-v1.md). It carries over the learnings (language is a time-boxed preference, not a blocker; doctors can speak several languages; the order records its language with source and confidence; a "language barrier" call outcome to measure and correct; reuse the existing assignment engine instead of building a new one) and has no HGS references. The earlier brainstorm doc is kept as history.

Three questions from Entry 3 had no answer yet, so the solution states assumptions for them (see the solution doc, §12):
- Do Dr-call orders run on the ETA logic?
- Is the doctor language field single- or multi-valued?
- Reactive first, or predictive first?

---

## Entry 5 — 2026-09-29 — Brainstorm from the problem, not a final solution

> Brainstorm, not final solution. Start from the problem as north star — language barrier is leading to discard.

Follow-up action taken: wrote a problem-first brainstorm in [`docs/brainstorm/problem-first-brainstorm.md`](../brainstorm/problem-first-brainstorm.md). It covers:
- the north star;
- how a language mismatch turns into a discard, step by step;
- the root causes;
- "How might we" questions, each with a wide range of ideas;
- hypotheses and cheap ways to test them.

Solution v1 is now marked as one possible direction, not the answer.

---

## Entry 6 — 2026-09-29 — Scope decisions + South sizing data

> 1. Know the customer's language — keep this as future scope
> 2. Recover instantly (R5): a "hand over" button — future scope
> 3. Clock is not the blocker
> 4. Something as such: a doctor can speak Tamil, English, Hindi — something like this
> 5. Remove the dependence on speech — not in scope
> 6. Supply — as a callout for future demand catering based on current pincode order trends. Goal is to GTM from South pincodes, as we have higher drop for the South region.

**Pasted data (verbatim):**

Project South —
- Dr Confirm % (OP→Confirm): **+4.46pp** (72.04% → 76.49%, to Non-South parity)
- OP2OD (South FTC): **+3.16pp**
- OP2OD (South, all orders): **+0.96pp**
- Inc OPD **+25/day** (774 delivered orders/mo)

FTC — South vs Non-South (ex-Blr)

| Outcome | South (ex-Blr) | Non-South (ex-Blr) |
|---|---|---|
| OP (orders placed) | 24,483 | 171,073 |
| Discarded | 27.83% | 23.40% |
| Cancelled | 11.88% | 8.28% |
| RTO | 8.77% | 9.03% |
| Delivered | 51.23% | 59.07% |
| In transit | 0.11% | 0.08% |

NFTC — South vs Non-South (ex-Blr)

| Outcome | South (ex-Blr) | Non-South (ex-Blr) |
|---|---|---|
| OP (orders placed) | 55,839 | 603,350 |
| Discarded | 6.31% | 6.49% |
| Cancelled | 7.25% | 5.66% |
| RTO | 4.95% | 5.45% |
| Delivered | 81.19% | 82.19% |
| In transit | 0.08% | 0.09% |

Sizing of impact (FTC)

| Step | | FTC |
|---|---|---|
| A. South OP (Aug) | orders placed | 24,484 |
| B. South OP → WH reached | current | 72.04% |
| C. Non-South OP → WH reached | target | 76.49% |
| D. Gap (C − B) | pp to close | +4.46 |
| E. Extra orders confirmed (A × D) | per month | 1,091 |
| F. South WH reached → delivered | | 70.95% |
| G. Extra orders DELIVERED (E × F) | per month | 774 |
| H. Extra delivered per day (G ÷ 31) | Inc OPD | 25 |

Follow-up action taken:
- Scope locked into `project_truth.md` §6.
- Sizing checked, with insights and a brainstorm within the new scope, in [`docs/brainstorm/south-scoped-brainstorm.md`](../brainstorm/south-scoped-brainstorm.md).

---

## Entry 7 — 2026-09-29 — Decisions + move to solution

> We will go for all — no FTC / NFTC segregation — and we will go ahead with the data. Now move to solution: we have the opportunity scoped, let's move to the solution of the problem.

Decisions captured:
- **All South orders are routed by language**, with no FTC / NFTC split.
- **The sizing is accepted as-is.** There will be no attribution check before building; the pilot with a control group will validate it.
- Moving from brainstorm to solution.

Follow-up action taken: wrote [`docs/solution/project-south-solution-v2.md`](../solution/project-south-solution-v2.md). v1 is superseded, because it relied on the customer-language and hand-over pieces that are now future scope.

---

## Entry 8 — 2026-09-29 — Mixed cities must be handled too

> 1. Mixed city too needs to be handled, let's brainstorm on that.

Response to v2 open decision D1. Mixed cities (Bangalore, Hyderabad, Chennai, Kochi…) should **not** simply be excluded; they need their own handling.

Follow-up action taken: brainstorm written in [`docs/brainstorm/mixed-city-brainstorm.md`](../brainstorm/mixed-city-brainstorm.md).

---

## Entry 9 — 2026-09-29 — Mixed language → future; close one-language-per-pincode, step by step

> Mix language will keep it as future scope, let's close the one language per pincode solution — let's brainstorm, go step by step, each.

Decisions captured:
- A **language mix per pincode** (coverage score, bilingual/multilingual handling) is **future scope**.
- **The solution is one language per pincode.** Mixed-city handling now becomes: each pincode in a mixed city is assigned its single dominant language, or marked not routable. This is decided in Step 2.
- Working mode: go through the solution **one step at a time**, brainstorming each step before moving on.

Follow-up action taken: created [`docs/solution/step-by-step.md`](../solution/step-by-step.md) with 8 steps. Step 1 (doctor language tagging) is brainstormed in depth.

---

## Entry 10 — 2026-09-29 — Step 1: no language in tables today; add a comma-separated column

> Currently we do not have any language stored in a table, but we have data maintained of the doctors. We will need to insert that data in the table by adding the column. We will provide the doctor language comma-separated; it needs to be added, then use it.

Decisions captured:
- **Correction to Entry 2:** there is **no** doctor language in any DB table today. The data is maintained separately, outside the DB.
- **Approach:**
  - add a new column on the doctor table;
  - Ops provides each doctor's languages as a **comma-separated** value;
  - insert it into the new column;
  - routing uses that column.

Follow-up action taken:
- Step 1 in `docs/solution/step-by-step.md` updated to a closed spec: column, format rules, load process, usage, upkeep.
- `project_truth.md` corrected.

---

## Entry 11 — 2026-09-29 — Data sorted; move to allocation logic (auto + Super Doctor)

> Data part is sorted, no need to think on how we will insert that — it's the tech part, we will provide them with the data, that's it. Let's move to allocation logic for both: now in case of Super Doctor portal, doctor assignment, fallback if no doctor is available in the pool. Also we currently show pending orders in the pool to the Super Doctor — they see and allocate the order (manually assign). How will the system work?

Decisions captured:
- Data loading is Tech's job. The business provides the data. No more product work needed on the load.
- Assumed: the **pincode → language data is also provided by the business** in the same way (one language per pincode; blank = not routed).
- Focus now on the **allocation logic**:
  - automatic doctor assignment;
  - fallback when no doctor who speaks the language is available;
  - the **Super Doctor pending-pool view and manual assign**, which exist today and are extended here.

Follow-up action taken: allocation logic written in `docs/solution/step-by-step.md` → "Allocation logic (Steps 3–6)".

---

## Entry 12 — 2026-09-29 — Finalise release + no-doctor-available cases

> Let's figure out the release part, finalise that, and the case where no doctor is available.

Follow-up action taken: `docs/solution/allocation-logic.md` §4 was rewritten as the **final release spec** (rules R1–R8) with a full "no doctor available" case matrix and timelines.

Key change from the Entry 11 draft: the **T clock now counts only doctor working hours**. Otherwise, orders placed overnight would be released before any Tamil-speaking doctor logs in, and at 08:00 doctors who don't speak the language could take them first.

---

## Entry 13 — 2026-09-29 — Allocation rules finalised (NFS, manual bypass, LIFO→FIFO, ops hours)

> Also add handling: if the order is NFS then it will always have highest priority, will not move to language pool.
>
> Nudges before release (50% of T alert to doctors, 75% of T alert to Super Doctor) — out of scope, add it as future scope.
>
> Super Doctor feature has the option to assign manually. When Super Doctor is manually assigning, let it bypass the language check and move ahead in the flow.
>
> R7 — keep that as a condition.
>
> N2 — nudge is out of scope, but give visibility to Super Doctor to check pendency, and if need be he can manually assign the order and bypass the flow.
>
> Current logic is LIFO then FIFO — basically if this stays then the experience is preserved, keep that logic.
>
> Move to pool, then after T release it and move to normal flow. There is a flag of available. Also keep in mind the operational hours.

Decisions captured:
- **NFS orders:** always the highest priority. They **never** enter the Language Pool and follow their existing flow.
- **Nudges** (alerts to doctors and Super Doctor): **future scope**.
- **Super Doctor manual assign bypasses the language check completely.** No warning and no reason required. The order moves ahead in the flow as today.
- **R7 kept:** a language with no or too few doctors is switched off, so there is no tagging.
- **Super Doctor gets visibility of pending orders** per language, and can manually assign to bypass the flow.
- **Today's LIFO → FIFO ordering is kept**, so the customer experience doesn't change.
- **After T, the order is released into the normal flow** and treated as a normal order.
- A doctor **availability flag already exists**, and it is used for eligibility and for Super Doctor visibility.
- **Operational hours are respected.** The T clock runs only during operational hours.

Follow-up action taken: `docs/solution/allocation-logic.md` rewritten as the final spec.

---

## Entry 14 — 2026-09-29 — Write the PRD

> Let's move ahead with the PRD. Use the sample PRD from the repo. I want a human-like PRD, not AI-based with too many unnecessary details. Focus on problem, feature, user journey, stakeholder.

Follow-up action taken:
- Wrote the PRD in the style of the repo's sample `archives/projects/2026-08-18-doctor-consultation-callback-v1.md`: plain language, simple rules, step-by-step flow, edge cases, open items.
- Saved as `archives/projects/2026-09-29-project-south-language-routing-v1.md`.
- C1 (for doctors who speak L, Language Pool orders come before normal orders) and C2 (LIFO → FIFO inside the pool) were not explicitly confirmed. Swapnil moved ahead, so the PRD uses them and lists them under Open Items for confirmation.

---

## Entry 15 — 2026-09-29 — GTM is South; experiment, then extend

> My GTM is South, will do the experiment, then extend it.

Decisions captured:
- **South is the GTM and experiment region.** The experiment covers South as a whole (all South languages that meet the doctor minimum), not a single language.
- **Extend to other regions after South proves out.**

Follow-up action taken: PRD updated (Overview, Goals, Out of Scope, Rollout, Open Items). "Pilot one language" is replaced by "experiment across South, then roll out to 100% of South, then extend to other regions".

---

<!-- Append next entry below this line. Format: ## Entry N — YYYY-MM-DD — short title, then a blockquote of Swapnil's narration (typo-cleaned, not paraphrased), then a short "Follow-up action taken" line. -->
