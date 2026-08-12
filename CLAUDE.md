# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Claude Workspace Instructions

Read `AGENTS.md` first. It is the canonical workspace protocol for all agents (read order, priority order, git safety rules). This file adds architecture/commands context on top of it — it does not replace it.

For TrueMeds-specific work, also read `knowledge/context/tm-chotu-integration.md`.
Load `knowledge/context/tm-chotu/skills/using-tm-chotu/SKILL.md` and only
relevant domain skills before drafting or analyzing. The local package is
reference context; live metrics still require authorized data access.

## What this repo is

Truemeds PM workflow system, two kinds of content live side by side:

1. **PM document workflows** (root-level `workflows/`, `archives/`, `templates/`) — skill-style markdown playbooks that generate PRDs, experiment designs, objection maps, exec briefs, and test cases, versioned and pushed to GitHub. No build/lint/test tooling — this half of the repo is pure markdown.
2. **`projects/`** — individual product/prototype workspaces (e.g. an HTML/CSS/JS doctor-portal prototype, a PRD-only ACOM×Ring AI voice-bot spec). Each is self-contained with its own `CLAUDE.md`.

There is no root package.json, build step, linter, or test runner. Do not assume Node/Python tooling applies workspace-wide — check the specific `projects/[name]/` you're in.

## Commands

```bash
# Push archives to GitHub (auto-invoked by workflows; run manually only if asked)
scripts/commit-and-push.sh "commit message"

# Compute next version filename for an archive type + feature
~/pm-agent/scripts/get-next-version.sh "archives/projects" "feature-name"
# → 2026-05-17-feature-name-v2.md

# Weekly self-learning synthesis (extracts corrections/patterns from git history into changelogs/)
node scripts/run-synthesis.js
python scripts/weekly_synthesis.py
```

No install step; scripts are standalone bash/node/python with no dependency manifest.

## Architecture: PM workflow system

**Entry point is always `workflows/supporting/recall-and-route.md`** — every PM task (PRD, review, objections, exec brief, experiment) is routed through it, never invoked directly:

1. **Context Recall** (`recall-and-route.md`) — mandatory first step. Checks for a same-day `.context-cache.md`, otherwise invokes Context Loader.
2. **Context Loader** (`workflows/supporting/load-context.md`) — fetches Truemeds org context from a master Google Drive index. Always loads Cross-Cutting docs; filters vertical-specific docs (Hyperlocal Forward/Reverse, Courier Forward/Reverse, B2B Forward/Reverse) by matching a PRD's logistics systems against a canonical systems list. Builds and caches a context manifest.
3. **Routing** — based on inferred intent, hands off to one `workflows/core/*.md` skill: `create-prd`, `review-prd`, `design-experiment`, `review-experiment`, `map-objections`, `write-exec-brief`, `design-test-cases`, `gap-analysis-5pass`.
4. **Output** — saved to `archives/[type]/YYYY-MM-DD-[feature]-vN.md` (version auto-detected via `get-next-version.sh`), then pushed to GitHub.
5. **Self-learning loop** — `workflows/supporting/weekly-synthesis-routine.md` mines recent commits for corrections/new patterns and appends them to the matching `changelogs/[skill]_changelog.md`. This is how the skills improve over time; don't hand-edit changelogs except through this routine.

Do not skip Context Recall/Context Loader even for a task that looks self-contained — it's the mandatory entry point regardless of how the request is phrased.

## Architecture: knowledgebase vs. project state

Two distinct persistence layers — keep them separate:

- **`knowledge/`** (root, cross-project, shared across Claude/Codex/agents): `knowledge/context/` for reusable company/system/metric facts, `knowledge/decisions/` for dated durable decisions (`YYYY-MM-DD-short-name.md`), `knowledge/learnings/` for retrospectives/patterns. See `knowledge/README.md` for the extraction rules (mark `[UNVERIFIED]`, `[USER-PROVIDED]`, `[INFERRED]`; never invent facts).
- **`projects/[name]/docs/context/`** (project-scoped, not reusable): `project_truth.md` (locked, only user can modify), `session_handoff.md` (current resume state — continue from this unless the user gives newer instructions), `open_questions.md` (unresolved `[OPEN DECISION]` items).

Reusable company/system knowledge never belongs only in a project handoff file, and project resume state never belongs in `knowledge/`.

## Architecture: project scaffold pattern

Every workspace under `projects/[name]/` follows `templates/project-scaffold/CLAUDE.md`'s structure — read a project's own `CLAUDE.md` before touching its files. Common conventions across projects:

- **Priority order**: latest user instruction > `project_truth.md` (locked) > `session_handoff.md` (resume state) > `docs/roles/*.md` (role-specific rules, e.g. `frontend_engineer.md`, `product_manager.md`) > `open_questions.md`. Conflicts are surfaced, not silently blended.
- **Decision labels** used throughout project docs: `[LOCKED]`, `[RECOMMENDED]`, `[MOCK ASSUMPTION]`, `[OPEN DECISION]` — preserve this vocabulary when editing.
- Prototypes lean on `[MOCK ASSUMPTION]` for backend/data gaps rather than inventing product logic; ambiguous business-critical logic gets flagged to `open_questions.md`, not guessed.
- After any coding task in a project: update that project's `session_handoff.md` (status, files changed, validation done, gaps, next step) before reporting back — this is what the next session resumes from.

Example active projects: `projects/truemeds-doctor-portal-prototype/` (mobile-web prototype split across `index.html`, `app.js`, and `styles.css`), `projects/acom-ring-ai/` (PRD/spec-only, no code — source of truth is markdown, Confluence is generated from it, never sync to Confluence unless explicitly told).

## Memory updates

At the end of a meaningful task:
- update the active project's `docs/context/session_handoff.md`
- update `docs/context/open_questions.md` if a project decision remains unresolved
- update `knowledge/context/` if the session produced reusable company/system knowledge
- update `knowledge/decisions/` if the session produced a durable dated decision
- update `knowledge/learnings/` if the session produced a reusable retrospective or pattern

Do not modify `project_truth.md` unless the user explicitly locks new truth.

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

`code-review-graph` MCP server is installed and available. This repo is mostly markdown workflows, not a codebase — use the graph tools (`query_graph`, `semantic_search_nodes`, `detect_changes`, etc.) only when working inside a code-bearing subtree like `projects/truemeds-doctor-portal-prototype/`; otherwise Grep/Glob/Read are fine.
