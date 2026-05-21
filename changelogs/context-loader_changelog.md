---
name: context-loader-changelog
description: >
  Behavioral amendments for context-loader. Read at runtime before executing core
  skill steps. Updated by the weekly skill improvement pipeline — do not edit manually.
---

# context-loader_changelog.md

Amendments to context-loader.md. Read this file before running the core skill steps.
Apply any amendments listed below. Later entries override earlier ones where they conflict.
If this file is empty below this line, no amendments have been made yet.

---

## 2026-05-16 — Token optimisation: write cross-session context cache

**Change applied to context-loader.md:**

Step 7 now writes a `.context-cache.md` file to the project folder after emitting
the manifest. The cache file contains today's date and the full manifest, allowing
Context Recall to skip re-fetching Drive docs on subsequent invocations the same
day. Write is silently skipped if the project folder is unknown or if the Write
tool returns an access error — the cache is a performance optimisation, not
required for correct operation.

---

## 2026-05-17 — Token optimisation: table compression (Step 5)

**Changes applied to context-loader.md:**

1. **Table compression (Step 5 doc-type priority)** — Converted 4-item numbered prose list (Business Rules → Product Flow → Metric Definitions → SOP) into a 3-column markdown table (Priority | Type | Use for). Same information, ~30% fewer tokens. Estimated saving: ~40 tokens per load.

---
