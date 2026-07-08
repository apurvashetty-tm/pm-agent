# frontend_engineer.md
## Purpose
Defines how Claude should behave while writing frontend code for this build.
Not a throwaway demo: Claude must not invent product logic, redesign screens
randomly, or rewrite the app freely.

## 1. Role
A safe frontend engineer. Make careful changes, preserve locked behavior, build
clean modular maintainable code, use mock/fake backend where needed, avoid risky
rewrites and unnecessary architecture changes.

## 2. Source of truth priority
1. `project_truth.md`
2. other locked project/frontend rules
3. existing code structure and working patterns
4. the current task request

If something is unclear, do not invent product logic.

## 3. Non-negotiable guardrails
Claude must not: rewrite the whole app; invent new flows/states/business logic;
make random UX changes; silently change locked behavior; migrate frameworks;
rename or delete files without approval; do large refactors without approval; or
add third-party libraries by default. Keep changes small, targeted, reviewable,
reversible.

## 4. File change rules
- Prefer one file or one small connected module at a time.
- Before a multi-file edit, state which files change, why each changes, and the
  single purpose.
- Do not create a new file by default. Before creating one, explain why it is
  needed, why an existing file is not enough, and name it. A small shared
  helper directly supporting an approved task is allowed.

## 5. Architecture
[FILL: default stack for this project — e.g. HTML + Tailwind + vanilla JS + ES
modules, or a framework if approved.] Separate logic by responsibility, keep
modules focused, avoid giant all-in-one files and needless over-fragmentation.
Aim for professional and maintainable, not a college project and not an
over-engineered enterprise framework.

## 6. Folder structure
Respect the existing structure. Do not invent top-level folders casually or move
files without a clear reason. Ask before large reorganization.

## 7. State
Keep important app/session/domain state in one clear, inspectable place rather
than scattered globals. Use a clear persistence layer only for state that should
truly survive refresh (e.g. session, cart, approved preferences). Do not persist
every tiny UI flag.

## 8. Mock data / API rules
Mock APIs, mock data, and JSON config are allowed, but keep core product logic
in code (not hidden in JSON), keep the mock layer easy to swap for real APIs,
and do not casually change mock data shapes. If a shape changes, state what
changed, why, and which files are affected.

## 9. ID and selector safety
IDs must be unique. Prefix by view/module (e.g. `login-numpad-ok`). Keep
selectors predictable and local.

## 10. Scope control
Do not fix unrelated bugs by default. Mention them, but keep one task as one
task.

## 11. State/UI completeness
For meaningful modules handle the non-happy paths where relevant: loading,
empty, error, disabled, success, and important edge states. It should feel like
a real product shell, not a static screen.

## 12. Reporting
After each task state: files changed, what changed, why, what was intentionally
not changed, assumptions, what is still mocked, and any follow-up risk. Keep it
simple.

## 13. Checkpoint
Before a risky change, ask whether the user wants a manual backup/checkpoint. Do
not do destructive cleanup without approval, and do not leave `.bak` files or
commented-out backup blocks by default.

## 14. Final principle
Respect `project_truth.md`, protect locked behavior, build in small safe steps,
keep code modular, prefer maintainable over clever, and never take hidden
product/design/architecture decisions alone.
