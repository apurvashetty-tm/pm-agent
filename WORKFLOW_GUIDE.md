# Workflow Guide

Copy-paste the examples below into Claude Code. Claude does the rest.

---

## Create a PRD

**Paste this in Claude Code:**
Create a PRD.
Feature: [Feature name]
Problem: [What problem does it solve?]
Success Metric: [How will you measure success?]
Entry point: ~/pm-agent/workflows/supporting/recall-and-route.md
**What happens:**
1. Claude loads context
2. Generates PRD
3. Reviews it automatically
4. Maps stakeholder objections
5. Saves to: `archives/projects/2026-05-17-[feature]-v1.md`
6. Pushes to GitHub

**Example:**
Create a PRD.
Feature: Promise Buffer Enhancement
Problem: Customers see rushed deliveries because promises are too tight. We want to add a configurable buffer.
Success Metric: Improve OTD% by 5% without delaying expected delivery dates.
Entry point: ~/pm-agent/workflows/supporting/recall-and-route.md
---

## Design an Experiment

**Paste this in Claude Code:**
Design an experiment.
Hypothesis: [What do you believe will happen?]
Target Metric: [What are you measuring?]
Current Value: [What's the baseline?]
Target Value: [What improvement matters?]
Entry point: ~/pm-agent/workflows/supporting/recall-and-route.md
**Example:**
Design an experiment.
Hypothesis: Adding a 4-hour buffer to promises will improve OTD% without hurting customer satisfaction.
Target Metric: OTD% (on-time delivery percentage)
Current Value: 92%
Target Value: 97%
Entry point: ~/pm-agent/workflows/supporting/recall-and-route.md

**Output:** `archives/experiments/2026-05-17-[feature]-v1.md`

---

## Map Objections

**Paste this in Claude Code:**
Map objections for [feature].
Entry point: ~/pm-agent/workflows/supporting/recall-and-route.md
**What happens:**
1. Claude loads your PRD
2. Identifies concerns by stakeholder (Ops, Finance, Eng, Product)
3. Saves to: `archives/objections/2026-05-17-[feature]-v1-objections.md`

**Example:**
Map objections for promise-buffer-v1.
Entry point: ~/pm-agent/workflows/supporting/recall-and-route.md
---

## Write an Executive Brief

**Paste this in Claude Code:**
Write an executive brief.
Feature: [Feature name]
Audience: [CEO / Board / Finance]
Entry point: ~/pm-agent/workflows/supporting/recall-and-route.md

**Example:**
Write an executive brief.
Feature: Promise Buffer Enhancement
Audience: CEO
Entry point: ~/pm-agent/workflows/supporting/recall-and-route.md
**Output:** `archives/briefs/2026-05-17-[feature]-v1-brief.md`

---

## Iterate (Revise & Save as v2)

Already saved a PRD as v1? Need to revise?

**Paste this:**
Revise the PRD for [feature-name].
Changes: [What's different in this version?]
Entry point: ~/pm-agent/workflows/supporting/recall-and-route.md
**What happens:**
- Claude detects v1 exists
- Auto-saves as v2
- Both versions on GitHub for comparison

**Example:**
Revise the PRD for promise-buffer.
Changes: Added more detail on implementation timeline and dependencies with warehouse team.
Entry point: ~/pm-agent/workflows/supporting/recall-and-route.md

---

## Push Manually (If Needed)

By default, Claude auto-pushes. If you need to push manually:

```bash
cd ~/pm-agent
~/pm-agent/scripts/commit-and-push.sh "Add PRD: Promise Buffer v3"
```

---

## Check Your Files

**On your Mac:**
```bash
ls ~/pm-agent/archives/projects/
ls ~/pm-agent/archives/objections/
```

**On GitHub:**
https://github.com/apurvashetty-tm/pm-agent/tree/main/archives

---

That's it. Paste examples. Claude handles the rest.
