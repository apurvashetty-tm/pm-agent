# Project Scaffold

A reusable starter kit for any new build project under `pm-agent/projects/`.

It packages the working system proven on IRIS and the Truemeds Doctor Portal:
a locked product truth, role-based working rules, an open-questions register,
a session handoff file, a priority order, and a mandatory post-task reporting
protocol.

## Why this exists

Every new project used to rebuild these rules by hand (copy-paste-and-tweak).
This scaffold is the blank master copy. Stamp it once per project, fill the
blanks, and Claude behaves consistently and safely from day one.

## How to use it

1. Copy this whole folder into your new project:
   `cp -R templates/project-scaffold projects/<your-project-name>`
2. Open the new project folder and fill every `[FILL: ...]` placeholder:
   - `CLAUDE.md` — what this project is, and the confirm-first list
   - `docs/context/project_truth.md` — the locked product truth (the constitution)
   - `docs/context/session_handoff.md` — the current resume point
3. The role files in `docs/roles/` are product-agnostic and usually work as-is.
   Rename `backend_engineer.md` to `mock_backend_engineer.md` if the project is
   mock-backend only, and adjust wording if needed.
4. Leave `docs/context/open_questions.md` empty — it fills up as you build.
5. Tell Claude to read the files listed in `CLAUDE.md` before it starts.

## What's inside

```
project-scaffold/
├── CLAUDE.md                        ← priority order, guardrails, reporting protocol
└── docs/
    ├── context/
    │   ├── project_truth.md         ← the locked constitution (fill this)
    │   ├── session_handoff.md       ← exact current resume point
    │   └── open_questions.md        ← unresolved decisions register (starts empty)
    └── roles/
        ├── product_manager.md       ← how Claude makes product decisions
        ├── frontend_engineer.md     ← how Claude writes frontend code
        ├── uiux_designer.md         ← how Claude designs/edits UI
        └── backend_engineer.md      ← how Claude handles backend / mock data
```

## The one rule that makes it work

If two sources conflict, follow the higher-priority source and **surface the
conflict** — never silently blend them.

## Handoff rule

Before coding, read `docs/context/session_handoff.md` and continue from its
`Next exact step` unless the user says otherwise. After coding, update the same
file before the final report so the next engineer can resume without chat
history.
