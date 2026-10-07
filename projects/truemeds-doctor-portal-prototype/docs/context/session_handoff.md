# session_handoff.md — Truemeds Doctor Portal Prototype

**Purpose:** Captures all decisions, agreements, and pending work so a new Claude session on any machine can pick up exactly where things left off.

**Last updated:** 2026-07-13
**Session status:** Design-system consolidation pass complete. Schedule Callback / early call-end recovery flow complete. Memory cleanup pass complete (this update).

---

> **2026-10-07 — design system change.** The prototype's local design system is
> superseded by the central Truemeds design system (`../../design-system/`, from SALT).
> **Update (restyle done):** `index.html` / `styles.css` / `app.js` are now on `truemeds.css` + `icons.js`
> (see RESTYLE note below). Call Patient was NOT pinned (decision D4). Remaining UI work is functional
> and awaits product answers: login + working hours, end-of-session extend/logout, Prescription changes.

---

> **2026-10-07 — RESTYLE VISUALLY COMPLETE (visual migration only).** Scope authorised by Apurva:
> design-system restyle only; every behaviour, the five scenarios, the 50s gate, CTA routing,
> callback, medicine edits, notes, Rx viewer and demo controls are unchanged.
> Branch `doctor-portal-restyle`. Verified: 212 checks x 390px/1280px, 0 page errors, static token/font/emoji audit clean. Decisions D1–D12 recorded in `docs/reviews/2026-10-07-restyle-audit.md`.
>
> ### ROLLBACK — say: "revert doctor portal restyle"
> Checkpoint tag: `checkpoint/doctor-portal-pre-restyle` = commit `3fa1fc8` (pushed to origin).
> When Apurva says that phrase, run this from the `pm-agent` root (via `device_bash`) — nothing else:
>
> 1. `git rev-parse checkpoint/doctor-portal-pre-restyle^{commit}` must print a hash starting `3fa1fc8`.
> 2. `git diff --stat checkpoint/doctor-portal-pre-restyle -- <RESTYLE FILES>` — show her what will be undone.
> 3. `git checkout checkpoint/doctor-portal-pre-restyle -- <RESTYLE FILES>`
> 4. `git diff --quiet checkpoint/doctor-portal-pre-restyle -- <RESTYLE FILES> && echo RESTORED`
> 5. Delete only the files in **Files created by the restyle** below (needs delete permission; ask once).
> 6. Tell her what was restored. Do NOT commit unless asked.
>
> **Never** use `git reset`, `git clean`, `git stash`, `git checkout .` or `git restore .` — the repo holds unrelated
> uncommitted work (AGENTS.md hunks, root CLAUDE.md, Roadmap, PRD workflows, ceo-discussions, valuemeds, post-order-aop,
> Claude outputs, and the untracked audit file) that must not be touched.
>
> **RESTYLE FILES** (paths relative to pm-agent root; keep this list current after every batch):
> `projects/truemeds-doctor-portal-prototype/index.html`
> `projects/truemeds-doctor-portal-prototype/styles.css`
> `projects/truemeds-doctor-portal-prototype/app.js`
> `design-system/src/components.css` `design-system/truemeds.css` `design-system/preview.html`
> `design-system/icons/icons.txt` `design-system/icons/icons.js`
>
> **Files created by the restyle:** none.
>
> `[PROPOSED]` central design-system additions (flag to design owner): `.tm-btn--busy`, `.tm-tag--md` (12px), `.tm-snackbar`, `.tm-section-title` 16/24, 16 new Tabler icons.
>
> **Layout correction (2026-10-07, D1 superseded):** desktop >=768px is a natural page-scroll consultation page (720px column);
> demo side panel >=1100px is plain page content (not sticky, not scrollable); sheets are centred dialogs >=768px, bottom sheets below.
> **Logo pending:** official SVG (assets.truemeds.in .../logo/truemedslogonav.svg) could not be downloaded (network policy); text wordmark stays until the file is saved locally.
>
> Docs (this handoff, audit, CLAUDE.md) are intentionally NOT rolled back.

