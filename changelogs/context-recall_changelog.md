---
name: context-recall-changelog
description: >
  Behavioral amendments for context-recall. Read at runtime before executing core
  skill steps. Updated by the weekly skill improvement pipeline — do not edit manually.
---

# context-recall_changelog.md

Amendments to context-recall.md. Read this file before running the core skill steps.
Apply any amendments listed below. Later entries override earlier ones where they conflict.
If this file is empty below this line, no amendments have been made yet.

---

## 2026-05-16 — Token optimisation: cross-session context cache check

**Change applied to context-recall.md:**

Step 1 now checks for a `.context-cache.md` file in the project folder before
invoking Context Loader. If the cache exists and contains today's date, its
manifest is used directly and Context Loader is skipped entirely. This eliminates
the full Drive fetch (master index + Cross-Cutting + vertical docs) on the 2nd+
invoke for the same project on the same day — saving ~12,000–15,000 tokens for
warm sessions (e.g., writing multiple DMS milestones in separate sessions the
same day).

Cache is written by Context Loader (see context-loader_changelog.md).

---

## 2026-05-17 — Token optimisation: no changes applied

**Assessment of context-recall.md:**

File is already lean. The routing table (Step 3) is a compact 2-column markdown table. No large inline content, no unbounded loops, no verbose repetition. No significant optimisation opportunities identified — file left unchanged.

---
