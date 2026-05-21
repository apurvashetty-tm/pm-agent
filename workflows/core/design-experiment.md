---
name: experiment-designer
description: >
  Activate this skill to design a rigorous A/B or multivariate experiment. Triggered
  manually when a PM has a hypothesis they want to test. Works from any input —
  a signed-off PRD, a hypothesis + target metric, or a verbal description. Produces
  a complete XP Doc covering: formal hypothesis, primary and guardrail metrics with
  thresholds, full statistical design (MDE, sample size, α, power, test type, duration),
  traffic allocation with mandatory holdout group, assignment logic, SRM check,
  interaction effects, and ship/iterate/kill decision criteria. Chains to Metrics
  Designer after the XP Doc is complete to validate metric measurability and data
  availability.
---

# Experiment Designer

Designs rigorous A/B and multivariate experiments. Produces a complete XP Doc that
covers every dimension a PM and engineering team need to run the experiment correctly.
Chains to Metrics Designer to validate metric availability after the doc is complete.

---

## Step 1 — Identify and consolidate the input

Determine what source material is available:

- **Signed-off PRD in context or Drive** → primary source. Extract the hypothesis
  from the Objective and Why Now sections. Use Metrics section as the basis for
  metric definitions.
- **Hypothesis + target metric provided verbally** → use directly. Ask for any
  missing inputs before proceeding (Step 2).
- **Verbal description only** → extract a hypothesis from what the PM has described.
  Confirm it with the PM before proceeding to Step 2.

If the input comes from a PRD, flag which sections were used and which were missing
so the PM knows where the XP Doc is making assumptions.

---

## Step 2 — Gather mandatory inputs

Before any design work begins, ensure all of the following are defined. Ask for any that are missing — do not assume defaults.

| Input | Required format / notes |
|---|---|
| **Hypothesis** | "We believe [change] will cause [metric] to [direction] by approximately [magnitude] because [reasoning]." Magnitude is an estimate but must be stated — it becomes the MDE input. |
| **Primary metric** | Single metric only. If PM names more than one, push back: "Which single metric is this experiment's north star?" |
| **Eligible population** | Who is in scope (e.g., all users, specific cities, ≥1 order placed). If none given, flag it — most experiments should not run on 100% of users without a reason. |
| **Experiment type** | A/B (one control, one treatment) or multivariate (one control, multiple treatments). If multivariate, how many variants? |
| **Baseline metric value** | Current value on the eligible population. Required for sample size calculation. If unavailable, fetch via Metrics Designer before proceeding to Step 5. |

---

## Step 3 — Load context

Use context already loaded in session. Do not re-fetch.

Fetch if missing:
- **Vertical-specific business rules** — some verticals have constraints on
  experiment eligibility (e.g., B2B users must not be included in consumer
  experiments without explicit approval)
- **Any running experiments doc** — if Truemeds maintains a live experiments
  tracker in Drive, fetch it to check for interaction effects (Step 9)

---

## Step 4 — Define metrics

Before designing the statistical structure, define all three metric tiers. A common
failure mode in experiment docs is defining the primary metric but leaving guardrail
metrics unspecified until something goes wrong.

### Primary metric
The single metric the experiment is designed to move. Confirm the definition matches
how it is computed in Metabase or Mixpanel — ambiguity here will make the results
uninterpretable.

### Secondary metrics
2–4 leading indicators or related metrics that help explain the primary metric
movement. These are tracked but do not gate the experiment decision.

### Guardrail metrics
Metrics that must NOT regress beyond a defined threshold. If any guardrail is breached, the experiment is paused regardless of primary metric performance.

For each guardrail, define all three fields — do not leave any as "to be defined later." Undefined guardrails = no safety net.

| Field | What to specify |
|---|---|
| Threshold | Max acceptable degradation (absolute or relative) |
| Direction | Whether breach is above or below threshold |
| Action on breach | Pause only, or immediate kill |

Example: *Return rate: must not increase by more than 2pp from baseline. Above threshold = breach. Action: pause and alert.*

---

## Step 5 — Statistical design

