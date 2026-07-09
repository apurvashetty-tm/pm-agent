# Claude Workspace Instructions

Read `AGENTS.md` first. It is the canonical workspace protocol for all agents.

## Global context

Before project work, read:
- `context/Claude.md`
- relevant files in `knowledge/context/`

Use `knowledge/README.md` to decide where reusable knowledge belongs.

## Project context

For work inside `projects/[project-name]/`, read:
- `projects/[project-name]/CLAUDE.md`
- `projects/[project-name]/docs/context/project_truth.md`
- `projects/[project-name]/docs/context/session_handoff.md` if it exists
- `projects/[project-name]/docs/context/open_questions.md`
- relevant files in `projects/[project-name]/docs/roles/`

Continue from `session_handoff.md` unless the user gives newer instructions.

## Memory updates

At the end of a meaningful task:
- update the active project's `docs/context/session_handoff.md`
- update `docs/context/open_questions.md` if a project decision remains unresolved
- update `knowledge/context/` if the session produced reusable company/system knowledge
- update `knowledge/decisions/` if the session produced a durable dated decision
- update `knowledge/learnings/` if the session produced a reusable retrospective or pattern

Do not modify `project_truth.md` unless the user explicitly locks new truth.