---

## 1. What has been built (current state)

**Architecture:** the prototype is now **three files**, not one — `index.html` (structure), `styles.css` (all cosmetics), `app.js` (all logic). This is a deliberate `[USER-PROVIDED]` change from the original single-file V1 rule; see `docs/design_system.md` for why (button-style drift across the single file was the trigger). `CLAUDE.md` and `frontend_engineer.md` have been updated to match — see their diffs from this same pass.

- Light theme (Truemeds brand-inspired, `#1B69DE` primary blue, `#f0f4f8` background)
- All 5 mock scenarios switchable via demo bar (mobile) / side panel (desktop)
- Valid-call gate at 50 seconds `[LOCKED, working]`
- CTA routing matrix `[LOCKED, working]` — Confirm Order / Confirm & Transfer / Confirm & Forward
- Pre-call briefing strip `#pre-call-brief` — Pilot + HA required only, two copy variants (value/non-value meds), hidden once the call ends early (bug fix this pass — briefing script used to stay visible after an early hangup)
- `#ha-attention-banner` — fully **removed from the DOM** (not just CSS-hidden as an earlier handoff stated)
- Rx overlay with dummy prescription, zoom/rotate/pan/pinch
- Desktop side panel with scenario switcher + demo webhook simulator (mirrors mobile demo bar)
- Fast-forward to 50s demo button — stuck-on-"Submitting" bug fixed (root cause: `innerHTML` replacement was destroying child spans the render function depended on)
- Bottom sheets: Hold, No Pickup, Skip HA, Edit Medicine, Add Medicine, Schedule Callback
- Medicine cards: **entire card is tappable** (not just an edit icon), chevron (`›`) affordance, no separate edit button
- Sticky compact strip, patient detail block with `ⓘ` order-details expand, profile sheet with earnings/logout

### 1.1 Button / design system (new this pass)

Every CTA now comes from one shared system: `class="btn btn-{size} btn-{variant}"` in `styles.css`, icons from one `ICONS` map in `app.js`. Full reference: `docs/design_system.md` — **read that file before adding any new CTA**, don't hand-roll button CSS again.

This replaced ~8 bespoke per-button CSS blocks that had drifted out of sync — the direct trigger was Schedule Callback having three different fonts/colors/icons across three placements. Do not reintroduce per-button cosmetic CSS.

### 1.2 Schedule Callback feature (new this pass)

- **Pre-gate, during live call**: quiet text link (`btn-sm btn-text`) below "End Call" — an escape hatch so a doctor doesn't have to wait for the gate to schedule instead.
- **Pre-gate, after an early hangup** (call ended before 50s): becomes a ghost button (`btn-md btn-ghost`) paired with a "Call Again" primary — this is the recovery path, see 1.3.
- **Post-gate**: compact chip (`btn-sm btn-ghost`) — paired side-by-side with Skip HA Call when both apply (label shortens to "Schedule"), full-width alone when Skip HA doesn't apply.
- **Confirming a callback is `[MOCK ASSUMPTION]` terminal** — it ends the doctor's session for that order: consultation state → `completed`, a success toast shows "Callback Scheduled — moved to callback queue," and the doctor proceeds via "Next Order." **This is not confirmed backend truth** — whether a scheduled callback should actually remove the case from this doctor's queue, or how a "callback queue" would really work, is unverified. See OQ-012.

### 1.3 Early call-end recovery flow (new this pass)

Previously: ending a call before the 50s gate reset to "assigned" with no distinct guidance. Now: consultation state tracks `DOCTOR_STATE.endedEarly`, and the idle call button becomes **"Call Again"** with the Schedule Callback ghost button appearing alongside it as an explicit second path. The closing-script briefing strip is hidden during this state (it re-appears once the doctor dials again) — this was a bug (`[FIXED]`, briefing strip used to keep showing stale script copy after the call had already ended).

This flow is a `[MOCK ASSUMPTION]` / `[RECOMMENDED]` UX pattern, not locked product truth — `project_truth.md` doesn't currently describe early call-end behavior at all. There's no retry limit implemented. See OQ-013.

