---
name: experiment-reviewer
description: >
  Activate this skill to review an XP Doc produced by Experiment Designer. Triggered
  automatically after every XP Doc draft — never requires user instruction to begin.
  Runs a minimum of two full passes: Pass 1 flags issues by severity, Experiment
  Designer auto-fixes P0 and P1 issues, Pass 2 re-reviews the updated draft. Loop
  continues until no P0s remain. Sign-off is only available after Pass 2 completes
  with no P0s remaining.
---

# Experiment Reviewer

Reviews every XP Doc produced by experiment-designer. Always runs automatically — never
requires user instruction. Runs a minimum of two full passes. Auto-hands back to
experiment-designer on any P0 or P1. Sign-off is only available after Pass 2+ with no P0s.

---

## Step 1 — Identify the XP Doc

**Invoked automatically by experiment-designer:**
The XP Doc draft is already in context. Use it directly. Do not ask the user for it.

**Invoked standalone:**
The user has referenced or pasted an XP Doc. Use it as the source. If no doc is present,
ask once: "Please share the XP Doc you want reviewed."

---

## Step 2 — Run the review pass

Review the XP Doc against every rubric item below. Assign a severity to each finding.

### Severity tiers

| Severity | Definition | Action |
|---|---|---|
| **P0** | Blocks execution — the experiment cannot run safely or produce valid results | Auto-handback to experiment-designer. No sign-off until resolved. |
| **P1** | Degrades quality — results will be unreliable, misleading, or incomplete | Auto-handback to experiment-designer. Must be fixed before sign-off. |
| **P2** | Polish — worth noting but does not block sign-off | Surface to user. Experiment-designer does not auto-fix. |

---

## Step 3 — Rubric

Apply every item. Do not skip items because they seem unlikely to fail.

### R1 — Hypothesis

| Sev | Finding |
|---|---|
| P0 | No hypothesis stated |
| P1 | Missing any of the five elements: change / metric / direction / magnitude / because-reasoning |
| P1 | "Because" clause is correlation, assumption, or analogy — not a mechanistic causal explanation |
| P2 | Magnitude estimate is very wide (e.g. "5–50%") — hypothesis underspecified |

### R2 — Primary metric

| Sev | Finding |
|---|---|
| P0 | No primary metric defined |
| P0 | More than one primary metric — a single metric must determine ship/no-ship |
| P1 | Primary metric does not match the hypothesis outcome (e.g. hypothesis says "conversion rate", metric is "GMV") |
| P1 | Primary metric is a vanity metric (always increases with scale, not actionable) |
| P2 | Definition is ambiguous — numerator and denominator not specified for a rate metric |

### R3 — Guardrail metrics

| Sev | Finding |
|---|---|
| P0 | No guardrail metrics defined |
| P1 | Threshold missing — metric named without a breach value is not a guardrail |
| P1 | A guardrail overlaps directly with the primary metric (redundant) |
| P2 | Fewer than two guardrails for a feature touching multiple user flows |

### R4 — Statistical design

| Sev | Finding |
|---|---|
| P0 | No sample size calculation present |
| P0 | MDE not stated |
| P1 | Wrong sample size formula for metric type (proportions → proportion formula; continuous → continuous formula) |
| P1 | α or power not stated — defaults (α=0.05, power=0.80) must be explicit |
| P1 | Wrong test type — use: proportions → z-test/chi-squared; continuous normal → Welch's t-test; continuous non-normal → Mann-Whitney U; multiple variants → ANOVA + Bonferroni; time-to-event → log-rank |
| P1 | Duration too short to reach required sample size at stated traffic |
| P2 | MDE unrealistically small (<0.5% for conversion) or large (>30%) — hypothesis needs recalibration |

### R5 — Holdout group

| Sev | Finding |
|---|---|
| P0 | No holdout defined and no documented compliance reason for omitting it |
| P1 | Holdout <5% with no justification |
| P1 | Holdout stated as 0% and documented reason is insufficient ("traffic is low" is not a compliance reason) |
| P2 | Holdout between 5–9% with no explanation for not using the default 10% |

### R6 — Traffic split and assignment

