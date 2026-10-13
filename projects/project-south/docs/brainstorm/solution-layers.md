# solution-layers.md — Project South: Layered Solutioning

**Purpose:** Deep, stakeholder-by-stakeholder, edge-case-by-edge-case brainstorm on solving Dr-call language mismatch, starting from Swapnil's simplest proposal (Layer 0) and building deeper layer by layer, per his instruction in `docs/context/narration_log.md` Entry 2.

---

## Layer 0 — The baseline (simplest version), formalized

**Mechanic:** identical shape to the existing NFS/HGS specialist-category bypass — just swap "medical specialization" for "language."

```
doctor.language  (existing attribute, per Swapnil)          →  defines which language pool(s) a doctor sits in
pincode_language_master: pincode → preferred_language        →  new static table
order arrives → resolve customer pincode → preferred_language → route into that language's doctor pool
pool behaves exactly like an HGS category pool: pull-based FIFO, 4-min window, hold cap, row-locked
```

This is clean because it reuses a **mechanic that already exists and already works in production** — no new assignment engine, no new telephony, just a new pool-partitioning dimension. That is genuinely the simplest possible version, and it's the right Layer 0.

**But formalizing it against the real HGS mechanics immediately surfaces the first real risk, not a hypothetical one:**

> HGS's fallback for "no pool can satisfy this order" (`SPLIT_ORDER`, multi-category) is **manual Super Doctor assignment** — by design, because multi-specialist orders are rare. If Project South applies language-bypass broadly (most orders outside Hindi/English-dominant pincodes could get funneled into a language pool), "no doctor available in pool" stops being a rare edge case and becomes a routine one. Falling back to manual assignment at that volume doesn't reduce discard — it likely **adds latency and ops load**, potentially making things worse for exactly the customers Project South is trying to help. This is the single most important thing to pressure-test before writing a single line of spec, and it's explored in depth in Section 3.1 below.

So: keep Layer 0 as the proposal, but treat "what happens when the pool is thin or empty" as the make-or-break design question, not a footnote.

---

## 1. Stakeholder walkthrough

### 1.1 Customer
- **Happy path:** order placed → pincode resolves to a language → gets a doctor who speaks it → call succeeds, no mismatch friction. This is the entire value proposition — worth stating plainly.
- **What could go wrong for them specifically:**
  - Pincode-inferred language is *wrong* for this specific customer (see 3.5) — they get a doctor in a language they don't actually prefer, no better than today, but now with the *appearance* of a fix, which could mask the real problem in metrics.
  - Wait time increases because their language pool is thin (see 3.1) — a customer who previously got a fast (if mismatched) call now waits longer. Net experience could be *worse*, not better, for underrepresented languages.
  - No mechanism today for the customer to self-declare or override their language preference — they are purely a passive subject of a pincode heuristic. Is that acceptable, or should Project South include a customer-facing preference signal (see Alternative 1 in Section 4)?

### 1.2 Doctor
- Gets pulled into a language pool based on a `language` attribute that — per repo research — was **never onboarded, verified, or QA'd** as a real field (no such attribute is documented in the HGS/tm-chotu doctor schema). If it exists in prod as Swapnil says, was it self-declared at signup, inferred from name/region, or actually tested for proficiency? This determines whether the entire Layer 0 mechanic is standing on solid or soft ground (OQ-1).
- A doctor who speaks 2–3 languages (very plausible for an MBBS in India) — does Layer 0 assume **one primary language per doctor** (mirrors `DOCTOR_CATEGORY`'s single-category-per-doctor pattern) or **many-to-many** (doctor sits in multiple pools)? If single-language, you're artificially shrinking pool liquidity for no reason — a multilingual doctor should be poolable everywhere they're fluent (see 3.3).
- Doctor already carries a specialization category (HGS-style). Now potentially also a language. Two independent partitioning dimensions on the same finite doctor pool — this is a capacity-planning problem for Ops, not just a routing problem (see 3.4).
- Incentive/pay: if a rare-language doctor pool is thin, does that doctor get pulled more often (fatigue) or does the business need to pay a premium to recruit more of them? Not a routing question, a workforce-planning one — flag to whoever owns doctor supply.

### 1.3 Ops / Super Doctor / Admin
- Today, Super Doctor manually resolves `SPLIT_ORDER` and Max-Attempt-Team escalations. If language-pool-starvation escalates at volume (3.1), this team's workload scales with it. Needs sizing before launch, not after.
- Who manages the `pincode_language_master` table — is it a one-time seed (e.g. census data) or does it need an ops maintenance loop (new pincodes, drift, correction)? Someone owns this table's freshness (3.5).
- Doctor-language tagging/onboarding needs an owner too — is this a Doctor Super-Admin module addition (mirrors `Doctor Category` management, per tm-chotu docs) or a one-off data patch?

### 1.4 Engineering / Data
- New table (`pincode_language_master`), likely a new/confirmed column on the doctor entity, and new pool-resolution logic in the assignment service — scoped as an extension of existing HGS category-pool logic, not a rebuild, **if** the existing pool-assignment service is written generically enough to add a second partitioning dimension. Needs an eng read on `PRD-HGS-Phase1.md`'s actual implementation to confirm this is additive, not a fork.
- No live-availability/routing engine exists anywhere in the current stack (confirmed absent for both Doctor Portal and the separate ACOM/Ring AI calling stack) — Layer 0 doesn't need one (it's still pull-based FIFO), but any smarter/fallback logic beyond Layer 0 (soft-matching, scored ranking — Section 4) would be new infrastructure, not an extension.
- Instrumentation: need to log, per order, (a) pincode-inferred language, (b) whether a language-pool doctor was actually found, (c) fallback path taken, (d) call outcome — otherwise you can't measure whether this worked (3.9).

