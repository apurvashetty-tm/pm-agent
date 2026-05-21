---
name: experiment-designer-changelog
description: >
  Behavioral amendments for experiment-designer. Read at runtime before executing core
  skill steps. Updated by the weekly skill improvement pipeline — do not edit manually.
---

# experiment-designer Changelog

Amendments are appended after observing behaviour gaps in live sessions.
Read this file before running the skill. Where an amendment conflicts with the core
skill instructions, the amendment takes precedence.

---

## 2026-05-15 — Experiment monitoring handoff updated

**Observed behaviour**: Skill was designed to hand off to `experiment-guardian.md`
for live monitoring after the XP Doc is signed off.

**Desired behaviour**: `experiment-guardian.md` no longer exists as a standalone skill.
Experiment monitoring is now handled by `post-release-analyser.md` in Experiment mode.

**Amendment**: In the final step of experiment-designer (the handoff / next steps
section), replace any reference to `experiment-guardian.md` with the following:

*"Once the experiment is live, monitor it using `data-agent/post-release-analyser.md`
in Experiment mode. Pass the XP Doc as context — it contains the hypothesis, primary
metric, guardrail thresholds, expected split, and MDE that post-release-analyser needs
as inputs."*

---

## 2026-05-17 — Token optimisation: table compression (Steps 2, 4, 5f)

**Changes applied to experiment-designer.md:**

1. **Table compression (Step 2 — mandatory inputs)** — Converted 5-item numbered prose list of mandatory inputs into a 2-column table (Input | Required format / notes). Each item preserved in full, more scannable. Estimated saving: ~80 tokens per run.

2. **Table compression (Step 4 — guardrail metric fields)** — Replaced 3-bullet prose spec for guardrail metric fields (Threshold / Direction / Action on breach) with a compact 2-column table. Example preserved inline. Estimated saving: ~40 tokens per run.

3. **Table compression (Step 5f — early stopping rules)** — Replaced two separate prose lists (acceptable / not acceptable stopping conditions) with a single 3-column table (Condition | Acceptable? | Action). All conditions preserved. Estimated saving: ~60 tokens per run.
