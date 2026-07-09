# [FILL: Project Name] — Claude Rules

## What this project is
[FILL: 2–3 sentences. What is this build? Who is it for? Is it a prototype, a
polished demo, or production? What is the goal?]

It is not a throwaway demo, and it is not the production system unless stated.

---

## Read these files before making any decision
1. `docs/context/project_truth.md`
2. `docs/context/session_handoff.md`
3. `docs/roles/product_manager.md`
4. `docs/roles/frontend_engineer.md`
5. `docs/roles/uiux_designer.md`
6. `docs/roles/backend_engineer.md`
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
- Use mock data and fake backend behavior freely where real backend is not ready
- Do not rewrite existing working screens/modules unless explicitly asked
- Work one file or one small focused module at a time
- Before coding, continue from `docs/context/session_handoff.md` unless the user overrides it
- After coding, update `docs/context/session_handoff.md` before the final report
- Do not invent product logic if it is unclear
- If logic is missing, use a clearly marked `[MOCK ASSUMPTION]` and add it to `docs/context/open_questions.md`
- Respect the locked flow — do not add steps or CTAs that are not part of it
- [FILL: any project-specific format rule, e.g. "V1 is one index.html" or "component-based, Tailwind-first"]

---

## What requires explicit user confirmation before implementing
Do not silently decide or implement the following — ask first:
- [FILL: list the sensitive, ambiguous, or high-risk decisions unique to this
  project — e.g. money/pricing, identity/PII, permissions, state expiry,
  irreversible actions, attribution ownership]

If one of these surfaces and no clear answer exists, mark it `[OPEN DECISION]`, use a safe placeholder, and add it to `docs/context/open_questions.md`.

---

## Never silently invent final truth for
[FILL: the business-critical areas this project must never fake — e.g. pricing,
offers, stock, payment outcome, order finality, customer identity/privacy,
permissions.]

---

## Decision labeling rule
- `[LOCKED]` — already decided, must be followed exactly
- `[RECOMMENDED]` — best current suggestion, open to override
- `[MOCK ASSUMPTION]` — temporary build unblocker, not final truth
- `[OPEN DECISION]` — requires user confirmation before implementing

---

## Reporting rule after every coding task
After each coding task, output a short structured report:
1. **Files changed** — every file modified or created
2. **What changed** — plain English summary
3. **What was intentionally not changed** — what was left alone and why
4. **Assumptions made** — any `[MOCK ASSUMPTION]` used, clearly labeled
5. **Still mocked / placeholder** — what is fake and needs real data or logic later
6. **Manual test plan** — 3 short steps: what to do, what to expect, edge case to check

This report must be short and easy for a non-coder to read.

Before this report, update `docs/context/session_handoff.md` with the current
status, files changed, validation done, known gaps, and next exact step.

---

## Final principle
Build like a real product shell, not a static wireframe.
Preserve the locked flow. Move fast where it is safe.
Stop and ask where the decision belongs to the user.