### 1.5 Business / Analytics / Finance
- This is explicitly filling the `INIT-04 Discard Intelligence` gap with an untested hypothesis. Analytics needs a way to isolate "language mismatch" as a discard cause from the many other candidate causes (connectivity/call quality is the *only* other hypothesis currently on record) — otherwise a change in discard rate post-launch is not attributable to this fix specifically.
- Cost: `₹23.84/order` is the existing Doctor-call cost baseline (per roadmap evidence register) — does adding a language dimension change doctor utilization/cost per order (e.g. more holds, more manual escalations, more idle doctor time in thin pools)? Needs a before/after cost model, not just a discard-rate model.
- Hiring: if certain languages are structurally under-supplied among current doctors, this becomes a recruiting ask, not a pure product/eng fix. Business needs to know this dependency early, not discover it after launch when pools are empty.

### 1.6 Compliance / Clinical governance
- Doctor-call flows carry clinical/audit constraints the sales-calling (ACOM/Ring AI) stack doesn't (this is explicitly why the roadmap suggested HA-first as a *safer pilot ground* than Doctor flows generally). Any fallback that delays or reroutes a clinical consultation needs to stay within whatever SLA/audit rules already govern doctor calls — don't let a routing optimization silently violate an existing clinical-response-time commitment.

---

## 2. The core design questions, in priority order

These are the ones that actually determine whether Layer 0 is safe to build, roughly ordered by how much they could break the whole idea if left unanswered.

### 2.1 No doctor available in the language pool — the central failure mode
This is the one that decides everything else. Options, not mutually exclusive:

| Option | Mechanic | Risk |
|---|---|---|
| **A. Hard bypass, manual escalation on empty pool** (literal Layer 0, HGS-style) | Empty pool → straight to Super Doctor / Max Attempt queue | Simplest to build, but as sized in Layer 0 above, could overload Ops if thin pools are common, not rare |
| **B. Timed fallback to general pool** | Try language pool for a short window (e.g. same 4-min assignment window, or a separate shorter timer) → if unfilled, release to the *normal* (unfiltered) pool | Preserves most of the benefit on the common path, degrades gracefully to "today's behavior" instead of to a manual queue — recommended default to evaluate first |
| **C. Nearest-language / language-family fallback** | e.g. Hindi ↔ Urdu, or a regional lingua franca as second-choice before general pool | Needs a defined language-adjacency map — real design work, and clinically-relevant "understanding" is not guaranteed by linguistic adjacency (a soft mismatch is still a mismatch) |
| **D. Reject/requeue for callback at better time** | If no doctor now, offer the customer a scheduled callback when a matching doctor is likely available | Could reduce *this* call's discard but shift it to callback-flow discard — INIT-03 (missed-call reconnection) is explicitly already flagged as broken, so shifting the problem there without fixing that first is a trap |

**Recommendation to bring to Swapnil:** B as default fallback, with instrumentation to measure how often it's even needed — if empty-pool events are rare in practice, A (or manual) is fine and you've overbuilt; if common, you need B or C regardless of what Layer 0 assumed.

