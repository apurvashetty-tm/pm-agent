# Contributing to PM Agent

PM Agent is the shared product-team workspace for product context, project files,
workflows, templates, decisions, and reusable knowledge.

## Working agreement

1. Pull the latest `main` branch before starting.
2. Create a short-lived branch from `main`.
3. Keep changes scoped to one project or one shared-system improvement.
4. Update the active project's context files when the work changes project truth,
   open questions, or handoff state.
5. Open a pull request and request review.
6. Merge only after required review and checks pass.

Do not push directly to `main` once branch protection is enabled.

## Branch names

Use one of these patterns:

- `project/<project-name>-<change>`
- `workflow/<workflow-name>-<change>`
- `docs/<topic>`
- `fix/<short-description>`

Examples:

- `project/acom-checkout-prd`
- `workflow/review-prd-evidence-check`
- `docs/team-onboarding`

## Project context

Before editing a project, follow `AGENTS.md` and read:

1. `context/Claude.md`
2. Active project's `CLAUDE.md`
3. Active project's `docs/context/project_truth.md`
4. Active project's `docs/context/session_handoff.md`
5. Active project's `docs/context/open_questions.md`

Never invent product truth. Mark missing decisions `[OPEN DECISION]`.

## Pull requests

Every pull request should explain:

- What changed and why
- Project or shared system affected
- Decisions introduced or changed
- Assumptions and placeholders
- Validation performed
- Context or handoff files updated

Prefer small pull requests. Keep source material, resulting product artifact, and
relevant context updates together when they form one decision trail.

## Permissions

- Product-team members: `Write`
- Product leads: `Maintain`
- Repository owners: `Admin`
- Stakeholders who only review: `Triage` or `Read`

Use personal GitHub accounts. Do not share passwords or personal access tokens.

