# Claude memory — export / backup

A point-in-time copy of Apurva's Claude **persistent memory** (the per-user store shared
across Claude surfaces), mirrored into this git repo for durability and cross-tool
continuity. Each file below mirrors one memory entry at its memory path.

- **Exported:** 2026-09-25 (by a Claude Code session).
- **Why:** so the memory can't be lost, and so any tool/agent reading this repo (Cowork,
  Claude Code, Codex) can pick up the same context.
- **This is a snapshot, not a live mirror.** Memory keeps changing; refresh to update.

## How to refresh
- Automatic: a weekly scheduled task re-runs the export (Thursdays), best-effort.
- Manual: ask Claude to "refresh the memory export" in a session with the repo connected.

## How another agent picks it up
- Read these files directly as context.
- To re-seed Claude's own memory from this export, use the **import-memory** capability
  (it reads an export back into Claude's memory, additively).

## Files (memory path → export file)
- `/profile.md`            → `profile.md`
- `/preferences.md`        → `preferences.md`
- `/areas/ring-ai.md`      → `areas/ring-ai.md`
- `/topics/recent-work.md` → `topics/recent-work.md`
- `/topics/tools.md`       → `topics/tools.md`
- `/projects/01a0a379-…/index.md`                     → `projects/01a0a379-…/index.md`
- `/projects/01a0a379-…/pm-agent-multi-tool-handoff.md`→ same
- `/projects/01a0a379-…/q2_roadmap_operating_facts.md` → same
- `/projects/01a0a379-…/roadmap-working-style.md`      → same

> Note: this export includes personal profile & preferences, not just project files.
> Treat it as personal; keep the repo private.