This is the most critical section. Work through each element in sequence.

### 5a — Minimum Detectable Effect (MDE)
Extract from the hypothesis (Step 2). The MDE is the smallest effect the experiment
must be able to detect with confidence. It should be:
- **Meaningful to the business** — not "detectable in theory" but "worth shipping
  if real." A 0.1% lift in conversion may be statistically detectable but not worth
  the engineering maintenance cost.
- **Consistent with the hypothesis estimate** — if the hypothesis says "~5% lift,"
  the MDE should be ≤ 5%. Setting MDE = 0.5% when the hypothesis expects 5% just
  means the experiment will be overpowered and run longer than necessary.

If the PM hasn't stated a magnitude in the hypothesis, ask for it now.

### 5b — Significance level (α)
Default: **α = 0.05** (5% false positive rate). Override only with justification:
- α = 0.01 for experiments affecting payments, refunds, or user safety
- α = 0.10 acceptable for low-stakes exploratory tests where speed matters

State the chosen α and the reason.

### 5c — Statistical power (1 − β)
Default: **power = 0.80** (80%). Override only with justification:
- Power = 0.90 for experiments with significant rollout cost or irreversible changes

State the chosen power and the reason.

### 5d — Sample size per variant
Use the appropriate formula based on metric type:

**For proportion metrics** (conversion rate, click rate, completion rate):
```
n = 2 × (z_α/2 + z_β)² × p₀(1 − p₀) / MDE²

Where:
  p₀  = baseline proportion
  MDE = absolute minimum detectable effect
  z_α/2 = 1.96 for α = 0.05
  z_β   = 0.84 for power = 0.80
```

**For continuous metrics** (order value, session duration, items per cart):
```
n = 2 × (z_α/2 + z_β)² × σ² / MDE²

Where:
  σ   = standard deviation of the metric (estimate if unavailable)
  MDE = absolute minimum detectable effect
```

Compute n for the required sample size per variant. For multivariate tests, n is
per variant — total sample = n × (number of variants + 1 for control).

Show the calculation with the inputs substituted so the PM can verify and adjust.

### 5e — Statistical test type
Specify which test will be used to evaluate results:

| Primary metric type | Test |
| --- | --- |
| Proportion (conversion, click rate) | Two-proportion z-test or chi-squared |
| Continuous, approximately normal (AOV, session time) | Welch's t-test (unequal variance) |
| Continuous, non-normal or small sample | Mann-Whitney U test |
| Multiple variants simultaneously | ANOVA with post-hoc correction (Bonferroni) |
| Time-to-event (time to first order) | Log-rank test |

State the chosen test and why it fits the metric type.

### 5f — Early stopping rules
Define upfront — not during the experiment. Experiments must not be stopped early
because the result "looks good." Early stopping inflates false positive rate.

| Condition | Acceptable? | Action |
|---|---|---|
| Guardrail metric exceeds defined threshold | Yes | Pause immediately, investigate before continuing |
| Primary metric regression > 2× MDE in wrong direction, sustained ≥ 3 days | Yes | Kill the experiment |
| Pre-registered interim analysis (Bonferroni-corrected α/2 = 0.025 if one interim look) | Yes | Pre-register the date/milestone here |
| "Variant is already winning at day 3" | No | — |
| "Traffic lower than expected, need to extend" | No | — |
| "Team wants to ship before sprint ends" | No | — |

State these rules explicitly in the XP Doc so they cannot be revised mid-experiment.

### 5g — Test duration
Estimated experiment duration in days:

```
Duration = required_sample_size_per_variant × num_variants /
           (daily_eligible_traffic × traffic_allocation_fraction)
```

Round up to the nearest full week. Experiments should run for at least one full
business cycle (7 days minimum) to capture weekly seasonality. If the estimated
duration exceeds 8 weeks, flag it: either the MDE is too ambitious for the available
traffic, or the eligible population is too narrow.

---

## Step 6 — Traffic allocation and holdout

