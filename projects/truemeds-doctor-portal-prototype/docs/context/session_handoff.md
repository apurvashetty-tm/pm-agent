# session_handoff.md — Truemeds Doctor Portal Prototype

**Purpose:** Captures all decisions, agreements, and pending work so a new Claude session on any machine can pick up exactly where things left off.

**Last updated:** 2026-07-13
**Session status:** Design-system consolidation pass complete. Schedule Callback / early call-end recovery flow complete. Memory cleanup pass complete (this update).

---

> **2026-10-08 — Sticky header fix.** The app header always stays on top; once the patient block scrolls away, a compact
> patient strip (name, age/gender, order, order value, View Rx) appears under it. The strip now OVERLAYS the content
> (absolute, fades in) instead of being inserted into the page: inserting it changed the header height, shifted the page
> and made the browser jump the scroll position by ~50–70px (header looked "half closing" when scrolling up, on phone
> widths). `docs/layout_check.py` now fails on any such jump.
> Same day: the case page no longer scrolls on past the Call / Confirm actions. `#main-scroll` had a permanent 144px
> bottom padding; it is now 32px (as on the Prescribe screen), with the extra room added only while the "Order Confirmed"
> snackbar is showing. `docs/layout_check.py` checks the scroll ends right after the last action.

---

> **2026-10-07 — Prescription changes, part 2: Prescribe screen redesign — AGREED WITH APURVA, BUILT 2026-10-08.**
> Concept render: `docs/concepts/2026-10-07-prescribe-screen.png` (tablet, syrup, inhaler, plus the two error states).
> FULL-SCREEN VIEW, not a bottom sheet (opens over the case like the Rx viewer, inside the phone frame). Every section
> open with backend defaults, so the doctor scrolls past everything before Prescribe. No collapsed summary.
> 1. App bar: close (x) · medicine name with "<Form> · Prescribe" in grey under it (no coloured form tag) · small red
>    "Disable" button (destructive, xs). Disable is NOT a full-width button next to Prescribe.
> 2. "Prints as" line (tinted card) showing exactly what will print (kept).
> 3. How often: Daily · Every X hours · Alt days · Weekly · Monthly · SOS only.
> 4. Dose, by choice above; units follow the form. Daily = Morning · Afternoon · Night (3 slots; NO evening slot —
>    more than 3 a day uses Every X hours; uneven 4-dose schedules go in the note). Every X hours = 4 · 6 · 8 · 12 h,
>    round the clock, plus dose each time. Alt days / Weekly / Monthly / SOS only = dose each time.
>    Dose choices: tablet/capsule 0 ½ 1 2; syrup 2.5 · 5 · 10 ml · Other (number field in ml, not free text);
>    inhaler 0 1 2 puffs; drops 1 2 3; injection 1 dose or units (number); cream "Apply".
> 5. Also as needed (SOS): `.tm-check` + `.tm-toggle` under the regular schedule; when on, Max per day 1–4.
> 6. Duration: flat card "value · Change" (default Ongoing = 6 months, backend). Change opens the picker in place:
>    numbers 1 2 3 4 5 6 7 10 14 15 + Days · Weeks · Months · Ongoing · Done. Always has a value (cannot be cleared).
> 7. Food: After food · Before food · Empty stomach, on ONE row (chips share the width; wraps only below ~330px).
>    Always shown for every form, optional, single-select (tap again to clear), NO default, printed only if selected.
>    All other advice chips are removed.
> 8. Additional instructions: `.tm-field` textarea, helper "Optional. Printed on the prescription." Holds tapers,
>    varying doses, "shake well", "rinse mouth" etc.; structured fields still drive quantity.
> 9. Prescribe (primary, full width) at the END of the content — not pinned.
> Validation: required pick-one groups always keep one choice (cannot be cleared), so only two errors exist, shown
> inline when Prescribe is tapped (scroll to it, nothing saved, no toast): 0-0-0 → `.tm-notice--error` under the grid
> "Choose a dose for at least one time of day."; syrup "Other" empty → `.tm-field--error` "Enter the dose in ml."
> Chips use `.tm-chip--lg` (design system [PROPOSED], added 2026-10-07) instead of the project's sheet override.
> Built as specified: `#prescribe-screen` in index.html, styles under "PRESCRIBE SCREEN" in styles.css, logic under
> "PRESCRIBE SCREEN — model + text" and "MEDICINE EDIT" in app.js (the old `#sheet-edit-med` bottom sheet is gone).
> Disable opens the existing reason sheet over the screen; cancelling returns to the screen. Escape closes the screen
> without saving. Build choices: "SOS only" also asks Max per day (keeps quantity calculable); syrup "Other" exists only
> in "Dose each time" (daily slots are 0 · 2.5 · 5 · 10 ml); injection "Other" = units; cream shows "Apply".
> Demo data: no food preselected anywhere; Antacid daily slots now in ml (0-10-10); Salbutamol = SOS only, 2 puffs, max
> 4/day, Ongoing; B12 = 1 dose monthly. View Rx shows each medicine's frozen `rx_line` (customer's Rx), so doctor edits
> never change it. `docs/layout_check.py` now checks the Prescribe screen (fills frame, scrolls, Prescribe reachable) and
> a bottom sheet (profile) at the frame bottom.
> **2026-10-08 revision (Apurva's design review, all agreed):** subtitle under the name = form only ("Tablet", no
> "Prescribe"); one dose heading for every schedule, "Dose (unit)" (M / A / N row letters kept — doctors know them;
> creams: "Dose", choices Apply / —); SOS add-on explained in place ("Extra doses only when needed, on top of the
> schedule above") with its own Dose chips and "Max extra doses a day" → prints "1-0-1 + SOS 1 tablet (max 2/day)"
> (SOS-only: "Max doses a day"); duration card is one tap target with a secondary "Change" button (picker: "Done");
> "Food (optional)"; Ongoing shows "Ongoing (6 months)" on screen and PRINTS the period ("6 months") — confirmed with
> the medical team. Cross (not back arrow) kept: closing a task that discards edits. QA fixes: Tab stays inside the
> screen; closing after edits asks "Discard changes?" (Discard / Keep editing), instant when nothing changed; chip
> groups labelled for screen readers; a disabled medicine shows "Disabled: reason. Prescribing it will enable it again."
> and hides Disable.
> Still open: OQ-014 (pack vs dose units for quantity, non-tablet forms).

---

> **2026-10-07 — Prescription changes, part 1 (quantity and price).** Agreed with Apurva and built:
> (1) the edit sheet has no quantity at all (stepper removed; the doctor never sees prescription quantity);
> (2) the medicine row shows the customer's cart "Qty" read-only, unchanged by doctor edits, and no longer shows a
> line-item price; (3) Add medicine (button, sheet, code) is removed — the doctor cannot add medicines;
> (4) order value (patient block and compact strip) and View Rx are unchanged. Backend rule: frequency and duration are
> preselected for the configured maximum (6 months, Ongoing), the backend stores the quantity, and recalculates and prints
> it on the prescription if the doctor changes frequency or duration. Deferred: OQ-014 (pack vs dose units for non-tablet
> forms) and OQ-015 (per-medicine detail view with price and image). Frequency and duration: see Part 2 above. Note: the restyle rollback restores pre-restyle files, so it would also undo these product changes.
> Product doubt to raise: the disable reason "Wrong strength" hints "Will disable and add correct one", but adding is gone.

---

> **2026-10-07 — medicine-form icons and audit withdrawal.** Apurva clarified that visible Rx is customer-uploaded
> source material, not a live prescription generated by the doctor. The Codex source-only UI/UX audit that called
> flows broken was withdrawn; do not use it as a defect backlog. Medicine-form icons (final): tablet = round scored
> `tablet-round` ([PROPOSED] custom icon built in `design-system/scripts/build-icons.mjs`), capsule = Tabler `pill`
> (diagonal). The earlier `capsule-horizontal` + divider experiment was rejected and removed. Desktop layout: see the
> PHONE FRAME note below (supersedes any earlier desktop-layout wording).

---

> **2026-10-07 — design system change.** The prototype's local design system is
> superseded by the central Truemeds design system (`../../design-system/`, from SALT).
> **Update (restyle done):** `index.html` / `styles.css` / `app.js` are now on `truemeds.css` + `icons.js`
> (see RESTYLE note below). Call Patient was NOT pinned (decision D4). Remaining UI work is functional
> and awaits product answers: login + working hours, end-of-session extend/logout, Prescription changes (part 1 done, see top note).

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
> `design-system/icons/icons.txt` `design-system/icons/icons.js` `design-system/RULES.md`
>
> **Files created by the restyle:** `projects/truemeds-doctor-portal-prototype/docs/layout_check.py` (layout regression check). Also `design-system/logo/truemeds-logo.svg` (same official file), `design-system/logo/truemeds-icon.svg` (icon-only, from Figma), `projects/truemeds-doctor-portal-prototype/brand/` (approved "truemeds for doctors" lockup `truemeds-for-doctors.{svg,png}` + `-preview.png`, developed with Codex; `brand.lock.json` and `check_lockup.py` lock it), `design-system/logo/logo.lock.json` + `design-system/scripts/check_logo.py` (logo lock: blue #1B69DE, green #22B573) and the logo rule 8 added to `design-system/RULES.md` (add RULES.md to the restore list).
>
> `[PROPOSED]` central design-system additions (flag to design owner): `.tm-btn--busy`, `.tm-tag--md` (12px), `.tm-snackbar`, `.tm-section-title` 16/24, 16 new Tabler icons.
>
> **LAYOUT (current, 2026-10-07) — PHONE FRAME.** Below 768px the app is the screen (window scrolls). At 768px and up it is a
> centred 9:16 phone frame (height = clamp(640px, 100vh - 48px, 800px)) with ONE scroll area (`#main-scroll`) and the header pinned.
> Bottom sheets, the Rx viewer and toasts live INSIDE the frame (they are DOM children of `#mobile-column`, which is a transform
> containing block), so they anchor to the frame bottom, never the browser window. The demo panel (>=1100px) floats beside the frame.
> Rule: `design-system/RULES.md` §7. Regression check: `python3 projects/truemeds-doctor-portal-prototype/docs/layout_check.py`.
> Earlier wordings ("720px consultation page", "centred dialogs", "430px column with window scroll") are WRONG and removed.
> **Logo:** the header uses the approved "truemeds for doctors" lockup, `projects/truemeds-doctor-portal-prototype/brand/truemeds-for-doctors.svg` (sha256 starts 51981c12; project-level, not a design-system file), via `<img>` at 147x36. It embeds the official Truemeds logo unchanged. The header no longer shows the separate "Doctor Portal" text; the canonical plain logo lives only in `design-system/logo/truemeds-logo.svg` (sha256 starts 1953a94b); the browser tab title is "Truemeds for Doctors".
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

Structural rebuild (sticky header/compact strip, patient block with `ⓘ` expand, new medicine data format with M-A-N + qty + price (row shows cart qty only; price kept in data for the deferred OQ-015 detail view), edit/disable medicine sheets (add removed 2026-10-07), action zone phase1/phase2 merge, profile sheet with earnings/logout) — all complete and unchanged since the 2026-06-09 handoff. Pre-call briefing strip replacing the old post-call HA banner — complete, see 1.0 above for the one behavior fix (briefing strip now hides on early call-end).

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
