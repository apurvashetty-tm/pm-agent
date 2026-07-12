# Truemeds Doctor Portal Prototype — Claude Rules

## What this project is

This is a **mobile-web prototype** for the Truemeds Doctor Portal revamp.

It is not a throwaway demo. It is not the production system.
It is a clean prototype lane where the goal is a polished, working, believable demo of the doctor consultation workflow — built fast, mobile-first, and grounded in real product truth.

---

## Workspace memory

Before project-specific work, also read:
- `../../AGENTS.md`
- `../../context/Claude.md`
- relevant files in `../../knowledge/context/`

Use project-local files for project truth and handoff. Use root knowledge files only for reusable company/system context.

---

## Read these files before making any decision

1. `docs/context/project_truth.md`
2. `docs/context/session_handoff.md`
3. `docs/roles/product_manager.md`
4. `docs/roles/frontend_engineer.md`
5. `docs/roles/uiux_designer.md`
6. `docs/roles/mock_backend_engineer.md`
7. `docs/context/open_questions.md`

---

## Priority order

1. **Latest user instruction** — always wins
2. **`docs/context/project_truth.md`** — locked product truth, cannot be invented around
3. **`docs/context/session_handoff.md`** — current resume point and latest implementation state
4. **`docs/roles/*`** — role-specific working rules
5. **`docs/context/open_questions.md`** — unresolved decisions that must not be silently answered
6. **`[MOCK ASSUMPTION]`** — temporary build unblockers, small and local only, clearly labeled

If two sources conflict, follow the higher-priority source and surface the conflict rather than silently blending.

---

## Core rules

- This is a consultation-workflow tool for doctors, not a generic portal or e-commerce system
- Use mock data and fake backend behavior freely where real backend is not ready
- Do not rewrite existing working screens unless explicitly asked
- Work one file or one small focused module at a time
- Before coding, continue from `docs/context/session_handoff.md` unless the user overrides it
- After coding, update `docs/context/session_handoff.md` before the final report
- Do not invent product logic if it is unclear
- If logic is missing, use a clearly marked `[MOCK ASSUMPTION]` and add it to `docs/context/open_questions.md`
- Respect the locked consultation flow — do not add CTAs or steps that are not part of the locked workflow
- **[UPDATED 2026-07-13, `[USER-PROVIDED]`]** V1 is now three files: `index.html` (structure), `styles.css` (all cosmetics), `app.js` (all logic) — split from the original single-file rule at explicit user request, to fix CTA-styling drift across a single large file. Do not split further (e.g. per-component files) unless explicitly asked. All cosmetic changes belong in `styles.css` through the shared `.btn` button system — see `docs/design_system.md` before adding any new CTA.

---

## What requires explicit user confirmation before implementing

Do not silently decide or implement the following — ask first:

- **Valid call threshold** — the 50-second minimum is locked, but exact timer behavior (pause, resume, reconnect) is open
- **Case type routing logic** — which fields determine Cat4 vs Pilot, and where these come from
- **HA skip eligibility** — what field or condition marks an order as HA-skipped
- **Transfer vs Forward distinction** — what exact operational difference these have downstream
- **No-pickup handling** — how many attempts before hold, what hold duration means
- **Doctor assignment rules** — how a case arrives in a doctor's queue and how re-assignment works
- **Medicine review authority** — can a doctor add, remove, or only validate medicines?
- **Notes behavior** — are notes visible to other teams? Are they locked after call completion?

If one of these surfaces during build and no clear answer exists, mark it `[OPEN DECISION]`, use a safe placeholder, and add it to `docs/context/open_questions.md`.

---

## Prototype optimization principle

This prototype optimizes for **visible demo speed** of the consultation workflow.

That means:
- build the doctor screen fast, mobile-first, with real-looking mock data
- use `[MOCK ASSUMPTION]` freely for non-critical gaps
- prefer a working believable demo state over theoretically complete but invisible UI
- one `index.html` with embedded CSS and JS is the right V1 format

That does **not** mean:
- invent case-type routing logic
- fake the valid-call gate carelessly
- override `project_truth.md` for convenience

---

## Decision labeling rule

Use these labels consistently:

- `[LOCKED]` — already decided, must be followed exactly
- `[RECOMMENDED]` — best current suggestion, open to override
- `[MOCK ASSUMPTION]` — temporary build unblocker, not final truth
- `[OPEN DECISION]` — requires user confirmation before implementing

---

## Reporting rule after every coding task

After each coding task, Claude must output a short structured report:

1. **Files changed** — list every file that was modified or created
2. **What changed** — plain English summary
3. **What was intentionally not changed** — what was left alone and why
4. **Assumptions made** — any `[MOCK ASSUMPTION]` used, clearly labeled
5. **Still mocked / placeholder** — what is fake and needs real data or logic later
6. **Manual test plan** — 3 short steps: what to do, what to expect, any edge case to check

This report must be short and easy for a non-coder to read.

Before this report, update `docs/context/session_handoff.md` with the current status, files changed, validation done, known gaps, and next exact step.

---

## Final principle

Build like a real product shell, not a static wireframe.
Preserve the locked consultation workflow and locked valid-call gate.
Move fast where it is safe to move fast.
Stop and ask where the decision belongs to the user.
