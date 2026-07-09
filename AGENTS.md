# Agent Instructions

This workspace contains multiple projects under `projects/`.

Use project-local files as the source of truth. Do not rely on chat history when
the same information should live in the project folder.

## Before working on a project

1. Identify the active project folder under `projects/`.
2. Read that project's `CLAUDE.md`.
3. Read `docs/context/project_truth.md`.
4. Read `docs/context/session_handoff.md` if it exists.
5. Read `docs/context/open_questions.md`.
6. Read any role file relevant to the task, such as `docs/roles/frontend_engineer.md`.
7. Continue from `session_handoff.md` unless the user gives newer instructions.

If a project does not have these files, use `templates/project-scaffold/` as the
model for creating them.

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
3. Do not modify `docs/context/project_truth.md` unless the user explicitly locks
   a new truth.
4. Report files changed, what changed, assumptions, placeholders, and test plan.

## Git safety

- Do not reset, checkout, or delete user work unless explicitly asked.
- Before syncing with GitHub, check `git status --short --branch`.
- Pull with fast-forward only when bringing down remote changes.
- Keep local project files and handoff files committed together when possible.
