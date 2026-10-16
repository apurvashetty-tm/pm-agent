<!-- memory path: /projects/01a0a379-0b9f-76d7-aeb2-fb21995abd69/pm-agent-multi-tool-handoff.md · last updated in memory: 2026-09-15 -->
---
name: pm-agent-multi-tool-handoff
description: "Apurva works across multiple AI tools (Cowork, Claude Code, Codex) on the same pm-agent projects and relies on a proven file-based scaffold for continuity, not chat history"
metadata: 
  node_type: memory
  type: user
  originSessionId: f01cf15a-c205-4194-ba93-5faa25d2daaa
sources: [cowork-import]
imported_at: 2026-09-15T05:10:16Z
---

Apurva runs a personal PM workspace at `~/pm-agent` (git repo, pushed to GitHub) with a proven multi-project scaffold: each project under `projects/<name>/` gets its own `CLAUDE.md`, `docs/context/project_truth.md` (locked facts), `docs/context/session_handoff.md` (living resume point), `docs/context/open_questions.md` (running unresolved-decisions register), and `docs/roles/*.md` (role-specific working rules). The master template lives at `templates/project-scaffold/`.

**Why this matters:** Apurva explicitly optimizes for "having Claude and Codex working on the same document with proper handoffs and continue from where each one of you left off" — the goal is that project-local files, not chat history, are the source of truth across tools and sessions. This was stated directly on 2026-07-11 after Apurva pushed back on a chat-only roadmap discussion feeling directionless ("the excel sheet looks like some random sheet... did you even understand what I need").

**How to apply:** For any new or ongoing pm-agent project, check whether the scaffold exists before assuming chat context is enough. If it's missing, offer to stamp it in from `templates/project-scaffold/`. When editing project docs, follow the pattern already established: `project_truth.md` only changes with explicit user lock, `session_handoff.md` gets updated at the end of every meaningful session with current status + next exact step, `open_questions.md` is additive (never silently resolve an open question). Don't rewrite existing narrative docs in place — add a pointer/banner instead, so nothing is silently lost across tools. See [[q2-roadmap-operating-facts]] for the Roadmap project's specific scaffold instance.

Root-level files that govern all projects: `~/pm-agent/AGENTS.md` (canonical protocol, priority order: latest instruction > active project's project_truth.md > project's CLAUDE.md > AGENTS.md > reusable knowledge), `~/pm-agent/context/Claude.md` (global org context — team structure, verticals), `~/pm-agent/knowledge/` (context/decisions/learnings, reusable across projects, not project-specific).