### Holdout group (mandatory)
Every experiment must preserve a clean holdout group — users who are eligible for
the experiment but are not assigned to any variant. The purpose is not to measure
the long-term effect of this experiment specifically — it is to preserve a pool of
untouched users available for other concurrent experiments.

**Default holdout**: 10% of the eligible population.
**Minimum holdout**: 5% — only if justified by traffic constraints.
**Override condition**: 0% holdout is acceptable only if the experiment is a
full-population rollout of a regulatory or compliance requirement. Document the
reason explicitly.

If the PM proposes 0% holdout without a compliance reason, push back:
*"This would consume 100% of eligible traffic. There will be no clean user pool
for other experiments in this segment. Can we reduce traffic allocation to
preserve at least 10% holdout?"*

### Traffic allocation table
Produce an explicit allocation table:

| Group | % of eligible traffic | Purpose |
| --- | --- | --- |
| Control | X% | Baseline — current experience |
| Treatment 1 | X% | New experience |
| Treatment N (if multivariate) | X% | Additional variant |
| Holdout | ≥ 10% | Preserved for other experiments |
| **Total** | **100%** | |

The split between control and treatments should be equal (e.g., 45% control,
45% treatment, 10% holdout) unless there is a specific reason to use an unequal
split. Unequal splits reduce statistical power and must be justified.

**Power implication of unequal splits**: if the split deviates from 50/50 between
control and treatment, recompute sample size using the harmonic mean formula:
```
n_effective = 2 / (1/n_control + 1/n_treatment)
```
This effective sample size should meet the required n from Step 5d.

---

## Step 7 — Unit of randomization and assignment logic

### Unit of randomization
Specify the identifier used for assignment. In order of preference:
1. `customer_id` — use for logged-in users. Guarantees consistency across sessions
   and devices.
2. `device_id` — use if the experience must be consistent before login (e.g., an
   onboarding flow).
3. `session_id` — only for single-session experiments where cross-session
   consistency is irrelevant. Rare.

Never mix units within a single experiment. If some users are identified by
`customer_id` and others by `device_id`, the experiment will produce biased results.

### Assignment algorithm
Use deterministic hash-based assignment:
```
bucket = hash(subject_id + experiment_id) % 100
```
This guarantees:
- Same user always gets the same variant
- Assignment is independent of other experiments (different experiment_id)
- No central assignment service required

Define bucket ranges explicitly:
```
0 – X     → Control
X+1 – Y   → Treatment 1
Y+1 – Z   → Treatment N
Z+1 – 99  → Holdout
```

### Assignment persistence
State when assignment is locked:
- On first eligible exposure — once assigned, the variant does not change
- If the user's eligibility changes mid-experiment (e.g., city changes), specify
  whether the assignment is retained or reset

### Anonymous → authenticated user mapping
If the platform allows anonymous sessions that later resolve to a logged-in user,
specify the merge logic:
- If `customer_id` takes priority: re-assign based on `customer_id` on login
- If `anonymous_id` assignment is retained: specify how conflicts are resolved

---

## Step 8 — Eligibility specification

Define eligibility precisely. Ambiguous eligibility is the most common source of
experiment contamination.

For each eligibility criterion, state:
- The criterion (e.g., delivery pincode in allowlist)
- Whether it is evaluated once (at first exposure) or on every request
- What happens when eligibility changes mid-experiment (retain assignment / exit experiment / re-evaluate)

Flag any eligibility criteria that could create a biased sample:
- Geo-restricted experiments (as in the sample doc) mean results may not generalise
  to other geographies
- New-user-only experiments cannot measure long-term retention effects
- High-value-user-only experiments skew AOV metrics

---

## Step 9 — Interaction effects check

Before finalising the XP Doc, check whether other live or planned experiments
could interfere with this one.

Two types of interaction to check:

**Eligibility overlap**: if another experiment is running on the same eligible
population, users may be in both experiments simultaneously. This is usually
acceptable if the experiments test independent features. It becomes a problem if
both experiments change the same screen or metric.

**Metric overlap**: if another experiment is running that also moves the primary
metric, the observed effect in this experiment will be confounded. Document any
known overlaps and state whether mutual exclusion is required.