### 2.2 Multi-language pincodes
Real risk, not a hypothetical — India's pincodes routinely span multiple dominant languages (metro pincodes especially). Options:
- **Single dominant language per pincode** (Layer 0 as literally stated) — simplest, systematically wrong for every customer in that pincode who isn't in the majority.
- **Ranked list per pincode** (`pincode → [lang1, lang2, lang3]` with weights) — try pool 1, fall back to pool 2, etc., before falling to general pool. More accurate, marginally more complex, still fully static-data-driven (no new infra).
- **Move the signal from pincode to customer** — pincode is a *proxy* for what you actually want (the customer's own language), and it's a weak one. If any customer-level language signal exists anywhere (app locale setting, past order language, even name-based heuristics used elsewhere in the org — the ACOM/Ring AI stack already treats "preferred language + confidence + source + fallback" as a first-class signal for a *different* calling flow), that's a strictly better input than a pincode lookup and should be considered as Layer 1, not Layer 0. Pincode-as-proxy is a reasonable *starting* heuristic precisely because it needs zero new customer-facing product surface — but it should be explicitly framed as a stopgap, not the target state.

### 2.3 Doctor speaks multiple languages
- If `doctor.language` is a single field today (mirroring the single-`DOCTOR_CATEGORY`-per-doctor pattern), multilingual doctors are being under-utilized — a doctor fluent in Hindi+Marathi+English can only ever serve one pool, artificially shrinking liquidity everywhere.
- Recommend modeling as many-to-many (`doctor_language` join table) even in Layer 0, since it's a trivial schema difference now vs. a painful migration later, and it directly mitigates the starvation risk in 2.1 without needing any fallback logic at all — a multilingual doctor pool member *is* the fallback.

### 2.4 Interaction with existing NFS/HGS specialist categories (pool intersection)
- An order can already require a specific `DOCTOR_CATEGORY`. If it also now requires a language, the eligible pool is the **intersection** of category ∩ language — a much smaller set than either alone, and intersection-emptiness is far more likely than either dimension being empty on its own (e.g. "the one IM-specialist doctor available right now doesn't speak Tamil").
- This needs an explicit design: is language a hard filter on top of category (strict intersection, highest discard-of-service risk), or a soft preference applied only *within* the category-eligible set (try to match language among category-eligible doctors, fall back to any category-eligible doctor if none match)? The soft version is almost certainly the safer default given how much it shrinks the pool otherwise.
- `SPLIT_ORDER` (already manual-only) — does a split order additionally carry a language constraint, or is language dropped entirely once an order is already in the manual-escalation path? Needs an explicit answer, not a silent default.

### 2.5 Pincode → language mapping: source, accuracy, and drift
- Where does this mapping come from — census/publicly available linguistic data, internal customer-service-language-request logs, or something else? Each has different accuracy and different maintenance burden.
- New pincodes, serviceable-area expansion, and internal migration (a huge share of urban India) mean this table will drift from reality over time — who owns refreshing it, and on what cadence?
- Failure mode worth naming explicitly: a **wrong** pincode→language mapping is arguably *worse* than no mapping at all, because it actively assigns a mismatched doctor with false confidence, versus today's presumably-random assignment which is at least not systematically wrong in one direction. Data quality here isn't a nice-to-have, it's the difference between the fix helping and quietly making cohorts worse off.

### 2.6 Capacity / doctor-supply imbalance and SLA interaction
- Combine the existing HGS constraints (4-min assignment window, hold cap of 20, doctor hours 08:00–22:00) with an added language filter: a thin-supply-language order could realistically cycle through more hold/re-pool loops before being picked up (or before hitting the 20-attempt cap and escalating), which directly threatens `promised_doctor_call_time` SLA specifically for the cohort this project is trying to help.
- Time-of-day matters independently of raw headcount — a language pool might have adequate *total* doctors but poor *off-peak* coverage (e.g. enough Bengali-speaking doctors overall, but none on shift at 9pm). Needs supply data cut by hour, not just by day.
- This is fundamentally a workforce-planning input, not something routing logic alone can solve — if a language is structurally under-supplied, no assignment algorithm fixes that; only recruiting does. Product/eng needs Ops' actual per-language, per-shift doctor counts before committing to hard-bypass (Option A) for any given language.

### 2.7 Doctor onboarding / data quality for the language attribute itself
- Self-declared vs. verified matters a lot here — clinical communication quality isn't the same as "can technically converse." Is there any proficiency check today, or is this trust-based (similar to how the current portal's "valid call" gate is doctor self-report, not verified)?
- If `language` genuinely already exists in prod as Swapnil states (OQ-1), get the actual population/completeness numbers before assuming full pool coverage — a sparsely-populated field means most doctors default to "unknown," which behaves like an empty pool for most orders regardless of design.

