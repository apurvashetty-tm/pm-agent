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

## Truemeds domain questions — mandatory routing (tm-chotu)

**Trigger — check this before answering, not after:** the question touches Truemeds
business, product, ops, data, or systems — definitions/acronyms, order lifecycle,
substitution, DB/table names, a metric (GMV, FTC, ROAS, AOV, TS, etc.), customer
cohorts, inventory/stock, TAT/SLA, org/team ownership, or any Truemeds-specific term
you are not 100% certain of. This applies in every tool, not just Claude Code — there
is no auto-loading hook here; you only get this knowledge by actually reading the
files below.

On trigger, before answering:

1. Read `knowledge/context/tm-chotu-integration.md` (read order + truth-handling rules).
2. Read `knowledge/context/tm-chotu/skills/using-tm-chotu/SKILL.md` (entry point).
3. Load **only** the matching domain skill(s) below — not all of them.

| Question is about... | Read this file |
|---|---|
| Company overview, GMV/MAU/AOV, business model | `knowledge/context/tm-chotu/skills/tm-chotu-overview/SKILL.md` |
| Who owns X / which team handles Y | `knowledge/context/tm-chotu/skills/tm-chotu-functions/SKILL.md` |
| Customers, FTC, Gold/Silver/Bronze, retention, DCOE cohorts | `knowledge/context/tm-chotu/skills/tm-chotu-customer/SKILL.md` |
| CM-high / generic champions / coupon-dependent / `cm_net` / reproduce a DCOE cohort on Metabase | `knowledge/context/tm-chotu/skills/tm-chotu-dcoe-cohorts/SKILL.md` |
| Order lifecycle, RTO chain, Rx review, substitution path (the flow, not the algo) | `knowledge/context/tm-chotu/skills/tm-chotu-business-flows/SKILL.md` |
| How a module/engine works — substitution algo, search, WH assignment, picklist, putaway, logistics, fraud, portals | `knowledge/context/tm-chotu/skills/tm-chotu-modules/SKILL.md` |
| Inventory, stock, OOS, JIT vs inventory, backorder, cold chain, MFC vs FC stock | `knowledge/context/tm-chotu/skills/tm-chotu-inventory/SKILL.md` |
| TAT, SLA, OTIF, PDD, courier/Doctor/Pharmacist/Putaway/RTO TAT, any X→Y delay | `knowledge/context/tm-chotu/skills/tm-chotu-tat/SKILL.md` |
| Which DB has X / where data lives | `knowledge/context/tm-chotu/skills/tm-chotu-data-sources/SKILL.md` |
| Enum/status code lookup ("status 55", "61 vs 62"), table schema | `knowledge/context/tm-chotu/skills/tm-chotu-tables-enums/SKILL.md` |
| SQL recipe, "how do I join X to Y" | `knowledge/context/tm-chotu/skills/tm-chotu-joins/SKILL.md` |
| "What does X mean", define a term, FTC vs FOP, ROAS vs CAC | `knowledge/context/tm-chotu/skills/tm-chotu-definitions/SKILL.md` |
| Named project (DCOE, TMEXP1/3/4, tm-po-analytics, search-validator, tm-fraud-engine) | `knowledge/context/tm-chotu/skills/tm-chotu-projects/SKILL.md` |
| Any number/metric/count/date/% being pulled or estimated | **Also** read `knowledge/context/tm-chotu/skills/tm-chotu-query-rigor/SKILL.md` + `METRIC_CATALOG.md` before answering |

Hard rules — these replace what the Claude Code plugin's hook would otherwise enforce
automatically, so apply them manually here:

- Never state a metric without citing source table + DB + time window.
- Never accept "all time / since launch / lifetime / ever" as a query window — cap at
  3 months by default; only widen if the user pushes after you flag it.
- `customer_order_rank` and `cx_lifetime_metrics.chronic_flag` are known-broken —
  don't use them; use the on-the-fly derivations noted in the relevant skill file.
- Treat `KNOWLEDGE_DUMP.md` as dated reference, not live truth, for anything you'd
  otherwise use a domain-skill file for.
- If nothing loaded covers the question, say so explicitly rather than guessing, and
  draft a gap note at `knowledge/context/tm-chotu/SKILL_REQUESTS/<date>_<topic>.md`.

## Knowledgebase

- `context/Claude.md` holds short global Truemeds/team context.
- `knowledge/context/` holds reusable company, system, metric, glossary, and
  user-role knowledge.
- `knowledge/context/tm-chotu/` holds the preserved tm-chotu package — see the
  mandatory routing section above for how/when to read it.
- `knowledge/decisions/` holds durable dated decisions.
- `knowledge/learnings/` holds retrospectives, patterns, and reusable learnings.
- Do not bury reusable company/system knowledge only inside a project handoff.
- Do not move project-specific resume state into `knowledge/`; keep it in the
  active project's `docs/context/session_handoff.md`.

## Definition of done — all work (PRDs, docs, prototypes, screens, analyses)

Apurva's standing rule (2026-10-15). Never discover the standard while reviewing.
**Draft refinement pending:** the checklist applies in full when finishing, not while exploring ideas — see the draft "Explore → Shape → Finish" notes in `knowledge/learnings/2026-10-15-define-done-before-work.md`.

1. **Before the work:** write what "done" means as a pass/fail checklist, built from
   the rules, templates and decisions that apply. Every line is checkable; mark it
   "auto" (a script checks it) or "eye" (a reviewer checks it). Include the approved
   exceptions. Get Apurva's OK on the checklist before building. Template:
   `templates/definition-of-done.md`.
2. **Missing foundations first:** if the work needs a rule, component, template or
   decision that doesn't exist, add it in its central place first (design system,
   PRD guide, knowledge), never improvised inside one piece of work.
