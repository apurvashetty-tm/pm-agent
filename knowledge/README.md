# Knowledgebase

This folder stores reusable memory for Truemeds work. It is shared across
projects, Claude threads, Codex threads, and future agents.

## Folder map

- `knowledge/context/` — reusable company, system, metric, glossary, and user-role knowledge.
- `knowledge/decisions/` — durable dated decisions that should not be re-litigated.
- `knowledge/learnings/` — retrospectives, patterns, and reusable operating learnings.

Project-specific state does not belong here. Keep current project status,
implementation state, and next steps in:

```text
projects/[project-name]/docs/context/session_handoff.md
```

## What goes where

Use `knowledge/context/` for stable reusable facts:
- order categories
- funnel definitions
- team/org context
- system glossary
- user role and working preferences

Use `knowledge/decisions/` for durable decisions:
- dated files named `YYYY-MM-DD-short-decision-name.md`
- include context, decision, reason, and impact

Use `knowledge/learnings/` for patterns:
- what worked or failed
- repeated review feedback
- operating lessons useful beyond one project

## Extraction rules

When extracting from a Claude/Codex thread:
- Do not invent facts.
- Mark uncertain items as `[UNVERIFIED]`.
- Mark user-provided facts as `[USER-PROVIDED]`.
- Mark inferred items as `[INFERRED]`.
- Keep reusable company/system knowledge out of project handoff files.
- Keep project resume state out of this knowledgebase.

## Starter prompt

```text
Please extract reusable company/system knowledge from this thread for /Users/mac/pm-agent.

Do not edit project code.

Separate knowledge into:
1. Company/org/role context
2. System concepts
3. Order categories and flows
4. Metrics and definitions
5. Durable decisions
6. Open questions
7. Project-specific handoff items

Use:
- knowledge/context/ for reusable facts
- knowledge/decisions/ for durable dated decisions
- knowledge/learnings/ for reusable patterns
- projects/[project]/docs/context/session_handoff.md only for project resume state

Rules:
- Do not invent facts.
- Mark uncertain facts as [UNVERIFIED].
- Mark user-provided facts as [USER-PROVIDED].
- Mark inferred facts as [INFERRED].
- First show proposed changes before writing files.
```
