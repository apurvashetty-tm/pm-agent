# session_handoff.md — Truemeds Doctor Portal Prototype

**Purpose:** Captures all decisions, agreements, and pending work so a new Claude session on any machine can pick up exactly where things left off.

**Last updated:** 2026-10-08
**Session status:** Prescribe redesign built; pinned main action (D-22); UI audit fixes done (D-23 … D-26). Open: medicine form icon (audit #11) — options in docs/concepts/2026-10-08-medicine-form-icons.png, Apurva's call.
**Why things are the way they are:** `docs/context/decision_log.md` (D-01 … D-29) — read it before changing any
screen it covers. This file says what is built; the decision log says why.
**Case page main action (2026-10-08, D-22):** `#case-actionbar` (`.tm-actionbar`) pinned to the bottom holds
`#call-initiate-btn` and `#main-cta-btn`; `syncCaseActionBar()` hides the bar when both are hidden and sets `--ab-h`
(page bottom padding, toast offset). `scrollToActionZone()` replaces `scrollIntoView` (which also scrolled the desktop
frame and pushed the header out of view). `layout_check.py` checks both.
**UI audit fixes (2026-10-08, D-23/D-24):** every sheet = title + `.sheet-close` (`tm-btn--quiet tm-btn--icon`),
no handle; callback chips in `.chip-grid` (`--cols`); action card closed state = `#az-closed` notice (text from
`DOCTOR_STATE.closedNote`); `#next-order-btn` pinned only when unavailable. No black toasts at all (D-27).
**All call actions pinned (2026-10-08, D-28):** `#case-actionbar` = `#ab-secondary` (pre-gate callback, Mark
Unavailable, Schedule Callback, Skip HA — side by side) + the main button. `#action-zone` has no buttons; no
auto-scroll (`scrollToActionZone` removed). `#az-phase2` removed.
**Call didn't connect (2026-10-08, D-26):** `#az-missed` notice + `#az-unavail-btn` in the Call card and "Call Again"
pinned for `no_answer` / `hold`; no call timer in the doctor UI (`#cs-timer-badge` removed; demo controls keep theirs).
**Renders (every session):** every image shown in a review is saved in `docs/renders/YYYY-MM-DD/NN_name.png` and
listed in `docs/renders/README.md` in the same turn. Doctor research files: `docs/research/`.
**Live link:** https://doctor-portal-prototype.netlify.app — Netlify deploys every push to `main` (base = repo root,
publish = this folder). The root `netlify.toml` copies `design-system/` next to `index.html` at deploy time so the
`../../design-system/…` links resolve. Work on a branch, then merge to `main` to update the live link.

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

