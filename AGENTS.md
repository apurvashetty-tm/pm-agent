# Agent Instructions

This workspace contains multiple projects under `projects/`.

Use project-local files as the source of truth. Do not rely on chat history when
the same information should live in the project folder.

If instructions conflict, follow this order:
1. Latest user instruction
2. Active project's `docs/context/project_truth.md`
3. Active project's `CLAUDE.md`
4. This file
5. Reusable knowledge files

## Before working on a project

1. Identify the active project folder under `projects/`.
2. Read `context/Claude.md` for global Truemeds context.
3. Read relevant files in `knowledge/context/` when the task touches reusable
   company, system, metric, or role knowledge.
4. Read that project's `CLAUDE.md`.
5. Read `docs/context/project_truth.md`.
6. Read `docs/context/session_handoff.md` if it exists.
7. Read `docs/context/open_questions.md`.
8. Read any role file relevant to the task, such as `docs/roles/frontend_engineer.md`.
9. Continue from `session_handoff.md` unless the user gives newer instructions.

If a project does not have these files, use `templates/project-scaffold/` as the
model for creating them.

## Knowledgebase

- `context/Claude.md` holds short global Truemeds/team context.
- `knowledge/context/` holds reusable company, system, metric, glossary, and
  user-role knowledge.
- `knowledge/decisions/` holds durable dated decisions.
- `knowledge/learnings/` holds retrospectives, patterns, and reusable learnings.
- Do not bury reusable company/system knowledge only inside a project handoff.
- Do not move project-specific resume state into `knowledge/`; keep it in the
  active project's `docs/context/session_handoff.md`.

## During work

- Follow latest user instruction first.
- Preserve locked truth in `docs/context/project_truth.md`.
- Do not invent product, backend, UX, pricing, permission, or state behavior.
- If a decision is missing, mark it `[OPEN DECISION]` and add it to
  `docs/context/open_questions.md`.
- Keep edits scoped to the active project unless the user asks for shared
  workspace changes.

## After coding

1. Update `docs/context/session_handoff.md` with:
   - current status
   - files changed
   - validation done
   - known gaps
   - next exact step
2. Update `docs/context/open_questions.md` if new unresolved decisions appeared.
3. Update `knowledge/context/`, `knowledge/decisions/`, or
   `knowledge/learnings/` if the session created reusable company knowledge.
4. Do not modify `docs/context/project_truth.md` unless the user explicitly locks
   a new truth.
5. Report files changed, what changed, assumptions, placeholders, and test plan.

## Git safety

- Do not reset, checkout, or delete user work unless explicitly asked.
- Before syncing with GitHub, check `git status --short --branch`.
- Pull with fast-forward only when bringing down remote changes.
- Keep local project files and handoff files committed together when possible.
