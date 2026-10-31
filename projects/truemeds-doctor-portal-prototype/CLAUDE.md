# Truemeds Doctor Portal Prototype — Claude Rules

> **Git:** this project lives on branch `project/truemeds-doctor-portal-prototype`, in the folder `pm-agent/.work/truemeds-doctor-portal-prototype` (open it with `scripts/start-project.sh truemeds-doctor-portal-prototype`). Work and publish only there (`scripts/publish.sh -m "..." <files>`); changes reach `main` through a pull request Apurva merges. The main pm-agent folder is read-only. Rules: repo `AGENTS.md` → Git safety.

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

## Design system — central, not local  [UPDATED 2026-10-07]

The visual system for this prototype is now the central Truemeds design system:
`../../design-system/` (code copy of SALT, the Truemeds Figma library).
- Read `../../design-system/RULES.md` before any UI work.
- `docs/_superseded/docs-2026-08/design_system.md` is **superseded** — kept only as history. Its colours
  (`#1B69DE`, system font, `#111827` text) and its emoji/illustration icons do not
  match Truemeds and must not be extended.
- The restyle onto `truemeds.css` + `icons.js` is **done** (branch `doctor-portal-restyle`);
  the locked flow, valid-call gate and CTA routing are unchanged. Use only `--tm-*` semantic
  tokens and `.tm-*` components; do not reintroduce local tokens, emoji or hex colours
  (the mock Rx paper is the only exempt block).

---

## Feedback and render contract — D-41

Before any auth/Home UI or render work, read `docs/feedback-rules.md` and `docs/feedback-state-map.md`. They define shared feedback, copy ownership, state coverage and acceptance gates. Do not style error states individually. Before generating an image, create the batch README from `docs/renders/RENDER-README-TEMPLATE.md`. Capture representative layouts and boundary conditions, not every copy variant. Every state still requires source/behavior coverage. Approval and promotion remain explicit.

**Layout v2 — D-42 to D-45.** Read `design-system/RULES.md` §8 (type scale, spacing, button placement, header types) before any screen work. Logo only on home-base screens (sign-in, Home). OTP v2 and the faster sign-in offer screen are defined in D-44 and D-45.

