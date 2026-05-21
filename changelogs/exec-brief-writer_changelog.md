---
name: exec-brief-writer-changelog
description: >
  Behavioral amendments for exec-brief-writer. Read at runtime before executing core
  skill steps. Updated by the weekly skill improvement pipeline — do not edit manually.
---

# exec-brief-writer_changelog.md

Amendments to exec-brief-writer.md. Read this file before running the core skill steps.
Apply any amendments listed below. Later entries override earlier ones where they conflict.
If this file is empty below this line, no amendments have been made yet.

---

## 2026-05-17 — Token optimisation: consolidate repeated audience calibration blocks

**Changes applied to exec-brief-writer.md:**

1. **Table compression (Step 4 — audience calibration)** — The four per-section audience calibration blocks (The Ask, Why Now, Recommendation — each with 4–5 bullet points) were replaced with a single shared 4-column reference table (Audience | The Ask | Why Now | Recommendation) placed once at the top of Step 4. Each section now references the table with one sentence instead of repeating 4–5 bullets. Estimated saving: ~200 tokens per run (4 repeated blocks collapsed into 1 table).

---