3. **Decisions before building:** record agreed decisions in the project's decision
   log / project files, then build or prompt. Never the other way round.
4. **Review against the checklist, not taste.** Claude, Codex and any reviewer get the
   checklist. Reviewer feedback is vetted: adopt what's valid, log what's out of scope,
   flag doubts. Keep an evidence record (item × checklist line × pass/fail).
5. **Fix shared things first,** then individual items; compare with the last approved
   version so a fix can't silently break approved work.
6. **Finish line:** done = every checklist line passes, reviewers report no blockers,
   Apurva approves. After that the work is **frozen**: anything new is either a **bug**
   (fixed only where it occurs) or a **next-version idea** (logged, not applied).
   New ideas never reopen finished work.

## Writing or editing a PRD

- Any PRD work (a new PRD, an edit, or a review round on an existing one) follows
  `templates/lean-prd-guide.md`. Read it before drafting or editing.
- The heavier `workflows/core/create-prd.md` flow runs only when explicitly asked.
  Even then, apply the guide's rules on voice, plain words, saying things once,
  review edits and versions, and AI tells.

## Building any UI (design system)

Every frontend project — prototypes, portals, internal tools, mockups — uses the
central Truemeds design system in `design-system/` (a code copy of SALT, the
Truemeds Figma library).

- Before writing or changing any UI, read `design-system/RULES.md`.
- Link `design-system/truemeds.css` and `design-system/icons/icons.js`; never
  copy values out of them, never add hex codes, fonts, or icon sets in a project.
- Missing a component? Add it to `design-system/src/components.css` marked
  `[PROPOSED]` and rebuild — don't invent it inside the project.
- Run the design review checklist (`RULES.md` §5) before calling UI work done.

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
- Before merging into `main` or changing anything that deploys, read `docs/TEAM_GIT_WORKFLOW.md` → **Deployments** (pushes to `main` go live).
- Record exceptions — deployment/hosting changes, repository-setting changes, known merge traps — in `docs/TEAM_GIT_WORKFLOW.md` → **Operations log** (date · who and which tool/AI · what · why · follow-up). Normal commits need no log entry; git history is the log.
- **One `main`, projects in folders** (2026-10-16, Apurva — replaces project branches). Every project lives in its own folder under `projects/` on `main`; there are no long-lived project branches. The attached pm-agent folder stays on `main` — never switch branches in it (other threads share it).
  - **Publish with `scripts/publish.sh -m "message" <paths…>`** from the pm-agent folder: it checks the folder is on `main`, refuses if someone else's files are staged or a `.lock` file exists, brings `main` up to date, commits only the named paths, and pushes to GitHub `main`. Name your files explicitly — never `git add -A` / `git add .`.
  - **Commit check:** `scripts/git-hooks/pre-commit` (enabled in Apurva's checkout via `core.hooksPath`) refuses any commit touching more than one project folder. Shared folders (`design-system/`, `knowledge/`, `docs/`, root files) may go with one project's commit.
  - **Swapnil's projects** (Type 1 revamp → `project/type1-revamp`, Project South → `project/project-south`) follow his own flow: his branches, merged to `main` by his pull requests (`CONTRIBUTING.md`, each project's `CONTINUITY.md`). Never commit to, merge, rebase or delete his branches.
  - Apurva's own checkout publishes straight to `main` (owner). Collaborators (e.g. Swapnil) use short-lived branches and pull requests (`CONTRIBUTING.md`). Use `--pr` when Apurva wants a change reviewed before it reaches `main`.
  - `main` changes to a deployed prototype go live (see `docs/TEAM_GIT_WORKFLOW.md` → Deployments). Build big rewrites (e.g. the doctor-portal rebuild) in a new folder and switch the live files only when Apurva approves.
  - If git leaves a `.lock` file, stop and tell Apurva; don't work around it.
  - Old branches are backed up as tags `backup/2026-10-16/*` and `backup/pre-trunk/*`. `price-lock-proto` stays only as the Price Lock site's deploy source until that site is re-linked to `main`; don't work on it.
- **Working in parallel** (2026-10-16, Apurva): several threads / AIs on one project at once is normal. The handoff and decision log pass context *over time*; they do not coordinate threads running *at the same time*, so:
  - **Read:** any number of threads, any time.
  - **Write:** one thread per file or area at a time (e.g. one thread owns the calling screens, another the docs rewrite — different files, so they can run together). Before editing a file another thread may be working on, re-read it from disk immediately before writing; never save a version built from an earlier read.
  - **Shared records** — decision log, session handoff, `project_truth.md`, open questions — are written only by the project's **main thread**. Other threads (terminal, Codex, side threads) report back; the main thread records. New decision numbers are taken only by the main thread, at the moment of writing.
  - **Commit only your own files,** named explicitly. Never commit everything that changed; if `git status` shows changes you didn't make, leave them alone and mention them.

## Pushing to GitHub (credentials)

- This checkout uses `https://github.com/apurvashetty-tm/pm-agent.git` with a repository-local credential helper. In Cowork, attach the pm-agent folder and run git through `device_bash` at its mounted path. The GitHub connector and Computer Use Terminal are not needed.
- The helper finds its credential file through the repository's shared git directory (`--git-common-dir`), so it works from the main folder and from temporary worktrees alike (fixed 2026-10-16).
- Never embed a token in a remote URL, commit credentials, print credential files, run `git credential fill`, or enable credential tracing.
- Normal publishing: `scripts/publish.sh` (see Git safety). Never force-push.
- Diagnose network, filesystem, authentication and branch-protection failures separately; a failed push doesn't always mean an expired token.