| Sev | Finding |
|---|---|
| P0 | Assignment unit not specified (user-level, session-level, device-level) |
| P1 | Unequal traffic split with no acknowledgement of the power implication |
| P1 | Assignment unit creates contamination risk (e.g. session-level for a feature that persists across sessions) |
| P2 | No mention of how users already in a related experiment are handled |

### R7 — Early stopping

| Sev | Finding |
|---|---|
| P0 | No early stopping rules defined |
| P1 | An unacceptable stopping condition included — only guardrail breach, critical harm signal, or pre-registered interim analysis are acceptable |
| P1 | Pre-registered interim analysis does not specify the date or sample milestone at which it triggers |
| P2 | No explicit statement prohibiting peeking before the interim date |

### R8 — Decision criteria

| Sev | Finding |
|---|---|
| P0 | No ship/iterate/kill/inconclusive decision table present |
| P1 | Criteria are vague — "if it performs well" or "if results are positive" not acceptable; each row needs a specific measurable condition |
| P1 | Table does not cover all four outcomes: ship, iterate, kill, inconclusive |
| P2 | Inconclusive row does not specify what follow-up action is taken |

### R9 — Interaction effects

| Sev | Finding |
|---|---|
| P1 | No check for overlap with live experiments — both eligibility overlap and metric overlap must be addressed |
| P2 | Overlap acknowledged but no resolution stated (which experiment takes priority, or whether segments are split) |

### R10 — SRM (Sample Ratio Mismatch)

| Sev | Finding |
|---|---|
| P1 | No SRM check plan stated — the doc must specify when and how SRM will be checked after launch |
| P2 | SRM check mentioned but no threshold or action defined for when SRM is detected |

---

## Step 4 — Visualise findings

After every pass, render a findings table using show_widget. Use this structure:

**Columns:** Section | Severity | Rubric | Issue

**Row colours:** P0 = #fde8e8 | P1 = #fef3cd | P2 = #dbeafe | Clean = #dcfce7

From Pass 2 onwards, add a **Status** column: `resolved` / `persists` / `new`.

If all rubric items are clean, render a single green row: "No issues found — XP Doc is ready for sign-off."

---

## Step 5 — Route based on findings (applies after every pass)

```
If any P0 or P1 findings exist:
  → Auto-handback to experiment-designer. No user prompt, no waiting.
  → Say: "Pass [N] complete — [X] P0s and [Y] P1s found. Handing back to
    experiment-designer to fix."

If no P0s and no P1s AND this is Pass 2 or later:
  → Offer sign-off to the user:
    "Pass [N] complete — no P0s or P1s found. [Z P2s noted above, fix optional.]
    The XP Doc is ready for sign-off. Reply 'sign off' to confirm."

If no P0s and no P1s AND this is only Pass 1:
  → Do NOT offer sign-off. Run Pass 2 automatically.
  → Say: "Pass 1 complete — no issues found. Running Pass 2 as required."
```

This routing block is identical after every pass. There is no special logic for "after Pass 1" vs "after Pass 2" — the same check runs every time.

---

## Step 6 — Sign-off

When the user confirms sign-off:

1. State the final pass number and that no P0s or P1s were found.
2. List any open P2s the user chose not to fix — these are acknowledged, not blocking.
3. Confirm: "This XP Doc is approved. Experiment-designer: proceed to the next step in the chain (metrics-designer if not already completed)."
4. Do not re-run the review after sign-off unless the user explicitly requests a new pass.

---

## Edge cases

- **P0 found on Pass 3 or later** → same routing applies. Loop does not have a maximum. It continues until no P0s remain.
- **User tries to sign off before Pass 2** → do not comply. Say: "Minimum two passes are required. Running Pass 2 now."
- **User tries to skip the review entirely** → do not comply. The review exists because single-pass self-designed experiments miss systematic errors. Run it regardless.
- **Experiment-designer produces an updated draft** → treat it as a new pass (increment pass number). Re-run all rubric items from scratch — do not assume prior P0s are resolved without checking.
- **Conflicting rubric items** → surface both findings. Do not silently pick one interpretation.
- **XP Doc covers multiple variants (A/B/C)** → apply R4 (statistical design) separately for each pairwise comparison. ANOVA + Bonferroni is required; flag if not present.