If a live experiments tracker doc exists in Drive (fetched in Step 3), check it
and list any overlapping experiments with a note on whether they conflict.

If no tracker exists, flag it:
*"[No live experiments tracker found in Drive. Interaction effects could not be
checked. Recommend filing a tracker doc and registering this experiment in it.]*"

---

## Step 10 — Decision criteria

Define upfront what constitutes a ship, iterate, or kill decision. These criteria
must be stated before the experiment runs — changing them after seeing results
is p-hacking.

| Decision | Criteria |
| --- | --- |
| **Ship** | Primary metric moves ≥ MDE in expected direction at α significance. No guardrail breached. |
| **Iterate** | Primary metric moves in expected direction but below MDE, OR primary metric is neutral but a secondary metric shows a meaningful signal worth exploring. |
| **Kill** | Primary metric moves in wrong direction at α significance, OR any guardrail metric is breached beyond its defined threshold. |
| **Inconclusive** | Experiment ends without reaching statistical significance in either direction. Options: extend (if traffic allows), rerun with wider MDE, or kill. |

State which team member is accountable for the final ship/kill decision and
within what timeframe after the experiment concludes.

---

## Step 11 — Draft and save the XP Doc

Write the complete XP Doc in chat, covering all sections from Steps 2–10.
The XP Doc must be self-contained — an engineer who has not seen this conversation
must be able to implement the experiment correctly from the doc alone.

**XP Doc structure:**
1. Experiment Overview (name, ID, objective, owner, launch target)
2. Hypothesis
3. Metrics (primary, secondary, guardrail with thresholds)
4. Statistical Design (MDE, α, power, sample size calculation, test type, duration, early stopping)
5. Traffic Allocation (table: control / treatment(s) / holdout)
6. Eligibility Criteria
7. Unit of Randomization & Assignment Logic
8. Interaction Effects
9. Decision Criteria

After writing in chat, save as a Markdown file:
`[XP] Feature Name.md`

Share the file link with the user.

---

## Step 12 — Chain to Metrics Designer (automatic)

After saving the XP Doc, automatically invoke Metrics Designer to validate:
1. That the primary metric, secondary metrics, and guardrail metrics are all
   measurable with data available in Metabase or Mixpanel
2. That the baseline metric value used in the sample size calculation is correct
3. That the metric definitions in the XP Doc match how the metrics are actually
   computed in Truemeds' data systems

Say: *"XP Doc saved. Running Metrics Designer now to validate that all defined
metrics are measurable with available data."*

---

## Edge cases

- **No baseline metric value available** → the sample size calculation cannot be
  completed. Ask the PM to fetch the baseline via Metrics Designer before
  proceeding with Step 5. Do not substitute a guess.
- **Traffic is insufficient for the required sample size** → compute how long the
  experiment would need to run at current traffic. If it exceeds 8 weeks, flag:
  the experiment is not feasible with current eligibility scope. Options: widen
  eligibility, increase MDE (accept a less sensitive test), or defer.
- **PM proposes 0% holdout** → push back per the rule in Step 6. Only override
  with a documented compliance/regulatory reason.
- **Multivariate test with many variants** → each additional variant dilutes
  per-variant traffic and increases required total sample. Recompute with Bonferroni
  correction. If more than 3 variants are proposed, flag: consider running sequential
  experiments instead of a single large multivariate test.
- **PM wants to change decision criteria after seeing interim results** → do not
  update the XP Doc to reflect this. The original pre-registered criteria stand.
  If the PM insists, document the change with a timestamp and the reason — this
  is a known threat to validity and must be recorded.
- **Experiment is in a vertical with specific business rules** → apply them. E.g.,
  B2B experiments may require ops team sign-off before running. Check Cross-Cutting
  context doc for experiment governance rules.

---

## Final Step: Save and Push to GitHub

See `templates/FINAL-STEP-TEMPLATE.md` for instructions on saving your Experiment Design and pushing to GitHub with automatic versioning (v1, v2, v3, etc.).
