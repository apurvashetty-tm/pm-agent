---
name: experiment-reviewer-changelog
description: >
  Behavioral amendments for experiment-reviewer. Read at runtime before executing core
  skill steps. Updated by the weekly skill improvement pipeline — do not edit manually.
---

# experiment-reviewer_changelog.md

Amendments to experiment-reviewer.md. Read this file before running the core skill steps.
Apply any amendments listed below. Later entries override earlier ones where they conflict.
If this file is empty below this line, no amendments have been made yet.

---

## 2026-05-17 — Token optimisation: table compression (Step 3 rubric)

**Changes applied to experiment-reviewer.md:**

1. **Table compression (Step 3 — full rubric R1–R10)** — Converted all 10 rubric sections from verbose prose bullet lists into compact 2-column per-section tables (Sev | Finding). Every severity level and finding description preserved verbatim; format changed from prose bullets to scannable table rows. The test-type mapping in R4 was preserved as inline text within the table cell. Estimated saving: ~350–400 tokens per review pass (the rubric is read every pass, so this compounds across multi-pass reviews).

---