### 1.4 Completed-state UI (changed this pass)

The old full-page blocking "Completed Overlay" is **gone**, replaced with a non-blocking **success toast** (`#success-toast`, `showSuccessToast(title, desc)`) anchored to the mobile column's actual position (fixes a desktop bug where the old overlay centered on the full viewport instead of the mobile column). Carries a "Next Order →" button. Used for both the normal Confirm-Order completion path and the Schedule-Callback terminal path (1.2).

---

## 2. Sections 2–4 (prior work, still accurate — condensed)

Structural rebuild (sticky header/compact strip, patient block with `ⓘ` expand, new medicine data format with M-A-N + qty + price, edit/add/disable medicine sheets, action zone phase1/phase2 merge, profile sheet with earnings/logout) — all complete and unchanged since the 2026-06-09 handoff. Pre-call briefing strip replacing the old post-call HA banner — complete, see 1.0 above for the one behavior fix (briefing strip now hides on early call-end).

Full original scope list preserved in git history (`c0e0ab2`, `2d2ad71`, `0a0fa4e` commits) if line-by-line detail is ever needed.

---

## 3. What must NOT be changed without explicit instruction

- `resolveCTA()` — CTA routing matrix
- `haSkipApplicable()` — Skip HA eligibility
- Valid-call gate at 50 seconds in `startCallTimer()`
- All 5 scenario IDs and their `case_type`, `ha_status`, `meds_type` fields
- Rx overlay, zoom, rotate, pan, pinch logic
- Toast system (`showToast`) and success-toast system (`showSuccessToast`)
- `switchScenario()` function structure
- Sheet overlay alignment in `openSheet()` using `getBoundingClientRect()`
- The `.btn` button system in `styles.css` and `ICONS` map in `app.js` — cosmetic changes go here, once, not per-button. See `docs/design_system.md`.

---

## 4. Design system

**Moved to `docs/design_system.md`** — that file is now the single source of truth for tokens, button sizes/variants, icons, and component patterns. Do not duplicate the token list here again; it will drift. Read `docs/design_system.md` before adding any new UI element.

Light theme is confirmed. Do not revert to dark theme.

---

## 5. Open questions status

Full detail in `docs/context/open_questions.md`.
- OQ-001 to OQ-011: still open, untouched by this pass.
- OQ-012 (new): Callback scheduling terminal behavior — `[MOCK ASSUMPTION]`, unverified against real backend.
- OQ-013 (new): Early call-end retry limit — unresolved, no cap implemented.

---

## 6. Git setup

- Remote: `git@github.com:apurvashetty-tm/truemeds-doctor-portal-prototype.git`
- Branch: `main`
- SSH key fingerprint: `SHA256:rpNSUQGp1H2ojI66wb9PTj4DiFCmVCau2MprBpJZKlU`
- Push: `git add . && git commit -m "message" && git push`
- New machine: `git clone git@github.com:apurvashetty-tm/truemeds-doctor-portal-prototype.git` + new SSH key

*(Unverified this pass — carried forward from the prior handoff as-is.)*

---

## 7. How to resume in a new session

1. Read this file (`session_handoff.md`), then `docs/context/project_truth.md`, `docs/context/open_questions.md`, `docs/design_system.md`.
2. Confirm current git state (`git status --short`) before assuming the working tree matches this handoff.
3. Continue from the "next step" below unless the user gives newer instructions.

**Next step:** No pending build work queued. Awaiting next user request — likely either (a) resolving OQ-012/OQ-013 with the user, or (b) new feature/polish requests on top of the current button-system baseline.

---

## 8. What is still NOT built

- Any multi-scenario state persistence across page reloads
- Any backend integration (intentionally out of scope for V1)
- Retry-limit logic for early call-end "Call Again" (OQ-013)
- Real callback-queue backend semantics (OQ-012)
- `?nodemo` URL param to hide demo controls for real-feel mobile testing (mentioned once by user, deferred — "this can be later")
