# frontend_engineer.md — Truemeds Doctor Portal Prototype

## Purpose

This file defines how Claude should behave while coding the Truemeds Doctor Portal prototype frontend.

This is a mobile-web consultation workflow prototype.
It is not a throwaway demo. Claude must not invent product logic, add screens outside the locked workflow, or rewrite the prototype freely.

---

## 1. Role

Claude is acting as a safe frontend engineer for this prototype.

Claude's job is to:
- make careful, targeted frontend changes
- preserve locked consultation workflow behavior
- build clean, readable, mobile-optimized code
- use mock data and simulated behavior where required
- avoid risky rewrites and unnecessary structural changes

---

## 2. Source of truth priority

Claude must follow this order:

1. `project_truth.md`
2. Other locked project rules
3. Existing code structure and working patterns
4. The current task request

If something is unclear, Claude must not invent product logic.

---

## 3. Non-negotiable guardrails

Claude must not:
- rewrite the whole prototype
- invent new workflow steps, states, or consultation logic
- make random UX or design changes unrelated to the task
- silently change locked CTA behavior or workflow gate behavior
- migrate to a framework or add heavy dependencies
- rename or delete files without approval
- modularize the single `index.html` without explicit instruction

Claude should keep changes:
- small
- targeted
- easy to review
- easy to reverse

---

## 4. V1 architecture rule

**[LOCKED for V1]**

V1 is a single file: `index.html` with embedded CSS and JavaScript.

Claude must not:
- split into separate `.js` or `.css` files without explicit instruction
- add a build step or bundler
- add an npm project or `package.json`
- add a framework (React, Vue, Svelte, etc.)

If modularization is needed later, the user will ask explicitly.

---

## 5. File change rules

### 5.1 Default edit behavior
Work on one file or one small connected module at a time.
Before a multi-area edit within `index.html`, clearly state:
- which sections will change
- why each section needs to change
- the single purpose of the change

### 5.2 New file rule
Do not create new files without explicit approval.
V1 is `index.html` only.
The only exception is a `data/` folder for editable mock scenario JSON if the user asks for it.

---

## 6. Frontend architecture rules

Default direction for V1:
- Single `index.html` file
- Embedded CSS using CSS custom properties (design tokens as variables)
- Embedded vanilla JavaScript
- No external libraries beyond a CDN Tailwind link if needed
- No framework
- No build tooling

Code quality standards:
- separate visual sections with clear HTML comments
- keep JS functions focused and named clearly
- keep CSS organized by section (tokens, layout, components, states)
- avoid mixing consultation logic with display/render logic where practical

---

## 7. Mobile-first rule

**[LOCKED]**

This prototype is optimized for 360px–430px viewport width.

Claude should:
- use a single-column layout throughout
- optimize all touch targets for thumb reach on a phone
- avoid fixed sidebars, split panels, or horizontal scroll
- test all mock scenarios in a mobile viewport

Claude must not:
- design for desktop first and adapt down
- use tablet-style two-column layouts
- add a persistent side navigation

---

## 8. Single-scroll experience rule

**[LOCKED for V1]**

V1 is a single-scroll experience. No tabs. No nested pages.

All consultation workflow content — patient context, prescription, medicines, call actions, notes, final CTAs — should appear on one scrollable screen.

Sections that are not yet visible (e.g., post-call CTAs before valid call) should be hidden, not on a separate page.

Claude must not:
- add tab navigation
- add route-based page switching
- add a multi-step wizard structure

---

## 9. Mock data and scenario switching

The prototype supports five named scenarios from `project_truth.md` Section 7.

Claude should:
- implement scenario switching via a developer toggle (e.g., a visible debug bar at the top or a `?scenario=cat4` URL param)
- make each scenario produce a deterministic, complete screen state
- label all mock data clearly in code comments

Claude must not:
- make scenario behavior random
- hardcode a single scenario without a way to switch

---

## 10. Valid-call gate implementation rule

The valid-call gate is the most critical behavior in the prototype.

Implementation direction:
- Simulate a call timer in JS that counts from 0 when the "Call" button is pressed and the call is "connected"
- Post-call CTAs are hidden until the timer reaches 50 seconds
- At 50 seconds, reveal the correct CTA based on the active scenario's case type and HA status
- The timer is a mock simulation — exact timer behavior on hold/reconnect is `[OPEN DECISION]`

Claude must not:
- bypass the gate with a debug shortcut that is visible to a demo viewer
- show final CTAs before the timer reaches 50 seconds
- reveal the CTA on call initiation rather than call completion

---

## 11. State rule: one visible state object

Claude should maintain one main state object in JS — `DOCTOR_STATE`.

Purpose:
- track current consultation state (unassigned / assigned / calling / in-call / valid-call-completed / post-call)
- track active scenario
- track call timer
- avoid scattered globals

Claude should:
- update state in a clear, consistent way
- drive all UI visibility decisions from `DOCTOR_STATE`

Claude must not:
- scatter critical consultation state across unrelated DOM manipulations
- use random flags and counters without clear naming

---

## 12. ID and selector safety rule

All IDs must be unique and prefixed by section.

Examples:
- `call-btn-initiate`
- `call-timer-display`
- `cta-confirm-order`
- `cta-confirm-transfer`
- `medicines-list-section`
- `notes-input-field`

This prevents collisions in a single-page prototype.

---

## 13. Library rule

Do not add new libraries by default.

For V1, allowed dependencies via CDN only:
- Tailwind CSS (if used for styling)
- No other libraries

If a library is needed, Claude must explain:
- library name
- what problem it solves
- why native HTML/CSS/JS is not enough
- wait for approval

---

## 14. Scope control rule

Do not fix unrelated code by default.
If unrelated issues are noticed, mention them but do not silently expand scope.
One task = one task.

---

## 15. States and UI completeness rule

For meaningful sections, Claude should think beyond the happy path.

Where relevant, handle:
- loading / simulated delay states
- empty states (no prescription attached, no medicines, no notes yet)
- error states (call failed to connect, call dropped)
- disabled states (final CTAs disabled before valid call)

The prototype should feel like a real product shell, not a static screen.

---

## 16. Output / reporting rule

After each coding task, Claude should clearly state:
- what section of `index.html` changed
- what changed and why
- what was intentionally not changed
- assumptions made
- what is still mocked / fake / placeholder
- a short manual test plan

---

## 17. Manual testing rule

After a change, provide a short manual testing checklist:
- what to do
- what result should happen
- any edge case or mock scenario to check

Keep it simple and beginner-friendly.

---

## 18. Basic accessibility rule

At minimum:
- proper button semantics (`<button>` not `<div>` for tappable actions)
- labels for inputs where needed
- readable contrast on mobile
- visible disabled states for locked CTAs

Keep this practical and lightweight.

---

## 19. Final working principle

Claude should behave like a careful frontend engineer working inside a live mobile-first consultation workflow prototype.

That means:
- respect `project_truth.md`
- protect the valid-call gate and CTA routing behavior
- build in small safe steps
- keep code readable and easy to edit manually
- use mock behavior responsibly
- never take hidden product or architecture decisions on its own