### 2.8 Measurement — how do you prove this actually reduces discard?
- Needs a control group / phased rollout (e.g. by pincode or by language) so discard-rate change can be attributed to the language fix specifically, not to whatever else is moving (INIT-04's other candidate causes, seasonal variation, unrelated portal changes).
- Proxy/leading metrics worth instrumenting from day one, independent of final discard numbers: % of orders where a language-matched doctor was actually found vs. fell back; average hold/re-pool cycles by language cohort; time-to-assignment by language cohort vs. baseline; doctor call-attempt rate and confirm rate by language-match status.
- Ties back to 1.5 — this is explicitly the kind of causal claim `INIT-04 Discard Intelligence` exists to produce and hasn't yet; Project South's launch should be framed/sold internally as a *test of a hypothesis*, not a guaranteed fix, until this data exists.

### 2.9 Rollout sequencing
- Given the starvation risk (2.1) is unknown in magnitude until real per-language doctor-supply data is in hand, an org-wide simultaneous launch is the highest-risk option available.
- A safer sequencing: pick 1–2 high-volume, high-discard pincodes/languages where doctor supply is *already known to be reasonably strong*, pilot Layer 0 + fallback Option B there first, measure against 2.8's metrics, then expand. This also naturally produces the doctor-supply-by-language dataset Ops needs (2.6) before wider rollout, rather than needing to gather it upfront as a blocker.

---

## 3. Alternative approaches (beyond the static pincode-pool-bypass idea)

Swapnil asked explicitly whether there's another way to solve this — these aren't necessarily better than Layer 0, but each removes or changes one of the risk points above, and are worth holding as Layer 1/2/3 candidates:

1. **Customer explicit language selection** (app/IVR prompt at order or call time) instead of inferring from pincode. Removes the pincode-accuracy problem (2.5) entirely and fixes the multi-language-pincode problem (2.2) at the root — at the cost of a product/UX change and a bit of customer friction. Likely the *most accurate* long-term signal, worth scoping as a fast-follow rather than a blocker for Layer 0.
2. **Soft-preference scored matching instead of a hard pool bypass.** Rather than partitioning doctors into hard pools (which is what creates the starvation risk in 2.1/2.4), rank/prefer a language match within the existing category-eligible pool, but never hard-block assignment on it. Strictly lower risk than Layer 0's hard bypass, at the cost of not being as "guaranteed" a match — likely a better *first* production behavior than the literal NFS-style hard bypass, even if hard bypass is the easier one to explain and the closest analogy to the pattern Swapnil already knows works for NFS.
3. **Multi-pool doctor membership** (3.3 above) — a structural mitigation compatible with either 1 or 2, not a competing approach.
4. **Real-time interpretation / 3-way call support** instead of (or alongside) supply-side matching — for genuinely rare languages where doctor supply will never be viable to build, bring in a live interpreter rather than trying to find a doctor who speaks the language. Solves the *structural* under-supply problem (2.6) that no routing algorithm can solve, at the cost of new telephony/vendor integration (the Doctor Portal doesn't even have in-app call control today, so this is a bigger lift than it sounds).
5. **Two-stage hybrid assignment**: language pool first for a short window, automatic fallback to general pool after — this is just Option B from 2.1 stated as a first-class design, not a fallback bolted onto a hard-bypass default. Worth treating as the actual Layer 0 default rather than the literal always-hard-bypass version, given how central the starvation risk is.
6. **IVR-based language triage pre-call** — let the IVR/call flow itself surface language before a doctor is even engaged, independent of assignment-pool architecture; complements rather than replaces any of the above.

---

## 4. Suggested next layer (Layer 1) to design once Swapnil reviews this

Once the Open Decisions in `docs/context/open_questions.md` are answered (especially OQ-1 doctor-language data reality, and OQ-3 per-language doctor supply), the highest-leverage next design step is: **formalize the fallback mechanic (2.1) and the category-intersection behavior (2.4) as explicit state-machine rules**, mirroring how `PRD-HGS-Phase1.md` §5.3.4 spells out FIFO/hold/escalation — because right now Layer 0 as stated is a *routing input* (language pool) without a *complete state machine* (what happens on every failure path), and that gap is exactly where the "could make things worse" risk lives.

---

## 5. Mapping against the actual HGS Phase 1 PRD (added after narration Entry 3)

Source: `reference/PRD-HGS-Phase1-source.md` (§5.2, §5.4.1–5.4.2).

### 5.1 There are two assignment engines, not one
- **HGS orders** (≥1 high-governance salt) use **pull-FIFO**: doctor clicks "Assign order" and gets the oldest eligible order in their category. These orders skip the new ETA logic, including doctor availability on login.
- **Category P orders** (no HGS salt, which is the bulk of volume) use the **new ETA logic**, which is capacity-based. HGS changed it only by adding filters: *count only Category P doctors' capacity* and *count only Category P orders in past-order calculations*.
- So "use the same logic as HGS" can mean two things:
  - (a) Move language orders out of ETA logic into pull-FIFO pools. HGS can do this because its volume is small. Language orders would be a large share of volume, so this would pull a lot of orders off the ETA engine.
  - (b) **Copy what HGS did to Category P**: add language as another filter inside the ETA logic (capacity per language pool, past orders per language pool). **[RECOMMENDED]** This is the closer analogy, and it keeps ETA promises accurate.

### 5.2 HGS routing is strict for compliance reasons, and language does not share that reason
Sending an HGS order to the wrong doctor is a regulatory breach, so waiting is the correct fallback (the "Dr not defined" tag sends the order to Super Doctor). Sending an order to a doctor who speaks the wrong language gives a worse experience but breaks no rule. If the fallback is to wait, the wait may cause the drop-off Project South is trying to prevent. **Keep HGS's mechanics but not its strictness:** language should be a time-boxed preference, not a hard gate.

### 5.3 How each order gets its label
HGS category comes from the order's contents: salt → category, stamped at digitisation, so the result is certain. Language would come from a customer proxy (pincode → language), so the result is a guess. Recommendation: stamp `order_language` plus `language_source` and `language_confidence` at the same point (digitisation), and show it in a column on the Doctor Portal like the "High Governance Order Tag".

### 5.4 Combining HGS categories with language
The HGS summary dashboard example shows very few doctors per category (e.g. 3 in Category A). Requiring category AND language will often leave zero doctors. **Rule: category is the hard constraint and language is only a preference within the category-eligible pool.** Language should never block an HGS order.

### 5.5 HGS building blocks we can reuse
| HGS Phase 1 component | Project South equivalent |
|---|---|
| "Doctor Special Category" column (single value in Phase 1) | Doctor language(s) column, allowing **multiple values** |
| Summary View dashboard (doctors per category, used as a go-live gate) | Doctors per language × shift, used as a go-live gate per language |
| "High governance – Dr not defined" tag → Super Doctor | "Language pool empty" tag. Should fall back to the general pool automatically instead of waiting for manual action |
| Pool alerts (every 2h / when 5+ orders are pending, via SMS/WhatsApp) | Backlog alerts per language pool |
| Manual assign restricted to eligible category | Super Doctor manual assign with a language filter in the dropdown |
| Rank-up (customer signals availability via app or CSR) | CSR can record the customer's language at rank-up time |
| Hold logic (2 attempts per assignment, 20 in total, T+1/T+2 escalation) | Add an earlier exit: after N minutes or attempts in the language pool, release to the general pool |
| ETA: add X hours for Dr processing time (configurable) | ETA should use language-pool capacity. Otherwise ETAs will be wrong for regional-language customers |

### 5.6 Blind spot: a language mismatch leaves no trace in the data today
HGS hold triggers only fire when a call is **not connected** (leg 2 fails). A language-mismatch call **is connected**: the customer answers but the two sides can't communicate. It then gets recorded as a hold, unassign, cancel or discard without a reason. No call outcome records "language barrier". This means the problem can't be measured or sized at the moment.

### 5.7 New option, simpler than Layer 0: reactive routing ("Layer −1")
1. Add a call outcome on the Doctor Portal: **"Language barrier, customer needs: [language]"**.
2. When a doctor selects it, stamp `order_language` (source = doctor-observed, high confidence) and route the **next attempt** to a doctor who speaks that language.
3. Only orders that actually hit a mismatch go through the language pool. There is no pincode table on day one and no risk of starving a pool on the first attempt.
4. The recorded outcomes **size the problem** (useful for OQ-8/INIT-04) and **build a real pincode → language dataset**. That data can then drive predictive Layer 0.
- Cost: one wasted first call per mismatched order. Benefit: measured, low-risk, and it generates the data predictive routing needs.
- Possible sequence: Layer −1 (outcome + reactive) → Layer 0 (predictive pincode routing, learned from Layer −1 data) → Layer 1 (customer-declared language).
