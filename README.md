# PM Agent

GitHub-backed PM workflow system for Truemeds. Load org context from Google Drive → create PRDs → review → anticipate objections → push to GitHub. Automatically versioned.

## How to Use

**In Claude Code:**
1. Click **Code**
2. **File → Open Folder** → `~/pm-agent`
3. Paste one of the workflow prompts below (see [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md) for full examples)

Claude handles everything:
- Loads Truemeds org context from Google Drive (cached same-day)
- Creates the document
- Reviews it
- Saves to `archives/[type]/[date]-[feature]-v1.md`
- Pushes to GitHub

## Workflows

| Want to... | Ask Claude |
|---|---|
| Create a PRD | `Create a PRD for [feature]` |
| Review a PRD | `Review the PRD for [feature]` |
| Design an experiment | `Design an experiment for [hypothesis]` |
| Review an experiment | `Review the experiment for [feature]` |
| Map objections | `Map objections for [feature]` |
| Write an exec brief | `Write an exec brief for [feature]` |
| Design test cases | `Design test cases for [feature]` — provide a Google Drive PRD link |

All prompts route through `workflows/supporting/recall-and-route.md`.

## Where Files Go

```
archives/projects/     → PRDs
archives/experiments/  → Experiment designs
archives/objections/   → Objection maps (linked to PRD versions)
archives/briefs/       → Executive summaries
archives/test-cases/   → Functional test case suites
```

## Versioning

First run: `v1` · Revise: `v2` · Again: `v3`

Auto-detected. No manual work.

## How Context Loading Works

Before any workflow runs, Claude loads Truemeds-specific context from Google Drive via `workflows/supporting/load-context.md`:

1. Reads the master index to find vertical docs
2. Identifies which logistics systems the PRD touches
3. Loads only relevant docs (Cross-Cutting always loaded; vertical docs filtered by matched systems)
4. Caches context for the rest of the session (same-day)

## Self-Learning System

`workflows/supporting/weekly-synthesis-routine.md` (run via `scripts/run-synthesis.js`) analyzes recent git commits, extracts corrections and new patterns, and appends them to the relevant `changelogs/` file. The agent improves over time based on how you use it — no manual changelog edits needed.

## View on GitHub

https://github.com/apurvashetty-tm/pm-agent/tree/main/archives

---

See [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md) for copy-paste prompts and examples.