## Current state (2026-10-31) — read first
- **Screens and app logic are approved and frozen (D-78):** `ui-screens/` (README there is the index; 144 states at 360 and 390, incl. the calling states and `prescribe/`) and `ui-screens/app-logic.md`. Decisions up to D-77. Anything new is a bug (fix where it occurs) or a next-version idea (backlog §4b).
- **Start here:** `docs/context/session_handoff.md` (latest entry) and `docs/context/backlog.md`.
- **Next (D-72):** (1) logic review of the calling flow against `app-logic.md` (Apurva's list of misses from her walkthrough) — before building; (2) prototype rebuild in its own folder from the frozen screens — build plan and rebuild checklist drafted in `docs/proposals/` and `docs/reviews/`, awaiting approval; (3) token inspector; (4) PRD. Do not extend `index.html` / `app.js`.
- **Checks:** `ui-screens/feedback/check-locked-specs.py`, `check-sources.mjs`, `docs/layout_check.py`, `brand/check_lockup.py` — all 0 failures over all 144 states. Rebuild review aids with `ui-screens/_qa/` (`build-review.py`, `build-contact-sheets.py`, `build-storyboard.py`).
- **Sub-sessions (terminal, Codex) never write to the decision log or record approvals in Apurva's name;** they report under NEEDS-APURVA and Claude records decisions after she agrees.
- **Audit rule:** before calling screens done, check every decision against every screen it touches at full size (360 and 390), not on contact sheets.

## Layout v2 decisions — D-42 to D-56 (2026-10-14/15)

Read `design-system/RULES.md` §8 (incl. locked specs L1–L9) and **§9 (components and states: button roles, 48px targets, chips, sheet template, toast, states checklist)**, and decision log D-42–D-52, before any screen work. Doctor-portal specifics of the design system are in D-52. Key points: logo on every screen except the case page and task overlays (D-61, replaces D-42's rule); page margin 16 (D-67); task headers in hero or compact size, Back only where there is a previous screen; case page exits by stage (D-48); compact tinted case header (D-49). **Wording: "case", never "order", for the doctor's unit of work**; the customer order ID line stays. Final CTA labels and tracking: D-50 ("Confirm prescription", "Confirm & transfer", "Confirm & forward", "Skip HA call").

## Approved UI references

`ui-screens/` holds only Apurva-approved screen states for implementation handoff. Read `ui-screens/README.md` before building an approved screen. Do not promote concepts or historical renders from `docs/renders/` into it without explicit approval.

## Read these files before making any decision

1. `docs/context/project_truth.md`
2. `docs/context/session_handoff.md`
3. `docs/context/decision_log.md` — why each screen decision was made (and what was rejected); do not re-open without new information
4. `ui-screens/README.md` and `ui-screens/app-logic.md` — the approved screens and the app's rules
5. `docs/feedback-state-map.md` — every error / offline / busy state
6. `docs/context/open_questions.md`

(The old role files are archived — see `docs/roles/README.md`.)

---

## Priority order

1. **Latest user instruction** — always wins
2. **`docs/context/project_truth.md`** — what we're building and the current rules (Apurva changes them, via the decision log)
3. **`docs/context/session_handoff.md`** — current resume point and latest implementation state
3a. **`docs/context/decision_log.md`** — agreed design/product decisions with their reasons
4. **`ui-screens/app-logic.md`** (once approved) and **`ui-screens/`** — the app's rules and approved screens
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
- When a design/product decision is agreed with Apurva, record it in `docs/context/decision_log.md` (decision, why,
  rejected options). When one changes, edit its entry — don't leave the old guidance standing
- Do not invent product logic if it is unclear
- If logic is missing, use a clearly marked `[MOCK ASSUMPTION]` and add it to `docs/context/open_questions.md`
- Respect the locked consultation flow — do not add CTAs or steps that are not part of the locked workflow
- **[UPDATED 2026-10-16, D-56]** The prototype is being **rebuilt from scratch**. The old `index.html` / `styles.css` / `app.js` are frozen as reference only (the live Netlify demo still serves them) — do not extend or fix them. The new build's file layout is set by the rebuild checklist; it uses only central design-system components and takes all text from `ui-screens/feedback/messages.json`. (Replaces the 2026-07-13 three-file rule.)

---

## What requires explicit user confirmation before implementing

Do not silently decide or implement the following — ask first:

- **Valid call threshold** — the 50-second minimum is locked, but exact timer behavior (pause, resume, reconnect) is open
- **Case type routing logic** — which fields determine Cat4 vs Pilot, and where these come from
- **HA skip eligibility** — what field or condition marks an order as HA-skipped
- **Transfer vs Forward distinction** — what exact operational difference these have downstream
- **No-pickup handling** — how many attempts before hold, what hold duration means
- **Calling model** — click-to-call now, in-app (VoIP) later; doctor-didn't-answer detection (OQ-027, D-56)
- **Doctor assignment rules** — how a case arrives in a doctor's queue and how re-assignment works (partly answered 2026-10-14: Back before the first attempted call releases the case — D-48; backend OQ-024/025)
- ~~**Medicine review authority**~~ — answered 2026-10-07: no add; prescribe or disable only; quantity is the backend's (`decision_log.md` D-04, D-06)
- **Notes behavior** — are notes visible to other teams? Are they locked after call completion?

If one of these surfaces during build and no clear answer exists, mark it `[OPEN DECISION]`, use a safe placeholder, and add it to `docs/context/open_questions.md`.

---

## Prototype optimization principle

This prototype optimizes for **visible demo speed** of the consultation workflow.

That means:
- build the doctor screen fast, mobile-first, with real-looking mock data
- use `[MOCK ASSUMPTION]` freely for non-critical gaps
- prefer a working believable demo state over theoretically complete but invisible UI
- a clean, modular rebuild (D-56) — not more patches on the old prototype

That does **not** mean:
- invent case-type routing logic
- fake the valid-call gate carelessly
- override `project_truth.md` for convenience

**Never silently invent** (moved from project_truth v1.0 §9): what makes an order Cat4 vs Pilot · Value vs Non-Value Meds · what sets HA required · HA-skip eligibility · doctor assignment source · notes visibility and locking. If one surfaces during build, mark `[OPEN DECISION]` and add it to `open_questions.md`.

---

## Decision labeling rule

Use these labels consistently:

- `[LOCKED]` — already decided, must be followed exactly
- `[RECOMMENDED]` — best current suggestion, open to override
- `[MOCK ASSUMPTION]` — temporary build unblocker, not final truth
- `[OPEN DECISION]` — requires user confirmation before implementing

---

## Confluence

Markdown in `docs/` is the source of truth; the Confluence page ([PROD space, "Truemeds Doctor Portal — PRD"](https://truemeds.atlassian.net/wiki/spaces/PROD/pages/1891303437/Truemeds+Doctor+Portal+PRD), top-level, no parent) is generated from it for stakeholder review/commenting. Never sync to Confluence unless explicitly told "sync" — edits made directly on Confluence during a review round are not automatically pulled back into this repo.

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

## Layout rule (do not change without Apurva)

Desktop = centred 9:16 phone frame, one scroll area, sheets/Rx/toasts inside the frame; mobile = full screen. Full rule: `design-system/RULES.md` §7. Run `python3 docs/layout_check.py` before committing any layout/CSS change. Never turn bottom sheets into desktop dialogs and never make the demo panel a scroll container.

## Logo (do not change without Apurva)
The header logo is the approved "truemeds for doctors" lockup in `brand/truemeds-for-doctors.svg` (project level, not in the design system). It embeds the canonical logo unchanged. Never redraw or recolour it. `python3 brand/check_lockup.py` must pass before any commit that touches `brand/`.