> **Prescribe screen — CURRENT STATE (agreed with Apurva 2026-10-07/08, built 2026-10-08).** Reasons and rejected
> options: `decision_log.md` D-10 … D-20. Concept render (pre-review): `docs/concepts/2026-10-07-prescribe-screen.png`.
> Full-screen view over the case (inside the phone frame), one scroll area, every section open with backend defaults.
> 1. App bar: cross (close) · medicine name with the form in grey under it ("Tablet") · small red "Disable".
> 2. "On prescription" (was "Prints as"; D-25): the exact printed line, live, pinned under the app bar in one header
>    block (`#ps-top` = `#ps-bar` + `#ps-rx`), 16px semibold on a brand-blue band, flashes on change (`setPrintLine()`).
>    Ongoing prints its period ("6 months"); on screen "Ongoing (6 months)".
> 3. How often: Daily · Every X hours (4/6/8/12 h, round the clock) · Alt days · Weekly · Monthly · SOS only.
> 4. Dose: heading "Dose"; unit shown only where the form doesn't say it ("Dose (ml)" syrups, "Dose (puffs)" inhalers).
>    Daily = M / A / N rows (no evening slot). Choices: tablet/capsule 0 ½ 1 2; syrup 0 2.5 5 10 ml (single-dose
>    schedules add "Other" = number in ml); inhaler 0 1 2; drops 0 1 2 3; injection 1 (+ "Other" = units); cream Apply / —.
> 5. Also as needed (SOS): switch + helper "Extra doses only when needed, on top of the schedule above"; when on, its
>    own Dose and "Max extra doses a day" (1–4). "SOS only" asks Dose + "Max doses a day". Prints "1-0-1 + SOS 1 tablet (max 2/day)".
> 6. Duration: dropdown-style field (value + "Default"/"Changed from default" + chevron); tap the row to open/close the
>    picker: 1–7, 10, 14, 15 + Days · Weeks · Months · Ongoing. Always has a value.
> 7. Food (optional): After food · Before food · Empty stomach, one row, single-select, tap again to clear, no default,
>    printed only if chosen. Shown for every form.
> 8. Additional instructions: optional, printed (tapers, "shake well", "stop if rash"…).
> 9. Prescribe (primary, large) in a bottom bar pinned to the screen, always active (D-22). Body is grey with one
>    white card per block (Schedule · SOS · Duration · Food · Additional instructions), like the case page.
> Errors (only two, inline, on Prescribe): 0-0-0 → notice under the dose grid; empty "Other" → field error.
> Closing: instant if nothing changed, otherwise "Discard changes?" (Discard / Keep editing). Tab stays inside the
> screen; choice groups labelled for screen readers. Disabled medicine: warning note "Disabled: reason. Prescribing it
> will enable it again." and no Disable button. Disable opens the reason sheet over the screen; cancel returns to it.
> Code: `#prescribe-screen` (index.html), "PRESCRIBE SCREEN" (styles.css), "PRESCRIBE SCREEN — model + text" and
> "MEDICINE EDIT" (app.js). Chips use `.tm-chip--lg` (design system [PROPOSED]).
> Demo data: no food preselected; Antacid daily slots in ml (0-10-10); Salbutamol = SOS only, 2 puffs, max 4/day;
> B12 = 1 dose monthly. View Rx shows each medicine's frozen `rx_line` (customer's Rx). `docs/layout_check.py` covers
> the screen (fills frame, scrolls, Prescribe reachable).
> Still open: OQ-014 (pack vs dose units for quantity, non-tablet forms).

---

> **2026-10-07 — Prescription changes, part 1 (quantity and price).** Agreed with Apurva and built:
> (1) the medicine editor has no quantity at all (stepper removed; the doctor never sees prescription quantity);
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

- Central Truemeds design system (`../../design-system/truemeds.css`, `icons.js`) — restyle done 2026-10-07
- All 5 mock scenarios switchable via demo bar (mobile) / side panel (desktop)
- Valid-call gate at 50 seconds `[LOCKED, working]`
- CTA routing matrix `[LOCKED, working]` — Confirm Order / Confirm & Transfer / Confirm & Forward
- Pre-call briefing strip `#pre-call-brief` — Pilot + HA required only, two copy variants (value/non-value meds), hidden once the call ends early (bug fix this pass — briefing script used to stay visible after an early hangup)
- `#ha-attention-banner` — fully **removed from the DOM** (not just CSS-hidden as an earlier handoff stated)
- Rx overlay with dummy prescription, zoom/rotate/pan/pinch
- Desktop side panel with scenario switcher + demo webhook simulator (mirrors mobile demo bar)
- Fast-forward to 50s demo button — stuck-on-"Submitting" bug fixed (root cause: `innerHTML` replacement was destroying child spans the render function depended on)
- Bottom sheets: Hold, No Pickup, Skip HA, Schedule Callback, Disable reason, Discard changes. Medicine editing is the full-screen Prescribe screen (above); Add medicine was removed 2026-10-07
- Medicine cards: **entire card is tappable** (not just an edit icon), chevron (`›`) affordance, no separate edit button
- Sticky compact strip, patient detail block with `ⓘ` order-details expand, profile sheet with earnings/logout

### 1.1 Button / design system (HISTORY — superseded 2026-10-07 by the central design system; do not use `.btn`)

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
- Success confirmation card (`showSuccessToast`). The black toast (`showToast`) was removed on Apurva's instruction (D-27); do not bring it back
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
