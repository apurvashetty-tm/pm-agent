# Phase 5 Blind Pass 1 - Launch Guide

**Status:** PREPARED PROMPTS - NOT LAUNCHED
**Provider source SHA:** `bca3838f5b74db0bf50957ce1e19abc4547fa4b7`
**Scope proposed for release:** Pages 1-11. Page 12 excluded.

## Recommended operating model

Run both providers from Terminal, concurrently, in existing isolated worktrees. Use desktop app or Markdown preview for human review after both Pass 1 runs finish.

Why:

- Terminal gives exact model, effort, source SHA, permissions, prompt, and output paths.
- Separate worktrees preserve blind independence and prevent file collisions.
- One coherent writer per provider reads canonical context once and drafts all 11 pages. This costs less and produces stronger deck voice than one agent per page.
- Desktop is better for reading and comparing outputs, but weaker as run record.

Do not launch until user explicitly approves Phase 5 Pass 1 release.

## Quality-first model choice

| Provider | Recommended model | Effort | Reason |
|---|---|---|---|
| Codex | `gpt-5.6-sol` | `high` | High-value, open-ended document work needing judgment and polish. |
| Claude Code | `claude-opus-4-8` | `high` | Accuracy-first Opus choice for complex knowledge work; `high` retains depth without paying the full `xhigh` token cost. |

Do not use current local Codex default (`gpt-5.6-terra`, low effort) for Pass 1. Reserve highest/max effort for final synthesis only if cross-review exposes hard unresolved trade-offs.

Optional model tiers:

- Maximum-quality Claude rerun or final synthesis: `claude-fable-5` / `high`; materially slower and more expensive, so do not spend it on both blind drafts by default.
- Faster/lower-cost critique after Pass 1: `claude-sonnet-5` / `high` or `gpt-5.6-terra` / `medium`; use for structured review, not as the primary independent writer when quality is weighted highest.

## Terminal 1 - Codex

```bash
cd /Users/mac/src/pm-agent-worktrees/jas-q2-codex-pass1

codex -a never exec \
  --model gpt-5.6-sol \
  -c 'model_reasoning_effort="high"' \
  --sandbox workspace-write \
  --ignore-user-config \
  --strict-config \
  -C /Users/mac/src/pm-agent-worktrees/jas-q2-codex-pass1 \
  - < /Users/mac/src/pm-agent/projects/Roadmap/Q2_JAS_Stakeholder_Roadmap/working/phase5_prompts/codex_pass1.md
```

## Terminal 2 - Claude Code

```bash
cd /Users/mac/src/pm-agent-worktrees/jas-q2-claude-pass1

claude --print \
  --safe-mode \
  --model claude-opus-4-8 \
  --effort high \
  --permission-mode acceptEdits \
  --allowedTools "Read,Glob,Grep,Write,Edit,Bash(git rev-parse *),Bash(git status *),Bash(git diff *),Bash(mkdir -p *)" \
  --output-format text \
  < /Users/mac/src/pm-agent/projects/Roadmap/Q2_JAS_Stakeholder_Roadmap/working/phase5_prompts/claude_pass1.md
```

Run commands in separate Terminal windows. Do not background them on first run; visible progress and interruption are easier.

## Expected outputs

Codex:

```text
runs/jas-q2-20260714-blind-v1/codex/pass1/pages/page_01.md ... page_11.md
runs/jas-q2-20260714-blind-v1/codex/proposals/structure.md
runs/jas-q2-20260714-blind-v1/codex/pass1/run_report.md
```

Claude:

```text
runs/jas-q2-20260714-blind-v1/claude/pass1/pages/page_01.md ... page_11.md
runs/jas-q2-20260714-blind-v1/claude/proposals/structure.md
runs/jas-q2-20260714-blind-v1/claude/pass1/run_report.md
```

## Review rule

Do not let either provider read peer output until both Pass 1 runs finish. Coordinator then validates allowed paths and commits each provider output on its isolated branch. After collection, build page-by-page comparison index and review in desktop app or Markdown preview.

Before cross-review opens, coordinator must:

1. Verify exactly 11 page files plus one structure proposal and one run report per provider.
2. Verify every changed path sits inside that provider's reserved output root.
3. Commit each provider output on its isolated branch.
4. Record provider result SHA and prompt SHA-256 in run manifest.
5. Keep peer visibility closed until both commits exist.

If one run fails partially, do not show partial output to peer. Resume recorded session or retry under new provider-specific run ID; never silently switch model.

## Token controls

- One run per provider; no Pass 1 subagents.
- Canonical files read once per provider.
- Page packets route evidence; raw files opened only when verification requires it.
- No web research.
- `high` effort for both; no max/ultra/xhigh in Pass 1.
- Codex ignores user config; Claude safe mode disables unrelated CLAUDE.md, plugins, hooks, MCP, skills, and memory. Canonical contract comes from supplied prompts and repository files.
- No hard Claude dollar cap yet: authentication/billing mode is unknown, and mid-run cutoff could waste a nearly complete draft.
